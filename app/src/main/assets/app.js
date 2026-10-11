(()=>{
const S={c:[],b:[],s:{},pend:0,hid:0,ip:null};
const COL=['#1a5fb4','#1e7a45','#c01c28','#b35a00','#613583','#0e6e78'],CN=['Azul','Verde','Rojo','Naranja','Violeta','Turquesa'];
const ACT={call:['LLAMAR','📞'],whatsapp:['WHATSAPP','💬'],contacts:['CONTACTOS','👥'],sos:['SOS','🆘'],app:['ABRIR APP','📱'],none:['SIN USO','➕']};
const V={};
const h=(t,p={},...k)=>{const e=document.createElement(t);let v;for(const a in p){const x=p[a];if(x==null||x===false)continue;
if(a=='class')e.className=x;else if(a=='value')v=x;else if(a.slice(0,2)=='on')e.addEventListener(a.slice(2),x);else e.setAttribute(a,x===true?'':x)}
e.append(...k.flat(9).filter(x=>x!=null&&x!==false));if(v!==undefined)e.value=v;return e};
const U=new Map(),pic=c=>{let u=U.get(c.id);if(!u||u.b!==c.photo){u={b:c.photo,u:URL.createObjectURL(c.photo)};U.set(c.id,u)}return u.u};
const cOf=b=>S.c.find(c=>c.id==b.cid),title=c=>c.name+(c.relation?' - '+c.relation:'');
const av=(c,big)=>c.photo?h('img',{class:'av'+(big?' big':''),src:pic(c),alt:''}):h('div',{class:'av'+(big?' big':''),'aria-hidden':'true'},'👤');
const pg=(t,...k)=>h('div',{class:'page'},t?h('h1',{},t):'',...k);
const back=()=>h('button',{class:'btn gray',onclick:()=>home()},'⬅ VOLVER AL INICIO');
const box=(t,btns)=>new Promise(r=>{const m=h('div',{class:'modal'},h('div',{class:'box',role:'alertdialog'},h('p',{},t),btns.map(([l,c,v])=>h('button',{class:'btn '+c,onclick:()=>{m.remove();r(v)}},l))));document.body.append(m)});
const msg=t=>box(t,[['ACEPTAR','',1]]),ask=t=>box(t,[['SÍ','red',1],['NO','gray',0]]);
const sv=async f=>{try{await f();return 1}catch(e){await msg(e.name=='QuotaExceededError'?'No hay espacio suficiente en el teléfono para guardar. Liberá espacio y probá de nuevo.':'No se pudo guardar: '+(e.message||e));return 0}};
const setS=(key,v)=>{S.s[key]=v;return DB.put('settings',{key,v})};
const apply=()=>{const r=document.documentElement.style;r.fontSize=16*(S.s.scale||1)+'px';r.setProperty('--ts',S.s.ts||1);const D=document.documentElement.dataset;D.hc=S.s.hc?'1':'';D.fx=S.s.fx===false?'0':'1'};

// Datos de ejemplo (se reemplazan desde Configuración)
const seed=()=>({contacts:['MARÍA|HIJA','JUAN|HIJO','LUCÍA|NIETA'].map((x,i)=>({id:'demo'+i,name:x.split('|')[0],relation:x.split('|')[1],phone:'+54900000000'+i,wa:'+54900000000'+i,notes:'',emergency:i==0,demo:1,photo:null,order:i})),
buttons:[['call','demo0',0],['call','demo1',5],['call','demo2',3],['whatsapp','demo0',1],['contacts',null,4],['sos',null,2],...Array(4).fill(['none',null,0])].map((x,i)=>({slot:i,type:x[0],cid:x[1],color:COL[x[2]],label:''})),settings:[{key:'scale',v:1},{key:'em',v:'911'}]});
async function load(){let[a,b,s]=await Promise.all([DB.all('contacts'),DB.all('buttons'),DB.all('settings')]);
if(!b.length){await DB.replace(seed());[a,b,s]=await Promise.all([DB.all('contacts'),DB.all('buttons'),DB.all('settings')])}
b.sort((x,y)=>x.slot-y.slot);for(let i=b.length;i<10;i++)b.push({slot:i,type:'none',cid:null,color:COL[i%6],label:''});
S.c=a.sort((x,y)=>x.order-y.order);S.b=b.sort((x,y)=>x.slot-y.slot);S.s=Object.fromEntries(s.map(x=>[x.key,x.v]));apply()}

// Navegación (el botón Atrás de Android funciona)
const NV=()=>+S.s.n||6,vis=()=>S.b.slice(0,NV());
const show=(n,p)=>{clearInterval(S.t);$('#app').replaceChildren((V[n]||V.home)(p||{}));scrollTo(0,0)};
const $=s=>document.querySelector(s);
const go=(n,p={})=>{history.pushState({n,p,d:(history.state&&history.state.d||0)+1},'');show(n,p)};
const home=()=>{const d=history.state&&history.state.d||0;d?history.go(-d):show('home')};
window.goHome=()=>home();addEventListener('popstate',e=>show(e.state&&e.state.n||'home',e.state&&e.state.p));
document.addEventListener('visibilitychange',()=>{if(document.hidden)S.hid=1;else if(S.pend&&S.hid){S.pend=S.hid=0;home()}});
addEventListener('beforeinstallprompt',e=>{e.preventDefault();S.ip=e});

// Acciones
// Puente nativo opcional: una app Android (WebView) puede exponer window.AndroidBridge.dial(numero)
// para llamar directo y recuperar el primer plano. Sin ella se usa tel: (el marcador de Android).
const Br=window.AndroidBridge||null;
const dial=n=>{S.pend=1;S.hid=0;n=n.replace(/[^\d+*#]/g,'');if(Br&&Br.dial)Br.dial(n);else location.href='tel:'+n};
const call=c=>{if(!S.s.voz)return dial(c.phone);let ok=1;
try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance('Llamando a '+c.name.toLowerCase()+(c.relation?', '+c.relation.toLowerCase():''));u.lang='es-AR';speechSynthesis.speak(u)}catch{}
const m=h('div',{class:'modal'},h('div',{class:'box',role:'alertdialog'},h('p',{},'📞 Llamando a '+title(c)+'…'),h('button',{class:'btn gray',onclick:()=>{ok=0;m.remove()}},'CANCELAR')));document.body.append(m);
setTimeout(()=>{if(ok){m.remove();dial(c.phone)}},1800)};
const waNum=c=>{const w=(c.wa||c.phone||'').trim();return w[0]=='+'?w.replace(/\D/g,''):''};
const waGo=(c,t)=>{location.href='https://wa.me/'+waNum(c)+(t?'?text='+encodeURIComponent(t):'')};
function act(b){const c=cOf(b);
if(b.type=='app'&&b.pkg){if(Br&&Br.openApp)return Br.openApp(b.pkg)||msg('Esa app no está instalada en este teléfono.')}
if(b.type=='app'&&b.pkg)return location.href='intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package='+b.pkg+';S.browser_fallback_url='+encodeURIComponent('https://play.google.com/store/apps/details?id='+b.pkg)+';end';
if(b.type=='contacts')return go('contacts');if(b.type=='sos')return go('sos');
if(b.type=='call'&&c)return call(c);
if(b.type=='whatsapp')return c?(waNum(c)?waGo(c):msg('Este contacto no tiene número de WhatsApp con +código de país.')):(location.href='intent://send/#Intent;scheme=whatsapp;package=com.whatsapp;end');
msg('Este botón todavía no está configurado. Pedí ayuda a un familiar.')}

V.home=()=>{const r=S.s.est=='r',sb=vis().find(b=>b.type=='sos'),vs=vis().filter(b=>b!==sb);
const g=h('div',{class:'grid'+(r?' r':''),style:'--r:'+Math.max(1,Math.ceil(vs.length/2))+';--hh:'+(150+(sb?110:0))+'px'},vs.map(b=>{const c=cOf(b),[nm,ic]=ACT[b.type]||ACT.none,t=b.label||(c?title(c):nm);
if(r&&b.type=='contacts')return h('button',{class:'tile more','aria-label':'Más contactos',onclick:()=>act(b)},h('span',{},'MÁS',h('br'),'CONTACTOS',h('br'),'›'));
return h('button',{class:'tile',style:'background:'+(b.color||COL[0]),'aria-label':t+(t!=nm?'. '+nm:''),onclick:()=>act(b)},
c&&c.photo?h('img',{src:pic(c),alt:''}):b.type=='app'&&b.icon?h('img',{class:'appic',src:b.icon,alt:''}):h('span',{class:'ic','aria-hidden':'true'},ic),
h('span',{class:'lb'},t,t!=nm?h('small',{},ic+' '+nm):''))}));
const gear=h('button',{class:'gear','aria-label':'Configuración (para familiares)',onclick:async()=>{if(await box('Configuración para familiares. ¿Querés entrar?',[['ENTRAR','green',1],['VOLVER','gray',0]]))go(S.s.pin?'pin':'admin')}},'⚙');
const hd=h('div',{class:'hd'+(r?' g':'')}),upd=()=>{const d=new Date(),H=d.getHours();hd.replaceChildren(h('div',{class:'tm'},h('b',{},d.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',hour12:false})),h('span',{},d.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'}))),r&&S.s.nom?h('div',{class:'hi'},H<12?'Buenos días,':H<20?'Buenas tardes,':'Buenas noches,',h('strong',{},S.s.nom)):'',gear)};
upd();S.t=setInterval(upd,20000);
const bar=sb?h('div',{class:'bar'},h('button',{class:'s',style:'background:#1e7a45;border-radius:22px 0 0 22px','aria-label':'Llamar: abrir contactos',onclick:()=>go('contacts')},'📞'),
h('button',{class:'s',style:'background:#b35a00;border-radius:0 22px 22px 0','aria-label':'Abrir WhatsApp',onclick:()=>act({type:'whatsapp'})},'💬'),
h('button',{class:'sos','aria-label':'SOS, pedir ayuda',onclick:()=>act(sb)},'SOS')):'';
return h('div',{class:'home'},hd,g,bar)};

V.contacts=()=>pg('Contactos',h('button',{class:'btn green',onclick:()=>go('cedit')},'➕ AÑADIR'),
S.c.length?'':h('p',{class:'small'},'Todavía no hay contactos. Tocá AÑADIR.'),
S.c.map(c=>h('button',{class:'card','aria-label':'Llamar a '+title(c),onclick:()=>call(c)},av(c),h('span',{},title(c)))),back());
V.contact=p=>{const c=S.c.find(x=>x.id==p.id);if(!c)return V.contacts();
return pg(c.name,av(c,1),h('p',{class:'small',style:'text-align:center'},c.relation),
h('button',{class:'btn green',onclick:()=>dial(c.phone)},'📞 LLAMAR'),
waNum(c)?h('button',{class:'btn',onclick:()=>go('wa',{id:c.id})},'💬 WHATSAPP'):'',
h('button',{class:'btn gray',onclick:()=>history.back()},'⬅ VOLVER'),back())};
V.wa=p=>{const c=S.c.find(x=>x.id==p.id);if(!c)return V.home();
if(!waNum(c))return pg('WHATSAPP',h('p',{},'Este contacto no tiene número de WhatsApp con código de país (+54...). Pedí ayuda a un familiar.'),back());
return pg(c.name,av(c,1),!navigator.onLine?h('p',{class:'small'},'Sin internet: WhatsApp no podrá enviar mensajes ahora. Podés llamar por teléfono.'):'',
h('button',{class:'btn',onclick:()=>waGo(c)},'💬 ABRIR CHAT'),
h('button',{class:'btn',onclick:()=>waGo(c,'Hola, ¿cómo estás? Te quiero mucho.')},'👋 PREPARAR SALUDO'),
h('button',{class:'btn',onclick:()=>waGo(c,'Por favor llamame cuando puedas.')},'📞 PEDIR QUE ME LLAMEN'),
h('p',{class:'small'},'WhatsApp se abre con el mensaje escrito. Hay que tocar "enviar" allí.'),
h('button',{class:'btn gray',onclick:()=>history.back()},'⬅ VOLVER'),back())};
V.sos=()=>{const n=S.s.em||'911';
return pg('🆘 SOS',h('p',{},'Tocá a quién querés llamar.'),
S.c.filter(c=>c.emergency).map(c=>h('div',{class:'card col'},av(c),title(c),c.notes?h('p',{class:'small',style:'width:100%'},c.notes):'',
h('button',{class:'btn red',onclick:()=>dial(c.phone)},'📞 LLAMAR A '+c.name),waNum(c)?h('button',{class:'btn',onclick:()=>waGo(c,'Necesito ayuda. Por favor llamame o venite.')},'💬 PREPARAR AVISO'):'')),
h('button',{class:'btn red',onclick:()=>dial(n)},'📞 EMERGENCIAS '+n),
h('p',{class:'small'},'Esta pantalla no reemplaza a los servicios oficiales de emergencia.'),back())};
V.pin=()=>{const i=h('input',{type:'password',inputmode:'numeric',maxlength:4,'aria-label':'PIN'});
return pg('Configuración',h('label',{class:'f'},'PIN del cuidador',i),h('button',{class:'btn',onclick:()=>{if(i.value==S.s.pin){history.replaceState({n:'admin',p:{},d:history.state.d},'');show('admin')}else{i.value='';msg('PIN incorrecto.')}}},'ENTRAR'),back())};

// ---- Administración ----
const ab=(l,n,c='')=>h('button',{class:'btn '+c,onclick:()=>go(n)},l);
V.admin=()=>pg('Configuración',ab('👥 Contactos','acontacts'),ab('🔲 Los 6 botones','abuttons'),ab('🔧 Aspecto, SOS y PIN','cfg'),ab('💾 Copia de seguridad','backup'),ab('📲 Instalar y sin internet','install'),
h('button',{class:'btn gray',onclick:async()=>{if(await ask('¿Borrar TODO y volver a los ejemplos?')&&await sv(async()=>{await DB.replace(seed());await load()}))home()}},'Restaurar todo'),back());
V.acontacts=()=>pg('Contactos',h('button',{class:'btn green',onclick:()=>go('cedit')},'➕ AÑADIR'),
S.c.map(c=>h('button',{class:'card',onclick:()=>go('cedit',{id:c.id})},av(c),h('span',{},title(c),c.demo?h('small',{class:'small',style:'display:block'},'EJEMPLO'):''))));
V.cedit=p=>{const o=S.c.find(c=>c.id==p.id),c=o?{...o}:{id:'c'+Date.now(),name:'',relation:'',phone:'',wa:'',notes:'',order:Date.now()};let ph=c.photo||null;
const pv=h('div',{class:'av big'}),draw=()=>pv.replaceChildren(ph?h('img',{src:URL.createObjectURL(ph),style:'width:100%;height:100%;border-radius:50%;object-fit:cover',alt:''}):'👤');draw();
const fi=h('input',{type:'file',accept:'image/*',onchange:async e=>{const f=e.target.files[0];if(f)try{ph=await shrink(f);draw()}catch{msg('No se pudo leer esa foto.')}}});
const n=h('input',{value:c.name}),r=h('input',{value:c.relation,placeholder:'HIJA, NIETO, MÉDICO'}),t=h('input',{type:'tel',value:c.phone}),w=h('input',{type:'tel',value:c.wa,placeholder:'+54 9 ...'}),no=h('textarea',{},c.notes||''),em=h('input',{type:'checkbox',checked:c.emergency});
const pv0=S.b.findIndex(b=>b.cid==c.id),fe=vis().findIndex(b=>b.type=='none'),sl=h('select',{value:pv0>=0?pv0:(o||fe<0?'':fe)},h('option',{value:''},'— ninguno —'),vis().map((b,i)=>h('option',{value:i},'Botón '+(i+1)+' ('+ACT[b.type][0]+(cOf(b)?' '+cOf(b).name:'')+')')));
const pick=navigator.contacts&&window.ContactsManager?h('button',{class:'btn gray',onclick:async()=>{try{const[x]=await navigator.contacts.select(['name','tel']);if(!x)return;if(!n.value&&x.name&&x.name[0])n.value=x.name[0].toUpperCase();if(x.tel&&x.tel[0])t.value=x.tel[0]}catch{}}},'ELEGIR DE LA AGENDA'):'';
return pg(o?'Editar contacto':'Nuevo contacto',pv,h('label',{class:'f'},'Foto',fi),h('button',{class:'btn gray',onclick:()=>{ph=null;draw()}},'Quitar foto'),
h('label',{class:'f'},'Nombre',n),h('label',{class:'f'},'Parentesco',r),pick,h('label',{class:'f'},'Teléfono',t),
h('button',{class:'btn gray',onclick:()=>msg('Se llamará al número: '+(t.value||'(vacío)'))},'COMPROBAR NÚMERO'),
h('label',{class:'f'},'WhatsApp (con +código de país; vacío = usa el teléfono)',w),h('label',{class:'f'},'Instrucciones para emergencias (opcional)',no),
h('label',{class:'chk'},em,'Es contacto de emergencia (SOS)'),h('label',{class:'f'},'Poner en el botón',sl),
h('button',{class:'btn green',onclick:async()=>{if(!n.value.trim()||t.value.replace(/\D/g,'').length<6)return msg('Escribí un nombre y un número de teléfono válido.');
Object.assign(c,{name:n.value.trim().toUpperCase(),relation:r.value.trim().toUpperCase(),phone:t.value.trim(),wa:w.value.trim(),notes:no.value,emergency:em.checked,photo:ph,demo:0});
const k=sl.value===''?-1:+sl.value;if(pv0>=0&&pv0!==k){S.b[pv0].cid=null;S.b[pv0].type='none'}if(k>=0){S.b[k].cid=c.id;if(S.b[k].type!='whatsapp')S.b[k].type='call'}
if(await sv(async()=>{await DB.put('contacts',c);await DB.putMany('buttons',S.b);await load()}))history.back()}},'GUARDAR'),
o?h('button',{class:'btn red',onclick:async()=>{if(await ask('¿Borrar a '+o.name+'?')&&await sv(async()=>{S.b.forEach(b=>{if(b.cid==o.id){b.cid=null;b.type='none'}});await DB.del('contacts',o.id);await DB.putMany('buttons',S.b);await load()}))history.back()}},'BORRAR'):'')};
async function shrink(f){const i=await createImageBitmap(f),k=Math.min(1,800/Math.max(i.width,i.height)),cv=h('canvas');cv.width=Math.round(i.width*k);cv.height=Math.round(i.height*k);cv.getContext('2d').drawImage(i,0,0,cv.width,cv.height);return new Promise(r=>cv.toBlob(r,'image/jpeg',.85))}
V.abuttons=()=>{const mv=async(i,j)=>{const a=S.b[i],b=S.b[j];S.b[i]={...b,slot:i};S.b[j]={...a,slot:j};if(await sv(()=>DB.putMany('buttons',S.b)))show('abuttons')};
return pg('Los 6 botones',h('p',{class:'small'},'Orden: de izquierda a derecha y de arriba a abajo. La cantidad de cuadros se cambia en Aspecto.'),vis().map((b,i)=>{const c=cOf(b);return h('div',{class:'card col',style:'font-size:1.2rem'},'Botón '+(i+1)+': '+(b.label||(c?c.name:ACT[b.type][0])),
h('div',{class:'row',style:'width:100%'},h('button',{class:'btn gray',disabled:i==0,onclick:()=>mv(i,i-1)},'↑'),h('button',{class:'btn gray',disabled:i==vis().length-1,onclick:()=>mv(i,i+1)},'↓'),h('button',{class:'btn',onclick:()=>go('bedit',{i})},'EDITAR')))}))};
V.bedit=p=>{const b=S.b[p.i];
const PRE=[['WhatsApp','com.whatsapp'],['YouTube','com.google.android.youtube'],['Facebook','com.facebook.katana'],['Messenger','com.facebook.orca'],['Instagram','com.instagram.android'],['Telegram','org.telegram.messenger'],['Google Meet','com.google.android.apps.tachyon'],['Fotos','com.google.android.apps.photos'],['Mapas','com.google.android.apps.maps'],['Chrome','com.android.chrome'],['Gmail','com.google.android.gm']];
const ty=h('select',{value:b.type},Object.entries(ACT).map(([k,v])=>h('option',{value:k},v[0]))),co=h('select',{value:b.cid||''},h('option',{value:''},'— ninguno —'),S.c.map(c=>h('option',{value:c.id},title(c)))),
lb=h('input',{value:b.label||'',placeholder:'(automático)'}),pk=h('input',{value:b.pkg||'',placeholder:'ej: com.whatsapp',autocapitalize:'none'}),
ps=h('select',{onchange:()=>{pk.value=ps.value;if(!lb.value&&ps.value)lb.value=ps.selectedOptions[0].text.toUpperCase()}},h('option',{value:''},'— elegir app —'),PRE.map(x=>h('option',{value:x[1]},x[0]))),cl=h('select',{value:b.color||COL[0]},COL.map((c,i)=>h('option',{value:c},CN[i])));
return pg('Botón '+(p.i+1),h('label',{class:'f'},'Función',ty),h('label',{class:'f'},'Contacto (para LLAMAR y WHATSAPP)',co),h('p',{class:'small'},'Para la función ABRIR APP: elegí una app de la lista o escribí su nombre de paquete. La app tiene que estar instalada.'),Br&&Br.listApps?h('button',{class:'btn',onclick:()=>go('apppick',{i:p.i})},'📱 ELEGIR APP INSTALADA'):h('label',{class:'f'},'App (solo ABRIR APP)',ps),h('label',{class:'f'},'Paquete de la app',pk),h('label',{class:'f'},'Nombre del botón',lb),h('label',{class:'f'},'Color',cl),
h('button',{class:'btn green',onclick:async()=>{if(ty.value=='app'&&!pk.value.trim())return msg('Elegí una app de la lista o escribí su paquete.');S.b[p.i]={slot:p.i,pkg:pk.value.trim(),icon:pk.value.trim()==b.pkg?b.icon:undefined,type:ty.value,cid:co.value||null,label:lb.value.trim().toUpperCase(),color:cl.value};if(await sv(()=>DB.putMany('buttons',S.b)))history.back()}},'GUARDAR'))};
V.apppick=p=>{const b=S.b[p.i],ls=h('div',{},h('p',{class:'small'},'Cargando apps…')),q=h('input',{type:'search',placeholder:'Escribí el nombre…',oninput:()=>draw()});let A=[];
const draw=()=>{const t=q.value.trim().toLowerCase();ls.replaceChildren(...A.filter(a=>a.label.toLowerCase().includes(t)).map(a=>h('button',{class:'card',onclick:()=>choose(a)},h('img',{class:'av',src:a.icon,alt:''}),h('span',{},a.label))))};
const choose=async a=>{let ic=a.icon;try{ic=Br.appIcon(a.pkg)||ic}catch{}
S.b[p.i]={slot:p.i,type:'app',pkg:a.pkg,cid:null,label:a.label.toUpperCase(),color:b.color||COL[0],icon:ic};
if(await sv(()=>DB.putMany('buttons',S.b)))history.go(-2)};
setTimeout(()=>{try{A=JSON.parse(Br.listApps());draw()}catch(e){ls.replaceChildren(h('p',{},'No se pudo leer la lista de apps.'))}},50);
return pg('Elegir app',h('label',{class:'f'},'Buscar',q),ls)};
V.cfg=()=>{const sc=h('input',{type:'range',min:.85,max:1.5,step:.05,value:S.s.scale||1,oninput:e=>{S.s.scale=+e.target.value;apply()},onchange:()=>sv(()=>setS('scale',S.s.scale))}),
em=h('input',{type:'tel',value:S.s.em||'911'}),pn=h('input',{type:'password',inputmode:'numeric',maxlength:4,placeholder:'4 números'});
const ts=h('input',{type:'range',min:.7,max:1.5,step:.05,value:S.s.ts||1,oninput:e=>{S.s.ts=+e.target.value;apply()},onchange:()=>sv(()=>setS('ts',S.s.ts))});
const sel=(k,lab,l,d)=>h('label',{class:'f'},lab,h('select',{value:S.s[k]||d,onchange:e=>sv(()=>setS(k,e.target.value)).then(apply)},l.map(([v,t])=>h('option',{value:v},t)))),
chk=(k,lab,d)=>h('label',{class:'chk'},h('input',{type:'checkbox',checked:S.s[k]===undefined?d:S.s[k],onchange:e=>sv(()=>setS(k,e.target.checked)).then(apply)}),lab);
return pg('Aspecto, SOS y PIN',h('label',{class:'f'},'Nombre de la persona (para el saludo)',h('input',{value:S.s.nom||'',placeholder:'Ej: Conchita',onchange:e=>sv(()=>setS('nom',e.target.value.trim()))})),
sel('est','Estilo de la pantalla principal',[['c','Cuadros de colores'],['r','Fotos redondas con saludo']],'c'),sel('n','Cantidad de cuadros',[[2,'2'],[4,'4'],[6,'6'],[8,'8'],[10,'10']],6),
h('label',{class:'f'},'Tamaño de letras e iconos de los botones',ts),chk('hc','Contraste alto',false),chk('fx','Respuesta visual al tocar',true),chk('voz','Decir en voz alta a quién se llama (1,8 segundos para cancelar)',false),h('label',{class:'f'},'Tamaño del texto en configuración',sc),h('label',{class:'f'},'Número de emergencias (SOS)',em),
h('button',{class:'btn green',onclick:()=>sv(()=>setS('em',em.value.trim()||'911')).then(o=>o&&msg('Guardado.'))},'GUARDAR NÚMERO'),
h('label',{class:'f'},'PIN para entrar a Configuración',pn),h('p',{class:'small'},'El PIN solo evita cambios accidentales; no es una protección fuerte. Si lo olvidás, hay que borrar los datos de la app.'),
h('button',{class:'btn green',onclick:()=>/^\d{4}$/.test(pn.value)?sv(()=>setS('pin',pn.value)).then(o=>o&&msg('PIN guardado.')):msg('El PIN debe tener 4 números.')},'GUARDAR PIN'),
h('button',{class:'btn gray',onclick:()=>sv(()=>setS('pin','')).then(()=>msg('PIN quitado.'))},'QUITAR PIN'))};
const b2u=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});
V.backup=()=>pg('Copia de seguridad',h('p',{},'Borrar los datos de la app, limpiar el almacenamiento de Chrome o desinstalarla puede eliminar contactos y fotos. Guardá una copia.'),
h('button',{class:'btn green',onclick:()=>sv(async()=>{const c=await Promise.all(S.c.map(async x=>({...x,photo:x.photo?await b2u(x.photo):null})));
const js=JSON.stringify({app:'launcher',c,b:S.b,s:S.s}),nm='copia-launcher-'+new Date().toISOString().slice(0,10)+'.json';if(Br&&Br.saveFile)return Br.saveFile(nm,js);
const a=h('a',{href:URL.createObjectURL(new Blob([js],{type:'application/json'})),download:nm});document.body.append(a);a.click();a.remove()})},'EXPORTAR COPIA'),
h('label',{class:'f'},'Importar copia (reemplaza lo actual)',h('input',{type:'file',accept:'.json,application/json',onchange:async e=>{const f=e.target.files[0];if(!f)return;
try{const d=JSON.parse(await f.text());if(d.app!='launcher'||!d.c||!d.b)throw Error('Archivo no válido');if(!await ask('¿Reemplazar todo con esta copia?'))return;
const c=await Promise.all(d.c.map(async x=>({...x,photo:x.photo?await(await fetch(x.photo)).blob():null})));
if(await sv(async()=>{await DB.replace({contacts:c,buttons:d.b,settings:Object.entries(d.s||{}).map(([key,v])=>({key,v}))});await load()}))home()}catch(x){msg('No se pudo importar: '+x.message)}}})));
V.install=()=>{const st=h('div',{});(async()=>{const L=[],ok=(t,v)=>L.push(h('p',{},(v?'✅ ':'❌ ')+t));
const r=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();ok('Servicio sin conexión instalado',!!(r&&r.active));
let n=0;try{const k=(await caches.keys()).find(x=>x.startsWith('launcher-'));n=k?(await(await caches.open(k)).keys()).length:0}catch{}ok('Archivos guardados para usar sin internet ('+n+')',n>=8);
ok('Abierta como aplicación instalada',matchMedia('(display-mode: standalone)').matches);ok('Datos locales disponibles',true);
ok('Con internet ahora (WhatsApp lo necesita)',navigator.onLine);st.replaceChildren(...L)})();
return pg('Instalar y sin internet',h('button',{class:'btn green',onclick:async()=>{if(S.ip){S.ip.prompt();S.ip=null}else msg('En Chrome tocá el menú ⋮ y elegí "Instalar aplicación" o "Agregar a la pantalla principal".')}},'INSTALAR APLICACIÓN'),st,
h('button',{class:'btn gray',onclick:async()=>{const p=navigator.storage&&navigator.storage.persist&&await navigator.storage.persist();msg(p?'Almacenamiento protegido.':'Chrome no concedió protección extra (es normal si aún no está instalada).')}},'Proteger datos'),
h('p',{class:'small'},'Prueba: con la app instalada, activá el modo avión y abrila desde su icono. Las llamadas necesitan señal; WhatsApp necesita internet.'))};

addEventListener('error',e=>msg('Error: '+e.message));addEventListener('unhandledrejection',e=>msg('Error: '+(e.reason&&e.reason.message||e.reason)));
(async()=>{try{await load()}catch(e){document.body.append(h('p',{class:'page'},'Este navegador no permite guardar datos. Abrí la aplicación en Chrome sin modo privado.'));return}
history.replaceState({n:'home',p:{},d:0},'');show('home');
if('serviceWorker'in navigator&&!Br)navigator.serviceWorker.register('sw.js').catch(()=>{})})();
})();
