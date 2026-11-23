/* =====================================================================
   CIMA · ESTADÍSTICA · 3.5 ¿Qué prueba uso? (v1.3, refuerzo)
   Basado en la lámina del docente (Análisis previo + Pruebas estadísticas),
   corregida y ampliada: Friedman, Levene y Welch, normalidad de las
   diferencias, comparaciones posteriores y la rama de variables
   categóricas y de relación. Rutas en JASP y Excel; SPSS como apoyo.
   ===================================================================== */
(function(){
"use strict";
const META={id:'estadistica',nombre:'Estadística',orden:2};
const A05=0.05;

/* ---------------- Pruebas ---------------- */
const R={
 t1:{n:'Prueba t para una muestra',par:true,why:'Comparas la media de una muestra con un valor fijo (la norma, la etiqueta) y los datos son normales.',post:'',
   jasp:'Pruebas T → Prueba T de una muestra; en <b>Valor de prueba</b> escribe el valor de referencia (T-Tests → One Sample T-Test).',excel:'Análisis de datos no la trae. Se calcula t = (x̄ − μ₀)/(s/√n) y la Sig. con <code>=DISTR.T.2C(ABS(t);n−1)</code>.',spss:'Analizar → Comparar medias → Prueba T para una muestra.',link:'estadistica/una-media'},
 w1:{n:'Wilcoxon de rangos con signo (una muestra)',par:false,why:'Comparas una muestra con un valor fijo, pero los datos no son normales.',post:'',
   jasp:'Pruebas T → Prueba T de una muestra → en Pruebas marca <b>Wilcoxon de rangos con signo</b> (Wilcoxon signed-rank).',excel:'',spss:'Analizar → Pruebas no paramétricas → Una muestra.',link:'estadistica/una-media'},
 tpar:{n:'Prueba t para muestras relacionadas',par:true,why:'Las mismas unidades se miden dos veces (antes y después, dos métodos sobre la misma muestra) y las <b>diferencias</b> son normales.',post:'',
   jasp:'Pruebas T → Prueba T de muestras pareadas (T-Tests → Paired Samples T-Test). En Comprobación de supuestos marca Normalidad: JASP la revisa en las diferencias.',excel:'Datos → Análisis de datos → <b>Prueba t para medias de dos muestras emparejadas</b>.',spss:'Analizar → Comparar medias → Prueba T para muestras relacionadas.',link:'estadistica/dos-grupos'},
 wil:{n:'Wilcoxon (muestras relacionadas)',par:false,why:'Dos mediciones sobre las mismas unidades, pero las diferencias no son normales.',post:'',
   jasp:'Pruebas T → Prueba T de muestras pareadas → en Pruebas marca <b>Wilcoxon de rangos con signo</b>.',excel:'',spss:'Analizar → Pruebas no paramétricas → Cuadros de diálogo antiguos → 2 muestras relacionadas → Wilcoxon.',link:'estadistica/dos-grupos'},
 tind:{n:'Prueba t para muestras independientes (Student)',par:true,why:'Dos grupos distintos, normales y con varianzas iguales (Levene con Sig. &gt; 0,05).',post:'',
   jasp:'Pruebas T → Prueba T de muestras independientes → <b>Student</b>; en Comprobación de supuestos marca Normalidad e Igualdad de varianzas (T-Tests → Independent Samples T-Test).',excel:'Datos → Análisis de datos → <b>Prueba t para dos muestras suponiendo varianzas iguales</b>.',spss:'Analizar → Comparar medias → Prueba T para muestras independientes (fila “Se asumen varianzas iguales”).',link:'estadistica/dos-grupos'},
 welch:{n:'Prueba t de Welch',par:true,why:'Dos grupos distintos y normales, pero con varianzas diferentes (Levene con Sig. &lt; 0,05).',post:'',
   jasp:'Pruebas T → Prueba T de muestras independientes → marca <b>Welch</b>.',excel:'Datos → Análisis de datos → <b>Prueba t para dos muestras suponiendo varianzas desiguales</b>.',spss:'La misma tabla de la prueba T para muestras independientes, fila “No se asumen varianzas iguales”.',link:'estadistica/dos-grupos'},
 mw:{n:'U de Mann-Whitney',par:false,why:'Dos grupos distintos y los datos no son normales (o son puntajes ordinales).',post:'',
   jasp:'Pruebas T → Prueba T de muestras independientes → marca <b>Mann-Whitney</b>.',excel:'',spss:'Analizar → Pruebas no paramétricas → Cuadros de diálogo antiguos → 2 muestras independientes → U de Mann-Whitney.',link:'estadistica/dos-grupos'},
 anova:{n:'ANOVA de un factor',par:true,why:'Tres o más grupos distintos, normales y con varianzas iguales.',post:'Si se rechaza H₀: <b>Tukey</b>, para saber qué grupos difieren.',
   jasp:'ANOVA → ANOVA; Comprobación de supuestos → Homogeneidad; Post Hoc → <b>Tukey</b>.',excel:'Datos → Análisis de datos → <b>Análisis de varianza de un factor</b>. Excel no hace Tukey: se calcula a mano o en JASP.',spss:'Analizar → Comparar medias → ANOVA de un factor; Post hoc → Tukey.',link:'estadistica/anova-intro'},
 wanova:{n:'ANOVA de Welch',par:true,why:'Tres o más grupos normales, pero con varianzas diferentes.',post:'Si se rechaza H₀: <b>Games-Howell</b>, que no supone varianzas iguales.',
   jasp:'ANOVA → ANOVA → Correcciones de homogeneidad → <b>Welch</b>; Post Hoc → Games-Howell.',excel:'',spss:'ANOVA de un factor → Opciones → Welch; Post hoc → Games-Howell.',link:'estadistica/anova-intro'},
 kw:{n:'Kruskal-Wallis',par:false,why:'Tres o más grupos distintos y los datos no son normales.',post:'Si se rechaza H₀: comparaciones por pares de <b>Dunn</b>, con corrección de Bonferroni.',
   jasp:'ANOVA → ANOVA → <b>Pruebas no paramétricas</b> (Kruskal-Wallis); Post Hoc → Dunn.',excel:'',spss:'Analizar → Pruebas no paramétricas → Cuadros de diálogo antiguos → K muestras independientes → H de Kruskal-Wallis.',link:'estadistica/anova-intro'},
 rm:{n:'ANOVA de medidas repetidas',par:true,why:'Tres o más mediciones sobre las mismas unidades (los mismos panelistas, los mismos lotes) y los residuos son normales. En Diseño, el DBCA es este mismo caso.',post:'Si se rechaza H₀: comparaciones con <b>Bonferroni</b>.',
   jasp:'ANOVA → <b>ANOVA de medidas repetidas</b>; Post Hoc → Bonferroni.',excel:'',spss:'Analizar → Modelo lineal general → Medidas repetidas (o Univariado con el bloque, como en el DBCA).',link:'diseno/dbca'},
 fried:{n:'Friedman',par:false,why:'Tres o más mediciones sobre las mismas unidades y los datos no son normales (o son rangos).',post:'Si se rechaza H₀: comparaciones por pares (Conover o Wilcoxon con Bonferroni).',
   jasp:'ANOVA → ANOVA de medidas repetidas → <b>Pruebas no paramétricas</b> (Friedman).',excel:'',spss:'Analizar → Pruebas no paramétricas → Cuadros de diálogo antiguos → K muestras relacionadas → Friedman.',link:'diseno/dbca'},
 pear:{n:'Correlación de Pearson',par:true,why:'Relación lineal entre dos variables numéricas, ambas normales.',post:'',
   jasp:'Regresión → Correlación → marca <b>Pearson</b>.',excel:'<code>=COEF.DE.CORREL(rango1;rango2)</code>, o Análisis de datos → Coeficiente de correlación.',spss:'Analizar → Correlacionar → Bivariadas → Pearson.',link:'estadistica/correlacion'},
 spear:{n:'Correlación de Spearman',par:false,why:'Relación entre dos variables numéricas que no son normales, o cuando una es ordinal (un orden de preferencia).',post:'',
   jasp:'Regresión → Correlación → marca <b>Spearman</b>.',excel:'',spss:'Analizar → Correlacionar → Bivariadas → Spearman.',link:'estadistica/correlacion'},
 chi:{n:'Chi-cuadrado de independencia',par:false,why:'Dos variables categóricas (tipo de envase, con o sin reclamo): ¿están asociadas? Pide frecuencias esperadas de 5 o más en las celdas.',post:'',
   jasp:'Frecuencias → Tablas de contingencia → Estadísticos → χ².',excel:'<code>=PRUEBA.CHICUAD(rango_observado;rango_esperado)</code>.',spss:'Analizar → Estadísticos descriptivos → Tablas cruzadas → Estadísticos → Chi-cuadrado.',link:'estadistica/chi-cuadrado'}};
const TREE={
 q1:{t:'¿Qué quieres hacer?',o:[['Comparar una media con un valor de referencia (la norma, la etiqueta)','q1n'],['Comparar grupos','q2'],['Medir la relación entre dos variables numéricas','qr'],['Ver si dos variables categóricas están asociadas','chi']]},
 q1n:{t:'¿Los datos son normales?',help:'Shapiro-Wilk si n &lt; 50; Kolmogorov-Smirnov si n ≥ 50. Normal si Sig. &gt; 0,05.',o:[['Sí','t1'],['No','w1']]},
 q2:{t:'¿Cuántos grupos comparas?',o:[['Dos','q3a'],['Tres o más','q3b']]},
 q3a:{t:'¿Las muestras son relacionadas o independientes?',help:'<b>Relacionadas</b>: las mismas unidades medidas dos veces (antes y después). <b>Independientes</b>: unidades distintas en cada grupo.',o:[['Relacionadas','q4r2'],['Independientes','q4i2']]},
 q4r2:{t:'¿Las diferencias (antes − después) son normales?',help:'En muestras relacionadas la normalidad se revisa en la columna de <b>diferencias</b>, no en cada grupo.',o:[['Sí','tpar'],['No','wil']]},
 q4i2:{t:'¿Cada grupo es normal?',o:[['Sí','q5i2'],['No','mw']]},
 q5i2:{t:'¿Las varianzas son iguales? (Levene)',help:'Levene con Sig. &gt; 0,05: no se rechaza la igualdad de varianzas.',o:[['Sí, Sig. &gt; 0,05','tind'],['No, Sig. &lt; 0,05','welch']]},
 q3b:{t:'¿Las muestras son relacionadas o independientes?',help:'Relacionadas: los mismos panelistas o lotes reciben todos los tratamientos.',o:[['Relacionadas','q4rk'],['Independientes','q4ik']]},
 q4rk:{t:'¿Los residuos son normales?',o:[['Sí','rm'],['No','fried']]},
 q4ik:{t:'¿Cada grupo es normal (o los residuos)?',o:[['Sí','q5ik'],['No','kw']]},
 q5ik:{t:'¿Las varianzas son iguales? (Levene)',o:[['Sí, Sig. &gt; 0,05','anova'],['No, Sig. &lt; 0,05','wanova']]},
 qr:{t:'¿Ambas variables son normales y la relación es lineal?',o:[['Sí','pear'],['No, o una es ordinal','spear']]}};
const ROWS=[['Una muestra frente a un valor','t1','w1'],['2 muestras relacionadas','tpar','wil'],['2 muestras independientes',['tind','welch'],'mw'],['3 o más independientes',['anova','wanova'],'kw'],['3 o más relacionadas','rm','fried'],['Relación entre 2 numéricas','pear','spear'],['Asociación entre 2 categóricas',null,'chi']];
const tlink=k=>{const[s,t]=k.split('/'),tp=CIMA.topic(s,t);return tp?`<a class="btn btn-ghost sm" href="#/tema/${k}">Practicar en ${esc(CIMA.subject(s).nombre)} ${tp.n} →</a>`:'';};
function card(k){const r=R[k];return`<div class="pr-card"><p class="eyebrow">${r.par?'Paramétrica':'No paramétrica'}</p><h3>${r.n}</h3><p>${r.why}</p>${r.post?`<p><b>Después:</b> ${r.post}</p>`:''}
  <dl class="pr-sw"><dt>JASP</dt><dd>${r.jasp}</dd><dt>Excel</dt><dd>${r.excel||'Excel no la tiene: usa JASP.'}</dd><dt class="sec">SPSS (Diseño)</dt><dd class="sec">${r.spss}</dd></dl>${tlink(r.link)}</div>`;}
const cellKeys=c=>c==null?[]:Array.isArray(c)?c:[c];

/* ---------------- Normalidad: Lilliefors (como SPSS) ---------------- */
function lillie(x){const n=x.length,m=ST.mean(x),s=ST.sd(x),z=[...x].sort((a,b)=>a-b).map(v=>ST.Phi((v-m)/s));let D=0;
  z.forEach((p,i)=>{D=Math.max(D,(i+1)/n-p,p-i/n);});let Kd=D,nd=n;if(n>100){Kd=D*Math.pow(n/100,0.49);nd=100;}
  let p=Math.exp(-7.01256*Kd*Kd*(nd+2.78019)+2.99587*Kd*Math.sqrt(nd+2.78019)-0.122119+0.974598/Math.sqrt(nd)+1.67997/nd);
  if(p>0.1){const KK=(Math.sqrt(n)-0.01+0.85/Math.sqrt(n))*D;p=KK<=0.302?1:KK<=0.5?2.76773-19.828315*KK+80.709644*KK**2-138.55152*KK**3+81.218052*KK**4:KK<=0.9?-4.901232+40.662806*KK-97.490286*KK**2+94.029866*KK**3-32.355711*KK**4:KK<=1.31?6.198765-19.558097*KK+23.186922*KK**2-12.234627*KK**3+2.423045*KK**4:0;}
  return{D,p:Math.max(0,Math.min(1,p))};}
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
function sample(n,skew,mu=50,sd=4){return Array.from({length:n},()=>{const z=gauss(),e=-Math.log(Math.random()||1e-9)-1;return round(mu+sd*((1-skew)*z+skew*1.25*e),1);});}
const spP=p=>{let s=p.toFixed(3).replace('.',',');return s.startsWith('0,')?s.slice(1):s;};
function normTable(x){const n=x.length,ks=lillie(x),sw=ST.shapiro(x),ksTxt=ks.p>0.2?',200<sup>*</sup>':spP(ks.p);
  return{n,ks,sw,html:`<div class="spss-t"><div class="spss-title">Pruebas de normalidad</div><table><tr><th rowspan="2"></th><th colspan="3">Kolmogorov-Smirnov<sup>a</sup></th><th colspan="3">Shapiro-Wilk</th></tr><tr><th>Estadístico</th><th>gl</th><th>Sig.</th><th>Estadístico</th><th>gl</th><th>Sig.</th></tr>
   <tr><td class="sl">Humedad</td><td class="sn">${spP(ks.D)}</td><td class="sn">${n}</td><td class="sn">${ksTxt}</td><td class="sn">${spP(sw.W)}</td><td class="sn">${n}</td><td class="sn">${spP(sw.p)}</td></tr></table>
   <div class="spss-foot">*. Esto es un límite inferior de la significación verdadera.</div><div class="spss-foot">a. Corrección de significación de Lilliefors</div></div>`};}
function histo(x,W){const lo=Math.min(...x),hi=Math.max(...x),k=Math.max(5,Math.min(12,Math.round(Math.sqrt(x.length)))),w=(hi-lo)/k||1,cnt=Array(k).fill(0);x.forEach(v=>cnt[Math.min(k-1,Math.floor((v-lo)/w))]++);
  const H=180,mx=Math.max(...cnt),bw=(W-40)/k;return`<svg class="hist" viewBox="0 0 ${W} ${H+24}" width="100%" role="img" aria-label="Histograma">${cnt.map((c,i)=>`<rect x="${20+i*bw+1}" y="${H-c/mx*(H-10)}" width="${bw-2}" height="${c/mx*(H-10)}" rx="2"></rect>`).join('')}<line x1="20" y1="${H}" x2="${W-20}" y2="${H}" class="ax"></line><text x="20" y="${H+18}" class="tk">${nf(lo,1)}</text><text x="${W-20}" y="${H+18}" class="tk" text-anchor="end">${nf(hi,1)}</text></svg>`;}
function qq(x,W){const n=x.length,s=[...x].sort((a,b)=>a-b),m=ST.mean(x),sd=ST.sd(x),pts=s.map((v,i)=>({x:ST.qnorm((i+0.625)/(n+0.25)),y:(v-m)/sd}));const r=Math.max(3,...pts.map(p=>Math.max(Math.abs(p.x),Math.abs(p.y))));
  return chart({W,H:220,xmin:-r,xmax:r,ymin:-r,ymax:r,xticks:[-2,-1,0,1,2],xlabel:'Esperado si fuera normal (z)',curves:[{pts:[[-r,-r],[r,r]],cls:'s1'}],points:pts.map(p=>({x:p.x,y:p.y,cls:'sc s0'})),yfmt:v=>nf(v,0),ml:40});}

/* ---------------- Casos ---------------- */
const CASES=[
 ['El jefe de calidad quiere saber si el peso medio de 25 fundas de chifles (datos normales) es igual a los 150 g de la etiqueta.','t1'],
 ['Se quiere comprobar si la humedad de 18 muestras de harina supera el 14 % de la norma; Shapiro-Wilk da Sig. = ,01.','w1'],
 ['Se mide el pH de 12 lotes de yogur al elaborarlos y a los 7 días; las diferencias son normales.','tpar'],
 ['10 panelistas califican la textura de un queso antes y después de cambiar el cuajo; las diferencias no son normales.','wil'],
 ['Se compara la grasa de la leche de dos haciendas, con 20 muestras de cada una; ambos grupos son normales y Levene da Sig. = ,41.','tind'],
 ['Se compara la grasa de la leche de dos haciendas; ambos grupos son normales, pero Levene da Sig. = ,003.','welch'],
 ['Dos grupos distintos de consumidores califican dos marcas de café en una escala de 1 a 9; Shapiro-Wilk da Sig. = ,002.','mw'],
 ['Se comparan 4 temperaturas de secado de cacao sobre la humedad final, con 6 lotes por temperatura; datos normales y varianzas iguales.','anova'],
 ['Se compara la vida útil de pan con 3 empaques; los datos son normales, pero Levene da Sig. = ,01.','wanova'],
 ['Se comparan 3 proveedores de harina por su contenido de gluten; los datos no son normales.','kw'],
 ['Los mismos 8 panelistas califican 3 formulaciones de bebida de avena; los residuos son normales.','rm'],
 ['Los mismos 8 panelistas ordenan 4 mermeladas de la que más les gusta a la que menos.','fried'],
 ['¿Están relacionadas linealmente la temperatura de fritura y el contenido de aceite de los chifles? Ambas variables son normales.','pear'],
 ['Se relaciona el orden de preferencia de 10 jueces con el tiempo de maduración del queso.','spear'],
 ['¿El tipo de envase (vidrio, PET o lata) está asociado con que el producto tenga o no reclamos?','chi']];

/* ---------------- Simulador ---------------- */
function sim(box){
  tabsUI(box,[{label:'Árbol de decisión',render:treeTab},{label:'La matriz',render:matrixTab},{label:'Laboratorio de normalidad',render:normTab},{label:'Lee la salida',render:readTab},{label:'Clasifica casos',render:casesTab}]);return null;}
let LAST=null;
function treeTab(p){let path=['q1'];
  p.innerHTML=`<p class="ctx">Responde las preguntas sobre tus datos. Antes de elegir una prueba para comparar grupos se hace el <b>análisis previo</b>: normalidad y, si los grupos son independientes, igualdad de varianzas.</p><div class="tree" id="pt"></div>`;
  const draw=()=>{const out=[];path.forEach((n,i)=>{const nd=TREE[n];if(nd){const ch=path[i+1];out.push(`<div class="tnode"><p><b>${nd.t}</b></p>${nd.help?`<p class="note">${nd.help}</p>`:''}<div class="seg seg-wrap">${nd.o.map(o=>`<button type="button" data-n="${n}" data-to="${o[1]}" aria-pressed="${ch===o[1]}">${o[0]}</button>`).join('')}</div></div>`);}
      else{LAST=n;out.push(`<div class="tres">${card(n)}<button type="button" class="btn btn-ghost sm" id="pt-r">Empezar de nuevo</button></div>`);}});
    $('#pt',p).innerHTML=out.join('');p.querySelectorAll('[data-to]').forEach(b=>b.addEventListener('click',()=>{path=path.slice(0,path.indexOf(b.dataset.n)+1);path.push(b.dataset.to);draw();}));
    const r=$('#pt-r',p);if(r)r.addEventListener('click',()=>{path=['q1'];LAST=null;draw();});};draw();}
function matrixTab(p){
  p.innerHTML=`<div class="part"><h3 class="sub">Análisis previo: prueba de normalidad</h3><p class="ctx">H₀: los datos siguen una distribución normal. H₁: no la siguen. Si Sig. &gt; 0,05 <b>no se rechaza</b> H₀ y se trabaja con pruebas paramétricas; si Sig. &lt; 0,05, con no paramétricas.</p>
   <div class="table-wrap"><table class="tbl"><thead><tr><th></th><th>Kolmogorov-Smirnov</th><th>Shapiro-Wilk</th></tr></thead><tbody><tr><td>Regla que usamos (Sen, 2012)</td><td>n ≥ 50</td><td>n &lt; 50</td></tr><tr><td class="note">Otra referencia (Malhotra, 2008)</td><td class="note">n ≥ 35</td><td class="note">n &lt; 35</td></tr></tbody></table></div>
   <p class="note">Si los grupos son independientes, revisa también la <b>igualdad de varianzas</b> con Levene (Sig. &gt; 0,05: varianzas iguales). En muestras relacionadas, la normalidad se revisa en las <b>diferencias</b>.</p></div>
   <div class="part"><h3 class="sub">Pruebas estadísticas</h3><p class="ctx">Toca una prueba para ver cuándo se usa y cómo se corre.${LAST?' La que salió en tu árbol está resaltada.':''}</p>
   <div class="table-wrap"><table class="tbl mx"><thead><tr><th>Muestras</th><th>Paramétrica<br><small>(datos normales)</small></th><th>No paramétrica<br><small>(datos no normales)</small></th></tr></thead><tbody>${ROWS.map(r=>`<tr><td><b>${r[0]}</b></td>${[r[1],r[2]].map(c=>`<td>${cellKeys(c).map(k=>`<button type="button" class="mx-b${k===LAST?' on':''}" data-k="${k}">${R[k].n}</button>`).join('')||'<span class="note">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div id="mx-d"></div></div>`;
  const show=k=>{p.querySelectorAll('.mx-b').forEach(b=>b.classList.toggle('on',b.dataset.k===k));$('#mx-d',p).innerHTML=card(k);};
  p.querySelectorAll('.mx-b').forEach(b=>b.addEventListener('click',()=>show(b.dataset.k)));if(LAST)show(LAST);}
function normTab(p){const S0={n:30,sk:0};let x;
  p.innerHTML=`<p class="ctx">Genera una muestra de humedad de harina y mira qué dicen las pruebas. Mueve el tamaño y la asimetría para ver cuándo se rechaza la normalidad.</p>
   <div class="ctrls"><label class="ctrl"><span>Tamaño de la muestra (n) <output id="nl-no"></output></span><input type="range" id="nl-n" min="10" max="200" step="1" value="30"></label><label class="ctrl"><span>Asimetría <output id="nl-so"></output></span><input type="range" id="nl-s" min="0" max="1" step="0.05" value="0"></label><button type="button" class="btn btn-ghost" id="nl-g">Otra muestra</button></div>
   <div class="two"><div><p class="note">Histograma</p><div id="nl-h"></div></div><div><p class="note">Gráfica Q-Q: si los puntos siguen la línea, los datos son normales</p><div id="nl-q"></div></div></div><div id="nl-t"></div><p class="verdict" id="nl-v"></p>`;
  const upd=(gen)=>{S0.n=+$('#nl-n',p).value;S0.sk=+$('#nl-s',p).value;$('#nl-no',p).textContent=S0.n;$('#nl-so',p).textContent=S0.sk===0?'ninguna':S0.sk<0.4?'leve':S0.sk<0.7?'media':'fuerte';
    if(gen||!x||x.length!==S0.n)x=sample(S0.n,S0.sk);const W=Math.min(520,cw(p)/2-10)||300,T=normTable(x);$('#nl-h',p).innerHTML=histo(x,W);$('#nl-q',p).innerHTML=qq(x,W);$('#nl-t',p).innerHTML=T.html;
    const useKS=S0.n>=50,pv=useKS?T.ks.p:T.sw.p,ok=pv>A05,v=$('#nl-v',p);v.className='verdict '+(ok?'ok':'bad');
    v.innerHTML=`Con n = ${S0.n} se lee <b>${useKS?'Kolmogorov-Smirnov':'Shapiro-Wilk'}</b>: Sig. = ${useKS&&T.ks.p>0.2?',200 o más':spP(pv)} → ${ok?'<b>no se rechaza</b> la normalidad: pruebas paramétricas.':'<b>se rechaza</b> la normalidad: pruebas no paramétricas.'}`;};
  $('#nl-n',p).addEventListener('input',()=>upd(true));$('#nl-s',p).addEventListener('input',()=>upd(true));$('#nl-g',p).addEventListener('click',()=>upd(true));upd(true);}
function readTab(p){
  const ask=()=>{const n=pick([16,22,30,42,55,70,90,120]),sk=pick([0,0,0.15,0.6,0.85]),T=normTable(sample(n,sk)),useKS=n>=50,pv=useKS?T.ks.p:T.sw.p,ok=pv>A05;
    p.innerHTML=`<p class="ctx">Se midió la humedad de <b>${n}</b> muestras de harina y SPSS dio esta tabla. En JASP sale solo Shapiro-Wilk (Descriptivos → Estadísticos → Shapiro-Wilk).</p>${T.html}
     <div class="mini"><p><b>1. ¿Qué columna lees?</b></p><div class="seg" id="rc1"><button type="button" data-a="ks">Kolmogorov-Smirnov</button><button type="button" data-a="sw">Shapiro-Wilk</button></div><p class="fb" id="rf1"></p></div>
     <div class="mini"><p><b>2. ¿Los datos son normales?</b></p><div class="seg" id="rc2"><button type="button" data-a="si">Sí: no se rechaza H₀</button><button type="button" data-a="no">No: se rechaza H₀</button></div><p class="fb" id="rf2"></p></div>
     <div class="btn-row"><button type="button" class="btn btn-ghost" id="rc-n">Otra tabla</button></div>`;
    const mc=(id,fb,good,txt)=>p.querySelectorAll(`#${id} button`).forEach(b=>b.addEventListener('click',()=>{p.querySelectorAll(`#${id} button`).forEach(x=>{x.disabled=true;x.classList.toggle('is-ok',x.dataset.a===good);});if(b.dataset.a!==good)b.classList.add('is-bad');$('#'+fb,p).innerHTML=(b.dataset.a===good?'<strong>Bien.</strong> ':'<strong>No.</strong> ')+txt;}));
    mc('rc1','rf1',useKS?'ks':'sw',`Con n = ${n} ${useKS?'(50 o más) se usa Kolmogorov-Smirnov':'(menos de 50) se usa Shapiro-Wilk'}.`);
    mc('rc2','rf2',ok?'si':'no',`Sig. = ${useKS&&T.ks.p>0.2?',200* (el asterisco indica que es un límite inferior: la Sig. real es aún mayor)':spP(pv)}, ${ok?'mayor':'menor'} que 0,05.`);
    $('#rc-n',p).addEventListener('click',ask);};ask();}
function casesTab(p){let sc=0,n=0;
  const ask=()=>{const c=pick(CASES),opts=shuffle([c[1],...shuffle(Object.keys(R).filter(k=>k!==c[1])).slice(0,3)]);
    p.innerHTML=`<p class="ctx">${c[0]}</p><p><b>¿Qué prueba usas?</b></p><div class="opts" id="cs">${opts.map(k=>`<button type="button" class="opt" data-k="${k}">${R[k].n}</button>`).join('')}</div><div id="cs-f"></div><div class="btn-row"><button type="button" class="btn" id="cs-n">Otro caso</button></div><p class="note">${n?`Aciertos: ${sc} de ${n}`:''}</p>`;
    p.querySelectorAll('#cs .opt').forEach(b=>b.addEventListener('click',()=>{const ok=b.dataset.k===c[1];n++;if(ok)sc++;p.querySelectorAll('#cs .opt').forEach(x=>{x.disabled=true;if(x.dataset.k===c[1])x.classList.add('is-ok');});if(!ok)b.classList.add('is-bad');
      $('#cs-f',p).innerHTML=`<p class="fb">${ok?'<strong>Bien.</strong>':'<strong>No.</strong>'} Es <b>${R[c[1]].n}</b>: ${R[c[1]].why}</p>`;}));
    $('#cs-n',p).addEventListener('click',ask);};ask();}

/* ---------------- Prueba ---------------- */
function quiz(){const qs=[];
  shuffle(CASES).slice(0,3).forEach(c=>{const keys=shuffle([c[1],...shuffle(Object.keys(R).filter(k=>k!==c[1])).slice(0,3)]);qs.push({type:'mc',keepOrder:true,text:c[0]+'<br>¿Qué prueba usas?',options:keys.map(k=>R[k].n),answer:keys.indexOf(c[1]),explain:`Es <b>${R[c[1]].n}</b>: ${R[c[1]].why}`});});
  const n=pick([18,24,35,44,60,80,150]);qs.push({type:'mc',keepOrder:true,text:`Tienes n = ${n} datos. Según la regla que usamos (Sen, 2012), ¿qué prueba de normalidad lees?`,options:['Kolmogorov-Smirnov','Shapiro-Wilk'],answer:n>=50?0:1,explain:`Con n ${n>=50?'≥':'&lt;'} 50 se usa ${n>=50?'Kolmogorov-Smirnov':'Shapiro-Wilk'}.`});
  const pv=pick([0.002,0.018,0.041,0.087,0.26,0.53]);qs.push({type:'mc',keepOrder:true,text:`Shapiro-Wilk da Sig. = <b>${spP(pv)}</b>. ¿Qué tipo de prueba corresponde?`,options:['Paramétrica: no se rechaza la normalidad','No paramétrica: se rechaza la normalidad'],answer:pv>A05?0:1,explain:`${spP(pv)} es ${pv>A05?'mayor':'menor'} que 0,05.`});
  qs.push(pick([
   {type:'mc',text:'Dos grupos independientes son normales, pero Levene da Sig. = ,004. ¿Qué prueba usas?',options:['t de Welch','t de Student','U de Mann-Whitney','Wilcoxon'],answer:0,explain:'Los datos son normales, así que sigue siendo paramétrica, pero sin suponer varianzas iguales: Welch.'},
   {type:'mc',text:'En una prueba con muestras relacionadas (antes y después), ¿dónde se revisa la normalidad?',options:['En la columna de diferencias','En cada columna por separado','En la columna del antes','No hace falta revisarla'],answer:0,explain:'La prueba t relacionada trabaja con las diferencias; por eso son ellas las que deben ser normales.'},
   {type:'mc',text:'Kruskal-Wallis da Sig. = ,003. ¿Qué haces después?',options:['Comparaciones por pares de Dunn (con Bonferroni)','Tukey','Nada: ya sé cuál es el mejor','Repetir con ANOVA'],answer:0,explain:'Como con el ANOVA y Tukey, hace falta una prueba posterior para saber qué grupos difieren.'},
   {type:'mc',text:'Los mismos 6 panelistas califican 4 formulaciones y los datos no son normales. ¿Qué prueba usas?',options:['Friedman','Kruskal-Wallis','ANOVA de un factor','Mann-Whitney'],answer:0,explain:'Son 4 mediciones sobre las mismas personas (relacionadas) y no hay normalidad: Friedman.'},
   {type:'mc',text:'Shapiro-Wilk da Sig. = ,34. ¿Qué se concluye?',options:['No se rechaza la normalidad','Está demostrado que los datos son normales','Los datos no son normales','Hay que usar una prueba no paramétrica'],answer:0,explain:'No rechazar H₀ no lo demuestra: solo indica que no hay evidencia contra la normalidad.'}]));
  qs.push({type:'mc',text:'¿Qué hace Excel (Análisis de datos) y qué no?',options:['Hace pruebas t y ANOVA de un factor; no hace Shapiro-Wilk, Levene ni pruebas no paramétricas','Hace todas las pruebas de la matriz','Solo hace Shapiro-Wilk','No hace ninguna prueba'],answer:0,explain:'Para normalidad, Levene y no paramétricas se usa JASP.'});
  return qs;}

CIMA.addUnit(META,{id:'u3',orden:3,nombre:'Unidad 3 · Inferencia estadística',topics:[
 {id:'que-prueba',n:'3.5',short:'¿Qué prueba uso?',title:'¿Qué prueba uso? Paramétricas y no paramétricas',refuerzo:true,desc:'Análisis previo (normalidad y varianzas) y la prueba que corresponde a tus datos.',
  lead:'Antes de comparar grupos hay que revisar los datos: si son normales, si las varianzas son parecidas y si las muestras son relacionadas o independientes. De eso depende la prueba.',
  idea:`<ul><li><b>Normalidad</b> (H₀: los datos son normales): Shapiro-Wilk si n &lt; 50, Kolmogorov-Smirnov si n ≥ 50. Sig. &gt; 0,05 → no se rechaza H₀ → pruebas <b>paramétricas</b>. Sig. &lt; 0,05 → <b>no paramétricas</b>.</li><li><b>Varianzas</b> (Levene), solo con grupos independientes: si difieren, se usa Welch.</li><li><b>Relacionadas</b>: las mismas unidades medidas varias veces; la normalidad se revisa en las diferencias. <b>Independientes</b>: unidades distintas en cada grupo.</li><li>Con 3 o más grupos, si se rechaza H₀ viene una prueba posterior: Tukey, Games-Howell, Dunn o Bonferroni.</li></ul>`,
  simHint:'Recorre el árbol, explora la matriz, pon a prueba la normalidad y clasifica casos de planta.',sim,quiz}]});
})();
