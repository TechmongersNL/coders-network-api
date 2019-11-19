const Sequelize = require("sequelize");
const { Router } = require("express");
const validate = require("express-validation");
const Joi = require("joi");

const mustBeAuthenticated = require("../auth/mustBeAuthenticated");
const { Developer, Post, Tag, Technology } = require("../model");

const router = new Router();

// CREATE
router.post(
  "/posts",
  mustBeAuthenticated,
  validate({
    body: {
      title: Joi.string().required(),
      content: Joi.string().required()
    }
  }),
  (req, res, next) => {
    Post.create({ ...req.body, authorId: req.user.id })
      .then(({ id }) => {
        return Post.scope("full").findByPk(id, {
          include: [Developer]
        });
      })
      .then(post => {
        if (!post) {
          req.status(500).json({ error: "Unknown weird error!" });
        } else {
          res
            .status(201)
            .header("Location", `/posts/${post.id}`)
            .json(post);
        }
      })
      .catch(next);
  }
);

// READ (single)
router.get("/posts/:id", (req, res, next) => {
  Post.scope("full")
    .findByPk(req.params.id, {
      include: [Developer]
    })
    .then(post => {
      if (!post) {
        res.status(404).json({ error: "Post does not exist" });
      } else {
        res.json(post);
      }
    })
    .catch(next);
});

// READ (multiple)
router.get(
  "/posts",
  validate({
    query: {
      limit: Joi.number(),
      offset: Joi.number(),
      tag: Joi.string()
    }
  }),
  (req, res, next) => {
    const { limit = 10, offset = 0 } = req.query;

    Post.scope("full")
      .findAndCountAll({
        limit,
        offset,
        // TODO: this is actually duplicated a bit with the schema..
        include: [
          req.query.tag
            ? {
                model: Tag,
                where: {
                  tag: { [Sequelize.Op.in]: [req.query.tag] }
                },
                through: {
                  attributes: []
                }
              }
            : undefined
        ].filter(Boolean)
      })
      .then(posts => {
        res.json(posts);
      })
      .catch(next);
  }
);

// UPDATE
router.put(
  "/posts/:id",
  mustBeAuthenticated,
  validate({
    body: {
      title: Joi.string(),
      content: Joi.string()
    }
  }),
  (req, res, next) => {
    Post.scope("full")
      .findByPk(req.params.id)
      .then(post => {
        if (!post) {
          res.status(404).json({ error: "Post does not exist" });
        } else if (post.authorId !== req.user.id) {
          res
            .status(401)
            .json({ error: "You're not allowed to edit someone else's post" });
        }

        return post.update(req.body);
      })
      .then(post => {
        res.json(post);
      })
      .catch(next);
  }
);

// DELETE
router.delete("/posts/:id", mustBeAuthenticated, (req, res, next) => {
  Post.findByPk(req.params.id)
    .then(post => {
      if (!post) {
        res.status(404).json({ error: "Post does not exist" });
      } else if (post.authorId !== req.user.id) {
        res
          .status(401)
          .json({ error: "You're not allowed to delete someone else's post" });
      }

      return post.destroy().then(() => post.id);
    })
    .then(id => {
      res.json({ id });
    })
    .catch(next);
});

module.exports = router;
