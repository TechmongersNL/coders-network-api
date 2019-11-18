const { Developer } = require("../model");

const { toData } = require("./jwt");

function authenticated(req, res, next) {
  const auth =
    req.headers.authorization && req.headers.authorization.split(" ");

  if (auth && auth[0] === "Bearer" && auth[1]) {
    try {
      const data = toData(auth[1]);
      Developer.findByPk(data.id)
        .then(developer => {
          if (!developer) {
            res.status(400).json({ error: "Developer does not exist" });
          } else {
            req.developer = developer;
            next();
          }
        })
        .catch(next);
    } catch (error) {
      res.status(400).send({
        error: `Error ${error.name}: ${error.message}`
      });
    }
  } else {
    res.status(401).send({
      error: "Please supply some valid credentials"
    });
  }
}

module.exports = authenticated;
