// script.js (Corregido)
// script.js (Carrusel de Contribuciones - Modificado)

document.addEventListener('DOMContentLoaded', () => {
    const sliderElement = document.getElementById('contribuciones_slider');
    if (!sliderElement) return;

    const container = sliderElement.querySelector('.slider_container');
    const prevButton = sliderElement.querySelector('.slider_button-prev');
    const nextButton = sliderElement.querySelector('.slider_button-next');
    // Inicialmente, solo ítems originales
    let originalItems = Array.from(sliderElement.querySelectorAll('.slider_item'));
    
    const totalItems = originalItems.length; // Número de ítems reales
    let items = []; // Almacenará ítems + clones
    
    let currentIndex = 0;
    let intervalId = null;
    let isPausedByHover = false; 
    let isManualMove = false; 
    
    // --- Configuración Responsiva ---
    // ¡CORRECCIÓN! visibleCards = 4 en desktop
    const getVisibleCards = () => window.innerWidth > 768 ? 4 : 1;
    let visibleCards = getVisibleCards();

    // 1. Inicialización del Slider y Clonación
    const initializeSlider = () => {
        
        // 1a. Limpiar y reinsertar ítems originales
        container.innerHTML = '';
        originalItems.forEach(item => container.appendChild(item));
        
        visibleCards = getVisibleCards();
        // Clones necesarios: 4 en desktop, 1 en mobile
        const cloneCount = visibleCards === 4 ? 4 : 1; 

        // 1b. Clonar del final al principio (Buffer izquierdo)
        for (let i = 0; i < cloneCount; i++) {
            const itemToClone = originalItems[totalItems - 1 - i];
            const clone = itemToClone.cloneNode(true);
            clone.classList.add('slider_item--clone-start');
            container.prepend(clone);
        }

        // 1c. Clonar del principio al final (Buffer derecho)
        for (let i = 0; i < cloneCount; i++) {
            const itemToClone = originalItems[i];
            const clone = itemToClone.cloneNode(true);
            clone.classList.add('slider_item--clone-end');
            container.appendChild(clone);
        }

        // 1d. Obtener la lista completa (originales + clones)
        items = Array.from(container.querySelectorAll('.slider_item'));
        
        setCardWidths();
        
        // 1e. Posición Inicial: Primer ítem REAL. (Índice 4 en desktop, 1 en mobile)
        currentIndex = cloneCount; 
        
        // CORRECCIÓN: Si el modo es 4, el índice inicial debe ser el 4 para centrar la vista en el primer set de originales.
        if (visibleCards === 4) {
             // La posición de inicio ya es 'cloneCount'.
             // Para un carrusel de flujo continuo (4 visibles), empezamos en el índice 'cloneCount'
             currentIndex = cloneCount; 
        } else {
            // Mobile (1 visible), empezamos en el índice '1c' para que el primer original esté a 1 clic.
            // Para mobile, mantenemos la lógica de empezar en cloneCount (1)
            currentIndex = cloneCount;
        }

        updateSliderPosition(false); 
    };

    // 2. Función updateActiveState (Adaptado para 4 visibles)
    const updateActiveState = () => {
        
        // 1. Limpiar clases de todos los elementos
        items.forEach(item => {
            item.classList.remove('is-active', 'is-adjacent');
        });

        const activeIndex = currentIndex; // El primer elemento visible es el activo/foco
        const cloneCount = visibleCards === 4 ? 4 : 1;
        
        if (visibleCards === 4) {
            // En flujo continuo, la tarjeta 'activa' (foco) puede ser el primer elemento visible.
            // Aplicamos 'is-active' a todos los 4 elementos visibles para tener la misma opacidad/escala
            for (let i = 0; i < 4; i++) {
                if (items[currentIndex + i]) {
                    items[currentIndex + i].classList.add('is-active');
                }
            }
            
            // Si quieres aplicar 'is-adjacent' a los que están saliendo/entrando, 
            // no lo haremos en este diseño de 4 visibles, ya que todos deberían tener el mismo estilo.
            // Si quieres que el primero sea el 'más activo':
            if (items[currentIndex]) {
                 items[currentIndex].classList.add('is-active'); // Foco primario
            }
            // Los siguientes 3 elementos dentro del viewport son adyacentes
            for (let i = 1; i < 4; i++) {
                if (items[currentIndex + i]) {
                    items[currentIndex + i].classList.add('is-adjacent');
                }
            }

        } else {
            // Modo Mobile (1 visible): La tarjeta actual es siempre la activa
            if (items[currentIndex]) {
                items[currentIndex].classList.add('is-active');
            }
        }
    };

    // 2. Ajuste de Anchos y Responsividad 
    const setCardWidths = () => {
        const gap = parseFloat(getComputedStyle(sliderElement).getPropertyValue('--contribuciones-card-gap'));
        const viewport = sliderElement.querySelector('.slider_viewport');
        let cardWidth;
        
        if (visibleCards === 4) {
            // CORRECCIÓN: Se usa 3*gap porque hay 4 tarjetas, lo que implica 3 espacios entre ellas.
            // (Viewport - 3*gap) / 4 tarjetas
            cardWidth = (viewport.clientWidth - (3 * gap)) / 4;
        } else {
            cardWidth = viewport.clientWidth;
        }

        items.forEach(item => {
            item.style.width = `${cardWidth}px`;
            // Aplicar el gap solo si es desktop (4 tarjetas visibles)
            // Se aplica el gap al marginRight de cada item (excepto el último en el viewport).
            item.style.marginRight = visibleCards === 4 ? `${gap}px` : `0px`;
        });

        // NOTA: Para que el cálculo del ancho del contenedor sea exacto, 
        // multiplicamos el número total de items por (ancho + gap)
        const containerWidth = items.length * (cardWidth + (visibleCards === 4 ? gap : 0));
        container.style.width = `${containerWidth}px`;
    };

    // 3. Función de Desplazamiento (Core)
    const updateSliderPosition = (animated = true) => {
        // Obtenemos el ancho del primer ítem (incluye padding y borde)
        const itemWidth = items[0].getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(sliderElement).getPropertyValue('--contribuciones-card-gap'));
        
        // CORRECCIÓN: El cálculo de translateX DEBE ser itemWidth + gap (si aplica)
        const translateX = -currentIndex * (itemWidth + (visibleCards === 4 ? gap : 0));
        
        container.style.transition = animated ? `transform var(--transition-duration) ease-in-out` : 'none';
        container.style.transform = `translateX(${translateX}px)`;
        updateActiveState();
        
        if (animated) {
            container.addEventListener('transitionend', handleLoopJump, { once: true });
        }
    };

    // 4. Manejo del Loop (Salto invisible) - ¡CORRECCIÓN CLAVE AQUÍ!
    const handleLoopJump = () => {
        const cloneCount = visibleCards === 4 ? 4 : 1;
        let jumped = false;
        
        // ----------------------------------------------------------------
        // Lógica de Retroceso (De Clones Iniciales -> Originales Finales)
        // El salto debe ocurrir cuando el currentIndex está en la posición del primer clon o anterior.
        // Si currentIndex < cloneCount, salta al final de los originales.
        if (currentIndex < cloneCount) {
            // Ejemplo: currentIndex=3 (último clon). Salta a totalItems + 3
            currentIndex = totalItems + currentIndex; 
            jumped = true;
        } 
        
        // ----------------------------------------------------------------
        // Lógica de Avance (De Clones Finales -> Originales Iniciales)
        // El salto debe ocurrir cuando el currentIndex alcanza el primer clon final.
        // El primer clon final está en totalItems + cloneCount
        else if (currentIndex >= totalItems + cloneCount) {
            // Ejemplo: currentIndex=totalItems+4. Salta a totalItems+4 - totalItems = 4 (el primer original)
            currentIndex = currentIndex - totalItems; 
            jumped = true;
        }
        
        if (jumped) {
            updateSliderPosition(false); 
        } else {
            updateActiveState(); 
        }
    };
    
    // ... (El resto del código de Controles Manuales, Autoplay, Resize, Touch/Swipe sin cambios) ...

    const moveTo = (direction) => {
        isManualMove = true; 
        pauseAutoplay();

        if (direction === 'next') {
            currentIndex++;
        } else if (direction === 'prev') {
            currentIndex--;
        }
        
        updateSliderPosition();

        if (!isPausedByHover && sliderElement.classList.contains('is-visible')) {
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

    const startAutoplay = () => {
        if (!intervalId && !isPausedByHover) { 
            intervalId = setInterval(() => {
                currentIndex++;
                updateSliderPosition();
            }, 5000); 
        }
    };

    const pauseAutoplay = () => {
        clearInterval(intervalId);
        intervalId = null;
    };
    
    // Pausa al hacer hover
    sliderElement.addEventListener('mouseenter', () => {
        isPausedByHover = true; 
        pauseAutoplay();
    });

    // Retoma al quitar el hover
    sliderElement.addEventListener('mouseleave', () => {
        isPausedByHover = false; 
        if (sliderElement.classList.contains('is-visible')) {
            startAutoplay();
        }
    });

    // Activación por Viewport (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                startAutoplay(); 
            } else {
                entry.target.classList.remove('is-visible');
                pauseAutoplay();
            }
        });
    }, { threshold: 0.1 }); 

    observer.observe(sliderElement);

    // Manejo de Redimensionamiento
    window.addEventListener('resize', () => {
        if (getVisibleCards() !== visibleCards) {
            // Si cambia la cantidad de tarjetas visibles (ej: desktop a mobile), reinicializar
            initializeSlider();
        } else {
            setCardWidths();
            updateSliderPosition(false); 
        }
    });

    // Manejo de Touch/Swipe (Básico)
    let startX = 0;
    
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        pauseAutoplay(); 
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
        
        if (!isPausedByHover && sliderElement.classList.contains('is-visible')) {
            startAutoplay();
        }
    });

    // Ejecutar la inicialización
    initializeSlider();
    // updateActiveState() ya se llama dentro de updateSliderPosition(false)
});