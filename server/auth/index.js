const { Router } = require("express");
const validate = require("express-validation");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const { Developer } = require("../model");
const mustBeAuthenticated = require("./mustBeAuthenticated");

const { toJWT } = require("./jwt");

const router = new Router();

router.post(
  "/signup",
  validate({
    body: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string().required(),
      name: Joi.string().required()
    }
  }),
  (req, res, next) => {
    Developer.create({
      email: req.body.email,
      name: req.body.name,
      password: bcrypt.hashSync(req.body.password, 10)
    })
      .then(({ id }) => {
        res
          .status(201)
          .header("Location", `/developers/${id}`)
          .json({
            jwt: toJWT({ id })
          });
      })
      .catch(e => {
        if (e.name === "SequelizeUniqueConstraintError") {
          res
            .status(400)
            .json({ error: "Developer with this email already exists" });
        } else {
          throw e;
        }
      })
      .catch(next);
  }
);

router.post(
  "/login",
  validate({
    body: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  }),
  (req, res, next) => {
    Developer.unscoped()
      .findOne({
        where: {
          email: req.body.email
        }
      })
      .then(developer => {
        if (!developer) {
          res.status(400).send({
            error: "Developer with this email does not exist"
          });
        } else if (!bcrypt.compareSync(req.body.password, developer.password)) {
          res.status(401).send({
            error: "Password incorrect"
          });
        } else {
          res.json({
            jwt: toJWT({ id: developer.id })
          });
        }
      })
      .catch(next);
  }
);

router.get("/me", mustBeAuthenticated, (req, res) => {
  res.json(req.user);
});

module.exports = router;
