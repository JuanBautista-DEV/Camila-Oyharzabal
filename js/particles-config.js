// Esperamos a que cargue el DOM y el script (usamos defer en el tag <script> del CDN)
    window.addEventListener('load', () => {
      // Verificamos que tsParticles esté disponible
      if (typeof tsParticles === "undefined") {
        console.error("tsParticles no se cargó. Revisa la URL del CDN o la política CSP.");
        return;
      }

      tsParticles.load("tsparticles", {
        fullScreen: { enable: false },
        fpsLimit: 60,
        detectRetina: true,
        particles: {
          number: { value: 40, limit:130, density: { enable: true, area: 1000 } },
          color: { value: "#f40606" }, // Color de la bolita //
          shape: { type: "circle" },
          opacity: { value: .8 },
          size: { value: { min: 2, max: 8 } },
          links: {
            enable: true,
            distance: 140,
            color: "#f40606", // Color de las líneas //
            opacity: 0.35,
            width: 1
          }, // Velocidad de las partículas al moverse //
          move: {
            enable: true,
            speed: 3,
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "bounce" }
          },
          collisions: { enable: true } // permite "pegarse/despegarse"
        },
        interactivity: {
          detectsOn: "canvas",
          events: {
            onHover: { enable: true, mode: "repulse" },
            onClick: { enable: true, mode: "push" },
            resize: true
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { quantity: 10 }
          }
        },
        /* si querés limitar el frame-rate para ahorrar CPU */
        // fpsLimit: 30,
      }).then((container) => {
        console.log("tsParticles cargado: ", container);

          // 👉 Pausar / reanudar según visibilidad del hero
        const heroSection = document.querySelector("#hero");
        if (!heroSection) return;

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              container.play();   // visible → animar
            } else {
              container.pause();  // fuera de vista → pausar
            }
          });
        }, { threshold: 0.2 }); // pausa cuando queda menos del 20% visible

        observer.observe(heroSection);

      }).catch((err) => {
        console.error("Error inicializando tsParticles:", err);
      });
    });