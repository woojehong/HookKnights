/* Hook Knights - account & save layer.
   Backend: Firestore when HK.db is set, otherwise localStorage fallback.
   All methods are async (return Promises); UI awaits them. */
window.HK = window.HK || {};

HK.Store = (function(){
  const SKEY="hk_session";
  const cloud = !!HK.db;
  let current=null, currentId=null;

  function cacheSave(){ try{ if(current) localStorage.setItem("hk_save", JSON.stringify(current)); }catch(e){} }
  function hashPin(p){ let h=2166136261>>>0; for(let i=0;i<p.length;i++){ h^=p.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(16); }
  function newSave(nick){
    // 신규 가입: 영웅 0명 / 뽑기권 0 — 튜토리얼(0-1~0-7)로 영웅을 하나씩 획득.
    return { nickname:nick, inventory:{ tickets:0, books:{gray:0,green:0,red:0,orange:0}, hero_books:{} },
      heroes:{}, squad:[], stage_progress:{}, gacha_pity:0, mailbox:[], tutorial_stage:0, tutorial_done:false, created:Date.now(), last_login:Date.now() };
  }
  function guestSave(){
    const heroes={};
    (HK.HEROES||[]).forEach(h=>{ heroes[h.id]={ owned:true, level:1, exp:0, active_lv:1, active_exp:0 }; });
    const squad=(HK.HEROES||[]).slice(0,5).map(h=>h.id);
    return { nickname:"게스트", inventory:{ tickets:50, books:{gray:200,green:80,red:30,orange:8}, hero_books:{} },
      heroes, squad, stage_progress:{}, gacha_pity:0, mailbox:[], tutorial_done:true, guest:true,
      created:Date.now(), last_login:Date.now() };
  }

  function lAll(){ try { return JSON.parse(localStorage.getItem("hk_users")||"{}"); } catch(e){ return {}; } }
  function lPersist(a){ localStorage.setItem("hk_users", JSON.stringify(a)); }

  async function fetchUser(id){
    if(id==="__guest__"){ return lAll()["__guest__"] || null; }
    if(cloud){ const d=await HK.db.collection("users").doc(id).get(); return d.exists ? d.data() : null; }
    return lAll()[id] || null;
  }
  async function writeUser(id, obj){
    if(cloud){ await HK.db.collection("users").doc(id).set(obj); return; }
    const a=lAll(); a[id]=obj; lPersist(a);
  }
  async function patchSave(id, save){
    if(id===currentId){ try{ localStorage.setItem("hk_save", JSON.stringify(save)); }catch(e){} }
    if(id==="__guest__"){ const a=lAll(); a["__guest__"]={ pin:"", save }; lPersist(a); return; }
    if(cloud){ await HK.db.collection("users").doc(id).set({ save }, { merge:true }); return; }
    const a=lAll(); if(a[id]){ a[id].save=save; lPersist(a); }
  }

  return {
    cloud,
    async signup(id, pin, nick){
      id=(id||"").trim();
      if(!id) return { err:"ID를 입력하세요" };
      if(!/^\d{4}$/.test(pin)) return { err:"PIN은 숫자 4자리" };
      try {
        if(await fetchUser(id)) return { err:"이미 존재하는 ID입니다" };
        const obj={ pin:hashPin(pin), save:newSave((nick||"").trim()||id) };
        await writeUser(id, obj);
        current=obj.save; currentId=id; localStorage.setItem(SKEY, id); cacheSave();
        return { ok:true, save:current };
      } catch(e){ return { err:"연결 오류: "+(e.code||e.message||e) }; }
    },
    async login(id, pin){
      id=(id||"").trim();
      try {
        const u=await fetchUser(id);
        if(!u) return { err:"존재하지 않는 ID" };
        if(u.pin!==hashPin(pin)) return { err:"PIN이 일치하지 않습니다" };
        u.save.last_login=Date.now();
        current=u.save; currentId=id; localStorage.setItem(SKEY, id); cacheSave();
        patchSave(id, current);
        return { ok:true, save:current };
      } catch(e){ return { err:"연결 오류: "+(e.code||e.message||e) }; }
    },
    async guest(){
      const save=guestSave();
      current=save; currentId="__guest__"; cacheSave();
      try { localStorage.setItem(SKEY, "__guest__"); patchSave("__guest__", save); } catch(e){}
      return { ok:true, save:current };
    },
    async resume(){
      const id=localStorage.getItem(SKEY); if(!id) return null;
      try { const u=await fetchUser(id); if(!u) return null; current=u.save; currentId=id; cacheSave(); return current; }
      catch(e){ return null; }
    },
    logout(){ current=null; currentId=null; localStorage.removeItem(SKEY); try{localStorage.removeItem("hk_save");}catch(e){} },
    save(){ if(!currentId) return Promise.resolve(); return patchSave(currentId, current).catch(e=>console.warn("save failed", e)); },
    get cur(){ return current; },
    get id(){ return currentId; },
    isGuest(){ return currentId==="__guest__"; },
    async completeTutorialStage(stageId){
      if(!current) return null;
      const T=HK.TUTORIAL||[]; const idx=T.findIndex(t=>t.id===stageId);
      if(idx<0) return null;
      const cur=(current.tutorial_stage||0);
      if(idx!==cur) return null; // 순서 어긋남/중복 수령 방지
      const heroId=T[idx].hero;
      current.heroes[heroId]={ owned:true, level:1, exp:0, active_lv:1, active_exp:0 };
      if(current.squad.length<5 && current.squad.indexOf(heroId)<0) current.squad.push(heroId);
      current.tutorial_stage=idx+1;
      let done=false, tickets=0;
      if(current.tutorial_stage>=T.length){ current.tutorial_done=true; tickets=(HK.TUTORIAL_FINAL_TICKETS||0); current.inventory.tickets+=tickets; done=true; }
      await this.save();
      return { heroId, done, tickets };
    },
    async gacha(n){
      if(!current) return { err:"로그인이 필요합니다" };
      const inv=current.inventory; const all=(HK.HEROES||[]);
      if(!all.length) return { err:"가챠 풀이 비어 있습니다" };
      const G=HK.GACHA||{ fullHeroChance:0.10, dupBooks:10, pityCount:50, pullRates:{R:0.8,SR:0.18,SSR:0.02} };
      const rates=G.pullRates||{R:0.8,SR:0.18,SSR:0.02};
      const byR={R:[],SR:[],SSR:[]}; all.forEach(h=>{ const k=h.rarity||"R"; (byR[k]=byR[k]||[]).push(h); });
      const present=["SSR","SR","R"].filter(x=>byR[x]&&byR[x].length);
      const tot=present.reduce((a,x)=>a+(rates[x]||0),0)||1;
      function pick(){ let r=Math.random()*tot, acc=0, ch=present[present.length-1];
        for(const x of present){ acc+=(rates[x]||0); if(r<=acc){ ch=x; break; } } const arr=byR[ch]; return arr[Math.floor(Math.random()*arr.length)]; }
      let cnt=Math.min(n, inv.tickets);
      if(cnt<=0) return { err:"뽑기권이 부족합니다" };
      const results=[];
      for(let i=0;i<cnt;i++){
        inv.tickets--; current.gacha_pity=(current.gacha_pity||0)+1;
        const hero=pick(); const full=(Math.random()<G.fullHeroChance);
        if(full){ const hs=current.heroes[hero.id];
          if(!hs||!hs.owned){ current.heroes[hero.id]={ owned:true, level:1, exp:0, active_lv:1, active_exp:0 }; results.push({ type:"hero", heroId:hero.id, rarity:hero.rarity }); }
          else { inv.hero_books[hero.id]=(inv.hero_books[hero.id]||0)+G.dupBooks; results.push({ type:"dupe", heroId:hero.id, qty:G.dupBooks, rarity:hero.rarity }); } }
        else { const qty=1+(Math.random()<0.5?1:0); inv.hero_books[hero.id]=(inv.hero_books[hero.id]||0)+qty; results.push({ type:"book", heroId:hero.id, qty, rarity:hero.rarity }); }
      }
      await this.save();
      return { ok:true, results, tickets:inv.tickets, pity:current.gacha_pity };
    },
    async addExpBook(heroId, color){
      if(!current) return { err:"로그인 필요" };
      const hs=current.heroes[heroId]; if(!hs||!hs.owned) return { err:"미보유 영웅" };
      const inv=current.inventory; if((inv.books[color]||0)<1) return { err:"경험치책이 없습니다" };
      inv.books[color]--; const gain=(HK.BOOK_EXP&&HK.BOOK_EXP[color])||0;
      hs.exp=(hs.exp||0)+gain; let ups=0;
      while(hs.exp >= HK.LEVEL_EXP(hs.level||1)){ hs.exp-=HK.LEVEL_EXP(hs.level||1); hs.level=(hs.level||1)+1; ups++; }
      await this.save(); return { ok:true, level:hs.level, exp:hs.exp, req:HK.LEVEL_EXP(hs.level), gain, ups };
    },
    async activeUpHero(heroId){
      if(!current) return { err:"로그인 필요" };
      const hs=current.heroes[heroId]; if(!hs||!hs.owned) return { err:"미보유 영웅" };
      if((hs.active_lv||1)>=30) return { err:"액티브가 최대 레벨(30)입니다" };
      const cost=(hs.active_lv||1);
      const have=current.inventory.hero_books[heroId]||0;
      if(have<cost) return { err:"전용북 "+cost+"개 필요 ("+have+"/"+cost+")" };
      current.inventory.hero_books[heroId]=have-cost; hs.active_lv=(hs.active_lv||1)+1;
      await this.save(); return { ok:true, active_lv:hs.active_lv, cost };
    },
    async activeUpMaxHero(heroId){
      if(!current) return { err:"로그인 필요" };
      const hs=current.heroes[heroId]; if(!hs||!hs.owned) return { err:"미보유 영웅" };
      let gained=0, spent=0;
      while((hs.active_lv||1)<30){ const cost=(hs.active_lv||1); const have=current.inventory.hero_books[heroId]||0; if(have<cost) break; current.inventory.hero_books[heroId]=have-cost; hs.active_lv=(hs.active_lv||1)+1; gained++; spent+=cost; }
      if(gained===0) return { err:"전용북이 부족합니다" };
      await this.save(); return { ok:true, gained, active_lv:hs.active_lv, spent };
    },
    async unlockHero(heroId){
      if(!current) return { err:"로그인 필요" };
      const hs=current.heroes[heroId]; if(hs&&hs.owned) return { err:"이미 보유 중" };
      const need=(HK.UNLOCK_BOOKS||10); const have=current.inventory.hero_books[heroId]||0;
      if(have<need) return { err:"전용북 "+need+"개 필요 ("+have+"/"+need+")" };
      current.inventory.hero_books[heroId]=have-need;
      current.heroes[heroId]={ owned:true, level:1, exp:0, active_lv:1, active_exp:0 };
      await this.save(); return { ok:true };
    },
    async claimPity(heroId){
      if(!current) return { err:"로그인 필요" };
      const G=HK.GACHA||{pityCount:50,dupBooks:10}; const pc=G.pityCount||50;
      const avail=Math.floor((current.gacha_pity||0)/pc) - (current.gacha_pity_claimed||0);
      if(avail<=0) return { err:"받을 천장 보상이 없습니다" };
      if(!HK.HMAP[heroId]) return { err:"잘못된 영웅" };
      current.gacha_pity_claimed=(current.gacha_pity_claimed||0)+1;
      const hs=current.heroes[heroId]; let result;
      if(!hs||!hs.owned){ current.heroes[heroId]={ owned:true, level:1, exp:0, active_lv:1, active_exp:0 }; result={ type:"hero", heroId, rarity:HK.HMAP[heroId].rarity }; }
      else { current.inventory.hero_books[heroId]=(current.inventory.hero_books[heroId]||0)+(G.dupBooks||10); result={ type:"dupe", heroId, qty:(G.dupBooks||10), rarity:HK.HMAP[heroId].rarity }; }
      await this.save(); return { ok:true, result };
    },
    async claimWorldStage(stageId){
      if(!current) return null;
      const W=(HK.WORLD1||[]).find(w=>w.id===stageId); if(!W) return null;
      current.stage_progress=current.stage_progress||{};
      const first=!current.stage_progress[stageId];
      const rw=first?W.first:W.repeat; const inv=current.inventory; inv.books=inv.books||{gray:0,green:0,red:0,orange:0};
      let tickets=0;
      if(rw){ if(rw.tickets){ inv.tickets=(inv.tickets||0)+rw.tickets; tickets=rw.tickets; } if(rw.books){ for(const c in rw.books){ inv.books[c]=(inv.books[c]||0)+rw.books[c]; } } }
      current.stage_progress[stageId]=true;
      await this.save();
      return { first, tickets, books:(rw&&rw.books)||{} };
    },
    async deleteAccount(id){ if(cloud){ await HK.db.collection("users").doc(id).delete(); } else { const a=lAll(); delete a[id]; lPersist(a); } if(id===currentId) this.logout(); }
  };
})();
