/**
 * Auth + leads YAAVS (Supabase).
 * Registro / login / perfil + tags OneSignal.
 */
(function () {
  const CFG = window.YAAVS_SUPABASE || {};
  const PREFS_KEY = "yaavs-alerts-prefs";
  let clientPromise = null;
  let supabaseLib = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === "1") resolve();
        else existing.addEventListener("load", () => resolve(), { once: true });
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => {
        s.dataset.loaded = "1";
        resolve();
      };
      s.onerror = () => reject(new Error("No se pudo cargar " + src));
      document.head.appendChild(s);
    });
  }

  async function getClient() {
    if (!CFG.url || !CFG.anonKey) throw new Error("Falta configuración de Supabase");
    if (clientPromise) return clientPromise;
    clientPromise = (async () => {
      await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/dist/umd/supabase.min.js");
      const createClient = window.supabase?.createClient;
      if (!createClient) throw new Error("SDK de Supabase no disponible");
      supabaseLib = createClient(CFG.url, CFG.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseLib;
    })();
    return clientPromise;
  }

  function initials(nombre, email) {
    const base = (nombre || email || "Y").trim();
    const parts = base.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return base.slice(0, 2).toUpperCase();
  }

  function setHeaderAccount(session, lead) {
    const link = document.querySelector("[data-header-cuenta]");
    const label = document.querySelector("[data-header-cuenta-label]");
    if (!link || !label) return;
    if (session?.user) {
      const name = lead?.nombre || session.user.user_metadata?.nombre || session.user.email || "";
      label.textContent = initials(name, session.user.email);
      link.setAttribute("aria-label", "Mi cuenta YAAVS");
      link.title = name || "Mi cuenta";
    } else {
      label.textContent = "Entrar";
      link.setAttribute("aria-label", "Cuenta YAAVS");
      link.removeAttribute("title");
    }
  }

  function saveLocalPrefs(lead) {
    const prefs = {
      promo: !!lead?.interes_promo,
      blog: !!lead?.interes_blog,
      vacante: !!lead?.interes_vacante,
    };
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (_) {}
    return prefs;
  }

  function syncOneSignalFromLead(lead) {
    const prefs = saveLocalPrefs(lead);
    if (window.YaavsAlerts?.syncTags) {
      window.YaavsAlerts.syncTags();
      return;
    }
    if (!window.OneSignalDeferred) return;
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.User.addTags({
          interest_promo: prefs.promo ? "1" : "0",
          interest_blog: prefs.blog ? "1" : "0",
          interest_vacante: prefs.vacante ? "1" : "0",
        });
      } catch (_) {}
    });
  }

  async function linkOneSignalPlayerId(sb, userId) {
    if (!window.OneSignalDeferred || !userId) return;
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        const id =
          OneSignal.User?.PushSubscription?.id ||
          OneSignal.User?.onesignalId ||
          null;
        if (!id) return;
        await sb.from("leads").update({ onesignal_player_id: String(id) }).eq("id", userId);
      } catch (_) {}
    });
  }

  async function fetchLead(sb, userId) {
    const { data, error } = await sb.from("leads").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function ensureLeadRow(sb, user) {
    let lead = await fetchLead(sb, user.id);
    if (lead) return lead;
    const meta = user.user_metadata || {};
    const payload = {
      id: user.id,
      email: user.email || "",
      nombre: meta.nombre || "",
      telefono: meta.telefono || "",
      negocio: meta.negocio || "",
      ciudad: meta.ciudad || "",
      estado: meta.estado || "",
      tipo: meta.tipo || "emprendedor",
    };
    const { error } = await sb.from("leads").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    return fetchLead(sb, user.id);
  }

  function setMsg(el, text, type) {
    if (!el) return;
    el.textContent = text || "";
    el.classList.toggle("is-error", type === "error");
    el.classList.toggle("is-ok", type === "ok");
  }

  function showPanel(name) {
    document.querySelectorAll("[data-cuenta-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.cuentaPanel !== name;
    });
    document.querySelectorAll("[data-cuenta-tab]").forEach((btn) => {
      const on = btn.dataset.cuentaTab === name;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function fillProfileForm(lead, email) {
    const form = document.getElementById("cuenta-profile-form");
    if (!form || !lead) return;
    form.nombre.value = lead.nombre || "";
    form.telefono.value = lead.telefono || "";
    form.email.value = lead.email || email || "";
    form.negocio.value = lead.negocio || "";
    form.ciudad.value = lead.ciudad || "";
    form.estado.value = lead.estado || "";
    form.tipo.value = lead.tipo || "emprendedor";
    form.interes_promo.checked = lead.interes_promo !== false;
    form.interes_blog.checked = lead.interes_blog !== false;
    form.interes_vacante.checked = lead.interes_vacante !== false;
  }

  async function refreshUi() {
    const sb = await getClient();
    const {
      data: { session },
    } = await sb.auth.getSession();
    const authPanels = document.getElementById("cuenta-auth");
    const profilePanel = document.getElementById("cuenta-profile");

    if (!session?.user) {
      setHeaderAccount(null, null);
      if (authPanels) authPanels.hidden = false;
      if (profilePanel) profilePanel.hidden = true;
      return { session: null, lead: null };
    }

    let lead = null;
    try {
      lead = await ensureLeadRow(sb, session.user);
      syncOneSignalFromLead(lead);
      void linkOneSignalPlayerId(sb, session.user.id);
    } catch (_) {}

    setHeaderAccount(session, lead);
    if (authPanels) authPanels.hidden = true;
    if (profilePanel) {
      profilePanel.hidden = false;
      fillProfileForm(lead, session.user.email);
    }
    return { session, lead };
  }

  function wireCuentaPage() {
    const page = document.body.classList.contains("page-cuenta");
    if (!page) return;

    document.querySelectorAll("[data-cuenta-tab]").forEach((btn) => {
      btn.addEventListener("click", () => showPanel(btn.dataset.cuentaTab));
    });

    const loginForm = document.getElementById("cuenta-login-form");
    const registerForm = document.getElementById("cuenta-register-form");
    const profileForm = document.getElementById("cuenta-profile-form");
    const logoutBtn = document.querySelector("[data-cuenta-logout]");
    const pushBtn = document.querySelector("[data-cuenta-push]");
    const loginMsg = document.getElementById("cuenta-login-msg");
    const registerMsg = document.getElementById("cuenta-register-msg");
    const profileMsg = document.getElementById("cuenta-profile-msg");

    loginForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector("[type=submit]");
      setMsg(loginMsg, "Entrando…");
      if (btn) btn.disabled = true;
      try {
        const sb = await getClient();
        const { error } = await sb.auth.signInWithPassword({
          email: loginForm.email.value.trim(),
          password: loginForm.password.value,
        });
        if (error) throw error;
        setMsg(loginMsg, "Sesión iniciada.", "ok");
        await refreshUi();
      } catch (err) {
        setMsg(loginMsg, err.message || "No se pudo iniciar sesión.", "error");
      } finally {
        if (btn) btn.disabled = false;
      }
    });

    registerForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = registerForm.querySelector("[type=submit]");
      setMsg(registerMsg, "Creando cuenta…");
      if (btn) btn.disabled = true;
      try {
        const sb = await getClient();
        const meta = {
          nombre: registerForm.nombre.value.trim(),
          telefono: registerForm.telefono.value.trim(),
          negocio: registerForm.negocio.value.trim(),
          ciudad: registerForm.ciudad.value.trim(),
          estado: registerForm.estado.value.trim(),
          tipo: registerForm.tipo.value || "emprendedor",
        };
        const { data, error } = await sb.auth.signUp({
          email: registerForm.email.value.trim(),
          password: registerForm.password.value,
          options: {
            data: meta,
            emailRedirectTo: `${window.location.origin}/cuenta.html`,
          },
        });
        if (error) throw error;

        if (data.session?.user) {
          await ensureLeadRow(sb, data.session.user);
          await sb
            .from("leads")
            .update({
              ...meta,
              email: data.session.user.email || "",
              interes_promo: registerForm.interes_promo.checked,
              interes_blog: registerForm.interes_blog.checked,
              interes_vacante: registerForm.interes_vacante.checked,
            })
            .eq("id", data.session.user.id);
          const lead = await fetchLead(sb, data.session.user.id);
          syncOneSignalFromLead(lead);
          void linkOneSignalPlayerId(sb, data.session.user.id);
          setMsg(registerMsg, "Cuenta lista. Bienvenido.", "ok");
          await refreshUi();
          if (window.YaavsAlerts?.askPush) window.YaavsAlerts.askPush();
        } else {
          setMsg(
            registerMsg,
            "Revisa tu correo para confirmar la cuenta (si el proyecto pide confirmación).",
            "ok"
          );
        }
      } catch (err) {
        setMsg(registerMsg, err.message || "No se pudo registrar.", "error");
      } finally {
        if (btn) btn.disabled = false;
      }
    });

    profileForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = profileForm.querySelector("[type=submit]");
      setMsg(profileMsg, "Guardando…");
      if (btn) btn.disabled = true;
      try {
        const sb = await getClient();
        const {
          data: { session },
        } = await sb.auth.getSession();
        if (!session?.user) throw new Error("Sesión expirada");
        const payload = {
          nombre: profileForm.nombre.value.trim(),
          telefono: profileForm.telefono.value.trim(),
          negocio: profileForm.negocio.value.trim(),
          ciudad: profileForm.ciudad.value.trim(),
          estado: profileForm.estado.value.trim(),
          tipo: profileForm.tipo.value || "emprendedor",
          interes_promo: profileForm.interes_promo.checked,
          interes_blog: profileForm.interes_blog.checked,
          interes_vacante: profileForm.interes_vacante.checked,
          email: session.user.email || profileForm.email.value.trim(),
        };
        const { error } = await sb.from("leads").update(payload).eq("id", session.user.id);
        if (error) throw error;
        await sb.auth.updateUser({
          data: {
            nombre: payload.nombre,
            telefono: payload.telefono,
            negocio: payload.negocio,
            ciudad: payload.ciudad,
            estado: payload.estado,
            tipo: payload.tipo,
          },
        });
        syncOneSignalFromLead(payload);
        void linkOneSignalPlayerId(sb, session.user.id);
        setMsg(profileMsg, "Perfil actualizado.", "ok");
        setHeaderAccount(session, payload);
      } catch (err) {
        setMsg(profileMsg, err.message || "No se pudo guardar.", "error");
      } finally {
        if (btn) btn.disabled = false;
      }
    });

    logoutBtn?.addEventListener("click", async () => {
      try {
        const sb = await getClient();
        await sb.auth.signOut();
        await refreshUi();
        showPanel("login");
      } catch (_) {}
    });

    pushBtn?.addEventListener("click", () => {
      if (window.YaavsAlerts?.askPush) window.YaavsAlerts.askPush();
      else if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async (OneSignal) => {
          try {
            await OneSignal.Notifications.requestPermission();
          } catch (_) {}
        });
      }
    });
  }

  async function init() {
    try {
      const sb = await getClient();
      sb.auth.onAuthStateChange(() => {
        void refreshUi();
      });
      await refreshUi();
      wireCuentaPage();
    } catch (err) {
      console.warn("[yaavs-auth]", err?.message || err);
      wireCuentaPage();
    }
  }

  window.YaavsAuth = {
    getClient,
    refresh: refreshUi,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => void init(), { once: true });
  } else {
    void init();
  }
})();
