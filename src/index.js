import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
import userRoutes from './routes/userRoutes.js';
import retailerRoutes from './routes/retailerRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config({ path: './.env' });
const app = express();

app.use(express.json());

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
    res.send('Hello World');
});

app.use('/user', userRoutes);
app.use('/retailer', retailerRoutes);
app.use('/chat', chatRoutes);