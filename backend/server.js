const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend hosting (both local development and Vercel production)
app.use(cors());

// Parse JSON request payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure uploads directories exist on bootstrap
const uploadsDir = path.join(__dirname, 'uploads');
const logosDir = path.join(uploadsDir, 'logos');
const fontsDir = path.join(uploadsDir, 'fonts');
const templatesDir = path.join(uploadsDir, 'templates');

[uploadsDir, logosDir, fontsDir, templatesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer Storage for custom assets uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'font') {
      cb(null, fontsDir);
    } else if (file.fieldname === 'template') {
      cb(null, templatesDir);
    } else {
      cb(null, logosDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// Serve uploads folder static assets
app.use('/uploads', express.static(uploadsDir));

async function startServer() {
  try {
    // Initialise SQLite Database
    const db = await initializeDatabase();

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', message: 'Jersey Customizer API is live!', time: new Date() });
    });

    // Asset uploads endpoints
    app.post('/api/upload/logo', upload.single('logo'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/logos/${req.file.filename}`;
      res.json({ message: 'Logo uploaded successfully', fileUrl, fileName: req.file.originalname });
    });

    app.post('/api/upload/font', upload.single('font'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/fonts/${req.file.filename}`;
      res.json({ message: 'Font uploaded successfully', fileUrl, fileName: req.file.originalname });
    });

    app.post('/api/upload/template', upload.single('template'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/templates/${req.file.filename}`;
      res.json({ message: 'Template uploaded successfully', fileUrl, fileName: req.file.originalname });
    });

    // Mount core database routing controllers
    app.use('/api/designs', require('./routes/designs')(db));
    app.use('/api/orders', require('./routes/orders')(db));
    app.use('/api/admin', require('./routes/admin')(db));
    app.use('/admin/db', require('./routes/admin')(db));

    // Handle 404 Routing
    app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint route not found' });
    });

    app.listen(PORT, () => {
      console.log(`Server executing at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to bootstrap:', error);
    process.exit(1);
  }
}

startServer();
