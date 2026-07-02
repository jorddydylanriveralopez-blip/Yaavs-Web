/** Carrusel del banner — fotos + promos de marca */
window.YAAVS_HERO_CAROUSEL = {
  interval: 7000,
  transitionMs: 1400,
  /** Media query para cargar `srcMobile` (por defecto ≤768px) */
  mobileBreakpoint: "(max-width: 768px)",
  /** Presentación uniforme en todos los slides */
  slideDefaults: {
    objectFit: "cover",
    objectPosition: "center center",
    objectFitMobile: "cover",
    objectPositionMobile: "center top",
    widthMobile: 1080,
    heightMobile: 2400,
  },
  images: [
    {
      /* Desktop 3840×2160 · Móvil 1080×2400 (celular banner) */
      src: "assets/hero-telecom/hero-portada-campeones-2pc.png",
      srcMobile: "assets/hero-telecom/mobile/hero-celular-banner.png",
      width: 3840,
      height: 2160,
      widthMobile: 1080,
      heightMobile: 2400,
      alt: "Grupo YAAVS — liderazgo nacional en retail, distribución y soporte.",
      hidePromo: true,
      lightShade: true,
      objectFit: "cover",
      objectPosition: "center center",
      objectFitMobile: "cover",
      objectPositionMobile: "center top",
    },
    {
      src: "assets/hero-telecom/hero-telecom-2.jpg",
      srcMobile: "assets/hero-telecom/mobile/hero-telecom-2.jpg",
      widthMobile: 1080,
      heightMobile: 2400,
      objectPositionMobile: "center top",
      alt: "Ecosistema del Grupo YAAVS con marcas de retail y soporte",
      promo: {
        badge: "Grupo YAAVS",
        kicker: "Ecosistema nacional",
        title: "Yaavshop ·",
        accent: "YAAVS",
        lead: "Retail, distribución y soporte integrados bajo una sola visión empresarial.",
        cta: "Conocer el grupo",
        href: "#grupo-yaavs",
      },
    },
    {
      src: "assets/hero-telecom/hero-telecom-3.jpg",
      srcMobile: "assets/hero-telecom/mobile/hero-telecom-3.jpg",
      widthMobile: 1080,
      heightMobile: 2400,
      objectPositionMobile: "center top",
      alt: "Cobertura nacional del Grupo YAAVS",
      promo: {
        badge: "Cobertura nacional",
        kicker: "Presencia en México",
        title: "Una empresa",
        accent: "nacional",
        lead: "Operamos con alcance, soporte y capacidad comercial para crecer en todo el país.",
        cta: "Ver capacidades",
        href: "quienes-somos.html",
      },
    },
  ],
  fallback: "assets/hero-bg.svg",
};
