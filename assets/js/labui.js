/* =====================================================================
   CIMA · Piezas de interfaz para laboratorios (Estadística, Calidad)
   window.LABUI: steps · readOut · sheet (Excel) · jasp (tabla) · builder · statements
   ===================================================================== */
window.LABUI=(function(){
"use strict";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* número estilo JASP (punto decimal) */
const jn=(x,d=3)=>Number.isFinite(x)?x.toFixed(d).replace('-','−'):'';
const jp=p=>p<0.001?'&lt; .001':p.toFixed(3);
/* número estilo Excel en español */
const xn=(x,d=4)=>Number.isFinite(x)?(+x.toFixed(d)).toString().replace('.',',').replace('-','−'):'';

/* ---- pasos secuenciales con pregunta ---- */
function steps(p,list,done){
  p.innerHTML=`<ol class="lsteps"></ol>`;const ol=p.querySelector('ol');
  function add(i){const s=list[i],li=document.createElement('li');li.className='lstep';li.innerHTML=`<h4><span class="ln">${i+1}</span>${s.t}</h4>${s.body||''}<div class="lq"></div><div class="lafter" hidden></div>`;ol.appendChild(li);
    if(s.mount)s.mount(li);
    const q=s.q,box=li.querySelector('.lq'),after=li.querySelector('.lafter');
    const finish=()=>{if(s.after){after.innerHTML=s.after;after.hidden=false;if(s.afterMount)s.afterMount(after);}if(i+1<list.length)add(i+1);else if(done){const d=document.createElement('p');d.className='verdict ok';d.innerHTML=done;ol.after(d);}};
    if(!q){finish();return;}
    if(q.type==='mc'){const opts=q.keepOrder?q.opts:shuffle(q.opts);box.innerHTML=`${q.text?`<p><b>${q.text}</b></p>`:''}<div class="opts">${opts.map((o,j)=>`<button type="button" class="opt" data-j="${j}">${o[0]}</button>`).join('')}</div><p class="fb"></p>`;
      box.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{const o=opts[+b.dataset.j];box.querySelectorAll('.opt').forEach((x,j)=>{x.disabled=true;if(opts[j][1])x.classList.add('is-ok');});if(!o[1])b.classList.add('is-bad');
        box.querySelector('.fb').innerHTML=(o[1]?'<strong>Bien.</strong> ':'<strong>No.</strong> ')+(o[2]||opts.find(x=>x[1])[2]||'');finish();}));}
    else{box.innerHTML=`<p><b>${q.text}</b></p><div class="ans-row"><input class="inp" inputmode="decimal" aria-label="Respuesta"><button type="button" class="btn">Comprobar</button></div><p class="fb"></p>`;const inp=box.querySelector('input'),bt=box.querySelector('button');
      const go=()=>{const v=parseNum(inp.value);if(!Number.isFinite(v)){box.querySelector('.fb').textContent='Escribe un número (puedes usar coma decimal).';return;}const ok=Math.abs(v-q.answer)<=(q.tol??1e-6)+1e-9;inp.disabled=bt.disabled=true;inp.classList.add(ok?'good':'bad');box.querySelector('.fb').innerHTML=(ok?'<strong>Bien.</strong> ':'<strong>No.</strong> ')+q.explain;finish();};
      bt.addEventListener('click',go);inp.addEventListener('keydown',e=>{if(e.key==='Enter')go();});}}
  add(0);}

/* ---- tabla estilo JASP ---- */
function jasp(t){return`<div class="jasp-t"><div class="jasp-title">${t.title}</div><table><thead>${t.head.map(r=>`<tr>${r.map(c=>`<th${c.cs?` colspan="${c.cs}"`:''}>${c.t??c}</th>`).join('')}</tr>`).join('')}</thead><tbody>${t.rows.map(r=>`<tr>${r.map((c,i)=>{c=typeof c==='object'&&c!==null?c:{t:c};return`<td${c.k?` data-k="${c.k}" tabindex="0"`:''} class="${i===0&&!c.n?'jl':'jv'}">${c.t??''}</td>`;}).join('')}</tr>`).join('')}</tbody></table>${(t.foot||[]).map(f=>`<div class="jasp-foot">${f}</div>`).join('')}</div>`;}
/* ---- tabla estilo salida de Excel (Análisis de datos) ---- */
function xout(t){return`<div class="xout"><div class="xout-title">${t.title}</div><table>${t.head?`<tr>${t.head.map(h=>`<th>${h}</th>`).join('')}</tr>`:''}${t.rows.map(r=>`<tr>${r.map((c,i)=>{c=typeof c==='object'&&c!==null?c:{t:c};return`<td${c.k?` data-k="${c.k}" tabindex="0"`:''} class="${i===0?'xl':'xv'}">${c.t??''}</td>`;}).join('')}</tr>`).join('')}</table></div>`;}

/* ---- hoja de Excel con barra de fórmulas ----
   cells: [[{v,f,cls,b}...]] (filas), cols: letras opcionales; f = fórmula mostrada al tocar */
function sheet(cells,o={}){const nc=Math.max(...cells.map(r=>r.length)),L='ABCDEFGHIJ';
  return`<div class="xl-sheet"><div class="xl-fx"><span class="xl-ref">${o.ref||'A1'}</span><span class="xl-fxi">fx</span><span class="xl-f">${o.f?esc(o.f):'Toca una celda azul para ver su fórmula'}</span></div><div class="xl-scroll"><table><tr><th></th>${Array.from({length:nc},(_,j)=>`<th>${L[j]}</th>`).join('')}</tr>
   ${cells.map((r,i)=>`<tr><th>${i+1}</th>${Array.from({length:nc},(_,j)=>{const c=r[j]||{};return`<td class="${c.f?'xf':''} ${c.cls||''} ${c.b?'xb':''} ${typeof c.v==='number'?'xr':''}"${c.f?` data-f="${esc(c.f)}" data-ref="${L[j]}${i+1}" tabindex="0"`:''}>${typeof c.v==='number'?xn(c.v,c.d??4):(c.v??'')}</td>`;}).join('')}</tr>`).join('')}</table></div></div>`;}
function mountSheet(root){root.querySelectorAll('.xl-sheet').forEach(sh=>{const fx=sh.querySelector('.xl-f'),ref=sh.querySelector('.xl-ref');
  sh.querySelectorAll('td[data-f]').forEach(td=>{const h=()=>{sh.querySelectorAll('td.sel').forEach(x=>x.classList.remove('sel'));td.classList.add('sel');fx.textContent=td.dataset.f;ref.textContent=td.dataset.ref;};td.addEventListener('click',h);td.addEventListener('keydown',e=>{if(e.key==='Enter')h();});});});}

/* ---- lee la salida: preguntas que se responden tocando celdas [data-k] ---- */
function readOut(p,html,qs,o={}){
  p.innerHTML=`<div class="${o.cls||'jasp-wrap'}"><div class="spss-q" id="rq"></div><div class="ro-body">${html}</div></div>${o.note?`<p class="note">${o.note}</p>`:''}`;
  let qi=0,tries=0;const rq=p.querySelector('#rq');
  function ask(){p.querySelectorAll('[data-k]').forEach(c=>c.classList.remove('hit','miss','show'));if(qi>=qs.length){rq.innerHTML=`<b>¡Listo!</b> Respondiste las ${qs.length} preguntas. <button type="button" class="btn btn-ghost sm" id="rq-again">Repetir</button>`;p.querySelector('#rq-again').addEventListener('click',()=>{qi=0;ask();});return;}
    tries=0;rq.innerHTML=`<span class="rq-n">${qi+1}/${qs.length}</span> ${qs[qi].t} <span class="rq-fb"></span>`;}
  const next=()=>{qi++;ask();};
  p.querySelectorAll('.ro-body [data-k]').forEach(c=>{const h=()=>{if(qi>=qs.length)return;const q=qs[qi],ok=q.k.includes(c.dataset.k),fb=rq.querySelector('.rq-fb');
    if(ok){c.classList.add('hit');fb.innerHTML=`<b>Correcto.</b> ${q.e} <button type="button" class="btn sm">Siguiente</button>`;fb.querySelector('button').addEventListener('click',next);}
    else{tries++;c.classList.add('miss');setTimeout(()=>c.classList.remove('miss'),700);if(tries>=2){p.querySelectorAll('[data-k]').forEach(x=>{if(q.k.includes(x.dataset.k))x.classList.add('show');});fb.innerHTML=`Es la celda marcada. ${q.e} <button type="button" class="btn sm">Siguiente</button>`;fb.querySelector('button').addEventListener('click',next);}else fb.textContent='Esa no. Intenta otra vez.';}};
    c.addEventListener('click',h);c.addEventListener('keydown',e=>{if(e.key==='Enter')h();});});
  ask();}

/* ---- redacción guiada + conclusiones con errores típicos ----
   o = {ctx, keyData, sentence (html con {{id}}), blanks:[[id,opts,ans]], model, statements:[[txt,ok,why]]} */
function interpret(p,o){
  let html=o.sentence;o.blanks.forEach(([id,opts])=>{html=html.replace(`{{${id}}}`,`<select id="${id}" class="inl"><option value="">…</option>${opts.map(x=>`<option>${x}</option>`).join('')}</select>`);});
  p.innerHTML=`<div class="part"><h3 class="sub">A. Completa la conclusión</h3>${o.ctx?`<p class="ctx">${o.ctx}</p>`:''}${o.keyData?`<p class="note">${o.keyData}</p>`:''}<p class="build">${html}</p>
    <div class="btn-row"><button type="button" class="btn" id="b-ok">Comprobar</button></div><div id="b-fb"></div></div>
   <div class="part"><h3 class="sub">B. ¿Cuál conclusión está bien escrita?</h3><div class="opts" id="st">${shuffle(o.statements).map(s=>`<button type="button" class="opt" data-ok="${s[1]}" data-e="${esc(s[2])}">${s[0]}</button>`).join('')}</div><p class="fb" id="st-fb"></p></div>`;
  p.querySelector('#b-ok').addEventListener('click',()=>{let all=true,miss=false;o.blanks.forEach(([id,,ans])=>{const s=p.querySelector('#'+id);if(!s.value)miss=true;const ok=s.value===ans;s.classList.toggle('bad',!ok);s.classList.toggle('good',ok);if(!ok)all=false;});
    p.querySelector('#b-fb').innerHTML=all?`<p class="verdict ok"><b>Muy bien.</b> Así quedaría en un informe:</p><div class="formula" style="font-family:var(--f-body)">${o.model}</div>`:miss?'<p class="fb">Completa todos los espacios.</p>':`<p class="fb">Revisa los espacios en rojo.${o.hint?' '+o.hint:''}</p>`;});
  p.querySelectorAll('#st .opt').forEach(b=>b.addEventListener('click',()=>{const ok=b.dataset.ok==='true';p.querySelectorAll('#st .opt').forEach(x=>{x.disabled=true;if(x.dataset.ok==='true')x.classList.add('is-ok');});if(!ok)b.classList.add('is-bad');
    p.querySelector('#st-fb').innerHTML=(ok?'<strong>Correcto.</strong> ':'<strong>Esa tiene un error:</strong> ')+b.dataset.e;}));}

/* ---- pestaña de datos: descargas + pasos ---- */
function dataTab(p,o){p.innerHTML=`<p class="ctx">${o.intro||'Lleva este mismo caso al programa y comprueba que obtienes lo mismo.'}</p>
  <div class="btn-row">${o.files.map((f,i)=>`<button type="button" class="btn${i?' btn-ghost':''}" data-i="${i}">${f.label}</button>`).join('')}</div><p class="fb" id="dl-fb"></p>
  ${o.expect?`<h3 class="sub">Deberías obtener</h3><div class="readouts">${o.expect.map(e=>`<div class="ro"><span>${e[0]}</span><b>${e[1]}</b></div>`).join('')}</div>`:''}
  ${(o.guides||[]).map(g=>`<h3 class="sub">${g.t}</h3><ol class="menu-steps">${g.s.map(s=>`<li><b>${s[0]}.</b> ${s[1]}${s[2]?` <span class="en">(${s[2]})</span>`:''}</li>`).join('')}</ol>`).join('')}`;
  p.querySelectorAll('[data-i]').forEach(b=>b.addEventListener('click',()=>{const f=o.files[+b.dataset.i];const ok=downloadText(f.name,f.text());p.querySelector('#dl-fb').textContent=ok?'Archivo descargado.':'Tu navegador no permitió la descarga.';}));}

/* ---- laboratorio con pestañas y caso renovable ---- */
function lab(box,gen,tabs,note){box.innerHTML=`<div class="lab-head"><p class="note">${note||'Caso de práctica generado al azar. Todas las pestañas usan el mismo caso.'}</p><button type="button" class="btn btn-ghost sm" id="lab-new">Nuevo caso</button></div><div id="lab-t"></div>`;
  let T;const build=()=>{const C=gen();T=tabsUI(box.querySelector('#lab-t'),tabs.map(t=>({label:t.label,render:p=>t.render(p,C,cw(box))})));};
  box.querySelector('#lab-new').addEventListener('click',()=>{const cur=[...box.querySelectorAll('.ltabs button')].findIndex(b=>b.getAttribute('aria-selected')==='true');build();T.show(cur<0?0:cur);});build();}
const LAST={};function pickNew(key,arr){let i;do{i=Math.floor(Math.random()*arr.length);}while(arr.length>1&&i===LAST[key]);LAST[key]=i;return arr[i];}
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
return{steps,jasp,xout,sheet,mountSheet,readOut,interpret,dataTab,lab,pickNew,gauss,jn,jp,xn,esc};
})();
