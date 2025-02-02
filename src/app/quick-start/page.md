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
docker run -d -p 5672:5672 -p 15672:15672 --name=tork-rabbitmq rabbitmq:3-management
```

This command will start RabbitMQ in detached mode. You can access the RabbitMQ management interface by navigating to `http://localhost:15672` in your web browser. The default username and password are both `guest`.

Open a new terminal and run the coordinator:

```bash
TORK_BROKER_TYPE=rabbitmq ./tork run coordinator
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
