/* =====================================================================
   CIMA · DISEÑO EXPERIMENTAL
   Organizado como el sílabo (v1.2):
   U1 Fundamentos y DCA: 1.1 Principios · 1.2 ¿Qué diseño uso? · 1.3 SPSS · 1.4 DCA · 1.5 DCA desbalanceado
   U2 Bloques completos: 2.1 DBCA · 2.2 Cuadro latino · 2.3 Grecolatino
   U3 Bloques incompletos: 3.1 DBIB
   U4 Factoriales: 4.1 Factorial 2² · 4.2 Factorial a × b · 4.3 Factorial 2³
   ===================================================================== */
(function(){
"use strict";
const META={id:'diseno',nombre:'Diseño Experimental',orden:3,nivel:'Diseño Experimental · 5.º semestre',descripcion:'Planifica experimentos, organiza los datos y analiza e interpreta DCA, bloques, cuadro latino, grecolatino, DBIB y factoriales como en SPSS.'};
const L=DLAB,sp=L.sp,spP=L.spP;

/* =============== 1.1 Principios =============== */
const VOC=[
 {ctx:'Se evalúa el efecto de 3 tipos de cuajo sobre la firmeza del queso fresco. Cada tipo se aplica a 5 moldes de 1 kg elaborados con la misma leche.',m:{fac:'Tipo de cuajo',trat:'Cuajo animal, microbiano y vegetal',ue:'Cada molde de queso de 1 kg',resp:'Firmeza (N)',rep:'5 moldes por cada cuajo'}},
 {ctx:'Una panadería prueba 4 temperaturas de horneado (160, 170, 180 y 190 °C) y mide el volumen específico del pan. Hornea 3 panes por temperatura.',m:{fac:'Temperatura de horneado',trat:'160, 170, 180 y 190 °C',ue:'Cada pan',resp:'Volumen específico (cm³/g)',rep:'3 panes por temperatura'}},
 {ctx:'Se comparan 3 concentraciones de ácido cítrico (0,1; 0,2 y 0,3 %) en el pardeamiento de rodajas de manzana. Cada concentración se aplica a 4 bandejas con 10 rodajas.',m:{fac:'Concentración de ácido cítrico',trat:'0,1; 0,2 y 0,3 %',ue:'Cada bandeja de 10 rodajas',resp:'Índice de pardeamiento',rep:'4 bandejas por concentración'}},
];
VOC.push(
 {ctx:'Se estudia el efecto de 4 dosis de sal (1, 2, 3 y 4 %) en el sabor de chifles. Cada dosis se aplica a 5 fundas de 100 g y un panel califica el sabor.',m:{fac:'Dosis de sal',trat:'1, 2, 3 y 4 %',ue:'Cada funda de 100 g',resp:'Puntaje de sabor',rep:'5 fundas por dosis'}},
 {ctx:'Una envasadora prueba 3 tiempos de esterilización (10, 15 y 20 min) en conservas de atún y mide la firmeza. Usa 6 latas por tiempo.',m:{fac:'Tiempo de esterilización',trat:'10, 15 y 20 min',ue:'Cada lata',resp:'Firmeza del atún',rep:'6 latas por tiempo'}},
 {ctx:'Se comparan 2 tipos de empaque (vidrio y PET) en la vida útil de una salsa de ají. Se llenan 8 envases de cada tipo y se registran los días hasta que cambia el color.',m:{fac:'Tipo de empaque',trat:'Vidrio y PET',ue:'Cada envase de salsa',resp:'Días hasta el cambio de color',rep:'8 envases por tipo'}},
 {ctx:'Se prueban 3 temperaturas de secado (50, 60 y 70 °C) para hojuelas de yuca, con 4 bandejas por temperatura, midiendo la humedad final.',m:{fac:'Temperatura de secado',trat:'50, 60 y 70 °C',ue:'Cada bandeja de hojuelas',resp:'Humedad final (%)',rep:'4 bandejas por temperatura'}});
const VBOX=[{id:'fac',label:'Factor'},{id:'trat',label:'Tratamientos (niveles)'},{id:'ue',label:'Unidad experimental'},{id:'resp',label:'Variable de respuesta'},{id:'rep',label:'Réplicas'}];
function simPrincipios(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. El vocabulario del experimento</h3><p class="ctx" id="vo-ctx"></p><p class="note">Arrastra cada ficha a su caja (o tócala y luego toca la caja).</p><div id="vo"></div>
    <div class="btn-row"><button type="button" class="btn" id="vo-ok">Comprobar</button><button type="button" class="btn btn-ghost" id="vo-new">Otro caso</button></div><p class="fb" id="vo-fb"></p></div>
    <div class="part"><h3 class="sub">B. ¿Por qué aleatorizar?</h3><p class="ctx">Vas a hornear 12 frascos de mermelada con 3 recetas (A, B y C) que en realidad <b>son igual de buenas</b>. Pero el horno calienta más al fondo, y eso aumenta la pérdida de humedad. Compara qué pasa si colocas los frascos en orden o al azar.</p>
    <div class="seg" id="al-m"><button type="button" data-m="ord" aria-pressed="true">En orden (A al fondo)</button><button type="button" data-m="rnd" aria-pressed="false">Al azar</button></div>
    <div class="oven" id="al-o"></div><div class="readouts" id="al-ro"></div><p class="verdict" id="al-v"></p><div class="btn-row"><button type="button" class="btn btn-ghost" id="al-again">Repetir el experimento</button></div></div>`;
  let D,V;
  function newV(){let n;do{n=pick(VOC);}while(VOC.length>1&&n===V);V=n;$('#vo-ctx',box).textContent=V.ctx;D=dnd($('#vo',box),{items:Object.entries(V.m).map(([k,v])=>({id:k,label:v})),boxes:VBOX});$('#vo-fb',box).textContent='';}
  $('#vo-ok',box).addEventListener('click',()=>{const g=D.get(),ok={};let all=true;Object.keys(V.m).forEach(k=>{ok[k]=g[k]===k;if(!ok[k])all=false;});D.mark(ok);
    $('#vo-fb',box).innerHTML=all?'<strong>Correcto.</strong> La <b>unidad experimental</b> es lo que recibe el tratamiento; las <b>réplicas</b> son las veces que se repite cada tratamiento en unidades distintas.':'Revisa las fichas en rojo. El factor es la variable que cambias; los tratamientos son sus valores concretos.';});
  $('#vo-new',box).addEventListener('click',newV);
  // horno
  const s={m:'ord'};let pos;
  function run(){const grad=[3,2,1,0].map(r=>r*0.9);const assign=s.m==='ord'?['A','A','A','A','B','B','B','B','C','C','C','C']:shuffle(['A','A','A','A','B','B','B','B','C','C','C','C']);
    pos=assign.map((t,i)=>{const row=Math.floor(i/3);const y=round(6+grad[row]+(Math.random()-0.5)*0.6,2);return{t,row,col:i%3,y};});draw();}
  function draw(){const m=['A','B','C'].map(t=>ST.mean(pos.filter(p=>p.t===t).map(p=>p.y))),spread=Math.max(...m)-Math.min(...m);
    $('#al-o',box).innerHTML=`<div class="oven-lbl">Fondo del horno (más caliente)</div><div class="oven-g">${pos.map(p=>`<div class="jar t${p.t}" style="--h:${(3-p.row)/3}"><b>${p.t}</b><span>${nf(p.y,2)} %</span></div>`).join('')}</div><div class="oven-lbl">Puerta (más fría)</div>`;
    $('#al-ro',box).innerHTML=['A','B','C'].map((t,i)=>`<div class="ro"><span>Receta ${t} · media</span><b>${fmt(m[i],2)} %</b></div>`).join('');
    const v=$('#al-v',box);v.className='verdict '+(s.m==='ord'?'bad':'ok');
    v.innerHTML=s.m==='ord'?`<b>Resultado engañoso:</b> la receta A parece perder ${fmt(spread,2)} puntos más, pero es solo porque quedó al fondo. El efecto del horno se <b>confundió</b> con el de la receta.`:`<b>Con aleatorización</b> el calor del fondo se reparte entre las tres recetas: aquí la diferencia entre medias es de ${fmt(spread,2)} puntos. Repite el experimento varias veces: a veces una receta tiene suerte, pero ninguna queda siempre al fondo. Aleatorizar protege contra fuentes de variación que no ves. (Si conoces la fuente, como aquí, aún mejor: usa <b>bloques</b>, una fila del horno por bloque.)`;}
  box.querySelectorAll('#al-m button').forEach(b=>b.addEventListener('click',()=>{s.m=b.dataset.m;box.querySelectorAll('#al-m button').forEach(x=>x.setAttribute('aria-pressed',x===b));run();}));
  $('#al-again',box).addEventListener('click',run);newV();run();return null;
}
function quizPrincipios(){const qs=[],V=pick(VOC);
  qs.push({type:'mc',text:`${V.ctx}<br>¿Cuál es la <b>unidad experimental</b>?`,options:[V.m.ue,V.m.fac,V.m.resp,V.m.trat],answer:0,explain:`La unidad experimental es lo que recibe cada tratamiento: <b>${V.m.ue.toLowerCase()}</b>.`});
  qs.push({type:'mc',text:`En el mismo caso, ¿cuál es la <b>variable de respuesta</b>?`,options:[V.m.resp,V.m.fac,V.m.ue,V.m.rep],answer:0,explain:`Es lo que se mide: <b>${V.m.resp}</b>.`});
  qs.push({type:'mc',text:'¿Para qué sirve <b>aleatorizar</b> el orden o la ubicación de las unidades?',options:['Para que las fuentes de variación no controladas no se confundan con el efecto de los tratamientos','Para obtener más datos con el mismo costo','Para que todos los tratamientos den el mismo resultado','Para no tener que repetir el experimento'],answer:0,explain:'La aleatorización reparte al azar lo que no controlas, para que no favorezca a ningún tratamiento.'});
  qs.push({type:'mc',text:'¿Para qué sirven las <b>réplicas</b>?',options:['Para estimar el error experimental y detectar diferencias con más seguridad','Para tener un tratamiento extra','Para reemplazar la aleatorización','Para que el bloque sea significativo'],answer:0,explain:'Sin réplicas no se puede estimar la variación natural (el error), y sin error no hay prueba F.'});
  const a=rint(2,4),b=rint(2,4),r=rint(2,4);
  qs.push({type:'num',text:`Un experimento estudia ${a} temperaturas y ${b} tiempos (todas las combinaciones) con ${r} réplicas. ¿Cuántas unidades experimentales se necesitan?`,answer:a*b*r,tol:0,explain:`${a} × ${b} tratamientos × ${r} réplicas = <b>${a*b*r}</b>.`});
  qs.push({type:'mc',text:'Un <b>bloque</b> es…',options:['Un grupo de unidades parecidas entre sí (mismo lote, día u operario) donde se prueban todos los tratamientos','Un tratamiento de control','Un segundo factor que se quiere optimizar','El conjunto de réplicas de un tratamiento'],answer:0,explain:'El bloque agrupa una fuente de variación conocida para quitarla del error.'});
  return qs;}

/* =============== 1.2 ¿Qué diseño uso? =============== */
const TREE={q1:{t:'¿Cuántos factores quieres estudiar?',o:[['Uno','q2'],['Dos o más','q3']]},
 q2:{t:'¿Cuántas fuentes de variación conocidas (lotes, días, operarios, equipos) necesitas controlar sin estudiarlas?',o:[['Ninguna: las unidades son homogéneas','q5'],['Una','q6'],['Dos (filas y columnas)','dcl'],['Tres','dcgl']]},
 q5:{t:'¿Todos los tratamientos tienen el mismo número de réplicas?',o:[['Sí','dca'],['No (se perdieron unidades o no alcanzó el material)','dcau']]},
 q6:{t:'¿Cada bloque alcanza para probar todos los tratamientos?',o:[['Sí','dbca'],['No, solo para algunos','dbib']]},
 q3:{t:'¿Cada factor tiene solo dos niveles (bajo y alto)?',o:[['Sí','q4'],['No, alguno tiene 3 o más','fab']]},
 q4:{t:'¿Cuántos factores son?',o:[['Dos','f2'],['Tres','f3']]}};
const RES={dca:['Diseño completamente al azar (DCA)','dca','1.4'],dcau:['DCA desbalanceado','dca-desbalanceado','1.5'],dbca:['Diseño en bloques completos al azar (DBCA)','dbca','2.1'],dcl:['Diseño en cuadro latino (DCL)','cuadro-latino','2.2'],dcgl:['Diseño en cuadro grecolatino (DCGL)','grecolatino','2.3'],dbib:['Bloques incompletos balanceados (DBIB)','dbib','3.1'],f2:['Factorial 2²','factorial-22','4.1'],fab:['Factorial general a × b','factorial-ab','4.2'],f3:['Factorial 2³','factorial-23','4.3']};
const OTHER=[];
function simQueDiseno(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Árbol de decisión</h3><p class="ctx">Responde las preguntas sobre tu experimento.</p><div class="tree" id="tr"></div></div>
   <div class="part"><h3 class="sub">B. Clasifica los casos</h3><p class="ctx" id="cl-ctx"></p><div class="bins">${['dca','dbca','dcl','dcgl','dbib','f2','fab','f3'].map(k=>`<button type="button" class="bin" data-k="${k}"><b style="font-size:14px">${L.DN[k]}</b></button>`).join('')}</div>
   <p class="fb" id="cl-fb"></p><div class="btn-row"><button type="button" class="btn" id="cl-new">Otro caso</button></div><p class="note" id="cl-sc"></p></div>`;
  let path=['q1'];
  function tree(){const out=[];path.forEach((n,i)=>{if(TREE[n]){const nd=TREE[n],ch=path[i+1];out.push(`<div class="tnode"><p><b>${nd.t}</b></p><div class="seg">${nd.o.map(o=>`<button type="button" data-n="${n}" data-to="${o[1]}" aria-pressed="${ch===o[1]}">${o[0]}</button>`).join('')}</div></div>`);}
      else{const r=RES[n];out.push(`<div class="tres"><span>Usa un</span><b>${r[0]}</b><a class="btn sm" href="#/tema/diseno/${r[1]}">Ir al tema ${r[2]} →</a><button type="button" class="btn btn-ghost sm" id="tr-r">Empezar de nuevo</button></div>`);}});
    $('#tr',box).innerHTML=out.join('');
    box.querySelectorAll('#tr [data-to]').forEach(b=>b.addEventListener('click',()=>{const i=path.indexOf(b.dataset.n);path=path.slice(0,i+1);path.push(b.dataset.to);tree();}));
    const r=$('#tr-r',box);if(r)r.addEventListener('click',()=>{path=['q1'];tree();});}
  let C,sc=0,n=0;const bins=[...box.querySelectorAll('.bin')],all=[...L.MINI,...DLAB2.MINI2];
  function nc(){C=pick(all);$('#cl-ctx',box).textContent=C[1];bins.forEach(b=>{b.disabled=false;b.classList.remove('is-ok','is-bad');});$('#cl-fb',box).textContent='';}
  bins.forEach(b=>b.addEventListener('click',()=>{const ok=b.dataset.k===C[0];n++;if(ok)sc++;b.classList.add(ok?'is-ok':'is-bad');if(!ok)bins.find(x=>x.dataset.k===C[0]).classList.add('is-ok');bins.forEach(x=>x.disabled=true);
    $('#cl-fb',box).innerHTML=(ok?'<strong>Bien.</strong> ':'<strong>No.</strong> ')+`Es <b>${RES[C[0]][0]}</b>. ${L.WHEN[C[0]].use}`;$('#cl-sc',box).textContent=`Aciertos: ${sc} de ${n}`;}));
  $('#cl-new',box).addEventListener('click',nc);tree();nc();return null;}
function quizQueDiseno(){const qs=[];const cs=shuffle([...L.MINI,...DLAB2.MINI2]).slice(0,4),ALL=['dca','dbca','dcl','dcgl','dbib','f2','fab','f3'];
  cs.forEach(c=>{const keys=[c[0],...shuffle(ALL.filter(x=>x!==c[0])).slice(0,3)].sort((a,b)=>ALL.indexOf(a)-ALL.indexOf(b));
    qs.push({type:'mc',keepOrder:true,text:c[1]+'<br>¿Qué diseño corresponde?',options:keys.map(k=>L.DN[k]),answer:keys.indexOf(c[0]),explain:`Es <b>${L.DLONG[c[0]]}</b>.`});});
  qs.push({type:'mc',text:'Cada lote de materia prima solo alcanza para 3 de los 5 tratamientos que quieres comparar. ¿Qué diseño usas?',options:['Bloques incompletos balanceados (DBIB)','DBCA con lotes como bloques','Cuadro latino','DCA ignorando los lotes'],answer:0,explain:'Si el bloque no alcanza para todos los tratamientos, el bloque es incompleto: DBIB.'});
  qs.push({type:'mc',text:'En un DBCA, el bloque es…',options:['Una fuente de variación que se controla pero no se estudia','El factor principal del estudio','Una réplica extra','El tratamiento control'],answer:0,explain:'El bloque se incluye para restar su variación del error, no para elegir “el mejor bloque”.'});
  qs.push({type:'mc',text:'¿Qué ventaja tiene un factorial frente a estudiar un factor a la vez?',options:['Permite detectar interacciones y usa menos corridas para la misma información','Siempre da resultados significativos','No necesita réplicas','No necesita aleatorización'],answer:0,explain:'Variar un factor a la vez no puede detectar interacciones y gasta más corridas.'});
  return qs;}

/* =============== 1.3 SPSS sin enredos =============== */
function simSpss(box){
  const vals=[12.5,13.25,11.8,14.05];
  box.innerHTML=`<div class="part"><h3 class="sub">A. El problema del punto y la coma</h3><p class="ctx">SPSS lee los decimales según la configuración de tu computadora. Si el archivo usa otro símbolo, los números se dañan. Prueba las combinaciones:</p>
    <div class="ctrls"><label class="ctrl"><span>Tu computadora usa decimal con</span><select id="sp-pc"><option value=",">coma (12,5)</option><option value=".">punto (12.5)</option></select></label><label class="ctrl"><span>El archivo CSV trae decimales con</span><select id="sp-f"><option value=",">coma (separado por ;)</option><option value=".">punto (separado por ,)</option></select></label></div>
    <div class="two"><div><p class="note">Contenido del archivo (bloc de notas)</p><pre class="code-box" id="sp-raw"></pre></div><div><p class="note">Lo que verías en SPSS</p><div id="sp-grid"></div></div></div><p class="verdict" id="sp-v"></p></div>
   <div class="part"><h3 class="sub">B. Del cuaderno al formato largo</h3><p class="ctx">En el cuaderno anotamos una columna por tratamiento. SPSS necesita <b>una fila por observación</b>: se “apilan” las columnas.</p>
    <div class="two"><div class="table-wrap"><table class="tbl nb"><thead><tr><th>Cuajo A</th><th>Cuajo B</th><th>Cuajo C</th></tr></thead><tbody>${[[14.2,16.1,12.9],[13.8,15.7,13.4],[14.5,16.4,12.6]].map(r=>`<tr>${r.map((v,i)=>`<td class="c${i}">${nf(v,1)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <div id="lg"><button type="button" class="btn" id="lg-go">Apilar →</button></div></div></div>`;
  function upd(){const pc=$('#sp-pc',box).value,fd=$('#sp-f',box).value,sep=fd===','?';':',';
    $('#sp-raw',box).textContent=['cuajo'+sep+'firmeza',...vals.map((v,i)=>(i%2+1)+sep+(fd===','?String(v).replace('.',','):String(v)))].join('\n');
    const ok=pc===fd,cells=vals.map(v=>ok?{t:sp(v,2),c:'sn'}:fd===','?{t:String(v).replace('.',','),c:'txt'}:{t:String(v),c:'txt'});
    $('#sp-grid',box).innerHTML=`<table class="spss-grid"><tr><th></th><th>cuajo</th><th>firmeza</th></tr>${cells.map((c,i)=>`<tr><th>${i+1}</th><td>${i%2+1}</td><td class="${c.c}">${c.t}</td></tr>`).join('')}</table>`;
    const v=$('#sp-v',box);v.className='verdict '+(ok?'ok':'bad');
    v.innerHTML=ok?'<b>Todo bien:</b> los números se leen como números (alineados a la derecha) y se pueden analizar.':`<b>Problema:</b> SPSS no reconoce “${fd===','?'12,5':'12.5'}” como número; la variable queda como <b>cadena</b> (texto, alineado a la izquierda) o con valores equivocados, y no aparecerá en Analizar. <b>Solución:</b> al importar elige el <b>Símbolo decimal</b> correcto en la ventana de importación, descarga la otra versión del archivo, o cambia la configuración regional (ver la Idea clave).`;}
  ['sp-pc','sp-f'].forEach(id=>$('#'+id,box).addEventListener('change',upd));
  $('#lg-go',box).addEventListener('click',()=>{const d=[[14.2,16.1,12.9],[13.8,15.7,13.4],[14.5,16.4,12.6]];
    $('#lg',box).innerHTML=`<table class="spss-grid"><tr><th></th><th>cuajo</th><th>firmeza</th></tr>${[0,1,2].flatMap(t=>d.map(r=>[t,r[t]])).map((x,i)=>`<tr><th>${i+1}</th><td class="c${x[0]}">${x[0]+1}</td><td class="c${x[0]}">${sp(x[1],1)}</td></tr>`).join('')}</table><p class="note">9 filas = 3 tratamientos × 3 réplicas. En la vista de variables, <b>Valores</b>: 1 = A, 2 = B, 3 = C; Medida de cuajo: <b>Nominal</b>; de firmeza: <b>Escala</b>.</p>`;});
  upd();return null;}
function quizSpss(){const qs=[];
  qs.push({type:'mc',text:'En una tabla de SPSS aparece <b>Sig. = ,000</b>. ¿Qué significa?',options:['Que el valor p es menor que 0,0005','Que la probabilidad es exactamente cero','Que hubo un error en el cálculo','Que no se puede decidir'],answer:0,explain:'SPSS redondea a 3 decimales: ,000 es menor que 0,0005. Se reporta como p &lt; 0,001.'});
  qs.push({type:'mc',text:'La variable “receta” tiene los códigos 1, 2 y 3. ¿Qué <b>Medida</b> le corresponde en SPSS?',options:['Nominal','Escala','Ordinal','Numérico'],answer:0,explain:'Los códigos solo nombran grupos: <b>Nominal</b>. (Numérico es el Tipo, no la Medida).'});
  const t=rint(3,5),r=rint(3,6);
  qs.push({type:'num',text:`Un DCA tiene ${t} tratamientos con ${r} réplicas. ¿Cuántas <b>filas</b> tendrá la base de datos en SPSS?`,answer:t*r,tol:0,explain:`Una fila por observación: ${t} × ${r} = <b>${t*r}</b>.`});
  qs.push({type:'mc',text:'Un archivo CSV tiene sus valores separados por punto y coma (;). Lo más probable es que…',options:['Use coma como separador decimal','Use punto como separador decimal','No tenga decimales','Sea un archivo dañado'],answer:0,explain:'Cuando la coma se usa para decimales, las columnas se separan con punto y coma.'});
  qs.push({type:'mc',text:'Después de importar, la variable de respuesta aparece alineada a la izquierda y no figura en el cuadro de Analizar. ¿Qué pasó?',options:['Se leyó como cadena (texto) por el símbolo decimal','Tiene demasiados decimales','Es una variable nominal','Faltan etiquetas de valor'],answer:0,explain:'Los textos se alinean a la izquierda. Hay que reimportar eligiendo el símbolo decimal correcto.'});
  qs.push({type:'mc',text:'¿Qué ruta de Excel permite elegir el separador decimal sin cambiar Windows?',options:['Archivo → Opciones → Avanzadas → desmarcar “Usar separadores del sistema”','Inicio → Formato → Número','Datos → Texto en columnas','Revisar → Idioma'],answer:0,explain:'En Opciones avanzadas se desmarca “Usar separadores del sistema” y se escribe el separador decimal deseado.'});
  return qs;}

/* =============== Laboratorios de diseño: preguntas =============== */
function quizLab(design){return function(){const C=L.GEN[design](),A=L.analyze(C),qs=[],F0=C.fac[0],fact=C.fac.length>1;
  const mini=pick(L.MINI);qs.push({type:'mc',keepOrder:true,text:mini[1]+'<br>¿Qué diseño corresponde?',options:['DCA','DBCA','Factorial 2²','Factorial 2³'],answer:['dca','dbca','f2','f3'].indexOf(mini[0]),explain:`Es <b>${L.DLONG[mini[0]]}</b>.`});
  const desc=fact?`${C.fac.length} factores en 2 niveles con ${C.r} réplicas (N = ${A.N})`:C.blk?`${A.k} tratamientos y ${A.nb} bloques`:`${A.k} tratamientos con ${A.n} réplicas cada uno`;
  qs.push({type:'num',text:`${C.ctx}<br>Con ${desc}, ¿cuántos <b>grados de libertad tiene el error</b>?`,answer:A.err.df,tol:0,explain:`gl<sub>Error</sub> = ${fact?`N − 2<sup>${C.fac.length}</sup> = ${A.N} − ${2**C.fac.length}`:C.blk?`(${A.k} − 1)(${A.nb} − 1)`:`N − t = ${A.N} − ${A.k}`} = <b>${A.err.df}</b>.`});
  const r0=A.rows[0];const ssT=+r0.ss.toPrecision(4),ssE=+A.err.ss.toPrecision(4),Fv=(ssT/r0.df)/(ssE/A.err.df);
  qs.push({type:'num',text:`Para <b>${r0.src}</b>: SC = ${nf(ssT,8)} con ${r0.df} gl, y SC<sub>Error</sub> = ${nf(ssE,8)} con ${A.err.df} gl. Calcula F (dos decimales).`,answer:round(Fv,2),tol:0.011,explain:`CM = ${nf(ssT,8)}/${r0.df} = ${nf(+(ssT/r0.df).toPrecision(5),8)}; CM<sub>E</sub> = ${nf(ssE,8)}/${A.err.df} = ${nf(+(ssE/A.err.df).toPrecision(5),8)}; F = <b>${fmt(Fv,2)}</b>.`});
  const pv=pick([0.001,0.003,0.012,0.034,0.048,0.062,0.15,0.41]);
  qs.push({type:'mc',keepOrder:true,text:`En la tabla de SPSS, la Sig. del efecto es <b>${spP(pv)}</b>. Con α = 0,05…`,options:['Se rechaza H₀: hay evidencia de efecto','No se rechaza H₀: no hay evidencia suficiente de efecto'],answer:pv<0.05?0:1,explain:`${spP(pv)} es ${pv<0.05?'menor':'mayor'} que 0,05.`});
  if(design==='dca'){const q=round(ST.qtukey(0.95,A.k,A.err.df),3),cme=+A.err.ms.toPrecision(4),hsd=q*Math.sqrt(cme/A.n);
    qs.push({type:'num',text:`Para Tukey: q = ${nf(q,3)}, CM<sub>E</sub> = ${nf(cme,8)} y n = ${A.n}. Calcula la DHS (tres decimales).`,answer:round(hsd,3),tol:0.002,explain:`DHS = ${nf(q,3)} · √(${nf(cme,8)} / ${A.n}) = <b>${fmt(hsd,3)}</b>. Dos medias difieren si su distancia supera ese valor.`});
    qs.push({type:'mc',text:'Se rechazó H₀ en un DCA con 4 tratamientos. ¿Qué se puede afirmar?',options:['Al menos un tratamiento difiere; Tukey dirá cuáles','Los 4 tratamientos son diferentes entre sí','El tratamiento con mayor media es el mejor','Hay que repetir el experimento'],answer:0,explain:'H₁ dice “al menos una media es diferente”. Para saber cuáles se usa una prueba de comparaciones múltiples.'});}
  else if(design==='dbca'){qs.push({type:'num',text:`En un DBCA con ${A.k} tratamientos y ${A.nb} bloques, ¿cuántos gl tiene el <b>bloque</b>?`,answer:A.nb-1,tol:0,explain:`gl<sub>Bloque</sub> = b − 1 = <b>${A.nb-1}</b>.`});
    qs.push({type:'mc',text:'En SPSS (Univariado), ¿cómo se configura el modelo de un DBCA?',options:['Modelo personalizado con solo efectos principales: tratamiento y bloque','Factorial completo con tratamiento × bloque','Solo el tratamiento como factor fijo','El bloque como variable dependiente'],answer:0,explain:'Con una observación por celda no hay gl para la interacción; el DBCA usa solo efectos principales.'});}
  else{const N=A.N,ct=+A.effects.A.contrast.toPrecision(4),ef=ct/(N/2);qs.push({type:'num',text:`En un factorial con N = ${N} observaciones, el contraste del factor A vale ${nf(ct,8)}. Calcula el <b>efecto</b> de A (contraste / (N/2)).`,answer:ef,tol:Math.max(1e-4,Math.abs(ef)*0.01),explain:`Efecto = ${nf(ct,8)} / ${N/2} = <b>${nf(+ef.toPrecision(4),8)}</b>: es lo que cambia la respuesta al pasar A de bajo a alto, en promedio.`});
    qs.push({type:'mc',text:'La interacción A × B es significativa. ¿Cómo se elige la mejor condición?',options:['Mirando la mejor combinación de A y B en el gráfico de perfil','Eligiendo el mejor nivel de A y luego el mejor de B por separado','Ignorando la interacción','Eligiendo siempre los niveles altos'],answer:0,explain:'Con interacción, el efecto de A cambia según B: se analiza la combinación.'});}
  return qs;};}

/* =============== Registro =============== */
const IDEA_LAB={
 dca:`<div class="formula">y<sub>ij</sub> = μ + τ<sub>i</sub> + ε<sub>ij</sub> · H₀: μ<sub>1</sub> = μ<sub>2</sub> = … = μ<sub>t</sub> · H₁: al menos una media difiere<br>FC = (Σy)²/N · SC<sub>T</sub> = Σy² − FC · SC<sub>Trat</sub> = Σ(Y<sub>i.</sub>²/n) − FC · SC<sub>E</sub> = SC<sub>T</sub> − SC<sub>Trat</sub><br>gl: t − 1 · N − t · F = CM<sub>Trat</sub>/CM<sub>E</sub> · DHS (Tukey) = q·√(CM<sub>E</sub>/n)</div>
  <p><b>Ruta:</b> 1) plantea hipótesis → 2) organiza los datos → 3) revisa supuestos → 4) ANOVA → 5) decide con Sig. → 6) si rechazas, Tukey → 7) redacta la conclusión.</p>`,
 dbca:`<div class="formula">y<sub>ij</sub> = μ + τ<sub>i</sub> + β<sub>j</sub> + ε<sub>ij</sub><br>SC<sub>Bloque</sub> = Σ(Y<sub>.j</sub>²/t) − FC · SC<sub>E</sub> = SC<sub>T</sub> − SC<sub>Trat</sub> − SC<sub>Bloque</sub><br>gl: t − 1 · b − 1 · (t − 1)(b − 1)</div>
  <p>El bloque “se lleva” su variación y el error queda más pequeño: eso hace la prueba más sensible. Cada bloque recibe <b>todos</b> los tratamientos, en orden aleatorio dentro del bloque.</p>`,
 f2:`<div class="formula">Corridas: 2² × r · Efecto = contraste / (N/2) · SC = contraste² / N · cada efecto tiene 1 gl<br>Efectos: A, B y la interacción AB</div>
  <p>Hay <b>interacción</b> cuando el efecto de un factor cambia según el nivel del otro: en el gráfico de perfil, las líneas no son paralelas. Si AB es significativa, interpreta A y B <b>juntos</b>.</p>`,
 f3:`<div class="formula">Corridas: 2³ × r = 8r · Efectos: A, B, C, AB, AC, BC, ABC (1 gl cada uno)<br>gl<sub>Error</sub> = 8(r − 1)</div>
  <p>Con tres factores, primero mira las interacciones (de mayor a menor orden), luego los efectos principales que no participan en interacciones significativas.</p>`};
const lab=d=>box=>L.lab(box,d),lab2=d=>box=>DLAB2.lab(box,d);
Object.assign(IDEA_LAB,{
 dcau:`<div class="formula">SC<sub>Trat</sub> = Σ(Y<sub>i.</sub>² / n<sub>i</sub>) − FC · SC<sub>E</sub> = SC<sub>T</sub> − SC<sub>Trat</sub> · gl: t − 1 · N − t (N = Σn<sub>i</sub>)<br>Tukey-Kramer: DHS<sub>ij</sub> = q<sub>(α; t; N−t)</sub> · √( CM<sub>E</sub>/2 · (1/n<sub>i</sub> + 1/n<sub>j</sub>) )</div>
  <p>Cada par de tratamientos tiene su propia DHS. En SPSS, ANOVA de un factor da las comparaciones por pares con Tukey-Kramer, pero arma los subconjuntos homogéneos con la <b>media armónica</b> de los n, y lo advierte al pie: para decidir sobre un par, usa Comparaciones múltiples. Si el desbalance es grande, revisa con más cuidado la homogeneidad de varianzas.</p>`,
 dcl:`<div class="formula">y<sub>ijk</sub> = μ + τ<sub>i</sub> + β<sub>j</sub> (fila) + γ<sub>k</sub> (columna) + ε<sub>ijk</sub> · N = p²<br>SC<sub>Trat</sub> = ΣY<sub>i</sub>²/p − FC · SC<sub>Filas</sub> = ΣY<sub>j</sub>²/p − FC · SC<sub>Col</sub> = ΣY<sub>k</sub>²/p − FC<br>gl: p − 1 para cada uno · Error: (p − 1)(p − 2) · DHS = q·√(CM<sub>E</sub>/p)</div>
  <p>Cada tratamiento aparece <b>una vez en cada fila y una vez en cada columna</b>. Se aleatoriza eligiendo un cuadro al azar: se permutan filas, columnas y la asignación de letras. El modelo supone que no hay interacciones.</p>`,
 dcgl:`<div class="formula">y = μ + τ (letra latina) + β (fila) + γ (columna) + δ (letra griega) + ε · N = p²<br>SC de cada factor = ΣY²/p − FC · gl: p − 1 cada uno · Error: (p − 1)(p − 3)</div>
  <p>Son dos cuadros latinos <b>ortogonales</b> superpuestos: cada combinación letra latina–letra griega aparece una sola vez. Existe para p = 3, 4, 5, 7, 8…, pero <b>no para p = 6</b>. Con p = 4 quedan solo 3 gl para el error.</p>`,
 dbib:`<div class="formula">t tratamientos · b bloques de tamaño k &lt; t · cada tratamiento r veces · N = t·r = b·k · λ = r(k − 1)/(t − 1)<br>Q<sub>i</sub> = y<sub>i.</sub> − (1/k)·Σ (totales de los bloques donde aparece i)<br>SC<sub>Trat (aj)</sub> = k·ΣQ<sub>i</sub>² / (λ·t) · SC<sub>Bloques</sub> = Σy<sub>.j</sub>²/k − FC · SC<sub>E</sub> = SC<sub>T</sub> − SC<sub>Trat (aj)</sub> − SC<sub>Bloques</sub><br>SC<sub>Bloques (aj)</sub> = SC<sub>Trat (aj)</sub> + SC<sub>Bloques</sub> − SC<sub>Trat</sub> · gl<sub>E</sub> = N − t − b + 1<br>Media ajustada = ȳ.. + k·Q<sub>i</sub>/(λ·t) · DHS = q·√(k·CM<sub>E</sub>/(λ·t))</div>
  <p>En SPSS: Univariado con efectos principales y <b>Tipo III</b> (tratamiento y bloque salen ajustados) y <b>Medias marginales estimadas</b> para las medias ajustadas y su gráfica. No uses Post hoc: compara medias simples.</p>`,
 fab:`<div class="formula">Corridas: a·b·r · SC<sub>A</sub> = ΣY<sub>i..</sub>²/(b·r) − FC · SC<sub>B</sub> = ΣY<sub>.j.</sub>²/(a·r) − FC<br>SC<sub>A×B</sub> = ΣY<sub>ij.</sub>²/r − FC − SC<sub>A</sub> − SC<sub>B</sub> · SC<sub>E</sub> = SC<sub>T</sub> − ΣY<sub>ij.</sub>²/r + FC<br>gl: a − 1 · b − 1 · (a − 1)(b − 1) · ab(r − 1)</div>
  <p>Primero mira la <b>interacción</b>. Si es significativa, compara combinaciones con el gráfico de perfil. Si no, interpreta cada factor y usa Tukey en los que tienen 3 o más niveles (SPSS no hace post hoc con 2 niveles).</p>`});
function quizDcau(){const C=L.GEN.dcau(),A=L.analyze(C),F0=C.fac[0],qs=[];
  qs.push({type:'num',text:`${C.ctx}<br>¿Cuántos grados de libertad tiene el <b>error</b>?`,answer:A.err.df,tol:0,explain:`gl<sub>Error</sub> = N − t = ${A.N} − ${A.k} = <b>${A.err.df}</b>, con N = ${A.ns.join(' + ')}.`});
  const i=A.ns.indexOf(Math.min(...A.ns)),tot=+A.trSum[i].toFixed(C.resp.dec);
  qs.push({type:'num',text:`El tratamiento ${F0.lv[i]} tiene ${A.ns[i]} réplicas y su total es ${nf(tot,C.resp.dec)}. ¿Cuánto aporta a Σ(Y<sub>i.</sub>²/n<sub>i</sub>)? (dos decimales)`,answer:round(tot*tot/A.ns[i],2),tol:0.01,explain:`${nf(tot,C.resp.dec)}² / ${A.ns[i]} = <b>${fmt(tot*tot/A.ns[i],2)}</b>. Cada total se divide entre su propio n<sub>i</sub>.`});
  const q=round(ST.qtukey(0.95,A.k,A.err.df),3),cme=+A.err.ms.toPrecision(4),ni=A.ns[0],nj=A.ns[1],dhs=q*Math.sqrt(cme/2*(1/ni+1/nj));
  qs.push({type:'num',text:`Tukey-Kramer: q = ${nf(q,3)}, CM<sub>E</sub> = ${nf(cme,8)}, n<sub>1</sub> = ${ni} y n<sub>2</sub> = ${nj}. Calcula la DHS de ese par (tres decimales).`,answer:round(dhs,3),tol:0.002,explain:`DHS = ${nf(q,3)} · √(${nf(cme,8)}/2 · (1/${ni} + 1/${nj})) = <b>${fmt(dhs,3)}</b>.`});
  qs.push({type:'mc',text:'¿Por qué en un DCA desbalanceado cada par de tratamientos tiene su propia DHS?',options:['Porque el error de la diferencia depende de cuántas réplicas tiene cada tratamiento','Porque el CM<sub>E</sub> cambia en cada par','Porque q depende del par comparado','No es así: la DHS es una sola'],answer:0,explain:'La varianza de ȳ<sub>i</sub> − ȳ<sub>j</sub> es CM<sub>E</sub>(1/n<sub>i</sub> + 1/n<sub>j</sub>): cambia con los n.'});
  qs.push({type:'mc',text:'En la tabla de subconjuntos de SPSS aparece la nota “los tamaños de grupo no son iguales; se utiliza la media armónica”. ¿Qué haces?',options:['Decido sobre cada par con la tabla de Comparaciones múltiples (Tukey-Kramer)','Descarto el análisis','Elimino datos hasta igualar las réplicas','Uso solo la tabla de subconjuntos'],answer:0,explain:'Los subconjuntos con media armónica son una aproximación; las comparaciones por pares usan los n reales.'});
  const pv=pick([0.002,0.021,0.044,0.083,0.27]);qs.push({type:'mc',keepOrder:true,text:`La Sig. del ANOVA es <b>${spP(pv)}</b>. Con α = 0,05…`,options:['Se rechaza H₀','No se rechaza H₀'],answer:pv<0.05?0:1,explain:`${spP(pv)} es ${pv<0.05?'menor':'mayor'} que 0,05.`});
  return qs;}
CIMA.addUnit(META,{id:'u1',orden:1,nombre:'Unidad 1 · Fundamentos del diseño y DCA',topics:[
 {id:'principios',n:'1.1',short:'Principios',title:'Conceptos y principios del diseño',desc:'Factor, tratamiento, unidad experimental, réplica, aleatorización y bloque.',
  lead:'Un experimento bien diseñado responde la pregunta correcta con el menor costo. Todo empieza por nombrar bien sus partes y respetar tres principios.',
  idea:`<div class="types"><div class="type"><b>Aleatorización</b><span>Asignar tratamientos y orden al azar, para que lo que no controlas no favorezca a nadie.</span></div><div class="type"><b>Réplica</b><span>Repetir cada tratamiento en unidades distintas, para estimar el error.</span></div><div class="type"><b>Bloqueo</b><span>Agrupar unidades parecidas para quitar una fuente de variación conocida.</span></div><div class="type"><b>Unidad experimental</b><span>Lo que recibe un tratamiento: un molde, un frasco, una bandeja.</span></div></div>`,
  simHint:'Ubica cada término en su caja y mira qué pasa al no aleatorizar.',sim:simPrincipios,quiz:quizPrincipios},
 {id:'que-diseno',n:'1.2',short:'¿Qué diseño uso?',title:'¿Qué diseño uso?',desc:'Árbol de decisión y casos para elegir el diseño correcto.',
  lead:'Elegir el diseño es la decisión más importante: un buen análisis no rescata un experimento mal planteado.',
  idea:`<ul><li><b>Un factor, unidades homogéneas</b> → DCA.</li><li><b>Un factor y una fuente de ruido conocida</b> (lotes, días, operarios) → DBCA.</li><li><b>Dos o tres factores en dos niveles</b> → factorial 2² o 2³.</li><li><b>Factores con más niveles</b> → factorial general a × b.</li></ul>`,
  simHint:'Recorre el árbol y clasifica casos reales de planta.',sim:simQueDiseno,quiz:quizQueDiseno},
 {id:'spss-basico',n:'1.3',short:'SPSS sin enredos',title:'SPSS sin enredos: datos, decimales y formato',desc:'Separador decimal, formato largo, vista de variables y cómo leer ,000.',
  lead:'La mitad de los errores en SPSS ocurren antes de analizar: decimales mal leídos, datos en el formato equivocado o variables mal definidas.',
  idea:`<div class="types"><div class="type"><b>Windows</b><span>Panel de control → Reloj y región → Región → <b>Configuración adicional</b> → Símbolo decimal. SPSS y Excel lo toman de aquí.</span></div>
   <div class="type"><b>SPSS al importar</b><span>Archivo → Importar datos → Datos CSV: en la ventana de importación elige el <b>Símbolo decimal</b> (punto o coma) que trae el archivo. Con sintaxis: <code>SET DECIMAL=COMMA.</code> o <code>SET DECIMAL=DOT.</code> antes de leer el archivo.</span></div>
   <div class="type"><b>Excel</b><span>Archivo → Opciones → Avanzadas → desmarca <b>Usar separadores del sistema</b> y escribe el separador decimal (File → Options → Advanced → Use system separators).</span></div>
   <div class="type"><b>JASP</b><span>Usa el CSV con <b>punto decimal</b> y revisa que la variable aparezca como continua (regla); si sale como texto, cámbiala o reimporta.</span></div></div>
   <ul><li><b>Formato largo</b>: una fila por observación y una columna por variable.</li><li>Tratamientos y bloques con códigos numéricos, etiquetas en <b>Valores</b> y Medida <b>Nominal</b>; la respuesta con Medida <b>Escala</b>.</li><li>SPSS en español escribe <b>,045</b> por 0,045 y <b>,000</b> cuando p &lt; 0,0005.</li></ul>`,
  simHint:'Prueba qué pasa con el punto y la coma, y apila datos al formato largo.',sim:simSpss,quiz:quizSpss},
 {id:'dca',n:'1.4',short:'DCA',title:'Diseño completamente al azar (DCA) y Tukey',desc:'ANOVA de un factor, supuestos y comparaciones múltiples.',lead:'El DCA compara varios tratamientos cuando las unidades son homogéneas. Es la base de todos los demás diseños.',idea:IDEA_LAB.dca,simHint:'Seis pestañas: de cuándo usarlo a cómo redactar la conclusión, con un caso de planta.',sim:lab('dca'),quiz:quizLab('dca')},
 {id:'dca-desbalanceado',n:'1.5',short:'DCA desbalanceado',title:'DCA desbalanceado y Tukey-Kramer',desc:'Tratamientos con distinto número de réplicas.',lead:'En la planta se rompen frascos y se contaminan muestras. Cuando los tratamientos quedan con distinto número de réplicas, las fórmulas y la prueba de Tukey cambian.',idea:IDEA_LAB.dcau,simHint:'Analiza un DCA con réplicas desiguales y compara pares con Tukey-Kramer.',sim:lab('dcau'),quiz:quizDcau}]});
CIMA.addUnit(META,{id:'u2',orden:2,nombre:'Unidad 2 · Diseños de bloques completos',topics:[
 {id:'dbca',n:'2.1',short:'DBCA',title:'Diseño en bloques completos al azar (DBCA)',desc:'Controlar lotes, días u operarios con bloques.',lead:'Cuando la materia prima, el día o el operario cambian, el DBCA separa ese ruido del efecto que realmente te interesa.',idea:IDEA_LAB.dbca,simHint:'Organiza tratamientos y bloques, analiza y lee la salida de Univariado.',sim:lab('dbca'),quiz:quizLab('dbca')},
 {id:'cuadro-latino',n:'2.2',short:'Cuadro latino',title:'Diseño en cuadro latino (DCL)',desc:'Un factor y dos fuentes de ruido: filas y columnas.',lead:'Si tienes dos fuentes de ruido a la vez (lotes y operarios, días y equipos), el cuadro latino controla ambas con pocas corridas.',idea:IDEA_LAB.dcl,simHint:'Lee el cuadro del cuaderno, arma la base para SPSS y analiza tratamiento, filas y columnas.',sim:lab2('dcl'),quiz:DLAB2.quiz('dcl')},
 {id:'grecolatino',n:'2.3',short:'Grecolatino',title:'Diseño en cuadro grecolatino (DCGL)',desc:'Un factor y tres fuentes de ruido con dos cuadros latinos superpuestos.',lead:'El grecolatino agrega una tercera fuente de ruido al cuadro latino, sin aumentar el número de corridas.',idea:IDEA_LAB.dcgl,simHint:'Identifica las letras latinas y griegas, analiza los cuatro factores y decide con Tukey.',sim:lab2('dcgl'),quiz:DLAB2.quiz('dcgl')}]});
CIMA.addUnit(META,{id:'u3',orden:3,nombre:'Unidad 3 · Diseños de bloques incompletos',topics:[
 {id:'dbib',n:'3.1',short:'DBIB',title:'Bloques incompletos balanceados (DBIB)',desc:'Tratamientos y bloques ajustados, y sus gráficas de medias.',lead:'Cuando un bloque no alcanza para todos los tratamientos (un panelista que solo prueba tres muestras, un lote pequeño), se usa un diseño incompleto y se comparan medias ajustadas.',idea:IDEA_LAB.dbib,simHint:'Calcula Q, λ y las sumas ajustadas, compara medias ajustadas y revisa si valió la pena bloquear.',sim:lab2('dbib'),quiz:DLAB2.quiz('dbib')}]});
CIMA.addUnit(META,{id:'u4',orden:4,nombre:'Unidad 4 · Diseños factoriales',topics:[
 {id:'factorial-22',n:'4.1',short:'Factorial 2²',title:'Diseño factorial 2²',desc:'Dos factores en dos niveles: efectos e interacción.',lead:'Un factorial estudia varios factores a la vez y descubre si interactúan, algo que nunca verías cambiando un factor a la vez.',idea:IDEA_LAB.f2,simHint:'Analiza efectos principales e interacción con el gráfico de perfil.',sim:lab('f2'),quiz:quizLab('f2')},
 {id:'factorial-ab',n:'4.2',short:'Factorial a × b',title:'Diseño factorial general a × b',desc:'Dos factores con 3 o más niveles: interacción y Tukey.',lead:'Cuando un factor tiene tres o más niveles (temperaturas, variedades, concentraciones), el factorial general muestra si los factores interactúan y cuál es la mejor combinación.',idea:IDEA_LAB.fab,simHint:'Lee el gráfico de perfil, decide por la interacción y usa Tukey solo cuando corresponde.',sim:lab2('fab'),quiz:DLAB2.quiz('fab')},
 {id:'factorial-23',n:'4.3',short:'Factorial 2³',title:'Diseño factorial 2³',desc:'Tres factores en dos niveles: ocho combinaciones.',lead:'Con tres factores y ocho combinaciones puedes identificar qué variables de proceso importan de verdad.',idea:IDEA_LAB.f3,simHint:'Interpreta siete efectos y encuentra la mejor combinación.',sim:lab('f3'),quiz:quizLab('f3')}]});
})();
