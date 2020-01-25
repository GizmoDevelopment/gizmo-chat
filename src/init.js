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
var onlineUsers = {};
var onlineSockets = {};

function manageUsers (act, key, data, socket) {
    if (act && typeof key == "string") {
        switch (act) {
            case "add":

                onlineUsers[key] = { ...data, userKey: key };
                onlineSockets[data.socketId] = { ...socket, user: onlineUsers[key] };
                console.log(`${data.uid} has connected!`);

                break;
            case "remove":

                console.log(`${onlineUsers[key].uid} has disconnected!`);
                delete onlineSockets[onlineUsers[key].socketId];
                delete onlineUsers[key];

                break;
            default:
                break;
        }
    }
}

io.sockets.on("connection", socket => {

    console.log("Socket Connected");

    socket.on("auth", client => {
        if (client.userKey && client.userKey != "") {
            gizmo.getUser(client.userKey, res => {
                if (typeof res.user == "object" && res.user.hasOwnProperty("id")) {
                    manageUsers("add", client.userKey, { ...res.user, socketId: socket.id }, socket);
                    socket.emit("response", { status: true });
                } else {
                    socket.emit("response", { status: false, reason: "Invalid UserKey Provided" });
                }
            });
        } else {
            socket.emit("response", { status: false, reason: "No UserKey Provided" });
        }
    });

    socket.on("data", (type, data) => {

        let userKey = onlineSockets[socket.id].user.userKey;

        switch (type) {
            case "user:fetchFriendsList":

                gizmo.getFriends(userKey, data => {
                    socket.emit("data", "friendsList", data);
                });

                break;
            default:
                break;
        }
    });

    socket.on("disconnect", client => {
        if (onlineSockets[socket.id]) {
            manageUsers("remove", onlineSockets[socket.id].user.userKey);
        }
    });

});

console.log("Started");
