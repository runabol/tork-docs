// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Tork Docs",
      logo: {
        light: "./src/assets/light-logo.svg",
        dark: "./src/assets/dark-logo.svg",
        replacesTitle: true,
      },
      customCss: ["./src/styles/global.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/runabol/tork",
        },
      ],
      sidebar: [
        {
          label: "Introduction",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Getting started", slug: "introduction/getting-started" },
            { label: "Quick start", slug: "introduction/quick-start" },
            { label: "Installation", slug: "introduction/installation" },
            { label: "Configuration", slug: "introduction/configuration" },
            { label: "Architecture", slug: "introduction/architecture" },
            { label: "Web UI", slug: "introduction/web-ui" },
          ],
        },
        {
          label: "Core Concepts",
          items: [
            { label: "Jobs", slug: "core-concepts/jobs" },
            { label: "Tasks", slug: "core-concepts/tasks" },
          ],
        },
        {
          label: "Tutorials",
          items: [
            { label: "Video Transcoding", slug: "tutorials/video-transcoding" },
            { label: "Resizing Images", slug: "tutorials/resizing-images" },
            { label: "CI", slug: "tutorials/ci" },
          ],
        },
        {
          label: "Extending Tork",
          items: [
            { label: "Intro", slug: "extend/intro" },
            { label: "Datastore", slug: "extend/datastore" },
            { label: "Broker", slug: "extend/broker" },
            { label: "Runtime", slug: "extend/runtime" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: "0.0.0.0",
      port: 4321,
    },
  },
  markdown: {
    shikiConfig: {
      theme: "aurora-x",
    },
  },
});
