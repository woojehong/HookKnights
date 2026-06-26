/* Hook Knights - Firebase init. Sets HK.db (Firestore) when SDK is available.
   Loaded AFTER firebase compat SDK and BEFORE store.js. */
window.HK = window.HK || {};

(function(){
  const firebaseConfig = {
    apiKey: "AIzaSyB7UAx02mrk3i-aKlAtyHGL7MSShUKkFzU",
    authDomain: "hookknights.firebaseapp.com",
    projectId: "hookknights",
    storageBucket: "hookknights.firebasestorage.app",
    messagingSenderId: "877563914099",
    appId: "1:877563914099:web:090060e9f064b7029b0706"
  };
  try {
    if (window.firebase && firebase.initializeApp) {
      firebase.initializeApp(firebaseConfig);
      HK.db = firebase.firestore();
      HK.cloud = true;
      console.log("[HK] Firebase 연결됨 (cloud save)");
    } else {
      HK.cloud = false;
      console.warn("[HK] Firebase SDK 미로딩 → 로컬 저장 사용");
    }
  } catch (e) {
    HK.cloud = false;
    console.warn("[HK] Firebase 초기화 실패 → 로컬 저장 사용:", e);
  }
})();
