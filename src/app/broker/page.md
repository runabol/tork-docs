---
title: Broker
nextjs:
  metadata:
    title: Broker
    description: Tork Broker
---

The `Broker` component is responsible for routing messages between the Coordinator and Worker nodes.

---

## Types

There are two types of `Broker` implementations that are supported out of the box with Tork:

1. In-memory
2. RabbitMQ

## Registering a custom Broker

To register a custom `Broker` implementation follow the instructions on the [Customize Tork](/customize) guide to get Tork running in embedded mode.

Your main function should look something like this:

```golang
package main

import (
	"fmt"
	"os"

	"github.com/runabol/tork/cli"
	"github.com/runabol/tork/conf"
)

func main() {
	if err := conf.LoadConfig(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	if err := cli.New().Run(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
```

Update your `main` function to make use of the `engine.RegisterBrokerProvider` hook:

```golang
func main() {

	if err := conf.LoadConfig(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	engine.RegisterBrokerProvider("mymq", func() (mq.Broker, error) {
		// example of using config
        // url := conf.String("broker.mymq.url")
		return nil, errors.Errorf("not implementd yet")
	})


	if err := cli.New().Run(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

}
```

Update your [config file](/config) to make use of your implementation:

```toml
[broker]
type = mymq

[broker.mymq]
url = mydb://user@password:localhost
```
