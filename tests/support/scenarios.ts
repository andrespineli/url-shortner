import type { buildTestApp } from "@tests/support/app.ts";
import { postJson } from "@tests/support/app.ts";

type TestApp = ReturnType<typeof buildTestApp>;

/** Shortens a URL through the API and returns its code. */
export async function shorten(testApp: TestApp, url: string): Promise<string> {
  const res = await testApp.app.request("/api/shorten", postJson({ url }));
  return (await res.json()).shortCode;
}

/** Follows a short link through the redirect endpoint. */
export async function visit(testApp: TestApp, code: string, referer?: string): Promise<void> {
  await testApp.app.request(`/${code}`, { headers: referer ? { referer } : {} });
}
