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
    {label:'50 غراماً', grams:50, dims:'28 × 45 × 1.6 مم', feature:true},
    {label:'100 غرام', grams:100, dims:'34 × 55 × 2.1 مم', feature:true},
    {label:'1 أونصة', grams:OUNCE_GRAMS, dims:'24 × 41 × 1.9 مم', feature:true}
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

  /* ============ product collection — editorial gallery, real bullion photography ============ */
  var productList = document.getElementById('productList');
  WEIGHTS.forEach(function(w){
    var row = document.createElement('div');
    row.className = 'product-row' + (w.feature ? ' feature' : '');
    row.setAttribute('data-reveal','');
    row.innerHTML =
      '<div class="product-visual"><img src="/assets/alzuman-bar-front.jpg" alt="سبيكة الزومان — '+w.label+'"></div>' +
      '<div class="product-info">' +
        '<span class="product-weight">'+w.label+'</span>' +
        '<span class="product-purity">عيار ٩٩٩.٩ · '+w.dims+'</span>' +
        '<span class="product-price num"></span>' +
        '<span class="product-stock">متوفر</span>' +
        '<a href="tel:0562658444" class="product-cta">عرض السبيكة</a>' +
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

  /* ============ single hero video: play/pause via IntersectionObserver ============ */
  var heroVideo = document.getElementById('v1');
  if (heroVideo){
    if ('IntersectionObserver' in window){
      var videoObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){ heroVideo.play().catch(function(){}); }
          else { heroVideo.pause(); }
        });
      }, {rootMargin:'40% 0px 40% 0px', threshold:0.01});
      videoObserver.observe(heroVideo);
    } else {
      heroVideo.play().catch(function(){});
    }
  }

  /* ============ generic reveal-on-scroll for [data-reveal], works without GSAP too ============ */
  var revealTargets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (!reduceMotion && 'IntersectionObserver' in window){
    var revealObserver = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)';
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'none';
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:0.15, rootMargin:'0px 0px -8% 0px'});
    revealTargets.forEach(function(el, i){
      el.style.transitionDelay = (i % 4) * 60 + 'ms';
      revealObserver.observe(el);
    });
  } else {
    revealTargets.forEach(function(el){ el.style.opacity = 1; el.style.transform = 'none'; });
  }

  /* ============ Section 2 headline mask-reveal lines ============ */
  var s2Lines = Array.prototype.slice.call(document.querySelectorAll('.s2-headline .line'));
  if (!reduceMotion && 'IntersectionObserver' in window && s2Lines.length){
    var lineObserver = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          var idx = s2Lines.indexOf(entry.target);
          setTimeout(function(){ entry.target.classList.add('in'); }, idx * 140);
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:0.4});
    s2Lines.forEach(function(el){ lineObserver.observe(el); });
  } else {
    s2Lines.forEach(function(el){ el.classList.add('in'); });
  }

  if (reduceMotion || !window.gsap || !window.ScrollTrigger){ return; }

  gsap.registerPlugin(ScrollTrigger);
  function setOpacity(el, v){ if (el) el.style.opacity = v; }

  /* ============ SECTION 1: cinematic opening hero — settle in, then release to the page ============ */
  var s1Logo = document.getElementById('s1Logo');
  var s1Sub = document.getElementById('s1Sub');
  var s1SubMicro = document.getElementById('s1SubMicro');
  var s1ScrollCue = document.getElementById('s1ScrollCue');
  var s1VideoWrap = document.getElementById('s1VideoWrap');
  var headerMark = document.getElementById('headerMark');

  ScrollTrigger.create({
    trigger:'#s1Stage', start:'top top', end:'bottom bottom', scrub:.4,
    onUpdate:function(self){
      var p = self.progress;
      var settleOut = 1 - mapRange(p,.55,.78);
      setOpacity(s1Logo, mapRange(p,.02,.12) * settleOut);
      s1Logo.style.transform = 'translate(-50%,0) translateY(' + (-p*8) + 'vh)';
      setOpacity(s1SubMicro, mapRange(p,.1,.2) * settleOut);
      setOpacity(s1Sub, mapRange(p,.15,.25) * settleOut);
      setOpacity(s1ScrollCue, mapRange(p,.05,.14) * (1-mapRange(p,.16,.3)));
      var headerEase = mapRange(p,.55,.85);
      siteHeader.style.background = 'rgba(244,239,231,' + (headerEase*.92) + ')';
      headerMark.style.opacity = headerEase;
      headerMark.style.transform = 'translateY(' + (6-headerEase*6) + 'px)';
      s1VideoWrap.style.transform = 'scale(' + (1 - mapRange(p,.5,1)*.1) + ')';
      s1VideoWrap.style.opacity = 1 - mapRange(p,.8,1);
    }
  });

  /* ============ Section 2: product image parallax, 3-5% slower than scroll ============ */
  var s2Product = document.querySelector('.s2-product');
  if (s2Product){
    gsap.to(s2Product, {
      yPercent:-6, ease:'none',
      scrollTrigger:{ trigger:'#s2', start:'top bottom', end:'bottom top', scrub:.6 }
    });
  }

})();
