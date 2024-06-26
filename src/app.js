require('dotenv').config();
const express = require('express');
const path = require('path');
const Airtable = require('airtable');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Set up views directory and view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Airtable configuration 
const base = new Airtable({
    apiKey: process.env.AIRTABLE_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID);

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const portfolioRoutes = require('./routes/portfolio');
const indexRoutes = require('./routes/index');

// Use routes
app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', portfolioRoutes);
app.use('/', indexRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});