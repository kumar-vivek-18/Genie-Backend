
import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
import userRoutes from './routes/userRoutes.js';
import retailerRoutes from './routes/retailerRoutes.js';
import chatRoutes from './routes/chatroutes.js';
import couponRoutes from './routes/couponRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { Message } from './models/message.model.js';
import { Chat } from './models/chat.model.js';
import { User } from './models/user.model.js';
import { UserRequest } from './models/userRequest.model.js';
import { Retailer } from './models/retailer.model.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: './.env' });
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://173.212.193.109:5000' || 'http://192.168.212.192:5000',
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
app.use('/rating', ratingRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/upload', uploadRoutes);

// const options = {
//     key: fs.readFileSync(path.join(__dirname, '../privkey.pem')),
//     cert: fs.readFileSync(path.join(__dirname, '../fullchain.pem'))
//     // ca: fs.readFileSync(path.join(__dirname, 'relative/path/to/ca_bundle.pem'))
// };

// console.log('options', options);
// const server = https.createServer(options, app);

const server = http.createServer(app);

const io = new Server(server, {
    pingTimeout: 6000,
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://173.212.1937.109:5000',
        transports: ['websocket', 'polling'],
        methods: ["GET", "POST", "PATCH"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", ({ userId, senderId }) => {
        socket.join(userId);
        socket.userId = userId;
        console.log(`User with ID ${userId} has joined their personal room.`);
        if (senderId && io.sockets.adapter.rooms.has(senderId))
            socket.emit("connected", { value: true });
        else
            socket.emit("connected", { value: false });

        console.log(userId, senderId);
        if (userId !== senderId && senderId && io.sockets.adapter.rooms.has(senderId)) {
            socket.to(senderId).emit("online");
            setTimeout(() => {
                socket.to(userId).emit("online");
            }, 2000);

        }

        // const activeRooms = io.sockets.adapter.rooms;
        // console.log('Rooms while connecting')
        // activeRooms.forEach((value, roomName) => {
        //     console.log(roomName);
        // });
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User joined room: " + room);
    });

    socket.on("new message", (newMessageReceived) => {

        if (!newMessageReceived) return;

        const chat = newMessageReceived.chat;
        if (!newMessageReceived) return null;
        console.log('new message received', newMessageReceived?._id, newMessageReceived?.message);
        if (!chat?.users) return;
        // const activeRooms = io.sockets.adapter.rooms;

        // console.log("List of active rooms:");
        // activeRooms.forEach((value, roomName) => {
        //     console.log(roomName);
        // });
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Updating HomeScreen latest spade ordering

        // console.log('newMessageRecieved', newMessageReceived);

        const updateRequest = async () => {

            await UserRequest.findByIdAndUpdate(newMessageReceived.userRequest._id, { unread: true });
        }

        if (newMessageReceived.chat.users.length > 1 && io.sockets.adapter.rooms.has(newMessageReceived.chat.users[1]._id) === false && io.sockets.adapter.rooms.has(newMessageReceived.userRequest._id) === false && io.sockets.adapter.rooms.has(newMessageReceived.userRequest.customer) === true) {
            console.log('Message Send at HomeScreen');
            updateRequest();
            const updatedSpade = { _id: newMessageReceived?.userRequest?._id, bidAccepted: newMessageReceived?.bidAccepted, chatId: newMessageReceived?.chat?._id };
            // console.log(updatedSpade);
            socket.to(newMessageReceived.userRequest.customer).emit('update userspade', updatedSpade);
        }




        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



        // const updateTmpRequest = async () => {
        //     await UserRequest.findByIdAndUpdate(newMessageReceived.userRequest._id, { tmpUnread: false });
        // }



        // console.log('messType', newMessageReceived.bidType, newMessageReceived.bidAccepted);

        if (newMessageReceived.bidType === "true" && newMessageReceived.bidAccepted === "accepted") {
            const updateMessages = async () => {
                const messages = await Message.find({ bidType: "update", userRequest: newMessageReceived.userRequest._id }).populate('chat', '_id users');

                // console.log('hii', messages);
                await Promise.all(messages.map(async (message) => {
                    console.log('Message send successfully ', message.chat.users[0]._id);
                    if (io.sockets.adapter.rooms.has(message.chat.users[0]._id.toString()))
                        socket.to(message.chat.users[0]._id.toString()).emit("message received", message);
                }));
            }
            updateMessages();
            // console.log("updateMessages send successfully ", updateMessages);



        }

        chat.users.forEach(async (user) => {

            // const isOnline = await io.in(user._id).fetchSockets();

            // const retailer = await Chat.findByIdAndUpdate(
            //     newMessageReceived.chat,
            //     { latestMessage: newMessageReceived._id },
            //     { new: true }
            // );

            if (io.sockets.adapter.rooms.has(user._id)) {
                socket.to(user._id).emit("message received", newMessageReceived);
                console.log('Message data send at chatting screen with Id', user._id);

                // console.log('User is currently online');
            }
            else {
                if (user.type === newMessageReceived.sender.type) return;

                const receiver = await Chat.findByIdAndUpdate(
                    newMessageReceived.chat._id,
                    { $inc: { unreadCount: 1 } },
                    { new: true }
                ).populate('requestId').populate('customerId').populate('retailerId', '_id uniqueToken storeCategory storeOwnerName storeName longitude lattitude homeDelivery totalRating totalReview storeImages').populate('latestMessage', 'sender message bidType bidAccepted bidImages').lean();




                // console.log('User is not online', io.sockets.adapter.rooms.has(receiver.requestId.toString()));
                // console.log('mess send at chatId', newMessageReceived.chat._id, receiver._id, receiver.requestId);
                if (newMessageReceived.sender.type === 'Retailer') {
                    if (io.sockets.adapter.rooms.has(receiver.requestId._id.toString())) {
                        console.log('Send to requestDetail screen with Id ', io.sockets.adapter.rooms.has(receiver.requestId._id.toString()));
                        // console.log('receiver', receiver.requestId.toString());
                        socket.to(receiver.requestId._id.toString()).emit('updated retailer', receiver);
                    }
                    // if (io.sockets.adapter.rooms.has(receiver.requestId._id.toString()) === false)
                    //     updateRequest();
                }
                else {
                    if (io.sockets.adapter.rooms.has(receiver.retailerId._id.toString())) {
                        console.log(receiver.retailerId._id.toString(), io.sockets.adapter.rooms.has(receiver.retailerId._id.toString()));
                        socket.to(receiver.retailerId._id.toString()).emit('updated retailer', receiver);
                    }
                }
            }
        });

    });


    //////////////////////////////////////For Updating the new request of retailer app in realtime ////////////////////////////////////
    socket.on('new request', (requestId) => {

        // console.log('new request', requestId);
        const fetchChats = async () => {
            const chats = await Chat.find({ requestId: requestId }).populate('requestId').populate('customerId').populate('retailerId', '_id uniqueToken storeCategory storeOwnerName storeName longitude lattitude').populate('latestMessage', 'sender message bidType bidAccepted').lean();


            chats.forEach(async (chat) => {
                console.log('send request to ', chat.retailerId?._id);
                socket.to(chat.retailerId?._id.toString()).emit('fetch newRequest', chat);

            });
        }

        fetchChats();

    })

    //////////////////////////////////////////For updating the new user on user for particular spade////////////////////////////////////////////

    socket.on('new retailer', (retailer) => {
        // console.log('new retailer', retailer);
        socket.to(retailer.requestId._id).emit('updated retailer', retailer);
    });

    //////////////////////////////////For Leaving the personal room from the socket/////////////////////////////////////////////////////

    socket.on("leave room", ({ userId, senderId }) => {
        // Leave the specified room
        socket.leave(userId);
        console.log(`User lwith ID ${userId} has leaved their personal room`);

        if (io.sockets.adapter.rooms.has(senderId)) {
            socket.to(senderId).emit("offline");
        }
        // const activeRooms = io.sockets.adapter.rooms;
        // console.log('Rooms while leaving')
        // activeRooms.forEach((value, roomName) => {
        //     console.log(roomName);
        // });
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
