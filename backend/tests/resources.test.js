const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../server");
const Resource = require("../models/Resource");
const { SEED } = require("../seed/seed");

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create(); // temporary in-memory MongoDB
  await mongoose.connect(mongod.getUri());
  await Resource.init();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await Resource.deleteMany({});
  await Resource.insertMany(SEED);
});

const NEW = {
  title: "WAEC Physics Notes",
  subject: "Physics",
  description: "Notes on mechanics and electricity.",
  url: "https://example.org/physics",
  level: "secondary",
};

const idOf = async (title) => (await Resource.findOne({ title })).id;

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("GET /api/resources", () => {
  it("returns { resources } in the shape the frontend expects", async () => {
    const res = await request(app).get("/api/resources");
    expect(res.status).toBe(200);
    expect(Object.keys(res.body)).toEqual(["resources"]);
    expect(res.body.resources).toHaveLength(5);
    const r = res.body.resources[0];
    for (const key of ["id", "title", "description", "subject", "level", "language", "helpfulCount"]) {
      expect(r).toHaveProperty(key);
    }
    expect(typeof r.id).toBe("string");
    expect(r).not.toHaveProperty("_id");
    expect(r).not.toHaveProperty("flags");
  });

  it("sorts by helpfulCount, highest first", async () => {
    const { body } = await request(app).get("/api/resources");
    const counts = body.resources.map((r) => r.helpfulCount);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });

  it("filters by subject, level and both (case-insensitive)", async () => {
    const maths = await request(app).get("/api/resources?subject=mathematics");
    expect(maths.body.resources).toHaveLength(2);
    const primary = await request(app).get("/api/resources?level=Primary");
    expect(primary.body.resources.every((r) => r.level === "Primary")).toBe(true);
    const both = await request(app).get("/api/resources?subject=Mathematics&level=Primary");
    expect(both.body.resources.map((r) => r.title)).toEqual(["Bridge Algebra Notes"]);
  });

  it("searches title and subject", async () => {
    const { body } = await request(app).get("/api/resources?search=algebra");
    expect(body.resources.map((r) => r.title)).toEqual(["Bridge Algebra Notes"]);
  });

  it("treats regex characters and operator objects in queries as plain input", async () => {
    const regex = await request(app).get("/api/resources?search=(");
    expect(regex.status).toBe(200);
    expect(regex.body.resources).toEqual([]);
    const injected = await request(app).get("/api/resources?subject[$ne]=x");
    expect(injected.status).toBe(200);
    expect(injected.body.resources).toHaveLength(5);
  });
});

describe("POST /api/resources", () => {
  it("creates a resource with defaults and a normalised level", async () => {
    const res = await request(app).post("/api/resources").send(NEW);
    expect(res.status).toBe(201);
    expect(res.body.resource).toMatchObject({ title: NEW.title, level: "Secondary", language: "English", helpfulCount: 0 });
    expect(await Resource.countDocuments()).toBe(6);
  });

  it("rejects missing required fields with a message", async () => {
    const res = await request(app).post("/api/resources").send({ title: "Only a title" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it("rejects an invalid level and an invalid URL", async () => {
    const level = await request(app).post("/api/resources").send({ ...NEW, level: "Kindergarten" });
    expect(level.status).toBe(400);
    const url = await request(app).post("/api/resources").send({ ...NEW, url: "not-a-url" });
    expect(url.status).toBe(400);
  });
});

describe("POST /api/resources/:id/helpful", () => {
  it("increments the count, returns { resource } and persists it", async () => {
    const id = await idOf("Primary Science Quiz Sheets");
    const res = await request(app).post(`/api/resources/${id}/helpful`);
    expect(res.status).toBe(200);
    expect(res.body.resource.helpfulCount).toBe(7);
    expect((await Resource.findById(id)).helpfulCount).toBe(7);
  });

  it("returns 404 with { message } for unknown and malformed ids", async () => {
    const unknown = await request(app).post("/api/resources/64b7f0c2a1b2c3d4e5f60718/helpful");
    expect(unknown.status).toBe(404);
    expect(unknown.body).toEqual({ message: "Resource not found" });
    const malformed = await request(app).post("/api/resources/999/helpful");
    expect(malformed.status).toBe(404);
  });
});

describe("POST /api/resources/:id/flag", () => {
  it("hides a resource after 3 flags", async () => {
    const id = await idOf("Academic Writing Basics");
    for (let i = 0; i < 3; i++) await request(app).post(`/api/resources/${id}/flag`);
    const { body } = await request(app).get("/api/resources");
    expect(body.resources.map((r) => r.id)).not.toContain(id);
    expect(body.resources).toHaveLength(4);
  });
});
