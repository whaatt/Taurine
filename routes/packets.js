//controllers are organized into dir structure
var controller = require('../controllers/index')

//these controllers will spit files
var packets = controller.packets;

//export this at the bottom
var express = require('express');
var router = express.Router();
    
    //unspecified route defaults to HTML presentation
    router.get('/sets/:SID/packets/:PID', packets.HTML);
    
    router.get('/sets/:SID/packets/:PID/HTML', packets.HTML);
    router.get('/sets/:SID/packets/:PID/PDF', packets.PDF);
    router.get('/sets/:SID/packets/:PID/DOC', packets.DOC);

//expose the API router
module.exports = router;