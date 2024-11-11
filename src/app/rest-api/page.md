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

The [job](/jobs) definition represented in YAML

**Example:**

```bash
curl -X POST "http://localhost:8000/jobs" \
     -H "Content-Type: text/yaml" \
     -d \
'
name: sample job
tasks:
  - name: sample task
    image: ubuntu:mantic
    run: echo hello world
'
```

Or using JSON:

**Headers:**

```shell
Content-Type:application/json
```

**Body:**

The [job](/jobs) definition represented in JSON

**Example:**

```bash
curl -X POST "http://localhost:8000/jobs" \
     -H "Content-Type: application/json" \
     -d \
'{
  "name": "hello job",
  "tasks": [{
     "name": "say hello",
      "image": "ubuntu:mantic",
      "run": "echo -n hello world\n"
  }]
}'
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

## List nodes

Returns a list of all active nodes in the cluster.

**Path:**

```shell
GET /nodes
```

**Response:**

```json
[
  {
    "id": "V2CjY4HYEaUCtTZziuJh6M",
    "name": "Coordinator",
    "startedAt": "2024-06-15T19:51:51.111662-04:00",
    "cpuPercent": 17.977528051675314,
    "lastHeartbeatAt": "2024-06-15T23:51:51.226284Z",
    "status": "UP",
    "hostname": "some-host-1",
    "version": "0.1.87"
  },
  {
    "id": "2C2LtZRhktaieM768LQpbP",
    "name": "Worker",
    "startedAt": "2024-06-15T23:51:50.995903Z",
    "cpuPercent": 9.952276537355232,
    "lastHeartbeatAt": "2024-06-15T23:51:51.135511Z",
    "queue": "x-2C2LtZRhktaieM768LQpbP",
    "status": "UP",
    "hostname": "some-host-2",
    "version": "0.1.87"
  }
]
```

## List queues

Returns a list of all queues used by the [broker](/broker).

**Path:**

```shell
GET /nodes
```

**Response:**

```json
[
  {
    "name": "default",
    "size": 12,
    "subscribers": 3,
    "unacked": 3
  },
  {
    "name": "jobs",
    "size": 0,
    "subscribers": 1,
    "unacked": 0
  },
  {
    "name": "logs",
    "size": 0,
    "subscribers": 1,
    "unacked": 0
  },
  ...
]
```
