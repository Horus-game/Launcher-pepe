// Almacenamiento local (IndexedDB). Nada sale del teléfono.
const DB=(()=>{let p;
const open=()=>p||(p=new Promise((ok,no)=>{if(!window.indexedDB)return no(new Error('NO_IDB'));
const r=indexedDB.open('launcher',1);
r.onupgradeneeded=()=>['contacts','buttons','settings'].forEach(n=>r.result.createObjectStore(n,{keyPath:n=='contacts'?'id':n=='buttons'?'slot':'key'}));
r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}));
const run=(st,mode,f)=>open().then(d=>new Promise((ok,no)=>{const t=d.transaction(st,mode);const o=f(t);
t.oncomplete=()=>ok(o&&o.result);t.onerror=t.onabort=()=>no(t.error)}));
return{
all:s=>run(s,'readonly',t=>t.objectStore(s).getAll()),
put:(s,v)=>run(s,'readwrite',t=>t.objectStore(s).put(v)),
del:(s,k)=>run(s,'readwrite',t=>t.objectStore(s).delete(k)),
putMany:(s,a)=>run(s,'readwrite',t=>{a.forEach(v=>t.objectStore(s).put(v))}),
replace:d=>run(Object.keys(d),'readwrite',t=>{for(const n in d){const o=t.objectStore(n);o.clear();d[n].forEach(v=>o.put(v))}})}})();
