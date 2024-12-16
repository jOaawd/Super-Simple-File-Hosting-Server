const express = require('express');
const path = require('path');
const multer = require('multer');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;

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

  // Construct the download link and subdomain URL
  const downloadLink = `${req.protocol}://${req.get('host')}/download/${req.file.filename}`;
  const subdomain = `${req.file.filename}`;

  // Send back the download link and subdomain URL to the frontend
  res.json({
    message: 'File uploaded successfully!',
    downloadLink: downloadLink,
    subdomain: subdomain
  });
});

// Serve download page for HTML files (treat them differently)
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);

  // Check file type to see if it's HTML
  const fileExt = path.extname(req.params.filename).toLowerCase();

  if (fileExt === '.html') {
    // If the file is an HTML file, set the correct header and force download
    res.setHeader('Content-Disposition', 'attachment; filename=' + req.params.filename);
    res.sendFile(filePath, (err) => {
      if (err) {
        return res.status(404).send('File not found.');
      }
    });
  } else {
    // For non-HTML files, serve them directly for download
    res.download(filePath, req.params.filename, (err) => {
      if (err) {
        return res.status(404).send('File not found.');
      }
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
