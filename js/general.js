// SMART SNAP SCROLLING ENTRE HERO Y SECCIÓN SIGUIENTE //
const heroHeight = window.innerHeight;
const umbral = 60;               // zona de activación
let saltando = false;
let ultimoScroll = 0;
let cooldown = false;
let menuAbierto = false;

// Anti-ruido: evita que múltiples ruedas activen comportamiento raro
function esScrollValido(delta) {
  // Filtra deltas muy pequeños (movimientos suaves o scroll “accidental”)
  return Math.abs(delta) > 20;
}

function smartSnap(e) {
  const dir = e.deltaY;
  const scrollY = window.scrollY;

  // SI EL MENÚ ESTÁ ABIERTO → BLOQUEAR COMPLETAMENTE ESTE CÓDIGO
  if (menuAbierto) {
    e.preventDefault();
    return;
  }
  // Bloquear scroll mientras saltamos
  if (saltando) {
    e.preventDefault();
    return;
  }

  // Evitar spam: bloquea activación varias veces seguidas
  if (cooldown) return;

  // Filtrar scroll accidental
  if (!esScrollValido(dir)) {
    e.preventDefault();
    return;
  }

  // -------------------------------
  // 1) SNAP BAJANDO DESDE EL HERO
  // -------------------------------
  if (scrollY < heroHeight - umbral) {
    if (dir > 0) {
      e.preventDefault();
      saltarA(heroHeight);
    }
  }

  // -------------------------------------------
  // 2) SNAP SUBIENDO DESDE LA SECCIÓN SIGUIENTE
  // -------------------------------------------
  if (scrollY >= heroHeight - umbral && scrollY <= heroHeight + umbral) {
    if (dir < 0) {
      e.preventDefault();
      saltarA(0);
    }
  }
}

function saltarA(pos) {
  saltando = true;
  cooldown = true;

  window.scrollTo({ top: pos, behavior: "smooth" });

  // Duración del bloqueo → ajustá si querés
  setTimeout(() => {
    saltando = false;
  }, 550);

  // Cooldown para evitar activaciones dobles
  setTimeout(() => {
    cooldown = false;
  }, 650);
}

window.addEventListener("wheel", smartSnap, { passive: false });

// Cierre del menú móvil al hacer click en un enlace //
document.querySelectorAll('.nav_mobile a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('toggle_nav').checked = false;
  });
});

