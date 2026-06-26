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
  }
  function menu(act){
    if(act==="battle"){ location.href="battle.html?v=10"; }
    else if(act==="gacha"){ toast("가챠 화면은 다음 단계에서 만들어요!"); }
    else if(act==="logout"){ HK.Store.logout(); $("#fId").value=""; $("#fPin").value=""; $("#fNick").value=""; setMode("login"); playIntro(); }
    else toast("준비 중입니다");
  }

  function toast(m){ const t=$("#toast"); t.textContent=m; t.classList.add("on"); clearTimeout(tToast); tToast=setTimeout(()=>t.classList.remove("on"),1500); }

  function init(){
    $("#introTap").addEventListener("click",introTap);
    $("#tabLogin").onclick=()=>setMode("login");
    $("#tabSignup").onclick=()=>setMode("signup");
    $("#authSubmit").onclick=submitAuth;
    { const g=$("#guestBtn"); if(g) g.onclick=guestStart; }
    $("#fPin").addEventListener("input",e=>{ e.target.value=e.target.value.replace(/\D/g,"").slice(0,4); });
    document.querySelectorAll("[data-menu]").forEach(b=>b.onclick=()=>menu(b.dataset.menu));
    setMode("login");
    if(location.hash==="#home"){ try{history.replaceState(null,"",location.pathname);}catch(e){} enterDirect(); }
    else playIntro();
  }
  async function enterDirect(){ const s=await HK.Store.resume(); if(s){ openHome(); } else { show("scrAuth"); } }
  return { init, toast, openHome, renderHome };
})();
window.addEventListener("load", HK.UI.init);
