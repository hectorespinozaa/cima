/* =====================================================================
   CIMA · ESTADÍSTICA · Unidad 3: Inferencia estadística
   3.1 Intervalos de confianza · 3.2 Plantear hipótesis
   3.3 Prueba para una media · 3.4 Comparación de dos grupos
   Herramientas: pizarra, Excel (funciones en español) y JASP.
   ===================================================================== */
(function(){
"use strict";
const META={id:'estadistica',nombre:'Estadística',orden:2,nivel:'Estadística · 2.º semestre',descripcion:'Describe datos, calcula probabilidades y decide con pruebas de hipótesis, regresión y ANOVA, usando Excel y JASP.'};
const U=LABUI,jn=U.jn,jp=U.jp,gauss=U.gauss,A05=0.05;
const SL=(id,label,min,max,step,val)=>`<label class="ctrl"><span>${label} <output id="${id}-o"></output></span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
const ALT={two:{h0:'=',h1:'≠',txt:'diferente de',js:'diferente de'},less:{h0:'≥',h1:'<',txt:'menor que',js:'menor que'},greater:{h0:'≤',h1:'>',txt:'mayor que',js:'mayor que'}};
const pT=(t,df,alt)=>alt==='two'?ST.pT2(Math.abs(t),df):alt==='greater'?ST.pT1(t,df):1-ST.pT1(t,df);
const xlP=(alt,tc,gc)=>alt==='two'?`=DISTR.T.2C(ABS(${tc});${gc})`:alt==='greater'?`=DISTR.T.CD(${tc};${gc})`:`=DISTR.T.N(${tc};${gc};VERDADERO)`;
const dt=(t,df)=>Math.exp(ST.lgamma((df+1)/2)-ST.lgamma(df/2))/Math.sqrt(df*Math.PI)*Math.pow(1+t*t/df,-(df+1)/2);
const csvCol=(rows,dec)=>rows.map(r=>r.map(v=>typeof v==='number'?(dec===','?String(v).replace('.',','):String(v)):v).join(dec===','?';':',')).join('\r\n');
const XL_ON=['Activar Análisis de datos (una sola vez)','Archivo → Opciones → Complementos → Administrar: Complementos de Excel → Ir → marca <b>Herramientas para análisis</b>.','File → Options → Add-ins → Analysis ToolPak'];

/* =============== 3.1 Intervalos de confianza =============== */
const IC_CASES=[
 {ctx:'Se mide el contenido de <b>proteína</b> de barras de cereal de un lote.',v:'Proteína',u:'g/barra',mu:8.2,sd:0.45,dec:2},
 {ctx:'Se mide el <b>peso neto</b> de fundas de café molido.',v:'Peso neto',u:'g',mu:251,sd:2.4,dec:1},
 {ctx:'Se mide la <b>acidez</b> de muestras de vinagre de piña.',v:'Acidez',u:'%',mu:4.9,sd:0.15,dec:2},
 {ctx:'Se mide el <b>tiempo de llenado</b> de una envasadora de jugo.',v:'Tiempo de llenado',u:'s',mu:3.6,sd:0.22,dec:2},
 {ctx:'Se mide la <b>humedad</b> de muestras de harina de plátano.',v:'Humedad',u:'%',mu:11.8,sd:0.5,dec:2},
 {ctx:'Se mide el <b>diámetro</b> de galletas a la salida del horno.',v:'Diámetro',u:'mm',mu:62,sd:1.3,dec:1}];
const P_CASES=[['envases mal sellados','envases revisados'],['consumidores que prefieren la versión light','consumidores encuestados'],['huevos con cáscara fisurada','huevos inspeccionados'],['fundas con peso bajo el declarado','fundas pesadas']];
function simIC(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. ¿Qué significa “95 % de confianza”?</h3><p class="ctx">Una máquina llena fundas con media real μ = 500 g (que en la vida real no conocemos). Tomamos muchas muestras y con cada una calculamos un intervalo. ¿Cuántos atrapan a μ?</p>
    <div class="seg" id="ic-c"><button type="button" data-c="0.9" aria-pressed="false">90 %</button><button type="button" data-c="0.95" aria-pressed="true">95 %</button><button type="button" data-c="0.99" aria-pressed="false">99 %</button></div>
    <div class="ctrls">${SL('ic-n','Tamaño de cada muestra (n)',4,50,1,10)}</div><div class="btn-row"><button type="button" class="btn" id="ic-go">Tomar 40 muestras</button></div>
    <div class="chart-wrap" id="ic-ch"></div><p class="verdict" id="ic-v"></p></div>
   <div class="part"><h3 class="sub">B. Calcula un intervalo para la media (con Excel)</h3><p class="ctx" id="icb-ctx"></p><div id="icb"></div><div class="btn-row"><button type="button" class="btn btn-ghost" id="icb-new">Otra muestra</button></div></div>
   <div class="part"><h3 class="sub">C. Intervalo para una proporción</h3><p class="ctx" id="icp-ctx"></p><div id="icp"></div><div class="btn-row"><button type="button" class="btn btn-ghost" id="icp-new">Otro caso</button></div></div>`;
  const s={c:0.95,n:10};
  function sim(){$('#ic-n-o',box).textContent=s.n;const mu=500,sd=4,df=s.n-1,tc=ST.qT(1-s.c,df),R=[];
    for(let k=0;k<40;k++){const x=Array.from({length:s.n},()=>mu+gauss()*sd),m=ST.mean(x),e=tc*ST.sd(x)/Math.sqrt(s.n);R.push({lo:m-e,hi:m+e,m,ok:m-e<=mu&&mu<=m+e});}
    const W=cw($('#ic-ch',box)),H=420,ml=40,mr=14,X=v=>ml+(v-490)/20*(W-ml-mr),hit=R.filter(r=>r.ok).length;
    let g=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="chart" role="img" aria-label="Intervalos de confianza">`;
    [490,495,500,505,510].forEach(v=>g+=`<line class="grid" x1="${X(v)}" x2="${X(v)}" y1="8" y2="${H-24}"/><text x="${X(v)}" y="${H-8}" text-anchor="middle">${v}</text>`);
    R.forEach((r,i)=>{const y=14+i*9.6;g+=`<line x1="${X(Math.max(489,r.lo))}" x2="${X(Math.min(511,r.hi))}" y1="${y}" y2="${y}" stroke="${r.ok?'var(--data)':'var(--bad)'}" stroke-width="3" stroke-linecap="round"/><circle cx="${X(r.m)}" cy="${y}" r="2.5" fill="${r.ok?'var(--data)':'var(--bad)'}"/>`;});
    g+=`<line x1="${X(500)}" x2="${X(500)}" y1="6" y2="${H-24}" stroke="var(--accent)" stroke-width="2"/><text class="lbl acc" x="${X(500)+6}" y="14">μ = 500</text></svg>`;$('#ic-ch',box).innerHTML=g;
    const v=$('#ic-v',box);v.className='verdict';v.innerHTML=`<b>${hit} de 40</b> intervalos (${Math.round(hit/40*100)} %) contienen a μ. En promedio, con ${Math.round(s.c*100)} % de confianza, ${Math.round(s.c*100)} de cada 100 intervalos lo atrapan. Más confianza → intervalos más anchos; más n → intervalos más angostos.`;}
  box.querySelectorAll('#ic-c button').forEach(b=>b.addEventListener('click',()=>{s.c=+b.dataset.c;box.querySelectorAll('#ic-c button').forEach(x=>x.setAttribute('aria-pressed',x===b));sim();}));
  $('#ic-n',box).addEventListener('input',e=>{s.n=+e.target.value;sim();});$('#ic-go',box).addEventListener('click',sim);
  function partB(){const c=pick(IC_CASES),n=rint(8,12),x=Array.from({length:n},()=>round(c.mu+gauss()*c.sd,c.dec)),m=ST.mean(x),sd=ST.sd(x),tc=ST.qT(0.05,n-1),e=tc*sd/Math.sqrt(n);
    $('#icb-ctx',box).innerHTML=`${c.ctx} Se tomaron n = ${n} muestras (${c.u}). Calcula el intervalo de confianza del 95 % para la media.`;
    const cells=[[{v:c.v,b:1},{v:'',b:1},{v:'Resultado',b:1},{v:'Fórmula en Excel',b:1}]];const rr=`A2:A${n+1}`;
    const res=[['n',n,`=CONTAR(${rr})`],['Media',m,`=PROMEDIO(${rr})`],['Desv. estándar s',sd,`=DESVEST.M(${rr})`],['Margen de error',e,`=INTERVALO.CONFIANZA.T(0,05;C4;C2)`],['Límite inferior',m-e,'=C3-C5'],['Límite superior',m+e,'=C3+C5']];
    for(let i=0;i<Math.max(n,6);i++){cells.push([{v:i<n?x[i]:'',d:c.dec},{v:''},...(i<6?[{v:res[i][1],f:res[i][2],d:4},{v:res[i][2],cls:'xcode'}]:[{v:''},{v:''}])]);}
    cells.forEach((r,i)=>{if(i>=1&&i<=6){r[1]={v:res[i-1][0],b:1};}});
    $('#icb',box).innerHTML=U.sheet(cells)+`<div class="formula">IC = x̄ ± t<sub>(0,025; ${n-1})</sub> · s/√n = ${fmt(m,3)} ± ${fmt(tc,3)} · ${fmt(sd,3)}/√${n} = ${fmt(m,3)} ± ${fmt(e,3)} → <b>[${fmt(m-e,3)}; ${fmt(m+e,3)}] ${c.u}</b></div>
      <div class="lq"><p><b>¿Cómo se interpreta?</b></p><div class="opts">${shuffle([[`Con 95 % de confianza, la media real del lote está entre ${fmt(m-e,2)} y ${fmt(m+e,2)} ${c.u}.`,1,'Correcto: el intervalo es sobre la media poblacional μ.'],[`El 95 % de las muestras tiene valores entre ${fmt(m-e,2)} y ${fmt(m+e,2)} ${c.u}.`,0,'No: el intervalo es para la media, no para los datos individuales (esos varían mucho más).'],[`La media de la muestra está entre ${fmt(m-e,2)} y ${fmt(m+e,2)} con 95 % de probabilidad.`,0,'No: la media de la muestra ya la conocemos exactamente (es el centro del intervalo).']]).map(o=>`<button type="button" class="opt" data-ok="${o[1]}" data-e="${o[2]}">${o[0]}</button>`).join('')}</div><p class="fb"></p></div>`;
    U.mountSheet($('#icb',box));box.querySelectorAll('#icb .opt').forEach(b=>b.addEventListener('click',()=>{box.querySelectorAll('#icb .opt').forEach(x=>{x.disabled=true;if(x.dataset.ok==='1')x.classList.add('is-ok');});if(b.dataset.ok!=='1')b.classList.add('is-bad');b.closest('.lq').querySelector('.fb').innerHTML=(b.dataset.ok==='1'?'<strong>Bien.</strong> ':'<strong>No.</strong> ')+b.dataset.e;}));}
  function partC(){const c=pick(P_CASES),n=pick([120,150,200,250,300]),x=rint(Math.round(n*0.04),Math.round(n*0.25)),ph=x/n,z=1.96,e=z*Math.sqrt(ph*(1-ph)/n);
    $('#icp-ctx',box).innerHTML=`De ${n} ${c[1]}, ${x} fueron ${c[0]}. Intervalo del 95 % para la proporción:`;
    $('#icp',box).innerHTML=`<div class="formula">p̂ = ${x}/${n} = ${fmt(ph,4)} · IC = p̂ ± z·√(p̂(1 − p̂)/n) = ${fmt(ph,4)} ± 1,96·√(${fmt(ph,4)}·${fmt(1-ph,4)}/${n}) = ${fmt(ph,4)} ± ${fmt(e,4)}<br><b>[${fmt(Math.max(0,ph-e)*100,1)} %; ${fmt((ph+e)*100,1)} %]</b></div>
      <p class="note">En Excel: z = <code>=INV.NORM.ESTAND(0,975)</code> → 1,96 · margen = <code>=1,96*RAIZ(p*(1-p)/n)</code>. La fórmula funciona bien si n·p̂ y n·(1 − p̂) son al menos 5 (aquí ${fmt(n*ph,0)} y ${fmt(n*(1-ph),0)}).</p>`;}
  $('#icb-new',box).addEventListener('click',partB);$('#icp-new',box).addEventListener('click',partC);sim();partB();partC();return sim;}
function quizIC(){const qs=[],c=pick(IC_CASES),n=rint(9,16),s=round(c.sd*rnd(0.8,1.2),3),m=round(c.mu+gauss()*c.sd*0.3,3),tc=ST.qT(0.05,n-1),e=tc*s/Math.sqrt(n);
  qs.push({type:'num',text:`${c.ctx} Con n = ${n}, x̄ = ${nf(m,3)} y s = ${nf(s,3)} ${c.u}, y t = ${nf(round(tc,3),3)}, ¿cuál es el <b>margen de error</b> del IC 95 %? (tres decimales)`,answer:round(round(tc,3)*s/Math.sqrt(n),3),tol:0.002,explain:`E = t·s/√n = ${nf(round(tc,3),3)}·${nf(s,3)}/√${n} = <b>${fmt(round(tc,3)*s/Math.sqrt(n),3)}</b>.`});
  qs.push({type:'num',text:`Con esos datos, ¿cuál es el <b>límite superior</b> del intervalo? (dos decimales)`,answer:round(m+round(tc,3)*s/Math.sqrt(n),2),tol:0.011,explain:`LS = x̄ + E = ${nf(m,3)} + ${fmt(round(tc,3)*s/Math.sqrt(n),3)} = <b>${fmt(m+round(tc,3)*s/Math.sqrt(n),2)}</b>.`});
  qs.push({type:'mc',text:'Si se aumenta el nivel de confianza de 95 % a 99 % (mismos datos), el intervalo…',options:['Se hace más ancho','Se hace más angosto','No cambia','Se mueve hacia la derecha'],answer:0,explain:'Más confianza exige un t (o z) mayor: el intervalo se ensancha.'});
  qs.push({type:'mc',text:'Para hacer el intervalo más angosto sin perder confianza, conviene…',options:['Aumentar el tamaño de la muestra','Usar un nivel de confianza mayor','Eliminar los datos más altos','Usar la desviación de una sola muestra'],answer:0,explain:'El margen depende de s/√n: más datos, menor margen.'});
  qs.push({type:'mc',mono:true,text:'¿Qué función de Excel en español da directamente el margen de error con t?',options:['=INTERVALO.CONFIANZA.T(0,05;s;n)','=PRUEBA.T(rango;0,05)','=DISTR.T.2C(0,05;n)','=PROMEDIO(rango)±0,05'],answer:0,explain:'<b>INTERVALO.CONFIANZA.T</b>(alfa; desviación; tamaño) devuelve el margen de error.'});
  const n2=pick([100,150,200,400]),x2=rint(Math.round(n2*0.05),Math.round(n2*0.3)),ph=x2/n2,e2=1.96*Math.sqrt(ph*(1-ph)/n2);
  qs.push({type:'num',text:`De ${n2} envases revisados, ${x2} estaban mal sellados. ¿Cuál es el margen de error del IC 95 % para la proporción? (en %, con un decimal)`,unit:'%',answer:round(e2*100,1),tol:0.11,explain:`p̂ = ${fmt(ph,4)}; E = 1,96·√(${fmt(ph,4)}·${fmt(1-ph,4)}/${n2}) = ${fmt(e2,4)} → <b>${fmt(e2*100,1)} %</b>.`});
  return qs;}

/* =============== 3.2 Plantear hipótesis =============== */
const HYP=[
 ['Un proveedor asegura que sus fundas de azúcar pesan en promedio 2 kg. Queremos verificar si el peso promedio es <b>distinto</b>.','μ','2 kg','two'],
 ['La norma exige que la leche tenga <b>al menos</b> 3 % de grasa. Sospechamos que una planta entrega <b>menos</b>.','μ','3 %','less'],
 ['Se cree que <b>más del</b> 10 % de los consumidores prefiere la presentación light.','p','0,10','greater'],
 ['La humedad máxima del arroz es 13 %. Queremos <b>demostrar que el lote cumple</b> (humedad promedio menor que 13 %).','μ','13 %','less'],
 ['El tiempo de pasteurización debería ser 15 s en promedio. Se revisa si el equipo <b>se desajustó</b>.','μ','15 s','two'],
 ['Los envases mal sellados no deben superar el 2 %. Se sospecha que <b>lo superan</b>.','p','0,02','greater'],
 ['Una nueva enzima promete <b>aumentar</b> el rendimiento promedio de pulpa por encima de 60 %.','μ','60 %','greater'],
 ['Se quiere saber si la proporción de clientes satisfechos <b>cambió</b> respecto al 80 % del año pasado.','p','0,80','two'],
 ['La etiqueta declara 400 mg de sodio por porción. Un cliente sospecha que el contenido promedio es <b>mayor</b>.','μ','400 mg','greater'],
 ['Se desea probar que un nuevo empaque <b>reduce</b> la pérdida de peso promedio por debajo de 5 %.','μ','5 %','less'],
 ['Un panel afirma que menos del 30 % de los catadores detecta el cambio de edulcorante. Se quiere <b>demostrar</b> esa afirmación.','p','0,30','less'],
 ['El contenido de vitamina C de un jugo debe ser 40 mg/100 mL. Se controla si un lote <b>se aparta</b> de ese valor.','μ','40 mg/100 mL','two']];
const ERR=[
 ['H₀: el lote cumple la norma microbiológica. Se rechaza H₀ y se descarta el lote, pero en realidad sí cumplía.','I','Se rechazó una H₀ verdadera: se botó un lote bueno (pérdida económica).'],
 ['H₀: el lote cumple la norma microbiológica. No se rechaza H₀ y el lote sale al mercado, pero en realidad estaba contaminado.','II','No se rechazó una H₀ falsa: un lote malo llegó al consumidor (riesgo para la salud).'],
 ['H₀: la máquina llena 500 g en promedio. Se concluye que está desajustada y se para la línea, pero estaba bien.','I','Rechazar H₀ siendo verdadera: parada innecesaria.'],
 ['H₀: el nuevo aditivo no mejora la vida útil. Se concluye que no la mejora, pero en realidad sí la mejoraba.','II','No rechazar una H₀ falsa: se perdió una mejora real.'],
 ['H₀: el proveedor entrega fruta con la madurez pactada. Se rechaza el camión, pero la fruta cumplía.','I','Error tipo I: se rechazó algo que estaba bien.'],
 ['H₀: el detector de metales funciona correctamente. No se detecta falla, pero el detector estaba descalibrado.','II','Error tipo II: no se detectó un problema real.']];
function simHyp(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Construye H₀ y H₁</h3><p class="ctx" id="hb-ctx"></p>
    <div class="hyp-b"><div class="hyp-row"><b>H₀:</b><select id="hb-p0" aria-label="Parámetro H0"><option value="">…</option><option>μ</option><option>p</option><option>x̄</option></select><select id="hb-s0" aria-label="Signo H0"><option value="">…</option><option>=</option><option>≤</option><option>≥</option><option>≠</option><option>&lt;</option><option>&gt;</option></select><span class="hv"></span></div>
    <div class="hyp-row"><b>H₁:</b><select id="hb-p1" aria-label="Parámetro H1"><option value="">…</option><option>μ</option><option>p</option><option>x̄</option></select><select id="hb-s1" aria-label="Signo H1"><option value="">…</option><option>=</option><option>≤</option><option>≥</option><option>≠</option><option>&lt;</option><option>&gt;</option></select><span class="hv"></span></div></div>
    <div class="btn-row"><button type="button" class="btn" id="hb-ok">Comprobar</button><button type="button" class="btn btn-ghost" id="hb-new">Otro enunciado</button></div><div id="hb-fb"></div>
    <div class="types"><div class="type"><b>Regla 1</b><span>La igualdad (=, ≤, ≥) siempre va en H₀.</span></div><div class="type"><b>Regla 2</b><span>Lo que se quiere demostrar o se sospecha va en H₁.</span></div><div class="type"><b>Regla 3</b><span>Se escribe sobre el parámetro (μ o p), nunca sobre x̄ o p̂.</span></div><div class="type"><b>Regla 4</b><span>H₁ con ≠ es bilateral; con &lt; o &gt; es unilateral.</span></div></div></div>
   <div class="part"><h3 class="sub">B. ¿Error tipo I o tipo II?</h3><div class="table-wrap"><table class="tbl"><thead><tr><th>Decisión \\ Realidad</th><th>H₀ verdadera</th><th>H₀ falsa</th></tr></thead><tbody><tr><td>Rechazar H₀</td><td class="bad-c">Error tipo I (α)</td><td class="ok-c">Correcto</td></tr><tr><td>No rechazar H₀</td><td class="ok-c">Correcto</td><td class="bad-c">Error tipo II (β)</td></tr></tbody></table></div>
    <p class="ctx" id="er-ctx"></p><div class="seg" id="er-b"><button type="button" data-k="I">Error tipo I</button><button type="button" data-k="II">Error tipo II</button></div><p class="fb" id="er-fb"></p><div class="btn-row"><button type="button" class="btn btn-ghost" id="er-new">Otro caso</button></div></div>
   <div class="part"><h3 class="sub">C. El valor p, visto como un área</h3><p class="ctx">El valor p es la probabilidad de obtener un estadístico tan extremo como el observado <b>si H₀ fuera cierta</b>. Mueve t y cambia el tipo de prueba.</p>
    <div class="seg" id="pv-a"><button type="button" data-a="two" aria-pressed="true">Bilateral (≠)</button><button type="button" data-a="less" aria-pressed="false">Cola izquierda (&lt;)</button><button type="button" data-a="greater" aria-pressed="false">Cola derecha (&gt;)</button></div>
    <div class="ctrls">${SL('pv-t','t calculado',-4,4,0.05,2.1)}${SL('pv-df','Grados de libertad',3,40,1,12)}</div><div class="chart-wrap" id="pv-ch"></div><p class="verdict" id="pv-v"></p></div>`;
  let H;function nh(){let n;do{n=pick(HYP);}while(n===H);H=n;$('#hb-ctx',box).innerHTML=H[0];['p0','s0','p1','s1'].forEach(k=>{const s=$('#hb-'+k,box);s.value='';s.classList.remove('good','bad');});box.querySelectorAll('.hv').forEach(e=>e.textContent=H[2]);$('#hb-fb',box).innerHTML='';}
  $('#hb-ok',box).addEventListener('click',()=>{const a=ALT[H[3]],want={p0:H[1],s0:a.h0,p1:H[1],s1:a.h1};const alt0=H[3]==='two'?['=']:[a.h0,'='];let all=true;
    Object.entries(want).forEach(([k,v])=>{const s=$('#hb-'+k,box),ok=k==='s0'?alt0.includes(s.value):s.value===v;s.classList.toggle('good',ok);s.classList.toggle('bad',!ok);if(!ok)all=false;});
    const why=[];if($('#hb-p0',box).value==='x̄'||$('#hb-p1',box).value==='x̄')why.push('Las hipótesis van sobre el parámetro de la población (μ o p), no sobre x̄.');
    if(['≠','<','>'].includes($('#hb-s0',box).value))why.push('H₀ siempre lleva la igualdad (=, ≤ o ≥).');
    $('#hb-fb',box).innerHTML=all?`<p class="verdict ok"><b>Correcto.</b> H₀: ${H[1]} ${a.h0} ${H[2]} &nbsp;·&nbsp; H₁: ${H[1]} ${a.h1} ${H[2]} — prueba <b>${H[3]==='two'?'bilateral':'unilateral '+(H[3]==='less'?'izquierda':'derecha')}</b>.${H[3]!=='two'?' (Muchos textos escriben H₀ con “=”; también es válido.)':''}</p>`:`<p class="fb">Revisa lo marcado en rojo. ${why.join(' ')||'Pregúntate: ¿qué se quiere demostrar o se sospecha? Eso va en H₁.'}</p>`;});
  $('#hb-new',box).addEventListener('click',nh);
  let E;function ne(){let n;do{n=pick(ERR);}while(n===E);E=n;$('#er-ctx',box).innerHTML=E[0];box.querySelectorAll('#er-b button').forEach(b=>{b.disabled=false;b.classList.remove('is-ok','is-bad');});$('#er-fb',box).textContent='';}
  box.querySelectorAll('#er-b button').forEach(b=>b.addEventListener('click',()=>{const ok=b.dataset.k===E[1];box.querySelectorAll('#er-b button').forEach(x=>{x.disabled=true;if(x.dataset.k===E[1])x.classList.add('is-ok');});if(!ok)b.classList.add('is-bad');$('#er-fb',box).innerHTML=(ok?'<strong>Bien.</strong> ':'<strong>No.</strong> ')+`Es error tipo ${E[1]}. ${E[2]}`;}));
  $('#er-new',box).addEventListener('click',ne);
  const s={a:'two',t:2.1,df:12};
  function pv(){$('#pv-t-o',box).textContent=nf(s.t,2);$('#pv-df-o',box).textContent=s.df;const p=pT(s.t,s.df,s.a),tc=s.a==='two'?ST.qT(0.05,s.df):ST.qT(0.10,s.df);
    const pts=[];for(let x=-4.5;x<=4.5001;x+=0.05)pts.push([x,dt(x,s.df)]);const inT=x=>s.a==='two'?Math.abs(x)>=Math.abs(s.t):s.a==='greater'?x>=s.t:x<=s.t;
    const segs=[];let cur=[];pts.forEach(q=>{if(inT(q[0]))cur.push(q);else if(cur.length){segs.push(cur);cur=[];}});if(cur.length)segs.push(cur);
    $('#pv-ch',box).innerHTML=chart({W:cw($('#pv-ch',box)),H:240,xmin:-4.5,xmax:4.5,ymin:0,ymax:0.42,yticks:[0,0.1,0.2,0.3,0.4],areas:segs.map(sg=>({pts:sg,cls:'acc'})),curves:[{pts}],
      vlines:[{x:s.t,cls:'acc',label:`t = ${nf(s.t,2)}`}].concat(s.a==='two'?[{x:tc},{x:-tc}]:[{x:s.a==='greater'?tc:-tc}]),xlabel:'t (líneas grises: valores críticos con α = 0,05)'});
    const v=$('#pv-v',box),rej=p<A05;v.className='verdict '+(rej?'ok':'');
    v.innerHTML=`Área sombreada = <b>valor p = ${fmt(p,4)}</b>. ${rej?'Es menor que 0,05: <b>se rechaza H₀</b>.':'Es mayor que 0,05: <b>no se rechaza H₀</b>.'}${s.a!=='two'&&((s.a==='greater'&&s.t<0)||(s.a==='less'&&s.t>0))?' Ojo: t está del lado contrario a H₁, por eso el valor p es grande.':''}`;}
  box.querySelectorAll('#pv-a button').forEach(b=>b.addEventListener('click',()=>{s.a=b.dataset.a;box.querySelectorAll('#pv-a button').forEach(x=>x.setAttribute('aria-pressed',x===b));pv();}));
  ['t','df'].forEach(k=>$('#pv-'+k,box).addEventListener('input',e=>{s[k]=+e.target.value;pv();}));
  nh();ne();pv();return pv;}
function quizHyp(){const qs=[],hs=shuffle(HYP).slice(0,3);
  hs.forEach(h=>{const a=ALT[h[3]];qs.push({type:'mc',text:`${h[0]}<br>¿Cuál es el par de hipótesis correcto?`,options:uniqOpts(`H₀: ${h[1]} ${a.h0} ${h[2]} · H₁: ${h[1]} ${a.h1} ${h[2]}`,[`H₀: ${h[1]} ${a.h1} ${h[2]} · H₁: ${h[1]} ${a.h0} ${h[2]}`,`H₀: ${h[1]==='μ'?'x̄':'p̂'} ${a.h0} ${h[2]} · H₁: ${h[1]==='μ'?'x̄':'p̂'} ${a.h1} ${h[2]}`,...Object.values(ALT).filter(x=>x!==a).map(x=>`H₀: ${h[1]} ${x.h0} ${h[2]} · H₁: ${h[1]} ${x.h1} ${h[2]}`)]),answer:0,explain:`Lo que se sospecha o se quiere demostrar va en H₁ (${a.h1}); la igualdad va en H₀.`});});
  const e=pick(ERR);qs.push({type:'mc',keepOrder:true,text:e[0]+'<br>¿Qué error se cometió?',options:['Error tipo I','Error tipo II'],answer:e[1]==='I'?0:1,explain:e[2]});
  const p=pick([0.002,0.018,0.041,0.067,0.12,0.38]);qs.push({type:'mc',keepOrder:true,text:`Una prueba da valor p = ${nf(p,3)}. Con α = 0,05, ¿qué decides?`,options:['Rechazo H₀','No rechazo H₀'],answer:p<0.05?0:1,explain:`${nf(p,3)} ${p<0.05?'&lt;':'&gt;'} 0,05.`});
  qs.push({type:'mc',text:'¿Qué significa α = 0,05?',options:['Que acepto un 5 % de probabilidad de rechazar H₀ cuando es verdadera','Que H₀ tiene 5 % de probabilidad de ser cierta','Que el 5 % de los datos son errores','Que el resultado es 95 % correcto'],answer:0,explain:'α es la probabilidad de cometer error tipo I.'});
  return qs;}

/* =============== 3.3 Prueba para una media =============== */
const M1=[
 {ctx:'Una arrocera declara <b>1000 g</b> por funda. Se pesan fundas al azar para verificar si el peso promedio es <b>diferente</b> de lo declarado.',v:'peso',lab:'Peso',u:'g',mu0:1000,sd:6,dec:0,alt:'two'},
 {ctx:'La norma pide que la leche entera tenga <b>3,0 %</b> de grasa como mínimo. Se sospecha que una planta entrega leche con <b>menos</b> grasa.',v:'grasa',lab:'Grasa',u:'%',mu0:3.0,sd:0.12,dec:2,alt:'less'},
 {ctx:'La etiqueta del atún declara <b>400 mg</b> de sodio por 100 g. Un cliente sospecha que el promedio es <b>mayor</b>.',v:'sodio',lab:'Sodio',u:'mg/100 g',mu0:400,sd:15,dec:0,alt:'greater'},
 {ctx:'Las botellas de jugo deben contener <b>500 mL</b>. Se revisa si la llenadora está entregando un volumen promedio <b>diferente</b>.',v:'volumen',lab:'Volumen',u:'mL',mu0:500,sd:3,dec:1,alt:'two'},
 {ctx:'Un proveedor asegura que su harina tiene humedad <b>menor que 14 %</b>. Se quiere demostrar esa afirmación con una muestra.',v:'humedad',lab:'Humedad',u:'%',mu0:14,sd:0.3,dec:2,alt:'less'},
 {ctx:'El néctar debe tener <b>12 °Brix</b>. Se controla si un lote se <b>aparta</b> de ese valor.',v:'brix',lab:'Sólidos solubles',u:'°Brix',mu0:12,sd:0.25,dec:2,alt:'two'},
 {ctx:'Un nuevo cultivo promete que el yogur alcance una acidez promedio <b>mayor que 0,80 %</b>. Se prueba con varios lotes.',v:'acidez',lab:'Acidez',u:'% ác. láctico',mu0:0.8,sd:0.04,dec:3,alt:'greater'},
 {ctx:'Las galletas deben pesar <b>15 g</b>. El supervisor quiere saber si el peso promedio cambió tras ajustar el molde.',v:'pesog',lab:'Peso de galleta',u:'g',mu0:15,sd:0.35,dec:2,alt:'two'},
 {ctx:'El tiempo de entrega prometido a los supermercados es como máximo <b>48 h</b>. Se sospecha que el promedio real lo <b>supera</b>.',v:'entrega',lab:'Tiempo de entrega',u:'h',mu0:48,sd:4,dec:1,alt:'greater'}];
function genM1(){const b=U.pickNew('m1',M1),n=rint(10,20),eff=Math.random()<0.6;let shift=eff?rnd(0.6,1.2)*b.sd*(b.alt==='less'?-1:b.alt==='greater'?1:pick([-1,1])):rnd(-0.25,0.25)*b.sd;
  const x=Array.from({length:n},()=>round(b.mu0+shift+gauss()*b.sd,b.dec)),m=ST.mean(x),s=ST.sd(x),se=s/Math.sqrt(n),t=(m-b.mu0)/se,df=n-1,p=pT(t,df,b.alt),tcrit=b.alt==='two'?ST.qT(0.05,df):ST.qT(0.10,df);
  return{...b,n,x,m,s,se,t,df,p,tcrit,lo:m-ST.qT(0.05,df)*se,hi:m+ST.qT(0.05,df)*se};}
function hypOpts(par,a,val){return[[`H₀: ${par} ${a.h0} ${val}<br>H₁: ${par} ${a.h1} ${val}`,true,'Correcto: lo que se sospecha o quiere demostrar va en H₁ y la igualdad en H₀.'],[`H₀: ${par} ${a.h1} ${val}<br>H₁: ${par} ${a.h0} ${val}`,false,'Está al revés: la igualdad va en H₀.'],[`H₀: x̄ ${a.h0} ${val}<br>H₁: x̄ ${a.h1} ${val}`,false,'Las hipótesis son sobre μ (la población), no sobre x̄ (la muestra).'],...Object.entries(ALT).filter(([,x])=>x!==a).slice(0,1).map(([,x])=>[`H₀: ${par} ${x.h0} ${val}<br>H₁: ${par} ${x.h1} ${val}`,false,`El enunciado no pide “${x.txt}”: revisa qué se quiere demostrar.`])];}
const tabsM1=[
 {label:'Plantea las hipótesis',render:(p,C)=>{const a=ALT[C.alt],v=`${nf(C.mu0,3)} ${C.u}`;U.steps(p,[
   {t:'Lee el problema',body:`<p class="ctx">${C.ctx}</p><p>Se midieron <b>n = ${C.n}</b> unidades.</p>`,q:{type:'mc',text:'¿Qué se quiere demostrar o se sospecha?',opts:[[`Que la media es ${a.txt} ${v}`,true,'Correcto: eso va en H₁.'],...Object.values(ALT).filter(x=>x!==a).map(x=>[`Que la media es ${x.txt} ${v}`,false,`No: relee el enunciado, la sospecha es que es ${a.txt} ${v}.`])]}},
   {t:'Escribe H₀ y H₁',q:{type:'mc',opts:hypOpts('μ',a,v)}},
   {t:'Elige la prueba',body:'<p>Tenemos una muestra, una media y no conocemos la desviación de la población (σ).</p>',q:{type:'mc',text:'¿Qué prueba corresponde?',opts:[['Prueba t para una muestra',true,'Correcto: con σ desconocida se usa s y la distribución t con n − 1 gl.'],['Prueba z para una proporción',false,'No: medimos una variable numérica, no una proporción.'],['Prueba t para dos muestras',false,'No: hay un solo grupo comparado contra un valor fijo.']]},
     after:`<p class="note">Prueba <b>${C.alt==='two'?'bilateral':'unilateral '+(C.alt==='less'?'izquierda':'derecha')}</b> con α = 0,05.</p>`}],'Hipótesis listas. Sigue con el paso a paso.');}},
 {label:'Paso a paso con Excel',render:(p,C)=>{const rr=`A2:A${C.n+1}`,cells=[[{v:C.lab,b:1},{v:'',b:1},{v:'Resultado',b:1}]];
   const res=[['n',C.n,`=CONTAR(${rr})`],['Media x̄',C.m,`=PROMEDIO(${rr})`],['Desv. estándar s',C.s,`=DESVEST.M(${rr})`],['μ₀ (valor de H₀)',C.mu0,''],['Error estándar',C.se,'=C4/RAIZ(C2)'],['t calculado',C.t,'=(C3-C5)/C6'],['gl',C.df,'=C2-1'],['Valor p',C.p,xlP(C.alt,'C7','C8')]];
   for(let i=0;i<Math.max(C.n,8);i++)cells.push([{v:i<C.n?C.x[i]:'',d:C.dec},i<8?{v:res[i][0],b:1}:{v:''},i<8?{v:res[i][1],f:res[i][2]||undefined,d:4}:{v:''}]);
   U.steps(p,[{t:'Ordena los datos en Excel',body:`<p>Una columna con las ${C.n} mediciones. Toca las celdas azules para ver la fórmula de cada resultado.</p>${U.sheet(cells)}`,mount:li=>U.mountSheet(li),
     q:{type:'num',text:'¿Cuánto vale el estadístico t? (dos decimales)',answer:round(C.t,2),tol:0.011,explain:`t = (x̄ − μ₀)/(s/√n) = (${fmt(C.m,4)} − ${nf(C.mu0,3)})/(${fmt(C.s,4)}/√${C.n}) = <b>${fmt(C.t,2)}</b>.`}},
    {t:'Calcula el valor p',body:`<div class="formula">gl = n − 1 = ${C.df} · ${C.alt==='two'?'p = P(|T| ≥ |t|)':C.alt==='greater'?'p = P(T ≥ t)':'p = P(T ≤ t)'} → en Excel: <code>${xlP(C.alt,'t','gl')}</code></div><p>Resultado: <b>p = ${fmt(C.p,4)}</b>. (Alternativa con el valor crítico: ${C.alt==='two'?`|t| vs t<sub>0,025; ${C.df}</sub> = ${fmt(C.tcrit,3)}`:`t vs ${C.alt==='less'?'−':''}${fmt(C.tcrit,3)}`}.)</p>`,
     q:{type:'mc',keepOrder:true,text:'Con α = 0,05, ¿qué decides?',opts:[['Se rechaza H₀',C.p<A05,`${C.p<A05?'Correcto':'No'}: p = ${fmt(C.p,4)} ${C.p<A05?'&lt;':'&gt;'} 0,05.`],['No se rechaza H₀',C.p>=A05,`${C.p>=A05?'Correcto':'No'}: p = ${fmt(C.p,4)} ${C.p<A05?'&lt;':'&gt;'} 0,05.`]]}}],'Listo. Ahora compara con la salida de JASP.');}},
 {label:'Salida de JASP',render:(p,C)=>{const a=ALT[C.alt];
   const html=U.jasp({title:'Estadísticos Descriptivos',head:[['','N','Media','DT','EE']],rows:[[C.v,{t:C.n,k:'n'},{t:jn(C.m),k:'m'},{t:jn(C.s),k:'s'},{t:jn(C.se),k:'se'}]]})
    +U.jasp({title:'Prueba T para Una Muestra',head:[['','t','gl','p','Diferencia de medias']],rows:[[C.v,{t:jn(C.t),k:'t'},{t:C.df,k:'df'},{t:jp(C.p),k:'p'},{t:jn(C.m-C.mu0),k:'d'}]],foot:[`<i>Nota.</i> Para la prueba t de Student, la hipótesis alternativa especifica que la media es ${a.js} ${C.mu0}.`]});
   U.readOut(p,html,shuffle([{t:'Toca el valor que usas para decidir.',k:['p'],e:`Es p = ${jp(C.p)}; se compara con 0,05.`},{t:'Toca el estadístico de prueba.',k:['t'],e:'Es t: cuántos errores estándar se aleja la media de μ₀.'},{t:'Toca los grados de libertad.',k:['df'],e:`gl = n − 1 = ${C.df}.`},{t:'Toca la desviación estándar de la muestra.',k:['s'],e:'En JASP se llama DT (desviación típica).'},{t:'Toca cuánto se aleja la media de la muestra del valor de H₀.',k:['d'],e:'Es la diferencia de medias: x̄ − μ₀.'}]).slice(0,4),{note:'JASP usa <b>punto</b> decimal y escribe “&lt; .001” cuando el valor p es muy pequeño. Antes de correr la prueba, en JASP se elige la hipótesis alternativa (≠, &gt; o &lt;): si no coincide con tu H₁, el valor p sale mal.'});}},
 {label:'Interpreta y redacta',render:(p,C)=>{const rej=C.p<A05,a=ALT[C.alt];U.interpret(p,{ctx:C.ctx,keyData:`t(${C.df}) = ${fmt(C.t,2)}; p = ${fmt(C.p,4)}; x̄ = ${fmt(C.m,3)} ${C.u}.`,
   sentence:`Con α = 0,05, {{s1}} H₀, porque el valor p (${fmt(C.p,4)}) es {{s2}} que 0,05. Por lo tanto, {{s3}} evidencia suficiente para afirmar que la media es ${a.txt} ${nf(C.mu0,3)} ${C.u}.`,
   blanks:[['s1',['se rechaza','no se rechaza'],rej?'se rechaza':'no se rechaza'],['s2',['menor','mayor'],rej?'menor':'mayor'],['s3',['existe','no existe'],rej?'existe':'no existe']],
   model:`Con α = 0,05, ${rej?'se rechaza':'no se rechaza'} H₀ (t(${C.df}) = ${fmt(C.t,2)}; p ${C.p<0.001?'&lt; 0,001':'= '+fmt(C.p,3)}). ${rej?'Existe':'No existe'} evidencia suficiente para afirmar que la ${C.lab.toLowerCase()} promedio es ${a.txt} ${nf(C.mu0,3)} ${C.u} (x̄ = ${fmt(C.m,2)} ${C.u}).`,
   statements:[[`${rej?'Se rechaza':'No se rechaza'} H₀: ${rej?'hay':'no hay'} evidencia suficiente de que la media sea ${a.txt} ${nf(C.mu0,3)} ${C.u}.`,true,'Decide con el valor p y habla de evidencia.'],
     [rej?`Se rechaza H₀, por lo tanto todas las unidades están fuera de ${nf(C.mu0,3)} ${C.u}.`:`Se acepta H₀: está demostrado que la media es exactamente ${nf(C.mu0,3)} ${C.u}.`,false,rej?'La prueba es sobre la media, no sobre cada unidad.':'No rechazar H₀ no demuestra que sea cierta: solo que no hay evidencia en contra.'],
     [`Como x̄ = ${fmt(C.m,2)} es ${C.m>C.mu0?'mayor':'menor'} que ${nf(C.mu0,3)}, la media es ${C.m>C.mu0?'mayor':'menor'} sin necesidad de prueba.`,false,'La diferencia puede deberse al azar del muestreo: para eso es la prueba.'],
     [`El valor p = ${fmt(C.p,4)} es la probabilidad de que H₀ sea verdadera.`,false,'El valor p es la probabilidad de obtener datos así de extremos si H₀ fuera cierta, no la probabilidad de H₀.']]});}},
 {label:'Datos para Excel y JASP',render:(p,C)=>U.dataTab(p,{files:[{label:'CSV para JASP (punto decimal)',name:`${C.v}_una_media_punto.csv`,text:()=>csvCol([[C.v],...C.x.map(v=>[v])],'.')},{label:'CSV para Excel (coma decimal)',name:`${C.v}_una_media_coma.csv`,text:()=>csvCol([[C.v],...C.x.map(v=>[v])],',')}],
   expect:[['t',fmt(C.t,3)],['gl',C.df],['Valor p',fmt(C.p,4)],['Media',fmt(C.m,4)]],
   guides:[{t:'En JASP',s:[['Abre el archivo','☰ (menú) → Abrir → Computadora → Explorar','Open → Computer → Browse'],['Elige la prueba','Pruebas T → Prueba T para una muestra (Clásica)','T-Tests → One Sample T-Test'],['Configura','Pasa la variable a la derecha. En <b>Valor de prueba</b> escribe '+C.mu0+'. En <b>Hipótesis alternativa</b> elige '+(C.alt==='two'?'≠ Valor de prueba':C.alt==='greater'?'&gt; Valor de prueba':'&lt; Valor de prueba')+'. Marca <b>Descriptivos</b>.','Test value · Alternative hypothesis · Descriptives']]},
     {t:'En Excel',s:[['Pega los datos','Una columna desde A2.'],['Calcula','Usa las fórmulas de la pestaña “Paso a paso”. El valor p: <code>'+xlP(C.alt,'t','gl')+'</code>.','T.DIST.2T / T.DIST.RT / T.DIST']]}]})}];

/* =============== 3.4 Dos grupos =============== */
const IND=[
 {ctx:'Se compara el <b>rendimiento de pulpa</b> de maracuyá de dos proveedores.',g:['Proveedor A','Proveedor B'],v:'rendimiento',lab:'Rendimiento',u:'%',mu:61,sd:2,dec:1,eff:2.2},
 {ctx:'Se compara el <b>tiempo de cocción</b> de dos variedades de fréjol.',g:['Canario','Panamito'],v:'coccion',lab:'Tiempo de cocción',u:'min',mu:48,sd:3.5,dec:1,eff:4},
 {ctx:'Se compara la <b>humedad</b> de chifles fritos en dos freidoras.',g:['Freidora 1','Freidora 2'],v:'humedad',lab:'Humedad',u:'%',mu:2.4,sd:0.25,dec:2,eff:0.3},
 {ctx:'Se compara el <b>peso</b> de camarones de dos piscinas.',g:['Piscina 1','Piscina 2'],v:'peso',lab:'Peso',u:'g',mu:18,sd:1.6,dec:1,eff:1.8},
 {ctx:'Se compara la <b>firmeza</b> de dos marcas de queso fresco.',g:['Marca X','Marca Y'],v:'firmeza',lab:'Firmeza',u:'N',mu:14,sd:1.1,dec:1,eff:1.3},
 {ctx:'Se compara la <b>vida útil</b> de pan con y sin conservante.',g:['Con conservante','Sin conservante'],v:'vidautil',lab:'Vida útil',u:'días',mu:7,sd:0.9,dec:1,eff:1.4}];
const PAR=[
 {ctx:'Se mide el <b>pH</b> de los mismos lotes de yogur al envasar y 24 h después.',g:['Al envasar','A las 24 h'],v:'ph',lab:'pH',u:'',mu:4.5,sd:0.12,dec:2,eff:-0.08,bs:0.15},
 {ctx:'Los mismos panelistas califican <b>dos versiones</b> de una bebida de avena.',g:['Versión actual','Versión nueva'],v:'puntaje',lab:'Puntaje',u:'puntos',mu:6.4,sd:0.5,dec:1,eff:0.5,bs:0.9},
 {ctx:'Se pesan las mismas piezas de jamón <b>antes y después</b> del cocido.',g:['Antes','Después'],v:'peso',lab:'Peso',u:'g',mu:950,sd:6,dec:0,eff:-55,bs:40},
 {ctx:'Las mismas muestras de jugo se miden con <b>dos refractómetros</b> para ver si dan lo mismo.',g:['Refractómetro A','Refractómetro B'],v:'brix',lab:'Sólidos solubles',u:'°Brix',mu:12,sd:0.08,dec:2,eff:0.1,bs:0.8},
 {ctx:'Se mide la <b>temperatura del núcleo</b> de los mismos productos con el termómetro de planta y uno patrón.',g:['Termómetro planta','Termómetro patrón'],v:'temp',lab:'Temperatura',u:'°C',mu:72,sd:0.3,dec:1,eff:0.4,bs:1.2}];
function genTwo(){const par=Math.random()<0.45,b=U.pickNew(par?'par':'ind',par?PAR:IND),eff=Math.random()<0.65;
  if(!par){const n1=rint(8,14),n2=rint(8,14),d=eff?b.eff*rnd(0.8,1.3)*pick([-1,1]):b.eff*rnd(-0.15,0.15);
    const x1=Array.from({length:n1},()=>round(b.mu+gauss()*b.sd,b.dec)),x2=Array.from({length:n2},()=>round(b.mu+d+gauss()*b.sd,b.dec));
    const m1=ST.mean(x1),m2=ST.mean(x2),s1=ST.sd(x1),s2=ST.sd(x2),sp2=((n1-1)*s1*s1+(n2-1)*s2*s2)/(n1+n2-2),se=Math.sqrt(sp2*(1/n1+1/n2)),t=(m1-m2)/se,df=n1+n2-2,lev=ST.levene([x1,x2]);
    return{...b,kind:'ind',x1,x2,n1,n2,m1,m2,s1,s2,sp2,se,t,df,p:ST.pT2(Math.abs(t),df),lev};}
  const n=rint(8,13),d=eff?b.eff*rnd(0.8,1.3):b.eff*rnd(-0.2,0.2),base=Array.from({length:n},()=>b.mu+gauss()*b.bs*b.sd);
  const x1=base.map(v=>round(v+gauss()*b.sd*0.5,b.dec)),x2=base.map(v=>round(v+d+gauss()*b.sd*0.5,b.dec)),dd=x1.map((v,i)=>v-x2[i]),md=ST.mean(dd),sd=ST.sd(dd),se=sd/Math.sqrt(n),t=md/se,df=n-1;
  return{...b,kind:'par',x1,x2,n1:n,n2:n,n,m1:ST.mean(x1),m2:ST.mean(x2),s1:ST.sd(x1),s2:ST.sd(x2),dd,md,sd,se,t,df,p:ST.pT2(Math.abs(t),df)};}
const tabsTwo=[
 {label:'Plantea las hipótesis',render:(p,C)=>U.steps(p,[
   {t:'¿Independientes o pareadas?',body:`<p class="ctx">${C.ctx}</p><p>Grupos: <b>${C.g[0]}</b> (n = ${C.n1}) y <b>${C.g[1]}</b> (n = ${C.n2}).</p>`,q:{type:'mc',text:'¿Cómo son las muestras?',opts:[['Independientes: son unidades distintas en cada grupo',C.kind==='ind',C.kind==='ind'?'Correcto: cada dato de un grupo no tiene “pareja” en el otro.':'No: aquí se mide lo mismo dos veces (mismos lotes, panelistas o piezas).'],['Pareadas: cada unidad se mide en las dos condiciones',C.kind==='par',C.kind==='par'?'Correcto: se mide lo mismo dos veces; se analizan las diferencias.':'No: son unidades distintas en cada grupo.']],keepOrder:true}},
   {t:'Escribe H₀ y H₁',body:`<p>Se quiere saber si hay diferencia entre <b>${C.g[0]}</b> y <b>${C.g[1]}</b> (prueba bilateral).</p>`,q:{type:'mc',opts:C.kind==='ind'?[[`H₀: μ₁ = μ₂<br>H₁: μ₁ ≠ μ₂`,true,'Correcto.'],[`H₀: μ₁ ≠ μ₂<br>H₁: μ₁ = μ₂`,false,'Al revés: la igualdad va en H₀.'],[`H₀: x̄₁ = x̄₂<br>H₁: x̄₁ ≠ x̄₂`,false,'Las hipótesis son sobre las medias de la población.']]
     :[[`H₀: μ<sub>d</sub> = 0<br>H₁: μ<sub>d</sub> ≠ 0`,true,'Correcto: d = diferencia de cada par.'],[`H₀: μ₁ = μ₂ con muestras independientes`,false,'Las muestras son pareadas: se trabaja con las diferencias.'],[`H₀: μ<sub>d</sub> ≠ 0<br>H₁: μ<sub>d</sub> = 0`,false,'Al revés.']]}},
   {t:'Elige la prueba',q:{type:'mc',opts:[['Prueba t para muestras independientes',C.kind==='ind',''],['Prueba t para muestras pareadas (apareadas)',C.kind==='par',''],['Prueba t para una muestra',false,'']].map(o=>[o[0],o[1],o[1]?'Correcto.':`No: corresponde la prueba t para muestras ${C.kind==='ind'?'independientes':'pareadas'}.`])}}],'Hipótesis listas.')},
 {label:'Paso a paso con Excel',render:(p,C)=>{const n=Math.max(C.n1,C.n2),r1=`A2:A${C.n1+1}`,r2=`B2:B${C.n2+1}`,cells=[[{v:C.g[0],b:1},{v:C.g[1],b:1},{v:'',b:1},{v:'Resultado',b:1}]];
   const res=C.kind==='ind'?[['Media 1',C.m1,`=PROMEDIO(${r1})`],['Media 2',C.m2,`=PROMEDIO(${r2})`],['s 1',C.s1,`=DESVEST.M(${r1})`],['s 2',C.s2,`=DESVEST.M(${r2})`],['Valor p',C.p,`=PRUEBA.T(${r1};${r2};2;2)`]]
     :[['Media 1',C.m1,`=PROMEDIO(${r1})`],['Media 2',C.m2,`=PROMEDIO(${r2})`],['Media de diferencias',C.md,'=D2-D3'],['Valor p',C.p,`=PRUEBA.T(${r1};${r2};2;1)`]];
   for(let i=0;i<Math.max(n,res.length);i++)cells.push([{v:i<C.n1?C.x1[i]:'',d:C.dec},{v:i<C.n2?C.x2[i]:'',d:C.dec},i<res.length?{v:res[i][0],b:1}:{v:''},i<res.length?{v:res[i][1],f:res[i][2],d:4}:{v:''}]);
   const fml=C.kind==='ind'?`<div class="formula">s²<sub>p</sub> = [(n₁−1)s₁² + (n₂−1)s₂²]/(n₁+n₂−2) = ${fmt(C.sp2,4)}<br>t = (x̄₁ − x̄₂)/√(s²<sub>p</sub>(1/n₁ + 1/n₂)) = (${fmt(C.m1,3)} − ${fmt(C.m2,3)})/${fmt(C.se,4)} = <b>${fmt(C.t,3)}</b> · gl = n₁ + n₂ − 2 = ${C.df}</div>`
     :`<div class="formula">d = ${C.g[0]} − ${C.g[1]} para cada unidad · d̄ = ${fmt(C.md,4)} · s<sub>d</sub> = ${fmt(C.sd,4)}<br>t = d̄/(s<sub>d</sub>/√n) = ${fmt(C.md,4)}/(${fmt(C.sd,4)}/√${C.n}) = <b>${fmt(C.t,3)}</b> · gl = n − 1 = ${C.df}</div>`;
   U.steps(p,[{t:'Los datos en Excel',body:`<p>Toca las celdas azules para ver las fórmulas. En <code>PRUEBA.T</code>, el tercer argumento (2) es bilateral y el cuarto es el tipo: <b>1 = pareada</b>, <b>2 = independientes con varianzas iguales</b>, 3 = varianzas distintas.</p>${U.sheet(cells)}`,mount:li=>U.mountSheet(li),
     q:{type:'mc',mono:true,text:'¿Qué fórmula da el valor p de esta prueba?',opts:[[`=PRUEBA.T(${r1};${r2};2;${C.kind==='ind'?2:1})`,true,'Correcto.'],[`=PRUEBA.T(${r1};${r2};2;${C.kind==='ind'?1:2})`,false,`El tipo ${C.kind==='ind'?1:2} es para muestras ${C.kind==='ind'?'pareadas':'independientes'}.`],[`=PRUEBA.T(${r1};${r2};1;${C.kind==='ind'?2:1})`,false,'Con 1 en el tercer argumento la prueba es de una cola; aquí es bilateral.']]}},
    {t:'El estadístico t',body:fml,q:{type:'num',text:'¿Cuántos grados de libertad tiene la prueba?',answer:C.df,tol:0,explain:`gl = ${C.kind==='ind'?`${C.n1} + ${C.n2} − 2`:`${C.n} − 1`} = <b>${C.df}</b>.`}},
    {t:'Decide',body:`<p>Valor p = <b>${fmt(C.p,4)}</b>.</p>`,q:{type:'mc',keepOrder:true,text:'Con α = 0,05…',opts:[['Se rechaza H₀',C.p<A05,`p ${C.p<A05?'&lt;':'&gt;'} 0,05.`],['No se rechaza H₀',C.p>=A05,`p ${C.p<A05?'&lt;':'&gt;'} 0,05.`]]}}],'Listo. Compara con JASP.');}},
 {label:'Salida de JASP',render:(p,C)=>{let html;
   if(C.kind==='ind')html=U.jasp({title:'Descriptivos de Grupo',head:[['','Grupo','N','Media','DT','EE']],rows:[[C.v,C.g[0],{t:C.n1,k:'n1'},{t:jn(C.m1),k:'m1'},{t:jn(C.s1)},{t:jn(C.s1/Math.sqrt(C.n1))}],['',C.g[1],{t:C.n2,k:'n2'},{t:jn(C.m2),k:'m2'},{t:jn(C.s2)},{t:jn(C.s2/Math.sqrt(C.n2))}]]})
     +U.jasp({title:'Prueba de Igualdad de Varianzas (Levene)',head:[['','F','gl1','gl2','p']],rows:[[C.v,{t:jn(C.lev.F)},1,C.df,{t:jp(C.lev.p),k:'lev'}]]})
     +U.jasp({title:'Prueba T de Muestras Independientes',head:[['','t','gl','p']],rows:[[C.v,{t:jn(C.t),k:'t'},{t:C.df,k:'df'},{t:jp(C.p),k:'p'}]],foot:['<i>Nota.</i> Prueba t de Student.']});
   else html=U.jasp({title:'Descriptivos',head:[['','N','Media','DT','EE']],rows:[[C.g[0],{t:C.n,k:'n1'},{t:jn(C.m1),k:'m1'},jn(C.s1),jn(C.s1/Math.sqrt(C.n))],[C.g[1],{t:C.n,k:'n2'},{t:jn(C.m2),k:'m2'},jn(C.s2),jn(C.s2/Math.sqrt(C.n))]]})
     +U.jasp({title:'Prueba T de Muestras Apareadas',head:[['Medida 1','','Medida 2','t','gl','p']],rows:[[C.g[0],'-',C.g[1],{t:jn(C.t),k:'t'},{t:C.df,k:'df'},{t:jp(C.p),k:'p'}]],foot:['<i>Nota.</i> Prueba t de Student.']});
   const qs=[{t:'Toca el valor que usas para decidir si hay diferencia.',k:['p'],e:`p = ${jp(C.p)}.`},{t:'Toca los grados de libertad.',k:['df'],e:`gl = ${C.df}.`},{t:`Toca la media de <b>${C.g[1]}</b>.`,k:['m2'],e:'Está en la tabla de descriptivos.'},{t:'Toca el estadístico de prueba.',k:['t'],e:'Es t.'}];
   if(C.kind==='ind')qs.push({t:'Toca el valor que indica si las varianzas se pueden considerar iguales.',k:['lev'],e:`Levene: p = ${jp(C.lev.p)} ${C.lev.p>A05?'&gt; 0,05: se asumen iguales (t de Student).':'&lt; 0,05: conviene usar la corrección de Welch.'}`});
   U.readOut(p,html,shuffle(qs).slice(0,4),{note:'En JASP: Pruebas T → '+(C.kind==='ind'?'Prueba T de Muestras Independientes (la variable de agrupación va en “Variable de agrupación”).':'Prueba T de Muestras Apareadas (cada medición en su columna; se arrastra el par).')});}},
 {label:'Interpreta y redacta',render:(p,C)=>{const rej=C.p<A05,hi=C.m1>C.m2?0:1;U.interpret(p,{ctx:C.ctx,keyData:`t(${C.df}) = ${fmt(C.t,2)}; p = ${fmt(C.p,4)}; medias: ${C.g[0]} ${fmt(C.m1,2)} y ${C.g[1]} ${fmt(C.m2,2)} ${C.u}.`,
   sentence:`Con α = 0,05, {{s1}} H₀ (p = ${fmt(C.p,4)}). Por lo tanto, {{s2}} una diferencia significativa en la ${C.lab.toLowerCase()} entre ${C.g[0]} y ${C.g[1]}.${rej?' El grupo con mayor media es {{s3}}.':''}`,
   blanks:[['s1',['se rechaza','no se rechaza'],rej?'se rechaza':'no se rechaza'],['s2',['existe','no existe'],rej?'existe':'no existe'],...(rej?[['s3',C.g,C.g[hi]]]:[])],
   model:`Con α = 0,05, ${rej?'se rechaza':'no se rechaza'} H₀ (t(${C.df}) = ${fmt(C.t,2)}; p ${C.p<0.001?'&lt; 0,001':'= '+fmt(C.p,3)}). ${rej?`Existe una diferencia significativa: ${C.g[hi]} presentó mayor ${C.lab.toLowerCase()} (${fmt(hi?C.m2:C.m1,2)} frente a ${fmt(hi?C.m1:C.m2,2)} ${C.u}).`:`No hay evidencia de diferencia en la ${C.lab.toLowerCase()} entre ambos grupos.`}`,
   statements:[[`${rej?'Hay':'No hay'} evidencia de diferencia entre las medias de ${C.g[0]} y ${C.g[1]} (p = ${fmt(C.p,4)}).`,true,'Correcta.'],
     [`Como las medias muestrales son distintas (${fmt(C.m1,2)} y ${fmt(C.m2,2)}), los grupos son diferentes.`,false,'Las medias de muestras casi siempre difieren un poco: la prueba dice si la diferencia es más grande que el azar.'],
     [C.kind==='par'?'Se usó la prueba para muestras independientes porque hay dos columnas de datos.':'Se usó la prueba pareada porque hay dos grupos.',false,C.kind==='par'?'Las mediciones son de las mismas unidades: corresponde la prueba pareada.':'Las unidades son distintas en cada grupo: corresponde la prueba para muestras independientes.'],
     [`Con p = ${fmt(C.p,4)}, hay ${fmt((1-C.p)*100,1)} % de probabilidad de que los grupos sean diferentes.`,false,'El valor p no es la probabilidad de que H₁ sea cierta.']]});}},
 {label:'Datos para Excel y JASP',render:(p,C)=>{const rowsW=[[C.g[0].replace(/\s+/g,'_'),C.g[1].replace(/\s+/g,'_')],...Array.from({length:Math.max(C.n1,C.n2)},(_,i)=>[C.x1[i]??'',C.x2[i]??''])],rowsL=[['grupo',C.v],...C.x1.map(v=>[1,v]),...C.x2.map(v=>[2,v])];
   U.dataTab(p,{intro:C.kind==='ind'?'Para JASP las muestras independientes van en <b>formato largo</b> (columna de grupo 1/2 y columna de la variable). Para Excel, cada grupo en su columna.':'Para muestras pareadas, cada medición va en su columna (una fila por unidad), tanto en JASP como en Excel.',
     files:[{label:'CSV para JASP (punto decimal)',name:`${C.v}_dos_grupos_punto.csv`,text:()=>csvCol(C.kind==='ind'?rowsL:rowsW,'.')},{label:'CSV para Excel (coma decimal)',name:`${C.v}_dos_grupos_coma.csv`,text:()=>csvCol(rowsW,',')}],
     expect:[['t',fmt(C.t,3)],['gl',C.df],['Valor p',fmt(C.p,4)]],
     guides:[{t:'En JASP',s:[['Abre el archivo','☰ → Abrir → Computadora → Explorar','Open → Computer → Browse'],['Prueba',C.kind==='ind'?'Pruebas T → Prueba T de Muestras Independientes. Variable dependiente: '+C.v+'; Variable de agrupación: grupo. Marca Descriptivos y, en Comprobación de supuestos, Igualdad de varianzas.':'Pruebas T → Prueba T de Muestras Apareadas. Arrastra las dos columnas como un par. Marca Descriptivos.',C.kind==='ind'?'Independent Samples T-Test':'Paired Samples T-Test']]},
       {t:'En Excel',s:[['Fórmula directa','<code>=PRUEBA.T(rango1;rango2;2;'+(C.kind==='ind'?2:1)+')</code>','T.TEST'],XL_ON,['Con Análisis de datos','Datos → Análisis de datos → '+(C.kind==='ind'?'<b>Prueba t para dos muestras suponiendo varianzas iguales</b>':'<b>Prueba t para medias de dos muestras emparejadas</b>')+'.','Data → Data Analysis']]}]});}}];

function quizM1(){const C=genM1(),a=ALT[C.alt],qs=[];
  qs.push({type:'mc',text:`${C.ctx}<br>¿Cuál es el par de hipótesis?`,options:uniqOpts(`H₀: μ ${a.h0} ${nf(C.mu0,3)} · H₁: μ ${a.h1} ${nf(C.mu0,3)}`,[`H₀: μ ${a.h1} ${nf(C.mu0,3)} · H₁: μ ${a.h0} ${nf(C.mu0,3)}`,`H₀: x̄ ${a.h0} ${nf(C.mu0,3)} · H₁: x̄ ${a.h1} ${nf(C.mu0,3)}`,...Object.values(ALT).filter(x=>x!==a).map(x=>`H₀: μ ${x.h0} ${nf(C.mu0,3)} · H₁: μ ${x.h1} ${nf(C.mu0,3)}`)]),answer:0,explain:`Se sospecha que la media es ${a.txt} ${nf(C.mu0,3)}: eso va en H₁.`});
  const m=round(C.m,3),s=round(C.s,3),t=(m-C.mu0)/(s/Math.sqrt(C.n));
  qs.push({type:'num',text:`Con n = ${C.n}, x̄ = ${nf(m,3)} y s = ${nf(s,3)}, calcula t (dos decimales).`,answer:round(t,2),tol:0.011,explain:`t = (${nf(m,3)} − ${nf(C.mu0,3)})/(${nf(s,3)}/√${C.n}) = <b>${fmt(t,2)}</b>.`});
  qs.push({type:'num',text:'¿Cuántos grados de libertad tiene esa prueba?',answer:C.n-1,tol:0,explain:`gl = n − 1 = <b>${C.n-1}</b>.`});
  qs.push({type:'mc',mono:true,text:`¿Qué fórmula de Excel da el valor p ${C.alt==='two'?'bilateral':C.alt==='greater'?'de cola derecha':'de cola izquierda'} si t está en C7 y gl en C8?`,options:uniqOpts(xlP(C.alt,'C7','C8'),[xlP('two','C7','C8'),xlP('greater','C7','C8'),xlP('less','C7','C8'),'=PRUEBA.T(C7;C8)']),answer:0,explain:`Para H₁ “${a.h1}” se usa <code>${xlP(C.alt,'C7','C8')}</code>.`});
  const pv=pick([0.003,0.021,0.044,0.061,0.18]);qs.push({type:'mc',keepOrder:true,text:`JASP muestra p = ${pv.toFixed(3)}. Con α = 0,05…`,options:['Se rechaza H₀','No se rechaza H₀'],answer:pv<0.05?0:1,explain:`${nf(pv,3)} ${pv<0.05?'&lt;':'&gt;'} 0,05.`});
  qs.push({type:'mc',text:'¿Por qué se usa la distribución t y no la normal z?',options:['Porque no se conoce σ y se estima con s','Porque la muestra es grande','Porque los datos son proporciones','Porque H₁ es bilateral'],answer:0,explain:'Al estimar σ con s se agrega incertidumbre; la t lo considera con n − 1 gl.'});
  return qs;}
function quizTwo(){const qs=[],C=genTwo();
  const pi=pick([...IND.map(b=>[b.ctx,'ind']),...PAR.map(b=>[b.ctx,'par'])]);qs.push({type:'mc',keepOrder:true,text:pi[0]+'<br>¿Qué prueba corresponde?',options:['t para muestras independientes','t para muestras pareadas'],answer:pi[1]==='ind'?0:1,explain:pi[1]==='ind'?'Son unidades distintas en cada grupo.':'Se mide lo mismo dos veces en las mismas unidades.'});
  qs.push({type:'num',text:`${C.ctx} Con n₁ = ${C.n1} y n₂ = ${C.n2} ${C.kind==='par'?'(mediciones pareadas)':'(grupos independientes)'}, ¿cuántos gl tiene la prueba t?`,answer:C.df,tol:0,explain:`gl = ${C.kind==='ind'?'n₁ + n₂ − 2':'n − 1'} = <b>${C.df}</b>.`});
  qs.push({type:'mc',mono:true,text:'En <code>=PRUEBA.T(A2:A11;B2:B11;2;1)</code>, ¿qué indica el último 1?',options:['Que la prueba es pareada','Que la prueba es de una cola','Que α = 0,01','Que las varianzas son distintas'],answer:0,explain:'El cuarto argumento es el tipo: 1 pareada, 2 varianzas iguales, 3 varianzas distintas.'});
  const d=[rnd(-1,1),rnd(-1,1),rnd(-1,1),rnd(-1,1),rnd(-1,1)].map(v=>round(v,1)),md=ST.mean(d);qs.push({type:'num',text:`En una prueba pareada, las diferencias fueron ${d.map(v=>nf(v,1)).join('; ')}. ¿Cuál es la media de las diferencias d̄? (dos decimales)`,answer:round(md,2),tol:0.011,explain:`d̄ = (${d.map(v=>nf(v,1)).join(' + ')})/5 = <b>${fmt(md,2)}</b>.`});
  const pv=pick([0.002,0.03,0.07,0.25]);qs.push({type:'mc',text:`La prueba de Levene da p = ${nf(pv,3)}. ¿Qué significa?`,options:pv<0.05?['Las varianzas difieren: conviene la corrección de Welch','Las medias son iguales','Las varianzas son iguales','Se debe usar la prueba pareada']:['No hay evidencia de varianzas distintas: se usa la t de Student','Las medias son diferentes','Las varianzas difieren','Se debe usar la prueba pareada'],answer:0,explain:'Levene evalúa la igualdad de varianzas, no de medias.'});
  return qs;}

CIMA.addUnit(META,{id:'u3',orden:3,nombre:'Unidad 3 · Inferencia estadística',topics:[
 {id:'intervalos',n:'3.1',short:'Intervalos de confianza',title:'Intervalos de confianza',desc:'Estimar la media y la proporción de un lote con un margen de error.',
  lead:'Con una muestra nunca sabemos el valor exacto del lote, pero sí podemos dar un rango creíble. Eso es un intervalo de confianza.',
  idea:`<div class="formula">Media (σ desconocida): x̄ ± t<sub>α/2; n−1</sub> · s/√n &nbsp;·&nbsp; Proporción: p̂ ± z<sub>α/2</sub> · √(p̂(1 − p̂)/n)<br>Excel: <code>=INTERVALO.CONFIANZA.T(0,05;s;n)</code> da el margen de error · <code>=INV.T.2C(0,05;gl)</code> da t</div>
   <p>“95 % de confianza” significa que el método atrapa a la media real en 95 de cada 100 muestras. No es la probabilidad de que un dato caiga en el intervalo.</p>`,
  simHint:'Mira cuántos intervalos atrapan a μ, calcula uno en Excel y otro para una proporción.',sim:simIC,quiz:quizIC},
 {id:'hipotesis',n:'3.2',short:'Plantear hipótesis',title:'Cómo plantear hipótesis',desc:'H₀ y H₁, una o dos colas, errores tipo I y II y valor p.',
  lead:'Una prueba de hipótesis bien hecha empieza por escribir bien H₀ y H₁. Si las hipótesis están mal, todo lo demás también.',
  idea:`<ol><li>Identifica el <b>parámetro</b>: μ (media) o p (proporción).</li><li>Escribe en <b>H₁</b> lo que se sospecha o se quiere demostrar (≠, &lt; o &gt;).</li><li>H₀ es lo contrario y lleva la <b>igualdad</b>.</li><li>Fija α (normalmente 0,05), calcula el estadístico y el <b>valor p</b>.</li><li>Si p &lt; α se rechaza H₀; si no, <b>no se rechaza</b> (nunca “se acepta”).</li></ol>`,
  simHint:'Arma hipótesis a partir de enunciados de planta, reconoce errores y mira el valor p como un área.',sim:simHyp,quiz:quizHyp},
 {id:'una-media',n:'3.3',short:'Prueba para una media',title:'Prueba de hipótesis para una media',desc:'¿Cumple el lote el valor nominal? Prueba t con Excel y JASP.',
  lead:'¿Las fundas pesan lo declarado? ¿La leche cumple la grasa mínima? La prueba t para una muestra compara la media de un lote con un valor de referencia.',
  idea:`<div class="formula">t = (x̄ − μ₀)/(s/√n), con gl = n − 1<br>Valor p en Excel: bilateral <code>=DISTR.T.2C(ABS(t);gl)</code> · cola derecha <code>=DISTR.T.CD(t;gl)</code> · cola izquierda <code>=DISTR.T.N(t;gl;VERDADERO)</code></div>
   <p><b>Ruta:</b> plantea hipótesis → calcula t → valor p → decide → redacta. En JASP elige la misma hipótesis alternativa que planteaste.</p>`,
  simHint:'Un caso de planta, de las hipótesis a la conclusión, con Excel y JASP.',sim:box=>U.lab(box,genM1,tabsM1),quiz:quizM1},
 {id:'dos-grupos',n:'3.4',short:'Dos grupos',title:'Comparación de dos grupos',desc:'Prueba t para muestras independientes y pareadas.',
  lead:'Dos proveedores, dos equipos, antes y después: comparar dos grupos es una de las preguntas más comunes en planta. La clave es saber si las muestras son independientes o pareadas.',
  idea:`<div class="types"><div class="type"><b>Independientes</b><span>Unidades distintas en cada grupo. t = (x̄₁ − x̄₂)/√(s²<sub>p</sub>(1/n₁ + 1/n₂)), gl = n₁ + n₂ − 2.</span></div><div class="type"><b>Pareadas</b><span>Las mismas unidades medidas dos veces. Se trabaja con d = x₁ − x₂: t = d̄/(s<sub>d</sub>/√n), gl = n − 1.</span></div></div>
   <div class="formula">Excel: <code>=PRUEBA.T(rango1;rango2;colas;tipo)</code> · tipo 1 = pareada · 2 = varianzas iguales · 3 = varianzas distintas</div>`,
  simHint:'Decide si son independientes o pareadas y analiza el caso con Excel y JASP.',sim:box=>U.lab(box,genTwo,tabsTwo),quiz:quizTwo}]});
})();
