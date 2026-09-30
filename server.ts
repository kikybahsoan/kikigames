import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import { DEFAULT_QUESTIONS } from './src/data/defaultQuestions';
import { Question, LeaderboardEntry, ChallengeNotification } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// In-memory persistent stores
let questions: Question[] = [...DEFAULT_QUESTIONS];
let leaderboard: LeaderboardEntry[] = [
  { id: '1', name: 'Al Farabi (Juara 1)', score: 320, accuracy: 96, kubu: 'kanan', mode: 'online', category: 'math', date: '2026-09-28' },
  { id: '2', name: 'Ibrahim (Master Kuis)', score: 290, accuracy: 92, kubu: 'kiri', mode: 'local', category: 'general', date: '2026-09-28' },
  { id: '3', name: 'Siti Nurhaliza', score: 260, accuracy: 88, kubu: 'kiri', mode: 'online', category: 'science', date: '2026-09-27' },
  { id: '4', name: 'Budi Santoso', score: 240, accuracy: 85, kubu: 'kanan', mode: 'solo', category: 'eng', date: '2026-09-27' },
  { id: '5', name: 'Aisyah Putri', score: 210, accuracy: 90, kubu: 'kiri', mode: 'local', category: 'math', date: '2026-09-26' },
];

let challenges: ChallengeNotification[] = [
  {
    id: 'c1',
    title: 'Tantangan Baru: Duel Matematika Cepat!',
    message: 'Ibrahim menantang seluruh pemain di Arena Kubu Kiri vs Kubu Kanan!',
    challengerName: 'Ibrahim',
    category: 'math',
    timestamp: 'Baru saja',
    read: false
  },
  {
    id: 'c2',
    title: 'Turnamen Sains Mingguan',
    message: 'Uji kecepatan refleks tanganmu dengan soal tata surya dan biologi!',
    challengerName: 'Admin Kiki',
    category: 'science',
    timestamp: '10 menit lalu',
    read: false
  }
];

// ---------------- REST APIs ----------------
app.get('/api/questions', (req, res) => {
  res.json({ success: true, questions });
});

app.post('/api/questions', (req, res) => {
  const newQ = req.body as Question;
  if (!newQ.text || !newQ.ans) {
    return res.status(400).json({ error: 'Pertanyaan dan jawaban benar wajib diisi' });
  }
  newQ.id = newQ.id || ('q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
  questions.unshift(newQ);
  res.json({ success: true, question: newQ });
});

app.put('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  const index = questions.findIndex(q => q.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Soal tidak ditemukan' });
  }
  questions[index] = { ...questions[index], ...req.body, id };
  res.json({ success: true, question: questions[index] });
});

app.delete('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  questions = questions.filter(q => q.id !== id);
  res.json({ success: true });
});

app.post('/api/questions/reset', (req, res) => {
  questions = [...DEFAULT_QUESTIONS];
  res.json({ success: true, questions });
});

app.get('/api/leaderboard', (req, res) => {
  res.json({ success: true, leaderboard });
});

app.post('/api/leaderboard', (req, res) => {
  const entry: LeaderboardEntry = {
    id: 'lb_' + Date.now(),
    name: req.body.name || 'Pemain Tanpa Nama',
    score: Number(req.body.score) || 0,
    accuracy: Number(req.body.accuracy) || 100,
    kubu: req.body.kubu || 'kiri',
    mode: req.body.mode || 'local',
    category: req.body.category || 'math',
    date: new Date().toISOString().split('T')[0]
  };
  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 50) leaderboard = leaderboard.slice(0, 50);
  res.json({ success: true, entry, leaderboard });
});

app.get('/api/notifications', (req, res) => {
  res.json({ success: true, challenges });
});

app.post('/api/challenge', (req, res) => {
  const { challengerName, category, roomCode } = req.body;
  const newChallenge: ChallengeNotification = {
    id: 'ch_' + Date.now(),
    title: `Tantangan Baru dari ${challengerName || 'Pemain Lain'}!`,
    message: `Siap bertanding di kubu lawan? Masuk ke arena sekarang!`,
    challengerName: challengerName || 'Pemain',
    roomCode: roomCode || 'ARENA-1',
    category: category || 'math',
    timestamp: 'Baru saja',
    read: false
  };
  challenges.unshift(newChallenge);
  if (challenges.length > 20) challenges = challenges.slice(0, 20);

  // Broadcast to all connected WebSockets
  broadcastToAll({
    type: 'challenge_broadcast',
    challenge: newChallenge
  });

  res.json({ success: true, challenge: newChallenge });
});

app.post('/api/ai-motivation', async (req, res) => {
  const { eventType, playerName, scoreLeft, scoreRight, combo, kubu } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah "AI Coach Kiki", pelatih dan komentator kuis yang sangat energik, inspiratif, dan seru untuk game "KIKI (Kompetisi Interaktif Kuis Indonesia)".
Buatkan 1 kalimat motivasi singkat (maksimal 15 kata) yang keren, menyemangati, dan bersemangat membara dalam bahasa Indonesia.
Konteks permainan:
- Event: ${eventType || 'default'}
- Pemain: ${playerName || 'Pahlawan Kuis'} (Kubu ${kubu === 'kanan' ? 'Kanan' : 'Kiri'})
- Kombo: ${combo || 0}x
- Skor: Kiri ${scoreLeft || 0} vs Kanan ${scoreRight || 0}
Sertakan 1-2 emoji seru! Langsung berikan kalimat motivasinya saja tanpa tanda kutip.`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      const message = aiResponse.text?.trim();
      if (message) {
        return res.json({ success: true, message });
      }
    } catch (err) {
      console.warn('AI Coach motivation generation failed, falling back to local pool:', err);
    }
  }

  // Dynamic curated fallback motivational messages
  const fallbacks: Record<string, string[]> = {
    combo_streak: [
      `🔥 Refleks luar biasa, ${playerName || 'Pejuang'}! Kombo ${combo || 2}x membakar arena KIKI!`,
      `⚡ Kecepatan kilat tak tertandingi! Lanjutkan dominasimu hingga garis akhir!`,
      `💥 Sensasional! Fokus dan kecerdasanmu sedang berada di performa puncak!`,
      `👑 Kombo maut ${combo || 2}x! Tunjukkan bahwa kamu pantas jadi Juara KIKI!`
    ],
    comeback: [
      `⚔️ Selisih skor menipis! Kubu ${kubu === 'kanan' ? 'Kanan' : 'Kiri'} mulai melancarkan serangan balik!`,
      `🔥 Jangan menyerah! Satu jawaban tepat berikutnya bisa membalikkan keadaan!`,
      `💪 Mental juara sejati! Pertahankan fokus dan rebut kembali keunggulan!`
    ],
    wrong_hit: [
      `🎯 Tarik napas sejenak, ${playerName || 'Kawan'}! Jawaban berikutnya pasti tepat sasaran!`,
      `💡 Tetap tenang! Kesalahan kecil adalah batu loncatan menuju skor tertinggi!`,
      `🛡️ Fokuskan mata pada layar, tebas bola jawaban dengan percaya diri!`
    ],
    game_over: [
      `🏆 Pertarungan luar biasa yang menggetarkan arena KIKI! Kalian semua adalah sang juara!`,
      `🌟 Refleks dan pengetahuan kelas dewa! Terus asah kemampuanmu di Game KIKI!`
    ],
    default: [
      `🚀 Bersiap! Sambut bola pengetahuan dengan refleks tangan secepat kilat!`,
      `🏆 KIKI: Kompetisi Interaktif Kuis Indonesia • Buktikan ketajaman ilmumu hari ini!`,
      `⚡ Fokus, bidik, dan raih kemenangan gemilang di setiap pertanyaan!`
    ]
  };

  const pool = fallbacks[eventType] || fallbacks.default;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  res.json({ success: true, message: picked });
});

// ---------------- WebSocket Server ----------------
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface ClientInfo {
  ws: WebSocket;
  id: string;
  name: string;
  roomCode?: string;
  kubu?: 'kiri' | 'kanan';
  score: number;
}

const clients = new Map<string, ClientInfo>();

interface RoomState {
  code: string;
  clients: Set<string>;
  category: string;
  level: number;
  duration: number;
  status: 'waiting' | 'playing' | 'ended';
  questionIndex: number;
  currentQuestion?: Question;
  scores: { [clientId: string]: number };
}

const rooms = new Map<string, RoomState>();

function broadcastToAll(data: unknown) {
  const msg = JSON.stringify(data);
  for (const client of clients.values()) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(msg);
    }
  }
}

function broadcastToRoom(roomCode: string, data: unknown, excludeClientId?: string) {
  const room = rooms.get(roomCode);
  if (!room) return;
  const msg = JSON.stringify(data);
  for (const cid of room.clients) {
    if (cid === excludeClientId) continue;
    const client = clients.get(cid);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(msg);
    }
  }
}

wss.on('connection', (ws) => {
  const clientId = 'c_' + Math.random().toString(36).substring(2, 9);
  const client: ClientInfo = {
    ws,
    id: clientId,
    name: 'Pemain ' + clientId.substring(2, 5).toUpperCase(),
    score: 0
  };
  clients.set(clientId, client);

  ws.send(JSON.stringify({
    type: 'connected',
    clientId,
    onlineCount: clients.size
  }));

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      if (data.type === 'join_lobby') {
        client.name = data.name || client.name;
        ws.send(JSON.stringify({
          type: 'lobby_synced',
          onlineCount: clients.size,
          rooms: Array.from(rooms.values()).map(r => ({
            code: r.code,
            playerCount: r.clients.size,
            status: r.status,
            category: r.category
          }))
        }));
      }

      if (data.type === 'create_or_join_room') {
        const roomCode = (data.roomCode || 'ARENA-1').toUpperCase().trim();
        client.roomCode = roomCode;
        client.kubu = data.kubu || 'kiri';
        client.name = data.name || client.name;

        let room = rooms.get(roomCode);
        if (!room) {
          room = {
            code: roomCode,
            clients: new Set(),
            category: data.category || 'math',
            level: Number(data.level) || 4,
            duration: Number(data.duration) || 60,
            status: 'waiting',
            questionIndex: 0,
            scores: {}
          };
          rooms.set(roomCode, room);
        }

        room.clients.add(clientId);
        room.scores[clientId] = 0;

        // Notify room members
        const members = Array.from(room.clients).map(cid => {
          const c = clients.get(cid);
          return { id: cid, name: c?.name, kubu: c?.kubu, score: room!.scores[cid] || 0 };
        });

        broadcastToRoom(roomCode, {
          type: 'room_state',
          roomCode,
          members,
          status: room.status,
          category: room.category,
          level: room.level,
          duration: room.duration
        });
      }

      if (data.type === 'start_match') {
        const roomCode = client.roomCode;
        if (!roomCode) return;
        const room = rooms.get(roomCode);
        if (!room) return;

        room.status = 'playing';
        room.questionIndex = 0;

        // Select initial question
        const filteredQ = questions.filter(q => q.category === room!.category) || questions;
        const q = filteredQ[Math.floor(Math.random() * filteredQ.length)] || questions[0];
        room.currentQuestion = q;

        broadcastToRoom(roomCode, {
          type: 'game_started',
          roomCode,
          duration: room.duration,
          question: q,
          startTime: Date.now()
        });
      }

      if (data.type === 'sync_score') {
        const roomCode = client.roomCode;
        if (!roomCode) return;
        const room = rooms.get(roomCode);
        if (!room) return;

        client.score = data.score;
        room.scores[clientId] = data.score;

        broadcastToRoom(roomCode, {
          type: 'opponent_score',
          clientId,
          score: data.score,
          combo: data.combo,
          hitType: data.hitType, // 'correct' | 'wrong'
          kubu: client.kubu
        }, clientId);
      }

      if (data.type === 'next_question') {
        const roomCode = client.roomCode;
        if (!roomCode) return;
        const room = rooms.get(roomCode);
        if (!room) return;

        const filteredQ = questions.filter(q => q.category === room!.category) || questions;
        const q = filteredQ[Math.floor(Math.random() * filteredQ.length)] || questions[0];
        room.currentQuestion = q;

        broadcastToRoom(roomCode, {
          type: 'new_question',
          question: q
        });
      }

      if (data.type === 'send_reaction') {
        const roomCode = client.roomCode;
        if (!roomCode) return;
        broadcastToRoom(roomCode, {
          type: 'reaction',
          clientId,
          emoji: data.emoji,
          kubu: client.kubu
        });
      }
    } catch (err) {
      console.error('Socket message parse error:', err);
    }
  });

  ws.on('close', () => {
    if (client.roomCode) {
      const room = rooms.get(client.roomCode);
      if (room) {
        room.clients.delete(clientId);
        delete room.scores[clientId];
        if (room.clients.size === 0) {
          rooms.delete(client.roomCode);
        } else {
          broadcastToRoom(client.roomCode, {
            type: 'player_left',
            clientId,
            name: client.name
          });
        }
      }
    }
    clients.delete(clientId);
  });
});

// ---------------- Vite Middleware / Production Static ----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Server and WebSocket running at http://0.0.0.0:${port}`);
  });
}

startServer();
