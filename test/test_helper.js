const Blog = require("../models/blog");

const initialBlogs = [
  {
    title: "First Blog",
    author: "Nirmal Patel",
    url: "http://nirmal.me",
    likes: 5,
  },
  {
    title: "Second Blog",
    author: "Steve",
    url: "https://apple.com",
    likes: 5,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({ title: "willremovethissoon" });
  await blog.save();
  await blog.remove();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};
module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
};
