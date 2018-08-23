var request = require('request');

//Object contains the helper methods
var helpers = {};

helpers.isAllowedToAccess = function(currentUser, target) {
    return currentUser && ( target.author.id.equals(currentUser._id) || JSON.parse(JSON.stringify(currentUser)).isAdmin );
};

helpers.isAdmin = function(user) {
    return JSON.parse(JSON.stringify(user)).isAdmin;
}

helpers.getLocationInfo = function(query, callback) {
    request('https://api.tomtom.com/search/2/search/'+query+'.json?key='+process.env.GEOCODER_API_KEY+'&limit=1', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var parsedBody = JSON.parse(body);
            if(parsedBody.results && parsedBody.results.length) {
                var data = parsedBody.results[0];
                var locationInfo = getAddress(data);
                if (typeof callback === "function") {
                    // Call it, since we have confirmed it is callable
                    callback(false, locationInfo);
                    return;
                }
            }
        }
        
        callback(true, null);
    });
}

helpers.checkPassword = function(str){
    // at least one number, one lowercase and one uppercase letter
    // at least six characters
    var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    return re.test(str);
}
module.exports = helpers;

//private methods
function getAddress(data) {
    var address = {
        locationName: String,
        lat: Number,
        lng: Number
    }
    
    var firstAddress = '';
    var secondAddress = data.address.countrySubdivision;
    
    var streetName = data.address.streetName;
    var countrySecondarySubdivision = data.address.countrySecondarySubdivision;
    
    var streetName = data.address.streetName;
    if(data.type === "POI" && data.poi.name !== 'undefined') {
        firstAddress = data.poi.name + ", ";
    } else if(streetName && streetName !== 'undefined') {
        firstAddress = data.address.streetName + ", ";
    } else if(countrySecondarySubdivision && countrySecondarySubdivision !== 'undefined'
                && countrySecondarySubdivision !== secondAddress) {
        firstAddress = data.address.countrySecondarySubdivision + ", ";
    } else {
        firstAddress = '';
    }
    
    address.locationName = firstAddress + secondAddress;
    address.lat = data.position.lat;
    address.lng = data.position.lon;
    
    return address;
}