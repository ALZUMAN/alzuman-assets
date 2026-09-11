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

  /* ============ video autoplay (native timing — never seeked by scroll) ============ */
  var videoA = document.getElementById('videoA');
  var videoB = document.getElementById('videoB');
  var videoC = document.getElementById('videoC');
  [videoA, videoB, videoC].forEach(function(v){ v.play().catch(function(){}); });

  /* ============ reduced motion: static fallback ============ */
  if (reduceMotion || !window.gsap || !window.ScrollTrigger){
    siteHeader.style.background = 'rgba(247,243,236,.86)';
    siteHeader.style.backdropFilter = 'blur(10px)';
    document.getElementById('headerWordmark').style.opacity = 1;
    document.getElementById('headerWordmark').style.transform = 'translateY(0)';
    document.getElementById('goldFrame').style.opacity = 1;
    document.getElementById('goldLayerA').style.opacity = 1;
    document.getElementById('goldLayerB').style.opacity = 0;
    ['arrivalPhrase','megaNumber','megaCaption','valuePrice'].forEach(function(id){
      document.getElementById(id).style.opacity = 1;
    });
    document.querySelectorAll('.aw i, .mask-line i').forEach(function(i){ i.style.transform = 'translateY(0)'; });
    document.querySelectorAll('.mn-d').forEach(function(d){ d.style.transform = 'translateY(0)'; });
    document.getElementById('brandLogo').style.opacity = 1;
    document.getElementById('brandLogo').style.transform = 'scale(1)';
    document.getElementById('transformFrame').style.opacity = 0;
    document.getElementById('transformBar').style.opacity = 1;
    document.getElementById('transformCaption').style.opacity = 1;
    document.querySelectorAll('[data-rate]').forEach(function(r){ r.style.opacity = 1; r.style.transform = 'none'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var brandMark = document.getElementById('brandMark');
  var scrollInvite = document.getElementById('scrollInvite');
  var scrollPeek = document.getElementById('scrollPeek');
  var brandLogo = document.getElementById('brandLogo');
  var headerWordmark = document.getElementById('headerWordmark');
  var goldFrame = document.getElementById('goldFrame');
  var goldLayerA = document.getElementById('goldLayerA');
  var goldLayerB = document.getElementById('goldLayerB');
  var transitionFlash = document.getElementById('transitionFlash');
  var arrivalWords = document.querySelectorAll('#arrivalPhrase .aw i');
  var megaNumber = document.getElementById('megaNumber');
  var megaDigits = document.querySelectorAll('#megaNumber .mn-d');
  var megaCaption = document.getElementById('megaCaption');
  var valuePrice = document.getElementById('valuePrice');
  var actProgressDot = document.getElementById('actProgressDot');

  function ease(name, t){ return gsap.parseEase(name)(clamp(t,0,1)); }

  // generic continuous keyframe interpolator: points = [[progress, value], ...],
  // eased between each pair so nothing ever snaps and reverse-scroll is exact.
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

  // scene boundaries (fractions of pin-stage progress, matching the 0-60% overall storyline)
  var BRAND_END = 0.20;
  var ARRIVAL_END = 0.467;
  var MAT_A_END = 0.60;
  var CROSS_END = 0.62;
  var MACRO_START = 0.66;
  var MACRO_PEAK = 0.70;
  var MACRO_END = 0.735;
  var MAT_END = 0.75;
  var VALUE_END = 1.0;

  // the bullion frame's width in vw, and its horizontal drift, as one continuous
  // curve across the whole act — clamped well inside the 30-48vw brief limit,
  // with exactly one deliberate macro moment that immediately restores scale after.
  var GOLD_WIDTH_KF = [
    [0, 0], [BRAND_END, 0], [BRAND_END + 0.05, 9], [ARRIVAL_END, 34],
    [MAT_A_END, 36], [CROSS_END, 36], [MACRO_START, 38],
    [MACRO_PEAK, 54], [MACRO_END, 40], [MAT_END, 40], [VALUE_END, 33]
  ];
  var GOLD_X_KF = [[0, 0], [MAT_END, 0], [VALUE_END, -15]];

  /* ============ ACT I master scrub: Brand -> Arrival -> Material -> Value ============ */
  ScrollTrigger.create({
    trigger: '#pinStage',
    start: 'top top',
    end: 'bottom bottom',
    pin: '.pin-inner',
    scrub: 0.4,
    onUpdate: function(self){ renderAct(self.progress); }
  });

  // BRAND FORMATION: plays once automatically on load — the first screen must
  // already read as ALZUMAN before the visitor does anything, not after they scroll.
  // Uses the supplied logo exactly as designed (its own typography, not a substitute font).
  gsap.set(brandLogo, {opacity:0, scale:0.9, transformOrigin:'50% 50%'});
  gsap.to(brandLogo, {opacity:1, scale:1, duration:0.95, ease:'power3.out', delay:0.1});

  function renderAct(p){
    // scroll cues fade once the visitor actually starts scrolling
    var cueOpacity = 1 - mapRange(p, 0.035, 0.09);
    scrollInvite.style.opacity = cueOpacity;
    scrollPeek.style.opacity = cueOpacity;

    // ARRIVAL: whole brand mark migrates toward header (continuous scale + position,
    // never an abrupt swap), header solidifies smoothly, phrase rises
    var arriveT = mapRange(p, BRAND_END, ARRIVAL_END);
    var arriveEase = ease('power3.inOut', arriveT);
    var markScale = 1 - arriveEase * 0.72;
    var markY = arriveEase * -38;
    brandMark.style.transform = 'translateY(' + markY + 'vh) scale(' + markScale + ')';
    brandMark.style.opacity = 1 - mapRange(p, ARRIVAL_END - 0.04, ARRIVAL_END);

    var headerT = mapRange(p, ARRIVAL_END - 0.14, ARRIVAL_END + 0.01);
    var headerEase = ease('power2.inOut', headerT);
    siteHeader.style.background = 'rgba(247,243,236,' + (headerEase * 0.86) + ')';
    siteHeader.style.backdropFilter = 'blur(' + (headerEase * 10) + 'px)';
    siteHeader.style.boxShadow = '0 1px 0 rgba(27,42,65,' + (headerEase * 0.06) + ')';
    headerWordmark.style.opacity = headerEase;
    headerWordmark.style.transform = 'translateY(' + (6 - headerEase * 6) + 'px)';

    arrivalWords.forEach(function(word, i){
      var wt = mapRange(p, BRAND_END + 0.06 + i * 0.03, BRAND_END + 0.20 + i * 0.03);
      var eased = ease('power4.out', wt);
      word.style.transform = 'translateY(' + (105 - eased * 105) + '%)';
    });

    // GOLD FRAME: one continuous width/position curve — small window, soft-masked
    // edges, one deliberate macro close-up that immediately restores comfortable scale
    var frameW = kf(p, GOLD_WIDTH_KF);
    var frameX = kf(p, GOLD_X_KF);
    goldFrame.style.width = frameW + 'vw';
    goldFrame.style.transform = 'translate(calc(-50% + ' + frameX + 'vw), -50%)';
    goldFrame.style.opacity = mapRange(p, BRAND_END + 0.02, BRAND_END + 0.12);

    // crossfade between the two clips behind a brief gold-reflection flash
    var crossT = mapRange(p, MAT_A_END, CROSS_END);
    goldLayerA.style.opacity = 1 - crossT;
    goldLayerB.style.opacity = crossT;
    transitionFlash.style.opacity = (1 - Math.abs(crossT * 2 - 1)) * (crossT > 0 && crossT < 1 ? 0.9 : 0);

    // gold is allowed in front of the number for the heart of this scene, then recedes
    goldFrame.style.zIndex = (p > MAT_A_END + 0.06 && p < MAT_END - 0.05) ? 4 : 2;

    var megaIn = mapRange(p, MAT_A_END, MAT_A_END + 0.06);
    megaDigits.forEach(function(d, i){
      var dt = mapRange(p, MAT_A_END + i * 0.012, MAT_A_END + 0.05 + i * 0.012);
      var eased = ease('power4.out', dt);
      d.style.transform = 'translateY(' + (-0.5 + eased * 0.5) + 'em)';
    });

    // the number is a graphic object first, then shrinks into a small persistent
    // annotation once the value scene takes over — it never simply vanishes
    var megaScale = kf(p, [[MAT_A_END, 0.7], [MAT_A_END + 0.06, 1.0], [MAT_END - 0.05, 1.05], [MAT_END, 0.24], [VALUE_END, 0.24]]);
    var megaY = kf(p, [[MAT_END - 0.05, 0], [MAT_END, -30], [VALUE_END, -30]]);
    var megaOpacity = kf(p, [[MAT_A_END, 0], [MAT_A_END + 0.06, 1], [MAT_END - 0.05, 1], [MAT_END, 0.85], [VALUE_END, 0.85]]);
    megaNumber.style.opacity = megaOpacity;
    megaNumber.style.transform = 'translate(-50%,calc(-50% + ' + megaY + 'vh)) scale(' + megaScale + ')';
    megaCaption.style.opacity = mapRange(p, MAT_A_END + 0.05, MAT_A_END + 0.11) * (1 - mapRange(p, MAT_END - 0.05, MAT_END));

    // VALUE: price becomes typography, not a card — gold stays nearby, smaller
    valuePrice.style.opacity = mapRange(p, MAT_END + 0.05, VALUE_END - 0.05);
    valuePrice.style.transform = 'translateY(-50%) translateX(' + (24 - ease('power2.out', mapRange(p, MAT_END, VALUE_END)) * 24) + 'px)';

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

  /* ============ PRODUCT TRANSFORMATION: the cinematic bar shrinks into the first product ============ */
  var transformFrame = document.getElementById('transformFrame');
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
      var frameW = kf(p, [[0, 34], [0.55, 34], [0.85, 15]]);
      transformFrame.style.width = frameW + 'vw';
      transformFrame.style.opacity = 1 - mapRange(p, 0.75, 0.94);
      transformBar.style.opacity = mapRange(p, 0.58, 0.82);
      transformCaption.style.opacity = mapRange(p, 0.32, 0.55) * (1 - mapRange(p, 0.86, 1));
    }
  });

  gsap.fromTo('#shopTitleWord', {yPercent:105}, {
    yPercent:0, duration:0.9, ease:'power4.out',
    scrollTrigger:{trigger:'#shop', start:'top 82%'}
  });

  /* ============ product rows: light entrance on scroll ============ */
  gsap.utils.toArray('.product-row').forEach(function(row){
    gsap.fromTo(row, {opacity:0, y:24}, {
      opacity:1, y:0, duration:0.7, ease:'power3.out',
      scrollTrigger:{trigger:row, start:'top 88%'}
    });
  });

})();
