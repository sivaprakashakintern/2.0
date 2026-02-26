require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initWebSocket } = require('./ws/handler');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 CONFLUENZE Server running on port ${PORT}`);
    console.log(`📡 Accessible at: http://0.0.0.0:${PORT}`);
    console.log(`🔌 WebSocket ready\n`);
});
