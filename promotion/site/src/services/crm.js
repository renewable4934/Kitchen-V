const { normalizePhone } = require('../utils/validators');

async function sendGenericWebhook(webhookUrl, lead) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`CRM webhook failed: ${response.status} ${text}`);
  }
}

function buildBitrixPayload(lead) {
  const sourceDescription = [
    `Воронка: ${lead.funnel_type}`,
    `Страница: ${lead.landing_url || '-'}`,
    `UTM source: ${lead.utm_source || '-'}`,
    `UTM medium: ${lead.utm_medium || '-'}`,
    `UTM campaign: ${lead.utm_campaign || '-'}`,
    `UTM content: ${lead.utm_content || '-'}`,
    `UTM term: ${lead.utm_term || '-'}`,
    `Client ID: ${lead.client_id || '-'}`,
    `Quiz: ${JSON.stringify(lead.quiz_answers || {})}`
  ].join('\n');

  return {
    fields: {
      TITLE: `Заявка с сайта (${lead.funnel_type})`,
      NAME: lead.name,
      PHONE: [{ VALUE: normalizePhone(lead.phone), VALUE_TYPE: 'WORK' }],
      CITY: lead.city,
      SOURCE_ID: 'WEB',
      SOURCE_DESCRIPTION: sourceDescription,
      COMMENTS: `Создано: ${lead.timestamp}`
    },
    params: {
      REGISTER_SONET_EVENT: 'Y'
    }
  };
}

async function sendBitrixWebhook(webhookUrl, lead) {
  const payload = buildBitrixPayload(lead);
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(`Bitrix24 webhook failed: ${response.status} ${JSON.stringify(data)}`);
  }
}

async function pushLeadToCrm({ crmWebhookUrl, bitrix24WebhookUrl }, lead) {
  if (!crmWebhookUrl && !bitrix24WebhookUrl) {
    return { delivered: false, reason: 'webhook_not_configured' };
  }

  if (bitrix24WebhookUrl) {
    await sendBitrixWebhook(bitrix24WebhookUrl, lead);
    return { delivered: true, channel: 'bitrix24' };
  }

  await sendGenericWebhook(crmWebhookUrl, lead);
  return { delivered: true, channel: 'generic' };
}

module.exports = {
  pushLeadToCrm
};
