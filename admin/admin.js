(() => {
  "use strict";

  const fallbackConfig = clone(window.BIO_CONFIG || {});
  let state = clone(fallbackConfig);
  let dirty = false;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const loginView = $("#loginView");
  const adminView = $("#adminView");
  const sourcePill = $("#sourcePill");
  const saveButton = $("#saveButton");
  const saveStatus = $("#saveStatus");
  const saveDot = $("#saveDot");

  function clone(value) {
    return JSON.parse(JSON.stringify(value ?? {}));
  }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function ensureShape(config) {
    config.site ||= {};
    config.site.brandMark ||= "/assets/catarina-mark.svg";
    config.theme ||= {};
    config.carousel ||= { intervalMs: 4800, autoplay: true, slides: [] };
    config.carousel.slides ||= [];
    config.featured ||= { visible: true, icon: "calendar", title: "", subtitle: "", url: "" };
    config.links ||= [];
    config.bio ||= { visible: true, quote: "", location: "" };
    config.services ||= { visible: true, items: [] };
    config.services.items ||= [];
    return config;
  }

  function getByPath(path) {
    return path.split(".").reduce((obj, key) => obj?.[key], state);
  }

  function setByPath(path, value) {
    const parts = path.split(".");
    let obj = state;
    parts.slice(0, -1).forEach((key) => {
      if (!obj[key] || typeof obj[key] !== "object") obj[key] = {};
      obj = obj[key];
    });
    obj[parts.at(-1)] = value;
  }

  function markDirty(label = "Alterações não salvas") {
    dirty = true;
    saveStatus.textContent = label;
    saveDot.className = "save-dot dirty";
  }

  function markSaved(label = "Tudo salvo") {
    dirty = false;
    saveStatus.textContent = label;
    saveDot.className = "save-dot saved";
  }

  function markError(label) {
    saveStatus.textContent = label;
    saveDot.className = "save-dot error";
  }

  async function api(url, options = {}) {
    const response = await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: {
        ...(options.body ? { "content-type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
    let data = {};
    try { data = await response.json(); } catch { /* vazio */ }
    if (!response.ok) {
      const error = new Error(data.error || `Erro ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function showLogin(message = "") {
    adminView.hidden = true;
    loginView.hidden = false;
    $("#loginMessage").textContent = message;
    setTimeout(() => $("#passwordInput")?.focus(), 30);
  }

  async function showAdmin() {
    loginView.hidden = true;
    adminView.hidden = false;
    await loadConfig();
  }

  async function loadConfig() {
    sourcePill.textContent = "Carregando…";
    try {
      const data = await api("/api/admin/config");
      if (data.config) {
        state = ensureShape(clone(data.config));
        sourcePill.textContent = "Cloudflare KV";
      } else {
        state = ensureShape(clone(fallbackConfig));
        sourcePill.textContent = "Padrão do código";
      }
      renderAll();
      markSaved("Sem alterações");
    } catch (error) {
      if (error.status === 401) return showLogin("Sua sessão expirou.");
      sourcePill.textContent = "Erro ao carregar";
      markError(error.message);
    }
  }

  function hydrateStaticFields() {
    $$('[data-path]').forEach((input) => {
      const value = getByPath(input.dataset.path);
      if (input.dataset.type === "boolean") input.checked = value !== false;
      else input.value = value ?? "";
    });
  }

  function renderTheme() {
    const labels = {
      navy: "Navy",
      navySoft: "Navy suave",
      cream: "Creme",
      champagne: "Champagne",
      rose: "Rosé",
      roseDark: "Rosé escuro",
      gold: "Dourado",
      goldLight: "Dourado claro",
      ink: "Texto",
      muted: "Texto suave",
    };
    const root = $("#themeFields");
    root.innerHTML = Object.entries(state.theme || {}).map(([key, value]) => `
      <label class="color-field">
        <input type="color" value="${esc(value)}" data-theme-key="${esc(key)}" />
        <div><strong>${esc(labels[key] || key)}</strong><code>${esc(value)}</code></div>
      </label>
    `).join("");
  }

  function slideCard(slide, index) {
    return `
      <article class="repeat-card" data-repeat-index="${index}">
        ${slide.image ? `<div class="image-preview"><img src="${esc(slide.image)}" alt="" loading="lazy" /></div>` : ""}
        <div class="repeat-head">
          <div class="repeat-title">
            <label class="switch"><input type="checkbox" data-section="slides" data-index="${index}" data-field="visible" ${slide.visible !== false ? "checked" : ""}><span></span>Ativo</label>
            <strong>Slide ${index + 1}</strong>
          </div>
          <div class="repeat-actions">
            <button class="icon-button" type="button" data-action="up" data-section="slides" data-index="${index}" title="Subir">↑</button>
            <button class="icon-button" type="button" data-action="down" data-section="slides" data-index="${index}" title="Descer">↓</button>
            <button class="icon-button remove" type="button" data-action="remove" data-section="slides" data-index="${index}" title="Excluir">×</button>
          </div>
        </div>
        <div class="form-grid two">
          <label class="field span-2"><span>Imagem</span><input data-section="slides" data-index="${index}" data-field="image" value="${esc(slide.image)}" placeholder="https://... ou /assets/..." /></label>
          <label class="field"><span>Posição da imagem</span><select data-section="slides" data-index="${index}" data-field="imagePosition">
            ${["center", "top", "bottom", "left", "right"].map((value) => `<option value="${value}" ${slide.imagePosition === value ? "selected" : ""}>${value}</option>`).join("")}
          </select></label>
          <label class="field"><span>Etiqueta</span><input data-section="slides" data-index="${index}" data-field="eyebrow" value="${esc(slide.eyebrow)}" /></label>
          <label class="field span-2"><span>Título</span><input data-section="slides" data-index="${index}" data-field="title" value="${esc(slide.title)}" /></label>
          <label class="field span-2"><span>Subtítulo</span><input data-section="slides" data-index="${index}" data-field="subtitle" value="${esc(slide.subtitle)}" /></label>
        </div>
      </article>`;
  }

  function renderSlides() {
    $("#slidesEditor").innerHTML = state.carousel.slides.map(slideCard).join("") || '<p class="muted">Nenhum slide cadastrado.</p>';
  }

  function linkCard(item, index) {
    const icons = ["globe", "whatsapp", "instagram", "map", "calendar"];
    return `
      <article class="repeat-card">
        <div class="repeat-head">
          <div class="repeat-title">
            <label class="switch"><input type="checkbox" data-section="links" data-index="${index}" data-field="visible" ${item.visible !== false ? "checked" : ""}><span></span>Ativo</label>
            <strong>${esc(item.label || `Link ${index + 1}`)}</strong>
          </div>
          <div class="repeat-actions">
            <button class="icon-button" type="button" data-action="up" data-section="links" data-index="${index}" title="Subir">↑</button>
            <button class="icon-button" type="button" data-action="down" data-section="links" data-index="${index}" title="Descer">↓</button>
            <button class="icon-button remove" type="button" data-action="remove" data-section="links" data-index="${index}" title="Excluir">×</button>
          </div>
        </div>
        <div class="form-grid two">
          <label class="field"><span>Ícone</span><select data-section="links" data-index="${index}" data-field="icon">${icons.map((icon) => `<option value="${icon}" ${item.icon === icon ? "selected" : ""}>${icon}</option>`).join("")}</select></label>
          <label class="field"><span>Nome</span><input data-section="links" data-index="${index}" data-field="label" value="${esc(item.label)}" /></label>
          <label class="field span-2"><span>Descrição curta</span><input data-section="links" data-index="${index}" data-field="detail" value="${esc(item.detail)}" /></label>
          <label class="field span-2"><span>URL</span><input data-section="links" data-index="${index}" data-field="url" value="${esc(item.url)}" /></label>
        </div>
      </article>`;
  }

  function renderLinks() {
    $("#linksEditor").innerHTML = state.links.map(linkCard).join("") || '<p class="muted">Nenhum link cadastrado.</p>';
  }

  function renderServices() {
    $("#servicesEditor").innerHTML = state.services.items.map((item, index) => `
      <div class="service-row">
        <input value="${esc(item.label)}" data-section="services" data-index="${index}" data-field="label" aria-label="Procedimento ${index + 1}" />
        <button class="icon-button remove" type="button" data-action="remove" data-section="services" data-index="${index}" title="Excluir">×</button>
      </div>
    `).join("");
  }

  function renderAll() {
    ensureShape(state);
    hydrateStaticFields();
    renderTheme();
    renderSlides();
    renderLinks();
    renderServices();
  }

  function arrayForSection(section) {
    if (section === "slides") return state.carousel.slides;
    if (section === "links") return state.links;
    if (section === "services") return state.services.items;
    return null;
  }

  document.addEventListener("input", (event) => {
    const input = event.target;

    if (input.dataset.path) {
      let value = input.value;
      if (input.dataset.type === "boolean") value = input.checked;
      if (input.dataset.type === "number") value = Number(input.value) || 0;
      setByPath(input.dataset.path, value);
      markDirty();
      return;
    }

    if (input.dataset.themeKey) {
      state.theme[input.dataset.themeKey] = input.value;
      input.closest(".color-field")?.querySelector("code")?.replaceChildren(input.value);
      markDirty();
      return;
    }

    const section = input.dataset.section;
    const index = Number(input.dataset.index);
    const field = input.dataset.field;
    const array = arrayForSection(section);
    if (!array || !array[index] || !field) return;

    array[index][field] = input.type === "checkbox" ? input.checked : input.value;
    if (section === "slides" && field === "image") {
      const preview = input.closest(".repeat-card")?.querySelector(".image-preview img");
      if (preview) preview.src = input.value;
    }
    markDirty();
  });

  document.addEventListener("change", (event) => {
    if (event.target.type === "checkbox") event.target.dispatchEvent(new Event("input", { bubbles: true }));
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const section = button.dataset.section;
    const index = Number(button.dataset.index);
    const action = button.dataset.action;
    const array = arrayForSection(section);
    if (!array || !array[index]) return;

    if (action === "remove") array.splice(index, 1);
    if (action === "up" && index > 0) [array[index - 1], array[index]] = [array[index], array[index - 1]];
    if (action === "down" && index < array.length - 1) [array[index + 1], array[index]] = [array[index], array[index + 1]];

    if (section === "slides") renderSlides();
    if (section === "links") renderLinks();
    if (section === "services") renderServices();
    markDirty();
  });

  $("#addSlide").addEventListener("click", () => {
    state.carousel.slides.push({
      visible: true,
      image: "",
      imagePosition: "center",
      eyebrow: "Novo destaque",
      title: "Novo título",
      subtitle: "Novo subtítulo",
    });
    renderSlides();
    markDirty();
  });

  $("#addLink").addEventListener("click", () => {
    state.links.push({ visible: true, icon: "globe", label: "Novo link", detail: "", url: "" });
    renderLinks();
    markDirty();
  });

  $("#addService").addEventListener("click", () => {
    state.services.items.push({ label: "Novo procedimento" });
    renderServices();
    markDirty();
  });

  $("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = $("#loginButton");
    const message = $("#loginMessage");
    button.disabled = true;
    message.textContent = "Entrando…";
    try {
      await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ password: $("#passwordInput").value }),
      });
      $("#passwordInput").value = "";
      message.textContent = "";
      await showAdmin();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  $("#logoutButton").addEventListener("click", async () => {
    try { await api("/api/logout", { method: "POST" }); } catch { /* ignora */ }
    showLogin();
  });

  saveButton.addEventListener("click", async () => {
    saveButton.disabled = true;
    saveStatus.textContent = "Salvando…";
    try {
      const result = await api("/api/admin/config", {
        method: "PUT",
        body: JSON.stringify({ config: state }),
      });
      sourcePill.textContent = "Cloudflare KV";
      markSaved(result.updatedAt ? `Salvo às ${new Date(result.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "Tudo salvo");
    } catch (error) {
      if (error.status === 401) return showLogin("Sua sessão expirou.");
      markError(error.message);
    } finally {
      saveButton.disabled = false;
    }
  });

  $("#resetButton").addEventListener("click", async () => {
    if (!confirm("Restaurar o conteúdo padrão do repositório? A configuração salva no KV será apagada.")) return;
    const button = $("#resetButton");
    button.disabled = true;
    try {
      await api("/api/admin/config", { method: "DELETE" });
      state = ensureShape(clone(fallbackConfig));
      sourcePill.textContent = "Padrão do código";
      renderAll();
      markSaved("Padrão restaurado");
    } catch (error) {
      markError(error.message);
    } finally {
      button.disabled = false;
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  (async function init() {
    try {
      const session = await api("/api/session");
      if (session.authenticated) await showAdmin();
      else showLogin();
    } catch {
      showLogin("Não foi possível verificar a sessão.");
    }
  })();
})();
