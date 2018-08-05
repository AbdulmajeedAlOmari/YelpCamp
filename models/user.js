var mongoose            = require("mongoose"),
passportLocalMongoose   = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    avatar: {type: String, default: "https://pixabay.com/get/e032b20b2ef41c22d2524518b7444795ea76e5d004b0144296f4c67ba6e9b7_340.png"},
    firstName: String,
    lastName: String,
    email: {type: String, unique: true, required: true},
    isAdmin: {type: Boolean, default: false},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    bio: String
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);