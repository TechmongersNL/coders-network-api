const bcrypt = require("bcrypt");
const moment = require("moment");
const { stripIndent } = require("common-tags");
const {
  PostLike,
  Comment,
  Developer,
  Post,
  Tag,
  Technology
} = require("./model");

module.exports = async function() {
  let date = moment();

  const [kelley, rein, matias] = await Promise.all(
    [
      {
        name: "Kelley",
        email: "kelley@codaisseur.com",
        password: bcrypt.hashSync("abcd", 10),
        intro: `Hi there! I'm Kelley, teacher of JavaScript, student of life`,
        github_username: "kelleyvanevert",
        website: "https://hi-im-kelley.netlify.com/"
      },
      {
        name: "Rein",
        email: "rein@codaisseur.com",
        password: bcrypt.hashSync("abcd", 10),
        github_username: "Reinoptland"
      },
      {
        name: "Matias",
        email: "matias@codaisseur.com",
        password: bcrypt.hashSync("abcd", 10),
        intro: `Hi! I'm Matias, teacher of Codaisseur, from Uruguay!`,
        github_username: "matiagarcia91"
      }
    ].map(d => Developer.create(d))
  );

  const technologies = Object.fromEntries(
    (
      await Technology.bulkCreate(
        [
          "JavaScript",
          "TypeScript",
          "Docker",
          "Functional Programming",
          "Promise.all",
          "Learning strategies"
        ].map(title => {
          return { title };
        })
      )
    ).map(entity => [entity.title, entity.id])
  );

  const tags = Object.fromEntries(
    (
      await Tag.bulkCreate(
        [
          "github",
          "bundling",
          "react",
          "hooks",
          "tech",
          "useMemo",
          "useRef",
          "sequelize"
        ].map(tag => {
          return { tag };
        })
      )
    ).map(entity => [entity.tag, entity.id])
  );

  const onGitHub = await Post.create({
    author_id: rein.id,
    createdAt: date.toDate(),
    updatedAt: date.toDate(),
    title: "Clean up your GitHub profile!",
    content: stripIndent`
          Cleaning up your GitHub profile, and writing good commit messages, can show your future employees that you're a good team player!
        `
  });

  date.subtract(1, "day");

  const onEquality = await Post.create({
    author_id: kelley.id,
    createdAt: date.toDate(),
    updatedAt: date.toDate(),
    title: "A helper hook to remember values by deep equality",
    content: stripIndent`
          So of course every React hook enthusiast will have had a use-case for a deep (structural) equality check on the dependencies argument, at a certain point in time. Instead of crafting these things every time you need them, or importing a helper library, here's a wonderfully simple helper hook to help you out:

          \`\`\`ts
          import { useRef } from "react";
          import isEqual from "react-fast-compare";

          export default function remember<T>(value: T): T {
            const ref = useRef<T>(value);
            if (!isEqual(value, ref.current)) {
              ref.current = value;
            }
            return ref.current;
          }
          \`\`\`

          You can use it like this:

          \`\`\`ts
          const something = useMemo(expensiveComputation, [ remember(input) ]);
          \`\`\`

          Isn't that just lovely? :D
        `
  });

  date.subtract(4, "days");

  const sequelizeOneToOneRelationships = await Post.create({
    author_id: rein.id,
    createdAt: date.toDate(),
    updatedAt: date.toDate(),
    title: "Sequelize One-To-One relationships",
    content: stripIndent`
      ## Philosophy

      Before digging into the aspects of using Sequelize, it is useful to take a step back to consider what happens with a One-To-One relationship.

      Let's say we have two models, \`Foo\` and \`Bar\`. We want to establish a One-To-One relationship between Foo and Bar. We know that in a relational database, this will be done by establishing a foreign key in one of the tables. So in this case, a very relevant question is: in which table do we want this foreign key to be? In other words, do we want \`Foo\` to have a \`barId\` column, or should \`Bar\` have a \`fooId\` column instead?

      In principle, both options are a valid way to establish a One-To-One relationship between Foo and Bar. However, when we say something like "there is a One-To-One relationship between Foo and Bar", it is unclear whether or not the relationship is mandatory or optional. In other words, can a Foo exist without a Bar? Can a Bar exist without a Foo? The answers to these questions helps figuring out where we want the foreign key column to be.

      ## Goal
  
      For the rest of this example, let's assume that we have two models, \`Foo\` and \`Bar\`. We want to setup a One-To-One relationship between them such that \`Bar\` gets a \`fooId\` column.

      ## Implementation

      The main setup to achieve the goal is as follows:

      \`\`\`
      Foo.hasOne(Bar);
      Bar.belongsTo(Foo);
      \`\`\`

      Since no option was passed, Sequelize will infer what to do from the names of the models. In this case, Sequelize knows that a fooId column must be added to Bar.

      This way, calling \`Bar.sync()\` after the above will yield the following SQL (on PostgreSQL, for example):

      \`\`\`
      CREATE TABLE IF NOT EXISTS "foos" (
        /* ... */
      );
      CREATE TABLE IF NOT EXISTS "bars" (
        /* ... */
        "fooId" INTEGER REFERENCES "foos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
        /* ... */
      );
      \`\`\`
    `
  });

  date.subtract(3, "days");

  const onRerendering = await Post.create({
    author_id: kelley.id,
    createdAt: date.toDate(),
    updatedAt: date.toDate(),
    title: "Do components rerender if nested in a useMemo render? (yes)",
    content: stripIndent`
          **Yes, they do (of course).**

          But for some reason, I just hadn't thought of it before (either way), and it made me wonder for a bit yesterday. Conclusion: yes, the virtual dom tree is memoized, but only up to contained component instance references, which will then handle their (re)rendering on their own terms. Another way to think of it: memoization of some virtual dom tree structure doesn't mean that it's excluded from the diffing algorithm, it only means that it's not recomputed (entirely).

          Here's a small doodle to explore:

          [https://xopgm.csb.app/](https://xopgm.csb.app/)
        `
  });

  date.subtract(2, "days");

  const parcelGettingStarted = await Post.create({
    author_id: kelley.id,
    createdAt: date.toDate(),
    updatedAt: date.toDate(),
    title: "Parcel - Getting started",
    content: stripIndent`
      Parcel is a web application bundler, differentiated by its developer experience. It offers blazing fast performance utilizing multicore processing, and requires zero configuration.

      First install Parcel using Yarn or npm:

      Yarn:

      \`\`\`bash
      yarn global add parcel-bundler
      \`\`\`

      npm:

      \`\`\`bash
      npm install -g parcel-bundler
      \`\`\`

      Create a package.json file in your project directory using:

      \`\`\`bash
      yarn init -y
      \`\`\`

      or

      \`\`\`bash
      npm init -y
      \`\`\`

      Parcel can take any type of file as an entry point, but an HTML or JavaScript file is a good place to start. If you link your main JavaScript file in the HTML using a relative path, Parcel will also process it for you, and replace the reference with a URL to the output file.

      Next, create an index.html and index.js file.

      \`\`\`html
      <html>
      <body>
        <script src="./index.js"></script>
      </body>
      </html>
      \`\`\`
      NB: Parcel converts JS assets to ES5, which won't run in in the context of a \`<script type="module">\` tag, so just use plain \`<script>\` tags with no \`type\` attribute in your source HTML.

      \`\`\`javascript
      console.log('hello world')
      \`\`\`

      Parcel has a development server built in, which will automatically rebuild your app as you change files and supports [hot module replacement](hmr.html) for fast development. Point it at your entry file:

      \`\`\`bash
      parcel index.html
      \`\`\`

      Now open http://localhost:1234/ in your browser. If hot module replacement isn't working you may need to [configure your editor](hmr.html#safe-write). You can also override the default port with the \`-p <port number>\` option.

      Use the development server when you don't have your own server, or your app is entirely client rendered. If you do have your own server, you can run Parcel in \`watch\` mode instead. This still automatically rebuilds as files change and supports hot module replacement, but doesn't start a web server.

      \`\`\`bash
      parcel watch index.html
      \`\`\`

      You can also use [createapp.dev](https://createapp.dev/parcel) to create a Parcel project in the browser. Select the features you need such as React, Vue, Typescript and CSS, and you will see the project being generated in real-time. You can use this tool for learning how to set up a new project and you can also download the project as a ZIP-file and get started coding instantly.

      ## Multiple entry files

      In case you have more than one entry file, let's say \`index.html\` and \`about.html\`, you have 2 ways to run the bundler:

      Specifying the file names:

      \`\`\`bash
      parcel index.html about.html
      \`\`\`
    `
  });

  date.subtract(2, "days");

  const onJavaScript = await Post.create({
    author_id: kelley.id,
    createdAt: date.toDate(),
    updatedAt: date.toDate(),
    title: "JavaScript",
    content: stripIndent`
      JavaScript (/ˈdʒɑːvəˌskrɪpt/),[6] often abbreviated as JS, is a programming language that conforms to the ECMAScript specification.[7] JavaScript is high-level, often just-in-time compiled, and multi-paradigm. It has curly-bracket syntax, dynamic typing, prototype-based object-orientation, and first-class functions.

      Alongside HTML and CSS, JavaScript is one of the core technologies of the World Wide Web.[8] JavaScript enables interactive web pages and is an essential part of web applications. The vast majority of websites use it for client-side page behavior,[9] and all major web browsers have a dedicated JavaScript engine to execute it.

      As a multi-paradigm language, JavaScript supports event-driven, functional, and imperative programming styles. It has application programming interfaces (APIs) for working with text, dates, regular expressions, standard data structures, and the Document Object Model (DOM). However, the language itself does not include any input/output (I/O), such as networking, storage, or graphics facilities, as the host environment (usually a web browser) provides those APIs.

      Originally used only in web browsers, JavaScript engines are also now embedded in server-side website deployments and non-browser applications.

      Although there are similarities between JavaScript and Java, including language name, syntax, and respective standard libraries, the two languages are distinct and differ greatly in design.
    `
  });

  date.subtract(2, "days");

  const onJSON = await Post.create({
    author_id: kelley.id,
    createdAt: date.toDate(),
    updatedAt: date.toDate(),
    title: "JSON",
    content: stripIndent`
      JavaScript Object Notation (JSON, pronounced /ˈdʒeɪsən/; also /ˈdʒeɪˌsɒn/[note 1]) is an open standard file format, and data interchange format, that uses human-readable text to store and transmit data objects consisting of attribute–value pairs and array data types (or any other serializable value). It is a very common data format, with a diverse range of applications, such as serving as replacement for XML in AJAX systems.[6]

      JSON is a language-independent data format. It was derived from JavaScript, but many modern programming languages include code to generate and parse JSON-format data. The official Internet media type for JSON is application/json. JSON filenames use the extension .json.

      Douglas Crockford originally specified the JSON format in the early 2000s. JSON was first standardized in 2013, as ECMA-404.[7] RFC 8259, published in 2017, is the current version of the Internet Standard STD 90, and it remains consistent with ECMA-404.[8] That same year, JSON was also standardized as ISO/IEC 21778:2017.[1] The ECMA and ISO standards describe only the allowed syntax, whereas the RFC covers some security and interoperability considerations.[9]
    `
  });

  date.subtract(2, "days");

  const onRefsAndDom = await Post.create({
    author_id: kelley.id,
    createdAt: date.toDate(),
    updatedAt: date.toDate(),
    title: "Refs and the DOM",
    content: stripIndent`
      Refs provide a way to access DOM nodes or React elements created in the render method.

      In the typical React dataflow, props are the only way that parent components interact with their children. To modify a child, you re-render it with new props. However, there are a few cases where you need to imperatively modify a child outside of the typical dataflow. The child to be modified could be an instance of a React component, or it could be a DOM element. For both of these cases, React provides an escape hatch.

      ## When to Use Refs

      There are a few good use cases for refs:

      - Managing focus, text selection, or media playback.
      - Triggering imperative animations.
      - Integrating with third-party DOM libraries.
      
      Avoid using refs for anything that can be done declaratively.

      For example, instead of exposing open() and close() methods on a Dialog component, pass an isOpen prop to it.

      ## Don’t Overuse Refs

      Your first inclination may be to use refs to “make things happen” in your app. If this is the case, take a moment and think more critically about where state should be owned in the component hierarchy. Often, it becomes clear that the proper place to “own” that state is at a higher level in the hierarchy. See the Lifting State Up guide for examples of this.
    `
  });

  await sequelizeOneToOneRelationships.addTags([tags.sequelize]);
  await onEquality.addTags([tags.react, tags.hooks]);
  await onRerendering.addTags([tags.react, tags.hooks, tags.useMemo]);
  await onGitHub.addTags([tags.github]);
  await parcelGettingStarted.addTags([tags.bundling]);
  await onJavaScript.addTags([tags.tech]);
  await onJSON.addTags([tags.tech]);
  await onRefsAndDom.addTags([tags.react, tags.hooks]);

  await kelley.addTechnologies([
    technologies.JavaScript,
    technologies.TypeScript,
    technologies["Promise.all"]
  ]);

  await rein.addTechnologies([
    technologies.JavaScript,
    technologies["Learning strategies"]
  ]);

  await PostLike.bulkCreate([
    { post_id: onRerendering.id, developer_id: rein.id },
    { post_id: onGitHub.id, developer_id: kelley.id },
    { post_id: onGitHub.id, developer_id: rein.id }
  ]);

  await Comment.bulkCreate([
    { post_id: onEquality.id, developer_id: rein.id, text: "Lovely!" },
    { post_id: onEquality.id, developer_id: kelley.id, text: "Thanks!" }
  ]);

  console.log("Fixtures in place");
};
