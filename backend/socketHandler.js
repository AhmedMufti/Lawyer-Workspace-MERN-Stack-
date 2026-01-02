const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const ChatRoom = require('./models/ChatRoom');

let io;

exports.init = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Auth Middleware for Socket
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.token;
            if (!token) return next(new Error('Authentication error'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (!user) return next(new Error('User not found'));

            socket.user = user;
            next();
        } catch (err) {
            console.error('Socket auth error:', err.message);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.firstName} (${socket.user._id})`);

        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.user.firstName} joined room: ${roomId}`);
        });

        socket.on('leave_room', (roomId) => {
            socket.leave(roomId);
            console.log(`User ${socket.user.firstName} left room: ${roomId}`);
        });

        socket.on('send_message', async (data) => {
            try {
                const { roomId, content } = data;

                // Save to DB
                const message = await Message.create({
                    content,
                    sender: socket.user._id,
                    room: roomId
                });

                // Update Room Stats
                await ChatRoom.findByIdAndUpdate(roomId, {
                    lastMessageAt: Date.now(),
                    $inc: { messageCount: 1 }
                });

                // Populate sender for display
                await message.populate('sender', 'firstName lastName profilePicture');

                // Emit to room (including self)
                io.to(roomId).emit('receive_message', message);
            } catch (error) {
                console.error('Message send error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.firstName}`);
        });
    });
};

exports.getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
