const express   = require("express"),
router          = express.Router({ mergeParams: true }),
Campground      = require("../models/campground"),
Comment         = require("../models/comment"),
middleware      = require("../middleware");
    
//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    const id = req.params.id;
    Campground.findById(id, function(err, campground){
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            req.flash("error", "There was an error, please try again later.");
            res.redirect("/camgrounds");
        } else {
            // console.log(req.body.comment);
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                    req.flash("error", "There was an error, please try again later.");
                    req.redirect("back");
                } else {
                    //add username and id to comment
                    // comment.author = { id: req.user._id, username: req.user.username};
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully added comment.");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

// Edit Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err || !foundCampground) {
            req.flash("error", "Campground was not found.");
            return res.redirect("back");
        }
        
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err || !foundComment) {
                console.log(err);
                req.flash("error", "There was an error, please try again later.");
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        })
    });
});

// Update Route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if(err) {
            console.log(err);
            req.flash("error", "There was an error, please try again later.");
            res.redirect("back");
        } else {
            req.flash("success", "Successfully edited.");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

// Delete Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err) {
            console.log(err);
            req.flash("error", "There was an error, please try again later.");
            res.redirect("back");
        } else {
            req.flash("success", "Comment successfully deleted.");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;