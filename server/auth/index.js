const { Router } = require("express");
const validate = require("express-validation");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const { Developer } = require("../model");

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
  async (req, res, next) => {
    try {
      const developer = await Developer.create({
        email: req.body.email,
        name: req.body.name,
        password: bcrypt.hashSync(req.body.password, 10)
      });
      res.json(developer);
    } catch (e) {
      if (e.name === "SequelizeUniqueConstraintError") {
        res
          .status(400)
          .json({ error: "Developer with this email already exists" });
      } else {
        next(e);
      }
    }
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
  async (req, res, next) => {
    try {
      const developer = await Developer.findOne({
        where: {
          email: req.body.email
        }
      });

      if (!developer) {
        res.status(400).send({
          error: "Developer with this email does not exist"
        });
      } else if (!bcrypt.compareSync(req.body.password, developer.password)) {
        res.status(400).send({
          error: "Password incorrect"
        });
      } else {
        res.json({
          jwt: toJWT({ id: developer.id })
        });
      }
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
