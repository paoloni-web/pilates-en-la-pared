/* Páginas después del pago: saludo con el nombre del quiz, botones one-click de KashPay y enlace a la app con las respuestas. */
(function () {
  var C = window.PILATES_CONFIG || {}, kind = document.currentScript.getAttribute("data-kind");
  var S = null; try { S = JSON.parse(sessionStorage.getItem("pil_state")); } catch (e) {}
  var nm = S && S.name ? String(S.name).split(" ")[0] : "";
  var hi = document.getElementById("hi");
  if (nm && kind === "upsell") hi.textContent = "Espera, " + nm + ". Antes de entrar a tu app…";
  if (nm && kind === "gracias") hi.textContent = nm + ", tu plan de Pilates en la Pared personalizado está listo";
  var kp = document.getElementById("kp");
  if (kp) {
    var tok = kind === "upsell" ? C.KP_UPSELL : C.KP_DOWNSELL, alt = kind === "upsell" ? C.UPSELL_URL : C.DOWNSELL_URL;
    var yes = kind === "upsell" ? "Sí, agrégalo a mi app" : "Sí, quiero solo las rutinas";
    var no = kind === "upsell" ? "No, gracias, me quedo solo con los 28 días" : "No, gracias";
    if (tok) kp.innerHTML = '<button type="button" class="kpbtn kpyes" onclick="acceptUpsell(\'' + tok + '\')">' + yes + '</button><button type="button" class="kpbtn kpno" onclick="declineUpsell(\'' + tok + '\')">' + no + "</button>";
    else kp.innerHTML = '<a class="btn green" href="' + alt + '">' + yes + '</a><a class="kpbtn kpno" style="display:block;text-align:center" href="' + (kind === "upsell" ? "downsell.html" : "gracias.html") + '">' + no + "</a>";
  }
  var go = document.getElementById("go");
  if (go) {
    var base = (C.APP_URL || "").replace(/\/$/, ""), hash = "#/bienvenida";
    if (S) {
      var lv = S.a && S.a.intensity === "challenge" ? "intenso" : S.a && S.a.intensity === "easy" ? "suave" : "equilibrado";
      var p = { name: S.name || "", w: S.w || "", g: S.g || "", unit: S.unit || "kg", level: lv };
      try { hash += "?p=" + encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(p))))); } catch (e) {}
    }
    var q = new URLSearchParams(location.search), em = q.get("email") || q.get("customer_email") || (S && S.email) || "";
    go.href = base + "/" + (em ? "?email=" + encodeURIComponent(em) : "") + hash;
  }
})();
