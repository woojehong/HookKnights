/* Hook Knights - account & save layer.
   Backend: Firestore when HK.db is set, otherwise localStorage fallback.
   All methods are async (return Promises); UI awaits them. */
window.HK = window.HK || {};

HK.Store = (function(){
  const SKEY="hk_session";
  const cloud = !!HK.db;
  let current=null, currentId=null;

  function hashPin(p){ let h=2166136261>>>0; for(let i=0;i<p.length;i++){ h^=p.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(16); }
  function newSave(nick){
    const heroes={}; heroes[HK.STARTER.heroId]={ owned:true, level:1, exp:0, active_lv:1, active_exp:0 };
    return { nickname:nick, inventory:{ tickets:HK.STARTER.tickets, books:{gray:0,green:0,red:0,orange:0}, hero_books:{} },
      heroes, squad:[HK.STARTER.heroId], stage_progress:{}, gacha_pity:0, mailbox:[], created:Date.now(), last_login:Date.now() };
  }

  function lAll(){ try { return JSON.parse(localStorage.getItem("hk_users")||"{}"); } catch(e){ return {}; } }
  function lPersist(a){ localStorage.setItem("hk_users", JSON.stringify(a)); }

  async function fetchUser(id){
    if(cloud){ const d=await HK.db.collection("users").doc(id).get(); return d.exists ? d.data() : null; }
    return lAll()[id] || null;
  }
  async function writeUser(id, obj){
    if(cloud){ await HK.db.collection("users").doc(id).set(obj); return; }
    const a=lAll(); a[id]=obj; lPersist(a);
  }
  async function patchSave(id, save){
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
        current=obj.save; currentId=id; localStorage.setItem(SKEY, id);
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
        current=u.save; currentId=id; localStorage.setItem(SKEY, id);
        patchSave(id, current);
        return { ok:true, save:current };
      } catch(e){ return { err:"연결 오류: "+(e.code||e.message||e) }; }
    },
    async resume(){
      const id=localStorage.getItem(SKEY); if(!id) return null;
      try { const u=await fetchUser(id); if(!u) return null; current=u.save; currentId=id; return current; }
      catch(e){ return null; }
    },
    logout(){ current=null; currentId=null; localStorage.removeItem(SKEY); },
    save(){ if(!currentId) return Promise.resolve(); return patchSave(currentId, current).catch(e=>console.warn("save failed", e)); },
    get cur(){ return current; },
    get id(){ return currentId; },
    async deleteAccount(id){ if(cloud){ await HK.db.collection("users").doc(id).delete(); } else { const a=lAll(); delete a[id]; lPersist(a); } if(id===currentId) this.logout(); }
  };
})();
