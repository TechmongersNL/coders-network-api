const fetch = require("node-fetch");

const { Developer } = require("../model");

const OKTA_ISSUER = "https://dev-840259.okta.com/oauth2/default";
const OKTA_CLIENT_ID = "0oa70sttvRIvjudz35d5";

async function mustBeAuthenticated(req, res, next) {
  const auth =
    req.headers.authorization && req.headers.authorization.split(" ");

  if (auth && (auth[0] + "").toLowerCase() === "bearer" && auth[1]) {
    try {
      // Yeah, this is not beautiful.
      // I just hacked it together JIT for the workshop
      const response = await fetch(
        `${OKTA_ISSUER}/v1/introspect?client_id=${OKTA_CLIENT_ID}&token=${auth[1]}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const jwt = await response.json();
      console.log(jwt);
      if (!jwt || !jwt.active) {
        res.status(400).send({
          error: `Token not valid`,
        });
        return;
      }
      // for example:
      //
      // { active: false }
      //
      // OR
      //
      // {
      //   active: true,
      //   scope: 'openid profile email',
      //   username: 'kelley@codaisseur.com',
      //   exp: 1603915869,
      //   iat: 1603912269,
      //   sub: 'kelley@codaisseur.com',
      //   aud: 'https://dev-840259.okta.com',
      //   iss: 'https://dev-840259.okta.com',
      //   jti: 'AT.9g5YkhRkbOHNLVVJCCt0QdCO3bZslCdfZ2BF1p1IP-Y',
      //   token_type: 'Bearer',
      //   client_id: '0oa70sttvRIvjudz35d5',
      //   uid: '00u70hp4Adne8O4yK5d5'
      // }

      let developer = await Developer.findOne({
        where: {
          email: jwt.username,
        },
      });

      if (!developer) {
        developer = await Developer.create({
          email: jwt.username,
          name: "New User",
        });
      }

      req.user = developer;
      next();
    } catch (error) {
      res.status(400).send({
        error: `Error ${error.name}: ${error.message}`,
      });
    }
  } else {
    res.status(401).send({
      error: "Please supply some valid credentials",
    });
  }
}

module.exports = mustBeAuthenticated;
