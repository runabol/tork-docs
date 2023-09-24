---
title: Mounter
nextjs:
  metadata:
    title: Mounter
    description: Tork Mounter
---

The `Mounter` component is responsible for mounting and unmounting task-defined `mounts` types.

---

## Types

There are two types of `Mounter` implementations that are supported out of the box with Tork:

1. `volume` - which mounts and unmounts docker volumes for a given task.
2. `bind` - which binds a host folder to a container folder for a given task.

## Registering a custom Mounter

To register a custom `Mounter` implementation follow the instructions on the [Customize Tork](/customize) guide to get Tork running in embedded mode.

Update your `main` function to make use of the `engine.RegisterMounter` hook:

```golang
func main() {
	if err := conf.LoadConfig(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	var mymounter mount.Mounter // implement this interface

	engine.RegisterMounter("mytype",mymounter)

	if err := cli.New().Run(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
```

Optional: You can add custom configuration to the [config file](/config) if you need these for your mounter implementation:

```toml
[mounter.mymounter]
# configs
```
