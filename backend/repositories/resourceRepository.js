// All database queries live here, so controllers never touch Mongoose directly.
const Resource = require("../models/Resource");

const FLAG_HIDE_THRESHOLD = 3; // resources flagged this many times are hidden
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Query params can arrive as arrays/objects (?subject[$ne]=x): accept strings only.
const asString = (v) => (typeof v === "string" ? v.trim() : "");
const exactCI = (v) => new RegExp(`^${escapeRegex(v)}$`, "i");

async function list({ search, subject, level } = {}) {
  const filter = { flags: { $lt: FLAG_HIDE_THRESHOLD } };
  const s = asString(search), sub = asString(subject), lvl = asString(level);
  if (sub) filter.subject = exactCI(sub);
  if (lvl) filter.level = exactCI(lvl);
  if (s) {
    const rx = new RegExp(escapeRegex(s), "i");
    filter.$or = [{ title: rx }, { subject: rx }];
  }
  return Resource.find(filter).sort({ helpfulCount: -1, _id: -1 });
}

async function create(data) {
  return Resource.create(data); // schema validation runs here
}

async function markHelpful(id) {
  if (!OBJECT_ID.test(id)) return null;
  return Resource.findByIdAndUpdate(id, { $inc: { helpfulCount: 1 } }, { new: true });
}

async function flag(id) {
  if (!OBJECT_ID.test(id)) return null;
  return Resource.findByIdAndUpdate(id, { $inc: { flags: 1 } }, { new: true });
}

module.exports = { list, create, markHelpful, flag, FLAG_HIDE_THRESHOLD };
