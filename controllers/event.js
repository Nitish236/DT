require("dotenv")

// Import file module
const fs = require('fs').promises;

// Import ObjectId
const { ObjectId } = require("mongodb");

// Importing the status code library
const { StatusCodes } = require("http-status-codes");

// Importing the get DB instance 
const { getDB } = require("../database/connection");

// Importing the error hnadling function
const { BadRequestError, NotFoundError, DatabaseWriteError } = require("../errors/allErr");



//                                                  Functions start from here



                                /*           Get Events            */ 

const getEvents = async (req, res) => {
    const { id, type } = req.query;
    
    if(id){
        return getEventById(req, res);                //  To get event by Id
    }

    if(type==='latest'){
        return getLatestEvents(req, res);            //  Get latest events
    }

    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid query Parameters" });
}




                                /*           Get  Event  By  Id           */ 

const getEventById = async (req, res) => {
    const eventId = req.query.id;                   // Get the event Id from query 
    
    // Check if eventId is not null and valid
    if(!eventId || !ObjectId.isValid(eventId)){
        throw new BadRequestError("Invalid Event Id");
    }
    
    const db = getDB();                                            // Get DB instance
    const events = await db.collection(process.env.coll_Name);     // Get the collections

    const event = await events.findOne({ _id: new ObjectId(eventId) }, { projection: {uid: 0} } );  //  Find the event
    
    // If event does not exists
    if(!event){       
        throw new NotFoundError("No such event exists");
    }

    res.status(StatusCodes.OK).json({ msg:"Event", event });        //  Send the found event 
}



                                /*           Get  Latest  Events           */ 

const getLatestEvents = async (req, res) => {

    const { limit, page } = req.query;          //  Get the limit and page value from query
    
    if(isNaN(limit) || isNaN(page)) {          // Check if type is set or not
        throw new BadRequestError("Type, limit, page cannot be empty");
    }

    const pageNumber = parseInt(page) || 1;       // Take pageNumber as 1 by default if not provided
    const pageSize = parseInt(limit) || 5;        // Take number of events as 5 by default if not provided

    const skip = (pageNumber - 1) * pageSize;     // Skip the the already visted pages and go to the needed Page



    const db = getDB();
    const events = await db.collection(process.env.coll_Name);


    const latestEvents = await events.find({}, {uid: 0})             // Do not display uid
                                     .sort({ schedule: -1 })         // Sort on the basis of schedule i.e date and time
                                     .skip(skip)                     // Skip the required page
                                     .limit(pageSize)                // No events per page
                                     .toArray();                     // Convert to Array

      
    res.status(StatusCodes.OK).json({ msg: "Latest events", latestEvents });       // send the latest events
} 



                                /*           Create  Event            */ 

const createEvent = async (req, res) => {
    const { name, tagline, schedule, description, moderator, category, sub_category, rigor_rank} = req.body;
    
    const uid = req.query.uid;             // Get the uid from the query as we can get it as the user creates an event

    const attendees = ["23233", "3245344", "439489", "982983"];        //  Taking Default attendees as none is provided
    
    // Check if the required field is not empty
    if(!name || !tagline || !schedule || !description || !moderator || !category || !sub_category || !rigor_rank) {
        throw new BadRequestError("Fields cannot be empty");
    }

    const file = req.file;      // Get the image from the middleware
    
    // If image is not uploaded
    if(!file) {
        throw new BadRequestError("File not found");
    }
    
    const createdEvent = {
      type:"event",
      uid,
      name,
      tagline,
      schedule: new Date(schedule),   //  Convert the schedule date and time 
      description,
      image: file.path,               //   File path added 
      moderator,
      category,
      sub_category,
      rigor_rank,
      attendees,
    };
    
    const db = getDB();
    const events = await db.collection(process.env.coll_Name);
    
    // Try to insert the new event
    const newEvent = await events.insertOne(createdEvent);
    
    // If event cannot be inserted
    if(!newEvent){
        throw new DatabaseWriteError("Service not available");
    }
    
    // Send the id of the new event
    res.status(StatusCodes.OK).json({ msg:"New event created successfully", _id: newEvent.insertedId });    
}



                                /*           Update  Event  Details        */ 

const updateEvent = async (req, res) => {
    const eventId = req.params.id;               //  Get event id from params
    
    // Check if eventId is not null and valid
    if(!eventId || !ObjectId.isValid(eventId)){
        throw new BadRequestError("Invalid Event Id");
    }

    const { name, tagline, schedule, description, moderator, category, sub_category, rigor_rank} = req.body;
    
    const uid = req.query.uid;    //  Get the uid from the query as we can get it as the user creates an event         
    
    //  Check if the required fields are not empty
    if(!name || !tagline || !schedule || !description || !moderator || !category || !sub_category || !rigor_rank) {
        throw new BadRequestError("Fields cannot be empty");
    }

    const file = req.file;       // Get the new image
    
    //  If no image is uploaded
    if(!file) {
        throw new BadRequestError("File not found");
    }

    const eventData = {
        uid,
        name,
        tagline,
        schedule: new Date(schedule),   //  Convert the schedule date and time 
        description,
        image: file.path,               //   File path added 
        moderator,
        category,
        sub_category,
        rigor_rank,
    };
    
    const db = getDB();
    const events = await db.collection(process.env.coll_Name);
    
    // Find the event
    const event = await events.findOne({ _id: new ObjectId(eventId) });
    
    // If such event does not exists
    if(!event) {
        throw new NotFoundError("No such event exists");
    }

    if(event.image){                              //  Remove old image
        await fs.unlink(event.image);
    }

    const updatedEvent = { ...event, ...eventData };        //  Update the fields of the olf event

    // Try to update the event
    const result = await events.updateOne({ _id: new ObjectId(eventId) }, { $set: updatedEvent });
    
    // If the event cannot be updated
    if(result.modifiedCount !== 1) {
        throw new DatabaseWriteError("Service not available");
    }

    res.status(StatusCodes.OK).json({ msg:"Event updated successfully"});    //  Send the message of successful update operation
}



                               /*           Delete  Event          */ 

const deleteEvent = async (req, res) => {
    const eventId = req.params.id;          // Get event Id froms params
    
    // Check if eventId is not null and valid
    if(!eventId || !ObjectId.isValid(eventId)){
        throw new BadRequestError("Invalid Event Id");
    }

    const db = getDB();
    const events = await db.collection(process.env.coll_Name);
    
    //  Find the event by Id 
    const event = await events.findOne({ _id: new ObjectId(eventId) });
    
    //  If no such event exists
    if(!event) {
        throw new NotFoundError("No such event exists");
    }
    
    //  Delete the image from the Images\Events  (uploaded Image)
    if(event.image){
        await fs.unlink(event.image);
    }
    
    // Try to delete the event
    const result = await events.deleteOne({ _id: new ObjectId(eventId) });
    
    // If event cannot be deleted
    if(result.deletedEvent === 0){
        throw new DatabaseWriteError("Service not available.");
    }

    res.status(StatusCodes.OK).json({ msg: "Event deleted successfully" });   //  Send the message of successful delete operation
}


module.exports = { getEvents, createEvent, updateEvent, deleteEvent };