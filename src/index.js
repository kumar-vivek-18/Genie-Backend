import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
import userRoutes from './routes/userRoutes.js';
import retailerRoutes from './routes/retailerRoutes.js';
import chatRoutes from './routes/chatroutes.js';
import cors from 'cors';

dotenv.config({ path: './.env' });
const app = express();

app.use(express.json());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

const PORT = process.env.PORT || 5000;

connectDB().
    then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️  Server is running at port : ${process.env.PORT}`.yellow.bold);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })

app.get('/', (req, res) => {
    res.send('Welcome to CulturTap');
});

app.use('/user', userRoutes);
app.use('/retailer', retailerRoutes);
app.use('/chat', chatRoutes);  