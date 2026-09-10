// src/components/DatabaseSchemaModal.tsx
import React, { useState } from 'react';
import {
  X,
  Database,
  Copy,
  Check,
  Table,
  Layers,
  Terminal,
  Clock,
  ShieldCheck,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useStudioStore } from '../lib/store';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPABASE_SCHEMA_SQL = `-- ====================================================================
-- AATMI STUDIO — SUPABASE MULTI-TENANT SAAS DATABASE SCHEMA
-- ====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. User Profiles (Extends Supabase Auth)
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  company_name text,
  role text default 'designer', -- 'admin', 'designer', 'client'
  ai_provider text default 'gemini',
  api_keys jsonb default '{}', -- Encrypted keys for OpenAI, Replicate, etc.
  created_at timestamptz default now()
);

-- 2. Catalogs (Folders/Collections)
create table catalogs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  name text not null,
  type text not null, -- 'fabric', 'template', 'room'
  created_at timestamptz default now()
);

-- 3. Fabrics
create table fabrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  catalog_id uuid references catalogs(id),
  name text not null,
  image_url text not null,
  color_hex text,
  metadata jsonb default '{}', -- {weave: 'velvet', scale: 'medium', tileable: true}
  created_at timestamptz default now()
);

-- 4. Templates (The Core Asset)
create table templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  name text not null,
  original_image_url text not null,
  regions jsonb not null default '[]', -- Array of {id, name, mask_url, order, polygon}
  structure_maps jsonb default '{}', -- {canny_url, depth_url}
  status text default 'draft', -- 'draft', 'published'
  created_at timestamptz default now()
);

-- 5. Generation Jobs
create table jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  template_id uuid references templates(id),
  type text not null, -- 'region_inpaint', 'room_viz'
  status text default 'queued', -- 'queued', 'processing', 'completed', 'failed'
  assignments jsonb, -- [{region_id, fabric_id}]
  output_url text,
  provider_used text,
  created_at timestamptz default now()
);`;

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { jobs, userProfile } = useStudioStore();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'jobs'>('schema');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121316] border border-[#2B2D33] text-[#F9F6F0] rounded-2xl shadow-2xl max-w-4xl w-full h-full sm:h-auto max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#25272D] flex items-center justify-between bg-[#0E0F12]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold tracking-wide text-[#F9F6F0]">
                  Supabase Multi-Tenant SaaS Architecture
                </h3>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  PostgreSQL · RLS Enabled
                </span>
              </div>
              <p className="text-xs text-[#8C909A]">
                Schema specification & real-time generation jobs queue for multi-designer studios.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C909A] hover:text-[#F9F6F0] hover:bg-[#1E2026] rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 py-2.5 bg-[#17181E] border-b border-[#25272D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('schema')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'schema'
                  ? 'bg-[#D4AF37] text-[#0D0E10]'
                  : 'text-[#8C909A] hover:text-[#F9F6F0]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SQL Schema & Tables</span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-[#D4AF37] text-[#0D0E10]'
                  : 'text-[#8C909A] hover:text-[#F9F6F0]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Jobs Queue ({jobs.length})</span>
            </button>
          </div>

          {activeTab === 'schema' && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs bg-[#24262E] hover:bg-[#2F323A] text-[#D4AF37] font-semibold px-3 py-1.5 rounded-lg border border-[#3A3D49] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SQL' : 'Copy Supabase SQL'}</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#0F1014]">
          {activeTab === 'schema' ? (
            <div className="space-y-4">
              {/* Architecture Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div className="bg-[#171920] border border-[#2B2E3A] p-2.5 rounded-xl">
                  <span className="text-[10px] font-mono text-[#8C909C] uppercase block">Table 1</span>
                  <h5 className="font-serif text-xs font-bold text-[#F9F6F0]">profiles</h5>
                  <p className="text-[10px] text-[#A68832] mt-0.5">User & AI keys</p>
                </div>
                <div className="bg-[#171920] border border-[#2B2E3A] p-2.5 rounded-xl">
                  <span className="text-[10px] font-mono text-[#8C909C] uppercase block">Table 2</span>
                  <h5 className="font-serif text-xs font-bold text-[#F9F6F0]">catalogs</h5>
                  <p className="text-[10px] text-[#A68832] mt-0.5">Asset folders</p>
                </div>
                <div className="bg-[#171920] border border-[#2B2E3A] p-2.5 rounded-xl">
                  <span className="text-[10px] font-mono text-[#8C909C] uppercase block">Table 3</span>
                  <h5 className="font-serif text-xs font-bold text-[#F9F6F0]">fabrics</h5>
                  <p className="text-[10px] text-[#A68832] mt-0.5">Luxury swatches</p>
                </div>
                <div className="bg-[#171920] border border-[#2B2E3A] p-2.5 rounded-xl">
                  <span className="text-[10px] font-mono text-[#8C909C] uppercase block">Table 4</span>
                  <h5 className="font-serif text-xs font-bold text-[#F9F6F0]">templates</h5>
                  <p className="text-[10px] text-[#A68832] mt-0.5">Stencils & masks</p>
                </div>
                <div className="bg-[#171920] border border-[#2B2E3A] p-2.5 rounded-xl">
                  <span className="text-[10px] font-mono text-[#8C909C] uppercase block">Table 5</span>
                  <h5 className="font-serif text-xs font-bold text-[#F9F6F0]">jobs</h5>
                  <p className="text-[10px] text-[#A68832] mt-0.5">Generation queue</p>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="rounded-xl border border-[#252832] overflow-hidden bg-[#0A0B0E]">
                <div className="bg-[#15171D] px-4 py-2 border-b border-[#252832] flex items-center justify-between text-xs text-[#8C909C] font-mono">
                  <span>supabase/migrations/20260310_aatmi_multi_tenant.sql</span>
                  <span className="text-[#D4AF37]">PostgreSQL 16</span>
                </div>
                <pre className="p-4 text-xs font-mono text-[#C5C8D4] leading-relaxed overflow-x-auto selection:bg-[#D4AF37]/30">
                  {SUPABASE_SCHEMA_SQL}
                </pre>
              </div>
            </div>
          ) : (
            /* Jobs Queue List */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#8C909C] pb-2 border-b border-[#252832]">
                <span>Active Generation Pipeline Tasks</span>
                <span>Auto-refreshing (Zustand + Supabase Realtime)</span>
              </div>

              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-[#16171E] border border-[#272A35] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-sm font-bold text-[#F9F6F0]">
                        {job.templateName}
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-[#242630] text-[#A68832] px-2 py-0.5 rounded">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#8C909C]">
                      Provider: <span className="text-[#D4AF37]">{job.providerUsed}</span> · Steps: {job.stepsCompleted}/{job.stepsTotal}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 ${
                        job.status === 'completed'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                          : job.status === 'processing'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                          : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {job.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {job.status === 'processing' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                      <span className="capitalize">{job.status}</span>
                    </span>

                    {job.outputUrl && (
                      <img
                        src={job.outputUrl}
                        alt="Output"
                        className="w-10 h-10 object-cover rounded-lg border border-white/20"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#25272D] bg-[#0E0F12] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#8C909A]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-tenant tenant isolation via Row Level Security (RLS)</span>
          </div>

          <button
            onClick={onClose}
            className="bg-[#D4AF37] hover:bg-[#E5C058] text-[#0D0E10] font-bold px-4 py-1.5 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
