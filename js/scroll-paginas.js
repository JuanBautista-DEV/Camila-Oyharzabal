document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        const targetID = this.getAttribute("href");
        if (targetID.length < 2) return;
        e.preventDefault();

        const target = document.querySelector(targetID);
        if (!target) return;

        smoothScroll(target.offsetTop, 1800); 
    });
});

function smoothScroll(targetPos, duration = 1800) {
    const start = window.scrollY;
    const distance = targetPos - start;
    const startTime = performance.now();

    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animation(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeInOutCubic(progress);

        window.scrollTo(0, start + distance * ease);

        if (progress < 1) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
}