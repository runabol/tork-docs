---
title: Datastore
nextjs:
  metadata:
    title: Datastore
    description: Tork Datastore
---

The `Datastore` component is responsible for holding metadata about jobs, tasks and worker nodes.

---

## Types

There are two types of `Datastore` implementations that are supported out of the box with Tork:

1. In-memory
2. Postgres

## Registering a custom Datastore

To register a custom `Datastore` implementation follow the instructions on the [Extending Tork](/extend) guide to get Tork running in embedded mode.

Update your `main` function to make use of the `engine.RegisterDatastoreProvider` hook:

```golang
func main() {
	if err := conf.LoadConfig(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	engine.RegisterDatastoreProvider("mydb", func() (datastore.Datastore, error) {
        // example of using config
        // url := conf.String("datastore.mydb.url")
		return nil, errors.New("not implemented yet")
	})

	if err := cli.New().Run(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
```

Update your [config file](/config) to make use of your implementation:

```toml
[datastore]
type = mydb

[datastore.mydb]
url = mydb://user@password:localhost
```
