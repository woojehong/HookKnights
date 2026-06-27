/* Hook Knights - shared data (R roster v2). Loaded as a plain script (window.HK). */
window.HK = window.HK || {};

HK.HEROES = [
  { id:"gubman",  name:"겁만",  cls:"Tank",     atkType:"AD", rarity:"R", sprite:"assets/units/Gubman.png",
    hp:1900, atk:80,  armor:140, mr:30, range:1.5, atkInt:1.3, block:2, cost:16, spMax:24,
    active:{ name:"방패 올리기", type:"none", desc:"12초간 방어력 +130, 막을 수 있는 적 +1(블록 3)." },
    passive:{ name:"전투의 외침", desc:"주변 아군의 공격력을 소폭 올린다." } },
  { id:"dongguo", name:"동궈",  cls:"Vanguard", atkType:"AD", rarity:"R", sprite:"assets/units/Dongguo.png",
    hp:950,  atk:70,  armor:60,  mr:20, range:1.5, atkInt:1.1, block:1, cost:8,  spMax:12,
    active:{ name:"형들 빨리 와요!", type:"none", desc:"즉시 DP를 15 회복한다." },
    passive:{ name:"부지런한 막내", desc:"저코스트 선봉. DP 회복을 돕는다." } },
  { id:"jungle",  name:"정글",  cls:"Melee",    atkType:"AD", rarity:"R", sprite:"assets/units/Jungle.png",
    hp:1150, atk:135, armor:70,  mr:30, range:1.5, atkInt:1.2, block:1, cost:14, spMax:26,
    active:{ name:"죽음의 손아귀", type:"AP", desc:"가까운 적 하나를 끌어와 묶고 큰 마법 피해를 준다." },
    passive:{ name:"얼음같은 인내력", desc:"체력이 낮을수록 방어력이 오른다." } },
  { id:"jagoro",  name:"자고로", cls:"Ranged",   atkType:"AD", rarity:"R", sprite:"assets/units/Jagoro.png",
    hp:620,  atk:90,  armor:25,  mr:0,  range:3.1, atkInt:0.85,block:1, cost:13, spMax:20,
    active:{ name:"속사", type:"none", desc:"8초간 공격 속도가 대폭 빨라진다." },
    passive:{ name:"적자생존", desc:"적을 처치하면 공격력이 잠시 오른다." } },
  { id:"bossam",  name:"보쌈",  cls:"Ranged",   atkType:"AP", rarity:"R", sprite:"assets/units/Bossam.png",
    hp:560,  atk:100, armor:20,  mr:0,  range:3.2, atkInt:1.6, block:1, cost:14, spMax:22,
    active:{ name:"눈보라", type:"AP", desc:"지정한 칸에 광역 빙결 피해를 지속으로 주고 둔화시킨다." },
    passive:{ name:"신비한 지능", desc:"마법 저항을 일부 무시한다." } },
  { id:"hooje",   name:"후제",  cls:"Ranged",   atkType:"AP", rarity:"R", sprite:"assets/units/Hooje.png",
    hp:540,  atk:55,  armor:15,  mr:0,  range:3.2, atkInt:1.5, block:1, cost:15, spMax:28,
    active:{ name:"부패의 씨앗", type:"AP", desc:"모든 적에게 강력한 지속 피해(도트)를 건다." },
    passive:{ name:"검은 의도", desc:"적 처치 시 주변에 부패가 번진다." } },
  { id:"leeyonce",name:"리용세",cls:"Support",  atkType:"AP", rarity:"R", sprite:"assets/units/Leeyonce.png",
    hp:660,  atk:60,  armor:20,  mr:30, range:3.0, atkInt:1.4, block:1, cost:12, spMax:24,
    active:{ name:"정신의 고리 토템", type:"none", desc:"범위 아군의 체력을 평균치로 끌어올리고 +10% 회복한다." },
    passive:{ name:"피의 욕망", desc:"회복의 일부를 아군 공격력으로 바꾼다." } },

  { id:"gundam", name:"건담",  cls:"Tank",     atkType:"AD",     rarity:"SR", sprite:"assets/units/Gundam.png",
    hp:2700, atk:112, armor:195, mr:45, range:1.5, atkInt:1.3, block:2, cost:18, spMax:26,
    active:{ name:"건담, 대지에 서다", type:"none", desc:"강력한 보호막을 전개해 방어력+220·블록+2·마저+40 (12초)." },
    passive:{ name:"불타올라라", desc:"근접 공격을 받으면 공격한 적에게 화염 피해를 되돌려준다." } },
  { id:"arthas", name:"아서스", cls:"Melee",    atkType:"AD",     rarity:"SR", sprite:"assets/units/Arthas.png",
    hp:1650, atk:188, armor:100, mr:45, range:1.6, atkInt:1.2, block:1, cost:16, spMax:26,
    active:{ name:"심판의 망치", type:"AD", desc:"전방 부채꼴의 적을 신성 일격(공격 2.4배)으로 강타하고 자신을 회복한다." },
    passive:{ name:"징벌의 오라", desc:"주변 1.5칸의 적에게 매초 신성 피해를 준다." } },
  { id:"zenitsu",name:"젠이츠", cls:"Melee",    atkType:"Hybrid", rarity:"SR", sprite:"assets/units/Zenitsu.png",
    hp:1450, atk:180, armor:80,  mr:40, range:1.6, atkInt:1.1, block:1, cost:16, spMax:24,
    active:{ name:"번개의 호흡 일의 형 · 벽력일섬", type:"Hybrid", desc:"사거리 내 전체 적에게 번개 강타(물리+마법)를 가한다." },
    passive:{ name:"겁쟁이", desc:"체력이 낮을수록 공격력이 크게 오른다(최대 +50%)." } },
  { id:"usopp",  name:"우솝",  cls:"Ranged",   atkType:"AD",     rarity:"SR", sprite:"assets/units/Usopp.png",
    hp:870,  atk:126, armor:35,  mr:0,  range:3.3, atkInt:0.9, block:1, cost:16, spMax:22,
    active:{ name:"필살 화약성", type:"AD", desc:"대상 주변을 폭발시켜 광역 화염 피해(공격 1.8배)를 준다." },
    passive:{ name:"저격왕", desc:"멀리 있는 적일수록 더 큰 피해를 준다(최대 +30%)." } },
  { id:"merci",  name:"메르시", cls:"Support",  atkType:"AP",     rarity:"SR", sprite:"assets/units/Merci.png",
    hp:920,  atk:85,  armor:28,  mr:42, range:3.1, atkInt:1.4, block:1, cost:15, spMax:24,
    active:{ name:"발키리", type:"none", desc:"가장 약한 아군을 즉시 크게 회복(최대 50%)하고 주변 아군도 회복한다." },
    passive:{ name:"의무관", desc:"사거리 내 아군을 매초 소량 회복한다." } },
];
HK.UNLOCK_BOOKS = 10;
HK.LEVEL_EXP = function(level){ return 100*level; };
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
HK.GACHA = { pullRates:{ R:0.80, SR:0.18, SSR:0.02 }, fullHeroChance:0.10, dupBooks:10, pityCount:50 };

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

HK.WORLD1 = [{"id": "1-1", "boss": false, "final": false, "first": {"books": {"green": 2}, "tickets": 1}, "repeat": {"books": {"gray": 3}}}, {"id": "1-2", "boss": false, "final": false, "first": {"books": {"green": 3}, "tickets": 1}, "repeat": {"books": {"gray": 3}}}, {"id": "1-3", "boss": false, "final": false, "first": {"books": {"green": 3}, "tickets": 1}, "repeat": {"books": {"gray": 3}}}, {"id": "1-4", "boss": false, "final": false, "first": {"books": {"green": 4}, "tickets": 1}, "repeat": {"books": {"gray": 3}}}, {"id": "1-5", "boss": true, "final": false, "first": {"books": {"green": 8, "red": 1}, "tickets": 5}, "repeat": {"books": {"green": 1}}}, {"id": "1-6", "boss": false, "final": false, "first": {"books": {"green": 5}, "tickets": 1}, "repeat": {"books": {"gray": 3}}}, {"id": "1-7", "boss": false, "final": false, "first": {"books": {"green": 5}, "tickets": 1}, "repeat": {"books": {"gray": 3}}}, {"id": "1-8", "boss": false, "final": false, "first": {"books": {"green": 6}, "tickets": 1}, "repeat": {"books": {"gray": 3}}}, {"id": "1-9", "boss": false, "final": false, "first": {"books": {"green": 6}, "tickets": 1}, "repeat": {"books": {"gray": 3}}}, {"id": "1-10", "boss": true, "final": false, "first": {"books": {"green": 8, "red": 1}, "tickets": 5}, "repeat": {"books": {"green": 1}}}, {"id": "1-11", "boss": false, "final": false, "first": {"books": {"green": 7}, "tickets": 1}, "repeat": {"books": {"gray": 3}}}, {"id": "1-12", "boss": false, "final": false, "first": {"books": {"green": 8}, "tickets": 1}, "repeat": {"books": {"gray": 3}}}, {"id": "1-13", "boss": false, "final": false, "first": {"books": {"green": 8}, "tickets": 1}, "repeat": {"books": {"gray": 3}}}, {"id": "1-14", "boss": false, "final": false, "first": {"books": {"green": 9}, "tickets": 1}, "repeat": {"books": {"gray": 3}}}, {"id": "1-15", "boss": false, "final": true, "first": {"books": {"red": 3, "orange": 1}, "tickets": 10}, "repeat": {"books": {"green": 2}}}];
