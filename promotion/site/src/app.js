const express = require('express');
const helmet = require('helmet');
const path = require('path');
const crypto = require('crypto');
const { validateLeadInput, validateEventInput } = require('./utils/validators');
const { appendNdjson } = require('./services/fileStore');
const { pushLeadToCrm } = require('./services/crm');
const config = require('./config');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

function servePage(fileName) {
  return (_req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', fileName));
  };
}

app.get('/', servePage('index.html'));
app.get('/kuhni-rostov', servePage('kuhni-rostov.html'));
app.get('/shkafy-rostov', servePage('shkafy-rostov.html'));
app.get('/portfolio', servePage('portfolio.html'));
app.get('/reviews', servePage('reviews.html'));
app.get('/about', servePage('about.html'));
app.get('/contacts', servePage('contacts.html'));
app.get('/privacy', servePage('privacy.html'));
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.post('/api/lead', async (req, res) => {
  const validated = validateLeadInput(req.body, config.defaultCity);
  if (!validated.isValid) {
    return res.status(400).json({
      ok: false,
      errors: validated.errors
    });
  }

  const lead = {
    id: crypto.randomUUID(),
    ...validated.payload,
    ip: req.ip,
    user_agent: req.get('user-agent') || null,
    created_at: new Date().toISOString()
  };

  try {
    await appendNdjson(config.leadsFile, lead);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'failed_to_store_lead',
      details: error.message
    });
  }

  let crmResult = { delivered: false, reason: 'not_attempted' };
  try {
    crmResult = await pushLeadToCrm(config, lead);
  } catch (error) {
    crmResult = { delivered: false, reason: 'webhook_error', details: error.message };
  }

  return res.status(201).json({
    ok: true,
    lead_id: lead.id,
    crm: crmResult
  });
});

app.post('/api/event', async (req, res) => {
  const validated = validateEventInput(req.body);
  if (!validated.isValid) {
    return res.status(400).json({ ok: false, errors: validated.errors });
  }

  const event = {
    id: crypto.randomUUID(),
    ...validated.payload,
    ip: req.ip,
    user_agent: req.get('user-agent') || null
  };

  try {
    await appendNdjson(config.eventsFile, event);
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'failed_to_store_event', details: error.message });
  }

  return res.status(201).json({ ok: true, event_id: event.id });
});

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'not_found' });
});

module.exports = app;
