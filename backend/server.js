const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;
const Room = require('./models/Room');
// Middleware to parse JSON requests
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://npkr_iami:1234@cluster0.i5i7lhw.mongodb.net/roomDB?retryWrites=true&w=majority&appName=Cluster0"
, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Could not connect to MongoDB:', err));

// Sample route to handle requests
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

function generateRoomNumber() {
  return Math.floor(100 + Math.random() * 900).toString(); // Generates a number between 100 and 999
}

// Helper function to generate a random 5-digit key
function generateRoomKey() {
  return Math.floor(10000 + Math.random() * 90000).toString(); // Generates a number between 10000 and 99999
}
// Route to handle finding a free room
// app.get('/api/find-free-room', (req, res) => {


//   // Mock data for room details
//   const roomDetails = {
//     roomNumber: '101',
//     key: 'xyz123',
//   };
//   res.json(roomDetails);
// });
app.get('/api/find-free-room', async (req, res) => {
  try {
    console.log("Finding a free room...");
    let roomNumber, roomExists;

    // Loop until a unique room number is found
    do {
      roomNumber = generateRoomNumber();
      console.log("Generated room number: ", roomNumber);
      roomExists = await Room.findOne({ roomNumber });
      console.log("Room exists: ", roomExists);
    } while (roomExists);

    // Generate a 5-digit key for the room
    const roomKey = generateRoomKey();
    console.log("Generated room key: ", roomKey);

    // Create a new room in the database
    const newRoom = new Room({ roomNumber, roomKey });
    await newRoom.save();
    console.log("New room saved: ", newRoom);

    // Send the room details back to the client
    res.json({ roomNumber: newRoom.roomNumber, key: newRoom.roomKey });
  } catch (error) {
    console.error("Error finding or creating a free room:", error.message);
    res.status(500).json({ error: 'Error finding or creating a free room', details: error.message });
  }
});



// Route to handle entering a room
// app.post('/api/enter-room', (req, res) => {
//   const { roomNumber, roomKey } = req.body;
//   if (!roomNumber || !roomKey) {
//     return res.status(400).json({ message: 'Room number and key are required.' });
//   }
  
//   // Logic to check room number and key would go here
//   // For now, just send a success message
//   if (roomNumber === '101' && roomKey === 'xyz123') {
//     res.status(200).json({ message: 'Room entered successfully!' });
//   } else {
//     res.status(400).json({ message: 'Invalid room number or key!' });
//   }
// });
app.post('/api/enter-room', async (req, res) => {
  const { roomNumber, roomKey } = req.body;
  if (!roomNumber || !roomKey) {
    return res.status(400).json({ message: 'Room number and key are required.' });
  }
  
  try {
    // Check if the room exists in the database
    const room = await Room.findOne({ roomNumber, roomKey });
    if (room) {
      // Generate a URL to access the specific room page
      const roomUrl = `http://localhost:3000/room/${roomNumber}`;
      res.status(200).json({ message: 'Room entered successfully!', room});
    } else {
      res.status(400).json({ message: 'Invalid room number or key!' });
    }
  } catch (error) {
    console.error('Error checking room details:', error);
    res.status(500).json({ message: 'Error checking room details', details: error.message });
  }
});
// app.post('/api/enter-room', async (req, res) => {
//   const { roomNumber, roomKey } = req.body;
//    console.log(req.body);
//   if (!roomNumber || !roomKey) {
//     return res.status(400).json({ message: 'Room number and key are required.' });
//   }

//   try {
//     const room = await Room.findOne({ number: roomNumber });

//     if (!room) {
//       return res.status(404).json({ message: 'Room not found.' });
//     }

//     if (room.key !== roomKey) {
//       return res.status(401).json({ message: 'Invalid room key.' });
//     }

//     // If room is found and key matches, redirect the user to the room
//     res.status(200).json({ message: 'Room entered successfully!', roomId: room._id });
//   } catch (err) {
//     console.error('Error entering room:', err);
//     res.status(500).json({ message: 'Internal server error.' });
//   }
// });

// app.get('/api/room/:roomId', async (req, res) => {
//   const { roomId } = req.params;

//   try {
//     const room = await Room.findById(roomId);

//     if (!room) {
//       return res.status(404).send('Room not found');
//     }

//     // Render a page or return JSON with the room details
//     res.status(200).json({ message: 'Room details', details: room.details });
//     // Or, for a web page:
//     // res.render('room-details', { room });
//   } catch (err) {
//     console.error('Error fetching room:', err);
//     res.status(500).send('Internal server error');
//   }
// });

// Endpoint to get room details by room number
app.get('/api/room/:roomNumber', async (req, res) => {
  const { roomNumber } = req.params;

  try {
    const room = await Room.findOne({ roomNumber });
    if (room) {
      res.status(200).json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    console.error('Error fetching room details:', error);
    res.status(500).json({ message: 'Error fetching room details', details: error.message });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
