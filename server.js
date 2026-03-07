/**
 * GALACTIC HOPPER VS — Servidor LAN / Render.com
 * ════════════════════════════════════════════════
 *
 *  LOCAL:
 *    npm install
 *    npm start          (ou:  node server.js)
 *
 *  RENDER.COM:
 *    Build Command:  npm install
 *    Start Command:  npm start
 *    → usa automaticamente a variável PORT do Render
 *
 *  LAN LOCAL:
 *    Abre:  http://localhost:3000
 *    Outros PCs:  http://<IP-DESTE-PC>:3000
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const os   = require('os');

const PORT     = process.env.PORT || 3000;
const N_TABLES = 5;

function lanIP() {
  for (const ifaces of Object.values(os.networkInterfaces()))
    for (const i of ifaces)
      if (i.family === 'IPv4' && !i.internal) return i.address;
  return 'localhost';
}

// ── 5 tables, each holds P1 + P2 ─────────────────────────────
const tables = Array.from({ length: N_TABLES }, () => ({ p1: null, p2: null }));

function tableStatus(t) {
  if (!t.p1 && !t.p2) return 'empty';
  if  (t.p1 && t.p2)  return 'full';
  return 'waiting';
}

function ws_send(ws, msg) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
}

function lobbySnapshot() {
  return tables.map((t, index) => ({ index, status: tableStatus(t) }));
}

function broadcastLobby() {
  const snap = { t: 'lobby_state', tables: lobbySnapshot() };
  for (const t of tables)
    for (const role of ['p1', 'p2'])
      if (t[role]) ws_send(t[role], snap);
}

// ── HTTP: serve the game HTML ─────────────────────────────────
const HTML = path.join(__dirname, 'galactic-hopper-versus.html');
const httpServer = http.createServer((req, res) => {
  if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
  fs.readFile(HTML, (err, data) => {
    if (err) { res.writeHead(404); return res.end('galactic-hopper-versus.html not found\n'); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

// ── WebSocket ─────────────────────────────────────────────────
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', ws => {
  let myTable = -1;
  let myRole  = null;

  function leave() {
    if (myTable < 0) return;
    const t = tables[myTable];
    if (t[myRole] === ws) t[myRole] = null;
    myTable = -1;
    myRole  = null;
  }

  function peer() {
    if (myTable < 0) return null;
    const t = tables[myTable];
    return myRole === 'p1' ? t.p2 : t.p1;
  }

  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.t) {

      case 'get_lobby':
        ws_send(ws, { t: 'lobby_state', tables: lobbySnapshot() });
        break;

      case 'join_table': {
        const idx = Number(msg.index);
        if (isNaN(idx) || idx < 0 || idx >= N_TABLES) break;
        leave();
        const t = tables[idx];
        if (!t.p1) {
          t.p1 = ws; myTable = idx; myRole = 'p1';
          ws_send(ws, { t: 'joined', role: 'p1', table: idx });
        } else if (!t.p2) {
          t.p2 = ws; myTable = idx; myRole = 'p2';
          ws_send(ws, { t: 'joined', role: 'p2', table: idx });
          ws_send(t.p1, { t: 'opponent_joined' });
        } else {
          ws_send(ws, { t: 'table_full', index: idx });
          break;
        }
        broadcastLobby();
        break;
      }

      case 'leave_table':
        leave();
        ws_send(ws, { t: 'left_table' });
        broadcastLobby();
        break;

      default:
        // relay all game messages to opponent
        ws_send(peer(), msg);
        break;
    }
  });

  ws.on('close', () => {
    const p = peer();
    leave();
    if (p) ws_send(p, { t: 'opponent_left' });
    broadcastLobby();
  });

  ws.on('error', () => {});
});

httpServer.listen(PORT, () => {
  const ip = lanIP();
  console.log('');
  console.log('  ┌──────────────────────────────────────────────┐');
  console.log('  │   🚀  GALACTIC HOPPER VS — SERVIDOR           │');
  console.log('  ├──────────────────────────────────────────────┤');
  console.log(`  │  Local:   http://localhost:${PORT}                │`);
  console.log(`  │  LAN:     http://${ip}:${PORT}            │`);
  console.log('  ├──────────────────────────────────────────────┤');
  console.log('  │  Render.com:  deploy este repositório         │');
  console.log('  │  Build: npm install  │  Start: npm start      │');
  console.log('  └──────────────────────────────────────────────┘');
  console.log('');
});
