/* =====================================================================
   CIMA · GESTIÓN DE LA CALIDAD · Unidad 1: Herramientas básicas
   1.1 Diagrama de Ishikawa · 1.2 Diagrama de Pareto · 1.3 Diagrama de dispersión
   Herramientas: Excel (paso a paso) y comprobación en Minitab.
   ===================================================================== */
window.META_CAL={id:'calidad',nombre:'Gestión de la Calidad',orden:4,nivel:'Calidad · 6.º semestre',descripcion:'Herramientas de la calidad, control estadístico de procesos, capacidad, muestreo de aceptación y HACCP.'};
(function(){
"use strict";
const U=LABUI,META=META_CAL;
const M6=[['mo','Mano de obra'],['met','Método'],['maq','Máquina'],['mat','Materiales'],['med','Medición'],['amb','Medio ambiente']];

/* =============== 1.1 Ishikawa =============== */
const ISH=[
 {p:'Yogur con exceso de suero (sinéresis)',c:{mo:['Operario nuevo sin capacitación en batido','Agitación manual irregular'],met:['Tiempo de incubación no estandarizado','Enfriamiento demasiado lento'],maq:['Termostato de la incubadora descalibrado','Batidora con paletas desgastadas'],mat:['Leche con bajo contenido de sólidos','Cultivo iniciador vencido'],med:['Termómetro sin calibrar','pH medido con tiras en lugar de potenciómetro'],amb:['Cámara de frío con temperatura variable','Vibraciones en el área de almacenamiento']}},
 {p:'Pan de molde con bajo volumen',c:{mo:['Panadero que acorta el amasado','Falta de supervisión en el turno de noche'],met:['Tiempo de fermentación reducido para cumplir pedidos','Receta sin orden fijo de adición'],maq:['Amasadora con velocidad irregular','Horno con resistencias dañadas'],mat:['Harina con bajo contenido de gluten','Levadura almacenada a temperatura alta'],med:['Balanza de ingredientes descalibrada','Agua medida “al ojo”'],amb:['Cuarto de fermentación frío en las mañanas','Humedad ambiental baja']}},
 {p:'Latas de atún con peso drenado bajo',c:{mo:['Empacadoras que llenan rápido para cumplir meta','Rotación de personal alta'],met:['Precocción más larga de lo especificado','Sin muestreo de peso por hora'],maq:['Dosificadora de aceite sobrellenando','Cerradora con ajuste variable'],mat:['Lomos de pescado con mucha agua','Tamaño de pescado irregular'],med:['Balanza de control sin calibración','Método de drenado sin tiempo fijo'],amb:['Temperatura alta en sala de empaque','Iluminación deficiente en la mesa de llenado']}},
 {p:'Chifles con exceso de aceite',c:{mo:['Operario que no escurre las canastillas','Falta de instrucción sobre el tiempo de fritura'],met:['Temperatura de fritura sin control','Sin centrifugado posterior'],maq:['Freidora con termostato dañado','Canastillas con malla obstruida'],mat:['Aceite reutilizado demasiadas veces','Plátano demasiado maduro'],med:['Termómetro del aceite averiado','No se mide el contenido de grasa'],amb:['Corrientes de aire frío cerca de la freidora','Humedad alta en la sala']}},
 {p:'Mermelada con moho antes de la fecha de vencimiento',c:{mo:['Personal que no se lava las manos al volver al área','Manipulación de tapas sin guantes'],met:['Llenado en caliente a menos de 85 °C','Sin inversión del frasco tras el cierre'],maq:['Tapadora con torque irregular','Marmita con agitación deficiente'],mat:['Frascos mal sanitizados','Bajo contenido de azúcar en la fórmula'],med:['Refractómetro sin calibrar','No se registra la temperatura de llenado'],amb:['Ambiente con esporas de moho','Bodega húmeda y caliente']}}];
function simIsh(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Arma el diagrama de causa y efecto</h3><p class="ctx">Problema: <b id="is-p"></b>. Arrastra cada causa a su categoría de las 6M (o tócala y luego toca la categoría).</p><div id="is-d" class="fishwrap"></div>
    <div class="btn-row"><button type="button" class="btn" id="is-ok">Comprobar</button><button type="button" class="btn btn-ghost" id="is-new">Otro problema</button></div><p class="fb" id="is-fb"></p></div>
   <div class="part"><h3 class="sub">B. Los 5 porqués: llega a la causa raíz</h3><p class="ctx" id="wh-ctx"></p><ol class="whys" id="wh"></ol><p class="fb" id="wh-fb"></p></div>`;
  let I,D;
  function load(){let n;do{n=pick(ISH);}while(ISH.length>1&&n===I);I=n;$('#is-p',box).textContent=I.p;
    const items=[];M6.forEach(([k])=>I.c[k].forEach((t,i)=>items.push({id:`${k}-${i}`,label:t})));
    D=dnd($('#is-d',box),{items,boxes:M6.map(([k,l])=>({id:k,label:l})),cls:'fish'});
    const head=document.createElement('div');head.className='fish-head';head.textContent=I.p;$('#is-d .dnd-boxes',box).appendChild(head);$('#is-fb',box).textContent='';whys();}
  $('#is-ok',box).addEventListener('click',()=>{const g=D.get(),ok={};let right=0,empty=0;Object.entries(g).forEach(([id,b])=>{if(!b){empty++;return;}ok[id]=id.split('-')[0]===b;if(ok[id])right++;});D.mark(ok);
    const tot=Object.keys(g).length;$('#is-fb',box).innerHTML=empty?`Faltan ${empty} causas por ubicar.`:right===tot?'<strong>¡Excelente!</strong> Todas las causas están en su M. Ahora el equipo vota las más probables y las verifica con datos (hoja de verificación, Pareto).':`${right} de ${tot} bien ubicadas. Revisa las rojas: <b>Máquina</b> es el equipo; <b>Método</b>, cómo se hace; <b>Materiales</b>, insumos; <b>Medición</b>, instrumentos y registros; <b>Medio ambiente</b>, condiciones del lugar.`;});
  $('#is-new',box).addEventListener('click',load);
  const WH=[
   {s:'El yogur presenta suero en la superficie.',c:[['¿Por qué?','El gel se rompió durante el almacenamiento.',['El yogur es de sabor fresa.']],['¿Por qué se rompió?','Hubo variaciones de temperatura en la cámara.',['El envase es de plástico.']],['¿Por qué hubo variaciones?','La puerta de la cámara se queda abierta en los despachos.',['El yogur se vende bien.']],['¿Por qué se queda abierta?','No hay un procedimiento de despacho ni cortina de aire.',['Los clientes llegan temprano.']]]},
   {s:'Los clientes reclaman latas de atún con poco peso.',c:[['¿Por qué?','El peso drenado está bajo la especificación.',['La etiqueta es pequeña.']],['¿Por qué?','Los lomos pierden mucha agua al esterilizar.',['Las latas son nuevas.']],['¿Por qué?','La precocción fue más corta de lo especificado.',['El pescado es de buena calidad.']],['¿Por qué fue más corta?','El cocinador se programa a mano y no hay registro de tiempos.',['La planta trabaja dos turnos.']]]}];
  function whys(){const W=pick(WH);$('#wh-ctx',box).innerHTML=`<b>Problema:</b> ${W.s} Elige la respuesta que lleva más cerca de la causa raíz.`;const ol=$('#wh',box);ol.innerHTML='';$('#wh-fb',box).textContent='';
    const step=i=>{if(i>=W.c.length){$('#wh-fb',box).innerHTML='<strong>Causa raíz encontrada:</strong> es algo del sistema (un procedimiento, un control) que se puede corregir. Una acción correctiva sobre la causa raíz evita que el problema vuelva.';return;}
      const [q,a,ds]=W.c[i],li=document.createElement('li');const opts=shuffle([[a,1],...ds.map(d=>[d,0])]);li.innerHTML=`<b>${q}</b><div class="opts">${opts.map(o=>`<button type="button" class="opt" data-ok="${o[1]}">${o[0]}</button>`).join('')}</div>`;ol.appendChild(li);
      li.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.ok==='1'){li.querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.dataset.ok==='1')x.classList.add('is-ok');});step(i+1);}else{b.classList.add('is-bad');b.disabled=true;}}));};step(0);}
  load();return null;}
function quizIsh(){const qs=[],I=pick(ISH),k=pick(M6);const c=pick(I.c[k[0]]);
  qs.push({type:'mc',keepOrder:true,text:`En un Ishikawa sobre “${I.p}”, ¿en qué M va la causa “${c}”?`,options:M6.map(m=>m[1]),answer:M6.indexOf(k),explain:`Va en <b>${k[1]}</b>.`});
  const k2=pick(M6.filter(m=>m!==k)),c2=pick(I.c[k2[0]]);qs.push({type:'mc',keepOrder:true,text:`¿Y la causa “${c2}”?`,options:M6.map(m=>m[1]),answer:M6.indexOf(k2),explain:`Va en <b>${k2[1]}</b>.`});
  qs.push({type:'mc',text:'En el diagrama de Ishikawa, ¿qué va en la “cabeza” del pescado?',options:['El problema o efecto que se quiere analizar','La causa principal','La solución propuesta','El responsable del área'],answer:0,explain:'La cabeza es el efecto; las espinas son las posibles causas.'});
  qs.push({type:'mc',text:'¿Qué herramienta conviene usar después del Ishikawa para saber cuáles causas pesan más?',options:['Hoja de verificación y diagrama de Pareto','Otro diagrama de Ishikawa','Un organigrama','Un diagrama de Gantt'],answer:0,explain:'El Ishikawa propone causas; los datos (hoja de verificación, Pareto) dicen cuáles importan más.'});
  qs.push({type:'mc',text:'La técnica de los “5 porqués” sirve para…',options:['Llegar a la causa raíz de un problema','Contar defectos','Calcular límites de control','Elegir proveedores'],answer:0,explain:'Preguntar “¿por qué?” varias veces lleva de los síntomas a la causa raíz.'});
  qs.push({type:'mc',text:'¿Cuáles son las 6M del diagrama de Ishikawa?',options:['Mano de obra, Método, Máquina, Materiales, Medición y Medio ambiente','Mercado, Marca, Margen, Meta, Misión y Mejora','Mano de obra, Máquina, Materiales, Mantenimiento, Moneda y Marketing','Método, Muestra, Media, Moda, Mediana y Máximo'],answer:0,explain:'Son las seis familias clásicas de causas.'});
  return qs;}

/* =============== 1.2 Pareto =============== */
const PAR=[
 {t:'Defectos en fundas de leche (una semana)',u:'fundas',d:[['Sellado defectuoso',148],['Funda perforada',96],['Fecha mal impresa',31],['Volumen bajo',18],['Funda sucia',11],['Otros',8]]},
 {t:'Reclamos de clientes de una panificadora (un mes)',u:'reclamos',d:[['Pan quemado',22],['Producto aplastado',57],['Moho antes de la fecha',84],['Etiqueta incorrecta',9],['Atraso en la entrega',35],['Otros',6]]},
 {t:'Causas de paradas en una línea de envasado de jugo (horas)',u:'horas',d:[['Atascos en la tapadora',38],['Cambio de formato',21],['Falta de envases',9],['Limpieza no programada',14],['Falla eléctrica',4],['Otros',3]]},
 {t:'Defectos en latas de atún (un turno)',u:'latas',d:[['Peso drenado bajo',63],['Doble cierre defectuoso',41],['Lata abollada',112],['Etiqueta mal pegada',17],['Codificación ilegible',12],['Otros',7]]},
 {t:'Mermas en una planta de chifles (kg)',u:'kg',d:[['Chifles rotos',230],['Quemados',95],['Aceite excesivo',60],['Mal sellado',41],['Bajo peso',25],['Otros',14]]}];
function paretoChart(items,W,sel){const tot=items.reduce((a,b)=>a+b[1],0);let acc=0;const cum=items.map(d=>(acc+=d[1])/tot*100);const n=items.length,ymax=Math.max(...items.map(d=>d[1]))*1.15;
  const H=300,m={l:46,r:46,t:20,b:70},iw=W-m.l-m.r,ih=H-m.t-m.b,bw=iw/n,Y=v=>m.t+ih-v/ymax*ih,Yc=v=>m.t+ih-v/100*ih;
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="chart" role="img" aria-label="Diagrama de Pareto">`;
  [0,25,50,75,100].forEach(v=>s+=`<line class="grid" x1="${m.l}" x2="${W-m.r}" y1="${Yc(v)}" y2="${Yc(v)}"/><text x="${W-m.r+6}" y="${Yc(v)+4}">${v} %</text>`);
  niceTicks(0,ymax,4).forEach(v=>{if(v<=ymax)s+=`<text x="${m.l-6}" y="${Y(v)+4}" text-anchor="end">${nf(v,0)}</text>`;});
  s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${Yc(80)}" y2="${Yc(80)}" stroke="var(--accent)" stroke-dasharray="5 4"/><text class="lbl acc" x="${W-m.r-4}" y="${Yc(80)-5}" text-anchor="end">80 %</text>`;
  items.forEach((d,i)=>{const x=m.l+i*bw+bw*0.12,w=bw*0.76;s+=`<rect class="parb${sel&&sel.has(i)?' sel':''}" data-i="${i}" x="${x}" y="${Y(d[1])}" width="${w}" height="${m.t+ih-Y(d[1])}" rx="3" tabindex="0"><title>${d[0]}: ${d[1]}</title></rect><text x="${x+w/2}" y="${Y(d[1])-5}" text-anchor="middle">${d[1]}</text>`;
    s+=`<text x="${x+w/2}" y="${m.t+ih+14}" text-anchor="end" transform="rotate(-30 ${x+w/2} ${m.t+ih+14})" style="font-size:11px">${d[0].length>18?d[0].slice(0,17)+'…':d[0]}</text>`;});
  s+=`<path class="curve acc" d="${cum.map((c,i)=>(i?'L':'M')+(m.l+i*bw+bw/2).toFixed(1)+' '+Yc(c).toFixed(1)).join('')}"/>`+cum.map((c,i)=>`<circle cx="${m.l+i*bw+bw/2}" cy="${Yc(c)}" r="3.5" fill="var(--accent)"/>`).join('');
  s+=`<line class="axis" x1="${m.l}" x2="${W-m.r}" y1="${m.t+ih}" y2="${m.t+ih}"/></svg>`;return{svg:s,cum,tot};}
function genPar(){const b=U.pickNew('par',PAR);const k=rnd(0.8,1.25);const d=b.d.map(([n,v])=>[n,n==='Otros'?v:Math.max(2,Math.round(v*k*rnd(0.85,1.15)))]);return{...b,d};}
const tabsPar=[
 {label:'Ordena los datos',render:(p,C)=>{const items=C.d.map((d,i)=>({id:'d'+i,label:`${d[0]} <small>(${d[1]})</small>`}));const sorted=[...C.d.filter(d=>d[0]!=='Otros')].sort((a,b)=>b[1]-a[1]).concat(C.d.filter(d=>d[0]==='Otros'));
   p.innerHTML=`<p class="ctx"><b>${C.t}.</b> Hoja de verificación con ${C.d.reduce((a,b)=>a+b[1],0)} ${C.u} en total. Ordena las categorías de <b>mayor a menor</b> arrastrándolas a cada posición. “Otros” siempre va al final.</p><div id="po"></div><div class="btn-row"><button type="button" class="btn" id="po-ok">Comprobar</button></div><p class="fb" id="po-fb"></p><div id="po-ch" class="chart-wrap"></div>`;
   const D=dnd($('#po',p),{items,boxes:C.d.map((_,i)=>({id:'p'+i,label:`${i+1}.º`})),cls:'ranks'});
   $('#po-ok',p).addEventListener('click',()=>{const g=D.get();if(Object.values(g).some(v=>!v)){$('#po-fb',p).textContent='Ubica todas las categorías.';return;}const ok={};let all=true;
     Object.entries(g).forEach(([id,b])=>{const it=C.d[+id.slice(1)],pos=+b.slice(1);ok[id]=sorted[pos]===it||sorted[pos][1]===it[1]&&it[0]!=='Otros'&&sorted[pos][0]!=='Otros';if(!ok[id])all=false;});D.mark(ok);
     $('#po-fb',p).innerHTML=all?'<strong>Correcto.</strong> Así se ve el diagrama de Pareto: barras de mayor a menor y la línea del porcentaje acumulado.':'Revisa las marcadas en rojo: van de la frecuencia más alta a la más baja, con “Otros” al final.';
     if(all)$('#po-ch',p).innerHTML=paretoChart(sorted,Math.min(cw(p),700)).svg;});}},
 {label:'Paso a paso con Excel',render:(p,C)=>{const S=[...C.d.filter(d=>d[0]!=='Otros')].sort((a,b)=>b[1]-a[1]).concat(C.d.filter(d=>d[0]==='Otros')),tot=S.reduce((a,b)=>a+b[1],0),n=S.length;let acc=0;
   const cells=[[{v:'Categoría',b:1},{v:'Frecuencia',b:1},{v:'%',b:1},{v:'% acumulado',b:1}],...S.map((d,i)=>{acc+=d[1];return[{v:d[0]},{v:d[1],d:0},{v:d[1]/tot*100,d:2,f:`=B${i+2}/$B$${n+2}*100`},{v:acc/tot*100,d:2,f:i?`=D${i+1}+C${i+2}`:'=C2'}];}),[{v:'Total',b:1},{v:tot,d:0,f:`=SUMA(B2:B${n+1})`},{v:100,d:0,f:`=SUMA(C2:C${n+1})`},{v:''}]];
   const cum=S.map((_,i)=>S.slice(0,i+1).reduce((a,b)=>a+b[1],0)/tot*100),vit=cum.findIndex(c=>c>=80)+1;
   U.steps(p,[{t:'Tabla de Pareto en Excel',body:`<p>Ordena de mayor a menor (Datos → Ordenar), calcula el porcentaje y el acumulado. Toca las celdas azules. Fíjate en el <b>$</b> de <code>$B$${n+2}</code>: fija el total al copiar la fórmula hacia abajo.</p>${U.sheet(cells)}`,mount:li=>U.mountSheet(li),
     q:{type:'num',text:`¿Qué porcentaje acumulado tienen las dos primeras categorías? (dos decimales)`,answer:round(cum[1],2),tol:0.011,explain:`(${S[0][1]} + ${S[1][1]}) / ${tot} × 100 = <b>${fmt(cum[1],2)} %</b>.`}},
    {t:'Identifica los pocos vitales',body:`<p>Principio de Pareto (80-20): pocas causas explican la mayor parte del problema. Toca en el gráfico las barras que forman los <b>pocos vitales</b> (hasta llegar más o menos al 80 % acumulado).</p><div class="chart-wrap" id="pv"></div><div class="btn-row"><button type="button" class="btn" id="pv-ok">Comprobar</button></div><p class="fb" id="pv-fb"></p>`,
     mount:li=>{const sel=new Set(),draw=()=>{li.querySelector('#pv').innerHTML=paretoChart(S,Math.min(cw(li)-30,700),sel).svg;li.querySelectorAll(".parb").forEach(r=>{const h=()=>{const i=+r.dataset.i;sel.has(i)?sel.delete(i):sel.add(i);draw();};r.addEventListener('click',h);r.addEventListener('keydown',e=>{if(e.key==='Enter')h();});});};draw();
       li.querySelector('#pv-ok').addEventListener('click',()=>{const want=new Set(Array.from({length:vit},(_,i)=>i)),ok=[...sel].every(i=>want.has(i))&&sel.size===vit;const alt=sel.size===vit-1||sel.size===vit+1;
         li.querySelector('#pv-fb').innerHTML=ok?`<strong>Correcto.</strong> Las ${vit} primeras categorías suman ${fmt(cum[vit-1],1)} %: atacarlas primero da el mayor impacto.`:alt&&[...sel].every(i=>i<=vit)?`Casi: el 80 % es una guía, no una regla exacta. Con ${vit} categorías se llega a ${fmt(cum[vit-1],1)} %.`:`Revisa: los pocos vitales son las primeras barras (las más altas) hasta acercarse al 80 % acumulado. Aquí son ${vit}.`;});}}],
     'Listo. En Excel 2016 o posterior: selecciona categorías y frecuencias → Insertar → Gráfico estadístico → <b>Pareto</b>.');}},
 {label:'Comprueba en Minitab',render:(p,C)=>{const S=[...C.d.filter(d=>d[0]!=='Otros')].sort((a,b)=>b[1]-a[1]).concat(C.d.filter(d=>d[0]==='Otros')),tot=S.reduce((a,b)=>a+b[1],0);let acc=0;
   const rows=[['Conteo',...S.map((d,i)=>({t:d[1],k:'c'+i}))],['Porcentaje',...S.map((d,i)=>({t:fmt(d[1]/tot*100,1),k:'p'+i}))],['% acumulado',...S.map((d,i)=>{acc+=d[1];return{t:fmt(acc/tot*100,1),k:'a'+i};})]];
   const html=`<div class="mtb"><div class="mtb-title">Diagrama de Pareto de ${C.t.split(' (')[0].toLowerCase()}</div>${paretoChart(S,Math.min(cw(p)-30,680)).svg}<table class="mtb-t"><tr><th>Defecto</th>${S.map(d=>`<th>${d[0]}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map((c,i)=>typeof c==='object'?`<td data-k="${c.k}" tabindex="0">${c.t}</td>`:`<th>${c}</th>`).join('')}</tr>`).join('')}</table></div>`;
   const vit=(()=>{let a=0;for(let i=0;i<S.length;i++){a+=S[i][1];if(a/tot>=0.8)return i;}return S.length-1;})();
   U.readOut(p,html,[{t:'Toca el porcentaje acumulado donde se alcanza (o pasa) el 80 %.',k:['a'+vit],e:'Hasta esa categoría están los pocos vitales.'},{t:`Toca el porcentaje que representa <b>${S[1][0]}</b> por sí solo.`,k:['p1'],e:'Fila Porcentaje.'},{t:'Toca la frecuencia de la categoría más importante.',k:['c0'],e:'Es la primera barra.'}],{cls:'mtb-wrap',note:'Minitab: Estadísticas → Herramientas de calidad → <b>Diagrama de Pareto</b> (Stat → Quality Tools → Pareto Chart). Con datos resumidos, elige “Graficar defectos con datos de tabla” e indica etiquetas y frecuencias. Los nombres pueden variar según la versión.'});}},
 {label:'Interpreta',render:(p,C)=>{const S=[...C.d.filter(d=>d[0]!=='Otros')].sort((a,b)=>b[1]-a[1]),tot=C.d.reduce((a,b)=>a+b[1],0);const c2=(S[0][1]+S[1][1])/tot*100;
   U.interpret(p,{ctx:`<b>${C.t}.</b>`,keyData:`Las dos primeras categorías suman ${fmt(c2,1)} % del total.`,sentence:`El problema principal es {{s1}}. Las dos primeras categorías explican el {{s2}} del total, por lo que la mejora debe empezar por ellas y no por {{s3}}.`,
     blanks:[['s1',shuffle(S.slice(0,3).map(d=>d[0].toLowerCase())),S[0][0].toLowerCase()],['s2',[`${fmt(c2,1)} %`,`${fmt(S[0][1]/tot*100,1)} %`,'80 %'],`${fmt(c2,1)} %`],['s3',[S[S.length-1][0].toLowerCase(),S[0][0].toLowerCase()],S[S.length-1][0].toLowerCase()]],
     model:`El diagrama de Pareto muestra que ${S[0][0].toLowerCase()} y ${S[1][0].toLowerCase()} concentran el ${fmt(c2,1)} % de los ${C.u} registrados. Son los pocos vitales: un proyecto de mejora sobre ellos tendrá el mayor impacto. El siguiente paso es analizar sus causas (Ishikawa, 5 porqués).`,
     statements:[[`Conviene atacar primero ${S[0][0].toLowerCase()}, porque concentra la mayor parte del problema.`,true,'Correcto.'],[`Hay que resolver todas las categorías al mismo tiempo, porque todas son igual de importantes.`,false,'El Pareto muestra justamente que no pesan igual.'],[`“Otros” debe ir primero porque agrupa muchas causas.`,false,'“Otros” siempre va al final, aunque sea grande.'],[`El Pareto dice por qué ocurre ${S[0][0].toLowerCase()}.`,false,'El Pareto prioriza; las causas se buscan con Ishikawa y los 5 porqués.']]});}}];
function quizPar(){const C=genPar(),S=[...C.d.filter(d=>d[0]!=='Otros')].sort((a,b)=>b[1]-a[1]),tot=C.d.reduce((a,b)=>a+b[1],0),qs=[];
  qs.push({type:'mc',text:`${C.t}: ${C.d.map(d=>`${d[0]} (${d[1]})`).join(', ')}. ¿Cuál va primero en el Pareto?`,options:shuffle(S.slice(0,4).map(d=>d[0])),answer:0,explain:`La de mayor frecuencia: <b>${S[0][0]}</b>.`});qs[0].answer=qs[0].options.indexOf(S[0][0]);
  qs.push({type:'num',text:`Total: ${tot}. ¿Qué porcentaje representa ${S[0][0].toLowerCase()}? (un decimal)`,unit:'%',answer:round(S[0][1]/tot*100,1),tol:0.11,explain:`${S[0][1]}/${tot} × 100 = <b>${fmt(S[0][1]/tot*100,1)} %</b>.`});
  qs.push({type:'num',text:`¿Y el porcentaje acumulado de las tres primeras categorías? (un decimal)`,unit:'%',answer:round((S[0][1]+S[1][1]+S[2][1])/tot*100,1),tol:0.11,explain:`(${S[0][1]} + ${S[1][1]} + ${S[2][1]})/${tot} × 100 = <b>${fmt((S[0][1]+S[1][1]+S[2][1])/tot*100,1)} %</b>.`});
  qs.push({type:'mc',mono:true,text:'En Excel, el porcentaje de la fila 2 es =B2/$B$9. ¿Para qué sirven los signos $?',options:['Para que la referencia al total no cambie al copiar la fórmula','Para dar formato de moneda','Para sumar la columna','Para ordenar los datos'],answer:0,explain:'$B$9 es una referencia absoluta.'});
  qs.push({type:'mc',text:'El principio de Pareto dice que…',options:['Pocas causas (≈20 %) producen la mayor parte (≈80 %) de los problemas','Todas las causas tienen el mismo peso','El 80 % de los productos es defectuoso','Hay que atacar primero las causas pequeñas'],answer:0,explain:'Pocos vitales, muchos triviales.'});
  qs.push({type:'mc',text:'¿Dónde se ubica la categoría “Otros” en un Pareto?',options:['Siempre al final','Siempre al inicio','Según su frecuencia','No se incluye nunca'],answer:0,explain:'Por convención va al final.'});
  return qs;}

/* =============== 1.3 Dispersión =============== */
const DSP=[
 {xn:'Temperatura de fritura (°C)',yn:'Aceite absorbido (%)',xs:[160,165,170,175,180,185,190,195],b0:-20,b1:0.25,sd:1,dec:1,kind:'pos'},
 {xn:'Días en anaquel',yn:'Vitamina C (mg/100 mL)',xs:[0,3,6,9,12,15,18,21],b0:40,b1:-1.1,sd:1.4,dec:1,kind:'neg'},
 {xn:'Humedad relativa de la bodega (%)',yn:'Humedad de la harina (%)',xs:[50,55,60,65,70,75,80,85],b0:5,b1:0.11,sd:0.25,dec:2,kind:'pos'},
 {xn:'Velocidad de la llenadora (u/min)',yn:'Variación del peso (g)',xs:[40,50,60,70,80,90,100,110],b0:0.2,b1:0.03,sd:0.25,dec:2,kind:'pos'},
 {xn:'Estatura del operario (cm)',yn:'Defectos de sellado por turno',xs:[155,158,162,165,168,171,175,180],b0:8,b1:0,sd:2.2,dec:0,kind:'none'},
 {xn:'Presión de la cerradora (psi)',yn:'Fugas detectadas por lote',xs:[60,65,70,75,80,85,90,95],b0:30,b1:-0.3,sd:1.2,dec:0,kind:'neg'}];
const KIND={pos:'Correlación positiva',neg:'Correlación negativa',none:'Sin correlación'};
function simDisp(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Grafica tú mismo</h3><p class="ctx" id="dp-ctx"></p><div class="two"><div class="table-wrap"><table class="tbl" id="dp-t"></table></div><div><p class="note" id="dp-h">Toca en el plano para ubicar el <b>punto 1</b>.</p><div id="dp-ch" class="chart-wrap"></div></div></div>
    <div class="btn-row"><button type="button" class="btn btn-ghost" id="dp-auto">Ubicar los puntos que faltan</button><button type="button" class="btn btn-ghost" id="dp-new">Otros datos</button></div><div id="dp-q"></div></div>
   <div class="part"><h3 class="sub">B. Clasifica los diagramas</h3><p class="note">Arrastra cada gráfico a su tipo de relación.</p><div id="dk"></div><div class="btn-row"><button type="button" class="btn" id="dk-ok">Comprobar</button><button type="button" class="btn btn-ghost" id="dk-new">Otros gráficos</button></div><p class="fb" id="dk-fb"></p></div>`;
  let C,placed;
  function load(){let n;do{n=pick(DSP);}while(n===C);C={...n};C.y=C.xs.map(x=>round(C.b0+C.b1*x+U.gauss()*C.sd,C.dec));if(C.kind==='none')C.y=C.y.map(v=>Math.max(0,v));placed=[];
    $('#dp-ctx',box).innerHTML=`Datos de planta: <b>${C.xn}</b> frente a <b>${C.yn}</b>.`;$('#dp-q',box).innerHTML='';
    $('#dp-t',box).innerHTML=`<thead><tr><th>Punto</th><th>${C.xn}</th><th>${C.yn}</th></tr></thead><tbody>${C.xs.map((x,i)=>`<tr data-i="${i}"><td>${i+1}</td><td>${nf(x,2)}</td><td>${nf(C.y[i],C.dec)}</td></tr>`).join('')}</tbody>`;draw();}
  function bounds(){const x0=Math.min(...C.xs),x1=Math.max(...C.xs),y0=Math.min(...C.y),y1=Math.max(...C.y),px=(x1-x0)*0.08,py=(y1-y0)*0.15||1;return{xmin:x0-px,xmax:x1+px,ymin:y0-py,ymax:y1+py};}
  function draw(){const b=bounds(),W=Math.min(cw($('#dp-ch',box)),520),H=300;
    $('#dp-ch',box).innerHTML=chart({W,H,...b,points:placed.map(i=>({x:C.xs[i],y:C.y[i],cls:'sc s0'})),xlabel:C.xn,ml:52,yfmt:v=>nf(v,1),xfmt:v=>nf(v,1)});
    box.querySelectorAll('#dp-t tr[data-i]').forEach(tr=>tr.classList.toggle('done',placed.includes(+tr.dataset.i)));
    const i=placed.length;$('#dp-h',box).innerHTML=i<C.xs.length?`Toca en el plano para ubicar el <b>punto ${i+1}</b> (${nf(C.xs[i],2)}; ${nf(C.y[i],C.dec)}).`:'¡Todos los puntos ubicados!';
    const svg=$('#dp-ch svg',box);svg.style.cursor=i<C.xs.length?'crosshair':'default';
    svg.addEventListener('click',e=>{const k=placed.length;if(k>=C.xs.length)return;const r=svg.getBoundingClientRect(),sx=(e.clientX-r.left)*(W/r.width),sy=(e.clientY-r.top)*(H/r.height);
      const m={l:52,r:18,t:26,b:50},X=x=>m.l+(x-b.xmin)/(b.xmax-b.xmin)*(W-m.l-m.r),Y=y=>m.t+(H-m.t-m.b)-((y-b.ymin)/(b.ymax-b.ymin))*(H-m.t-m.b);
      const d=Math.hypot(sx-X(C.xs[k]),sy-Y(C.y[k]));if(d<28){placed.push(k);draw();if(placed.length===C.xs.length)ask();}else{$('#dp-h',box).innerHTML=`Ese lugar no corresponde al punto ${k+1}: busca x = ${nf(C.xs[k],2)} en el eje horizontal y sube hasta y = ${nf(C.y[k],C.dec)}.`;}});}
  function ask(){const r=ST.cor(C.xs,C.y);$('#dp-q',box).innerHTML=`<div class="lq"><p><b>¿Qué tipo de relación muestra el diagrama?</b></p><div class="opts">${Object.entries(KIND).map(([k,v])=>`<button type="button" class="opt" data-k="${k}">${v}</button>`).join('')}</div><p class="fb"></p></div>`;
    box.querySelectorAll('#dp-q .opt').forEach(b=>b.addEventListener('click',()=>{const ok=b.dataset.k===C.kind;box.querySelectorAll('#dp-q .opt').forEach(x=>{x.disabled=true;if(x.dataset.k===C.kind)x.classList.add('is-ok');});if(!ok)b.classList.add('is-bad');
      $('#dp-q .fb',box).innerHTML=`${ok?'<strong>Bien.</strong>':'<strong>No.</strong>'} ${KIND[C.kind]} (r = ${fmt(r,2)}). ${C.kind==='none'?'Los puntos no siguen ninguna tendencia: esa variable no parece influir.':C.kind==='pos'?'Al aumentar x, y tiende a aumentar.':'Al aumentar x, y tiende a disminuir.'} En Excel: Insertar → Dispersión; en Minitab: Gráfica → Gráfica de dispersión.`;}));}
  $('#dp-auto',box).addEventListener('click',()=>{placed=C.xs.map((_,i)=>i);draw();ask();});$('#dp-new',box).addEventListener('click',load);
  let K,KD;function kload(){const types=shuffle(['pos','neg','none','pos','neg','none']).slice(0,6);K=types.map((t,i)=>{const r=t==='pos'?rnd(0.7,0.95):t==='neg'?-rnd(0.7,0.95):rnd(-0.12,0.12);const pts=[];for(let j=0;j<18;j++){const x=U.gauss(),z=U.gauss();pts.push([x,r*x+Math.sqrt(1-r*r)*z]);}return{id:'g'+i,t,pts};});
    KD=dnd($('#dk',box),{items:K.map(k=>({id:k.id,label:mini(k.pts)})),boxes:Object.entries(KIND).map(([k,v])=>({id:k,label:v})),cls:'kinds'});$('#dk-fb',box).textContent='';}
  function mini(pts){const W=96,H=72,xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),X=x=>6+(x-Math.min(...xs))/(Math.max(...xs)-Math.min(...xs))*(W-12),Y=y=>H-6-(y-Math.min(...ys))/(Math.max(...ys)-Math.min(...ys))*(H-12);
    return`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-label="gráfico"><rect x="0.5" y="0.5" width="${W-1}" height="${H-1}" fill="none" stroke="currentColor" opacity=".25"/>${pts.map(p=>`<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="2.6" fill="var(--data)"/>`).join('')}</svg>`;}
  $('#dk-ok',box).addEventListener('click',()=>{const g=KD.get();if(Object.values(g).some(v=>!v)){$('#dk-fb',box).textContent='Ubica todos los gráficos.';return;}const ok={};let all=true;K.forEach(k=>{ok[k.id]=g[k.id]===k.t;if(!ok[k.id])all=false;});KD.mark(ok);$('#dk-fb',box).innerHTML=all?'<strong>Correcto.</strong>':'Revisa los marcados en rojo.';});
  $('#dk-new',box).addEventListener('click',kload);load();kload();return null;}
function quizDisp(){const qs=[],c=pick(DSP);
  qs.push({type:'mc',keepOrder:true,text:`Si al aumentar “${c.xn.toLowerCase()}” tiende a ${c.kind==='pos'?'aumentar':c.kind==='neg'?'disminuir':'no cambiar'} “${c.yn.toLowerCase()}”, el diagrama muestra…`,options:Object.values(KIND),answer:['pos','neg','none'].indexOf(c.kind),explain:`${KIND[c.kind]}.`});
  qs.push({type:'mc',text:'¿Qué se coloca en el eje horizontal (x) del diagrama de dispersión?',options:['La variable que se sospecha que influye (causa posible)','El efecto o resultado','El tiempo siempre','Las frecuencias acumuladas'],answer:0,explain:'En x va la posible causa; en y, el efecto.'});
  qs.push({type:'mc',text:'Un diagrama de dispersión con fuerte correlación demuestra que…',options:['Las variables están asociadas; la causa hay que confirmarla','Una variable causa la otra','El proceso está bajo control','No hay variación'],answer:0,explain:'Asociación no es causalidad.'});
  qs.push({type:'mc',text:'¿Qué herramienta muestra la relación entre dos variables numéricas?',options:['Diagrama de dispersión','Diagrama de Pareto','Diagrama de Ishikawa','Hoja de verificación'],answer:0,explain:'Es el diagrama de dispersión.'});
  qs.push({type:'mc',mono:true,text:'¿Qué función de Excel cuantifica la fuerza de la relación lineal?',options:['=COEF.DE.CORREL(x;y)','=CONTAR(x;y)','=PROMEDIO(x;y)','=PRUEBA.CHICUAD(x;y)'],answer:0,explain:'COEF.DE.CORREL da r.'});
  qs.push({type:'mc',text:'En el diagrama, los puntos forman una nube sin dirección. Conclusión:',options:['No hay correlación lineal entre las variables','La correlación es perfecta','La relación es negativa','Hay que invertir los ejes'],answer:0,explain:'Sin tendencia: r cercano a 0.'});
  return qs;}

CIMA.addUnit(META,{id:'u1',orden:1,nombre:'Unidad 1 · Herramientas básicas de la calidad',topics:[
 {id:'ishikawa',n:'1.1',short:'Ishikawa',title:'Diagrama de causa y efecto (Ishikawa)',desc:'Ordenar las posibles causas de un problema en las 6M.',
  lead:'Ante un problema, el equipo propone muchas causas. El diagrama de Ishikawa las ordena en familias para no olvidar ninguna y discutirlas con método.',
  idea:`<div class="types">${M6.map(m=>`<div class="type"><b>${m[1]}</b><span>${{mo:'Personas: capacitación, cansancio, supervisión.',met:'Procedimientos, tiempos, recetas, secuencia.',maq:'Equipos, herramientas, mantenimiento.',mat:'Insumos, materia prima, empaques.',med:'Instrumentos, calibración, registros.',amb:'Temperatura, humedad, iluminación, limpieza del lugar.'}[m[0]]}</span></div>`).join('')}</div><p>La cabeza del pescado es el <b>efecto</b>; las espinas, las <b>causas</b>. Luego se priorizan con datos.</p>`,
  simHint:'Arrastra las causas a las 6M y llega a la causa raíz con los 5 porqués.',sim:simIsh,quiz:quizIsh},
 {id:'pareto',n:'1.2',short:'Pareto',title:'Diagrama de Pareto',desc:'Priorizar: pocos vitales, muchos triviales.',
  lead:'No todos los defectos pesan igual. El diagrama de Pareto ordena las categorías y muestra cuáles concentran la mayor parte del problema.',
  idea:`<ol><li>Registra los datos (hoja de verificación).</li><li>Ordena de mayor a menor (“Otros” al final).</li><li>Calcula % y % acumulado: <code>=B2/$B$9*100</code>, acumulado <code>=D1+C2</code>.</li><li>Grafica barras + línea acumulada y marca el 80 %.</li></ol>`,
  simHint:'Ordena categorías arrastrándolas, arma la tabla en Excel y compara con Minitab.',sim:box=>U.lab(box,genPar,tabsPar),quiz:quizPar},
 {id:'dispersion',n:'1.3',short:'Dispersión',title:'Diagrama de dispersión',desc:'Ver si dos variables del proceso están relacionadas.',
  lead:'¿La temperatura del aceite influye en el aceite absorbido? El diagrama de dispersión responde a simple vista si dos variables se mueven juntas.',
  idea:`<div class="types"><div class="type"><b>Positiva</b><span>Al aumentar x, y aumenta.</span></div><div class="type"><b>Negativa</b><span>Al aumentar x, y disminuye.</span></div><div class="type"><b>Sin correlación</b><span>Nube sin dirección.</span></div><div class="type"><b>Cuidado</b><span>Asociación no es causalidad.</span></div></div>`,
  simHint:'Ubica tú los puntos en el plano y clasifica diagramas arrastrándolos.',sim:simDisp,quiz:quizDisp}]});
})();
