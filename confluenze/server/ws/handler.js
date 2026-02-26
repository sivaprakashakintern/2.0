const WebSocket = require('ws');

let wss = null;
const adminClients = new Set();

function initWebSocket(server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        console.log('🔌 WebSocket client connected');

        ws.on('message', (msg) => {
            try {
                const data = JSON.parse(msg);
                if (data.type === 'admin_subscribe') {
                    adminClients.add(ws);
                }
            } catch (e) { }
        });

        ws.on('close', () => {
            adminClients.delete(ws);
        });

        ws.on('error', () => {
            adminClients.delete(ws);
        });

        // Send ping every 30s to keep connection alive
        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });
    });

    // Heartbeat
    const interval = setInterval(() => {
        wss.clients.forEach(ws => {
            if (!ws.isAlive) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => clearInterval(interval));

    console.log('📡 WebSocket server initialized');
}

function broadcast(data) {
    const message = JSON.stringify(data);
    adminClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function broadcastAll(data) {
    if (!wss) return;
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

module.exports = { initWebSocket, broadcast, broadcastAll };
