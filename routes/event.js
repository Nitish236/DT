const express = require("express");
const router = express.Router();

const {
    getLatestEvents,
    createEvent,
    updateEvent,
} = require("../controllers/event");


const upload = require("../utils/upload");


router.route("/events")
      .get(getLatestEvents)
      .post(upload.single('event_Image'), createEvent)
      

router.route("/events/:id")
      .put(upload.single('event_Image'), updateEvent)


module.exports = router;

