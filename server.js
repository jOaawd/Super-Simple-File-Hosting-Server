const express = require('express');
const path = require('path');
const multer = require('multer');
const { nanoid } = require('nanoid'); // You can use it directly without issues.
const fs = require('fs');  // <-- Importing fs module

const app = express();
const PORT = process.env.PORT || 10000;  // Use port 10000 for Render, or 3000 for local development

// Set up the storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Ensure files are saved in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded file
    cb(null, nanoid() + path.extname(file.originalname));
  }
});

// Initialize multer with the storage settings
const upload = multer({ storage });

// Serve static files (like HTML, CSS, JS) from 'public' folder
app.use(express.static('public'));

// Handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Construct the download page URL and file information
  const downloadPage = `${req.protocol}://${req.get('host')}/download/${req.file.filename}`;
  const fileName = req.file.filename;

  console.log(`File uploaded: ${req.file.filename}`); // Log the file upload for debugging

  // Send back the download link and the download page URL to the frontend
  res.json({
    message: 'File uploaded successfully!',
    downloadLink: downloadPage,
    fileName: fileName
  });
});

// Serve the download page for files
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Download File</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  text-align: center;
                  margin-top: 50px;
              }
              button {
                  padding: 10px 20px;
                  font-size: 16px;
                  background-color: #007bff;
                  color: white;
                  border: none;
                  cursor: pointer;
              }
              button:hover {
                  background-color: #0056b3;
              }
          </style>
      </head>
      <body>
          <h1>Download Your File</h1>
          <p>File Name: ${req.params.filename}</p>
          <button onclick="window.location.href='/downloadfile/${req.params.filename}'">Download Now</button>
      </body>
      </html>
    `);
  } else {
    res.status(404).send('File not found.');
  }
});

// Serve the file download
app.get('/downloadfile/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);

  // Check if the file exists before sending
  res.sendFile(filePath, {
    headers: {
      'Content-Disposition': 'attachment; filename="' + req.params.filename + '"', // Force download
      'Content-Type': 'application/octet-stream' // Ensure the browser treats it as a file
    }
  }, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      return res.status(404).send('File not found.');
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
