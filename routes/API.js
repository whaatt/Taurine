//controllers are organized into dir structure
var controller = require('../controllers/index')

//get the JSON file for the package
var packInfo = require('../package.json');

var user = controller.user;
var sets = controller.sets;

//export this at the bottom
var express = require('express');
var router = express.Router();
    
    //send API version on null request
    router.get('/', function(req, res) {
        res.send({'version' : packInfo.version});
    });
    
    /* User Routes */
    
        router.post('/user', user.create); //create a new user
        router.get('/user/confirm/:UID/:CID', user.confirm); //confirm
        
        router.post('/user/login', user.login); //login user
        router.post('/user/logout', user.logout); //logout user
        router.post('/user/forgot', user.forgot); //forgot password
        
        router.get('/user', user.info); //get your own info
        router.post('/user/edit', user.edit); //edit user
        
        //TODO: user notifications
        //TODO: user global stats
    
    /* Set Routes */
    
        router.get('/sets', sets.all); //get all your sets
        router.post('/sets', sets.create); //create new set
        
        router.get('/sets/:SID', sets.set.info); //get set info
        router.put('/sets/:SID', sets.set.edit); //edit a set
        router.delete('/sets/:SID', sets.set.remove); //remove set
        
        router.get('/sets/:SID/role', sets.set.role); //get your role in a set
        router.get('/sets/:SID/schema', sets.set.schema); //get set schema
        router.get('/sets/:SID/subjects', sets.set.subjects); //get set subjects
        router.get('/sets/:SID/stats', sets.set.stats); //get set statistics
        
        router.get('/sets/:SID/members', sets.set.members.info); //get members info
        router.put('/sets/:SID/members/:MID', sets.set.members.edit); //edit a member
        
        router.get('/sets/:SID/tossups', sets.set.tossups.info); //get set TU info
        router.get('/sets/:SID/tossups/:TID', sets.set.tossups.get); //get specific TU
        router.post('/sets/:SID/tossups', sets.set.tossups.create); //create new TU
        router.put('/sets/:SID/tossups/:TID', sets.set.tossups.edit); //edit existing TU
        router.delete('/sets/:SID/tossups/:TID', sets.set.tossups.remove); //remove TU
        
        router.post('/sets/:SID/tossups/:TID/message', sets.set.tossups.message.create); //add message to TU
        router.delete('/sets/:SID/tossups/:TID/message/:MID', sets.set.tossups.message.remove); //remove message
        
        router.get('/sets/:SID/bonuses', sets.set.bonuses.info); //get set BN info
        router.get('/sets/:SID/bonuses/:BID', sets.set.bonuses.get); //get specific BN
        router.post('/sets/:SID/bonuses', sets.set.bonuses.create); //create new BN
        router.put('/sets/:SID/bonuses/:BID', sets.set.bonuses.edit); //edit existing BN
        router.delete('/sets/:SID/bonuses/:BID', sets.set.bonuses.remove); //remove BN
        
        router.post('/sets/:SID/bonuses/:BID/message', sets.set.bonuses.message.create); //add message to BN
        router.delete('/sets/:SID/bonuses/:BID/message/:MID', sets.set.bonuses.message.remove); //remove message
        
        router.post('/sets/:SID/packets', sets.set.packets.create); //create packets
        router.get('/sets/:SID/packets', sets.set.packets.info); //get all packets
        
        //TODO: import handler
        //TODO: duplicate search
        //POSS: get specific packet

//expose the API router
module.exports = router;