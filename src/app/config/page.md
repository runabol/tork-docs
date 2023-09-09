---
title: Configuration
nextjs:
  metadata:
    title: Configuration
    description: Configuring Tork
---

Tork can be configured by creating a `config.toml` file in the same directory from which it is started.

Other well-known locations that Tork will look for config files are `~/tork/config.toml` and `/etc/tork/config.toml` in that order.

Alternatively, you can specify the path to the config file by using the `--config` flag. e.g.:

```shell
./tork --config myconfig.toml run standalone
```

If no configuration file is found, Tork will attempt to start using sensible defaults.

---

## Example Configuration File

```toml
[cli]
# whether or not to display the ASCII banner
# when starting Tork
banner.mode = "console" # off | console | log

[client]
# When using the CLI as a client,
# this is the ENDPOINT use when
# calling the Coordinator API
endpoint = "http://localhost:8000"

[logging]
level = "debug"   # debug | info | warn | error
format = "pretty" # pretty | json

[broker]
# The type of message broker to use
type = "inmemory" # inmemory | rabbitmq

[broker.rabbitmq]
# When using the RabbitMQ broker
# this is the URL used for connecting
url = "amqp://guest:guest@localhost:5672/"

[datastore]
# The datastore implementation to use
type = "inmemory" # inmemory | postgres

[datastore.postgres]
# When using the Postgres datastore this is the
# connection string to use to the connect to the DB
dsn = "host=localhost user=tork password=tork dbname=tork port=5432 sslmode=disable"

[coordinator]
# The address for the Coordinator to listen on
# for REST API requests
address = "localhost:8000"

[coordinator.queues]
# Specify how many consumers to create for a given
# queue. If not specified it is assumed to be 1
completed = 1 # completed queue consumers (default: 1)
error = 1     # error queue consumers (default: 1)
pending = 1   # pending queue consumers (default: 1)
started = 1   # started queue consumers (default: 1)
hearbeat = 1  # heartbeat queue consumers (default: 1)
jobs = 1      # jobs queue consumers (default: 1)

[coordinator.api]
endpoints.health = true # turn on|off the /health endpoint
endpoints.jobs = true   # turn on|off the /jobs endpoints
endpoints.tasks = true  # turn on|off the /tasks endpoints
endpoints.nodes = true  # turn on|off the /nodes endpoint
endpoints.queues = true # turn on|off the /queues endpoint
endpoints.stats = true  # turn on|off the /stats endpoint

[worker]
# The address of the Worker to listen
# on for REST API requests
address = "localhost:8001"
# The directory used as the parent
# directory for temporary volumes
tempdir = "/tmp"

[worker.queues]
# Specify how many consumers to create for a given
# queue. If not specified it is assumed to be 1
default = 1

[worker.limits]
# Specify the default CPUs limit for a given
# task. Can be overridden at a task level.
cpus = "1"
# Specify the default RAM limit for a given
# task. Can be overridden at a task level.
memory = "100"
```
