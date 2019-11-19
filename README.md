# The Codaisseur Coders Network API

- The API: [http://codaisseur-coders-network.herokuapp.com/](http://codaisseur-coders-network.herokuapp.com/)
- The code: [https://github.com/Codaisseur/codaisseur-coders-network](https://github.com/Codaisseur/codaisseur-coders-network)

## Introduction

The Codaisseur Coders Network API is just a simple REST API. Sadly, it does not have a UI yet. Will you help us make it? :)

### Hello world

_The simplest endpoint of all, just to see if everything's still working._

- [Example](/hello)

- HTTPie:

  `http -v GET :5000/hello`

- JavaScript:

  ```js
  fetch("http://localhost:5000/hello")
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  ```ts
  {
    message: "Hello world!";
  }
  ```

### Howto

We've documented all the available endpoints below. Each endpoint has two examples, one that you can use with [HTTPie](https://httpie.org/) in your terminal, and one that you can use directly in your DevTools.

### Entity types

The API knows of the following entity types:

- Developers
- Posts
- Tags
- Comments
- Technologies
- Likes

## Signup, login, authentication

We use JSON Web Tokens for authentication. Some endpoints are authenticated, which means you can only get data from them if you're logged in.

- To login, you want to `POST` to `/login` with your email and password, and then you get a JWT back.
- To access an authenticated endpoint after you've logged in, you have to send the JWT along as a header. We have a simple test authenticated endpoint at `/authenticated`.

### Signup `POST /signup`

- HTTPie:

  `http -v POST :5000/signup name="Kelley van Evert" email=kelley@codaisseur.com password=abcd`

- JavaScript:

  ```js
  fetch("http://localhost:5000/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "Kelley van Evert",
      email: "kelley@codaisseur.com",
      password: "abcd"
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  ```ts
  {
    developer: Developer;
    jwt: string;
  }
  ```

### Login `POST /login`

- HTTPie:

  `http -v POST :5000/login email=kelley@codaisseur.com password=abcd`

- JavaScript:

  ```js
  fetch("http://localhost:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: "kelley@codaisseur.com",
      password: "abcd"
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  ```ts
  {
    jwt: string;
  }
  ```

### Check whether authenticated `GET /authenticated`

- HTTPie:

  `http -v GET :5000/authenticated Authorization:"Bearer JWT"`

- JavaScript:

  ```js
  fetch("http://localhost:5000/authenticated", {
    headers: {
      Authorization: `Bearer JWT`
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  ```ts
  {
    authenticated: true;
  }
  ```

## Posts

### Get a single post `GET /posts/:id`

- [Example](/posts/1)

- HTTPie:

  `http -v GET :5000/posts/1`

- JavaScript:

  ```js
  fetch(`http://localhost:5000/posts/1`)
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  `Post`

### Like a post `POST /posts/:id/likes`

_This is an authenticated API endpoint._

- HTTPie:

  `http -v POST :5000/posts/1/likes Authorization:"Bearer JWT"`

- JavaScript:

  ```js
  fetch(`http://localhost:5000/posts/1/likes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer JWT`
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  ```ts
  {
    ok: true;
  }
  ```

### Unlike a post `DELETE /posts/:id/likes`

_This is an authenticated API endpoint._

- HTTPie:

  `http -v DELETE :5000/posts/1/likes Authorization:"Bearer JWT"`

- JavaScript:

  ```js
  fetch(`http://localhost:5000/posts/1/likes`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer JWT`
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  ```ts
  {
    ok: true;
  }
  ```

### Get a post's comments `GET /posts/:id/comments`

- [Example](/posts/1/comments)

- HTTPie:

  `http -v GET :5000/posts/1/comments`

- JavaScript:

  ```js
  fetch(`http://localhost:5000/posts/1/comments`)
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  ```ts
  {
    count: number;
    rows: Comment[];
  }
  ```

### Add a comment `POST /posts/:id/comments`

_This is an authenticated API endpoint. The new comment is made in the name of the user currently logged in._

- HTTPie:

  `http -v POST :5000/posts/1/comments Authorization:"Bearer JWT" text="Love it!"`

- JavaScript:

  ```js
  fetch(`http://localhost:5000/posts/1/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer JWT`
    },
    body: JSON.stringify({
      text: "Love it!"
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  `Comment`

### Get a list of posts `GET /posts`

_Paginated with the optional `offset` and `limit` query parameters._

- [Example](/posts)

- HTTPie:

  `http -v GET ":5000/posts?offset=1&limit=2"`

- JavaScript:

  ```js
  fetch(`http://localhost:5000/posts?offset=1&limit=2`)
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  ```ts
  {
    count: number;
    rows: Post[];
  }
  ```

### Get a list of posts (by tag) `GET /posts?tag`

_Paginated with the optional `offset` and `limit` query parameters._

- [Example](/posts?tag=github)

- HTTPie:

  `http -v GET ":5000/posts?tag=react"`

- JavaScript:

  ```js
  fetch(`http://localhost:5000/posts?tag=react`)
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  ```ts
  {
    count: number;
    rows: Post[];
  }
  ```

### Create a new post `POST /posts`

_This is an authenticated API endpoint. The new post is made in the name of the user currently logged in._

- HTTPie:

  `http -v POST :5000/posts Authorization:"Bearer JWT" title="ABC" content="bla bla bla"`

- JavaScript:

  ```js
  fetch("http://localhost:5000/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "ABC",
      content: "bla bla bla"
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  `Post`

### Update a post `PUT /posts/:id`

_This is an authenticated API endpoint. The new post is made in the name of the user currently logged in._

_You don't have to send all post fields. Only the included fields will be updated._

- HTTPie:

  `http -v PUT :5000/posts Authorization:"Bearer JWT" title="DEF"`

- JavaScript:

  ```js
  fetch("http://localhost:5000/posts/1", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer JWT`
    },
    body: JSON.stringify({
      title: "DEF"
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  `Post`

### Delete a post `DELETE /posts/:id`

_This is an authenticated API endpoint. The post must be owned by the user currently logged in._

- HTTPie:

  `http -v DELETE :5000/posts/1 Authorization:"Bearer JWT"`

- JavaScript:

  ```js
  fetch("http://localhost:5000/posts/1", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer JWT`
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  ```ts
  {
    id: number;
  }
  ```

## Developers

### Create a new developer's profile

_Refer to the [`/signup`](#signup) endpoint above._

### Get a single developer's profile `GET /developers/:id`

- [Example](/developers/1)

- HTTPie:

  `http -v GET :5000/developers/1`

- JavaScript:

  ```js
  fetch(`http://localhost:5000/developers/1`)
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  `Developer`

### Get a list of developers `GET /developers`

_Paginated with the optional `offset` and `limit` query parameters._

- [Example](/developers)

- HTTPie:

  `http -v GET ":5000/developers?offset=1&limit=2"`

- JavaScript:

  ```js
  fetch(`http://localhost:5000/developers?offset=1&limit=2`)
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  ```ts
  {
    count: number;
    rows: Developer[];
  }
  ```

### Update your profile `PUT /developers/:id`

_This is an authenticated API endpoint. You can of course only edit your own profile._

- HTTPie:

  `http -v PUT :5000/developers/1 Authorization:"Bearer JWT" name="Bla" github_username="blabla"`

- JavaScript:

  ```js
  fetch(`http://localhost:5000/developers/1`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer JWT`
    },
    body: JSON.stringify({
      name: "Bla",
      github_username: "blabla"
    })
  )
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  `Developer`

### Delete your account `DELETE /developers/:id`

_This is an authenticated API endpoint. You can of course only delete your own account._

- HTTPie:

  `http -v DELETE :5000/developers/1 Authorization:"Bearer JWT"`

- JavaScript:

  ```js
  fetch(`http://localhost:5000/developers/1`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer JWT`
    }
  )
    .then(res => res.json())
    .then(data => {
      console.log("DONE", data);
    });
  ```

- Response:

  ```ts
  {
    id: number;
  }
  ```
