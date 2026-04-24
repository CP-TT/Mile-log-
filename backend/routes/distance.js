const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/estimate", (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: "Query params 'from' and 'to' are required" });
  }

  const fromLen = String(from).trim().length;
  const toLen = String(to).trim().length;
  const estimate = Math.max(1, Number(((fromLen + toLen) * 1.3).toFixed(1)));

  return res.json({
    from,
    to,
    estimatedDistanceMiles: estimate,
    note: "Stub estimate based on string length. Replace with a maps API in production.",
  });
});

module.exports = router;
