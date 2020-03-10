const Sequelize = require("sequelize");
const { Router } = require("express");
const validate = require("express-validation");
const Joi = require("joi");

const mustBeAuthenticated = require("../auth/mustBeAuthenticated");
const { Comment, Developer, Post, Tag, PostLike } = require("../model");

const router = new Router();

function findPost(req, res, next) {
  Post.scope("full")
    .findByPk(req.params.id, {
      include: [Developer]
    })
    .then(post => {
      if (!post) {
        res.status(404).json({ error: "Post does not exist" });
      } else {
        req.post = post;
        next();
      }
    })
    .catch(next);
}

function mustBeMine(req, res, next) {
  if (req.user.id !== req.post.author_id) {
    res.status(401).json({ error: "Not allowed" });
  } else {
    next();
  }
}

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
    Post.create({ ...req.body, author_id: req.user.id })
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
router.get("/posts/:id", findPost, (req, res, next) => {
  res.json(req.post);
});

// READ (multiple)
router.get(
  "/posts",
  validate({
    query: {
      limit: Joi.number(),
      offset: Joi.number(),
      tag: Joi.string(),
      developer: Joi.number()
    }
  }),
  (req, res, next) => {
    const { limit = 10, offset = 0, author: author_id } = req.query;

    const where = author_id ? { author_id } : undefined;

    Post.scope("full")
      .findAndCountAll({
        limit,
        offset,
        where,
        order: [["createdAt", "DESC"]],
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
  validate({
    body: {
      title: Joi.string(),
      content: Joi.string()
    }
  }),
  mustBeAuthenticated,
  findPost,
  mustBeMine,
  (req, res, next) => {
    req.post
      .update(req.body)
      .then(post => {
        res.json(post);
      })
      .catch(next);
  }
);

// LIKE
router.post(
  "/posts/:id/likes",
  mustBeAuthenticated,
  findPost,
  (req, res, next) => {
    PostLike.upsert({
      developer_id: req.user.id,
      post_id: req.post.id
    })
      .then(() => {
        res.json({ ok: true });
      })
      .catch(next);
  }
);

// UNLIKE
router.delete(
  "/posts/:id/likes",
  mustBeAuthenticated,
  findPost,
  (req, res, next) => {
    PostLike.destroy({
      where: {
        developer_id: req.user.id,
        post_id: req.post.id
      }
    })
      .then(() => {
        res.json({ ok: true });
      })
      .catch(next);
  }
);

// CREATE COMMENT
router.post(
  "/posts/:id/comments",
  mustBeAuthenticated,
  findPost,
  validate({
    body: {
      text: Joi.string().required()
    }
  }),
  (req, res, next) => {
    Comment.create({
      post_id: req.post.id,
      developer_id: req.user.id,
      text: req.body.text
    })
      .then(({ id }) => Comment.findByPk(id))
      .then(comment => {
        if (!comment) {
          req.status(500).json({ error: "Unknown weird error!" });
        } else {
          res
            .status(201)
            .header("Location", `/posts/${req.post.id}/comments/${comment.id}`)
            .json(comment);
        }
      })
      .catch(next);
  }
);

// READ COMMENTS
router.get("/posts/:id/comments", findPost, (req, res, next) => {
  Comment.findAndCountAll({
    where: {
      post_id: req.post.id
    }
  })
    .then(comments => {
      res.json(comments);
    })
    .catch(next);
});

// DELETE
router.delete(
  "/posts/:id",
  mustBeAuthenticated,
  findPost,
  mustBeMine,
  (req, res, next) => {
    const id = req.post.id;
    req.post
      .destroy()
      .then(() => {
        res.json({ id });
      })
      .catch(next);
  }
);

module.exports = router;
