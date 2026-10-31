/* Pilates en la Pared · página de oferta (última etapa del quiz).
   Orden del original (barra fija con contador → meta con fecha → "75% OFF" → tarjeta del plan → garantía → prueba social →
   comparación → resultados → repetición del plan → checklist → garantía → pago seguro) más lo que exige el blueprint de Franco:
   titular "Tu plan … personalizado está listo" (15), mockup de la app (16), "Hoy / En 28 días" con niveles (14), alerta,
   stack con valor por ítem y total (17), moneda visible (18), "Oferta válida solo por hoy" + "Esta oferta termina en: [time]" (19),
   "Compra segura · Satisfacción garantizada" (21) y botón "Recibir mi plan" al checkout (23). */
(function () {
  "use strict";
  var C = window.PILATES_CONFIG || {};
  var STACK = [
    ["Reto de 28 días de pilates en la pared", "Rutinas guiadas día por día, de 10 a 20 minutos, en tu celular", 47],
    ["Tu plan adaptado a ti", "Nivel, zonas y tiempo según tus respuestas del test", 27],
    ["Biblioteca de ejercicios en la pared", "Cada ejercicio paso a paso, con versión suave para rodillas y espalda", 29],
    ["Seguimiento de tu progreso", "Peso, medidas, racha y calendario de días hechos", 19],
    ["Recordatorios diarios", "Tu rutina se agenda en el calendario de tu celular", 9],
    ["Guía de alimentación sin dietas estrictas", "Ideas de platillos y lista del súper para acompañar el reto", 17],
  ];
  var total = STACK.reduce(function (s, x) { return s + x[2]; }, 0);

  window.PILATES_OFFER = function (s, H) {
    var esc = H.esc, md = H.md, fill = H.fill, ICON = H.ICON, S = H.S, money = H.money;
    var name = H.firstName();
    var sp = s.singlePlan;
    var t = '<span class="tm">10:00</span>';
    var co = function (label, cls) { return '<a class="btn ' + (cls || "green") + '" data-checkout href="' + esc(C.CHECKOUT_URL) + '">' + esc(label) + "</a>"; };
    var priceRow = '<div class="plan"><p class="rec">✦ ' + esc(sp.recommendedLabel) + '</p><div class="planhead">⏰ ' + esc(sp.urgencyLabel.toUpperCase()) + '</div><div class="planbody"><div><b class="pt">' + esc(sp.title) + '</b><span class="badge">∞ ' + esc(sp.badge.toUpperCase()) + '</span><p class="pp"><s>' + fill(sp.oldPrice) + "</s> <b>" + fill(sp.newPrice) + '</b></p><small class="mxn">Pago único · ' + esc(C.PRICE_MXN_NOTE || "") + '</small></div><div class="perday"><s>' + fill(sp.oldPerDay) + "</s><b>" + fill(sp.perDay) + "</b><small>al día</small></div></div></div>";
    var b = H.bmi() || 26;
    var lv = function (lbl, now, goal) { return '<div class="lvl"><small>' + lbl + '</small><div class="two"><div><i class="r" style="--w:' + now + '%"></i><em>Alto</em></div><div><i class="g" style="--w:' + goal + '%"></i><em>Bajo</em></div></div></div>'; };
    var html = "";
    html += '<div class="sticky"><div><small>' + esc(s.stickyBarLabel) + "</small>" + t + "</div>" + co(s.stickyCtaLabel) + "</div>";
    html += '<main class="pad offer">';
    // Franco 2.2 (1): titular + mockup de la app
    html += '<p class="center brandline">' + esc(C.BRAND.toUpperCase()) + '</p><h1 class="center big">' + (name ? esc(name) + ", tu" : "Tu") + ' plan de <span class="acc">Pilates en la Pared</span> personalizado está listo</h1>';
    html += '<figure class="mock"><img src="img/app-mockup.jpg" alt="Tu plan de Pilates en la Pared dentro de una app en tu celular" onerror="this.parentNode.style.display=\'none\'"></figure>';
    // Original: meta con fecha + gráfico
    html += H.projection({ titleAfterName: s.titleAfterName }, true);
    // Franco 2.2 (2): Hoy / En 28 días con barras rojo/verde
    html += '<div class="card today"><div class="hd"><span>Hoy</span><span class="g">En 28 días</span></div>' + lv("Grasa abdominal", b >= 25 ? 75 : 60, 25) + lv("Tensión en espalda y cadera", 70, 20) + lv("Energía", 30, 85).replace("Alto</em>", "Baja</em>").replace("Bajo</em>", "Alta</em>") + "</div>";
    // Franco 2.2 (3): alerta
    html += '<div class="alert">⚠️ <span><b>Tu descuento está reservado solo por 10 minutos.</b> Si sales de esta página, el precio vuelve a ' + money(C.ANCHOR) + ".</span></div>";
    html += '<h2 class="center offt">' + esc(s.offerTitle) + '<br><span class="red">' + esc(s.offerTitleAccent) + "</span></h2>";
    // Franco 2.2 (4): stack con valor por ítem
    html += '<div class="card stack"><h3>Tu plan incluye</h3><ul>' + STACK.map(function (x) { return "<li>" + ICON.check + "<div><b>" + esc(x[0]) + "</b><small>" + esc(x[1]) + "</small></div><s>$" + x[2] + "</s></li>"; }).join("") +
      '</ul><p class="tot">Valor total: <s>$' + total + " USD</s><br>Hoy: <b>" + money(C.PRICE) + "</b></p></div>";
    // Franco 2.2 (5-6): "Oferta válida solo por hoy" + temporizador
    html += '<p class="center today-only">Oferta válida solo por hoy</p><div class="timerpill">' + ICON.timer + "Esta oferta termina en: " + t + "</div>";
    html += priceRow + '<p class="center gl"><a href="#garantia">' + esc(s.guaranteeLink) + "</a></p>";
    html += '<div class="dbox"><p>🎁 ' + esc(s.discountBoxLabel) + "</p>" + co("RECIBIR MI PLAN · " + money(C.PRICE)) + '</div><p class="secure">' + ICON.lock + "Compra segura · Acceso inmediato a tu app · Satisfacción garantizada</p>";
    html += '<p class="disc">' + esc(s.disclaimer) + '</p><p class="disc">' + esc(s.disclaimer2) + "</p>";
    html += '<div class="social"><b>' + esc(s.social.title) + "</b><p>" + esc(s.social.caption) + '</p><div class="card rating"><span class="stars">★★★★★</span><b>' + esc(s.social.rating) + "</b></div><p><b>" + esc(s.social.reviewsLine) + "</b></p></div>";
    var cmp = s.comparison;
    html += '<h2 class="center">' + md(cmp.title).replace(/<b>/, '<b class="acc">') + '</h2><div class="redpill">' + esc(cmp.discountPillLabel) + " " + t + '</div><div class="cmp"><div><b>' + esc(cmp.leftTitle) + "</b>" + H.pic(cmp.leftImage) + "<ul>" + cmp.leftBullets.map(function (x) { return '<li class="x">✕ ' + esc(x) + "</li>"; }).join("") + '</ul></div><div class="g"><b>' + esc(cmp.rightTitle) + " ⚡</b>" + H.pic(cmp.rightImage) + "<ul>" + cmp.rightBullets.map(function (x) { return '<li class="v">✓ ' + esc(x) + "</li>"; }).join("") + "</ul></div></div>";
    html += '<div class="dbox">' + co("RECIBIR MI PLAN") + "</div>";
    // Franco 2.2 (7): testimonios
    // Franco 2.7 (L 4.4 ≈16:07 "Yo tengo dos videos. En cada embudo"): 2 vídeos IA arriba de los testimonios, como el funnel 1.
    var VIDS = C.VIDEOS || [];
    html += '<h2>' + esc(s.reviews.title) + '</h2>';
    if (VIDS.length) html += '<div class="vids">' + VIDS.map(function (x) {
      return '<figure class="vid"><video data-vid muted loop playsinline preload="none" poster="' + esc(x.poster) + '" aria-label="Video testimonio de ' + esc(x.name) + '"><source src="' + esc(x.src) + '" type="video/mp4"></video>' +
        '<button type="button" class="vid-snd" aria-label="Ver el video de ' + esc(x.name) + ' con sonido">🔊 Escuchar</button><figcaption><b>' + esc(x.name) + "</b> · " + esc(x.city) + "</figcaption></figure>";
    }).join("") + "</div>";
    html += '<div class="revs">' + s.reviews.items.map(function (r) { return '<div class="rev">' + H.pic(r.image) + '<p class="res">' + esc(r.result) + "</p><b>" + esc(r.name) + "</b><p>" + esc(r.text) + "</p></div>"; }).join("") + "</div>";
    if (C.SHOW_TESTIMONIAL_NOTE) html += '<p class="note-t">Testimonios ilustrativos. Los resultados varían de persona a persona.</p>';
    html += '<h2 class="center">' + esc(s.resultsTitle) + '</h2><div class="timerpill">' + ICON.timer + "Esta oferta termina en: " + t + "</div>" + priceRow;
    html += '<div class="dbox"><p>🎁 ' + esc(s.discountBoxLabel) + "</p>" + co("RECIBIR MI PLAN · " + money(C.PRICE)) + '</div><p class="secure">' + ICON.lock + "Compra segura · Satisfacción garantizada</p>";
    html += '<ul class="chk">' + s.checklist.map(function (x) { return "<li>" + ICON.check + "<span>" + fill(x) + "</span></li>"; }).join("") + "</ul>";
    var g = s.guarantee;
    html += '<div class="card guar" id="garantia">' + H.pic(g.image) + "<h2>" + esc(g.title) + "</h2><p>" + md(g.body) + '</p><div class="links"><a href="privacidad.html" target="_blank">Aviso de privacidad</a><a href="reembolso.html" target="_blank">Política de reembolso</a><a href="terminos.html" target="_blank">Términos de uso</a></div></div>';
    html += '<p class="center paytitle">Compra <span class="acc">segura</span> garantizada ' + ICON.shield + '</p><div class="pays">' + s.paymentIcons.map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</div>";
    html += '<p class="legal center">Este programa es educativo y no sustituye la consulta médica. Si estás embarazada, tienes alguna lesión o condición de salud, consulta a tu médico antes de empezar.</p>';
    html += "</main>";
    // Raspadita del original (75% OFF)
    html += '<div class="scratch" id="scratch" role="dialog" aria-modal="true"><div class="sbox"><h2>' + esc(name || "Amiga") + esc(s.scratchPopup.titleAfterName) + "</h2><p>" + esc(s.scratchPopup.subtitle) + '</p><div class="sarea"><div class="sreveal"><b>' + esc(s.scratchPopup.revealTitle) + "</b><span>" + esc(s.scratchPopup.revealSubtitle) + '</span></div><canvas id="scv" width="560" height="260" aria-label="' + esc(s.scratchPopup.scratchLabel) + '"></canvas></div><p class="applied" hidden>✓ ' + esc(s.scratchPopup.appliedNote) + '</p><button class="btn" id="sgo" hidden>Ver mi plan con 75% OFF</button></div></div>';
    return html;
  };

  window.PILATES_OFFER_AFTER = function (s, H) {
    // Contador de 10 min (Franco L 4.2: 600 s). Persiste en la sesión para no reiniciarse al recargar.
    var S = H.S, end = S.offerEnd || (S.offerEnd = Date.now() + (C.TIMER_SECONDS || 600) * 1000);
    H.save();
    var tms = document.querySelectorAll(".tm");
    (function tick() {
      var left = Math.max(0, Math.round((end - Date.now()) / 1000));
      var txt = String(Math.floor(left / 60)).padStart(2, "0") + ":" + String(left % 60).padStart(2, "0");
      for (var k = 0; k < tms.length; k++) tms[k].textContent = txt;
      if (left > 0) setTimeout(tick, 1000);
    })();
    // Clic al checkout: evento por etapa + píxel. attrib.js añade UTMs y el id de sesión al enlace.
    document.querySelectorAll("a[data-checkout]").forEach(function (a) {
      a.addEventListener("click", function () {
        try {
          var u = new URL(a.href);
          if (S.email && !u.searchParams.has("email")) u.searchParams.set("email", S.email);
          if (S.name && !u.searchParams.has("name")) u.searchParams.set("name", S.name);
          a.href = u.toString();
        } catch (e) {}
        H.beacon(76, "offer", "checkout_click");
        H.pixel("InitiateCheckout", { value: C.PRICE, currency: C.CURRENCY, content_name: C.PRODUCT });
      });
    });
    // Vídeos testimonio: autoplay sin sonido al verse (IntersectionObserver); "Escuchar" = desde el inicio con sonido.
    var vids = document.querySelectorAll("video[data-vid]");
    var io = vids.length && "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { if (v.preload !== "auto") v.preload = "auto"; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else if (v.muted) v.pause();
      });
    }, { threshold: 0.5 }) : null;
    vids.forEach(function (v) {
      if (io) io.observe(v);
      v.parentNode.querySelector(".vid-snd").addEventListener("click", function () {
        vids.forEach(function (o) { if (o !== v) { o.muted = true; o.parentNode.classList.remove("live"); } });
        v.muted = false; v.loop = false; v.controls = true; v.currentTime = 0;
        v.parentNode.classList.add("live");
        var p = v.play(); if (p && p.catch) p.catch(function () {});
        H.beacon(76, "offer", "video_play");
        H.pixel("ViewContent", { content_name: "video_testimonio" });
      });
    });
    // Raspadita: solo la primera vez
    var box = document.getElementById("scratch");
    if (S.scratched) { box.remove(); return; }
    box.classList.add("on");
    var cv = document.getElementById("scv"), ctx = cv.getContext("2d");
    var grd = ctx.createLinearGradient(0, 0, 560, 260); grd.addColorStop(0, "#B9BCF5"); grd.addColorStop(1, "#7C80EA");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, 560, 260);
    ctx.fillStyle = "#fff"; ctx.font = "700 34px Montserrat, sans-serif"; ctx.textAlign = "center"; ctx.fillText(s.scratchPopup.scratchLabel + " ✨", 280, 142);
    var down = false, n = 0;
    function at(e) { var r = cv.getBoundingClientRect(), p = e.touches ? e.touches[0] : e; return [((p.clientX - r.left) / r.width) * 560, ((p.clientY - r.top) / r.height) * 260]; }
    function scratch(e) {
      if (!down) return; e.preventDefault();
      var q = at(e); ctx.globalCompositeOperation = "destination-out"; ctx.beginPath(); ctx.arc(q[0], q[1], 34, 0, 7); ctx.fill();
      if (++n > 28) reveal();
    }
    function reveal() {
      if (S.scratched) return; S.scratched = 1; H.save();
      cv.style.transition = "opacity .4s"; cv.style.opacity = 0;
      box.querySelector(".applied").hidden = false; var g = document.getElementById("sgo"); g.hidden = false; g.onclick = function () { box.remove(); };
    }
    cv.addEventListener("pointerdown", function (e) { down = true; scratch(e); });
    cv.addEventListener("pointermove", scratch);
    window.addEventListener("pointerup", function () { down = false; });
    cv.addEventListener("click", function () { if (n < 3) { n += 10; } if (n > 20) reveal(); });
  };
})();
