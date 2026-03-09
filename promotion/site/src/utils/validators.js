const allowedFunnels = new Set(['kitchen', 'wardrobe']);
const allowedEvents = new Set([
  'view_offer',
  'click_call',
  'start_quiz',
  'submit_lead',
  'open_whatsapp'
]);

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePhone(phone) {
  return cleanString(phone).replace(/[^\d+]/g, '');
}

function isValidPhone(phone) {
  const raw = normalizePhone(phone);
  if (!raw) return false;
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function validateLeadInput(input = {}, defaultCity = 'Ростов-на-Дону') {
  const errors = [];

  const funnelType = cleanString(input.funnel_type);
  if (!allowedFunnels.has(funnelType)) {
    errors.push('funnel_type must be kitchen|wardrobe');
  }

  const name = cleanString(input.name);
  if (name.length < 2 || name.length > 70) {
    errors.push('name must be 2..70 characters');
  }

  const phone = cleanString(input.phone);
  if (!isValidPhone(phone)) {
    errors.push('phone is invalid');
  }

  const city = cleanString(input.city) || defaultCity;

  const landingUrl = cleanString(input.landing_url);
  if (landingUrl && !/^https?:\/\//i.test(landingUrl)) {
    errors.push('landing_url must start with http:// or https://');
  }

  const timestamp = input.timestamp ? new Date(input.timestamp) : new Date();
  if (Number.isNaN(timestamp.getTime())) {
    errors.push('timestamp is invalid');
  }

  const quizAnswers = input.quiz_answers && typeof input.quiz_answers === 'object'
    ? input.quiz_answers
    : {};

  const utmFields = {
    utm_source: cleanString(input.utm_source),
    utm_medium: cleanString(input.utm_medium),
    utm_campaign: cleanString(input.utm_campaign),
    utm_content: cleanString(input.utm_content),
    utm_term: cleanString(input.utm_term)
  };

  const maxUtmLength = Object.values(utmFields).every((value) => value.length <= 200);
  if (!maxUtmLength) {
    errors.push('utm fields max length is 200 characters');
  }

  const payload = {
    funnel_type: funnelType,
    name,
    phone,
    city,
    ...utmFields,
    quiz_answers: quizAnswers,
    landing_url: landingUrl,
    client_id: cleanString(input.client_id),
    timestamp: timestamp.toISOString()
  };

  return {
    isValid: errors.length === 0,
    errors,
    payload
  };
}

function validateEventInput(input = {}) {
  const errors = [];
  const eventName = cleanString(input.event_name);
  if (!allowedEvents.has(eventName)) {
    errors.push('event_name is invalid');
  }

  const funnelType = cleanString(input.funnel_type);
  if (funnelType && !allowedFunnels.has(funnelType)) {
    errors.push('funnel_type must be kitchen|wardrobe when provided');
  }

  const payload = {
    event_name: eventName,
    funnel_type: funnelType || null,
    offer_variant: cleanString(input.offer_variant) || null,
    landing_url: cleanString(input.landing_url) || null,
    client_id: cleanString(input.client_id) || null,
    utm_source: cleanString(input.utm_source) || null,
    timestamp: new Date().toISOString()
  };

  return {
    isValid: errors.length === 0,
    errors,
    payload
  };
}

module.exports = {
  validateLeadInput,
  validateEventInput,
  normalizePhone
};
