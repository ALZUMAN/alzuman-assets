(function(){
  'use strict';

  var clamp = function(v,min,max){ return Math.max(min,Math.min(max,v)); };
  var mapRange = function(p,a,b){ return clamp((p-a)/(b-a),0,1); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ pricing engine ============ */
  var OUNCE_GRAMS = 31.1035;
  var SAR_PER_USD = 3.75;
  var WEIGHTS = [
    {label:'1 غرام', grams:1, dims:'8 × 15 × 0.4 مم'},
    {label:'2.5 غرام', grams:2.5, dims:'10 × 17 × 0.5 مم'},
    {label:'5 غرامات', grams:5, dims:'14 × 23 × 0.7 مم'},
    {label:'10 غرامات', grams:10, dims:'17 × 28 × 0.9 مم'},
    {label:'20 غراماً', grams:20, dims:'21 × 33 × 1.2 مم'},
    {label:'50 غراماً', grams:50, dims:'28 × 45 × 1.6 مم'},
    {label:'100 غرام', grams:100, dims:'34 × 55 × 2.1 مم'},
    {label:'1 أونصة', grams:OUNCE_GRAMS, dims:'24 × 41 × 1.9 مم'}
  ];
  var ouncePrice = 4183.40;

  function formatSAR(v){ return v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' ر.س'; }
  function formatUSD(v){ return '$' + v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function priceForGrams(g){ return ((ouncePrice + 50) / OUNCE_GRAMS) * SAR_PER_USD * g; }
  function priceForKarat(k){ return priceForGrams(1) * (k/24); }

  var rate24kEl = document.getElementById('rate24k');
  var rate22kEl = document.getElementById('rate22k');
  var rate21kEl = document.getElementById('rate21k');
  var rate18kEl = document.getElementById('rate18k');
  var rateOunceUsdEl = document.getElementById('rateOunceUsd');
  var ounceTrendEl = document.getElementById('ounceTrend');
  var productPriceEls = [];

  function renderPrices(direction){
    rate24kEl.textContent = formatSAR(priceForKarat(24));
    rate22kEl.textContent = formatSAR(priceForKarat(22));
    rate21kEl.textContent = formatSAR(priceForKarat(21));
    rate18kEl.textContent = formatSAR(priceForKarat(18));
    rateOunceUsdEl.textContent = formatUSD(ouncePrice);
    productPriceEls.forEach(function(p){ p.el.textContent = formatSAR(priceForGrams(p.grams)); });
    ounceTrendEl.classList.remove('up','down');
    if (direction === 'up'){ ounceTrendEl.classList.add('up'); ounceTrendEl.textContent = '▲ 0.42%'; }
    else if (direction === 'down'){ ounceTrendEl.classList.add('down'); ounceTrendEl.textContent = '▼ 0.42%'; }
    else { ounceTrendEl.textContent = '—'; }
  }
  function updatePrice(){
    var prev = ouncePrice;
    ouncePrice = Math.round((ouncePrice + (Math.random()*2-1)*2.4) * 100) / 100;
    renderPrices(ouncePrice > prev ? 'up' : (ouncePrice < prev ? 'down' : null));
  }

  /* ============ scene 10: product collection (placeholder visuals — no video-derived bars) ============ */
  var productList = document.getElementById('productList');
  WEIGHTS.forEach(function(w){
    var row = document.createElement('div');
    row.className = 'product-row';
    row.innerHTML =
      '<div class="product-visual">الصورة قيد الإضافة</div>' +
      '<div class="product-info">' +
        '<span class="product-weight">'+w.label+'</span>' +
        '<span class="product-purity">عيار ٩٩٩.٩ · '+w.dims+'</span>' +
        '<span class="product-price num"></span>' +
        '<span class="product-stock">متوفر</span>' +
        '<a href="tel:0562658444" class="product-cta">عرض السبيكة ←</a>' +
      '</div>';
    productList.appendChild(row);
    productPriceEls.push({el:row.querySelector('.product-price'), grams:w.grams});
  });
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

  /* ============ video play/pause via IntersectionObserver (performance) ============ */
  var videos = Array.prototype.slice.call(document.querySelectorAll('video'));
  if ('IntersectionObserver' in window){
    var videoObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var v = entry.target;
        if (entry.isIntersecting){ v.play().catch(function(){}); }
        else { v.pause(); }
      });
    }, {rootMargin:'60% 0px 60% 0px', threshold:0.01});
    videos.forEach(function(v){ videoObserver.observe(v); });
  } else {
    videos.forEach(function(v){ v.play().catch(function(){}); });
  }

  /* ============ reduced motion: nothing more to wire up ============ */
  if (reduceMotion || !window.gsap || !window.ScrollTrigger){
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  function ease(name, t){ return gsap.parseEase(name)(clamp(t,0,1)); }
  function setOpacity(el, v){ if (el) el.style.opacity = v; }

  /* ============ SCENE 1: cold open ============ */
  var s1Logo = document.getElementById('s1Logo');
  var s1Headline = document.getElementById('s1Headline');
  var s1Sub = document.getElementById('s1Sub');
  var s1Tagline = document.getElementById('s1Tagline');
  var s1VideoWrap = document.getElementById('s1VideoWrap');
  var headerMark = document.getElementById('headerMark');

  ScrollTrigger.create({
    trigger:'#s1Stage', start:'top top', end:'bottom bottom', scrub:.4,
    onUpdate:function(self){
      var p = self.progress;
      setOpacity(s1Logo, mapRange(p,.02,.08) * (1-mapRange(p,.55,.75)));
      s1Logo.style.transform = 'translate(-50%,0) translateY(' + (-p*10) + 'vh) scale(' + (1-p*.3) + ')';
      setOpacity(s1Headline, mapRange(p,.05,.12) * (1-mapRange(p,.55,.75)));
      setOpacity(s1Sub, mapRange(p,.08,.15) * (1-mapRange(p,.55,.75)));
      setOpacity(s1Tagline, mapRange(p,.4,.5) * (1-mapRange(p,.8,.95)));
      var headerEase = ease('power2.inOut', mapRange(p,.6,.9));
      siteHeader.style.background = 'rgba(245,240,232,' + (headerEase*.9) + ')';
      headerMark.style.opacity = headerEase;
      headerMark.style.transform = 'translateY(' + (6-headerEase*6) + 'px)';
      s1VideoWrap.style.transform = 'scale(' + (1 - mapRange(p,.5,1)*.08) + ')';
      s1VideoWrap.style.opacity = 1 - mapRange(p,.82,1);
    }
  });

  /* ============ SCENE 2: statement cycler ============ */
  var s2Phrases = document.querySelectorAll('.s2-phrase');
  var s2Final = document.getElementById('s2Final');
  ScrollTrigger.create({
    trigger:'#s2Stage', start:'top top', end:'bottom bottom', scrub:.4,
    onUpdate:function(self){
      var p = self.progress;
      var n = s2Phrases.length;
      var seg = 1/n;
      s2Phrases.forEach(function(ph, i){
        var start = i*seg, end = start+seg;
        var inT = ease('power3.out', mapRange(p, start, start+seg*.3));
        var outT = ease('power2.in', mapRange(p, end-seg*.25, end));
        var opacity = inT * (1-outT);
        ph.style.opacity = opacity;
        ph.style.clipPath = 'inset(0 0 ' + (100-inT*100) + '% 0)';
        ph.style.transform = 'translateY(' + ((1-inT)*18 - outT*12) + 'px)';
      });
      setOpacity(s2Final, mapRange(p,.85,.95));
    }
  });

  /* ============ SCENE 3: bullion arrives ============ */
  var s3Micro = document.getElementById('s3Micro');
  var s3Headline = document.getElementById('s3Headline');
  ScrollTrigger.create({
    trigger:'#s3Stage', start:'top top', end:'bottom bottom', scrub:.4,
    onUpdate:function(self){
      var p = self.progress;
      setOpacity(s3Micro, mapRange(p,.08,.18)*(1-mapRange(p,.75,.92)));
      setOpacity(s3Headline, mapRange(p,.15,.28)*(1-mapRange(p,.75,.92)));
    }
  });

  /* ============ SCENE 4: purity macro — annotations synced to video time ============ */
  var v4 = document.getElementById('v4');
  var s4Annot1 = document.getElementById('s4Annot1');
  var s4Annot2 = document.getElementById('s4Annot2');
  var s4Stage = document.getElementById('s4Stage');
  var s4InRange = false;
  ScrollTrigger.create({
    trigger:'#s4Stage', start:'top top', end:'bottom bottom',
    onUpdate:function(self){ s4InRange = self.progress > 0.05 && self.progress < 0.95; }
  });
  v4.addEventListener('timeupdate', function(){
    if (!s4InRange || !v4.duration) { setOpacity(s4Annot1,0); setOpacity(s4Annot2,0); return; }
    var t = v4.currentTime / v4.duration;
    setOpacity(s4Annot1, mapRange(t,.28,.38) * (1-mapRange(t,.55,.62)));
    setOpacity(s4Annot2, mapRange(t,.65,.75) * (1-mapRange(t,.95,1)));
  });

  /* ============ SCENE 5: inspection — labels synced to video time, alt clip crossfades in near end ============ */
  var v5 = document.getElementById('v5');
  var s5Label = document.getElementById('s5Label');
  var s5AltWrap = document.getElementById('s5AltWrap');
  var s5InRange = false;
  var S5_LABELS = [
    {end:.25, micro:'FRONT', txt:'النقاء والوزن'},
    {end:.55, micro:'EDGE', txt:'حضور مادي'},
    {end:.8, micro:'REVERSE', txt:'تفاصيل السبيكة'},
    {end:1.0, micro:'MACRO', txt:'تفاصيل تُرى بوضوح.'}
  ];
  ScrollTrigger.create({
    trigger:'#s5Stage', start:'top top', end:'bottom bottom', scrub:.4,
    onUpdate:function(self){
      var p = self.progress;
      s5InRange = p > 0.04 && p < 0.96;
      setOpacity(s5AltWrap, mapRange(p,.72,.85) * (1-mapRange(p,.94,1)));
    }
  });
  v5.addEventListener('timeupdate', function(){
    if (!s5InRange || !v5.duration) { setOpacity(s5Label,0); return; }
    var t = v5.currentTime / v5.duration;
    var cur = S5_LABELS[0];
    for (var i=0;i<S5_LABELS.length;i++){ if (t <= S5_LABELS[i].end){ cur = S5_LABELS[i]; break; } }
    var micro = s5Label.querySelector('.micro');
    var txt = s5Label.querySelector('.txt');
    if (micro.textContent !== cur.micro) micro.textContent = cur.micro;
    if (txt.textContent !== cur.txt) txt.textContent = cur.txt;
    var segStart = 0;
    for (var j=0;j<S5_LABELS.length;j++){ if (S5_LABELS[j]===cur) break; segStart = S5_LABELS[j].end; }
    var localT = mapRange(t, segStart, cur.end);
    setOpacity(s5Label, mapRange(localT,0,.15) * (1-mapRange(localT,.85,1)));
  });

  /* ============ SCENE 6: live gold index reveal ============ */
  ScrollTrigger.batch('#s6 [data-reveal]', {
    start:'top 85%',
    onEnter:function(batch){ gsap.to(batch, {opacity:1, y:0, duration:.8, stagger:.15, ease:'power3.out'}); }
  });

  /* ============ SCENE 7: interlude reveal ============ */
  gsap.to('#s7 h2, #s7 p', {
    opacity:1, y:0, duration:.9, stagger:.15, ease:'power3.out',
    scrollTrigger:{trigger:'#s7', start:'top 70%'}
  });

  /* ============ SCENE 8: steps reveal ============ */
  ScrollTrigger.batch('.s8-item', {
    start:'top 88%',
    onEnter:function(batch){ gsap.to(batch, {opacity:1, y:0, duration:.7, stagger:.12, ease:'power3.out'}); }
  });

  /* ============ SCENE 9: brand values stagger ============ */
  ScrollTrigger.batch('#s9Values span', {
    start:'top 88%',
    onEnter:function(batch){ gsap.to(batch, {opacity:1, y:0, duration:.7, stagger:.15, ease:'power3.out'}); }
  });

  /* ============ SCENE 10: product rows reveal ============ */
  ScrollTrigger.batch('.product-row', {
    start:'top 90%',
    onEnter:function(batch){ gsap.to(batch, {opacity:1, y:0, duration:.7, stagger:.1, ease:'power3.out'}); }
  });

})();
