const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
app.use(cors());
const authRoutes = require('./routes/auth.routes');
app.use(express.json());
const userRoutes=require('./routes/user.routes');

// Middleware for URL-encoded bodies (less common for APIs, but good practice)
app.use(express.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.json({ message: 'Welcome to the CarKeyper Node.js API.' })
});

//ROUTE INTEGRATION (The MVC Link)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    console.log('API endpoints are now accessible.');
});