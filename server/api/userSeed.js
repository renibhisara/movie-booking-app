const User = require('./models/User');
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');

const userRegister = async () => {
    await connectDB();
    try {
        const hashPassword = await bcrypt.hash('admin', 10);
        const newUser = new User({
            name: 'Admin',
            email: 'admin@gmail.com',
            password: hashPassword,
            role: 'admin'
        })
        await newUser.save();
        console.log(newUser);
    } catch (error) {
        console.log(error);
    }
}

userRegister();