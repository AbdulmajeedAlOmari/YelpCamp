var mongoose = require("mongoose");
var User = require("./models/user");
var Campground = require("./models/campground");
var Comment   = require("./models/comment");

var helpers = require("./helpers");

var data = [
    {
        name: "Cloud's Rest",
        price: 99.98,
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        location: "Jeddah, Saudi Arabia",
    },
    {
        name: "Desert Mesa", 
        price: 39.45,
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        location: "Riyadh, Saudi Arabia"
    },
    {
        name: "Canyon Floor", 
        price: 78.63,
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        location: "Dammam, Saudi Arabia"
    }
]

function seedDB(){
    removeAll(function(){
        console.log("Removed all info in DB.");
        prepareData(function(){
            console.log("Will Start Seeding.");
            startSeeding();
        });
    });
}

module.exports = seedDB;

//private methods

function removeAll(callback){
    User.remove({}, function(err){
        if(err) { 
            console.log(err);
        }
        
        Campground.remove({}, function(err){
            if(err) {
                console.log(err);
            }
            
            Comment.remove({}, function(err){
                if(err){
                    console.log(err);
                }
                
                callback();
            });
        });
    });
}

function prepareData(callback) {
    data.forEach(function(element){
        helpers.getLocationInfo(element.location, function(err, locationInfo){
            if(err) {
                console.log("An error!!!");
            } else {
                element.location = locationInfo.locationName;
                element.lat = locationInfo.lat;
                element.lng = locationInfo.lng;
            }
        });
    });
    
    callback();
}

function startSeeding() {
    var users = [
        {
            username: "dotSaviour",
            firstName: "Abdulmajeed",
            lastName: "Alomari",
            email: "dotsaviourdev@gmail.com"
        },
        {
            username: "Silver",
            firstName: "Silver",
            lastName: "Abdulmajeed",
            email: "silver@gmail.com"
        },
        {
            username: "Potato",
            firstName: "Potato",
            lastName: "Potato",
            email: "potato@gmail.com"
        }
    ];
    
    users.forEach(function(user){
        User.register(user, "a", function(err, newUser){
            if(err) {
                console.log(err);
            }
        });
    });
    
    data.forEach(function(element){
        console.log("Adding a campground.");
        Campground.add(element, function(err, newElement){
            if(err) {
                console.log(err);
            }
        })
    });
}