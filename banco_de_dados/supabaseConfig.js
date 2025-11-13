// Carrega as variáveis de ambiente do arquivo .env na raiz do projeto
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL e Key são obrigatórias. Verifique seu arquivo .env na raiz do projeto.');
}

module.exports = {
    supabaseUrl,
    supabaseKey,
};
