const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const vehicleRoutes= require('./routes/vehicle.routes')
app.use(express.json());
const userRoutes=require('./routes/user.routes');

// Angular port
const clientOrigin = 'http://localhost:4200';

const corsOptions = {
  origin: clientOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these methods
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'], // Crucial for JWTs
  credentials: true // Allow cookies/authorization headers
};
app.use(cors(corsOptions));
// Middleware for URL-encoded bodies (less common for APIs, but good practice)
app.use(express.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.json({ message: 'Welcome to the CarKeyper Node.js API.' })
});

//ROUTE INTEGRATION (The MVC Link)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    console.log('API endpoints are now accessible.');
});