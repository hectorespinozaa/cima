/* =====================================================================
   CIMA · Materia: FUNDAMENTOS DE MÉTODOS NUMÉRICOS (IA-102)
   Unidad 1: Fundamentos del álgebra · Unidad 2: Gráficas, ecuaciones y desigualdades
   ===================================================================== */
const META_MN={id:'metodos',nombre:'Fundamentos de Métodos Numéricos',orden:1,nivel:'Métodos Numéricos · 1.er nivel',descripcion:'Álgebra, gráficas, ecuaciones y desigualdades: la base de todo cálculo en ingeniería.'};
(function(){
"use strict";
/* ===================== UNIDAD 1: FUNDAMENTOS DEL ÁLGEBRA ===================== */
const CONFIG={storeKey:'tn-u1-v1',prefix:'MN1',salt:'tn-u1-alimentos-2026',unitName:'Unidad 1 · Fundamentos del álgebra',
  home:{eyebrow:'Fundamentos de Métodos Numéricos · Unidad 1',h1:'Fundamentos del álgebra',
    lead:'Cuatro temas para dominar la herramienta básica de todo cálculo en ingeniería: los números reales, los polinomios, las potencias y la simplificación de expresiones.'}};
const xp=n=>n===1?'x':`x<sup>${n}</sup>`;

/* ---------- 1.1 Números reales ---------- */
const SETS={N:{sym:'ℕ',name:'Naturales'},Z:{sym:'ℤ',name:'Enteros'},Q:{sym:'ℚ',name:'Racionales'},I:{sym:'I',name:'Irracionales'}};
const SK=['N','Z','Q','I'];
const NUMS=[
 {h:'12',t:'12',set:'N',ctx:'latas en una caja',why:'sirve para contar: 1, 2, 3, …'},
 {h:'−18',t:'−18',set:'Z',ctx:'temperatura de un congelador, en °C',why:'es un entero negativo; no es natural.'},
 {h:FR(3,4),t:'3/4',set:'Q',ctx:'taza de azúcar en una receta',why:'es un cociente de dos enteros.'},
 {h:'6,5',t:'6,5',set:'Q',ctx:'pH de la leche fresca',why:'es un decimal finito: 6,5 = 13/2.'},
 {h:'0,333…',t:'0,333…',set:'Q',ctx:'decimal periódico',why:'todo decimal periódico es una fracción: 0,333… = 1/3.'},
 {h:RAD(2),t:'√2',set:'I',ctx:'diagonal de un cuadrado de lado 1',why:'su expansión decimal es infinita y no periódica: 1,41421…'},
 {h:'π',t:'π',set:'I',ctx:'área de la tapa de una lata: A = πr²',why:'π = 3,14159… no se puede escribir como fracción.'},
 {h:RAD(16),t:'√16',set:'N',ctx:'raíz exacta',why:'√16 = 4, que es un número natural.'},
 {h:'−'+RAD(9),t:'−√9',set:'Z',ctx:'raíz exacta con signo',why:'−√9 = −3, un entero negativo.'},
 {h:FR(22,7),t:'22/7',set:'Q',ctx:'aproximación de π',why:'es un cociente de enteros; se parece a π, pero no es π.'},
 {h:'e',t:'e',set:'I',ctx:'base del crecimiento continuo, 2,71828…',why:'su expansión decimal no termina ni se repite.'},
 {h:'−2,75',t:'−2,75',set:'Q',ctx:'variación de peso de una muestra, en g',why:'−2,75 = −11/4.'},
 {h:RAD(FR(4,9)),t:'√(4/9)',set:'Q',ctx:'raíz de una fracción',why:'√(4/9) = 2/3.'},
 {h:'0,1010010001…',t:'0,1010…',set:'I',ctx:'el patrón crece y nunca se repite igual',why:'no es periódico, así que no es una fracción.'},
 {h:FR(15,3),t:'15/3',set:'N',ctx:'fracción que da exacto',why:'15/3 = 5.'},
 {h:'−40',t:'−40',set:'Z',ctx:'temperatura en un túnel de congelación, °C',why:'es un entero negativo.'},
 {h:RAD(3),t:'√3',set:'I',ctx:'raíz no exacta',why:'3 no es un cuadrado perfecto, así que √3 = 1,7320… es irracional.'},
 {h:'0,25',t:'0,25',set:'Q',ctx:'fracción de lote rechazado',why:'0,25 = 1/4.'},
];
function eulerSVG(W,active,dots){
  const H=W<520?250:232,f1=v=>v.toFixed(1);
  const Q={x:14,y:30,w:(W-4)*0.64-14,h:H-44};const I={x:Q.x+Q.w+12,y:30,w:W-14-(Q.x+Q.w+12),h:H-44};
  const Z={x:Q.x+12,y:Q.y+28,w:Q.w*0.66,h:Q.h-40};const N={x:Z.x+12,y:Z.y+28,w:Z.w*0.58,h:Z.h-40};
  const free={N:{x:N.x+10,y:N.y+30,w:N.w-20,h:N.h-40},Z:{x:N.x+N.w+10,y:Z.y+30,w:Z.x+Z.w-(N.x+N.w)-20,h:Z.h-40},
    Q:{x:Z.x+Z.w+10,y:Q.y+30,w:Q.x+Q.w-(Z.x+Z.w)-20,h:Q.h-40},I:{x:I.x+10,y:I.y+30,w:I.w-20,h:I.h-40}};
  const lab=(r,k)=>`<text class="rgl" x="${f1(r.x+10)}" y="${f1(r.y+19)}">${SETS[k].sym}${r.w>110?` <tspan class="rgs">${SETS[k].name}</tspan>`:''}</text>`;
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="chart" role="img" aria-label="Diagrama de conjuntos numéricos">`;
  s+=`<rect class="rg" x="2" y="2" width="${W-4}" height="${H-4}" rx="12"/><text class="rgl" x="12" y="20">ℝ <tspan class="rgs">Reales</tspan></text>`;
  [[Q,'Q'],[I,'I'],[Z,'Z'],[N,'N']].forEach(([r,k])=>{s+=`<rect class="rg${active===k?' on':''}" x="${f1(r.x)}" y="${f1(r.y)}" width="${f1(r.w)}" height="${f1(r.h)}" rx="10"/>`+lab(r,k);});
  dots.forEach((d,i)=>{const a=free[d.k];const x=a.x+d.rx*Math.max(4,a.w),y=a.y+d.ry*Math.max(4,a.h);
    s+=`<circle class="ndot${i===dots.length-1?' last':''}" cx="${f1(x)}" cy="${f1(y)}" r="4.5"/><text class="ntx" x="${f1(x+7)}" y="${f1(y+4)}">${d.t}</text>`;});
  return s+'</svg>';
}
/* Jerarquía de operaciones */
const N_=v=>({t:'n',v}),O_=v=>({t:'o',v}),G_=(items,br='(')=>({t:'g',br,items}),P_=(b,e)=>({t:'p',b,e});
function stripHl(items){return items.map(it=>it.t==='n'?{t:'n',v:it.v}:it.t==='g'?{...it,items:stripHl(it.items)}:it.t==='p'?{...it,b:stripHl([it.b])[0]}:it);}
function stepOnce(items){
  for(let i=0;i<items.length;i++){const it=items[i];
    if(it.t==='g'){const r=stepOnce(it.items),c=items.slice(),one=r.items.length===1;c[i]=one?{t:'n',v:r.items[0].v,hl:true}:{...it,items:r.items};
      return{items:c,note:'Dentro del signo de agrupación. '+r.note+(one?' Se quitan los signos de agrupación.':'')};}
    if(it.t==='p'&&it.b.t==='g'){const r=stepOnce([it.b]),c=items.slice();c[i]={...it,b:r.items[0]};return{items:c,note:r.note};}
  }
  for(let i=0;i<items.length;i++){const it=items[i];if(it.t==='p'){const v=it.b.v**it.e,c=items.slice();c[i]={t:'n',v,hl:true};return{items:c,note:`Potencia: ${ps(it.b.v)}<sup>${it.e}</sup> = ${sg(v)}.`};}}
  let j=items.findIndex(it=>it.t==='o'&&(it.v==='×'||it.v==='÷')),kind='Multiplicación o división, de izquierda a derecha';
  if(j<0){j=items.findIndex(it=>it.t==='o');kind='Suma o resta, de izquierda a derecha';}
  const a=items[j-1].v,b=items[j+1].v,op=items[j].v,v=op==='×'?a*b:op==='÷'?a/b:op==='+'?a+b:a-b;
  return{items:items.slice(0,j-1).concat([{t:'n',v,hl:true}],items.slice(j+2)),note:`${kind}: ${ps(a)} ${op} ${ps(b)} = ${sg(v)}.`};
}
function rx(items){return items.map((it,i)=>{
  if(it.t==='n'){const s=it.v<0&&i>0?`(${sg(it.v)})`:sg(it.v);return`<span class="tok${it.hl?' hl':''}">${s}</span>`;}
  if(it.t==='o')return`<span class="op">${it.v}</span>`;
  if(it.t==='g'){const [o,c]=it.br==='['?['[',']']:['(',')'];return`${o}${rx(it.items)}${c}`;}
  const base=it.b.t==='g'?rx([it.b]):`<span class="tok${it.b.hl?' hl':''}">${it.b.v<0?`(${sg(it.b.v)})`:sg(it.b.v)}</span>`;return`${base}<sup>${it.e}</sup>`;
}).join('');}
function hlVals(items,out=[]){items.forEach(it=>{if(it.t==='n'&&it.hl)out.push(it.v);if(it.t==='g')hlVals(it.items,out);if(it.t==='p')hlVals([it.b],out);});return out;}
const GENS=[
 ()=>{const c=rint(5,15);return[N_(rint(2,20)),O_('+'),N_(rint(2,9)),O_('×'),G_([N_(c),O_('−'),N_(rint(1,c-1))])];},
 ()=>{const s=rint(2,7),c=pick([2,3,4,6,8,9,12,16].filter(x=>(s*s)%x===0).concat([s])),a=rint(1,s-1);return[P_(G_([N_(a),O_('+'),N_(s-a)]),2),O_('÷'),N_(c),O_('−'),N_(rint(1,20))];},
 ()=>{const c=rint(2,6);return[N_(rint(20,60)),O_('−'),N_(c*rint(2,9)),O_('÷'),N_(c),O_('×'),N_(rint(2,5)),O_('+'),P_(N_(rint(2,5)),2)];},
 ()=>{const e=rint(2,5),a=rint(2,6),b=rint(1,8),c=rint(1,8),prod=a*(b+c);let d=prod%e+e*rint(0,2);if(d===0)d=e;if(d>=prod)d=prod%e||e;return[G_([N_(a),O_('×'),G_([N_(b),O_('+'),N_(c)]),O_('−'),N_(d)],'['),O_('÷'),N_(e)];},
 ()=>[P_(N_(rint(2,4)),3),O_('−'),G_([N_(rint(1,9)),O_('−'),N_(rint(2,5)),O_('×'),N_(rint(2,5))]),O_('+'),N_(rint(1,15))],
 ()=>{const e=rint(2,5);return[P_(G_([N_(rint(2,9)),O_('−'),N_(rint(5,12))]),2),O_('+'),N_(e*rint(1,4)),O_('×'),N_(rint(2,6)),O_('÷'),N_(e)];},
];
function genExpr(){for(let k=0;k<200;k++){const items=pick(GENS)();let cur=items;const steps=[{items,note:''}];let ok=true;
  while(!(cur.length===1&&cur[0].t==='n')){const r=stepOnce(stripHl(cur));const hv=hlVals(r.items);if(hv.some(v=>!Number.isInteger(v)||Math.abs(v)>5000)){ok=false;break;}steps.push(r);cur=r.items;if(steps.length>30){ok=false;break;}}
  if(ok)return{items,steps,value:cur[0].v};}}
function simReales(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. ¿Dónde vive este número?</h3><p class="ctx">Ubica cada número en el conjunto <b>más pequeño</b> al que pertenece. Recuerda: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ, y los irracionales (I) son los reales que no son racionales.</p>
    <div class="sorter"><div class="var-card"><p class="var-label">Número</p><p class="var-name" id="re-n"></p><p class="var-ej" id="re-c"></p></div>
    <div class="bins">${SK.map(k=>`<button type="button" class="bin" data-k="${k}"><b>${SETS[k].sym}</b><span>${SETS[k].name}</span></button>`).join('')}</div>
    <p class="fb" id="re-fb" aria-live="polite"></p><div class="chart-wrap" id="re-eu"></div>
    <div class="sorter-foot"><span class="note" id="re-t"></span><button type="button" class="btn" id="re-next">Siguiente número</button></div></div></div>
    <div class="part"><h3 class="sub">B. Jerarquía de operaciones, paso a paso</h3><p class="ctx">Orden: <b>1</b> signos de agrupación · <b>2</b> potencias y raíces · <b>3</b> multiplicaciones y divisiones (de izquierda a derecha) · <b>4</b> sumas y restas (de izquierda a derecha). Antes de cada paso, intenta adivinar qué operación va primero.</p>
    <div class="expr" id="op-e"></div><ol class="steps-list" id="op-s"></ol>
    <div class="btn-row"><button type="button" class="btn" id="op-next">Siguiente paso</button><button type="button" class="btn btn-ghost" id="op-all">Ver todos</button><button type="button" class="btn btn-ghost" id="op-new">Otra expresión</button></div></div>`;
  let deck=shuffle(NUMS),i=0,ok=0,tot=0,active=null;const dots=[];const bins=[...box.querySelectorAll('.bin')],next=$('#re-next',box);
  const drawE=()=>{$('#re-eu',box).innerHTML=eulerSVG(cw($('#re-eu',box)),active,dots);};
  function show(){const n=deck[i%deck.length];$('#re-n',box).innerHTML=n.h;$('#re-c',box).textContent=n.ctx;$('#re-fb',box).textContent='Elige un conjunto.';
    bins.forEach(b=>{b.disabled=false;b.classList.remove('is-ok','is-bad');});next.disabled=true;$('#re-t',box).textContent=`Aciertos: ${ok} de ${tot}`;active=null;drawE();}
  bins.forEach(b=>b.addEventListener('click',()=>{const n=deck[i%deck.length],c=b.dataset.k===n.set;tot++;if(c)ok++;
    b.classList.add(c?'is-ok':'is-bad');if(!c)bins.find(x=>x.dataset.k===n.set).classList.add('is-ok');bins.forEach(x=>x.disabled=true);
    $('#re-fb',box).innerHTML=`${c?'<strong>Bien.</strong>':'<strong>No exactamente.</strong>'} Va en <b>${SETS[n.set].sym} ${SETS[n.set].name}</b>: ${n.why}${n.set==='N'?' Como ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ, también es entero, racional y real.':n.set==='Z'?' También es racional y real.':' También es real.'}`;
    active=n.set;dots.push({k:n.set,t:n.t,rx:Math.random(),ry:Math.random()});if(dots.length>10)dots.shift();drawE();
    $('#re-t',box).textContent=`Aciertos: ${ok} de ${tot}`;next.disabled=false;next.focus();}));
  next.addEventListener('click',()=>{i++;if(i%deck.length===0)deck=shuffle(NUMS);show();});
  let E,k;
  const renderOp=()=>{const cur=E.steps[k].items;$('#op-e',box).innerHTML=rx(cur);
    $('#op-s',box).innerHTML=E.steps.slice(1,k+1).map(s=>`<li><span class="s-expr">${rx(s.items)}</span><span class="s-note">${s.note}</span></li>`).join('');
    const done=k===E.steps.length-1;$('#op-next',box).disabled=done;$('#op-all',box).disabled=done;
    if(done)$('#op-s',box).insertAdjacentHTML('beforeend',`<li><b>Resultado: ${sg(E.value)}</b></li>`);};
  const newOp=()=>{E=genExpr();k=0;renderOp();};
  $('#op-next',box).addEventListener('click',()=>{k++;renderOp();});
  $('#op-all',box).addEventListener('click',()=>{k=E.steps.length-1;renderOp();});
  $('#op-new',box).addEventListener('click',newOp);
  show();newOp();return drawE;
}
const PROPS=[
 {e:'3 · (x + 2) = 3x + 6',p:4},{e:'4 · (a − b) = 4a − 4b',p:4},{e:'7 + 4 = 4 + 7',p:0},{e:'2a · b = b · 2a',p:0},
 {e:'(2 · 5) · 9 = 2 · (5 · 9)',p:1},{e:'(x + 3) + 2 = x + (3 + 2)',p:1},{e:'x + 0 = x',p:2},{e:'5 · 1 = 5',p:2},
 {e:`8 · ${FR(1,8)} = 1`,p:3},{e:'a + (−a) = 0',p:3}];
const PNAMES=['Conmutativa','Asociativa','Elemento neutro','Elemento inverso','Distributiva'];
function quizReales(){
  const qs=shuffle(NUMS).slice(0,2).map(n=>({type:'mc',keepOrder:true,text:`¿Cuál es el conjunto <b>más pequeño</b> al que pertenece <span class="data">${n.h}</span>?`,options:SK.map(k=>`${SETS[k].sym} ${SETS[k].name}`),answer:SK.indexOf(n.set),explain:`Pertenece a <b>${SETS[n.set].name}</b>: ${n.why}`}));
  const E=genExpr();
  qs.push({type:'num',text:`<span>Resuelve respetando la jerarquía de operaciones:</span><div class="expr">${rx(E.items)}</div>`,answer:E.value,tol:0,explain:`${E.steps.slice(1).map(s=>s.note).join(' ')} Resultado: <b>${sg(E.value)}</b>.`});
  const P=pick(PROPS);
  qs.push({type:'mc',keepOrder:true,text:`¿Qué propiedad se aplica en <span class="data">${P.e}</span>?`,options:PNAMES,answer:P.p,explain:`Es la propiedad <b>${PNAMES[P.p].toLowerCase()}</b>.`});
  const dens=[2,3,4,5,6,8];let b,d;do{b=pick(dens);d=pick(dens);}while(b===d);const a=rint(1,b-1),c=rint(1,d-1),L=b*d/gcd(b,d),n=a*(L/b)+c*(L/d);
  qs.push({type:'num',ph:'Ej.: 17/12',text:`Una receta lleva ${FR(a,b)} taza de leche y ${FR(c,d)} taza de agua. ¿Cuántas tazas de líquido hay en total? (puedes responder con fracción o decimal)`,unit:'tazas',answer:n/L,tol:0.002,explain:`Común denominador ${L}: ${FR(a*(L/b),L)} + ${FR(c*(L/d),L)} = ${FR(n,L)}${gcd(n,L)>1?` = ${fracStr(n,L)}`:''} ≈ ${fmt(n/L,3)} tazas.`});
  const combos=[];[3,6,9,12,15].forEach(V=>[[3,4],[3,8],[2,5],[1,4],[3,5],[2,3]].forEach(([p,q])=>{if((V*q)%p===0)combos.push([V,p,q]);}));const [V,p,q]=pick(combos);
  qs.push({type:'num',text:`¿Cuántos frascos de ${FR(p,q)} L se llenan con ${V} L de mermelada?`,unit:'frascos',answer:V*q/p,tol:0,explain:`${V} ÷ ${FR(p,q)} = ${V} · ${FR(q,p)} = ${FR(V*q,p)} = <b>${V*q/p}</b> frascos. Dividir entre una fracción es multiplicar por su recíproco.`});
  return qs;
}

/* ---------- 1.2 Polinomios y factorización ---------- */
function tilesSVG(W,p,q){
  const L=Math.round(clamp(W*0.3,100,170)),u=Math.round(clamp((W-100-L)/6.5,12,28)),ox=52,oy=34,w=L+p*u,h=L+q*u,H=oy+h+16,f1=v=>v.toFixed(1);
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="chart" role="img" aria-label="Modelo de área de (x + ${p})(x + ${q})">`;
  s+=`<rect class="tile-x2" x="${ox}" y="${oy}" width="${L}" height="${L}" rx="4"/><text class="tl" x="${f1(ox+L/2)}" y="${f1(oy+L/2+5)}" text-anchor="middle">x²</text>`;
  for(let i=0;i<p;i++)s+=`<rect class="tile-x" x="${ox+L+i*u}" y="${oy}" width="${u}" height="${L}" rx="3"/>`;
  for(let j=0;j<q;j++)s+=`<rect class="tile-x" x="${ox}" y="${oy+L+j*u}" width="${L}" height="${u}" rx="3"/>`;
  for(let i=0;i<p;i++)for(let j=0;j<q;j++)s+=`<rect class="tile-1" x="${ox+L+i*u}" y="${oy+L+j*u}" width="${u}" height="${u}" rx="2"/>`;
  s+=`<text class="dim" x="${f1(ox+L/2)}" y="${oy-10}" text-anchor="middle">x</text><text class="dim" x="${f1(ox+L+p*u/2)}" y="${oy-10}" text-anchor="middle">+ ${p}</text>`;
  s+=`<text class="dim" x="${ox-10}" y="${f1(oy+L/2+4)}" text-anchor="end">x</text><text class="dim" x="${ox-10}" y="${f1(oy+L+q*u/2+4)}" text-anchor="end">+ ${q}</text>`;
  const lx=ox+w+20;if(lx+90<W){[['tile-x2','x²  (x·x)'],['tile-x','x   (x·1)'],['tile-1','1   (1·1)']].forEach(([c,t],k)=>{s+=`<rect class="${c}" x="${lx}" y="${oy+k*26}" width="16" height="16" rx="3"/><text class="dim" x="${lx+24}" y="${oy+k*26+13}">${t}</text>`;});}
  return s+'</svg>';
}
const CASES={comun:'Factor común',dif:'Diferencia de cuadrados',tcp:'Trinomio cuadrado perfecto',trin:'Trinomio x² + bx + c',trinA:'Trinomio ax² + bx + c'};
const CK=Object.keys(CASES);
function pairsHtml(c,b){const out=[];for(let d=1;d*d<=Math.abs(c);d++){if(Math.abs(c)%d)continue;const e=Math.abs(c)/d;const cand=c>0?[[d,e],[-d,-e]]:[[d,-e],[-d,e]];cand.forEach(([u,v])=>out.push(`${ps(u)}·${ps(v)} → suma ${sg(u+v)}${u+v===b?' ✓':''}`));}return out.join(' · ');}
const FACT={
 comun:()=>{const g=rint(2,6);let a,b;do{a=rint(1,5);b=rnz(-7,7);}while(gcd(a,b)!==1);const n=rint(1,2),m=n+rint(1,2),F=`${g}${xp(n)}(${poly([[a,m-n],[b,0]])})`;
  return{p:poly([[g*a,m],[g*b,n]]),ans:F,steps:[`Máximo común divisor de los coeficientes ${g*a} y ${Math.abs(g*b)}: <b>${g}</b>.`,`Variable con el <b>menor exponente</b>: ${xp(n)}.`,`Factor común: <b>${g}${xp(n)}</b>. Divide cada término entre él: ${poly([[g*a,m]])} ÷ ${g}${xp(n)} = ${poly([[a,m-n]])} y ${poly([[g*b,n]])} ÷ ${g}${xp(n)} = ${sg(b)}.`,`Resultado: <b>${F}</b>`]};},
 dif:()=>{let a,b;do{a=rint(1,4);b=rint(1,9);}while(gcd(a,b)!==1);const F=`${lin(a,-b)}${lin(a,b)}`;
  return{p:poly([[a*a,2],[-b*b,0]]),ans:F,steps:['Son dos términos separados por un signo menos: puede ser una diferencia de cuadrados.',`Raíz de cada término: ${RAD(`${a*a===1?'':a*a}x²`)} = ${poly([[a,1]])} y ${RAD(b*b)} = ${b}.`,'Aplica a² − b² = (a − b)(a + b).',`Resultado: <b>${F}</b>`]};},
 tcp:()=>{let a,k;do{a=pick([1,1,2,3]);k=rint(1,9);}while(gcd(a,k)!==1);const s=pick([1,-1]),F=`${lin(a,s*k)}²`;
  return{p:poly([[a*a,2],[2*a*k*s,1],[k*k,0]]),ans:F,steps:[`Los extremos son cuadrados perfectos: ${RAD(`${a*a===1?'':a*a}x²`)} = ${poly([[a,1]])} y ${RAD(k*k)} = ${k}.`,`Comprueba el término central: 2 · (${poly([[a,1]])}) · ${k} = ${poly([[2*a*k,1]])} ✓`,`El término central es ${s<0?'negativo, así que el binomio lleva −':'positivo, así que el binomio lleva +'}.`,`Resultado: <b>${F}</b>`]};},
 trin:()=>{let p,q;do{p=rnz(-9,9);q=rnz(-9,9);}while(p+q===0);const b=p+q,c=p*q,F=`${lin(1,p)}${lin(1,q)}`;
  return{p:poly([[1,2],[b,1],[c,0]]),ans:F,steps:[`Busca dos números que <b>multiplicados</b> den ${sg(c)} y <b>sumados</b> den ${sg(b)}.`,`Pares con producto ${sg(c)}: ${pairsHtml(c,b)}`,`Los números son <b>${sg(p)}</b> y <b>${sg(q)}</b>.`,`Resultado: <b>${F}</b>. Compruébalo multiplicando.`]};},
 trinA:()=>{let m,n,p,q;do{m=pick([1,2,3]);n=pick([2,3]);p=rnz(-5,5);q=rnz(-5,5);}while(gcd(m,p)!==1||gcd(n,q)!==1||m*q+n*p===0);
  const a=m*n,b=m*q+n*p,c=p*q,F=`${lin(m,p)}${lin(n,q)}`;
  return{p:poly([[a,2],[b,1],[c,0]]),ans:F,steps:[`Método ac: multiplica a · c = ${a} · ${ps(c)} = ${sg(a*c)}.`,`Busca dos números con producto ${sg(a*c)} y suma ${sg(b)}: <b>${sg(m*q)}</b> y <b>${sg(n*p)}</b>.`,`Separa el término central: ${poly([[a,2],[m*q,1],[n*p,1],[c,0]])}`,`Agrupa de dos en dos y saca factor común: ${m===1?'':m}x${lin(n,q)} ${p<0?'−':'+'} ${Math.abs(p)}${lin(n,q)}`,`Resultado: <b>${F}</b>`]};},
};
function simPoli(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Multiplicar es construir un rectángulo</h3><p class="ctx">El producto (x + p)(x + q) es el área de un rectángulo de lados x + p y x + q. Cuenta las piezas: 1 cuadrado x², (p + q) tiras x y p·q cuadritos de 1.</p>
    <div class="ctrls"><label class="ctrl"><span>p <output id="ti-p-o"></output></span><input type="range" id="ti-p" min="1" max="6" step="1" value="3"></label><label class="ctrl"><span>q <output id="ti-q-o"></output></span><input type="range" id="ti-q" min="1" max="6" step="1" value="2"></label>
    <button type="button" class="btn btn-ghost" id="ti-reto">Modo reto: factorizar</button></div>
    <p class="verdict" id="ti-goal" hidden></p><div class="chart-wrap" id="ti-ch"></div><div class="steps" id="ti-tx" style="font-family:var(--f-mono);font-size:15px;background:var(--surface-2);border-radius:8px;padding:10px 14px;overflow-x:auto"></div></div>
    <div class="part"><h3 class="sub">B. Detective de factorización</h3><p class="ctx">Elige un caso (o deja que te toque uno al azar), intenta factorizar en tu cuaderno y luego revela las pistas una por una.</p>
    <div class="seg" id="fx-case"><button type="button" data-c="rand" aria-pressed="true">Al azar</button>${CK.map(k=>`<button type="button" data-c="${k}" aria-pressed="false">${CASES[k]}</button>`).join('')}</div>
    <div class="big-poly" id="fx-p"></div><p class="note" id="fx-k"></p><ol class="steps-list" id="fx-s"></ol>
    <div class="btn-row"><button type="button" class="btn" id="fx-next">Siguiente pista</button><button type="button" class="btn btn-ghost" id="fx-new">Nuevo polinomio</button></div></div>`;
  const st={p:3,q:2,reto:null};
  function draw(){
    $('#ti-p-o',box).textContent=st.p;$('#ti-q-o',box).textContent=st.q;
    $('#ti-ch',box).innerHTML=tilesSVG(cw($('#ti-ch',box)),st.p,st.q);
    $('#ti-tx',box).innerHTML=`(x + ${st.p})(x + ${st.q}) = x² + ${st.p}x + ${st.q}x + ${st.p*st.q} = <b>x² + ${st.p+st.q}x + ${st.p*st.q}</b>`;
    const g=$('#ti-goal',box);if(st.reto){g.hidden=false;const hit=st.p+st.q===st.reto.b&&st.p*st.q===st.reto.c;
      g.className='verdict'+(hit?' ok':'');g.innerHTML=hit?`<b>¡Lo encontraste!</b> x² + ${st.reto.b}x + ${st.reto.c} = (x + ${st.p})(x + ${st.q}). Las tiras suman ${st.reto.b} y los cuadritos son ${st.reto.c}.`:`Reto: mueve p y q hasta formar <b>x² + ${st.reto.b}x + ${st.reto.c}</b>. Necesitas ${st.reto.b} tiras x en total y ${st.reto.c} cuadritos.`;}else g.hidden=true;
  }
  $('#ti-p',box).addEventListener('input',e=>{st.p=+e.target.value;draw();});$('#ti-q',box).addEventListener('input',e=>{st.q=+e.target.value;draw();});
  $('#ti-reto',box).addEventListener('click',()=>{const p=rint(1,6),q=rint(1,6);st.reto={b:p+q,c:p*q};$('#ti-reto',box).textContent='Otro reto';draw();});
  let mode='rand',F,k;
  const showF=()=>{$('#fx-p',box).innerHTML=F.p;$('#fx-k',box).textContent=k>0?`Caso: ${CASES[F.key]}`:'¿Qué caso de factorización es?';
    $('#fx-s',box).innerHTML=F.steps.slice(0,k).map(s=>`<li>${s}</li>`).join('');$('#fx-next',box).disabled=k>=F.steps.length;};
  const newF=()=>{const key=mode==='rand'?pick(CK):mode;F={...FACT[key](),key};k=0;showF();};
  box.querySelectorAll('#fx-case button').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.c;box.querySelectorAll('#fx-case button').forEach(x=>x.setAttribute('aria-pressed',x===b));newF();}));
  $('#fx-next',box).addEventListener('click',()=>{k++;showF();});$('#fx-new',box).addEventListener('click',newF);
  draw();newF();return draw;
}
function quizPoli(){
  const qs=[];let p,q;do{p=rnz(-8,8);q=rnz(-8,8);}while(p+q===0||p===q);
  const ok1=`${lin(1,p)}${lin(1,q)}`;
  qs.push({type:'mc',mono:true,text:`Factoriza <span class="data">${poly([[1,2],[p+q,1],[p*q,0]])}</span>`,options:uniqOpts(ok1,[`${lin(1,-p)}${lin(1,-q)}`,`${lin(1,p)}${lin(1,-q)}`,`${lin(1,p+q)}${lin(1,p*q)}`,`${lin(1,-p)}${lin(1,q)}`]),answer:0,explain:`Dos números con producto ${sg(p*q)} y suma ${sg(p+q)}: ${sg(p)} y ${sg(q)}. Resultado: <b>${ok1}</b>.`});
  const key=pick(CK),F=FACT[key]();
  qs.push({type:'mc',keepOrder:true,text:`¿Qué caso de factorización aplica a <span class="data">${F.p}</span>?`,options:CK.map(k=>CASES[k]),answer:CK.indexOf(key),explain:`Es <b>${CASES[key]}</b>: ${F.steps[0]} Resultado: ${F.ans}.`});
  let a,b;do{a=rint(1,4);b=rint(1,9);}while(gcd(a,b)!==1);
  qs.push({type:'mc',mono:true,text:`Factoriza <span class="data">${poly([[a*a,2],[-b*b,0]])}</span>`,options:[`${lin(a,-b)}${lin(a,b)}`,`${lin(a,-b)}²`,`${lin(a,b)}²`,'No se puede factorizar'],answer:0,explain:`Diferencia de cuadrados: (${poly([[a,1]])})² − ${b}² = <b>${lin(a,-b)}${lin(a,b)}</b>.`});
  const A=rnz(-3,3),B=rint(-6,6),C=rint(-6,6),D=rint(-10,10),K=rnz(-3,3),val=A*K**3+B*K**2+C*K+D;
  qs.push({type:'num',text:`Si P(x) = ${poly([[A,3],[B,2],[C,1],[D,0]])}, ¿cuánto vale P(${sg(K)})?`,answer:val,tol:0,explain:`P(${sg(K)}) = ${sg(A)}·${ps(K)}³ ${B<0?'−':'+'} ${Math.abs(B)}·${ps(K)}² ${C<0?'−':'+'} ${Math.abs(C)}·${ps(K)} ${D<0?'−':'+'} ${Math.abs(D)} = ${sg(A*K**3)} ${B*K*K<0?'−':'+'} ${Math.abs(B*K*K)} ${C*K<0?'−':'+'} ${Math.abs(C*K)} ${D<0?'−':'+'} ${Math.abs(D)} = <b>${sg(val)}</b>.`});
  const r=rnz(-7,7),s=rnz(-7,7);
  qs.push({type:'num',text:`Al desarrollar ${lin(1,r)}${lin(1,s)} se obtiene x² + bx + c. ¿Cuánto vale <b>b</b>?`,answer:r+s,tol:0,explain:`(x + p)(x + q) = x² + (p + q)x + pq, así que b = ${sg(r)} + ${ps(s)} = <b>${sg(r+s)}</b> (y c = ${sg(r*s)}).`});
  const d1=rint(2,5),d2=rint(1,4);
  qs.push({type:'num',text:`¿Cuál es el grado del polinomio que resulta de (${poly([[1,d1],[rnz(-5,5),0]])})(${poly([[2,d2],[rnz(-5,5),1]])})?`,answer:d1+d2,tol:0,explain:`Al multiplicar, el término de mayor grado es ${xp(d1)} · 2${xp(d2)} = 2x<sup>${d1+d2}</sup>. Los grados se suman: <b>${d1+d2}</b>.`});
  return qs;
}

/* ---------- 1.3 Potencias y raíces ---------- */
function valFmt(v){if(!Number.isFinite(v))return'—';if(v!==0&&(Math.abs(v)>=1e9||Math.abs(v)<1e-4)){const k=Math.floor(Math.log10(Math.abs(v))),m=v/10**k;return`${nf(m,3)} × 10<sup>${k}</sup>`;}return nf(v,Math.abs(v)>=100?2:6);}
const rep=(a,n)=>Array(n).fill(a).join('·');
const LAWS={
 prod:{name:'Producto',rule:'a<sup>m</sup> · a<sup>n</sup> = a<sup>m+n</sup>'},
 coc:{name:'Cociente',rule:'a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m−n</sup>'},
 pot:{name:'Potencia de potencia',rule:'(a<sup>m</sup>)<sup>n</sup> = a<sup>m·n</sup>'},
 cero:{name:'Exponente cero',rule:'a<sup>0</sup> = 1'},
 neg:{name:'Exponente negativo',rule:`a<sup>−n</sup> = ${FR(1,'a<sup>n</sup>')}`},
 rac:{name:'Exponente racional',rule:`a<sup>m/n</sup> = ${RAD('a<sup>m</sup>','n')} = (${RAD('a','n')})<sup>m</sup>`},
};
function simPot(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Leyes de exponentes en vivo</h3><p class="ctx">Elige una ley, mueve la base y los exponentes, y comprueba que los dos lados siempre dan lo mismo.</p>
    <div class="seg" id="lw">${Object.entries(LAWS).map(([k,v],i)=>`<button type="button" data-l="${k}" aria-pressed="${i===0}">${v.name}</button>`).join('')}</div>
    <div class="ctrls"><label class="ctrl"><span>Base a <output id="lw-a-o"></output></span><input type="range" id="lw-a" min="2" max="10" step="1" value="2"></label>
    <label class="ctrl" id="lw-m-w"><span>m <output id="lw-m-o"></output></span><input type="range" id="lw-m" min="-4" max="6" step="1" value="3"></label>
    <label class="ctrl" id="lw-n-w"><span>n <output id="lw-n-o"></output></span><input type="range" id="lw-n" min="-4" max="6" step="1" value="2"></label></div>
    <p class="tip" id="lw-rule"></p><div class="expr" id="lw-e"></div><div class="readouts" id="lw-ro"></div></div>
    <div class="part"><h3 class="sub">B. Potencias en el laboratorio: crecimiento bacteriano</h3><p class="ctx">Si una población de bacterias se duplica cada <b>g</b> minutos, después de <b>t</b> minutos hay N = N₀ · 2<sup>t/g</sup>. El exponente t/g casi nunca es entero: ahí aparecen los exponentes racionales.</p>
    <div class="ctrls"><label class="ctrl"><span>Inicial N₀ (UFC/mL) <output id="bc-n-o"></output></span><input type="range" id="bc-n" min="10" max="1000" step="10" value="100"></label>
    <label class="ctrl"><span>Tiempo de duplicación g (min) <output id="bc-g-o"></output></span><input type="range" id="bc-g" min="15" max="120" step="5" value="40"></label>
    <label class="ctrl"><span>Tiempo t (min) <output id="bc-t-o"></output></span><input type="range" id="bc-t" min="0" max="720" step="10" value="100"></label></div>
    <div class="readouts" id="bc-ro"></div><div class="chart-wrap" id="bc-ch"></div><p class="note">Escala vertical logarítmica: cada línea horizontal vale 10 veces la anterior. La línea punteada es un límite de ejemplo de 10⁵ UFC/mL.</p></div>`;
  const st={law:'prod',a:2,m:3,n:2,N0:100,g:40,t:100};
  const mI=$('#lw-m',box),nI=$('#lw-n',box);
  function drawLaw(){
    const {law,a}=st;let {m,n}=st;
    $('#lw-m-w',box).hidden=law==='cero';$('#lw-n-w',box).hidden=false;
    if(law==='neg'||law==='rac'){nI.min=1;}else{nI.min=-4;}if(law==='cero'){nI.min=1;}
    if(law==='rac'){mI.min=1;}else mI.min=-4;
    n=st.n=clamp(st.n,+nI.min,+nI.max);m=st.m=clamp(st.m,+mI.min,+mI.max);nI.value=n;mI.value=m;
    $('#lw-a-o',box).textContent=a;$('#lw-m-o',box).textContent=sg(m);$('#lw-n-o',box).textContent=sg(n);
    $('#lw-rule',box).innerHTML=`<b>${LAWS[law].name}:</b> ${LAWS[law].rule}`;
    let e='',L,R;
    if(law==='prod'){L=a**m*a**n;R=a**(m+n);e=`${a}<sup>${m}</sup> · ${a}<sup>${n}</sup> = ${a}<sup>${m} + ${ps(n)}</sup> = ${a}<sup>${m+n}</sup>`;
      if(m>0&&n>0&&m+n<=10)e+=`<br><span class="muted">(${rep(a,m)}) · (${rep(a,n)}) → ${m+n} factores</span>`;}
    if(law==='coc'){L=a**m/a**n;R=a**(m-n);e=`${a}<sup>${m}</sup> ÷ ${a}<sup>${n}</sup> = ${a}<sup>${m} − ${ps(n)}</sup> = ${a}<sup>${m-n}</sup>`;
      if(m>0&&n>0&&m<=8&&n<=8){const k=Math.min(m,n),num=Array(m).fill(0).map((_,i)=>i<k?`<s>${a}</s>`:a).join('·'),den=Array(n).fill(0).map((_,i)=>i<k?`<s>${a}</s>`:a).join('·');e+=`<br><span class="muted">${FR(num,den)} → se cancelan ${k} factores</span>`;}}
    if(law==='pot'){L=(a**m)**n;R=a**(m*n);e=`(${a}<sup>${m}</sup>)<sup>${n}</sup> = ${a}<sup>${m} · ${ps(n)}</sup> = ${a}<sup>${m*n}</sup>`;
      if(m>0&&n>0&&m*n<=12)e+=`<br><span class="muted">${Array(n).fill(`(${rep(a,m)})`).join('·')} → ${m*n} factores</span>`;}
    if(law==='cero'){L=a**n/a**n;R=1;e=`${FR(`${a}<sup>${n}</sup>`,`${a}<sup>${n}</sup>`)} = ${a}<sup>${n} − ${n}</sup> = ${a}<sup>0</sup> = 1`;}
    if(law==='neg'){L=a**(-n);R=1/a**n;e=`${a}<sup>−${n}</sup> = ${FR(1,`${a}<sup>${n}</sup>`)} = ${FR(1,nf(a**n,0))}`;}
    if(law==='rac'){L=a**(m/n);R=Math.pow(a**m,1/n);const g=gcd(m,n);e=`${a}<sup>${m}/${n}</sup> = ${RAD(`${a}<sup>${m}</sup>`,n)} = ${RAD(nf(a**m,0),n)}`;if(g>1)e+=`<br><span class="muted">${m}/${n} se simplifica a ${m/g}/${n/g}</span>`;}
    $('#lw-e',box).innerHTML=e;
    $('#lw-ro',box).innerHTML=`<div class="ro"><span>Lado izquierdo</span><b>${valFmt(L)}</b></div><div class="ro"><span>Lado derecho</span><b>${valFmt(R)}</b></div><div class="ro hl"><span>¿Iguales?</span><b>${Math.abs(L-R)<=1e-9*Math.max(1,Math.abs(R))?'Sí':'No'}</b></div>`;
  }
  function drawBac(){
    const {N0,g,t}=st,N=N0*2**(t/g),gg=gcd(t,g)||1,tl=Math.log2(1e5/N0)*g;
    $('#bc-n-o',box).textContent=N0;$('#bc-g-o',box).textContent=g;$('#bc-t-o',box).textContent=t;
    const ex=t===0?'0':fracStr(t,g),rad=(t%g!==0&&t>0)?` = ${RAD(`2<sup>${t/gg}</sup>`,g/gg)}`:'';
    $('#bc-ro',box).innerHTML=`<div class="ro"><span>Exponente t/g</span><b>${ex} ≈ ${fmt(t/g,3)}</b></div><div class="ro"><span>Factor 2<sup>t/g</sup></span><b>${valFmt(2**(t/g))}</b>${rad?`<span>2<sup>${t/gg}/${g/gg}</sup>${rad}</span>`:''}</div><div class="ro hl"><span>Población N (UFC/mL)</span><b>${valFmt(N)}</b></div><div class="ro"><span>Llega a 10⁵ en</span><b>${tl<=0?'ya lo superó':fmt(tl,0)+' min'}</b></div>`;
    const pts=[];for(let x=0;x<=720;x+=5)pts.push([x,Math.log10(N0*2**(x/g))]);
    const ymax=Math.max(6,Math.ceil(Math.log10(N0*2**(720/g)))),ymin=1,W=cw($('#bc-ch',box));
    const lab=N<1e7?`N ≈ ${nf(N,0)}`:`N ≈ ${nf(N/10**Math.floor(Math.log10(N)),2)} × 10^${Math.floor(Math.log10(N))}`;
    $('#bc-ch',box).innerHTML=chart({W,xmin:0,xmax:720,ymin,ymax,label:'Crecimiento bacteriano',xlabel:'Tiempo t (min)',yticks:niceTicks(ymin,ymax,Math.min(8,ymax-ymin)).filter(Number.isInteger),
      yfmt:v=>`10<tspan dy="-6" font-size="9">${v}</tspan>`,curves:[{pts}],hlines:[{y:5,cls:'acc',label:'10⁵ UFC/mL'}],points:[{x:t,y:Math.log10(N),label:lab}]});
  }
  box.querySelectorAll('#lw button').forEach(b=>b.addEventListener('click',()=>{st.law=b.dataset.l;box.querySelectorAll('#lw button').forEach(x=>x.setAttribute('aria-pressed',x===b));drawLaw();}));
  [['lw-a','a',drawLaw],['lw-m','m',drawLaw],['lw-n','n',drawLaw],['bc-n','N0',drawBac],['bc-g','g',drawBac],['bc-t','t',drawBac]].forEach(([id,k,f])=>$('#'+id,box).addEventListener('input',e=>{st[k]=+e.target.value;f();}));
  drawLaw();drawBac();return drawBac;
}
const RATP=[[8,2,3,4],[27,2,3,9],[16,3,4,8],[32,3,5,8],[64,5,6,32],[9,3,2,27],[25,3,2,125],[4,5,2,32],[81,3,4,27],[125,2,3,25],[16,5,4,32],[100,3,2,1000]];
function quizPot(){
  const qs=[];const a=rint(-3,7),b=rint(-3,7),c=rint(-4,7);
  qs.push({type:'num',ph:'Exponente',text:`Simplifica <span class="data">${FR(`x<sup>${a}</sup> · x<sup>${b}</sup>`,`x<sup>${c}</sup>`)}</span> y escribe solo el <b>exponente</b> final de x.`,answer:a+b-c,tol:0,explain:`Producto: ${a} + ${ps(b)} = ${a+b}. Cociente: ${a+b} − ${ps(c)} = <b>${a+b-c}</b>. Queda x<sup>${a+b-c}</sup>.`});
  const m=rint(2,4),n=rint(2,3),k=rint(-5,3);
  qs.push({type:'num',ph:'Exponente',text:`Simplifica <span class="data">(x<sup>${m}</sup>)<sup>${n}</sup> · x<sup>${k}</sup></span> y escribe el <b>exponente</b> final.`,answer:m*n+k,tol:0,explain:`Potencia de potencia: ${m} · ${n} = ${m*n}. Luego producto: ${m*n} + ${ps(k)} = <b>${m*n+k}</b>.`});
  const [B,p,q,V]=pick(RATP);
  qs.push({type:'num',text:`Calcula <span class="data">${B}<sup>${p}/${q}</sup></span> sin calculadora.`,answer:V,tol:0,explain:`${B}<sup>${p}/${q}</sup> = (${RAD(B,q)})<sup>${p}</sup> = ${nf(Math.round(B**(1/q)),0)}<sup>${p}</sup> = <b>${V}</b>. Conviene sacar primero la raíz y luego elevar.`});
  const [bb,ee]=pick([[2,1],[2,2],[2,3],[4,1],[4,2],[5,1],[5,2],[10,1],[10,2],[10,3]]);
  qs.push({type:'num',ph:'Ej.: 1/8 o 0,125',text:`¿Cuánto vale <span class="data">${bb}<sup>−${ee}</sup></span>? (fracción o decimal)`,answer:1/bb**ee,tol:1e-6,explain:`${bb}<sup>−${ee}</sup> = ${FR(1,`${bb}<sup>${ee}</sup>`)} = ${FR(1,bb**ee)} = <b>${nf(1/bb**ee,6)}</b>.`});
  let mm,nn;do{mm=rint(1,5);nn=rint(2,5);}while(gcd(mm,nn)!==1||mm===nn);
  qs.push({type:'mc',mono:true,text:`¿Cómo se escribe <span class="data">${RAD(`x<sup>${mm}</sup>`,nn)}</span> con exponente racional?`,options:[`x<sup>${mm}/${nn}</sup>`,`x<sup>${nn}/${mm}</sup>`,`x<sup>${mm-nn}</sup>`,`x<sup>${mm*nn}</sup>`],answer:0,explain:`El índice de la raíz va al denominador: ${RAD(`x<sup>m</sup>`,'n')} = x<sup>m/n</sup> → <b>x<sup>${mm}/${nn}</sup></b>.`});
  const N0=pick([100,200,500,1000]),g=pick([20,30,45,60]),kk=rint(2,6),t=g*kk;
  qs.push({type:'num',text:`Las bacterias de una leche mal refrigerada se duplican cada ${g} min. Si al inicio hay ${N0} UFC/mL, ¿cuántas habrá a los ${t} min?`,unit:'UFC/mL',answer:N0*2**kk,tol:0,explain:`N = ${N0} · 2<sup>${t}/${g}</sup> = ${N0} · 2<sup>${kk}</sup> = ${N0} · ${2**kk} = <b>${(N0*2**kk).toLocaleString('es-EC')}</b> UFC/mL.`});
  return qs;
}

/* ---------- 1.4 Simplificación ---------- */
const RTYPES={
 t1:()=>{let p,q;do{p=rnz(-6,6);q=rnz(-6,6);}while(p===q||p+q===0);return{num:poly([[1,2],[p+q,1],[p*q,0]]),den:poly([[1,1],[p,0]]),numF:`${lin(1,p)}${lin(1,q)}`,denF:lin(1,p),cancel:lin(1,p),simp:poly([[1,1],[q,0]]),restr:[-p],
   f:x=>(x*x+(p+q)*x+p*q)/(x+p),g:x=>x+q};},
 t2:()=>{let p,q;do{p=rint(1,6);q=rnz(-6,6);}while(q===p||q===-p);return{num:poly([[1,2],[-p*p,0]]),den:poly([[1,2],[p+q,1],[p*q,0]]),numF:`${lin(1,-p)}${lin(1,p)}`,denF:`${lin(1,p)}${lin(1,q)}`,cancel:lin(1,p),simp:FR(poly([[1,1],[-p,0]]),poly([[1,1],[q,0]])),restr:[-p,-q],
   f:x=>(x*x-p*p)/(x*x+(p+q)*x+p*q),g:x=>(x-p)/(x+q)};},
 t3:()=>{const k=rint(2,6),p=rnz(-6,6);return{num:poly([[k,2],[k*p,1]]),den:poly([[k,1]]),numF:`${k}x${lin(1,p)}`,denF:`${k}x`,cancel:`${k}x`,simp:poly([[1,1],[p,0]]),restr:[0],f:x=>(k*x*x+k*p*x)/(k*x),g:x=>x+p};},
 t4:()=>{const a=rint(2,6),p=rint(1,6);return{num:poly([[a,1],[a*p,0]]),den:poly([[1,2],[-p*p,0]]),numF:`${a}${lin(1,p)}`,denF:`${lin(1,-p)}${lin(1,p)}`,cancel:lin(1,p),simp:FR(a,poly([[1,1],[-p,0]])),restr:[-p,p],f:x=>(a*x+a*p)/(x*x-p*p),g:x=>a/(x-p)};},
};
const LAWQ=[
 {L:'(a + b)²',R:'a² + b²',t:'(a + b)² = a² + b²',l:(a,b)=>(a+b)**2,r:(a,b)=>a*a+b*b,ok:false,why:'Falta el término 2ab: (a + b)² = a² + 2ab + b².'},
 {L:RAD('a² + b²'),R:'a + b',t:'√(a² + b²) = a + b',l:(a,b)=>Math.sqrt(a*a+b*b),r:(a,b)=>a+b,ok:false,why:'La raíz no se reparte sobre una suma.'},
 {L:FR(1,'a + b'),R:`${FR(1,'a')} + ${FR(1,'b')}`,t:'1/(a + b) = 1/a + 1/b',l:(a,b)=>1/(a+b),r:(a,b)=>1/a+1/b,ok:false,why:'No se puede separar el denominador. Las fracciones se suman con común denominador.'},
 {L:FR('a + b','a'),R:'b',t:'(a + b)/a = b',l:(a,b)=>(a+b)/a,r:(a,b)=>b,ok:false,why:'Solo se cancelan <b>factores</b>, no términos: a no multiplica a todo el numerador.'},
 {L:FR('a + b','a'),R:`1 + ${FR('b','a')}`,t:'(a + b)/a = 1 + b/a',l:(a,b)=>(a+b)/a,r:(a,b)=>1+b/a,ok:true,why:'Se separa en dos fracciones con el mismo denominador: a/a + b/a.'},
 {L:'(a · b)²',R:'a² · b²',t:'(a · b)² = a² · b²',l:(a,b)=>(a*b)**2,r:(a,b)=>a*a*b*b,ok:true,why:'La potencia sí se reparte sobre un producto.'},
 {L:'a² · a³',R:'a⁶',t:'a² · a³ = a⁶',l:(a,b)=>a**5,r:(a,b)=>a**6,ok:false,why:'Al multiplicar potencias de igual base se <b>suman</b> los exponentes: a⁵.'},
 {L:'−(a − b)',R:'b − a',t:'−(a − b) = b − a',l:(a,b)=>-(a-b),r:(a,b)=>b-a,ok:true,why:'El signo menos cambia el signo de cada término dentro del paréntesis.'},
];
function simSimp(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Simplificar sin cambiar la función</h3><p class="ctx">Simplificar una fracción algebraica es factorizar y cancelar <b>factores</b> comunes. La expresión simplificada da los mismos valores, <b>excepto</b> donde el denominador original vale cero.</p>
    <div class="big-poly" id="sp-e"></div><ol class="steps-list" id="sp-s"></ol>
    <div class="btn-row"><button type="button" class="btn" id="sp-next">Siguiente paso</button><button type="button" class="btn btn-ghost" id="sp-new">Otra expresión</button></div>
    <div class="ctrls"><label class="ctrl"><span>Evalúa en x = <output id="sp-x-o"></output></span><input type="range" id="sp-x" min="-8" max="8" step="0.5" value="2"></label></div>
    <div class="readouts" id="sp-ro"></div><div class="chart-wrap" id="sp-ch"></div><p class="note">Línea azul: expresión original. Línea ocre punteada: simplificada. Círculo vacío: punto excluido (hueco). Línea vertical punteada: valor donde la función no existe.</p></div>
    <div class="part"><h3 class="sub">B. ¿Es válida esta simplificación?</h3><p class="ctx">Estos son errores muy comunes (y algunas reglas correctas). Prueba con números y decide.</p>
    <select id="lq" aria-label="Elige una igualdad">${LAWQ.map((q,i)=>`<option value="${i}">${q.t}</option>`).join('')}</select>
    <div class="expr" id="lq-e"></div>
    <div class="ctrls"><label class="ctrl"><span>a <output id="lq-a-o"></output></span><input type="range" id="lq-a" min="1" max="10" step="1" value="3"></label><label class="ctrl"><span>b <output id="lq-b-o"></output></span><input type="range" id="lq-b" min="1" max="10" step="1" value="4"></label></div>
    <div class="readouts" id="lq-ro"></div>
    <div class="btn-row"><button type="button" class="btn" data-v="1">Siempre es válida</button><button type="button" class="btn btn-ghost" data-v="0">Es un error</button></div><p class="verdict" id="lq-v" hidden></p></div>`;
  let R,k=0;const st={x:2,i:0,a:3,b:4};
  const steps=()=>[`Factoriza el numerador: ${R.numF}`,`Factoriza el denominador: ${R.denF}`,`Cancela el factor común <b>${R.cancel}</b>: queda ${R.simp}`,`Restricciones (del denominador <b>original</b>): x ≠ ${R.restr.map(sg).join(' y x ≠ ')}`];
  function draw(){
    $('#sp-e',box).innerHTML=`${FR(R.num,R.den)} = ${k>=3?R.simp:'?'}`;$('#sp-s',box).innerHTML=steps().slice(0,k).map(s=>`<li>${s}</li>`).join('');$('#sp-next',box).disabled=k>=4;
    const x=st.x,fx=R.restr.some(r=>Math.abs(r-x)<1e-9)?NaN:R.f(x),gx=R.g(x);$('#sp-x-o',box).textContent=nf(x,1);
    $('#sp-ro',box).innerHTML=`<div class="ro"><span>Original en x = ${nf(x,1)}</span><b>${Number.isFinite(fx)?nf(fx,4):'no definida'}</b></div><div class="ro"><span>Simplificada</span><b>${Number.isFinite(gx)?nf(gx,4):'no definida'}</b></div><div class="ro hl"><span>¿Coinciden?</span><b>${Number.isFinite(fx)&&Number.isFinite(gx)?(Math.abs(fx-gx)<1e-9?'Sí':'No'):'x excluido'}</b></div>`;
    const holes=R.restr.filter(r=>Number.isFinite(R.g(r))),asym=R.restr.filter(r=>!Number.isFinite(R.g(r)));
    $('#sp-ch',box).innerHTML=plane({W:cw($('#sp-ch',box)),xmin:-10,xmax:10,ymin:-12,ymax:12,curves:[{f:R.f},{f:R.g,cls:'acc thin dash'}],vlines:asym.map(a=>({x:a,cls:'acc'})),
      points:holes.map(h=>({x:h,y:R.g(h),open:true,label:`hueco en x = ${sg(h)}`})).concat(Number.isFinite(fx)&&Math.abs(fx)<12?[{x,y:fx,cls:'data'}]:[])});
  }
  function drawL(){const q=LAWQ[st.i];$('#lq-a-o',box).textContent=st.a;$('#lq-b-o',box).textContent=st.b;$('#lq-e',box).innerHTML=`${q.L} <span class="op">=</span> ${q.R} <span class="op">?</span>`;
    const l=q.l(st.a,st.b),r=q.r(st.a,st.b);$('#lq-ro',box).innerHTML=`<div class="ro"><span>Lado izquierdo</span><b>${nf(l,4)}</b></div><div class="ro"><span>Lado derecho</span><b>${nf(r,4)}</b></div><div class="ro hl"><span>Con estos valores</span><b>${Math.abs(l-r)<1e-9?'iguales':'distintos'}</b></div>`;}
  const newR=()=>{R=pick(Object.values(RTYPES))();k=0;draw();};
  $('#sp-next',box).addEventListener('click',()=>{k++;draw();});$('#sp-new',box).addEventListener('click',newR);
  $('#sp-x',box).addEventListener('input',e=>{st.x=+e.target.value;draw();});
  $('#lq',box).addEventListener('change',e=>{st.i=+e.target.value;$('#lq-v',box).hidden=true;drawL();});
  ['a','b'].forEach(c=>$('#lq-'+c,box).addEventListener('input',e=>{st[c]=+e.target.value;drawL();}));
  box.querySelectorAll('[data-v]').forEach(b=>b.addEventListener('click',()=>{const q=LAWQ[st.i],said=b.dataset.v==='1',v=$('#lq-v',box);v.hidden=false;
    const right=said===q.ok;v.className='verdict '+(right?'ok':'bad');v.innerHTML=`<b>${right?'Bien.':'No.'}</b> ${q.ok?'Es una regla válida':'Es un error común'}: ${q.why}`;}));
  newR();drawL();return draw;
}
function quizSimp(){
  const qs=[];let p,q;do{p=rnz(-6,6);q=rnz(-6,6);}while(p===q||p+q===0);
  qs.push({type:'mc',mono:true,text:`Simplifica <span class="data">${FR(poly([[1,2],[p+q,1],[p*q,0]]),poly([[1,1],[p,0]]))}</span>`,options:uniqOpts(poly([[1,1],[q,0]]),[poly([[1,1],[p,0]]),poly([[1,1],[p*q,0]]),poly([[1,1],[p+q,0]]),poly([[1,1],[-q,0]])]),answer:0,explain:`Numerador = ${lin(1,p)}${lin(1,q)}. Se cancela ${lin(1,p)} y queda <b>${poly([[1,1],[q,0]])}</b>, con x ≠ ${sg(-p)}.`});
  qs.push({type:'num',text:`En esa misma fracción, ¿qué valor de x hay que <b>excluir</b>?`,answer:-p,tol:0,explain:`El denominador original ${poly([[1,1],[p,0]])} vale cero en x = <b>${sg(-p)}</b>. Aunque el factor se cancele, ese valor sigue excluido.`});
  let a,c;do{a=rint(2,9);c=rint(1,9);}while(a===c);const b=rint(1,9),d=rint(1,9);
  const okS=`${poly([[a-c,1]],'x')} + ${poly([[b+d,1]],'y')}`.replace('+ −','− ');
  const mk=(u,v)=>`${poly([[u,1]],'x')} ${v<0?'−':'+'} ${poly([[Math.abs(v),1]],'y')}`;
  qs.push({type:'mc',mono:true,text:`Reduce <span class="data">(${a}x + ${b}y) − (${c}x − ${d}y)</span>`,options:uniqOpts(mk(a-c,b+d),[mk(a-c,b-d),mk(a+c,b+d),mk(a-c,-(b+d)),mk(c-a,b+d)]),answer:0,explain:`El signo menos cambia todos los signos del segundo paréntesis: ${a}x + ${b}y − ${c}x + ${d}y = <b>${mk(a-c,b+d)}</b>.`});
  const K=rnz(-9,9);
  qs.push({type:'mc',mono:true,text:`Desarrolla <span class="data">${lin(1,K)}²</span>`,options:uniqOpts(poly([[1,2],[2*K,1],[K*K,0]]),[poly([[1,2],[K*K,0]]),poly([[1,2],[K,1],[K*K,0]]),poly([[1,2],[2*K,1],[2*K,0]]),poly([[1,2],[-2*K,1],[K*K,0]])]),answer:0,explain:`(a + b)² = a² + 2ab + b² → x² ${2*K<0?'−':'+'} ${Math.abs(2*K)}x + ${K*K}. El error típico es olvidar el término central.`});
  const T=pick(LAWQ.filter(l=>l.ok)),Fs=shuffle(LAWQ.filter(l=>!l.ok)).slice(0,3);
  qs.push({type:'mc',mono:true,text:'¿Cuál de estas igualdades es <b>siempre</b> válida?',options:[T.t,...Fs.map(f=>f.t)],answer:0,explain:`<b>${T.t}</b>: ${T.why}`});
  const k=rint(2,6),pp=rnz(-6,6),v=rnz(-5,5);
  qs.push({type:'num',text:`Simplifica y luego evalúa en x = ${sg(v)}: <span class="data">${FR(poly([[k,2],[k*pp,1]]),poly([[k,1]]))}</span>`,answer:v+pp,tol:0,explain:`${FR(`${k}x${lin(1,pp)}`,`${k}x`)} = ${poly([[1,1],[pp,0]])}. En x = ${sg(v)}: ${sg(v)} ${pp<0?'−':'+'} ${Math.abs(pp)} = <b>${sg(v+pp)}</b>.`});
  return qs;
}

/* ---------- Catálogo ---------- */
const MODS=[
 {id:'reales',n:'1.1',short:'Números reales',title:'Números reales, operaciones y propiedades',desc:'Conjuntos numéricos, jerarquía de operaciones y propiedades.',
  lead:'Todo cálculo de ingeniería trabaja con números reales. Saber a qué conjunto pertenece un número y en qué orden operar evita la mayoría de errores.',
  idea:`<p>Los números se organizan en conjuntos, uno dentro de otro:</p>
   <div class="types"><div class="type"><b>ℕ Naturales</b><span>Para contar: 1, 2, 3, …</span></div><div class="type"><b>ℤ Enteros</b><span>Naturales, sus negativos y el 0: …, −2, −1, 0, 1, 2, …</span></div>
   <div class="type"><b>ℚ Racionales</b><span>Se escriben como fracción a/b con b ≠ 0. Sus decimales terminan o se repiten.</span></div><div class="type"><b>I Irracionales</b><span>No son fracción. Decimales infinitos sin patrón: √2, π, e.</span></div></div>
   <p>Racionales e irracionales juntos forman los <b>reales ℝ</b>.</p>
   <div class="formula">Conmutativa: a + b = b + a · a·b = b·a<br>Asociativa: (a + b) + c = a + (b + c)<br>Neutro: a + 0 = a · a·1 = a<br>Inverso: a + (−a) = 0 · a·(1/a) = 1<br>Distributiva: a·(b + c) = a·b + a·c</div>`,
  simHint:'Clasifica números y resuelve expresiones paso a paso.',sim:simReales,quiz:quizReales},
 {id:'polinomios',n:'1.2',short:'Polinomios',title:'Polinomios y factorización',desc:'Multiplicar como área y los cinco casos de factorización.',
  lead:'Factorizar es deshacer una multiplicación: escribir un polinomio como producto. Lo usarás para simplificar fracciones y resolver ecuaciones.',
  idea:`<p>Un <b>polinomio</b> es una suma de términos a·xⁿ con n entero no negativo. Su <b>grado</b> es el mayor exponente.</p>
   <div class="formula">Factor común: 6x³ − 9x² = 3x²(2x − 3)<br>Diferencia de cuadrados: a² − b² = (a − b)(a + b)<br>Trinomio cuadrado perfecto: a² ± 2ab + b² = (a ± b)²<br>Trinomio x² + bx + c = (x + p)(x + q), con p·q = c y p + q = b<br>Trinomio ax² + bx + c: método ac (separar el término central y agrupar)</div>
   <p class="tip">Siempre busca primero el <b>factor común</b>. Después cuenta términos: 2 términos → diferencia de cuadrados; 3 términos → algún trinomio.</p>`,
  simHint:'Construye productos con piezas y practica los casos de factorización.',sim:simPoli,quiz:quizPoli},
 {id:'potencias',n:'1.3',short:'Potencias y raíces',title:'Potencias, raíces y exponentes racionales',desc:'Leyes de exponentes y crecimiento bacteriano.',
  lead:'Las potencias aparecen cada vez que algo crece o decrece multiplicándose: bacterias, diluciones, notación científica. Las raíces son potencias con exponente fraccionario.',
  idea:`<div class="formula">a<sup>m</sup> · a<sup>n</sup> = a<sup>m+n</sup> &nbsp;&nbsp; ${FR('a<sup>m</sup>','a<sup>n</sup>')} = a<sup>m−n</sup> &nbsp;&nbsp; (a<sup>m</sup>)<sup>n</sup> = a<sup>m·n</sup><br>a<sup>0</sup> = 1 &nbsp;&nbsp; a<sup>−n</sup> = ${FR(1,'a<sup>n</sup>')} &nbsp;&nbsp; (a·b)<sup>n</sup> = a<sup>n</sup>·b<sup>n</sup><br>a<sup>m/n</sup> = ${RAD('a<sup>m</sup>','n')} = (${RAD('a','n')})<sup>m</sup></div>
   <p>El <b>índice</b> de la raíz pasa al denominador del exponente. Por ejemplo, ${RAD('x²',3)} = x<sup>2/3</sup>.</p>
   <p><b>Notación científica:</b> un número entre 1 y 10 por una potencia de 10. Ejemplo: 3 500 000 UFC/g = 3,5 × 10<sup>6</sup> UFC/g.</p>`,
  simHint:'Comprueba cada ley con números y mira crecer una población de bacterias.',sim:simPot,quiz:quizPot},
 {id:'simplificacion',n:'1.4',short:'Simplificación',title:'Simplificación y manipulación de expresiones',desc:'Fracciones algebraicas, restricciones y errores comunes.',
  lead:'Simplificar es escribir lo mismo de forma más corta. La clave es saber qué se puede cancelar y qué no.',
  idea:`<ul><li><b>Términos semejantes:</b> tienen las mismas variables con los mismos exponentes; se suman sus coeficientes: 3x + 5x = 8x.</li>
   <li><b>Productos notables:</b> (a + b)² = a² + 2ab + b² · (a + b)(a − b) = a² − b².</li>
   <li><b>Fracciones algebraicas:</b> factoriza numerador y denominador y cancela solo <b>factores</b> comunes.</li>
   <li><b>Restricciones:</b> los valores que anulan el denominador <b>original</b> siguen prohibidos después de simplificar.</li></ul>
   <div class="formula">${FR('x² − 9','x − 3')} = ${FR('(x − 3)(x + 3)','x − 3')} = x + 3, con x ≠ 3</div>`,
  simHint:'Simplifica paso a paso y descubre cuáles “atajos” son errores.',sim:simSimp,quiz:quizSimp},
];

CIMA.addUnit(META_MN,{id:'u1',orden:1,nombre:'Unidad 1 · Fundamentos del álgebra',topics:MODS});
})();
(function(){
"use strict";
/* ===================== UNIDAD 2: GRÁFICAS, ECUACIONES Y DESIGUALDADES ===================== */
const CONFIG={storeKey:'tn-u2-v1',prefix:'MN2',salt:'tn-u2-alimentos-2026',unitName:'Unidad 2 · Gráficas, ecuaciones y desigualdades',
  home:{eyebrow:'Fundamentos de Métodos Numéricos · Unidad 2',h1:'Gráficas, ecuaciones y desigualdades',
    lead:'Cuatro temas para pasar de una situación de planta a un modelo: dibujar funciones, resolver ecuaciones, describir rangos permitidos con desigualdades y trabajar con dos variables a la vez.'}};
const SL=(id,label,min,max,step,val)=>`<label class="ctrl" id="${id}-w"><span>${label} <output id="${id}-o"></output></span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
const cm=(v,v2='x')=>v; // marcador
const signed=(c,txt)=>`${c<0?'−':'+'} ${txt}`;
const term=(c,v,first)=>{if(c===0)return'';const a=Math.abs(c),co=a===1&&v?'':nf(a,3);return first?`${c<0?'−':''}${co}${v}`:` ${c<0?'−':'+'} ${co}${v}`;};
const ROOTSP=(v,d=3)=>nf(round(v,d),d);

/* ---------- 2.1 Gráficas de funciones ---------- */
const FAMS={
 lin:{name:'Lineal',p:['m','b'],eq:s=>`y = ${term(s.m,'x',true)||''}${s.m===0?nf(s.b,2):s.b===0?'':` ${s.b<0?'−':'+'} ${nf(Math.abs(s.b),2)}`}`,f:s=>x=>s.m*x+s.b},
 cuad:{name:'Cuadrática',p:['a','h','k'],eq:s=>`y = ${s.a===1?'':s.a===-1?'−':nf(s.a,2)}(x ${s.h<0?'+':'−'} ${nf(Math.abs(s.h),2)})² ${s.k<0?'−':'+'} ${nf(Math.abs(s.k),2)}`,f:s=>x=>s.a*(x-s.h)**2+s.k},
 abs:{name:'Valor absoluto',p:['a','h','k'],eq:s=>`y = ${s.a===1?'':s.a===-1?'−':nf(s.a,2)}|x ${s.h<0?'+':'−'} ${nf(Math.abs(s.h),2)}| ${s.k<0?'−':'+'} ${nf(Math.abs(s.k),2)}`,f:s=>x=>s.a*Math.abs(x-s.h)+s.k},
 raiz:{name:'Raíz cuadrada',p:['a','h','k'],eq:s=>`y = ${s.a===1?'':s.a===-1?'−':nf(s.a,2)}√(x ${s.h<0?'+':'−'} ${nf(Math.abs(s.h),2)}) ${s.k<0?'−':'+'} ${nf(Math.abs(s.k),2)}`,f:s=>x=>x<s.h?NaN:s.a*Math.sqrt(x-s.h)+s.k},
 cub:{name:'Cúbica',p:['a','h','k'],eq:s=>`y = ${s.a===1?'':s.a===-1?'−':nf(s.a,2)}(x ${s.h<0?'+':'−'} ${nf(Math.abs(s.h),2)})³ ${s.k<0?'−':'+'} ${nf(Math.abs(s.k),2)}`,f:s=>x=>s.a*(x-s.h)**3+s.k},
};
function famInfo(fam,s){
  const f=FAMS[fam].f(s);let roots=[],dom='ℝ (todos los reales)',ran='ℝ',vert=null;const r=s.a?-s.k/s.a:NaN;
  if(fam==='lin'){roots=s.m!==0?[-s.b/s.m]:[];ran=s.m!==0?'ℝ':`{${nf(s.b,2)}}`;}
  if(fam==='cuad'){if(r>=0)roots=r===0?[s.h]:[s.h-Math.sqrt(r),s.h+Math.sqrt(r)];ran=s.a>0?`[${nf(s.k,2)}; ∞)`:`(−∞; ${nf(s.k,2)}]`;vert=[s.h,s.k];}
  if(fam==='abs'){if(r>=0)roots=r===0?[s.h]:[s.h-r,s.h+r];ran=s.a>0?`[${nf(s.k,2)}; ∞)`:`(−∞; ${nf(s.k,2)}]`;vert=[s.h,s.k];}
  if(fam==='raiz'){if(r>=0)roots=[s.h+r*r];dom=`[${nf(s.h,2)}; ∞)`;ran=s.a>0?`[${nf(s.k,2)}; ∞)`:`(−∞; ${nf(s.k,2)}]`;vert=[s.h,s.k];}
  if(fam==='cub'){roots=[s.h+Math.cbrt(r)];vert=[s.h,s.k];}
  return{f,roots,dom,ran,vert,y0:f(0)};
}
function simGraf(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Familias de funciones y sus transformaciones</h3><p class="ctx">Elige una familia y mueve los parámetros. Observa qué hace cada uno: <b>h</b> mueve la gráfica a los lados, <b>k</b> la sube o baja y <b>a</b> la estira, la achata o la refleja.</p>
    <div class="seg" id="gf-f">${Object.entries(FAMS).map(([k,v],i)=>`<button type="button" data-f="${k}" aria-pressed="${i===1}">${v.name}</button>`).join('')}</div>
    <div class="ctrls">${SL('gf-m','Pendiente m',-5,5,0.5,1)}${SL('gf-b','Intercepto b',-8,8,0.5,2)}${SL('gf-a','a',-3,3,0.25,1)}${SL('gf-h','h',-6,6,0.5,2)}${SL('gf-k','k',-8,8,0.5,-3)}</div>
    <div class="expr" id="gf-eq"></div><div class="readouts" id="gf-ro"></div><p class="verdict" id="gf-tx"></p>
    <div class="chart-wrap" id="gf-ch"></div><div class="table-wrap"><table class="tbl" id="gf-tb"></table></div></div>
    <div class="part"><h3 class="sub">B. Una recta en planta: enfriamiento de mermelada</h3><p class="ctx">Después de la cocción, la mermelada se enfría antes de envasar. Si baja a ritmo constante, la temperatura es una función lineal del tiempo: <b>T(t) = T₀ − r·t</b>. La pendiente es −r y el intercepto es T₀.</p>
    <div class="ctrls">${SL('cl-t0','Temperatura inicial T₀ (°C)',60,95,1,90)}${SL('cl-r','Ritmo de enfriamiento r (°C/min)',0.5,5,0.1,1.5)}${SL('cl-to','Temperatura de envasado (°C)',30,70,1,45)}</div>
    <div class="readouts" id="cl-ro"></div><div class="chart-wrap" id="cl-ch"></div></div>`;
  const s={fam:'cuad',m:1,b:2,a:1,h:2,k:-3,T0:90,r:1.5,To:45};
  function draw(){
    const F=FAMS[s.fam];['m','b','a','h','k'].forEach(p=>{$(`#gf-${p}-w`,box).hidden=!F.p.includes(p);$(`#gf-${p}-o`,box).textContent=nf(s[p],2);});
    const I=famInfo(s.fam,s);$('#gf-eq',box).textContent=F.eq(s);
    const rts=I.roots.filter(Number.isFinite);
    $('#gf-ro',box).innerHTML=`<div class="ro"><span>Dominio</span><b>${I.dom}</b></div><div class="ro"><span>Rango</span><b>${I.ran}</b></div><div class="ro"><span>Corte con eje y</span><b>${Number.isFinite(I.y0)?`(0; ${ROOTSP(I.y0,2)})`:'no tiene'}</b></div><div class="ro hl"><span>Cortes con eje x</span><b>${rts.length?rts.map(r=>ROOTSP(r,2)).join(' y '):'no tiene'}</b></div>${I.vert?`<div class="ro"><span>${s.fam==='cub'?'Punto de inflexión':s.fam==='raiz'?'Punto inicial':'Vértice'}</span><b>(${nf(s.h,2)}; ${nf(s.k,2)})</b></div>`:''}`;
    let tx='';if(s.fam==='lin')tx=`m = ${nf(s.m,2)}: por cada unidad que avanza x, y ${s.m>0?'sube':s.m<0?'baja':'no cambia'}${s.m?` ${nf(Math.abs(s.m),2)}`:''}. b = ${nf(s.b,2)}: la recta corta al eje y en ${nf(s.b,2)}.`;
    else tx=`h = ${nf(s.h,2)}: se mueve ${Math.abs(s.h)} ${s.h>=0?'a la derecha':'a la izquierda'}. k = ${nf(s.k,2)}: ${s.k>=0?'sube':'baja'} ${nf(Math.abs(s.k),2)}. a = ${nf(s.a,2)}: ${s.a===0?'con a = 0 la gráfica se vuelve una recta horizontal':s.a<0?'se refleja (se voltea)':'no se refleja'}${Math.abs(s.a)>1?' y se estira':Math.abs(s.a)<1&&s.a!==0?' y se achata':''}.`;
    $('#gf-tx',box).textContent=tx;
    const c0=s.fam==='lin'?0:s.h,xs=[-2,-1,0,1,2].map(d=>c0+d);
    $('#gf-ch',box).innerHTML=plane({W:cw($('#gf-ch',box)),xmin:-10,xmax:10,ymin:-10,ymax:10,curves:[{f:I.f}],
      points:xs.filter(x=>Number.isFinite(I.f(x))).map(x=>({x,y:I.f(x),cls:'data',r:4})).concat(I.vert?[{x:s.h,y:s.k,label:`(${nf(s.h,2)}; ${nf(s.k,2)})`}]:[])});
    $('#gf-tb',box).innerHTML=`<thead><tr><th>x</th>${xs.map(x=>`<th>${nf(x,2)}</th>`).join('')}</tr></thead><tbody><tr><td>y</td>${xs.map(x=>`<td>${Number.isFinite(I.f(x))?nf(I.f(x),3):'no existe'}</td>`).join('')}</tr></tbody>`;
  }
  function drawC(){
    ['t0','r','to'].forEach((k,i)=>$(`#cl-${k}-o`,box).textContent=nf([s.T0,s.r,s.To][i],1));
    const tf=(s.T0-s.To)/s.r,tmax=Math.max(10,Math.ceil(Math.max(tf,0)*1.3/5)*5);
    $('#cl-ro',box).innerHTML=`<div class="ro"><span>Modelo</span><b>T = ${nf(s.T0,1)} − ${nf(s.r,1)}t</b></div><div class="ro"><span>Pendiente</span><b>−${nf(s.r,1)} °C/min</b></div><div class="ro"><span>Intercepto</span><b>${nf(s.T0,1)} °C</b></div><div class="ro hl"><span>Lista para envasar en</span><b>${tf>0?fmt(tf,1)+' min':'ya está'}</b></div>`;
    $('#cl-ch',box).innerHTML=chart({W:cw($('#cl-ch',box)),xmin:0,xmax:tmax,ymin:0,ymax:100,label:'Enfriamiento lineal',xlabel:'Tiempo t (min)',yfmt:v=>nf(v,0)+' °C',
      curves:[{pts:[[0,s.T0],[Math.min(tmax,s.T0/s.r),Math.max(0,s.T0-s.r*tmax)]]}],hlines:[{y:s.To,cls:'acc',label:`envasado ${nf(s.To,0)} °C`}],points:tf>0?[{x:tf,y:s.To,label:`t = ${fmt(tf,1)} min`}]:[]});
  }
  box.querySelectorAll('#gf-f button').forEach(b=>b.addEventListener('click',()=>{s.fam=b.dataset.f;box.querySelectorAll('#gf-f button').forEach(x=>x.setAttribute('aria-pressed',x===b));draw();}));
  ['m','b','a','h','k'].forEach(p=>$(`#gf-${p}`,box).addEventListener('input',e=>{s[p]=+e.target.value;draw();}));
  [['t0','T0'],['r','r'],['to','To']].forEach(([id,k])=>$(`#cl-${id}`,box).addEventListener('input',e=>{s[k]=+e.target.value;drawC();}));
  draw();drawC();return()=>{draw();drawC();};
}
function quizGraf(){
  const qs=[];const a=rnz(-3,3),b=rint(-6,6),c=rint(-9,9),k=rnz(-3,3),v=a*k*k+b*k+c;
  qs.push({type:'num',text:`Si f(x) = ${poly([[a,2],[b,1],[c,0]])}, ¿cuánto vale f(${sg(k)})?`,answer:v,tol:0,explain:`f(${sg(k)}) = ${sg(a)}·${ps(k)}² ${signed(b,Math.abs(b)+'·'+ps(k))} ${signed(c,Math.abs(c))} = ${sg(a*k*k)} ${signed(b*k,Math.abs(b*k))} ${signed(c,Math.abs(c))} = <b>${sg(v)}</b>.`});
  let x1,x2,y1,y2;do{x1=rint(-5,4);x2=rint(x1+1,6);y1=rint(-8,8);y2=rint(-8,8);}while((y2-y1)%(x2-x1)!==0&&2*(y2-y1)%(x2-x1)!==0);
  const m=(y2-y1)/(x2-x1);
  qs.push({type:'num',ph:'Ej.: −3/2',text:`¿Cuál es la pendiente de la recta que pasa por (${sg(x1)}; ${sg(y1)}) y (${sg(x2)}; ${sg(y2)})?`,answer:m,tol:0.01,explain:`m = ${FR(`${sg(y2)} − ${ps(y1)}`,`${sg(x2)} − ${ps(x1)}`)} = ${FR(sg(y2-y1),x2-x1)} = <b>${nf(m,2)}</b>.`});
  const h=rnz(-6,6),kk=rnz(-6,6),aa=pick([1,-1,2,-2,3]);const q=FAMS.cuad.eq({a:aa,h,k:kk});
  qs.push({type:'mc',mono:true,text:`¿Cuál es el vértice de <span class="data">${q}</span>?`,options:uniqOpts(`(${sg(h)}; ${sg(kk)})`,[`(${sg(-h)}; ${sg(kk)})`,`(${sg(kk)}; ${sg(h)})`,`(${sg(h)}; ${sg(-kk)})`,`(${sg(-h)}; ${sg(-kk)})`,`(${sg(-kk)}; ${sg(-h)})`,`(${sg(h+1)}; ${sg(kk)})`]),answer:0,explain:`En y = a(x − h)² + k el vértice es (h; k). Ojo con el signo: “x ${h<0?'+':'−'} ${Math.abs(h)}” significa h = ${sg(h)}. Vértice: <b>(${sg(h)}; ${sg(kk)})</b>.`});
  const T0=pick([80,85,90,95]),r=pick([1.5,2,2.5,4,5]),To=pick([40,45,50]);
  qs.push({type:'num',text:`Una mermelada a ${T0} °C se enfría según T(t) = ${T0} − ${nf(r,1)}t (t en minutos). ¿En cuántos minutos llega a ${To} °C?`,unit:'min',answer:(T0-To)/r,tol:0.05,explain:`${To} = ${T0} − ${nf(r,1)}t → ${nf(r,1)}t = ${T0-To} → t = ${T0-To} / ${nf(r,1)} = <b>${nf((T0-To)/r,2)} min</b>.`});
  const hh=rnz(-7,7);
  qs.push({type:'mc',mono:true,text:`¿Cuál es el dominio de <span class="data">y = √(x ${hh<0?'+':'−'} ${Math.abs(hh)})</span>?`,options:[`[${sg(hh)}; ∞)`,`(−∞; ${sg(hh)}]`,`[${sg(-hh)}; ∞)`,'ℝ (todos los reales)'],answer:0,explain:`Lo que está dentro de la raíz no puede ser negativo: x ${hh<0?'+':'−'} ${Math.abs(hh)} ≥ 0 → x ≥ ${sg(hh)}. Dominio: <b>[${sg(hh)}; ∞)</b>.`});
  const H=rnz(-5,5),K=rnz(-5,5),dir=(v,pos,neg)=>`${Math.abs(v)} ${v>0?pos:neg}`;
  const ok=`${dir(H,'a la derecha','a la izquierda')} y ${dir(K,'hacia arriba','hacia abajo')}`;
  qs.push({type:'mc',text:`La gráfica de <span class="data">${FAMS.cuad.eq({a:1,h:H,k:K})}</span> se obtiene de y = x² desplazándola…`,options:uniqOpts(ok,[`${dir(-H,'a la derecha','a la izquierda')} y ${dir(K,'hacia arriba','hacia abajo')}`,`${dir(H,'a la derecha','a la izquierda')} y ${dir(-K,'hacia arriba','hacia abajo')}`,`${dir(-H,'a la derecha','a la izquierda')} y ${dir(-K,'hacia arriba','hacia abajo')}`,`${dir(K,'a la derecha','a la izquierda')} y ${dir(H,'hacia arriba','hacia abajo')}`]),answer:0,explain:`h = ${sg(H)} mueve la gráfica ${dir(H,'a la derecha','a la izquierda')}; k = ${sg(K)} la mueve ${dir(K,'hacia arriba','hacia abajo')}.`});
  return qs;
}

/* ---------- 2.2 Ecuaciones lineales y cuadráticas ---------- */
function balanceSVG(W,L,R){
  const H=210,f1=v=>v.toFixed(1),xl=W*0.25,xr=W*0.75,py=180,panW=W/2-24,by=46;
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="chart" role="img" aria-label="Balanza: ${L.x} x y ${L.u} unidades a la izquierda; ${R.x} x y ${R.u} unidades a la derecha">`;
  s+=`<path d="M${W/2} ${by} L${W/2-26} ${H-4} L${W/2+26} ${H-4} Z" fill="var(--line)"/><line class="axis" x1="${f1(xl)}" x2="${f1(xr)}" y1="${by}" y2="${by}" style="stroke-width:4"/><circle cx="${W/2}" cy="${by}" r="6" fill="var(--ink)"/>`;
  [[xl,L],[xr,R]].forEach(([cx,P])=>{
    s+=`<line class="grid" x1="${f1(cx)}" x2="${f1(cx-panW/2+6)}" y1="${by}" y2="${py}"/><line class="grid" x1="${f1(cx)}" x2="${f1(cx+panW/2-6)}" y1="${by}" y2="${py}"/>`;
    s+=`<rect x="${f1(cx-panW/2)}" y="${py}" width="${f1(panW)}" height="7" rx="3" fill="var(--muted)"/>`;
    const bpr=Math.max(1,Math.floor((panW-10)/30)),upr=Math.max(1,Math.floor((panW-10)/16));let y=py-4;
    const nbr=Math.ceil(P.x/bpr);for(let i=0;i<P.x;i++){const row=Math.floor(i/bpr),col=i%bpr,n=Math.min(bpr,P.x-row*bpr),x0=cx-n*30/2+col*30;
      s+=`<rect class="tile-x2" x="${f1(x0+2)}" y="${f1(y-26-row*28)}" width="26" height="26" rx="4"/><text class="tl" x="${f1(x0+15)}" y="${f1(y-8-row*28)}" text-anchor="middle">x</text>`;}
    y-=nbr*28;for(let i=0;i<P.u;i++){const row=Math.floor(i/upr),col=i%upr,n=Math.min(upr,P.u-row*upr),x0=cx-n*16/2+col*16;
      s+=`<circle class="tile-1" cx="${f1(x0+8)}" cy="${f1(y-8-row*16)}" r="6.5"/>`;}
  });
  return s+'</svg>';
}
function simEc(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. La balanza: resolver es mantener el equilibrio</h3><p class="ctx">Cada caja azul pesa <b>x</b> y cada círculo pesa <b>1</b>. La balanza está en equilibrio, así que los dos lados pesan lo mismo. Lo que hagas a un lado, hazlo también al otro.</p>
    <div class="expr" id="bl-eq"></div><div class="chart-wrap" id="bl-ch"></div><ol class="steps-list" id="bl-s"></ol>
    <div class="btn-row"><button type="button" class="btn" id="bl-next">Siguiente paso</button><button type="button" class="btn btn-ghost" id="bl-new">Otra ecuación</button></div></div>
    <div class="part"><h3 class="sub">B. Ecuación cuadrática: la fórmula general en acción</h3><p class="ctx">Las soluciones de ax² + bx + c = 0 son los puntos donde la parábola corta el eje x. El <b>discriminante Δ = b² − 4ac</b> te dice cuántos hay antes de calcularlos.</p>
    <div class="ctrls">${SL('qd-a','a',-3,3,0.5,1)}${SL('qd-b','b',-8,8,0.5,-2)}${SL('qd-c','c',-10,10,0.5,-3)}</div>
    <div class="expr" id="qd-eq"></div><div class="readouts" id="qd-ro"></div><div class="formula" id="qd-fx"></div><div class="chart-wrap" id="qd-ch"></div></div>`;
  let B,k;
  const newB=()=>{const a=rint(2,5),c=rint(0,a-1),x=rint(1,6),b=rint(0,8),d=(a-c)*x+b;
    const st=[{L:{x:a,u:b},R:{x:c,u:d},eq:`${term(a,'x',true)}${b?` + ${b}`:''} = ${c?`${term(c,'x',true)} + `:''}${d}`,note:'Ecuación inicial.'}];
    if(c)st.push({L:{x:a-c,u:b},R:{x:0,u:d},eq:`${term(a-c,'x',true)}${b?` + ${b}`:''} = ${d}`,note:`Quita ${c} caja${c>1?'s':''} x de cada lado: resta ${c}x en ambos lados.`});
    if(b)st.push({L:{x:a-c,u:0},R:{x:0,u:d-b},eq:`${term(a-c,'x',true)} = ${d-b}`,note:`Quita ${b} círculo${b>1?'s':''} de cada lado: resta ${b} en ambos lados.`});
    if(a-c>1)st.push({L:{x:1,u:0},R:{x:0,u:x},eq:`x = ${x}`,note:`Reparte cada lado en ${a-c} grupos iguales: divide ambos lados entre ${a-c}.`});
    B={st,x};k=0;drawB();};
  function drawB(){const S=B.st[k];$('#bl-eq',box).textContent=S.eq;$('#bl-ch',box).innerHTML=balanceSVG(cw($('#bl-ch',box)),S.L,S.R);
    $('#bl-s',box).innerHTML=B.st.slice(1,k+1).map(z=>`<li><span class="s-expr">${z.eq}</span><span class="s-note">${z.note}</span></li>`).join('')+(k===B.st.length-1?`<li><b>Solución: x = ${B.x}.</b> Comprueba: reemplaza x = ${B.x} en la ecuación inicial.</li>`:'');
    $('#bl-next',box).disabled=k===B.st.length-1;}
  $('#bl-next',box).addEventListener('click',()=>{k++;drawB();});$('#bl-new',box).addEventListener('click',newB);
  const q={a:1,b:-2,c:-3};
  function drawQ(){
    if(q.a===0){q.a=0.5;$('#qd-a',box).value=0.5;}
    ['a','b','c'].forEach(p=>$(`#qd-${p}-o`,box).textContent=nf(q[p],2));
    const {a,b,c}=q,D=b*b-4*a*c,vx=-b/(2*a),vy=a*vx*vx+b*vx+c;
    $('#qd-eq',box).innerHTML=`${poly([[a,2],[b,1],[c,0]])} = 0`;
    let roots=[],cls;
    if(D>1e-12){roots=[(-b-Math.sqrt(D))/(2*a),(-b+Math.sqrt(D))/(2*a)].sort((u,v)=>u-v);cls='Δ > 0: dos soluciones reales distintas';}
    else if(Math.abs(D)<=1e-12){roots=[vx];cls='Δ = 0: una solución real (doble)';}else cls='Δ < 0: no hay soluciones reales (la parábola no toca el eje x)';
    $('#qd-ro',box).innerHTML=`<div class="ro hl"><span>Discriminante Δ</span><b>${nf(D,3)}</b></div><div class="ro"><span>Soluciones</span><b>${roots.length?roots.map(r=>'x = '+nf(r,3)).join(' · '):D<0?`${nf(vx,3)} ± ${nf(Math.sqrt(-D)/(2*Math.abs(a)),3)}i`:'—'}</b></div><div class="ro"><span>Vértice</span><b>(${nf(vx,2)}; ${nf(vy,2)})</b></div>`;
    $('#qd-fx',box).innerHTML=`x = ${FR('−b ± √(b² − 4ac)','2a')} = ${FR(`${sg(-b===0?0:-b)} ± √(${ps(b)}² − 4·${ps(a)}·${ps(c)})`,`2·${ps(a)}`)} = ${FR(`${nf(-b===0?0:-b,2)} ± √${nf(D,2)}`,nf(2*a,2))}<br><b>${cls}</b>`;
    $('#qd-ch',box).innerHTML=plane({W:cw($('#qd-ch',box)),xmin:-10,xmax:10,ymin:-12,ymax:12,curves:[{f:x=>a*x*x+b*x+c}],points:roots.map(r=>({x:r,y:0,label:'x = '+nf(r,2)})).concat([{x:vx,y:vy,cls:'data',r:4}])});
  }
  ['a','b','c'].forEach(p=>$(`#qd-${p}`,box).addEventListener('input',e=>{q[p]=+e.target.value;drawQ();}));
  newB();drawQ();return()=>{drawB();drawQ();};
}
function quizEc(){
  const qs=[];let a,c,x;do{a=rnz(-7,7);c=rnz(-7,7);}while(a===c);x=rnz(-8,8);const b=rint(-12,12),d=(a-c)*x+b;
  qs.push({type:'num',text:`Resuelve: <span class="data">${term(a,'x',true)} ${b<0?'−':'+'} ${Math.abs(b)} = ${term(c,'x',true)} ${d<0?'−':'+'} ${Math.abs(d)}</span>`,answer:x,tol:0,explain:`Pasa las x a un lado y los números al otro: ${term(a,'x',true)} ${c<0?'+':'−'} ${Math.abs(c)}x = ${sg(d)} ${b<0?'+':'−'} ${Math.abs(b)} → ${term(a-c,'x',true)} = ${sg(d-b)} → x = <b>${sg(x)}</b>.`});
  const A=pick([12,10,14]),Cc=pick([60,65,70]),T=pick([100,200,500]),Ct=pick([18,20,25,30]),xa=T*(Ct-A)/(Cc-A);
  qs.push({type:'num',text:`Se quieren ${T} kg de néctar a ${Ct} °Brix mezclando jugo de ${A} °Brix con concentrado de ${Cc} °Brix. ¿Cuántos kg de concentrado se necesitan? (una cifra decimal)`,unit:'kg',answer:round(xa,1),tol:0.06,explain:`Sea x los kg de concentrado: ${Cc}x + ${A}(${T} − x) = ${Ct}·${T} → ${Cc-A}x = ${T*(Ct-A)} → x = <b>${fmt(xa,1)} kg</b> (y ${fmt(T-xa,1)} kg de jugo).`});
  const qa=rnz(-3,3),qb=rint(-9,9),qc=rint(-9,9),D=qb*qb-4*qa*qc;
  qs.push({type:'num',text:`Calcula el discriminante de <span class="data">${poly([[qa,2],[qb,1],[qc,0]])} = 0</span>`,answer:D,tol:0,explain:`Δ = b² − 4ac = ${ps(qb)}² − 4·${ps(qa)}·${ps(qc)} = ${qb*qb} ${-4*qa*qc<0?'−':'+'} ${Math.abs(4*qa*qc)} = <b>${sg(D)}</b>.`});
  qs.push({type:'mc',keepOrder:true,text:`Con ese discriminante, ¿cuántas soluciones reales tiene la ecuación?`,options:['Dos','Una','Ninguna'],answer:D>0?0:D===0?1:2,explain:`Δ = ${sg(D)} ${D>0?'> 0 → dos soluciones reales.':D===0?'= 0 → una solución doble.':'< 0 → ninguna solución real.'}`});
  let r1,r2;do{r1=rnz(-9,9);r2=rnz(-9,9);}while(r1===r2);
  qs.push({type:'num',text:`Resuelve <span class="data">${poly([[1,2],[-(r1+r2),1],[r1*r2,0]])} = 0</span> y escribe la solución <b>mayor</b>.`,answer:Math.max(r1,r2),tol:0,explain:`Factoriza: ${lin(1,-r1)}${lin(1,-r2)} = 0 → x = ${sg(r1)} o x = ${sg(r2)}. La mayor es <b>${sg(Math.max(r1,r2))}</b>.`});
  let fa,fb,fc,FD;do{fa=rint(2,4);fb=rint(-9,9);fc=rint(-9,-1);FD=fb*fb-4*fa*fc;}while(FD<=0||Number.isInteger(Math.sqrt(FD)));const xp2=(-fb+Math.sqrt(FD))/(2*fa);
  qs.push({type:'num',text:`Con la fórmula general, resuelve <span class="data">${poly([[fa,2],[fb,1],[fc,0]])} = 0</span> y escribe la solución <b>positiva</b> (dos decimales).`,answer:round(xp2,2),tol:0.011,explain:`Δ = ${fb*fb} + ${-4*fa*fc} = ${FD}. x = ${FR(`${sg(-fb)} + √${FD}`,2*fa)} = ${FR(`${sg(-fb)} + ${nf(Math.sqrt(FD),4)}`,2*fa)} ≈ <b>${fmt(xp2,2)}</b>.`});
  return qs;
}

/* ---------- 2.3 Desigualdades ---------- */
const FLIP={'<':'>','≤':'≥','>':'<','≥':'≤'};
const holds=(op,v)=>op==='<'?v<0:op==='≤'?v<=0:op==='>'?v>0:v>=0;
function linSet(op,s){return op==='<'?[{a:-Infinity,b:s,bc:false}]:op==='≤'?[{a:-Infinity,b:s,bc:true}]:op==='>'?[{a:s,b:Infinity,ac:false}]:[{a:s,b:Infinity,ac:true}];}
function quadSet(sgn,op,r1,r2){ // signo de sgn·(x−r1)(x−r2) op 0
  const lo=Math.min(r1,r2),hi=Math.max(r1,r2),cl=op==='≤'||op==='≥';const want=(op==='<'||op==='≤')?-1:1,eff=want*sgn; // eff=1 → fuera de raíces; −1 → entre raíces
  if(lo===hi){if(eff===1)return cl?[{a:-Infinity,b:Infinity}]:[{a:-Infinity,b:lo,bc:false},{a:lo,b:Infinity,ac:false}];return cl?[{a:lo,point:true}]:[];}
  return eff===1?[{a:-Infinity,b:lo,bc:cl},{a:hi,b:Infinity,ac:cl}]:[{a:lo,b:hi,ac:cl,bc:cl}];
}
function simDes(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Desigualdad lineal: cuidado al dividir entre un negativo</h3><p class="ctx">Se resuelve igual que una ecuación, con una regla extra: si multiplicas o divides entre un número <b>negativo</b>, el signo de la desigualdad se invierte.</p>
    <div class="ctrls">${SL('dl-a','a',-6,6,1,-2)}${SL('dl-b','b',-10,10,1,4)}${SL('dl-c','c',-10,10,1,-6)}<label class="ctrl"><span>Signo</span><select id="dl-op">${['<','≤','>','≥'].map(o=>`<option${o==='≤'?' selected':''}>${o}</option>`).join('')}</select></label></div>
    <div class="expr" id="dl-eq"></div><ol class="steps-list" id="dl-s"></ol><div class="chart-wrap" id="dl-nl"></div><p class="verdict" id="dl-v"></p></div>
    <div class="part"><h3 class="sub">B. Desigualdad cuadrática: ¿dónde está la parábola sobre o bajo el eje?</h3><p class="ctx">Encuentra las raíces, divide la recta en intervalos y revisa el signo en cada uno. La parte resaltada del eje x es la solución.</p>
    <div class="ctrls">${SL('dq-r1','Raíz r₁',-6,6,0.5,-2)}${SL('dq-r2','Raíz r₂',-6,6,0.5,3)}<label class="ctrl" style="flex-basis:230px"><span>Coeficiente principal</span><select id="dq-s"><option value="1">positivo (abre hacia arriba)</option><option value="-1">negativo (abre hacia abajo)</option></select></label><label class="ctrl"><span>Signo</span><select id="dq-op">${['<','≤','>','≥'].map(o=>`<option${o==='<'?' selected':''}>${o}</option>`).join('')}</select></label></div>
    <div class="expr" id="dq-eq"></div><div class="table-wrap"><table class="tbl" id="dq-tb"></table></div><div class="chart-wrap" id="dq-ch"></div><p class="verdict" id="dq-v"></p></div>`;
  const s={a:-2,b:4,c:-6,op:'≤',r1:-2,r2:3,sg:1,qop:'<'};
  function drawL(){
    if(s.a===0){s.a=1;$('#dl-a',box).value=1;}
    ['a','b','c'].forEach(p=>$(`#dl-${p}-o`,box).textContent=sg(s[p]));
    const {a,b,c,op}=s,rhs=c-b,sol=rhs/a,op2=a<0?FLIP[op]:op;
    $('#dl-eq',box).innerHTML=`${term(a,'x',true)} ${b<0?'−':'+'} ${Math.abs(b)} ${op} ${sg(c)}`;
    $('#dl-s',box).innerHTML=`<li><span class="s-expr">${term(a,'x',true)} ${op} ${sg(c)} ${b<0?'+':'−'} ${Math.abs(b)} = ${sg(rhs)}</span><span class="s-note">Resta ${sg(b)} en ambos lados. El signo no cambia.</span></li>
      <li><span class="s-expr">x <span class="tok${a<0?' hl':''}">${op2}</span> ${FR(sg(rhs),sg(a))} = ${nf(sol,3)}</span><span class="s-note">Divide entre ${sg(a)}. ${a<0?'<b>Como es negativo, el signo se invierte.</b>':'Como es positivo, el signo se mantiene.'}</span></li>`;
    const set=linSet(op2,sol),lo=Math.floor(sol)-6,hi=Math.ceil(sol)+6;
    $('#dl-nl',box).innerHTML=numberLine({W:cw($('#dl-nl',box)),lo,hi,sets:set});
    $('#dl-v',box).innerHTML=`Solución: <b>x ${op2} ${nf(sol,3)}</b> · en intervalo: <b>${intervalStr(set)}</b>. ${op2==='<'||op2==='>'?'Círculo vacío: el extremo no se incluye.':'Círculo lleno: el extremo sí se incluye.'}`;
  }
  function drawQ(){
    ['r1','r2'].forEach(p=>$(`#dq-${p}-o`,box).textContent=nf(s[p],1));
    const {r1,r2,sg:S,qop}=s,lo=Math.min(r1,r2),hi=Math.max(r1,r2),f=x=>S*(x-r1)*(x-r2);
    const sum=r1+r2,prod=r1*r2;$('#dq-eq',box).innerHTML=`${poly([[S,2],[-S*sum,1],[S*prod,0]].map(t=>[round(t[0],4),t[1]]))} ${qop} 0 &nbsp;⟺&nbsp; ${S<0?'−':''}(x ${r1<0?'+':'−'} ${nf(Math.abs(r1),1)})(x ${r2<0?'+':'−'} ${nf(Math.abs(r2),1)}) ${qop} 0`;
    const ints=lo===hi?[[-Infinity,lo],[lo,Infinity]]:[[-Infinity,lo],[lo,hi],[hi,Infinity]];
    const mid=([u,v])=>!Number.isFinite(u)?v-1:!Number.isFinite(v)?u+1:(u+v)/2,lab=([u,v])=>`(${Number.isFinite(u)?nf(u,1):'−∞'}; ${Number.isFinite(v)?nf(v,1):'∞'})`,sgn=v=>v>0?'+':v<0?'−':'0';
    $('#dq-tb',box).innerHTML=`<thead><tr><th>Intervalo</th>${ints.map(i=>`<th>${lab(i)}</th>`).join('')}</tr></thead><tbody>
      <tr><td>Punto de prueba</td>${ints.map(i=>`<td>${nf(mid(i),2)}</td>`).join('')}</tr>
      <tr><td>Signo del producto</td>${ints.map(i=>`<td>${sgn(f(mid(i)))}</td>`).join('')}</tr>
      <tr><td>¿Cumple ${qop} 0?</td>${ints.map(i=>{const ok=holds(qop,f(mid(i)));return`<td class="${ok?'ok':'bad'}">${ok?'sí':'no'}</td>`;}).join('')}</tr></tbody>`;
    const set=quadSet(S,qop,r1,r2);
    $('#dq-ch',box).innerHTML=plane({W:cw($('#dq-ch',box)),xmin:-8,xmax:8,ymin:-10,ymax:10,curves:[{f}],xsegs:set.filter(z=>!z.point).map(z=>({a:z.a,b:z.b})),
      points:[...new Set([r1,r2])].map(r=>({x:r,y:0,open:!(qop==='≤'||qop==='≥'),label:nf(r,1)}))});
    $('#dq-v',box).innerHTML=`Solución: <b>${intervalStr(set)}</b>`;
  }
  ['a','b','c'].forEach(p=>$(`#dl-${p}`,box).addEventListener('input',e=>{s[p]=+e.target.value;drawL();}));
  $('#dl-op',box).addEventListener('change',e=>{s.op=e.target.value;drawL();});
  ['r1','r2'].forEach(p=>$(`#dq-${p}`,box).addEventListener('input',e=>{s[p]=+e.target.value;drawQ();}));
  $('#dq-s',box).addEventListener('change',e=>{s.sg=+e.target.value;drawQ();});$('#dq-op',box).addEventListener('change',e=>{s.qop=e.target.value;drawQ();});
  drawL();drawQ();return()=>{drawL();drawQ();};
}
function quizDes(){
  const qs=[];const a=rnz(-6,-2),x0=rnz(-6,6),b=rint(-9,9),c=a*x0+b,op=pick(['<','≤','>','≥']),op2=FLIP[op];
  const iv=o=>intervalStr(linSet(o,x0)),inv=o=>({'<':'≤','≤':'<','>':'≥','≥':'>'})[o];
  qs.push({type:'mc',mono:true,text:`Resuelve <span class="data">${term(a,'x',true)} ${b<0?'−':'+'} ${Math.abs(b)} ${op} ${sg(c)}</span>`,options:uniqOpts(iv(op2),[iv(op),iv(inv(op2)),intervalStr(linSet(op2,-x0)),iv(inv(op)),intervalStr(linSet(op2,x0+1))]),answer:0,explain:`${term(a,'x',true)} ${op} ${sg(c-b)} → al dividir entre ${sg(a)} (negativo) el signo se invierte: x ${op2} ${sg(x0)} → <b>${iv(op2)}</b>.`});
  const lo=rint(0,4),hi=lo+rint(4,8),Fl=round(1.8*lo+32,1),Fh=round(1.8*hi+32,1);
  qs.push({type:'num',text:`Una cámara de refrigeración debe mantenerse entre ${nf(Fl,1)} °F y ${nf(Fh,1)} °F: <span class="data">${nf(Fl,1)} ≤ 1,8C + 32 ≤ ${nf(Fh,1)}</span>. ¿Cuál es la temperatura <b>máxima</b> permitida en °C?`,unit:'°C',answer:hi,tol:0.01,explain:`Resta 32 en las tres partes: ${nf(Fl-32,1)} ≤ 1,8C ≤ ${nf(Fh-32,1)}. Divide entre 1,8: ${lo} ≤ C ≤ ${hi}. Máxima: <b>${hi} °C</b>.`});
  let r1,r2;do{r1=rnz(-6,6);r2=rnz(-6,6);}while(r1===r2);const L=Math.min(r1,r2),H=Math.max(r1,r2),qo=pick(['<','>']);
  const inside=`(${sg(L)}; ${sg(H)})`,outside=`(−∞; ${sg(L)}) ∪ (${sg(H)}; ∞)`;
  qs.push({type:'mc',mono:true,text:`Resuelve <span class="data">${poly([[1,2],[-(r1+r2),1],[r1*r2,0]])} ${qo} 0</span>`,options:qo==='<'?uniqOpts(inside,[outside,`[${sg(L)}; ${sg(H)}]`,`(${sg(-H)}; ${sg(-L)})`,`(−∞; ${sg(L)})`,`(${sg(H)}; ∞)`]):uniqOpts(outside,[inside,`(−∞; ${sg(L)}] ∪ [${sg(H)}; ∞)`,`(−∞; ${sg(-H)}) ∪ (${sg(-L)}; ∞)`,`(${sg(H)}; ∞)`,`(−∞; ${sg(L)})`]),answer:0,
    explain:`Raíces: x = ${sg(L)} y x = ${sg(H)}. La parábola abre hacia arriba, así que es negativa entre las raíces y positiva fuera. Como pide ${qo} 0: <b>${qo==='<'?inside:outside}</b>.`});
  const A2=rint(2,5),B2=rint(-8,8),C2=rint(-10,10),op3=pick(['<','≤','>','≥']),sol=(C2-B2)/A2;
  const cands=shuffle([Math.floor(sol)-3,Math.floor(sol)-1,Math.ceil(sol)+1,Math.ceil(sol)+3,Math.round(sol)]).filter((v,i,ar)=>ar.indexOf(v)===i);
  const good=cands.filter(v=>holds(op3,A2*v+B2-C2)),bad=cands.filter(v=>!holds(op3,A2*v+B2-C2));
  if(good.length&&bad.length>=3){const g=good[0];qs.push({type:'mc',mono:true,text:`¿Cuál de estos valores cumple <span class="data">${A2}x ${B2<0?'−':'+'} ${Math.abs(B2)} ${op3} ${sg(C2)}</span>?`,options:[sg(g),...bad.slice(0,3).map(sg)],answer:0,explain:`La solución es x ${op3} ${nf(sol,3)}. Solo <b>x = ${sg(g)}</b> lo cumple: ${A2}·${ps(g)} ${B2<0?'−':'+'} ${Math.abs(B2)} = ${sg(A2*g+B2)} ${op3} ${sg(C2)} ✓`});}
  else qs.push({type:'mc',keepOrder:true,text:'Al multiplicar ambos lados de una desigualdad por −3, el signo…',options:['Se invierte','Se mantiene','Se convierte en igualdad','Depende del lado'],answer:0,explain:'Multiplicar o dividir por un número <b>negativo</b> invierte la desigualdad.'});
  const Fc=pick([1200,1500,2000,2400]),v=pick([0.8,1.2,1.5]),p=pick([2.5,3,3.5]),u=Math.ceil(Fc/(p-v)-1e-9);
  qs.push({type:'num',text:`Una planta tiene costos fijos de $${Fc} al mes y cada frasco cuesta $${nf(v,2)} producirlo; se vende a $${nf(p,2)}. ¿Cuántos frascos, como mínimo, debe vender para no perder? (ingreso ≥ costo)`,unit:'frascos',answer:u,tol:0,explain:`${nf(p,2)}x ≥ ${Fc} + ${nf(v,2)}x → ${nf(p-v,2)}x ≥ ${Fc} → x ≥ ${nf(Fc/(p-v),3)}. Como x es entero: <b>${u} frascos</b>.`});
  qs.push({type:'mc',keepOrder:true,text:'En una recta numérica, ¿qué indica un círculo vacío en el extremo de la solución?',options:['Que ese valor no se incluye (< o >)','Que ese valor sí se incluye (≤ o ≥)','Que la solución es vacía','Que la solución continúa hasta el infinito'],answer:0,explain:'Círculo vacío ↔ paréntesis ( ) ↔ < o >. Círculo lleno ↔ corchete [ ] ↔ ≤ o ≥.'});
  return qs;
}

/* ---------- 2.4 Sistemas 2×2 y desigualdades en dos variables ---------- */
const lineEq=(a,b,c)=>`${a?term(a,'x',true):''}${b?term(b,'y',!a):''}${!a&&!b?'0':''} = ${sg(c)}`;
function simSis(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Dos ecuaciones, dos rectas</h3><p class="ctx">Cada ecuación ax + by = c es una recta. La solución del sistema es el punto donde se cruzan. Prueba también los casos especiales.</p>
    <div class="btn-row"><button type="button" class="btn btn-ghost" data-pr="u">Solución única</button><button type="button" class="btn btn-ghost" data-pr="p">Rectas paralelas</button><button type="button" class="btn btn-ghost" data-pr="c">Rectas coincidentes</button></div>
    <div class="ctrls">${SL('s1-a','a₁',-6,6,1,2)}${SL('s1-b','b₁',-6,6,1,1)}${SL('s1-c','c₁',-12,12,1,7)}</div>
    <div class="ctrls">${SL('s2-a','a₂',-6,6,1,1)}${SL('s2-b','b₂',-6,6,1,-1)}${SL('s2-c','c₂',-12,12,1,2)}</div>
    <div class="expr" id="sy-eq"></div><div class="chart-wrap" id="sy-ch"></div><ol class="steps-list" id="sy-s"></ol><p class="verdict" id="sy-v"></p></div>
    <div class="part"><h3 class="sub">B. Desigualdades en dos variables: la región de mezclas posibles</h3><p class="ctx">Una panadería prepara una premezcla con <b>x</b> kg de harina de quinua y <b>y</b> kg de harina de trigo. Cada restricción es una desigualdad que deja un semiplano; la zona sombreada cumple todas a la vez. Los porcentajes de proteína son valores de ejemplo.</p>
    <div class="ctrls">${SL('rg-t','Capacidad de la mezcladora (kg)',20,100,5,60)}${SL('rg-p','Proteína mínima en el lote (kg)',2,10,0.5,6)}${SL('rg-q','Quinua máxima (% de la mezcla)',10,80,5,40)}</div>
    <div class="formula" id="rg-fx"></div>
    <div class="ctrls">${SL('rg-x','Punto de prueba: quinua x (kg)',0,100,1,15)}${SL('rg-y','Punto de prueba: trigo y (kg)',0,100,1,35)}</div>
    <div class="readouts" id="rg-ro"></div><div class="chart-wrap" id="rg-ch"></div><p class="note">Región sombreada: mezclas que cumplen todo. Puntos azules: vértices de la región. Punto ocre: tu punto de prueba.</p></div>`;
  const s={a1:2,b1:1,c1:7,a2:1,b2:-1,c2:2,T:60,P:6,Q:40,px:15,py:35};
  const ids=[['s1-a','a1'],['s1-b','b1'],['s1-c','c1'],['s2-a','a2'],['s2-b','b2'],['s2-c','c2']];
  function drawS(){
    ids.forEach(([id,k])=>{$('#'+id,box).value=s[k];$(`#${id}-o`,box).textContent=sg(s[k]);});
    const {a1,b1,c1,a2,b2,c2}=s,D=a1*b2-a2*b1,Dx=c1*b2-c2*b1,Dy=a1*c2-a2*c1;
    $('#sy-eq',box).innerHTML=`<span class="op">(1)</span> ${lineEq(a1,b1,c1)}<br><span class="op">(2)</span> ${lineEq(a2,b2,c2)}`;
    const ln=(a,b,c,cls)=>b!==0?{f:x=>(c-a*x)/b,cls}:null,vl=(a,b,c,cls)=>b===0&&a!==0?{x1:c/a,y1:-20,x2:c/a,y2:20,cls}:null;
    const curves=[ln(a1,b1,c1,''),ln(a2,b2,c2,'acc')].filter(Boolean),lines=[vl(a1,b1,c1,''),vl(a2,b2,c2,'acc')].filter(Boolean);
    let pts=[],v,cls='',steps='';
    if((a1===0&&b1===0)||(a2===0&&b2===0)){v='Una de las ecuaciones no tiene x ni y: no es una recta.';}
    else if(D!==0){const x=Dx/D,y=Dy/D;pts=[{x,y,label:`(${nf(x,2)}; ${nf(y,2)})`}];cls='ok';v=`<b>Solución única:</b> x = ${nf(x,3)}, y = ${nf(y,3)}. Las rectas se cortan en un punto.`;
      steps=`<li><span class="s-expr">Multiplica la 1.ª por ${ps(b2)} y la 2.ª por ${ps(b1)}, y réstalas para eliminar y:</span><span class="s-note">(${ps(a1)}·${ps(b2)} − ${ps(a2)}·${ps(b1)})x = ${ps(c1)}·${ps(b2)} − ${ps(c2)}·${ps(b1)} → ${sg(D)}x = ${sg(Dx)}</span></li>
        <li><span class="s-expr">x = ${FR(sg(Dx),sg(D))} = ${nf(x,3)}</span><span class="s-note">Despeja x.</span></li>
        <li><span class="s-expr">Reemplaza x en una ecuación y despeja y: y = ${nf(y,3)}</span><span class="s-note">Comprueba en la otra ecuación: ${sg(a2)}·${nf(x,2)} ${b2<0?'−':'+'} ${Math.abs(b2)}·${nf(y,2)} = ${nf(a2*x+b2*y,3)} ✓</span></li>`;}
    else if(Dx===0&&Dy===0){cls='';v='<b>Infinitas soluciones:</b> las dos ecuaciones son la misma recta (una es múltiplo de la otra). Todo punto de la recta es solución.';}
    else{cls='bad';v='<b>Sin solución:</b> las rectas son paralelas (misma pendiente, distinto intercepto) y nunca se cortan.';}
    $('#sy-ch',box).innerHTML=plane({W:cw($('#sy-ch',box)),xmin:-10,xmax:10,ymin:-10,ymax:10,curves,lines,points:pts});
    $('#sy-s',box).innerHTML=steps;$('#sy-v',box).className='verdict '+cls;$('#sy-v',box).innerHTML=v;
  }
  function drawR(){
    const {T,P,Q,px,py}=s,q=Q/100;['t','p','q','x','y'].forEach((k,i)=>$(`#rg-${k}-o`,box).textContent=nf([T,P,Q,px,py][i],1));
    $('#rg-x',box).max=Math.ceil(T*1.2);$('#rg-y',box).max=Math.ceil(T*1.2);
    const cons=[{t:`x + y ≤ ${nf(T,0)}`,d:'capacidad',a:1,b:1,c:T},{t:`0,14x + 0,11y ≥ ${nf(P,1)}`,d:'proteína',a:-0.14,b:-0.11,c:-P},{t:`x ≤ ${nf(q,2)}(x + y) → ${nf(1-q,2)}x − ${nf(q,2)}y ≤ 0`,d:'quinua máxima',a:1-q,b:-q,c:0},{t:'x ≥ 0, y ≥ 0',d:'no negativas',a:-1,b:0,c:0},{t:'',a:0,b:-1,c:0}];
    $('#rg-fx',box).innerHTML=cons.filter(c=>c.t).map(c=>`${c.t} <span class="muted">(${c.d})</span>`).join('<br>');
    const M=T*1.2;let poly=[[0,0],[M,0],[M,M],[0,M]];cons.forEach(c=>{poly=clipHalf(poly,c.a,c.b,c.c);});
    const vtx=poly.filter((p,i)=>{const n=poly[(i+1)%poly.length];return Math.hypot(p[0]-n[0],p[1]-n[1])>1e-6;});
    const ok=cons.map(c=>c.a*px+c.b*py<=c.c+1e-9),all=ok.every(Boolean);
    $('#rg-ro',box).innerHTML=`<div class="ro"><span>Capacidad ${ok[0]?'· cumple':'· no cumple'}</span><b>${nf(px+py,1)} kg ${ok[0]?'✓':'✗'}</b></div><div class="ro"><span>Proteína ${ok[1]?'· cumple':'· no cumple'}</span><b>${nf(0.14*px+0.11*py,2)} kg ${ok[1]?'✓':'✗'}</b></div><div class="ro"><span>Quinua ${ok[2]?'· cumple':'· no cumple'}</span><b>${px+py?nf(px/(px+py)*100,1):'0'} % ${ok[2]?'✓':'✗'}</b></div><div class="ro hl"><span>¿Mezcla posible?</span><b>${all?'Sí':'No'}</b></div>`;
    const lineF=(a,b,c)=>({f:x=>(c-a*x)/b,cls:'thin ink'});
    $('#rg-ch',box).innerHTML=plane({W:cw($('#rg-ch',box)),xmin:0,xmax:M,ymin:0,ymax:M,polys:vtx.length>=3?[{pts:vtx}]:[],curves:[lineF(1,1,T),lineF(0.14,0.11,P),lineF(1-q,-q,0)],
      points:vtx.map(p=>({x:p[0],y:p[1],cls:'data',r:4.5,label:vtx.length<=6?`(${nf(p[0],1)}; ${nf(p[1],1)})`:''})).concat([{x:px,y:py,r:6.5}]),label:'Región factible de la mezcla'});
    if(vtx.length<3)$('#rg-ro',box).insertAdjacentHTML('beforeend','<div class="ro"><span>Región</span><b>vacía: ninguna mezcla cumple todo</b></div>');
  }
  ids.forEach(([id,k])=>$('#'+id,box).addEventListener('input',e=>{s[k]=+e.target.value;drawS();}));
  const PR={u:[2,1,7,1,-1,2],p:[1,-2,-4,-2,4,6],c:[1,2,4,2,4,8]};
  box.querySelectorAll('[data-pr]').forEach(b=>b.addEventListener('click',()=>{const v=PR[b.dataset.pr];['a1','b1','c1','a2','b2','c2'].forEach((k,i)=>s[k]=v[i]);drawS();}));
  [['rg-t','T'],['rg-p','P'],['rg-q','Q'],['rg-x','px'],['rg-y','py']].forEach(([id,k])=>$('#'+id,box).addEventListener('input',e=>{s[k]=+e.target.value;drawR();}));
  drawS();drawR();return()=>{drawS();drawR();};
}
function quizSis(){
  const qs=[];let a1,b1,a2,b2;do{a1=rnz(-5,5);b1=rnz(-5,5);a2=rnz(-5,5);b2=rnz(-5,5);}while(a1*b2-a2*b1===0);
  const x=rnz(-6,6),y=rint(-6,6),c1=a1*x+b1*y,c2=a2*x+b2*y,sys=`<span class="data">${lineEq(a1,b1,c1)}</span> y <span class="data">${lineEq(a2,b2,c2)}</span>`;
  qs.push({type:'num',text:`Resuelve el sistema ${sys}. ¿Cuánto vale <b>x</b>?`,answer:x,tol:0,explain:`Por reducción o sustitución se obtiene x = <b>${sg(x)}</b> (y = ${sg(y)}). Comprueba: ${sg(a1)}·${ps(x)} ${b1<0?'−':'+'} ${Math.abs(b1)}·${ps(y)} = ${sg(c1)} ✓`});
  qs.push({type:'num',text:`En el mismo sistema, ¿cuánto vale <b>y</b>?`,answer:y,tol:0,explain:`Reemplaza x = ${sg(x)} en la primera ecuación: ${sg(b1)}y = ${sg(c1)} − ${ps(a1*x)} → y = <b>${sg(y)}</b>.`});
  const kind=pick(['u','p','c']);let A=rnz(-4,4),B=rnz(-4,4),C=rint(-8,8),m=pick([2,-2,3,-1]);let A2,B2,C2;
  if(kind==='u'){do{A2=rnz(-4,4);B2=rnz(-4,4);}while(A*B2-A2*B===0);C2=rint(-8,8);}else{A2=m*A;B2=m*B;C2=kind==='c'?m*C:m*C+pick([1,2,-3]);}
  qs.push({type:'mc',keepOrder:true,text:`¿Cuántas soluciones tiene el sistema <span class="data">${lineEq(A,B,C)}</span> y <span class="data">${lineEq(A2,B2,C2)}</span>?`,options:['Una sola','Ninguna','Infinitas'],answer:{u:0,p:1,c:2}[kind],
    explain:kind==='u'?'Las rectas tienen pendientes distintas, así que se cortan en <b>un solo punto</b>.':kind==='p'?`La segunda ecuación tiene los coeficientes de x e y multiplicados por ${sg(m)}, pero el término independiente no: rectas <b>paralelas</b>, sin solución.`:`La segunda ecuación es la primera multiplicada por ${sg(m)}: es la <b>misma recta</b>, infinitas soluciones.`});
  const ia=rnz(-3,3),ib=rnz(-3,3),ic=rint(-6,6),ja=rnz(-3,3),jb=rnz(-3,3),jc=rint(-6,6);
  const P=[];for(let k=0;k<200&&P.length<12;k++){const p=[rint(-5,5),rint(-5,5)];if(!P.some(q=>q[0]===p[0]&&q[1]===p[1]))P.push(p);}
  const inR=p=>ia*p[0]+ib*p[1]<=ic&&ja*p[0]+jb*p[1]>=jc,g=P.filter(inR),bdd=P.filter(p=>!inR(p));
  if(g.length&&bdd.length>=3){const pt=p=>`(${sg(p[0])}; ${sg(p[1])})`;
    qs.push({type:'mc',mono:true,text:`¿Cuál de estos puntos pertenece a la región <span class="data">${lineEq(ia,ib,ic).replace('=','≤')}</span> y <span class="data">${lineEq(ja,jb,jc).replace('=','≥')}</span>?`,options:[pt(g[0]),...bdd.slice(0,3).map(pt)],answer:0,
      explain:`Reemplaza el punto en ambas desigualdades: ${ia}·${ps(g[0][0])} ${ib<0?'−':'+'} ${Math.abs(ib)}·${ps(g[0][1])} = ${sg(ia*g[0][0]+ib*g[0][1])} ≤ ${sg(ic)} ✓ y ${ja}·${ps(g[0][0])} ${jb<0?'−':'+'} ${Math.abs(jb)}·${ps(g[0][1])} = ${sg(ja*g[0][0]+jb*g[0][1])} ≥ ${sg(jc)} ✓. Los demás fallan al menos una.`});}
  else qs.push({type:'mc',keepOrder:true,text:'Para saber qué lado de la recta 2x + 3y = 6 cumple 2x + 3y ≤ 6, lo más práctico es…',options:['Probar un punto que no esté en la recta, como (0; 0)','Despejar x','Calcular la pendiente','Graficar otra recta paralela'],answer:0,explain:'Con el <b>punto de prueba</b> (0; 0): 0 ≤ 6 es verdadero, así que se sombrea el lado que contiene al origen.'});
  const L=pick([100,120,150,200]),pA=pick([1.2,1.5,1.8]),pB=pick([0.6,0.8,0.9]),xA=rint(2,Math.floor(L/10)-1)*10,yB=L-xA,Ct=round(pA*xA+pB*yB,2);
  qs.push({type:'num',text:`Un néctar de ${L} L se prepara con jugo A ($${nf(pA,2)}/L) y jugo B ($${nf(pB,2)}/L). Si el costo total es $${nf(Ct,2)}, ¿cuántos litros de jugo A se usaron?`,unit:'L',answer:xA,tol:0.05,explain:`x + y = ${L} y ${nf(pA,2)}x + ${nf(pB,2)}y = ${nf(Ct,2)}. Reemplaza y = ${L} − x: ${nf(pA-pB,2)}x = ${nf(Ct,2)} − ${nf(pB*L,2)} → x = <b>${xA} L</b> (y = ${yB} L).`});
  qs.push({type:'mc',keepOrder:true,text:'Si al resolver un sistema 2×2 llegas a una igualdad falsa como 0 = 5, el sistema…',options:['No tiene solución (rectas paralelas)','Tiene infinitas soluciones','Tiene solución x = 0','Tiene solución x = 5'],answer:0,explain:'Una contradicción (0 = 5) indica rectas <b>paralelas</b>: no hay ningún punto común. Si llegas a 0 = 0, son la misma recta (infinitas soluciones).'});
  return qs;
}

/* ---------- Catálogo ---------- */
const MODS=[
 {id:'graficas',n:'2.1',short:'Gráficas',title:'Representación gráfica de funciones',desc:'Familias de funciones, transformaciones y un modelo lineal de planta.',
  lead:'Una gráfica muestra de un vistazo cómo cambia una magnitud: dónde crece, dónde corta los ejes y qué valores puede tomar.',
  idea:`<p>Una <b>función</b> asigna a cada x un único valor y = f(x). Su <b>dominio</b> son los x permitidos; su <b>rango</b>, los y que produce.</p>
   <div class="formula">Lineal: y = mx + b (m = pendiente, b = corte con el eje y)<br>Pendiente entre dos puntos: m = ${FR('y₂ − y₁','x₂ − x₁')}<br>Forma transformada: y = a·f(x − h) + k</div>
   <ul><li><b>h</b> mueve la gráfica a la derecha (h &gt; 0) o a la izquierda (h &lt; 0). Ojo: en (x − 3) el valor es h = 3.</li><li><b>k</b> la sube (k &gt; 0) o la baja (k &lt; 0).</li><li><b>a</b> negativa la refleja; |a| &gt; 1 la estira y |a| &lt; 1 la achata.</li></ul>`,
  simHint:'Cambia la familia y los parámetros y observa la gráfica, la tabla y los cortes.',sim:simGraf,quiz:quizGraf},
 {id:'ecuaciones',n:'2.2',short:'Ecuaciones',title:'Ecuaciones lineales y cuadráticas',desc:'La balanza, mezclas en planta y la fórmula general.',
  lead:'Resolver una ecuación es encontrar el valor que la hace verdadera. En planta aparece al calcular mezclas, tiempos y dosis.',
  idea:`<p><b>Lineal:</b> deja la x sola haciendo la misma operación en ambos lados (sumar, restar, multiplicar o dividir).</p>
   <p><b>Cuadrática ax² + bx + c = 0:</b> factoriza si se puede; si no, usa la fórmula general.</p>
   <div class="formula">x = ${FR('−b ± √(b² − 4ac)','2a')}<br>Δ = b² − 4ac: Δ &gt; 0 dos soluciones · Δ = 0 una · Δ &lt; 0 ninguna real</div>
   <p class="tip"><b>Mezclas (cuadrado de Pearson):</b> si mezclas x kg de un ingrediente de concentración A con el resto de concentración B para obtener T kg de concentración C: A·x + B·(T − x) = C·T.</p>`,
  simHint:'Equilibra la balanza paso a paso y mueve a, b y c de una cuadrática.',sim:simEc,quiz:quizEc},
 {id:'desigualdades',n:'2.3',short:'Desigualdades',title:'Desigualdades lineales y cuadráticas',desc:'Rangos permitidos, intervalos y la regla del signo.',
  lead:'En planta casi nada es un valor exacto: se trabaja con rangos permitidos (temperatura entre 2 y 8 °C, al menos 65 °Brix). Esos rangos se escriben con desigualdades.',
  idea:`<ul><li>Se resuelven como ecuaciones, pero si <b>multiplicas o divides entre un negativo, el signo se invierte</b>.</li>
   <li>La solución es un <b>intervalo</b>: ( ) excluye el extremo (&lt;, &gt;) y [ ] lo incluye (≤, ≥).</li>
   <li><b>Cuadráticas:</b> halla las raíces, divide la recta en intervalos y prueba un punto de cada uno.</li></ul>
   <div class="formula">−2x + 4 ≤ −6 → −2x ≤ −10 → x ≥ 5 → [5; ∞)<br>(x + 2)(x − 3) &lt; 0 → −2 &lt; x &lt; 3 → (−2; 3)</div>`,
  simHint:'Observa cuándo se invierte el signo y qué intervalos cumplen la desigualdad.',sim:simDes,quiz:quizDes},
 {id:'sistemas',n:'2.4',short:'Dos variables',title:'Ecuaciones y desigualdades con dos variables',desc:'Sistemas 2×2 y regiones del plano.',
  lead:'Muchos problemas tienen dos incógnitas a la vez, como cuánto usar de dos ingredientes. Con dos ecuaciones se encuentra un punto; con desigualdades, una región de opciones posibles.',
  idea:`<p>Un <b>sistema 2×2</b> son dos ecuaciones lineales con x e y. Gráficamente son dos rectas:</p>
   <div class="types"><div class="type"><b>Se cortan</b><span>Una sola solución: el punto de corte.</span></div><div class="type"><b>Paralelas</b><span>Ninguna solución.</span></div><div class="type"><b>Coincidentes</b><span>Infinitas soluciones.</span></div><div class="type"><b>Métodos</b><span>Sustitución, igualación, reducción o gráfico.</span></div></div>
   <p>Una <b>desigualdad</b> ax + by ≤ c deja un semiplano. Para saber cuál, usa un <b>punto de prueba</b> (por ejemplo, el origen): si lo cumple, sombrea su lado. Varias desigualdades juntas forman una <b>región factible</b>.</p>`,
  simHint:'Cruza dos rectas y explora la región de mezclas posibles.',sim:simSis,quiz:quizSis},
];

CIMA.addUnit(META_MN,{id:'u2',orden:2,nombre:'Unidad 2 · Gráficas, ecuaciones y desigualdades',topics:MODS});
})();
