/* Hook Knights - shared data (R roster v2). Loaded as a plain script (window.HK). */
window.HK = window.HK || {};

HK.HEROES = [
  { id:"gubman",  name:"겁만",  cls:"Tank",     atkType:"AD", rarity:"R", sprite:"assets/units/Gubman.png",
    hp:1900, atk:80,  armor:140, mr:30, range:1.5, atkInt:1.3, block:2, cost:16, spMax:24,
    active:{ name:"방패 올리기",  type:"none" }, passive:{ name:"전투의 외침" } },
  { id:"dongguo", name:"동궈",  cls:"Vanguard", atkType:"AD", rarity:"R", sprite:"assets/units/Dongguo.png",
    hp:950,  atk:70,  armor:60,  mr:20, range:1.5, atkInt:1.1, block:1, cost:8,  spMax:12,
    active:{ name:"형들 빨리 와요!", type:"none" }, passive:{ name:"부지런한 막내" } },
  { id:"jungle",  name:"정글",  cls:"Melee",    atkType:"AD", rarity:"R", sprite:"assets/units/Jungle.png",
    hp:1150, atk:135, armor:70,  mr:30, range:1.5, atkInt:1.2, block:1, cost:14, spMax:26,
    active:{ name:"죽음의 손아귀", type:"AP" }, passive:{ name:"얼음같은 인내력" } },
  { id:"jagoro",  name:"자고로", cls:"Ranged",   atkType:"AD", rarity:"R", sprite:"assets/units/Jagoro.png",
    hp:620,  atk:90,  armor:25,  mr:0,  range:3.1, atkInt:0.85,block:1, cost:13, spMax:20,
    active:{ name:"속사",        type:"none" }, passive:{ name:"적자생존" } },
  { id:"bossam",  name:"보쌈",  cls:"Ranged",   atkType:"AP", rarity:"R", sprite:"assets/units/Bossam.png",
    hp:560,  atk:100, armor:20,  mr:0,  range:3.2, atkInt:1.6, block:1, cost:14, spMax:22,
    active:{ name:"눈보라",      type:"AP" }, passive:{ name:"신비한 지능" } },
  { id:"hooje",   name:"후제",  cls:"Ranged",   atkType:"AP", rarity:"R", sprite:"assets/units/Hooje.png",
    hp:540,  atk:55,  armor:15,  mr:0,  range:3.2, atkInt:1.5, block:1, cost:15, spMax:28,
    active:{ name:"부패의 씨앗",  type:"AP" }, passive:{ name:"검은 의도" } },
  { id:"leeyonce",name:"리용세",cls:"Support",  atkType:"AP", rarity:"R", sprite:"assets/units/Leeyonce.png",
    hp:660,  atk:60,  armor:20,  mr:30, range:3.0, atkInt:1.4, block:1, cost:12, spMax:24,
    active:{ name:"정신의 고리 토템", type:"none" }, passive:{ name:"피의 욕망" } },
];
HK.HMAP = {}; HK.HEROES.forEach(h=>HK.HMAP[h.id]=h);

HK.CLASS_KR = { Tank:"탱커", Vanguard:"뱅가드", Melee:"근거리", Ranged:"원거리", Support:"서포터" };
HK.RARITY_COLOR = { R:"#5b8cff", SR:"#b06bff", SSR:"#ffd36b" };
HK.RARITY_RANK = { R:1, SR:2, SSR:3 };

/* 신규 계정 시작 지급 (추후 변경 가능) */
HK.STARTER = { tickets:50, heroId:"gubman" };

/* 범용 경험치북 색상별 EXP (설계서 제안값) */
HK.BOOK_EXP = { gray:100, green:500, red:2500, orange:12500 };
HK.BOOK_KR  = { gray:"회색", green:"초록", red:"빨강", orange:"주황" };

/* 가챠 확률 (설계서 확정) */
HK.GACHA = { rates:{ R:0.60, SR:0.30, SSR:0.10 }, fullHeroChance:0.10, dupBooks:10, pityCount:50 };

HK.TUTORIAL = [
 {id:"0-1",hero:"gubman",  title:"배치와 막기"},
 {id:"0-2",hero:"leeyonce",title:"단상과 회복"},
 {id:"0-3",hero:"dongguo", title:"DP 운용"},
 {id:"0-4",hero:"jagoro",  title:"원거리 사격"},
 {id:"0-5",hero:"bossam",  title:"속성 상성"},
 {id:"0-6",hero:"jungle",  title:"지형과 포획"},
 {id:"0-7",hero:"hooje",   title:"졸업 전투"}
];
HK.TUTORIAL_FINAL_TICKETS = 50;
