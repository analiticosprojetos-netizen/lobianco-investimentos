// backend/api.js - VERSÃO SIMPLIFICADA E CORRIGIDA
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://zdwacbnbkzsqwrmvftyc.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkd2FjYm5ia3pzcXdybXZmdHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTI5NDUsImV4cCI6MjA3ODU2ODk0NX0.JR-HYIT1eDkKdsb0UC7R2IBgV4pX1ON93TNEeGiB3jA';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

// Middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ========================================
// ROTAS DA API (devem vir antes do 'static')
// ========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Lobianco Investimentos funcionando',
    timestamp: new Date().toISOString()
  });
});

// ========== CONFIGURAÇÕES ==========
app.get('/api/site-config', async (req, res) => {
  try {
    console.log('📋 Buscando configuração do site...');
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao buscar site-config:', error);
      return res.status(500).json({ error: error.message });
    }
    
    const defaultConfig = {
      site_name: "Lobianco Investimentos", 
      phone: "(34) 99970-4808", 
      main_color: "#0066CC", 
      secondary_color: "#003366",
      text_color: "#333333",
      logo_url: "", 
      whatsapp_link: "", 
      instagram_link: "", 
      facebook_link: "",
      banner_images: [],
      company_email: "",
      company_address: "",
      logo_width: "60px",
      logo_height: "60px"
    };
    
    const config = data && data.length > 0 ? data[0] : defaultConfig;
    res.json(config);
    
  } catch (error) {
    console.error('❌ Erro em site-config:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/site-config', async (req, res) => {
  try {
    console.log('💾 Salvando configuração do site...');
    const { data: existingConfigs, error: fetchError } = await supabase
      .from('site_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (fetchError) console.error('❌ Erro ao buscar config existente:', fetchError);
    
    let configData = { ...req.body, updated_at: new Date().toISOString() };
    
    if (existingConfigs && existingConfigs.length > 0) {
      configData.id = existingConfigs[0].id;
    }
    
    const { data, error } = await supabase.from('site_config').upsert(configData).select().single();
      
    if (error) {
      console.error('❌ Erro ao salvar site-config:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ success: true, data });
    
  } catch (error) {
    console.error('❌ Erro em site-config POST:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ========== UPLOAD DE ARQUIVOS ==========
app.post('/api/upload', async (req, res) => {
  try {
    const { file, filename, type } = req.body;
    if (!file || !filename || !file.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Dados de upload inválidos' });
    }
    
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = type === 'logo' ? `logo/${filename}` : `banners/${filename}`;

    const { error: uploadError } = await supabase.storage.from('public_assets').upload(filePath, buffer, { upsert: true, contentType: 'image/jpeg' });
      
    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    const { data: { publicUrl } } = supabase.storage.from('public_assets').getPublicUrl(filePath);
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('❌ Erro em upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/upload-banners', async (req, res) => {
  try {
    const { files } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const uploadedUrls = [];
    for (const fileData of files) {
      try {
        if (!fileData.file || !fileData.filename || !fileData.file.startsWith('data:image/')) continue;
        
        const base64Data = fileData.file.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const filePath = `banners/${fileData.filename}`;

        const { error: uploadError } = await supabase.storage.from('public_assets').upload(filePath, buffer, { upsert: true, contentType: 'image/jpeg' });
        if (uploadError) {
          console.error(`❌ Erro no upload ${fileData.filename}:`, uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage.from('public_assets').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      } catch (fileError) {
        console.error(`❌ Erro no arquivo:`, fileError);
      }
    }

    res.json({ 
      success: true, 
      urls: uploadedUrls,
      message: `${uploadedUrls.length} de ${files.length} banner(s) enviado(s) com sucesso`
    });
  } catch (error) {
    console.error('❌ Erro geral em upload-banners:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ========== IMÓVEIS ==========
app.get('/api/imoveis', async (req, res) => {
  try {
    const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/imoveis', async (req, res) => {
  try {
    const imovelData = { ...req.body };
    if (imovelData.fotosParaUpload && imovelData.fotosParaUpload.length > 0) {
      const fotosUrls = [];
      for (const fotoData of imovelData.fotosParaUpload) {
        try {
          if (!fotoData.file || typeof fotoData.file !== 'string') continue;
          const base64Data = fotoData.file.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const filePath = `imoveis/${fotoData.filename || `imovel_${Date.now()}.jpg`}`;
          const { error: uploadError } = await supabase.storage.from('public_assets').upload(filePath, buffer, { upsert: true, contentType: 'image/jpeg' });
          if (uploadError) continue;
          const { data: { publicUrl } } = supabase.storage.from('public_assets').getPublicUrl(filePath);
          fotosUrls.push(publicUrl);
        } catch (fotoError) {
          console.error(`❌ Erro no processamento da foto:`, fotoError);
        }
      }
      imovelData.image_urls = [...(imovelData.image_urls || []), ...fotosUrls];
      delete imovelData.fotosParaUpload;
    }

    const { data, error } = await supabase.from('items').insert([imovelData]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data: data[0], message: `Imóvel salvo com ${imovelData.image_urls?.length || 0} foto(s)` });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/imoveis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: imovel, error: fetchError } = await supabase.from('items').select('image_urls').eq('id', id).single();
    
    if (!fetchError && imovel && imovel.image_urls && imovel.image_urls.length > 0) {
      const filesToDelete = imovel.image_urls.map(url => `imoveis/${url.split('/').pop()}`);
      await supabase.storage.from('public_assets').remove(filesToDelete);
    }

    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, message: 'Imóvel e fotos excluídos' });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/imoveis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const imovelData = { ...req.body };
    
    if (imovelData.novasFotos && imovelData.novasFotos.length > 0) {
      const novasFotosUrls = [];
      for (const fotoData of imovelData.novasFotos) {
        try {
          if (!fotoData.file || typeof fotoData.file !== 'string') continue;
          const base64Data = fotoData.file.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const filePath = `imoveis/${fotoData.filename || `imovel_${Date.now()}.jpg`}`;
          const { error: uploadError } = await supabase.storage.from('public_assets').upload(filePath, buffer, { upsert: true, contentType: 'image/jpeg' });
          if (uploadError) continue;
          const { data: { publicUrl } } = supabase.storage.from('public_assets').getPublicUrl(filePath);
          novasFotosUrls.push(publicUrl);
        } catch (fotoError) {
          console.error(`❌ Erro no processamento da nova foto:`, fotoError);
        }
      }
      imovelData.image_urls = [...(imovelData.fotosExistentes || []), ...novasFotosUrls];
    }

    // Sempre remover os campos temporários antes de enviar para o banco
    delete imovelData.novasFotos;
    delete imovelData.fotosExistentes;

    const { data, error } = await supabase.from('items').update(imovelData).eq('id', id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data: data[0], message: `Imóvel atualizado com ${imovelData.image_urls?.length || 0} foto(s)` });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ========================================
// SERVIR ARQUIVOS DO FRONTEND
// ========================================
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Rota fallback: serve o index.html para qualquer rota não encontrada (bom para SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ========================================
// INICIAR O SERVIDOR
// ========================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Acesse o site em http://localhost:${PORT}`);
});

module.exports = app;