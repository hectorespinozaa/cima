/* =====================================================================
   CIMA · FUNDAMENTOS DE MÉTODOS NUMÉRICOS · Unidad 3: Álgebra de funciones
   3.1 Tipos de funciones · 3.2 Operaciones con funciones y composición
   ===================================================================== */
(function(){
"use strict";
const SL=(id,label,min,max,step,val)=>`<label class="ctrl" id="${id}-w"><span>${label} <output id="${id}-o"></output></span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
const lg=(x,b)=>Math.log(x)/Math.log(b);
const bname=b=>b===10?'':b===Math.E?'e':nf(b,2);
const logH=b=>b===Math.E?'ln':`log<sub>${bname(b)}</sub>`;

/* ---------- 3.1 Tipos de funciones ---------- */
const TF={
 lin:{n:'Lineal',p:[['m','Pendiente m',-4,4,0.5,1.5],['b','Intercepto b',-5,5,0.5,1]],f:s=>x=>s.m*x+s.b,eq:s=>`y = ${nf(s.m,2)}x ${s.b<0?'−':'+'} ${nf(Math.abs(s.b),2)}`,
   info:s=>({dom:'ℝ',ran:s.m?'ℝ':`{${nf(s.b,2)}}`,beh:s.m>0?'Crece a ritmo constante':s.m<0?'Decrece a ritmo constante':'Constante',asym:null,key:'Δy constante: cada vez que x aumenta 1, y cambia lo mismo.'})},
 cuad:{n:'Cuadrática',p:[['a','a',-2,2,0.25,0.5],['b','b',-4,4,0.5,-1],['c','c',-5,5,0.5,-2]],f:s=>x=>s.a*x*x+s.b*x+s.c,eq:s=>`y = ${poly([[s.a,2],[s.b,1],[s.c,0]].map(t=>[round(t[0],2),t[1]]))}`,
   info:s=>{const vx=-s.b/(2*s.a||1e-9),vy=s.a*vx*vx+s.b*vx+s.c;return{dom:'ℝ',ran:s.a>0?`[${nf(vy,2)}; ∞)`:s.a<0?`(−∞; ${nf(vy,2)}]`:'—',beh:s.a>0?'Abre hacia arriba (tiene mínimo)':s.a<0?'Abre hacia abajo (tiene máximo)':'Con a = 0 deja de ser cuadrática',asym:null,key:'Δ²y constante: las diferencias de las diferencias son iguales.'};}},
 exp:{n:'Exponencial',p:[['a','Valor inicial a',0.5,5,0.5,1],['r','Base b (factor)',0.2,3,0.1,2]],f:s=>x=>s.a*s.r**x,eq:s=>`y = ${nf(s.a,2)} · ${nf(s.r,2)}<sup>x</sup>`,
   info:s=>({dom:'ℝ',ran:'(0; ∞)',beh:s.r>1?`Crece: se multiplica por ${nf(s.r,2)} en cada paso`:s.r<1?`Decrece: se multiplica por ${nf(s.r,2)} en cada paso`:'Constante (b = 1)',asym:{y:0},key:'Cociente y₂/y₁ constante: en cada paso se multiplica por el mismo factor b.'})},
 log:{n:'Logarítmica',p:[['a','Coeficiente a',-3,3,0.5,2],['bb','Base b',1.5,10,0.5,2]],f:s=>x=>x>0?s.a*lg(x,s.bb):NaN,eq:s=>`y = ${nf(s.a,2)} · log<sub>${nf(s.bb,2)}</sub>(x)`,
   info:s=>({dom:'(0; ∞)',ran:'ℝ',beh:s.a>0?'Crece cada vez más lento':s.a<0?'Decrece cada vez más lento':'Constante',asym:{x:0},key:'Al multiplicar x por la base b, y aumenta siempre lo mismo (a). Es la inversa de la exponencial.'})},
};
const DET=[
 {t:'lin',ctx:'Temperatura (°C) de una mermelada que se enfría, cada 5 min',xs:[0,5,10,15,20],f:()=>{const T0=rint(80,95),r=rint(2,4);return t=>T0-r*t;}},
 {t:'cuad',ctx:'Ingreso diario (USD) según el número de cajas de producto ofertadas (cientos)',xs:[1,2,3,4,5],f:()=>{const a=-rint(2,5),b=rint(30,50),c=rint(0,10);return x=>a*x*x+b*x+c;}},
 {t:'exp',ctx:'Bacterias (UFC/mL) en una leche mal refrigerada, cada hora',xs:[0,1,2,3,4],f:()=>{const a=pick([100,200,500]),r=pick([2,3]);return t=>a*r**t;}},
 {t:'exp',ctx:'Vitamina C restante (mg) en un jugo almacenado, cada semana',xs:[0,1,2,3,4],f:()=>{const a=pick([160,320,640]);return t=>a*0.5**t;}},
 {t:'log',ctx:'Respuesta de un sensor según la concentración de azúcar (g/L)',xs:[1,10,100,1000,10000],f:()=>{const a=rint(2,5),c=rint(1,6);return x=>a*Math.log10(x)+c;}},
 {t:'lin',ctx:'Costo de producción (USD) según los lotes elaborados',xs:[1,2,3,4,5],f:()=>{const F=rint(50,120),v=rint(15,40);return q=>F+v*q;}},
 {t:'cuad',ctx:'Altura (cm) del chorro de una boquilla de lavado a cada distancia (dm)',xs:[0,1,2,3,4],f:()=>{const a=-rint(1,3),b=rint(8,14);return x=>a*x*x+b*x+20;}},
];
const PHREF=[['Limón',2.2],['Vinagre',2.8],['Jugo de naranja',3.6],['Tomate',4.4],['Café',5],['Leche',6.6],['Agua pura',7],['Clara de huevo',8.5]];
function simTipos(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Cuatro familias, cuatro formas de cambiar</h3><p class="ctx">Elige una familia y mueve sus parámetros. Mira la tabla: la columna que se mantiene constante te dice de qué tipo es la función.</p>
    <div class="seg" id="tf-f">${Object.entries(TF).map(([k,v],i)=>`<button type="button" data-f="${k}" aria-pressed="${i===2}">${v.n}</button>`).join('')}</div>
    <div class="ctrls" id="tf-c"></div><div class="expr" id="tf-eq"></div><div class="readouts" id="tf-ro"></div><p class="verdict" id="tf-k"></p>
    <div class="chart-wrap" id="tf-ch"></div><div class="table-wrap"><table class="tbl" id="tf-tb"></table></div></div>
    <div class="part"><h3 class="sub">B. Detective de modelos</h3><p class="ctx">Datos reales de planta. Calcula diferencias (Δy) y cocientes (y₂/y₁) y decide qué tipo de función los describe.</p>
    <p class="var-label" id="dt-ctx"></p><div class="table-wrap"><table class="tbl" id="dt-tb"></table></div>
    <div class="bins">${Object.entries(TF).map(([k,v])=>`<button type="button" class="bin" data-k="${k}"><b style="font-size:16px">${v.n}</b></button>`).join('')}</div>
    <p class="fb" id="dt-fb" aria-live="polite"></p><div class="btn-row"><button type="button" class="btn btn-ghost" id="dt-show">Ver diferencias y cocientes</button><button type="button" class="btn" id="dt-new">Otros datos</button></div></div>
    <div class="part"><h3 class="sub">C. El logaritmo en el laboratorio: el pH</h3><p class="ctx">El pH es un logaritmo: <b>pH = −log[H⁺]</b>. Cada unidad de pH significa <b>10 veces</b> más (o menos) acidez.</p>
    <div class="ctrls">${SL('ph-m','[H⁺] = m × 10<sup>−k</sup> · m',1,9.9,0.1,3.2)}${SL('ph-k','k',1,9,1,4)}</div>
    <div class="readouts" id="ph-ro"></div><div class="chart-wrap" id="ph-ch"></div></div>`;
  const s={fam:'exp',m:1.5,b:1,a:1,c:-2,r:2,bb:2};const T={a:1,b:-1,c:-2};
  function ctrls(){const F=TF[s.fam];$('#tf-c',box).innerHTML=F.p.map(([k,l,mi,ma,st,v])=>SL('tf-'+k,l,mi,ma,st,s.fam==='cuad'&&k in T?T[k]:(s[k]??v))).join('');
    F.p.forEach(([k,,,,,v])=>{const inp=$('#tf-'+k,box);s[k]=+inp.value;inp.addEventListener('input',e=>{s[k]=+e.target.value;if(s.fam==='cuad'&&k in T)T[k]=s[k];draw();});});}
  function draw(){
    const F=TF[s.fam],S=s.fam==='cuad'?{...s,...T}:s;F.p.forEach(([k])=>$(`#tf-${k}-o`,box).textContent=nf(S[k],2));
    const f=F.f(S),I=F.info(S);$('#tf-eq',box).innerHTML=F.eq(S);
    $('#tf-ro',box).innerHTML=`<div class="ro"><span>Dominio</span><b>${I.dom}</b></div><div class="ro"><span>Rango</span><b>${I.ran}</b></div><div class="ro"><span>Comportamiento</span><b style="font-size:14px">${I.beh}</b></div>${I.asym?`<div class="ro"><span>Asíntota</span><b>${I.asym.y!==undefined?'y = 0':'x = 0'}</b></div>`:''}`;
    $('#tf-k',box).innerHTML=`<b>Huella de la familia:</b> ${I.key}`;
    const xs=s.fam==='log'?[1,2,4,8,16]:[0,1,2,3,4],ys=xs.map(f);
    $('#tf-ch',box).innerHTML=plane({W:cw($('#tf-ch',box)),xmin:-5,xmax:17,ymin:-8,ymax:16,curves:[{f}],vlines:I.asym&&I.asym.x!==undefined?[{x:0,cls:'acc'}]:[],
      lines:I.asym&&I.asym.y!==undefined?[{x1:-5,y1:0,x2:17,y2:0,cls:'acc thin dash'}]:[],points:xs.filter((x,i)=>Number.isFinite(ys[i])).map((x,i)=>({x,y:f(x),cls:'data',r:4}))});
    const d1=ys.slice(1).map((y,i)=>y-ys[i]),d2=d1.slice(1).map((d,i)=>d-d1[i]),q=ys.slice(1).map((y,i)=>ys[i]?y/ys[i]:NaN);
    $('#tf-tb',box).innerHTML=`<thead><tr><th>x</th>${xs.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody><tr><td>y</td>${ys.map(y=>`<td>${nf(y,3)}</td>`).join('')}</tr>
      <tr><td>Δy</td><td></td>${d1.map(d=>`<td>${nf(d,3)}</td>`).join('')}</tr><tr><td>Δ²y</td><td></td><td></td>${d2.map(d=>`<td>${nf(d,3)}</td>`).join('')}</tr><tr><td>y₂ / y₁</td><td></td>${q.map(r=>`<td>${nf(r,3)}</td>`).join('')}</tr></tbody>`;
  }
  box.querySelectorAll('#tf-f button').forEach(b=>b.addEventListener('click',()=>{s.fam=b.dataset.f;box.querySelectorAll('#tf-f button').forEach(x=>x.setAttribute('aria-pressed',x===b));ctrls();draw();}));
  // detective
  let P;const bins=[...box.querySelectorAll('.bin')];
  function newD(){const d=pick(DET);P={...d,fn:d.f()};$('#dt-ctx',box).textContent=d.ctx;showT(false);bins.forEach(b=>{b.disabled=false;b.classList.remove('is-ok','is-bad');});$('#dt-fb',box).textContent='¿Qué tipo de función es?';}
  function showT(full){const ys=P.xs.map(P.fn).map(v=>round(v,2)),d1=ys.slice(1).map((y,i)=>round(y-ys[i],2)),q=ys.slice(1).map((y,i)=>round(y/ys[i],3));const d2=d1.slice(1).map((d,i)=>round(d-d1[i],2));
    $('#dt-tb',box).innerHTML=`<thead><tr><th>x</th>${P.xs.map(x=>`<th>${nf(x,0)}</th>`).join('')}</tr></thead><tbody><tr><td>y</td>${ys.map(y=>`<td>${nf(y,2)}</td>`).join('')}</tr>${full?`<tr><td>Δy</td><td></td>${d1.map(v=>`<td>${nf(v,2)}</td>`).join('')}</tr><tr><td>Δ²y</td><td></td><td></td>${d2.map(v=>`<td>${nf(v,2)}</td>`).join('')}</tr><tr><td>y₂ / y₁</td><td></td>${q.map(v=>`<td>${nf(v,3)}</td>`).join('')}</tr>`:''}</tbody>`;}
  const WHY={lin:'las diferencias Δy son constantes.',cuad:'las segundas diferencias Δ²y son constantes.',exp:'los cocientes y₂/y₁ son constantes: se multiplica por el mismo factor.',log:'x se multiplica por 10 en cada paso y y aumenta siempre lo mismo: eso es un logaritmo.'};
  bins.forEach(b=>b.addEventListener('click',()=>{const c=b.dataset.k===P.t;b.classList.add(c?'is-ok':'is-bad');if(!c)bins.find(x=>x.dataset.k===P.t).classList.add('is-ok');bins.forEach(x=>x.disabled=true);showT(true);
    $('#dt-fb',box).innerHTML=`${c?'<strong>Bien.</strong>':'<strong>No exactamente.</strong>'} Es <b>${TF[P.t].n.toLowerCase()}</b>: ${WHY[P.t]}`;}));
  $('#dt-show',box).addEventListener('click',()=>showT(true));$('#dt-new',box).addEventListener('click',newD);
  // pH
  const ph={m:3.2,k:4};
  function drawPH(){const H=ph.m*10**-ph.k,p=-Math.log10(H);$('#ph-m-o',box).textContent=nf(ph.m,1);$('#ph-k-o',box).textContent=ph.k;
    const near=PHREF.reduce((a,b)=>Math.abs(b[1]-p)<Math.abs(a[1]-p)?b:a);
    $('#ph-ro',box).innerHTML=`<div class="ro"><span>[H⁺] (mol/L)</span><b>${nf(ph.m,1)} × 10<sup>−${ph.k}</sup></b></div><div class="ro hl"><span>pH = −log[H⁺]</span><b>${fmt(p,2)}</b></div><div class="ro"><span>Se parece a</span><b style="font-size:15px">${near[0]} (≈ ${nf(near[1],1)})</b></div><div class="ro"><span>Comparado con pH 7</span><b style="font-size:15px">${p<7?nf(10**(7-p),0)+' veces más ácido':p>7?nf(10**(p-7),0)+' veces más básico':'neutro'}</b></div>`;
    const W=cw($('#ph-ch',box));$('#ph-ch',box).innerHTML=chart({W,H:200,xmin:0,xmax:14,ymin:0,ymax:1,yticks:[],ml:18,xticks:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],xlabel:'Escala de pH (valores aproximados de alimentos)',
      vlines:[{x:clamp(p,0,14),cls:'acc',label:'tu muestra: '+fmt(p,2)}],points:PHREF.map(([n,v],i)=>({x:v,y:0.15+(i%3)*0.3,cls:'data',label:n}))});}
  ['m','k'].forEach(k=>$('#ph-'+k,box).addEventListener('input',e=>{ph[k]=+e.target.value;drawPH();}));
  ctrls();draw();newD();drawPH();return()=>{draw();drawPH();};
}
function quizTipos(){
  const qs=[];const d=pick(DET),fn=d.f(),ys=d.xs.map(fn).map(v=>round(v,2));
  qs.push({type:'mc',keepOrder:true,text:`<span>${d.ctx}:</span><div class="table-wrap"><table class="tbl mini"><thead><tr><th>x</th>${d.xs.map(x=>`<th>${nf(x,0)}</th>`).join('')}</tr></thead><tbody><tr><td>y</td>${ys.map(y=>`<td>${nf(y,2)}</td>`).join('')}</tr></tbody></table></div><span>¿Qué tipo de función describe los datos?</span>`,options:['Lineal','Cuadrática','Exponencial','Logarítmica'],answer:['lin','cuad','exp','log'].indexOf(d.t),
    explain:{lin:'Las diferencias Δy son constantes → <b>lineal</b>.',cuad:'Las segundas diferencias son constantes → <b>cuadrática</b>.',exp:'El cociente entre valores consecutivos es constante → <b>exponencial</b>.',log:'x se multiplica por 10 y y sube siempre lo mismo → <b>logarítmica</b>.'}[d.t]});
  const b=pick([2,3,5,10]),k=pick([2,3,4]),neg=Math.random()<0.35;
  qs.push({type:'num',text:`Calcula <span class="data">log<sub>${b}</sub>(${neg?FR(1,b**k):b**k})</span>`,answer:neg?-k:k,tol:0,explain:`${neg?FR(1,b**k):b**k} = ${b}<sup>${neg?'−':''}${k}</sup>, así que el logaritmo es <b>${neg?'−':''}${k}</b>. El logaritmo responde: ¿a qué exponente hay que elevar la base?`});
  const b2=pick([2,3]),k2=rint(3,6);
  qs.push({type:'num',text:`Resuelve <span class="data">${b2}<sup>x</sup> = ${b2**k2}</span>`,answer:k2,tol:0,explain:`${b2**k2} = ${b2}<sup>${k2}</sup> → x = log<sub>${b2}</sub>(${b2**k2}) = <b>${k2}</b>.`});
  const m=round(rnd(1.2,9.5),1),kk=rint(2,8),pH=-Math.log10(m*10**-kk);
  qs.push({type:'num',text:`Un jugo tiene [H⁺] = ${nf(m,1)} × 10<sup>−${kk}</sup> mol/L. ¿Cuál es su pH? (dos decimales)`,answer:round(pH,2),tol:0.011,explain:`pH = −log(${nf(m,1)} × 10<sup>−${kk}</sup>) = ${kk} − log(${nf(m,1)}) = ${kk} − ${fmt(Math.log10(m),3)} = <b>${fmt(pH,2)}</b>.`});
  const L=pick([['log(x · y)','log x + log y',['log x · log y','log(x) + y','x · log y']],['log(x / y)','log x − log y',['log x / log y','log(x − y)','log x + log y']],['log(x<sup>n</sup>)','n · log x',['(log x)<sup>n</sup>','log(n · x)','x · log n']],['log<sub>b</sub>(b)','1',['0','b','10']],['log<sub>b</sub>(1)','0',['1','b','No existe']]]);
  qs.push({type:'mc',mono:true,text:`¿A qué es igual <span class="data">${L[0]}</span>?`,options:[L[1],...L[2]],answer:0,explain:`Propiedad de los logaritmos: ${L[0]} = <b>${L[1]}</b>.`});
  const m0=pick([80,120,200,400]),h=pick([2,3,4,6]),n=rint(2,4),t=h*n;
  qs.push({type:'num',text:`Un conservante se degrada a la mitad cada ${h} meses: C(t) = ${m0} · (½)<sup>t/${h}</sup> mg. ¿Cuánto queda a los ${t} meses?`,unit:'mg',answer:m0/2**n,tol:0.01,explain:`C(${t}) = ${m0} · (½)<sup>${n}</sup> = ${m0} / ${2**n} = <b>${nf(m0/2**n,2)} mg</b>.`});
  return qs;
}

/* ---------- 3.2 Operaciones y composición ---------- */
const FN=[
 {id:'a',h:'2x + 1',t:X=>`2${X} + 1`,f:x=>2*x+1},
 {id:'b',h:'x²',t:X=>`${X}²`,f:x=>x*x},
 {id:'c',h:'x − 3',t:X=>`${X} − 3`,f:x=>x-3},
 {id:'d',h:'√x',t:X=>X==='x'?'√x':`√${X}`,f:x=>x>=0?Math.sqrt(x):NaN},
 {id:'e',h:'1 / x',t:X=>`1 / ${X}`,f:x=>x!==0?1/x:NaN},
 {id:'g',h:'x² − 4',t:X=>`${X}² − 4`,f:x=>x*x-4},
 {id:'h',h:'|x|',t:X=>`|${X.replace(/^\((.*)\)$/,'$1')}|`,f:x=>Math.abs(x)},
];
const OPS={sum:['f + g','(f + g)(x) = f(x) + g(x)'],dif:['f − g','(f − g)(x) = f(x) − g(x)'],mul:['f · g','(f · g)(x) = f(x) · g(x)'],div:['f / g','(f / g)(x) = f(x) / g(x), con g(x) ≠ 0'],fg:['f ∘ g','(f ∘ g)(x) = f(g(x))'],gf:['g ∘ f','(g ∘ f)(x) = g(f(x))']};
const CTX=[
 {n:'Temperatura en °F de una mermelada que se enfría',g:{h:'T(t) = 90 − 1,5t',u:'°C',f:t=>90-1.5*t,in:'t (min)'},f:{h:'F(T) = 1,8T + 32',u:'°F',f:T=>1.8*T+32},xs:[0,60,5,20],comp:'F(T(t)) = 1,8(90 − 1,5t) + 32 = 194 − 2,7t'},
 {n:'Costo según las horas de trabajo de una envasadora',g:{h:'q(h) = 120h',u:'frascos',f:h=>120*h,in:'h (horas)'},f:{h:'C(q) = 0,8q + 50',u:'USD',f:q=>0.8*q+50},xs:[0,10,0.5,4],comp:'C(q(h)) = 0,8(120h) + 50 = 96h + 50'},
];
const wrap=s=>s==='x'?s:`(${s})`;
function simOps(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Combina dos funciones</h3><p class="ctx">Elige f y g y una operación. La curva naranja es el resultado; las azules son f y g. Mueve x para ver el cálculo con números.</p>
    <div class="ctrls"><label class="ctrl"><span>f(x)</span><select id="op-f">${FN.map((F,i)=>`<option value="${i}"${i===0?' selected':''}>${F.h}</option>`).join('')}</select></label><label class="ctrl"><span>g(x)</span><select id="op-g">${FN.map((F,i)=>`<option value="${i}"${i===1?' selected':''}>${F.h}</option>`).join('')}</select></label></div>
    <div class="seg" id="op-o">${Object.entries(OPS).map(([k,v],i)=>`<button type="button" data-o="${k}" aria-pressed="${i===4}">${v[0]}</button>`).join('')}</div>
    <div class="expr" id="op-eq"></div><div class="ctrls">${SL('op-x','Evalúa en x =',-4,4,0.5,2)}</div><div class="formula" id="op-fx"></div><div class="chart-wrap" id="op-ch"></div>
    <p class="note">Ojo: en general f ∘ g ≠ g ∘ f. Prueba las dos con las mismas funciones.</p></div>
    <div class="part"><h3 class="sub">B. La máquina de composición en planta</h3><p class="ctx">En la composición, la salida de una función entra a la otra.</p>
    <div class="seg" id="mc-c">${CTX.map((c,i)=>`<button type="button" data-c="${i}" aria-pressed="${i===0}">${c.n}</button>`).join('')}</div>
    <div class="ctrls" id="mc-sl"></div><div class="machine" id="mc-m"></div><div class="formula" id="mc-fx"></div></div>`;
  const s={f:0,g:1,o:'fg',x:2,c:0,v:20};
  function res(o,f,g){return{sum:x=>f.f(x)+g.f(x),dif:x=>f.f(x)-g.f(x),mul:x=>f.f(x)*g.f(x),div:x=>{const d=g.f(x);return d===0||!Number.isFinite(d)?NaN:f.f(x)/d;},fg:x=>{const u=g.f(x);return Number.isFinite(u)?f.f(u):NaN;},gf:x=>{const u=f.f(x);return Number.isFinite(u)?g.f(u):NaN;}}[o];}
  function sym(o,f,g){const X='x';return{sum:`(${f.h}) + (${g.h})`,dif:`(${f.h}) − (${g.h})`,mul:`(${f.h}) · (${g.h})`,div:`${FR(f.h,g.h)}`,fg:f.t(wrap(g.h)),gf:g.t(wrap(f.h))}[o];}
  function draw(){
    const f=FN[s.f],g=FN[s.g],R=res(s.o,f,g),x=s.x;$('#op-x-o',box).textContent=nf(x,1);
    $('#op-eq',box).innerHTML=`(${OPS[s.o][0]})(x) = ${sym(s.o,f,g)}`;
    const fx=f.f(x),gx=g.f(x),r=R(x),v=n=>Number.isFinite(n)?nf(n,3):'no definido';
    const line={sum:`f(${nf(x,1)}) + g(${nf(x,1)}) = ${v(fx)} + ${v(gx)}`,dif:`f(${nf(x,1)}) − g(${nf(x,1)}) = ${v(fx)} − ${v(gx)}`,mul:`f(${nf(x,1)}) · g(${nf(x,1)}) = ${v(fx)} · ${v(gx)}`,div:`f(${nf(x,1)}) / g(${nf(x,1)}) = ${v(fx)} / ${v(gx)}`,fg:`f(g(${nf(x,1)})) = f(${v(gx)})`,gf:`g(f(${nf(x,1)})) = g(${v(fx)})`}[s.o];
    $('#op-fx',box).innerHTML=`${OPS[s.o][1]}<br>${line} = <b>${v(r)}</b>${!Number.isFinite(r)?' → x no pertenece al dominio de esta operación':''}`;
    $('#op-ch',box).innerHTML=plane({W:cw($('#op-ch',box)),xmin:-6,xmax:6,ymin:-8,ymax:10,curves:[{f:f.f,cls:'thin'},{f:g.f,cls:'thin dash'},{f:R,cls:'acc'}],points:Number.isFinite(r)&&Math.abs(r)<10?[{x,y:r,label:`(${nf(x,1)}; ${nf(r,2)})`}]:[]})+`<div class="legend"><span><i class="lg s0"></i>f(x) = ${f.h}</span><span><i class="lg s0" style="opacity:.5"></i>g(x) = ${g.h} (punteada)</span><span><i class="lg s1"></i>${OPS[s.o][0]}</span></div>`;
  }
  function ctx(){const C=CTX[s.c];$('#mc-sl',box).innerHTML=SL('mc-v',C.g.in,C.xs[0],C.xs[1],C.xs[2],C.xs[3]);s.v=C.xs[3];$('#mc-v',box).addEventListener('input',e=>{s.v=+e.target.value;mach();});mach();}
  function mach(){const C=CTX[s.c],a=s.v,b=C.g.f(a),c=C.f.f(b);$('#mc-v-o',box).textContent=nf(a,2);
    $('#mc-m',box).innerHTML=`<div class="mbox in"><span>Entrada</span><b>${nf(a,2)}</b><small>${C.g.in}</small></div><div class="marrow">→</div><div class="mbox fn"><span>Primera función</span><b>${C.g.h}</b></div><div class="marrow">→</div><div class="mbox in"><span>Sale</span><b>${nf(b,2)}</b><small>${C.g.u}</small></div><div class="marrow">→</div><div class="mbox fn"><span>Segunda función</span><b>${C.f.h}</b></div><div class="marrow">→</div><div class="mbox out"><span>Resultado</span><b>${nf(c,2)}</b><small>${C.f.u}</small></div>`;
    $('#mc-fx',box).innerHTML=`Composición: <b>${C.comp}</b>`;}
  ['f','g'].forEach(k=>$('#op-'+k,box).addEventListener('change',e=>{s[k]=+e.target.value;draw();}));
  box.querySelectorAll('#op-o button').forEach(b=>b.addEventListener('click',()=>{s.o=b.dataset.o;box.querySelectorAll('#op-o button').forEach(x=>x.setAttribute('aria-pressed',x===b));draw();}));
  $('#op-x',box).addEventListener('input',e=>{s.x=+e.target.value;draw();});
  box.querySelectorAll('#mc-c button').forEach(b=>b.addEventListener('click',()=>{s.c=+b.dataset.c;box.querySelectorAll('#mc-c button').forEach(x=>x.setAttribute('aria-pressed',x===b));ctx();}));
  draw();ctx();return draw;
}
function quizOps(){
  const qs=[];const a=rnz(-4,4),b=rint(-6,6),c=rnz(-3,3),d=rint(-5,5),x=rnz(-3,3);
  const f=v=>a*v+b,g=v=>c*v*v+d,fh=poly([[a,1],[b,0]]),gh=poly([[c,2],[d,0]]);
  const def=`Sean <span class="data">f(x) = ${fh}</span> y <span class="data">g(x) = ${gh}</span>.`;
  qs.push({type:'num',text:`${def} Calcula (f + g)(${sg(x)}).`,answer:f(x)+g(x),tol:0,explain:`f(${sg(x)}) = ${sg(f(x))} y g(${sg(x)}) = ${sg(g(x))}; la suma es <b>${sg(f(x)+g(x))}</b>.`});
  qs.push({type:'num',text:`Con las mismas funciones, calcula (f · g)(${sg(x)}).`,answer:f(x)*g(x),tol:0,explain:`${sg(f(x))} · ${ps(g(x))} = <b>${sg(f(x)*g(x))}</b>.`});
  qs.push({type:'num',text:`Calcula f(g(${sg(x)})).`,answer:f(g(x)),tol:0,explain:`Primero g(${sg(x)}) = ${sg(g(x))}; luego f(${sg(g(x))}) = ${sg(a)}·${ps(g(x))} ${b<0?'−':'+'} ${Math.abs(b)} = <b>${sg(f(g(x)))}</b>.`});
  const ok=poly([[a*c,2],[a*d+b,0]]),gfx=poly([[c*a*a,2],[2*c*a*b,1],[c*b*b+d,0]]);
  qs.push({type:'mc',mono:true,text:`¿Cuál es (f ∘ g)(x) = f(g(x))?`,options:uniqOpts(ok,[gfx,poly([[a*c,3],[b*c,2],[a*d,1],[b*d,0]]),poly([[c,2],[a,1],[b+d,0]]),poly([[a*c,2],[d+b,0]])]),answer:0,explain:`f(g(x)) = ${sg(a)}(${gh}) ${b<0?'−':'+'} ${Math.abs(b)} = <b>${ok}</b>. Ojo: g(f(x)) = ${gfx} es distinto.`});
  const k=rnz(-6,6);
  qs.push({type:'num',text:`Si f(x) = ${poly([[1,2],[1,0]])} y g(x) = ${poly([[1,1],[-k,0]])}, ¿qué valor de x se excluye del dominio de f / g?`,answer:k,tol:0,explain:`No se puede dividir para cero: g(x) = 0 cuando x = <b>${sg(k)}</b>.`});
  const hh=rint(2,8),C=CTX[1],q=120*hh,cost=0.8*q+50;
  qs.push({type:'num',text:`Una envasadora llena q(h) = 120h frascos en h horas, y el costo es C(q) = 0,8q + 50 USD. ¿Cuál es el costo de trabajar ${hh} horas, C(q(${hh}))?`,unit:'USD',answer:cost,tol:0.01,explain:`q(${hh}) = ${q} frascos; C(${q}) = 0,8 · ${q} + 50 = <b>${nf(cost,2)} USD</b>. También: C(q(h)) = 96h + 50.`});
  return qs;
}

const MODS=[
 {id:'tipos-funciones',n:'3.1',short:'Tipos de funciones',title:'Tipos de funciones: lineal, cuadrática, exponencial y logarítmica',desc:'Reconocer cada familia por su forma de cambiar; logaritmos y pH.',
  lead:'Cada familia de funciones cambia de una manera propia. Reconocerla en una tabla de datos es el primer paso para modelar un proceso de planta.',
  idea:`<div class="types"><div class="type"><b>Lineal · y = mx + b</b><span>Suma lo mismo en cada paso (Δy constante). Ej.: enfriamiento a ritmo constante.</span></div><div class="type"><b>Cuadrática · y = ax² + bx + c</b><span>El cambio del cambio es constante (Δ²y). Ej.: ingreso con máximo.</span></div>
   <div class="type"><b>Exponencial · y = a·bˣ</b><span>Multiplica por el mismo factor b en cada paso. Ej.: bacterias, vida útil.</span></div><div class="type"><b>Logarítmica · y = log<sub>b</sub>x</b><span>Inversa de la exponencial. Ej.: el pH.</span></div></div>
   <div class="formula">log<sub>b</sub>(x) = y ⟺ b<sup>y</sup> = x<br>log(x·y) = log x + log y · log(x/y) = log x − log y · log(xⁿ) = n·log x<br>log<sub>b</sub>(b) = 1 · log<sub>b</sub>(1) = 0 · pH = −log[H⁺]</div>`,
  simHint:'Compara las cuatro familias, identifica modelos en datos reales y calcula el pH.',sim:simTipos,quiz:quizTipos},
 {id:'operaciones-funciones',n:'3.2',short:'Operaciones con funciones',title:'Operaciones con funciones y composición',desc:'Suma, resta, producto, cociente y composición de funciones.',
  lead:'Las funciones se pueden combinar como los números. La composición es la más útil en ingeniería: encadena procesos, como convertir unidades o calcular el costo según el tiempo de trabajo.',
  idea:`<div class="formula">(f + g)(x) = f(x) + g(x) · (f − g)(x) = f(x) − g(x)<br>(f · g)(x) = f(x)·g(x) · (f / g)(x) = f(x) / g(x), con g(x) ≠ 0<br>(f ∘ g)(x) = f(g(x)): primero g, después f</div>
   <ul><li>El <b>dominio</b> de f / g excluye los valores donde g(x) = 0.</li><li>En la composición, el orden importa: en general <b>f(g(x)) ≠ g(f(x))</b>.</li><li>Para componer, reemplaza cada x de f por la expresión completa de g.</li></ul>`,
  simHint:'Combina funciones, mira el resultado en la gráfica y usa la máquina de composición.',sim:simOps,quiz:quizOps},
];
CIMA.addUnit(META_MN,{id:'u3',orden:3,nombre:'Unidad 3 · Álgebra de funciones',topics:MODS});
})();
