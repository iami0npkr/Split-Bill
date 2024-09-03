const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
  },
  roomKey: {
    type: String,
    required: true,
  },
  // Add additional fields here as needed in the future
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
