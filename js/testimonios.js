function applyClampByViewport(p) {
  const baseLines = parseInt(p.dataset.lines || 3, 10);
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const lines = isMobile ? baseLines * 2 : baseLines;

  p.style.setProperty("--lines", lines);
}

// script.js (Corregido)
document.addEventListener('DOMContentLoaded', () => {
    const carouselElement = document.getElementById('circular-carousel');
    if (!carouselElement) return;

    const container = carouselElement.querySelector('.carousel_container');
    const prevButton = carouselElement.querySelector('.carousel_button--prev');
    const nextButton = carouselElement.querySelector('.carousel_button--next');
    let items = Array.from(carouselElement.querySelectorAll('.carousel_item'));
    
    const totalItems = items.length;
    let currentIndex = 0;
    let intervalId = null;
    let isPausedByHover = false; // Nueva variable para controlar la pausa por hover
    let isManualMove = false; // Nueva variable para controlar movimientos manuales
    
    // --- Configuración Responsiva ---
    const getVisibleCards = () => window.innerWidth > 1200 ? 3 : 1;
    let visibleCards = getVisibleCards();

    // 1. Inicialización del Carrusel y Clonación (Sin cambios)
    const initializeCarousel = () => {
        container.innerHTML = '';
        items.forEach(item => container.appendChild(item));
        items = Array.from(carouselElement.querySelectorAll('.carousel_item'));

        visibleCards = getVisibleCards();
        
        const cloneCount = visibleCards === 3 ? 3 : 1; 

        // Clonar elementos del final y colocarlos al principio (buffer para ir hacia atrás)
        for (let i = 0; i < cloneCount; i++) {
            const itemToClone = items[totalItems - 1 - i];
            const clone = itemToClone.cloneNode(true);
            clone.classList.add('carousel_item--clone-start');
            container.prepend(clone);
        }

        // Clonar elementos del principio y colocarlos al final (buffer para ir hacia adelante)
        for (let i = 0; i < cloneCount; i++) {
            const itemToClone = items[i];
            const clone = itemToClone.cloneNode(true);
            clone.classList.add('carousel_item--clone-end');
            container.appendChild(clone);
        }

        items = Array.from(carouselElement.querySelectorAll('.carousel_item'));
        
        setCardWidths();
        
        currentIndex = cloneCount; 
        updateCarouselPosition(false); 
    };

    // NUEVA FUNCION

    const updateActiveState = () => {
    // Calcular el índice del nuevo elemento activo
    const activeIndex = visibleCards === 3 ? currentIndex + 1 : currentIndex;

    // 1. Iterar sobre todos los ítems para limpiar clases y gestionar el cierre
    items.forEach((item, index) => {
        // Guardamos si la tarjeta estaba activa antes de limpiar las clases
        const wasActive = item.classList.contains('is-active');

        // Limpieza de clases de enfoque
        item.classList.remove('is-active', 'is-adjacent');

        // ----------------------------------------------------
        // LÓGICA DE CIERRE AUTOMÁTICO
        // ----------------------------------------------------
        // Si estaba activo (true) Y NO es el nuevo elemento activo (es decir, acaba de salir del centro)
        if (wasActive && index !== activeIndex) {
            // Buscamos los elementos del clamp dentro de la tarjeta
            const p = item.querySelector(".clampado");
            const btn = item.querySelector(".btn-vermas");
            
            if (p && btn) {
                const lines = p.dataset.lines || 3;

                // 1. Eliminar la clase de expansión
                p.classList.remove("expanded");
                            
                // 2. Volver a estado cerrado respetando viewport
                p.style.display = "-webkit-box";
                applyClampByViewport(p);
                            
                // 3. Resetear el texto del botón
                btn.textContent = "Ver más";
            }
        }
    });

    // 1. Limpiar clases de todos los elementos
    items.forEach(item => {
        item.classList.remove('is-active', 'is-adjacent');
    });

    // La lógica de enfoque solo se aplica en desktop (donde visibleCards === 3)
    if (visibleCards === 3) {
        // En vista desktop, la tarjeta central es la que tiene el índice: currentIndex + 1
        const activeIndex = currentIndex + 1;
        
        // Aplicar la clase 'is-active' a la tarjeta central
        if (items[activeIndex]) {
            items[activeIndex].classList.add('is-active');
        }
        
        // Opcional: Si deseas que las tarjetas a los lados tengan una clase diferente 
        // a las que están fuera del viewport, puedes usar 'is-adjacent'
        // Tarjeta izquierda (la que está en el índice de inicio del viewport)
        if (items[currentIndex]) {
            items[currentIndex].classList.add('is-adjacent');
        }
        // Tarjeta derecha
        if (items[currentIndex + 2]) {
            items[currentIndex + 2].classList.add('is-adjacent');
        }
    } else {
        // Modo Mobile (visibleCards === 1): La tarjeta actual es siempre la activa
        if (items[currentIndex]) {
            items[currentIndex].classList.add('is-active');
        }
    }
};

    // 2. Ajuste de Anchos y Responsividad (Sin cambios)
    const setCardWidths = () => {
        const gap = parseFloat(getComputedStyle(carouselElement).getPropertyValue('--card-gap'));
        let cardWidth;
        
        if (visibleCards === 3) {
            cardWidth = (carouselElement.querySelector('.carousel_viewport').clientWidth - (2 * gap)) / 3;
        } else {
            cardWidth = carouselElement.querySelector('.carousel_viewport').clientWidth;
        }

        items.forEach(item => {
            item.style.width = `${cardWidth}px`;
            if (visibleCards === 3) {
                item.style.marginRight = `${gap}px`;
            } else {
                 item.style.marginRight = `0px`;
            }
        });

        const containerWidth = items.length * (cardWidth + (visibleCards === 3 ? gap : 0));
        container.style.width = `${containerWidth}px`;
    };

    // 3. Función de Desplazamiento (Core) (Sin cambios funcionales)
    const updateCarouselPosition = (animated = true) => {
        const itemWidth = items[0].getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(carouselElement).getPropertyValue('--card-gap'));
        
        const translateX = -currentIndex * (itemWidth + (visibleCards === 3 ? gap : 0));
        
        container.style.transition = animated ? `transform var(--transition-duration) ease-in-out` : 'none';
        container.style.transform = `translateX(${translateX}px)`;
        updateActiveState();
        
        if (animated) {
            container.addEventListener('transitionend', handleLoopJump, { once: true });
        }
        
    };

    // 4. Manejo del Loop (Salto invisible) (Sin cambios)
    const handleLoopJump = () => {
    const cloneCount = visibleCards === 3 ? 3 : 1;
    let jumped = false;
    
    if (currentIndex < cloneCount - 1) {
        currentIndex = totalItems + currentIndex; 
        jumped = true;
    } 
    else if (currentIndex >= totalItems + cloneCount) {
        // Corrección: Saltamos de nuevo al índice de la tarjeta original.
        // Ejemplo: Si totalItems=7, cloneCount=3. currentIndex=10. Salta a 10-7=3. (Correcto)
        currentIndex = currentIndex - totalItems; 
        jumped = true;
    }
    
    // Aplicar el salto (sin transición)
    if (jumped) {
        updateCarouselPosition(false); 
    } else {
        updateActiveState(); 
    }
};
    
    // 5. Controles Manuales
    const moveTo = (direction) => {
        isManualMove = true; // Establecer que el movimiento es manual
        
        // PAUSAR el autoplay si el movimiento es manual
        pauseAutoplay();

        if (direction === 'next') {
            currentIndex++;
        } else if (direction === 'prev') {
            currentIndex--;
        }
        
        updateCarouselPosition();

        // Tras el movimiento manual, si no hay hover, reanudar
        // Esto asegura que el ciclo se mantenga.
        if (!isPausedByHover && carouselElement.classList.contains('is-visible')) {
            // Un pequeño retraso para permitir la transición visual
            setTimeout(() => {
                startAutoplay();
                isManualMove = false;
            }, 50); 
        } else {
            isManualMove = false;
        }
    };

    nextButton.addEventListener('click', () => moveTo('next'));
    prevButton.addEventListener('click', () => moveTo('prev'));


    // 6. Autoplay y Hover
    const startAutoplay = () => {
        // Solo inicia si NO hay un intervalo activo Y NO está pausado por hover
        if (!intervalId && !isPausedByHover) { 
            intervalId = setInterval(() => {
                // Al mover automáticamente, no pasa por moveTo para evitar la pausa/reanudación
                currentIndex++;
                updateCarouselPosition();
            }, 5000); // 5 segundos
        }
    };

    const pauseAutoplay = () => {
        clearInterval(intervalId);
        intervalId = null;
    };
    
    // Pausa al hacer hover
    carouselElement.addEventListener('mouseenter', () => {
        isPausedByHover = true; // Establece la bandera de pausa por hover
        pauseAutoplay();
    });

    // Retoma al quitar el hover
    carouselElement.addEventListener('mouseleave', () => {
        isPausedByHover = false; // Quita la bandera de pausa
        // Solo retoma si el carrusel está visible
        if (carouselElement.classList.contains('is-visible')) {
            startAutoplay();
        }
    });

    // 7. Activación por Viewport (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Al hacerse visible, siempre inicia el autoplay (a menos que haya hover)
                startAutoplay(); 
            } else {
                entry.target.classList.remove('is-visible');
                pauseAutoplay();
            }
        });
    }, { threshold: 0.1 }); 

    observer.observe(carouselElement);

    // 8. Manejo de Redimensionamiento (Sin cambios)
    window.addEventListener('resize', () => {
        if (getVisibleCards() !== visibleCards) {
            initializeCarousel();
        } else {
            setCardWidths();
            updateCarouselPosition(false); 
        }
    });

    // 9. Manejo de Touch/Swipe (Básico) - Se modifica para usar isPausedByHover
    let startX = 0;
    
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        pauseAutoplay(); // Pausar al inicio del toque
    });

    container.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const diffX = endX - startX;

        if (Math.abs(diffX) > 50) {
            if (diffX < 0) {
                moveTo('next');
            } else {
                moveTo('prev');
            }
        }
        
        // Reanudar si no estaba pausado por hover
        if (!isPausedByHover && carouselElement.classList.contains('is-visible')) {
            startAutoplay();
        }
    });

    // Ejecutar la inicialización
    initializeCarousel();
    updateActiveState();

    window.addEventListener("resize", () => {
        document.querySelectorAll(".clampado").forEach(applyClampByViewport);
    });

});

