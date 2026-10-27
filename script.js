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
  // A single shared spatial showroom: the selected service advances while neighbours remain visible.
  const scene = document.querySelector('.showroom-scene');
  if (scene) {
    const objects = gsap.utils.toArray('.showcase-object');
    const details = gsap.utils.toArray('.showroom-detail');
    const dots = gsap.utils.toArray('.showroom-dots button');
    const counter = document.querySelector('.showroom-counter span');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let active = 0;
    const layout = (index) => {
      const mobile = window.innerWidth <= 760;
      const gap = mobile ? Math.min(window.innerWidth * .47, 185) : Math.min(window.innerWidth * .235, 315);
      return objects.map((_, i) => {
        const offset = i - index, distance = Math.abs(offset);
        return { x: scene.clientWidth / 2 - objects[i].offsetWidth / 2 + offset * gap, y: scene.clientHeight / 2 - objects[i].offsetHeight / 2 + (distance ? 13 + distance * 3 : -7), z: distance ? -distance * 90 : 90,
          scale: distance === 0 ? (mobile ? 1.04 : 1.17) : distance === 1 ? .76 : .52,
          rotateY: offset * (mobile ? -8 : -11),
          autoAlpha: distance > (mobile ? 1 : 2) ? 0 : distance === 0 ? 1 : .72 };
      });
    };
    const render = (next, instant = false) => {
      active = (next + objects.length) % objects.length;
      const poses = layout(active);
      objects.forEach((object, i) => {
        object.style.zIndex = String(20 - Math.abs(i - active));
        gsap.to(object, { ...poses[i], duration: instant || reduced ? 0 : .85, ease: 'power3.inOut', overwrite: true });
        object.classList.toggle('is-focused', i === active);
        object.setAttribute('aria-pressed', String(i === active));
      });
      details.forEach((detail, i) => {
        detail.classList.toggle('is-current', i === active);
        gsap.to(detail, { autoAlpha: i === active ? 1 : 0, y: i === active ? 0 : 10, duration: reduced ? 0 : .32, overwrite: true });
      });
      dots.forEach((dot, i) => dot.classList.toggle('is-current', i === active));
      if (counter) counter.textContent = String(active + 1).padStart(2, '0');
    };
    objects.forEach((object, i) => object.addEventListener('click', () => render(i)));
    dots.forEach((dot, i) => dot.addEventListener('click', () => render(i)));
    document.querySelector('.showroom-prev')?.addEventListener('click', () => render(active - 1));
    document.querySelector('.showroom-next')?.addEventListener('click', () => render(active + 1));
    if (window.matchMedia('(min-width: 761px)').matches && !reduced) {
      ScrollTrigger.create({
        trigger: scene, start: 'top 72%', end: 'bottom 30%',
        onUpdate: self => {
          const next = Math.min(objects.length - 1, Math.floor(self.progress * objects.length));
          if (next !== active) render(next);
        }
      });
    }
    let touchX = 0;
    scene.addEventListener('touchstart', event => { touchX = event.changedTouches[0].clientX; }, { passive: true });
    scene.addEventListener('touchend', event => {
      const delta = touchX - event.changedTouches[0].clientX;
      if (Math.abs(delta) > 45) render(active + (delta > 0 ? 1 : -1));
    }, { passive: true });
    window.addEventListener('resize', () => render(active, true), { passive: true });
    render(0, true);
  }

})();