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
  if (visual && pearl && window.matchMedia('(pointer:fine)').matches) {
    // The original pearl stays in place; it only gently follows the pointer.
    // No dragging, no spinning, and no automatic rotation.
    visual.addEventListener('pointermove', event => {
      const rect = visual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(pearl, {
        rotateY: x * 12,
        rotateX: -y * 10,
        duration: 0.9,
        ease: 'power3.out',
        overwrite: 'auto'
      });
      gsap.to('.visual-orbit', {
        x: x * -5,
        y: y * -4,
        duration: 1.15,
        stagger: 0.04,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
    visual.addEventListener('pointerleave', () => {
      gsap.to(pearl, {
        rotateX: 0,
        rotateY: 0,
        duration: 1.1,
        ease: 'power3.out',
        overwrite: 'auto'
      });
      gsap.to('.visual-orbit', {
        x: 0,
        y: 0,
        duration: 1.2,
        stagger: 0.04,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
  }
})();