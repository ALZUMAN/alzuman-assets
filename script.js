(function(){
  'use strict';

  var clamp = function(v,min,max){ return Math.max(min,Math.min(max,v)); };
  var mapRange = function(p,a,b){ return clamp((p-a)/(b-a),0,1); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ pricing engine ============ */
  var OUNCE_GRAMS = 31.1035;
  var SAR_PER_USD = 3.75;
  var WEIGHTS = [
    {label:'١ غرام',     grams:1,          dims:'8 × 15 × 0.4 مم'},
    {label:'٢.٥ غرام',   grams:2.5,        dims:'10 × 17 × 0.5 مم'},
    {label:'٥ غرامات',   grams:5,          dims:'14 × 23 × 0.7 مم'},
    {label:'١٠ غرامات',  grams:10,         dims:'17 × 28 × 0.9 مم'},
    {label:'٢٠ غراماً',  grams:20,         dims:'21 × 33 × 1.2 مم'},
    {label:'٥٠ غراماً',  grams:50,         dims:'28 × 45 × 1.6 مم'},
    {label:'١٠٠ غرام',   grams:100,        dims:'34 × 55 × 2.1 مم'},
    {label:'أونصة واحدة', grams:OUNCE_GRAMS, dims:'24 × 41 × 1.9 مم'}
  ];
  var ouncePrice = 4183.40;

  function formatSAR(v){
    return v.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' ر.س';
  }
  function formatUSD(v){
    return '$' + v.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
  }
  function priceForGrams(grams){
    return ((ouncePrice + 50) / OUNCE_GRAMS) * SAR_PER_USD * grams;
  }
  function priceForKarat(karat){
    return priceForGrams(1) * (karat / 24);
  }

  /* ============ section 8: product grid ============ */
  var s8Items = document.getElementById('s8Items');
  var priceEls = [];
  WEIGHTS.forEach(function(w){
    var row = document.createElement('div');
    row.className = 's8-item';
    row.innerHTML =
      '<div class="bullion-bar" style="--bar-w:88px;--bar-h:52px;"><div class="bullion-bar-face">' +
        '<span class="bullion-bar-purity" style="font-size:.6rem;">999.9</span>' +
      '</div></div>' +
      '<div class="s8-item-info">' +
        '<span class="s8-item-weight">'+w.label+'</span>' +
        '<span class="s8-item-purity">عيار ٩٩٩.٩ · '+w.dims+'</span>' +
        '<span class="s8-item-price num"></span>' +
        '<span class="s8-item-stock">متوفر</span>' +
        '<a href="tel:0562658444" class="s8-item-cta">عرض السبيكة ←</a>' +
      '</div>';
    s8Items.appendChild(row);
    priceEls.push({el:row.querySelector('.s8-item-price'), grams:w.grams});
  });

  /* ============ DOM refs: pricing ============ */
  var rate24kEl = document.getElementById('rate24k');
  var rate22kEl = document.getElementById('rate22k');
  var rate21kEl = document.getElementById('rate21k');
  var rate18kEl = document.getElementById('rate18k');
  var rateOunceUsdEl = document.getElementById('rateOunceUsd');
  var ounceArrowEl = document.getElementById('ounceArrow');
  var tickerOunceEl = document.getElementById('tickerOunce');
  var tickerArrowEl = document.getElementById('tickerArrow');

  function renderPrices(direction){
    rate24kEl.textContent = formatSAR(priceForKarat(24));
    rate22kEl.textContent = formatSAR(priceForKarat(22));
    rate21kEl.textContent = formatSAR(priceForKarat(21));
    rate18kEl.textContent = formatSAR(priceForKarat(18));
    rateOunceUsdEl.textContent = formatUSD(ouncePrice);
    tickerOunceEl.textContent = formatUSD(ouncePrice);
    priceEls.forEach(function(p){ p.el.textContent = formatSAR(priceForGrams(p.grams)); });

    [ounceArrowEl, tickerArrowEl].forEach(function(el){
      el.classList.remove('up','down');
      if (direction === 'up'){ el.classList.add('up'); el.textContent = '▲'; }
      else if (direction === 'down'){ el.classList.add('down'); el.textContent = '▼'; }
      else { el.textContent = '—'; }
    });
  }

  function updatePrice(){
    var prev = ouncePrice;
    var delta = (Math.random() * 2 - 1) * 2.4;
    ouncePrice = Math.round((ouncePrice + delta) * 100) / 100;
    renderPrices(ouncePrice > prev ? 'up' : (ouncePrice < prev ? 'down' : null));
  }
  renderPrices(null);
  window.setInterval(updatePrice, 5000);

  /* ============ header + mobile menu ============ */
  var siteHeader = document.getElementById('siteHeader');
  var menuBtn = document.getElementById('menuBtn');
  var menuCloseBtn = document.getElementById('menuCloseBtn');
  var mobileMenu = document.getElementById('mobileMenu');

  function openMenu(){ mobileMenu.classList.add('open'); menuBtn.setAttribute('aria-expanded','true'); }
  function closeMenu(){ mobileMenu.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); }
  menuBtn.addEventListener('click', openMenu);
  menuCloseBtn.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });

  /* ============ reduced motion: static fallback ============ */
  if (reduceMotion || !window.gsap || !window.ScrollTrigger){
    siteHeader.style.background = 'rgba(245,240,232,.9)';
    document.getElementById('headerWordmark').style.opacity = 1;
    document.getElementById('headerWordmark').style.transform = 'translateY(0)';
    document.getElementById('s1Logo').style.opacity = 1;
    document.getElementById('s1Logo').style.transform = 'none';
    document.querySelectorAll('[data-reveal], .s3-item, .s7-value, .s8-item').forEach(function(el){
      el.style.opacity = 1; el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  function ease(name, t){ return gsap.parseEase(name)(clamp(t,0,1)); }
  function kf(p, points){
    for (var i = 0; i < points.length - 1; i++){
      var a = points[i], b = points[i + 1];
      if (p <= b[0] || i === points.length - 2){
        var t = clamp((p - a[0]) / (b[0] - a[0] || 1), 0, 1);
        return a[1] + (b[1] - a[1]) * ease('power2.inOut', t);
      }
    }
    return points[points.length - 1][1];
  }

  /* ============ SECTION 1: cold open — logo settle + header solidify ============ */
  var s1Logo = document.getElementById('s1Logo');
  var s1BarWrap = document.getElementById('s1BarWrap');
  var headerWordmark = document.getElementById('headerWordmark');

  gsap.set(s1Logo, {opacity:0, y:14, scale:.94});
  gsap.to(s1Logo, {opacity:1, y:0, scale:1, duration:1, ease:'power3.out', delay:.15});

  ScrollTrigger.create({
    trigger:'#s1', start:'top top', end:'bottom top', scrub:.4,
    onUpdate:function(self){
      var p = self.progress;
      s1Logo.style.opacity = 1 - mapRange(p, .3, .85);
      s1Logo.style.transform = 'translateY(' + (-p*30) + 'px) scale(' + (1 - p*.12) + ')';
      s1BarWrap.style.transform = 'translateY(' + (p*-14) + 'px) rotateY(' + (p*6) + 'deg)';

      var headerEase = ease('power2.inOut', mapRange(p, .35, .85));
      siteHeader.style.background = 'rgba(245,240,232,' + (headerEase*.92) + ')';
      headerWordmark.style.opacity = headerEase;
      headerWordmark.style.transform = 'translateY(' + (6 - headerEase*6) + 'px)';
    }
  });

  /* ============ SECTION 2: pinned phrase cycler ============ */
  var s2Bar = document.getElementById('s2Bar');
  var s2Phrases = document.querySelectorAll('.s2-phrase');
  var PHRASE_COUNT = s2Phrases.length;

  ScrollTrigger.create({
    trigger:'#s2Stage', start:'top top', end:'bottom bottom', scrub:.4,
    onUpdate:function(self){
      var p = self.progress;
      s2Bar.style.transform = 'scale(' + (1 + p*.12) + ') rotateY(' + (-8 + p*8) + 'deg)';

      var seg = 1 / PHRASE_COUNT;
      s2Phrases.forEach(function(ph, i){
        var start = i * seg, end = start + seg;
        var localT = mapRange(p, start, start + seg*.28);
        var localOut = mapRange(p, end - seg*.28, end);
        var opacity = (i === PHRASE_COUNT-1) ? localT : localT * (1-localOut);
        var y = (1-ease('power3.out', localT)) * 14 - ease('power2.in', localOut) * 14;
        ph.style.opacity = opacity;
        ph.style.transform = 'translateY(' + y + 'px)';
      });
    }
  });

  /* ============ SECTION 3: steps reveal ============ */
  ScrollTrigger.batch('.s3-item', {
    start:'top 88%',
    onEnter:function(batch){ gsap.to(batch, {opacity:1, y:0, duration:.7, stagger:.12, ease:'power3.out'}); }
  });

  /* ============ SECTION 4: pinned interactive showcase ============ */
  var s4Stack = document.getElementById('s4Stack');
  var s4Flip = document.getElementById('s4Flip');
  var s4Headline = document.getElementById('s4Headline');
  var s4Sub = document.getElementById('s4Sub');
  var s4Caption = document.getElementById('s4Caption');
  var s4Tag1 = document.getElementById('s4Tag1');
  var s4Tag2 = document.getElementById('s4Tag2');

  var S4_CAPTIONS = [
    {end:.28, text:'الزاوية الأمامية'},
    {end:.52, text:'النقش والنقاء'},
    {end:.68, text:'سماكة السبيكة'},
    {end:.86, text:'الوجه الخلفي'},
    {end:1.0, text:'حضور دائم'}
  ];

  ScrollTrigger.create({
    trigger:'#s4Stage', start:'top top', end:'bottom bottom', scrub:.5,
    onUpdate:function(self){
      var p = self.progress;

      var rotateY = kf(p, [[0,-18],[.28,0],[.55,0],[.68,22],[.86,180],[1,180]]);
      var scale = kf(p, [[0,.92],[.28,1],[.40,1.32],[.55,1.32],[.68,1.18],[.86,1.28],[1,1]]);
      s4Flip.style.transform = 'rotateY(' + rotateY + 'deg) scale(' + scale + ')';

      s4Headline.style.opacity = mapRange(p,.0,.08) * (1-mapRange(p,.2,.3));
      s4Sub.style.opacity = mapRange(p,.86,.96);
      s4Caption.style.opacity = mapRange(p,.05,.12);

      var cur = S4_CAPTIONS[0].text;
      for (var i=0;i<S4_CAPTIONS.length;i++){ if (p <= S4_CAPTIONS[i].end){ cur = S4_CAPTIONS[i].text; break; } }
      if (s4Caption.textContent !== cur) s4Caption.textContent = cur;

      s4Tag1.style.opacity = mapRange(p,.30,.38) * (1-mapRange(p,.60,.68));
      s4Tag2.style.opacity = mapRange(p,.42,.50) * (1-mapRange(p,.60,.68));
    }
  });

  /* ============ SECTION 5: pricing reveal ============ */
  ScrollTrigger.batch('[data-reveal]', {
    start:'top 88%',
    onEnter:function(batch){ gsap.to(batch, {opacity:1, y:0, duration:.8, stagger:.15, ease:'power3.out'}); }
  });

  /* ============ SECTION 6: interlude reveal ============ */
  gsap.to(['.s6-headline','.s6-sub'], {
    opacity:1, y:0, duration:.9, stagger:.15, ease:'power3.out',
    scrollTrigger:{trigger:'#s6', start:'top 70%'}
  });

  /* ============ SECTION 7: value lines stagger ============ */
  ScrollTrigger.batch('.s7-value', {
    start:'top 88%',
    onEnter:function(batch){ gsap.to(batch, {opacity:1, y:0, duration:.7, stagger:.15, ease:'power3.out'}); }
  });

  /* ============ SECTION 8: product rows reveal ============ */
  ScrollTrigger.batch('.s8-item', {
    start:'top 90%',
    onEnter:function(batch){ gsap.to(batch, {opacity:1, y:0, duration:.7, stagger:.1, ease:'power3.out'}); }
  });

  /* ============ SECTION 9: final CTA reveal ============ */
  gsap.to(['.s9-headline','.s9-sub','.s9-cta-btn'], {
    opacity:1, y:0, duration:.9, stagger:.15, ease:'power3.out',
    scrollTrigger:{trigger:'#s9', start:'top 75%'}
  });

})();
