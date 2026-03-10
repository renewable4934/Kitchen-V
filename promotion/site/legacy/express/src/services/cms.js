// CMS loader: returns page content and shared settings from Supabase with a local fallback.
const { getSupabaseClient, isSupabaseConfigured } = require('./supabase');
const { defaultSiteSettings, defaultPages } = require('../cms/default-content');

async function readCmsSettings(config) {
  const client = getSupabaseClient(config);

  if (!client) {
    return {
      source: 'local_fallback',
      data: defaultSiteSettings,
    };
  }

  const { data, error } = await client
    .from('cms_settings')
    .select('key, value');

  if (error) {
    return {
      source: 'local_fallback',
      error: error.message,
      data: defaultSiteSettings,
    };
  }

  const normalized = (data || []).reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  return {
    source: 'supabase',
    data: { ...defaultSiteSettings, ...normalized },
  };
}

async function readCmsPage(config, pageSlug) {
  const fallbackPage = defaultPages[pageSlug] || null;
  const client = getSupabaseClient(config);

  if (!client) {
    return {
      source: 'local_fallback',
      data: fallbackPage,
    };
  }

  const { data, error } = await client
    .from('cms_pages')
    .select('slug, content, published')
    .eq('slug', pageSlug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    return {
      source: 'local_fallback',
      error: error.message,
      data: fallbackPage,
    };
  }

  return {
    source: data ? 'supabase' : 'local_fallback',
    data: data ? data.content : fallbackPage,
  };
}

async function getCmsBootstrap(config, pageSlug) {
  const [settingsResult, pageResult] = await Promise.all([
    readCmsSettings(config),
    readCmsPage(config, pageSlug),
  ]);

  return {
    enabled: isSupabaseConfigured(config),
    page_slug: pageSlug,
    settings_source: settingsResult.source,
    page_source: pageResult.source,
    settings_error: settingsResult.error || null,
    page_error: pageResult.error || null,
    settings: settingsResult.data,
    page: pageResult.data,
  };
}

module.exports = {
  getCmsBootstrap,
};
