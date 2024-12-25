---
title: Getting Started
---

{% quick-links %}

{% quick-link title="Installation" icon="installation" href="/installation" description="Step-by-step guide to getting you up and running." /%}

{% quick-link title="Architecture" icon="presets" href="/architecture" description="Take a look under the hood." /%}

{% quick-link title="API reference" icon="theming" href="/rest" description="Learn how to interact with Tork using its REST API." /%}

{% quick-link title="Extend Tork" icon="plugins" href="/extend" description="Extend Tork for your particular use case." /%}

{% /quick-links %}

---

## Features

- [REST API](/rest-api)
- Horizontally scalable
- Task isolation - tasks are executed within a container to provide isolation, idempotency, and in order to enforce resource limits
- Automatic recovery of tasks in the event of a worker crash
- Supports both stand-alone and [distributed](/installation#running-in-a-distributed-mode) setup
- [Retry failed tasks](/tasks#retry)
- No single point of failure
- [Task timeout](/tasks#timeout)
- Full-text search
- [Runtime](/runtime) agnostic.
- [Middleware](/extend#middleware)
- [Webhooks](/jobs#webhooks)
- [Expression Language](/tasks#expressions)
- Conditional Tasks
- [Parallel Task](/tasks#parallel-task)
- [Each Task](/tasks#each-task)
- [Subjob Task](/tasks#sub-job-task)
- [Task priority](/tasks#priority)
- [Pre/Post tasks](/tasks#pre-post-tasks)
- [Secrets](/tasks#secrets)
- [Scheduled jobs](/jobs#scheduled-jobs)
- [Sandbox Mode](/runtime#sandbox-mode-experimental)
- [Web UI](/web-ui)

---

## Quick start

1. Ensure you have Docker with API Version >= 1.42 (use `docker version | grep API` to check).

2. Download the binary for your system from the [releases](https://github.com/runabol/tork/releases/latest) page.

### Hello World

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
    image: ubuntu:mantic
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

### A slightly more interesting example

The following job:

1. Downloads a remote video file using a pre task to a shared `/tmp` volume.
2. Converts the first 5 seconds of the downloaded video using ffmpeg.
3. Uploads the converted video to a destination using a post task.

```yaml
# convert.yaml
---
name: convert a video
inputs:
  source: https://upload.wikimedia.org/wikipedia/commons/1/18/Big_Buck_Bunny_Trailer_1080p.ogv
tasks:
  - name: convert the first 5 seconds of a video
    image: jrottenberg/ffmpeg:3.4-alpine
    run: |
      ffmpeg -i /tmp/input.ogv -t 5 /tmp/output.mp4
    mounts:
      - type: volume
        target: /tmp
    pre:
      - name: download the remote file
        image: alpine:3.18.3
        env:
          SOURCE_URL: '{{ inputs.source }}'
        run: |
          wget \
          $SOURCE_URL \
          -O /tmp/input.ogv
    post:
      - name: upload the converted file
        image: alpine:3.18.3
        run: |
          wget \
          --post-file=/tmp/output.mp4 \
          https://devnull-as-a-service.com/dev/null
```

Submit the job in another terminal window:

```shell
JOB_ID=$(curl -s -X POST --data-binary @convert.yaml \
 -H "Content-type: text/yaml" http://localhost:8000/jobs | jq -r .id)
```

### More examples

Check out the [examples](https://github.com/runabol/tork/tree/main/examples) folder.
