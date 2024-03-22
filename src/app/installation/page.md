---
title: Download and install
nextjs:
  metadata:
    title: Download and install
    description: Download and install Tork
---

Download and install Tork quickly with the steps described here.

{% cta href="https://github.com/runabol/tork/releases/latest" target="_blank"  %} Download (Latest) {% /cta %}

---

## Requirements

Ensure you have Docker with API Version >= 1.42

```shell
docker version | grep API
```

```shell
API version: 1.43
API version: 1.43 (minimum version 1.12)
```

## Installation

Create a directory:

```shell
mkdir ~/tork
cd ~/tork
```

Unpack the Tork binary:

```shell
tar xzvf ~/Downloads/tork_0.1.66_darwin_arm64.tgz
```

Run Tork:

```shell
% ./tork
```

If the installation is successful you should see something like this:

```shell
 _______  _______  ______    ___   _
|       ||       ||    _ |  |   | | |
|_     _||   _   ||   | ||  |   |_| |
  |   |  |  | |  ||   |_||_ |      _|
  |   |  |  |_|  ||    __  ||     |_
  |   |  |       ||   |  | ||    _  |
  |___|  |_______||___|  |_||___| |_|

 0.1.66

NAME:
   tork - a distributed workflow engine

USAGE:
   tork [global options] command [command options] [arguments...]

COMMANDS:
   run        Run Tork
   migration  Run the db migration script
   health     Perform a health check
   help, h    Shows a list of commands or help for one command

GLOBAL OPTIONS:
   --help, -h      show help
```

You may need to allow the binary to run on your system from your security settings:

{% figure src="allow.png" /%}

## Running Tork in Standalone mode

The easiest way to "kick the tires" is to run Tork in `standalone` mode.
This mode is ideal when running on a single machine.

```shell
./tork run standalone
```

```shell
 _______  _______  ______    ___   _
|       ||       ||    _ |  |   | | |
|_     _||   _   ||   | ||  |   |_| |
  |   |  |  | |  ||   |_||_ |      _|
  |   |  |  |_|  ||    __  ||     |_
  |   |  |       ||   |  | ||    _  |
  |___|  |_______||___|  |_||___| |_|

 0.1.66

11:28AM INF starting worker ee618a38713e44da805aaebae319ab79
11:28AM DBG subscribing for tasks on x-ee618a38713e44da805aaebae319ab79
11:28AM DBG subscribing for tasks on default
11:28AM INF starting coordinator-d4d6360eda964bde84c173197a92f461
11:28AM DBG subscribing for tasks on hearbeat
11:28AM DBG subscribing for tasks on jobs
11:28AM DBG subscribing for tasks on completed
11:28AM DBG subscribing for tasks on error
11:28AM DBG subscribing for tasks on pending
11:28AM DBG subscribing for tasks on started
11:28AM INF worker listening on :8001
11:28AM INF coordinator listening on :8000
```

### Run your first job

From another terminal, create a file named `hello.yaml` with the following content:

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
    image: ubuntu:mantic
    run: |
      echo -n bye world
```

Submit the job to Tork for execution:

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

## Datastore

The `Datastore` is responsible for holding job and task state.

You can specify which type of datastore to use using a [config file](/config).

`inmemory` (default) - Runs entirely in memory. Convenient for experimentation and development but typically isn't suitable for production uses cases because all state will be lost upon restart.

`postgres` - Uses a [Postgres](https://www.postgresql.org/) database as the underlying implementation.

```toml
# config.toml
[datastore]
type = "postgres"

[datastore.postgres]
dsn = "host=localhost user=tork password=tork dbname=tork port=5432 sslmode=disable"
```

Example of running Postgres:

```shell
docker run -d \
   --name tork-postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=tork \
  -e POSTGRES_USER=tork \
  -e PGDATA=/var/lib/postgresql/data/pgdata \
	-v $(pwd)/data:/var/lib/postgresql/data \
  -e POSTGRES_DB=tork postgres:15.3
```

Run a migration to create the database schema

```shell
./tork migration
```

```shell
 _______  _______  ______    ___   _
|       ||       ||    _ |  |   | | |
|_     _||   _   ||   | ||  |   |_| |
  |   |  |  | |  ||   |_||_ |      _|
  |   |  |  |_|  ||    __  ||     |_
  |   |  |       ||   |  | ||    _  |
  |___|  |_______||___|  |_||___| |_|

 0.1.66

11:53AM INF migration completed!
```

Start Tork:

```shell
./tork run \
  standalone \
  --datastore postgres \
  --postgres-dsn "host=localhost user=tork password=tork dbname=tork port=5432 sslmode=disable"
```

## Running in a distributed mode

The broker is responsible for routing tasks between the Coordinator and Worker nodes.

You can specify which type of broker to use using the [config file](/config).

`inmemory` (default) - Runs entirely in memory. Convenient for experimentation and development on a single machine.

`rabbitmq` - Uses [RabbitMQ](https://www.rabbitmq.com/) as the underlying implementation. Suitable for a distributed setup with 2 or more machines.

Example of running RabbitMQ:

```toml
# config.toml
[broker]
type = "rabbitmq"

[broker.rabbitmq]
url = "amqp://guest:guest@localhost:5672/"
```

```shell
docker run \
  -d \
  --name=tork-rabbit \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

Start the Coordinator:

```shell
./tork run coordinator
```

Start the worker(s):

```shell
./tork run worker
```

## Queues

By default all tasks are routed to the `default` queue.

All worker nodes automatically subscribe to the `default` queue in order to consume tasks, unless provided queue configuration.

Worker nodes can also subscribe multiple times to the same queue in order to execute N tasks in parallel. Example:

```toml
# config.toml
[worker.queues]
default = 5

[broker]
type = "rabbitmq"
```

```shell
./tork run worker
```

Will allow the worker to consume up to 5 tasks in parallel from the `default` queue.

It is often desirable to route tasks to different queues in order to create specialized pools of workers.

For example, one pool of workers, might be specially configured to handle video transcoding can listen to video-processing related tasks:

```toml
# config.toml
[worker.queues]
default = 5
video = 2

[broker]
type = "rabbitmq"
```

```shell
./tork run worker
```

Will allow the worker to consume up to 1 tasks in parallel from the `video` queue and up to 5 tasks from the `default` queue.

To route a task to the non-`default` queue, use the `queue` property:

```yaml
name: transcode a video
queue: video
image: jrottenberg/ffmpeg:3.4-alpine
run: |
  ffmpeg \
    -i https://example.com/some/video.mov \
    output.mp4
```
