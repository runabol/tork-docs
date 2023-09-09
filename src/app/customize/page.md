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
go: added github.com/runabol/tork v0.1.2
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

	if err := cli.New().Run(); err != nil {
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

 0.1.2 (4a9ffcc)

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

## Registering a custom endpoint

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

## Registering a middleware

Middleware functions are functions that intercept the REST API's request-response cycle. These functions are executed sequentially, and they have the ability to modify the request and response objects or end the request-response cycle prematurely. They act as intermediaries between the client and your route handlers, allowing you to perform tasks before or after a request is handled by a specific route.

If the current middleware function does not end the request-response cycle, it must call next() to pass control to the next middleware function. Otherwise, the request will be left hanging.

Some common use cases for middleware:

- Authentication
- Authorization
- Logging
- Rate limiting
- Collecting stats
- CORS
- Adding extra headers

Example of a simple middleware function to time requests:

```golang
package main

import (
	"fmt"
	"os"
	"time"

	"github.com/rs/zerolog/log"
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

	mw := func(next middleware.HandlerFunc) middleware.HandlerFunc {
		return func(c middleware.Context) error {
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
		eng.RegisterMiddleware(mw)
		return nil
	})

	if err := app.Run(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
```

```bash
curl http://localhost:8000/health
```

```json
{ "status": "UP", "version": "0.1.2 (4a9ffcc)" }
```

And in the logs you should see something like this:

```bash
12:13AM INF The request to /health took 88.125µs to process
```

## Additional examples

- [Arbitrary Code Execution Demo](https://github.com/runabol/tork-demo-codexec)
