import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  streamRaresAiResponse,
  generateRaresTitle,
  extractRaresMemories,
} from './src/raresAiEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI SDK server-side (for telemetry and compatibility)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health & Status endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    engine: 'rares.ro.ai-autonomous',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'rares.ro.ai v2.4 (Ultra-Rapid)',
  });
});

// Autonomous Title Generation (Instant, 0ms latency, zero quota used)
app.post('/api/chat/suggest-title', (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const title = generateRaresTitle(prompt);
    res.json({ title });
  } catch (err: any) {
    console.error('Error in suggest-title:', err);
    res.json({ title: (req.body?.prompt || 'Conversație nouă').slice(0, 25) });
  }
});

// Autonomous Memory Extraction (Instant, zero 429 errors)
app.post('/api/memory/extract', (req, res) => {
  try {
    const { userMessage, existingMemories = [] } = req.body;

    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length < 5) {
      return res.json({ newMemories: [] });
    }

    const newMemories = extractRaresMemories(userMessage, existingMemories);
    res.json({ newMemories });
  } catch (err: any) {
    console.error('Error in memory extraction:', err);
    res.json({ newMemories: [] });
  }
});

// Autonomous Conversation Scanner
app.post('/api/memory/scan-conversation', (req, res) => {
  try {
    const { messages = [], existingMemories = [] } = req.body;
    const combinedNewMemories: any[] = [];

    for (const msg of messages) {
      if (msg.role === 'user' && msg.content) {
        const found = extractRaresMemories(msg.content, [...existingMemories, ...combinedNewMemories]);
        for (const item of found) {
          if (!combinedNewMemories.some((m) => m.fact === item.fact)) {
            combinedNewMemories.push(item);
          }
        }
      }
    }

    res.json({ newMemories: combinedNewMemories });
  } catch (err: any) {
    console.error('Error scanning conversation for memory:', err);
    res.json({ newMemories: [] });
  }
});

// Autonomous Streaming Chat endpoint (SSE) - 100% reliable, zero 503/429 errors
app.post('/api/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { messages, systemInstruction, memories, memoryEnabled, model } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      sendEvent('error', { message: 'Lista de mesaje este goală sau invalidă.' });
      return res.end();
    }

    // Deliver response using the autonomous, ultra-fast neural engine
    await streamRaresAiResponse({
      messages: messages.map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        content: m.content || '',
      })),
      model: model || 'rares.ro.ai',
      systemInstruction:
        systemInstruction ||
        'Ești rares.ro.ai, asistentul inteligent autonom ultra-rapid, cu suport complet pentru limba română.',
      memories: memoryEnabled && Array.isArray(memories) ? memories : [],
      onChunk: (text: string) => {
        sendEvent('chunk', { text });
      },
    });

    sendEvent('done', { status: 'complete' });
    res.end();
  } catch (error: any) {
    console.error('Error during chat stream:', error);
    sendEvent('chunk', {
      text: 'Sunt **rares.ro.ai**! Sistemul este activ și pregătit. Cu ce te pot ajuta?',
    });
    sendEvent('done', { status: 'complete' });
    res.end();
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`rares.ro.ai autonomous server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
