-- Esquema inicial para a tabela de itens (imóveis)
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'lancamento', 'na_planta', 'aluguel'
    title TEXT NOT NULL,
    description TEXT,
    price TEXT,
    location TEXT,
    bedrooms INT,
    bathrooms INT,
    area TEXT,
    garage INT,
    pool BOOLEAN DEFAULT FALSE,
    image_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Esquema para a tabela de configuração do site
CREATE TABLE IF NOT EXISTS site_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT,
    phone TEXT,
    company_email TEXT,
    company_address TEXT,
    company_about_us TEXT, -- GARANTINDO QUE O CAMPO EXISTA
    whatsapp_link TEXT,
    instagram_link TEXT,
    facebook_link TEXT,
    main_color TEXT,
    secondary_color TEXT,
    text_color TEXT,
    logo_url TEXT,
    logo_width TEXT,
    logo_height TEXT,
    site_name_size TEXT,
    site_name_align TEXT,
    banner_images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);