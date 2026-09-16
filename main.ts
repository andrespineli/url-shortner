import { createApp } from "@/app.ts";
import { loadConfig } from "@/config.ts";
import { buildDependencies } from "@/dependencies.ts";

const config = loadConfig();
const app = createApp(buildDependencies(config), { log: true });

Deno.serve({ port: config.port }, app.fetch);
