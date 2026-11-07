"use strict";
/* =====================================================================
   CIMA · Dashboard docente
   Pestañas: Resumen · Ranking · Estudiante · Materias · Tiempo vs logro ·
   Alertas · Preguntas difíciles · Exportar
   ===================================================================== */
const D={raw:null,f:{subject:'*',paralelo:'*',days:30},tab:'resumen',sort:{k:'visits',dir:-1},student:null};
const TABS=[['resumen','Resumen'],['ranking','Ranking'],['estudiante','Estudiante'],['materias','Materias'],['tiempo','Tiempo vs logro'],['alertas','Alertas'],['preguntas','Preguntas difíciles'],['exportar','Exportar']];
const SUBCLS=['s0','s1','s2','s3','s4'];
const subjIdx=sid=>Math.max(0,CIMA.subjects.findIndex(s=>s.id===sid));
const weekStart=t=>{const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return+d;};
const median=a=>{if(!a.length)return 0;const b=[...a].sort((x,y)=>x-y),n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2;};

async function viewDocente(main){
  if(S.profile?.rol!=='docente'){main.append(el(`<div class="view"><div class="panel"><h1>Solo para docentes</h1><p>Tu cuenta es de estudiante. <a href="#/">Volver al inicio</a></p></div></div>`));return;}
  main.append(el(`<div class="view dash"><header class="head"><p class="eyebrow">Panel docente</p><h1>Dashboard de CIMA</h1><p class="lead" id="d-sub">Cargando datos…</p></header><div id="d-body"></div></div>`));
  try{
    const rows=CIMA.subjects.map(s=>catalogRow(s.id));await API.syncCatalog(rows).catch(()=>{});
    const [profiles,sessions,attempts,certificates]=await Promise.all(['profiles','sessions','attempts','certificates'].map(t=>API.all(t)));
    D.raw={profiles,sessions,attempts,certificates};
  }catch(e){$('#d-sub').textContent=errMsg(e);return;}
  renderDash();
}
function buildData(){
  const R=D.raw,f=D.f,since=f.days?Date.now()-f.days*864e5:0;
  const studs=R.profiles.filter(p=>p.rol!=='docente'&&(f.paralelo==='*'||p.paralelo===f.paralelo));
  const ids=new Set(studs.map(s=>s.id)),inSub=r=>f.subject==='*'||r.subject_id===f.subject;
  const attAll=R.attempts.filter(a=>ids.has(a.user_id)&&inSub(a));
  const att=attAll.filter(a=>+new Date(a.created_at)>=since);
  const ses=R.sessions.filter(s=>ids.has(s.user_id)&&inSub(s)&&+new Date(s.started_at)>=since);
  const universe=f.subject==='*'?CIMA.subjects.flatMap(s=>CIMA.topics(s.id).map(t=>s.id+'/'+t.id)):CIMA.topics(f.subject).map(t=>f.subject+'/'+t.id);
  const by=(arr,k)=>{const m=new Map();arr.forEach(r=>{const v=r[k];if(!m.has(v))m.set(v,[]);m.get(v).push(r);});return m;};
  const A=by(att,'user_id'),AA=by(attAll,'user_id'),SS=by(ses,'user_id'),SA=by(R.sessions.filter(s=>ids.has(s.user_id)),'user_id'),AT=by(R.attempts.filter(a=>ids.has(a.user_id)),'user_id');
  const certs=R.certificates.filter(c=>ids.has(c.user_id)&&inSub(c));
  const rows=studs.map(p=>{
    const a=A.get(p.id)||[],aa=AA.get(p.id)||[],s=SS.get(p.id)||[],sAll=SA.get(p.id)||[],atAll=AT.get(p.id)||[];
    const b=bestMap(aa),approved=universe.filter(k=>(b[k]??0)>=APROB).length,practiced=Object.keys(b).filter(k=>universe.includes(k));
    const secs=s.reduce((x,r)=>x+(r.active_seconds||0),0),visits=new Set(s.map(r=>r.visit_id)).size;
    const lastT=Math.max(0,...sAll.map(r=>+new Date(r.last_seen||r.started_at)),...atAll.map(r=>+new Date(r.created_at)));
    const days=activeDays(atAll,sAll),sk=streaks(days);
    return{id:p.id,nombre:p.nombre||p.email,email:p.email,paralelo:p.paralelo||'—',visits,secs,hours:secs/3600,tests:a.length,approved,pct:universe.length?approved/universe.length:0,
      avgBest:practiced.length?practiced.reduce((x,k)=>x+b[k],0)/practiced.length:null,last:lastT||null,streak:sk.cur,streakBest:sk.best,xp:xpOf(atAll),eff:secs>180?approved/(secs/3600):null,
      certs:certs.filter(c=>c.user_id===p.id).length,att:aa,ses:sAll};
  });
  return{rows,att,attAll,ses,universe,certs,studs,since};
}
function filtersHtml(){
  const pars=[...new Set(D.raw.profiles.filter(p=>p.rol!=='docente').map(p=>p.paralelo).filter(Boolean))].sort();
  const sel=(id,opts,v)=>`<select id="${id}">${opts.map(([k,t])=>`<option value="${esc(k)}"${String(v)===String(k)?' selected':''}>${esc(t)}</option>`).join('')}</select>`;
  return`<div class="filters"><label class="ctrl"><span>Materia</span>${sel('f-s',[['*','Todas las materias'],...CIMA.subjects.map(s=>[s.id,s.nombre])],D.f.subject)}</label>
   <label class="ctrl"><span>Paralelo</span>${sel('f-p',[['*','Todos'],...pars.map(p=>[p,p])],D.f.paralelo)}</label>
   <label class="ctrl"><span>Período de actividad</span>${sel('f-d',[[7,'Últimos 7 días'],[30,'Últimos 30 días'],[90,'Últimos 90 días'],[0,'Todo']],D.f.days)}</label></div>`;
}
function renderDash(){
  const B=$('#d-body');if(!B)return;const X=buildData();
  $('#d-sub').textContent=`${X.studs.length} estudiantes registrados${D.f.paralelo!=='*'?' en el paralelo '+D.f.paralelo:''}. Los temas aprobados son acumulados; ingresos, tiempo y pruebas corresponden al período elegido.`;
  B.innerHTML=`${filtersHtml()}<div class="tabs" role="tablist">${TABS.map(([k,t])=>`<button type="button" role="tab" aria-selected="${D.tab===k}" data-tab="${k}">${t}</button>`).join('')}</div><div id="d-tab"></div>`;
  B.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{D.tab=b.dataset.tab;renderDash();});
  [['f-s','subject'],['f-p','paralelo'],['f-d','days']].forEach(([id,k])=>$('#'+id).onchange=e=>{D.f[k]=k==='days'?+e.target.value:e.target.value;renderDash();});
  const T=$('#d-tab');REDRAW=()=>renderDash();
  ({resumen:tabResumen,ranking:tabRanking,estudiante:tabEstudiante,materias:tabMaterias,tiempo:tabTiempo,alertas:tabAlertas,preguntas:tabPreguntas,exportar:tabExportar}[D.tab])(T,X);
}
const kpi=(t,v,s='',hl)=>`<div class="ro${hl?' hl':''}"><span>${t}</span><b>${v}</b>${s?`<span>${s}</span>`:''}</div>`;
const legend=items=>`<div class="legend">${items.map(([c,t])=>`<span><i class="lg ${c}"></i>${esc(t)}</span>`).join('')}</div>`;
function weekly(X){
  const now=weekStart(Date.now()),W=12,wk=Array.from({length:W},(_,i)=>now-(W-1-i)*7*864e5),idx=t=>wk.indexOf(weekStart(t));
  const visits=wk.map(()=>new Set()),active=wk.map(()=>new Set()),bySub=CIMA.subjects.map(()=>wk.map(()=>0));
  const R=D.raw,ids=new Set(X.studs.map(s=>s.id)),inSub=r=>D.f.subject==='*'||r.subject_id===D.f.subject;
  R.sessions.forEach(s=>{if(!ids.has(s.user_id)||!inSub(s))return;const i=idx(s.started_at);if(i>=0){visits[i].add(s.visit_id);active[i].add(s.user_id);}});
  R.attempts.forEach(a=>{if(!ids.has(a.user_id)||!inSub(a))return;const i=idx(a.created_at);if(i>=0){bySub[subjIdx(a.subject_id)][i]++;active[i].add(a.user_id);}});
  return{wk,visits:visits.map(s=>s.size),active:active.map(s=>s.size),bySub};
}
const wkLabel=t=>new Date(t).toLocaleDateString('es-EC',{day:'numeric',month:'short'});
function tabResumen(T,X){
  const r=X.rows,act=r.filter(x=>x.visits||x.tests).length,hrsT=r.reduce((a,x)=>a+x.hours,0),vis=r.reduce((a,x)=>a+x.visits,0),apr=r.reduce((a,x)=>a+x.approved,0);
  const inact=r.filter(x=>!x.last||Date.now()-x.last>7*864e5).length,stuck=stuckList(X).length,Wk=weekly(X);
  T.innerHTML=`<div class="readouts kpis">${kpi('Estudiantes activos',`${act} / ${r.length}`,'con actividad en el período',true)}${kpi('Ingresos',vis,'visitas a la plataforma')}${kpi('Práctica activa',fmt(hrsT,1)+' h',`media ${fmt(act?hrsT/act:0,1)} h por activo`)}${kpi('Pruebas',X.att.length,`nota media ${X.att.length?fmt(X.att.reduce((a,x)=>a+ +x.score,0)/X.att.length,1):'—'}`)}${kpi('Avance medio',fmt(r.length?r.reduce((a,x)=>a+x.pct,0)/r.length*100:0,0)+' %',`${apr} temas aprobados en total`)}${kpi('Certificados',X.certs.length)}</div>
   <div class="dash-grid"><section class="panel"><div class="sec-head"><h2>Ingresos por semana</h2><p>Barras: ingresos. Línea: estudiantes activos. Últimas 12 semanas.</p></div><div class="chart-wrap" id="ch-w"></div></section>
   <section class="panel"><div class="sec-head"><h2>Para atender</h2><p>Revisa la pestaña Alertas para el detalle.</p></div><div class="readouts">${kpi('Sin actividad 7+ días',inact,'',inact>0)}${kpi('Atascados en un tema',stuck,'3+ intentos sin aprobar',stuck>0)}</div>
   <div class="sec-head" style="margin-top:6px"><h2>Top 5 por ingresos</h2></div><ol class="top5">${[...r].sort((a,b)=>b.visits-a.visits||b.hours-a.hours).slice(0,5).map(x=>`<li><button type="button" class="linkish" data-st="${x.id}">${esc(x.nombre)}</button><span class="note">${x.visits} ingresos · ${fmt(x.hours,1)} h</span></li>`).join('')}</ol></section></div>`;
  const ymax=Math.max(4,...Wk.visits,...Wk.active)*1.15;
  $('#ch-w').innerHTML=chart({W:cw($('#ch-w')),xmin:-0.6,xmax:11.6,ymax,gap:0,label:'Ingresos por semana',xticks:[0,2,4,6,8,10],xfmt:i=>wkLabel(Wk.wk[i]),yfmt:v=>nf(v,0),
    bars:Wk.visits.map((v,i)=>({x0:i-0.35,x1:i+0.35,y:v,title:`Semana del ${wkLabel(Wk.wk[i])}: ${v} ingresos`})),curves:[{cls:'acc',pts:Wk.active.map((v,i)=>[i,v])}]})+legend([['bar','Ingresos'],['s1','Estudiantes activos']]);
  T.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{D.student=b.dataset.st;D.tab='estudiante';renderDash();});
}
const COLS=[['nombre','Estudiante'],['paralelo','Paralelo'],['visits','Ingresos'],['hours','Horas'],['tests','Pruebas'],['approved','Temas aprob.'],['avgBest','Nota media'],['streak','Racha'],['xp','XP'],['last','Último ingreso']];
function tabRanking(T,X){
  const {k,dir}=D.sort,rows=[...X.rows].sort((a,b)=>{const va=a[k]??-1,vb=b[k]??-1;return typeof va==='string'?dir*va.localeCompare(vb,'es'):dir*(va-vb);});
  const cell=(c,x)=>c==='hours'?fmt(x.hours,1):c==='avgBest'?(x.avgBest==null?'—':fmt(x.avgBest,1)):c==='approved'?`${x.approved}/${X.universe.length}`:c==='last'?(x.last?new Date(x.last).toLocaleDateString('es-EC'):'nunca'):c==='nombre'?`<button type="button" class="linkish" data-st="${x.id}">${esc(x.nombre)}</button>`:esc(x[c]);
  T.innerHTML=`<section class="panel"><div class="sec-head"><h2>Ranking de estudiantes</h2><p>Haz clic en una columna para ordenar y en un nombre para ver su evolución.</p></div>
   <div class="table-wrap"><table class="tbl rank"><thead><tr><th>#</th>${COLS.map(([c,t])=>`<th><button type="button" class="th-sort" data-k="${c}">${t}${k===c?(dir<0?' ↓':' ↑'):''}</button></th>`).join('')}</tr></thead>
   <tbody>${rows.map((x,i)=>`<tr${i<3&&k!=='nombre'?' class="podium"':''}><td>${i+1}</td>${COLS.map(([c])=>`<td>${cell(c,x)}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="11">Aún no hay estudiantes registrados.</td></tr>`}</tbody></table></div></section>`;
  T.querySelectorAll('.th-sort').forEach(b=>b.onclick=()=>{const c=b.dataset.k;D.sort={k:c,dir:D.sort.k===c?-D.sort.dir:(c==='nombre'||c==='paralelo'?1:-1)};renderDash();});
  T.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{D.student=b.dataset.st;D.tab='estudiante';renderDash();});
}
function tabEstudiante(T,X){
  const rows=[...X.rows].sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));if(!rows.length){T.innerHTML='<section class="panel"><p>Aún no hay estudiantes.</p></section>';return;}
  if(!D.student||!rows.some(r=>r.id===D.student))D.student=rows[0].id;const x=rows.find(r=>r.id===D.student);
  const att=[...x.att].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)),b=bestMap(att),c=countMap(att);
  const subSecs=CIMA.subjects.map(s=>[s.nombre,x.ses.filter(r=>r.subject_id===s.id).reduce((a,r)=>a+(r.active_seconds||0),0)]);
  T.innerHTML=`<section class="panel"><label class="ctrl" style="max-width:420px"><span>Estudiante</span><select id="st-sel">${rows.map(r=>`<option value="${r.id}"${r.id===x.id?' selected':''}>${esc(r.nombre)} · ${esc(r.paralelo)}</option>`).join('')}</select></label>
   <p class="note">${esc(x.email)} · último ingreso: ${x.last?new Date(x.last).toLocaleString('es-EC'):'nunca'}</p>
   <div class="readouts">${kpi('Ingresos (período)',x.visits)}${kpi('Práctica (período)',fmtDur(x.secs))}${kpi('Temas aprobados',`${x.approved}/${X.universe.length}`,'',true)}${kpi('Nota media (mejores)',x.avgBest==null?'—':fmt(x.avgBest,1))}${kpi('Racha actual / mejor',`${x.streak} / ${x.streakBest}`)}${kpi('Nivel',levelOf(x.xp).lv.n,x.xp+' XP')}</div></section>
   <section class="panel"><div class="sec-head"><h2>Evolución de notas</h2><p>Cada punto es una prueba, en orden. La línea es el promedio de las últimas 5. Aprobación: ${APROB}.</p></div><div class="chart-wrap" id="st-ch"></div></section>
   <div class="dash-grid"><section class="panel"><div class="sec-head"><h2>Por tema</h2></div><div class="table-wrap"><table class="tbl"><thead><tr><th>Tema</th><th>Intentos</th><th>Mejor</th><th>Estado</th></tr></thead><tbody>
   ${CIMA.subjects.flatMap(s=>CIMA.topics(s.id).filter(t=>c[s.id+'/'+t.id]).map(t=>{const k=s.id+'/'+t.id;return`<tr><td>${esc(s.nombre.split(' ')[0])} ${esc(t.n)} ${esc(t.short)}</td><td>${c[k]}</td><td>${fmt(b[k],1)}</td><td class="${b[k]>=APROB?'ok':'bad'}">${b[k]>=APROB?'aprobado':'en progreso'}</td></tr>`;})).join('')||'<tr><td colspan="4">Sin pruebas todavía.</td></tr>'}</tbody></table></div></section>
   <section class="panel"><div class="sec-head"><h2>Tiempo por materia (total)</h2></div><div class="hbars">${hbars(subSecs.map(([n,s])=>({label:n,value:s/3600,txt:fmtDur(s)})))}</div><div class="sec-head"><h2>Días con práctica</h2></div>${heatmap(activeDays(x.att,x.ses))}</section></div>`;
  $('#st-sel').onchange=e=>{D.student=e.target.value;renderDash();};
  const pts=att.map((a,i)=>({x:i+1,y:+a.score,cls:SUBCLS[subjIdx(a.subject_id)]})),roll=att.map((a,i)=>[i+1,att.slice(Math.max(0,i-4),i+1).reduce((s,z)=>s+ +z.score,0)/Math.min(5,i+1)]);
  $('#st-ch').innerHTML=att.length?chart({W:cw($('#st-ch')),xmin:0.5,xmax:Math.max(2,att.length)+0.5,ymin:0,ymax:10.5,yticks:[0,2,4,6,8,10],label:'Evolución de notas',xlabel:'Número de prueba',xfmt:v=>nf(v,0),xticks:niceTicks(1,Math.max(2,att.length),8).filter(Number.isInteger),
    curves:[{cls:'ink thin',pts:roll}],hlines:[{y:APROB,cls:'acc',label:`aprobación ${APROB}`}],points:pts.map(p=>({x:p.x,y:p.y,cls:'sc '+p.cls}))})+legend(CIMA.subjects.map((s,i)=>[SUBCLS[i],s.nombre])):'<p class="note">Este estudiante aún no ha hecho pruebas.</p>';
}
function hbars(items){const mx=Math.max(1e-9,...items.map(i=>i.value));return items.map(i=>`<div class="hb"><span class="hb-l">${esc(i.label)}</span><span class="hb-t"><span class="hb-f ${i.cls||''}" style="width:${Math.round(i.value/mx*100)}%"></span></span><span class="hb-v">${i.txt}</span></div>`).join('');}
function tabMaterias(T,X){
  const R=D.raw,ids=new Set(X.studs.map(s=>s.id)),since=X.since;
  const stat=CIMA.subjects.map((s,i)=>{const att=R.attempts.filter(a=>ids.has(a.user_id)&&a.subject_id===s.id),attP=att.filter(a=>+new Date(a.created_at)>=since),ses=R.sessions.filter(r=>ids.has(r.user_id)&&r.subject_id===s.id&&+new Date(r.started_at)>=since);
    const users=new Set(attP.map(a=>a.user_id).concat(ses.map(r=>r.user_id))),bu={};att.forEach(a=>{bu[a.user_id]=bu[a.user_id]||[];bu[a.user_id].push(a);});const ts=CIMA.topics(s.id);
    const pcts=Object.values(bu).map(arr=>{const b=bestMap(arr);return ts.filter(t=>(b[s.id+'/'+t.id]??0)>=APROB).length/ts.length;});
    return{s,i,users:users.size,visits:new Set(ses.map(r=>r.visit_id)).size,hours:ses.reduce((a,r)=>a+(r.active_seconds||0),0)/3600,tests:attP.length,mean:attP.length?attP.reduce((a,x)=>a+ +x.score,0)/attP.length:null,pct:pcts.length?mean(pcts):0,certs:R.certificates.filter(c=>ids.has(c.user_id)&&c.subject_id===s.id).length,att};});
  const Wk=weekly({studs:X.studs});const sel=D.f.subject==='*'?CIMA.subjects[0].id:D.f.subject,ss=stat.find(z=>z.s.id===sel);
  const topicRows=CIMA.topics(sel).map(t=>{const at=ss.att.filter(a=>a.topic_id===t.id),bu={};at.forEach(a=>{(bu[a.user_id]=bu[a.user_id]||[]).push(+a.score);});const us=Object.values(bu);const ok=us.filter(v=>Math.max(...v)>=APROB).length;
    return{t,users:us.length,ok,rate:us.length?ok/us.length:0,avgAtt:us.length?mean(us.map(v=>v.length)):0};});
  T.innerHTML=`<section class="panel"><div class="sec-head"><h2>Comparación entre materias</h2><p>Ingresos, horas y pruebas del período; avance y certificados acumulados.</p></div><div class="table-wrap"><table class="tbl"><thead><tr><th>Materia</th><th>Estudiantes activos</th><th>Ingresos</th><th>Horas</th><th>Pruebas</th><th>Nota media</th><th>Avance medio</th><th>Certificados</th></tr></thead><tbody>
   ${stat.map(z=>`<tr><td><i class="lg ${SUBCLS[z.i]}"></i> ${esc(z.s.nombre)}</td><td>${z.users}</td><td>${z.visits}</td><td>${fmt(z.hours,1)}</td><td>${z.tests}</td><td>${z.mean==null?'—':fmt(z.mean,1)}</td><td>${fmt(z.pct*100,0)} %</td><td>${z.certs}</td></tr>`).join('')}</tbody></table></div></section>
   <section class="panel"><div class="sec-head"><h2>Evolución por materia</h2><p>Pruebas realizadas por semana, últimas 12 semanas.</p></div><div class="chart-wrap" id="ms-ch"></div></section>
   <section class="panel"><div class="sec-head"><h2>Aprobación por tema · ${esc(CIMA.subject(sel).nombre)}</h2><p>Porcentaje de estudiantes que lo intentaron y lo aprobaron. ${D.f.subject==='*'?'Elige una materia en el filtro para ver otra.':''}</p></div>
   <div class="hbars">${hbars(topicRows.map(r=>({label:`${r.t.n} ${r.t.short}`,value:r.rate,txt:r.users?`${fmt(r.rate*100,0)} % · ${r.users} est. · ${fmt(r.avgAtt,1)} intentos`:'sin intentos',cls:r.rate>=0.7?'good':r.rate>=0.4?'':'badf'})))}</div></section>`;
  const ymax=Math.max(4,...Wk.bySub.flat())*1.15;
  $('#ms-ch').innerHTML=chart({W:cw($('#ms-ch')),xmin:0,xmax:11,ymax,label:'Pruebas por semana y materia',xticks:[0,2,4,6,8,10],xfmt:i=>wkLabel(Wk.wk[i]),yfmt:v=>nf(v,0),
    curves:Wk.bySub.map((arr,i)=>({cls:SUBCLS[i],pts:arr.map((v,j)=>[j,v])}))})+legend(CIMA.subjects.map((s,i)=>[SUBCLS[i],s.nombre]));
}
function scatter(o){
  const W=o.W,H=Math.round(clamp(W*0.6,260,420)),m={l:52,r:16,t:16,b:44},iw=W-m.l-m.r,ih=H-m.t-m.b,X=x=>m.l+x/o.xmax*iw,Y=y=>m.t+ih-y/o.ymax*ih,f1=v=>v.toFixed(1);
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="chart" role="img" aria-label="${o.label}">`;
  s+=`<rect x="${f1(X(o.vx))}" y="${m.t}" width="${f1(m.l+iw-X(o.vx))}" height="${f1(Y(o.hy)-m.t)}" class="quad q-ok"/><rect x="${f1(X(o.vx))}" y="${f1(Y(o.hy))}" width="${f1(m.l+iw-X(o.vx))}" height="${f1(m.t+ih-Y(o.hy))}" class="quad q-bad"/>`;
  niceTicks(0,o.xmax,6).forEach(v=>{s+=`<line class="grid" x1="${f1(X(v))}" x2="${f1(X(v))}" y1="${m.t}" y2="${m.t+ih}"/><text x="${f1(X(v))}" y="${m.t+ih+18}" text-anchor="middle">${nf(v,1)}</text>`;});
  [0,25,50,75,100].forEach(v=>{s+=`<line class="grid" x1="${m.l}" x2="${m.l+iw}" y1="${f1(Y(v))}" y2="${f1(Y(v))}"/><text x="${m.l-8}" y="${f1(Y(v)+4)}" text-anchor="end">${v} %</text>`;});
  s+=`<line class="vl" x1="${f1(X(o.vx))}" x2="${f1(X(o.vx))}" y1="${m.t}" y2="${m.t+ih}"/><line class="vl" x1="${m.l}" x2="${m.l+iw}" y1="${f1(Y(o.hy))}" y2="${f1(Y(o.hy))}"/>`;
  s+=`<text class="lbl" x="${m.l+iw-6}" y="${m.t+14}" text-anchor="end">Constante y con logro</text><text class="lbl" x="${m.l+6}" y="${m.t+14}">Eficiente</text><text class="lbl" x="${m.l+iw-6}" y="${m.t+ih-8}" text-anchor="end">Necesita apoyo</text><text class="lbl" x="${m.l+6}" y="${m.t+ih-8}">Por activar</text>`;
  o.pts.forEach(p=>{s+=`<circle class="pt sc ${p.cls||''}" cx="${f1(X(Math.min(p.x,o.xmax)))}" cy="${f1(Y(p.y))}" r="6"><title>${esc(p.label)}</title></circle>`;});
  s+=`<text class="lbl" x="${f1(m.l+iw/2)}" y="${H-6}" text-anchor="middle">${o.xlabel}</text>`;
  return s+'</svg>';
}
function quadrant(X){
  const r=X.rows.filter(x=>x.hours>0||x.approved>0),mh=median(r.map(x=>x.hours)),mp=median(r.map(x=>x.pct*100));
  const q=x=>{const hi=x.hours>mh,ok=x.pct*100>mp||(x.pct===1);return hi&&ok?'Constante y con logro':!hi&&ok?'Eficiente':hi&&!ok?'Necesita apoyo':'Por activar';};
  return{r,mh,mp,q};
}
function tabTiempo(T,X){
  const Q=quadrant(X),groups={};Q.r.forEach(x=>{(groups[Q.q(x)]=groups[Q.q(x)]||[]).push(x);});
  const effs=Q.r.filter(x=>x.eff!=null).map(x=>x.eff);
  T.innerHTML=`<section class="panel"><div class="sec-head"><h2>Tiempo de práctica vs. temas aprobados</h2><p>Cada punto es un estudiante (pasa el cursor para ver su nombre). Las líneas punteadas son las medianas del grupo: ${fmt(Q.mh,1)} h y ${fmt(Q.mp,0)} % de temas aprobados.</p></div>
   <div class="readouts">${kpi('Eficiencia mediana',effs.length?fmt(median(effs),2):'—','temas aprobados por hora de práctica',true)}${kpi('Necesitan apoyo',(groups['Necesita apoyo']||[]).length,'mucho tiempo, poco logro')}${kpi('Eficientes',(groups['Eficiente']||[]).length,'poco tiempo, buen logro')}${kpi('Por activar',(groups['Por activar']||[]).length,'poco tiempo, poco logro')}</div>
   <div class="chart-wrap" id="sc-ch"></div>
   <p class="note">Cómo leerlo: arriba a la derecha practican mucho y aprueban. Abajo a la derecha practican mucho pero no aprueban: suelen necesitar una explicación distinta. Abajo a la izquierda casi no practican.</p></section>
   <div class="dash-grid">${['Necesita apoyo','Por activar','Eficiente','Constante y con logro'].map(g=>`<section class="panel"><div class="sec-head"><h2>${g}</h2><p>${(groups[g]||[]).length} estudiantes</p></div><ul class="plain">${(groups[g]||[]).sort((a,b)=>b.hours-a.hours).map(x=>`<li><button type="button" class="linkish" data-st="${x.id}">${esc(x.nombre)}</button> <span class="note">${fmt(x.hours,1)} h · ${x.approved} temas · ${x.eff==null?'—':fmt(x.eff,2)+' temas/h'}</span></li>`).join('')||'<li class="note">Nadie en este grupo.</li>'}</ul></section>`).join('')}</div>`;
  const xmax=Math.max(1,...Q.r.map(x=>x.hours))*1.08;
  $('#sc-ch').innerHTML=Q.r.length?scatter({W:cw($('#sc-ch')),xmax,ymax:100,vx:Q.mh,hy:Q.mp,xlabel:'Horas de práctica activa (período)',label:'Tiempo vs logro',pts:Q.r.map(x=>({x:x.hours,y:x.pct*100,label:`${x.nombre}: ${fmt(x.hours,1)} h, ${x.approved} temas`,cls:Q.q(x)==='Necesita apoyo'?'warn':''}))}):'<p class="note">Aún no hay actividad en el período.</p>';
  T.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{D.student=b.dataset.st;D.tab='estudiante';renderDash();});
}
function stuckList(X){const out=[];X.rows.forEach(x=>{const b=bestMap(x.att),c=countMap(x.att);Object.keys(c).forEach(k=>{if(c[k]>=3&&(b[k]??0)<APROB){const [sid,tid]=k.split('/'),t=CIMA.topic(sid,tid);if(t)out.push({x,t,s:CIMA.subject(sid),n:c[k],best:b[k]});}});});return out.sort((a,b)=>b.n-a.n);}
function tabAlertas(T,X){
  const inact=X.rows.filter(x=>!x.last||Date.now()-x.last>7*864e5).sort((a,b)=>(a.last||0)-(b.last||0)),stuck=stuckList(X),Q=quadrant(X),help=Q.r.filter(x=>Q.q(x)==='Necesita apoyo');
  const li=(x,txt)=>`<li><button type="button" class="linkish" data-st="${x.id}">${esc(x.nombre)}</button> <span class="note">${esc(x.paralelo)} · ${txt}</span></li>`;
  T.innerHTML=`<div class="dash-grid"><section class="panel"><div class="sec-head"><h2>Sin actividad hace 7 días o más</h2><p>${inact.length} estudiantes</p></div><ul class="plain">${inact.map(x=>li(x,x.last?`último ingreso ${new Date(x.last).toLocaleDateString('es-EC')}`:'nunca ha practicado')).join('')||'<li class="note">Todos han practicado en la última semana.</li>'}</ul></section>
   <section class="panel"><div class="sec-head"><h2>Atascados en un tema</h2><p>3 o más intentos sin llegar a ${APROB}</p></div><ul class="plain">${stuck.map(z=>li(z.x,`${esc(z.s.nombre.split(' ')[0])} ${esc(z.t.n)} ${esc(z.t.short)}: ${z.n} intentos, mejor ${fmt(z.best,1)}`)).join('')||'<li class="note">Nadie está atascado.</li>'}</ul></section>
   <section class="panel"><div class="sec-head"><h2>Mucho tiempo, poco logro</h2><p>Por encima de la mediana de horas y por debajo de la de temas aprobados</p></div><ul class="plain">${help.map(x=>li(x,`${fmt(x.hours,1)} h · ${x.approved} temas`)).join('')||'<li class="note">Nadie en este grupo.</li>'}</ul></section></div>`;
  T.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{D.student=b.dataset.st;D.tab='estudiante';renderDash();});
}
function tabPreguntas(T,X){
  const agg={};X.att.forEach(a=>{(a.details||[]).forEach(d=>{const k=`${a.subject_id}/${a.topic_id}/${d.i}`;const g=agg[k]=agg[k]||{sid:a.subject_id,tid:a.topic_id,i:d.i,n:0,f:0,q:''};g.n++;if(!d.ok)g.f++;if(!g.q||Math.random()<0.2)g.q=d.q;});});
  const list=Object.values(agg).filter(g=>g.n>=5&&CIMA.topic(g.sid,g.tid)).map(g=>({...g,rate:g.f/g.n})).sort((a,b)=>b.rate-a.rate).slice(0,20);
  T.innerHTML=`<section class="panel"><div class="sec-head"><h2>Preguntas que más se fallan</h2><p>Por posición de pregunta dentro de cada tema (los datos cambian en cada intento, pero el tipo de pregunta es el mismo). Solo preguntas con 5 o más respuestas en el período.</p></div>
   ${list.length?`<div class="table-wrap"><table class="tbl qtab"><thead><tr><th>Tema</th><th>Pregunta</th><th>Ejemplo</th><th>Respuestas</th><th>% de error</th></tr></thead><tbody>${list.map(g=>{const t=CIMA.topic(g.sid,g.tid);return`<tr><td>${esc(CIMA.subject(g.sid).nombre.split(' ')[0])} ${esc(t.n)} ${esc(t.short)}</td><td>${g.i+1}</td><td class="qex">${esc(g.q)}</td><td>${g.n}</td><td class="${g.rate>=0.5?'bad':''}"><span class="mini-bar"><span style="width:${Math.round(g.rate*100)}%"></span></span> ${fmt(g.rate*100,0)} %</td></tr>`;}).join('')}</tbody></table></div><p class="note">Una tasa de error alta en la misma pregunta de un tema suele indicar un concepto para reforzar en clase.</p>`:'<p class="note">Aún no hay suficientes respuestas en el período.</p>'}</section>`;
}
function csv(rows){const q=v=>{v=v==null?'':String(v);return/[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};return'﻿'+rows.map(r=>r.map(q).join(';')).join('\r\n');}
function download(name,text){const b=new Blob([text],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}
function tabExportar(T,X){
  const stamp=new Date().toLocaleDateString('en-CA');
  T.innerHTML=`<section class="panel"><div class="sec-head"><h2>Exportar a Excel</h2><p>Archivos CSV (separados por punto y coma) que se abren directamente en Excel en español. Respetan los filtros de arriba.</p></div>
   <div class="btn-row"><button type="button" class="btn" data-x="rank">Ranking y avance por estudiante</button><button type="button" class="btn btn-ghost" data-x="att">Todas las pruebas</button><button type="button" class="btn btn-ghost" data-x="ses">Ingresos y tiempo</button><button type="button" class="btn btn-ghost" data-x="topics">Nota por tema (formato libreta)</button></div></section>
   ${DEMO?`<section class="panel"><div class="sec-head"><h2>Datos de ejemplo (solo modo demostración)</h2><p>Crea 24 estudiantes ficticios con actividad para ver cómo se ve el dashboard. Se marcan con “(ejemplo)”.</p></div><div class="btn-row"><button type="button" class="btn" id="demo-seed">Generar datos de ejemplo</button><button type="button" class="btn btn-ghost" id="demo-clear">Borrar datos de ejemplo</button></div></section>`:''}`;
  const name=id=>{const s=CIMA.subject(id);return s?s.nombre:id;},topicName=(sid,tid)=>{const t=CIMA.topic(sid,tid);return t?`${t.n} ${t.short}`:tid;};
  const pmap=Object.fromEntries(D.raw.profiles.map(p=>[p.id,p]));
  T.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{const k=b.dataset.x;
    if(k==='rank')download(`cima-ranking-${stamp}.csv`,csv([['Estudiante','Correo','Paralelo','Ingresos','Horas activas','Pruebas','Temas aprobados','Total temas','% avance','Nota media','Racha actual','Mejor racha','XP','Nivel','Certificados','Último ingreso'],...X.rows.map(x=>[x.nombre,x.email,x.paralelo,x.visits,fmt(x.hours,2),x.tests,x.approved,X.universe.length,fmt(x.pct*100,1),x.avgBest==null?'':fmt(x.avgBest,2),x.streak,x.streakBest,x.xp,levelOf(x.xp).lv.n,x.certs,x.last?new Date(x.last).toLocaleString('es-EC'):''])]));
    if(k==='att')download(`cima-pruebas-${stamp}.csv`,csv([['Fecha','Estudiante','Paralelo','Materia','Tema','Nota','Correctas','Preguntas','Duración (s)'],...X.att.map(a=>[new Date(a.created_at).toLocaleString('es-EC'),pmap[a.user_id]?.nombre,pmap[a.user_id]?.paralelo,name(a.subject_id),topicName(a.subject_id,a.topic_id),fmt(+a.score,1),a.correct,a.total,a.duration_s])]));
    if(k==='ses')download(`cima-ingresos-${stamp}.csv`,csv([['Inicio','Estudiante','Paralelo','Materia','Minutos activos','Visita'],...X.ses.map(s=>[new Date(s.started_at).toLocaleString('es-EC'),pmap[s.user_id]?.nombre,pmap[s.user_id]?.paralelo,s.subject_id?name(s.subject_id):'Portal',fmt((s.active_seconds||0)/60,1),s.visit_id])]));
    if(k==='topics'){const ts=X.universe.map(u=>u.split('/'));download(`cima-notas-por-tema-${stamp}.csv`,csv([['Estudiante','Paralelo',...ts.map(([s,t])=>topicName(s,t)),'Promedio'],...X.rows.map(x=>{const b=bestMap(x.att),v=ts.map(([s,t])=>b[s+'/'+t]);const got=v.filter(z=>z!=null);return[x.nombre,x.paralelo,...v.map(z=>z==null?'':fmt(z,1)),got.length?fmt(v.reduce((a,z)=>a+(z||0),0)/v.length,2):''];})]));}
  });
  if(DEMO){$('#demo-seed').onclick=async()=>{await API.seedDemo();viewReload();};$('#demo-clear').onclick=async()=>{await API.clearDemo();viewReload();};}
}
async function viewReload(){const [profiles,sessions,attempts,certificates]=await Promise.all(['profiles','sessions','attempts','certificates'].map(t=>API.all(t)));D.raw={profiles,sessions,attempts,certificates};D.tab='resumen';renderDash();}
