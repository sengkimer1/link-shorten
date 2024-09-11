const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const landingRoutes = require('./routes/landingRoutes');
const adminRouter = require('./routes/adminRouter');
const urlRoutes= require('./routes/urlRoutes');
const customRoutes = require('./routes/customRoutes')
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/api/shorten', landingRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/short',urlRoutes);
app.use('/api',customRoutes)

const PORT = process.env.PORT ;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
module.exports = app;
