(function(){
  'use strict';

  /* ============ helpers ============ */
  var clamp = function(v,min,max){ return Math.max(min,Math.min(max,v)); };

  /* ============ 2) BAR WINDOWS: fixed-pixel scroll trigger (one per clip) ============ */
  var hero = document.getElementById('hero');
  var heroHeight = hero.offsetHeight;

  var barScenes = Array.prototype.map.call(document.querySelectorAll('[data-bar-scene]'), function(scene){
    return {
      scene: scene,
      frame: scene.querySelector('[data-bar-frame]'),
      video: scene.querySelector('[data-bar-video]'),
      src: scene.getAttribute('data-src'),
      loaded: false,
      top: scene.offsetTop,
      height: scene.offsetHeight
    };
  });

  window.addEventListener('resize', function(){
    heroHeight = hero.offsetHeight;
    barScenes.forEach(function(b){
      b.top = b.scene.offsetTop;
      b.height = b.scene.offsetHeight;
    });
  });

  var OPEN_RATIO = 0.6; // open once we've scrolled 60% of the hero's height

  function openBarScene(b){
    b.frame.classList.add('open');
    if (!b.loaded){
      b.loaded = true;
      b.video.src = b.src;
      b.video.play().catch(function(){ /* autoplay may be deferred until user interaction on some browsers */ });
    }
  }

  /* ============ 7) trust line: letter by letter ============ */
  var trustLine = document.getElementById('trustLine');
  var trustText = trustLine.getAttribute('aria-label') || trustLine.textContent;
  (function buildTrustLetters(){
    var frag = document.createDocumentFragment();
    for (var i = 0; i < trustText.length; i++){
      var span = document.createElement('span');
      span.className = 'ch';
      span.textContent = trustText[i];
      frag.appendChild(span);
    }
    trustLine.textContent = '';
    trustLine.appendChild(frag);
  })();
  var trustChars = trustLine.querySelectorAll('.ch');
  var trustScene = document.getElementById('trust-scene');
  var trustSceneTop = trustScene.offsetTop;
  var trustSceneHeight = trustScene.offsetHeight;
  window.addEventListener('resize', function(){
    trustSceneTop = trustScene.offsetTop;
    trustSceneHeight = trustScene.offsetHeight;
  });

  /* ============ scroll handler (rAF throttled, fixed-pixel math) ============ */
  var ticking = false;
  function onScroll(){
    if (!ticking){
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }
  function handleScroll(){
    ticking = false;
    var y = window.scrollY || window.pageYOffset;

    // 2) open each bar window once we pass a fixed ratio of the hero height
    // (first window uses the hero as its trigger reference; each subsequent
    // window uses its own offsetTop, so opening stays tied to fixed pixel
    // positions rather than fragile viewport-relative rects)
    barScenes.forEach(function(b, i){
      var threshold = i === 0 ? heroHeight * OPEN_RATIO : b.top - window.innerHeight * (1 - OPEN_RATIO);
      if (y > threshold){
        openBarScene(b);
      }
    });

    // 7) trust line lights up letter by letter with scroll progress
    var viewportH = window.innerHeight;
    var progress = (y + viewportH - trustSceneTop) / (trustSceneHeight * 0.9);
    progress = clamp(progress, 0, 1);
    var litCount = Math.floor(progress * trustChars.length);
    for (var i = 0; i < trustChars.length; i++){
      if (i < litCount) trustChars[i].classList.add('lit');
      else trustChars[i].classList.remove('lit');
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  handleScroll();

  /* ============ 3-5) phrase reveal + underline draw ============ */
  var phraseScenes = document.querySelectorAll('[data-phrase]');
  var phraseObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
      }
    });
  }, {threshold:0.4});
  phraseScenes.forEach(function(scene){ phraseObserver.observe(scene); });

  /* ============ 5) purity counter 0 -> 999.9 ============ */
  var counterScene = document.getElementById('counterScene');
  var purityCounter = document.getElementById('purityCounter');
  var counterDone = false;
  var counterObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting && !counterDone){
        counterDone = true;
        runCounter();
      }
    });
  }, {threshold:0.5});
  counterObserver.observe(counterScene);

  function runCounter(){
    var duration = 1800;
    var start = null;
    var target = 999.9;
    function easeOutQuint(t){ return 1 - Math.pow(1 - t, 5); }
    function step(ts){
      if (start === null) start = ts;
      var elapsed = ts - start;
      var t = clamp(elapsed / duration, 0, 1);
      var val = target * easeOutQuint(t);
      purityCounter.textContent = val.toFixed(1);
      if (t < 1) window.requestAnimationFrame(step);
      else purityCounter.textContent = target.toFixed(1);
    }
    window.requestAnimationFrame(step);
  }

  /* ============ 6) weight selector + live price ============ */
  var WEIGHTS = [
    {label:'١ غ',  grams:1,        dims:'8 × 15 × 0.4',  visualW:34,  visualH:52},
    {label:'٢ غ',  grams:2,        dims:'11 × 19 × 0.5', visualW:44,  visualH:66},
    {label:'٥ غ',  grams:5,        dims:'14 × 23 × 0.7', visualW:56,  visualH:82},
    {label:'١٠ غ', grams:10,       dims:'17 × 28 × 0.9', visualW:68,  visualH:98},
    {label:'أونصة', grams:31.1035, dims:'24 × 41 × 1.9', visualW:96,  visualH:140}
  ];
  var OUNCE_GRAMS = 31.1035;
  var SAR_PER_USD = 3.75;

  var weightTabsEl = document.getElementById('weightTabs');
  var weightBarVisual = document.getElementById('weightBarVisual');
  var detailWeight = document.getElementById('detailWeight');
  var detailDims = document.getElementById('detailDims');
  var detailPrice = document.getElementById('detailPrice');

  var activeIndex = 0;

  WEIGHTS.forEach(function(w, i){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'weight-tab' + (i === 0 ? ' active' : '');
    btn.textContent = w.label;
    btn.setAttribute('role','tab');
    btn.addEventListener('click', function(){
      activeIndex = i;
      Array.prototype.forEach.call(weightTabsEl.children, function(c){ c.classList.remove('active'); });
      btn.classList.add('active');
      renderWeight();
    });
    weightTabsEl.appendChild(btn);
  });

  function formatSAR(v){
    return v.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' ر.س';
  }

  function priceForGrams(grams){
    return ((ouncePrice + 50) / OUNCE_GRAMS) * SAR_PER_USD * grams;
  }

  function renderWeight(){
    var w = WEIGHTS[activeIndex];
    weightBarVisual.style.width = w.visualW + 'px';
    weightBarVisual.style.height = w.visualH + 'px';
    detailWeight.textContent = w.grams === OUNCE_GRAMS ? '31.1035 غ (أونصة)' : w.grams + ' غ';
    detailDims.textContent = w.dims + ' مم';
    detailPrice.textContent = formatSAR(priceForGrams(w.grams));
  }

  /* ============ live ticker ============ */
  var ouncePrice = 4183.40;
  var tickerValueEl = document.getElementById('tickerValue');
  var tickerArrowEl = document.getElementById('tickerArrow');
  var tickerEl = document.getElementById('priceTicker');

  function renderTicker(direction){
    tickerValueEl.textContent = '$' + ouncePrice.toFixed(2);
    tickerValueEl.classList.remove('up','down');
    tickerArrowEl.classList.remove('up','down');
    if (direction === 'up'){
      tickerValueEl.classList.add('up');
      tickerArrowEl.classList.add('up');
      tickerArrowEl.textContent = '▲';
    } else if (direction === 'down'){
      tickerValueEl.classList.add('down');
      tickerArrowEl.classList.add('down');
      tickerArrowEl.textContent = '▼';
    } else {
      tickerArrowEl.textContent = '—';
    }
    tickerEl.classList.add('pulse');
    window.setTimeout(function(){ tickerEl.classList.remove('pulse'); }, 220);
  }

  function updatePrice(){
    var prev = ouncePrice;
    var delta = (Math.random() * 2 - 1) * 2.4; // +/- 2.4
    ouncePrice = Math.round((ouncePrice + delta) * 100) / 100;
    var direction = ouncePrice > prev ? 'up' : (ouncePrice < prev ? 'down' : null);
    renderTicker(direction);
    renderWeight();
  }

  renderWeight();
  renderTicker(null);
  window.setInterval(updatePrice, 5000);

})();
