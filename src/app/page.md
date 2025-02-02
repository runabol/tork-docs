---
title: Getting Started
---

{% quick-links %}

{% quick-link title="Installation" icon="installation" href="/installation" description="Step-by-step guide to getting you up and running." /%}

{% quick-link title="Architecture" icon="presets" href="/architecture" description="Take a look under the hood." /%}

{% quick-link title="API reference" icon="theming" href="/rest" description="Learn how to interact with Tork using its REST API." /%}

{% quick-link title="Extend Tork" icon="plugins" href="/extend" description="Extend Tork for your particular use case." /%}

{% /quick-links %}

---

## Features

- [REST API](/rest-api)
- Horizontally scalable
- Task isolation - tasks are executed within a container to provide isolation, idempotency, and in order to enforce resource limits
- Automatic recovery of tasks in the event of a worker crash
- Supports both stand-alone and [distributed](/installation#running-in-a-distributed-mode) setup
- [Retry failed tasks](/tasks#retry)
- No single point of failure
- [Task timeout](/tasks#timeout)
- Full-text search
- [Runtime](/runtime) agnostic.
- [Middleware](/extend#middleware)
- [Webhooks](/jobs#webhooks)
- [Expression Language](/tasks#expressions)
- Conditional Tasks
- [Parallel Task](/tasks#parallel-task)
- [Each Task](/tasks#each-task)
- [Subjob Task](/tasks#sub-job-task)
- [Task priority](/tasks#priority)
- [Pre/Post tasks](/tasks#pre-post-tasks)
- [Secrets](/tasks#secrets)
- [Scheduled jobs](/jobs#scheduled-jobs)
- [Web UI](/web-ui)

