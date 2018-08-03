var middlewareObj   = {},
Campground          = require("../models/campground"),
Comment             = require("../models/comment"),
helpers              = require("../helpers");

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("/login");
}

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err || !foundCampground) {
                req.flash("error", "Campground was not found.");
                res.redirect("/campgrounds");
            } else {
                if(helpers.isAllowedToAccess(req.user, foundCampground)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("/campgrounds/"+foundCampground._id);
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("/login");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment) {
                req.flash("error", "Comment was not found.");
                res.redirect("/campgrounds");
            } else {
                if(helpers.isAllowedToAccess(req.user, foundComment)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("back");
    }
}

module.exports = middlewareObj;