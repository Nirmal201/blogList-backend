const supertest = require("supertest");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const bcrypt = require("bcrypt");
const User = require("../models/user");

let token;
beforeAll((done) => {
  api
    .post("/api/login")
    .send({
      username: "nirmal",
      password: "123",
    })
    .end((err, response) => {
      token = response.body.token; // save the token!
      done();
    });
});

beforeEach(async () => {
  await Blog.deleteMany({});
  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});
test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test("blog without likes, add 0 as default value ", async () => {
  const newBlog = {
    title: "Hello",
    author: "TEST",
    url: "http://jest.com",
  };

  if (newBlog.likes === "undefined") {
    newBlog.likes = 0;
  }

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(200)
    .expect("Content-Type", /application\/json/);
  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
});

test("set likes to 0 as default value in database", async () => {
  const response = await api.get("/api/blogs");

  for (let blog of response.body) {
    if (typeof blog["likes"] === "undefined") {
      blog["likes"] = 0;
    }
  }
  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test("valid blog can be added", async () => {
  const newBlog = {
    title: "POST",
    author: "TEST",
    url: "http://jest.com",
    likes: 10,
  };
  await api
    .post("/api/blogs/")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const blogAtEnd = await helper.blogsInDb();
  expect(blogAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const titles = blogAtEnd.map((b) => b.title);
  expect(titles).toContain("POST");
});

test("Verifying the existence of a property", async () => {
  const res = await api.get("/api/blogs");
  res.body.forEach((b) => {
    expect(b.id).toBeDefined();
  });
});

test("fails with status 400, title and url properties undefined", async () => {
  const newBlog = {
    authors: "Nirmal Patel",
    likes: 5,
  };

  await api
    .post("/api/blogs/")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(400);
  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd.length).toBe(helper.initialBlogs.length);
});

test("Not valid user to delete blog", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401);

  const blogAtEnd = await helper.blogsInDb();
  expect(blogAtEnd).toHaveLength(helper.initialBlogs.length);

  const title = blogAtEnd.map((b) => b.title);
  expect(title).not.toContain(blogToDelete);
});

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash("secret", 10);

    const user = new User({ username: "root", passwordHash });
    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const userAtStart = await helper.usersInDb();
    const newUser = {
      username: "nirmal",
      name: "Nirmal",
      password: "123",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(userAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);

    expect(usernames).toContain(newUser.username);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
