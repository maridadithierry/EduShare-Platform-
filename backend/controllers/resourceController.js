const repo = require("../repositories/resourceRepository");

// Same response shapes as before: { resources }, { resource }, { message }.
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(" ") });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get, search, filter and sort resources
const getResources = handle(async (req, res) => {
  const resources = await repo.list({
    search: req.query.search,
    subject: req.query.subject,
    level: req.query.level,
  });
  return res.json({ resources });
});

// Add a new resource
const addResource = handle(async (req, res) => {
  const { title, subject, description, url, level, language } = req.body || {};

  if (
    typeof title !== "string" || !title.trim() ||
    typeof subject !== "string" || !subject.trim() ||
    typeof description !== "string" || !description.trim() ||
    typeof url !== "string" || !url.trim()
  ) {
    return res.status(400).json({ message: "Title, subject, description, and URL are required." });
  }

  const resource = await repo.create({
    title, subject, description, url,
    ...(typeof level === "string" && level.trim() ? { level } : {}),
    ...(typeof language === "string" && language.trim() ? { language } : {}),
  });
  return res.status(201).json({ message: "Resource added successfully.", resource });
});

// Mark a resource as helpful
const markResourceHelpful = handle(async (req, res) => {
  const resource = await repo.markHelpful(req.params.id);
  if (!resource) return res.status(404).json({ message: "Resource not found" });
  return res.json({ resource });
});

// Flag a resource for moderation (hidden after 3 flags)
const flagResource = handle(async (req, res) => {
  const resource = await repo.flag(req.params.id);
  if (!resource) return res.status(404).json({ message: "Resource not found" });
  return res.json({ resource });
});

module.exports = { getResources, addResource, markResourceHelpful, flagResource };
