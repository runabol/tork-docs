---
title: Jobs
nextjs:
  metadata:
    title: Jobs
---

In Tork, a Job is a series of tasks running in the order they appear on the job description from top to bottom.

---

## Super simple example

```yaml
# job.yaml
name: hello job
tasks:
  - name: say hello
    var: task1
    image: ubuntu:mantic
    run: |
      echo -n hello world > $TORK_OUTPUT
  - name: say goodbye
    image: ubuntu:mantic
    run: |
      echo -n bye world
```

```bash
curl -s -X POST \
  --data-binary @job.yaml \
  -H "Content-type: text/yaml" \
  http://localhost:8000/jobs
```

What will happen:

1. The Coordinator will schedule the first task (`say hello`) for execution by inserting it into the `default` queue.

2. One of the worker nodes that is subscribed to the `default` queue will pick up the task.

3. The worker node will inspect the `image` property to find out what Docker image is needed to execute the task.

4. If the `ubuntu:mantic` image doesn't exist locally the worker node will pull it from Docker Hub.

5. The worker node will start a container in order to execute the task.

6. The worker node will execute the `run` script on the container.

7. The worker node will collect the output from the `$TORK_OUTPUT` file assigned to the container for any optional task output.

8. The worker will terminate the container.

9. The worker will insert the task to the `completions` queue.

10. The Coordinator will pick up the task from the `completions` queue and mark it as completed in the `Datastore`.

11. The Coordinator will insert the output of the task to the Job's context under the key specified in the `var` property (`task1`).

12. The Coordinator will check if there are any additional tasks to be executed on the job.

13. Since there is another task, the Coordinator will be repeat the above steps for this task.

14. Once all tasks are completed, the job state will be marked as `COMPLETED`.

## Inputs

Jobs may specify `inputs` which can be used by any of the job's tasks. Example:

```yaml
name: mov to mp4
inputs:
  source: https://example.com/path/to/video.mov
tasks:
  - name: convert the video to mp4
    image: jrottenberg/ffmpeg:3.4-alpine
    env:
      SOURCE_URL: '{{ inputs.source }}'
    run: |
      ffmpeg -i $SOURCE_URL /tmp/output.mp4
```

## Secrets

Sensitive values can be specified in the `secrets` block so they can be auto-redacted from API responses.

```yaml
name: my job
secrets:
  api_key: 1111-1111-1111-1111
tasks:
  - name: my task
    queue: default
    image: alpine:latest
    run: |
      curl -X POST -H "API_KEY: $API_KEY" http://example.com
    env:
      # use the 'secrets' namespace to inject a secret
      API_KEY: '{{secrets.api_key}}'
```

## Defaults

Jobs may specify default values for all their tasks. All properties are optional.

```yaml
name: my job
defaults:
  retry:
    # a task will retry up to 2 times in case of a failure
    limit: 2
  # resource limits imposed on a task
  limits:
    # 1 CPU limit
    cpus: 1
    # 500MB of RAM limit
    memory: 500m
  # a task will automatically fail if not completed within 10 minutes
  timeout: 10m
  # tasks will be routed to the highcpu queue by default
  queue: highcpu
  # values between 0-9. Higher numbers mean higher priority
  priority: 3
tasks:
  - name: my task
    queue: default # override the job defaults
    image: alpine:latest
    run: |
      echo hello world
```

## Auto Delete

Jobs may specify a period of retention past their completion timestamp, after which they will be automatically deleted. Cancelled or failed jobs will not be automatically deleted.

```yaml
name: my job
autoDelete:
  # job will be automatically deleted 6 hours after its completion.
  after: 6h
tasks:
  - name: my task
    image: alpine:latest
    run: |
      echo hello world
```

## Webhooks

Jobs may specify zero or more webhooks that will be called for various events.

Webhooks will be triggerd on either of two event types:

- `job.StateChange` (Default) - the webhook will be called every time the job changes from one state to another - e.g. from `SCHEDULED` to `RUNNING`.
- `task.StateChange` - the webhook will be called every time a task changes from one state to another.

```yaml
name: my job
webhooks:
    # Webhook URL (assuming POST)
  - url: http://example.com/my/webhook
    # event type
    event: job.StateChange
    # optional headers to send when calling the webhook endpoint
    headers:
      my-header: somevalue
	  # optional: conditional execution of the webhook
	  if: "{{ job.State == 'COMPLETED' }}"
tasks:
  - name: my task
    image: alpine:latest
    run: |
      echo hello world
```

## Permissions

When specified, permissions specify which user(s) or role(s) should have access to this particular job.

Jobs without `permissions` will be viewable to all users.

```yaml
name: my job
permissions:
  # the role's slug
  - role: some-role
  # the user's username
  - user: someuser
tasks:
  - name: my task
    image: alpine:latest
    run: |
      echo hello world
```

## Scheduled jobs

Jobs can be scheduled to execute at specific times using the `schedule` property. The schedule uses the cron syntax to define the intervals.

Example:

```yaml
# job.yaml
name: scheduled job test
schedule:
  cron: "0/5 * * * *" # run the job every 5 minutes
tasks:
  - name: my first task
    image: alpine:3.18.3
    run: echo -n hello world
```

```bash
curl -s -X POST \
  --data-binary @job.yaml \
  -H "Content-type: text/yaml" \
  http://localhost:8000/scheduled-jobs | jq .
```

```json
{
  "id": "c90188cce61244a1aabcdbedf31f51d6",
  "state": "ACTIVE",
  "name": "scheduled job test",
  "createdAt": "2024-12-21T14:53:05.709793Z",
  "cron": "0/5 * * * *"
}
```
