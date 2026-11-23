/* =====================================================================
   CIMA · NIVELACIÓN (v1.3) · temas de refuerzo para todas las materias
   1 La sumatoria (Σ) · 2 Despejar una variable · 3 Porcentajes,
   proporciones y redondeo · 4 Del enunciado a la ecuación
   No tienen certificado: CIMA los sugiere cuando hacen falta.
   ===================================================================== */
(function(){
"use strict";
const META={id:'nivelacion',nombre:'Nivelación',orden:5,nivel:'Nivelación · para todas las materias',descripcion:'Repasos cortos de matemática que usan todas las materias: sumatoria, despejes, porcentajes y redondeo, y cómo pasar de un enunciado a la ecuación.'};
const sub=n=>String(n).split('').map(d=>'₀₁₂₃₄₅₆₇₈₉'[+d]).join('');
const spP=v=>{let s=Math.abs(v).toFixed(3).replace('.',',');if(s.startsWith('0,'))s=s.slice(1);return(v<0?'-':'')+s;};
/* caja numérica reutilizable dentro de los simuladores */
function numBox(host,q,onDone){const d=document.createElement('div');d.className='mini';d.innerHTML=`<p><b>${q.text}</b></p><div class="ans-row"><input class="inp" inputmode="decimal" aria-label="Respuesta"><button type="button" class="btn">Comprobar</button></div><p class="fb"></p>`;host.appendChild(d);
  const inp=d.querySelector('input'),bt=d.querySelector('button'),fb=d.querySelector('.fb');
  const go=()=>{const v=readAnswer(inp.value,q);if(!Number.isFinite(v)){fb.textContent='Escribe un número (puedes usar coma decimal).';return;}const ok=answerOk(v,q);inp.disabled=bt.disabled=true;inp.classList.add(ok?'good':'bad');fb.innerHTML=(ok?'<strong>Bien.</strong> ':'<strong>No.</strong> ')+q.explain;if(onDone)onDone(ok);};
  bt.addEventListener('click',go);inp.addEventListener('keydown',e=>{if(e.key==='Enter')go();});return d;}
function mcBox(host,text,opts,onDone){const d=document.createElement('div');d.className='mini';d.innerHTML=`<p><b>${text}</b></p><div class="opts">${opts.map((o,j)=>`<button type="button" class="opt" data-j="${j}">${o[0]}</button>`).join('')}</div><p class="fb"></p>`;host.appendChild(d);
  d.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{const o=opts[+b.dataset.j];d.querySelectorAll('.opt').forEach((x,j)=>{x.disabled=true;if(opts[j][1])x.classList.add('is-ok');});if(!o[1])b.classList.add('is-bad');d.querySelector('.fb').innerHTML=(o[1]?'<strong>Bien.</strong> ':'<strong>No.</strong> ')+(o[2]||'');if(onDone)onDone(o[1]);}));return d;}

/* =============== 1. La sumatoria =============== */
function genTable(){const t=3,r=4,y=Array.from({length:t},()=>Array.from({length:r},()=>rint(2,9)));return{t,r,y};}
const EXPR=[
 {k:'all',lab:'Σy',d:'Suma de <b>todos</b> los datos.',cells:(T)=>T.y.flatMap((r,i)=>r.map((_,j)=>[i,j])),val:T=>ST.sum(T.y.flat()),how:T=>T.y.flat().join(' + ')},
 {k:'sq',lab:'Σy²',d:'Cada dato al cuadrado y <b>después</b> se suma.',cells:T=>T.y.flatMap((r,i)=>r.map((_,j)=>[i,j])),val:T=>ST.sum(T.y.flat().map(v=>v*v)),how:T=>T.y.flat().map(v=>v+'²').join(' + ')},
 {k:'sqs',lab:'(Σy)²',d:'Primero se suma todo y <b>después</b> se eleva al cuadrado.',cells:T=>T.y.flatMap((r,i)=>r.map((_,j)=>[i,j])),val:T=>ST.sum(T.y.flat())**2,how:T=>`(${ST.sum(T.y.flat())})²`},
 {k:'one',lab:'y'+sub(23),d:'Un solo dato: tratamiento 2, réplica 3. El primer subíndice es la fila (i) y el segundo la columna (j).',cells:()=>[[1,2]],val:T=>T.y[1][2],how:T=>String(T.y[1][2])},
 {k:'row',lab:'Y'+sub(2)+'.',d:'Total del tratamiento 2: el punto indica que se sumó sobre las réplicas (j).',cells:T=>T.y[1].map((_,j)=>[1,j]),val:T=>ST.sum(T.y[1]),how:T=>T.y[1].join(' + ')},
 {k:'col',lab:'Y.'+sub(3),d:'Total de la réplica 3: el punto en la primera posición indica que se sumó sobre los tratamientos (i).',cells:T=>T.y.map((_,i)=>[i,2]),val:T=>ST.sum(T.y.map(r=>r[2])),how:T=>T.y.map(r=>r[2]).join(' + ')},
 {k:'rows2',lab:'ΣY'+'ᵢ'+'.²',d:'El total de cada tratamiento al cuadrado, y se suman. Es la pieza de SC<sub>Trat</sub>.',cells:T=>T.y.flatMap((r,i)=>r.map((_,j)=>[i,j])),val:T=>ST.sum(T.y.map(r=>ST.sum(r)**2)),how:T=>T.y.map(r=>ST.sum(r)+'²').join(' + ')},
 {k:'mean',lab:'ȳ'+sub(1)+'.',d:'Media del tratamiento 1: su total dividido entre las réplicas.',cells:T=>T.y[0].map((_,j)=>[0,j]),val:T=>ST.sum(T.y[0])/T.r,how:T=>`(${T.y[0].join(' + ')}) / ${T.r}`}];
function simSum(box){let T=genTable();
  box.innerHTML=`<div class="part"><h3 class="sub">A. Mira qué datos entran en cada suma</h3><p class="ctx">Tres tratamientos (filas, i = 1, 2, 3) con cuatro réplicas cada uno (columnas, j = 1…4). Toca una expresión.</p>
   <div class="two"><div class="table-wrap" id="sm-t"></div><div><div class="seg seg-wrap" id="sm-b">${EXPR.map(e=>`<button type="button" data-k="${e.k}">${e.lab}</button>`).join('')}</div><div class="formula" id="sm-o">Toca una expresión para verla.</div></div></div>
   <div class="btn-row"><button type="button" class="btn btn-ghost" id="sm-n">Otros datos</button></div></div>
   <div class="part"><h3 class="sub">B. La diferencia que más confunde: Σy² frente a (Σy)²</h3><div id="sm-c"></div></div>
   <div class="part"><h3 class="sub">C. Practica</h3><div id="sm-p"></div><div class="btn-row"><button type="button" class="btn btn-ghost" id="sm-pn">Otro ejercicio</button></div></div>`;
  const tbl=(on=[])=>{const has=(i,j)=>on.some(c=>c[0]===i&&c[1]===j);$('#sm-t',box).innerHTML=`<table class="tbl sumt"><thead><tr><th></th>${Array.from({length:T.r},(_,j)=>`<th>j = ${j+1}</th>`).join('')}<th>Total Y<sub>i.</sub></th></tr></thead><tbody>${T.y.map((r,i)=>`<tr><th>i = ${i+1}</th>${r.map((v,j)=>`<td class="${has(i,j)?'on':''}">${v}</td>`).join('')}<td class="tot">${ST.sum(r)}</td></tr>`).join('')}<tr><th>Y<sub>.j</sub></th>${Array.from({length:T.r},(_,j)=>`<td class="tot">${ST.sum(T.y.map(r=>r[j]))}</td>`).join('')}<td class="tot"><b>${ST.sum(T.y.flat())}</b></td></tr></tbody></table>`;};
  const show=k=>{const e=EXPR.find(x=>x.k===k);box.querySelectorAll('#sm-b button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===k));tbl(e.cells(T));$('#sm-o',box).innerHTML=`<b>${e.lab}</b> · ${e.d}<br>${e.lab} = ${e.how(T)} = <b>${nf(e.val(T),2)}</b>`;};
  const cmp=()=>{const v=T.y.flat(),a=ST.sum(v.map(x=>x*x)),b=ST.sum(v)**2;$('#sm-c',box).innerHTML=`<div class="readouts"><div class="ro"><span>Σy² (cada dato al cuadrado y luego se suma)</span><b>${a}</b></div><div class="ro"><span>(Σy)² (se suma y luego se eleva)</span><b>${b}</b></div></div><p class="note">Son números muy distintos. En el ANOVA, FC = (Σy)²/N y SC<sub>Total</sub> = Σy² − FC: si se confunden, la tabla entera sale mal.</p>`;};
  const prac=()=>{const P=$('#sm-p',box);P.innerHTML='';const e=pick(EXPR.filter(x=>x.k!=='mean')),cells=e.cells(T);tbl(cells);numBox(P,{text:`Con la tabla de arriba (las celdas que entran están resaltadas), calcula <b>${e.lab}</b>.`,answer:e.val(T),tol:0,explain:`${e.lab} = ${e.how(T)} = <b>${e.val(T)}</b>.`});};
  box.querySelectorAll('#sm-b button').forEach(b=>b.addEventListener('click',()=>show(b.dataset.k)));
  $('#sm-n',box).addEventListener('click',()=>{T=genTable();tbl();cmp();prac();$('#sm-o',box).textContent='Toca una expresión para verla.';});$('#sm-pn',box).addEventListener('click',prac);
  tbl();cmp();prac();return null;}
function quizSum(){const qs=[],x=Array.from({length:5},()=>rint(2,9)),s=ST.sum(x),m=s/5;
  qs.push({type:'num',text:`Con x = ${x.join('; ')}, calcula <b>Σx</b>.`,answer:s,tol:0,explain:`${x.join(' + ')} = <b>${s}</b>.`});
  qs.push({type:'num',text:`Con los mismos datos (${x.join('; ')}), calcula <b>Σx²</b>.`,answer:ST.sum(x.map(v=>v*v)),tol:0,explain:`${x.map(v=>v+'²').join(' + ')} = <b>${ST.sum(x.map(v=>v*v))}</b>.`});
  qs.push({type:'num',text:`Y ahora <b>(Σx)²</b>.`,answer:s*s,tol:0,explain:`(${s})² = <b>${s*s}</b>. Compárala con Σx²: no son iguales.`});
  qs.push({type:'num',text:`Con x = ${x.join('; ')}, calcula Σ(x − x̄)², sabiendo que x̄ = ${nf(m,1)} (dos decimales).`,answer:round(ST.sum(x.map(v=>(v-m)**2)),2),explain:`${x.map(v=>`(${v} − ${nf(m,1)})²`).join(' + ')} = <b>${fmt(ST.sum(x.map(v=>(v-m)**2)),2)}</b>. Es la suma de cuadrados que va en la varianza.`});
  qs.push({type:'mc',text:'En un DCA, ¿qué significa Y<sub>3.</sub>?',options:['El total del tratamiento 3 (suma de sus réplicas)','El dato de la réplica 3','La media general','El total de la réplica 3'],answer:0,explain:'El punto indica el índice sobre el que se sumó: aquí las réplicas del tratamiento 3.'});
  qs.push({type:'mc',text:'En y<sub>ij</sub>, ¿qué indica cada subíndice en un DCA?',options:['i el tratamiento, j la réplica','i la réplica, j el tratamiento','i el bloque, j el factor','Ambos indican la réplica'],answer:0,explain:'Por convención, el primer subíndice es el tratamiento (fila) y el segundo la réplica.'});
  return qs;}

/* =============== 2. Despejar una variable =============== */
const DESP=[
 {f:'z = (x − μ) / σ',goal:'x',ctx:'Para hallar el peso que deja un 5 % de fundas por debajo, se despeja x de la estandarización.',
  st:[['Multiplica ambos lados por σ','z·σ = x − μ',['Divide ambos lados entre σ','Resta μ a ambos lados']],['Suma μ a ambos lados','x = μ + z·σ',['Resta μ a ambos lados','Multiplica por z']]],
  gen:()=>{const mu=rint(140,160),s=round(rnd(2,5),1),z=pick([-1.645,1.645,-1.96,1.96,-2.33]);return{vals:`μ = ${mu} g, σ = ${nf(s,1)} g y z = ${nf(z,3)}`,ans:round(mu+z*s,2),how:`x = ${mu} + (${nf(z,3)})(${nf(s,1)})`};}},
 {f:'E = z · σ / √n',goal:'n',ctx:'Para saber cuántas muestras tomar con un margen de error dado, se despeja n.',
  st:[['Multiplica ambos lados por √n','E·√n = z·σ',['Eleva al cuadrado','Divide entre z']],['Divide ambos lados entre E','√n = z·σ / E',['Multiplica por E','Resta E']],['Eleva ambos lados al cuadrado','n = (z·σ / E)²',['Saca raíz cuadrada','Multiplica por 2']]],
  gen:()=>{const s=round(rnd(1.5,4),1),E=pick([0.5,0.8,1]),z=1.96,n=(z*s/E)**2;return{vals:`z = 1,96, σ = ${nf(s,1)} y E = ${nf(E,1)}`,ans:round(n,2),how:`n = (1,96 × ${nf(s,1)} / ${nf(E,1)})²`,note:'En la práctica se redondea hacia arriba, al entero siguiente.'};}},
 {f:'C₁ · V₁ = C₂ · V₂',goal:'V₁',ctx:'Para preparar una dilución en el laboratorio se despeja el volumen de la solución concentrada.',
  st:[['Divide ambos lados entre C₁','V₁ = C₂ · V₂ / C₁',['Multiplica por C₁','Resta C₂']]],
  gen:()=>{const c1=pick([0.5,1,2]),c2=pick([0.05,0.1,0.2]),v2=pick([100,250,500]);return{vals:`C₁ = ${nf(c1,2)} N, C₂ = ${nf(c2,2)} N y V₂ = ${v2} mL`,ans:round(c2*v2/c1,2),how:`V₁ = ${nf(c2,2)} × ${v2} / ${nf(c1,2)}`};}},
 {f:'ŷ = b₀ + b₁ · x',goal:'x',ctx:'Con una recta de regresión, se despeja x para saber qué valor de proceso da la respuesta que quieres.',
  st:[['Resta b₀ a ambos lados','ŷ − b₀ = b₁ · x',['Divide entre b₀','Suma b₀']],['Divide ambos lados entre b₁','x = (ŷ − b₀) / b₁',['Multiplica por b₁','Resta b₁']]],
  gen:()=>{const b0=round(rnd(5,20),2),b1=round(rnd(0.4,2.5),3),y=round(b0+b1*rint(5,30),1);return{vals:`b₀ = ${nf(b0,2)}, b₁ = ${nf(b1,3)} y la respuesta deseada ŷ = ${nf(y,1)}`,ans:round((y-b0)/b1,2),how:`x = (${nf(y,1)} − ${nf(b0,2)}) / ${nf(b1,3)}`};}},
 {f:'F = CM_Trat / CM_E',goal:'CM_E',ctx:'Si conoces F y la media cuadrática del tratamiento, puedes recuperar CM_E de una tabla incompleta.',
  st:[['Multiplica ambos lados por CM_E','F · CM_E = CM_Trat',['Divide entre CM_Trat','Resta F']],['Divide ambos lados entre F','CM_E = CM_Trat / F',['Multiplica por F','Suma F']]],
  gen:()=>{const cm=round(rnd(5,60),2),F=round(rnd(2,12),2);return{vals:`CM_Trat = ${nf(cm,2)} y F = ${nf(F,2)}`,ans:round(cm/F,2),how:`CM_E = ${nf(cm,2)} / ${nf(F,2)}`};}},
 {f:'Cp = (LSE − LIE) / (6σ)',goal:'σ',ctx:'En Calidad, para saber qué variación máxima permite un Cp objetivo, se despeja σ.',
  st:[['Multiplica ambos lados por 6σ','6σ · Cp = LSE − LIE',['Divide entre 6','Resta LIE']],['Divide ambos lados entre 6·Cp','σ = (LSE − LIE) / (6·Cp)',['Multiplica por Cp','Resta 6']]],
  gen:()=>{const lie=rint(95,98),lse=lie+rint(4,8),cp=pick([1,1.33,1.5]);return{vals:`LIE = ${lie}, LSE = ${lse} y Cp = ${nf(cp,2)}`,ans:round((lse-lie)/(6*cp),2),how:`σ = (${lse} − ${lie}) / (6 × ${nf(cp,2)})`};}}];
function simDesp(box){let D,G;
  box.innerHTML=`<div class="part"><h3 class="sub">Despeja paso a paso</h3><p class="note">Regla de oro: lo que haces a un lado del igual, lo haces al otro. Se “deshace” en orden inverso: primero lo que suma o resta, al final lo que multiplica o eleva.</p><div id="dp"></div><div class="btn-row"><button type="button" class="btn btn-ghost" id="dp-n">Otra fórmula</button></div></div>`;
  const load=()=>{let n;do{n=pick(DESP);}while(n===D&&DESP.length>1);D=n;G=D.gen();const host=$('#dp',box);host.innerHTML=`<p class="ctx">${D.ctx}</p><div class="formula" id="dp-f">${D.f}</div><p><b>Despeja ${D.goal}.</b></p><div id="dp-s"></div>`;
    const S=$('#dp-s',host);const step=i=>{if(i>=D.st.length){numBox(S,{text:`Ahora úsala: con ${G.vals}, calcula ${D.goal} (dos decimales).`,answer:G.ans,explain:`${G.how} = <b>${fmt(G.ans,2)}</b>.${G.note?' '+G.note:''}`});return;}
      const s=D.st[i];mcBox(S,`Paso ${i+1}: ¿qué haces?`,shuffle([[s[0],true,`Queda <b>${s[1]}</b>.`],...s[2].map(w=>[w,false,`Así no se aísla ${D.goal}. Lo correcto: ${s[0].toLowerCase()} → <b>${s[1]}</b>.`])]),()=>{$('#dp-f',host).innerHTML=s[1];step(i+1);});};step(0);};
  $('#dp-n',box).addEventListener('click',load);load();return null;}
function quizDesp(){const qs=[];shuffle(DESP).slice(0,4).forEach(D=>{const G=D.gen();qs.push({type:'num',text:`A partir de <b>${D.f}</b>, despeja ${D.goal} y calcula su valor con ${G.vals} (dos decimales).`,answer:G.ans,explain:`${D.st[D.st.length-1][1]} → ${G.how} = <b>${fmt(G.ans,2)}</b>.`});});
  const D=pick(DESP);qs.push({type:'mc',text:`Para despejar ${D.goal} de <b>${D.f}</b>, ¿cuál es el primer paso?`,options:[D.st[0][0],...D.st[0][2]],answer:0,explain:`${D.st[0][0]} → ${D.st[0][1]}.`});
  qs.push({type:'mc',text:'Al despejar, ¿qué regla siempre se cumple?',options:['Lo que se hace a un lado del igual se hace al otro','Los números pasan al otro lado con el mismo signo','Siempre se divide primero','Se puede cambiar solo un lado'],answer:0,explain:'Una ecuación es una balanza: para mantener la igualdad, cada operación se aplica a ambos lados.'});
  return qs;}

/* =============== 3. Porcentajes, proporciones y redondeo =============== */
function roundTxt(v,d){return nf(round(v,d),d);}
function simPct(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Proporción, porcentaje y SPSS</h3><p class="ctx">Escribe una proporción (por ejemplo 0,045) y mira cómo se escribe en cada forma.</p><div class="ctrls"><label class="ctrl"><span>Proporción (entre 0 y 1)</span><input class="inp" id="pc-in" value="0,045" inputmode="decimal"></label></div><div class="readouts" id="pc-o"></div></div>
   <div class="part"><h3 class="sub">B. Redondeo</h3><p class="ctx" id="rd-c"></p><div class="seg" id="rd-b">${[0,1,2,3].map(d=>`<button type="button" data-d="${d}">${d} decimal${d===1?'':'es'}</button>`).join('')}</div><div class="formula" id="rd-o">Elige cuántos decimales.</div><p class="note">Si el primer dígito que se elimina es 5 o más, el anterior sube uno. Se redondea <b>solo al final</b>: si redondeas en los pasos intermedios, el resultado se aleja.</p></div>
   <div class="part"><h3 class="sub">C. Porcentaje del total y acumulado</h3><div id="pt-t"></div><div id="pt-q"></div><div class="btn-row"><button type="button" class="btn btn-ghost" id="pt-n">Otros datos</button></div></div>`;
  const conv=()=>{const v=parseNum($('#pc-in',box).value),o=$('#pc-o',box);if(!Number.isFinite(v)||v<0||v>1){o.innerHTML='<p class="note">Escribe un número entre 0 y 1.</p>';return;}
    o.innerHTML=`<div class="ro"><span>Proporción</span><b>${nf(v,4)}</b></div><div class="ro"><span>Porcentaje (× 100)</span><b>${nf(v*100,2)} %</b></div><div class="ro"><span>Como lo escribe SPSS</span><b>${spP(v)}</b></div><div class="ro"><span>En un informe (p)</span><b>${v<0.001?'p &lt; 0,001':'p = '+nf(v,3)}</b></div>`;};
  $('#pc-in',box).addEventListener('input',conv);conv();
  const val=round(rnd(1,99)+Math.random(),5);$('#rd-c',box).innerHTML=`Valor calculado: <b>${nf(val,5)}</b>`;
  box.querySelectorAll('#rd-b button').forEach(b=>b.addEventListener('click',()=>{box.querySelectorAll('#rd-b button').forEach(x=>x.setAttribute('aria-pressed',x===b));const d=+b.dataset.d;$('#rd-o',box).innerHTML=`${nf(val,5)} → <b>${roundTxt(val,d)}</b>`;}));
  const tab=()=>{const cats=shuffle(['Mal sellado','Etiqueta torcida','Bajo peso','Abolladura','Otros']).slice(0,4),c=cats.map(()=>rint(8,60)).sort((a,b)=>b-a),tot=ST.sum(c);let ac=0;
    $('#pt-t',box).innerHTML=`<p class="ctx">Defectos encontrados en una semana (ordenados de mayor a menor):</p><div class="table-wrap"><table class="tbl"><thead><tr><th>Defecto</th><th>Cantidad</th><th>%</th><th>% acumulado</th></tr></thead><tbody>${cats.map((k,i)=>{ac+=c[i];return`<tr><td>${k}</td><td>${c[i]}</td><td>${i===1?'?':nf(c[i]/tot*100,1)}</td><td>${i===1?'?':nf(ac/tot*100,1)}</td></tr>`;}).join('')}<tr><td><b>Total</b></td><td><b>${tot}</b></td><td>100</td><td></td></tr></tbody></table></div>`;
    const Q=$('#pt-q',box);Q.innerHTML='';numBox(Q,{text:`¿Qué porcentaje representa “${cats[1]}”? (un decimal)`,answer:round(c[1]/tot*100,1),tol:0.01,explain:`${c[1]} / ${tot} × 100 = <b>${nf(c[1]/tot*100,1)} %</b>.`},()=>numBox(Q,{text:'¿Y su porcentaje acumulado? (un decimal)',answer:round((c[0]+c[1])/tot*100,1),tol:0.01,explain:`(${c[0]} + ${c[1]}) / ${tot} × 100 = <b>${nf((c[0]+c[1])/tot*100,1)} %</b>: se suman las cantidades hasta esa fila.`}));};
  $('#pt-n',box).addEventListener('click',tab);tab();return null;}
function quizPct(){const qs=[],p=round(rnd(0.001,0.2),3),a=rint(20,80),b=rint(150,400),v=round(rnd(1,50)+Math.random(),4),d=pick([1,2]),old=rint(80,200),nw=old+rint(-40,60);
  qs.push({type:'num',text:`Escribe la proporción ${nf(p,3)} como porcentaje.`,answer:round(p*100,1),tol:0.01,explain:`${nf(p,3)} × 100 = <b>${nf(p*100,1)} %</b>.`});
  qs.push({type:'num',text:`De ${b} envases revisados, ${a} tenían defectos. ¿Qué porcentaje es? (un decimal)`,answer:round(a/b*100,1),tol:0.01,explain:`${a} / ${b} × 100 = <b>${nf(a/b*100,1)} %</b>.`});
  qs.push({type:'num',text:`Redondea ${nf(v,4)} a ${d} decimal${d===1?'':'es'}.`,answer:round(v,d),tol:0,explain:`${nf(v,4)} → <b>${roundTxt(v,d)}</b>.`});
  qs.push({type:'num',text:`La producción pasó de ${old} a ${nw} kg. ¿Cuál fue el cambio porcentual? (un decimal; negativo si bajó)`,answer:round((nw-old)/old*100,1),tol:0.01,explain:`(${nw} − ${old}) / ${old} × 100 = <b>${nf((nw-old)/old*100,1)} %</b>. Se divide entre el valor <b>inicial</b>.`});
  qs.push({type:'mc',text:'SPSS muestra Sig. = <b>,000</b>. ¿Cómo lo reportas?',options:['p &lt; 0,001','p = 0','p = 0,000 exacto','No se puede reportar'],answer:0,explain:',000 significa que el valor es menor que 0,0005; nunca es cero.'});
  qs.push({type:'mc',text:'¿Cuándo conviene redondear en un cálculo de varios pasos?',options:['Solo al final','En cada paso, para que sea más fácil','Nunca','Solo en los pasos intermedios'],answer:0,explain:'Redondear en los pasos intermedios acumula error y el resultado final se aleja.'});
  return qs;}

/* =============== 4. Del enunciado a la ecuación =============== */
const ENU=[
 ()=>{const L=pick([50,100,200]),b1=pick([6,8,10]),b2=pick([40,50,65]),bt=pick([12,14,15]),y=L*(bt-b1)/(b2-b1);return{ctx:`Se quieren <b>${L} L</b> de néctar de <b>${bt} °Brix</b> mezclando jugo de <b>${b1} °Brix</b> con concentrado de <b>${b2} °Brix</b>. ¿Cuántos litros de concentrado se necesitan?`,
   unk:[['x = litros de jugo, y = litros de concentrado',true],['x = °Brix del jugo, y = °Brix del concentrado',false],['x = litros totales, y = °Brix final',false]],
   eq1:[[`x + y = ${L}`,true,'Es la ecuación de la masa (volumen) total.'],[`x + y = ${bt}`,false,'Los °Brix no se suman así.'],[`${b1}x + ${b2}y = ${L}`,false,'Esa mezcla volumen con sólidos.']],
   eq2:[[`${b1}x + ${b2}y = ${bt} × ${L}`,true,'Balance de sólidos: lo que aporta cada parte suma lo que debe tener la mezcla.'],[`${b1} + ${b2} = ${bt}`,false,'No incluye las cantidades.'],[`x / y = ${bt}`,false,'No es un balance.']],
   q:'litros de concentrado (y)',ans:round(y,2),sol:`De x = ${L} − y: ${b1}(${L} − y) + ${b2}y = ${bt*L} → ${b2-b1}y = ${bt*L-b1*L} → y = <b>${nf(y,2)} L</b>.`};},
 ()=>{const M=pick([40,50,60]),pa=pick([9,10,12]),pb=pick([5,6,7]),x=rint(15,M-10),C=pa*x+pb*(M-x);return{ctx:`Una mezcla de <b>${M} kg</b> de café cuesta <b>$ ${C}</b>. El café A cuesta $ ${pa}/kg y el B $ ${pb}/kg. ¿Cuántos kg de café A tiene?`,
   unk:[['x = kg de café A, y = kg de café B',true],['x = precio de A, y = precio de B',false],['x = costo total, y = kg totales',false]],
   eq1:[[`x + y = ${M}`,true,'La masa total de la mezcla.'],[`x + y = ${C}`,false,'Eso mezcla kilos con dólares.'],[`${pa} + ${pb} = ${M}`,false,'No tiene incógnitas.']],
   eq2:[[`${pa}x + ${pb}y = ${C}`,true,'El costo de cada café por su cantidad suma el costo total.'],[`x + y = ${pa+pb}`,false,'Los precios no se suman así.'],[`${pa}x = ${pb}y`,false,'No hay razón para que ambos costos sean iguales.']],
   q:'kg de café A (x)',ans:round(x,2),sol:`De y = ${M} − x: ${pa}x + ${pb}(${M} − x) = ${C} → ${pa-pb}x = ${C-pb*M} → x = <b>${nf(x,2)} kg</b>.`};},
 ()=>{const W=pick([20,30,50]),cs=pick([20,25,30]),cf=pick([10,12,15]),x=W*cf/cs;return{ctx:`Se necesitan <b>${W} kg</b> de salmuera al <b>${cf} %</b> de sal. Solo hay salmuera al <b>${cs} %</b> y agua. ¿Cuántos kg de salmuera concentrada se usan?`,
   unk:[['x = kg de salmuera concentrada (el resto es agua)',true],['x = porcentaje de sal final',false],['x = kg de sal pura',false]],
   eq1:[[`x + agua = ${W}`,true,'La masa total.'],[`x = ${W}`,false,'Faltaría el agua.'],[`x + agua = ${cf}`,false,'El porcentaje no es una masa.']],
   eq2:[[`${nf(cs/100,2)} · x = ${nf(cf/100,2)} × ${W}`,true,'La sal que trae la concentrada es toda la sal de la mezcla (el agua no aporta sal).'],[`${cs}x = ${cf}`,false,'Falta la masa total.'],[`x = ${cs} − ${cf}`,false,'Restar porcentajes no da masas.']],
   q:'kg de salmuera concentrada (x)',ans:round(x,2),sol:`${nf(cs/100,2)}·x = ${nf(cf*W/100,2)} → x = <b>${nf(x,2)} kg</b> (y ${nf(W-x,2)} kg de agua).`};},
 ()=>{const r=pick([10,11.5,12.5,14]),Q=pick([30,40,60,75]),x=Q*100/r;return{ctx:`De cada <b>100 kg</b> de leche se obtienen <b>${nf(r,1)} kg</b> de queso. ¿Cuánta leche se necesita para <b>${Q} kg</b> de queso?`,
   unk:[['x = kg de leche necesarios',true],['x = kg de queso',false],['x = rendimiento en %',false]],
   eq1:[[`${nf(r,1)} / 100 = ${Q} / x`,true,'Una proporción: la relación queso/leche se mantiene.'],[`${nf(r,1)} · ${Q} = x`,false,'Multiplicar no respeta la proporción.'],[`x = ${Q} − ${nf(r,1)}`,false,'Restar no tiene sentido aquí.']],
   eq2:null,q:'kg de leche (x)',ans:round(x,2),sol:`x = ${Q} × 100 / ${nf(r,1)} = <b>${nf(x,2)} kg</b>.`};}];
function simEnu(box){let G;
  box.innerHTML=`<div class="part"><h3 class="sub">Del enunciado a la ecuación, paso a paso</h3><p class="note">1) Define qué es cada incógnita, con su unidad. 2) Escribe una ecuación por cada dato o condición. 3) Resuelve y revisa que el resultado tenga sentido.</p><div id="en"></div><div class="btn-row"><button type="button" class="btn btn-ghost" id="en-n">Otro problema</button></div></div>`;
  const load=()=>{const g=pick(ENU);G=g();const H=$('#en',box);H.innerHTML=`<p class="ctx">${G.ctx}</p><div id="en-s"></div>`;const S=$('#en-s',H);
    mcBox(S,'1. ¿Qué son las incógnitas?',shuffle(G.unk.map(o=>[o[0],o[1],o[1]?'Correcto: siempre con su unidad.':'Las incógnitas son las cantidades que no conoces y te preguntan.'])),()=>
      mcBox(S,G.eq2?'2. Primera ecuación (masa o cantidad total):':'2. ¿Qué ecuación plantea el problema?',shuffle(G.eq1),()=>{const last=()=>numBox(S,{text:`3. Resuelve: ¿cuántos ${G.q}? (dos decimales)`,answer:G.ans,explain:G.sol});
        if(G.eq2)mcBox(S,'Segunda ecuación (el balance del componente o del costo):',shuffle(G.eq2),last);else last();}));};
  $('#en-n',box).addEventListener('click',load);load();return null;}
function quizEnu(){const qs=[];shuffle(ENU).slice(0,3).forEach(g=>{const G=g(),eq=G.eq2||G.eq1,i=shuffle(eq.map((_,j)=>j));qs.push({type:'mc',keepOrder:true,text:G.ctx+'<br>¿Qué ecuación corresponde al '+(G.eq2?'balance (segunda ecuación)':'problema')+'?',options:i.map(j=>eq[j][0]),answer:i.indexOf(eq.findIndex(o=>o[1])),explain:eq.find(o=>o[1])[2]});
  qs.push({type:'num',text:`Resuelve el mismo problema: ¿cuántos ${G.q}? (dos decimales)`,answer:G.ans,explain:G.sol});});return qs;}

CIMA.addUnit(META,{id:'n1',orden:1,nombre:'Herramientas de matemática para todas las materias',topics:[
 {id:'sumatoria',n:'1',short:'La sumatoria',title:'La sumatoria (Σ) y los subíndices',refuerzo:true,desc:'Leer Σy, Σy², (Σy)², y<sub>ij</sub> e Y<sub>i.</sub> sin confundirse.',lead:'Casi todas las fórmulas de Estadística, Diseño y Calidad usan Σ. Leerla bien es la mitad del cálculo.',
  idea:`<ul><li><b>Σx</b> = suma de todos los x. <b>Σx²</b> = cada x al cuadrado y luego se suma. <b>(Σx)²</b> = se suma todo y luego se eleva. No son iguales.</li><li><b>y<sub>ij</sub></b>: dato del tratamiento i, réplica j. <b>Y<sub>i.</sub></b>: total del tratamiento i (el punto marca el índice que se sumó). <b>ȳ<sub>i.</sub></b>: su media.</li><li>En el ANOVA: FC = (Σy)²/N, SC<sub>Total</sub> = Σy² − FC, SC<sub>Trat</sub> = ΣY<sub>i.</sub>²/n − FC.</li></ul>`,simHint:'Toca cada expresión y mira qué datos entran en la suma.',sim:simSum,quiz:quizSum},
 {id:'despeje',n:'2',short:'Despejar',title:'Despejar una variable de una fórmula',refuerzo:true,desc:'Aislar la incógnita paso a paso en fórmulas reales.',lead:'Muchas preguntas de planta piden “al revés” una fórmula conocida: cuántas muestras tomar, qué dilución preparar, qué valor de proceso usar.',
  idea:`<ul><li>Lo que haces a un lado del igual, lo haces al otro.</li><li>Se deshace en orden inverso: primero lo que suma o resta a la incógnita, después lo que la multiplica o divide, y al final potencias o raíces.</li><li>Comprueba: reemplaza el resultado en la fórmula original y verifica que se cumpla.</li></ul>`,simHint:'Elige cada paso del despeje y luego usa la fórmula con datos.',sim:simDesp,quiz:quizDesp},
 {id:'porcentajes',n:'3',short:'Porcentajes y redondeo',title:'Porcentajes, proporciones y redondeo',refuerzo:true,desc:'Pasar de proporción a porcentaje, leer ,012 en SPSS y redondear bien.',lead:'Un 0,045 mal leído o un redondeo hecho a mitad de camino cambian una conclusión. Aquí se practica lo básico que usan todas las materias.',
  idea:`<ul><li>Porcentaje = proporción × 100. Porcentaje de un total = parte / total × 100.</li><li>SPSS escribe <b>,012</b> por 0,012 y <b>,000</b> cuando es menor que 0,0005 (se reporta p &lt; 0,001).</li><li>Cambio porcentual = (final − inicial) / inicial × 100.</li><li>Redondea solo al final del cálculo.</li></ul>`,simHint:'Convierte, redondea y calcula porcentajes acumulados como en un Pareto.',sim:simPct,quiz:quizPct},
 {id:'enunciado',n:'4',short:'Del enunciado a la ecuación',title:'Del enunciado a la ecuación',refuerzo:true,desc:'Definir incógnitas y plantear las ecuaciones de un problema de planta.',lead:'El paso más difícil de un problema no es resolverlo: es plantearlo. Mezclas, costos, salmueras y rendimientos se plantean siempre con la misma lógica.',
  idea:`<ol><li>Define cada incógnita con su unidad (x = kg de jugo).</li><li>Escribe una ecuación por cada condición: la cantidad total y el balance del componente (sólidos, sal, costo).</li><li>Resuelve y revisa que el resultado tenga sentido (no puede salir una cantidad negativa).</li></ol>`,simHint:'Plantea paso a paso problemas de mezclas, costos, salmueras y rendimiento.',sim:simEnu,quiz:quizEnu}]});
})();
