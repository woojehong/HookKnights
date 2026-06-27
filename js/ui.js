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
    $("#hTickets").textContent=s.inventory.tickets;
    const b=s.inventory.books; $("#hBooks").textContent=(b.gray+b.green+b.red+b.orange);
    $("#hOwned").textContent=Object.keys(s.heroes).filter(k=>s.heroes[k].owned).length;
    const pb=$("#primaryBtn");
    if(pb){ const tut=(s.tutorial_done===false);
      if(tut){ const st=(HK.TUTORIAL||[])[s.tutorial_stage||0]; pb.textContent="🎓 튜토리얼: "+(st?st.title:""); pb.dataset.menu="tutorial"; }
      else { pb.textContent="⚔ 테스트 전투"; pb.dataset.menu="battle"; } }
  }
  function menu(act){
    if(act==="battle"){ location.href="battle.html?v=23"; }
    else if(act==="tutorial"){ openTut(); }
    else if(act==="gacha"){ toast("가챠 화면은 다음 단계에서 만들어요!"); }
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
      d.onclick=()=>{ location.href="battle.html?tut="+t.id+"&v=23"; };
      wrap.appendChild(d);
    });
  }
  function showReward(r){ const h=HK.HMAP[r.heroId]; if(!h){ return; } const rar=h.rarity||"R"; const col=(HK.RARITY_COLOR&&HK.RARITY_COLOR[rar])||"#5b8cff";
    $("#rwImg").src=h.sprite; $("#rwName").textContent=h.name; $("#rwRole").textContent=(HK.CLASS_KR&&HK.CLASS_KR[h.cls])||h.cls;
    const re=$("#rwRarity"); re.textContent=rar; re.style.color=col; const card=$("#rwCard"); card.style.boxShadow="0 0 26px "+col+"66"; card.style.borderColor=col;
    $("#rwGot").innerHTML=josaIGa(h.name)+" 동료가 되었습니다!"+(r.done?('<br><span class="rwTk">튜토리얼 완료 · 뽑기권 +'+r.tickets+'</span>'):"");
    const pop=$("#rewardPop"); pop.classList.add("on"); $("#rwOk").onclick=()=>{ pop.classList.remove("on"); }; }
  async function handleTutClear(sid){ const s=await HK.Store.resume(); if(!s){ setMode("login"); show("scrAuth"); return; } const r=await HK.Store.completeTutorialStage(sid); renderTut(); show("scrTut"); if(r){ showReward(r); } }
  return { init, toast, openHome, renderHome };
})();
window.addEventListener("load", HK.UI.init);
