const timelinesCards = document.querySelectorAll('.timeline_card');

timelinesCards.forEach(card => {
    const titleContainer = card.querySelector('.timeline_title');
    const timeline = card.querySelector('.timeline');
    const textBlock = card.querySelector('.timeline_card_text');
    const containers = [...timeline.querySelectorAll('.timeline_container')];

    if (titleContainer && timeline && textBlock) {

        titleContainer.style.cursor = 'pointer';

        titleContainer.addEventListener('click', () => {

            const isOpen = timeline.classList.contains('active');

            // 1️⃣ Cerrar todos los demás (limpio)
            timelinesCards.forEach(otherCard => {
                if (otherCard !== card) {
                    const otherTimeline = otherCard.querySelector('.timeline');
                    const otherText = otherCard.querySelector('.timeline_card_text');
                    const otherContainers = [...otherTimeline.querySelectorAll('.timeline_container')];

                    if (otherTimeline.classList.contains('active') || otherTimeline.classList.contains('animating')) {

                        // quitar animación del ::after y forzar reflow
                        otherTimeline.classList.remove('animating');
                        otherTimeline.style.animation = 'none';
                        void otherTimeline.offsetHeight;

                        // quitar estado visible de items
                        otherContainers.forEach(c => c.classList.remove('visible'));

                        // quitar active y poner closing para cualquier lógica que uses
                        otherTimeline.classList.remove('active');
                        otherTimeline.classList.add('closing');
                        otherText.classList.remove('active');

                        const onAnimEnd = e => {
                            // si tenés animaciones CSS en moveright en closing:
                            if (e.animationName === 'moveright') {
                                otherTimeline.classList.remove('closing');
                                otherTimeline.removeEventListener('animationend', onAnimEnd);
                            } else {
                                // por si no llega moveright, igualmente limpiamos
                                otherTimeline.classList.remove('closing');
                                otherTimeline.removeEventListener('animationend', onAnimEnd);
                            }
                        };
                        otherTimeline.addEventListener('animationend', onAnimEnd);

                        // Si no llega ningún animationend (por seguridad), limpiamos a los 350ms
                        setTimeout(() => otherTimeline.classList.remove('closing'), 350);
                    }
                }
            });

            // 2️⃣ Toggle del actual
            if (isOpen) {
                // CERRAR actual
                //  - quitar animación de línea
                timeline.classList.remove('animating');
                timeline.style.animation = 'none';
                void timeline.offsetHeight;

                //  - quitar visibles de items
                containers.forEach(c => c.classList.remove('visible'));

                //  - quitar active y poner closing
                timeline.classList.remove('active');
                timeline.classList.add('closing');

                textBlock.classList.remove('active');

                const onAnimEnd = e => {
                    if (e.animationName === 'moveright') {
                        timeline.classList.remove('closing');
                        timeline.removeEventListener('animationend', onAnimEnd);
                    } else {
                        timeline.classList.remove('closing');
                        timeline.removeEventListener('animationend', onAnimEnd);
                    }
                };
                timeline.addEventListener('animationend', onAnimEnd);

                // fallback cleanup
                setTimeout(() => timeline.classList.remove('closing'), 350);

            } else {
                // ABRIR actual
                // Limpio cualquier rastro previo
                timeline.classList.remove('closing');
                timeline.classList.remove('animating');
                timeline.style.animation = 'none';
                containers.forEach(c => c.classList.remove('visible'));
                void timeline.offsetHeight; // reflow forzado

                // Pongo activo
                timeline.classList.add('active');

                // arranco la animación de la línea de forma controlada
                // (añado 'animating' después de un frame para asegurar start limpio)
                requestAnimationFrame(() => {
                    timeline.classList.add('animating');
                });

                // muestro el texto de la card
                textBlock.classList.add('active');

                // Observador interno simple: cuando la animación de la línea empiece a progresar,
                // el otro bloque (checkReveal) que ya tenías se encargará de revelar containers.
                // Si preferís, también podés hacer un timeout para empezar a revelar:
                // setTimeout(() => startRevealFor(timeline), 60);
            }
        });
    }
});


// ======= MANTENGO TU RASTREO (adaptado) =======

document.querySelectorAll(".timeline").forEach(timeline => {

    const containers = [...timeline.querySelectorAll(".timeline_container")];

    // limpiar visibles cuando se desactiva active (por si quedó algo)
    const observer = new MutationObserver(() => {
        if (timeline.classList.contains("active")) {
            containers.forEach(c => c.classList.remove("visible"));
            // arrancamos chequeo en el siguiente frame
            requestAnimationFrame(() => checkReveal());
        } else {
            // si se cerró, aseguramos quitar visibles
            containers.forEach(c => c.classList.remove("visible"));
        }
    });

    observer.observe(timeline, { attributes: true, attributeFilter: ['class'] });

    function checkReveal() {
        // Leemos ancho actual de la línea correctamente
        // getComputedStyle(timeline, '::after').width devuelve px en la mayoría de navegadores
        const lineWidthStr = getComputedStyle(timeline, '::after').width;
        const lineWidth = parseFloat(lineWidthStr) || 0;

        containers.forEach(container => {
            const x = container.offsetLeft + (container.offsetWidth / 2) - 60; // centro del item
            if (x <= lineWidth) {
                container.classList.add("visible");
            }
        });

        const allDone = containers.every(c => c.classList.contains("visible"));
        if (!allDone && timeline.classList.contains("active")) {
            requestAnimationFrame(checkReveal);
        }
    }
});