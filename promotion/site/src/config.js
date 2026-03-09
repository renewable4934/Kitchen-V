const path = require('path');

function getEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  dataDir: path.join(process.cwd(), 'data'),
  leadsFile: path.join(process.cwd(), 'data', 'leads.ndjson'),
  eventsFile: path.join(process.cwd(), 'data', 'events.ndjson'),
  crmWebhookUrl: getEnv('CRM_WEBHOOK_URL'),
  bitrix24WebhookUrl: getEnv('BITRIX24_WEBHOOK_URL'),
  contactPhone: getEnv('CONTACT_PHONE', '+7 (863) 200-00-00'),
  whatsappPhone: getEnv('WHATSAPP_PHONE', '78632000000'),
  defaultCity: getEnv('DEFAULT_CITY', 'Ростов-на-Дону')
};
