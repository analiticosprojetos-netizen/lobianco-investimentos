const express = require('express');
const cors = require('cors'); // Importa o pacote cors
// O caminho agora é relativo à raiz do projeto
const supabase = require('../banco_de_dados/supabaseClient'); 
// const logic = require('./logic'); // (Descomentar quando 'logic.js' tiver conteúdo)
// const utils = require('./utils'); // (Descomentar quando 'utils.js' tiver conteúdo)

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors()); // Habilita o CORS para todas as rotas

// Endpoint de teste da API
app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Exemplo de endpoint que usa o Supabase
app.get('/api/items', async (req, res) => {
    // Supondo que tenhamos uma tabela 'items'
    const { data, error } = await supabase
        .from('items')
        .select('*');

    if (error) {
        console.error('Erro ao buscar items:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});
