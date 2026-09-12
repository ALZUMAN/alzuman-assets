(function(){
  'use strict';

  var clamp = function(v,min,max){ return Math.max(min,Math.min(max,v)); };
  var mapRange = function(p,a,b){ return clamp((p-a)/(b-a),0,1); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ pricing engine ============ */
  var OUNCE_GRAMS = 31.1035;
  var SAR_PER_USD = 3.75;
  var WEIGHTS = [
    {label:'1 غرام',     grams:1},
    {label:'2.5 غرام',   grams:2.5},
    {label:'5 غرامات',   grams:5},
    {label:'10 غرامات',  grams:10},
    {label:'20 غراماً',  grams:20},
    {label:'50 غراماً',  grams:50},
    {label:'100 غرام',   grams:100},
    {label:'1 أونصة',    grams:OUNCE_GRAMS}
  ];
  var ouncePrice = 4183.40;

  function formatSAR(v){ return v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' ر.س'; }
  function formatUSD(v){ return '$' + v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function priceForGrams(g){ return ((ouncePrice + 50) / OUNCE_GRAMS) * SAR_PER_USD * g; }
  function priceForKarat(k){ return priceForGrams(1) * (k/24); }

  var priceTargets = {
    rate24k: document.getElementById('rate24k'),
    rate22k: document.getElementById('rate22k'),
    rate21k: document.getElementById('rate21k'),
    rate18k: document.getElementById('rate18k'),
    rateOunceUsd: document.getElementById('rateOunceUsd'),
    tickerOunce: document.getElementById('tickerOunce'),
    fbOunce: document.getElementById('fbOunce'),
    fb24: document.getElementById('fb24'), fb22: document.getElementById('fb22'),
    fb21: document.getElementById('fb21'), fb18: document.getElementById('fb18')
  };
  var trendTargets = [document.getElementById('ounceTrend'), document.getElementById('tickerTrend')];
  var slidePriceEls = [];

  function renderPrices(direction){
    if (priceTargets.rate24k) priceTargets.rate24k.textContent = formatSAR(priceForKarat(24));
    if (priceTargets.rate22k) priceTargets.rate22k.textContent = formatSAR(priceForKarat(22));
    if (priceTargets.rate21k) priceTargets.rate21k.textContent = formatSAR(priceForKarat(21));
    if (priceTargets.rate18k) priceTargets.rate18k.textContent = formatSAR(priceForKarat(18));
    if (priceTargets.rateOunceUsd) priceTargets.rateOunceUsd.textContent = formatUSD(ouncePrice);
    if (priceTargets.tickerOunce) priceTargets.tickerOunce.textContent = formatUSD(ouncePrice);
    if (priceTargets.fbOunce) priceTargets.fbOunce.textContent = formatUSD(ouncePrice);
    if (priceTargets.fb24) priceTargets.fb24.textContent = formatSAR(priceForKarat(24));
    if (priceTargets.fb22) priceTargets.fb22.textContent = formatSAR(priceForKarat(22));
    if (priceTargets.fb21) priceTargets.fb21.textContent = formatSAR(priceForKarat(21));
    if (priceTargets.fb18) priceTargets.fb18.textContent = formatSAR(priceForKarat(18));
    slidePriceEls.forEach(function(p){ p.el.textContent = formatSAR(priceForGrams(p.grams)); });

    trendTargets.forEach(function(el){
      if (!el) return;
      el.classList.remove('up','down');
      if (direction === 'up'){ el.classList.add('up'); el.textContent = '▲ 0.42%'; }
      else if (direction === 'down'){ el.classList.add('down'); el.textContent = '▼ 0.42%'; }
      else { el.textContent = '—'; }
    });
  }
  function updatePrice(){
    var prev = ouncePrice;
    ouncePrice = Math.round((ouncePrice + (Math.random()*2-1)*2.4) * 100) / 100;
    renderPrices(ouncePrice > prev ? 'up' : (ouncePrice < prev ? 'down' : null));
  }
  renderPrices(null);
  window.setInterval(updatePrice, 5000);

  /* ============ scene 8: build carousel slides ============ */
  var carousel = document.getElementById('s8Carousel');
  var dotsWrap = document.getElementById('s8Dots');
  var slides = [];
  if (carousel){
    WEIGHTS.forEach(function(w, i){
      var slide = document.createElement('div');
      slide.className = 's8-slide';
      slide.innerHTML =
        '<div class="bullion-bar" style="--bar-w:170px;--bar-h:100px;"><span>999.9</span></div>' +
        '<span class="weight">'+w.label+'</span>' +
        '<span class="purity">ذهب نقي 999.9</span>' +
        '<span class="price num"></span>' +
        '<span class="stock">متوفر</span>' +
        '<a href="tel:0562658444" class="cta">عرض السبيكة</a>';
      carousel.appendChild(slide);
      slides.push(slide);
      slidePriceEls.push({el:slide.querySelector('.price'), grams:w.grams});

      var dot = document.createElement('i');
      dotsWrap.appendChild(dot);
    });
    renderPrices(null);
  }
  var dots = dotsWrap ? dotsWrap.querySelectorAll('i') : [];

  /* ============ header + mobile menu ============ */
  var menuBtn = document.getElementById('menuBtn');
  var menuCloseBtn = document.getElementById('menuCloseBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  function openMenu(){ mobileMenu.classList.add('open'); menuBtn.setAttribute('aria-expanded','true'); }
  function closeMenu(){ mobileMenu.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); }
  menuBtn.addEventListener('click', openMenu);
  menuCloseBtn.addEventListener('click', closeMenu);

  var scrollSpacer = document.getElementById('scrollSpacer');
  function jumpTo(frac){
    var h = scrollSpacer.getBoundingClientRect().height;
    window.scrollTo({top: h * frac, behavior:'smooth'});
  }
  document.querySelectorAll('[data-jump]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      closeMenu();
      jumpTo(parseFloat(a.getAttribute('data-jump')));
    });
  });

  /* ============ reduced motion: nothing else to wire up ============ */
  if (reduceMotion || !window.gsap || !window.ScrollTrigger){
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
  // fade in over [inA,inB], hold, fade out over [outA,outB]
  function win(p, inA, inB, outA, outB){
    return mapRange(p, inA, inB) * (1 - mapRange(p, outA, outB));
  }

  var stage = document.getElementById('stage');
  var bgSymbol = document.getElementById('bgSymbol');
  var stageTicker = document.getElementById('stageTicker');
  var stageLogo = document.getElementById('stageLogo');
  var barWrap = document.getElementById('barWrap');
  var barFlip = document.getElementById('barFlip');
  var tag1 = document.getElementById('tag1');
  var tag2 = document.getElementById('tag2');

  var s1Headline = document.getElementById('s1Headline');
  var s1Sub = document.getElementById('s1Sub');
  var s1Micro = document.getElementById('s1Micro');
  var s1Hint = document.getElementById('s1Hint');

  var s2Phrases = document.querySelectorAll('.s2-phrase');
  var s2Final = document.getElementById('s2Final');

  var s3Head = document.getElementById('s3Head');
  var s3List = document.getElementById('s3List');
  var s3Items = document.querySelectorAll('.s3-item');

  var s4Micro = document.getElementById('s4Micro');
  var s4Caption = document.getElementById('s4Caption');
  var s4Line1 = document.getElementById('s4Line1');
  var s4Line2 = document.getElementById('s4Line2');

  var s5Head = document.getElementById('s5Head');
  var priceIndex = document.getElementById('priceIndex');

  var s6Macro = document.getElementById('s6Macro');
  var s6Text = document.getElementById('s6Text');

  var s7Content = document.getElementById('s7Content');
  var s7ValueSpans = document.querySelectorAll('#s7Values span');

  var s8Head = document.getElementById('s8Head');
  var s8Dots = document.getElementById('s8Dots');

  var s9Content = document.getElementById('s9Content');

  // ---- section boundaries (fractions of total narrative) ----
  var S1_END = .11, S2_END = .23, S3_END = .34;
  var S4A=.38, S4B=.42, S4C=.46, S4D=.49, S4E=.53, S4_END=.57;
  var S5_END = .69, S6_END = .77, S7_END = .85, S8_END = .97;

  var S4_STATES = [
    {end:S4A, micro:'01 / FRONT', l1:'1 OUNCE', l2:'FINE GOLD 999.9'},
    {end:S4B, micro:'02 / PURITY', l1:'نقاء 999.9', l2:''},
    {end:S4C, micro:'03 / WEIGHT', l1:'وزن واضح.', l2:'قيمة معلومة.'},
    {end:S4D, micro:'04 / EDGE PROFILE', l1:'حضور مادي حقيقي.', l2:''},
    {end:S4E, micro:'05 / REVERSE', l1:'', l2:''},
    {end:S4_END, micro:'06 / DETAIL', l1:'تفاصيل تُرى.', l2:'قيمة تُحفظ.'}
  ];

  function setOpacity(el, v){ if (el) el.style.opacity = v; }

  function masterUpdate(p){
    // ---------- background symbol ----------
    var symOpacity = win(p, 0, .02, .10, S1_END) * .045 + win(p, S7_END-.01, S7_END+.02, S8_END-.03, S8_END) * .04;
    bgSymbol.style.opacity = clamp(symOpacity, 0, .06);
    bgSymbol.style.transform = 'translate(-50%,-50%) scale(' + (1.04 - mapRange(p,0,.03)*.04) + ')';

    // ---------- ticker ----------
    stageTicker.style.opacity = win(p, .015, .05, S8_END-.05, S8_END);

    // ---------- logo: upper-center -> migrates toward header ----------
    var logoIn = win(p, 0, .03, S1_END-.02, S1_END+.02);
    var migrateT = ease('power2.inOut', mapRange(p, S1_END-.05, S1_END+.03));
    stageLogo.style.opacity = p < S1_END - .03 ? logoIn : Math.max(logoIn, .85);
    stageLogo.style.transform = 'translate(-50%,0) translateY(' + (-migrateT*4) + 'vh) scale(' + (1-migrateT*.55) + ')';

    // ================= PERSISTENT BAR =================
    var barH = kf(p, [
      [0, 50],
      [S1_END, 55],
      [S2_END, 62],
      [S2_END+.03, 40], [S3_END, 34],
      [S3_END+.02, 62],
      [S4A, 62], [S4B, 94], [S4C, 94], [S4D, 69], [S4E, 71], [S4_END, 80],
      [S5_END, 60],
      [S6_END, 118],
      [S7_END, 66],
      [S7_END+.01, 66], [S8_END, 66],
      [1, 66]
    ]);
    var barOpacity = kf(p, [
      [0,0],[.02,1],
      [S5_END-.01,1],[S5_END, .28],
      [S6_END-.02, .6],[S6_END, .6],
      [S7_END-.02, .16],[S7_END, .16],
      [S7_END+.03, 0],
      [S8_END, 0],[1,0]
    ]);
    var rotY = kf(p, [
      [0,-14],[S1_END,-8],
      [S2_END,0],[S3_END,4],
      [S4A,0],[S4B,0],[S4C,0],[S4D,22],[S4E,165],[S4_END,180],
      [S5_END,60],[S6_END,0],[S7_END,-30],[1,-30]
    ]);
    var rotX = kf(p, [[0,2],[S1_END,1],[S3_END,0],[1,0]]);
    var rotZ = kf(p, [[0,-1],[S1_END,0],[1,0]]);
    var posX = kf(p, [
      [0,50],[S1_END,50],
      [S2_END,58],[S3_END,58],
      [S4_END,50],
      [S5_END,10],[S6_END,50],[S7_END,84],[1,84]
    ]);
    var posY = kf(p, [
      [0,59],[S1_END,55],
      [S2_END,48],[S2_END+.03,22],[S3_END,20],
      [S3_END+.02,46],
      [S4_END,46],
      [S5_END,86],[S6_END,50],[S7_END,50],[1,50]
    ]);

    barWrap.style.left = posX + 'vw';
    barWrap.style.top = posY + 'vh';
    barWrap.style.opacity = barOpacity;
    barFlip.style.setProperty('--bar-h', barH + 'vh');
    barFlip.style.transform = 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) rotateZ(' + rotZ + 'deg)';

    tag1.style.opacity = win(p, S4A+.005, S4A+.02, S4B-.01, S4B+.005);
    tag2.style.opacity = win(p, S4B+.005, S4B+.02, S4C-.01, S4C+.005);

    // ================= SCENE 1 =================
    var s1w = win(p, .01, .035, S1_END-.03, S1_END);
    setOpacity(s1Headline, s1w);
    setOpacity(s1Sub, win(p, .03, .06, S1_END-.03, S1_END));
    setOpacity(s1Micro, win(p, .05, .08, S1_END-.03, S1_END));
    setOpacity(s1Hint, win(p, .07, .095, S1_END-.015, S1_END));

    // ================= SCENE 2 =================
    var s2Local = mapRange(p, S1_END, S2_END);
    var segCount = s2Phrases.length;
    var seg = 1/segCount;
    s2Phrases.forEach(function(ph, i){
      var start = i*seg, end = start+seg;
      var inT = ease('power3.out', mapRange(s2Local, start, start+seg*.35));
      var outT = ease('power2.in', mapRange(s2Local, end-seg*.3, end));
      var opacity = (p < S1_END || p > S2_END) ? 0 : inT * (1-outT);
      ph.style.opacity = opacity;
      ph.style.clipPath = 'inset(0 0 ' + (100-inT*100) + '% 0)';
      ph.style.transform = 'translateY(' + ((1-inT)*20 - outT*14) + 'px)';
    });
    setOpacity(s2Final, win(p, S2_END-.04, S2_END-.015, S2_END, S2_END+.01));

    // ================= SCENE 3 =================
    setOpacity(s3Head, win(p, S2_END+.005, S2_END+.03, S3_END-.02, S3_END));
    setOpacity(s3List, win(p, S2_END+.02, S2_END+.05, S3_END-.015, S3_END+.015));
    var s3Local = mapRange(p, S2_END, S3_END);
    var stepSeg = 1/s3Items.length;
    s3Items.forEach(function(item, i){
      var active = s3Local >= i*stepSeg && s3Local < (i+1)*stepSeg;
      if (i === s3Items.length-1 && s3Local >= 1) { /* keep last active at end */ }
      item.classList.toggle('active', active || (i===s3Items.length-1 && s3Local>=1));
    });

    // ================= SCENE 4 =================
    var cur = S4_STATES[0];
    for (var i=0;i<S4_STATES.length;i++){ if (p <= S4_STATES[i].end){ cur = S4_STATES[i]; break; } }
    if (p >= S3_END && p <= S4_END){
      if (s4Micro.textContent !== cur.micro) s4Micro.textContent = cur.micro;
      if (s4Line1.textContent !== cur.l1) s4Line1.textContent = cur.l1;
      if (s4Line2.textContent !== cur.l2) s4Line2.textContent = cur.l2;
    }
    setOpacity(s4Micro, win(p, S3_END+.005, S3_END+.02, S4_END-.02, S4_END));
    setOpacity(s4Caption, win(p, S3_END+.01, S3_END+.03, S4_END-.02, S4_END));

    // ================= SCENE 5 =================
    setOpacity(s5Head, win(p, S4_END+.005, S4_END+.03, S5_END-.03, S5_END));
    setOpacity(priceIndex, win(p, S4_END+.02, S4_END+.05, S5_END-.03, S5_END));

    // ================= SCENE 6 =================
    setOpacity(s6Macro, win(p, S5_END+.005, S5_END+.03, S6_END-.02, S6_END) * .9);
    setOpacity(s6Text, win(p, S5_END+.015, S5_END+.05, S6_END-.02, S6_END));

    // ================= SCENE 7 =================
    var s7w = win(p, S6_END+.005, S6_END+.03, S7_END-.02, S7_END);
    setOpacity(s7Content, s7w);
    var s7Local = mapRange(p, S6_END, S7_END);
    s7ValueSpans.forEach(function(sp, i){
      var t = ease('power3.out', mapRange(s7Local, .35+i*.15, .35+i*.15+.18));
      sp.style.opacity = t;
      sp.style.transform = 'translateY(' + (10-t*10) + 'px)';
    });

    // ================= SCENE 8 =================
    setOpacity(s8Head, win(p, S7_END+.005, S7_END+.03, S8_END-.03, S8_END));
    var s8Local = mapRange(p, S7_END+.02, S8_END);
    var sCount = slides.length;
    var sSeg = 1/sCount;
    slides.forEach(function(slide, i){
      var start = i*sSeg, end = start+sSeg;
      var inT = ease('power2.out', mapRange(s8Local, start, start+sSeg*.3));
      var outT = ease('power2.in', mapRange(s8Local, end-sSeg*.3, end));
      var opacity = (p < S7_END+.02 || p > S8_END) ? (i===0 && p<=S7_END+.02 ? 0 : 0) : inT*(1-outT);
      slide.style.opacity = opacity;
      slide.style.transform = 'translateY(' + ((1-inT)*16) + 'px)';
      if (dots[i]) dots[i].classList.toggle('active', s8Local >= start && s8Local < end);
    });
    setOpacity(s8Dots, win(p, S7_END+.03, S7_END+.06, S8_END-.02, S8_END));

    // ================= SCENE 9 =================
    setOpacity(s9Content, mapRange(p, S8_END+.01, .995));
  }

  ScrollTrigger.create({
    trigger:'#scrollSpacer', start:'top top', end:'bottom bottom', scrub:.35,
    onUpdate:function(self){ masterUpdate(self.progress); },
    onLeave:function(){
      var h = scrollSpacer.getBoundingClientRect().height;
      stage.style.position = 'absolute';
      stage.style.top = (h - window.innerHeight) + 'px';
      stage.style.bottom = 'auto';
    },
    onEnterBack:function(){
      stage.style.position = 'fixed';
      stage.style.top = '0';
      stage.style.bottom = 'auto';
    }
  });

  masterUpdate(0);

})();
