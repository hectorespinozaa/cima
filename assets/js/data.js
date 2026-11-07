"use strict";
/* =====================================================================
   CIMA · Capa de datos
   - Con Supabase configurado (config.js) usa la base de datos real.
   - Sin configurar funciona en "modo demostración": todo se guarda solo
     en este navegador, para revisar la plataforma antes de publicarla.
   ===================================================================== */
const CFG=window.CIMA_CONFIG||{};
const DEMO=!(CFG.supabaseUrl&&CFG.supabaseKey);
const uuid=()=>(crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16);}));
function errMsg(e){
  const m=String(e&&(e.message||e.error_description||e)||'');
  if(/Invalid login credentials/i.test(m))return'Correo o contraseña incorrectos.';
  if(/already registered|already exists/i.test(m))return'Ya existe una cuenta con ese correo. Ingresa con tu contraseña.';
  if(/Password should be at least/i.test(m))return'La contraseña debe tener al menos 8 caracteres.';
  if(/Email not confirmed/i.test(m))return'Tu correo aún no está confirmado. Avisa a tu docente.';
  if(/valid email|invalid format/i.test(m))return'Escribe un correo válido.';
  if(/rate limit/i.test(m))return'Demasiados intentos seguidos. Espera un minuto y vuelve a probar.';
  if(/Failed to fetch|NetworkError|network/i.test(m))return'No hay conexión con el servidor. Revisa tu internet.';
  if(/Aún no apruebas/i.test(m))return m.replace(/^.*?(Aún no apruebas)/,'$1')+'.';
  return m||'Ocurrió un error inesperado.';
}

/* ---------------- Supabase ---------------- */
function remoteApi(){
  const sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true}});
  const chk=({data,error})=>{if(error)throw error;return data;};
  async function all(table,uid){
    const out=[];const step=1000;
    for(let from=0;;from+=step){
      let q=sb.from(table).select('*').range(from,from+step-1);
      if(uid)q=q.eq('user_id',uid);
      const rows=chk(await q);out.push(...rows);if(rows.length<step)break;
    }
    return out;
  }
  return{
    async currentUser(){const {data}=await sb.auth.getSession();return data.session?data.session.user:null;},
    async signUp({email,password,nombre,paralelo}){
      const data=chk(await sb.auth.signUp({email,password,options:{data:{nombre,paralelo}}}));
      if(!data.session)throw new Error('Tu cuenta fue creada, pero el servidor pide confirmar el correo. Avisa a tu docente para que desactive esa opción, o revisa tu bandeja de entrada.');
      return data.user;},
    async signIn(email,password){return chk(await sb.auth.signInWithPassword({email,password})).user;},
    async signOut(){await sb.auth.signOut();},
    async profile(uid){return chk(await sb.from('profiles').select('*').eq('id',uid).single());},
    async updateProfile(uid,patch){chk(await sb.from('profiles').update(patch).eq('id',uid));},
    async newSession(row){return chk(await sb.from('sessions').insert(row).select('id').single()).id;},
    async touchSession(id,secs){await sb.from('sessions').update({active_seconds:secs,last_seen:new Date().toISOString()}).eq('id',id);},
    async addAttempt(row){chk(await sb.from('attempts').insert(row));},
    async mine(table,uid){return all(table,uid);},
    async all(table){return all(table);},
    async emitCert(sid){return chk(await sb.rpc('emitir_certificado',{p_subject:sid}));},
    async verify(code){const d=chk(await sb.rpc('verificar_certificado',{p_code:code}));return d&&d[0]||null;},
    async syncCatalog(rows){chk(await sb.from('subjects').upsert(rows));},
  };
}

/* ---------------- Modo demostración (localStorage) ---------------- */
function localApi(){
  const K='cima-demo-v1';
  const load=()=>{try{return JSON.parse(localStorage.getItem(K))||null;}catch(_){return null;}};
  let db=load()||{users:[],profiles:[],sessions:[],attempts:[],certificates:[],subjects:[],current:null};
  const save=()=>{try{localStorage.setItem(K,JSON.stringify(db));}catch(_){}};
  const me=()=>db.current;
  const isDoc=()=>{const p=db.profiles.find(x=>x.id===me());return p&&p.rol==='docente';};
  return{
    demo:true,
    async currentUser(){const u=db.users.find(x=>x.id===me());return u?{id:u.id,email:u.email}:null;},
    async signUp({email,password,nombre,paralelo}){
      email=email.trim().toLowerCase();
      if(db.users.some(u=>u.email===email))throw new Error('User already registered');
      if(password.length<8)throw new Error('Password should be at least 8 characters');
      const id=uuid();db.users.push({id,email,password});
      db.profiles.push({id,email,nombre,paralelo,carrera:'Alimentos',rol:/^docente/.test(email)?'docente':'estudiante',created_at:new Date().toISOString()});
      db.current=id;save();return{id,email};},
    async signIn(email,password){const u=db.users.find(x=>x.email===email.trim().toLowerCase()&&x.password===password);if(!u)throw new Error('Invalid login credentials');db.current=u.id;save();return{id:u.id,email:u.email};},
    async signOut(){db.current=null;save();},
    async profile(uid){return db.profiles.find(p=>p.id===uid);},
    async updateProfile(uid,patch){Object.assign(db.profiles.find(p=>p.id===uid),patch);save();},
    async newSession(row){const id=uuid();db.sessions.push({id,user_id:me(),started_at:new Date().toISOString(),last_seen:new Date().toISOString(),active_seconds:0,...row});save();return id;},
    async touchSession(id,secs){const s=db.sessions.find(x=>x.id===id);if(s){s.active_seconds=secs;s.last_seen=new Date().toISOString();save();}},
    async addAttempt(row){db.attempts.push({id:db.attempts.length+1,user_id:me(),created_at:new Date().toISOString(),...row});save();},
    async mine(table,uid){return(db[table]||[]).filter(r=>r.user_id===uid);},
    async all(table){if(!isDoc())return[];return table==='profiles'?db.profiles:(db[table]||[]);},
    async emitCert(sid){
      const s=db.subjects.find(x=>x.id===sid)||(()=>{const sub=CIMA.subject(sid);return{id:sid,nombre:sub.nombre,topics:CIMA.topics(sid).map(t=>t.id)};})();
      const ex=db.certificates.find(c=>c.user_id===me()&&c.subject_id===sid);if(ex)return ex;
      const best={};db.attempts.filter(a=>a.user_id===me()&&a.subject_id===sid).forEach(a=>{best[a.topic_id]=Math.max(best[a.topic_id]||0,a.score);});
      const ok=s.topics.filter(t=>(best[t]||0)>=7).length;
      if(ok<s.topics.length)throw new Error(`Aún no apruebas todos los temas (${ok} de ${s.topics.length})`);
      const p=db.profiles.find(x=>x.id===me()),r4=()=>Math.random().toString(36).slice(2,6).toUpperCase();
      const c={code:`CIMA-${r4()}-${r4()}`,user_id:me(),subject_id:sid,nombre:p.nombre,materia:s.nombre,promedio:Math.round(s.topics.reduce((a,t)=>a+best[t],0)/s.topics.length*100)/100,temas:s.topics.length,issued_at:new Date().toISOString()};
      db.certificates.push(c);save();return c;},
    async verify(code){return db.certificates.find(c=>c.code===code.trim().toUpperCase())||null;},
    async syncCatalog(rows){rows.forEach(r=>{const i=db.subjects.findIndex(s=>s.id===r.id);if(i>=0)db.subjects[i]=r;else db.subjects.push(r);});save();},
    /* Solo demo: genera estudiantes ficticios para previsualizar el dashboard */
    async seedDemo(){
      const nombres=['Ana','Luis','María','José','Daniela','Carlos','Valeria','Andrés','Camila','Jorge','Paula','Kevin','Sofía','Bryan','Gabriela','Mateo','Nicole','Diego','Karla','Joel','Emily','Steven','Melany','Ariel'];
      const apell=['Mendoza','Zambrano','Cedeño','Vera','Loor','Macías','Delgado','Moreira','Intriago','Pico','Alcívar','Bravo'];
      const subs=CIMA.subjects.map(s=>({id:s.id,topics:CIMA.topics(s.id)}));const now=Date.now(),D=864e5;
      nombres.forEach((n,i)=>{
        const id=uuid(),email=`demo${i+1}@ejemplo.com`,par=['A','B','C'][i%3];
        db.users.push({id,email,password:'demo12345'});
        db.profiles.push({id,email,nombre:`${n} ${apell[i%apell.length]} (ejemplo)`,paralelo:par,carrera:'Alimentos',rol:'estudiante',created_at:new Date(now-60*D).toISOString()});
        const engage=Math.random(),skill=0.35+Math.random()*0.6,sub=subs[i%subs.length],extra=Math.random()<0.3?subs[(i+1)%subs.length]:null;
        const nvis=Math.round(2+engage*28);
        for(let v=0;v<nvis;v++){
          const day=now-Math.floor(Math.random()*(engage>0.2?55:20))*D-Math.random()*D*0.5,visit=uuid(),s=Math.random()<0.8||!extra?sub:extra;
          const secs=Math.round((300+Math.random()*2400)*(0.5+engage));
          db.sessions.push({id:uuid(),user_id:id,visit_id:visit,subject_id:s.id,started_at:new Date(day).toISOString(),last_seen:new Date(day+secs*1000).toISOString(),active_seconds:secs});
          const nt=1+Math.floor(Math.random()*3);
          for(let k=0;k<nt;k++){
            const t=s.topics[Math.min(s.topics.length-1,Math.floor(Math.random()*Math.max(1,s.topics.length*(0.3+engage*0.8))))];
            const prior=db.attempts.filter(a=>a.user_id===id&&a.topic_id===t.id).length;
            const total=t.subject==='estadistica'?6:6,p=Math.min(0.97,skill+prior*0.08);
            const det=Array.from({length:total},(_,q)=>({i:q,ok:Math.random()<p*(q===2?0.7:q===4?0.8:1),q:`Pregunta ${q+1} de ${t.short}`}));
            const correct=det.filter(d=>d.ok).length;
            db.attempts.push({id:db.attempts.length+1,user_id:id,subject_id:s.id,unit_id:t.unit,topic_id:t.id,mode:'practica',score:Math.round(correct/total*100)/10,correct,total,duration_s:Math.round(120+Math.random()*600),details:det,created_at:new Date(day+k*600000).toISOString()});
          }
        }
      });
      save();},
    async clearDemo(){db.profiles=db.profiles.filter(p=>!/\(ejemplo\)$/.test(p.nombre));const ids=new Set(db.profiles.map(p=>p.id));
      db.users=db.users.filter(u=>ids.has(u.id));['sessions','attempts','certificates'].forEach(t=>{db[t]=db[t].filter(r=>ids.has(r.user_id));});save();},
  };
}
const API=DEMO?localApi():remoteApi();
