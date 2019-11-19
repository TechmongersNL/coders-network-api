const bcrypt = require("bcrypt");
const { stripIndent } = require("common-tags");
const { PostLike, Developer, Post, Tag, Technology } = require("./model");

module.exports = async function() {
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
        ["github", "react", "hooks", "useMemo", "useRef"].map(tag => {
          return { tag };
        })
      )
    ).map(entity => [entity.tag, entity.id])
  );

  const [onEquality, onGitHub, onRerendering] = await Promise.all(
    [
      {
        author_id: kelley.id,
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
      },
      {
        author_id: rein.id,
        title: "Clean up your GitHub profile!",
        content: stripIndent`
          Cleaning up your GitHub profile, and writing good commit messages, can show your future employees that you're a good team player!
        `
      },
      {
        author_id: kelley.id,
        title: "Do components rerender if nested in a useMemo render? (yes)",
        content: stripIndent`
          **Yes, they do (of course).**

          But for some reason, I just hadn't thought of it before (either way), and it made me wonder for a bit yesterday. Conclusion: yes, the virtual dom tree is memoized, but only up to contained component instance references, which will then handle their (re)rendering on their own terms. Another way to think of it: memoization of some virtual dom tree structure doesn't mean that it's excluded from the diffing algorithm, it only means that it's not recomputed (entirely).

          Here's a small doodle to explore:

          [https://xopgm.csb.app/](https://xopgm.csb.app/)
        `
      }
    ].map(d => Post.create(d))
  );

  await onEquality.addTags([tags.react, tags.hooks]);
  await onRerendering.addTags([tags.react, tags.hooks, tags.useMemo]);
  await onGitHub.addTags([tags.github]);

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

  console.log("Fixtures in place");
};
