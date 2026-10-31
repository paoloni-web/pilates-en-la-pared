/* Pilates en la Pared · motor del quiz.
   Pinta las 77 etapas de steps.js (clon 1:1 del original) con los mismos tipos de pantalla.
   Sin dependencias. Estado en sessionStorage ("pil_state"); id de sesión "pil_sid". */
(function () {
  "use strict";
  var C = window.PILATES_CONFIG || {};
  var STEPS = window.PILATES_STEPS || [];
  var app = document.getElementById("app");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  // **negrita** del config → <b>; el resto se escapa salvo los <a> del texto legal
  var md = function (s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>"); };
  var rich = function (s) { return String(s || "").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); };

  /* ---------- estado ---------- */
  var S = load() || { i: 0, a: {}, unit: "kg", hunit: "cm" };
  function load() { try { return JSON.parse(sessionStorage.getItem("pil_state")); } catch (e) { return null; } }
  function save() { try { sessionStorage.setItem("pil_state", JSON.stringify(S)); } catch (e) {} }
  if (/[?&]reset=1/.test(location.search)) { S = { i: 0, a: {}, unit: "kg", hunit: "cm" }; save(); }
  var SID = (function () { try { var v = sessionStorage.getItem("pil_sid"); if (!v) { v = Date.now().toString(36) + Math.random().toString(36).slice(2, 8); sessionStorage.setItem("pil_sid", v); } return v; } catch (e) { return "anon"; } })();

  /* ---------- medición por etapa (Franco 6.1) + píxel ---------- */
  function utm() { try { return sessionStorage.getItem("pil_qs") || localStorage.getItem("pil_ft") || ""; } catch (e) { return ""; } }
  function beacon(step, name, ev) {
    if (!C.TRACK_URL) return;
    var body = JSON.stringify({ offer: C.OFFER, sid: SID, step: step, name: name, ev: ev || "view", utm: utm() });
    try { if (navigator.sendBeacon) navigator.sendBeacon(C.TRACK_URL, new Blob([body], { type: "text/plain" })); else fetch(C.TRACK_URL, { method: "POST", body: body, keepalive: true, mode: "no-cors" }); } catch (e) {}
  }
  var sent = {};
  function trackStep(i) {
    var s = STEPS[i]; if (!s || sent[i]) return; sent[i] = 1;
    var name = s.id === "checkpoint" ? "result-imc" : s.id === "offer" ? "offer" : s.id;
    beacon(i, name, "view");
    if (s.id === "offer") pixel("ViewContent", { content_name: C.PRODUCT, value: C.PRICE, currency: C.CURRENCY });
  }
  function pixel(ev, params) {
    if (!C.META_PIXEL_ID || !window.fbq) { if (window.console) console.log("[pixel]", ev, params || ""); return; }
    window.fbq("track", ev, params || {});
  }
  if (C.META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", C.META_PIXEL_ID); window.fbq("track", "PageView");
  }

  /* ---------- datos derivados de las respuestas ---------- */
  var A = function (id) { return S.a[id]; };
  var kg = function (v) { return S.unit === "lb" ? v / 2.2046 : v; };
  var fmtW = function (vkg) { return S.unit === "lb" ? Math.round(vkg * 2.2046) + " lb" : Math.round(vkg) + " kg"; };
  function bmi() { var h = S.h, w = S.w; if (!h || !w) return null; var m = h / 100; return Math.round((kg(w) / (m * m)) * 10) / 10; }
  function bmiCat(b) { return b < 18.5 ? "bajo" : b < 25 ? "normal" : b < 30 ? "sobrepeso" : "alto"; }
  function firstName() { return String(S.name || "").trim().split(/\s+/)[0] || ""; }
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  function goalDate() {
    var lose = Math.max(0, kg(S.w || 0) - kg(S.g || 0));
    var weeks = Math.min(26, Math.max(4, Math.ceil(lose / 0.8)));   // ritmo prudente: ~0,8 kg por semana, mínimo las 4 semanas del reto
    var d = new Date(Date.now() + weeks * 7 * 864e5);
    return { d: d, txt: d.getDate() + " de " + MESES[d.getMonth()], weeks: weeks, mon: MESES[d.getMonth()].slice(0, 3).toUpperCase() };
  }
  function plus3() { var d = new Date(Date.now() + 3 * 864e5); return d.getDate() + " de " + MESES[d.getMonth()]; }
  function money(v) { return "$" + (Math.round(v * 100) / 100).toFixed(v % 1 ? 2 : 0) + " " + (C.CURRENCY || "USD"); }
  function fill(s) {
    return String(s || "").replace(/\{\{NAME\}\}/g, esc(firstName() || "amiga")).replace(/\{\{DATE_PLUS_3\}\}/g, plus3())
      .replace(/\{\{PRICE\}\}/g, money(C.PRICE)).replace(/\{\{ANCHOR\}\}/g, money(C.ANCHOR))
      .replace(/\{\{PRICE_DAY\}\}/g, "$" + (C.PRICE / C.PLAN_DAYS).toFixed(2)).replace(/\{\{ANCHOR_DAY\}\}/g, "$" + (C.ANCHOR / C.PLAN_DAYS).toFixed(2));
  }
  function optLabel(stepId, optId) {
    var s = STEPS.filter(function (x) { return x.id === stepId; })[0]; if (!s) return "";
    var o = (s.options || []).filter(function (x) { return x.id === optId; })[0]; return o ? o.label : "";
  }

  /* ---------- navegación ---------- */
  function go(i) { S.i = Math.max(0, Math.min(STEPS.length - 1, i)); save(); render(); window.scrollTo(0, 0); }
  function next() { go(S.i + 1); }
  function back() { if (S.i > 0) { var j = S.i - 1; while (j > 0 && /processing|welcome/.test(STEPS[j].type)) j--; go(j); } }
  window.addEventListener("popstate", function () { back(); history.pushState(null, "", location.href); });
  try { history.pushState(null, "", location.href); } catch (e) {}

  /* ---------- piezas ---------- */
  function phaseInfo(i) {
    var s = STEPS[i]; if (!s.spPhase) return null;
    var same = [], k; for (k = 0; k < STEPS.length; k++) if (STEPS[k].spPhase === s.spPhase) same.push(k);
    return { phase: s.spPhase, pos: same.indexOf(i) + 1, n: same.length };
  }
  function header(s) {
    if (s.type === "sp-landing") return '<header class="top brand"><span>' + esc(C.BRAND.toUpperCase()) + "</span></header>";
    var ph = phaseInfo(S.i);
    if (!s.section) return "";
    var bars = "";
    for (var p = 1; p <= 3; p++) {
      var w = !ph ? 0 : p < ph.phase ? 100 : p > ph.phase ? 0 : Math.round((ph.pos / ph.n) * 100);
      bars += '<i><b style="width:' + w + '%"></b></i>';
    }
    return '<header class="top"><div class="sec">' + esc(s.section) + '</div><div class="prog"><button class="back" aria-label="Atrás" ' + (S.i === 0 ? "disabled" : "") + '>' + ICON.back + '</button><div class="bars" role="progressbar" aria-valuenow="' + (ph ? ph.phase : 0) + '" aria-valuemin="1" aria-valuemax="3">' + bars + "</div></div></header>";
  }
  function pic(src, cls, alt) {
    if (!src) return "";
    if (src.indexOf("emoji:") === 0) return '<span class="emo ' + (cls || "") + '" aria-hidden="true">' + src.slice(6) + "</span>";
    if (src.indexOf("svg:") === 0) return '<div class="svgwrap ' + (cls || "") + '">' + (SVG[src.slice(4)] ? SVG[src.slice(4)]() : "") + "</div>";
    return '<img class="' + (cls || "") + '" src="' + esc(src) + '" alt="' + esc(alt || "") + '" loading="eager" onerror="this.classList.add(\'noimg\')">';
  }
  function cta(label, attrs, cls) { return '<div class="foot"><button class="btn ' + (cls || "") + '" ' + (attrs || "") + ">" + esc(label) + "</button></div>"; }
  function callout(c) { return c ? '<div class="callout"><span class="emo">' + esc(c.emoji || "") + "</span><div><b>" + esc(c.title) + "</b>" + (c.body ? "<p>" + md(c.body) + "</p>" : "") + "</div></div>" : ""; }

  /* ---------- pantallas ---------- */
  var R = {};
  R["sp-landing"] = function (s) {
    return '<main class="pad landing"><h1 class="center up">' + md(s.title) + '</h1><p class="center kicker">' + md(s.subtitle) + '</p><div class="agegrid">' +
      s.options.map(function (o) { return '<button class="age" data-v="' + esc(o.id) + '"><div class="arch">' + pic(o.image, "", o.label) + '</div><span>' + esc(o.label) + '<em>' + ICON.chev + "</em></span></button>"; }).join("") +
      '</div><p class="legal center">Al continuar aceptas los <a href="terminos.html" target="_blank">Términos</a> y el <a href="privacidad.html" target="_blank">Aviso de privacidad</a>.</p></main>';
  };
  R["sp-single"] = function (s) {
    var sel = A(s.id);
    var opts = s.options.map(function (o) {
      return '<button class="opt' + (sel === o.id ? " on" : "") + '" data-v="' + esc(o.id) + '" aria-pressed="' + (sel === o.id) + '">' + (o.photo || o.icon ? pic(o.photo || o.icon, "oi") : "") + "<span>" + esc(o.label) + "</span>" + (s.checkboxRight ? '<i class="ck"></i>' : "") + "</button>";
    }).join("");
    var showCall = s.callout && (!s.calloutOnSelect || sel) && (sel || !s.footerCta);
    return '<main class="pad">' + (s.titleTop ? '<p class="pill">' + ICON.check + esc(s.titleTop) + "</p>" : "") + "<h1>" + md(s.title) + "</h1>" + (s.subtitle ? '<p class="sub">' + md(s.subtitle) + "</p>" : "") +
      '<div class="opts">' + opts + "</div>" + (showCall && sel ? callout(s.callout) : "") +
      (s.bottomImage ? '<div class="bottomimg ' + (s.bottomImageAlign === "center" ? "c" : "") + '">' + pic(s.bottomImage) + "</div>" : "") + "</main>" +
      (s.footerCta ? cta("Siguiente", sel ? 'data-next' : "disabled data-next") : "");
  };
  var EXCL = /^(none|not-sure|no)$/;
  R["sp-multi"] = function (s) {
    var sel = A(s.id) || [];
    var opts = s.options.map(function (o) {
      var on = sel.indexOf(o.id) > -1;
      return '<button class="opt multi' + (on ? " on" : "") + '" data-m="' + esc(o.id) + '" aria-checked="' + on + '" role="checkbox">' + (o.photo || o.icon ? pic(o.photo || o.icon, "oi") : "") + "<span>" + esc(o.label) + '</span><i class="ck"></i></button>';
    }).join("");
    var sub = s.subtitle ? md(s.subtitle) + (s.subtitleAccent ? ' <b class="acc">' + esc(s.subtitleAccent) + "</b>" : "") : "";
    return '<main class="pad"><h1>' + md(s.title) + "</h1>" + (sub ? '<p class="sub">' + sub + "</p>" : "") + '<div class="opts">' + opts + "</div></main>" + cta("Siguiente", sel.length ? "data-next" : "disabled data-next");
  };
  R["sp-image-grid"] = function (s) {
    var multi = !!s.multi, sel = A(s.id) || (multi ? [] : null);
    var opts = s.options.map(function (o) {
      var on = multi ? sel.indexOf(o.id) > -1 : sel === o.id;
      return '<button class="tile' + (on ? " on" : "") + '" ' + (multi ? 'data-m="' : 'data-s="') + esc(o.id) + '">' + pic(o.image || o.photo || o.icon, "timg", o.label) + "<span>" + esc(o.label) + "</span></button>";
    }).join("");
    var has = multi ? sel.length : sel;
    return '<main class="pad"><h1>' + md(s.title) + "</h1>" + (s.subtitle ? '<p class="sub">' + md(s.subtitle) + "</p>" : "") + '<div class="tiles">' + opts + "</div>" + (has && s.callout ? callout(s.callout) : "") + "</main>" + cta("Siguiente", has ? "data-next" : "disabled data-next");
  };
  R["sp-info"] = function (s) {
    return '<main class="info">' + (s.image ? '<div class="hero">' + pic(s.image) + "</div>" : "") + '<div class="sheet">' + (s.kicker ? '<p class="kick">' + esc(s.kicker) + "</p>" : "") + "<h1>" + md(s.title) + "</h1>" +
      (s.paragraphs || []).map(function (p) { return "<p>" + md(p) + "</p>"; }).join("") + "</div></main>" + cta(s.ctaLabel || "Continuar", "data-next");
  };
  R["sp-statement"] = function (s) {
    return '<main class="pad"><h2 class="h2">' + md(s.title) + '</h2><div class="stcard">' + pic(s.image, "stimg") + "<p>" + md(s.statement) + '</p></div><div class="yn"><button data-v="no"><i class="x">✕</i>No</button><button data-v="yes"><i class="v">✓</i>Sí</button></div></main>';
  };
  R["sp-chart-info"] = function (s) {
    return '<main class="pad"><h1>' + md(s.title) + "</h1>" + (s.subtitle ? '<p class="sub">' + md(s.subtitle) + "</p>" : "") + pic(s.chartImage, "chart") +
      (s.infoCard ? '<div class="infocard"><b>' + ICON.doc + esc(s.infoCard.bold) + "</b><p>" + md(s.infoCard.text) + "</p></div>" : "") +
      (s.paragraphs || []).map(function (p) { return '<p class="para">' + md(p) + "</p>"; }).join("") + "</main>" + cta(s.ctaLabel || "Continuar", "data-next");
  };
  R["sp-measure"] = function (s) {
    var k = s.kind || (s.id === "height" ? "height" : s.id === "current-weight" ? "weight" : "target");
    var key = k === "height" ? "h" : k === "weight" ? "w" : "g";
    var val = S[key] || "";
    var units = k === "height" ? '<div class="units"><button data-u="cm" class="' + (S.hunit !== "ft" ? "on" : "") + '">cm</button><button data-u="ft" class="' + (S.hunit === "ft" ? "on" : "") + '">pies</button></div>'
      : '<div class="units"><button data-u="kg" class="' + (S.unit !== "lb" ? "on" : "") + '">kg</button><button data-u="lb" class="' + (S.unit === "lb" ? "on" : "") + '">lb</button></div>';
    var input = k === "height" && S.hunit === "ft"
      ? '<div class="measure two"><input id="ft" inputmode="numeric" maxlength="1" placeholder="5" value="' + (S.hft || "") + '"><em>pies</em><input id="in" inputmode="numeric" maxlength="2" placeholder="4" value="' + (S.hin || "") + '"><em>pulg</em></div>'
      : '<div class="measure"><input id="mv" inputmode="decimal" maxlength="5" autocomplete="off" value="' + esc(val) + '"><em>' + (k === "height" ? "cm" : S.unit === "lb" ? "lb" : "kg") + "</em></div>";
    return '<main class="pad"><h1>' + md(s.title) + "</h1>" + (s.subtitle ? '<p class="sub">' + md(s.subtitle) + "</p>" : "") + units + input + '<div id="mnote"></div>' +
      (s.consentHtml ? '<label class="consent"><input type="checkbox" id="consent" checked><span>' + s.consentHtml + "</span></label>" : "") + "</main>" + cta("Siguiente", "disabled data-measure");
  };
  R["sp-processing"] = function (s) {
    var bar = '<div class="pbar"><b id="pb"></b><span id="pt">0%</span></div>';
    if (s.variant === "bar-top") return '<main class="pad proc"><p class="center plab">' + esc(s.label) + ' <i class="spin"></i></p>' + bar + '<div class="curve">' + SVG.prelim() + "</div></main>";
    if (s.variant === "trustpilot") return '<main class="pad proc tp"><h1 class="center">' + esc(s.socialTitle) + '</h1><p class="center"><span class="ver">' + ICON.check + esc(s.verifiedLabel) + "</span></p>" +
      '<div class="review"><div class="stars">★★★★★</div><b>' + esc(s.review.title) + "</b><p>" + esc(s.review.body) + '</p><small>' + esc(s.review.author) + '</small></div><p class="center tpl">' + esc(s.trustpilotLine) + "</p>" + reviewsMini() +
      '<div class="pbottom"><p class="center">' + esc(s.bottomLabel) + "</p>" + bar + "</div></main>";
    return '<main class="pad proc mid">' + pic(s.image, "procimg") + '<h1 class="center">' + esc(s.title) + '</h1><p class="center sub">' + esc(s.text) + '</p><div class="pbottom">' + bar + "</div></main>";
  };
  function reviewsMini() {
    // Franco L 4.1: pantalla de carga con testimonios debajo
    return '<div class="minirev">' + [["Marcela R.", "Guadalajara", "Las rutinas son cortitas y las hago en la sala. Ya noto el abdomen más firme."], ["Ana Paula T.", "Houston", "Por fin algo que sí puedo hacer después del trabajo."]].map(function (r) {
      return '<div><div class="stars">★★★★★</div><p>“' + esc(r[2]) + '”</p><small>' + esc(r[0]) + " · " + esc(r[1]) + "</small></div>";
    }).join("") + "</div>";
  }
  R["sp-checkpoint"] = function (s) {
    var b = bmi() || s.fallbackBmi, cat = bmiCat(b);
    var pin = Math.max(2, Math.min(98, ((b - 15) / 25) * 100));
    var notes = {
      bajo: ["IMC bajo", "Tu plan pondrá el foco en ganar fuerza y tono, sin buscar bajar de peso."],
      normal: [s.bmiNote.title, s.bmiNote.body],
      sobrepeso: ["IMC con sobrepeso", "Buen punto de partida: con rutinas suaves y constantes puedes bajar de peso y tonificar sin lastimarte."],
      alto: ["IMC alto", "Empezaremos con movimientos de bajo impacto en la pared para cuidar tus rodillas y espalda mientras bajas de peso."],
    }[cat];
    var day = A("typical-day"), freq = A("exercise-frequency"), zones = A("target-zones") || [];
    var level = freq === "5+" ? "Avanzado" : freq === "2-4" ? "Intermedio" : "Principiante";
    var life = day === "sitting" ? "Sedentario" : day === "standing" ? "Activo" : "Mayormente activo";
    var zl = zones.map(function (z) { return optLabel("target-zones", z); }).filter(Boolean).slice(0, 3).join(", ") || "Todo el cuerpo";
    var lose = S.w && S.g ? Math.round(kg(S.w) - kg(S.g)) : 0;
    var goal = lose > 0 ? "Bajar " + fmtW(lose) : "Tonificar";
    var facts = [["activity", "Nivel de actividad física", level], ["lifestyle", "Estilo de vida", life], ["target", "Zonas a trabajar", zl], ["goal", "Meta", goal]];
    return '<main class="pad"><p class="center brandline">' + esc(C.BRAND.toUpperCase()) + '</p><h1 class="center">' + esc(s.title) + '</h1><div class="card"><h3>Índice de Masa Corporal (IMC)</h3><div class="bmi"><span class="tip" style="left:' + pin + '%">Tú: ' + b + '</span><div class="scale"><span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span></div><div class="grad"><i style="left:' + pin + '%"></i></div><div class="scale lab"><span>BAJO</span><span>NORMAL</span><span>SOBREPESO</span><span>ALTO</span></div></div>' +
      '<div class="note ' + cat + '"><b>' + (cat === "normal" ? "👍 " : "ℹ️ ") + esc(notes[0]) + "</b><p>" + esc(notes[1]) + '</p></div></div><div class="card facts"><ul>' +
      facts.map(function (f) { return "<li>" + ICON[f[0]] + "<div><small>" + esc(f[1]) + "</small><b>" + esc(f[2]) + "</b></div></li>"; }).join("") + "</ul>" + pic(s.image, "factimg") + "</div></main>" + cta(s.ctaLabel || "Continuar", "data-next");
  };
  R["sp-exercise-rating"] = function (s) {
    return '<main class="pad"><h2 class="h2">' + esc(s.title) + '</h2><div class="excard">' + pic(s.image, "eximg") + "<b>" + esc(s.exerciseLabel) + '</b></div><div class="rate">' +
      ["dislike", "neutral", "like"].map(function (v, k) { return '<button data-v="' + v + '"><span class="emo">' + ["👎", "😑", "👍"][k] + "</span>" + esc(s.labels[k]) + "</button>"; }).join("") + "</div></main>";
  };
  R["sp-plan-details"] = function (s) {
    var inten = A("intensity"), pos = inten === "challenge" ? 83 : inten === "sweat" ? 50 : 17, act = inten === "challenge" ? "INTENSO" : inten === "easy" ? "SUAVE" : s.difficulty.active;
    var place = optLabel("workout-place", A("workout-place")) || "En casa";
    var dur = optLabel("exercise-duration", A("exercise-duration")) || "15 a 25 minutos";
    var fq = A("exercise-frequency"), freq = fq === "5+" ? "5 veces/semana" : fq === "2-4" ? "3 veces/semana" : "2 veces/semana";
    var g = A("goals") || [], focus = g.indexOf("lose-weight") > -1 ? "Bajar de peso" : g.indexOf("tone-body") > -1 ? "Tonificar" : g.indexOf("posture") > -1 ? "Postura" : "Bienestar";
    var per = [["place", "Lugar", place], ["clock", "Duración", dur], ["calendar", "Frecuencia", freq], ["spark", "Enfoque", focus]];
    return '<main class="pad"><p class="center brandline">' + esc(C.BRAND.toUpperCase()) + "</p>" + pic(s.headerImage, "planhero") + '<h1 class="center">' + esc(s.title) + '</h1><h3 class="lab">' + esc(s.difficulty.label) + '</h3><div class="diff"><i class="a"></i><i class="b"></i><i class="c"></i><em style="left:' + pos + '%"></em></div><div class="difflab"><span' + (act === "SUAVE" ? ' class="on"' : "") + ">SUAVE</span><span" + (act === "EQUILIBRADO" ? ' class="on"' : "") + ">EQUILIBRADO</span><span" + (act === "INTENSO" ? ' class="on"' : "") + ">INTENSO</span></div><p>" + md(s.difficulty.note) + '</p><h3 class="lab">' + esc(s.personalizedTitle) + '</h3><div class="pgrid">' +
      per.map(function (p) { return "<div>" + ICON[p[0]] + "<small>" + esc(p[1]) + "</small><b>" + esc(p[2]) + "</b></div>"; }).join("") + "</div></main>" + cta(s.ctaLabel || "Continuar", "data-next");
  };
  R["sp-blockers"] = function (s) {
    var sleep = A("sleep-hours"), habits = A("habits") || [];
    var bars = s.bars.slice();
    var detail = s.detail;
    if (!(sleep === "<5" || sleep === "5-6") && (habits.indexOf("sweets") > -1 || habits.indexOf("snacks") > -1 || habits.indexOf("late-night") > -1)) {
      detail = { emoji: "📕", title: "Comer por emociones", body: "Los antojos de dulce, el picoteo y cenar tarde no son falta de fuerza de voluntad: muchas veces son la forma en que tu cuerpo pide descanso o calma. Tu plan incluye hábitos sencillos para que tengas el control sin dietas estrictas." };
      bars = [bars[1], bars[0], bars[2], bars[3]]; var t = bars[0].percent; bars[0] = Object.assign({}, bars[0], { percent: bars[1].percent }); bars[1] = Object.assign({}, bars[1], { percent: t });
    }
    return '<main class="pad blk"><div class="center bigemo">🚧</div><h1 class="center">' + esc(s.title) + '</h1><p class="center sub">' + md(s.subtitle) + '</p><div class="card"><h3>' + esc(s.cardTitle) + "</h3>" +
      bars.map(function (b) { return '<div class="bbar"><i style="--c:' + b.color + ";--w:" + b.percent + '%"></i><span>' + b.emoji + " " + esc(b.label) + "</span><b>" + b.percent + "%</b></div>"; }).join("") +
      '<p class="cf">' + md(s.cardFooter) + '</p></div><div class="card"><h3>' + detail.emoji + " " + esc(detail.title) + "</h3><p>" + md(detail.body) + "</p></div></main>" + cta(s.ctaLabel || "Continuar", "data-next");
  };
  R["sp-email"] = function (s) {
    return '<main class="pad"><p class="brandline">' + esc(C.BRAND.toUpperCase()) + '</p><p class="pill">' + ICON.check + esc(s.pillLabel) + "</p><h1>" + esc(s.title) + '</h1><label class="field"><small>' + esc(s.inputLabel) + '</small><input id="em" type="email" inputmode="email" autocomplete="email" value="' + esc(S.email || "") + '"></label>' +
      '<button class="btn" id="emgo" disabled>' + esc(s.ctaLabel) + '</button><div class="mapstat"><b>' + esc(s.mapStat.number) + "</b><span>" + esc(s.mapStat.caption) + "</span></div>" +
      (s.disclaimers || []).map(function (d) { return '<p class="legal">' + d + "</p>"; }).join("") + "</main>";
  };
  R["sp-before-after"] = function (s) {
    var b = bmi() || 26, now = b < 25 ? "22-27%" : b < 30 ? "27-32%" : "32-38%";
    var rows = [["Peso", S.w ? fmtW(kg(S.w)) : s.rows[0].now, S.g ? fmtW(kg(S.g)) : s.rows[0].goal], [s.rows[1].label, now, s.rows[1].goal]];
    var str = function (n) { var o = ""; for (var k = 1; k <= 5; k++) o += "<i" + (k <= n ? ' class="on"' : "") + "></i>"; return o; };
    return '<main class="pad"><h1 class="center">' + esc(s.titleLine1) + '<br><span class="acc">' + esc(s.titleAccent) + "</span> " + esc(s.titleRest) + '</h1><div class="ba"><div class="tabs"><span>' + esc(s.nowLabel) + '</span><span class="g">' + esc(s.goalLabel) + "</span></div>" +
      '<div class="baimgs">' + pic("img/ai/checkpoint-body.jpg", "", "Ahora") + '<span class="arrow">›</span>' + pic("img/ai/future-self.jpg", "", "Meta") + '</div><div class="barows">' +
      "<div><b>" + esc(rows[0][0]) + "</b><span>" + esc(rows[0][1]) + "</span><b>" + esc(rows[1][0]) + "</b><span>" + esc(rows[1][1]) + "</span><b>" + esc(s.strength.label) + '</b><div class="str">' + str(s.strength.now) + "</div></div>" +
      "<div><b>Peso meta</b><span>" + esc(rows[0][2]) + "</span><b>" + esc(rows[1][0]) + "</b><span>" + esc(rows[1][2]) + "</span><b>" + esc(s.strength.label) + '</b><div class="str g">' + str(s.strength.goal) + "</div></div></div></div>" +
      '<p class="center foot2">' + md(s.footnote) + "</p></main>" + cta(s.ctaLabel || "Continuar", "data-next");
  };
  R["sp-name"] = function (s) {
    return '<main class="pad"><h1>' + esc(s.title) + '</h1><label class="field"><small>Tu nombre</small><input id="nm" autocomplete="given-name" maxlength="40" value="' + esc(S.name || "") + '"></label></main>' + cta(s.ctaLabel, "disabled data-name");
  };
  function projection(s, small) {
    var gd = goalDate();
    return '<h1 class="center">' + esc(firstName()) + esc(s.titleAfterName) + '<br><span class="acc">' + (S.g ? fmtW(kg(S.g)) : "tu meta") + " para el</span> " + gd.txt + "</h1>" + (small ? "" : '<p class="center sub">' + esc(s.subtitle) + "</p>") + '<div class="proj">' + SVG.projection(gd) + "</div>";
  }
  R["sp-plan-projection"] = function (s) {
    return '<main class="pad">' + projection(s) + '<ul class="bul">' + s.bullets.map(function (b) { return "<li>" + (ICON[b.icon] || ICON.spark) + "<span>" + esc(b.text) + "</span></li>"; }).join("") + "</ul></main>" + cta(s.ctaLabel, "data-next", "green");
  };
  R["sp-welcome"] = function (s) {
    return '<main class="pad welcome"><p class="brandline">' + esc(C.BRAND.toUpperCase()) + '</p><div id="wl" class="wl"></div></main>';
  };
  R["sp-offer"] = function (s) { return window.PILATES_OFFER ? window.PILATES_OFFER(s, { esc: esc, md: md, fill: fill, firstName: firstName, projection: projection, goalDate: goalDate, fmtW: fmtW, kg: kg, S: S, ICON: ICON, SVG: SVG, money: money, bmi: bmi, pic: pic }) : ""; };

  /* ---------- render + eventos ---------- */
  var timers = [];
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function render() {
    clearTimers();
    var s = STEPS[S.i];
    document.body.className = "t-" + s.type.replace("sp-", "") + " s-" + s.id;
    app.innerHTML = header(s) + (R[s.type] ? R[s.type](s) : "<main class='pad'><h1>" + esc(s.title || s.id) + "</h1></main>" + cta("Continuar", "data-next"));
    trackStep(S.i);
    after(s);
  }
  function after(s) {
    var bk = $(".back"); if (bk) bk.onclick = back;
    var nx = $("[data-next]"); if (nx) nx.onclick = function () { if (!nx.disabled) next(); };
    if (s.type === "sp-landing" || s.type === "sp-statement" || s.type === "sp-exercise-rating" || (s.type === "sp-single" && !s.footerCta)) {
      app.querySelectorAll("[data-v]").forEach(function (b) { b.onclick = function () { S.a[s.id] = b.getAttribute("data-v"); save(); b.classList.add("on"); timers.push(setTimeout(next, 280)); }; });
    }
    if (s.type === "sp-single" && s.footerCta) app.querySelectorAll("[data-v]").forEach(function (b) { b.onclick = function () { S.a[s.id] = b.getAttribute("data-v"); save(); render(); }; });
    if (s.type === "sp-multi" || (s.type === "sp-image-grid" && s.multi)) app.querySelectorAll("[data-m]").forEach(function (b) {
      b.onclick = function () {
        var v = b.getAttribute("data-m"), cur = (S.a[s.id] || []).slice(), k = cur.indexOf(v);
        if (k > -1) cur.splice(k, 1); else { if (EXCL.test(v)) cur = []; else cur = cur.filter(function (x) { return !EXCL.test(x); }); cur.push(v); }
        S.a[s.id] = cur; save(); var y = window.scrollY; render(); window.scrollTo(0, y);
      };
    });
    if (s.type === "sp-image-grid" && !s.multi) app.querySelectorAll("[data-s]").forEach(function (b) { b.onclick = function () { S.a[s.id] = b.getAttribute("data-s"); save(); render(); }; });
    if (s.type === "sp-measure") measure(s);
    if (s.type === "sp-processing") processing(s);
    if (s.type === "sp-email") email(s);
    if (s.type === "sp-name") nameStep(s);
    if (s.type === "sp-welcome") welcome(s);
    if (s.type === "sp-offer" && window.PILATES_OFFER_AFTER) window.PILATES_OFFER_AFTER(s, { S: S, beacon: beacon, pixel: pixel, SID: SID, save: save, render: render });
  }
  function measure(s) {
    var k = s.kind || (s.id === "height" ? "height" : s.id === "current-weight" ? "weight" : "target");
    var btn = $("[data-measure]"), note = $("#mnote"), consent = $("#consent");
    app.querySelectorAll("[data-u]").forEach(function (u) {
      u.onclick = function () {
        var v = u.getAttribute("data-u");
        if (k === "height") S.hunit = v;
        else if (v !== S.unit) { var f = v === "lb" ? 2.2046 : 1 / 2.2046; ["w", "g"].forEach(function (x) { if (S[x]) S[x] = Math.round(S[x] * f); }); S.unit = v; }
        save(); render();
      };
    });
    function check() {
      var ok = false, msg = "";
      if (k === "height") {
        if (S.hunit === "ft") { var ft = +$("#ft").value, inch = +$("#in").value || 0; S.hft = ft; S.hin = inch; var cm = Math.round((ft * 12 + inch) * 2.54); ok = ft >= 4 && ft <= 7 && inch < 12; if (ok) S.h = cm; }
        else { var v = +String($("#mv").value).replace(",", "."); ok = v >= 120 && v <= 220; if (ok) S.h = v; else if ($("#mv").value) msg = "Escribe tu estatura en centímetros (entre 120 y 220)."; }
      } else {
        var w = +String($("#mv").value).replace(",", "."), lo = S.unit === "lb" ? 66 : 30, hi = S.unit === "lb" ? 660 : 300;
        ok = w >= lo && w <= hi;
        if (ok) {
          if (k === "weight") { S.w = w; var b = bmi(); if (b) msg = '<div class="card bmicard"><b>' + ICON.scale + "Tu IMC es " + b + ", que se considera " + ({ bajo: "bajo", normal: "normal", sobrepeso: "sobrepeso", alto: "alto" })[bmiCat(b)] + "</b><p>¡Vas muy bien! Usaremos tu IMC para armar un programa personalizado.</p></div>"; }
          else { if (S.w && w >= S.w) { ok = false; msg = '<p class="warn">Tu peso ideal debe ser menor que tu peso de hoy (' + S.w + " " + S.unit + ").</p>"; } else { S.g = w; var lose = Math.round(kg(S.w) - kg(w)); if (lose > 0) msg = '<div class="card bmicard"><b>' + ICON.goal + "Meta: bajar " + fmtW(lose) + "</b><p>Es una meta alcanzable. Te vamos a guiar paso a paso.</p></div>"; } }
        } else if ($("#mv").value) msg = '<p class="warn">Revisa el número (' + (S.unit === "lb" ? "lb" : "kg") + ").</p>";
      }
      if (consent && !consent.checked) ok = false;
      note.innerHTML = msg; btn.disabled = !ok; save();
    }
    app.querySelectorAll("input").forEach(function (i) { i.addEventListener("input", check); i.addEventListener("keydown", function (e) { if (e.key === "Enter" && !btn.disabled) next(); }); });
    btn.onclick = function () { if (!btn.disabled) next(); };
    var f = $("#mv") || $("#ft"); if (f) setTimeout(function () { try { f.focus(); } catch (e) {} }, 150);
    check();
  }
  function processing(s) {
    var dur = s.durationMs || 4600, t0 = Date.now(), pb = $("#pb"), pt = $("#pt");
    (function tick() {
      var p = Math.min(100, Math.round(((Date.now() - t0) / dur) * 100));
      if (pb) pb.style.width = p + "%"; if (pt) pt.textContent = p + "%";
      if (p >= 100) { timers.push(setTimeout(next, 350)); return; }
      timers.push(setTimeout(tick, 60));
    })();
  }
  function email(s) {
    var i = $("#em"), b = $("#emgo");
    var ok = function () { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim()); };
    i.oninput = function () { b.disabled = !ok(); };
    i.onkeydown = function (e) { if (e.key === "Enter" && ok()) b.click(); };
    b.disabled = !ok();
    b.onclick = function () {
      if (!ok()) return;
      S.email = i.value.trim().toLowerCase(); save();
      pixel("Lead");
      if (C.LEAD_URL) { try { fetch(C.LEAD_URL, { method: "POST", mode: "no-cors", keepalive: true, body: JSON.stringify({ offer: C.OFFER, sid: SID, email: S.email, answers: S.a, h: S.h, w: S.w, g: S.g, unit: S.unit, utm: utm() }) }); } catch (e) {} }
      next();
    };
  }
  function nameStep() {
    var i = $("#nm"), b = $("[data-name]");
    var ok = function () { return i.value.trim().length >= 2; };
    i.oninput = function () { b.disabled = !ok(); };
    i.onkeydown = function (e) { if (e.key === "Enter" && ok()) b.click(); };
    b.disabled = !ok();
    b.onclick = function () { if (!ok()) return; S.name = i.value.trim().slice(0, 40); save(); next(); };
    setTimeout(function () { try { i.focus(); } catch (e) {} }, 150);
  }
  function welcome(s) {
    var wl = $("#wl"), k = 0;
    (function show() {
      if (k >= s.screens.length) { next(); return; }
      wl.innerHTML = '<p class="wtxt">' + rich(fill(esc(s.screens[k]))).replace(/\n/g, "<br>") + "</p>";
      k++; timers.push(setTimeout(show, s.screenDurationMs || 1900));
    })();
  }

  /* ---------- iconos y gráficos (SVG propios) ---------- */
  var sv = function (p, v) { return '<svg viewBox="' + (v || "0 0 24 24") + '" aria-hidden="true" class="ic">' + p + "</svg>"; };
  var ICON = {
    back: sv('<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    chev: sv('<path d="M10 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
    check: sv('<path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'),
    doc: sv('<rect x="5" y="3" width="14" height="18" rx="3" fill="#4CAF7A"/><path d="M9 9h6M9 13h6M9 17h4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>'),
    scale: sv('<rect x="3" y="3" width="18" height="18" rx="5" fill="#4CAF7A"/><path d="M8 9a5 5 0 018 0" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M12 9l1.5-2" stroke="#fff" stroke-width="1.6"/>'),
    activity: sv('<path d="M4 12h3l2-5 4 10 2-5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    lifestyle: sv('<circle cx="12" cy="7" r="3.2" fill="currentColor"/><path d="M5.5 20c.8-4 3.4-6 6.5-6s5.7 2 6.5 6z" fill="currentColor"/>'),
    target: sv('<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>'),
    goal: sv('<path d="M12 3c3 4.5 6 7.6 6 11a6 6 0 01-12 0c0-3.4 3-6.5 6-11z" fill="currentColor"/>'),
    place: sv('<path d="M12 21s-6.5-6.2-6.5-11A6.5 6.5 0 0112 3.5 6.5 6.5 0 0118.5 10c0 4.8-6.5 11-6.5 11z" fill="currentColor"/><circle cx="12" cy="10" r="2.3" fill="#fff"/>'),
    clock: sv('<circle cx="12" cy="12" r="8.5" fill="currentColor"/><path d="M12 7.5V12l3 2" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>'),
    calendar: sv('<rect x="3.5" y="5" width="17" height="15" rx="3" fill="currentColor"/><path d="M3.5 10h17" stroke="#fff" stroke-width="1.6"/><path d="M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    spark: sv('<path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z" fill="currentColor"/>'),
    home: sv('<path d="M4 11l8-7 8 7v9h-5v-6h-6v6H4z" fill="currentColor"/>'),
    food: sv('<path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M16 3c-2 0-3 2.5-3 6h3v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    bell: sv('<path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" fill="currentColor"/><path d="M10 20a2 2 0 004 0" fill="currentColor"/>'),
    chat: sv('<path d="M4 5h16v11H9l-5 4z" fill="currentColor"/>'),
    shield: sv('<path d="M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z" fill="currentColor"/><path d="M8.5 12l2.5 2.5 4.5-5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>'),
    lock: sv('<rect x="5" y="10" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 10V7.5a4 4 0 018 0V10" fill="none" stroke="currentColor" stroke-width="2"/>'),
    timer: sv('<circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 9v4l2.5 1.5M10 2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>'),
  };
  ICON.scale_ = ICON.scale;
  var SVG = {
    eligibility: function () {
      return '<svg viewBox="0 0 340 190" class="chartsvg"><defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7C80EA" stop-opacity=".35"/><stop offset="1" stop-color="#7C80EA" stop-opacity="0"/></linearGradient><linearGradient id="gb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5DB37E" stop-opacity=".3"/><stop offset="1" stop-color="#5DB37E" stop-opacity="0"/></linearGradient></defs>' +
        '<path d="M10 30 C40 30 50 40 60 52 C80 70 100 82 130 88 L130 160 L10 160Z" fill="url(#ga)"/><path d="M130 88 C190 105 250 118 330 122 L330 160 L130 160Z" fill="url(#gb)"/>' +
        '<path d="M10 30 C40 30 50 40 60 52 C80 70 100 82 130 88" fill="none" stroke="#7C80EA" stroke-width="3"/><path d="M130 88 C190 105 250 118 330 122" fill="none" stroke="#5DB37E" stroke-width="3"/>' +
        '<line x1="60" y1="52" x2="60" y2="160" stroke="#7C80EA" stroke-dasharray="4 4"/><line x1="130" y1="88" x2="130" y2="160" stroke="#7C80EA" stroke-dasharray="4 4"/><circle cx="60" cy="52" r="7" fill="#7C80EA" stroke="#fff" stroke-width="2"/><circle cx="130" cy="88" r="5" fill="#7C80EA"/>' +
        '<text x="74" y="22" font-size="12" font-weight="700" fill="#23233F">🚀 Primeros resultados</text><text x="280" y="110" font-size="12" font-weight="700" fill="#4CAF7A">Meta</text>' +
        '<text x="10" y="180" font-size="10" fill="#23233F">Semana 1</text><text x="100" y="180" font-size="10" fill="#23233F">Semana 4</text><text x="215" y="180" font-size="10" fill="#23233F">Semana 12</text></svg>';
    },
    energy: function () {
      return '<svg viewBox="0 0 340 150" class="chartsvg"><text x="8" y="16" font-size="11" fill="#555" font-weight="600">Nivel de energía semanal</text><path d="M10 110 C80 110 110 100 150 70 C170 55 175 45 185 45 C200 45 210 80 230 92 C260 108 300 96 330 96" fill="none" stroke="#5DB37E" stroke-width="3"/><circle cx="185" cy="45" r="13" fill="#5DB37E"/><text x="176" y="51" font-size="13">💪</text><text x="150" y="140" font-size="11" fill="#23233F" font-weight="700">Alta intensidad</text></svg>';
    },
    scale: function () {
      return '<svg viewBox="0 0 120 120" class="scalesvg"><rect x="18" y="16" width="84" height="88" rx="18" fill="#7C80EA" transform="rotate(-8 60 60)"/><rect x="38" y="28" width="44" height="26" rx="9" fill="#fff" transform="rotate(-8 60 60)"/><path d="M60 45 l3 -9" stroke="#E04B5A" stroke-width="3" transform="rotate(-8 60 60)"/></svg>';
    },
    moneyback: function () {
      return '<svg viewBox="0 0 120 120" class="badge"><circle cx="60" cy="60" r="54" fill="#2E9E5B"/><circle cx="60" cy="60" r="44" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 4"/><text x="60" y="56" text-anchor="middle" font-size="26" font-weight="800" fill="#fff">' + (C.GUARANTEE_DAYS || 90) + '</text><text x="60" y="74" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">DÍAS DE</text><text x="60" y="88" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">GARANTÍA</text></svg>';
    },
    prelim: function () {
      return '<svg viewBox="0 0 390 200" class="prelim"><defs><linearGradient id="r1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#E9705A" stop-opacity=".3"/><stop offset="1" stop-color="#E9705A" stop-opacity="0"/></linearGradient><linearGradient id="r2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5B60DE" stop-opacity=".3"/><stop offset="1" stop-color="#5B60DE" stop-opacity="0"/></linearGradient></defs><path d="M0 40 C60 40 110 70 158 118 L158 200 L0 200Z" fill="url(#r1)"/><path d="M158 118 C190 135 230 120 390 118 L390 200 L158 200Z" fill="url(#r2)"/><path d="M0 40 C60 40 110 70 158 118" fill="none" stroke="#E9705A" stroke-width="3"/><path d="M158 118 C190 135 230 120 390 118" fill="none" stroke="#5B60DE" stroke-width="3"/><circle cx="158" cy="118" r="8" fill="#E9705A"/><circle cx="238" cy="124" r="7" fill="#5B60DE"/><text x="110" y="92" font-size="13" font-weight="700" fill="#23233F">Peso ideal</text><text x="200" y="160" font-size="12" font-weight="700" fill="#5B60DE">Alumnas del programa</text></svg>';
    },
    projection: function (gd) {
      var now = S.w ? fmtW(kg(S.w)) : "", goal = S.g ? fmtW(kg(S.g)) : "Meta";
      return '<svg viewBox="0 0 340 170" class="chartsvg"><defs><linearGradient id="pj" x1="0" x2="1"><stop offset="0" stop-color="#E9705A"/><stop offset=".5" stop-color="#F2C14E"/><stop offset="1" stop-color="#4CAF7A"/></linearGradient></defs>' +
        [60, 120, 180, 240, 300].map(function (x) { return '<line x1="' + x + '" y1="10" x2="' + x + '" y2="135" stroke="#E4E3EC"/>'; }).join("") +
        '<path d="M20 30 C110 40 160 100 320 115" fill="none" stroke="url(#pj)" stroke-width="5" stroke-linecap="round"/><circle cx="20" cy="30" r="7" fill="#E9705A"/><circle cx="320" cy="115" r="8" fill="#4CAF7A"/>' +
        '<rect x="18" y="4" width="64" height="20" rx="10" fill="#23233F"/><text x="50" y="18" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">' + esc(now) + '</text><rect x="252" y="82" width="70" height="22" rx="11" fill="#4CAF7A"/><text x="287" y="97" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">' + esc(goal) + "</text>" +
        '<text x="12" y="158" font-size="11" fill="#8A8AA0">HOY</text><text x="300" y="158" font-size="11" fill="#8A8AA0">' + gd.mon + "</text></svg>";
    },
  };
  window.PILATES_ICON = ICON; window.PILATES_SVG = SVG;

  render();
})();
