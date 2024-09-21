const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();// const moment = require('moment-timezone'); // Import moment-timezone

const authRoutes = require('./routes/authRoutes');
const landingRoutes = require('./routes/landingRoutes');
const adminRouter = require('./routes/adminRouter');
const urlRoutes = require('./routes/urlRoutes');
const customRoutes = require('./routes/customRoutes');
const adminReport = require('./routes/adminReport');
const profile = require('./routes/profile');

const app = express();

app.use(cors());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//     const currentTimeInBangkok = moment().tz('Asia/Bangkok').format();
//     next();
// });

app.use('/auth', authRoutes);
app.use('/api/shorten', landingRoutes);
app.use('/api', adminRouter);
app.use('/api/short', urlRoutes);
app.use('/api/custom', customRoutes);
app.use('/api/admin', adminReport);
app.use('/api',profile);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
