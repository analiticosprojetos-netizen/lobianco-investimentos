// frontend/script.js - VERSÃO COMPLETA CORRIGIDA
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = isLocal ? 'http://localhost:3000/api' : '/api';
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
async function carregarConfig() {
  try {
    const config = await apiCall('/site-config');
    await aplicarConfiguracoes(config);
  } catch (error) {
    console.error('Erro ao carregar configuração:', error);
    aplicarConfigPadrao();
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
    
    if (whatsappLink && config.whatsapp_link) whatsappLink.href = config.whatsapp_link;
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
    
    // 1. Coletar dados do formulário
    const configData = {
      site_name: document.getElementById('cfg_siteName').value,
      phone: document.getElementById('cfg_phone').value,
      company_email: document.getElementById('cfg_email').value,
      company_address: document.getElementById('cfg_address').value,
      whatsapp_link: document.getElementById('cfg_whatsapp').value,
      instagram_link: document.getElementById('cfg_instagram').value,
      facebook_link: document.getElementById('cfg_facebook').value,
      main_color: document.getElementById('cfg_mainColor').value,
      secondary_color: document.getElementById('cfg_secondaryColor').value,
      text_color: document.getElementById('cfg_textColor').value,
      logo_width: document.getElementById('cfg_logoWidth').value,
      logo_height: document.getElementById('cfg_logoHeight').value,
      site_name_size: document.getElementById('cfg_siteNameSize').value,
      site_name_align: document.getElementById('cfg_siteNameAlign').value,
      // Manter banners existentes
      banner_images: configAtual.banner_images || []
    };
    
    // 2. Processar upload de logo, se houver
    const logoFile = document.getElementById('cfg_logo').files[0];
    if (logoFile) {
      console.log('🖼️ Uploading novo logo...');
      const logoBase64 = await readFileAsBase64(logoFile);
      const ext = logoFile.name.split('.').pop() || 'png';
      const filename = `logo_${Date.now()}.${ext}`;
      
      const uploadResult = await apiCall('/upload', {
        method: 'POST',
        body: JSON.stringify({
          file: logoBase64,
          filename: filename,
          type: 'logo'
        })
      });
      configData.logo_url = uploadResult.url;
      console.log('✅ Logo enviado:', configData.logo_url);
    } else {
      // Manter logo existente se não houver novo upload
      configData.logo_url = configAtual.logo_url || '';
    }
    
    // 3. Processar upload de banners, se houver
    const bannerFiles = document.getElementById('cfg_banners').files;
    if (bannerFiles.length > 0) {
      console.log(`🖼️ Uploading ${bannerFiles.length} novos banners...`);
      
      const filesData = [];
      for (let i = 0; i < bannerFiles.length; i++) {
        const file = bannerFiles[i];
        const base64 = await readFileAsBase64(file);
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `banner_${Date.now()}_${i}.${ext}`;
        filesData.push({ file: base64, filename: filename });
      }
      
      // Tenta upload múltiplo, se falhar, faz upload individual
      let uploadResult;
      try {
        uploadResult = await apiCall('/upload-banners', {
          method: 'POST',
          body: JSON.stringify({ files: filesData })
        });
      } catch (error) {
        console.warn('⚠️ Upload múltiplo falhou, tentando upload individual...', error);
        uploadResult = await uploadBannersIndividualmente(filesData);
      }
      
      // Adicionar novas URLs de banners às existentes
      configData.banner_images = [...(configAtual.banner_images || []), ...uploadResult.urls];
      console.log(`✅ ${uploadResult.urls.length} novos banners adicionados.`);
    }
    
    // 4. Enviar dados completos para a API
    const result = await apiCall('/site-config', {
      method: 'POST',
      body: JSON.stringify(configData)
    });
    
    alert('✅ Configuração salva com sucesso!');
    await carregarConfig(); // Recarrega as configurações para atualizar a interface
    
  } catch (error) {
    console.error('❌ Erro ao salvar configuração:', error);
    alert(`❌ Erro ao salvar configuração: ${error.message}`);
  }
}

async function uploadBannersIndividualmente(filesData) {
  if (filesData.length === 0) return { success: true, urls: [], message: 'Nenhum arquivo para upload' };
  
  console.log(`⚠️ Tentando upload individual de ${filesData.length} banners...`);
  
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
async function carregarImoveis() {
  try {
    const imoveis = await apiCall('/imoveis');
    renderizarImoveis(imoveis);
  } catch (error) {
    console.error('Erro ao carregar imóveis:', error);
  }
}

function renderizarImoveis(imoveis) {
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
		                  const fotos = imovel.image_urls || [];
		                  const fotosLimitadas = fotos.slice(0, 5); // Limita a 5 fotos
		                  const fotoPrincipal = fotos[0] || BANNER_PADRAO;
		                  const whatsappLink = document.getElementById('cfg_whatsapp')?.value || 'https://wa.me/5534999704808';
		                  
		                  // Mensagem pré-preenchida do WhatsApp
		                  const mensagemWhatsapp = encodeURIComponent(`Olá, gostaria de ter mais detalhes desse imóvel: ${imovel.title}`);
		                  const linkWhatsappCompleto = `${whatsappLink.replace('https://wa.me/', 'https://api.whatsapp.com/send?phone=')}&text=${mensagemWhatsapp}`;
		                  
		                  // ID único para o carrossel interno do card
		                  const cardCarouselId = `card-carousel-${imovel.id}`;
		                  
		                  return `
		                    <div class="col">
		                      <div class="card h-100 shadow border-0 property-card">
		                        
		                        <!-- Carrossel de Fotos do Card -->
		                        <div id="${cardCarouselId}" class="carousel slide" data-bs-interval="false">
		                          <div class="carousel-inner">
		                            ${fotosLimitadas.map((url, i) => `
		                              <div class="carousel-item ${i === 0 ? 'active' : ''}">
		                                <img src="${url}" class="d-block w-100" style="height:250px;object-fit:cover;" 
		                                     onerror="this.src='${BANNER_PADRAO}'" 
		                                     alt="Foto ${i + 1} de ${imovel.title}"
		                                     data-bs-toggle="modal" data-bs-target="#photoModal" 
		                                     data-imovel-id="${imovel.id}" data-foto-index="${i}"
		                                     onclick="abrirModalFotos('${imovel.id}', ${i})">
		                              </div>
		                            `).join('')}
		                            ${fotosLimitadas.length === 0 ? `
		                              <div class="carousel-item active">
		                                <img src="${BANNER_PADRAO}" class="d-block w-100" style="height:250px;object-fit:cover;" 
		                                     alt="Sem foto"
		                                     data-bs-toggle="modal" data-bs-target="#photoModal" 
		                                     data-imovel-id="${imovel.id}" data-foto-index="0"
		                                     onclick="abrirModalFotos('${imovel.id}', 0)">
		                              </div>
		                            ` : ''}
		                          </div>
		                          
		                          ${fotosLimitadas.length > 1 ? `
		                            <button class="carousel-control-prev" type="button" data-bs-target="#${cardCarouselId}" data-bs-slide="prev">
		                              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
		                              <span class="visually-hidden">Anterior</span>
		                            </button>
		                            <button class="carousel-control-next" type="button" data-bs-target="#${cardCarouselId}" data-bs-slide="next">
		                              <span class="carousel-control-next-icon" aria-hidden="true"></span>
		                              <span class="visually-hidden">Próximo</span>
		                            </button>
		                          ` : ''}
		                        </div>
		                        <!-- Fim Carrossel de Fotos do Card -->
		                        
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
		                          
		                          <a href="${linkWhatsappCompleto}" target="_blank" class="btn btn-success mt-auto fw-bold">
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

// Função para abrir o modal de fotos (Nova)
window.abrirModalFotos = function(imovelId, fotoIndex) {
    // 1. Encontrar o imóvel na lista
    const imoveis = window.imoveisData || []; // Assumindo que você armazena os dados em uma variável global
    const imovel = imoveis.find(i => i.id === imovelId);
    
    if (!imovel || !imovel.image_urls || imovel.image_urls.length === 0) {
        console.error('Imóvel ou fotos não encontrados para o ID:', imovelId);
        return;
    }
    
    const fotos = imovel.image_urls.slice(0, 5);
    const modalCarouselInner = document.getElementById('modalCarouselInner');
    const modalCarouselIndicators = document.getElementById('modalCarouselIndicators');
    
    if (!modalCarouselInner || !modalCarouselIndicators) {
        console.error('Elementos do modal de fotos não encontrados.');
        return;
    }
    
    // 2. Gerar o conteúdo do carrossel do modal
    let innerHTML = '';
    let indicatorsHTML = '';
    
    fotos.forEach((url, i) => {
        const isActive = i === fotoIndex;
        innerHTML += `
            <div class="carousel-item ${isActive ? 'active' : ''}">
                <img src="${url}" class="d-block w-100" alt="Foto ${i + 1} de ${imovel.title}">
            </div>
        `;
        indicatorsHTML += `
            <button type="button" data-bs-target="#photoModalCarousel" data-bs-slide-to="${i}" 
                    class="${isActive ? 'active' : ''}" aria-label="Slide ${i + 1}"></button>
        `;
    });
    
    modalCarouselInner.innerHTML = innerHTML;
    modalCarouselIndicators.innerHTML = indicatorsHTML;
    
    // 3. Atualizar o título do modal
    document.getElementById('photoModalLabel').textContent = imovel.title;
    
    // 4. Inicializar/Reinicializar o carrossel do modal
    const modalCarouselElement = document.getElementById('photoModalCarousel');
    if (modalCarouselElement) {
        // Destruir instância anterior para garantir que o slide correto seja exibido
        const existingCarousel = bootstrap.Carousel.getInstance(modalCarouselElement);
        if (existingCarousel) {
            existingCarousel.dispose();
        }
        
        // Criar nova instância
        const modalCarousel = new bootstrap.Carousel(modalCarouselElement, {
            interval: false,
            wrap: true
        });
        
        // Mover para a foto clicada
        modalCarousel.to(fotoIndex);
    }
    
    // 5. Abrir o modal (já deve estar aberto pelo data-bs-target, mas é bom garantir)
    const photoModal = new bootstrap.Modal(document.getElementById('photoModal'));
    photoModal.show();
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
          alert(`❌ Erro ao processar foto ${file.name}: ${error.message}`);
        }
      }
    }

    const imovelData = {
      title: titulo,
      type: tipo,
      location: document.getElementById(`loc_${tipo}`)?.value,
      price: document.getElementById(`prc_${tipo}`)?.value,
      area: document.getElementById(`area_${tipo}`)?.value,
      bedrooms: document.getElementById(`qto_${tipo}`)?.value,
      bathrooms: document.getElementById(`bnh_${tipo}`)?.value,
      garage: document.getElementById(`vgs_${tipo}`)?.value,
      pool: document.getElementById(`pisc_${tipo}`)?.checked,
      description: document.getElementById(`desc_${tipo}`)?.value,
      // Adiciona as fotos para upload, a API cuidará do resto
      fotosParaUpload: fotosParaUpload,
      image_urls: [] // Inicializa vazio, a API preenche
    };

    // Se for uma atualização (editando), o ID estará presente
    const imovelId = document.getElementById(`id_${tipo}`)?.value;
    
    let result;
    if (imovelId) {
      // ATUALIZAÇÃO
      // A API espera que as fotos existentes sejam passadas no body para serem mantidas
      const fotosExistentes = Array.from(document.querySelectorAll(`#fotosExistentes_${tipo} img`)).map(img => img.dataset.url);
      
      imovelData.fotosExistentes = fotosExistentes;
      imovelData.novasFotos = fotosParaUpload; // Renomeia para o PUT
      delete imovelData.fotosParaUpload;
      
      result = await apiCall(`/imoveis/${imovelId}`, {
        method: 'PUT',
        body: JSON.stringify(imovelData)
      });
      alert('✅ Imóvel atualizado com sucesso!');
    } else {
      // NOVO CADASTRO
      result = await apiCall('/imoveis', {
        method: 'POST',
        body: JSON.stringify(imovelData)
      });
      alert('✅ Imóvel cadastrado com sucesso!');
    }

    // Limpar formulário e recarregar
    document.getElementById(`form_${tipo}`)?.reset();
    document.getElementById(`fotosPreview_${tipo}`).innerHTML = '';
    document.getElementById(`fotosExistentes_${tipo}`).innerHTML = '';
    document.getElementById(`id_${tipo}`).value = ''; // Limpa o ID para o próximo cadastro
    
    await carregarImoveis();
    await carregarImoveisGestao(); // Recarrega a lista de gestão
    
  } catch (error) {
    console.error(`❌ Erro ao salvar imóvel (${tipo}):`, error);
    alert(`❌ Erro ao salvar imóvel: ${error.message}`);
  }
}

// CARREGAR IMÓVEIS PARA GESTÃO - CORRIGIDO
async function carregarImoveisGestao() {
  try {
    const imoveis = await apiCall('/imoveis');
    
    // Armazenar globalmente para uso no modal de fotos
    window.imoveisData = imoveis; 
    
    renderizarTabelaGestao(imoveis.filter(i => i.type === 'lancamento'), 'tabelaLancamentos');
    renderizarTabelaGestao(imoveis.filter(i => i.type === 'na_planta'), 'tabelaPlanta');
    renderizarTabelaGestao(imoveis.filter(i => i.type === 'aluguel'), 'tabelaAluguel');
    
  } catch (error) {
    console.error('Erro ao carregar imóveis para gestão:', error);
  }
}

function renderizarTabelaGestao(imoveis, tabelaId) {
  const tbody = document.getElementById(tabelaId);
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (imoveis.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhum imóvel cadastrado.</td></tr>';
    return;
  }
  
  imoveis.forEach(imovel => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${imovel.id}</td>
      <td>${imovel.title}</td>
      <td>${imovel.location || '-'}</td>
      <td>${imovel.price || '-'}</td>
      <td>${imovel.image_urls?.length || 0}</td>
      <td>
        <button class="btn btn-sm btn-primary me-2" onclick="editarImovel('${imovel.id}', '${imovel.type}')">
          <i class="bi bi-pencil-fill"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="excluirImovel('${imovel.id}')">
          <i class="bi bi-trash-fill"></i>
        </button>
      </td>
    `;
  });
}

// EDITAR IMÓVEL - CORRIGIDO
window.editarImovel = function(id, tipo) {
  const imovel = window.imoveisData.find(i => i.id === id);
  if (!imovel) {
    alert('Imóvel não encontrado!');
    return;
  }
  
  // 1. Preencher campos de texto
  document.getElementById(`id_${tipo}`).value = imovel.id;
  document.getElementById(`tit_${tipo}`).value = imovel.title || '';
  document.getElementById(`loc_${tipo}`).value = imovel.location || '';
  document.getElementById(`prc_${tipo}`).value = imovel.price || '';
  document.getElementById(`area_${tipo}`).value = imovel.area || '';
  document.getElementById(`qto_${tipo}`).value = imovel.bedrooms || '';
  document.getElementById(`bnh_${tipo}`).value = imovel.bathrooms || '';
  document.getElementById(`vgs_${tipo}`).value = imovel.garage || '';
  document.getElementById(`pisc_${tipo}`).checked = imovel.pool || false;
  document.getElementById(`desc_${tipo}`).value = imovel.description || '';
  
  // 2. Preencher pré-visualização de fotos existentes
  const fotosExistentesDiv = document.getElementById(`fotosExistentes_${tipo}`);
  fotosExistentesDiv.innerHTML = '';
  
  if (imovel.image_urls && imovel.image_urls.length > 0) {
    imovel.image_urls.forEach((url, index) => {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'position-relative d-inline-block me-2 mb-2';
      imgContainer.innerHTML = `
        <img src="${url}" class="img-thumbnail" style="width: 100px; height: 100px; object-fit: cover;" data-url="${url}">
        <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0" 
                onclick="removerFotoExistente(this, '${tipo}', '${url}')">
          <i class="bi bi-x"></i>
        </button>
      `;
      fotosExistentesDiv.appendChild(imgContainer);
    });
  }
  
  // 3. Mudar para a aba de cadastro/edição
  const tabButton = document.querySelector(`#gestaoModal button[data-bs-target="#tab${tipo.charAt(0).toUpperCase() + tipo.slice(1)}"]`);
  if (tabButton) {
    bootstrap.Tab.getInstance(tabButton).show();
  }
  
  // 4. Rolar para o topo do modal
  document.querySelector('#gestaoModal .modal-body').scrollTop = 0;
}

// REMOVER FOTO EXISTENTE - CORRIGIDO
window.removerFotoExistente = function(button, tipo, url) {
  if (confirm('Tem certeza que deseja remover esta foto? Ela será removida permanentemente ao salvar o imóvel.')) {
    const container = button.closest('.position-relative');
    container.remove();
    
    // Adicionar a URL a uma lista de exclusão temporária se necessário, mas por enquanto, 
    // a lógica de salvar vai apenas enviar as URLs que restaram na div `fotosExistentes`
    console.log(`Foto ${url} marcada para exclusão.`);
  }
}

// EXCLUIR IMÓVEL - CORRIGIDO
window.excluirImovel = async function(id) {
  if (!confirm('Tem certeza que deseja excluir este imóvel? Esta ação é irreversível e removerá todas as fotos associadas.')) {
    return;
  }
  
  try {
    await apiCall(`/imoveis/${id}`, {
      method: 'DELETE'
    });
    
    alert('✅ Imóvel excluído com sucesso!');
    await carregarImoveis();
    await carregarImoveisGestao();
    
  } catch (error) {
    console.error('❌ Erro ao excluir imóvel:', error);
    alert(`❌ Erro ao excluir imóvel: ${error.message}`);
  }
}

// PREVIEW DE FOTOS NO CADASTRO - CORRIGIDO
window.previewFotos = function(input, previewId) {
  const preview = document.getElementById(previewId);
  preview.innerHTML = '';
  
  if (input.files) {
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'img-thumbnail me-2 mb-2';
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Carregar configurações (cores, logo, banners)
  await carregarConfig();
  
  // 2. Carregar imóveis para o frontend
  await carregarImoveis();
  
  // 3. Configurar eventos de gestão
  const gestaoModal = document.getElementById('gestaoModal');
  if (gestaoModal) {
    gestaoModal.addEventListener('show.bs.modal', carregarImoveisGestao);
  }
  
  // 4. Evento para abrir modal de login
  document.getElementById('openGestao')?.addEventListener('click', () => {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
  });
  
  // 5. Evento de login (simples)
  document.getElementById('btnLogin')?.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (email === 'qualquer coisa' && password === 'qualquer coisa') {
      errorDiv.textContent = '';
      const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
      loginModal.hide();
      
      const gestaoModal = new bootstrap.Modal(document.getElementById('gestaoModal'));
      gestaoModal.show();
    } else {
      errorDiv.textContent = 'E-mail ou senha incorretos.';
    }
  });
  
  // 6. Configurar eventos de preview de fotos
  document.getElementById('fotos_lancamento')?.addEventListener('change', function() { previewFotos(this, 'fotosPreview_lancamento'); });
  document.getElementById('fotos_planta')?.addEventListener('change', function() { previewFotos(this, 'fotosPreview_planta'); });
  document.getElementById('fotos_aluguel')?.addEventListener('change', function() { previewFotos(this, 'fotosPreview_aluguel'); });
  
  // 7. Configurar eventos de salvar
  document.getElementById('btnSalvarLancamento')?.addEventListener('click', () => salvarImovel('lancamento'));
  document.getElementById('btnSalvarPlanta')?.addEventListener('click', () => salvarImovel('na_planta'));
  document.getElementById('btnSalvarAluguel')?.addEventListener('click', () => salvarImovel('aluguel'));
  
  // 8. Configurar evento de salvar configuração
  document.getElementById('btnSalvarConfig')?.addEventListener('click', salvarConfiguracao);
  
  // 9. Configurar evento de preview de logo
  document.getElementById('cfg_logo')?.addEventListener('change', function() {
    const preview = document.getElementById('cfg_logoPreview');
    preview.innerHTML = '';
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" class="img-thumbnail" style="width: 100px; height: 100px; object-fit: cover;">`;
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
  
  // 10. Configurar evento de preview de banners
  document.getElementById('cfg_banners')?.addEventListener('change', function() {
    const preview = document.getElementById('cfg_bannersPreview');
    preview.innerHTML = '';
    if (this.files) {
      Array.from(this.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.className = 'img-thumbnail me-2 mb-2';
          img.style.width = '100px';
          img.style.height = '100px';
          img.style.objectFit = 'cover';
          preview.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    }
  });
  
  // 11. Configurar evento de limpeza de configuração
  document.getElementById('btnLimparConfig')?.addEventListener('click', async () => {
    if (confirm('Tem certeza que deseja limpar as configurações duplicadas?')) {
      try {
        const result = await apiCall('/cleanup-config', { method: 'DELETE' });
        alert(`✅ ${result.message}`);
      } catch (error) {
        alert(`❌ Erro ao limpar configurações: ${error.message}`);
      }
    }
  });
  
  // 12. Inicializar o carrossel principal após o carregamento das imagens
  const heroCarouselElement = document.getElementById('heroCarousel');
  if (heroCarouselElement) {
    // Garante que o carrossel do hero seja inicializado, mesmo que sem imagens
    new bootstrap.Carousel(heroCarouselElement, {
      interval: 4000,
      wrap: true
    });
  }
});

// Armazenar dados dos imóveis globalmente para acesso pelo modal
window.imoveisData = [];
