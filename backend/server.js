require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./db");

const authRoutes = require("./routes/auth");
const tripsRoutes = require("./routes/trips");
const distanceRoutes = require("./routes/distance");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "milelog-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/distance", distanceRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error" });
});

app.listen(PORT, () => {
  console.log(`MileLog API running on port ${PORT}`);
});
