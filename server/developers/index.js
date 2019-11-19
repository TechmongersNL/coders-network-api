const { Router } = require("express");
const validate = require("express-validation");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const mustBeAuthenticated = require("../auth/mustBeAuthenticated");
const { Developer, Post, Technology } = require("../model");

const router = new Router();

function findDeveloper(req, res, next) {
  Developer.findByPk(req.params.id, {
    include: [
      // TODO: not trivial at all: include only top 5 posts
      Post
    ]
  })
    .then(developer => {
      if (!developer) {
        res.status(404).json({ error: "Developer does not exist" });
      } else {
        req.developer = developer;
        next();
      }
    })
    .catch(next);
}

function mustBeMe(req, res, next) {
  if (req.user.id !== req.developer.id) {
    res.status(401).json({ error: "Not allowed" });
  } else {
    next();
  }
}

// CREATE (see "/signup" endpoint in `/src/server/auth.js`)

// READ (single)
router.get("/developers/:id", findDeveloper, (req, res) => {
  res.json(req.developer);
});

// READ (multiple)
router.get(
  "/developers/",
  validate({
    query: {
      limit: Joi.number(),
      offset: Joi.number()
    }
  }),
  (req, res, next) => {
    const { limit = 10, offset = 0 } = req.query;

    Developer.findAndCountAll({
      limit,
      offset
    })
      .then(developers => {
        res.json(developers);
      })
      .catch(next);
  }
);

// UPDATE
router.put(
  "/developers/:id",
  mustBeAuthenticated,
  findDeveloper,
  mustBeMe,
  (req, res, next) => {
    req.developer
      .update(req.body)
      .then(developer => {
        res.json(developer);
      })
      .catch(next);
  }
);

// DELETE
router.delete(
  "/developers/:id",
  mustBeAuthenticated,
  findDeveloper,
  mustBeMe,
  (req, res, next) => {
    const id = req.developer.id;
    req.developer
      .destroy()
      .then(() => {
        res.json({ id });
      })
      .catch(next);
  }
);

module.exports = router;
