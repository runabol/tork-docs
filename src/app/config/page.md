---
title: Configuration
nextjs:
  metadata:
    title: Configuration
    description: Configuring Tork
---
Tork can be configured using a `config.toml` file or by using environment variables
---

## Configuration file

Tork can be configured by creating a `config.toml` file in the same directory from which it is started.

Other well-known locations that Tork will look for config files are `~/tork/config.toml` and `/etc/tork/config.toml` in that order.

Alternatively, you can specify the path to the config file by using the `TORK_CONFIG` env var flag. e.g.:

```shell
TORK_CONFIG=myconfig.toml ./tork run standalone
```

See [sample.config.toml](https://github.com/runabol/tork/blob/main/configs/sample.config.toml) for a sample configuration file and the available configuration options.

## Environment variables

It is possible to override/specify any configuration property using an environment variable with the following format: `TORK_` + `CONFIG_PROPERTY`, replacing dots with underscores. For example, `TORK_LOGGING_LEVEL=warn`.
