---
title: Quick Start
nextjs:
  metadata:
    title: "Quick Start Guide"
    description: "Learn how to quickly start using Tork with this guide."
---

## Requirements

1. Make sure you have a fairly recent version of Docker installed on your system. You can download Docker from the [official Docker website](https://www.docker.com/get-started).

2. Download the Tork binary for your system from the [releases](https://github.com/runabol/tork/releases/latest) page.

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

What happened here? 

When you submitted the job, Tork executed the tasks defined in it, in the order they were defined. Here’s a breakdown of the tasks:

1. **say hello**: This task used the `ubuntu:mantic` Docker image to execute its `run` script.
2. **say goodbye**: This task used the `alpine:latest` Docker image to execute its `run` script.

The server processed the job and returned a job ID, which you stored in the `JOB_ID` variable. You then queried the status of the job using this job ID, and the server responded with the job's `state`, which in this case was `COMPLETED`.

## Running in distributed mode

To run Tork in distributed mode, we'll first need to start a broker that will allow the various Tork nodes to communicate with each other.

Start RabbitMQ with the following command:

```shell
docker run -d -p 5672:5672 -p 15672:15672 --name=tork-rabbitmq rabbitmq:3-management
```

This command will start RabbitMQ in detached mode. You can access the RabbitMQ management interface by navigating to `http://localhost:15672` in your web browser. The default username and password are both `guest`.

Next, let's start two Tork instances in distributed mode:

```bash
TORK_BROKER_TYPE=rabbitmq ./tork run coordinator
```

And from another terminal

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
curl -s http://localhost:8000/jobs/$JOB_ID
```

```json
{
  "id": "ed0dba93d262492b8cf26e6c1c4f1c98",
  "state": "COMPLETED",
  ...
}
```

What happened here? 

When you submitted the job, Tork distributed the tasks across the available worker nodes. Here’s a breakdown of the process:

1. The Coordinator picked up the first task and sent it to the `default` queue to be picked up by any available worker.
2. A Worker node picked up the task from the queue and executed it using the `ubuntu:mantic` Docker image.
3. The Worker node then notified the Coordinator that the task was completed using the `completed` queue.
4. The Coordinator then picked up the second task and sent it to the `default` queue.
5. A Worker node picked up the second task from the queue and executed it using the `alpine:latest` Docker image.
6. The Worker node notified the Coordinator that the task was completed using the `completed` queue.

Since there were no more tasks to execute, the Coordinator marked the job as `COMPLETED`.

## Next Steps

Now that you have successfully run Tork in both standalone and distributed modes, here are some next steps you can take to further explore its capabilities:

1. **Read the Documentation**: Dive deeper into Tork's [jobs](/jobs) and [tasks](/tasks) documentation to understand how to define and manage more complex workflows.

2. **Explore More Examples**: Check out the [examples](https://github.com/runabol/tork/tree/main/examples) directory in the Tork repository for more complex job definitions and use cases.
