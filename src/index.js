// import express from 'express';
// import colors from 'colors';
// import dotenv from 'dotenv';
// import connectDB from './db/db.js';
// import userRoutes from './routes/userRoutes.js';
// import retailerRoutes from './routes/retailerRoutes.js';
// import chatRoutes from './routes/chatroutes.js';
// import cors from 'cors';

// dotenv.config({ path: './.env' });
// const app = express();

// app.use(express.json());

// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true
// }))

// const PORT = process.env.PORT || 5000;

// connectDB().
//     then(() => {
//         app.listen(process.env.PORT || 8000, () => {
//             console.log(`⚙️  Server is running at port : ${process.env.PORT}`.yellow.bold);
//         })
//     })
//     .catch((err) => {
//         console.log("MONGO db connection failed !!! ", err);
//     })

// app.get('/', (req, res) => {
//     res.send('Welcome to CulturTap');
// });

// app.use('/user', userRoutes);
// app.use('/retailer', retailerRoutes);
// app.use('/chat', chatRoutes);









import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
import userRoutes from './routes/userRoutes.js';
import retailerRoutes from './routes/retailerRoutes.js';
import chatRoutes from './routes/chatroutes.js';
import couponRoutes from './routes/couponRoutes.js';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { Message } from './models/message.model.js';
import { Chat } from './models/chat.model.js';
import { User } from './models/user.model.js';
import { UserRequest } from './models/userRequest.model.js';
import { Retailer } from './models/retailer.model.js';

dotenv.config({ path: './.env' });
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: "https://culturtap.com/api",
    credentials: true
}));

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to CulturTap');
});
app.use('/user', userRoutes);
app.use('/retailer', retailerRoutes);
app.use('/chat', chatRoutes);
app.use('/coupon', couponRoutes);

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 6000,
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST", "PATCH"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userId) => {
        socket.join(userId);
        socket.userId = userId;
        console.log(`User with ID ${userId} has joined their personal room.`);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User joined room: " + room);
    });

    socket.on("new message", (newMessageReceived) => {
        const chat = newMessageReceived.chat;
        console.log('new message received', newMessageReceived._id);
        if (!chat.users) return console.log("chat.users not defined");
        const activeRooms = io.sockets.adapter.rooms;

        console.log("List of active rooms:");
        activeRooms.forEach((value, roomName) => {
            console.log(roomName);
        });

        chat.users.forEach(async (user) => {
            if (user._id === newMessageReceived.sender._id) return;
            const isOnline = await io.in(user._id).fetchSockets();

            const retailer = await Chat.findOneAndUpdate(
                { _id: newMessageReceived.chat },
                { latestMessage: newMessageReceived._id },
                { new: true }
            );

            if (io.sockets.adapter.rooms.has(user._id)) {
                socket.to(user._id).emit("message received", newMessageReceived);
                console.log('User is currently online');
            }
            else {

                const receiver = await Chat.findOneAndUpdate(
                    { _id: newMessageReceived.chat },
                    { latestMessage: newMessageReceived._id, $inc: { unreadCount: 1 } },
                    { new: true }
                ).populate('requestId').populate('customerId').populate('retailerId', '_id uniqueToken storeCategory storeOwnerName storeName').populate('latestMessage', 'message bidType bidAccepted').lean();;
                // await Promise.all(receiver.map(async chat => {
                // Populate each user in the users array
                await Promise.all(receiver.users.map(async user => {
                    const model = user.type === 'UserRequest' ? UserRequest : Retailer;
                    // console.log('model', model);
                    user.populatedUser = await model.findById(user.refId);
                }));
                // }));

                console.log('Send to chat id is ', io.sockets.adapter.rooms.has(receiver.requestId._id.toString()));
                console.log('receiver', receiver.requestId.toString());
                // console.log('User is not online', io.sockets.adapter.rooms.has(receiver.requestId.toString()));
                // console.log('mess send at chatId', newMessageReceived.chat._id, receiver._id, receiver.requestId);
                socket.to(receiver.requestId._id.toString()).emit('updated retailer', receiver);
            }
        });
    });

    socket.on('read message', async (chatId) => {
        // await Chat.fi
        await Message.updateMany({ chat: chatId, read: false }, { read: true });
        await Chat.findOneAndUpdate(
            { _id: chatId },
            { $set: { "latestMessages.$.unreadCount": 0 } }
        );
    })

    // socket.on("typing", (room) => socket.to(room).emit("typing"));
    // socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

    socket.on("leave room", (roomToLeave) => {
        // Leave the specified room
        socket.leave(roomToLeave);
        console.log(`User lwith ID ${roomToLeave} has leaved their personal room`);
    });

    socket.on("disconnect", () => {

        if (socket.userId) {
            console.log("USER DISCONNECTED with id: ", socket.userId);
            socket.leave(socket.userId);

        }
        // if (socket.rooms) {
        //     for (let room in socket.rooms) {
        //         if (room !== socket.id) { // Avoid leaving the socket's own ID room
        //             socket.leave(room);
        //             console.log(`User left room: ${room}`);
        //         }
        //     }
        // }
    });
    // socket.off("setup", (userId) => {
    //     console.log("USER DISCONNECTED");
    //     socket.leave(userId);
    // });
});


// io.on("connection", (socket) => {
//     console.log("Connected to socket.io");

//     socket.on("setup", (userId) => {
//         socket.join(userId);
//         socket.userId = userId; // Store the userId in the socket object
//         console.log(`User with ID ${userId} has joined their personal room.`);
//         socket.emit("connected");
//     });

//     socket.on("join chat", (room) => {
//         socket.join(room);
//         console.log("User joined room: " + room);
//     });

//     socket.on("new message", (newMessageReceived) => {
//         const chat = newMessageReceived.chat;
//         console.log('new message received', newMessageReceived);
//         if (!chat.users) return console.log("chat.users not defined");

//         chat.users.forEach((user) => {
//             if (user._id === newMessageReceived.sender._id) return;

//             socket.to(user._id).emit("message received", newMessageReceived);
//         });
//     });

//     // socket.on("typing", (room) => socket.to(room).emit("typing"));
//     // socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

//     socket.on("disconnect", () => {
//         console.log("USER DISCONNECTED");
//         if (socket.userId) {
//             socket.leave(socket.userId);
//         }
//     });
// });




// Connect to the database and start the server
connectDB()
    .then(() => {
        server.listen(5000, '0.0.0.0', () => {
            console.log('Server is running on port 5000');
        });

    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });
