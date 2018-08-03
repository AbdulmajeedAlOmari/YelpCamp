var express = require("express"),
router      = express.Router(),
passport    = require("passport"),
User        = require("../models/user"),
middleware  = require("../middleware");

//Root Route
router.get("/", (req, res) => res.render("landing"));


//=============
// Auth Routes
//=============

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});
//hadle registration logic
router.post("/register", function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var newUser = new User({ username: username });
    User.register(newUser, password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username + "!");
            res.redirect("/campgrounds");
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});
//handle login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res){
    
});

//logout logic
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Successfully logged out.");
    res.redirect("/campgrounds");
});


module.exports = router;