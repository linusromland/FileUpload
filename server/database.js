const mongoose = require("mongoose");
const ObjectID = require("mongodb").ObjectID;
let db;

//Connect to MongoDB
exports.connect = (collectionname, connectURL) => {
	let dbLink = connectURL + collectionname;
	mongoose.connect(dbLink, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	db = mongoose.connection;
	db.on("error", console.error.bind(console, "connection error:"));
	db.once("open", function () {
		console.log("Connected to MongoDB using " + collectionname);
	});
};

exports.db = db;