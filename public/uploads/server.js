const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');
const app = express();

// Set up file upload destination
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = nanoid();
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve static files (uploaded files)
app.use('/uploads', express.static(uploadDir));

// Home route with file upload form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const subdomain = nanoid();
    const fileUrl = `http://${subdomain}.localhost:3000/uploads/${req.file.filename}`;

    // Create a DNS-like mapping (this is for local testing)
    const subdomainMapping = `${subdomain}.localhost`;

    // Normally, you'd update a database here with the mapping for the subdomain

    res.json({
        message: 'File uploaded successfully!',
        fileUrl: fileUrl,
        subdomain: subdomain,
    });
});

// Redirect subdomain to the file URL
app.get('/:subdomain', (req, res) => {
    const subdomain = req.params.subdomain;
    const filePath = path.join(uploadDir, subdomain);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
