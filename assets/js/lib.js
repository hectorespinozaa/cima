"use strict";
/* CIMA · utilidades compartidas (números, notación, gráficos) */
/* ================= Utilidades ================= */
const $=(s,r=document)=>r.querySelector(s);
const el=html=>{const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild;};
const rnd=(a,b)=>a+Math.random()*(b-a);
const rint=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
const rnz=(a,b)=>{let v=0;while(v===0)v=rint(a,b);return v;};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const round=(x,d=0)=>{const f=10**d;return Math.round((x+Number.EPSILON*Math.sign(x))*f)/f;};
const fmt=(x,d=2)=>(x===0&&(x=0),Number.isFinite(x))?x.toLocaleString('es-EC',{minimumFractionDigits:d,maximumFractionDigits:d}).replace('-','−'):'—';
const nf=(x,d=3)=>(x===0&&(x=0),Number.isFinite(x))?x.toLocaleString('es-EC',{maximumFractionDigits:d}).replace('-','−'):'—';
const fmtTick=v=>nf(round(v,6),3);
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const sum=a=>a.reduce((s,x)=>s+x,0);
const mean=a=>sum(a)/a.length;
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;}
const reduceMotion=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const cw=node=>{const w=Math.floor(node.getBoundingClientRect().width);return w>0?clamp(w,280,860):640;};
function parseNum(s){
  s=String(s).trim().replace(/\s/g,'').replace(/−/g,'-');
  const fr=/^([-+]?[\d.,]+)\/([-+]?[\d.,]+)$/.exec(s);
  if(fr){const a=parseNum(fr[1]),b=parseNum(fr[2]);return b?a/b:NaN;}
  let pct=false;if(s.endsWith('%')){pct=true;s=s.slice(0,-1);}
  if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'');
  s=s.replace(',','.');
  if(s===''||!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s))return NaN;
  const v=Number(s);return pct?v/100:v;
}
function uniqOpts(correct,ds){const seen=new Set([correct]),o=[correct];ds.forEach(d=>{if(!seen.has(d)&&o.length<4){seen.add(d);o.push(d);}});return o;}
/* Notación */
const FR=(a,b)=>`<span class="fr"><span>${a}</span><span>${b}</span></span>`;
const RAD=(x,n)=>`<span class="rad">${n&&n!==2?`<sup>${n}</sup>`:''}√<span>${x}</span></span>`;
const sg=v=>v<0?'−'+Math.abs(v):String(v);              // número con signo tipográfico
const ps=v=>v<0?'('+sg(v)+')':String(v);                 // entre paréntesis si es negativo
function fracStr(n,d){if(d<0){n=-n;d=-d;}const g=gcd(n,d)||1;n/=g;d/=g;return d===1?sg(n):(n<0?'−':'')+FR(Math.abs(n),d);}
/* Polinomio: terms = [[coef, exp], ...] */
function poly(terms,v='x'){
  let s='';const t=terms.filter(t=>t[0]!==0);
  t.forEach(([c,e],i)=>{const neg=c<0,a=Math.abs(c);const sign=i===0?(neg?'−':''):(neg?' − ':' + ');
    const coef=(a===1&&e!==0)?'':nf(a,3);const vv=e===0?'':e===1?v:`${v}<sup>${e}</sup>`;s+=sign+coef+vv;});
  return s||'0';
}
const lin=(m,p,v='x')=>`(${poly([[m,1],[p,0]],v)})`;

function niceTicks(a,b,n){
  const span=b-a;if(!(span>0))return[a];
  const s0=span/Math.max(1,n),mag=10**Math.floor(Math.log10(s0)),e=s0/mag;
  const step=(e>=7.5?10:e>=3.5?5:e>=1.5?2:1)*mag,out=[];
  for(let v=Math.ceil(a/step-1e-9)*step;v<=b+1e-9;v+=step)out.push(round(v,10));
  return out;
}

/* Gráfico de datos (eje x, y ≥ ymin) */
function chart(o){
  const W=o.W,H=o.H||Math.round(clamp(W*0.46,210,300));
  const m={l:o.ml??54,r:o.mr??18,t:o.mt??26,b:o.xlabel?50:30};
  const iw=W-m.l-m.r,ih=H-m.t-m.b,ymin=o.ymin||0;
  const X=x=>m.l+(x-o.xmin)/(o.xmax-o.xmin)*iw,Y=y=>m.t+ih-((y-ymin)/(o.ymax-ymin))*ih,f1=v=>v.toFixed(1);
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="chart" role="img" aria-label="${o.label||'Gráfico'}">`;
  for(const v of o.yticks||niceTicks(ymin,o.ymax,o.ny||4)){const y=f1(Y(v));s+=`<line class="grid" x1="${m.l}" x2="${W-m.r}" y1="${y}" y2="${y}"/><text x="${m.l-8}" y="${(+y+4).toFixed(1)}" text-anchor="end">${(o.yfmt||fmtTick)(v)}</text>`;}
  for(const a of o.areas||[]){if(a.pts.length<2)continue;const p=a.pts;s+=`<path class="area ${a.cls||''}" d="M${f1(X(p[0][0]))} ${f1(Y(ymin))}${p.map(q=>`L${f1(X(q[0]))} ${f1(Y(clamp(q[1],ymin,o.ymax)))}`).join('')}L${f1(X(p[p.length-1][0]))} ${f1(Y(ymin))}Z"/>`;}
  {const g=o.gap??1;for(const b of o.bars||[]){const x0=X(b.x0)+g,x1=X(b.x1)-g,y=Y(clamp(b.y,ymin,o.ymax));s+=`<rect class="bar ${b.cls||''}" x="${f1(x0)}" y="${f1(y)}" width="${f1(Math.max(.6,x1-x0))}" height="${f1(Math.max(0,Y(ymin)-y))}">${b.title?`<title>${b.title}</title>`:''}</rect>`;}}
  for(const v of o.vlines||[]){if(v.x<o.xmin||v.x>o.xmax)continue;const x=X(v.x);s+=`<line class="vl ${v.cls||''}" x1="${f1(x)}" x2="${f1(x)}" y1="${m.t}" y2="${f1(Y(ymin))}"/>`;if(v.label){const an=x>W-70?'end':x<m.l+50?'start':'middle';s+=`<text class="lbl" x="${f1(x)}" y="${m.t-9}" text-anchor="${an}">${v.label}</text>`;}}
  for(const c of o.curves||[]){if(!c.pts.length)continue;s+=`<path class="curve ${c.cls||''}" d="${c.pts.map((p,i)=>(i?'L':'M')+f1(X(p[0]))+' '+f1(Y(clamp(p[1],ymin,o.ymax)))).join('')}"/>`;}
  for(const h of o.hlines||[]){const y=f1(Y(h.y));s+=`<line class="vl ${h.cls||''}" x1="${m.l}" x2="${W-m.r}" y1="${y}" y2="${y}"/>${h.label?`<text class="lbl ${h.cls||''}" x="${W-m.r}" y="${(+y-7).toFixed(1)}" text-anchor="end">${h.label}</text>`:''}`;}
  for(const p of o.points||[]){s+=`<circle class="pt ${p.cls||''}" cx="${f1(X(p.x))}" cy="${f1(Y(p.y))}" r="6"/>`;if(p.label){const an=X(p.x)>W-120?'end':'start';s+=`<text class="lbl" x="${f1(X(p.x)+(an==='end'?-10:10))}" y="${f1(Y(p.y)-10)}" text-anchor="${an}">${p.label}</text>`;}}
  s+=`<line class="axis" x1="${m.l}" x2="${W-m.r}" y1="${f1(Y(ymin))}" y2="${f1(Y(ymin))}"/>`;
  for(const v of o.xticks||niceTicks(o.xmin,o.xmax,Math.max(3,Math.floor(iw/85)))){if(v<o.xmin-1e-9||v>o.xmax+1e-9)continue;s+=`<text x="${f1(X(v))}" y="${f1(Y(ymin)+18)}" text-anchor="middle">${(o.xfmt||fmtTick)(v)}</text>`;}
  if(o.xlabel)s+=`<text class="lbl" x="${f1(m.l+iw/2)}" y="${H-8}" text-anchor="middle">${o.xlabel}</text>`;
  return s+'</svg>';
}

/* Plano cartesiano */
let CLIPN=0;
function plane(o){
  const W=o.W,H=o.H||Math.round(clamp(W*0.64,250,460));
  const m={l:36,r:14,t:14,b:28},iw=W-m.l-m.r,ih=H-m.t-m.b;
  const X=x=>m.l+(x-o.xmin)/(o.xmax-o.xmin)*iw,Y=y=>m.t+ih-(y-o.ymin)/(o.ymax-o.ymin)*ih,f1=v=>v.toFixed(1);
  const id='cp'+(++CLIPN);
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="chart plane" role="img" aria-label="${o.label||'Plano cartesiano'}"><defs><clipPath id="${id}"><rect x="${m.l}" y="${m.t}" width="${iw}" height="${ih}"/></clipPath></defs>`;
  const xt=o.xticks||niceTicks(o.xmin,o.xmax,Math.max(4,Math.floor(iw/52))),yt=o.yticks||niceTicks(o.ymin,o.ymax,Math.max(4,Math.floor(ih/42)));
  xt.forEach(v=>{s+=`<line class="grid" x1="${f1(X(v))}" x2="${f1(X(v))}" y1="${m.t}" y2="${m.t+ih}"/><text x="${f1(X(v))}" y="${H-8}" text-anchor="middle">${fmtTick(v)}</text>`;});
  yt.forEach(v=>{s+=`<line class="grid" x1="${m.l}" x2="${m.l+iw}" y1="${f1(Y(v))}" y2="${f1(Y(v))}"/><text x="${m.l-7}" y="${f1(Y(v)+4)}" text-anchor="end">${fmtTick(v)}</text>`;});
  if(o.ymin<=0&&o.ymax>=0)s+=`<line class="axis" x1="${m.l}" x2="${m.l+iw}" y1="${f1(Y(0))}" y2="${f1(Y(0))}"/>`;
  if(o.xmin<=0&&o.xmax>=0)s+=`<line class="axis" x1="${f1(X(0))}" x2="${f1(X(0))}" y1="${m.t}" y2="${m.t+ih}"/>`;
  s+=`<g clip-path="url(#${id})">`;
  for(const p of o.polys||[]){if(p.pts.length<3)continue;s+=`<path class="area ${p.cls||''}" d="${p.pts.map((q,i)=>(i?'L':'M')+f1(X(q[0]))+' '+f1(Y(q[1]))).join('')}Z"/>`;}
  for(const sgm of o.xsegs||[]){const a=Math.max(sgm.a,o.xmin),b=Math.min(sgm.b,o.xmax);if(b>a)s+=`<line class="seg-hl" x1="${f1(X(a))}" x2="${f1(X(b))}" y1="${f1(Y(0))}" y2="${f1(Y(0))}"/>`;}
  for(const v of o.vlines||[])s+=`<line class="vl ${v.cls||''}" x1="${f1(X(v.x))}" x2="${f1(X(v.x))}" y1="${m.t}" y2="${m.t+ih}"/>`;
  for(const c of o.curves||[]){
    const [a,b]=c.domain||[o.xmin,o.xmax],N=c.n||500,yr=o.ymax-o.ymin;let d='',pen=false,prev=null;
    for(let i=0;i<=N;i++){const x=a+(b-a)*i/N,y=c.f(x);
      if(!Number.isFinite(y)||y>o.ymax+4*yr||y<o.ymin-4*yr||(prev!==null&&Math.abs(y-prev)>yr*1.2)){pen=false;prev=Number.isFinite(y)?y:null;continue;}
      d+=(pen?'L':'M')+f1(X(x))+' '+f1(Y(y));pen=true;prev=y;}
    s+=`<path class="curve ${c.cls||''}" d="${d}"/>`;
  }
  for(const l of o.lines||[])s+=`<line class="curve ${l.cls||''}" x1="${f1(X(l.x1))}" y1="${f1(Y(l.y1))}" x2="${f1(X(l.x2))}" y2="${f1(Y(l.y2))}"/>`;
  s+='</g>';
  for(const p of o.points||[]){if(p.x<o.xmin||p.x>o.xmax||p.y<o.ymin||p.y>o.ymax)continue;
    s+=`<circle class="pt ${p.cls||''}${p.open?' open':''}" cx="${f1(X(p.x))}" cy="${f1(Y(p.y))}" r="${p.r||5.5}"/>`;
    if(p.label){const an=X(p.x)>W-110?'end':'start';s+=`<text class="lbl ${p.lcls||''}" x="${f1(X(p.x)+(an==='end'?-9:9))}" y="${f1(Y(p.y)-9)}" text-anchor="${an}">${p.label}</text>`;}}
  return s+'</svg>';
}
/* Recortar polígono por semiplano a·x + b·y ≤ c */
function clipHalf(poly,a,b,c){
  const out=[],inside=p=>a*p[0]+b*p[1]<=c+1e-9;
  for(let i=0;i<poly.length;i++){const P=poly[i],Q=poly[(i+1)%poly.length],pi=inside(P),qi=inside(Q);
    if(pi)out.push(P);
    if(pi!==qi){const fP=a*P[0]+b*P[1]-c,fQ=a*Q[0]+b*Q[1]-c,t=fP/(fP-fQ);out.push([P[0]+t*(Q[0]-P[0]),P[1]+t*(Q[1]-P[1])]);}}
  return out;
}
/* Recta numérica: sets = [{a,b,ac,bc}] (±Infinity permitido) */
function numberLine(o){
  const W=o.W,H=78,m={l:22,r:22},iw=W-m.l-m.r,y=34,X=x=>m.l+(x-o.lo)/(o.hi-o.lo)*iw,f1=v=>v.toFixed(1);
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="chart" role="img" aria-label="${o.label||'Recta numérica'}">`;
  s+=`<line class="axis" x1="${m.l-10}" x2="${W-m.r+10}" y1="${y}" y2="${y}"/><path d="M${W-m.r+12} ${y} l-8 -5 v10z" fill="var(--muted)"/><path d="M${m.l-12} ${y} l8 -5 v10z" fill="var(--muted)"/>`;
  const tk=o.ticks||niceTicks(o.lo,o.hi,Math.max(4,Math.floor(iw/62)));
  tk.forEach(v=>{s+=`<line class="axis" x1="${f1(X(v))}" x2="${f1(X(v))}" y1="${y-5}" y2="${y+5}"/><text x="${f1(X(v))}" y="${y+24}" text-anchor="middle">${fmtTick(v)}</text>`;});
  for(const st of o.sets||[]){
    const a=Number.isFinite(st.a)?X(st.a):m.l-10,b=Number.isFinite(st.b)?X(st.b):W-m.r+10;
    if(st.point){s+=`<circle class="pt" cx="${f1(a)}" cy="${y}" r="7"/>`;continue;}
    s+=`<line class="seg-hl" x1="${f1(a)}" x2="${f1(b)}" y1="${y}" y2="${y}"/>`;
    if(!Number.isFinite(st.a))s+=`<path d="M${f1(a-6)} ${y} l10 -7 v14z" fill="var(--accent)"/>`;
    if(!Number.isFinite(st.b))s+=`<path d="M${f1(b+6)} ${y} l-10 -7 v14z" fill="var(--accent)"/>`;
    if(Number.isFinite(st.a))s+=`<circle class="pt${st.ac?'':' open'}" cx="${f1(a)}" cy="${y}" r="7"/>`;
    if(Number.isFinite(st.b))s+=`<circle class="pt${st.bc?'':' open'}" cx="${f1(b)}" cy="${y}" r="7"/>`;
  }
  return s+'</svg>';
}
function intervalStr(sets){
  if(!sets.length)return'∅ (no hay solución)';
  return sets.map(st=>{if(st.point)return`{${nf(st.a,3)}}`;if(!Number.isFinite(st.a)&&!Number.isFinite(st.b))return'(−∞, ∞)';
    const L=Number.isFinite(st.a)?(st.ac?'[':'(')+nf(st.a,3):'(−∞',R=Number.isFinite(st.b)?nf(st.b,3)+(st.bc?']':')'):'∞)';return`${L}; ${R}`;}).join(' ∪ ');
}


/* ================= Registro de materias =================
   Cada archivo de /materias llama a CIMA.addUnit(materia, unidad).
   Para agregar una unidad o materia nueva basta con un archivo más. */
window.CIMA={subjects:[],
  addUnit(meta,unit){
    let s=this.subjects.find(x=>x.id===meta.id);
    if(!s){s=Object.assign({units:[]},meta);this.subjects.push(s);}
    unit.topics.forEach(t=>{t.short=t.short||t.title;t.subject=s.id;t.unit=unit.id;});
    s.units.push(unit);s.units.sort((a,b)=>(a.orden||0)-(b.orden||0));
  },
  topics(sid){const s=this.subjects.find(x=>x.id===sid);return s?s.units.flatMap(u=>u.topics):[];},
  subject(sid){return this.subjects.find(x=>x.id===sid);},
  topic(sid,tid){return this.topics(sid).find(t=>t.id===tid);}
};

/* =====================================================================
   Arrastrar y soltar accesible (también funciona tocando: elige ficha → toca caja)
   dnd(root,{items:[{id,label}],boxes:[{id,label,hint}],onChange})
   devuelve {get():{itemId:boxId|null}, mark(okMap), reset(), set(map)}
   ===================================================================== */
function dnd(root,o){
  const st={};o.items.forEach(i=>st[i.id]=null);let sel=null;
  root.innerHTML=`<div class="dnd"><div class="dnd-pool" data-box="" aria-label="Fichas por ubicar"></div>
    <div class="dnd-boxes${o.cls?' '+o.cls:''}">${o.boxes.map(b=>`<div class="dnd-box" data-box="${b.id}"><div class="dnd-h">${b.label}${b.hint?`<span>${b.hint}</span>`:''}</div><div class="dnd-z" data-box="${b.id}" tabindex="0" role="button" aria-label="Colocar en ${b.label.replace(/<[^>]+>/g,'')}"></div></div>`).join('')}</div></div>`;
  const zone=id=>id?root.querySelector(`.dnd-z[data-box="${id}"]`):root.querySelector('.dnd-pool');
  const chip=it=>{const c=document.createElement('button');c.type='button';c.className='chipd';c.draggable=true;c.dataset.id=it.id;c.innerHTML=it.label;
    c.addEventListener('click',e=>{e.stopPropagation();if(sel===it.id){sel=null;}else sel=it.id;paint();});
    c.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',it.id);sel=it.id;paint();});return c;};
  const chips={};o.items.forEach(it=>chips[it.id]=chip(it));
  function render(){root.querySelector('.dnd-pool').innerHTML='';root.querySelectorAll('.dnd-z').forEach(z=>z.innerHTML='');
    shuffleOnce.forEach(id=>{zone(st[id]).appendChild(chips[id]);});paint();
    root.querySelector('.dnd-pool').classList.toggle('empty',Object.values(st).every(v=>v!==null));}
  const shuffleOnce=shuffle(o.items.map(i=>i.id));
  function paint(){Object.entries(chips).forEach(([id,c])=>c.classList.toggle('sel',sel===id));root.classList.toggle('picking',!!sel);}
  function place(id,box){st[id]=box||null;sel=null;Object.values(chips).forEach(c=>c.classList.remove('ok','bad'));render();o.onChange&&o.onChange(api.get());}
  root.querySelectorAll('[data-box]').forEach(z=>{
    z.addEventListener('click',()=>{if(sel)place(sel,z.dataset.box);});
    z.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&sel){e.preventDefault();place(sel,z.dataset.box);}});
    z.addEventListener('dragover',e=>{e.preventDefault();z.classList.add('over');});
    z.addEventListener('dragleave',()=>z.classList.remove('over'));
    z.addEventListener('drop',e=>{e.preventDefault();z.classList.remove('over');const id=e.dataTransfer.getData('text/plain');if(id in st)place(id,z.dataset.box);});});
  const api={get:()=>({...st}),mark(ok){Object.entries(ok).forEach(([id,v])=>{chips[id].classList.toggle('ok',v===true);chips[id].classList.toggle('bad',v===false);});},
    reset(){Object.keys(st).forEach(k=>st[k]=null);sel=null;render();},set(m){Object.assign(st,m);render();}};
  render();return api;
}
/* Descarga de texto (CSV) */
function downloadText(name,text,mime='text/csv;charset=utf-8'){try{const b=new Blob(['﻿'+text],{type:mime}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);return true;}catch(e){return false;}}
/* Copiar al portapapeles */
async function copyText(t){try{await navigator.clipboard.writeText(t);return true;}catch(e){return false;}}
/* Pestañas simples dentro de un simulador */
function tabsUI(root,tabs,onShow){
  root.innerHTML=`<div class="ltabs" role="tablist">${tabs.map((t,i)=>`<button type="button" role="tab" data-i="${i}" aria-selected="${i===0}"><span class="ln">${i+1}</span>${t.label}</button>`).join('')}</div>${tabs.map((t,i)=>`<div class="lpane" role="tabpanel" data-i="${i}"${i?' hidden':''}></div>`).join('')}`;
  const panes=[...root.querySelectorAll('.lpane')],btns=[...root.querySelectorAll('.ltabs button')],done=new Set();
  function show(i){btns.forEach((b,j)=>b.setAttribute('aria-selected',i===j));panes.forEach((p,j)=>p.hidden=i!==j);if(!done.has(i)){done.add(i);tabs[i].render(panes[i]);}onShow&&onShow(i);}
  btns.forEach(b=>b.addEventListener('click',()=>show(+b.dataset.i)));show(0);
  return{show,pane:i=>panes[i],rerender(){done.clear();const cur=btns.findIndex(b=>b.getAttribute('aria-selected')==='true');panes.forEach(p=>p.innerHTML='');show(cur<0?0:cur);}};
}
