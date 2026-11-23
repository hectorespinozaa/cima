"use strict";
/* =====================================================================
   CIMA · Sugerencias de repaso (v1.3)
   Cuando el estudiante falla un paso concreto (en un laboratorio) o no
   aprueba la prueba de un tema, CIMA le sugiere temas previos de otras
   materias. Cada sugerencia, y cada vez que la abre, queda registrada
   (tabla "repasos") para que el docente la vea en el Dashboard.
   Mapa revisado por el docente: materia/tema → [{m: motivo, a: [temas]}]
   motivo '*' = no aprobó la prueba del tema.
   ===================================================================== */
window.REPASO=(function(){
const LAB=['dca','dca-desbalanceado','dbca','cuadro-latino','grecolatino','dbib','factorial-22','factorial-ab','factorial-23'];
const MOTIVO={hipotesis:'Plantear las hipótesis',supuestos:'Revisar los supuestos',decision:'Decidir con la Sig.',calculo:'Calcular la tabla ANOVA',pronostico:'Pronosticar con el modelo',bloque:'Reconocer el bloque',datos:'Organizar los datos',plantear:'Plantear las ecuaciones',resolver:'Resolver el sistema','*':'Aprobar la prueba del tema'};
const MAP={};
const add=(k,m,a)=>{(MAP[k]=MAP[k]||[]).push({m,a});};
/* Diseño Experimental: pasos de los laboratorios */
LAB.forEach(t=>{const k='diseno/'+t;
  add(k,'hipotesis',['estadistica/hipotesis']);add(k,'supuestos',['estadistica/que-prueba']);add(k,'decision',['estadistica/una-media']);
  add(k,'calculo',['nivelacion/sumatoria','estadistica/anova-intro']);});
['factorial-22','factorial-ab','factorial-23'].forEach(t=>add('diseno/'+t,'pronostico',['estadistica/regresion','metodos/ecuaciones','metodos/simplificacion']));
/* Diseño: no aprobó la prueba del tema */
add('diseno/principios','*',['estadistica/variables']);
add('diseno/spss-basico','*',['estadistica/variables','nivelacion/porcentajes']);
add('diseno/dca','*',['estadistica/anova-intro','estadistica/dispersion']);
add('diseno/dca-desbalanceado','*',['diseno/dca','nivelacion/sumatoria']);
add('diseno/dbca','*',['diseno/principios','diseno/dca']);
add('diseno/cuadro-latino','*',['diseno/dbca','diseno/spss-basico']);
add('diseno/grecolatino','*',['diseno/cuadro-latino']);
add('diseno/dbib','*',['diseno/dbca']);
['factorial-22','factorial-ab','factorial-23'].forEach(t=>add('diseno/'+t,'*',['diseno/dca','nivelacion/sumatoria']));
/* Estadística */
add('estadistica/frecuencias','*',['nivelacion/porcentajes']);
add('estadistica/centro','*',['metodos/reales','nivelacion/sumatoria']);
add('estadistica/dispersion','*',['metodos/potencias','nivelacion/sumatoria']);
add('estadistica/normal','*',['estadistica/dispersion','nivelacion/despeje']);
add('estadistica/intervalos','*',['estadistica/tlc','nivelacion/despeje']);
add('estadistica/una-media','*',['estadistica/hipotesis']);
add('estadistica/dos-grupos','*',['estadistica/que-prueba','estadistica/hipotesis']);
add('estadistica/correlacion','*',['calidad/dispersion']);
add('estadistica/regresion','*',['metodos/graficas','metodos/tipos-funciones']);
add('estadistica/chi-cuadrado','*',['estadistica/que-prueba','nivelacion/porcentajes']);
add('estadistica/anova-intro','*',['estadistica/que-prueba','nivelacion/sumatoria']);
add('estadistica/que-prueba','*',['estadistica/hipotesis','estadistica/variables']);
/* Gestión de la Calidad */
add('calidad/pareto','*',['estadistica/frecuencias','nivelacion/porcentajes']);
add('calidad/dispersion','*',['estadistica/correlacion']);
add('calidad/graficos-variables','*',['estadistica/centro','estadistica/dispersion']);
add('calidad/graficos-atributos','*',['estadistica/binomial','estadistica/poisson','nivelacion/porcentajes']);
add('calidad/capacidad','*',['estadistica/normal']);
add('calidad/muestreo','*',['estadistica/binomial']);
/* Métodos Numéricos */
add('metodos/ecuaciones','*',['nivelacion/despeje']);
add('metodos/sistemas','*',['nivelacion/enunciado']);
add('metodos/mezclas','plantear',['metodos/sistemas','nivelacion/enunciado']);
add('metodos/mezclas','resolver',['metodos/gauss','metodos/determinantes']);
add('metodos/mezclas','*',['metodos/sistemas','nivelacion/enunciado','metodos/gauss']);

const here=()=>{const m=(location.hash||'').match(/^#\/tema\/([^/]+)\/([^/?#]+)/);return m?m[1]+'/'+decodeURIComponent(m[2]):null;};
const tinfo=k=>{const[s,t]=k.split('/');const sub=CIMA.subject(s),top=sub?CIMA.topic(s,t):null;return top?{s,t,sub,top}:null;};
const label=k=>{const i=tinfo(k);return i?`${i.sub.nombre} ${i.top.n} · ${i.top.title}`:k;};
const shown=new Set();
function log(row){try{if(typeof S==='undefined'||!S.user||S.profile?.rol==='docente')return;API.addRepaso(row).catch(()=>{});}catch(_){}}
function targets(origen,motivo){return(MAP[origen]||[]).filter(e=>e.m===motivo).flatMap(e=>e.a).filter(k=>tinfo(k));}
/* HTML de la sugerencia; registra solo la primera vez por página */
function html(origen,motivo){const ts=targets(origen,motivo);if(!ts.length)return'';
  const key=origen+'|'+motivo;if(!shown.has(key)){shown.add(key);ts.forEach(k=>log({origen,motivo,sugerido:k}));}
  return`<div class="repaso" data-origen="${origen}" data-motivo="${motivo}"><b>${motivo==='*'?'Antes de volver a intentarlo, repasa:':'¿Te cuesta este paso? Repasa:'}</b> ${ts.map(k=>`<a href="#/tema/${k}" data-rep="${k}">${esc(label(k))}</a>`).join(' · ')}</div>`;}
/* al fallar un paso de laboratorio: añade la sugerencia dentro del elemento */
function fail(motivo,node){const o=here();if(!o||!node)return;if(node.querySelector('.repaso'))return;const h=html(o,motivo);if(h)node.insertAdjacentHTML('beforeend',h);}
/* temas previos de un tema (para mostrarlos en su cabecera) */
function previos(origen){return[...new Set((MAP[origen]||[]).filter(e=>e.m==='*').flatMap(e=>e.a))].filter(k=>tinfo(k));}
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('.repaso a[data-rep]');if(!a)return;const box=a.closest('.repaso');log({origen:box.dataset.origen,motivo:box.dataset.motivo,sugerido:a.dataset.rep,evento:'abierto'});});
return{MAP,MOTIVO,html,fail,previos,label,targets};
})();
