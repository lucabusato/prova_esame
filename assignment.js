var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AssignmentSchema = new Schema({
    studentID: String,
    assignmentID: String,
    assignmentContent: String
});

module.exports = mongoose.model('Assignment', AssignmentSchema);