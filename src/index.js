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
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config({ path: './.env' });
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to CulturTap');
});
app.use('/user', userRoutes);
app.use('/retailer', retailerRoutes);
app.use('/chat', chatRoutes);

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
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
        console.log(`User with ID ${userId} has joined their personal room.`);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User joined room: " + room);
    });

    socket.on("new message", (newMessageReceived) => {
        const chat = newMessageReceived.chat;
        console.log('new message received', newMessageReceived);
        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) return;

            socket.to(newMessageReceived.chat._id).emit("message received", newMessageReceived);
        });
    });

    // socket.on("typing", (room) => socket.to(room).emit("typing"));
    // socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userId);
    });
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
        server.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️  Server is running at port: ${process.env.PORT}`.yellow.bold);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });
