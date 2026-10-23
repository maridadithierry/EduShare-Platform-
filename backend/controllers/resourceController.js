
const resources = require("../data/resources");

// Get, search, filter, and sort resources
const getResources = (req, res) => {
  const search = (req.query.search || "").toLowerCase();
  const { subject, level } = req.query;

  const filteredResources = resources
    .filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(search) ||
        resource.subject.toLowerCase().includes(search);

      const matchesSubject = !subject || resource.subject === subject;
      const matchesLevel = !level || resource.level === level;

      return matchesSearch && matchesSubject && matchesLevel;
    })
    .sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));

  return res.json({ resources: filteredResources });
};

// Add a new resource
const addResource = (req, res) => {
  const { title, subject, description, url, level, language } = req.body;

  if (
    typeof title !== "string" || !title.trim() ||
    typeof subject !== "string" || !subject.trim() ||
    typeof description !== "string" || !description.trim() ||
    typeof url !== "string" || !url.trim()
  ) {
    return res.status(400).json({
      message: "Title, subject, description, and URL are required."
    });
  }

  const newResource = {
    id: Math.max(0, ...resources.map((r) => r.id)) + 1,
    title: title.trim(),
    subject: subject.trim(),
    description: description.trim(),
    url: url.trim(),
    level: typeof level === "string" && level.trim() ? level.trim() : "Secondary",
    language: typeof language === "string" && language.trim() ? language.trim() : "English",
    helpfulCount: 0
  };

  resources.push(newResource);

  return res.status(201).json({
    message: "Resource added successfully.",
    resource: newResource
  });
};

// Mark a resource as helpful
const markResourceHelpful = (req, res) => {
  const resourceId = Number(req.params.id);
  const target = resources.find((resource) => resource.id === resourceId);

  if (!target) {
    return res.status(404).json({ message: "Resource not found" });
  }

  target.helpfulCount = (target.helpfulCount || 0) + 1;

  return res.json({ resource: target });
};

module.exports = {
  getResources,
  addResource,
  markResourceHelpful
};
