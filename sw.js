// Service worker: guarda la aplicación para usarla sin internet. No toca IndexedDB (datos personales).
const V='launcher-v3',A=['./','index.html','styles.css','app.js','db.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(A)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
// Con internet baja siempre la versión nueva; sin internet usa lo guardado.
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!='GET'||new URL(r.url).origin!=location.origin)return;
e.respondWith(Promise.race([fetch(r),new Promise((_,no)=>setTimeout(no,3500))]).then(x=>{if(x.ok){const y=x.clone();caches.open(V).then(c=>c.put(r,y))}return x})
.catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('index.html'))))});
