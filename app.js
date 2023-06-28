require("express-async-errors");
require("dotenv")

const express = require("express");
const app = express();

// Function to connect to the database
const {connectToDatabase} = require("./database/connection");

// Importing Routers
const event = require("./routes/event");


// Importing error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');


app.use(express.urlencoded({extended:false}))
app.use(express.json());


// Routes
app.use("/api/v3/app", event);


// Checks if the route exists or not
app.use(notFoundMiddleware);

// handles error
app.use(errorHandlerMiddleware);


// Server start
async function startServer() {
    try {
        await connectToDatabase();
        
        app.listen(process.env.PORT, ()=>{
            console.log(`Server listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("Error -- ", error)
    }
}

startServer()