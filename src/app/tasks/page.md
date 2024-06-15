---
title: Tasks
nextjs:
  metadata:
    title: Tasks
---

A Task is the basic unit of execution in Tork. Tasks are executed in the order they appear on a [job](/jobs).

---

## Example

```yaml
- name: say hello
  var: task1
  image: ubuntu:mantic
  run: |
    echo -n hello world > $TORK_OUTPUT
```

When using the default Docker runtime, tasks execute within a Docker container. The type of container (or image) is specified using the `image` property.

Tasks can use any of the publicly available [docker images](https://hub.docker.com/search), and support for private repositories coming in the near future.

The work to be done in the container is specified in the `run` property.

## Image

When using the default Docker [runtime](/runtime) `image`, spcifies the Docker image to use for the task.

You can use images from any publicly available registries.

```yaml
- name: say hello
  var: task1
  # uses Docker hub's ubuntu image
  image: ubuntu:mantic
  run: |
    echo -n hello world > $TORK_OUTPUT
```

### Private registries

You can also use private docker registries by using the `registry` property.

```yaml
- name: populate a variable
  image: myregistry.com/my_image:latest
  registry:
    username: user
    password: mypassword
  run: |
    echo "do work"
```

Avoid having your registry credentials in the clear. As an alternative, you can create a Docker config file on your Tork host with the necessary credentials:

```json
{
  "auths": {
    "myregistry.com": {
      "auth": "base64encodedusername:base64encodedpassword"
    }
  }
}
```

And then pass the path to the config file as a parameter to the Tork worker using the `TORK_RUNTIME_DOCKER_CONFIG` environment variable.

## Queue

[Queues](/installation#queues) are the primary mechanism for routing tasks in Tork.

Tasks are always routed to a queue. When not specified, tasks are routed to the `default` queue.

Suppose you have a task that is very CPU heavy. But since large machines are typically more expensive than smaller machines you'd like to route only specific tasks to this queue, while sending the rest of your workload to the `default` queue.

To solve for this, you create a new pool of Tork workers and have them subscribe to the arbitrarily named `highcpu` queue. Then in your job definitions, you send all "heavy" tasks to that queue.

```yaml
name: my job
tasks:
  - name: easy task
    queue: default # does not have to be specified
    image: ubuntu:mantic
    run: |
      echo "do some light lifting"

  - name: say hello
    # will route traffic to Tork workers that are subscribed
    # to the 'highcpu' queue.
    queue: highcpu
    image: ubuntu:mantic
    run: |
      echo "do some heavy lifting"
```

## Output

Tasks may produce output by directing their output to the file specified in the `$TORK_OUTPUT` environment variable and specifying the key to store the task's output in the job's context using the `var` property.

The output from a task can be used by subsequent tasks. Example:

```yaml
name: example job
tasks:
  - name: populate a variable
    image: ubuntu:mantic
    # The task must specify the name of the
    # variable under which its results will be
    # stored in the job's context
    var: task1
    run: |
      echo -n "world" > "$TORK_OUTPUT"
  - name: say hello
    image: ubuntu:mantic
    env:
      # refer to the outputs of the previous task
      NAME: '{{ tasks.task1 }}'
    run: |
      echo -n hello $NAME
```

## Expressions

Tork uses the [expr](https://github.com/antonmedv/expr) expression language to:

- Evaluate C-style embedded expressions in the job defintion.
- Evaluate a task's `if` condition to determine whether a task should run.

Most expressions use the job's context which has the following namespaces:

- `inputs` - to access any values from the job's `inputs` block.
- `secrets` - to access any values from the job's `secrets` block.
- `tasks` - to access the results of previous tasks.
- `job` - to access the job's metadata.

Examples:

When an `if` expression evaluates to anything except `false`, the task will run.

```yaml
name: example job
inputs:
  run: 'false'
tasks:
  - name: say something
    if: "{{ inputs.run == 'true' }}"
    image: ubuntu:mantic
    run: |
      echo "this should not execute"
```

```yaml
name: example job
inputs:
  message: hello world
tasks:
  - name: say something
    image: ubuntu:mantic
    env:
      MESSAGE: '{{ inputs.message }}'
    run: |
      echo $MESSAGE
```

```yaml
name: hello job
tasks:
  - name: do something
    var: someOutput
    image: ubuntu:mantic
    run: |
      echo -n hello world > $TORK_OUTPUT
  - name: print result of previous task
    image: ubuntu:mantic
    run: |
      echo -n $OUTPUT
    env:
      OUTPUT: '{{tasks.someOutput}}'
```

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

### Functions

There are a number of [built-in](https://expr.medv.io/docs/Language-Definition#built-in-functions) and [additional](https://github.com/runabol/tork/blob/main/internal/eval/funcs.go) functions that can be used in expressions.

```yaml
- name: print the length of a string
  image: ubuntu:mantic
  env:
    LENGTH: '{{ len("hello world") }}'
  run: |
    echo "The length of the string is: $LENGTH"
```

## Environment Variables

You can set custom environment variables for a given task by using the `env` property:

```yaml
- name: print a message
  image: ubuntu:mantic
  env:
    INTRO: hello world
    OUTRO: bye world
  run: |
    echo $INTRO
    echo $OUTRO
```

Environment variables can also be populated using [expressions](#expressions).

```yaml
name: example job
inputs:
  message: hello world
tasks:
  - name: say something
    image: ubuntu:mantic
    env:
      MESSAGE: '{{ inputs.message }}'
    run: |
      echo $MESSAGE
```

## Secrets

Sensitive values can be specified in the job's `secrets` block so they can be auto-redacted from API responses.

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

{% callout title="Warning!" %}
Tork automatically redacts secrets printed to the log, but you should avoid printing secrets to the log intentionally.
{% /callout %}

## Files

Files is a convenient means to create arbitrary files in the task's working directory.

```yaml
- name: Get the post
  image: python:3
  files:
    script.py: |
      import requests
      url = "https://jsonplaceholder.typicode.com/posts/1"
      response = requests.get(url)
      data = response.json()
      print(data['title'])
  run: |
    pip install requests
    python script.py > $TORK_OUTPUT
```

## Parallel Task

To run a group of tasks concurrently, wrap them in a `parallel` task.

Example:

```yaml
- name: a parallel task
  parallel:
    tasks:
      - image: ubuntu:mantic
        run: sleep 2
      - image: ubuntu:mantic
        run: sleep 1
      - image: ubuntu:mantic
        run: sleep 3
```

## Each Task

Executes the task to for each `item` in `list`, in parallel.

Example:

```yaml
- name: sample each task
  each:
    list: '{{ sequence(1,5) }}'
    task:
      image: ubuntu:mantic
      env:
        ITEM: '{{ item.value }}'
        INDEX: '{{ item.index }}'
      run: echo -n HELLO $ITEM at $INDEX
```

## Sub-Job Task

A task can start another job. When a sub-job completes or fails it marks its parent task as `COMPLETED` or `FAILED` respectively.

```yaml
- name: a task that starts a sub-job
  subjob:
    name: my sub job
    tasks:
      - name: hello sub task
        image: ubuntu:mantic
        run: echo start of sub-job
      - name: bye task
        image: ubuntu:mantic
        run: echo end of sub-job
```

Sub jobs may also be spawned in `detached` mode, meaning that the parent/spawning job will not wait for their completion but would simply "fire and forget" these jobs. Example:

```yaml
- name: a task that starts a detached job
  subjob:
    name: my sub job
    detached: true
    tasks:
      - name: hello sub task
        image: ubuntu:mantic
        run: echo some work
```

## Mounts

Mounts are often used to share state between the task and its `pre` and `post` tasks (see [Pre/Post tasks](#pre-post-tasks)) but can also be used to access persistent data on the host.

When using the default Docker [runtime](/runtime) there are three types of mounts available:

- `volume` - a [Docker volume](https://docs.docker.com/storage/volumes/) based mount. Volumes are removed at the termination of the task.

```yaml
- name: convert the first 5 seconds of a video
  image: jrottenberg/ffmpeg:3.4-alpine
  run: ffmpeg -i /tmp/my_video.mov -t 5 /tmp/output.mp4
  mounts:
    - type: volume
      target: /tmp
  pre:
    - name: download the remote file
      image: alpine:3.18.3
      run: wget http://example.com/my_video.mov
```

- `bind` - used to mount a host path to a container path.

```yaml
- name: convert the first 5 seconds of a video
  image: jrottenberg/ffmpeg:3.4-alpine
  run: ffmpeg -i /mnt/videos/my_video.mov -t 5 /mnt/videos/output.mp4
  mounts:
    - type: bind
      target: /mnt/videos
      source: /host/path
```

- `tmpfs` - a `tmpfs` mount is temporary, and only persisted in the host memory. When the container stops, the `tmpfs` mount is removed, and files written there won&apos;t be persisted.

## Pre/Post Tasks

Worker nodes are stateless by design. Which means that no state is left on the worker node after a task terminates. Moreover tasks can execute on any of the available worker so there's no guarantee that a task that is scheduled to execute will execute on the same node that the task just prior to it executed.

However, it is sometimes desireable to execute a task - potentially even using a different image - before or after a task executes and share the state of that execution with the "main" task we want to execute. This is where `pre` and `post` tasks come in.

Each task can define a set of tasks that will be executed prior to its execution, and after its execution.

The `pre` and `post` tasks always execute on the same worker node which will execute the task itself and are considered to be an atomic part of the task. That is, a failure in any of the pre/post tasks is considered a failure of the entire task.

Additionally, any `mounts` and/or `networks` defined on the primary task are also accessible to the `pre` and `post` tasks.

Example:

```yaml
- name: convert the first 5 seconds of a video
  image: jrottenberg/ffmpeg:3.4-alpine
  run: |
    ffmpeg -i /tmp/my_video.mov -t 5 /tmp/output.mp4
  mounts:
    - type: volume
      target: /tmp
  pre:
    - name: download the remote file
      image: alpine:3.18.3
      run: |
        wget \
         http://example.com/my_video.mov \
         -O /tmp/my_video.mov
  post:
    - name: upload the converted file
      image: alpine:3.18.3
      run: |
        wget \
        --post-file=/tmp/output.mp4 \
        https://devnull-as-a-service.com/dev/null
```

## Priority

To increase the priority of a task in its queue, use the `priority` property.

Acceptable values are between `0` (no priority) and `9` (highest priority).

```yaml
name: my job
tasks:
  - name: my first task
    image: alpine:3.18.3
    run: sleep 3
    priority: 1
```

You can also set the default priority for all tasks at the job level:

```yaml
name: my job
defaults:
  priority: 1
tasks:
  - name: my first task
    image: alpine:3.18.3
    run: sleep 3
```

## Limits

By default, a task has no resource constraints and can use as much of a given resource as the host’s kernel scheduler allows.

For more fine-grained control, default limits can be overridden at an individual task level:

```yaml
- name: some task
  image: alpine:3.18.3
  run: |
    echo "do some work"
  limits:
    cpus: .5
    memory: 10m
```
