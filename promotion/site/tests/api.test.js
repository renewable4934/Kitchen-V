const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

const validLead = {
  funnel_type: 'kitchen',
  name: 'Иван Петров',
  phone: '+7 (900) 123-45-67',
  city: 'Ростов-на-Дону',
  utm_source: 'yandex',
  utm_medium: 'cpc',
  utm_campaign: 'kuhni-search',
  utm_content: 'ad1',
  utm_term: 'кухня на заказ ростов',
  quiz_answers: { style: 'минимализм', budget: '300-500' },
  landing_url: 'https://example.com/kuhni-rostov',
  client_id: 'client_1',
  timestamp: new Date().toISOString()
};

test('GET /health shows if Supabase is configured', async () => {
  const response = await request(app)
    .get('/health')
    .expect(200);

  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.supabase_enabled, false);
});

test('GET /api/cms/bootstrap returns fallback CMS data', async () => {
  const response = await request(app)
    .get('/api/cms/bootstrap?page=kuhni-rostov')
    .expect(200);

  assert.equal(response.body.ok, true);
  assert.equal(response.body.page_slug, 'kuhni-rostov');
  assert.equal(response.body.settings.brandName, 'Kitchen_V');
  assert.equal(response.body.page.hero.tag, 'Кухни Ростов-на-Дону');
});

test('POST /api/lead accepts valid payload', async () => {
  const response = await request(app)
    .post('/api/lead')
    .send(validLead)
    .expect(201);

  assert.equal(response.body.ok, true);
  assert.equal(typeof response.body.lead_id, 'string');
  assert.equal(response.body.supabase.enabled, false);
});

test('POST /api/lead rejects invalid payload', async () => {
  const response = await request(app)
    .post('/api/lead')
    .send({ funnel_type: 'kitchen', name: 'A', phone: '11' })
    .expect(400);

  assert.equal(response.body.ok, false);
  assert.ok(Array.isArray(response.body.errors));
  assert.ok(response.body.errors.length >= 1);
});

test('POST /api/event accepts whitelisted event', async () => {
  const response = await request(app)
    .post('/api/event')
    .send({
      event_name: 'view_offer',
      funnel_type: 'kitchen',
      offer_variant: 'A',
      landing_url: 'https://example.com/kuhni-rostov',
      client_id: 'client_1',
      utm_source: 'yandex'
    })
    .expect(201);

  assert.equal(response.body.ok, true);
  assert.equal(typeof response.body.event_id, 'string');
  assert.equal(response.body.supabase.enabled, false);
});

test('POST /api/event rejects unsupported event', async () => {
  const response = await request(app)
    .post('/api/event')
    .send({ event_name: 'bad_event' })
    .expect(400);

  assert.equal(response.body.ok, false);
  assert.ok(response.body.errors.includes('event_name is invalid'));
});
