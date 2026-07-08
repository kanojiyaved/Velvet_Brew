document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loading-screen');
  const progressBar = loadingScreen?.querySelector('.progress-bar span');
  const qrImage = document.getElementById('qrCode');
  const gsapAvailable = typeof window.gsap !== 'undefined';

  if (qrImage) {
    const currentOrigin = window.location.origin;
    const isLocalHost = /localhost|127\.0\.0\.1/.test(window.location.hostname);
    const menuUrl = isLocalHost
      ? 'http://172.20.229.250:8000/menu.html'
      : new URL('menu.html', currentOrigin).toString();

    qrImage.innerHTML = '';

    if (typeof window.QRCode !== 'undefined') {
      new window.QRCode(qrImage, {
        text: menuUrl,
        width: 220,
        height: 220,
        colorDark: '#2c2c2c',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.H
      });
    } else {
      qrImage.innerHTML = '<div class="qr-placeholder">Scan to view menu</div>';
    }
  }

  if (loadingScreen && progressBar) {
    if (gsapAvailable) {
      window.gsap.to(progressBar, {
        width: '100%',
        duration: 1.2,
        ease: 'power2.out',
        onComplete: () => {
          window.gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.6,
            display: 'none',
            ease: 'power2.inOut'
          });
        }
      });
    } else {
      progressBar.style.width = '100%';
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.6s ease';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 600);
      }, 1200);
    }
  }

  if (gsapAvailable) {
    window.gsap.from('.welcome-card', {
      y: 30,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: 'power3.out'
    });

    window.gsap.from('.info-card', {
      y: 30,
      opacity: 0,
      duration: 1,
      delay: 0.4,
      ease: 'power3.out'
    });

    window.gsap.to('.float-icon', {
      y: -10,
      repeat: -1,
      yoyo: true,
      duration: 2.5,
      ease: 'sine.inOut',
      stagger: 0.3
    });
  }
});
