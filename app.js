require("dotenv").config();

// =========================================
// Requiring Libraries and Express Framework
// =========================================
var express             = require("express"),
app                     = express(),
bodyParser              = require("body-parser"),
mongoose                = require("mongoose"),
passport                = require("passport"),
LocalStrategy           = require("passport-local"),
methodOverride          = require("method-override"),
expressSession          = require("express-session"),
flash                   = require("connect-flash"),
moment                  = require("moment"),
Campground              = require("./models/campground"),
Comment                 = require("./models/comment"),
User                    = require("./models/user"),
seedDB                  = require("./seeds");

//requiring routes
var campgroundRoutes    = require("./routes/campgrounds.js"),
    commentRoutes       = require("./routes/comments.js"),
    indexRoutes         = require("./routes/index.js"),
    usersRoutes         = require("./routes/users.js");

// requiring helper methods
var helpers = require("./helpers");

// Connecting to database
mongoose.connect('mongodb://localhost:27017/yelp_camp_v12', { useNewUrlParser: true });

// =================
// Application setup
// =================
app.use(bodyParser.urlencoded({ extended: true }));    
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(flash());
// seedDB(); //seed the database

// ======================
// PASSPORT CONFIGURATION
// ======================
app.use(expressSession({
    secret: "This is my secret... Shhhh Don't tell them!!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==========================
// Globalizing some variables
// ==========================
app.use(function(req, res, next){
    res.locals.currentUser  = req.user;
    res.locals.error        = req.flash("error");
    res.locals.success      = req.flash("success");
    res.locals.moment       = moment;
    res.locals.helpers      = helpers;
    next();
});

// =================
// Routes Definition
// =================
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/users/:id", usersRoutes);

//Make the web app working...
app.listen(process.env.PORT, process.env.IP, () => console.log("YelpCamp Server is starting.."));