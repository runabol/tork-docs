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
