---
title: Runtime
nextjs:
  metadata:
    title: Runtime
    description: Tork Runtime
---

The `Runtime` component is responsible for the execution of the task `run` script.

---

## Types

There are two types of `Runtime` implementations that are supported out of the box with Tork:

1. Docker (default)
2. Shell

### Docker

This is the default execution environment for a task. A new container is created for each task execution. Any `mounts` or `networks` defined on the task will be attached to the container on startup. Upon completion/failure of a task the container will be destroyed. This is the recomendded execution environment for a task as it provides maximum isolation from other tasks as well as from the host.

Configuration:

```toml
[runtime]
type = "docker" # this is already the default
```

### Shell

This runtime environment is only supported on unix/linux systems. When using the Shell runtime, tasks execute as a forked process on the host machine that is running Tork.

{% callout title="Warning!" %}
This runtime environment should be used with _extreme caution_ as input jobs can execute arbitrary code on the host machine and wreak havoc. It is highly recommended to set the `uid` and `gid` config parameters on the host worker in order to limit the process permissions.
{% /callout %}

```toml
[runtime]
type = "shell"

[runtime.shell]
cmd = ["bash", "-c"] # the shell command used to execute the run script
uid = ""             # set the uid for the the task process (recommended)
gid = ""             # set the gid for the the task process (recommended)
```
