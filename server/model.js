const Sequelize = require("sequelize");

const db = new Sequelize(
  process.env.DATABASE_URL ||
    "postgres://postgres:secret@localhost:5432/postgres"
);

const Developer = db.define("developer", {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  intro: Sequelize.STRING,
  githubUsername: Sequelize.STRING,
  website: Sequelize.STRING
});

const Post = db.define("post", {
  content: {
    type: Sequelize.STRING,
    defaultValue: ""
  }
});

Developer.hasMany(Post, {
  foreignKey: "authorId"
});
Post.belongsTo(Developer, {
  foreignKey: "authorId"
});

const Tag = db.define("tag", {
  tag: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

Post.belongsToMany(Tag, { through: "post_tags" });
Tag.belongsToMany(Post, { through: "post_tags" });

const Technology = db.define("technology", {
  tag: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

Developer.belongsToMany(Technology, {
  through: "favorite_technologies"
});
Technology.belongsToMany(Developer, { through: "favorite_technologies" });

function init() {
  return db
    .sync({ force: process.env.NODE_ENV === "development" })
    .then(() => console.log("Database schema updated"))
    .catch(console.error);
}

module.exports = { init, Developer, Post, Tag, Technology };
