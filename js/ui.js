/* Hook Knights - app shell UI (intro / auth / home). window.HK.UI */
window.HK = window.HK || {};
HK.UI = (function(){
  const $=(s)=>document.querySelector(s);
  let introTimer=null, tToast=null, mode="login";

  function show(id){ document.querySelectorAll(".screen").forEach(e=>e.classList.remove("on")); const el=$("#"+id); if(el)el.classList.add("on"); }

  function playIntro(){
    show("scrIntro");
    const st=$("#introStudio"), ti=$("#introTitle");
    ti.classList.remove("show");
    st.classList.remove("hide"); void st.offsetWidth; st.classList.add("show");
    clearTimeout(introTimer);
    introTimer=setTimeout(showTitle, 2600);
  }
  function showTitle(){ const st=$("#introStudio"), ti=$("#introTitle"); st.classList.remove("show"); st.classList.add("hide"); setTimeout(()=>ti.classList.add("show"),650); }
  async function introTap(){
    const ti=$("#introTitle");
    if(!ti.classList.contains("show")){ clearTimeout(introTimer); showTitle(); return; }
    const s=await HK.Store.resume(); if(s) openHome(); else { setMode("login"); show("scrAuth"); }
  }

  function setMode(m){ mode=m;
    $("#tabLogin").classList.toggle("act",m==="login");
    $("#tabSignup").classList.toggle("act",m==="signup");
    $("#nickRow").style.display = m==="signup" ? "flex" : "none";
    $("#authSubmit").textContent = m==="login" ? "로그인" : "가입하고 시작";
    $("#authMsg").textContent="";
  }
  async function submitAuth(){
    const id=$("#fId").value, pin=$("#fPin").value, nick=$("#fNick").value;
    const btn=$("#authSubmit"); btn.disabled=true; const prev=btn.textContent; btn.textContent="처리 중...";
    $("#authMsg").textContent="";
    try {
      const r = mode==="login" ? await HK.Store.login(id,pin) : await HK.Store.signup(id,pin,nick);
      if(r.err){ $("#authMsg").textContent=r.err; return; }
      openHome();
    } finally { btn.disabled=false; btn.textContent=prev; }
  }

  function openHome(){ renderHome(); show("scrHome"); }
  async function guestStart(){ const b=document.querySelector("#guestBtn"); if(b){b.disabled=true;b.textContent="시작 중...";} const r=await HK.Store.guest(); if(r&&r.ok){ openHome(); } else if(b){ b.disabled=false; b.textContent="게스트로 시작 · 튜토리얼 스킵"; } }
  function renderHome(){
    const s=HK.Store.cur; if(!s){ setMode("login"); show("scrAuth"); return; }
    $("#hNick").textContent=s.nickname;
    $("#hAva").textContent=(s.nickname||"H").trim().charAt(0).toUpperCase();
    $("#hId").textContent="@"+HK.Store.id;
    const pb=$("#primaryBtn");
    if(pb){ const st=(HK.TUTORIAL||[])[s.tutorial_stage||0]; pb.textContent=(s.tutorial_done===false&&st)?("🎓 튜토리얼: "+st.title):"🎓 튜토리얼"; pb.dataset.menu="tutorial"; }
  }
  function menu(act){
    if(act==="battle"){ location.href="battle.html?v=29"; }
    else if(act==="tutorial"){ openTut(); }
    else if(act==="gacha"){ openGacha(); }
    else if(act==="heroes"){ openHeroes(); }
    else if(act==="logout"){ HK.Store.logout(); $("#fId").value=""; $("#fPin").value=""; $("#fNick").value=""; setMode("login"); playIntro(); }
    else toast("준비 중입니다");
  }

  function josaIGa(w){ const c=w.charCodeAt(w.length-1); if(c<0xAC00||c>0xD7A3) return w+"("+"이"+")가"; return ((c-0xAC00)%28!==0)?(w+"이"):(w+"가"); }
  function toast(m,ms){ const t=$("#toast"); t.textContent=m; t.classList.add("on"); clearTimeout(tToast); tToast=setTimeout(()=>t.classList.remove("on"),ms||1500); }

  function init(){
    $("#introTap").addEventListener("click",introTap);
    $("#tabLogin").onclick=()=>setMode("login");
    $("#tabSignup").onclick=()=>setMode("signup");
    $("#authSubmit").onclick=submitAuth;
    { const tb=$("#tutBack"); if(tb) tb.onclick=()=>openHome(); }
    { const g=$("#guestBtn"); if(g) g.onclick=guestStart; }
    $("#fPin").addEventListener("input",e=>{ e.target.value=e.target.value.replace(/\D/g,"").slice(0,4); });
    document.querySelectorAll("[data-menu]").forEach(b=>b.onclick=()=>menu(b.dataset.menu));
    document.querySelectorAll("[data-back]").forEach(b=>b.onclick=()=>{ if(b.dataset.back==="home") openHome(); });
    document.addEventListener("click",()=>hideTip());
    { const a=$("#gc1"); if(a) a.onclick=()=>doPull(1); }
    { const a=$("#gc10"); if(a) a.onclick=()=>doPull(10); }
    { const a=$("#gpOk"); if(a) a.onclick=()=>$("#gachaPop").classList.remove("on"); }
    { const a=$("#hdClose"); if(a) a.onclick=()=>$("#heroDetail").classList.remove("on"); }
    setMode("login");
    if(location.hash==="#tutmap"){ try{history.replaceState(null,"",location.pathname);}catch(e){} (async()=>{ const s=await HK.Store.resume(); if(s){ openTut(); } else { show("scrAuth"); } })(); }
    else if(location.hash.indexOf("#tutclear=")===0){ const sid=location.hash.split("=")[1]; try{history.replaceState(null,"",location.pathname);}catch(e){} handleTutClear(sid); }
    else if(location.hash==="#home"){ try{history.replaceState(null,"",location.pathname);}catch(e){} enterDirect(); }
    else playIntro();
  }
  async function enterDirect(){ const s=await HK.Store.resume(); if(s){ openHome(); } else { show("scrAuth"); } }
  function openTut(){ renderTut(); show("scrTut"); }
  function renderTut(){
    const s=HK.Store.cur; if(!s){ show("scrAuth"); return; }
    const T=HK.TUTORIAL||[]; const n=T.length;
    const top=48, stepY=104, H=top+(n-1)*stepY+96;
    const xs=T.map((t,i)=>i%2===0?32:68);
    const ys=T.map((t,i)=>top+i*stepY);
    const cleared=s.tutorial_done?n:(s.tutorial_stage||0);
    const svg=$("#tutPath"); svg.setAttribute("viewBox","0 0 100 "+H); svg.setAttribute("preserveAspectRatio","none"); svg.style.height=H+"px"; svg.style.width="100%";
    const allPts=xs.map((x,i)=>x+","+ys[i]).join(" ");
    let svghtml='<polyline points="'+allPts+'" fill="none" stroke="#20303f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
    if(cleared>0){ const k=Math.min(cleared, n-1); const litPts=xs.slice(0,k+1).map((x,i)=>x+","+ys[i]).join(" "); svghtml+='<polyline points="'+litPts+'" fill="none" stroke="#0070d1" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>'; }
    svg.innerHTML=svghtml;
    const wrap=$("#tutNodes"); wrap.innerHTML=""; wrap.style.height=H+"px";
    T.forEach((t,i)=>{
      const done=s.tutorial_done || (s.tutorial_stage||0)>i;
      const isNext=!s.tutorial_done && (s.tutorial_stage||0)===i;
      const d=document.createElement("button");
      d.className="tnode"+(done?" done":"")+(isNext?" next":"");
      d.style.left=xs[i]+"%"; d.style.top=ys[i]+"px";
      d.innerHTML='<span class="circ">'+(done?"✓":t.id.split("-")[1])+'</span><span class="cap"><b>'+t.id+' · '+t.title+'</b></span>';
      d.onclick=()=>{ location.href="battle.html?tut="+t.id+"&v=29"; };
      wrap.appendChild(d);
    });
  }
  function showReward(r){ const h=HK.HMAP[r.heroId]; if(!h){ return; } const rar=h.rarity||"R"; const col=(HK.RARITY_COLOR&&HK.RARITY_COLOR[rar])||"#5b8cff";
    $("#rwImg").src=h.sprite; $("#rwName").textContent=h.name; $("#rwRole").textContent=(HK.CLASS_KR&&HK.CLASS_KR[h.cls])||h.cls;
    const re=$("#rwRarity"); re.textContent=rar; re.style.color=col; const card=$("#rwCard"); card.style.boxShadow="0 0 26px "+col+"66"; card.style.borderColor=col;
    $("#rwGot").innerHTML=josaIGa(h.name)+" 동료가 되었습니다!"+(r.done?('<br><span class="rwTk">튜토리얼 완료 · 뽑기권 +'+r.tickets+'</span>'):"");
    const pop=$("#rewardPop"); pop.classList.add("on"); $("#rwOk").onclick=()=>{ pop.classList.remove("on"); }; }
  async function handleTutClear(sid){ const s=await HK.Store.resume(); if(!s){ setMode("login"); show("scrAuth"); return; } const r=await HK.Store.completeTutorialStage(sid); renderTut(); show("scrTut"); if(r){ showReward(r); } }
  // ---------- gacha ----------
  function openGacha(){ renderGacha(); show("scrGacha"); }
  function renderGacha(){ const s=HK.Store.cur; if(!s){ show("scrAuth"); return; } const G=HK.GACHA||{pityCount:50}; const pc=G.pityCount||50;
    $("#gcTickets").textContent="🎟 "+s.inventory.tickets;
    const big=$("#gcTkBig"); if(big) big.textContent=s.inventory.tickets;
    $("#gcPity").textContent=(pc-((s.gacha_pity||0)%pc)); }
  let gachaBusy=false;
  async function doPull(n){ if(gachaBusy) return; gachaBusy=true; const r=await HK.Store.gacha(n); gachaBusy=false;
    if(r.err){ toast(r.err); return; } renderGacha(); showPulls(r.results); }
  let orbTimer=null;
  function gpParticles(color){ const cv=$("#gpFx"); if(!cv||!cv.getContext) return; const ctx=cv.getContext("2d");
    const w=cv.width=cv.clientWidth, hh=cv.height=cv.clientHeight; const cx=w/2, cy=hh*0.42; const ps=[];
    for(let i=0;i<70;i++){ const a=Math.random()*6.28, sp=2+Math.random()*7; ps.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,sz:2+Math.random()*3}); }
    let t0=null; function fr(ts){ if(!t0)t0=ts; const dt=Math.min(40,ts-t0)/16; t0=ts; ctx.clearRect(0,0,w,hh); let alive=false;
      for(const p of ps){ if(p.life<=0)continue; alive=true; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=0.12*dt; p.vx*=0.98; p.life-=0.018*dt; ctx.globalAlpha=Math.max(0,p.life); ctx.fillStyle=color; ctx.beginPath(); ctx.arc(p.x,p.y,p.sz,0,7); ctx.fill(); }
      ctx.globalAlpha=1; if(alive) requestAnimationFrame(fr); else ctx.clearRect(0,0,w,hh); }
    requestAnimationFrame(fr); }
  function showPulls(results){ const pop=$("#gachaPop"); pop.classList.add("on");
    const orb=$("#gpOrb"), flash=$("#gpFlash"), grid=$("#gpGrid"), ok=$("#gpOk"), label=$("#gpLabel");
    grid.innerHTML=""; grid.classList.remove("show"); ok.style.display="none"; label.style.display="none";
    const hasNew=results.some(r=>r.type==="hero"); const tone=hasNew?"gold":"blue"; const pcol=hasNew?"#ffce21":"#53b1ff";
    orb.className="charge "+tone; orb.style.display="block";
    let done=false;
    const reveal=()=>{ if(done) return; done=true; orb.style.display="none";
      flash.classList.add("go"); setTimeout(()=>flash.classList.remove("go"),340);
      pop.classList.add("shake"); setTimeout(()=>pop.classList.remove("shake"),420); gpParticles(pcol);
      results.forEach((it,i)=>{ const h=HK.HMAP[it.heroId]; const col=(HK.RARITY_COLOR&&HK.RARITY_COLOR[h.rarity||"R"])||"#5b8cff";
        const d=document.createElement("div"); d.className="gpItem"+(it.type==="hero"?" isHero":""); d.style.animationDelay=(i*0.08)+"s";
        if(it.type==="hero"){ d.style.borderColor=col; d.style.boxShadow="0 0 18px "+col+"88"; d.innerHTML='<div class="gpNew">NEW</div><img src="'+h.sprite+'"><div class="gpNm">'+h.name+'</div>'; }
        else { d.innerHTML='<div class="gpBookIc">📕</div><div class="gpNm">'+h.name+' 전용북</div><div class="gpQty">×'+it.qty+(it.dupe?' <span class="gpDupe">중복</span>':'')+'</div>'; }
        grid.appendChild(d); });
      grid.classList.add("show"); label.style.display="block";
      setTimeout(()=>{ ok.style.display=""; }, 260+results.length*80); };
    clearTimeout(orbTimer); orbTimer=setTimeout(reveal, 1300);
    pop.onclick=(e)=>{ if(e.target===ok) return; if(!done) reveal(); };
  }

  // ---------- heroes (info + growth) ----------
  function openHeroes(){ renderHeroes(); show("scrHeroes"); }
  function renderHeroes(){ const s=HK.Store.cur; if(!s){ show("scrAuth"); return; } const grid=$("#heroGrid"); grid.innerHTML=""; const need=HK.UNLOCK_BOOKS||10;
    const list=(HK.HEROES||[]).map(h=>{ const hs=s.heroes[h.id]; const owned=!!(hs&&hs.owned); const books=s.inventory.hero_books[h.id]||0;
      return { h, hs, owned, books, ready:(!owned&&books>=need), power:owned?heroPower(h,hs):-1 }; });
    list.sort((a,b)=>{ if(a.owned!==b.owned) return a.owned?-1:1; if(a.owned) return b.power-a.power; if(a.ready!==b.ready) return a.ready?-1:1; return b.books-a.books; });
    list.forEach(o=>{ const h=o.h; const d=document.createElement("button");
      d.className="heroCell rar-"+(h.rarity||"R")+(o.owned?"":" locked")+(o.ready?" ready":"");
      const sub=o.owned?('Lv '+(o.hs.level||1)+' · <span class="hcPw">⚔'+o.power+'</span>'):(o.ready?'<span class="hcReady">해금 가능!</span>':('전용책 '+Math.min(o.books,need)+'/'+need));
      d.innerHTML='<div class="hcRar">'+(h.rarity||"R")+'</div><img src="'+h.sprite+'"><div class="hcNm">'+h.name+'</div><div class="hcLv">'+sub+'</div>';
      d.onclick=()=>openHeroDetail(h.id); grid.appendChild(d); }); }
  function heroScaled(h,lv){ const f=1+0.05*((lv||1)-1), g=1+0.03*((lv||1)-1);
    return { hp:Math.round(h.hp*f), atk:Math.round(h.atk*f), armor:Math.round(h.armor*g), mr:Math.round(h.mr*g) }; }
  function heroPower(h,hs){ const lv=(hs&&hs.level)||1, aLv=(hs&&hs.active_lv)||1; const st=heroScaled(h,lv);
    let p=st.hp*0.08 + st.atk*1.4 + st.armor*0.8 + st.mr*0.8 + (h.range||1)*10; p*=(1+0.05*(aLv-1)); return Math.round(p); }
  let hdHero=null;
  function openHeroDetail(id){ hdHero=id; renderHeroDetail(); $("#heroDetail").classList.add("on"); }
  function statRow(l,v){ return '<div><b>'+l+'</b><span>'+v+'</span></div>'; }
  function showTip(el,html){ const t=$("#tipbox"); if(!t)return; t.innerHTML=html; t.classList.add("on"); const r=el.getBoundingClientRect(); const w=220; let x=Math.min(window.innerWidth-w-8,Math.max(8,r.left+r.width/2-w/2)); let y=r.bottom+8; if(y>window.innerHeight-100) y=Math.max(8,r.top-100); t.style.left=x+"px"; t.style.top=y+"px"; t.style.width=w+"px"; }
  function hideTip(){ const t=$("#tipbox"); if(t)t.classList.remove("on"); }
  function bindTip(el,html){ if(!el||!html)return; el.addEventListener("mouseenter",()=>showTip(el,html)); el.addEventListener("mouseleave",hideTip);
    el.addEventListener("click",(e)=>{ e.stopPropagation(); const t=$("#tipbox"); if(t&&t.classList.contains("on")&&t.dataset.f===(el.id||html)){ hideTip(); } else { showTip(el,html); if(t)t.dataset.f=(el.id||html); } }); }
  function renderHeroDetail(){ const s=HK.Store.cur; const h=HK.HMAP[hdHero]; const hs=s.heroes[hdHero]; if(!h) return;
    const owned=hs&&hs.owned; const col=(HK.RARITY_COLOR&&HK.RARITY_COLOR[h.rarity||"R"])||"#5b8cff";
    $("#hdImg").src=h.sprite; $("#hdImg").style.filter=owned?"none":"grayscale(1) brightness(.6)"; $("#hdName").textContent=h.name;
    const re=$("#hdRarity"); re.textContent=h.rarity||"R"; re.style.color=col;
    $("#hdMeta").innerHTML=(HK.CLASS_KR[h.cls]||h.cls)+" · "+h.atkType+" · 코스트 "+h.cost+(owned?(' · 전투력 <b style="color:#ffd36b">⚔'+heroPower(h,hs)+'</b>'):"");
    const lv=owned?(hs.level||1):1, aLv=owned?(hs.active_lv||1):1; const st=heroScaled(h,lv);
    $("#hdStats").innerHTML=statRow("HP",st.hp)+statRow("공격",st.atk)+statRow("방어",st.armor)+statRow("마저",st.mr)+statRow("사거리",h.range)+statRow("공속",h.atkInt+"s");
    $("#hdSkills").innerHTML='<div class="hdSk" id="hdSkA"><span class="t">액티브</span>'+((h.active&&h.active.name)||"-")+' <i>Lv '+aLv+'/30</i> <span class="qm">?</span></div>'+
      '<div class="hdSk" id="hdSkP"><span class="t">패시브</span>'+((h.passive&&h.passive.name)||"-")+' <span class="qm">?</span></div>';
    bindTip($("#hdSkA"),(h.active&&h.active.desc)||"설명 없음"); bindTip($("#hdSkP"),(h.passive&&h.passive.desc)||"설명 없음");
    const need=HK.UNLOCK_BOOKS||10; const books=s.inventory.hero_books[hdHero]||0;
    if(!owned){ const can=books>=need;
      $("#hdGrow").innerHTML='<div class="hdGl" style="text-align:center;margin-bottom:8px;">전용책 <b>'+Math.min(books,need)+' / '+need+'</b></div>'+
        '<div class="hdBar"><i style="width:'+Math.min(100,books/need*100)+'%"></i></div>'+
        '<button class="btn-primary'+(can?' can':' dim')+'" id="hdUnlockBtn" style="width:100%;margin-top:12px;">'+(can?'해금하기':'전용책 부족')+'</button>';
      const ub=$("#hdUnlockBtn"); if(ub) ub.onclick=async()=>{ const r=await HK.Store.unlockHero(hdHero); if(r.err) toast(r.err); else { toast(h.name+" 해금!"); renderHeroDetail(); renderHeroes(); } };
      return; }
    const req=HK.LEVEL_EXP(lv), exp=hs.exp||0, nx=heroScaled(h,lv+1), inv=s.inventory.books;
    const bb=(c,kr)=>{ const n=inv[c]||0, ex=(HK.BOOK_EXP&&HK.BOOK_EXP[c])||0; return '<button class="bookBtn" data-bc="'+c+'" '+(n<=0?'disabled':'')+'>'+kr+'<b>'+n+'</b><i>+'+ex+'</i></button>'; };
    $("#hdGrow").innerHTML=
      '<div class="hdGrowSec"><div class="hdGl">영웅 레벨 <b>'+lv+'</b> <span class="qm" id="hdLvPrev">미리보기</span></div>'+
        '<div class="hdBar exp"><i style="width:'+Math.min(100,exp/req*100)+'%"></i></div><div class="hdExp">'+exp+' / '+req+' EXP</div>'+
        '<div class="bookRow">'+bb("gray","회")+bb("green","초")+bb("red","빨")+bb("orange","주")+'</div></div>'+
      '<div class="hdGrowSec"><div class="hdGl">액티브 <b>'+aLv+'</b>/30 <span class="qm" id="hdActPrev">미리보기</span></div>'+
        '<div class="hdGrowRow"><div class="hdBooksMini">전용북 '+books+'개</div><button class="btn-mini" id="hdAct" '+(aLv>=30?'disabled':'')+'>강화 · 전용북 '+aLv+'</button></div></div>';
    bindTip($("#hdLvPrev"),"Lv "+lv+" → "+(lv+1)+"<br>HP "+st.hp+" → "+nx.hp+"<br>공격 "+st.atk+" → "+nx.atk+"<br>방어 "+st.armor+" → "+nx.armor+"<br>마저 "+st.mr+" → "+nx.mr);
    bindTip($("#hdActPrev"), aLv>=30?"최대 레벨(30)":("Lv "+aLv+" → "+(aLv+1)+"<br>스킬 위력 약 +5%<br>필요 전용북 "+aLv+"개 (보유 "+books+")"));
    document.querySelectorAll("#hdGrow .bookBtn").forEach(b=>b.onclick=async()=>{ const r=await HK.Store.addExpBook(hdHero,b.dataset.bc); if(r.err) toast(r.err); else { if(r.ups>0) toast("Lv "+r.level+" 달성!"); renderHeroDetail(); renderHeroes(); } });
    const ab=$("#hdAct"); if(ab) ab.onclick=async()=>{ const r=await HK.Store.activeUpHero(hdHero); if(r.err) toast(r.err); else { toast("액티브 Lv "+r.active_lv); renderHeroDetail(); } };
  }
  return { init, toast, openHome, renderHome };
})();
window.addEventListener("load", HK.UI.init);
