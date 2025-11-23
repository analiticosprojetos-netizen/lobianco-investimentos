// frontend/script.js - VERSÃO COMPLETA CORRIGIDA
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = isLocal ? 'http://localhost:3001/api' : '/api';
const BANNER_PADRAO = "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=2070&q=80";

console.log(`🌍 Ambiente: ${isLocal ? 'LOCAL' : 'PRODUÇÃO'}`);
console.log(`🔗 API Base: ${API_BASE}`);

// ========== FUNÇÕES DE API MELHORADAS ==========
async function apiCall(endpoint, options = {}) {
  try {
    console.log(`🌐 Fazendo requisição para: ${endpoint}`);
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Resposta não é JSON:', text.substring(0, 200));
      throw new Error(`Resposta inválida do servidor (${response.status}): ${text.substring(0, 100)}`);
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Resposta de ${endpoint}:`, data);
    return data;
    
  } catch (error) {
    console.error(`❌ Erro na API ${endpoint}:`, error);
    throw error;
  }
}

// ========== CONFIGURAÇÕES COM CORES ==========
// ========== CONFIGURAÇÕES COM CORES ==========
async function carregarConfig() {
  try {
    const config = await apiCall('/site-config');
    await aplicarConfiguracoes(config);
    return config; // Retorna a configuração carregada
  } catch (error) {
    console.error('Erro ao carregar configuração:', error);
    // Aplica a configuração padrão e a retorna
    const configPadrao = await aplicarConfigPadrao();
    return configPadrao;
  }
}

function aplicarConfiguracoes(config) {
  return new Promise((resolve) => {
    console.log('🎨 Aplicando configurações:', config);
    
    // Nome do site
    const siteNameElement = document.getElementById('siteName');
    if (siteNameElement) {
      // 1. Ocultação do nome do site
      if (!config.site_name || config.site_name.trim() === '') {
        siteNameElement.style.display = 'none';
      } else {
        siteNameElement.style.display = 'inline';
        siteNameElement.textContent = config.site_name;
      }
      
      // 2. Aplica personalização de tamanho
      if (config.site_name_size) {
        siteNameElement.style.fontSize = config.site_name_size;
      } else {
        siteNameElement.style.fontSize = ''; // Remove se não houver
      }
      
      // 3. Aplica alinhamento ao container do logo e nome
      const navbarBrand = siteNameElement.closest('.navbar-brand');
      if (navbarBrand) {
        // O alinhamento é aplicado ao container flex (.navbar-brand)
        // O logo e o nome do site são tratados como um grupo
        if (config.site_name_align === 'center') {
          navbarBrand.style.justifyContent = 'center';
        } else if (config.site_name_align === 'right') {
          navbarBrand.style.justifyContent = 'flex-end';
        } else {
          navbarBrand.style.justifyContent = 'flex-start'; // Padrão
        }
      }
    }
    
    // Logo
    const siteLogo = document.getElementById('siteLogo');
    if (siteLogo) {
      if (config.logo_url) {
        siteLogo.src = config.logo_url;
        siteLogo.style.display = 'block';
        siteLogo.style.width = config.logo_width || '60px';
        siteLogo.style.height = config.logo_height || '60px';
      } else {
        siteLogo.style.display = 'none';
      }
    }
    
    // Telefone no footer
    if (document.getElementById('footerPhone')) {
      document.getElementById('footerPhone').textContent = 
        `${config.phone || "(34) 99970-4808"} | ${config.company_address || "Uberlândia - MG"}`;
    }
    
    // ========== APLICAR CORES DO SITE ==========
    if (config.main_color) {
      document.documentElement.style.setProperty('--azul', config.main_color);
      // Aplicar cor nos elementos
      document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.style.backgroundColor = config.main_color;
        btn.style.borderColor = config.main_color;
      });
      document.querySelectorAll('.text-primary').forEach(el => {
        el.style.color = config.main_color;
      });
      document.querySelectorAll('.tag').forEach(tag => {
        tag.style.backgroundColor = config.main_color;
      });
    }
    
    if (config.secondary_color) {
      document.documentElement.style.setProperty('--azul-secundario', config.secondary_color);
    }
    
    if (config.text_color) {
      document.documentElement.style.setProperty('--cor-texto', config.text_color);
      document.body.style.color = config.text_color;
    }
    
    // Redes sociais
    const whatsappLink = document.querySelector('.social-bar .whatsapp');
    const instagramLink = document.querySelector('.social-bar .instagram');
    const facebookLink = document.querySelector('.social-bar .facebook');
    
    // Usar o campo 'whatsapp_link' para o link do WhatsApp da barra lateral
    if (whatsappLink && config.whatsapp_link) {
      whatsappLink.href = config.whatsapp_link;
    }
    
    if (instagramLink && config.instagram_link) instagramLink.href = config.instagram_link;
    if (facebookLink && config.facebook_link) facebookLink.href = config.facebook_link;
    
    // ========== CAROUSEL ATUALIZADO ==========
    const carousel = document.getElementById('carouselImages');
    if (carousel) {
      console.log('🔄 Atualizando carousel com banners...');
      
      const banners = config.banner_images?.length ? config.banner_images : [BANNER_PADRAO];
      
      // Limpar carousel existente
      carousel.innerHTML = '';
      
      // Adicionar cada banner
      banners.forEach((url, i) => {
        const isActive = i === 0;
        carousel.innerHTML += `
          <div class="carousel-item ${isActive ? 'active' : ''}">
            <img src="${url}" class="d-block w-100" style="height:70vh;object-fit:cover;" 
                 onerror="this.src='${BANNER_PADRAO}'" alt="Banner ${i + 1} - ${config.site_name || 'Lobianco Investimentos'}">
            <div class="carousel-caption text-end pe-5">
              <h1 class="display-3 fw-bold text-white">Viva o Alto Padrão</h1>
              <p class="fs-1 text-white">Lançamentos em Uberlândia</p>
              <span class="tag px-5 py-3 rounded-pill fw-bold fs-4">LANÇAMENTOS</span>
            </div>
          </div>`;
      });
      
      // ATUALIZAR INDICADORES DINAMICAMENTE
      const indicatorsContainer = document.querySelector('#heroCarousel .carousel-indicators');
      if (indicatorsContainer && banners.length > 1) {
        indicatorsContainer.innerHTML = '';
        banners.forEach((_, i) => {
          indicatorsContainer.innerHTML += `
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="${i}" 
                    class="${i === 0 ? 'active' : ''}" aria-label="Slide ${i + 1}"></button>`;
        });
      }
      
      console.log(`✅ Carousel atualizado com ${banners.length} banner(s)`);
      
      // REINICIAR O CAROUSEL PARA GARANTIR FUNCIONAMENTO AUTOMÁTICO
      setTimeout(() => {
        const carouselElement = document.getElementById('heroCarousel');
        if (carouselElement) {
          try {
            // Destruir carousel existente se houver
            const existingCarousel = bootstrap.Carousel.getInstance(carouselElement);
            if (existingCarousel) {
              existingCarousel.dispose();
            }
            
	            // Criar novo carousel com configurações para início automático
		            const carouselInstance = new bootstrap.Carousel(carouselElement, {
		              interval: 4000,     // 4 segundos entre transições (velocidade padrão)
		              wrap: true,         // Ciclo contínuo
		              touch: true,        // Swipe habilitado
		              keyboard: true      // Navegação por teclado
		            });
            
            // Iniciar automaticamente
            carouselInstance.cycle();
            
            console.log('🎠 Carousel reinicializado e iniciado automaticamente!');
          } catch (error) {
            console.error('❌ Erro ao reinicializar carousel:', error);
          }
        }
        resolve(); // Resolver a promise quando terminar
      }, 100);
    } else {
      resolve(); // Resolver mesmo se não houver carousel
    }
  });
}

function aplicarConfigPadrao() {
  return aplicarConfiguracoes({
    site_name: "Lobianco Investimentos",
    phone: "(34) 99970-4808",
    main_color: "#0066CC",
    secondary_color: "#003366",
    text_color: "#333333"
  });
}

// FUNÇÃO PARA INICIALIZAR CAROUSEL FORÇADAMENTE
function inicializarCarouselForcadamente() {
  console.log('🎠 Inicializando carousel forçadamente...');
  
  const carouselElement = document.getElementById('heroCarousel');
  if (carouselElement) {
    try {
      // Destruir carousel existente se houver
      const existingCarousel = bootstrap.Carousel.getInstance(carouselElement);
      if (existingCarousel) {
        existingCarousel.dispose();
      }
      
      // Criar novo carousel com configurações otimizadas
      const carousel = new bootstrap.Carousel(carouselElement, {
        interval: 4000,     // 4 segundos (mais rápido)
        wrap: true,         // Ciclo contínuo
        touch: true,        // Swipe habilitado
        keyboard: true      // Navegação por teclado
      });
      
      // Iniciar automaticamente
      carousel.cycle();
      
      console.log('✅ Carousel inicializado com sucesso!');
      
      return carousel;
    } catch (error) {
      console.error('❌ Erro ao inicializar carousel:', error);
    }
  }
  
  return null;
}

// SALVAR CONFIGURAÇÃO COMPLETA - CORRIGIDO
 window.salvarConfiguracao = async function() {
  try {
    console.log('💾 Iniciando salvamento da configuração...');
    
    // PRIMEIRO: Buscar configuração atual para preservar dados existentes
    let configAtual;
    try {
      configAtual = await apiCall('/site-config');
      console.log('📋 Configuração atual carregada:', configAtual);
    } catch (error) {
      console.log('ℹ️ Criando nova configuração');
      configAtual = {};
    }
    
    // Dados do formulário
    // Permite que o nome do site seja salvo como vazio
    const siteName = document.getElementById('cfg_siteName')?.value.trim() || "";
    const phone = document.getElementById('cfg_phone')?.value.trim() || "(34) 99970-4808";
    const mainColor = document.getElementById('cfg_mainColor')?.value || "#0066CC";
    const secondaryColor = document.getElementById('cfg_secondaryColor')?.value || "#003366";
    const textColor = document.getElementById('cfg_textColor')?.value || "#333333";
    const email = document.getElementById('cfg_email')?.value.trim() || "";
    const address = document.getElementById('cfg_address')?.value.trim() || "";
    const whatsapp = document.getElementById('cfg_whatsapp')?.value.trim() || "";
    const instagram = document.getElementById('cfg_instagram')?.value.trim() || "";
    const facebook = document.getElementById('cfg_facebook')?.value.trim() || "";
    const logoWidth = document.getElementById('cfg_logoWidth')?.value || "60px";
    const logoHeight = document.getElementById('cfg_logoHeight')?.value || "60px";
    
    // Novos campos de personalização do nome do site
    const siteNameSize = document.getElementById('cfg_siteNameSize')?.value || "";
    const siteNameAlign = document.getElementById('cfg_siteNameAlign')?.value || "";
    
    const logoFile = document.getElementById('cfg_logo')?.files[0];
    const bannerFiles = document.getElementById('cfg_banners')?.files;
    
    let logoUrl = configAtual.logo_url || '';
    let bannerUrls = configAtual.banner_images || [];

    // 1. UPLOAD DA LOGO (se houver nova logo)
    if (logoFile) {
      console.log('📤 Fazendo upload da NOVA logo...');
      try {
        logoUrl = await fazerUploadArquivo(logoFile, 'logo');
        console.log('✅ Nova logo enviada:', logoUrl);
      } catch (error) {
        console.error('❌ Erro no upload da logo:', error);
        alert("❌ Erro ao fazer upload da logo: " + error.message);
        // Mantém a logo existente em caso de erro
      }
    }
    // Se não há nova logo, mantém a existente (já definida acima)

    // 2. UPLOAD DE NOVOS BANNERS (adicionar aos existentes)
    if (bannerFiles && bannerFiles.length > 0) {
      console.log(`📤📤 Fazendo upload de ${bannerFiles.length} NOVOS banners...`);
      try {
        const uploadResult = await fazerUploadMultiplo(bannerFiles, 'banners');
        if (uploadResult && uploadResult.urls && uploadResult.urls.length > 0) {
          // ADICIONAR novos banners aos existentes (não substituir!)
          bannerUrls = [...bannerUrls, ...uploadResult.urls];
          console.log('✅ Novos banners adicionados. Total:', bannerUrls.length);
          
          // Remover banner padrão se houver banners customizados
          if (bannerUrls.includes(BANNER_PADRAO) && bannerUrls.length > 1) {
            bannerUrls = bannerUrls.filter(url => url !== BANNER_PADRAO);
            console.log('🔄 Banner padrão removido (há banners customizados)');
          }
          
          alert(`✅ ${uploadResult.message}\nTotal de banners: ${bannerUrls.length}`);
        } else {
          console.warn('⚠️ Nenhum banner novo foi enviado com sucesso');
        }
      } catch (error) {
        console.error('❌ Erro no upload de banners:', error);
        alert("❌ Erro ao fazer upload dos banners: " + error.message);
        // Continua com os banners existentes em caso de erro
      }
    }

    // 3. GARANTIR que há pelo menos um banner
    if (bannerUrls.length === 0) {
      bannerUrls = [BANNER_PADRAO];
      console.log('🖼️ Nenhum banner encontrado, usando banner padrão');
    }

    // 4. PREPARAR DADOS PARA SALVAR (mantendo todos os dados existentes)
    const configData = {
      // Manter ID existente se houver (para evitar duplicatas)
      ...(configAtual.id && { id: configAtual.id }),
      
      // Dados básicos (novos ou atualizados)
      site_name: siteName,
      phone: phone,
      main_color: mainColor,
      secondary_color: secondaryColor,
      text_color: textColor,
            // Mídia
      logo_url: logoUrl,
      logo_width: logoWidth,
      logo_height: logoHeight,
      banner_images: bannerUrls,
      
      // Personalização do nome do site
      site_name_size: siteNameSize,
      site_name_align: siteNameAlign,
      
      // Contatos
      company_email: email,
      company_address: address,
      whatsapp_link: whatsapp,
      instagram_link: instagram,
      facebook_link: facebook,
      
      // Timestamp de atualização
      updated_at: new Date().toISOString()
    };

    console.log('💾 Salvando configuração no banco...', {
      site_name: configData.site_name,
      banners_count: configData.banner_images.length,
      logo: configData.logo_url ? 'Sim' : 'Não',
      tem_id: !!configData.id
    });

    const resultado = await apiCall('/site-config', {
      method: 'POST',
      body: JSON.stringify(configData)
    });

    alert("✅ Configurações salvas com sucesso!\nBanners ativos: " + bannerUrls.length);
    
    // Limpar campos de arquivo após salvar
    document.getElementById('cfg_logo').value = '';
    document.getElementById('cfg_banners').value = '';
    
    // Recarregar a configuração para aplicar as mudanças
    await carregarConfig();
    
    // Atualizar a visualização no modal de gestão
    await preencherCamposConfiguracao();
    
    console.log('🎯 Configuração salva com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao salvar configuração:', error);
    alert("❌ Erro ao salvar configuração: " + error.message);
  }
};

// ========== UPLOAD DE ARQUIVOS CORRIGIDOS ==========
async function fazerUploadArquivo(file, tipo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${tipo}_${Date.now()}.${ext}`;
        
        console.log(`📤 Enviando ${tipo}: ${filename}`);
        const uploadData = await apiCall('/upload', {
          method: 'POST',
          body: JSON.stringify({
            file: e.target.result,
            filename: filename,
            type: tipo
          })
        });
        
        resolve(uploadData.url);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

async function fazerUploadMultiplo(files, tipo) {
  console.log(`📦 Preparando ${files.length} arquivos para upload...`);
  const filesData = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Validar tamanho
    if (file.size > 10 * 1024 * 1024) {
      console.warn(`❌ Arquivo muito grande: ${file.name}`);
      alert(`❌ Arquivo ${file.name} é muito grande (máximo 10MB)`);
      continue;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      console.warn(`❌ Tipo inválido: ${file.type}`);
      alert(`❌ Arquivo ${file.name} não é uma imagem válida`);
      continue;
    }

    try {
      const fileData = await readFileAsBase64(file);
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${tipo}_${Date.now()}_${i}.${ext}`;
      
      filesData.push({
        file: fileData,
        filename: filename
      });
      
      console.log(`✅ Arquivo preparado: ${filename}`);
    } catch (error) {
      console.error(`❌ Erro ao ler arquivo ${file.name}:`, error);
      alert(`❌ Erro ao processar arquivo ${file.name}`);
    }
  }

  if (filesData.length === 0) {
    throw new Error('Nenhum arquivo válido para upload');
  }

  console.log(`🚀 Enviando ${filesData.length} arquivos para /upload-banners...`);
  
  try {
    const response = await apiCall('/upload-banners', {
      method: 'POST',
      body: JSON.stringify({
        files: filesData
      })
    });
    
    console.log('✅ Upload múltiplo concluído:', response);
    return response;
  } catch (error) {
    console.error('❌ Erro no upload múltiplo:', error);
    
    // Tentar upload individual como fallback
    console.log('🔄 Tentando upload individual como fallback...');
    const urls = [];
    for (const fileData of filesData) {
      try {
        const uploadData = await apiCall('/upload', {
          method: 'POST',
          body: JSON.stringify({
            file: fileData.file,
            filename: fileData.filename,
            type: 'banners'
          })
        });
        urls.push(uploadData.url);
      } catch (individualError) {
        console.error('❌ Erro no upload individual:', individualError);
      }
    }
    
    return {
      success: true,
      urls: urls,
      message: `${urls.length} de ${filesData.length} banner(s) enviado(s) com sucesso (fallback)`
    };
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

// ========== TESTAR CONEXÃO COM API ==========
async function testarConexao() {
  try {
    console.log('🔍 Testando conexão com a API...');
    
    // Testar health check
    await apiCall('/health');
    
    // Testar debug upload
    await apiCall('/debug-upload');
    
    console.log('✅ Todas as rotas da API estão funcionando!');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com a API:', error);
    return false;
  }
}

// ========== IMÓVEIS ==========
async function carregarImoveis(config) {
  try {
    const imoveis = await apiCall('/imoveis');
    renderizarImoveis(imoveis, config); // Passa o objeto config para renderizarImoveis
  } catch (error) {
    console.error('Erro ao carregar imóveis:', error);
  }
}

function renderizarImoveis(imoveis, config) {
  const secoes = [
    { id: 'lancamentos-cards', type: 'lancamento' },
    { id: 'planta-cards', type: 'na_planta' },
    { id: 'aluguel-cards', type: 'aluguel' }
  ];

  secoes.forEach(s => {
    const container = document.getElementById(s.id);
    if (!container) return;
    
	    const lista = (imoveis || []).filter(i => i.type === s.type);
	    
	    if (lista.length === 0) {
	      container.innerHTML = '<p class="text-center text-muted col-12">Em breve mais imóveis...</p>';
	      return;
	    }
	    
	    // 1. Agrupar imóveis em slides de 3
	    const slides = [];
	    for (let i = 0; i < lista.length; i += 3) {
	      slides.push(lista.slice(i, i + 3));
	    }
	    
	    const carouselId = `${s.id}-carousel`;
	    
	    // 2. Gerar o HTML do carrossel
		    let carouselHTML = `
		      <div id="${carouselId}" class="carousel slide" data-bs-ride="false" data-bs-interval="false">
	        <div class="carousel-indicators">
	          ${slides.map((_, index) => `
	            <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" 
	                    class="${index === 0 ? 'active' : ''}" aria-label="Slide ${index + 1}"></button>
	          `).join('')}
	        </div>
	        <div class="carousel-inner">
	          ${slides.map((slide, slideIndex) => `
	            <div class="carousel-item ${slideIndex === 0 ? 'active' : ''}">
	              <div class="row row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3 g-4">
	                ${slide.map(imovel => {
	                  const img = imovel.image_urls?.[0] || BANNER_PADRAO;
	                  // 1. Obter o link base do WhatsApp da configuração (usando o objeto 'config' carregado)
		                  let whatsappBaseLink;
		                  
		                  if (config && config.whatsapp_link) {
		                    // Prioriza o 'whatsapp_link' configurado
		                    whatsappBaseLink = config.whatsapp_link;
		                  } else if (config && config.phone) {
		                    // Fallback: Se 'whatsapp_link' estiver vazio, usa o 'phone' para construir o link wa.me
		                    const numeroLimpo = config.phone.replace(/\D/g, '');
		                    whatsappBaseLink = `https://wa.me/${numeroLimpo}`;
		                  } else {
		                    // Fallback para o link padrão
		                    whatsappBaseLink = 'https://wa.me/5534999704808';
		                  }
		                  
		                  // 2. Criar a mensagem personalizada
		                  const mensagem = encodeURIComponent(`Olá, gostaria de saber mais sobre o imóvel: ${imovel.title}`);
		                  
		                  // 3. Construir o link final: usar o link base e adicionar o parâmetro 'text'
		                  const whatsappLink = `${whatsappBaseLink.split('?')[0]}?text=${mensagem}`;
	                  
	                  return `
	                    <div class="col">
	                      <div class="card h-100 shadow border-0 property-card">
	                        <!-- INÍCIO: CARROSSEL DE IMAGENS DO CARD -->
		                        ${imovel.image_urls && imovel.image_urls.length > 1 ? `
		                          <div id="card-carousel-${imovel.id}" class="carousel slide" data-bs-interval="false">
		                            <div class="carousel-inner">
		                              ${imovel.image_urls.map((url, index) => `
		                                <div class="carousel-item ${index === 0 ? 'active' : ''}">
		                                  <img src="${url}" class="d-block w-100 card-img-top" style="height:250px;object-fit:cover;" onerror="this.src='${BANNER_PADRAO}'" alt="Foto ${index + 1}">
		                                </div>
		                              `).join('')}
		                            </div>
		                            <button class="carousel-control-prev" type="button" data-bs-target="#card-carousel-${imovel.id}" data-bs-slide="prev">
		                              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
		                              <span class="visually-hidden">Anterior</span>
		                            </button>
		                            <button class="carousel-control-next" type="button" data-bs-target="#card-carousel-${imovel.id}" data-bs-slide="next">
		                              <span class="carousel-control-next-icon" aria-hidden="true"></span>
		                              <span class="visually-hidden">Próximo</span>
		                            </button>
		                          </div>
		                        ` : `
		                          <img src="${imovel.image_urls?.[0] || BANNER_PADRAO}" class="card-img-top" style="height:250px;object-fit:cover;" onerror="this.src='${BANNER_PADRAO}'" alt="Foto Principal">
		                        `}
		                        <!-- FIM: CARROSSEL DE IMAGENS DO CARD -->
	                        <div class="card-body d-flex flex-column">
	                          <h5 class="card-title fw-bold text-truncate">${imovel.title}</h5>
	                          <p class="text-muted small mb-2"><i class="bi bi-geo-alt-fill me-1"></i>${imovel.location || 'Uberlândia'}</p>
	                          
	                          <!-- Detalhes do Imóvel -->
	                          <div class="row g-1 mb-3 small text-muted">
	                            <div class="col-6"><i class="bi bi-currency-dollar me-1"></i>Preço: ${imovel.price || 'Consulte'}</div>
	                            <div class="col-6"><i class="bi bi-rulers me-1"></i>Área: ${imovel.area || '-'}</div>
	                            <div class="col-6"><i class="bi bi-house-door-fill me-1"></i>Quartos: ${imovel.bedrooms || '-'}</div>
	                            <div class="col-6"><i class="bi bi-droplet-fill me-1"></i>Banheiros: ${imovel.bathrooms || '-'}</div>
	                            <div class="col-6"><i class="bi bi-car-fill me-1"></i>Vagas: ${imovel.garage || '-'}</div>
	                            <div class="col-6"><i class="bi bi-water me-1"></i>Piscina: ${imovel.pool ? 'Sim' : 'Não'}</div>
	                          </div>
	                          
	                          <a href="${whatsappLink}" target="_blank" class="btn btn-success mt-auto fw-bold">
	                            <i class="bi bi-whatsapp me-2"></i>Falar com Consultor
	                          </a>
	                        </div>
	                      </div>
	                    </div>
	                  `;
	                }).join('')}
	              </div>
	            </div>
	          `).join('')}
	        </div>
	        
	        <!-- Controles -->
	        ${slides.length > 1 ? `
	          <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
	            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
	            <span class="visually-hidden">Anterior</span>
	          </button>
	          <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
	            <span class="carousel-control-next-icon" aria-hidden="true"></span>
	            <span class="visually-hidden">Próximo</span>
	          </button>
	        ` : ''}
	      </div>
	    `;
	    
	    container.innerHTML = carouselHTML;
	    
	    // 3. Inicializar o carrossel
	    const carouselElement = document.getElementById(carouselId);
	    if (carouselElement) {
	      // Inicializa o carrossel sem auto-slide (interval: false)
		      const carouselInstance = new bootstrap.Carousel(carouselElement, {
		        interval: false, // Desliga o auto-slide para navegação manual (Fixo)
		        wrap: true
		      });
		      carouselInstance.pause(); // Garante que ele não inicie automaticamente
	    }
  });
}

// SALVAR IMÓVEL - CORRIGIDO
window.salvarImovel = async function(tipo) {
  try {
    const titulo = document.getElementById(`tit_${tipo}`)?.value.trim();
    if (!titulo) {
      alert("❌ Preencha o título do imóvel!");
      return;
    }

    const fileInput = document.getElementById(`fotos_${tipo}`);
    let fotosParaUpload = [];

    // Processar fotos se existirem
    if (fileInput?.files.length > 0) {
      console.log(`📸 Processando ${fileInput.files.length} fotos...`);
      
      for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        
        // Validar tamanho do arquivo
        if (file.size > 10 * 1024 * 1024) {
          alert(`❌ Arquivo ${file.name} é muito grande (máximo 10MB)`);
          continue;
        }

        // Validar tipo do arquivo
        if (!file.type.startsWith('image/')) {
          alert(`❌ Arquivo ${file.name} não é uma imagem válida`);
          continue;
        }

        try {
          const fileData = await readFileAsBase64(file);
          const ext = file.name.split('.').pop() || 'jpg';
          const filename = `imovel_${tipo}_${Date.now()}_${i}.${ext}`;
          
          fotosParaUpload.push({
            file: fileData,
            filename: filename
          });
          
          console.log(`✅ Foto preparada: ${filename}`);
        } catch (error) {
          console.error(`❌ Erro ao processar foto ${file.name}:`, error);
          alert(`❌ Erro ao processar arquivo ${file.name}`);
        }
      }
    }

    const dados = {
      type: tipo,
      title: titulo,
      description: document.getElementById(`desc_${tipo}`)?.value || '',
      price: document.getElementById(`preco_${tipo}`)?.value || '',
      location: document.getElementById(`loc_${tipo}`)?.value || 'Uberlândia - MG',
      bedrooms: parseInt(document.getElementById(`quartos_${tipo}`)?.value) || 0,
      bathrooms: parseInt(document.getElementById(`banheiros_${tipo}`)?.value) || 0,
      area: document.getElementById(`area_${tipo}`)?.value || null,
      garage: parseInt(document.getElementById(`garagem_${tipo}`)?.value) || 0,
      pool: document.getElementById(`piscina_${tipo}`)?.checked || false,
      fotosParaUpload: fotosParaUpload,
      image_urls: [] // Será preenchido pelo backend com as URLs das fotos enviadas
    };

    console.log('💾 Enviando dados do imóvel...', {
      tipo: dados.type,
      titulo: dados.title,
      fotos: dados.fotosParaUpload.length
    });

    const resultado = await apiCall('/imoveis', {
      method: 'POST',
      body: JSON.stringify(dados)
    });

    alert(`✅ ${resultado.message || "Imóvel salvo com sucesso!"}`);
    limparFormulario(tipo);
    carregarImoveis();

  } catch (error) {
    console.error('❌ Erro ao salvar imóvel:', error);
    alert("❌ Erro ao salvar imóvel: " + error.message);
  }
};

function limparFormulario(tipo) {
  document.querySelectorAll(`#tit_${tipo}, #desc_${tipo}, #preco_${tipo}, #loc_${tipo}, #quartos_${tipo}, #banheiros_${tipo}, #area_${tipo}, #garagem_${tipo}`).forEach(el => {
    el.value = '';
  });
  const piscinaCheckbox = document.getElementById(`piscina_${tipo}`);
  if (piscinaCheckbox) piscinaCheckbox.checked = false;
  
  const fileInput = document.getElementById(`fotos_${tipo}`);
  if (fileInput) fileInput.value = '';
}

// EXCLUIR IMÓVEL - CORRIGIDO
window.excluirImovel = async function(id) {
  try {
    if (!confirm("🗑️ Tem certeza que quer excluir este imóvel?")) return;
    
    await apiCall(`/imoveis/${id}`, {
      method: 'DELETE'
    });
    
    alert("✅ Imóvel excluído com sucesso!");
    carregarImoveis();
  } catch (error) {
    alert("❌ Erro ao excluir imóvel: " + error.message);
  }
}

// ========== FUNÇÕES DE EDIÇÃO DE IMÓVEIS ==========

// ABRIR MODAL DE EDIÇÃO
window.editarImovel = async function(imovel) {
  try {
    console.log('✏️ Abrindo edição do imóvel:', imovel);
    
    // Preencher o modal de edição
    document.getElementById('edit_id').value = imovel.id;
    document.getElementById('edit_titulo').value = imovel.title || '';
    document.getElementById('edit_descricao').value = imovel.description || '';
    document.getElementById('edit_preco').value = imovel.price || '';
    document.getElementById('edit_localizacao').value = imovel.location || '';
    document.getElementById('edit_quartos').value = imovel.bedrooms || '';
    document.getElementById('edit_banheiros').value = imovel.bathrooms || '';
    document.getElementById('edit_area').value = imovel.area || '';
    document.getElementById('edit_garagem').value = imovel.garage || '';
    document.getElementById('edit_piscina').checked = imovel.pool || false;
    
    // Mostrar fotos atuais em uma grade, sem carrossel
    const fotosContainer = document.getElementById('fotosAtuais');
    
    if (imovel.image_urls && imovel.image_urls.length > 0) {
      fotosContainer.innerHTML = `
        <h6 class="fw-bold mt-4 mb-3">Fotos Atuais (${imovel.image_urls.length})</h6>
        <div class="row row-cols-2 row-cols-lg-3 g-3">
          ${imovel.image_urls.map((url, index) => `
            <div class="col">
              <div class="card position-relative">
                <img src="${url}" class="img-fluid rounded" style="height: 150px; object-fit: cover;" 
                     onerror="this.src='${BANNER_PADRAO}'" alt="Foto ${index + 1}">
                <div class="position-absolute top-0 end-0 p-1">
                  <button class="btn btn-danger btn-sm" onclick="excluirFotoImovel('${imovel.id}', '${url}', ${index})" title="Excluir Foto">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      fotosContainer.innerHTML = `
        <h6 class="fw-bold mt-4 mb-3">Fotos Atuais</h6>
        <p class="text-muted">Nenhuma foto cadastrada</p>
      `;
    }
    
    // Abrir modal de edição
    new bootstrap.Modal(document.getElementById('editarImovelModal')).show();
    
  } catch (error) {
    console.error('❌ Erro ao abrir edição:', error);
    alert("❌ Erro ao carregar dados do imóvel: " + error.message);
  }
};
// EXCLUIR FOTO INDIVIDUAL DO IMÓVEL
window.excluirFotoImovel = async function(imovelId, fotoUrl, index) {
  try {
    if (!confirm("🗑️ Tem certeza que quer excluir esta foto?")) return;
    
    // Buscar imóvel atual
    const imoveis = await apiCall('/imoveis');
    const imovel = imoveis.find(i => i.id === imovelId);
    
    if (!imovel || !imovel.image_urls) return;
    
    // Remover a foto específica
    const novasFotos = imovel.image_urls.filter((url, i) => i !== index);
    
    // Atualizar imóvel
    const dadosAtualizados = {
      ...imovel,
      image_urls: novasFotos
    };
    
    await apiCall(`/imoveis/${imovelId}`, {
      method: 'PUT',
      body: JSON.stringify(dadosAtualizados)
    });
    
    alert("✅ Foto excluída com sucesso!");
    
    // Recarregar dados e reabrir edição
    const imoveisAtualizados = await apiCall('/imoveis');
    const imovelAtualizado = imoveisAtualizados.find(i => i.id === imovelId);
    await editarImovel(imovelAtualizado);
    
  } catch (error) {
    console.error('❌ Erro ao excluir foto:', error);
    alert("❌ Erro ao excluir foto: " + error.message);
  }
};

// SALVAR EDIÇÃO DO IMÓVEL
window.salvarEdicaoImovel = async function() {
  try {
    const id = document.getElementById('edit_id').value;
    const titulo = document.getElementById('edit_titulo').value.trim();
    
    if (!titulo) {
      alert("❌ Preencha o título do imóvel!");
      return;
    }

    // Buscar imóvel atual para manter fotos existentes
    const imoveis = await apiCall('/imoveis');
    const imovelAtual = imoveis.find(i => i.id === id);
    
    const fileInput = document.getElementById('edit_novas_fotos');
    let novasFotosParaUpload = [];

    // Processar NOVAS fotos se existirem
    if (fileInput?.files.length > 0) {
      console.log(`📸 Processando ${fileInput.files.length} novas fotos...`);
      
      for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        
        if (file.size > 10 * 1024 * 1024) {
          alert(`❌ Arquivo ${file.name} é muito grande (máximo 10MB)`);
          continue;
        }

        if (!file.type.startsWith('image/')) {
          alert(`❌ Arquivo ${file.name} não é uma imagem válida`);
          continue;
        }

        try {
          const fileData = await readFileAsBase64(file);
          const ext = file.name.split('.').pop() || 'jpg';
          const filename = `imovel_edit_${Date.now()}_${i}.${ext}`;
          
          novasFotosParaUpload.push({
            file: fileData,
            filename: filename
          });
          
          console.log(`✅ Nova foto preparada: ${filename}`);
        } catch (error) {
          console.error(`❌ Erro ao processar nova foto ${file.name}:`, error);
          alert(`❌ Erro ao processar arquivo ${file.name}`);
        }
      }
    }

    const dados = {
      title: titulo,
      description: document.getElementById('edit_descricao').value || '',
      price: document.getElementById('edit_preco').value || '',
      location: document.getElementById('edit_localizacao').value || '',
      bedrooms: parseInt(document.getElementById('edit_quartos').value) || 0,
      bathrooms: parseInt(document.getElementById('edit_banheiros').value) || 0,
      area: document.getElementById('edit_area').value || null,
      garage: parseInt(document.getElementById('edit_garagem').value) || 0,
      pool: document.getElementById('edit_piscina').checked || false,
      fotosExistentes: imovelAtual?.image_urls || [],
      novasFotos: novasFotosParaUpload
    };

    console.log('💾 Salvando edição do imóvel...', {
      id: id,
      titulo: dados.title,
      novas_fotos: dados.novasFotos.length
    });

    const resultado = await apiCall(`/imoveis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });

    alert(`✅ ${resultado.message || "Imóvel atualizado com sucesso!"}`);
    
    // Fechar modal e recarregar dados
    const editarModal = bootstrap.Modal.getInstance(document.getElementById('editarImovelModal'));
    if (editarModal) {
      editarModal.hide();
    }
    
    carregarImoveis();
    
    // Recarregar gestão para atualizar a lista
    if (document.getElementById('gestaoModal').style.display !== 'none') {
      await abrirGestao();
    }

  } catch (error) {
    console.error('❌ Erro ao salvar edição:', error);
    alert("❌ Erro ao atualizar imóvel: " + error.message);
  }
};

// ========== GESTÃO ==========
// Na função abrirGestao, atualize a parte que mostra os imóveis cadastrados:
async function abrirGestao() {
  try {
    const imoveis = await apiCall('/imoveis');
    await preencherCamposConfiguracao();

    const tipos = [
      { tipo: 'lancamento', nome: 'Lançamentos', tabId: 'tabLancamentos' },
      { tipo: 'na_planta', nome: 'Na Planta', tabId: 'tabPlanta' },
      { tipo: 'aluguel', nome: 'Aluguel', tabId: 'tabAluguel' }
    ];

    tipos.forEach(t => {
      const el = document.getElementById(t.tabId);
      if (!el) return;
      const lista = (imoveis || []).filter(i => i.type === t.tipo);

      el.innerHTML = `
        <h5 class="text-primary fw-bold mb-4">Cadastrar ${t.nome}</h5>
        <div class="border rounded p-4 bg-light mb-5">
          <!-- Formulário de cadastro (mantido igual) -->
          <div class="row g-3">
            <div class="col-12"><input class="form-control form-control-lg" id="tit_${t.tipo}" placeholder="Título do imóvel *"></div>
            <div class="col-12"><textarea class="form-control" rows="4" id="desc_${t.tipo}" placeholder="Descrição completa"></textarea></div>
            <div class="col-md-4"><input class="form-control" id="preco_${t.tipo}" placeholder="Preço"></div>
            <div class="col-md-4"><input class="form-control" id="loc_${t.tipo}" placeholder="Localização"></div>
            <div class="col-md-2"><input type="number" class="form-control" id="quartos_${t.tipo}" placeholder="Quartos"></div>
            <div class="col-md-2"><input type="number" class="form-control" id="banheiros_${t.tipo}" placeholder="Banheiros"></div>
            <div class="col-md-3"><input class="form-control" id="area_${t.tipo}" placeholder="Área m²"></div>
            <div class="col-md-3"><input type="number" class="form-control" id="garagem_${t.tipo}" placeholder="Vagas"></div>
            <div class="col-md-3"><div class="form-check mt-2"><input type="checkbox" class="form-check-input" id="piscina_${t.tipo}"><label class="form-check-label">Piscina</label></div></div>
            <div class="col-12"><input type="file" multiple class="form-control" id="fotos_${t.tipo}" accept="image/*"></div>
            <div class="col-12 text-end mt-3">
              <button class="btn btn-success btn-lg px-5" onclick="salvarImovel('${t.tipo}')">SALVAR IMÓVEL</button>
            </div>
          </div>
        </div>

        <h5 class="mt-5 mb-3">Imóveis Cadastrados (${lista.length})</h5>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          ${lista.map(i => `
            <div class="col">
              <div class="card h-100 shadow">
                <img src="${i.image_urls?.[0] || BANNER_PADRAO}" class="card-img-top" style="height:200px;object-fit:cover;" onerror="this.src='${BANNER_PADRAO}'">
                <div class="card-body d-flex flex-column">
                  <h6 class="fw-bold">${i.title}</h6>
                  <p class="text-muted small">${i.location || ''}</p>
                  <p class="text-primary fw-bold">${i.price || 'Consulte'}</p>
                  <div class="mt-auto">
                    <button class="btn btn-warning btn-sm me-2" onclick="editarImovel(${JSON.stringify(i).replace(/"/g, '&quot;')})">
                      <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirImovel('${i.id}')">
                      <i class="fas fa-trash"></i> Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>`;
    });

    new bootstrap.Modal(document.getElementById('gestaoModal')).show();
  } catch (error) {
    alert("❌ Erro ao abrir gestão: " + error.message);
  }
}

// FUNÇÃO PARA PREENCHER CONFIGURAÇÕES - COM BOTÕES CORRIGIDOS
async function preencherCamposConfiguracao() {
  try {
    const config = await apiCall('/site-config');
    if (config) {
      const setValueIfExists = (id, value) => {
        const element = document.getElementById(id);
        if (element && value !== undefined && value !== null) {
          element.value = value;
        }
      };

      setValueIfExists('cfg_siteName', config.site_name);
      setValueIfExists('cfg_phone', config.phone);
      setValueIfExists('cfg_email', config.company_email);
      setValueIfExists('cfg_address', config.company_address);
      setValueIfExists('cfg_whatsapp', config.whatsapp_link);
      setValueIfExists('cfg_instagram', config.instagram_link);
      setValueIfExists('cfg_facebook', config.facebook_link);
      setValueIfExists('cfg_mainColor', config.main_color);
      setValueIfExists('cfg_secondaryColor', config.secondary_color);
      setValueIfExists('cfg_textColor', config.text_color);
      setValueIfExists('cfg_logoWidth', config.logo_width);
      setValueIfExists('cfg_logoHeight', config.logo_height);
      
      // Visualização da logo atual
      const logoPreview = document.getElementById('logoPreview');
      if (logoPreview) {
        if (config.logo_url) {
          logoPreview.innerHTML = `
            <div class="card mt-2">
              <div class="card-body text-center">
                <img src="${config.logo_url}" style="max-width: 100px; max-height: 100px;" class="mb-2" 
                     onerror="this.style.display='none'">
                <br>
                <button class="btn btn-danger btn-sm" onclick="excluirLogo()">
                  <i class="fas fa-trash"></i> Excluir Logo
                </button>
              </div>
            </div>
          `;
        } else {
          logoPreview.innerHTML = '<p class="text-muted small mt-2">Nenhuma logo configurada</p>';
        }
      }
      
      // Visualização dos banners atuais - CORRIGIDO
      const bannersContainer = document.getElementById('bannersAtuais');
      if (bannersContainer) {
        if (config.banner_images && config.banner_images.length > 0) {
          // Filtrar banner padrão da lista
          const bannersCustomizados = config.banner_images.filter(url => url !== BANNER_PADRAO);
          
          if (bannersCustomizados.length > 0) {
            bannersContainer.innerHTML = `
              <h6 class="mt-4 mb-3 fw-bold">Banners Atuais (${bannersCustomizados.length})</h6>
              <div class="row g-3">
                ${bannersCustomizados.map((url, index) => `
                  <div class="col-12 col-md-6 col-lg-4">
                    <div class="card shadow-sm">
                      <img src="${url}" class="card-img-top" style="height: 150px; object-fit: cover;" 
                           onerror="this.src='${BANNER_PADRAO}'" alt="Banner ${index + 1}">
                      <div class="card-body text-center">
                        <small class="text-muted d-block">Banner ${index + 1}</small>
                        <button class="btn btn-outline-danger btn-sm mt-2" onclick="window.excluirBanner('${url}')">
                          <i class="fas fa-trash"></i> Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
              <p class="text-muted small mt-3">
                <i class="fas fa-info-circle"></i> Novos banners serão adicionados aos existentes
              </p>
            `;
          } else {
            bannersContainer.innerHTML = `
              <div class="alert alert-info mt-3">
                <i class="fas fa-info-circle"></i> Nenhum banner personalizado. 
                Usando banner padrão do sistema.
              </div>
            `;
          }
        } else {
          bannersContainer.innerHTML = `
            <div class="alert alert-info mt-3">
              <i class="fas fa-info-circle"></i> Nenhum banner configurado
            </div>
          `;
        }
      }
    }
  } catch (error) {
    console.error("Erro ao preencher configuração:", error);
  }
}
// ========== FUNÇÕES DE EXCLUSÃO DE BANNERS ==========

// EXCLUIR BANNER INDIVIDUAL - CORRIGIDO
window.excluirBanner = async function(bannerUrl) {
  try {
    console.log('🗑️ Tentando excluir banner:', bannerUrl);
    
    if (!confirm("🗑️ Tem certeza que quer excluir este banner?")) {
      console.log('❌ Exclusão cancelada pelo usuário');
      return;
    }
    
    // Buscar configuração atual
    const configAtual = await apiCall('/site-config');
    console.log('📋 Configuração atual:', configAtual);
    
    if (!configAtual || !configAtual.banner_images) {
      alert("❌ Nenhum banner encontrado para excluir");
      return;
    }
    
    // Filtrar o banner a ser excluído
    const novosBanners = configAtual.banner_images.filter(url => {
      const shouldKeep = url !== bannerUrl;
      console.log(`🔍 Comparando: ${url} === ${bannerUrl} ? ${!shouldKeep}`);
      return shouldKeep;
    });
    
    console.log(`📊 Banner removido. Antes: ${configAtual.banner_images.length}, Depois: ${novosBanners.length}`);
    
    // Se não sobrou nenhum banner, adicionar o padrão
    if (novosBanners.length === 0) {
      novosBanners.push(BANNER_PADRAO);
      console.log('🖼️ Adicionando banner padrão');
    }
    
    // Atualizar configuração
    const configData = {
      ...configAtual,
      banner_images: novosBanners
    };
    
    console.log('💾 Salvando configuração atualizada...');
    await apiCall('/site-config', {
      method: 'POST',
      body: JSON.stringify(configData)
    });
    
    alert("✅ Banner excluído com sucesso!");
    console.log('✅ Banner excluído com sucesso');
    
    // Recarregar configuração
    await carregarConfig();
    
    // Atualizar visualização na gestão
    await preencherCamposConfiguracao();
    
  } catch (error) {
    console.error('❌ Erro ao excluir banner:', error);
    alert("❌ Erro ao excluir banner: " + error.message);
  }
};

// EXCLUIR LOGO - CORRIGIDO
window.excluirLogo = async function() {
  try {
    console.log('🗑️ Tentando excluir logo...');
    
    if (!confirm("🗑️ Tem certeza que quer remover a logo?")) {
      return;
    }
    
    const configAtual = await apiCall('/site-config');
    const configData = {
      ...configAtual,
      logo_url: ""
    };
    
    await apiCall('/site-config', {
      method: 'POST',
      body: JSON.stringify(configData)
    });
    
    alert("✅ Logo removida com sucesso!");
    await preencherCamposConfiguracao();
    
  } catch (error) {
    console.error('❌ Erro ao excluir logo:', error);
    alert("❌ Erro ao excluir logo: " + error.message);
  }
};

// EXCLUIR LOGO
window.excluirLogo = async function() {
  try {
    if (!confirm("🗑️ Tem certeza que quer remover a logo?")) return;
    
    const configAtual = await apiCall('/site-config');
    const configData = {
      ...configAtual,
      logo_url: ""
    };
    
    await apiCall('/site-config', {
      method: 'POST',
      body: JSON.stringify(configData)
    });
    
    alert("✅ Logo removida com sucesso!");
    await preencherCamposConfiguracao();
    
  } catch (error) {
    console.error('❌ Erro ao excluir logo:', error);
    alert("❌ Erro ao excluir logo: " + error.message);
  }
};
// ========== GESTÃO DE MODAIS ==========
function configurarModais() {
  // Configurar modal de login
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.addEventListener('show.bs.modal', function () {
      this.setAttribute('aria-hidden', 'false');
    });
    
    loginModal.addEventListener('hide.bs.modal', function () {
      this.setAttribute('aria-hidden', 'true');
    });
  }

  // Configurar modal de gestão
  const gestaoModal = document.getElementById('gestaoModal');
  if (gestaoModal) {
    gestaoModal.addEventListener('show.bs.modal', function () {
      this.setAttribute('aria-hidden', 'false');
    });
    
    gestaoModal.addEventListener('hide.bs.modal', function () {
      this.setAttribute('aria-hidden', 'true');
    });
  }
}

// ========== LOGIN E GESTÃO ==========
async function fazerLogin() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const senha = document.getElementById('loginPassword')?.value;
  
  if (!email || !senha) {
    document.getElementById('loginError').textContent = "Preencha todos os campos!";
    return false;
  }

  // Fechar modal de login corretamente
  const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
  if (loginModal) {
    loginModal.hide();
  }

  // Abrir gestão após um pequeno delay para o modal fechar
  setTimeout(() => {
    abrirGestao();
  }, 300);

  return true;
}

// ========== INICIALIZAÇÃO ATUALIZADA ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Iniciando Lobianco Investimentos...');
  
  // Configurar modais primeiro
  configurarModais();
  
  // Carregar dados e inicializar
  carregarConfig().then((config) => {
    console.log('✅ Configuração carregada, inicializando carousel e imóveis...');
    
    // 1. Carregar Imóveis (agora com o objeto config)
    carregarImoveis(config);
    
    // 2. Garantir que o carousel principal foi inicializado
    setTimeout(() => {
      inicializarCarouselForcadamente();
    }, 300);
  });

  // Teste da API
  apiCall('/health')
    .then(data => console.log('✅ API conectada:', data))
    .catch(error => console.error('❌ Erro na API:', error));

  // Event listeners
  document.addEventListener('click', (e) => {
    if (e.target.closest('#openGestao')) {
      const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
      loginModal.show();
    }
    
    if (e.target.id === 'btnLogin' || e.target.closest('#btnLogin')) {
      e.preventDefault();
      fazerLogin();
    }
  });
});