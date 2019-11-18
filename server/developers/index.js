const { Router } = require("express");
const validate = require("express-validation");
const Joi = require("joi");

const { Developer, Post, Technology } = require("../model");

const router = new Router();

router.get(
  "/developers/:id",
  validate({
    params: {
      id: Joi.number()
    }
  }),
  (req, res, next) => {
    Developer.findByPk(req.params.id, { include: [Post, Technology] })
      .then(developer => {
        if (!developer) {
          res.status(400).json({ error: "Developer does not exist" });
        } else {
          res.json(developer);
        }
      })
      .catch(next);
  }
);

module.exports = router;
