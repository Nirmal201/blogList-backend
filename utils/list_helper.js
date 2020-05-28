const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs
    .map((blog) => blog.likes)
    .reduce((sum, item) => {
      return sum + item;
    }, 0);
};

const favoriteBlog = (blogs) => {
  let highestLike = Math.max(...blogs.map((e) => e.likes));

  return blogs.find((blog) => blog.likes === highestLike);
};

module.exports = { dummy, totalLikes, favoriteBlog };
