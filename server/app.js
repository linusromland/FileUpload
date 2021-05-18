//Init of dotenv for use with .env file
require("dotenv").config();

//Dependencies import
const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const fileUpload = require("express-fileupload");

//Local Dependencies
const database = require("./database.js");
const login = require("./login.js");
const initializePassport = require("./config/passport.js");
const User = require("./models/User.js");
const checkAuthenticated = require("./login.js");

//Variable Initialize
const port = process.env.PORT || 3000;
const mongoURL = process.env.MONGOURL || "mongodb://localhost:27017/";
const fileSizeLimitMB = process.env.FILESIZELIMITMB * 1024 * 1024 || 52428800;

//Connect to Mongo
database.connect("FileUpload", mongoURL);

//Sets the view engine to EJS
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/shared/"));
app.use(flash());
app.use(express.static("client"));
app.use(express.urlencoded({ extended: true }));

//init of passport
app.use(
	session({
		secret: process.env.SECRET || "keyboard cat",
		store: MongoStore.create({
			mongoUrl: mongoURL,
			dbName: "FileUpload",
		}),
		resave: true,
		saveUninitialized: true,
	})
);
app.use(passport.initialize(undefined));
app.use(passport.session(undefined));

//init of passport
initializePassport(
	passport,
	(name) => User.find((user) => user.name === name),
	(id) => User.find((user) => user.id === id)
);

//init of express-fileupload
app.use(
	fileUpload({
		limits: { fileSize: fileSizeLimitMB }, //limit of 50mb i think
		abortOnLimit: true, //send 413 when file to large
		useTempFiles: true, //stores files while uploading in ./tmp instead of memory
		tempFileDir: "./tmp/",
		uploadTimeout: 0, //disable timeout while testing
		debug: false, //debug logs
	})
);

//Startpage
app.get("/", (req, res) => {
	res.render("pages/index", {
		loggedIn: req.user
	});
});

//Login Post Request (Needs passport)
app.post(
	"/login",
	checkAuthenticated.checkNotAuthenticated,
	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/login",
		failureFlash: true,
	})
);

//adds the loginroutes to /
app.use("/", require("./routes/loginRoutes"));

//adds the uploadroutes to /
app.use("/", require("./routes/uploadRoutes"));

//adds the downloadroutes to /
app.use("/", require("./routes/downloadRoutes"));

//Starts the server
app.listen(port, () =>
	console.log(
		`FileUpload listening on port ${port}!\nAccess the site on http://localhost:${port}`
	)
);
