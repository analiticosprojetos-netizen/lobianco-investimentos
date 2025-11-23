// backend/api.js - VERSÃO COMPLETA CORRIGIDA
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://zdwacbnbkzsqwrmvftyc.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkd2FjYm5ia3pzcXdybXZmdHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTI5NDUsImV4cCI6MjA3ODU2ODk0NX0.JR-HYIT1eDkKdsb0UC7R2IBgV4pX1ON93TNEeGiB3jA';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

// Middleware de debug
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));
}

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
    
    // Buscar TODAS as configurações e pegar a mais recente
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
    
    // Pegar a configuração mais recente ou usar padrão
    const config = data && data.length > 0 ? data[0] : defaultConfig;
    
    console.log('✅ Configuração carregada:', config);
    res.json(config);
    
  } catch (error) {
    console.error('❌ Erro em site-config:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/site-config', async (req, res) => {
  try {
    console.log('💾 Salvando configuração do site...', req.body);
    
    // Primeiro: Buscar configuração existente mais recente
    const { data: existingConfigs, error: fetchError } = await supabase
      .from('site_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Erro ao buscar configuração existente:', fetchError);
    }
    
    let configData = { ...req.body };
    
    // Se existe configuração anterior, manter o ID para evitar múltiplas linhas
    if (existingConfigs && existingConfigs.length > 0) {
      configData.id = existingConfigs[0].id;
      console.log('🔄 Atualizando configuração existente ID:', configData.id);
    } else {
      console.log('🆕 Criando nova configuração');
    }
    
    // Adicionar timestamp de atualização
    configData.updated_at = new Date().toISOString();
    
    // Fazer UPSERT (update se existe, insert se não existe)
    const { data, error } = await supabase
      .from('site_config')
      .upsert(configData)
      .select()
      .single();
      
    if (error) {
      console.error('❌ Erro ao salvar site-config:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log('✅ Configuração salva com sucesso');
    res.json({ success: true, data });
    
  } catch (error) {
    console.error('❌ Erro em site-config POST:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ========== UPLOAD DE ARQUIVOS ==========
app.post('/api/upload', async (req, res) => {
  try {
    console.log('📤 Recebendo upload único...');
    const { file, filename, type } = req.body;
    
    if (!file || !filename) {
      return res.status(400).json({ error: 'Dados de upload incompletos' });
    }
    
    // Validar formato base64
    if (!file.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Formato de arquivo inválido' });
    }
    
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = type === 'logo' ? `logo/${filename}` : `banners/${filename}`;

    console.log(`📁 Fazendo upload para: ${filePath}`);

    const { error: uploadError } = await supabase.storage
      .from('public_assets')
      .upload(filePath, buffer, { 
        upsert: true, 
        contentType: 'image/jpeg' 
      });
      
    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    const { data: { publicUrl } } = supabase.storage.from('public_assets').getPublicUrl(filePath);
    console.log('✅ Upload concluído:', publicUrl);
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('❌ Erro em upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Upload múltiplo de banners - CORRIGIDO
app.post('/api/upload-banners', async (req, res) => {
  try {
    console.log('📤📤 Recebendo upload múltiplo de banners...');
    const { files } = req.body;
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      console.log('❌ Nenhum arquivo recebido');
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log(`📦 Processando ${files.length} arquivos...`);

    const uploadedUrls = [];

    for (const [index, fileData] of files.entries()) {
      try {
        const { file, filename } = fileData;
        
        if (!file || !filename) {
          console.warn(`⚠️ Arquivo ${index} inválido`);
          continue;
        }

        // Validar formato base64
        if (!file.startsWith('data:image/')) {
          console.warn(`⚠️ Formato inválido no arquivo ${index}`);
          continue;
        }

        console.log(`🖼️ Uploading ${index + 1}/${files.length}: ${filename}`);
        
        const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const filePath = `banners/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from('public_assets')
          .upload(filePath, buffer, { 
            upsert: true, 
            contentType: 'image/jpeg' 
          });
          
        if (uploadError) {
          console.error(`❌ Erro no upload ${filename}:`, uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage.from('public_assets').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
        
        console.log(`✅ Upload concluído: ${filename}`);

      } catch (fileError) {
        console.error(`❌ Erro no arquivo ${index}:`, fileError);
      }
    }

    console.log(`🎉 Upload finalizado: ${uploadedUrls.length}/${files.length} arquivos enviados`);

    res.json({ 
      success: true, 
      urls: uploadedUrls,
      message: `${uploadedUrls.length} de ${files.length} banner(s) enviado(s) com sucesso`
    });

  } catch (error) {
    console.error('❌ Erro geral em upload-banners:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});


// ========== LIMPAR CONFIGURAÇÕES DUPLICADAS ==========
app.delete('/api/cleanup-config', async (req, res) => {
  try {
    console.log('🧹 Limpando configurações duplicadas...');
    
    // Buscar todas as configurações
    const { data: allConfigs, error: fetchError } = await supabase
      .from('site_config')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Erro ao buscar configurações:', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }
    
    if (!allConfigs || allConfigs.length <= 1) {
      console.log('✅ Nenhuma duplicata para limpar');
      return res.json({ message: 'Nenhuma duplicata encontrada' });
    }
    
    // Manter apenas a mais recente
    const latestConfig = allConfigs[0];
    const duplicates = allConfigs.slice(1);
    
    console.log(`🗑️ Encontradas ${duplicates.length} configurações duplicadas`);
    
    // Excluir duplicatas
    const idsToDelete = duplicates.map(config => config.id);
    const { error: deleteError } = await supabase
      .from('site_config')
      .delete()
      .in('id', idsToDelete);
    
    if (deleteError) {
      console.error('❌ Erro ao excluir duplicatas:', deleteError);
      return res.status(500).json({ error: deleteError.message });
    }
    
    console.log('✅ Duplicatas removidas com sucesso');
    res.json({ 
      success: true, 
      message: `Removidas ${duplicates.length} configurações duplicadas`,
      kept: latestConfig 
    });
    
  } catch (error) {
    console.error('❌ Erro em cleanup-config:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ========== VER TODAS AS CONFIGURAÇÕES (DEBUG) ==========
app.get('/api/debug-configs', async (req, res) => {
  try {
    console.log('🔍 Verificando todas as configurações...');
    
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log(`📊 Total de configurações: ${data?.length || 0}`);
    res.json({ 
      total: data?.length || 0,
      configs: data || [] 
    });
    
  } catch (error) {
    console.error('❌ Erro em debug-configs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ========== IMÓVEIS ==========
app.get('/api/imoveis', async (req, res) => {
  try {
    console.log('🏠 Buscando imóveis...');
    const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('❌ Erro ao buscar imóveis:', error);
      return res.status(500).json({ error: error.message });
    }
    console.log(`✅ ${data?.length || 0} imóveis encontrados`);
    res.json(data || []);
  } catch (error) {
    console.error('❌ Erro em imoveis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Salvar imóvel com upload de fotos - CORRIGIDO
app.post('/api/imoveis', async (req, res) => {
  try {
    console.log('➕ Salvando novo imóvel...');
    const imovelData = { ...req.body };
    
    // Se tiver imagens para upload, faz o upload primeiro
    if (imovelData.fotosParaUpload && imovelData.fotosParaUpload.length > 0) {
      console.log(`📸 Fazendo upload de ${imovelData.fotosParaUpload.length} fotos...`);
      const fotosUrls = [];
      
      for (const [index, fotoData] of imovelData.fotosParaUpload.entries()) {
        try {
          // Verificar se o file é base64 válido
          if (!fotoData.file || typeof fotoData.file !== 'string') {
            console.error(`❌ Dados de foto inválidos no índice ${index}`);
            continue;
          }
          
          const base64Data = fotoData.file.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const filePath = `imoveis/${fotoData.filename || `imovel_${Date.now()}_${index}.jpg`}`;

          console.log(`📤 Uploading foto ${index + 1}: ${filePath}`);
          
          const { error: uploadError } = await supabase.storage
            .from('public_assets')
            .upload(filePath, buffer, { 
              upsert: true, 
              contentType: 'image/jpeg' 
            });
            
          if (uploadError) {
            console.error(`❌ Erro no upload da foto ${index + 1}:`, uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage.from('public_assets').getPublicUrl(filePath);
          fotosUrls.push(publicUrl);
          console.log(`✅ Foto ${index + 1} enviada: ${publicUrl}`);
          
        } catch (fotoError) {
          console.error(`❌ Erro no processamento da foto ${index + 1}:`, fotoError);
        }
      }
      
      // Atualizar URLs das imagens
      imovelData.image_urls = [...(imovelData.image_urls || []), ...fotosUrls];
      delete imovelData.fotosParaUpload;
    }

    console.log('💾 Salvando dados do imóvel no banco...', {
      title: imovelData.title,
      type: imovelData.type,
      image_count: imovelData.image_urls?.length || 0
    });

    const { data, error } = await supabase
      .from('items')
      .insert([imovelData])
      .select();
      
    if (error) {
      console.error('❌ Erro ao salvar imóvel no banco:', error);
      return res.status(500).json({ 
        error: error.message,
        details: 'Erro ao inserir no banco de dados'
      });
    }
    
    console.log('✅ Imóvel salvo com sucesso:', data[0]?.id);
    res.json({ 
      success: true, 
      data: data[0],
      message: `Imóvel salvo com ${imovelData.image_urls?.length || 0} foto(s)`
    });
    
  } catch (error) {
    console.error('❌ Erro em salvar imóvel:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Excluir imóvel - CORRIGIDO
app.delete('/api/imoveis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Excluindo imóvel ${id}...`);
    
    // Primeiro busca o imóvel para excluir as fotos
    const { data: imovel, error: fetchError } = await supabase
      .from('items')
      .select('image_urls')
      .eq('id', id)
      .single();
    
    if (!fetchError && imovel && imovel.image_urls && imovel.image_urls.length > 0) {
      console.log(`📸 Excluindo ${imovel.image_urls.length} fotos do imóvel...`);
      
      const filesToDelete = [];
      
      // Extrair paths dos arquivos das URLs
      for (const url of imovel.image_urls) {
        try {
          // A URL geralmente é: https://zdwacbnbkzsqwrmvftyc.supabase.co/storage/v1/object/public/public_assets/imoveis/nome_arquivo.jpg
          const urlObj = new URL(url);
          const pathParts = urlObj.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];
          const filePath = `imoveis/${fileName}`;
          
          filesToDelete.push(filePath);
          console.log(`🗑️ Marcando para exclusão: ${filePath}`);
        } catch (urlError) {
          console.error('❌ Erro ao processar URL:', url, urlError);
        }
      }
      
      // Excluir as fotos do storage em lote
      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('public_assets')
          .remove(filesToDelete);
          
        if (storageError) {
          console.error('❌ Erro ao excluir fotos do storage:', storageError);
        } else {
          console.log(`✅ ${filesToDelete.length} foto(s) excluída(s) do storage`);
        }
      }
    } else if (fetchError) {
      console.error('❌ Erro ao buscar imóvel para exclusão:', fetchError);
    }

    // Agora exclui o imóvel do banco
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) {
      console.error('❌ Erro ao excluir imóvel do banco:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log('✅ Imóvel excluído com sucesso');
    res.json({ 
      success: true,
      message: 'Imóvel e fotos excluídos com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro em excluir imóvel:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// ========== ATUALIZAR IMÓVEL ==========
app.put('/api/imoveis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✏️ Atualizando imóvel ${id}...`);
    
    const imovelData = { ...req.body };
    
    // Se tiver novas imagens para upload, processá-las
    if (imovelData.novasFotos && imovelData.novasFotos.length > 0) {
      console.log(`📸 Fazendo upload de ${imovelData.novasFotos.length} novas fotos...`);
      const novasFotosUrls = [];
      
      for (const [index, fotoData] of imovelData.novasFotos.entries()) {
        try {
          if (!fotoData.file || typeof fotoData.file !== 'string') {
            console.error(`❌ Dados de foto inválidos no índice ${index}`);
            continue;
          }
          
          const base64Data = fotoData.file.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const filePath = `imoveis/${fotoData.filename || `imovel_${Date.now()}_${index}.jpg`}`;

          console.log(`📤 Uploading nova foto ${index + 1}: ${filePath}`);
          
          const { error: uploadError } = await supabase.storage
            .from('public_assets')
            .upload(filePath, buffer, { 
              upsert: true, 
              contentType: 'image/jpeg' 
            });
            
          if (uploadError) {
            console.error(`❌ Erro no upload da nova foto ${index + 1}:`, uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage.from('public_assets').getPublicUrl(filePath);
          novasFotosUrls.push(publicUrl);
          console.log(`✅ Nova foto ${index + 1} enviada: ${publicUrl}`);
          
        } catch (fotoError) {
          console.error(`❌ Erro no processamento da nova foto ${index + 1}:`, fotoError);
        }
      }
      
      // Combinar fotos existentes com novas fotos
      imovelData.image_urls = [...(imovelData.fotosExistentes || []), ...novasFotosUrls];
      delete imovelData.novasFotos;
      delete imovelData.fotosExistentes;
    }

    console.log('💾 Atualizando dados do imóvel no banco...', {
      id: id,
      title: imovelData.title,
      image_count: imovelData.image_urls?.length || 0
    });

    const { data, error } = await supabase
      .from('items')
      .update(imovelData)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('❌ Erro ao atualizar imóvel:', error);
      return res.status(500).json({ 
        error: error.message,
        details: 'Erro ao atualizar no banco de dados'
      });
    }
    
    console.log('✅ Imóvel atualizado com sucesso:', data[0]?.id);
    res.json({ 
      success: true, 
      data: data[0],
      message: `Imóvel atualizado com ${imovelData.image_urls?.length || 0} foto(s)`
    });
    
  } catch (error) {
    console.error('❌ Erro em atualizar imóvel:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Rota de debug para testar upload
app.get('/api/debug-upload', (req, res) => {
  res.json({ 
    message: 'Rota de upload funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota fallback
app.use((req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } else {
    res.redirect('/');
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando → http://localhost:${PORT}`);
    console.log(`📊 Health check → http://localhost:${PORT}/api/health`);
    console.log(`🐛 Debug upload → http://localhost:${PORT}/api/debug-upload`);
  });
}