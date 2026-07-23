// src/config/supabase.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Cria a instância de conexão
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;