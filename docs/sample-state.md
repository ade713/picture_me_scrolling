{

  currentUser: {

    id: 1,
    username: "luffy"
  },

  forms: {

    signUp: {errors: []},
    logIn: {errors: []},
  },

  posts: {

    1: {
      title: "First Post",
      body: "PicMeS to the world"
      author_id: 1,
      tags: {
        1: {
          id: 1,
          name: "intro"
        }
      }
    }

    2: {
      title: "Anime for people"
      url: "www.dragonball.com"
      body: "good intro anime"
      tags: {
        1: {
          id: 2
          name: "foreign"
        }
      }
    }
  },

  likes: {

    1: {
      title: "2pac is west coast greatest"
      body: "Tupac Shakur is arguably the best rapper from Cali"
      author_id: 2,
      tags: {
        1: {
          id: 1
          name: "hiphop"
        }
      }
    }
  }

}
