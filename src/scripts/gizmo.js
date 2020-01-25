const request = require("request");

function fetch (url, callback) {
    request(url, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            callback();
        }
    });
};

/*
    request(`https://www.gizmo.moe/api/user?query=${user}`, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            let json = JSON.parse(body);
            if (typeof json == "object") {
                callback(json);
            } else {
                callback("Invalid JSON Response");
            }
        } else {
            callback("Invalid HTTPS Response");
        }
    });
*/

exports.getUser = (user, callback) => {
    fetch(`https://www.gizmo.moe/api/user?query=${user}`, callback);
}

exports.getFriends = (user, callback) => {
    fetch(`https://www.gizmo.moe/api/user?type=fetchFriends&key=${user}`, callback);
}
