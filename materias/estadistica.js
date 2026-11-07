/* =====================================================================
   CIMA · Materia: ESTADÍSTICA
   Unidad 1: Estadística descriptiva · Unidad 2: Probabilidad y distribuciones
   Código aislado en su propio bloque para no chocar con otras materias.
   ===================================================================== */
(function(){
"use strict";


/* ================= Utilidades ================= */
const $=(s,r=document)=>r.querySelector(s);
const el=html=>{const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild;};
const rnd=(a,b)=>a+Math.random()*(b-a);
const rint=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function randn(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
const round=(x,d=0)=>{const f=10**d;return Math.round((x+Number.EPSILON*Math.sign(x))*f)/f;};
const fmt=(x,d=2)=>Number.isFinite(x)?x.toLocaleString('es-EC',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
const nf=(x,d=3)=>Number.isFinite(x)?x.toLocaleString('es-EC',{maximumFractionDigits:d}):'—';
const fmtTick=v=>nf(round(v,6),3);
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
function parseNum(s){
  s=String(s).trim().replace(/\s/g,'');
  let pct=false; if(s.endsWith('%')){pct=true;s=s.slice(0,-1);}
  if(s.includes(',')&&s.includes('.')) s=s.replace(/\./g,'');
  s=s.replace(',','.');
  if(s===''||!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  const v=Number(s); return pct?v/100:v;
}
const sum=a=>a.reduce((s,x)=>s+x,0);
const mean=a=>sum(a)/a.length;
const svar=a=>{const m=mean(a);return a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1);};
const sdev=a=>Math.sqrt(svar(a));
function median(a){const b=[...a].sort((x,y)=>x-y),n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2;}
function quantile(a,q){const b=[...a].sort((x,y)=>x-y);const pos=(b.length-1)*q;const lo=Math.floor(pos),hi=Math.ceil(pos);return b[lo]+(b[hi]-b[lo])*(pos-lo);}
function modes(a){const c=new Map();a.forEach(x=>{const k=round(x,4);c.set(k,(c.get(k)||0)+1);});const mx=Math.max(...c.values());if(mx<2)return[];return[...c.entries()].filter(e=>e[1]===mx).map(e=>e[0]).sort((x,y)=>x-y);}
function erf(x){const s=Math.sign(x);x=Math.abs(x);const t=1/(1+0.3275911*x);const y=1-((((1.061405429*t-1.453152027)*t+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return s*y;}
const Phi=z=>0.5*(1+erf(z/Math.SQRT2));
const npdf=(x,m,s)=>Math.exp(-0.5*((x-m)/s)**2)/(s*Math.sqrt(2*Math.PI));
function comb(n,k){if(k<0||k>n)return 0;k=Math.min(k,n-k);let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return r;}
const binom=(k,n,p)=>comb(n,k)*p**k*(1-p)**(n-k);
function pois(k,l){let r=Math.exp(-l);for(let i=1;i<=k;i++)r*=l/i;return r;}
function fact(k){let r=1;for(let i=2;i<=k;i++)r*=i;return r;}
const reduceMotion=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const cw=node=>{const w=Math.floor(node.getBoundingClientRect().width);return w>0?clamp(w,280,860):640;};

function niceTicks(a,b,n){
  const span=b-a; if(!(span>0)) return [a];
  const s0=span/Math.max(1,n), mag=10**Math.floor(Math.log10(s0)), e=s0/mag;
  const step=(e>=7.5?10:e>=3.5?5:e>=1.5?2:1)*mag, out=[];
  for(let v=Math.ceil(a/step-1e-9)*step; v<=b+1e-9; v+=step) out.push(round(v,10));
  return out;
}

/* Gráfico SVG genérico (escala 1:1 con el ancho del contenedor) */
function chart(o){
  const W=o.W, H=o.H||Math.round(clamp(W*0.46,210,300));
  const m={l:o.ml??50,r:o.mr??18,t:o.mt??26,b:o.xlabel?50:30};
  const iw=W-m.l-m.r, ih=H-m.t-m.b, ymin=o.ymin||0;
  const X=x=>m.l+(x-o.xmin)/(o.xmax-o.xmin)*iw;
  const Y=y=>m.t+ih-((y-ymin)/(o.ymax-ymin))*ih;
  const f1=v=>v.toFixed(1);
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="chart" role="img" aria-label="${o.label||'Gráfico'}">`;
  const yt=o.yticks||niceTicks(ymin,o.ymax,o.ny||4);
  for(const v of yt){const y=f1(Y(v));s+=`<line class="grid" x1="${m.l}" x2="${W-m.r}" y1="${y}" y2="${y}"/><text x="${m.l-8}" y="${(+y+4).toFixed(1)}" text-anchor="end">${(o.yfmt||fmtTick)(v)}</text>`;}
  for(const a of o.areas||[]){if(a.pts.length<2)continue;const p=a.pts;
    s+=`<path class="area ${a.cls||''}" d="M${f1(X(p[0][0]))} ${f1(Y(ymin))}${p.map(q=>`L${f1(X(q[0]))} ${f1(Y(Math.min(q[1],o.ymax)))}`).join('')}L${f1(X(p[p.length-1][0]))} ${f1(Y(ymin))}Z"/>`;}
  const g=o.gap??1;
  for(const b of o.bars||[]){const x0=X(b.x0)+g,x1=X(b.x1)-g,y=Y(clamp(b.y,ymin,o.ymax));
    s+=`<rect class="bar ${b.cls||''}" x="${f1(x0)}" y="${f1(y)}" width="${f1(Math.max(.6,x1-x0))}" height="${f1(Math.max(0,Y(ymin)-y))}">${b.title?`<title>${b.title}</title>`:''}</rect>`;}
  for(const c of o.curves||[]){if(!c.pts.length)continue;
    s+=`<path class="curve ${c.cls||''}" d="${c.pts.map((p,i)=>(i?'L':'M')+f1(X(p[0]))+' '+f1(Y(Math.min(p[1],o.ymax)))).join('')}"/>`;
    if(c.dots) c.pts.forEach(p=>{s+=`<circle class="cdot" cx="${f1(X(p[0]))}" cy="${f1(Y(p[1]))}" r="3.5"/>`;});}
  for(const h of o.hlines||[]){const y=f1(Y(h.y));s+=`<line class="vl ${h.cls||''}" x1="${m.l}" x2="${W-m.r}" y1="${y}" y2="${y}"/>${h.label?`<text class="lbl" x="${W-m.r}" y="${(+y-7).toFixed(1)}" text-anchor="end">${h.label}</text>`:''}`;}
  for(const v of o.vlines||[]){if(v.x<o.xmin||v.x>o.xmax)continue;const x=X(v.x);
    s+=`<line class="vl ${v.cls||''}" x1="${f1(x)}" x2="${f1(x)}" y1="${m.t}" y2="${f1(Y(ymin))}"/>`;
    if(v.label){const an=x>W-70?'end':x<m.l+50?'start':'middle';s+=`<text class="lbl" x="${f1(x)}" y="${m.t-9}" text-anchor="${an}">${v.label}</text>`;}}
  s+=`<line class="axis" x1="${m.l}" x2="${W-m.r}" y1="${f1(Y(ymin))}" y2="${f1(Y(ymin))}"/>`;
  const xt=o.xticks||niceTicks(o.xmin,o.xmax,Math.max(3,Math.floor(iw/85)));
  for(const v of xt){if(v<o.xmin-1e-9||v>o.xmax+1e-9)continue;s+=`<text x="${f1(X(v))}" y="${f1(Y(ymin)+18)}" text-anchor="middle">${(o.xfmt||fmtTick)(v)}</text>`;}
  if(o.xlabel) s+=`<text class="lbl" x="${f1(m.l+iw/2)}" y="${H-8}" text-anchor="middle">${o.xlabel}</text>`;
  return s+'</svg>';
}
const intTicks=(lo,hi,w)=>{const span=hi-lo;const maxT=Math.max(4,Math.floor(w/42));const step=[1,2,5,10,20].find(s=>span/s<=maxT)||50;const t=[];for(let k=Math.ceil(lo/step)*step;k<=hi;k+=step)t.push(k);return t;};


/* ================= Módulo 1: Variables ================= */
const TYPES={nom:'Cualitativa nominal',ord:'Cualitativa ordinal',disc:'Cuantitativa discreta',cont:'Cuantitativa continua'};
const TKEYS=Object.keys(TYPES);
const VARS=[
 {name:'pH del jugo de maracuyá',ej:'3,2 · 3,4 · 3,1',t:'cont',why:'se mide con un pHmetro y puede tomar cualquier valor dentro de un intervalo.'},
 {name:'Número de colonias de mohos en una placa',ej:'0 · 3 · 12',t:'disc',why:'se cuenta; solo toma valores enteros.'},
 {name:'Marca de atún en conserva',ej:'marca A · marca B · marca C',t:'nom',why:'son categorías sin ningún orden natural.'},
 {name:'Grado de madurez del banano',ej:'verde · pintón · maduro',t:'ord',why:'son categorías que sí tienen un orden.'},
 {name:'Temperatura de pasteurización',ej:'72,1 °C · 71,8 °C',t:'cont',why:'se mide con un termómetro y admite decimales.'},
 {name:'Latas mal selladas por lote',ej:'0 · 1 · 4',t:'disc',why:'se cuenta el número de latas; no existe “1,5 latas”.'},
 {name:'Tipo de envase',ej:'vidrio · PET · Tetra Pak',t:'nom',why:'son categorías sin orden.'},
 {name:'Calificación en escala hedónica',ej:'me disgusta · indiferente · me gusta',t:'ord',why:'las categorías van de menor a mayor agrado.'},
 {name:'Peso neto de una lata de sardinas',ej:'155,2 g · 156,0 g',t:'cont',why:'se mide con una balanza y admite cualquier valor en un intervalo.'},
 {name:'Sólidos solubles del jugo',ej:'11,5 °Brix · 12,3 °Brix',t:'cont',why:'se mide con un refractómetro y admite decimales.'},
 {name:'Quejas de clientes por mes',ej:'2 · 0 · 7',t:'disc',why:'se cuenta; solo toma valores enteros.'},
 {name:'Proveedor de la leche cruda',ej:'hacienda 1 · hacienda 2',t:'nom',why:'el número solo identifica al proveedor; no hay orden.'},
 {name:'Talla del huevo',ej:'pequeño · mediano · grande · extra grande',t:'ord',why:'las tallas tienen un orden de menor a mayor.'},
 {name:'Huevos rotos por cubeta',ej:'0 · 1 · 2',t:'disc',why:'se cuenta; solo toma valores enteros.'},
 {name:'Humedad del cacao seco',ej:'6,8 % · 7,2 %',t:'cont',why:'es una medición en porcentaje que admite decimales.'},
 {name:'Nivel de satisfacción del cliente',ej:'bajo · medio · alto',t:'ord',why:'las categorías tienen un orden.'},
 {name:'Color de la cáscara del huevo',ej:'blanco · marrón',t:'nom',why:'son categorías sin orden.'},
 {name:'Tiempo de horneado del pan',ej:'18,5 min · 20,0 min',t:'cont',why:'el tiempo se mide y puede tomar valores fraccionarios.'},
 {name:'Defectos visibles en una mazorca de cacao',ej:'0 · 2 · 5',t:'disc',why:'se cuenta; solo toma valores enteros.'},
 {name:'Línea de producción',ej:'línea A · línea B · línea C',t:'nom',why:'las letras solo identifican la línea; no hay orden.'},
];
function simVariables(box){
  let deck=shuffle(VARS),i=0,ok=0,tot=0;
  box.innerHTML=`<div class="sorter">
    <div class="var-card"><p class="var-label">Variable</p><p class="var-name txt"></p><p class="var-ej"></p></div>
    <div class="bins">${TKEYS.map(k=>`<button type="button" class="bin" data-k="${k}">${TYPES[k]}</button>`).join('')}</div>
    <p class="fb" aria-live="polite"></p>
    <div class="sorter-foot"><span class="note tally"></span><button type="button" class="btn next">Siguiente variable</button></div></div>`;
  const name=$('.var-name',box),ej=$('.var-ej',box),fb=$('.fb',box),tally=$('.tally',box),bins=[...box.querySelectorAll('.bin')],next=$('.next',box);
  function show(){const v=deck[i%deck.length];name.textContent=v.name;ej.textContent='Ejemplos de datos: '+v.ej;fb.textContent='Elige el tipo de variable.';
    bins.forEach(b=>{b.disabled=false;b.classList.remove('is-ok','is-bad');});next.disabled=true;tally.textContent=`Aciertos: ${ok} de ${tot}`;}
  bins.forEach(b=>b.addEventListener('click',()=>{const v=deck[i%deck.length];const c=b.dataset.k===v.t;tot++;if(c)ok++;
    b.classList.add(c?'is-ok':'is-bad');if(!c)bins.find(x=>x.dataset.k===v.t).classList.add('is-ok');bins.forEach(x=>x.disabled=true);
    fb.innerHTML=`${c?'<strong>Bien.</strong>':'<strong>No exactamente.</strong>'} Es <b>${TYPES[v.t].toLowerCase()}</b>: ${v.why}`;
    tally.textContent=`Aciertos: ${ok} de ${tot}`;next.disabled=false;next.focus();}));
  next.addEventListener('click',()=>{i++;if(i%deck.length===0)deck=shuffle(VARS);show();});
  show();
}
const M1C=[
 ()=>({type:'mc',text:'Una planta envasa 12 000 latas de atún al día. El analista de calidad toma 50 latas y mide su peso neto. ¿Cuál es la <b>muestra</b>?',options:['Las 50 latas pesadas','Las 12 000 latas del día','El peso neto','El peso promedio de las 50 latas'],answer:0,explain:'La muestra es la parte de la población que realmente se mide: las 50 latas. La población son las 12 000 latas y el peso neto es la variable.'}),
 ()=>({type:'mc',text:'Con esas 50 latas se obtiene un peso promedio de 169,8 g. Ese valor es un…',options:['Estadístico','Parámetro','Dato atípico','Censo'],answer:0,explain:'Se calculó con la muestra, por eso es un <b>estadístico</b> (x̄). El parámetro μ sería el promedio de todas las latas de la población.'}),
 ()=>({type:'mc',text:'Para conocer el pH de la leche recibida en un día, se analizan 20 de los 120 tanqueros que llegaron. ¿Cuál es la <b>población</b>?',options:['Los 120 tanqueros del día','Los 20 tanqueros analizados','El pH de la leche','El pH promedio de los 20 tanqueros'],answer:0,explain:'La población es el conjunto completo sobre el que se quiere concluir: los 120 tanqueros.'}),
 ()=>({type:'mc',text:'¿Cuál es la mejor forma de distinguir una variable discreta de una continua?',options:['La discreta se cuenta; la continua se mide con un instrumento','La discreta tiene pocos datos; la continua tiene muchos','La discreta es cualitativa; la continua es cuantitativa','La discreta no puede valer cero'],answer:0,explain:'Ambas son cuantitativas. Si el valor sale de <b>contar</b> (colonias, defectos) es discreta; si sale de <b>medir</b> (peso, pH, temperatura) es continua.'}),
];
function quizVariables(){
  const qs=shuffle(VARS).slice(0,4).map(v=>({type:'mc',keepOrder:true,text:`Clasifica la variable <b>${v.name}</b> <span class="muted">(ej.: ${v.ej})</span>`,options:TKEYS.map(k=>TYPES[k]),answer:TKEYS.indexOf(v.t),explain:`Es <b>${TYPES[v.t].toLowerCase()}</b>: ${v.why}`}));
  return qs.concat(shuffle(M1C).slice(0,2).map(f=>f()));
}

/* ================= Módulo 2: Frecuencias ================= */
function groupData(d,k){
  const mn=Math.min(...d),mx=Math.max(...d),R=round(mx-mn,1);
  let A=Math.ceil(round(R/k*10,6))/10; if(A<=0)A=0.1;
  const cls=Array.from({length:k},(_,j)=>({Li:round(mn+j*A,1),Ls:round(mn+(j+1)*A,1),f:0}));
  d.forEach(x=>{let j=Math.floor(round((x-mn)/A,6));if(j>=k)j=k-1;cls[j].f++;});
  let F=0;cls.forEach(c=>{F+=c.f;c.F=F;c.h=c.f/d.length;c.H=F/d.length;c.x=round((c.Li+c.Ls)/2,2);});
  return {mn,mx,R,A,cls};
}
function simFreq(box){
  const st={n:60,auto:true,k:7,poly:false,data:[]};
  const gen=()=>{st.data=Array.from({length:st.n},()=>round(170+2.6*randn(),1));};
  gen();
  box.innerHTML=`<p class="ctx">Pesos netos (g) de latas de atún tomadas al azar de la línea de envasado. Cambia el tamaño de la muestra o el número de clases y observa la tabla y el histograma.</p>
  <div class="ctrls">
    <label class="ctrl"><span>Tamaño de muestra n <output id="fq-n-o"></output></span><input type="range" id="fq-n" min="20" max="300" step="10" value="60"></label>
    <label class="ctrl"><span>Número de clases k <output id="fq-k-o"></output></span><input type="range" id="fq-k" min="3" max="15" step="1" value="7"></label>
  </div>
  <div class="ctrls"><label class="chk"><input type="checkbox" id="fq-auto" checked> Usar regla de Sturges</label>
    <label class="chk"><input type="checkbox" id="fq-poly"> Polígono de frecuencias</label>
    <button type="button" class="btn btn-ghost" id="fq-new">Tomar otra muestra</button></div>
  <div class="steps" id="fq-steps"></div>
  <div class="chart-wrap" id="fq-chart"></div>
  <div class="table-wrap"><table class="tbl" id="fq-tbl"></table></div>`;
  const nI=$('#fq-n',box),kI=$('#fq-k',box),auto=$('#fq-auto',box),poly=$('#fq-poly',box);
  function draw(){
    const n=st.data.length,kr=1+3.322*Math.log10(n),k=st.auto?Math.round(kr):st.k;
    kI.value=k;kI.disabled=st.auto;$('#fq-n-o',box).textContent=n;$('#fq-k-o',box).textContent=k;
    const G=groupData(st.data,k);
    $('#fq-steps',box).innerHTML=`<span>${st.auto?`k = 1 + 3,322·log₁₀(${n}) = ${fmt(kr,2)} ≈ <b>${k} clases</b>`:`k = <b>${k} clases</b> (elegido a mano)`}</span>
      <span>R = x<sub>máx</sub> − x<sub>mín</sub> = ${fmt(G.mx,1)} − ${fmt(G.mn,1)} = <b>${fmt(G.R,1)} g</b></span>
      <span>A = R / k = ${fmt(G.R/k,3)} → redondeando hacia arriba a 0,1 g: <b>${fmt(G.A,1)} g</b></span>`;
    const c=G.cls,ymax=Math.max(...c.map(x=>x.f))*1.15||1;
    const xmin=st.poly?c[0].Li-G.A:c[0].Li,xmax=st.poly?c[k-1].Ls+G.A:c[k-1].Ls;
    const lims=[...c.map(x=>x.Li),c[k-1].Ls];const W=cw($('#fq-chart',box));const every=Math.ceil(lims.length/Math.max(4,Math.floor(W/60)));
    $('#fq-chart',box).innerHTML=chart({W,xmin,xmax,ymax,gap:0.5,label:'Histograma de pesos',xlabel:'Peso neto (g) · altura = frecuencia absoluta fᵢ',
      xticks:lims.filter((_,j)=>j%every===0),xfmt:v=>fmt(v,1),
      bars:c.map(x=>({x0:x.Li,x1:x.Ls,y:x.f,title:`[${fmt(x.Li,1)} ; ${fmt(x.Ls,1)}): ${x.f} latas`})),
      curves:st.poly?[{cls:'acc',dots:true,pts:[[c[0].x-G.A,0],...c.map(x=>[x.x,x.f]),[c[k-1].x+G.A,0]]}]:[]});
    $('#fq-tbl',box).innerHTML=`<thead><tr><th>Clase</th><th>Intervalo (g)</th><th>xᵢ</th><th>fᵢ</th><th>Fᵢ</th><th>hᵢ</th><th>Hᵢ</th></tr></thead><tbody>
      ${c.map((x,j)=>`<tr><td>${j+1}</td><td>[${fmt(x.Li,1)} ; ${fmt(x.Ls,1)}${j===k-1?']':')'}</td><td>${fmt(x.x,2)}</td><td>${x.f}</td><td>${x.F}</td><td>${fmt(x.h,3)}</td><td>${fmt(x.H,3)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td>Total</td><td></td><td></td><td>${n}</td><td></td><td>${fmt(1,3)}</td><td></td></tr></tfoot>`;
  }
  nI.addEventListener('input',()=>{st.n=+nI.value;gen();draw();});
  kI.addEventListener('input',()=>{st.k=+kI.value;draw();});
  auto.addEventListener('change',()=>{st.auto=auto.checked;draw();});
  poly.addEventListener('change',()=>{st.poly=poly.checked;draw();});
  $('#fq-new',box).addEventListener('click',()=>{gen();draw();});
  draw();return draw;
}
function quizFreq(){
  const n=pick([30,40,50,60,80,100,120,150,200]),kr=1+3.322*Math.log10(n),k=Math.round(kr);
  const mn=round(rnd(160,164),1),mx=round(rnd(176,180),1),R=round(mx-mn,1),k2=pick([5,6,7,8]),A=R/k2;
  const f=Array.from({length:5},()=>rint(3,16)),N=sum(f),L0=pick([160,162,164]),w=3;
  const tbl=`<div class="table-wrap"><table class="tbl mini"><thead><tr><th>Peso (g)</th><th>fᵢ</th></tr></thead><tbody>${f.map((fi,j)=>`<tr><td>[${L0+j*w} ; ${L0+(j+1)*w})</td><td>${fi}</td></tr>`).join('')}</tbody><tfoot><tr><td>Total</td><td>${N}</td></tr></tfoot></table></div>`;
  const h3=f[2]/N,F4=f[0]+f[1]+f[2]+f[3];
  return [
   {type:'num',text:`Se pesaron <b>n = ${n}</b> latas. Según la regla de Sturges, ¿cuántas clases conviene usar? (redondea al entero más cercano)`,unit:'clases',answer:k,tol:0,explain:`k = 1 + 3,322·log₁₀(${n}) = ${fmt(kr,2)} ≈ <b>${k}</b> clases.`},
   {type:'num',text:`En una muestra, el peso mínimo es ${fmt(mn,1)} g y el máximo ${fmt(mx,1)} g. ¿Cuál es el rango R?`,unit:'g',answer:R,tol:0.05,explain:`R = ${fmt(mx,1)} − ${fmt(mn,1)} = <b>${fmt(R,1)} g</b>.`},
   {type:'num',text:`Con R = ${fmt(R,1)} g y k = ${k2} clases, ¿cuál es la amplitud A = R/k? (dos decimales)`,unit:'g',answer:round(A,2),tol:0.011,explain:`A = ${fmt(R,1)} / ${k2} = <b>${fmt(A,2)} g</b>. En la práctica se redondea hacia arriba para que todas las observaciones entren en alguna clase.`},
   {type:'num',text:`<span>Observa esta tabla de pesos:</span>${tbl}<span>¿Cuál es la frecuencia relativa h₃ de la tercera clase? (tres decimales)</span>`,answer:round(h3,3),tol:0.0015,explain:`h₃ = f₃ / n = ${f[2]} / ${N} = <b>${fmt(h3,3)}</b> (≈ ${fmt(h3*100,1)} % de las latas).`},
   {type:'num',text:`Con la misma tabla, ¿cuál es la frecuencia absoluta acumulada F₄?`,answer:F4,tol:0,explain:`F₄ = ${f[0]} + ${f[1]} + ${f[2]} + ${f[3]} = <b>${F4}</b>: son las latas que pesan menos de ${L0+4*w} g.`},
   {type:'mc',text:`La cuarta clase de una tabla es [${L0+3*w} ; ${L0+4*w}) y tiene H₄ = 0,80. ¿Qué significa?`,options:[`El 80 % de las latas pesa menos de ${L0+4*w} g`,`El 80 % de las latas pesa entre ${L0+3*w} y ${L0+4*w} g`,`Hay 80 latas en la cuarta clase`,`El 80 % de las latas pesa más de ${L0+4*w} g`],answer:0,explain:`H es <b>acumulada</b>: suma las proporciones desde la primera clase hasta la cuarta, es decir, todas las latas por debajo de ${L0+4*w} g.`},
  ];
}

/* ================= Módulo 3: Tendencia central ================= */
function simCentral(box){
  const LO=8,HI=20,st={vals:[]};
  const gen=()=>{st.vals=Array.from({length:9},()=>clamp(Math.round((12.5+1.5*randn())*2)/2,9,16));};
  gen();
  box.innerHTML=`<p class="ctx">°Brix de 9 muestras de jugo de naranja. <b>Arrastra los puntos</b> (o selecciónalos con Tab y usa las flechas ← →) y mira cómo reaccionan la media, la mediana y la moda.</p>
    <div class="chart-wrap" id="ct-wrap"><svg class="chart dots-svg" id="ct-svg" role="group" aria-label="Diagrama de puntos de °Brix"></svg></div>
    <div class="readouts" id="ct-ro"></div>
    <p class="verdict" id="ct-v"></p>
    <div class="btn-row"><button type="button" class="btn btn-ghost" data-a="new">Muestra nueva</button><button type="button" class="btn btn-ghost" data-a="out">Agregar valor atípico (19,5)</button><button type="button" class="btn btn-ghost" data-a="add">Agregar punto</button><button type="button" class="btn btn-ghost" data-a="del">Quitar último punto</button></div>`;
  const svg=$('#ct-svg',box),wrap=$('#ct-wrap',box);let drag=null,geo=null;
  function draw(focusI){
    const W=cw(wrap),H=230,ml=24,mr=24,base=140;const X=v=>ml+(v-LO)/(HI-LO)*(W-ml-mr);geo={X,inv:x=>LO+(x-ml)/(W-ml-mr)*(HI-LO)};
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('width',W);svg.setAttribute('height',H);
    const v=st.vals,m=mean(v),me=median(v);let s='';
    const step=W<480?2:1;
    for(let t=LO;t<=HI;t++){s+=`<line class="grid" x1="${X(t)}" x2="${X(t)}" y1="16" y2="${base}"/>`;if((t-LO)%step===0)s+=`<text x="${X(t)}" y="${base+19}" text-anchor="middle">${t}</text>`;}
    s+=`<line class="axis" x1="${ml}" x2="${W-mr}" y1="${base}" y2="${base}"/>`;
    s+=`<line class="vl" x1="${X(me)}" x2="${X(me)}" y1="14" y2="${base}"/><text class="lbl" x="${X(me)}" y="11" text-anchor="middle">mediana ${fmt(me,2)}</text>`;
    s+=`<polygon class="fulcrum" points="${X(m)},${base+26} ${X(m)-10},${base+44} ${X(m)+10},${base+44}"/><text class="lbl" x="${X(m)}" y="${base+62}" text-anchor="middle">media ${fmt(m,2)} (punto de equilibrio)</text>`;
    const order=v.map((x,i)=>i).sort((a,b)=>v[a]-v[b]||a-b),cnt={};let maxS=1;v.forEach(x=>{cnt[x]=(cnt[x]||0)+1;maxS=Math.max(maxS,cnt[x]);});
    const gap=Math.min(19,(base-34)/maxS),seen={};
    order.forEach(i=>{const x=v[i];seen[x]=(seen[x]||0);const y=base-11-seen[x]*gap;seen[x]++;
      s+=`<circle class="dot${drag===i?' dragging':''}${x>=18?' out':''}" data-i="${i}" cx="${X(x)}" cy="${y}" r="9" tabindex="0" role="slider" aria-valuemin="${LO}" aria-valuemax="${HI}" aria-valuenow="${x}" aria-label="Muestra ${i+1}: ${fmt(x,1)} °Brix"></circle>`;});
    svg.innerHTML=s;
    if(focusI!=null){const c=svg.querySelector(`[data-i="${focusI}"]`);c&&c.focus();}
    const mo=modes(v);
    $('#ct-ro',box).innerHTML=`<div class="ro"><span>n</span><b>${v.length}</b></div><div class="ro hl"><span>Media x̄</span><b>${fmt(m,2)}</b></div><div class="ro"><span>Mediana</span><b>${fmt(me,2)}</b></div><div class="ro"><span>Moda</span><b>${mo.length?mo.map(x=>fmt(x,1)).join(' y '):'no hay'}</b></div>`;
    const d=m-me;
    $('#ct-v',box).innerHTML=Math.abs(d)<0.15?'Media y mediana casi coinciden: los datos están repartidos de forma bastante <b>simétrica</b>.':d>0?'La media está <b>a la derecha</b> de la mediana: algunos valores altos la “jalan” hacia arriba (sesgo a la derecha). La mediana casi no se mueve.':'La media está <b>a la izquierda</b> de la mediana: algunos valores bajos la “jalan” hacia abajo (sesgo a la izquierda).';
  }
  const pt=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());};
  svg.addEventListener('pointerdown',e=>{const c=e.target.closest('[data-i]');if(!c)return;drag=+c.dataset.i;try{svg.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();draw();});
  svg.addEventListener('pointermove',e=>{if(drag===null)return;const nv=clamp(Math.round(geo.inv(pt(e).x)*2)/2,LO,HI);if(nv!==st.vals[drag]){st.vals[drag]=nv;draw();}});
  const end=()=>{if(drag!==null){drag=null;draw();}};
  svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  svg.addEventListener('keydown',e=>{const c=e.target.closest('[data-i]');if(!c)return;const i=+c.dataset.i;let d=0;
    if(e.key==='ArrowLeft'||e.key==='ArrowDown')d=-0.5;if(e.key==='ArrowRight'||e.key==='ArrowUp')d=0.5;if(!d)return;e.preventDefault();st.vals[i]=clamp(st.vals[i]+d,LO,HI);draw(i);});
  box.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.a;
    if(a==='new')gen();if(a==='out'&&st.vals.length<25)st.vals.push(19.5);if(a==='add'&&st.vals.length<25)st.vals.push(clamp(Math.round((12.5+1.1*randn())*2)/2,9,16));if(a==='del'&&st.vals.length>3)st.vals.pop();draw();}));
  draw();return ()=>draw();
}
function quizCentral(){
  const n=pick([7,8]),pool=shuffle(Array.from({length:13},(_,i)=>i+10)).slice(0,n-1),dup=pick(pool),d=shuffle([...pool,dup]);
  const m=mean(d),me=median(d),sorted=[...d].sort((a,b)=>a-b);
  return [
   {type:'num',text:`Tiempos de cocción (min) de ${n} lotes de mermelada: <span class="data">${d.join(' · ')}</span><span>Calcula la <b>media</b> (dos decimales).</span>`,unit:'min',answer:round(m,2),tol:0.011,explain:`x̄ = ${sum(d)} / ${n} = <b>${fmt(m,2)} min</b>.`},
   {type:'num',text:`Con los mismos datos (<span class="data">${d.join(' · ')}</span>), ¿cuál es la <b>mediana</b>?`,unit:'min',answer:me,tol:0.011,explain:`Ordenados: ${sorted.join(' · ')}. ${n%2?`El valor central (posición ${(n+1)/2}) es`:`Con n par se promedian las posiciones ${n/2} y ${n/2+1}:`} <b>${nf(me,1)} min</b>.`},
   {type:'num',text:`¿Y la <b>moda</b> de esos tiempos?`,unit:'min',answer:dup,tol:0,explain:`El ${dup} aparece dos veces; los demás, una sola vez. Moda = <b>${dup} min</b>.`},
   {type:'mc',text:`Si a esos datos se agrega un lote atípico de 60 min, ¿qué medida cambia más?`,options:['La media','La mediana','La moda','Las tres cambian lo mismo'],answer:0,explain:'La media usa el valor de <b>todos</b> los datos, así que un atípico la arrastra. La mediana solo depende de la posición central y es <b>robusta</b>.'},
   {type:'mc',text:`El tiempo de vida útil de un producto tiene muchos valores cercanos a 20 días y unos pocos que llegan a 60 días (cola larga a la derecha). Lo esperable es que…`,options:['La media sea mayor que la mediana','La mediana sea mayor que la media','Media y mediana sean iguales','La moda sea mayor que la media'],answer:0,explain:'Con sesgo a la derecha, los valores altos jalan la media hacia arriba: <b>media &gt; mediana</b>.'},
  ];
}

/* ================= Módulo 4: Dispersión ================= */
function simDisp(box){
  const n=30,st={sa:2.5,sb:6,za:[],zb:[],ja:[],jb:[]};
  const gen=()=>{st.za=Array.from({length:n},randn);st.zb=Array.from({length:n},randn);st.ja=Array.from({length:n},Math.random);st.jb=Array.from({length:n},Math.random);};
  gen();
  box.innerHTML=`<p class="ctx">Dos llenadoras de jugo están calibradas a <b>500 mL</b>. Las especificaciones son 490–510 mL. Ambas tienen casi la misma media; mueve la variabilidad de cada una y compara.</p>
  <div class="ctrls"><label class="ctrl"><span>Variabilidad máquina A <output id="ds-a-o"></output></span><input type="range" id="ds-a" min="0.5" max="10" step="0.5" value="2.5"></label>
  <label class="ctrl"><span>Variabilidad máquina B <output id="ds-b-o"></output></span><input type="range" id="ds-b" min="0.5" max="10" step="0.5" value="6"></label>
  <button type="button" class="btn btn-ghost" id="ds-new">Tomar otras 30 botellas</button></div>
  <div class="chart-wrap" id="ds-chart"></div>
  <div class="table-wrap"><table class="tbl" id="ds-tbl"></table></div>
  <p class="verdict" id="ds-v"></p>`;
  function draw(){
    const A=st.za.map(z=>round(500+st.sa*z,1)),B=st.zb.map(z=>round(500+st.sb*z,1));
    $('#ds-a-o',box).textContent=fmt(st.sa,1)+' mL';$('#ds-b-o',box).textContent=fmt(st.sb,1)+' mL';
    const all=A.concat(B),lo=Math.min(470,Math.floor(Math.min(...all)-2)),hi=Math.max(530,Math.ceil(Math.max(...all)+2));
    const W=cw($('#ds-chart',box)),ml=86,mr=18,rowH=92,H=2*rowH+58,X=v=>ml+(v-lo)/(hi-lo)*(W-ml-mr);let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="chart" role="img" aria-label="Diagramas de caja de las dos máquinas">`;
    niceTicks(lo,hi,Math.max(3,Math.floor((W-ml)/70))).forEach(t=>{s+=`<line class="grid" x1="${X(t)}" x2="${X(t)}" y1="22" y2="${H-30}"/><text x="${X(t)}" y="${H-12}" text-anchor="middle">${t}</text>`;});
    [490,510].forEach((L,j)=>{s+=`<line class="vl acc" x1="${X(L)}" x2="${X(L)}" y1="20" y2="${H-30}"/><text class="lbl" x="${X(L)}" y="13" text-anchor="middle">${j?'LSE':'LIE'} ${L}</text>`;});
    [[A,st.ja,'Máquina A'],[B,st.jb,'Máquina B']].forEach(([d,jit,lab],r)=>{
      const y0=26+r*rowH;s+=`<text class="lbl" x="4" y="${y0+44}">${lab}</text>`;
      d.forEach((x,i)=>{s+=`<circle class="pdot${x<490||x>510?' out':''}" cx="${X(clamp(x,lo,hi)).toFixed(1)}" cy="${(y0+6+jit[i]*30).toFixed(1)}" r="3.6"/>`;});
      const q1=quantile(d,.25),q2=quantile(d,.5),q3=quantile(d,.75),mn=Math.min(...d),mx=Math.max(...d),yb=y0+46,hb=24;
      s+=`<line class="whisk" x1="${X(mn)}" x2="${X(q1)}" y1="${yb+hb/2}" y2="${yb+hb/2}"/><line class="whisk" x1="${X(q3)}" x2="${X(mx)}" y1="${yb+hb/2}" y2="${yb+hb/2}"/>`;
      s+=`<line class="whisk" x1="${X(mn)}" x2="${X(mn)}" y1="${yb+5}" y2="${yb+hb-5}"/><line class="whisk" x1="${X(mx)}" x2="${X(mx)}" y1="${yb+5}" y2="${yb+hb-5}"/>`;
      s+=`<rect class="box" x="${X(q1)}" y="${yb}" width="${Math.max(1,X(q3)-X(q1))}" height="${hb}" rx="3"/><line class="med" x1="${X(q2)}" x2="${X(q2)}" y1="${yb}" y2="${yb+hb}"/>`;
    });
    $('#ds-chart',box).innerHTML=s+'</svg>';
    const row=(lab,d)=>{const m=mean(d),v=svar(d),sd=Math.sqrt(v),q1=quantile(d,.25),q3=quantile(d,.75),out=d.filter(x=>x<490||x>510).length;
      return {cv:sd/m*100,out,html:`<tr><td>${lab}</td><td>${fmt(m,2)}</td><td>${fmt(Math.max(...d)-Math.min(...d),1)}</td><td>${fmt(v,2)}</td><td>${fmt(sd,2)}</td><td>${fmt(sd/m*100,2)} %</td><td>${fmt(q1,2)}</td><td>${fmt(quantile(d,.5),2)}</td><td>${fmt(q3,2)}</td><td>${fmt(q3-q1,2)}</td><td class="${out?'bad':'ok'}">${out} de ${d.length}</td></tr>`};};
    const ra=row('A',A),rb=row('B',B);
    $('#ds-tbl',box).innerHTML=`<thead><tr><th>Máquina</th><th>Media</th><th>Rango</th><th>Varianza s²</th><th>Desv. s</th><th>CV</th><th>Q1</th><th>Q2</th><th>Q3</th><th>RIC</th><th>Fuera de espec.</th></tr></thead><tbody>${ra.html}${rb.html}</tbody>`;
    const best=ra.cv<rb.cv?'A':'B';
    $('#ds-v',box).innerHTML=Math.abs(ra.cv-rb.cv)<0.05?'Las dos máquinas tienen una variabilidad muy parecida.':`La <b>máquina ${best}</b> es más consistente (menor CV). Con medias casi iguales, la que tiene más dispersión produce más botellas fuera de especificación, aunque “en promedio” llene bien.`;
  }
  $('#ds-a',box).addEventListener('input',e=>{st.sa=+e.target.value;draw();});
  $('#ds-b',box).addEventListener('input',e=>{st.sb=+e.target.value;draw();});
  $('#ds-new',box).addEventListener('click',()=>{gen();draw();});
  draw();return draw;
}
function quizDisp(){
  let d;do{d=Array.from({length:5},()=>round(rnd(10,14),1));}while(new Set(d).size<4);
  const R=round(Math.max(...d)-Math.min(...d),1),m=mean(d),v=svar(d),s=Math.sqrt(v),cv=s/m*100;
  const mA=pick([250,330,500]),sA=round(mA*rnd(0.016,0.03),1),mB=mA*pick([3,4]);let sB=round(mB*rnd(0.005,0.011),1);if(sB<=sA)sB=round(sA*1.3,1);
  const cvA=sA/mA*100,cvB=sB/mB*100;
  const list=`<span class="data">${d.map(x=>fmt(x,1)).join(' · ')}</span>`;
  return [
   {type:'num',text:`Humedad (%) de 5 lotes de harina: ${list}<span>¿Cuál es el <b>rango</b>?</span>`,unit:'%',answer:R,tol:0.05,explain:`R = ${fmt(Math.max(...d),1)} − ${fmt(Math.min(...d),1)} = <b>${fmt(R,1)}</b>.`},
   {type:'num',text:`Con los mismos datos (${list}), calcula la <b>varianza muestral</b> s² (tres decimales).`,answer:round(v,3),tol:Math.max(0.006,v*0.02),explain:`x̄ = ${fmt(m,2)}. s² = Σ(xᵢ − x̄)² / (n − 1) = ${fmt(v*4,3)} / 4 = <b>${fmt(v,3)}</b>. En Excel: =VAR.S(rango).`},
   {type:'num',text:`¿Cuál es la <b>desviación estándar</b> s? (tres decimales)`,unit:'%',answer:round(s,3),tol:Math.max(0.006,s*0.02),explain:`s = √s² = √${fmt(v,3)} = <b>${fmt(s,3)}</b>. En Excel: =DESVEST.M(rango).`},
   {type:'num',text:`¿Cuál es el <b>coeficiente de variación</b> CV en %? (dos decimales)`,unit:'%',answer:round(cv,2),tol:Math.max(0.06,cv*0.02),explain:`CV = s / x̄ · 100 = ${fmt(s,3)} / ${fmt(m,2)} · 100 = <b>${fmt(cv,2)} %</b>.`},
   {type:'mc',text:`La línea A envasa bolsas de ${mA} g con s = ${fmt(sA,1)} g. La línea B envasa bolsas de ${mB} g con s = ${fmt(sB,1)} g. ¿Cuál es relativamente más consistente?`,options:['La línea B, porque su CV es menor','La línea A, porque su desviación estándar es menor','Las dos son igual de consistentes','No se pueden comparar porque tienen medias distintas'],answer:0,explain:`Con medias distintas se compara el CV: A = ${fmt(cvA,2)} %, B = ${fmt(cvB,2)} %. La línea <b>B</b> varía menos <i>en relación con su tamaño</i>.`},
   {type:'mc',text:'¿Por qué la varianza muestral se divide entre n − 1 y no entre n?',options:['Porque así la varianza de la muestra estima sin sesgo la varianza de la población','Porque siempre hay un dato atípico que se descarta','Porque la media se calcula con n − 1 datos','Es una costumbre sin efecto en el resultado'],answer:0,explain:'Al usar x̄ (calculada con los mismos datos) las desviaciones quedan un poco “cortas”. Dividir para <b>n − 1</b> corrige ese sesgo.'},
  ];
}

/* ================= Módulo 5: Probabilidad ================= */
function simProb(box){
  const st={p:0.1,t:0,d:0,pts:[],last:[]};
  const reset=()=>{st.t=0;st.d=0;st.pts=[];st.last=[];};
  box.innerHTML=`<p class="ctx">Un lote grande de frascos de salsa tiene una proporción real <b>p</b> de frascos con tapa defectuosa. Inspecciona frascos al azar y observa cómo la frecuencia relativa se acerca a p.</p>
  <div class="ctrls"><label class="ctrl"><span>Proporción real de defectuosos p <output id="pr-p-o"></output></span><input type="range" id="pr-p" min="0.01" max="0.5" step="0.01" value="0.1"></label></div>
  <div class="btn-row"><button type="button" class="btn" data-n="1">Inspeccionar 1</button><button type="button" class="btn" data-n="10">+10</button><button type="button" class="btn" data-n="100">+100</button><button type="button" class="btn" data-n="1000">+1000</button><button type="button" class="btn btn-ghost" id="pr-r">Reiniciar</button></div>
  <div class="readouts" id="pr-ro"></div>
  <div class="chart-wrap" id="pr-chart"></div>
  <div style="display:grid;gap:8px"><p class="note">Últimos 100 frascos inspeccionados</p><div class="units" id="pr-u"></div>
  <div class="legend"><span><i style="background:var(--data)"></i>conforme</span><span><i style="background:var(--accent)"></i>defectuoso</span><span><i style="background:var(--line)"></i>aún sin inspeccionar</span></div></div>`;
  function add(k){for(let i=0;i<k;i++){const def=Math.random()<st.p;st.t++;if(def)st.d++;st.last.push(def);
      const every=st.t<=200?1:Math.ceil(st.t/400);if(st.t%every===0)st.pts.push([st.t,st.d/st.t]);}
    if(st.last.length>100)st.last=st.last.slice(-100);draw();}
  function draw(){
    $('#pr-p-o',box).textContent=fmt(st.p,2);const fr=st.t?st.d/st.t:NaN;
    $('#pr-ro',box).innerHTML=`<div class="ro"><span>Frascos inspeccionados</span><b>${st.t.toLocaleString('es-EC')}</b></div><div class="ro"><span>Defectuosos</span><b>${st.d.toLocaleString('es-EC')}</b></div><div class="ro hl"><span>Frecuencia relativa</span><b>${st.t?fmt(fr,3):'—'}</b></div><div class="ro"><span>Diferencia con p</span><b>${st.t?fmt(Math.abs(fr-st.p),3):'—'}</b></div>`;
    const ymax=Math.min(1,Math.max(0.25,st.p*2.6));
    $('#pr-chart',box).innerHTML=chart({W:cw($('#pr-chart',box)),xmin:0,xmax:Math.max(10,st.t),ymax,label:'Frecuencia relativa acumulada',xlabel:'Número de frascos inspeccionados',yfmt:v=>fmt(v,2),
      curves:[{cls:'data',pts:st.pts.map(p=>[p[0],Math.min(p[1],ymax)])}],hlines:[{y:st.p,cls:'acc',label:`p real = ${fmt(st.p,2)}`}]});
    const u=$('#pr-u',box),cells=[];for(let i=0;i<100;i++){const v=st.last[i];cells.push(`<span class="u${v===undefined?'':v?' d':' c'}"></span>`);}u.innerHTML=cells.join('');
  }
  $('#pr-p',box).addEventListener('input',e=>{st.p=+e.target.value;reset();draw();});
  box.querySelectorAll('[data-n]').forEach(b=>b.addEventListener('click',()=>add(+b.dataset.n)));
  $('#pr-r',box).addEventListener('click',()=>{reset();draw();});
  draw();return draw;
}
function quizProb(){
  const a1=rint(60,110),a2=rint(4,15),b1=rint(60,110),b2=rint(4,15),N=a1+a2+b1+b2,NC=a2+b2;
  const tbl=`<div class="table-wrap"><table class="tbl mini"><thead><tr><th>Proveedor</th><th>Conforme</th><th>No conforme</th><th>Total</th></tr></thead><tbody><tr><td>A</td><td>${a1}</td><td>${a2}</td><td>${a1+a2}</td></tr><tr><td>B</td><td>${b1}</td><td>${b2}</td><td>${b1+b2}</td></tr></tbody><tfoot><tr><td>Total</td><td>${a1+b1}</td><td>${NC}</td><td>${N}</td></tr></tfoot></table></div>`;
  const ctx=`<span>Una planta recibe sacos de cacao de dos proveedores e inspecciona cada saco:</span>${tbl}<span>Se elige un saco al azar.</span>`;
  const ref=`<span class="muted">(Usa la tabla de la pregunta 1.)</span>`;
  return [
   {type:'num',text:`${ctx}<span>¿Cuál es P(no conforme)? (tres decimales)</span>`,answer:round(NC/N,3),tol:0.0015,explain:`P(NC) = ${NC} / ${N} = <b>${fmt(NC/N,3)}</b>.`},
   {type:'num',text:`${ref}<span>¿Cuál es P(A ∩ no conforme), es decir, que sea del proveedor A <b>y</b> no conforme?</span>`,answer:round(a2/N,3),tol:0.0015,explain:`P(A ∩ NC) = ${a2} / ${N} = <b>${fmt(a2/N,3)}</b>.`},
   {type:'num',text:`${ref}<span>Si el saco es del proveedor A, ¿cuál es la probabilidad de que sea no conforme? P(NC | A)</span>`,answer:round(a2/(a1+a2),3),tol:0.0015,explain:`Condicionar a A reduce el universo a los ${a1+a2} sacos de A: P(NC | A) = ${a2} / ${a1+a2} = <b>${fmt(a2/(a1+a2),3)}</b>.`},
   {type:'num',text:`${ref}<span>¿Cuál es P(A ∪ no conforme), es decir, que sea del proveedor A <b>o</b> no conforme?</span>`,answer:round((a1+a2+b2)/N,3),tol:0.0015,explain:`P(A ∪ NC) = P(A) + P(NC) − P(A ∩ NC) = (${a1+a2} + ${NC} − ${a2}) / ${N} = <b>${fmt((a1+a2+b2)/N,3)}</b>.`},
   {type:'num',text:`${ref}<span>Usando el complemento, ¿cuál es P(conforme)?</span>`,answer:round(1-NC/N,3),tol:0.0015,explain:`P(conforme) = 1 − P(NC) = 1 − ${fmt(NC/N,3)} = <b>${fmt(1-NC/N,3)}</b>.`},
   {type:'mc',text:'Si P(no conforme | proveedor A) es igual a P(no conforme), entonces…',options:['“Ser del proveedor A” y “ser no conforme” son eventos independientes','Los eventos son mutuamente excluyentes','El proveedor A no tiene sacos no conformes','P(A) = P(no conforme)'],answer:0,explain:'Si saber que es de A no cambia la probabilidad de ser no conforme, los eventos son <b>independientes</b>.'},
  ];
}

/* ================= Distribuciones discretas (Binomial / Poisson) ================= */
const CONDS={eq:['=',k=>x=>x===k],le:['≤',k=>x=>x<=k],lt:['<',k=>x=>x<k],ge:['≥',k=>x=>x>=k],gt:['>',k=>x=>x>k]};
function simDiscrete(box,cfg){
  const st=Object.assign({k:1,cond:'le'},cfg.init),id=cfg.id;
  box.innerHTML=`<p class="ctx" id="${id}-ctx"></p>
  <div class="ctrls">${cfg.params.map(p=>`<label class="ctrl"><span>${p.label} <output id="${id}-${p.key}-o"></output></span><input type="range" id="${id}-${p.key}" min="${p.min}" max="${p.max}" step="${p.step}" value="${st[p.key]}"></label>`).join('')}</div>
  <div class="ctrls"><label class="ctrl"><span>Probabilidad que quiero calcular</span><select id="${id}-cond">${Object.entries(CONDS).map(([k,v])=>`<option value="${k}"${k===st.cond?' selected':''}>P(X ${v[0]} k)</option>`).join('')}</select></label>
  <label class="ctrl"><span>k <output id="${id}-k-o"></output></span><input type="range" id="${id}-k" min="0" max="10" step="1" value="${st.k}"></label></div>
  <div class="readouts" id="${id}-ro"></div><div class="chart-wrap" id="${id}-ch"></div><div class="formula" id="${id}-fx"></div>`;
  const kI=$(`#${id}-k`,box);
  function draw(){
    cfg.params.forEach(p=>{$(`#${id}-${p.key}-o`,box).textContent=p.fmt(st[p.key]);});
    const kmax=cfg.kmax(st);kI.max=kmax;if(st.k>kmax)st.k=kmax;kI.value=st.k;$(`#${id}-k-o`,box).textContent=st.k;
    const inE=CONDS[st.cond][1](st.k),pm=[];for(let x=0;x<=kmax;x++)pm.push(cfg.pmf(x,st));
    const P=sum(pm.filter((_,x)=>inE(x)));
    $(`#${id}-ctx`,box).innerHTML=cfg.context(st);
    $(`#${id}-ro`,box).innerHTML=`<div class="ro hl"><span>P(X ${CONDS[st.cond][0]} ${st.k})</span><b>${fmt(P,4)}</b></div>${cfg.stats(st)}`;
    const W=cw($(`#${id}-ch`,box));
    $(`#${id}-ch`,box).innerHTML=chart({W,xmin:-0.6,xmax:kmax+0.6,ymax:Math.max(...pm)*1.15,gap:0,label:'Distribución de probabilidad',xlabel:cfg.xlabel+' · resaltado: valores que cumplen el evento',
      yfmt:v=>fmt(v,2),xticks:intTicks(0,kmax,W),xfmt:v=>String(v),
      bars:pm.map((p,x)=>({x0:x-0.36,x1:x+0.36,y:p,cls:inE(x)?'hl':'dim',title:`P(X = ${x}) = ${fmt(p,4)}`}))});
    $(`#${id}-fx`,box).innerHTML=cfg.formula(st,pm,P);
  }
  cfg.params.forEach(p=>$(`#${id}-${p.key}`,box).addEventListener('input',e=>{st[p.key]=+e.target.value;draw();}));
  kI.addEventListener('input',()=>{st.k=+kI.value;draw();});
  $(`#${id}-cond`,box).addEventListener('change',e=>{st.cond=e.target.value;draw();});
  draw();return draw;
}
function simBinom(box){
  return simDiscrete(box,{id:'bi',init:{n:10,p:0.15,k:2,cond:'le'},xlabel:'X = frascos defectuosos en la muestra',
    params:[{key:'n',label:'Frascos en la muestra n',min:1,max:40,step:1,fmt:v=>v},{key:'p',label:'Probabilidad de defecto p',min:0.01,max:0.99,step:0.01,fmt:v=>fmt(v,2)}],
    kmax:st=>st.n,pmf:(x,st)=>binom(x,st.n,st.p),
    context:st=>`Se toman <b>${st.n}</b> frascos de mermelada al azar; cada uno tiene probabilidad <b>${fmt(st.p,2)}</b> de salir con mal sellado, de forma independiente. X = número de frascos mal sellados.`,
    stats:st=>`<div class="ro"><span>Media μ = np</span><b>${fmt(st.n*st.p,2)}</b></div><div class="ro"><span>Varianza σ² = np(1−p)</span><b>${fmt(st.n*st.p*(1-st.p),3)}</b></div><div class="ro"><span>Desv. σ</span><b>${fmt(Math.sqrt(st.n*st.p*(1-st.p)),3)}</b></div>`,
    formula:(st,pm)=>`P(X = ${st.k}) = C(${st.n},${st.k}) · ${fmt(st.p,2)}<sup>${st.k}</sup> · ${fmt(1-st.p,2)}<sup>${st.n-st.k}</sup> = ${nf(comb(st.n,st.k),0)} · ${fmt(st.p**st.k,5)} · ${fmt((1-st.p)**(st.n-st.k),5)} = <b>${fmt(pm[st.k],4)}</b><br>Excel: =DISTR.BINOM.N(${st.k}; ${st.n}; ${nf(st.p,2)}; FALSO) para “=”, o VERDADERO para “≤”.`});
}
function quizBinom(){
  const n=rint(5,10),p=pick([0.05,0.1,0.15,0.2,0.25,0.3]),k=rint(0,2),pk=binom(k,n,p),p01=binom(0,n,p)+binom(1,n,p);
  const ctx=`Se inspeccionan <b>${n}</b> frascos de una producción grande en la que el <b>${nf(p*100,0)} %</b> sale con mal sellado.`;
  return [
   {type:'num',text:`${ctx} ¿Cuál es la probabilidad de que exactamente <b>${k}</b> estén mal sellados? (cuatro decimales)`,answer:round(pk,4),tol:0.0015,explain:`P(X = ${k}) = C(${n},${k}) · ${nf(p,2)}<sup>${k}</sup> · ${nf(1-p,2)}<sup>${n-k}</sup> = ${nf(comb(n,k),0)} · ${fmt(p**k,5)} · ${fmt((1-p)**(n-k),5)} = <b>${fmt(pk,4)}</b>.`},
   {type:'num',text:`Con los mismos datos, ¿cuál es P(X ≤ 1)? (cuatro decimales)`,answer:round(p01,4),tol:0.0015,explain:`P(X ≤ 1) = P(0) + P(1) = ${fmt(binom(0,n,p),4)} + ${fmt(binom(1,n,p),4)} = <b>${fmt(p01,4)}</b>.`},
   {type:'num',text:`¿Cuántos frascos mal sellados se esperan en promedio en esa muestra? (μ = np)`,unit:'frascos',answer:round(n*p,2),tol:0.011,explain:`μ = ${n} · ${nf(p,2)} = <b>${fmt(n*p,2)}</b>.`},
   {type:'num',text:`¿Cuál es la varianza σ² = np(1 − p)? (tres decimales)`,answer:round(n*p*(1-p),3),tol:0.006,explain:`σ² = ${n} · ${nf(p,2)} · ${nf(1-p,2)} = <b>${fmt(n*p*(1-p),3)}</b>.`},
   {type:'mc',text:'¿Cuál de estas situaciones sigue una distribución binomial?',options:['Contar cuántos de 12 frascos tomados al azar están mal sellados, si el 5 % de la producción sale así','Medir el peso de 12 frascos de mermelada','Contar las colonias de mohos en una placa de 1 mL','Registrar el tiempo hasta que falla una selladora'],answer:0,explain:'Binomial: <b>n ensayos fijos</b>, cada uno con dos resultados (defectuoso / no defectuoso) y la misma p. Contar colonias en un volumen es Poisson; pesos y tiempos son continuos.'},
  ];
}
function simPois(box){
  return simDiscrete(box,{id:'po',init:{l:3,k:2,cond:'eq'},xlabel:'X = colonias por placa',
    params:[{key:'l',label:'Promedio de colonias por placa λ',min:0.5,max:20,step:0.5,fmt:v=>fmt(v,1)}],
    kmax:st=>Math.max(10,Math.ceil(st.l+4*Math.sqrt(st.l))),pmf:(x,st)=>pois(x,st.l),
    context:st=>`En el análisis microbiológico de un yogur, el número de colonias de levaduras por placa (1 mL sembrado) tiene en promedio <b>λ = ${fmt(st.l,1)}</b>. X = colonias que aparecen en una placa.`,
    stats:st=>`<div class="ro"><span>Media μ = λ</span><b>${fmt(st.l,2)}</b></div><div class="ro"><span>Varianza σ² = λ</span><b>${fmt(st.l,2)}</b></div><div class="ro"><span>Desv. σ</span><b>${fmt(Math.sqrt(st.l),3)}</b></div>`,
    formula:(st,pm)=>`P(X = ${st.k}) = e<sup>−${nf(st.l,1)}</sup> · ${nf(st.l,1)}<sup>${st.k}</sup> / ${st.k}! = ${fmt(Math.exp(-st.l),5)} · ${nf(st.l**st.k,3)} / ${nf(fact(st.k),0)} = <b>${fmt(pm[st.k],4)}</b><br>Excel: =POISSON.DIST(${st.k}; ${nf(st.l,1)}; FALSO) para “=”, o VERDADERO para “≤”.`});
}
function quizPois(){
  const l=pick([1.5,2,2.5,3,3.5,4]),fac=pick([2,3,2.5,0.5]),p0=Math.exp(-l),p2=pois(2,l);
  const ctx=`El número de colonias de levaduras por placa (1 mL) de un yogur sigue una distribución de Poisson con <b>λ = ${nf(l,1)}</b>.`;
  return [
   {type:'num',text:`${ctx} ¿Cuál es la probabilidad de que una placa no tenga ninguna colonia? (cuatro decimales)`,answer:round(p0,4),tol:0.0015,explain:`P(X = 0) = e<sup>−${nf(l,1)}</sup> = <b>${fmt(p0,4)}</b>.`},
   {type:'num',text:`Con el mismo λ = ${nf(l,1)}, ¿cuál es P(X = 2)? (cuatro decimales)`,answer:round(p2,4),tol:0.0015,explain:`P(X = 2) = e<sup>−${nf(l,1)}</sup> · ${nf(l,1)}² / 2! = <b>${fmt(p2,4)}</b>.`},
   {type:'num',text:`¿Cuál es la probabilidad de encontrar <b>al menos una</b> colonia? (cuatro decimales)`,answer:round(1-p0,4),tol:0.0015,explain:`P(X ≥ 1) = 1 − P(X = 0) = 1 − ${fmt(p0,4)} = <b>${fmt(1-p0,4)}</b>.`},
   {type:'num',text:`Si en lugar de 1 mL se siembran <b>${nf(fac,1)} mL</b>, ¿cuál es el nuevo λ?`,unit:'colonias',answer:round(l*fac,3),tol:0.011,explain:`λ es proporcional al tamaño del intervalo: ${nf(l,1)} · ${nf(fac,1)} = <b>${nf(l*fac,2)}</b>.`},
   {type:'mc',text:'En una distribución de Poisson con λ = 4, la varianza es…',options:['4','2','16','Depende del número de placas'],answer:0,explain:'En Poisson la media y la varianza son iguales: <b>σ² = λ = 4</b> (y σ = 2).'},
  ];
}

/* ================= Módulo 8: Normal ================= */
function simNormal(box){
  const st={mu:250,sg:2.5,lie:245,lse:255,mode:'out'};
  box.innerHTML=`<p class="ctx">Frascos de mermelada con etiqueta de <b>250 g</b>. El peso de llenado sigue una distribución normal. Ajusta la media y la desviación del proceso y mira qué fracción queda fuera de especificación.</p>
  <div class="ctrls"><label class="ctrl"><span>Media del proceso μ <output id="no-mu-o"></output></span><input type="range" id="no-mu" min="240" max="260" step="0.5" value="250"></label>
  <label class="ctrl"><span>Desviación estándar σ <output id="no-sg-o"></output></span><input type="range" id="no-sg" min="0.5" max="8" step="0.1" value="2.5"></label></div>
  <div class="ctrls"><label class="ctrl"><span>LIE (g)</span><input class="inp mono" id="no-lie" inputmode="decimal" value="245"></label>
  <label class="ctrl"><span>LSE (g)</span><input class="inp mono" id="no-lse" inputmode="decimal" value="255"></label>
  <label class="ctrl" style="flex-basis:240px"><span>Área sombreada</span><select id="no-mode"><option value="out">Fuera de especificación</option><option value="in">Dentro: P(LIE &lt; X &lt; LSE)</option><option value="below">Bajo el LIE: P(X &lt; LIE)</option><option value="above">Sobre el LSE: P(X &gt; LSE)</option></select></label></div>
  <div class="readouts" id="no-ro"></div><div class="chart-wrap" id="no-ch"></div><div class="formula" id="no-fx"></div>`;
  function draw(){
    const {mu,sg}=st;let {lie,lse}=st;$('#no-mu-o',box).textContent=fmt(mu,1)+' g';$('#no-sg-o',box).textContent=fmt(sg,1)+' g';
    if(!(lse>lie)){$('#no-ro',box).innerHTML='<p class="note">El LSE debe ser mayor que el LIE.</p>';return;}
    const z1=(lie-mu)/sg,z2=(lse-mu)/sg,pb=Phi(z1),pa=1-Phi(z2),pin=1-pb-pa;
    const lo=Math.min(230,mu-4*sg),hi=Math.max(270,mu+4*sg),N=240,curve=[];for(let i=0;i<=N;i++){const x=lo+(hi-lo)*i/N;curve.push([x,npdf(x,mu,sg)]);}
    const seg=(a,b)=>{a=Math.max(a,lo);b=Math.min(b,hi);if(b<=a)return[];const p=[];const M=120;for(let i=0;i<=M;i++){const x=a+(b-a)*i/M;p.push([x,npdf(x,mu,sg)]);}return p;};
    const areas=st.mode==='in'?[seg(lie,lse)]:st.mode==='below'?[seg(lo,lie)]:st.mode==='above'?[seg(lse,hi)]:[seg(lo,lie),seg(lse,hi)];
    const P=st.mode==='in'?pin:st.mode==='below'?pb:st.mode==='above'?pa:pb+pa;
    const lab={in:'P(LIE < X < LSE)',below:'P(X < LIE)',above:'P(X > LSE)',out:'P(fuera de espec.)'}[st.mode];
    $('#no-ro',box).innerHTML=`<div class="ro hl"><span>${lab}</span><b>${fmt(P,4)}</b></div><div class="ro"><span>z del LIE</span><b>${fmt(z1,2)}</b></div><div class="ro"><span>z del LSE</span><b>${fmt(z2,2)}</b></div><div class="ro"><span>Fuera de espec. (ppm)</span><b>${Math.round((pb+pa)*1e6).toLocaleString('es-EC')}</b></div>`;
    $('#no-ch',box).innerHTML=chart({W:cw($('#no-ch',box)),xmin:lo,xmax:hi,ymax:npdf(mu,mu,sg)*1.1,yticks:[],ml:18,label:'Curva normal',xlabel:'Peso de llenado (g)',
      areas:areas.map(p=>({pts:p})),curves:[{pts:curve}],vlines:[{x:lie,cls:'acc',label:'LIE'},{x:lse,cls:'acc',label:'LSE'},{x:mu,label:''}]});
    $('#no-fx',box).innerHTML=`z = (x − μ) / σ → z<sub>LIE</sub> = (${nf(lie,2)} − ${nf(mu,1)}) / ${nf(sg,1)} = ${fmt(z1,2)} · z<sub>LSE</sub> = (${nf(lse,2)} − ${nf(mu,1)}) / ${nf(sg,1)} = ${fmt(z2,2)}<br>P(X &lt; LIE) = Φ(${fmt(z1,2)}) = ${fmt(pb,4)} · P(X &gt; LSE) = 1 − Φ(${fmt(z2,2)}) = ${fmt(pa,4)}<br>Excel: =DISTR.NORM.N(${nf(lie,2)}; ${nf(mu,1)}; ${nf(sg,1)}; VERDADERO)`;
  }
  $('#no-mu',box).addEventListener('input',e=>{st.mu=+e.target.value;draw();});
  $('#no-sg',box).addEventListener('input',e=>{st.sg=+e.target.value;draw();});
  ['lie','lse'].forEach(k=>$('#no-'+k,box).addEventListener('input',e=>{const v=parseNum(e.target.value);if(Number.isFinite(v)){st[k]=v;draw();}}));
  $('#no-mode',box).addEventListener('change',e=>{st.mode=e.target.value;draw();});
  draw();return draw;
}
function quizNormal(){
  const c=pick([{name:'frascos de mermelada',u:'g',mu:250},{name:'botellas de jugo',u:'mL',mu:500},{name:'fundas de leche',u:'mL',mu:1000},{name:'barras de chocolate',u:'g',mu:100}]);
  const sg=pick([1.5,2,2.5,3,4]),z1=pick([-1.6,-1.25,-0.8,0.6,1.2,1.5,1.75]),x1=c.mu+z1*sg,z2=pick([0.5,1,1.5,2,2.5]),x2=c.mu+z2*sg,za=pick([0.5,1,1.5,2]),zb=pick([0.5,1,1.5,2]),a=c.mu-za*sg,b=c.mu+zb*sg;
  const ctx=`El contenido de los ${c.name} sigue una distribución normal con <b>μ = ${c.mu} ${c.u}</b> y <b>σ = ${nf(sg,1)} ${c.u}</b>.`;
  const xl='<span class="muted">Puedes usar la tabla Z o Excel: =DISTR.NORM.N(x; μ; σ; VERDADERO).</span>';
  return [
   {type:'num',text:`${ctx} ¿Cuál es el valor z que corresponde a ${nf(x1,3)} ${c.u}? (dos decimales)`,answer:z1,tol:0.011,explain:`z = (${nf(x1,3)} − ${c.mu}) / ${nf(sg,1)} = <b>${fmt(z1,2)}</b>.`},
   {type:'num',text:`¿Qué proporción tiene menos de ${nf(x1,3)} ${c.u}? (cuatro decimales)${xl}`,answer:round(Phi(z1),4),tol:0.005,explain:`P(X &lt; ${nf(x1,3)}) = Φ(${fmt(z1,2)}) = <b>${fmt(Phi(z1),4)}</b>.`},
   {type:'num',text:`¿Qué proporción tiene más de ${nf(x2,3)} ${c.u}? (cuatro decimales)`,answer:round(1-Phi(z2),4),tol:0.005,explain:`z = ${fmt(z2,2)} → P(X &gt; ${nf(x2,3)}) = 1 − Φ(${fmt(z2,2)}) = 1 − ${fmt(Phi(z2),4)} = <b>${fmt(1-Phi(z2),4)}</b>.`},
   {type:'num',text:`¿Qué proporción está entre ${nf(a,3)} y ${nf(b,3)} ${c.u}? (cuatro decimales)`,answer:round(Phi(zb)-Phi(-za),4),tol:0.005,explain:`z₁ = ${fmt(-za,2)}, z₂ = ${fmt(zb,2)} → Φ(${fmt(zb,2)}) − Φ(${fmt(-za,2)}) = ${fmt(Phi(zb),4)} − ${fmt(Phi(-za),4)} = <b>${fmt(Phi(zb)-Phi(-za),4)}</b>.`},
   {type:'mc',text:`Sin hacer cálculos: aproximadamente, ¿qué porcentaje de los ${c.name} tiene un contenido entre μ − 2σ y μ + 2σ?`,options:['95 %','68 %','99,7 %','50 %'],answer:0,explain:'Regla empírica: μ ± 1σ ≈ 68 %, μ ± 2σ ≈ <b>95 %</b>, μ ± 3σ ≈ 99,7 %.'},
  ];
}

/* ================= Módulo 9: TLC ================= */
const POPS={
  exp:{name:'Sesgada: vida útil de un snack (días)',mu:10,sg:10,lo:0,hi:50,draw:()=>-10*Math.log(1-Math.random()),pdf:x=>x<0?0:Math.exp(-x/10)/10},
  uni:{name:'Uniforme: temperatura de cámara de frío (°C)',mu:5,sg:6/Math.sqrt(12),lo:1,hi:9,draw:()=>2+6*Math.random(),pdf:x=>x>=2&&x<=8?1/6:0},
  bim:{name:'Bimodal: peso de mangos de dos fincas (g)',mu:140,sg:Math.sqrt(64+400),lo:90,hi:190,draw:()=>(Math.random()<.5?120:160)+8*randn(),pdf:x=>0.5*npdf(x,120,8)+0.5*npdf(x,160,8)},
};
function simTLC(box){
  const st={pop:'exp',n:5,means:[]};
  box.innerHTML=`<p class="ctx">Elige una población que <b>no</b> es normal. Toma muchas muestras de tamaño n, calcula la media de cada una y observa la forma del histograma de esas medias.</p>
  <div class="ctrls"><label class="ctrl" style="flex-basis:260px"><span>Población</span><select id="tl-pop">${Object.entries(POPS).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select></label>
  <label class="ctrl"><span>Tamaño de cada muestra n <output id="tl-n-o"></output></span><input type="range" id="tl-n" min="1" max="50" step="1" value="5"></label></div>
  <div class="btn-row"><button type="button" class="btn" data-m="1">Tomar 1 muestra</button><button type="button" class="btn" data-m="100">+100 muestras</button><button type="button" class="btn" data-m="1000">+1000</button><button type="button" class="btn btn-ghost" id="tl-r">Reiniciar</button></div>
  <div style="display:grid;gap:4px"><p class="note">Población de origen</p><div class="chart-wrap" id="tl-pc"></div></div>
  <div style="display:grid;gap:4px"><p class="note">Distribución de las medias muestrales x̄ (curva: normal con media μ y error estándar σ/√n)</p><div class="chart-wrap" id="tl-mc"></div></div>
  <div class="readouts" id="tl-ro"></div>`;
  function take(M){const P=POPS[st.pop];let last=[];for(let j=0;j<M;j++){let s=0;last=[];for(let i=0;i<st.n;i++){const x=P.draw();last.push(x);s+=x;}st.means.push(s/st.n);}draw(M===1?last:null);}
  function draw(last){
    const P=POPS[st.pop];$('#tl-n-o',box).textContent=st.n;
    const W=cw($('#tl-pc',box)),pc=[];for(let i=0;i<=200;i++){const x=P.lo+(P.hi-P.lo)*i/200;pc.push([x,P.pdf(x)]);}
    const pmax=Math.max(...pc.map(p=>p[1]))*1.15;
    $('#tl-pc',box).innerHTML=chart({W,H:150,xmin:P.lo,xmax:P.hi,ymax:pmax,yticks:[],ml:18,label:'Población',areas:[{cls:'data',pts:pc}],curves:[{cls:'data',pts:pc}],
      vlines:(last||[]).map(x=>({x,cls:'acc'})).concat([{x:P.mu,label:'μ'}])});
    const B=40,bw=(P.hi-P.lo)/B,cnt=new Array(B).fill(0);st.means.forEach(m=>{const j=Math.floor((m-P.lo)/bw);if(j>=0&&j<B)cnt[j]++;});
    const se=P.sg/Math.sqrt(st.n),M=st.means.length,curve=[];for(let i=0;i<=200;i++){const x=P.lo+(P.hi-P.lo)*i/200;curve.push([x,M*bw*npdf(x,P.mu,se)]);}
    const ymax=Math.max(1,...cnt,M?M*bw*npdf(P.mu,P.mu,se):0)*1.12;
    $('#tl-mc',box).innerHTML=chart({W,xmin:P.lo,xmax:P.hi,ymax,gap:0.5,label:'Histograma de medias muestrales',xlabel:'Media muestral x̄',yfmt:v=>nf(v,0),
      bars:cnt.map((c,j)=>({x0:P.lo+j*bw,x1:P.lo+(j+1)*bw,y:c})),curves:M>=30?[{cls:'acc',pts:curve}]:[]});
    const mm=M?mean(st.means):NaN,sm=M>1?sdev(st.means):NaN;
    $('#tl-ro',box).innerHTML=`<div class="ro"><span>Muestras tomadas</span><b>${M.toLocaleString('es-EC')}</b></div><div class="ro"><span>μ de la población</span><b>${fmt(P.mu,2)}</b></div><div class="ro"><span>Media de las x̄</span><b>${M?fmt(mm,2):'—'}</b></div><div class="ro"><span>σ de la población</span><b>${fmt(P.sg,2)}</b></div><div class="ro hl"><span>Teórico σ/√n</span><b>${fmt(se,3)}</b></div><div class="ro"><span>Desv. de las x̄ observada</span><b>${M>1?fmt(sm,3):'—'}</b></div>`;
  }
  $('#tl-pop',box).addEventListener('change',e=>{st.pop=e.target.value;st.means=[];draw();});
  $('#tl-n',box).addEventListener('input',e=>{st.n=+e.target.value;st.means=[];draw();});
  box.querySelectorAll('[data-m]').forEach(b=>b.addEventListener('click',()=>take(+b.dataset.m)));
  $('#tl-r',box).addEventListener('click',()=>{st.means=[];draw();});
  take(1000);return ()=>draw();
}
function quizTLC(){
  const s=pick([6,8,10,12]),n=pick([4,9,16,25,36]),se=s/Math.sqrt(n);
  const sg=pick([0.3,0.4,0.5]),n2=pick([9,16,25,36]),z=pick([1,1.5,2]),se2=sg/Math.sqrt(n2),x0=3.2+z*se2;
  return [
   {type:'num',text:`La vida útil de un pan tiene σ = ${s} horas. Si se toman muestras de n = ${n} panes, ¿cuál es el <b>error estándar</b> σ/√n de la media muestral?`,unit:'h',answer:round(se,3),tol:0.011,explain:`σ/√n = ${s} / √${n} = ${s} / ${Math.sqrt(n)} = <b>${fmt(se,3)} h</b>.`},
   {type:'mc',text:'Según el Teorema del Límite Central, al aumentar el tamaño de muestra n, la distribución de las medias muestrales…',options:['Se parece cada vez más a una normal y se hace más estrecha','Copia exactamente la forma de la población','Se hace más ancha','Deja de estar centrada en μ'],answer:0,explain:'Las medias se concentran alrededor de μ (error estándar σ/√n, que baja con n) y su forma tiende a la <b>normal</b>, sea cual sea la población.'},
   {type:'num',text:'Para reducir el error estándar a la <b>mitad</b>, ¿por cuántas veces hay que multiplicar el tamaño de muestra n?',unit:'veces',answer:4,tol:0,explain:'σ/√(4n) = (σ/√n) / 2. Hay que <b>cuadruplicar</b> n.'},
   {type:'mc',text:'La población de tiempos de vida útil es muy sesgada a la derecha. ¿Cuándo se puede usar la normal para la media muestral?',options:['Cuando n es suficientemente grande (como regla práctica, n ≥ 30)','Nunca, porque la población no es normal','Solo si n = 1','Solo si la población tiene σ conocida y pequeña'],answer:0,explain:'Esa es la potencia del TLC: con <b>n grande</b> la media muestral es aproximadamente normal aunque la población no lo sea.'},
   {type:'num',text:`El contenido de grasa de una leche tiene μ = 3,2 % y σ = ${nf(sg,1)} %. Se toma una muestra de n = ${n2} fundas. ¿Cuál es P(x̄ &gt; ${nf(x0,3)} %)? (cuatro decimales)`,answer:round(1-Phi(z),4),tol:0.005,explain:`Error estándar = ${nf(sg,1)}/√${n2} = ${fmt(se2,3)}. z = (${nf(x0,3)} − 3,2) / ${fmt(se2,3)} = ${fmt(z,2)}. P = 1 − Φ(${fmt(z,2)}) = <b>${fmt(1-Phi(z),4)}</b>.`},
  ];
}

/* ================= Catálogo de módulos ================= */
const MODS=[
 {id:'variables',n:1,unit:'Estadística descriptiva',title:'Datos y variables',desc:'Población, muestra y tipos de variables.',
  lead:'Antes de calcular nada hay que saber qué se mide, en quién y de qué tipo es el dato. Esa decisión define qué tablas, gráficos y cálculos tienen sentido.',
  idea:`<p>La <b>población</b> es el conjunto completo que nos interesa (todas las latas producidas hoy). La <b>muestra</b> es la parte que realmente medimos (50 latas). Un número que describe a la población es un <b>parámetro</b> (μ, σ); si se calcula con la muestra es un <b>estadístico</b> (x̄, s).</p>
   <p>Cada característica que registramos es una <b>variable</b>:</p>
   <div class="types"><div class="type"><b>Cualitativa nominal</b><span>Categorías sin orden. Ej.: tipo de envase (vidrio, PET, Tetra Pak).</span></div>
   <div class="type"><b>Cualitativa ordinal</b><span>Categorías con orden. Ej.: madurez del banano (verde, pintón, maduro).</span></div>
   <div class="type"><b>Cuantitativa discreta</b><span>Se cuenta; valores enteros. Ej.: colonias en una placa.</span></div>
   <div class="type"><b>Cuantitativa continua</b><span>Se mide; cualquier valor en un intervalo. Ej.: pH, peso, temperatura.</span></div></div>
   <p class="tip">Pregunta rápida: <b>¿lo cuento o lo mido?</b> Si se cuenta, es discreta. Si se mide con un instrumento, es continua.</p>`,
  simHint:'Clasifica variables reales de planta. Puedes seguir todas las veces que quieras.',sim:simVariables,quiz:quizVariables},
 {id:'frecuencias',n:2,unit:'Estadística descriptiva',title:'Tablas de frecuencia e histograma',desc:'Agrupar datos en clases y graficarlos.',
  lead:'Con 60 o 300 pesos sueltos no se ve nada. Agruparlos en clases muestra dónde se concentran los datos y qué tan dispersos están.',
  idea:`<p>Para agrupar datos continuos en una tabla de frecuencias:</p>
   <div class="formula">Número de clases (Sturges): k = 1 + 3,322 · log₁₀(n)<br>Rango: R = x<sub>máx</sub> − x<sub>mín</sub><br>Amplitud: A = R / k (se redondea hacia arriba)</div>
   <ul><li><b>fᵢ</b> frecuencia absoluta: cuántos datos caen en la clase.</li><li><b>Fᵢ</b> absoluta acumulada: cuántos datos hay hasta esa clase.</li><li><b>hᵢ = fᵢ / n</b> frecuencia relativa: proporción de la clase.</li><li><b>Hᵢ</b> relativa acumulada: proporción hasta esa clase.</li><li><b>xᵢ</b> marca de clase: punto medio del intervalo.</li></ul>
   <p>El <b>histograma</b> dibuja fᵢ con barras contiguas porque la variable es continua. Si unes los puntos medios de las barras obtienes el <b>polígono de frecuencias</b>.</p>`,
  simHint:'Todos los cálculos se actualizan en vivo.',sim:simFreq,quiz:quizFreq},
 {id:'centro',n:3,unit:'Estadística descriptiva',title:'Medidas de tendencia central',desc:'Media, mediana y moda.',
  lead:'Un solo número para resumir dónde está el “centro” de los datos. Cuál conviene usar depende de la forma de la distribución y de los valores atípicos.',
  idea:`<div class="formula">Media: x̄ = Σxᵢ / n<br>Mediana: valor central de los datos ordenados (si n es par, promedio de los dos centrales)<br>Moda: valor que más se repite</div>
   <p>La <b>media</b> es el punto de equilibrio de los datos: si cada dato fuera una pesa sobre una regla, la regla se equilibra en x̄. Por eso un solo valor atípico la mueve mucho.</p>
   <p>La <b>mediana</b> solo depende de la posición central: es <b>robusta</b> frente a atípicos. Si media y mediana se separan, la distribución es asimétrica.</p>`,
  simHint:'Arrastra los puntos para cambiar los datos.',sim:simCentral,quiz:quizCentral},
 {id:'dispersion',n:4,unit:'Estadística descriptiva',title:'Medidas de dispersión',desc:'Rango, varianza, desviación, CV y diagrama de caja.',
  lead:'Dos procesos pueden tener la misma media y comportarse muy distinto. La dispersión dice qué tan predecible es el proceso, y eso es lo que decide cuánto producto sale fuera de especificación.',
  idea:`<div class="formula">Rango: R = x<sub>máx</sub> − x<sub>mín</sub><br>Varianza muestral: s² = Σ(xᵢ − x̄)² / (n − 1)<br>Desviación estándar: s = √s²<br>Coeficiente de variación: CV = s / x̄ · 100 %<br>Rango intercuartílico: RIC = Q₃ − Q₁</div>
   <p>La desviación estándar está en las mismas unidades que los datos (mL, g). El <b>CV</b> no tiene unidades, así que sirve para comparar procesos con medias distintas.</p>
   <p>El <b>diagrama de caja</b> resume cinco números: mínimo, Q₁, mediana, Q₃ y máximo. La caja contiene el 50 % central de los datos.</p>`,
  simHint:'Compara dos llenadoras con la misma media.',sim:simDisp,quiz:quizDisp},
 {id:'probabilidad',n:5,unit:'Probabilidad',title:'Probabilidad básica',desc:'Eventos, reglas y ley de los grandes números.',
  lead:'La probabilidad mide qué tan esperable es un resultado. En planta se usa para responder preguntas como: si el 5 % de los frascos sale defectuoso, ¿qué tan raro es encontrar 3 en una muestra?',
  idea:`<p>Un <b>experimento aleatorio</b> tiene resultados que no se pueden predecir con certeza (inspeccionar un frasco). Un <b>evento</b> es un conjunto de resultados (“el frasco es defectuoso”).</p>
   <div class="formula">Clásica: P(A) = casos favorables / casos posibles<br>Complemento: P(A') = 1 − P(A)<br>Suma: P(A ∪ B) = P(A) + P(B) − P(A ∩ B)<br>Condicional: P(A | B) = P(A ∩ B) / P(B)<br>Independencia: P(A | B) = P(A)</div>
   <p><b>Ley de los grandes números:</b> si repites el experimento muchas veces, la frecuencia relativa de un evento se acerca a su probabilidad real. Con pocos datos puede estar lejos.</p>`,
  simHint:'Inspecciona frascos y mira cómo se estabiliza la frecuencia relativa.',sim:simProb,quiz:quizProb},
 {id:'binomial',n:6,unit:'Probabilidad',title:'Distribución binomial',desc:'Contar defectuosos en una muestra de n unidades.',
  lead:'La binomial responde: si tomo n unidades y cada una puede salir defectuosa con probabilidad p, ¿cuántas defectuosas puedo esperar y con qué probabilidad?',
  idea:`<p>Se usa cuando se cumplen tres condiciones: un número <b>fijo de ensayos n</b>, cada ensayo con <b>dos resultados</b> (defectuoso / no defectuoso) y la <b>misma probabilidad p</b> en cada ensayo, de forma independiente.</p>
   <div class="formula">P(X = k) = C(n, k) · p<sup>k</sup> · (1 − p)<sup>n − k</sup><br>C(n, k) = n! / (k! (n − k)!)<br>μ = n·p &nbsp;&nbsp; σ² = n·p·(1 − p)</div>
   <p>En Excel: <span class="data">=DISTR.BINOM.N(k; n; p; FALSO)</span> da P(X = k) y con VERDADERO da P(X ≤ k).</p>`,
  simHint:'Cambia n, p y el evento; las barras resaltadas suman la probabilidad.',sim:simBinom,quiz:quizBinom},
 {id:'poisson',n:7,unit:'Probabilidad',title:'Distribución de Poisson',desc:'Conteos en un intervalo: colonias, quejas, defectos.',
  lead:'Cuando se cuentan sucesos en un intervalo de tiempo, área o volumen (colonias por placa, quejas por día) y no hay un “n” fijo, el modelo natural es Poisson.',
  idea:`<p>Supone que los sucesos ocurren de forma independiente y con una tasa promedio constante <b>λ</b> por intervalo.</p>
   <div class="formula">P(X = k) = e<sup>−λ</sup> · λ<sup>k</sup> / k!<br>μ = λ &nbsp;&nbsp; σ² = λ</div>
   <p>λ es proporcional al tamaño del intervalo: si hay 3 colonias por mL en promedio, en 2 mL se esperan 6.</p>
   <p>En Excel: <span class="data">=POISSON.DIST(k; λ; FALSO)</span>.</p>`,
  simHint:'Mueve λ y observa cómo la distribución se vuelve más simétrica al crecer.',sim:simPois,quiz:quizPois},
 {id:'normal',n:8,unit:'Probabilidad',title:'Distribución normal',desc:'Áreas bajo la curva y especificaciones.',
  lead:'Muchas mediciones de proceso (pesos, volúmenes, temperaturas) se comportan como una campana. Con la normal se calcula qué fracción de la producción cumple las especificaciones.',
  idea:`<p>La normal es simétrica y queda definida por su media <b>μ</b> (dónde está centrada) y su desviación <b>σ</b> (qué tan ancha es). La probabilidad es el <b>área bajo la curva</b>.</p>
   <div class="formula">Estandarización: z = (x − μ) / σ<br>P(X &lt; x) = Φ(z) &nbsp;&nbsp; P(X &gt; x) = 1 − Φ(z)<br>Regla empírica: μ ± 1σ ≈ 68 % · μ ± 2σ ≈ 95 % · μ ± 3σ ≈ 99,7 %</div>
   <p>En Excel: <span class="data">=DISTR.NORM.N(x; μ; σ; VERDADERO)</span> o <span class="data">=DISTR.NORM.ESTAND.N(z; VERDADERO)</span>.</p>`,
  simHint:'Descentra el proceso o aumenta σ y mira cómo crecen las partes por millón fuera de especificación.',sim:simNormal,quiz:quizNormal},
 {id:'tlc',n:9,unit:'Probabilidad',title:'Teorema del Límite Central',desc:'Por qué las medias muestrales son normales.',
  lead:'Este es el puente entre la probabilidad y la inferencia. Explica por qué se puede usar la normal para medias aunque los datos originales no sean normales, y es la base de los gráficos de control X̄.',
  idea:`<p>Si se toman muchas muestras de tamaño n y en cada una se calcula x̄, esas medias forman su propia distribución: la <b>distribución muestral de la media</b>.</p>
   <div class="formula">Media de las x̄ = μ<br>Error estándar = σ / √n<br>Con n suficientemente grande (≈ 30): x̄ ~ Normal(μ, σ/√n)</div>
   <p>Mientras más grande es n, más estrecha es la distribución de las medias: la media de una muestra grande es un estimador más preciso de μ.</p>`,
  simHint:'Prueba con n = 1, luego con n = 5 y n = 30.',sim:simTLC,quiz:quizTLC},
];

const SHORT={'variables': 'Datos y variables', 'frecuencias': 'Frecuencias e histograma', 'centro': 'Tendencia central', 'dispersion': 'Dispersión', 'probabilidad': 'Probabilidad básica', 'binomial': 'Binomial', 'poisson': 'Poisson', 'normal': 'Normal', 'tlc': 'Límite central'};
const NUM={variables:'1.1',frecuencias:'1.2',centro:'1.3',dispersion:'1.4',probabilidad:'2.1',binomial:'2.2',poisson:'2.3',normal:'2.4',tlc:'2.5'};
MODS.forEach(m=>{m.n=NUM[m.id];m.short=SHORT[m.id];});
const META={id:'estadistica',nombre:'Estadística',orden:2,nivel:'Estadística · 2.º semestre',descripcion:'Describe datos de procesos y calcula probabilidades con modelos de distribución.'};
CIMA.addUnit(META,{id:'u1',orden:1,nombre:'Unidad 1 · Estadística descriptiva',topics:MODS.slice(0,4)});
CIMA.addUnit(META,{id:'u2',orden:2,nombre:'Unidad 2 · Probabilidad y distribuciones',topics:MODS.slice(4)});
})();
