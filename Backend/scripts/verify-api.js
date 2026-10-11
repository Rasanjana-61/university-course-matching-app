// Check the deployed routes without posting announcements or changing user data.
export async function verifyApi(baseUrl) {
  const checks = [
    { path: "/health", validate: (body) => body.status === "ok" },
    { path: "/notifications", validate: (body) => body.success === true && Array.isArray(body.data) },
    { path: "/notifications/unread-count", validate: (body) => body.success === true && Number.isInteger(body.count) },
    { path: "/student-notifications/unread-count", validate: (body) => body.success === true && body.count === 0 },
    // An empty announcement must reach input validation, never create a record.
    { path: "/notifications", method: "POST", status: 400, validate: (body) => body.success === false && body.message === "Title and message are required." },
  ];

  let failed = false;
  for (const { path, method = "GET", status = 200, validate } of checks) {
    try {
      const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, {
        method,
        signal: AbortSignal.timeout(15000),
        ...(method === "POST" ? { headers: { "Content-Type": "application/json" }, body: "{}" } : {}),
      });
      const body = await response.json();
      if (response.status !== status || !validate(body)) {
        throw new Error(`HTTP ${response.status}: ${body.message || "Unexpected response"}`);
      }
      console.log(`PASS ${method} ${path}`);
    } catch (error) {
      failed = true;
      console.error(`FAIL ${method} ${path}: ${error.message}`);
    }
  }
  return !failed;
}

import { pathToFileURL } from "node:url";
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const passed = await verifyApi(process.argv[2] || "https://abc-self-psi.vercel.app/api");
  if (!passed) {
    console.error("The API is not ready. Deploy the current Backend source to the existing Vercel project and run this check again.");
    process.exitCode = 1;
  }
}
