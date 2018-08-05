var express = require("express"),
router      = express.Router({ mergeParams: true }),
User        = require("../models/user"),
Campground  = require("../models/campground"),
middleware  = require("../middleware");

// "/users/:id"
// SHOW: User profile 
router.get("/", function(req, res) {
    User.findById(req.params.id, function(err, foundUser){
        if(err || !foundUser) { 
           req.flash("error", "User was not found.");
           return res.redirect("back");
        }
    //   {author.id: foundUser._id}
        Campground.find().where("author.id").equals(foundUser._id).exec(function(err, foundCamgrounds){
            if(err) {
                req.flash("error", "Something went wrong.");
                return res.redirect("/");
            }
            
            res.render("users/show", {user: foundUser, campgrounds: foundCamgrounds});
        });
    }); 
});

// EDIT: User Profile
router.get("/edit", middleware.checkAccountOwnership, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
       if(err || !foundUser) {
           req.flash("error", "User was not found");
           return res.redirect("/campgrounds");
       }
       
       res.render("users/edit", {user: foundUser});
    });
});

// UPDATE User Profile
router.put("/", middleware.checkAccountOwnership,function(req, res){
    var email = req.body.email;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var avatar = req.body.avatar;
    var bio = req.body.bio;
    
    User.findByIdAndUpdate(req.params.id, {$set: {email: email, firstName: firstName, lastName: lastName, avatar: avatar, bio: bio}}, function(err, updatedUser){
        if(err || !updatedUser) {
            console.log(err);
            req.flash("error", "User was not found.");
            return res.redirect("/campgrounds");
        }
        
        console.log(updatedUser);
        req.flash("success", "Successfully edited profile.");
        res.redirect("/users/" + req.params.id);
    });
});


module.exports = router;