const express   = require("express"),
router          = express.Router(),
passport        = require("passport"),
asyncLibrary    = require("async"),
nodemailer      = require("nodemailer"),
crypto          = require("crypto"),
User            = require("../models/user"),
Campground      = require("../models/campground"),
middleware      = require("../middleware");

const helpers = require("../helpers");

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
    const username = req.body.username;
    const password = req.body.password;
    const repassword = req.body.repassword;
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const avatar = req.body.avatar;
    
    if(password !== repassword) {
        req.flash("error", "passwords do not match.");
        return res.redirect("/register");
    } else if(!helpers.checkPassword(password)) {
        req.flash("error", "your password is too weak.");
        return res.redirect("/register");
    }
    
    const newUser = new User({ username:username, email:email, firstName:firstName, lastName:lastName});
    if(avatar !== "") {
        newUser.avatar = avatar;
    }
    
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

//forgot show page
router.get("/forgot", function(req, res){
   res.render("forgot"); 
});

//forgot logic
router.post("/forgot", function(req, res, next){
   asyncLibrary.waterfall([
       function(done){
           crypto.randomBytes(20, function(err, buf){
              const token = buf.toString("hex");
              done(err, token);
           });
       },
       function(token, done){
           User.findOne({email: req.body.email}, function(err, foundUser){
               if(err || !foundUser) {
                   req.flash("error", "No account with that email exists.");
                   return res.redirect("/forgot");
               }
               
               foundUser.resetPasswordToken = token;
               foundUser.resetPasswordExpires = Date.now() + 3600000;
               
               foundUser.save(function(err){
                   done(err, token, foundUser);
               })
           });
       },
       function(token, user, done){
           const smtpTransport = nodemailer.createTransport({
               service: 'Gmail',
               auth:{
                   user: 'yelpcampdemonstration@gmail.com',
                   pass: process.env.GMAILPW
               }
           });
           
           const mailOptions = {
               to: user.email,
               from: 'yelpcampdemonstration@gmail.com',
               subject: 'YelpCamp - Password Reset',
               text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
           }
           smtpTransport.sendMail(mailOptions, function(err){
               console.log('mail sent');
               req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
               done(err, 'done');
           });
       }
   ], function(err){
      if(err) return next(err);
      res.redirect("/forgot");
   });
});

router.get("/reset/:token", function(req, res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, foundUser){
        if(err || !foundUser) {
            req.flash("error", "Password reset token is invalid or has expired.");
            return res.redirect("/forgot");
        }
        res.render("reset", {token: req.params.token});
    });
});

router.post("/reset/:token", function(req, res){
    asyncLibrary.waterfall([
        function(done){
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, foundUser){
                if(err || !foundUser) {
                    req.flash("error", "Password reset token is invalid or has expired.");
                    return res.redirect("/forgot");
                }
                
                if(req.body.password === req.body.confirm) {
                    foundUser.setPassword(req.body.password, function(err){
                        foundUser.resetPasswordToken = undefined;
                        foundUser.resetPasswordExpires = undefined;
                        
                        foundUser.save(function(err){
                            req.logIn(foundUser, function(err){
                                done(err, foundUser)
                            })
                        })
                    })
                } else {
                    req.flash("error", "Passwords do not match, please try again.");
                    return res.redirect("/reset/"+req.params.token);
                }
            });
        },
        function(user, done) {
            const smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                  user: 'yelpcampdemonstration@gmail.com',
                  pass: process.env.GMAILPW
                }
            });
            
            const mailOptions = {
                to: user.email,
                from: 'learntocodeinfo@mail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                  'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            
            smtpTransport.sendMail(mailOptions, function(err){
                req.flash("success", "Success! Your password has been changed.");
                done(err);
            })
        }
    ], function(err){
        res.redirect('/campgrounds');
    });
});

module.exports = router;