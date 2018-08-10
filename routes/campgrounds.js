var express = require("express"),
router      = express.Router(),
Campground  = require("../models/campground"),
middleware  = require("../middleware");

var helpers = require("../helpers")

// ================
// Cloudinary Setup
// ================
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dotsaviour', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//INDEX Route
router.get("/", function(req, res){
    var search = {};
    var noMatch = null;
    
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        search = {name: regex};
    }
    
    Campground.find(search, function(err, allCampgrounds){
        if(err){
            return errorMessage(req, res, err);
        } else {
            if(search.name && allCampgrounds.length === 0) {
                noMatch = "No campgrounds match that query, please try again.";
            }
            res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch});
        }
    });
});

//NEW route
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
    helpers.getLocationInfo(req.body.campground.location, function(err, locationInfo){
        if(err) { 
            req.flash("error", "Invalid address.");
            return res.redirect("back");
        }
        
        cloudinary.uploader.upload(req.file.path, function(result) {
            // add cloudinary url for the image to the campground object under image property
            req.body.campground.image = result.secure_url;
            // add image's public_id to the campground object
            req.body.campground.imageId = result.public_id;
            // add author to campground
            req.body.campground.author = {
                id: req.user._id,
                username: req.user.username
            }
            req.body.campground.location = locationInfo.locationName;
            req.body.campground.lat = locationInfo.lat;
            req.body.campground.lng = locationInfo.lng;
            
            Campground.create(req.body.campground, function(err, campground) {
                if (err) {
                  req.flash('error', err.message);
                  return res.redirect('back');
                }
                res.redirect('/campgrounds/' + campground.id);
            });
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
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
    
    helpers.getLocationInfo(req.body.campground.location, function (err, locationInfo) {
        if (err) {
          req.flash('error', 'Invalid address.');
          return res.redirect('back');
        }
        
        Campground.findById(req.params.id, async function(err, campground){
            if(err){
                return errorMessage(req, res, err);
            }
            if(req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    campground.imageId = result.public_id;
                    campground.image = result.secure_url;
                } catch(err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            
            var campgroundBody = req.body.campground;
            
            campground.name = campgroundBody.name;
            campground.price = campgroundBody.price;
            campground.description = campgroundBody.description;
            campground.location = locationInfo.locationName;
            campground.lat = locationInfo.lat;
            campground.lng = locationInfo.lng;
            
            campground.save();
            
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        });
    });
});

// DELETE CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err) {
            return errorMessage(req, res, err);
        }
        
        try{
            await cloudinary.v2.uploader.destroy(campground.imageId);
            campground.remove(function(err){
                return errorMessage(req, res, err);
            });
        } catch(err) {
            return errorMessage(req, res, err);
        }
    });
});

module.exports = router;

// =================
// Private functions
// =================

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function errorMessage(req, res, err) {
    req.flash("error", err.message);
    return res.redirect("/campgrounds");
}