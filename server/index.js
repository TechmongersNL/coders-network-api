const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fs = require("fs");
const marked = require("marked");
const hljs = require("highlight.js");
const toc = require("markdown-toc");

const { db } = require("./model");
const authRouter = require("./auth");
const developersRouter = require("./developers");
const postsRouter = require("./posts");

marked.setOptions({
  highlight: function(code, lang) {
    return hljs.highlight(lang, code).value;
  }
});

const app = express();

app.use(express.static(__dirname + "/../public"));
app.use(cors());
app.use(bodyParser());
app.use(cookieParser());

app.get("/", (req, res, next) => {
  fs.readFile(__dirname + "/../README.md", "utf8", (err, md) => {
    if (err) {
      next(err);
    } else {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta http-equiv="X-UA-Compatible" content="ie=edge" />
            <title>Codaisseur Coders Network</title>
            <link rel="stylesheet" type="text/css" href="/github-markdown.css" />
            <link rel="stylesheet" type="text/css" href="/syntax.css" />
            <link rel="stylesheet" type="text/css" href="/style.css" />
          </head>
          <body>
            <div class="toc markdown-body">
              ${marked(toc(md, { firsth1: false }).content)}
            </div>
            <div class="readme markdown-body">
              ${marked(md)}
            </div>
            <script>
            function api(endpoint, { method = "GET", body, jwt } = {}) {
              return fetch(
                api.url + endpoint,
                {
                  method: method,
                  headers: {
                    Authorization: "Bearer " + jwt,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(body)
                }
              )
                .then(response => Promise.all([response.status, response.json()]))
                .then(([status, data]) => {
                  if (status >= 400) {
                    throw { api_error: data };
                  } else {
                    return data;
                  }
                });
            }
            api.url = window.location.origin;
            </script>
          </body>
        </html>
      `);
    }
  });
});

app.get("/hello", (req, res) => {
  res.json({ message: "Hello world!" });
});

app.use(authRouter);
app.use(developersRouter);
app.use(postsRouter);

app.use((err, req, res, next) => {
  if (err && err.status) {
    res.status(err.status).json(err);
  } else {
    next(err);
  }
});

async function init() {
  const fixturize = process.env.NODE_ENV === "development";

  await db.sync({ force: fixturize });
  console.log("Database schema updated");
  if (fixturize) {
    const place_fixtures = require("./fixtures");
    place_fixtures();
  }

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
  });
}

init();
