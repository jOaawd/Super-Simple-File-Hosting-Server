const express = require('express');
const path = require('path');
const multer = require('multer');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up the storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Save files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using nanoid and append the file extension
    cb(null, nanoid() + path.extname(file.originalname));
  }
});

// Initialize multer with the storage settings
const upload = multer({ storage });

// Serve static files from the 'public' directory (for frontend)
app.use(express.static('public'));

// Route to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  // Return the unique filename as a response (for front-end use)
  res.send({ file: req.file.filename });
});

// Route to serve uploaded files
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('File not found.');
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
