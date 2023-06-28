require("express-async-errors");

const express = require("express");
const app = express();

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


// Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


// Server start
async function startServer() {
    try {
        await connectToDatabase();
        
        app.listen(3000, ()=>{
            console.log("Server listening on port 3000");
        })
    } catch (error) {
        console.log("Error -- ", error)
    }
}

startServer()