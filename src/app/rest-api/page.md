---
title: REST API
nextjs:
  metadata:
    title: REST API
---

---

## Health Check

**Path:**

```shell
GET /health
```

**Response:**

```json
{
  "status": "UP"
}
```

## List jobs

Returns a list of the most recent jobs

**Path:**

```shell
GET /jobs
```

**Query Params:**

- `page` - page number (default: 1)
- `size` - page size (default: 10 min:1 max:20)
- `q` - full text search query

**Response**

```json
{
  "items": [
    {
      "id": "c5873550dad7439e85ac781168e6e124",
      "name": "sample job",
      "state": "COMPLETED",
      "createdAt": "2023-08-21T21:52:07.751041Z",
      "startedAt": "2023-08-22T01:52:07.765393Z",
      "completedAt": "2023-08-22T01:52:12.900569Z"
    }
    ...
  ],
  "number": 1,
  "size": 4,
  "totalPages": 1
}
```

## Get Job Details

**Path:**

```shell
GET /jobs/<JOB ID>
```

**Response:**

```json
{
  "id": "9d7d7184b8f244249c5f5d8b4074f72e",
  "name": "my job",
  "state": "COMPLETED",
  "createdAt": "2023-09-05T01:33:08.413605Z",
  "startedAt": "2023-09-05T01:33:08.414339Z",
  "completedAt": "2023-09-05T01:33:14.167127Z",
  "tasks": [
    {
      "name": "my first task",
      "run": "echo hello world",
      "image": "alpine:3.18.3"
    },
    ...
  ],
  "execution": [
    {
      "id": "aa76535bc23649ca9403e636e377aca3",
      "jobId": "9d7d7184b8f244249c5f5d8b4074f72e",
      "position": 1,
      "name": "my first task",
      "state": "COMPLETED",
      "createdAt": "2023-09-05T01:33:08.414192Z",
      "scheduledAt": "2023-09-05T01:33:08.414378Z",
      "startedAt": "2023-09-05T01:33:08.414574Z",
      "completedAt": "2023-09-05T01:33:08.699749Z",
      "run": "echo hello world",
      "image": "alpine:3.18.3",
      "queue": "default",
      "nodeId": "93a1cd11800741e6863d1adef3bc3d18"
    },
    ...
  ],
  "position": 4,
  "taskCount": 3
}
```

## Submit a job

Submit a new job to be scheduled for execution

**Path:**

```shell
POST /jobs
```

**Headers:**

```shell
Content-Type:text/yaml
```

**Body:**

- `name` - a human-readable name for the job
- `tasks` - the list of task to execute
- `inputs` - input parameters allow you to specify data that the job expects to use during its runtime. Input values can be accessed by tasks by using a [template expression](https://pkg.go.dev/text/template), e.g. `{{ inputs.someParam }}`
- `defaults` - allows to specify job-level defaults to all tasks in the job, if not otherwise specified. Example:

```yaml
defaults:
  timeout: 5s # all tasks time out after 5s by default
  retry:
    limit: 3 # failing tasks are allowed to retry up to 3 times by default
  limits:
    cpus: .5 # tasks are allowed no more than half a CPU by default
    memory: 10m # tasks are allowed no more than 10MB of RAM by default
```

- `webhooks` - allow to specify webhooks to be called when on job `status` changes.

```yaml
webhooks:
  - url: http://example.com/my/webhook # POST (required)
    headers: # optional headers to send when calling the webhook endpoint
      my-header: somevalue
```

Task properties:

- `name` - a human-readable name for the task
- `image` the docker image to use to execute the task when using the Docker (default) runtime.
- `registry` - the auth details when using a private image registry
  ```yaml
  registry:
    username: someuser
    passwoed: secret
  ```
- `run` - the script to run on the container
- `entrypoint` - Allows to override the image's `entrypoint`. default: `[sh, -c]`.
- `cmd` - an alternative to using the `run` property when you want to use the `image`'s default `entrypoint`.
- `env` - a key-value map of environment variables
- `queue` - the name of the queue that the task should be routed to. See [queues](#queues).
- `pre` - the list of tasks to execute prior to executing the actual task.
- `post` - the list of tasks to execute post execution of the actual task.
- `mounts` - a list of mounts, created for the duration of the execution of the task. Useful for sharing state between the task
  and its `pre` and `post` tasks.
  ```yaml
  mounts:
    - type: volume
      target: /data1
  ```
- `networks` - Networks are the layer that allow task containers within the same node to communicate with each other. This could be useful when certain nodes are configured with long-running services which the task needs access to.
  ```yaml
  networks:
    - some-network
  ```
- `retry` - the retry configuration to execute in case of a failure. Example:
  ```yaml
  retry:
    limit: 5 # will retry up to 5 times
  ```
- `timeout` - the amount of time (specified as `300ms` or `1h` or `45m` etc.) that a task may execute before it is cancelled.
- `files` - allows setting up arbitrary files in the container's work dir:
  ```yaml
  - name: my python task
    image: python:3
    run: python script.py
    files:
      script.py: print("hello world")
  ```
- `limits` - the amounts of resources alloted for the execution of the task. Example:

```yaml
limits:
  cpus: .5 # task is allowed no more than half a CPU
  memory: 10m # task is allowed no more than 10MB of RAM
```

**Example:**

```bash
curl -X POST "http://localhost:8000/jobs" \
     -H "Content-Type: text/yaml" \
     -d \
'
name: sample job
tasks:
  - name: sample task
    image: ubuntu:mantic,
    run: echo hello world
'
```

## Cancel a running job

**Path:**

```shell
PUT /jobs/<JOB ID>/cancel
```

**Response:**

Success:

```shell
HTTP 200

{
  "status": "OK"
}
```

Failure:

```shell
400 Bad Request

{
  "message": "job in not running"
}
```

## Restart a failed/cancelled job

**Path:**

```shell
PUT /jobs/{job id}/restart
```

**Response:**

Success:

```shell
HTTP 200

{
  "status": "OK"
}
```

Failure:

```shell
400 Bad Request

{
  "message": "job is COMPLETED and can not be restarted"
}
```
