const express = require("express");
const router = express.Router();

const {
  getResources,
  addResource,
  markResourceHelpful,
  flagResource
} = require("../controllers/resourceController");

router.get("/", getResources);
router.post("/", addResource);
router.post("/:id/helpful", markResourceHelpful);
router.post("/:id/flag", flagResource);

module.exports = router;
