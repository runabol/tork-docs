---
title: Runtime
nextjs:
  metadata:
    title: Runtime
    description: Tork Runtime
---

## Overview

The Tork runtime system allows you to execute tasks in isolated environments. This ensures that tasks do not interfere with each other and can be executed in a controlled manner. The runtime system supports multiple backends, each suited for different use cases.

## Supported Runtimes

Tork supports the following runtime environments:

- **Docker**: The default and recommended runtime for most use cases.
- **Podman**: An alternative to Docker, suitable for environments where Docker is not available.
- **Shell**: Executes tasks directly on the host machine, recommended only for specific use cases due to security concerns.


## Docker

This is the default execution environment for a task. A new container is created for each task execution. Any `mounts` or `networks` defined on the task will be attached to the container on startup. Upon completion/failure of a task the container will be destroyed. This is the recomendded execution environment for a task as it provides maximum isolation from other tasks as well as from the host.

Configuration:

```toml
[runtime]
type = "docker" # this is already the default
```

or 

```bash
TORK_RUNTIME_TYPE=docker
```

## Podman 

This runtime environment is similar to Docker but uses Podman instead. Podman is a daemonless container engine for developing, managing, and running OCI Containers. It is an alternative to Docker and can be used in environments where Docker is not available or preferred.

Configuration:

```toml
[runtime]
type = "podman"
```

or 

```bash
TORK_RUNTIME_TYPE=podman
```

## Shell

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

or 

```bash
TORK_RUNTIME_SHELL=podman
```

## Mounts

The `Mounter` component is responsible for mounting and unmounting task-defined `mounts` types for a given runtime.

### Docker Mounts

There are several types of `Mounter` implementations that are supported out of the box when using the Docker or Podman runtimes:

1. `volume` - mounts and unmounts docker volumes for a given task.
2. `bind` - binds a host folder to a container folder for a given task.
3. `tmpfs` - (linux hosts only) mounts `tmpfs` docker volumes for a given task.

### Registering a custom Mounter

To register a custom `Mounter` implementation for a given runtime, first follow the instructions on the [Extending Tork](/extend) guide to get Tork running in embedded mode.

Update your `main` function to make use of the `engine.RegisterMounter` hook:

```golang
func main() {
	if err := conf.LoadConfig(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	var mounter runtime.Mounter // implemented this interface

	engine.RegisterMounter(runtime.Docker, "mymounter", mounter)

	if err := cli.New().Run(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
```

Optional: You can add custom configuration to the [config file](/config) if you need these for your mounter implementation:

```toml
[mounter.mymounter]
# your configs
```
