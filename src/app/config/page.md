---
title: Configuration
nextjs:
  metadata:
    title: Configuration
    description: Configuring Tork
---

Tork can be configured by creating a `config.toml` file in the same directory from which it is started.

Other well-known locations that Tork will look for config files are `~/tork/config.toml` and `/etc/tork/config.toml` in that order.

Alternatively, you can specify the path to the config file by using the `TORK_CONFIG` env var flag. e.g.:

```shell
TORK_CONFIG=myconfig.toml ./tork run standalone
```

If no configuration file is found, Tork will attempt to start using sensible defaults.

---

## Configuration File

The following are all the configuration options supported by Tork.

The values are the default values.

```toml
[cli]
banner.mode = "console" # off | console | log

[client]
endpoint = "http://localhost:8000"

[logging]
level = "debug"   # debug | info | warn | error
format = "pretty" # pretty | json

[broker]
type = "inmemory" # inmemory | rabbitmq

[broker.rabbitmq]
url = "amqp://guest:guest@localhost:5672/"
consumer.timeout = "30m" # see https://www.rabbitmq.com/consumers.html#acknowledgement-timeout
management.url = "" # default: http://{rabbit_host}:15672/

[datastore]
type = "inmemory" # inmemory | postgres

[datastore.postgres]
dsn = "host=localhost user=tork password=tork dbname=tork port=5432 sslmode=disable"

[coordinator]
address = "localhost:8000"

[coordinator.api]
endpoints.health = true  # turn on|off the /health endpoint
endpoints.jobs = true    # turn on|off the /jobs endpoints
endpoints.tasks = true   # turn on|off the /tasks endpoints
endpoints.nodes = true   # turn on|off the /nodes endpoint
endpoints.queues = true  # turn on|off the /queues endpoint
endpoints.metrics = true # turn on|off the /metrics endpoint

[coordinator.queues]
completed = 1 # completed queue consumers
error = 1     # error queue consumers
pending = 1   # pending queue consumers
started = 1   # started queue consumers
hearbeat = 1  # heartbeat queue consumers
jobs = 1      # jobs queue consumers

# cors middleware
[middleware.web.cors]
enabled = false
origins = "*"
methods = "*"
credentials = false
headers = "*"

# basic auth middleware
[middleware.web.basicauth]
enabled = false
username = "tork"
password = ""     # if left blank, it will auto-generate a password and print it to the logs on startup

# rate limiter middleware
[middleware.web.ratelimit]
enabled = false
rps = 20        # requests per second per IP

# request logging
[middleware.web.logger]
enabled = true
level = "DEBUG"        # TRACE|DEBUG|INFO|WARN|ERROR
skip = ["GET /health"] # supports wildcards (*)

[middleware.job.redact]
enabled = false

[middleware.task.hostenv]
vars = [
] # list of host env vars to inject into tasks, supports aliases (e.g. SOME_HOST_VAR:OTHER_VAR)


[worker]
address = "localhost:8001"
tempdir = "/tmp"

# default task limits
[worker.limits]
cpus = ""   # supports fractions
memory = "" # e.g. 100m

[worker.queues]
default = 1 # numbers of concurrent subscribers

[worker.mounts.bind]
allowed = false
allowlist = []  # supports wildcards (*)
denylist = []   # supports wildcards (*)

[runtime]
type = "docker"

[runtime.shell]
cmd = ["bash", "-c"] # the shell command used to execute the run script
uid = ""             # set the uid for the the task process (recommended)
gid = ""             # set the gid for the the task process (recommended)
```

## Environment Variables

It is possible to override/specify any configuration property using an environment variable with the following format: `TORK_` + `CONFIG_PROPERTY`, replacing dots with underscores. For example, `TORK_LOGGING_LEVEL=warn`.
