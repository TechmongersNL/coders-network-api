const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET || "n47863984nt893yn49cm8yg092384ygn92c3";

function toJWT(data) {
  return jwt.sign(data, secret, { expiresIn: "2h" });
}

function toData(token) {
  return jwt.verify(token, secret);
}

module.exports = { toJWT, toData };
