var express = require("express"),
router      = express.Router(),
Campground  = require("../models/campground"),
middleware  = require("../middleware");

var helpers = require("../helpers")

//INDEX Route
router.get("/", function(req, res){
    
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
        }
    });
});

//NEW route
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    console.log("You're searching for : " + req.body.location);
    
    helpers.getLocationInfo(req.body.location, function(err, locationInfo) { 
        if(err) { 
            req.flash("error", "Invalid address.");
            return res.redirect("back");
        }
        // get data from form and add to campgrounds array
        var name = req.body.name;
        var image = req.body.image;
        var desc = req.body.description;
        var author = {
            id: req.user._id,
            username: req.user.username
        };
        // get data from locationInfo
        var lat = locationInfo.lat;
        var lng = locationInfo.lng;
        var location = locationInfo.locationName;
        
        var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
        
        // Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
                req.flash("error", "There was an error, please try again.");
                res.redirect("back");
            } else {
                //redirect back to campgrounds page
                console.log(newlyCreated);
                res.redirect("/campgrounds");
            }
        });
    });
    
});


//SHOW route - shows more info about one campground
//NOTE: this must be declared after ALL routes that follows the pattern "/camgrounds/SOMETHING"
router.get("/:id", function(req, res){
    //find campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground) {
            req.flash("error", "Campground was not found.");
            res.redirect("back");
        } else {
            //render show template with that campground
            res.render("campgrounds/show", { campground: foundCampground, hasMap: true });
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", { campground: foundCampground });
    });
});

// UPDATE CAMPGROUND ROUTE
//TODO complete this
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  helpers.getLocationInfo(req.body.location, function (err, locationInfo) {
    if (err) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = locationInfo.lat;
    req.body.campground.lng = locationInfo.lng;
    req.body.campground.location = locationInfo.address;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

// DELETE CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            console.log(err);
            req.flash("error", "There was an error, please try again later.");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Successfully deleted campground.");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;