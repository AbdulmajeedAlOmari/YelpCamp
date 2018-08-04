var request = require('request');

//Object contains the helper methods
var helpers = {};

helpers.isAllowedToAccess = function(currentUser, target) {
    return currentUser && ( target.author.id.equals(currentUser._id) || JSON.parse(JSON.stringify(currentUser)).isAdmin );
};

helpers.getLocationInfo = function(query, callback) {
    console.log("0) Entered function");
    request('https://api.tomtom.com/search/2/search/'+query+'.json?key='+process.env.GEOCODER_API_KEY+'&limit=1', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("0.5) body is: " + body);
            var parsedBody = JSON.parse(body);
            console.log("1) Successfully Parsed Body: " + parsedBody);
            if(parsedBody.results && parsedBody.results.length) {
                console.log("2) Gathering data in if statement");
                console.log("2.5) data is: " + parsedBody.results);
                var data = parsedBody.results[0];
                console.log("3) data is gathered with address: " + data.address);
                var locationInfo = getAddress(data);
                console.log("4) now trigger the callback");
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