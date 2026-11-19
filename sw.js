/* CIMA · Service worker
   Estrategia "primero la red": con internet siempre se carga la versión publicada;
   la copia guardada solo se usa si no hay conexión. No toca la base de datos. */
const CACHE='cima-v1.2';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  const same=u.origin===self.location.origin,lib=/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.host);
  if(!same&&!lib)return;                       // Supabase y demás: directo a la red
  e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res&&res.ok&&(res.type==='basic'||res.type==='cors')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;})
    .catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('./'):undefined))));
});
