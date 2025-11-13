// backend/api.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Config do site
app.get('/api/site-config', async (req, res) => {
  const { data, error } = await supabase.from('site_config').select('*').single();
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error });
  res.json(data || { site_name: "Lobianco Investimentos", phone: "(34) 99970-4808", main_color: "#0066CC", logo_url: "", whatsapp_link: "", instagram_link: "", facebook_link: "" });
});

app.post('/api/site-config', async (req, res) => {
  const { data, error } = await supabase.from('site_config').upsert(req.body).select().single();
  if (error) return res.status(500).json({ error });
  res.json({ success: true });
});

app.post('/api/upload', async (req, res) => {
  const { file, filename, type } = req.body;
  const base64Data = file.replace(/^data:.+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const filePath = type === 'logo' ? `logo/${filename}` : `banners/${filename}`;

  const { error: uploadError } = await supabase.storage.from('public_assets').upload(filePath, buffer, { upsert: true });
  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const { data: { publicUrl } } = supabase.storage.from('public_assets').getPublicUrl(filePath);
  res.json({ url: publicUrl });
});

// NOVA ROTA: pegar imóveis
app.get('/api/imoveis', async (req, res) => {
  const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error });
  res.json(data || []);
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => console.log(`Servidor rodando → http://localhost:${PORT}`));