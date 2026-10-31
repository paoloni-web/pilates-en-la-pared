/* Pilates en la Pared · configuración del funnel. Lo único que hay que tocar para lanzar o mover de hosting. */
window.PILATES_CONFIG = {
  OFFER: "pilates",                       // namespace en Supabase (funnel_events.offer) y en el panel /panel
  BRAND: "Pilates en la Pared",
  PRODUCT: "Reto Pilates en la Pared 28 Días",
  PRODUCT_90: "Pilates en la Pared 90 Días",

  // Precio (USD). Ancla = "75% OFF" del original (R$ 97,90 → R$ 27,90).
  PRICE: 9, ANCHOR: 37, CURRENCY: "USD", PLAN_DAYS: 28,
  PRICE_MXN_NOTE: "unos 170 pesos",       // Franco L 4.2: moneda siempre visible

  // Checkout KashPay (2 order bumps + embudo upsell 47 → downsell 23). Ver KASHPAY.md.
  CHECKOUT_URL: "https://pay.sheridanmktmng.com/checkout/checkout-1793482278655",
  // Respaldo sin bumps (Whop directo, plan oculto):
  CHECKOUT_FALLBACK: "https://whop.com/checkout/plan_bEyGp4Rxi4u2h",

  // Upsell / downsell one-click de KashPay (tokens del embudo). Respaldo: planes ocultos de Whop.
  KP_UPSELL: "https://pay.sheridanmktmng.com/u/e08547cb21dde755",
  KP_DOWNSELL: "https://pay.sheridanmktmng.com/u/ffc44ab0cd5669d2",
  UPSELL_URL: "https://whop.com/checkout/plan_QgLqQz7XaADrX",   // 90 Días · USD 47
  DOWNSELL_URL: "https://whop.com/checkout/plan_mdhRt0kkq01k1", // 90 Días solo rutinas · USD 23

  // App del producto (PWA en Railway) y medición por etapa (Supabase vía la app).
  APP_URL: "https://pilates-production-e673.up.railway.app",
  TRACK_URL: "https://pilates-production-e673.up.railway.app/api/t",
  LEAD_URL: "https://pilates-production-e673.up.railway.app/api/lead",

  // Meta Pixel: vacío = no se carga nada (Franco 7.3: píxel nuevo por oferta).
  META_PIXEL_ID: "",

  TIMER_SECONDS: 600,                     // Franco L 4.2: 600 s, "Esta oferta termina en: [time]"
  GUARANTEE_DAYS: 90,                     // igual que el original
  SHOW_TESTIMONIAL_NOTE: true,            // "Testimonios ilustrativos" hasta tener reseñas reales

  // 2 vídeos testimonio hechos con IA gratis (testimonios-ia/README.md). Van en la oferta, arriba de los testimonios.
  VIDEOS: [
    { name: "Patricia", city: "Guadalajara, Jal.", src: "video/testimonio-1.mp4", poster: "video/testimonio-1.jpg" },
    { name: "Leticia", city: "San Antonio, TX", src: "video/testimonio-2.mp4", poster: "video/testimonio-2.jpg" }
  ]
};
