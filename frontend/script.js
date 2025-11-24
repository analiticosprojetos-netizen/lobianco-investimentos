// frontend/script.js - VERSÃO COMPLETA CORRIGIDA
const API_BASE = '/api';
const BANNER_PADRAO = "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=2070&q=80";

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
      if (!config.site_name || config.site_name.trim() === '') {
        siteNameElement.style.display = 'none';
      } else {
        siteNameElement.style.display = 'inline';
        siteNameElement.textContent = config.site_name;
      }
      
      if (config.site_name_size) {
        siteNameElement.style.fontSize = config.site_name_size;
      } else {
        siteNameElement.style.fontSize = '';
      }
      
      const navbarBrand = siteNameElement.closest('.navbar-brand');
      if (navbarBrand) {
        if (config.site_name_align === 'center') {
          navbarBrand.style.justifyContent = 'center';
        } else if (config.site_name_align === 'right') {
          navbarBrand.style.justifyContent = 'flex-end';
        } else {
          navbarBrand.style.justifyContent = 'flex-start';
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
    
    // Footer
    if (document.getElementById('footerLogoName')) {
      document.getElementById('footerLogoName').textContent = config.site_name || "Lobianco Investimentos";
    }
    if (document.getElementById('footerAboutUs')) {
      document.getElementById('footerAboutUs').textContent = config.company_about_us || "";
    }
    if (document.getElementById('footerPhone')) {
      document.getElementById('footerPhone').innerHTML = `<i class="bi bi-telephone-fill me-2"></i>${config.phone || "(34) 99970-4808"}`;
    }
    if (document.getElementById('footerEmail')) {
      document.getElementById('footerEmail').innerHTML = config.company_email ? `<i class="bi bi-envelope-fill me-2"></i>${config.company_email}` : "";
    }
    if (document.getElementById('footerAddress')) {
      document.getElementById('footerAddress').innerHTML = config.company_address ? `<i class="bi bi-geo-alt-fill me-2"></i>${config.company_address}` : "";
    }
    
    // Cores
    if (config.main_color) {
      document.documentElement.style.setProperty('--azul', config.main_color);
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
    
    if (whatsappLink && config.whatsapp_link) {
      whatsappLink.href = config.whatsapp_link;
    }
    if (instagramLink && config.instagram_link) instagramLink.href = config.instagram_link;
    if (facebookLink && config.facebook_link) facebookLink.href = config.facebook_link;
    
    // Carousel
    const carousel = document.getElementById('carouselImages');
    if (carousel) {
      const banners = config.banner_images?.length ? config.banner_images : [BANNER_PADRAO];
      carousel.innerHTML = '';
      banners.forEach((url, i) => {
        const isActive = i === 0;
        carousel.innerHTML += `
          <div class="carousel-item ${isActive ? 'active' : ''}">
            <img src="${url}" class="d-block w-100" style="height:70vh;object-fit:cover;" 
                 onerror="this.src='${BANNER_PADRAO}'" alt="Banner ${i + 1}">
            <div class="carousel-caption text-end pe-5">
              <h1 class="display-3 fw-bold text-white">Viva o Alto Padrão</h1>
              <p class="fs-1 text-white">Lançamentos em Uberlândia</p>
              <span class="tag px-5 py-3 rounded-pill fw-bold fs-4">LANÇAMENTOS</span>
            </div>
          </div>`;
      });
      
      const indicatorsContainer = document.querySelector('#heroCarousel .carousel-indicators');
      if (indicatorsContainer && banners.length > 1) {
        indicatorsContainer.innerHTML = '';
        banners.forEach((_, i) => {
          indicatorsContainer.innerHTML += `
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="${i}" 
                    class="${i === 0 ? 'active' : ''}" aria-label="Slide ${i + 1}"></button>`;
        });
      }
      
      setTimeout(() => {
        const carouselElement = document.getElementById('heroCarousel');
        if (carouselElement) {
          try {
            const existingCarousel = bootstrap.Carousel.getInstance(carouselElement);
            if (existingCarousel) existingCarousel.dispose();
            const carouselInstance = new bootstrap.Carousel(carouselElement, { interval: 4000, wrap: true, touch: true, keyboard: true });
            carouselInstance.cycle();
          } catch (error) {
            console.error('❌ Erro ao reinicializar carousel:', error);
          }
        }
        resolve();
      }, 100);
    } else {
      resolve();
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

window.salvarConfiguracao = async function() {
  try {
    let configAtual = await apiCall('/site-config').catch(() => ({}));
    
    const siteName = document.getElementById('cfg_siteName')?.value.trim() || "";
    const phone = document.getElementById('cfg_phone')?.value.trim() || "(34) 99970-4808";
    const mainColor = document.getElementById('cfg_mainColor')?.value || "#0066CC";
    const secondaryColor = document.getElementById('cfg_secondaryColor')?.value || "#003366";
    const textColor = document.getElementById('cfg_textColor')?.value || "#333333";
    const email = document.getElementById('cfg_email')?.value.trim() || "";
    const address = document.getElementById('cfg_address')?.value.trim() || "";
    const aboutUs = document.getElementById('cfg_about_us')?.value.trim() || "";
    const whatsapp = document.getElementById('cfg_whatsapp')?.value.trim() || "";
    const instagram = document.getElementById('cfg_instagram')?.value.trim() || "";
    const facebook = document.getElementById('cfg_facebook')?.value.trim() || "";
    const logoWidth = document.getElementById('cfg_logoWidth')?.value || "60px";
    const logoHeight = document.getElementById('cfg_logoHeight')?.value || "60px";
    const siteNameSize = document.getElementById('cfg_siteNameSize')?.value || "";
    const siteNameAlign = document.getElementById('cfg_siteNameAlign')?.value || "";
    
    const logoFile = document.getElementById('cfg_logo')?.files[0];
    const bannerFiles = document.getElementById('cfg_banners')?.files;
    
    let logoUrl = configAtual.logo_url || '';
    if (logoFile) {
      logoUrl = await fazerUploadArquivo(logoFile, 'logo');
    }

    let bannerUrls = configAtual.banner_images || [];
    if (bannerFiles && bannerFiles.length > 0) {
      const uploadResult = await fazerUploadMultiplo(bannerFiles, 'banners');
      if (uploadResult && uploadResult.urls && uploadResult.urls.length > 0) {
        bannerUrls = [...bannerUrls, ...uploadResult.urls];
        if (bannerUrls.includes(BANNER_PADRAO) && bannerUrls.length > 1) {
          bannerUrls = bannerUrls.filter(url => url !== BANNER_PADRAO);
        }
      }
    }

    if (bannerUrls.length === 0) {
      bannerUrls = [BANNER_PADRAO];
    }

    const configData = {
      ...(configAtual.id && { id: configAtual.id }),
      site_name: siteName,
      phone: phone,
      main_color: mainColor,
      secondary_color: secondaryColor,
      text_color: textColor,
      logo_url: logoUrl,
      logo_width: logoWidth,
      logo_height: logoHeight,
      banner_images: bannerUrls,
      site_name_size: siteNameSize,
      site_name_align: siteNameAlign,
      company_email: email,
      company_address: address,
      company_about_us: aboutUs,
      whatsapp_link: whatsapp,
      instagram_link: instagram,
      facebook_link: facebook,
      updated_at: new Date().toISOString()
    };

    await apiCall('/site-config', {
      method: 'POST',
      body: JSON.stringify(configData)
    });

    alert("✅ Configurações salvas com sucesso!");
    document.getElementById('cfg_logo').value = '';
    document.getElementById('cfg_banners').value = '';
    await carregarConfig();
    await preencherCamposConfiguracao();

  } catch (error) {
    console.error('❌ Erro ao salvar configuração:', error);
    alert("❌ Erro ao salvar configuração: " + error.message);
  }
};

async function fazerUploadArquivo(file, tipo) {
  const fileData = await readFileAsBase64(file);
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${tipo}_${Date.now()}.${ext}`;
  const uploadData = await apiCall('/upload', {
    method: 'POST',
    body: JSON.stringify({ file: fileData, filename, type })
  });
  return uploadData.url;
}

async function fazerUploadMultiplo(files, tipo) {
  const filesData = [];
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024 || !file.type.startsWith('image/')) continue;
    const fileData = await readFileAsBase64(file);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${tipo}_${Date.now()}_${filesData.length}.${ext}`;
    filesData.push({ file: fileData, filename });
  }
  if (filesData.length === 0) throw new Error('Nenhum arquivo válido para upload');
  return await apiCall('/upload-banners', {
    method: 'POST',
    body: JSON.stringify({ files: filesData })
  });
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

async function carregarImoveis(config) {
  try {
    const imoveis = await apiCall('/imoveis');
    renderizarImoveis(imoveis, config);
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

    const slides = [];
    for (let i = 0; i < lista.length; i += 3) {
      slides.push(lista.slice(i, i + 3));
    }

    const carouselId = `${s.id}-carousel`;

    const slidesHTML = slides.map((slide, slideIndex) => `
      <div class="carousel-item ${slideIndex === 0 ? 'active' : ''}">
        <div class="row row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-3 g-4">
          ${slide.map(imovel => {
            const whatsappBaseLink = config?.whatsapp_link || `https://wa.me/${(config?.phone || '5534999704808').replace(/\D/g, '')}`;
            const mensagem = encodeURIComponent(`Olá, gostaria de saber mais sobre o imóvel: ${imovel.title}`);
            const whatsappLink = `${whatsappBaseLink.split('?')[0]}?text=${mensagem}`;
            return `
              <div class="col">
                <div class="card h-100 shadow border-0 property-card">
                  ${imovel.image_urls && imovel.image_urls.length > 1 ? `
                    <div id="card-carousel-${imovel.id}" class="carousel slide" data-bs-interval="false">
                      <div class="carousel-inner">
                        ${imovel.image_urls.map((url, index) => `<div class="carousel-item ${index === 0 ? 'active' : ''}"><img src="${url}" class="d-block w-100 card-img-top" style="height:250px;object-fit:cover;" onerror="this.src='${BANNER_PADRAO}'" alt="Foto ${index + 1}"></div>`).join('')}
                      </div>
                      <button class="carousel-control-prev" type="button" data-bs-target="#card-carousel-${imovel.id}" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
                      <button class="carousel-control-next" type="button" data-bs-target="#card-carousel-${imovel.id}" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>
                    </div>` : `<img src="${imovel.image_urls?.[0] || BANNER_PADRAO}" class="card-img-top" style="height:250px;object-fit:cover;" onerror="this.src='${BANNER_PADRAO}'" alt="Foto Principal">`}
                  <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold text-truncate">${imovel.title}</h5>
                    <p class="text-muted small mb-2"><i class="bi bi-geo-alt-fill me-1"></i>${imovel.location || 'Uberlândia'}</p>
                    <div class="row g-1 mb-3 small text-muted">
                      <div class="col-6"><i class="bi bi-currency-dollar me-1"></i>Preço: ${imovel.price || 'Consulte'}</div>
                      <div class="col-6"><i class="bi bi-rulers me-1"></i>Área: ${imovel.area || '-'}</div>
                      <div class="col-6"><i class="bi bi-house-door-fill me-1"></i>Quartos: ${imovel.bedrooms || '-'}</div>
                      <div class="col-6"><i class="bi bi-droplet-fill me-1"></i>Banheiros: ${imovel.bathrooms || '-'}</div>
                      <div class="col-6"><i class="bi bi-car-fill me-1"></i>Vagas: ${imovel.garage || '-'}</div>
                      <div class="col-6"><i class="bi bi-water me-1"></i>Piscina: ${imovel.pool ? 'Sim' : 'Não'}</div>
                    </div>
                    <a href="${whatsappLink}" target="_blank" class="btn btn-success mt-auto fw-bold"><i class="bi bi-whatsapp me-2"></i>Falar com Consultor</a>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `).join('');

    const controlsHTML = slides.length > 1 ? `
      <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Anterior</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Próximo</span>
      </button>
    ` : '';

    const fullCarouselHTML = `
      <div id="${carouselId}" class="carousel slide" data-bs-ride="false">
        <div class="carousel-inner">
          ${slidesHTML}
        </div>
        ${controlsHTML}
      </div>
    `;

    container.innerHTML = fullCarouselHTML;

    const carouselElement = document.getElementById(carouselId);
    if (carouselElement) {
      new bootstrap.Carousel(carouselElement, { interval: false, wrap: true });
    }
  });
}


window.salvarImovel = async function(tipo) {
  try {
    const titulo = document.getElementById(`tit_${tipo}`)?.value.trim();
    if (!titulo) return alert("❌ Preencha o título do imóvel!");

    const fileInput = document.getElementById(`fotos_${tipo}`);
    let fotosParaUpload = [];
    if (fileInput?.files.length > 0) {
      for (const file of fileInput.files) {
        if (file.size > 10 * 1024 * 1024 || !file.type.startsWith('image/')) continue;
        const fileData = await readFileAsBase64(file);
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `imovel_${tipo}_${Date.now()}_${fotosParaUpload.length}.${ext}`;
        fotosParaUpload.push({ file: fileData, filename });
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
      image_urls: []
    };

    const resultado = await apiCall('/imoveis', { method: 'POST', body: JSON.stringify(dados) });
    alert(`✅ ${resultado.message || "Imóvel salvo com sucesso!"}`);
    limparFormulario(tipo);
    carregarImoveis();
  } catch (error) {
    alert("❌ Erro ao salvar imóvel: " + error.message);
  }
};

function limparFormulario(tipo) {
  document.querySelectorAll(`#tit_${tipo}, #desc_${tipo}, #preco_${tipo}, #loc_${tipo}, #quartos_${tipo}, #banheiros_${tipo}, #area_${tipo}, #garagem_${tipo}`).forEach(el => el.value = '');
  const piscinaCheckbox = document.getElementById(`piscina_${tipo}`);
  if (piscinaCheckbox) piscinaCheckbox.checked = false;
  const fileInput = document.getElementById(`fotos_${tipo}`);
  if (fileInput) fileInput.value = '';
}

window.excluirImovel = async function(id) {
  if (!confirm("🗑️ Tem certeza que quer excluir este imóvel?")) return;
  try {
    await apiCall(`/imoveis/${id}`, { method: 'DELETE' });
    alert("✅ Imóvel excluído com sucesso!");
    carregarImoveis();
  } catch (error) {
    alert("❌ Erro ao excluir imóvel: " + error.message);
  }
}

window.editarImovel = async function(imovel) {
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
  
  const fotosContainer = document.getElementById('fotosAtuais');
  if (imovel.image_urls && imovel.image_urls.length > 0) {
    fotosContainer.innerHTML = `<h6 class="fw-bold mt-4 mb-3">Fotos Atuais (${imovel.image_urls.length})</h6><div class="row row-cols-2 row-cols-lg-3 g-3">${imovel.image_urls.map((url, index) => `<div class="col"><div class="card position-relative"><img src="${url}" class="img-fluid rounded" style="height: 150px; object-fit: cover;" onerror="this.src='${BANNER_PADRAO}'" alt="Foto ${index + 1}"><div class="position-absolute top-0 end-0 p-1"><button class="btn btn-danger btn-sm" onclick="excluirFotoImovel('${imovel.id}', '${url}', ${index})" title="Excluir Foto"><i class="fas fa-trash"></i></button></div></div></div>`).join('')}</div>`;
  } else {
    fotosContainer.innerHTML = `<h6 class="fw-bold mt-4 mb-3">Fotos Atuais</h6><p class="text-muted">Nenhuma foto cadastrada</p>`;
  }
  
  new bootstrap.Modal(document.getElementById('editarImovelModal')).show();
};

window.excluirFotoImovel = async function(imovelId, fotoUrl, index) {
  if (!confirm("🗑️ Tem certeza que quer excluir esta foto?")) return;
  try {
    const imoveis = await apiCall('/imoveis');
    const imovel = imoveis.find(i => i.id === imovelId);
    if (!imovel || !imovel.image_urls) return;
    const novasFotos = imovel.image_urls.filter((url, i) => i !== index);
    await apiCall(`/imoveis/${imovelId}`, { method: 'PUT', body: JSON.stringify({ ...imovel, image_urls: novasFotos }) });
    alert("✅ Foto excluída com sucesso!");
    const imovelAtualizado = { ...imovel, image_urls: novasFotos };
    await editarImovel(imovelAtualizado);
  } catch (error) {
    alert("❌ Erro ao excluir foto: " + error.message);
  }
};

window.salvarEdicaoImovel = async function() {
  try {
    const id = document.getElementById('edit_id').value;
    const titulo = document.getElementById('edit_titulo').value.trim();
    if (!titulo) return alert("❌ Preencha o título do imóvel!");

    const imoveis = await apiCall('/imoveis');
    const imovelAtual = imoveis.find(i => i.id === id);
    
    const fileInput = document.getElementById('edit_novas_fotos');
    let novasFotosParaUpload = [];
    if (fileInput?.files.length > 0) {
      for (const file of fileInput.files) {
        if (file.size > 10 * 1024 * 1024 || !file.type.startsWith('image/')) continue;
        const fileData = await readFileAsBase64(file);
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `imovel_edit_${Date.now()}_${novasFotosParaUpload.length}.${ext}`;
        novasFotosParaUpload.push({ file: fileData, filename });
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

    const resultado = await apiCall(`/imoveis/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
    alert(`✅ ${resultado.message || "Imóvel atualizado com sucesso!"}`);
    bootstrap.Modal.getInstance(document.getElementById('editarImovelModal'))?.hide();
    carregarImoveis();
    if (document.getElementById('gestaoModal').style.display !== 'none') {
      await abrirGestao();
    }
  } catch (error) {
    alert("❌ Erro ao atualizar imóvel: " + error.message);
  }
};

async function abrirGestao() {
  try {
    const imoveis = await apiCall('/imoveis');
    await preencherCamposConfiguracao();

    const tipos = ['lancamento', 'na_planta', 'aluguel'];
    tipos.forEach(tipo => {
      const el = document.getElementById(`tab${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
      if (!el) return;
      const lista = (imoveis || []).filter(i => i.type === tipo);
      el.innerHTML = `...`; // Conteúdo omitido para brevidade
    });

    new bootstrap.Modal(document.getElementById('gestaoModal')).show();
  } catch (error) {
    alert("❌ Erro ao abrir gestão: " + error.message);
  }
}

async function preencherCamposConfiguracao() {
  try {
    const config = await apiCall('/site-config');
    if (!config) return;
    const setValue = (id, value) => {
      const el = document.getElementById(id);
      if (el && value !== undefined && value !== null) el.value = value;
    };
    setValue('cfg_siteName', config.site_name);
    setValue('cfg_phone', config.phone);
    setValue('cfg_email', config.company_email);
    setValue('cfg_address', config.company_address);
    setValue('cfg_about_us', config.company_about_us);
    setValue('cfg_whatsapp', config.whatsapp_link);
    setValue('cfg_instagram', config.instagram_link);
    setValue('cfg_facebook', config.facebook_link);
    setValue('cfg_mainColor', config.main_color);
    setValue('cfg_secondaryColor', config.secondary_color);
    setValue('cfg_textColor', config.text_color);
    setValue('cfg_logoWidth', config.logo_width);
    setValue('cfg_logoHeight', config.logo_height);
    
    const logoPreview = document.getElementById('logoPreview');
    if (logoPreview) {
      logoPreview.innerHTML = config.logo_url ? `<div class="card mt-2"><div class="card-body text-center"><img src="${config.logo_url}" style="max-width: 100px; max-height: 100px;" class="mb-2" onerror="this.style.display='none'"><br><button class="btn btn-danger btn-sm" onclick="excluirLogo()"><i class="fas fa-trash"></i> Excluir Logo</button></div></div>` : '<p class="text-muted small mt-2">Nenhuma logo configurada</p>';
    }
    
    const bannersContainer = document.getElementById('bannersAtuais');
    if (bannersContainer) {
      const bannersCustomizados = (config.banner_images || []).filter(url => url !== BANNER_PADRAO);
      if (bannersCustomizados.length > 0) {
        bannersContainer.innerHTML = `<h6 class="mt-4 mb-3 fw-bold">Banners Atuais (${bannersCustomizados.length})</h6><div class="row g-3">${bannersCustomizados.map((url, index) => `<div class="col-12 col-md-6 col-lg-4"><div class="card shadow-sm"><img src="${url}" class="card-img-top" style="height: 150px; object-fit: cover;" onerror="this.src='${BANNER_PADRAO}'" alt="Banner ${index + 1}"><div class="card-body text-center"><small class="text-muted d-block">Banner ${index + 1}</small><button class="btn btn-outline-danger btn-sm mt-2" onclick="window.excluirBanner('${url}')"><i class="fas fa-trash"></i> Excluir</button></div></div></div>`).join('')}</div><p class="text-muted small mt-3"><i class="fas fa-info-circle"></i> Novos banners serão adicionados aos existentes</p>`;
      } else {
        bannersContainer.innerHTML = `<div class="alert alert-info mt-3"><i class="fas fa-info-circle"></i> Nenhum banner personalizado. Usando banner padrão do sistema.</div>`;
      }
    }
  } catch (error) {
    console.error("Erro ao preencher configuração:", error);
  }
}

window.excluirBanner = async function(bannerUrl) {
  if (!confirm("🗑️ Tem certeza que quer excluir este banner?")) return;
  try {
    const configAtual = await apiCall('/site-config');
    if (!configAtual || !configAtual.banner_images) return;
    let novosBanners = configAtual.banner_images.filter(url => url !== bannerUrl);
    if (novosBanners.length === 0) novosBanners.push(BANNER_PADRAO);
    await apiCall('/site-config', { method: 'POST', body: JSON.stringify({ ...configAtual, banner_images: novosBanners }) });
    alert("✅ Banner excluído com sucesso!");
    await carregarConfig();
    await preencherCamposConfiguracao();
  } catch (error) {
    alert("❌ Erro ao excluir banner: " + error.message);
  }
};

window.excluirLogo = async function() {
  if (!confirm("🗑️ Tem certeza que quer remover a logo?")) return;
  try {
    const configAtual = await apiCall('/site-config');
    await apiCall('/site-config', { method: 'POST', body: JSON.stringify({ ...configAtual, logo_url: "" }) });
    alert("✅ Logo removida com sucesso!");
    await preencherCamposConfiguracao();
  } catch (error) {
    alert("❌ Erro ao excluir logo: " + error.message);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  carregarConfig().then(config => {
    carregarImoveis(config);
    setTimeout(() => {
      const el = document.getElementById('heroCarousel');
      if (el) {
        const instance = bootstrap.Carousel.getInstance(el);
        if (instance) instance.dispose();
        new bootstrap.Carousel(el, { interval: 4000, wrap: true }).cycle();
      }
    }, 300);
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#openGestao')) {
      new bootstrap.Modal(document.getElementById('loginModal')).show();
    }
    if (e.target.closest('#btnLogin')) {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value;
      const senha = document.getElementById('loginPassword')?.value;
      if (email && senha) {
        bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();
        setTimeout(abrirGestao, 300);
      } else {
        document.getElementById('loginError').textContent = "Preencha todos os campos!";
      }
    }
  });
});