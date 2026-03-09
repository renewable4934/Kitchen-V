// Reusable server-side Supabase client and small helpers for storing leads/events.
const { createClient } = require('@supabase/supabase-js');

let cachedClient = null;

function isSupabaseConfigured(config) {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}

function getSupabaseClient(config) {
  if (!isSupabaseConfigured(config)) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  return cachedClient;
}

async function insertRow(config, tableName, payload) {
  const client = getSupabaseClient(config);

  if (!client) {
    return {
      enabled: false,
      stored: false,
      reason: 'supabase_not_configured',
    };
  }

  const { error } = await client.from(tableName).insert(payload);

  if (error) {
    return {
      enabled: true,
      stored: false,
      reason: 'supabase_insert_failed',
      details: error.message,
    };
  }

  return {
    enabled: true,
    stored: true,
    table: tableName,
  };
}

function storeLeadInSupabase(config, lead) {
  return insertRow(config, config.supabaseLeadsTable, lead);
}

function storeEventInSupabase(config, event) {
  return insertRow(config, config.supabaseEventsTable, event);
}

module.exports = {
  isSupabaseConfigured,
  getSupabaseClient,
  storeLeadInSupabase,
  storeEventInSupabase,
};
