const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes");

const app = express();
app.use(cors());
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
