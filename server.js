const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nanoid = require('nanoid');
const app = express();

// Set up the storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads'); // Store files in the 'uploads' folder
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = nanoid.nanoid(); // Generate a unique file name
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Add original file extension
    }
});

const upload = multer({ storage: storage });

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static('uploads'));

// Serve the upload page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
    const uploadedFile = req.file;
    const downloadLink = `/download/${uploadedFile.filename}`;
    const fileName = uploadedFile.originalname;

    // Return an HTML page with the download link
    res.send(`
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>File Upload Successful</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 40px;
                    background-color: #f4f7fc;
                }
                h1 {
                    color: #4e73df;
                }
                .download-btn {
                    padding: 12px 30px;
                    background-color: #28a745;
                    color: white;
                    font-size: 18px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    text-decoration: none;
                    margin-top: 20px;
                    display: inline-block;
                    transition: background-color 0.3s ease;
                }
                .download-btn:hover {
                    background-color: #218838;
                }
                .download-btn:active {
                    background-color: #1e7e34;
                }
                .file-name {
                    margin-top: 20px;
                    color: #555;
                    font-weight: 500;
                }
            </style>
        </head>
        <body>
            <h1>File Upload Successful!</h1>
            <p>Your file has been uploaded successfully. Click the button below to download it:</p>
            <a href="${downloadLink}" class="download-btn">Download ${fileName}</a>
            <div class="file-name">File name: ${fileName}</div>
        </body>
        </html>
    `);
});

// Serve file downloads
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    res.download(filePath); // Trigger the download
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
