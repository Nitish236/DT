const express = require("express");
const router = express.Router();

const {
    createEvent,
    updateEvent,
    deleteEvent,
    getEvents
} = require("../controllers/event");


// upload the image
const upload = require("../utils/upload");


router.route("/events")
      .get(getEvents)
      .post(upload.single('event_Image'), createEvent)
      

router.route("/events/:id")
      .put(upload.single('event_Image'), updateEvent)
      .delete(deleteEvent);


module.exports = router;

