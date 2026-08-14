(() => {
  "use strict";

  const config = window.BIO_CONFIG;
  if (!config) {
    console.error("BIO_CONFIG não encontrado.");
    return;
  }

  const root = document.documentElement;
  const $ = (selector) => document.querySelector(selector);

  const icons = {
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.4-4.9A8.4 8.4 0 1 1 20.5 11.7Z"/><path d="M8.2 8.1c.2-.5.4-.5.8-.5h.5c.2 0 .4.1.5.4l.8 2c.1.3.1.5-.1.7l-.6.8c-.2.2-.2.4 0 .7.6 1.1 1.5 2 2.7 2.6.3.2.5.1.7-.1l.8-1c.2-.3.5-.3.7-.2l2 .9c.3.1.4.3.4.5 0 .3-.1 1.3-.6 1.8-.5.6-1.4.9-2.3.9-1.1 0-2.5-.4-4.3-1.4-2.5-1.4-4.2-3.8-4.7-5.2-.5-1.4-.1-2.5.3-2.9Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="fill-dot"/></svg>',
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5.7-8 11-8 11S4 15.7 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21M12 3C9.5 5.5 8.2 8.5 8.2 12S9.5 18.5 12 21"/></svg>'
  };

  function setTheme() {
    const t = config.theme || {};
    Object.entries(t).forEach(([key, value]) => {
      if (value) root.style.setProperty(`--${key}`, value);
    });
  }

  function setMetadata() {
    document.title = config.site.title || document.title;
    const description = document.querySelector('meta[name="description"]');
    if (description && config.site.description) description.content = config.site.description;
    $("#brandLine1").textContent = config.site.brandLine1 || "";
    $("#brandLine2").textContent = config.site.brandLine2 || "";
    $("#brandSubtitle").textContent = config.site.brandSubtitle || "";
    $("#copyright").textContent = config.site.copyright || "";
    $("#footerNote").textContent = config.site.footerNote || "";
  }

  function renderCarousel() {
    const slidesRoot = $("#slides");
    const indicatorsRoot = $("#slideIndicators");
    const slides = (config.carousel?.slides || []).filter((slide) => slide.visible !== false);

    if (!slides.length) {
      $("#heroCarousel").classList.add("hero-empty");
      return { slides: [], indicators: [] };
    }

    slidesRoot.innerHTML = slides.map((slide, index) => `
      <article class="slide${index === 0 ? " active" : ""}" data-slide="${index}" aria-hidden="${index === 0 ? "false" : "true"}">
        <img src="${slide.image || ""}" alt="" loading="${index === 0 ? "eager" : "lazy"}" style="object-position:${slide.imagePosition || "center"}" />
        <div class="slide-overlay"></div>
        <div class="slide-copy">
          <span>${slide.eyebrow || ""}</span>
          <h1>${slide.title || ""}</h1>
          <p>${slide.subtitle || ""}</p>
        </div>
      </article>
    `).join("");

    indicatorsRoot.innerHTML = slides.map((_, index) => `
      <button type="button" class="indicator${index === 0 ? " active" : ""}" data-index="${index}" aria-label="Ir para destaque ${index + 1}" aria-current="${index === 0 ? "true" : "false"}"></button>
    `).join("");

    return {
      slides: [...slidesRoot.querySelectorAll(".slide")],
      indicators: [...indicatorsRoot.querySelectorAll(".indicator")]
    };
  }

  function setupCarousel(elements) {
    const { slides, indicators } = elements;
    if (slides.length <= 1) return;

    let current = 0;
    let timer = null;
    let touchStartX = 0;
    const interval = Math.max(2500, Number(config.carousel?.intervalMs) || 4800);

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle("active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
      indicators.forEach((indicator, i) => {
        const active = i === current;
        indicator.classList.toggle("active", active);
        indicator.setAttribute("aria-current", String(active));
      });
    }

    function restart() {
      if (timer) clearInterval(timer);
      if (config.carousel?.autoplay !== false && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        timer = setInterval(() => show(current + 1), interval);
      }
    }

    indicators.forEach((button) => {
      button.addEventListener("click", () => {
        show(Number(button.dataset.index));
        restart();
      });
    });

    const hero = $("#heroCarousel");
    hero.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    hero.addEventListener("touchend", (event) => {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 45) {
        show(current + (delta < 0 ? 1 : -1));
        restart();
      }
    }, { passive: true });

    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") { show(current + 1); restart(); }
      if (event.key === "ArrowLeft") { show(current - 1); restart(); }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && timer) clearInterval(timer);
      else restart();
    });

    restart();
  }

  function renderFeatured() {
    const item = config.featured;
    const el = $("#featuredLink");
    if (!item?.visible || !item.url) {
      el.hidden = true;
      return;
    }
    el.href = item.url;
    $("#featuredTitle").textContent = item.title || "";
    $("#featuredSubtitle").textContent = item.subtitle || "";
    $("#featuredIcon").innerHTML = icons[item.icon] || icons.calendar;
  }

  function renderLinks() {
    const list = $("#linksList");
    const items = (config.links || []).filter((item) => item.visible !== false && item.url);
    list.innerHTML = items.map((item) => `
      <a class="link-card" href="${item.url}" target="_blank" rel="noopener noreferrer">
        <span class="link-accent" aria-hidden="true"></span>
        <span class="link-icon" aria-hidden="true">${icons[item.icon] || icons.globe}</span>
        <span class="link-copy">
          <strong>${item.label || ""}</strong>
          ${item.detail ? `<small>${item.detail}</small>` : ""}
        </span>
        <span class="link-arrow" aria-hidden="true">→</span>
      </a>
    `).join("");
  }

  function renderBio() {
    const bio = config.bio;
    const card = $("#bioCard");
    if (!bio?.visible) {
      card.hidden = true;
      return;
    }
    $("#bioQuote").textContent = bio.quote || "";
    $("#bioLocation").textContent = bio.location || config.site.location || "";
  }

  function renderServices() {
    const section = $("#servicesSection");
    const services = config.services;
    if (!services?.visible || !services.items?.length) {
      section.hidden = true;
      return;
    }
    $("#servicesList").innerHTML = services.items.map((item) => `<span>${item.label || ""}</span>`).join("");
  }

  setTheme();
  setMetadata();
  const carouselElements = renderCarousel();
  renderFeatured();
  renderLinks();
  renderBio();
  renderServices();
  setupCarousel(carouselElements);
})();
