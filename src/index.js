const express = require("express");
const path = require("path");
const http = require("http");
const Filter = require("bad-words");
const { Server } = require("socket.io");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const {
    addUser,
    getUser,
    getUsersInRoom,
    removeUser,
} = require("./utils/user");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const port = process.env.PORT || 3000;

/**
 * Set path for Express config
 */
const publicPath = path.join(__dirname, "../public");

/**
 * Setup static directory
 */
app.use(express.static(publicPath));

app.get("/", (req, res) => {
    res.render("index");
});

io.on("connection", (socket) => {
    console.log("New socket created");

    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error);
        }

        // socket.join(room) --> join to a room
        socket.join(room);

        // Welcome message
        socket.emit("message", generateMessage("Admin", "Welcome!"));

        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                generateMessage("Admin", `${username} has joined!`)
            );

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
        });

        // if console.log(123) in here --> print 123 in server terminal
        callback();
    });

    socket.on("sendMessage", (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback("Profanity is not allow!");
        }

        const user = getUser(socket.id);

        if (user) {
            io.to(user.room).emit(
                "message",
                generateMessage(user.username, message)
            );
            callback();
        }
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit(
                "message",
                generateMessage("Admin", `${user.username} has left!`)
            );

            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });

    socket.on("sendLocation", ({ longitude, latitude }, callback) => {
        const user = getUser(socket.id);

        if (user) {
            io.to(user.room).emit(
                "locationMessage",
                generateLocationMessage(
                    user.username,
                    `https://google.com/maps?q=${latitude},${longitude}`
                )
            );

            callback();
        }
    });
});

httpServer.listen(port, () => {
    console.log("Server is up on", port);
});
