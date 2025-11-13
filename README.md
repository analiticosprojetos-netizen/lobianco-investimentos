# Lobianco Investimentos

Este é um projeto web em desenvolvimento com Frontend, Backend e conexão com banco de dados Supabase.

## Estrutura

- `/banco_de_dados`: Contém toda a configuração e scripts relacionados ao Supabase.
- `/backend`: Contém a lógica de negócio e a API (servidor Express).
- `/frontend`: Contém a interface do usuário (HTML, CSS, JS).

## Como Rodar

Para rodar o projeto, você precisará de **dois terminais**.

### Pré-requisitos

- Node.js instalado.
- Um arquivo `.env` na raiz do projeto com as variáveis `SUPABASE_URL` and `SUPABASE_KEY`.

### Instalação

No terminal, na raiz do projeto, instale as dependências:
```bash
npm install
```

### Execução

**No Terminal 1 (para o Backend):**
```bash
npm start
```
*Isso iniciará a API na porta 3001.*

**No Terminal 2 (para o Frontend):**
```bash
npm run dev
```
*Isso servirá a página de frontend, geralmente na porta 3000.*

Abra `http://localhost:3000` no seu navegador para ver o projeto.
