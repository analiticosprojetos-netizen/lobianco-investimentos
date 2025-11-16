/* chatbot.js */

document.addEventListener('DOMContentLoaded', () => {
    const launcher = document.createElement('div');
    launcher.id = 'chatbot-launcher';
    launcher.innerHTML = '<i class="fas fa-comments"></i>';
    document.body.appendChild(launcher);

    const windowHTML = `
        <div class="chat-header">
            <span>Assistente Lobianco</span>
            <button id="chat-close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="chat-body" id="chat-body">
            <!-- Mensagens serão injetadas aqui -->
        </div>
        <div class="chat-footer" id="chat-footer">
            <input type="text" id="chat-input" placeholder="Digite sua mensagem...">
            <button id="chat-send-btn"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatbot-window';
    chatWindow.innerHTML = windowHTML;
    document.body.appendChild(chatWindow);

    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatCloseBtn = document.getElementById('chat-close-btn');

    // Estado do Chatbot
    let chatOpen = false;
    let currentStep = 'initial';
    let imoveisData = null;

    // NOVO: Variáveis para controle de tempo
    let autoCloseTimer = null; // Guarda o timer para fechar o chat
    let hasInteracted = false; // Controla se o usuário interagiu

    // Variáveis de tempo
    const now = new Date();
    const hour = now.getHours();
    let saudacao;

    if (hour >= 5 && hour < 12) {
        saudacao = 'Bom dia';
    } else if (hour >= 12 && hour < 18) {
        saudacao = 'Boa tarde';
    } else {
        saudacao = 'Boa noite';
    }

    // ========== FUNÇÕES DE INTERFACE ==========

    launcher.addEventListener('click', () => {
        toggleChat();
    });

    chatCloseBtn.addEventListener('click', () => {
        toggleChat();
    });

    function toggleChat(forceOpen = false) {
        const shouldOpen = forceOpen || !chatOpen;
        
        if (chatOpen === shouldOpen) return; // Evita abrir/fechar se já estiver no estado desejado

        chatOpen = shouldOpen;
        chatWindow.classList.toggle('open', chatOpen);
        launcher.style.display = chatOpen ? 'none' : 'flex';

        if (chatOpen) {
            if (chatBody.children.length === 0) {
                startChat();
            }
            chatInput.focus();
            chatInput.disabled = false;
            chatSendBtn.disabled = false;
            
            // NOVO: Inicia o timer para fechar automaticamente
            startAutoCloseTimer(); 
        } else {
            chatInput.disabled = true;
            chatSendBtn.disabled = true;
            
            // NOVO: Cancela qualquer timer de fechamento pendente
            cancelAutoCloseTimer();
        }
    }

    function addMessage(text, sender, options = []) {
        const messageContainer = document.createElement('div');
        messageContainer.className = `chat-message ${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.innerHTML = text;
        
        messageContainer.appendChild(bubble);
        chatBody.appendChild(messageContainer);

        if (options.length > 0) {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'chat-options';
            options.forEach(option => {
                const btn = document.createElement('button');
                btn.textContent = option.text;
                btn.addEventListener('click', () => {
                    handleUserResponse(option.value || option.text);
                    optionsDiv.remove();
                });
                optionsDiv.appendChild(btn);
            });
            bubble.appendChild(optionsDiv);
        }

        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'chat-message bot typing-indicator-container';
        indicator.innerHTML = `
            <div class="chat-bubble typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        chatBody.appendChild(indicator);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = chatBody.querySelector('.typing-indicator-container');
        if (indicator) {
            indicator.remove();
        }
    }

    // ========== LÓGICA DO CHATBOT ==========

    async function startChat() {
        addTypingIndicator();
        await new Promise(r => setTimeout(r, 1000));
        removeTypingIndicator();

        const initialMessage = `${saudacao}! Eu sou o Assistente Lobianco. Estou aqui para te ajudar a encontrar o imóvel perfeito.`;
        addMessage(initialMessage, 'bot');

        await new Promise(r => setTimeout(r, 1500));
        
        await loadImoveisData();
        showMainOptions();
    }

    async function loadImoveisData() {
        const API_BASE = window.API_BASE || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000/api' : '/api' );
        try {
            const response = await fetch(`${API_BASE}/imoveis`);
            if (!response.ok) throw new Error('Erro ao carregar imóveis da API');
            imoveisData = await response.json();
        } catch (error) {
            console.error('Erro no chatbot ao carregar imóveis:', error);
            imoveisData = [];
        }
    }

    function showMainOptions() {
        currentStep = 'main_options';
        const options = [
            { text: 'Lançamentos', value: 'lancamento' },
            { text: 'Na Planta', value: 'na_planta' },
            { text: 'Aluguel', value: 'aluguel' }
        ];
        
        const question = 'O que você está buscando hoje?';
        addMessage(question, 'bot', options);
    }

    function handleUserResponse(response) {
        // NOVO: Registra a interação e cancela o fechamento automático
        registerInteraction();

        addMessage(response, 'user');
        
        if (currentStep === 'main_options') {
            processImovelType(response);
        } else if (currentStep === 'search_again') {
            if (response.toLowerCase().includes('sim') || response.toLowerCase().includes('s')) {
                showMainOptions();
            } else {
                endChat();
            }
        } else {
            processFreeTextSearch(response);
        }
    }

    async function processImovelType(type) {
        addTypingIndicator();
        await new Promise(r => setTimeout(r, 1000));
        removeTypingIndicator();

        const typeMap = {
            'lancamento': 'Lançamentos',
            'na_planta': 'Imóveis na Planta',
            'aluguel': 'Imóveis para Aluguel'
        };
        
        const typeKey = type.toLowerCase().replace(/\s/g, '_');
        const filtered = imoveisData.filter(i => i.type === typeKey);

        if (filtered.length > 0) {
            let responseText = `Encontrei ${filtered.length} ${typeMap[typeKey] || type}. Aqui estão alguns destaques:`;
            addMessage(responseText, 'bot');

            filtered.slice(0, 3).forEach(imovel => {
                const imovelCard = `
                    <div style="border: 1px solid #ccc; padding: 10px; margin-top: 10px; border-radius: 5px; background: #f9f9f9;">
                        <strong>${imovel.title}</strong>  

                        Preço: ${imovel.price || 'Consulte'}  

                        Localização: ${imovel.location || 'Não informada'}  

                        <a href="#${imovel.type}" style="color: var(--chat-primary); text-decoration: none;">Ver Detalhes no Site</a>
                    </div>
                `;
                addMessage(imovelCard, 'bot');
            });
            
        } else {
            addMessage(`Desculpe, não encontrei nenhum ${typeMap[typeKey] || type} disponível no momento.`, 'bot');
        }

        await new Promise(r => setTimeout(r, 1500));
        askToContinue();
    }

    function askToContinue() {
        currentStep = 'search_again';
        const options = [
            { text: 'Sim, buscar outro tipo', value: 'sim' },
            { text: 'Não, obrigado', value: 'nao' }
        ];
        addMessage('Gostaria de buscar outro tipo de imóvel?', 'bot', options);
    }

    function endChat() {
        addMessage('Entendido. Foi um prazer te ajudar! Tenha um ótimo dia e volte sempre.', 'bot');
        currentStep = 'finished';
        chatInput.disabled = true;
        chatSendBtn.disabled = true;
        launcher.style.display = 'none';
    }

    chatSendBtn.addEventListener('click', () => {
        const text = chatInput.value.trim();
        if (text) {
            handleUserResponse(text);
            chatInput.value = '';
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            chatSendBtn.click();
        }
    });
    
    async function processFreeTextSearch(text) {
        addTypingIndicator();
        await new Promise(r => setTimeout(r, 1000));
        removeTypingIndicator();

        const termo = text.toLowerCase();
        
        let tipoBuscado = null;
        if (termo.includes('lançamento') || termo.includes('lancamento')) tipoBuscado = 'lancamento';
        else if (termo.includes('planta')) tipoBuscado = 'na_planta';
        else if (termo.includes('aluguel')) tipoBuscado = 'aluguel';

        if (tipoBuscado) {
            addMessage(`Entendi! Você está buscando por ${tipoBuscado.replace('_', ' ')}.`, 'bot');
            processImovelType(tipoBuscado);
            return;
        }

        const resultados = imoveisData.filter(imovel => 
            imovel.title.toLowerCase().includes(termo) || 
            (imovel.description && imovel.description.toLowerCase().includes(termo)) ||
            (imovel.location && imovel.location.toLowerCase().includes(termo))
        );

        if (resultados.length > 0) {
            addMessage(`Encontrei ${resultados.length} imóvel(is) para "${text}".`, 'bot');
            resultados.slice(0, 3).forEach(imovel => {
                const imovelCard = `
                    <div style="border: 1px solid #ccc; padding: 10px; margin-top: 10px; border-radius: 5px; background: #f9f9f9;">
                        <strong>${imovel.title}</strong>  

                        Preço: ${imovel.price || 'Consulte'}  

                        <a href="#${imovel.type}" style="color: var(--chat-primary); text-decoration: none;">Ver Detalhes</a>
                    </div>
                `;
                addMessage(imovelCard, 'bot');
            });
        } else {
            addMessage(`Sinto muito, não encontrei nada para "${text}".`, 'bot');
        }

        await new Promise(r => setTimeout(r, 1500));
        askToContinue();
    }

    // ========== NOVO: FUNÇÕES DE CONTROLE DE TEMPO ==========

    function startAutoCloseTimer() {
        cancelAutoCloseTimer(); // Cancela qualquer timer anterior
        if (!hasInteracted) { // Só inicia se o usuário ainda não interagiu
            console.log('Iniciando timer de 8s para fechar o chat.');
            autoCloseTimer = setTimeout(() => {
                console.log('Fechando chat por inatividade.');
                toggleChat(); // Fecha o chat
            }, 8000); // 8 segundos
        }
    }

    function cancelAutoCloseTimer() {
        if (autoCloseTimer) {
            console.log('Timer de fechamento automático cancelado.');
            clearTimeout(autoCloseTimer);
            autoCloseTimer = null;
        }
    }

    function registerInteraction() {
        if (!hasInteracted) {
            console.log('Primeira interação do usuário registrada.');
            hasInteracted = true;
        }
        cancelAutoCloseTimer(); // Cancela o fechamento em qualquer interação
    }

    // ========== INICIALIZAÇÃO AUTOMÁTICA ==========
    
    // NOVO: Abre o chat 10 segundos após o carregamento da página
    setTimeout(() => {
        if (!chatOpen) {
            console.log('Abrindo chat automaticamente após 10s.');
            toggleChat(true); // Força a abertura do chat
        }
    }, 10000); // 10 segundos
});
