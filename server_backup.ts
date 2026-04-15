import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Gemini AI Setup
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Weather API (OpenWeather)
app.get('/api/weather', async (req, res) => {
  const { lat, lon, city } = req.query;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenWeather API key not configured' });
  }

  try {
    let url = '';
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
      return res.status(400).json({ error: 'Missing location parameters' });
    }

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Mandi Price API (data.gov.in)
app.get('/api/mandi', async (req, res) => {
  try {
    // Using the specific resource and API key provided by the user
    const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
    const apiKey = process.env.GOV_DATA_API_KEY || '579b464db56ec23bdd000001a02d583913d449c85bebb4d5fa74463f';
    const limit = req.query.limit || 20;
    
    const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=${limit}`;
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error: any) {
    console.error('Mandi API Error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch Mandi data',
      details: error.message 
    });
  }
});

// Plant Disease Detection (Gemini)
app.post('/api/detect-disease', async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  try {
    const base64Data = image.split(',')[1] || image;
    
    const response = await genAI.models.generateContent({
      model: 'gemini-3.1-flash-preview',
      contents: [
        {
          parts: [
            { text: "Analyze this plant image for diseases. Identify the plant species, the disease name (or 'Healthy' if no disease), a brief description, and treatment suggestions in both English and Hindi. Provide a confidence score between 0 and 1." },
            { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            species: { type: Type.STRING },
            disease: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            description: { type: Type.STRING },
            solutionEn: { type: Type.STRING },
            solutionHi: { type: Type.STRING },
          },
          required: ["species", "disease", "confidence", "description", "solutionEn", "solutionHi"],
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Detection error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
