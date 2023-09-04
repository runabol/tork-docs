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
