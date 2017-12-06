var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Assignment = require('./assignment');

const app = express();

// instantiate mongoose
mongoose.Promise = global.Promise;
var options = {
    useMongoClient: true,
    user: 'esame',
    pass: 'esame'
  };

mongoose.connect('mongodb://esame:esame@ds133296.mlab.com:33296/prova_esame', options);
const db = mongoose.connection;
db.on('error', err => {
  console.error(`Error while connecting to DB: ${err.message}`);
});
db.once('open', () => {
  console.log('DB connected successfully!');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 5000;

var router = express.Router();

router.get('/', function (req, res) {
    res.json({ message: 'welcome to my api!' });
});

router.route('/assignments')

    .post(function (req, res) {
        // create a new instance of the Bear model
        var assignment = new Assignment();
        // set the bears name (comes from the request)
        assignment.studentID = req.body.studentID;
        assignment.assignmentID = req.body.assignmentID;
        assignment.assignmentContent = req.body.assignmentContent;

        // save the bear and check for errors
        assignment.save(function (err) {
            if (err) { res.send(err); }
            res.json(assignment);
        });

    })
    
    .get(function (req, res) {
        Assignment.find(function (err, assignment) {
            if (err) { res.send(err); }
            res.json(assignment);
        });
    
    
    });

router.route('/assignments/:assignment_id')

    // get the bear with that id
    // (accessed at GET http://localhost:8080/api/bears/:bear_id)
    .get(function (req, res) {
        Assignment.find({
            assignmentID: req.params.assignment_id
        }, function (err, assignment) {
            if (err) { res.send(err); }
            res.json(assignment);
        });
    })

    // update the bear with this id
    // (accessed at PUT http://localhost:8080/api/bears/:bear_id)
    .put(function (req, res) {

        // use our bear model to find the bear we want
        Assignment.find({
            assignmentID: req.params.assignment_id
        }, function (err, assignment) {
            if (err) { res.send(err); }
            
            assignment[0].assignmentContent = req.body.assignmentContent;
            // save the bear
            assignment[0].save(function (err) {
                if (err) { res.send(err); }
                res.json(assignment);
            });

        });
    })

    // delete the bear with this id
    // (accessed at DELETE http://localhost:8080/api/bears/:bear_id)
    .delete(function (req, res) {
        Assignment.remove({
            assignmentID: req.params.assignment_id
        }, function (err, assignment) {
            if (err) { res.send(err); }
            res.json({ message: 'Successfully deleted' });
        });
    });

app.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    //Enabling CORS
    res.header('Access-Control-Allow-Origin', '*'); //così ignora le politiche del browser del cross-origin
    //se non ci fosse questa intestazione il browser bloccherebbe le chiamate "cross dominio"
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Content-Type', 'application/json');
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE'); //in questo modo io dico al browser quali metodi sono supportati su questo dominio
        return res.status(200).json({});
    }
    // make sure we go to the next routes
    next();
});

app.use('/api', router);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({ error: { message: err.message } });
});


app.listen(port);