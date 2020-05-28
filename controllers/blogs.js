const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs.map((blog) => blog.toJSON()));
  });
});
blogRouter.post("/", (request, response) => {
  const body = request.body;
  console.log(body);

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  });

  blog.save().then((savedBlog) => {
    response.json(savedBlog.toJSON());
  });
});

module.exports = blogRouter;
