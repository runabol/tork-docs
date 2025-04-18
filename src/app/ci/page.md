---
title: "CI pipeline using Tork and Kaniko"
nextjs:
  metadata:
    title: "Build a CI System with Tork and Kaniko"
    description: "Learn how to leverage Tork workflow engine and Kaniko to build your own Continuous Integration pipeline."
---

If you’re looking for a simple yet powerful way to build container images as part of a Continuous Integration pipeline, Tork and [Kaniko](https://github.com/GoogleContainerTools/kaniko) make a great combination. Tork provides flexible job orchestration; Kaniko lets you build Docker images inside containers—no special privileges needed. Together, they enable you to automate your builds reliably and at scale.

This guide will walk you through setting up a minimal Tork-based CI pipeline that clones some code, builds it into a Docker image, and pushes that image to [Docker Hub](https://hub.docker.com).

> **Note**: This article builds on the [Quick Start Guide](/quick-start) for Tork. Make sure you’ve gone through that to understand basic concepts (jobs, tasks, Tork modes of operation).

## Overview

Our Tork job will have two main tasks:

1. **Checkout Code**: Clones your repository (in a container with `git` installed).
2. **Build & Push Image (Kaniko)**: Uses the `gcr.io/kaniko-project/executor` image to build a Docker image from the cloned code and push it to your registry.

## Step 1: Start Tork in Standalone Mode

For a quick demo, run Tork in **standalone** mode. This means Tork will handle job scheduling and task execution in a single process on your local machine. 

```bash
./tork run standalone
```

By default, Tork will listen on `http://localhost:8000` for job submissions.

## Step 2: Prepare Your CI Job Definition

Create a YAML file (for example, `ci.yaml`) that describes your CI pipeline. The file below shows how to clone code in one task, and then build/push a Docker image with Kaniko in the next.

```yaml
---
name: "My CI Pipeline"
inputs:
  # assuming Dockerfile on the root of your project
  git_repo_url: "your_github_repo_url"
  docker_repo: "your_docker_hub_repo_name"
secrets:
  docker_registry_username: "your_dockerhub_username"
  docker_registry_password: "your_dockerhub_password"

tasks:
  - name: build and push with kaniko
    image: gcr.io/kaniko-project/executor:debug
    run: |
      set -e

      # 1. Create a Docker config to let Kaniko authenticate with the registry
      mkdir -p /kaniko/.docker
      echo "{\"auths\":{\"https://index.docker.io/v1/\": {\"username\": \"$DOCKER_REGISTRY_USERNAME\", \"password\": \"$DOCKER_REGISTRY_PASSWORD\"}}}" \
        > /kaniko/.docker/config.json
      
      # 2. Build and push the Docker image
      /kaniko/executor \
        --context /workspace \
        --dockerfile /workspace/Dockerfile \
        --destination $DOCKER_REPO
    env:
      DOCKER_REGISTRY_USERNAME: "{{ secrets.docker_registry_username }}"
      DOCKER_REGISTRY_PASSWORD: "{{ secrets.docker_registry_password }}"
      DOCKER_REPO: "{{inputs.docker_repo}}"
    # mounts allow the pre task and the main task 
    # to share state. This is where we clone the 
    # code into
    mounts: 
      - type: volume
        target: /workspace
    # we use a pre task to clone the repo into 
    # the shared mount
    pre:
      - name: clone repository
        image: alpine/git:latest
        env:
          GIT_REPO_URL: "{{ inputs.git_repo_url }}"
        run: |
          set -e 
          cd /workspace
          git clone "$GIT_REPO_URL" /workspace
```

## Step 3: Submit the job

From another terminal window:

```bash
JOB_ID=$(curl -s -X POST --data-binary @hello.yaml \
  -H "Content-type: text/yaml" http://localhost:8000/jobs | jq -r .id)
```

Query for the status of the job:


```bash
curl -s http://localhost:8000/jobs/$JOB_ID | jq -r .state

COMPLETED
```