const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const port = process.env.PORT || 8081;

// Set up middleware
app.use(cors());
app.use(bodyParser.json());

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Create temporary directories
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'output');

fs.ensureDirSync(UPLOAD_DIR);
fs.ensureDirSync(OUTPUT_DIR);

// Process images using the C++ program
app.post('/api/process', upload.fields([
  { name: 'foreground', maxCount: 1 },
  { name: 'background', maxCount: 1 }
]), (req, res) => {
  console.log('Received process request');
  
  if (!req.files || !req.files.foreground || !req.files.background) {
    console.error('Missing required files');
    return res.status(400).json({ error: 'Both foreground and background images are required.' });
  }

  const foregroundPath = req.files.foreground[0].path;
  const backgroundPath = req.files.background[0].path;
  const threshold = req.body.threshold || '40.5';
  
  console.log(`Processing with foreground: ${foregroundPath}`);
  console.log(`Processing with background: ${backgroundPath}`);
  console.log(`Threshold: ${threshold}`);
  
  const output1Path = path.join(OUTPUT_DIR, `output1-${Date.now()}.bmp`);
  const output2Path = path.join(OUTPUT_DIR, `output2-${Date.now()}.bmp`);

  // Path to the C++ executable
  const chromakeyPath = path.join(__dirname, '..', 'chromakey');
  console.log(`Chromakey executable: ${chromakeyPath}`);

  // Execute the C++ program
  const command = `${chromakeyPath} "${foregroundPath}" "${backgroundPath}" ${threshold} "${output1Path}" "${output2Path}"`;
  console.log(`Executing command: ${command}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: 'Failed to process images.' });
    }
    
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    
    console.log(`stdout: ${stdout}`);
    console.log(`Reading output files: ${output1Path}, ${output2Path}`);

    // Read output files and convert to base64
    try {
      const output1Data = fs.readFileSync(output1Path);
      const output2Data = fs.readFileSync(output2Path);
      
      console.log(`Successfully read output files. Sizes: ${output1Data.length}, ${output2Data.length}`);
      
      const output1Base64 = output1Data.toString('base64');
      const output2Base64 = output2Data.toString('base64');

      // Clean up temporary files
      fs.unlinkSync(foregroundPath);
      fs.unlinkSync(backgroundPath);
      fs.unlinkSync(output1Path);
      fs.unlinkSync(output2Path);

      console.log('Sending response to client');
      res.json({
        output1: output1Base64,
        output2: output2Base64
      });
    } catch (err) {
      console.error(`File read error: ${err.message}`);
      res.status(500).json({ error: 'Failed to read output files.' });
    }
  });
});

// Serve the frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 