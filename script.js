(() => {
  const menu = document.querySelector('#menuToggle');
  const links = document.querySelector('#navLinks');
  menu?.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  links?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    links.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
  }));

  if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro.from('.nav .brand', { y: -18, opacity: 0, duration: .75 })
    .from('.nav-links .nav-link', { y: -12, opacity: 0, duration: .5, stagger: .07 }, '-=.42')
    .from('.nav-cta', { y: -12, opacity: 0, duration: .55 }, '-=.4')
    .from('.eyebrow', { y: 18, opacity: 0, duration: .65 }, '-=.25')
    .from('.hero-title .line > span', { yPercent: 115, rotate: 2, duration: 1.05, stagger: .13, ease: 'power4.out' }, '-=.32')
    .from('.hero-description', { y: 20, opacity: 0, duration: .8 }, '-=.55')
    .from('.hero-actions .button', { y: 16, opacity: 0, duration: .65, stagger: .1 }, '-=.55')
    .from('.hero-footnote', { y: 10, opacity: 0, duration: .6 }, '-=.4')
    .from('.visual-orbit', { scale: .72, rotate: '+=20', opacity: 0, duration: 1.5, stagger: .12, ease: 'power2.out' }, '-=1.15')
    .from('.pearl', { scale: .55, opacity: 0, rotateY: -30, duration: 1.45, ease: 'power3.out' }, '-=1.35')
    .from('.floating-card', { y: 22, x: 10, opacity: 0, duration: .8, stagger: .16, ease: 'back.out(1.4)' }, '-=.85')
    .from('.visual-caption', { opacity: 0, duration: .6 }, '-=.45')
    .from('.hero-bottom-rule', { scaleX: .5, opacity: 0, transformOrigin: 'center', duration: .8 }, '-=.5');

  gsap.to('.pearl', { y: -11, duration: 3.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.orbit-one', { rotation: '+=7', duration: 13, ease: 'none', repeat: -1 });
  gsap.to('.orbit-two', { rotation: '-=8', duration: 17, ease: 'none', repeat: -1 });
  gsap.to('.orbit-three', { rotation: '+=5', duration: 20, ease: 'none', repeat: -1 });
  gsap.to('.card-top', { y: -7, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to('.card-bottom', { y: 6, duration: 3.7, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  gsap.from('.below-fold > *', { scrollTrigger: { trigger: '.below-fold', start: 'top 78%' }, y: 28, opacity: 0, duration: .8, stagger: .12, ease: 'power3.out' });
  const visual = document.querySelector('.hero-visual');
  const pearl = document.querySelector('.pearl');
  if (visual && pearl) {
    // Click and drag the pearl to rotate it freely in 3D — including full 360° turns.
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let rotationX = 0;
    let rotationY = 0;
    let velocityX = 0;
    let velocityY = 0;

    pearl.setAttribute('role', 'img');
    pearl.setAttribute('aria-label', 'Interactive pearl. Click or touch and drag to rotate 360 degrees.');
    pearl.style.touchAction = 'none';

    pearl.addEventListener('pointerdown', e => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velocityX = velocityY = 0;
      pearl.classList.add('is-dragging');
      pearl.setPointerCapture(e.pointerId);
      gsap.killTweensOf(pearl, 'rotateX,rotateY');
      e.preventDefault();
    });

    pearl.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      velocityY = dx * 0.9;
      velocityX = -dy * 0.9;
      rotationY += velocityY;
      rotationX += velocityX;
      gsap.set(pearl, { rotateX: rotationX, rotateY: rotationY, overwrite: true });
    });

    const releasePearl = () => {
      if (!dragging) return;
      dragging = false;
      pearl.classList.remove('is-dragging');
      // A small, smooth follow-through makes the drag feel tactile.
      gsap.to({ x: 0 }, {
        x: 1,
        duration: 0.65,
        ease: 'power2.out',
        onUpdate() {
          const progress = this.progress();
          gsap.set(pearl, {
            rotateY: rotationY + velocityY * progress * 0.65,
            rotateX: rotationX + velocityX * progress * 0.65
          });
        },
        onComplete() {
          rotationY += velocityY * 0.65;
          rotationX += velocityX * 0.65;
        }
      });
    };
    pearl.addEventListener('pointerup', releasePearl);
    pearl.addEventListener('pointercancel', releasePearl);
    pearl.addEventListener('lostpointercapture', releasePearl);

    if (window.matchMedia('(pointer:fine)').matches) {
      visual.addEventListener('pointermove', e => {
        if (dragging) return;
        const r = visual.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        gsap.to('.visual-orbit', { x: x * -9, y: y * -7, duration: 1.1, stagger: .04, ease: 'power2.out', overwrite: 'auto' });
      });
      visual.addEventListener('pointerleave', () => {
        gsap.to('.visual-orbit', { x: 0, y: 0, duration: 1, stagger: .04, ease: 'power2.out' });
      });
    }
  }
})();