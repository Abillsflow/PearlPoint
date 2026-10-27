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
  // Scroll-driven service showroom: one capability takes focus per scroll chapter.
  const serviceSection = document.querySelector('.services-showcase');
  if (serviceSection && window.gsap && window.ScrollTrigger) {
    const arts = gsap.utils.toArray('.service-art');
    const copies = gsap.utils.toArray('.service-copy');
    const fill = document.querySelector('.services-progress-fill');
    const count = document.querySelector('.services-current');
    const setService = index => {
      arts.forEach((art, i) => { art.classList.toggle('is-active', i === index); copies[i]?.classList.toggle('is-active', i === index); });
      if (count) count.textContent = String(index + 1).padStart(2, '0');
      if (fill) gsap.to(fill, { scaleX: (index + 1) / arts.length, duration: .4, ease: 'power2.out', overwrite: true });
    };
    setService(0);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(min-width: 651px)').matches) {
      const timeline = gsap.timeline({ scrollTrigger: {
        trigger: serviceSection, start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * (arts.length + .25)),
        pin: '.services-sticky', pinSpacing: true, scrub: .65, invalidateOnRefresh: true,
        onUpdate: self => setService(Math.min(arts.length - 1, Math.floor(self.progress * arts.length)))
      }});
      arts.forEach((art, index) => {
        if (!index) return;
        timeline.fromTo(art, { autoAlpha: 0, y: 25, scale: .94, rotateY: -7 }, { autoAlpha: 1, y: 0, scale: 1, rotateY: 0, duration: .65, ease: 'power3.out' }, index);
        timeline.fromTo(copies[index], { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: .5, ease: 'power3.out' }, index + .12);
        timeline.to(arts[index - 1], { autoAlpha: 0, y: -14, scale: 1.02, duration: .35 }, index);
        timeline.to(copies[index - 1], { autoAlpha: 0, y: -12, duration: .3 }, index);
      });
      timeline.to({}, { duration: .4 });
      ScrollTrigger.refresh();
    } else {
      // On small screens, keep the active service readable and touch-friendly.
      let startY = 0;
      const stage = document.querySelector('.service-stage');
      stage?.addEventListener('touchstart', event => { startY = event.changedTouches[0].clientY; }, { passive: true });
      stage?.addEventListener('touchend', event => {
        const delta = startY - event.changedTouches[0].clientY;
        if (Math.abs(delta) > 90) {
          const active = copies.findIndex(copy => copy.classList.contains('is-active'));
          setService(Math.max(0, Math.min(arts.length - 1, active + (delta > 0 ? 1 : -1))));
        }
      }, { passive: true });
    }
    copies.forEach((copy, index) => copy.querySelector('.service-link')?.addEventListener('focus', () => setService(index)));
  }

})();