---
title: Quick Start
nextjs:
  metadata:
    title: "Quick Start Guide"
    description: "Learn how to quickly start using Tork with this guide."
---

Tork is designed to let you define jobs consisting of multiple tasks, each running inside its own Docker container. You can run Tork on a single machine (standalone mode) or set it up in a distributed environment with multiple workers.

---

## Requirements

1. Make sure you have a fairly recent version of Docker installed on your system. You can download Docker from the [official Docker website](https://www.docker.com/get-started).

2. Download the Tork binary for your system from the [releases](https://github.com/runabol/tork/releases/latest) page.


### Set up PostgreSQL

Start a PostgreSQL container 

{% callout title="Note" %}
For production you may want to consider using a managed PostgreSQL service for better reliability and maintenance.
{% /callout %}

```shell
docker run -d \
  --name tork-postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=tork \
  -e POSTGRES_USER=tork \
  -e PGDATA=/var/lib/postgresql/data/pgdata \
  -e POSTGRES_DB=tork postgres:15.3
```

Run a migration to create the database schema:

```shell
TORK_DATASTORE_TYPE=postgres ./tork migration
```

## Hello World

Start Tork in `standalone` mode:

```shell
./tork run standalone
```

Create a file called `hello.yaml` with the following contents:

```yaml
# hello.yaml
---
name: hello job
tasks:
  - name: say hello
    image: ubuntu:mantic #docker image
    run: |
      echo -n hello world
  - name: say goodbye
    image: alpine:latest
    run: |
      echo -n bye world
```

Submit the job in another terminal window:

```shell
JOB_ID=$(curl -s -X POST --data-binary @hello.yaml \
  -H "Content-type: text/yaml" http://localhost:8000/jobs | jq -r .id)
```

Query for the status of the job:

```shell
curl -s http://localhost:8000/jobs/$JOB_ID
```

```json
{
  "id": "ed0dba93d262492b8cf26e6c1c4f1c98",
  "state": "COMPLETED",
  ...
}
```

### What Happened Behind the Scenes?

1. Tork received your job and read the two tasks from `hello.yaml`.
2. Task 1 (“say hello”) ran in a container based on `ubuntu:mantic`.
3. Task 2 (“say goodbye”) ran in a container based on `alpine:latest`.
4. When both tasks finished, Tork reported the job state as `COMPLETED`.

## Running in distributed mode

Running Tork in distributed mode allows you to split the roles of Coordinator (overseeing tasks) and Worker (executing tasks on separate machines or processes).

For distributed operation, Tork uses a message broker to move tasks between the coordinator and workers. a commong broker implemnentation is RabbitMQ.

Launch RabbitMQ with the following command:

```shell
docker run \
  -d -p 5672:5672 -p 15672:15672 \
  --name=tork-rabbitmq \
  rabbitmq:3-management
```

{% callout title="Note" %}
For production you may want to consider using a dedicated RabbitMQ service for better reliability and maintenance.
{% /callout %}

This command will start RabbitMQ in detached mode. You can access the RabbitMQ management interface by navigating to `http://localhost:15672` in your web browser. The default username and password are both `guest`.

Open a new terminal and run the coordinator:

```bash
TORK_DATASTORE_TYPE=postgres TORK_BROKER_TYPE=rabbitmq ./tork run coordinator
```

Open another terminal and start a worker (you can repeat this step to simulate multiple workers):

```bash
TORK_BROKER_TYPE=rabbitmq ./tork run worker
```

Let's submit the same job from another terminal window:

```shell
JOB_ID=$(curl -s -X POST --data-binary @hello.yaml \
  -H "Content-type: text/yaml" http://localhost:8000/jobs | jq -r .id)
```

Query for the status of the job:

```shell
curl -s http://localhost:8000/jobs/$JOB_ID | jq .state
```

```shell
COMPLETED
```

### What’s different in distributed mode?

1. **Coordinator** receives the job and breaks it into tasks.
2. **Broker (RabbitMQ)** manages these tasks as messages in a queue.
3. **Worker** takes a task from the queue, runs the specified Docker command, and reports completion back to the coordinator.
4. **Coordinator** sends the next task to the queue, until all tasks are done.

By separating these roles, you can scale Tork horizontally. Multiple workers can share the workload, each picking up tasks from the queue.

## Adding external storage

By design, Tork tasks are ephemeral: each task runs independently in a Docker container, which disappears as soon as the task completes. Any data written to the container’s filesystem is lost after the task finishes. If you want to share data between tasks (or persist it beyond task execution), you need an external data store.

### Set up MinIO

MinIO is an S3-compatible object store that you can run locally via Docker. 

Let’s start a MinIO container:

```bash
docker run --name=tork-minio \
  -d -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data \
  --console-address ":9001"
```

### Creating a Job with External State

Below is an example job file (`stateful.yaml`) with two tasks:

1. Writes data to MinIO (creating a bucket, then uploading a file).
2. Reads the data back from MinIO and prints it.

```yaml
name: stateful example
inputs:
  minio_endpoint: http://host.docker.internal:9000
secrets:
  minio_user: minioadmin
  minio_password: minioadmin
tasks:
  - name: write data to object store
    image: amazon/aws-cli:latest
    env:
      AWS_ACCESS_KEY_ID: "{{ secrets.minio_user }}"
      AWS_SECRET_ACCESS_KEY: "{{ secrets.minio_password }}"
      AWS_ENDPOINT_URL: "{{ inputs.minio_endpoint }}"
      AWS_DEFAULT_REGION: us-east-1
    run: |
      echo "Hello from Tork!" > /tmp/data.txt
      aws s3 mb s3://mybucket
      aws s3 cp /tmp/data.txt s3://mybucket/data.txt

  - name: read data from object store
    image: amazon/aws-cli:latest
    env:
      AWS_ACCESS_KEY_ID: "{{ secrets.minio_user }}"
      AWS_SECRET_ACCESS_KEY: "{{ secrets.minio_password }}"
      AWS_ENDPOINT_URL: "{{ inputs.minio_endpoint }}"
      AWS_DEFAULT_REGION: us-east-1
    run: |
      aws s3 cp s3://mybucket/data.txt /tmp/retrieved.txt
      echo "Contents of retrieved file:"
      cat /tmp/retrieved.txt
```

Key Points:

* `image: amazon/aws-cli:latest`: We use the AWS CLI Docker image to interact with MinIO via S3 commands.
* `env`: We set credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, etc.) so the AWS CLI can authenticate against MinIO.

## Next steps

1. **Read the Documentation**: Dive deeper into Tork's [jobs](/jobs) and [tasks](/tasks) documentation to understand how to define and manage more complex workflows.

2. **Explore More Examples**: Check out the [examples](https://github.com/runabol/tork/tree/main/examples) directory in the Tork repository for more complex job definitions and use cases.
