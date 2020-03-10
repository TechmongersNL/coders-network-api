const Sequelize = require("sequelize");

const db = new Sequelize(
  process.env.DATABASE_URL ||
    "postgres://postgres:secret@localhost:5555/postgres"
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

const PostLike = db.define(
  "post_like",
  {
    developer_id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    post_id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    }
  },
  {
    underscored: true,
    defaultScope: {
      attributes: {
        exclude: ["post_id", "developer_id"]
      }
    }
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
    },
    scopes: {
      slim: {
        attributes: {
          include: ["id", "name", "email"]
        }
      }
    }
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
        },
        {
          model: PostLike,
          include: [
            {
              model: Developer.scope("slim"),
              attributes: ["id", "name", "email"]
            }
          ]
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
          },
          {
            model: PostLike,
            include: [
              {
                model: Developer.scope("slim"),
                attributes: ["id", "name", "email"]
              }
            ]
          }
        ],
        attributes: {
          include: ["content"]
        }
      }
    }
  }
);

const Comment = db.define(
  "comment",
  {
    text: {
      type: Sequelize.TEXT,
      defaultValue: ""
    }
  },
  {
    underscored: true,
    defaultScope: {
      include: [
        {
          model: Developer.scope("slim"),
          attributes: ["id", "name", "email"]
        }
      ],
      attributes: {
        exclude: ["developer_id", "post_id"]
      }
    }
  }
);

Developer.hasMany(Post, {
  foreignKey: "author_id"
});
Post.belongsTo(Developer, {
  foreignKey: "author_id"
});

Post.belongsToMany(Tag, { through: PostTag, foreignKey: "post_id" });
Tag.belongsToMany(Post, { through: PostTag, foreignKey: "tag_id" });

Post.hasMany(PostLike, {
  foreignKey: "post_id"
});
PostLike.belongsTo(Post, {
  foreignKey: "post_id"
});
PostLike.belongsTo(Developer, {
  foreignKey: "developer_id"
});

Post.hasMany(Comment, {
  foreignKey: "post_id"
});
Comment.belongsTo(Developer, {
  foreignKey: "developer_id"
});
Comment.belongsTo(Post, {
  foreignKey: "post_id"
});

Developer.belongsToMany(Technology, {
  through: "favorite_technologies"
});
Technology.belongsToMany(Developer, { through: "favorite_technologies" });

module.exports = {
  db,
  Developer,
  PostLike,
  Comment,
  Post,
  Tag,
  PostTag,
  Technology
};
