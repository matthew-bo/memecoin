const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// For any request that doesn't match a static file, send back index.html
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
  console.log(`PDF available at http://localhost:${PORT}/public/docs/whitepaper.pdf`);
}); 