(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-d]').forEach((el) => el.style.setProperty('--d', `${el.dataset.d}ms`));

  // блоки в сравнении
  document.querySelectorAll('.blocks').forEach((wrap) => {
    const n = Number(wrap.dataset.count) || 0;
    for (let i = 0; i < n; i += 1) {
      const b = document.createElement('span');
      b.className = 'block';
      b.style.setProperty('--i', i);
      wrap.appendChild(b);
    }
  });

  // бегущая строка: дублируем список для бесшовного цикла
  const svc = document.getElementById('svc');
  if (svc) {
    Array.from(svc.children).forEach((li) => {
      const c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      svc.appendChild(c);
    });
  }

  // появление при скролле
  if ('IntersectionObserver' in window && !reduce) {
    root.classList.add('js-anim');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.rise, .race').forEach((el) => io.observe(el));
  }

  // фирменное взаимодействие: тап по Кубику — удар и +45 ₽
  const art = document.querySelector('.hero__art');
  if (art) {
    const hit = () => { art.classList.remove('is-hit'); void art.offsetWidth; art.classList.add('is-hit'); };
    art.addEventListener('click', hit);
    if (!reduce) window.setTimeout(hit, 1500);
  }

  // карусели: стрелки и полоска прогресса
  document.querySelectorAll('.ctrl').forEach((ctrl) => {
    const track = document.getElementById(ctrl.dataset.target);
    if (!track) return;
    const bar = ctrl.querySelector('.ctrl__bar span');
    const [prev, next] = ctrl.querySelectorAll('.arrow');
    const step = () => {
      const item = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 12;
      return item ? item.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 0;
      const visible = max > 0 ? track.clientWidth / track.scrollWidth : 1;
      if (bar) {
        bar.style.width = `${Math.max(visible * 100, 20)}%`;
        bar.style.transform = `translateX(${p * (100 / Math.max(visible, 0.2) - 100)}%)`;
      }
      const dots = ctrl.querySelectorAll('.dots i');
      if (dots.length) {
        const on = Math.round(p * (dots.length - 1));
        dots.forEach((d, i) => d.classList.toggle('is-on', i === on));
      }
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
      ctrl.hidden = max <= 2;
    };
    prev && prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    next && next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', () => window.requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  // липкая кнопка: после того как кнопка оффера ушла за край, до финальной
  const sticky = document.getElementById('sticky');
  const offerCta = document.getElementById('offer-cta');
  const finalCta = document.getElementById('final-cta');
  if (sticky && offerCta && 'IntersectionObserver' in window) {
    let gone = false; let finalSeen = false;
    const set = () => {
      const on = gone && !finalSeen;
      sticky.classList.toggle('is-on', on);
      sticky.setAttribute('aria-hidden', on ? 'false' : 'true');
      sticky.querySelector('a').tabIndex = on ? 0 : -1;
    };
    new IntersectionObserver(([e]) => { gone = !e.isIntersecting && e.boundingClientRect.top < 0; set(); }).observe(offerCta);
    if (finalCta) new IntersectionObserver(([e]) => { finalSeen = e.isIntersecting; set(); }).observe(finalCta);
  }

  // видео-инструкция в телефоне: по Play показываем ролик со звуком, после конца — снова заставка
  const phone = document.querySelector('.phone');
  const video = phone && phone.querySelector('.phone__video');
  const play = phone && phone.querySelector('.phone__play');
  if (video && play) {
    // Safari плохо стримит видео с хостингов без докачки по частям и «замирает».
    // Поэтому заранее скачиваем ролик целиком и отдаём его плееру из памяти.
    const mp4 = video.canPlayType('video/mp4; codecs="avc1.4D4028, mp4a.40.2"') !== '';
    const file = mp4 ? '/promo/assets/howto.mp4' : '/promo/assets/howto.webm';
    let ready = false;
    const preload = () => {
      if (ready || !window.fetch || !window.URL) return;
      ready = true;
      fetch(file).then((r) => (r.ok ? r.blob() : Promise.reject())).then((b) => {
        const wasPlaying = !video.paused; const t = video.currentTime;
        video.querySelectorAll('source').forEach((s) => s.remove());
        video.src = URL.createObjectURL(b.type ? b : new Blob([b], { type: mp4 ? 'video/mp4' : 'video/webm' }));
        if (t) video.currentTime = t;
        if (wasPlaying) video.play().catch(() => {});
      }).catch(() => { ready = false; });
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { preload(); io.disconnect(); } }, { rootMargin: '600px 0px' });
      io.observe(phone);
    } else { preload(); }

    const isFull = () => document.fullscreenElement || document.webkitFullscreenElement || video.webkitDisplayingFullscreen;
    const reset = () => { if (isFull()) return; phone.classList.remove('is-playing'); video.hidden = true; video.currentTime = 0; };
    play.addEventListener('click', () => {
      preload();
      video.hidden = false;
      phone.classList.add('is-playing');
      const p = video.play();
      if (p && p.catch) p.catch(() => { video.muted = true; video.play().catch(reset); });
    });
    video.addEventListener('ended', reset);
    // ушли со страницы — пауза (но не в полноэкранном режиме: там видео «вне экрана» для страницы)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { if (!e.isIntersecting && !video.paused && !isFull()) video.pause(); }, { threshold: 0.2 }).observe(phone);
    }
  }
})();
