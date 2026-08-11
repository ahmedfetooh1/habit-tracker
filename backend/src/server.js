const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const passport = require('./config/passport.js'); 
const connectDB = require('./config/db.js');
const { errorHandler } = require('./middlewares/errorMiddleware.js');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize()); 

// API Routes
app.use('/api/auth', require('./routes/authRoutes.js'));
app.use('/api/habits', require('./routes/habitRoutes.js'));

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});