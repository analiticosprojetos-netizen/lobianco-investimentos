-- full_schema_setup.sql

-- Habilitar a extensão uuid-ossp para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Itens (Imóveis)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  price VARCHAR(50),
  image_url TEXT,
  type VARCHAR(50) NOT NULL, -- 'lancamento', 'na_planta', 'aluguel'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) para a tabela items
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (anon) da tabela items
CREATE POLICY "Enable read access for all users on items" ON items
  FOR SELECT USING (TRUE);

-- Tabela de Configurações do Site
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name VARCHAR(255) NOT NULL DEFAULT 'Lobianco Investimentos',
  phone VARCHAR(50),
  instagram_link TEXT,
  whatsapp_link TEXT,
  facebook_link TEXT,
  logo_url TEXT,
  main_color VARCHAR(7) DEFAULT '#0066CC',
  banner_images TEXT[], -- Array de URLs de imagens
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir uma configuração padrão se a tabela estiver vazia
INSERT INTO site_config (site_name, phone, instagram_link, whatsapp_link, facebook_link, logo_url, main_color, banner_images)
VALUES (
  'Lobianco Investimentos',
  '(34) 99970-4808',
  'https://instagram.com/lobiancoinvestimentos',
  'https://wa.me/5534999704808',
  'https://facebook.com/lobiancoinvestimentos',
  'https://via.placeholder.com/160x60?text=Logo',
  '#0066CC',
  ARRAY['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2070&q=80']
)
ON CONFLICT (id) DO NOTHING; -- Evita inserir duplicatas se já existir uma linha com o ID padrão

-- Habilitar Row Level Security (RLS) para a tabela site_config
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (anon) da tabela site_config
CREATE POLICY "Enable read access for all users on site_config" ON site_config
  FOR SELECT USING (TRUE);

-- Política para permitir atualização por usuários autenticados (se houver um sistema de gestão)
CREATE POLICY "Enable update for authenticated users on site_config" ON site_config
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Instruções para Supabase Storage (Buckets)
-- 1. Crie um novo bucket no painel do Supabase em "Storage" -> "New bucket".
-- 2. Nomeie o bucket como "public_assets".
-- 3. Marque a opção "Public bucket" para permitir acesso público.
-- 4. Se desejar controle mais granular, você pode adicionar políticas de RLS para o bucket aqui,
--    mas a opção "Public bucket" já permite leitura. Para uploads, você precisaria de políticas
--    para usuários autenticados.

-- Exemplo de política RLS para um bucket (se não for público ou para uploads)
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'public_assets' AND auth.role() = 'authenticated');
-- CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'public_assets');
