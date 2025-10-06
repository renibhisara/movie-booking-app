const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
connectDB();

app.use(express.json());

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const showRouter = require('./routes/showRoute');
app.use('/api/show', showRouter);

const bookingRouter = require('./routes/bookingRoutes');
app.use('/api/booking', bookingRouter);

const adminRouter = require('./routes/adminRoutes');
app.use('/api/admin', adminRouter);

const userRouter = require('./routes/userRoutes');
app.use('/api/user', userRouter); 

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});