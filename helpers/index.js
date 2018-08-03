var request = require('request');

//Object contains the helper methods
var helpers = {};

helpers.isAllowedToAccess = function(currentUser, target) {
    return currentUser && ( target.author.id.equals(currentUser._id) || JSON.parse(JSON.stringify(currentUser)).isAdmin );
};

helpers.getLocationInfo = function(query) {
    var locationInfo = {};
    
    
    request('https://api.tomtom.com/search/2/search/'+query+'.json?key=EtB7SFCAa6178gMHzap0yx0lKCG4EMp6&limit=1', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body) // Print the google web page.
            return locationInfo;
        } else {
            return null;
        }
    });
}

module.exports = helpers;