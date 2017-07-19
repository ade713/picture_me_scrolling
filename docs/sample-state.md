```js
{
  currentUser: {
    id: 1,
    username: "luffy",
  },

  errors: [],
  posts: {
    1: {
      title: "First Post",
      body: "PicMeS to the world"
      author_id: 1,
      tag_keys: [1]
    },

    2: {
      title: "Anime for people"
      url: "www.dragonball.com"
      body: "good intro anime"
      author_id: 1,
      tag_keys: [2]
    },

    3: {
      title: "2pac is west coast greatest"
      body: "Tupac Shakur is arguably the best rapper from Cali"
      author_id: 2,
      tag_keys: [3]
  },

  likes: {
    1: {
      post_id: 1,
      user_id: 2,
    },

    2: {
      post_id: 3,
      user_id: 1,
    }
  },

  tags: {
    1: {
      id: 1,
      name: "intro"
    },

    2: {
      id: 2
      name: "foreign"
    },

    3: {
      id: 3
      name: "hiphop"
    }
  }
}
```
