---
title: Runtime
nextjs:
  metadata:
    title: Runtime
    description: Tork Runtime
---

The `Runtime` component is responsible for the execution of the task `run` script.

---

There are two types of `Runtime` implementations that are supported out of the box with Tork:

1. Docker (default)
2. Shell

## Docker

This is the default execution environment for a task. A new container is created for each task execution. Any `mounts` or `networks` defined on the task will be attached to the container on startup. Upon completion/failure of a task the container will be destroyed. This is the recomendded execution environment for a task as it provides maximum isolation from other tasks as well as from the host.

Configuration:

```toml
[runtime]
type = "docker" # this is already the default
```

### Sandbox mode (Experimental)

Sandbox mode is an experimental security feature which forces containers to run as non-root.

When turned on (`TORK_RUNTIME_DOCKER_SANDBOX=true`) for a given worker, docker containers will automatically run as non-root (`1000:1000`) user.

If the image is already configured to run as non-root, Tork will respect that. This is useful if you want to have better control over the creation and assignment of permissions to a non-root user.

Use of this feature assumes the worker has access to the `busybox:stable` image (either locally or by means of a pull).

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

## Mounts

The `Mounter` component is responsible for mounting and unmounting task-defined `mounts` types for a given runtime.

### Docker Mounts

There are several types of `Mounter` implementations that are supported out of the box when using the default Docker-based runtime:

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
