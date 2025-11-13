// server.js - proxy simples em Express para a API OpenAI
// Carrega variáveis do arquivo .env (desenvolvimento)
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serve arquivos estáticos (opcional)

app.post('/api/openai', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Campo "message" é obrigatório.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY não configurada no servidor.' });
    }

    const systemPrompt = `Você é um assistente útil e empático. Forneça respostas claras, concisas e baseadas em informações confiáveis sobre Novembro Azul: prevenção do câncer de próstata, exames (PSA, toque retal), sintomas, fatores de risco, orientações básicas e informações para incentivar consulta médica. Não dê diagnóstico médico definitivo — sempre recomende procurar um profissional de saúde.`;

    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 512,
      temperature: 0.3
    };

    const r = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const reply = r.data && r.data.choices && r.data.choices[0] && r.data.choices[0].message && r.data.choices[0].message.content;
    if (!reply) return res.status(500).json({ error: 'Resposta inválida da OpenAI', raw: r.data });

    return res.json({ reply: reply.trim() });
  } catch (err) {
    console.error('Erro proxy OpenAI:', err && err.response ? err.response.data || err.response.statusText : err.message);
    const status = err.response && err.response.status ? err.response.status : 500;
    const data = err.response && err.response.data ? err.response.data : { error: err.message };
    return res.status(status).json({ error: 'Erro ao chamar OpenAI', details: data });
  }
});

app.listen(port, () => {
  console.log(`OpenAI proxy rodando em http://localhost:${port} (endpoint POST /api/openai)`);
});
