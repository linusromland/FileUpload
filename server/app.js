const express = require("express");
const dBModule = require("./dbModule.js");
const User = require("./models/user.js");
const fs = require("fs");
const session = require("express-session");
const flash = require("express-flash");
const sessionstore = require("sessionstore");
const passport = require("passport");
const app = express();
const port = 3000;

//Initializes the Store Varible for use with sessionstore
//Connectes to MongoDB
let store;
connectToMongo("FileUpload", "mongodb://mongo:27017") //Docker Mongo Connect
//connectToMongo("FileUpload", "mongodb://localhost:27017/"); //Local Mongo Connect

//Sets and uses dependencies etc.
app.use(flash());
app.use(express.static("client"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "keyboard cat",
    store: store,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      //domain: ".romland.space",
      sameSite: "strict",
    },
  })
);
app.use(passport.initialize(undefined));
app.use(passport.session(undefined));

const initializePassport = require("./config/passport.js");
initializePassport(
  passport,
  (name) => User.find((user) => user.name === name),
  (id) => User.find((user) => user.id === id)
);

app.post("/register", async (req, res) => {
  try {
    const userExist = await dBModule.findInDBOne(User, req.body.name);
    console.log(req.body.password);
    if (userExist == null) {
      dBModule.saveToDB(createUser(req.body.name, req.body.password));
      res.sendStatus(201);
      console.log("Got here");
    } else {
      res.sendStatus(409);
    }
  } catch {
    res.sendStatus(500);
  }
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/auth", checkAuthenticated, async (req, res) => {
  let tmp = await req.user;
  res.send("You're authenticated as " + tmp.name);
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/client/register.html");
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/client/login.html");
});

app.get("/logout", checkAuthenticated, (req, res) => {
  req.logOut();
  res.send("You are now logged out");
});

function connectToMongo(dbName, connectURL) {
  if (fs.existsSync("mongoauth.json")) {
    const mongAuth = require("./mongoauth.json");
    dBModule.cnctDBAuth(dbName, connectURL);
    store = sessionstore.createSessionStore({
      type: "mongodb",
      authSource: "admin",
      username: mongAuth.username,
      password: mongAuth.pass,
    });
  } else {
    dBModule.cnctDB(dbName, connectURL);
    store = sessionstore.createSessionStore({ type: "mongodb" });
  }
}

function createUser(nameIN, passIN) {
  return new User({
    name: nameIN,
    password: passIN,
  });
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/auth");
  }
  next();
}

app.listen(port, () => console.log(`Server listening on port ${port}!`));
