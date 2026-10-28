const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

let app;
let clientDir;

beforeAll(() => {
  // A tiny fake frontend build, so this test doesn't need `npm run build`.
  clientDir = fs.mkdtempSync(path.join(os.tmpdir(), "edushare-client-"));
  fs.writeFileSync(
    path.join(clientDir, "index.html"),
    "<!doctype html><title>EduShare</title>"
  );
  process.env.CLIENT_DIST_DIR = clientDir;

  // Load a fresh copy of the app so it picks up CLIENT_DIST_DIR.
  jest.isolateModules(() => {
    app = require("../server");
  });
});

afterAll(() => {
  delete process.env.CLIENT_DIST_DIR;
  fs.rmSync(clientDir, { recursive: true, force: true });
});

describe("serving the frontend build", () => {
  it("serves index.html at /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("<title>EduShare</title>");
  });

  it("falls back to index.html for client-side routes like /resources", async () => {
    const res = await request(app).get("/resources");
    expect(res.status).toBe(200);
    expect(res.text).toContain("<title>EduShare</title>");
  });

  it("keeps /health as the JSON health check", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("does not return the frontend for unknown API routes", async () => {
    const res = await request(app).get("/api/unknown");
    expect(res.status).toBe(404);
    expect(res.text).not.toContain("<title>EduShare</title>");
  });
});
