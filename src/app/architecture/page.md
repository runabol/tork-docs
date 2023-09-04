---
title: Architecture
nextjs:
  metadata:
    title: Architecture
    description: Architecture of Tork
---

Tork is a platform that lets you run workflows (also referred to as "jobs"). A workflow is represented as a series of sequential steps (or tasks).

Jobs are typically authored in YAML format. Here's a very simple example.

```yaml
# hello.yaml
---
name: hello job
tasks:
  - name: say hello
    image: ubuntu:mantic
    run: |
      echo -n hello world
  - name: say goodbye
    image: ubuntu:mantic
    run: |
      echo -n bye world
```

A Tork installation generally consists of the following components:

{% figure src="architecture.png" /%}

- **Coordinator**: The Coordinator is responsible for keeping track of jobs, dishing out work to be done by Worker nodes, handling task failures, retries and other job-level details. Unlike Worker nodes, the Coordinator does not execute actual work but delegate all task execution activities to Worker instances. Coordinators are stateless and leaderless.

- **Worker**: Responsible for executing tasks by means of a runtime (typically Docker).

- **Broker**: Responsible for routing tasks between the Coordinator and Worker nodes.

- **Datastore**: holds the state for tasks and jobs.

- **Runtime**: the platform used by workers to execute tasks.
