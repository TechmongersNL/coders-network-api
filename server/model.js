const Sequelize = require("sequelize");

const db = new Sequelize(
  process.env.DATABASE_URL ||
    "postgres://postgres:secret@localhost:5432/postgres"
);

const PostTag = db.define(
  "post_tag",
  {
    post_id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    tag_id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    }
  },
  {
    timestamps: false,
    underscored: true
  }
);

const Tag = db.define(
  "tag",
  {
    tag: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    timestamps: false,
    underscored: true
  }
);

const Post = db.define(
  "post",
  {
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT,
      defaultValue: ""
    }
  },
  {
    underscored: true,
    defaultScope: {
      include: [
        {
          model: Tag,
          through: { attributes: [] }
        }
      ],
      attributes: {
        exclude: ["content"]
      }
    },
    scopes: {
      full: {
        include: [
          {
            model: Tag,
            through: { attributes: [] }
          }
        ],
        attributes: {
          include: ["content"]
        }
      }
    }
  }
);

const Technology = db.define(
  "technology",
  {
    title: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    underscored: true,
    timestamps: false
  }
);

const Developer = db.define(
  "developer",
  {
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
    intro: Sequelize.TEXT,
    github_username: Sequelize.STRING,
    website: Sequelize.STRING
  },
  {
    underscored: true,
    defaultScope: {
      include: [
        {
          model: Technology,
          through: { attributes: [] }
        }
      ],
      attributes: { exclude: ["password", "updatedAt"] }
    }
  }
);

Developer.hasMany(Post, {
  foreignKey: "authorId"
});
Post.belongsTo(Developer, {
  foreignKey: "authorId"
});

Post.belongsToMany(Tag, { through: PostTag, foreignKey: "post_id" });
Tag.belongsToMany(Post, { through: PostTag, foreignKey: "tag_id" });

Developer.belongsToMany(Technology, {
  through: "favorite_technologies"
});
Technology.belongsToMany(Developer, { through: "favorite_technologies" });

module.exports = { db, Developer, Post, Tag, PostTag, Technology };
