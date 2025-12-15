  AOS.init({duration:2200,easing:'ease-out-cubic',once:true});

    // Year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Small accessibility: focus outline for keyboard users
    (function(){
      function handleFirstTab(e) {
        if (e.key === 'Tab') {
          document.body.classList.add('user-is-tabbing');
          window.removeEventListener('keydown', handleFirstTab);
        }
      }
      window.addEventListener('keydown', handleFirstTab);
    })();