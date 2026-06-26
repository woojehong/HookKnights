/* Hook Knights - account & save layer.
   Local (localStorage) backend now; same API will be swapped to Firebase later. */
window.HK = window.HK || {};

HK.Store = (function(){
  const UKEY="hk_users", SKEY="hk_session";
  let current=null, currentId=null;

  function loadAll(){ try { return JSON.parse(localStorage.getItem(UKEY)||"{}"); } catch(e){ return {}; } }
  function persist(all){ localStorage.setItem(UKEY, JSON.stringify(all)); }
  function hashPin(p){ let h=2166136261>>>0; for(let i=0;i<p.length;i++){ h^=p.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(16); }

  function newSave(nick){
    const heroes={};
    heroes[HK.STARTER.heroId] = { owned:true, level:1, exp:0, active_lv:1, active_exp:0 };
    return {
      nickname: nick,
      inventory: { tickets: HK.STARTER.tickets, books:{gray:0,green:0,red:0,orange:0}, hero_books:{} },
      heroes,
      squad: [HK.STARTER.heroId],
      stage_progress: {},
      gacha_pity: 0,
      mailbox: [],
      created: Date.now(),
      last_login: Date.now()
    };
  }

  return {
    signup(id, pin, nick){
      id=(id||"").trim();
      if(!id) return { err:"ID를 입력하세요" };
      if(!/^\d{4}$/.test(pin)) return { err:"PIN은 숫자 4자리" };
      const all=loadAll();
      if(all[id]) return { err:"이미 존재하는 ID입니다" };
      all[id] = { pin:hashPin(pin), save:newSave((nick||"").trim()||id) };
      persist(all);
      return this.login(id, pin);
    },
    login(id, pin){
      id=(id||"").trim();
      const all=loadAll(); const u=all[id];
      if(!u) return { err:"존재하지 않는 ID" };
      if(u.pin!==hashPin(pin)) return { err:"PIN이 일치하지 않습니다" };
      u.save.last_login=Date.now(); persist(all);
      current=u.save; currentId=id; localStorage.setItem(SKEY, id);
      return { ok:true, save:current };
    },
    resume(){
      const id=localStorage.getItem(SKEY); if(!id) return null;
      const all=loadAll(); if(!all[id]) return null;
      current=all[id].save; currentId=id; return current;
    },
    logout(){ current=null; currentId=null; localStorage.removeItem(SKEY); },
    save(){ if(!currentId) return; const all=loadAll(); if(all[currentId]){ all[currentId].save=current; persist(all); } },
    get cur(){ return current; },
    get id(){ return currentId; },
    /* admin/dev helpers */
    deleteAccount(id){ const all=loadAll(); delete all[id]; persist(all); if(id===currentId)this.logout(); },
    _reset(){ localStorage.removeItem(UKEY); localStorage.removeItem(SKEY); current=null; currentId=null; }
  };
})();
