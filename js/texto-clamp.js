// === TEXT CLAMP ===
document.querySelectorAll(".texto-clamp").forEach(box => {
    const p = box.querySelector(".clampado");
    const btn = box.querySelector(".btn-vermas");
    const lines = p ? (p.dataset.lines || 3) : 3;

    if (!p || !btn) return;

    // Estado inicial
    p.style.display = "-webkit-box";
    p.style.webkitLineClamp = lines;
    p.classList.remove("expanded");
    btn.textContent = "Ver más";

    btn.addEventListener("click", () => {
        const isExpanded = p.classList.toggle("expanded");

        if (isExpanded) {
            // Mostrar todo
            p.style.webkitLineClamp = "unset";
            p.style.display = "block";
            btn.textContent = "Ver menos";
        } else {
            // Volver a clamped
            p.style.display = "-webkit-box";
            p.style.webkitLineClamp = lines;
            btn.textContent = "Ver más";
        }
    });
});