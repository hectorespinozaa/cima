"use strict";
/* =====================================================================
   CIMA · Aplicación principal: estado, rutas, seguimiento, pruebas y
   vistas del estudiante. El dashboard docente está en docente.js.
   ===================================================================== */
const APROB=CFG.aprobacion||7;
const S={user:null,profile:null,attempts:[],sessions:[],certs:[],ready:false};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dayKey=d=>new Date(d).toLocaleDateString('en-CA');
const hrs=s=>s/3600;
const fmtDur=s=>{s=Math.round(s||0);const h=Math.floor(s/3600),m=Math.round((s%3600)/60);return h?`${h} h ${m} min`:`${m} min`;};
const fmtDate=d=>new Date(d).toLocaleDateString('es-EC',{day:'numeric',month:'long',year:'numeric'});
const SITE=()=>location.origin+location.pathname;

/* ---------------- Logo ---------------- */
const ICON=(s=34)=>`<svg width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#14233a"/><line x1="32" y1="18" x2="32" y2="5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M32 5 L44 9.5 L32 14Z" fill="#f0913d"/><path d="M10 54 L32 17 L54 54Z" fill="#3b6fb8"/><path d="M15 54 C23 54 25 32 32 32 C39 32 41 54 49 54" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="32" r="4" fill="#f0913d"/></svg>`;
const SEAL=(s=170)=>`<svg width="${s}" height="${s}" viewBox="0 0 220 220" aria-hidden="true"><defs><path id="sl-t" d="M20 110 a90 90 0 0 1 180 0"/><path id="sl-b" d="M24 110 a86 86 0 0 0 172 0"/></defs><circle cx="110" cy="110" r="104" fill="#fff" stroke="#14233a" stroke-width="3"/><circle cx="110" cy="110" r="70" fill="#1f4e8c"/><text font-family="IBM Plex Sans,Arial,sans-serif" font-size="9.6" font-weight="600" fill="#14233a" letter-spacing="1"><textPath href="#sl-t" startOffset="50%" text-anchor="middle">CALIDAD · INDUSTRIA · MATEMÁTICA · ALIMENTOS</textPath></text><text font-family="IBM Plex Sans,Arial,sans-serif" font-size="12" font-weight="600" fill="#e2731b" letter-spacing="2.4" dominant-baseline="hanging"><textPath href="#sl-b" startOffset="50%" text-anchor="middle">HÉCTOR ESPINOZA</textPath></text><line x1="110" y1="74" x2="110" y2="52" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><path d="M110 52 L127 58.5 L110 65Z" fill="#e2731b"/><path d="M70 142 L110 74 L150 142Z" fill="#fff"/><path d="M78 142 C92 142 97 104 110 104 C123 104 128 142 142 142" fill="none" stroke="#e2731b" stroke-width="4" stroke-linecap="round"/><circle cx="110" cy="104" r="5" fill="#e2731b"/><text x="110" y="166" font-family="Bricolage Grotesque,Arial Black,sans-serif" font-size="24" font-weight="800" fill="#fff" text-anchor="middle">CIMA</text></svg>`;
const WORDMARK=`<svg viewBox="0 0 330 190" class="wordmark" role="img" aria-label="CIMA · Héctor Espinoza"><text x="12" y="132" font-family="Bricolage Grotesque,Arial Black,sans-serif" font-size="88" font-weight="800" fill="currentColor" letter-spacing="1">CIM</text><g transform="translate(186,50)"><line x1="44" y1="2" x2="44" y2="-28" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M44 -28 L66 -20 L44 -12 Z" fill="var(--accent)"/><path d="M0 82 L44 0 L88 82 Z" fill="var(--data)"/><path d="M10 82 C26 82 30 34 44 34 C58 34 62 82 78 82" fill="none" stroke="var(--surface)" stroke-width="4" stroke-linecap="round"/><circle cx="44" cy="34" r="6" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/></g><path d="M16 152 L284 152" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/><text x="16" y="172" font-family="IBM Plex Sans,Arial,sans-serif" font-size="15" fill="currentColor" font-weight="600" letter-spacing="1">Héctor Espinoza</text><text x="16" y="187" font-family="IBM Plex Sans,Arial,sans-serif" font-size="9.6" fill="var(--accent)" font-weight="600" letter-spacing="0.8">CALIDAD · INDUSTRIA · MATEMÁTICA · ALIMENTOS</text></svg>`;

/* ---------------- Progreso y gamificación ---------------- */
const LEVELS=[
 {n:'Campamento base',alt:'',xp:0,d:'El punto de partida de toda expedición: aquí se preparan los escaladores antes de subir.'},
 {n:'Pasochoa',alt:'4200 m',xp:150,d:'Volcán apagado al sur de Quito, rodeado de bosque andino protegido. La primera montaña de muchos andinistas.'},
 {n:'Rucu Pichincha',alt:'4698 m',xp:400,d:'La cumbre que se ve desde Quito. "Rucu" significa "viejo" en kichwa; su hermano, el Guagua ("niño") Pichincha, sigue activo.'},
 {n:'Cayambe',alt:'5790 m',xp:800,d:'El único lugar del planeta donde la línea ecuatorial pasa por nieve y glaciares.'},
 {n:'Cotopaxi',alt:'5897 m',xp:1400,d:'Uno de los volcanes activos más altos del mundo, famoso por su cono casi perfecto.'},
 {n:'Chimborazo',alt:'6263 m',xp:2200,d:'La montaña más alta de Ecuador y el punto de la Tierra más alejado de su centro: por el abultamiento del planeta en el ecuador, su cumbre está más lejos del centro que la del Everest.'}];
function bestMap(attempts){const m={};attempts.forEach(a=>{const k=a.subject_id+'/'+a.topic_id;m[k]=Math.max(m[k]??0,+a.score);});return m;}
function countMap(attempts){const m={};attempts.forEach(a=>{const k=a.subject_id+'/'+a.topic_id;m[k]=(m[k]||0)+1;});return m;}
function xpOf(attempts){const b=bestMap(attempts),c=countMap(attempts);let xp=0;Object.keys(b).forEach(k=>{xp+=b[k]*10+5*Math.min(c[k],20);});return Math.round(xp);}
function levelOf(xp){let i=0;LEVELS.forEach((l,j)=>{if(xp>=l.xp)i=j;});const next=LEVELS[i+1];return{i,lv:LEVELS[i],next,pct:next?(xp-LEVELS[i].xp)/(next.xp-LEVELS[i].xp):1};}
function activeDays(attempts,sessions){const d=new Set();attempts.forEach(a=>d.add(dayKey(a.created_at)));sessions.forEach(s=>{if((s.active_seconds||0)>=60)d.add(dayKey(s.started_at));});return d;}
function streaks(days){
  const has=k=>days.has(k),key=t=>dayKey(t);let cur=0,t=Date.now();
  if(!has(key(t)))t-=864e5;while(has(key(t))){cur++;t-=864e5;}
  const sorted=[...days].sort();let best=0,run=0,prev=null;
  sorted.forEach(k=>{const d=new Date(k+'T12:00:00');run=prev&&(d-prev)/864e5<1.5?run+1:1;best=Math.max(best,run);prev=d;});
  return{cur,best};
}
function subjectProgress(sid,attempts){const b=bestMap(attempts),ts=CIMA.topics(sid),ok=ts.filter(t=>(b[sid+'/'+t.id]??0)>=APROB).length;return{ok,total:ts.length,pct:ts.length?ok/ts.length:0};}
const BADGES=[
 {id:'primer-paso',n:'Primer paso',d:'Termina tu primera prueba.',ic:'flag',f:c=>c.att.length>=1},
 {id:'primera-cumbre',n:'Primera cumbre',d:'Aprueba tu primer tema (nota 7 o más).',ic:'peak',f:c=>c.approved>=1},
 {id:'cinco-cumbres',n:'Cinco cumbres',d:'Aprueba 5 temas.',ic:'peaks',f:c=>c.approved>=5},
 {id:'diez',n:'Diez de diez',d:'Saca 10/10 en una prueba.',ic:'star',f:c=>c.att.some(a=>+a.score===10)},
 {id:'persistente',n:'Persistente',d:'Aprueba un tema después de 3 intentos sin lograrlo.',ic:'repeat',f:c=>c.persist},
 {id:'unidad',n:'Unidad completa',d:'Aprueba todos los temas de una unidad.',ic:'layers',f:c=>c.unitDone},
 {id:'racha3',n:'Racha de 3 días',d:'Practica 3 días seguidos.',ic:'flame',f:c=>c.streakBest>=3},
 {id:'racha7',n:'Semana completa',d:'Practica 7 días seguidos.',ic:'flame2',f:c=>c.streakBest>=7},
 {id:'hora',n:'Una hora en la montaña',d:'Acumula 1 hora de práctica activa.',ic:'clock',f:c=>c.secs>=3600},
 {id:'cinco-horas',n:'Escalador de fondo',d:'Acumula 5 horas de práctica activa.',ic:'clock2',f:c=>c.secs>=18000},
 {id:'constancia',n:'Constancia',d:'Completa 20 pruebas.',ic:'medal',f:c=>c.att.length>=20},
 {id:'explorador',n:'Explorador',d:'Practica en 2 materias distintas.',ic:'compass',f:c=>new Set(c.att.map(a=>a.subject_id)).size>=2},
 {id:'madrugador',n:'Madrugador',d:'Termina una prueba antes de las 7:00.',ic:'sun',f:c=>c.att.some(a=>new Date(a.created_at).getHours()<7)},
 {id:'nocturno',n:'Noctámbulo',d:'Termina una prueba después de las 22:00.',ic:'moon',f:c=>c.att.some(a=>new Date(a.created_at).getHours()>=22)},
 {id:'cumbre',n:'Cumbre alcanzada',d:'Obtén tu primer certificado de materia.',ic:'trophy',f:c=>c.certs>=1},
];
function badgeCtx(att,ses,certs){
  const b=bestMap(att);let approved=0;Object.values(b).forEach(v=>{if(v>=APROB)approved++;});
  let persist=false;const by={};[...att].sort((x,y)=>new Date(x.created_at)-new Date(y.created_at)).forEach(a=>{const k=a.subject_id+'/'+a.topic_id;by[k]=by[k]||{fails:0,done:false};if(by[k].done)return;if(+a.score>=APROB){if(by[k].fails>=3)persist=true;by[k].done=true;}else by[k].fails++;});
  const unitDone=CIMA.subjects.some(s=>s.units.some(u=>u.topics.length&&u.topics.every(t=>(b[s.id+'/'+t.id]??0)>=APROB)));
  return{att,approved,persist,unitDone,streakBest:streaks(activeDays(att,ses)).best,secs:ses.reduce((a,s)=>a+(s.active_seconds||0),0),certs:certs.length};
}
const earned=(att,ses,certs)=>{const c=badgeCtx(att,ses,certs);return new Set(BADGES.filter(b=>b.f(c)).map(b=>b.id));};
const IC={
 flag:'<path d="M12 40V8M12 9h20l-5 7 5 7H12" />',peak:'<path d="M6 40 22 12l16 28Z"/><path d="M22 4v8"/>',peaks:'<path d="M4 40 16 18l8 12 6-10 14 20Z"/>',
 star:'<path d="m24 6 5.3 11 12 1.6-8.8 8.3 2.2 12L24 33l-10.7 5.9 2.2-12L6.7 18.6l12-1.6Z"/>',repeat:'<path d="M10 20a14 14 0 0 1 25-7l3-3v10H28l4-4a9 9 0 0 0-17 4M38 28a14 14 0 0 1-25 7l-3 3V28h10l-4 4a9 9 0 0 0 17-4"/>',
 layers:'<path d="m24 8 16 8-16 8-16-8Z"/><path d="m8 24 16 8 16-8M8 32l16 8 16-8"/>',flame:'<path d="M24 42c-8 0-12-6-12-12 0-9 9-12 9-22 6 4 15 12 15 22 0 6-4 12-12 12Z"/>',
 flame2:'<path d="M24 42c-8 0-12-6-12-12 0-9 9-12 9-22 6 4 15 12 15 22 0 6-4 12-12 12Z"/><path d="M24 40c-3 0-5-2-5-5 0-4 5-6 5-10 3 3 5 6 5 10 0 3-2 5-5 5Z"/>',
 clock:'<circle cx="24" cy="24" r="16"/><path d="M24 14v10l7 5"/>',clock2:'<circle cx="24" cy="24" r="16"/><path d="M24 12v12l8 4M24 4v4M24 40v4"/>',
 medal:'<circle cx="24" cy="30" r="11"/><path d="m17 20-6-14h10l3 7 3-7h10l-6 14"/>',compass:'<circle cx="24" cy="24" r="17"/><path d="m30 18-4 10-8 4 4-10Z"/>',
 sun:'<circle cx="24" cy="26" r="8"/><path d="M24 8v5M10 26H5M43 26h-5M13 15l3 3M35 15l-3 3M6 38h36"/>',moon:'<path d="M32 36A14 14 0 1 1 22 10a11 11 0 0 0 10 26Z"/>',
 trophy:'<path d="M16 8h16v10a8 8 0 0 1-16 0ZM16 12H9a6 6 0 0 0 7 7M32 12h7a6 6 0 0 1-7 7M24 26v8M16 40h16l-2-6H18Z"/>'};
const badgeSvg=(ic,on)=>`<svg viewBox="0 0 48 48" class="bdg-ic${on?' on':''}" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${IC[ic]}</g></svg>`;

/* ---------------- Seguimiento de tiempo e ingresos ---------------- */
const T={visit:uuid(),subject:undefined,sid:null,row:null,secs:0,flushed:0,last:Date.now(),timer:null};
['pointerdown','keydown','scroll','input','touchstart'].forEach(ev=>addEventListener(ev,()=>{T.last=Date.now();},{passive:true,capture:true}));
async function flush(){if(!T.sid||T.secs===T.flushed)return;const s=T.secs;try{await API.touchSession(T.sid,s);T.flushed=s;if(T.row)T.row.active_seconds=s;}catch(_){}}
async function setContext(subject){
  if(!S.user||S.profile?.rol==='docente')return;
  subject=subject||null;if(subject===T.subject)return;
  await flush();T.subject=subject;T.secs=0;T.flushed=0;T.sid=null;T.row=null;
  try{const row={visit_id:T.visit,subject_id:subject};T.sid=await API.newSession(row);T.row={id:T.sid,...row,started_at:new Date().toISOString(),active_seconds:0};S.sessions.push(T.row);}catch(_){}
}
function startTracking(){if(T.timer)return;T.timer=setInterval(()=>{if(!T.sid)return;if(document.visibilityState==='visible'&&Date.now()-T.last<120000){T.secs+=15;if(T.row)T.row.active_seconds=T.secs;}if(T.secs-T.flushed>=60)flush();},15000);}
addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush();});
addEventListener('pagehide',()=>flush());

/* ---------------- Cola de intentos pendientes ---------------- */
const PK='cima-pendientes';
const pend={get(){try{return JSON.parse(localStorage.getItem(PK))||[];}catch(_){return[];}},set(v){try{localStorage.setItem(PK,JSON.stringify(v));}catch(_){}}};
async function retryPending(){const p=pend.get().filter(r=>r._uid===S.user?.id);if(!p.length)return;const left=[];for(const r of p){const {_uid,...row}=r;try{await API.addAttempt(row);}catch(_){left.push(r);}}pend.set(pend.get().filter(r=>r._uid!==S.user.id).concat(left));}

/* ---------------- Motor de pruebas ---------------- */
function toast(html,kind=''){const t=el(`<div class="toast ${kind}" role="status">${html}</div>`);$('#toasts').append(t);setTimeout(()=>t.classList.add('out'),4200);setTimeout(()=>t.remove(),4800);}
function runQuiz(mod,box){
  const qs=mod.quiz(),st={done:0,ok:0,res:[]},t0=Date.now();box.innerHTML='';
  qs.forEach((q,i)=>{
    const card=el(`<div class="q"><p class="q-n">Pregunta ${i+1} de ${qs.length}</p><div class="q-text">${q.text}</div><div class="q-ans"></div><div class="q-fb" hidden></div></div>`);
    const ans=card.querySelector('.q-ans'),fb=card.querySelector('.q-fb');let answered=false;
    const finish=c=>{answered=true;st.done++;if(c)st.ok++;st.res[i]=c;card.classList.add(c?'is-ok':'is-bad');fb.hidden=false;fb.innerHTML=`<strong>${c?'Correcto.':'Revisa esto.'}</strong> ${q.explain}`;update();};
    if(q.type==='mc'){
      const order=q.keepOrder?q.options.map((_,j)=>j):shuffle(q.options.map((_,j)=>j));
      order.forEach(j=>{const b=el(`<button type="button" class="opt${q.mono?' m':''}">${q.options[j]}</button>`);
        b.addEventListener('click',()=>{if(answered)return;const c=j===q.answer,btns=[...ans.querySelectorAll('.opt')];b.classList.add(c?'opt-ok':'opt-bad');if(!c)btns[order.indexOf(q.answer)].classList.add('opt-ok');btns.forEach(x=>x.disabled=true);finish(c);});ans.append(b);});
    }else{
      const id=`${mod.id}-q${i}`;
      const f=el(`<form class="num" novalidate><label for="${id}" class="sr">Tu respuesta</label><input id="${id}" inputmode="text" autocomplete="off" placeholder="${q.ph||'Tu respuesta'}"><span class="unit">${q.unit||''}</span><button class="btn">Comprobar</button><span class="warn" hidden>Escribe un número. Puedes usar coma decimal o una fracción como 3/4.</span></form>`);
      f.addEventListener('submit',e=>{e.preventDefault();if(answered)return;const inp=f.querySelector('input'),v=parseNum(inp.value);if(!Number.isFinite(v)){f.querySelector('.warn').hidden=false;return;}f.querySelector('.warn').hidden=true;
        const c=Math.abs(v-q.answer)<=(q.tol??0.01)+1e-9;inp.disabled=true;f.querySelector('button').disabled=true;finish(c);});
      ans.append(f);
    }
    box.append(card);
  });
  const score=el(`<div class="score"><p class="score-txt"></p><button type="button" class="btn btn-ghost">Nuevo intento con ejercicios nuevos</button></div>`);
  score.querySelector('button').addEventListener('click',()=>{runQuiz(mod,box);box.closest('.panel').scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});});
  box.append(score);
  async function update(){
    const t=score.querySelector('.score-txt');
    if(st.done<qs.length){t.textContent=`Respondidas ${st.done} de ${qs.length} · correctas ${st.ok}`;return;}
    const nota=round(st.ok/qs.length*10,1),k=mod.subject+'/'+mod.id,prevBest=bestMap(S.attempts)[k];
    const before=earned(S.attempts,S.sessions,S.certs);
    const lvBefore=levelOf(xpOf(S.attempts)).i;
    const row={subject_id:mod.subject,unit_id:mod.unit,topic_id:mod.id,mode:'practica',score:nota,correct:st.ok,total:qs.length,duration_s:Math.round((Date.now()-t0)/1000),
      details:qs.map((q,i)=>({i,ok:!!st.res[i],q:q.text.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,110)}))};
    S.attempts.push({...row,user_id:S.user.id,created_at:new Date().toISOString()});
    let saved=true;try{await API.addAttempt(row);}catch(e){saved=false;pend.set(pend.get().concat([{...row,_uid:S.user.id}]));}
    const best=Math.max(nota,prevBest??0);
    t.innerHTML=`<strong>Nota: ${fmt(nota,1)} / 10.</strong> ${prevBest!==undefined&&nota>prevBest?'Nueva mejor nota. ':''}${nota>=APROB?(prevBest===undefined||prevBest<APROB?'<b>¡Tema aprobado!</b> ':''):`Necesitas ${APROB} para aprobar. `}Mejor nota: ${fmt(best,1)}${saved?'':' · <span class="warn">No se pudo guardar ahora; se reintentará automáticamente.</span>'}`;
    score.classList.add('is-final');
    if(nota>=APROB&&(prevBest??0)<APROB)toast(`<b>¡Tema aprobado!</b> ${esc(mod.short)}`,'ok');
    const lvAfter=levelOf(xpOf(S.attempts)).i;if(lvAfter>lvBefore){const l=LEVELS[lvAfter];toast(`<span><b>¡Llegaste al ${esc(l.n)}${l.alt?` (${l.alt})`:''}!</b> ${esc(l.d)}</span>`,'level');}
    const after=earned(S.attempts,S.sessions,S.certs);BADGES.filter(b=>after.has(b.id)&&!before.has(b.id)).forEach(b=>toast(`${badgeSvg(b.ic,true)}<span><b>Nueva insignia:</b> ${b.n}</span>`,'badge'));
    renderTop();
  }
  update();
}

/* ---------------- Rutas ---------------- */
let REDRAW=null;
const PUBLIC=new Set(['','inicio','ingresar','registro','verificar','certificado','acerca']);
function parse(){const h=(location.hash||'#/').replace(/^#\/?/,'');const p=h.split('/').map(decodeURIComponent);return{name:p[0]||'',args:p.slice(1)};}
const go=h=>{if(location.hash===h)route();else location.hash=h;};
async function route(){
  const {name,args}=parse();const main=$('#main');REDRAW=null;
  if(!S.ready)return;
  if(!S.user&&!PUBLIC.has(name)){go('#/ingresar');return;}
  if(S.user&&(name==='ingresar'||name==='registro')){go('#/');return;}
  main.innerHTML='';renderTop(name);
  const v={'':S.user?(S.profile?.rol==='docente'?viewDocente:viewHome):viewLanding,inicio:viewLanding,ingresar:m=>viewAuth(m,'in'),registro:m=>viewAuth(m,'up'),materia:viewSubject,tema:viewTopic,logros:viewLogros,certificados:viewCerts,certificado:viewCert,verificar:viewVerify,acerca:viewAcerca,docente:viewDocente,perfil:viewPerfil}[name]||viewNotFound;
  const sid=name==='materia'||name==='tema'?args[0]:null;
  setContext(sid);
  try{await v(main,...args);}catch(e){console.error(e);main.innerHTML=`<div class="view"><div class="panel"><h2>Algo salió mal</h2><p>${esc(errMsg(e))}</p><p><a href="#/">Volver al inicio</a></p></div></div>`;}
  window.scrollTo({top:0,behavior:'auto'});
  const t=$('#main h1');document.title=(t?t.textContent+' · ':'')+'CIMA';
}
addEventListener('hashchange',route);
let rt=null;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(REDRAW)REDRAW();},150);});

/* ---------------- Barra superior ---------------- */
function renderTop(active){
  active=active??parse().name;
  const xp=xpOf(S.attempts),L=levelOf(xp);
  const link=(h,t,n)=>`<a href="${h}"${active===n?' aria-current="page"':''}>${t}</a>`;
  const doc=S.profile?.rol==='docente';
  $('#top').innerHTML=`<div class="wrap top-in">
    <a class="brand" href="#/" aria-label="CIMA, inicio">${ICON(34)}<span class="brand-t"><b>CIMA</b><small>v${esc(CFG.version)}</small></span></a>
    <nav class="toplinks" aria-label="Principal">${S.user?(doc?link('#/','Dashboard','')+link('#/acerca','Acerca','acerca'):link('#/','Inicio','')+link('#/logros','Logros','logros')+link('#/certificados','Certificados','certificados')):link('#/','Inicio','')+link('#/verificar','Verificar certificado','verificar')+link('#/acerca','Acerca','acerca')}</nav>
    <div class="topuser">${S.user?`${doc?'':`<a class="lvl-pill" href="#/logros" title="Tu nivel">${esc(L.lv.n)} · ${xp} XP</a>`}<a class="who" href="#/perfil" title="Mi perfil">${esc((S.profile?.nombre||'').split(' ')[0]||'Perfil')}</a><button type="button" class="btn btn-ghost btn-sm" id="logout">Salir</button>`:`<a class="btn btn-ghost btn-sm" href="#/ingresar">Ingresar</a><a class="btn btn-sm" href="#/registro">Crear cuenta</a>`}</div></div>
    ${DEMO?'<div class="demo-bar">Modo demostración: los datos se guardan solo en este navegador. Conecta Supabase en config.js para usar la plataforma real.</div>':''}`;
  const lo=$('#logout');if(lo)lo.onclick=async()=>{await flush();await API.signOut();S.user=null;S.profile=null;S.attempts=[];S.sessions=[];S.certs=[];T.subject=undefined;T.sid=null;go('#/');};
}

/* ---------------- Vistas públicas ---------------- */
function footer(){return`<footer class="foot"><div>${ICON(26)}<span><b>CIMA v${esc(CFG.version)}</b> · Calidad · Industria · Matemática · Alimentos</span></div><div>Desarrollado por <b>${esc(CFG.docenteNombre)}</b>, docente de la carrera de ${esc(CFG.carrera)}, ${esc(CFG.institucion)}.</div></footer>`;}
function viewLanding(main){
  const subs=[...CIMA.subjects].sort((a,b)=>a.orden-b.orden);
  main.append(el(`<div class="view landing">
   <section class="hero"><div class="hero-txt"><p class="eyebrow">Plataforma de práctica · carrera de ${esc(CFG.carrera)}</p>
     <h1>Practica, sube de nivel y llega a la <span class="hl">CIMA</span></h1>
     <p class="lead">Simuladores interactivos de <b>C</b>alidad, <b>I</b>ndustria, <b>M</b>atemática y <b>A</b>limentos. Mueves los datos, ves qué pasa y te pruebas con ejercicios que cambian en cada intento.</p>
     <div class="btn-row"><a class="btn btn-lg" href="#/registro">Crear mi cuenta</a><a class="btn btn-ghost btn-lg" href="#/ingresar">Ya tengo cuenta</a></div></div>
     <div class="hero-art">${WORDMARK}</div></section>
   <ol class="how"><li><b>Elige una materia</b><span>Todas están abiertas: si estás en Calidad puedes repasar Estadística o álgebra cuando lo necesites.</span></li><li><b>Experimenta y pruébate</b><span>Cada tema tiene idea clave, simulador y una prueba. Apruebas con ${APROB} o más.</span></li><li><b>Sube de nivel</b><span>Gana insignias, mantén tu racha y obtén tu certificado al aprobar toda la materia.</span></li></ol>
   <section class="grid-sec"><h2>Materias disponibles</h2><div class="cards">${subs.map(s=>`<div class="card static"><span class="card-top"><span class="num">${esc(s.nivel)}</span></span><span class="card-title">${esc(s.nombre)}</span><span class="card-desc">${esc(s.descripcion)}</span><span class="card-desc"><b>${s.units.length}</b> unidades · <b>${CIMA.topics(s.id).length}</b> temas</span></div>`).join('')}
     ${(CFG.proximamente||[]).map(n=>`<div class="card static soon"><span class="card-top"><span class="num">Próximamente</span></span><span class="card-title">${esc(n)}</span></div>`).join('')}</div></section>
   <section class="grid-sec"><h2>Los niveles de la montaña</h2><p class="lead">Cada prueba suma experiencia (XP). Empiezas en el campamento base y puedes llegar al Chimborazo.</p>${peaksSvg(-1)}</section>
   ${footer()}</div>`));
}
function viewAuth(main,mode){
  const up=mode==='up';
  main.append(el(`<div class="view auth"><div class="auth-card panel">
    <div class="auth-logo">${ICON(52)}</div><h1>${up?'Crea tu cuenta':'Ingresa a CIMA'}</h1>
    <p class="lead">${up?'Usa tu correo institucional. Tu avance quedará guardado y lo podrás ver desde cualquier dispositivo.':'Con tu correo y contraseña.'}</p>
    <form id="af" class="form" novalidate>
      ${up?`<div class="field"><label for="a-n">Nombres y apellidos completos</label><input class="inp" id="a-n" autocomplete="name" maxlength="80" required></div>
      <div class="field"><label for="a-p">Paralelo</label><input class="inp" id="a-p" maxlength="20" placeholder="Ej.: 2A"></div>`:''}
      <div class="field"><label for="a-e">Correo</label><input class="inp" id="a-e" type="email" autocomplete="email" required></div>
      <div class="field"><label for="a-w">Contraseña</label><input class="inp" id="a-w" type="password" autocomplete="${up?'new-password':'current-password'}" minlength="8" required>${up?'<span class="note">Mínimo 8 caracteres.</span>':''}</div>
      ${up?'<div class="field"><label for="a-w2">Repite la contraseña</label><input class="inp" id="a-w2" type="password" autocomplete="new-password" required></div><p class="note">Tus ingresos, tiempo de práctica y notas los ve tu docente para acompañarte en tu aprendizaje.</p>':''}
      <p class="err" id="a-err" role="alert" hidden></p>
      <button class="btn btn-lg" id="a-go">${up?'Crear cuenta':'Ingresar'}</button>
    </form>
    <p class="note">${up?'¿Ya tienes cuenta? <a href="#/ingresar">Ingresa aquí</a>.':'¿No tienes cuenta? <a href="#/registro">Créala aquí</a>. ¿Olvidaste tu contraseña? Pídele a tu docente que la restablezca.'}</p>
  </div></div>`));
  $('#af').addEventListener('submit',async e=>{e.preventDefault();const err=$('#a-err'),b=$('#a-go');err.hidden=true;
    const email=$('#a-e').value.trim(),pw=$('#a-w').value;
    try{
      if(up){const nombre=$('#a-n').value.trim().replace(/\s+/g,' '),paralelo=$('#a-p').value.trim().toUpperCase();
        if(nombre.split(' ').length<2)throw new Error('Escribe tus nombres y apellidos completos.');
        if(pw.length<8)throw new Error('La contraseña debe tener al menos 8 caracteres.');
        if(pw!==$('#a-w2').value)throw new Error('Las contraseñas no coinciden.');
        b.disabled=true;b.textContent='Creando…';await API.signUp({email,password:pw,nombre,paralelo});}
      else{b.disabled=true;b.textContent='Ingresando…';await API.signIn(email,pw);}
      await afterLogin();go('#/');
    }catch(x){err.textContent=errMsg(x);err.hidden=false;b.disabled=false;b.textContent=up?'Crear cuenta':'Ingresar';}
  });
}
async function viewVerify(main,code){
  main.append(el(`<div class="view"><header class="head"><p class="eyebrow">Verificación pública</p><h1>Verificar un certificado</h1><p class="lead">Escribe el código que aparece en el certificado (por ejemplo CIMA-7K2D-Q9XA).</p></header>
   <section class="panel"><form id="vf" class="ctrls" novalidate><label class="ctrl" style="flex-basis:280px"><span>Código</span><input class="inp mono" id="v-c" value="${esc(code||'')}" autocomplete="off"></label><button class="btn">Verificar</button></form><div id="v-r"></div></section>${footer()}</div>`));
  const run=async()=>{const c=$('#v-c').value.trim();if(!c)return;const r=$('#v-r');r.innerHTML='<p class="note">Consultando…</p>';
    try{const d=await API.verify(c);r.innerHTML=d?`<div class="verdict ok"><b>Certificado válido.</b> ${esc(d.nombre)} aprobó <b>${esc(d.materia)}</b> en CIMA (${d.temas} temas, promedio ${fmt(+d.promedio,2)} / 10) el ${fmtDate(d.issued_at)}. <a href="#/certificado/${esc(d.code)}">Ver certificado</a></div>`:'<div class="verdict bad"><b>No encontramos ese código.</b> Revisa que esté escrito exactamente como aparece en el certificado.</div>';}
    catch(e){r.innerHTML=`<div class="verdict bad">${esc(errMsg(e))}</div>`;}};
  $('#vf').addEventListener('submit',e=>{e.preventDefault();run();});if(code)run();
}
function viewAcerca(main){
  main.append(el(`<div class="view"><header class="head"><p class="eyebrow">Acerca de</p><h1>¿Qué es CIMA?</h1><p class="lead">Una plataforma para practicar las materias numéricas de la carrera de ${esc(CFG.carrera)} con simuladores y pruebas que cambian en cada intento.</p></header>
   <section class="acerca-grid"><div class="panel">${WORDMARK}</div><div class="idea"><h2>El nombre</h2>
   <div class="types"><div class="type"><b>C · Calidad</b><span>Control estadístico, mejora y gestión de la calidad.</span></div><div class="type"><b>I · Industria</b><span>Procesos reales de planta y la industria 4.0.</span></div><div class="type"><b>M · Matemática</b><span>Álgebra, métodos numéricos, estadística y probabilidad.</span></div><div class="type"><b>A · Alimentos</b><span>Todos los ejemplos salen de la industria alimentaria.</span></div></div>
   <p>Desarrollada por <b>${esc(CFG.docenteNombre)}</b>, docente de la carrera de ${esc(CFG.carrera)}, ${esc(CFG.institucion)}.</p></div></section>
   <section class="panel"><div class="sec-head"><h2>Novedades</h2><p>Versión actual: ${esc(CFG.version)}</p></div>
   <ol class="changelog">${(CFG.novedades||[]).map(n=>`<li><b>v${esc(n.v)}</b> <span class="muted">${esc(n.fecha)}</span><ul>${n.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></li>`).join('')}</ol></section>
   <section class="panel"><div class="sec-head"><h2>Tus datos</h2></div><p>CIMA guarda tu nombre, correo, paralelo, tus ingresos, el tiempo de práctica activa y las notas de tus pruebas. Solo tú y tu docente pueden verlos. Se usan para acompañar tu aprendizaje.</p></section>${footer()}</div>`));
}
function viewNotFound(main){main.append(el(`<div class="view"><div class="panel"><h1>Página no encontrada</h1><p><a href="#/">Volver al inicio</a></p></div></div>`));}

/* ---------------- Vistas del estudiante ---------------- */
function peaksSvg(cur,xp){
  const W=760,H=192,n=LEVELS.length,f1=v=>v.toFixed(1);
  const pts=LEVELS.map((l,i)=>[78+i*(W-150)/(n-1),H-30-(i===0?18:30+i*20)]);
  let ridge=`M0 ${H-20} `;pts.forEach(([x,y],i)=>{ridge+=`L${f1(x-34)} ${f1(y+40)} L${f1(x)} ${f1(y)} L${f1(x+34)} ${f1(y+40)} `;});ridge+=`L${W} ${H-20} L${W} ${H} L0 ${H} Z`;
  let s=`<div class="chart-wrap peaks-wrap"><svg viewBox="0 0 ${W} ${H}" class="chart peaks" role="img" aria-label="Niveles de CIMA"><path d="${ridge}" class="ridge"/>`;
  pts.forEach(([x,y],i)=>{const on=i<=cur;s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${i===cur?9:6}" class="pk${on?' on':''}${i===cur?' cur':''}"/><text x="${f1(x)}" y="${f1(y-16)}" text-anchor="middle" class="lbl">${LEVELS[i].n}</text><text x="${f1(x)}" y="${H-6}" text-anchor="middle">${LEVELS[i].xp} XP</text>`;
    if(i===cur)s+=`<line x1="${f1(x)}" y1="${f1(y-8)}" x2="${f1(x)}" y2="${f1(y-2)}"/><path d="M${f1(x)} ${f1(y-40)} v12" stroke="var(--ink)" stroke-width="2"/><path d="M${f1(x)} ${f1(y-40)} l12 4 -12 4Z" fill="var(--accent)"/>`;});
  return s+'</svg></div>';
}
function levelCard(){
  const xp=xpOf(S.attempts),L=levelOf(xp),days=activeDays(S.attempts,S.sessions),sk=streaks(days);
  const secs=S.sessions.reduce((a,s)=>a+(s.active_seconds||0),0),apr=Object.values(bestMap(S.attempts)).filter(v=>v>=APROB).length;
  return`<section class="level-card panel"><div class="lv-main"><p class="eyebrow">Tu nivel</p><h2>${esc(L.lv.n)} ${L.lv.alt?`<span class="muted">${L.lv.alt}</span>`:''}</h2>
    <div class="xpbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(L.pct*100)}"><span style="width:${Math.round(L.pct*100)}%"></span></div>
    <p class="note">${xp} XP${L.next?` · faltan <b>${L.next.xp-xp} XP</b> para ${esc(L.next.n)}`:' · ¡Llegaste a la cima más alta!'}</p></div>
    <div class="readouts"><div class="ro hl"><span>Racha actual</span><b>${sk.cur} día${sk.cur===1?'':'s'}</b></div><div class="ro"><span>Temas aprobados</span><b>${apr}</b></div><div class="ro"><span>Práctica activa</span><b>${fmtDur(secs)}</b></div><div class="ro"><span>Pruebas</span><b>${S.attempts.length}</b></div></div></section>`;
}
function viewHome(main){
  const subs=[...CIMA.subjects].sort((a,b)=>a.orden-b.orden),b=bestMap(S.attempts),c=countMap(S.attempts);
  const last=[...S.attempts].sort((x,y)=>new Date(y.created_at)-new Date(x.created_at))[0];
  let cont='';if(last){const t=CIMA.topic(last.subject_id,last.topic_id);if(t){const nxt=(+last.score>=APROB)?CIMA.topics(last.subject_id).find(x=>(b[last.subject_id+'/'+x.id]??0)<APROB):t;
    const go2=nxt||t;cont=`<section class="panel continue"><div><p class="eyebrow">Continúa donde te quedaste</p><h2>${esc(go2.n)} ${esc(go2.title)}</h2><p class="note">${esc(CIMA.subject(go2.subject).nombre)}${nxt&&nxt!==t?` · ya aprobaste ${esc(t.short)}, sigue con el próximo tema`:''}</p></div><a class="btn btn-lg" href="#/tema/${go2.subject}/${go2.id}">Continuar →</a></section>`;}}
  const eb=earned(S.attempts,S.sessions,S.certs);
  main.append(el(`<div class="view"><header class="head"><p class="eyebrow">Hola, ${esc((S.profile?.nombre||'').split(' ')[0])}</p><h1>Tu ascenso</h1></header>
   ${levelCard()}${cont}
   <section class="grid-sec"><h2>Materias</h2><div class="cards subj">${subs.map(s=>{const p=subjectProgress(s.id,S.attempts);return`<a class="card" href="#/materia/${s.id}"><span class="card-top"><span class="num">${esc(s.nivel)}</span><span class="chip ${p.ok===p.total&&p.total?'ok':p.ok?'mid':''}">${p.ok}/${p.total}</span></span><span class="card-title">${esc(s.nombre)}</span><span class="card-desc">${esc(s.descripcion)}</span><span class="pbar"><span style="width:${Math.round(p.pct*100)}%"></span></span></a>`;}).join('')}</div></section>
   <section class="grid-sec"><div class="sec-row"><h2>Insignias</h2><a href="#/logros">Ver todas →</a></div><div class="badges mini">${BADGES.filter(x=>eb.has(x.id)).slice(-6).map(x=>`<div class="bdg on">${badgeSvg(x.ic,true)}<b>${x.n}</b></div>`).join('')||'<p class="note">Aún no tienes insignias. Termina tu primera prueba para ganar “Primer paso”.</p>'}</div></section>
   ${footer()}</div>`));
}
function viewSubject(main,sid){
  const s=CIMA.subject(sid);if(!s)return viewNotFound(main);
  const b=bestMap(S.attempts),c=countMap(S.attempts),p=subjectProgress(sid,S.attempts),cert=S.certs.find(x=>x.subject_id===sid);
  main.append(el(`<div class="view"><header class="head"><p class="eyebrow"><a href="#/">Inicio</a> / ${esc(s.nivel)}</p><h1>${esc(s.nombre)}</h1><p class="lead">${esc(s.descripcion)}</p>
   <div class="pbar big"><span style="width:${Math.round(p.pct*100)}%"></span></div><p class="note">${p.ok} de ${p.total} temas aprobados ${cert?`· <a href="#/certificado/${cert.code}">Ver tu certificado</a>`:p.ok===p.total&&p.total?'· <a href="#/certificados"><b>¡Ya puedes obtener tu certificado!</b></a>':''}</p></header>
   ${s.units.map(u=>`<section class="panel unit"><div class="sec-head"><h2>${esc(u.nombre)}</h2></div><ol class="topics">${u.topics.map(t=>{const k=sid+'/'+t.id,bb=b[k],n=c[k]||0,stt=bb===undefined?'nuevo':bb>=APROB?'aprobado':'en progreso';
     return`<li><a class="topic-row" href="#/tema/${sid}/${t.id}"><span class="num">${esc(t.n)}</span><span class="t-main"><b>${esc(t.title)}</b><span class="note">${esc(t.desc||'')}</span></span><span class="t-stat"><span class="chip ${stt==='aprobado'?'ok':stt==='en progreso'?'mid':''}">${stt}</span><span class="note">${bb!==undefined?`mejor ${fmt(bb,1)} · ${n} intento${n===1?'':'s'}`:'sin intentos'}</span></span></a></li>`;}).join('')}</ol></section>`).join('')}
   ${footer()}</div>`));
}
function viewTopic(main,sid,tid){
  const s=CIMA.subject(sid),m=CIMA.topic(sid,tid);if(!s||!m)return viewNotFound(main);
  const all=CIMA.topics(sid),i=all.indexOf(m),prev=all[i-1],next=all[i+1],unit=s.units.find(u=>u.id===m.unit);
  const v=el(`<article class="view">
    <header class="head"><p class="eyebrow"><a href="#/materia/${sid}">${esc(s.nombre)}</a> / ${esc(unit?unit.nombre:'')}</p><h1><span class="tnum">${esc(m.n)}</span> ${esc(m.title)}</h1><p class="lead">${m.lead}</p></header>
    <div class="topic-tools no-print"><button type="button" class="btn btn-ghost btn-sm" id="proj">Modo proyector</button>${S.profile?.rol==='docente'?'<button type="button" class="btn btn-ghost btn-sm" id="ws">Hoja de ejercicios para imprimir</button>':''}</div>
    <section class="idea" aria-labelledby="idea-h"><h2 id="idea-h">Idea clave</h2>${m.idea}</section>
    <section class="panel" aria-labelledby="sim-h"><div class="sec-head"><h2 id="sim-h">Simulador</h2><p>${m.simHint}</p></div><div class="sim-body"></div></section>
    <section class="panel" aria-labelledby="quiz-h"><div class="sec-head"><h2 id="quiz-h">Pruébate</h2><p>Cada intento trae ejercicios nuevos. Apruebas con ${APROB} o más y se guarda tu mejor nota.</p></div><div class="quiz-body"></div></section>
    <nav class="pager" aria-label="Cambiar de tema">${prev?`<a class="btn btn-ghost" href="#/tema/${sid}/${prev.id}">← ${esc(prev.short)}</a>`:`<a class="btn btn-ghost" href="#/materia/${sid}">← ${esc(s.nombre)}</a>`}${next?`<a class="btn" href="#/tema/${sid}/${next.id}">${esc(next.short)} →</a>`:`<a class="btn" href="#/certificados">Mis certificados →</a>`}</nav>
  </article>`);
  main.append(v);
  REDRAW=m.sim(v.querySelector('.sim-body'))||null;
  runQuiz(m,v.querySelector('.quiz-body'));
  v.querySelector('#proj').addEventListener('click',()=>projector(true));
  const wb=v.querySelector('#ws');if(wb)wb.addEventListener('click',()=>worksheet(s,m));
}
/* Modo proyector: letra grande, sin barra superior */
function projector(on){document.body.classList.toggle('proj',on);let x=document.getElementById('proj-x');
  if(on&&!x){x=el('<button type="button" class="btn proj-x no-print" id="proj-x">Salir del modo proyector</button>');x.onclick=()=>projector(false);document.body.append(x);}
  if(!on&&x)x.remove();if(REDRAW)setTimeout(()=>{try{REDRAW();}catch(e){}},60);}
window.addEventListener('hashchange',()=>{if(document.body.classList.contains('proj'))projector(false);});
/* Hoja de ejercicios imprimible con solucionario (solo docente) */
function worksheet(s,m){const old=document.getElementById('ws-ov');if(old)old.remove();
  const ov=el(`<div class="ws-ov" id="ws-ov"><div class="ws-bar no-print"><b>Hoja de ejercicios · ${esc(m.n)} ${esc(m.short)}</b><label>Ejercicios <select id="ws-n"><option>6</option><option selected>12</option><option>18</option></select></label><label><input type="checkbox" id="ws-k" checked> Incluir solucionario</label><button type="button" class="btn btn-ghost btn-sm" id="ws-r">Otros ejercicios</button><button type="button" class="btn btn-sm" id="ws-p">Imprimir</button><button type="button" class="btn btn-ghost btn-sm" id="ws-c">Cerrar</button></div><div class="ws-doc" id="ws-doc"></div></div>`);
  document.body.append(ov);document.body.classList.add('ws-open');
  const build=()=>{const n=+ov.querySelector('#ws-n').value,qs=[];let g=0;while(qs.length<n&&g++<20)qs.push(...m.quiz());qs.length=Math.min(qs.length,n);
    const L='abcdefgh',head=`<div class="ws-head"><div><b>${esc(CFG.institucion||'')} · Carrera de ${esc(CFG.carrera||'')}</b><br>${esc(s.nombre)} · ${esc(m.n)} ${esc(m.title)}</div><div>Nombre: ______________________________<br>Fecha: ____________ Paralelo: ______</div></div>`;
    const body=qs.map((q,i)=>`<li class="ws-q"><div>${q.text}</div>${q.type==='mc'?`<ol class="ws-opts" type="a">${q.options.map(o=>`<li>${o}</li>`).join('')}</ol>`:`<div class="ws-line">Respuesta: ____________________ ${q.unit||''}</div>`}</li>`).join('');
    const key=qs.map((q,i)=>`<li><b>${q.type==='mc'?L[q.answer]+')':nf(q.answer,4)+(q.unit?' '+q.unit:'')}</b> ${q.explain?`<span>${q.explain}</span>`:''}</li>`).join('');
    ov.querySelector('#ws-doc').innerHTML=`<section class="ws-page">${head}<ol class="ws-list">${body}</ol><p class="ws-foot">CIMA · ${esc(CFG.docenteNombre||'')}</p></section>${ov.querySelector('#ws-k').checked?`<section class="ws-page ws-key"><h2>Solucionario · ${esc(m.n)} ${esc(m.short)}</h2><ol>${key}</ol></section>`:''}`;};
  ['ws-n','ws-k'].forEach(id=>ov.querySelector('#'+id).addEventListener('change',build));ov.querySelector('#ws-r').onclick=build;
  ov.querySelector('#ws-p').onclick=()=>{try{window.print();}catch(e){}};ov.querySelector('#ws-c').onclick=()=>{ov.remove();document.body.classList.remove('ws-open');};build();}
function heatmap(days){
  const W=7,weeks=16,end=new Date();end.setHours(12,0,0,0);const start=new Date(end-((weeks*7-1)-(6-((end.getDay()+6)%7)))*864e5);
  let cells='';for(let w=0;w<weeks;w++){cells+='<div class="hw">';for(let d=0;d<W;d++){const t=new Date(+start+(w*7+d)*864e5);if(t>end){cells+='<span class="hd empty"></span>';continue;}const k=dayKey(t);cells+=`<span class="hd${days.has(k)?' on':''}" title="${t.toLocaleDateString('es-EC')}${days.has(k)?' · practicaste':''}"></span>`;}cells+='</div>';}
  return`<div class="heat" aria-label="Días con práctica en las últimas ${weeks} semanas">${cells}</div><p class="note">Cada cuadro es un día; los coloreados son días en que practicaste (las columnas son semanas, de lunes a domingo).</p>`;
}
function viewLogros(main){
  const xp=xpOf(S.attempts),L=levelOf(xp),eb=earned(S.attempts,S.sessions,S.certs),days=activeDays(S.attempts,S.sessions),sk=streaks(days);
  main.append(el(`<div class="view"><header class="head"><p class="eyebrow">Logros</p><h1>Tu montaña</h1><p class="lead">Ganas XP por la mejor nota de cada tema (hasta 100 XP por tema) y por cada intento (5 XP, hasta 20 intentos por tema).</p></header>
   <section class="panel"><div class="sec-head"><h2>Nivel: ${esc(L.lv.n)}</h2><p>${xp} XP${L.next?` · siguiente: ${esc(L.next.n)} (${L.next.xp} XP)`:''}</p></div>${peaksSvg(L.i)}<div class="lv-cards">${LEVELS.map((l,i)=>`<div class="lv-c${i===L.i?' cur':i<L.i?' done':''}"><span class="lv-k">${i<L.i?'Alcanzada':i===L.i?'Estás aquí':`${l.xp} XP`}</span><b>${esc(l.n)}</b>${l.alt?`<span class="lv-alt">${l.alt}</span>`:''}<p>${esc(l.d)}</p></div>`).join('')}</div></section>
   <section class="panel"><div class="sec-head"><h2>Insignias</h2><p>${eb.size} de ${BADGES.length} ganadas</p></div><div class="badges">${BADGES.map(b=>`<div class="bdg${eb.has(b.id)?' on':''}">${badgeSvg(b.ic,eb.has(b.id))}<b>${b.n}</b><span>${b.d}</span></div>`).join('')}</div></section>
   <section class="panel"><div class="sec-head"><h2>Constancia</h2><p>Racha actual: <b>${sk.cur}</b> día${sk.cur===1?'':'s'} · mejor racha: <b>${sk.best}</b> · días con práctica: <b>${days.size}</b></p></div>${heatmap(days)}</section>${footer()}</div>`));
}
function viewCerts(main){
  const subs=[...CIMA.subjects].sort((a,b)=>a.orden-b.orden);
  main.append(el(`<div class="view"><header class="head"><p class="eyebrow">Certificados</p><h1>Tus certificados</h1><p class="lead">Obtienes el certificado de una materia cuando apruebas <b>todos</b> sus temas con ${APROB} o más. Cada certificado tiene un código que cualquiera puede verificar.</p></header>
   <div class="cards">${subs.map(s=>{const p=subjectProgress(s.id,S.attempts),c=S.certs.find(x=>x.subject_id===s.id);
     return`<div class="card static cert-card"><span class="card-top"><span class="num">${esc(s.nivel)}</span><span class="chip ${c?'ok':p.ok===p.total?'mid':''}">${c?'obtenido':`${p.ok}/${p.total}`}</span></span><span class="card-title">${esc(s.nombre)}</span><span class="pbar"><span style="width:${Math.round(p.pct*100)}%"></span></span>
     ${c?`<a class="btn" href="#/certificado/${c.code}">Ver certificado</a>`:p.ok===p.total&&p.total?`<button type="button" class="btn" data-emit="${s.id}">Obtener certificado</button>`:`<span class="note">Te faltan ${p.total-p.ok} tema${p.total-p.ok===1?'':'s'} por aprobar.</span>`}</div>`;}).join('')}</div>
   <p class="err" id="c-err" hidden></p>${footer()}</div>`));
  main.querySelectorAll('[data-emit]').forEach(b=>b.addEventListener('click',async()=>{b.disabled=true;b.textContent='Emitiendo…';
    try{if(!DEMO){await API.syncCatalog([catalogRow(b.dataset.emit)]).catch(()=>{});}const c=await API.emitCert(b.dataset.emit);S.certs.push(c);toast('<b>¡Felicitaciones!</b> Obtuviste tu certificado.','ok');go('#/certificado/'+c.code);}
    catch(e){const er=$('#c-err');er.textContent=errMsg(e);er.hidden=false;b.disabled=false;b.textContent='Obtener certificado';}}));
}
const catalogRow=sid=>({id:sid,nombre:CIMA.subject(sid).nombre,topics:CIMA.topics(sid).map(t=>t.id),updated_at:new Date().toISOString()});
async function viewCert(main,code){
  let c=S.certs.find(x=>x.code===code);if(!c&&code){try{c=await API.verify(code);}catch(_){}}
  if(!c){main.append(el(`<div class="view"><div class="panel"><h1>Certificado no encontrado</h1><p>Revisa el código o <a href="#/verificar">verifícalo aquí</a>.</p></div></div>`));return;}
  const url=`${SITE()}#/verificar/${c.code}`;
  main.append(el(`<div class="view"><div class="cert-tools no-print"><a class="btn btn-ghost" href="${S.user?'#/certificados':'#/'}">← Volver</a><button type="button" class="btn" id="pr">Imprimir o guardar en PDF</button></div>
   <article class="cert"><div class="cert-in">
    <div class="cert-seal">${SEAL(150)}</div>
    <p class="cert-k">CIMA · Calidad · Industria · Matemática · Alimentos</p>
    <p class="cert-t">Certificado de logro</p>
    <p class="cert-s">Se otorga a</p>
    <p class="cert-name">${esc(c.nombre)}</p>
    <p class="cert-s">por aprobar todos los temas de práctica de</p>
    <p class="cert-subj">${esc(c.materia)}</p>
    <p class="cert-s">${c.temas} temas aprobados con un promedio de <b>${fmt(+c.promedio,2)} / 10</b> · ${fmtDate(c.issued_at)}</p>
    <div class="cert-foot"><div class="sign"><span class="line"></span><b>${esc(CFG.docenteNombre)}</b><span>Docente · carrera de ${esc(CFG.carrera)}</span></div>
    <div class="code"><span>Código de verificación</span><b>${esc(c.code)}</b><span>${esc(url)}</span></div></div>
   </div></article></div>`));
  $('#pr').onclick=()=>window.print();
}
function viewPerfil(main){
  const p=S.profile||{};
  main.append(el(`<div class="view"><header class="head"><p class="eyebrow">Mi perfil</p><h1>${esc(p.nombre)}</h1><p class="lead">${esc(p.email)} · carrera de ${esc(p.carrera||CFG.carrera)}</p></header>
   <section class="panel"><form id="pf" class="form-grid" novalidate><div class="field"><label for="p-n">Nombres y apellidos</label><input class="inp" id="p-n" value="${esc(p.nombre)}" maxlength="80"></div><div class="field"><label for="p-p">Paralelo</label><input class="inp" id="p-p" value="${esc(p.paralelo)}" maxlength="20"></div><div><button class="btn">Guardar cambios</button></div></form><p class="note" id="p-msg" hidden></p>
   <p class="note">El nombre es el que aparecerá en tus certificados. Si necesitas cambiar tu correo o contraseña, pídeselo a tu docente.</p></section>${footer()}</div>`));
  $('#pf').addEventListener('submit',async e=>{e.preventDefault();const patch={nombre:$('#p-n').value.trim().replace(/\s+/g,' '),paralelo:$('#p-p').value.trim().toUpperCase()};const m=$('#p-msg');
    try{await API.updateProfile(S.user.id,patch);Object.assign(S.profile,patch);m.textContent='Cambios guardados.';}catch(x){m.textContent=errMsg(x);}m.hidden=false;renderTop();});
}

/* ---------------- Arranque ---------------- */
async function afterLogin(){
  S.user=await API.currentUser();if(!S.user)return;
  try{S.profile=await API.profile(S.user.id);}catch(_){S.profile={id:S.user.id,email:S.user.email,nombre:'',rol:'estudiante'};}
  if(S.profile?.rol!=='docente'){
    const [a,s,c]=await Promise.all([API.mine('attempts',S.user.id),API.mine('sessions',S.user.id),API.mine('certificates',S.user.id)]);
    S.attempts=a;S.sessions=s;S.certs=c;await retryPending();startTracking();T.subject=undefined;
  }
}
async function boot(){
  try{await afterLogin();}catch(e){console.error(e);}
  S.ready=true;renderTop();route();
}
boot();
