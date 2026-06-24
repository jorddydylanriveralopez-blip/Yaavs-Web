(function () {
  function initForms() {
    const yaavserForm = document.getElementById("yaavser-form");
    const contactForm = document.getElementById("contact-form");

    function handleFormSubmit(form, statusId, subjectPrefix) {
      if (!form) return;
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const status = document.getElementById(statusId);
        const data = new FormData(form);
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        const body = Array.from(data.entries())
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n");
        window.location.href = `mailto:Hola@yaavs.com.mx?subject=${encodeURIComponent(
          subjectPrefix
        )}&body=${encodeURIComponent(body)}`;
        if (status) {
          status.textContent =
            "Se abrió tu cliente de correo. Si no aparece, escríbenos a Hola@yaavs.com.mx";
          status.classList.add("is-success");
        }
        form.reset();
      });
    }

    handleFormSubmit(yaavserForm, "form-status", "Solicitud Yaavser - ");
    handleFormSubmit(contactForm, "contact-status", "Contacto YAAVS - ");
  }

  function initJobApply() {
    const params = new URLSearchParams(window.location.search);
    const vacante = params.get("vacante");
    const contactAsunto = document.getElementById("contact-asunto");
    const msgField = document.querySelector('#contact-form [name="mensaje"]');

    document.querySelectorAll(".job-apply").forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = btn.getAttribute("data-vacante");
        if (v) sessionStorage.setItem("yaavs-vacante", v);
      });
    });

    if (vacante && contactAsunto) {
      contactAsunto.value = "Bolsa de trabajo";
      if (msgField) msgField.value = `Me interesa la vacante: ${vacante}.`;
    } else {
      const stored = sessionStorage.getItem("yaavs-vacante");
      if (stored && contactAsunto && window.location.pathname.includes("contacto")) {
        contactAsunto.value = "Bolsa de trabajo";
        if (msgField && !msgField.value.trim()) {
          msgField.value = `Me interesa la vacante: ${stored}.`;
        }
        sessionStorage.removeItem("yaavs-vacante");
      }
    }
  }

  function initReveal() {
    const els = document.querySelectorAll(".reveal-on-load, .glass-card, .page-hero, .quick-card");
    els.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transitionDelay = `${Math.min(i * 0.04, 0.3)}s`;
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => observer.observe(el));
  }

  function initHeroParallax() {
    const heroPhoto = document.querySelector(".hero-photo");
    if (!heroPhoto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.addEventListener(
      "scroll",
      () => {
        heroPhoto.style.transform = `translateY(${window.scrollY * 0.05}px)`;
      },
      { passive: true }
    );
  }

  function boot() {
    initForms();
    initJobApply();
    initReveal();
    initHeroParallax();
  }

  if (document.getElementById("site-header")?.innerHTML.trim()) {
    boot();
  } else {
    document.addEventListener("yaavs:layout-ready", boot);
  }
})();
