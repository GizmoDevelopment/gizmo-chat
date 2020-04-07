// Main Modules //
const path = require("path");
const fs = require("fs");
const request = require("request");

// Server Modules //
const express = require("express");
const expressInstance = express();
const socket = require("socket.io");
const io = socket.listen(require("http").createServer(expressInstance).listen(3000)); // process.env.PORT || 3000

// Extra Modules //
const gizmo = require("./scripts/gizmo.js");
// const sanitizeHtml = require("sanitize-html") Don't forget to sanitize messages

// Server Values //
var onlineUsers = new Map();
var onlineSockets = new Map();

function manageUsers (act, key, data, socket) {
    if (act && typeof key === "string" && typeof data === "object") {
        switch (act) {
            case "add":

                onlineUsers.set(key, { ...data, userKey: key });
                onlineSockets.set(data.socketId, { ...socket, user: onlineUsers.get(key) });
                console.log(`${data.uid} has connected!`);

                break;
            case "remove":

                console.log(`${onlineUsers[key].uid} has disconnected!`);
                onlineSockets.delete(onlineUsers[key].socketId);
                onlineUsers.delete(key);

                break;
            default:
                break;
        }
    }
}

io.sockets.on("connection", socket => {

    socket.on("auth", client => {
        if (client.userKey && client.userKey != "") {
            gizmo.getUser(client.userKey, res => {
                if (typeof res.user == "object" && res.user.hasOwnProperty("id")) {
                    manageUsers("add", client.userKey, { socketId: socket.id, ...res.user }, socket);
                    socket.emit("response", { status: true, data: res.user });
                } else {
                    socket.emit("response", { status: false, reason: "Invalid UserKey Provided" });
                }
            });
        } else {
            socket.emit("response", { status: false, reason: "No UserKey Provided" });
        }
    });

    socket.on("data", (type, callback) => {
        if (onlineSockets.has(socket.id)) {

            var userKey = onlineSockets.get(socket.id).user.userKey;

            switch (type) {
                case "user:fetchFriendsList":

                    gizmo.getFriends(userKey, data => {
                        // socket.emit("data", "friendsList", data);
                        callback(data);
                    });

                    break;
                default:
                    break;
            }
        }
    });

    socket.on("disconnect", client => {
        if (onlineSockets.has(socket.id)) {
            manageUsers("remove", onlineSockets.get(socket.id).user.userKey);
        }
    });

});

console.log("Started");
