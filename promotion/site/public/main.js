(function () {
  const funnelType = document.body.dataset.funnel || null;
  const pageTitle = document.title;
  const STORAGE_KEY = 'kitchen_v_attribution';
  const CLIENT_KEY = 'kitchen_v_client_id';

  const phoneMapBySource = {
    yandex: '+7 (863) 201-10-11',
    vk: '+7 (863) 201-10-22',
    google: '+7 (863) 201-10-33'
  };

  const offerVariants = {
    kitchen: [
      {
        key: 'A',
        title: 'Кухни на заказ в Ростове за 21 день',
        subtitle: 'Бесплатный выезд замерщика + 3D-проект до договора'
      },
      {
        key: 'B',
        title: 'Кухня под ваш бюджет и размеры без переплат',
        subtitle: 'Фиксируем смету в договоре и соблюдаем сроки'
      }
    ],
    wardrobe: [
      {
        key: 'A',
        title: 'Шкафы-купе и гардеробные по вашим размерам за 14-20 дней',
        subtitle: '3D-визуализация бесплатно до старта производства'
      },
      {
        key: 'B',
        title: 'Шкаф, который встает идеально в нишу с первого раза',
        subtitle: 'Точный замер, монтаж под ключ и гарантия по договору'
      }
    ]
  };

  function parseUtmParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || ''
    };
  }

  function getClientId() {
    const existing = localStorage.getItem(CLIENT_KEY);
    if (existing) return existing;
    const id = `cv_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(CLIENT_KEY, id);
    return id;
  }

  function readAttribution() {
    const fromUrl = parseUtmParams();
    const hasUrlUtm = Object.values(fromUrl).some(Boolean);
    if (hasUrlUtm) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        utm_source: saved.utm_source || '',
        utm_medium: saved.utm_medium || '',
        utm_campaign: saved.utm_campaign || '',
        utm_content: saved.utm_content || '',
        utm_term: saved.utm_term || ''
      };
    } catch {
      return {
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        utm_content: '',
        utm_term: ''
      };
    }
  }

  function getCurrentPhone(attribution) {
    const source = (attribution.utm_source || '').toLowerCase();
    return phoneMapBySource[source] || '+7 (863) 200-00-00';
  }

  function updateDynamicContacts(attribution) {
    const phone = getCurrentPhone(attribution);
    const telHref = `tel:${phone.replace(/[^\d+]/g, '')}`;

    document.querySelectorAll('[data-dynamic-phone]').forEach((el) => {
      el.textContent = phone;
      if (el.matches('a')) {
        el.setAttribute('href', telHref);
      }
    });

    const wa = document.querySelectorAll('[data-whatsapp-link]');
    const waPhone = '78632000000';
    wa.forEach((el) => {
      el.setAttribute('href', `https://wa.me/${waPhone}?text=${encodeURIComponent('Здравствуйте, хочу расчет по проекту')}`);
    });
  }

  async function postJson(url, payload) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = (data && (data.error || (data.errors || []).join(', '))) || `HTTP ${response.status}`;
      throw new Error(message);
    }
    return data;
  }

  function sendEvent(name, extra) {
    const attribution = readAttribution();
    const payload = {
      event_name: name,
      funnel_type: funnelType,
      offer_variant: extra && extra.offer_variant ? extra.offer_variant : null,
      landing_url: window.location.href,
      client_id: getClientId(),
      utm_source: attribution.utm_source || ''
    };

    fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function () {});
  }

  function setNotice(formEl, message, isError) {
    const box = formEl.querySelector('[data-notice]');
    if (!box) return;
    box.className = `notice ${isError ? 'err' : 'ok'}`;
    box.textContent = message;
  }

  function bindShortForm() {
    const form = document.querySelector('[data-short-form]');
    if (!form || !funnelType) return;

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      const formData = new FormData(form);
      const attribution = readAttribution();

      const payload = {
        funnel_type: funnelType,
        name: String(formData.get('name') || ''),
        phone: String(formData.get('phone') || ''),
        city: String(formData.get('city') || 'Ростов-на-Дону'),
        quiz_answers: {},
        landing_url: window.location.href,
        client_id: getClientId(),
        timestamp: new Date().toISOString(),
        ...attribution
      };

      try {
        await postJson('/api/lead', payload);
        setNotice(form, 'Заявка отправлена. Мы перезвоним в течение 5 минут в рабочее время.', false);
        form.reset();
        sendEvent('submit_lead', {});
      } catch (error) {
        setNotice(form, `Не удалось отправить: ${error.message}`, true);
      }
    });
  }

  function createOfferVariant() {
    if (!funnelType || !offerVariants[funnelType]) return;

    const key = `kitchen_v_offer_${funnelType}`;
    const saved = localStorage.getItem(key);
    let variant = offerVariants[funnelType].find((item) => item.key === saved);
    if (!variant) {
      variant = offerVariants[funnelType][Math.floor(Math.random() * offerVariants[funnelType].length)];
      localStorage.setItem(key, variant.key);
    }

    const titleEl = document.querySelector('[data-offer-title]');
    const subtitleEl = document.querySelector('[data-offer-subtitle]');
    if (titleEl) titleEl.textContent = variant.title;
    if (subtitleEl) subtitleEl.textContent = variant.subtitle;

    sendEvent('view_offer', { offer_variant: variant.key });
  }

  function bindCallAndWhatsappEvents() {
    document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
      link.addEventListener('click', () => sendEvent('click_call', {}));
    });

    document.querySelectorAll('[data-whatsapp-link]').forEach((link) => {
      link.addEventListener('click', () => sendEvent('open_whatsapp', {}));
    });
  }

  function bindQuiz() {
    const modal = document.querySelector('[data-quiz-modal]');
    const openers = document.querySelectorAll('[data-open-quiz]');
    const closer = document.querySelector('[data-close-quiz]');
    const steps = Array.from(document.querySelectorAll('.step'));
    const prevBtn = document.querySelector('[data-quiz-prev]');
    const nextBtn = document.querySelector('[data-quiz-next]');
    const progress = document.querySelector('[data-quiz-progress]');
    const submitBtn = document.querySelector('[data-quiz-submit]');
    const finalName = document.querySelector('[name="quiz_name"]');
    const finalPhone = document.querySelector('[name="quiz_phone"]');

    if (!modal || steps.length === 0 || !funnelType) return;

    let currentStep = 0;
    const answers = {};

    function updateStep() {
      steps.forEach((step, index) => {
        step.classList.toggle('active', index === currentStep);
      });

      progress.textContent = `Шаг ${currentStep + 1} из ${steps.length}`;
      prevBtn.disabled = currentStep === 0;
      nextBtn.style.display = currentStep === steps.length - 1 ? 'none' : 'inline-block';
      submitBtn.style.display = currentStep === steps.length - 1 ? 'inline-block' : 'none';
    }

    function openQuiz() {
      modal.classList.add('active');
      sendEvent('start_quiz', {});
      updateStep();
    }

    function closeQuiz() {
      modal.classList.remove('active');
    }

    openers.forEach((btn) => btn.addEventListener('click', openQuiz));
    if (closer) closer.addEventListener('click', closeQuiz);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeQuiz();
    });

    steps.forEach((step) => {
      step.querySelectorAll('.step-option').forEach((option) => {
        option.addEventListener('click', () => {
          step.querySelectorAll('.step-option').forEach((other) => other.classList.remove('selected'));
          option.classList.add('selected');
          answers[option.dataset.key] = option.dataset.value;
        });
      });
    });

    prevBtn.addEventListener('click', () => {
      currentStep = Math.max(0, currentStep - 1);
      updateStep();
    });

    nextBtn.addEventListener('click', () => {
      const requiredKey = steps[currentStep].dataset.requiredKey;
      if (requiredKey && !answers[requiredKey]) {
        alert('Выберите вариант, чтобы перейти дальше');
        return;
      }
      currentStep = Math.min(steps.length - 1, currentStep + 1);
      updateStep();
    });

    submitBtn.addEventListener('click', async () => {
      const name = (finalName.value || '').trim();
      const phone = (finalPhone.value || '').trim();

      if (name.length < 2 || phone.length < 10) {
        alert('Введите имя и телефон');
        return;
      }

      const attribution = readAttribution();
      const payload = {
        funnel_type: funnelType,
        name,
        phone,
        city: 'Ростов-на-Дону',
        quiz_answers: answers,
        landing_url: window.location.href,
        client_id: getClientId(),
        timestamp: new Date().toISOString(),
        ...attribution
      };

      try {
        await postJson('/api/lead', payload);
        sendEvent('submit_lead', {});
        const result = document.querySelector('[data-quiz-result]');
        const budget = answers.budget || '';
        const estimate = budget.includes('до 300')
          ? 'от 190 000 до 320 000 ₽'
          : budget.includes('300-500')
            ? 'от 300 000 до 540 000 ₽'
            : 'от 500 000 ₽';
        result.textContent = `Ориентир по стоимости: ${estimate}. Точный расчет отправим после звонка.`;
        result.className = 'notice ok';
        finalName.value = '';
        finalPhone.value = '';
      } catch (error) {
        const result = document.querySelector('[data-quiz-result]');
        result.textContent = `Ошибка отправки: ${error.message}`;
        result.className = 'notice err';
      }
    });

    updateStep();
  }

  function init() {
    const attribution = readAttribution();
    updateDynamicContacts(attribution);
    createOfferVariant();
    bindShortForm();
    bindQuiz();
    bindCallAndWhatsappEvents();

    const year = document.querySelector('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());

    const pageLabel = document.querySelector('[data-page-label]');
    if (pageLabel) pageLabel.textContent = pageTitle;
  }

  init();
})();
