-- ====================================================================
-- AATMI STUDIO — SUPABASE MULTI-TENANT SAAS DATABASE SCHEMA
-- Version: 2.0 (Modular AI Provider Architecture & Sequential Inpaint)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'designer' CHECK (role IN ('admin', 'designer', 'client')),
  ai_provider TEXT DEFAULT 'gemini', -- 'gemini', 'openai', 'replicate', 'stability'
  api_keys JSONB DEFAULT '{}'::jsonb, -- { "openai": "sk-...", "replicate": "r8_..." }
  avatar_url TEXT,
  trade_tier TEXT DEFAULT 'haute_couture',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Catalogs (Folders / Collections for Fabrics, Templates, and Rooms)
CREATE TABLE IF NOT EXISTS catalogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fabric', 'template', 'room')),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Fabrics (High-resolution Luxury Swatches)
CREATE TABLE IF NOT EXISTS fabrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  catalog_id UUID REFERENCES catalogs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  color_hex TEXT,
  category TEXT DEFAULT 'Velvet',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{
    "weave": "velvet",
    "scale": "medium",
    "sheen": "Subtle Luster",
    "weight": "Heavyweight Drapery",
    "tileable": true,
    "composition": "100% Silk Velvet"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Templates (Curtain Stencils & Multi-Region Assets)
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  catalog_id UUID REFERENCES catalogs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  style_code TEXT,
  tagline TEXT,
  original_image_url TEXT NOT NULL,
  real_photo_url TEXT,
  regions JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { id, name, display_name, order, polygon_coords, mask_url }
  structure_maps JSONB DEFAULT '{ "canny_url": null, "depth_url": null }'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Generation Jobs (Sequential Inpainting & Room Viz Queue)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('region_inpaint', 'sequential_composite', 'room_viz')),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  assignments JSONB, -- [{ "region_id": "...", "fabric_id": "...", "scale": 1.0 }]
  output_url TEXT,
  provider_used TEXT, -- 'gemini', 'openai', 'replicate', 'stability'
  steps_total INT DEFAULT 1,
  steps_completed INT DEFAULT 0,
  logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile or public profiles"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can access their own catalogs or public collections"
  ON catalogs FOR ALL USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage their fabrics"
  ON fabrics FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their templates"
  ON templates FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view and create jobs"
  ON jobs FOR ALL USING (auth.uid() = user_id);
