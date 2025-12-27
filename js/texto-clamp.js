function applyClampByViewport(p) {
  const baseLines = parseInt(p.dataset.lines || 4, 10);
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const lines = isMobile ? baseLines * 2 : baseLines;

  p.style.setProperty("--lines", lines);
}

// === TEXT CLAMP ===
// === TEXT CLAMP (FIXED) ===
document.querySelectorAll(".texto-clamp").forEach(box => {
  const p = box.querySelector(".clampado");
  const btn = box.querySelector(".btn-vermas");

  if (!p || !btn) return;

  // Estado inicial
  p.classList.remove("expanded");
  applyClampByViewport(p);
  btn.textContent = "Ver más";

  btn.addEventListener("click", () => {
    const isExpanded = p.classList.toggle("expanded");
    btn.textContent = isExpanded ? "Ver menos" : "Ver más";
  });
});