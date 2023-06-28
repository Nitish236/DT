require("dotenv")

const { ObjectId } = require("mongodb");
const { StatusCodes } = require("http-status-codes");
const { getDB } = require("../database/connection");
const { BadRequestError, NotFoundError, CustomAPIError } = require("../errors/allErr");


const getEventById = async (req, res) => {
    const eventId = req.query.id;
    
    console.log(eventId)
    if(!eventId){
        throw new BadRequestError("Event ID cannot be empty");
    }
    
    const db = getDB();
    const events = await db.collection(process.env.coll_Name);

    const event = await events.findOne({ _id: new ObjectId(eventId) });
    
    if(!event){
        throw new NotFoundError("No such event exists");
    }

    res.status(StatusCodes.OK).json({msg:"Event", event});
}



const getLatestEvents = async (req, res) => {
    
    if(req.query.type !== 'latest') {
        getEventById(req, res);
        return ; 
    }

    const { limit, page } = req.query;

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 5;

    const skip = (pageNumber - 1) * pageSize;



    const db = getDB();
    const events = await db.collection(process.env.coll_Name);

    const latestEvents = await events.find({}, {uid: 0})
                                     .sort({ schedule: -1 })
                                     .skip(skip)
                                     .limit(pageSize)
                                     .toArray();

      
    res.status(StatusCodes.OK).json({ msg: "Latest events", latestEvents });
} 


const createEvent = async (req, res) => {
    const { name, tagline, schedule, description, moderator, category, sub_category, rigor_rank} = req.body;
    
    const uid = req.query.uid;

    const attendees = ["23233", "3245344", "439489", "982983"];              // Default
    
    console.log(req.body);
    if(!name || !tagline || !schedule || !description || !moderator || !category || !sub_category || !rigor_rank) {
        throw new BadRequestError("Fields cannot be empty");
    }

    const file = req.file;

    if(!file) {
        throw new BadRequestError("File not found");
    }
    
    let filePath = file.path;
    
    const createdEvent = {
      type:"event",
      uid,
      name,
      tagline,
      schedule: new Date(schedule),
      description,
      image: filePath,
      moderator,
      category,
      sub_category,
      rigor_rank,
      attendees,
    };
    
    //console.log(createdEvent.schedule);
    const db = getDB();
    const events = await db.collection(process.env.coll_Name);

    const newEvent = await events.insertOne(createdEvent);
    
    console.log(newEvent);
    if(!newEvent){
        throw new CustomAPIError("Server error");
    }

    res.status(StatusCodes.OK).json({ msg:"New event created", newEvent });
}


const updateEvent = async (req, res) => {
    const eventId = req.params.id;

    if(!eventId){
        throw new BadRequestError("Event field is empty.");
    }

    const { name, tagline, schedule, description, moderator, category, sub_category, rigor_rank} = req.body;
    
    const uid = req.query.uid;
    
    //console.log(req.body);
    if(!name || !tagline || !schedule || !description || !moderator || !category || !sub_category || !rigor_rank) {
        throw new BadRequestError("Fields cannot be empty");
    }

    const file = req.file;

    if(!file) {
        throw new BadRequestError("File not found");
    }

    const filePath = file.path;

    const eventData = {
        uid,
        name,
        tagline,
        schedule: new Date(schedule),
        description,
        image: filePath,
        moderator,
        category,
        sub_category,
        rigor_rank,
    };
    
    const db = getDB();
    const events = await db.collection(process.env.coll_Name);

    const event = await events.findOne({ _id: new ObjectId(eventId) });

    if(!event) {
        throw new NotFoundError("No such event exists");
    }

    const updatedEvent = { ...event, ...eventData };
    const result = await events.updateOne({ _id: new ObjectId(eventId) }, { $set: updatedEvent });

    if(result.modifiedCount !== 1) {
        throw new CustomAPIError("Server Error");
    }

    res.status(StatusCodes.OK).json({ msg:"Event updated successfully"});
}



module.exports = {getEventById, getLatestEvents, createEvent, updateEvent};