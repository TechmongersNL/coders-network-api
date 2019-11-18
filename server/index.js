const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const { init } = require("./model");
const authRouter = require("./auth");
const developersRouter = require("./developers");
const authenticated = require("./auth/authenticated");

const app = express();

app.use(bodyParser());
app.use(cookieParser());

app.get("/hello", (req, res) => {
  res.send("Hello World!");
});

app.get("/authenticated", authenticated, (req, res) => {
  res.send("Yes");
});

app.use(authRouter);
app.use(developersRouter);

app.use((err, req, res, next) => {
  if (err && err.status) {
    res.status(err.status).json(err);
  } else {
    next(err);
  }
});

init().then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
  });
});
