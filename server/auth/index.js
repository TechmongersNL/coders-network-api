const { Router } = require("express");

const mustBeAuthenticated = require("./mustBeAuthenticated");

const router = new Router();

router.get("/me", mustBeAuthenticated, (req, res) => {
  res.json(req.user);
});

module.exports = router;
