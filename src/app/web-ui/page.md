---
title: Web UI
nextjs:
  metadata:
    title: Web UI
    description: Web UI - Tork
---

[Tork Web](https://github.com/runabol/tork-web) is a web based tool for interacting with Tork.

---

## Features

See a list of running jobs

{% figure src="webui/jobs.png" /%}

Cancel/Restart jobs

{% figure src="webui/cancel.png" /%}

Submit a new job

{% figure src="webui/submit.png" /%}

View job execution history

{% figure src="webui/job.png" /%}

View individual task details

{% figure src="webui/task.png" /%}

View task logs

{% figure src="webui/task-logs.png" /%}

View node status

{% figure src="webui/nodes.png" /%}

View queues

{% figure src="webui/queues.png" /%}

## installation

The easiest way to get Tork Web running is using Docker:

```shell
docker run \
  -it \
  --rm \
  --name=tork-web \
  -p 3000:3000 \
  -e BACKEND_URL=http://my.tork.host:8000 \
  runabol/tork-web
```
