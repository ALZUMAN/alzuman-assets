(function(){
  'use strict';

  var clamp = function(v,min,max){ return Math.max(min,Math.min(max,v)); };
  var mapRange = function(p,a,b){ return clamp((p-a)/(b-a),0,1); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ pricing engine (reused) ============ */
  var OUNCE_GRAMS = 31.1035;
  var SAR_PER_USD = 3.75;
  var WEIGHTS = [
    {label:'١ غرام',  grams:1,        dims:'8 × 15 × 0.4',  visualW:34,  visualH:52},
    {label:'٢ غرام',  grams:2,        dims:'11 × 19 × 0.5', visualW:44,  visualH:66},
    {label:'٥ غرامات', grams:5,        dims:'14 × 23 × 0.7', visualW:56,  visualH:82},
    {label:'١٠ غرامات', grams:10,       dims:'17 × 28 × 0.9', visualW:68,  visualH:98},
    {label:'أونصة (٣١.١٠٣٥غ)', grams:OUNCE_GRAMS, dims:'24 × 41 × 1.9', visualW:96,  visualH:140}
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

  /* ============ product list (shop) ============ */
  var productListEl = document.getElementById('productList');
  var priceEls = [];
  WEIGHTS.forEach(function(w){
    var row = document.createElement('div');
    row.className = 'product-row';
    row.innerHTML =
      '<div class="product-visual" style="width:'+w.visualW+'px;height:'+w.visualH+'px;"><div class="shine"></div></div>' +
      '<div class="product-info">' +
        '<div class="product-weight">'+w.label+'</div>' +
        '<span class="product-dims" dir="ltr">'+w.dims+' مم</span>' +
        '<span class="product-price num" dir="ltr"></span>' +
        '<a href="tel:0562658444" class="product-cta">اطلب الآن ←</a>' +
      '</div>';
    productListEl.appendChild(row);
    priceEls.push({el:row.querySelector('.product-price'), grams:w.grams});
  });

  /* ============ market (karat) + value DOM refs ============ */
  var rate24kEl = document.getElementById('rate24k');
  var rate22kEl = document.getElementById('rate22k');
  var rate21kEl = document.getElementById('rate21k');
  var rate18kEl = document.getElementById('rate18k');
  var rateOunceUsdEl = document.getElementById('rateOunceUsd');
  var ounceArrowEl = document.getElementById('ounceArrow');
  var valueAmountEl = document.getElementById('valueAmount');

  // karat rates are the same live-ticking ounce price, expressed at each
  // karat's fraction of 24K (999.9) purity — not a separate data source.
  function priceForKarat(karat){
    return priceForGrams(1) * (karat / 24);
  }

  function renderPrices(direction){
    rate24kEl.textContent = formatSAR(priceForKarat(24));
    rate22kEl.textContent = formatSAR(priceForKarat(22));
    rate21kEl.textContent = formatSAR(priceForKarat(21));
    rate18kEl.textContent = formatSAR(priceForKarat(18));
    rateOunceUsdEl.textContent = formatUSD(ouncePrice);
    valueAmountEl.textContent = formatSAR(priceForGrams(1));
    priceEls.forEach(function(p){ p.el.textContent = formatSAR(priceForGrams(p.grams)); });

    ounceArrowEl.classList.remove('up','down');
    if (direction === 'up'){ ounceArrowEl.classList.add('up'); ounceArrowEl.textContent = '▲'; }
    else if (direction === 'down'){ ounceArrowEl.classList.add('down'); ounceArrowEl.textContent = '▼'; }
    else { ounceArrowEl.textContent = '—'; }
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
    siteHeader.classList.add('solid');
    document.getElementById('brandCue').style.display = 'none';
    var layerA = document.getElementById('videoA');
    var goldLayerAEl = document.getElementById('goldLayerA');
    goldLayerAEl.style.opacity = 1;
    goldLayerAEl.style.clipPath = 'inset(0 0 0 0)';
    document.getElementById('goldLayerB').style.opacity = 0;
    layerA.play().catch(function(){});
    ['arrivalPhrase','megaNumber','megaCaption','valuePrice'].forEach(function(id){
      document.getElementById(id).style.opacity = 1;
    });
    document.querySelectorAll('.aw i').forEach(function(i){ i.style.transform = 'translateY(0)'; });
    document.querySelectorAll('.mn-d').forEach(function(d){ d.style.transform = 'translateY(0)'; });
    document.querySelectorAll('.brand-fall-wordmark .bl').forEach(function(l){
      l.style.transform = 'translateY(0)'; l.style.opacity = 1; l.style.filter = 'blur(0)';
    });
    document.getElementById('transformBar').style.opacity = 1;
    document.getElementById('transformCaption').style.opacity = 1;
    document.querySelectorAll('[data-rate]').forEach(function(r){ r.style.opacity = 1; r.style.transform = 'none'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ============ video priming (mobile Safari currentTime reliability) ============ */
  var videoA = document.getElementById('videoA');
  var videoB = document.getElementById('videoB');
  var videoC = document.getElementById('videoC');
  function primeVideo(v){
    v.play().then(function(){ v.pause(); }).catch(function(){});
  }
  [videoA, videoB, videoC].forEach(primeVideo);

  var DUR_A = 10.04, DUR_B = 10.04, DUR_C = 10.04;
  var EDGE_A = 4.2;   // scene1-ivory edge-on pose
  var EDGE_B = 3.3;   // scene3-gold matching edge-on pose

  function setTime(v, t){
    if (Math.abs(v.currentTime - t) > 0.01){
      try { v.currentTime = t; } catch(e){}
    }
  }

  var brandMark = document.getElementById('brandMark');
  var brandCue = document.getElementById('brandCue');
  var fallLetters = document.querySelectorAll('#brandFallWordmark .bl');
  var goldLayerA = document.getElementById('goldLayerA');
  var goldLayerB = document.getElementById('goldLayerB');
  var transitionFlash = document.getElementById('transitionFlash');
  var arrivalWords = document.querySelectorAll('#arrivalPhrase .aw i');
  var megaNumber = document.getElementById('megaNumber');
  var megaDigits = document.querySelectorAll('#megaNumber .mn-d');
  var megaCaption = document.getElementById('megaCaption');
  var valuePrice = document.getElementById('valuePrice');
  var actProgressDot = document.getElementById('actProgressDot');

  function clipReveal(t){
    var e = gsap.parseEase('power2.out')(clamp(t,0,1));
    return 'inset(0 ' + (100 - e * 100) + '% 0 0)';
  }

  /* ============ ACT I master scrub: Brand -> Arrival -> Material -> Value ============ */
  ScrollTrigger.create({
    trigger: '#pinStage',
    start: 'top top',
    end: 'bottom bottom',
    pin: '.pin-inner',
    scrub: 0.4,
    onUpdate: function(self){ renderAct(self.progress); }
  });

  function renderAct(p){
    // scene boundaries (fractions of pin-stage progress, matching the 0-60% overall storyline)
    var BRAND_END = 0.20;
    var ARRIVAL_END = 0.467;
    var MAT_A_END = 0.60;
    var CROSS_END = 0.62;
    var MAT_END = 0.75;
    var VALUE_END = 1.0;

    // BRAND: emblem settles, ALZUMAN letters fall into place one by one, cue fades
    var brandCueOpacity = 1 - mapRange(p, 0.06, 0.10);
    brandCue.style.opacity = brandCueOpacity;

    fallLetters.forEach(function(letter, i){
      var lt = mapRange(p, 0.02 + i * 0.014, 0.09 + i * 0.014);
      var eased = gsap.parseEase('power4.out')(lt);
      letter.style.transform = 'translateY(' + (-0.9 + eased * 0.9) + 'em)';
      letter.style.opacity = eased;
      letter.style.filter = 'blur(' + (6 * (1 - eased)) + 'px)';
    });

    // ARRIVAL: whole brand mark migrates toward header, header goes solid,
    // gold layer A enters through a growing crop (discover, not reveal-all), phrase rises
    var arriveT = mapRange(p, BRAND_END, ARRIVAL_END);
    var arriveEase = gsap.parseEase('power3.inOut')(arriveT);
    var markScale = 1 - arriveEase * 0.7;
    var markY = arriveEase * -38;
    brandMark.style.transform = 'translateY(' + markY + 'vh) scale(' + markScale + ')';
    brandMark.style.opacity = 1 - mapRange(p, ARRIVAL_END - 0.03, ARRIVAL_END);

    if (arriveEase > 0.92) siteHeader.classList.add('solid');
    else siteHeader.classList.remove('solid');

    var goldAIn = mapRange(p, BRAND_END + 0.02, BRAND_END + 0.10);
    var goldACrop = mapRange(p, BRAND_END + 0.02, MAT_A_END - 0.02);
    goldLayerA.style.opacity = goldAIn;
    goldLayerA.style.clipPath = clipReveal(goldACrop);

    arrivalWords.forEach(function(word, i){
      var wt = mapRange(p, BRAND_END + 0.06 + i * 0.03, BRAND_END + 0.20 + i * 0.03);
      var eased = gsap.parseEase('power4.out')(wt);
      word.style.transform = 'translateY(' + (105 - eased * 105) + '%)';
    });

    // MATERIAL: scrub video A toward its edge pose, crossfade (masked wipe, not a flat
    // dissolve) into video B at the matching pose, mega-number appears with per-digit fall
    var matAT = mapRange(p, ARRIVAL_END, MAT_A_END);
    if (matAT > 0) setTime(videoA, matAT * EDGE_A);

    var crossT = mapRange(p, MAT_A_END, CROSS_END);
    goldLayerA.style.opacity = Math.max(0, goldAIn - crossT);
    goldLayerB.style.opacity = crossT;
    goldLayerB.style.clipPath = clipReveal(mapRange(p, MAT_A_END, MAT_A_END + 0.05));
    if (crossT > 0 && crossT < 1) setTime(videoB, EDGE_B);
    // a brief gold-reflection flash disguises the cut between the two clips
    transitionFlash.style.opacity = (1 - Math.abs(crossT * 2 - 1)) * (crossT > 0 && crossT < 1 ? 0.9 : 0);

    var matBT = mapRange(p, CROSS_END, MAT_END);
    if (matBT > 0) setTime(videoB, EDGE_B + matBT * (DUR_B * 0.9 - EDGE_B));
    if (p >= CROSS_END) goldLayerB.style.opacity = 1;

    // gold is allowed to pass in front of the number for the heart of this scene,
    // then recedes behind it again before the number hands off to the value price
    goldLayerB.style.zIndex = (p > MAT_A_END + 0.06 && p < MAT_END - 0.05) ? 4 : '';

    var megaIn = mapRange(p, MAT_A_END, MAT_A_END + 0.06);
    var megaOut = mapRange(p, MAT_END - 0.05, MAT_END);
    var megaOpacity = megaIn * (1 - megaOut);
    megaNumber.style.opacity = megaOpacity;
    megaNumber.style.transform = 'translate(-50%,-50%) scale(' + (0.7 + megaIn * 0.3 + megaOut * 0.15) + ')';
    megaDigits.forEach(function(d, i){
      var dt = mapRange(p, MAT_A_END + i * 0.012, MAT_A_END + 0.05 + i * 0.012);
      var eased = gsap.parseEase('power4.out')(dt);
      d.style.transform = 'translateY(' + (-0.5 + eased * 0.5) + 'em)';
    });
    megaCaption.style.opacity = mapRange(p, MAT_A_END + 0.05, MAT_A_END + 0.11) * (1 - megaOut);

    // VALUE: composition shifts, gold moves aside, integrated price appears
    var valueT = mapRange(p, MAT_END, VALUE_END);
    var valueEase = gsap.parseEase('power2.out')(valueT);
    goldLayerB.style.transform = 'translateX(' + (-valueEase * 14) + 'vw) scale(' + (1 + valueEase * 0.06) + ')';
    if (valueT > 0) setTime(videoB, EDGE_B + (DUR_B * 0.9 - EDGE_B) + valueEase * (DUR_B - (EDGE_B + (DUR_B * 0.9 - EDGE_B))));
    valuePrice.style.opacity = mapRange(p, MAT_END + 0.05, VALUE_END - 0.05);
    valuePrice.style.transform = 'translateY(-50%) translateX(' + (24 - valueEase * 24) + 'px)';

    actProgressDot.style.transform = 'translateY(' + (p * 18) + 'vh)';
  }
  renderAct(0);

  /* ============ MARKET: staggered reveal ============ */
  ScrollTrigger.batch('[data-rate]', {
    start: 'top 85%',
    onEnter: function(batch){
      gsap.to(batch, {opacity:1, y:0, duration:0.7, stagger:0.12, ease:'power3.out'});
    }
  });

  /* ============ PRODUCT TRANSFORMATION: pinned video scrub + handoff ============ */
  var transformBar = document.getElementById('transformBar');
  var transformCaption = document.getElementById('transformCaption');

  ScrollTrigger.create({
    trigger: '#transformStage',
    start: 'top top',
    end: 'bottom bottom',
    pin: '.transform-inner',
    scrub: 0.4,
    onUpdate: function(self){
      var p = self.progress;
      // scrub videoC in reverse: bar recedes/transforms rather than simply looping
      setTime(videoC, DUR_C - p * DUR_C * 0.95);
      var barIn = mapRange(p, 0.55, 0.85);
      transformBar.style.opacity = barIn;
      transformCaption.style.opacity = mapRange(p, 0.35, 0.6) * (1 - mapRange(p, 0.9, 1));
      videoC.parentElement.style.opacity = 1 - mapRange(p, 0.7, 1);
    }
  });

  /* ============ product rows: light entrance on scroll ============ */
  gsap.utils.toArray('.product-row').forEach(function(row){
    gsap.fromTo(row, {opacity:0, y:24}, {
      opacity:1, y:0, duration:0.7, ease:'power3.out',
      scrollTrigger:{trigger:row, start:'top 88%'}
    });
  });

})();
