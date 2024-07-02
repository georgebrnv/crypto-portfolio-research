const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const redis = require('redis');
const connectRedis = require('connect-redis');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Json body parser
app.use(bodyParser.json());

// Parse data 
app.use(express.urlencoded({ extended: true }));

// Set up views directory and view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Connect with Redis sessions
const RedisStore = connectRedis(session);

// Connect with Redis sessions
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});

// Configure Session middleware
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, 
        httpOnly: false,
        maxAge: 1000 * 60 * 10 // session max age in miliseconds
    }
}));

// Set up flash messages
app.use(flash());

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const portfolioRoutes = require('./routes/portfolio');
const indexRoutes = require('./routes/index');
const walletRoutes = require('./routes/wallet');
const researchRoutes = require('./routes/research');

// Use routes
app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', portfolioRoutes);
app.use('/', indexRoutes);
app.use('/', walletRoutes);
app.use('/', researchRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});