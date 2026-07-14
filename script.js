// live clock
  function updateClock(){
    const el = document.getElementById('localTime');
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-IN', { hour12:false });
  }
  updateClock();
  setInterval(updateClock, 1000);

  // fade-in on scroll
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold:0.12 });
  document.querySelectorAll('.fade-up').forEach(el=>observer.observe(el));

  // timeline expand/collapse
  function toggleCard(card){
    const wasOpen = card.classList.contains('open');
    card.closest('.timeline').querySelectorAll('.tl-card.open').forEach(c=>{
      if(c!==card) c.classList.remove('open');
    });
    card.classList.toggle('open', !wasOpen);
  }

  // project expand/collapse
  function toggleProject(toggleEl){
    const card = toggleEl.closest('.project-card');
    card.classList.toggle('open');
    toggleEl.firstChild.textContent = card.classList.contains('open') ? 'HIDE DETAILS ' : 'VIEW DETAILS ';
  }

  // ---------- leetcode: pixel submission heatmap ----------
  const lcContribGrid = document.getElementById('lcContribGrid');
  const shades = ['#161616','#1c1c1c','#3a3a3a','#6b6b6b','#ffffff'];
  let lcFrag = document.createDocumentFragment();
  for(let i=0;i<364;i++){
    const cell = document.createElement('div');
    cell.className='contrib-cell';
    const r = Math.random();
    let shade = shades[0];
    if(r>0.93) shade = shades[4];
    else if(r>0.8) shade = shades[3];
    else if(r>0.6) shade = shades[2];
    else if(r>0.4) shade = shades[1];
    cell.style.background = shade;
    lcFrag.appendChild(cell);
  }
  lcContribGrid.appendChild(lcFrag);

  // ---------- leetcode: live stat counters ----------
  const lcState = {
    solved: 842,
    rank: 18420,
    streak: 63,
    accept: 71.4,
  };
  document.getElementById('lcSolved').textContent = lcState.solved.toLocaleString();
  document.getElementById('lcRank').textContent = '#' + lcState.rank.toLocaleString();
  document.getElementById('lcStreak').textContent = lcState.streak;
  document.getElementById('lcAccept').textContent = lcState.accept.toFixed(1) + '%';

  setInterval(function(){
    if(Math.random() > 0.7){
      lcState.solved += 1;
      document.getElementById('lcSolved').textContent = lcState.solved.toLocaleString();
    }
    if(Math.random() > 0.6){
      lcState.rank -= Math.floor(Math.random()*40);
      document.getElementById('lcRank').textContent = '#' + Math.max(lcState.rank,1).toLocaleString();
    }
    // occasionally flip a cell in the heatmap to feel alive
    const cells = lcContribGrid.children;
    const idx = Math.floor(Math.random()*cells.length);
    const r = Math.random();
    cells[idx].style.background = r>0.7 ? shades[4] : r>0.4 ? shades[3] : shades[2];
  }, 4000);

  // ---------- github: real-time commit activity chart ----------
  const ghState = { commits: 1842, stars: 612, prs: 210 };
  document.getElementById('ghContrib').textContent = ghState.commits.toLocaleString();
  document.getElementById('ghStars').textContent = ghState.stars.toLocaleString();
  document.getElementById('ghPRs').textContent = ghState.prs.toLocaleString();

  // seed 30 days of commit-activity history with a gentle random walk
  let ghData = [];
  (function seedCommits(){
    let r = 40;
    for(let i=0;i<30;i++){
      r += (Math.random()-0.42) * 10;
      r = Math.max(4, Math.min(90, r));
      ghData.push(r);
    }
  })();

  const ghSvg = document.getElementById('ghChart');
  const ghW = 700, ghH = 220, ghPad = 14;

  function renderGhChart(){
    const min = Math.min(...ghData) - 6;
    const max = Math.max(...ghData) + 6;
    const n = ghData.length;
    const stepX = (ghW - ghPad*2) / (n-1);

    const pts = ghData.map((v,i)=>{
      const x = ghPad + i*stepX;
      const y = ghH - ghPad - ((v-min)/(max-min)) * (ghH - ghPad*2);
      return [x,y];
    });

    const linePath = pts.map((p,i)=> (i===0?'M':'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const areaPath = linePath + ` L${pts[n-1][0].toFixed(1)},${ghH-ghPad} L${pts[0][0].toFixed(1)},${ghH-ghPad} Z`;

    // gridlines (blueprint style, matches page grid)
    let gridLines = '';
    for(let g=0; g<=4; g++){
      const y = ghPad + g*((ghH-ghPad*2)/4);
      gridLines += `<line x1="${ghPad}" y1="${y.toFixed(1)}" x2="${ghW-ghPad}" y2="${y.toFixed(1)}" stroke="#2b2b2b" stroke-width="1" stroke-dasharray="2,4"/>`;
    }

    const lastPt = pts[n-1];

    ghSvg.innerHTML = `
      ${gridLines}
      <path d="${areaPath}" fill="rgba(255,255,255,0.05)" stroke="none"/>
      <path d="${linePath}" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${lastPt[0].toFixed(1)}" cy="${lastPt[1].toFixed(1)}" r="4.5" fill="#ffffff"/>
      <circle cx="${lastPt[0].toFixed(1)}" cy="${lastPt[1].toFixed(1)}" r="9" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.5">
        <animate attributeName="r" values="6;13;6" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
    `;

    const current = ghData[n-1];
    const prev = ghData[n-2];
    const delta = current - prev;
    document.getElementById('ghCommitsNow').textContent = Math.round(current) + ' commits';
    const deltaEl = document.getElementById('ghCommitsDelta');
    deltaEl.textContent = (delta>=0? '▲ +' : '▼ ') + Math.round(delta) + ' today';
  }

  renderGhChart();

  // simulate a live feed: every few seconds, shift the window and nudge stats
  setInterval(function(){
    ghData.shift();
    let last = ghData[ghData.length-1];
    last += (Math.random()-0.45) * 10;
    last = Math.max(4, Math.min(90, last));
    ghData.push(last);
    renderGhChart();

    if(Math.random() > 0.75){
      ghState.commits += Math.floor(Math.random()*3)+1;
      document.getElementById('ghContrib').textContent = ghState.commits.toLocaleString();
    }
    if(Math.random() > 0.85){
      ghState.stars += 1;
      document.getElementById('ghStars').textContent = ghState.stars.toLocaleString();
    }
  }, 4000);

  // contact form
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    note.textContent = '// message queued — thank you, I will reply within 24 hours';
    form.reset();
  });

  // theme toggle (blueprint grid intensity)
  let dim = false;
  document.getElementById('themeToggle').addEventListener('click', function(){
    dim = !dim;
    document.querySelector('.blueprint-grid').style.opacity = dim ? '0.3' : '1';
  });
