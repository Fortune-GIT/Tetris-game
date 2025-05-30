const fs = require('fs'); // File system module
const http = require('http'); // HTTP module
const path = require('path'); // Path module

const hostname = '0.0.0.0'; // Server hostname
const port = 3000; // Server port

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url; // Get the file path from the request URL
    if (filePath === './' || filePath === './index.html') {
        filePath = './index.html'; // Default to index.html if no file is specified
    }

    const extname = String(path.extname(filePath)).toLowerCase(); // Get the file extension
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.mp3': 'audio/mpeg',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream'; // Get the content type based on the file extension

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.error(`File not found: ${filePath}`); // Log file not found error
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found', 'utf-8'); // Respond with 404 error
            } else {
                console.error(`Server error: ${error.code}`); // Log server error
                res.writeHead(500);
                res.end('Server Error: ' + error.code, 'utf-8'); // Respond with 500 error
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8'); // Respond with the file content
        }
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://localhost:${port}/`); // Log server start
});





