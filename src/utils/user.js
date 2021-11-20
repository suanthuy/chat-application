const users = [];

/**
 * addUser, removeUser, getUser, getUsersInRoom
 */

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: "Username and room are required",
            user: undefined,
        };
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room;
    });

    // Validate username
    if (existingUser) {
        return {
            error: "Username is in use!",
            user: undefined,
        };
    }

    // Store user
    const user = { id, username, room };
    users.push(user);
    return { error: undefined, user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    });

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id;
    });

    return user;
};

const getUsersInRoom = (room) => {
    const userInRoom = users.filter((user) => {
        return user.room === room;
    });

    return userInRoom;
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
};
