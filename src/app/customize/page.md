---
title: Customize Tork
nextjs:
  metadata:
    title: Customize Tork
    description: Customize Tork
---

Tork's architecture makes it fairly easy to add functionality to the core engine.

This guide is intended for developers that want to extend Tork's behavior.

For configuring its existing behavior, refer to the [configuration](/config) guide.

---

## Running Tork in embedded mode

Create a new directory:

```bash
mkdir tork-plus
cd tork-plus
```

Init the Go project:

```bash
go mod init github.com/example/tork-plus
```

Get the Tork dependency:

```bash
go get github.com/runabol/tork
```

```bash
go: added github.com/runabol/tork v0.1.3
```

Create a `main.go` with the minimum bolierplate necessary to start Tork:

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

	app := cli.New()

	if err := app.Run(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
```

Update your dependencies:

```bash
go mod tidy
```

Start Tork:

```bash
% go run main.go
```

If all goes well, your should see something like this:

```bash
 _______  _______  ______    ___   _
|       ||       ||    _ |  |   | | |
|_     _||   _   ||   | ||  |   |_| |
  |   |  |  | |  ||   |_||_ |      _|
  |   |  |  |_|  ||    __  ||     |_
  |   |  |       ||   |  | ||    _  |
  |___|  |_______||___|  |_||___| |_|

 0.1.3 (1df8ca2)

NAME:
   tork - a distributed workflow engine

USAGE:
   tork [global options] command [command options] [arguments...]

COMMANDS:
   run        Run Tork
   migration  Run the db migration script
   health     Perform a health check
   help, h    Shows a list of commands or help for one command

GLOBAL OPTIONS:
   --help, -h  show help
```

## Custom endpoint

Let's use the `ConfigureEngine` hook to register a new endpoint:

Update your `main.go` to look like this:

```golang
package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/runabol/tork/cli"
	"github.com/runabol/tork/conf"
	"github.com/runabol/tork/engine"
	"github.com/runabol/tork/middleware"
)

func main() {
	if err := conf.LoadConfig(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	app := cli.New()

	handler := func(c middleware.Context) error {
		return c.String(http.StatusOK, "Hello")
	}

	app.ConfigureEngine(func(eng *engine.Engine) error {
		eng.RegisterEndpoint(http.MethodGet, "/myendpoint", handler)
		return nil
	})

	if err := app.Run(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

```

Start Tork in `standalone` mode:

```bash
go run main.go run standalone
```

Let's try to call our new endpoint:

```bash
curl http://localhost:8000/myendpoint
```

If all goes well you should see:

```bash
Hello
```

## Middleware

Middleware functions allow you to intercept the operation of Tork at various points in order to handle commons tasks and/or enchance its functionality in some way.

Tork supports 4 types of middlewares:

- [HTTP middleware](#http-middleware)
- [Job middleware](#job-middleware)
- [Task middleware](#task-middleware)
- [Node middleware](#node-middleware)

Some common use cases for middleware:

- Authentication
- Authorization
- Logging
- Rate limiting
- Collecting metrics
- CORS
- Adding extra headers
- Modifying a job/task state

### HTTP middleware

HTTP middleware functions are functions that intercept the Coordinator API's HTTP request-response cycle. These functions are executed sequentially, and they have the ability to modify the request and response objects or end the request-response cycle prematurely. They act as intermediaries between the client and your route handlers, allowing you to perform actions before or after a request is handled by a specific route.

If the current middleware function does not end the request-response cycle, it must call next() to pass control to the next middleware function. Otherwise, the request will be left hanging.

Example of a simple middleware function to time requests:

```golang
mw := func(next request.HandlerFunc) request.HandlerFunc {
	return func(c request.Context) error {
		before := time.Now()
		// happens before the request is processed
		next(c)
		// happens after the request is processed
		log.Info().Msgf("The request to %s took %s to process",
			c.Request().URL.Path,
			time.Since(before),
		)
		return nil
	}
}

app.ConfigureEngine(func(eng *engine.Engine) error {
	eng.RegisterRequestMiddleware(mw)
	return nil
})
```

```bash
curl http://localhost:8000/health
```

```json
{ "status": "UP", "version": "0.1.3 (1df8ca2)" }
```

And in the logs you should see something like this:

```bash
12:13AM INF The request to /health took 88.125µs to process
```

### Job middleware

Job middleware functions intercept state changes to jobs within the same Coordinator that they are running on.

They act as intermediaries between the client and the Coordinator handlers, allowing you to perform actions before or after a job is handled by the Coordinator.

If the current middleware function does not end the handling of the job, it must call `next()` to pass control to the next middleware function. Otherwise, the job will never get handled.

Example of a middleware that logs job state change:

```golang
mw := func(next job.HandlerFunc) job.HandlerFunc {
	return func(ctx context.Context, j *tork.Job) error {
		log.Debug().
			Msgf("received job %s at state %s", j.ID, j.State)
		return next(ctx, j)
	}
}

app.ConfigureEngine(func(eng *engine.Engine) error {
	eng.RegisterJobMiddleware(mw)
	return nil
})
```

### Task middleware

Task middleware functions intercept state changes to tasks within the same Coordinator that they are running on.

They act as intermediaries between the client and the Coordinator handlers, allowing you to perform actions before or after a task is handled by the Coordinator.

If the current middleware function does not end the handling of the task, it must call `next()` to pass control to the next middleware function. Otherwise, the task will never get handled.

Example of a middleware that logs task state change:

```golang
mw := func(next task.HandlerFunc) task.HandlerFunc {
	return func(ctx context.Context, t *tork.Task) error {
		log.Debug().
			Msgf("received task %s at state %s", t.ID, t.State)
		return next(ctx, t)
	}
}

app.ConfigureEngine(func(eng *engine.Engine) error {
	eng.RegisterTaskMiddleware(mw)
	return nil
})
```

### Node middleware

Node middleware functions intercept heartbeat messages from the worker nodes to the Coordinator.

They act as intermediaries between the worker nodes and the Coordinator handlers, allowing you to perform actions before or after a heartbeat is handled by the Coordinator.

If the current middleware function does not end the handling of the heartbeat, it must call `next()` to pass control to the next middleware function. Otherwise, the hearbeat will never get handled.

Example of a middleware that logs heartbeats:

```golang
mw := func(next node.HandlerFunc) node.HandlerFunc {
	return func(ctx context.Context, n *tork.Node) error {
		log.Debug().
			Msgf("received heartbeat from %s", n.Hostname)
		return next(ctx, n)
	}
}

app.ConfigureEngine(func(eng *engine.Engine) error {
	eng.RegisterNodeMiddleware(mw)
	return nil
})
```

## Additional examples

- [Arbitrary Code Execution Demo](https://github.com/runabol/tork-demo-codexec)
