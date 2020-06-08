const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
  });
  response.json(users.map((u) => u.toJSON()));
});

//create new user route
usersRouter.post("/", async (request, response) => {
  const body = request.body;
  console.log("body", body);
  //sahil, body.password-line20, body.name-line27, body.username-26
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });
  // ^^ This uses the passwordHash property of schema.

  const savedUser = await user.save();
  response.json(savedUser);
});

module.exports = usersRouter;
