const router = require("express").Router();
const fetch = require("node-fetch");

async function proxy(req, res) {
  const query = new URLSearchParams(req.query).toString();
  const url = `https://api.coingecko.com/api/v3${req.path}?${query}`;
  try {
    const apiRes = await fetch(url);
    const data = await apiRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

router.get("/exchanges", proxy);
router.get("/asset_platforms", proxy);
router.get("/coins/markets", proxy);
module.exports = router;
