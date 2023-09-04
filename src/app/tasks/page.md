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

Tasks always execute within a Docker container. The type of container (or image) is specified using the `image` property.

Tasks can use any of the publicly available [docker images](https://hub.docker.com/search), and support for private repositories coming in the near future.

The work to be done in the container is specified in the `run` property.

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

- Evaluate C-style embedded expressions in a task's environment variables.

- Evaluate a task's `if` condition to determine whether a task should run.

### If Expression

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

### Access the job's context

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

### Functions

There are a number of [built-in](https://expr.medv.io/docs/Language-Definition#built-in-functions) and [additional](https://github.com/runabol/tork/blob/main/eval/funcs.go) functions that can be used in expressions.

```yaml
- name: print the length of a string
  image: ubuntu:mantic
  env:
    LENGTH: '{{len("hello world")}}'
  run: |
    echo "The length of the string is: $LENGTH"
```

### Environment Variables

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

#### Secrets

By convention, any environment variables which contain the keywords `SECRET`, `PASSWORD` or `ACCESS_KEY` in their names will have their values automatically redacted from logs as well as from API responses.

{% callout title="Warning!" %}
Tork automatically redacts secrets printed to the log, but you should avoid printing secrets to the log intentionally.
{% /callout %}

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

## Sepcial Tasks

### Parallel Task

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

### Each Task

Executes the task to for each `item` in `list`, in parallel.

Example:

```yaml
- name: sample each task
  each:
    list: '{{ range(1,5) }}'
    task:
      image: ubuntu:mantic
      env:
        ITEM: '{{item.value}}'
        INDEX: '{{item.index}}'
      run: echo -n HELLO $ITEM at $INDEX
```

### Sub-Job Task

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

## Pre/Post Tasks

Worker nodes are stateless by design. Which means that no state is left on the worker node after a task terminates. Moreover tasks can execute on any of the available worker so there's no guarantee that a task that is scheduled to execute will execute on the same node that the task just prior to it executed.

However, it is sometimes desireable to execute a task - potentially even using a different image - before or after a task executes and share the state of that execution with the "main" task we want to execute. This is where `pre` and `post` tasks come in.

Each task can define a set of tasks that will be executed prior to its execution, and after its execution.

The `pre` and `post` tasks always execute on the same worker node which will execute the task itself and are considered to be an atomic part of the task. That is, a failure in any of the pre/post tasks is considered a failure of the entire task.

Additionally, any `volumes` and/or `networks` defined on the primary task are also accessible to the `pre` and `post` tasks.

Example:

```yaml
- name: convert the first 5 seconds of a video
  image: jrottenberg/ffmpeg:3.4-alpine
  run: |
    ffmpeg -i /tmp/input.ogv -t 5 /tmp/output.mp4
  volumes:
    - /tmp
  pre:
    - name: download the remote file
      image: alpine:3.18.3
      run: |
        wget \
         https://upload.wikimedia.org/wikipedia/commons/1/18/Big_Buck_Bunny_Trailer_1080p.ogv \
         -O /tmp/input.ogv
  post:
    - name: upload the converted file
      image: alpine:3.18.3
      run: |
        wget \
        --post-file=/tmp/output.mp4 \
        https://devnull-as-a-service.com/dev/null
```
