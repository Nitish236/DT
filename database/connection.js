require("dotenv").config()

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

// Database URL
const DB_URI = "mongodb+srv://"+process.env.DB_USER+":"+process.env.DB_PASS+"@"+process.env.CLUSTER+"mongodb.net/?retryWrites=true&w=majority"

// DB Instance
let db;

async function connectToDatabase(){
    try {
        const client = await MongoClient.connect(DB_URI, { useUnifiedTopology: true });
        db = client.db(process.env.DB_Name);
        
        console.log('Connected to Database --');
    } catch (err) {
        console.error('Error -- :', err);
        process.exit(1);
    }
}

function getDB(){
    return db;
}

module.exports = {connectToDatabase, getDB};
