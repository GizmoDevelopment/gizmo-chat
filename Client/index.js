const socket = require("socket.io-client").connect("http://localhost:3000", { transports: ["websocket"] });

console.log("Started");

socket.emit("auth", { userKey: "bruh" });

socket.on("response", res => {
    console.log(res);
});
