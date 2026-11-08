/* =====================================================================
   CIMA · FUNDAMENTOS DE MÉTODOS NUMÉRICOS · Unidad 4: Sistemas de ecuaciones y matrices
   4.1 Métodos algebraicos · 4.2 Matrices · 4.3 Determinantes y Cramer
   4.4 Gauss y Gauss-Jordan · 4.5 Aplicaciones: formulación de mezclas
   ===================================================================== */
(function(){
"use strict";
const SL=(id,label,min,max,step,val)=>`<label class="ctrl" id="${id}-w"><span>${label} <output id="${id}-o"></output></span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
const V3=['x','y','z'],SUB=['₁','₂','₃'],Fi=i=>`F${SUB[i]}`;

/* ---------- Fracciones exactas ---------- */
const gI=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;};
class Fr{
  constructor(n,d=1){if(d<0){n=-n;d=-d;}const g=gI(n,d);this.n=n/g||0;this.d=d/g;}
  static of(v){if(v instanceof Fr)return v;
    if(typeof v==='number'){if(Number.isInteger(v))return new Fr(v,1);let d=1;while(!Number.isInteger(+(v*d).toFixed(9))&&d<1e6)d*=10;return new Fr(Math.round(v*d),d);}
    const s=String(v).trim().replace(/−/g,'-').replace(',','.');if(!s)return null;
    if(s.includes('/')){const[a,b]=s.split('/').map(Number);if(!Number.isFinite(a)||!Number.isFinite(b)||!b)return null;return Fr.of(a).div(Fr.of(b));}
    const x=Number(s);return Number.isFinite(x)?Fr.of(x):null;}
  add(o){o=Fr.of(o);return new Fr(this.n*o.d+o.n*this.d,this.d*o.d);}
  sub(o){return this.add(Fr.of(o).neg());}
  mul(o){o=Fr.of(o);return new Fr(this.n*o.n,this.d*o.d);}
  div(o){o=Fr.of(o);return new Fr(this.n*o.d,this.d*o.n);}
  neg(){return new Fr(-this.n,this.d);} abs(){return new Fr(Math.abs(this.n),this.d);}
  get z(){return this.n===0;} get v(){return this.n/this.d;}
  eq(o){o=Fr.of(o);return this.n===o.n&&this.d===o.d;}
  h(){return this.d===1?sg(this.n):(this.n<0?'−':'')+FR(Math.abs(this.n),this.d);}
}
const F=v=>Fr.of(v);
/* expresión a·v + b·w + … con fracciones */
function exprF(T){let s='';T.forEach(([c,v])=>{c=F(c);if(c.z)return;const a=c.abs(),t=v?(a.eq(1)?'':a.h())+v:a.h();s+=s?(c.n<0?' − ':' + ')+t:(c.n<0?'−':'')+t;});return s||'0';}
const eqF=(cs,rhs,V=V3)=>exprF(cs.map((c,i)=>[c,V[i]]))+' = '+F(rhs).h();
const eqN=(cs,rhs,V=V3)=>{let s='';cs.forEach((c,i)=>{if(!c)return;const a=Math.abs(c),t=(a===1?'':nf(a,3))+V[i];s+=s?(c<0?' − ':' + ')+t:(c<0?'−':'')+t;});return(s||'0')+' = '+nf(rhs,3);};
const cellH=v=>v instanceof Fr?v.h():typeof v==='number'?nf(v,3):v;
function matH(M,o={}){return`<span class="mat${o.aug?' aug':''}${o.cls?' '+o.cls:''}"><table>${M.map((r,i)=>`<tr>${r.map((v,j)=>{const c=[];if(o.hr===i||(o.hrs||[]).includes(i))c.push('hl');if(o.hc===j)c.push('hc');if(o.aug&&j===r.length-1)c.push('bar');if(o.ext&&j>=o.ext)c.push('ext');return`<td${c.length?` class="${c.join(' ')}"`:''}>${cellH(v)}</td>`;}).join('')}</tr>`).join('')}</table></span>`;}
const det2=M=>M[0][0]*M[1][1]-M[0][1]*M[1][0];
const det3=M=>M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1])-M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0])+M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]);
const detN=M=>M.length===1?M[0][0]:M.length===2?det2(M):det3(M);
const colRep=(M,j,b)=>M.map((r,i)=>r.map((v,k)=>k===j?b[i]:v));
/* sistema n×n al azar con solución entera */
function genSys(n,cr=3,sr=5){let A,s,d;do{A=Array.from({length:n},()=>Array.from({length:n},()=>rint(-cr,cr)));d=detN(A);}while(!d||A.some(r=>r.every(v=>!v))||A[0][0]===0);
  s=Array.from({length:n},()=>rint(-sr,sr));const b=A.map(r=>r.reduce((t,v,j)=>t+v*s[j],0));return{A,b,s,d};}

/* =============== 4.1 Métodos algebraicos =============== */
function stepsFor(meth,a1,b1,c1,a2,b2,c2){
  const S=[],D=a1.mul(b2).sub(a2.mul(b1));
  const xv=c1.mul(b2).sub(c2.mul(b1)).div(D),yv=a1.mul(c2).sub(a2.mul(c1)).div(D);
  const E1=eqF([a1,b1],c1),E2=eqF([a2,b2],c2);
  if(meth==='igu'&&(b1.z||b2.z))meth=(a1.z||a2.z)?'sus':'iguX';
  if(meth==='sus'){
    let [A1,B1,C1,A2,B2,C2,n1,n2]=[a1,b1,c1,a2,b2,c2,'(1)','(2)'];if(A1.z){[A1,B1,C1,A2,B2,C2,n1,n2]=[a2,b2,c2,a1,b1,c1,'(2)','(1)'];}
    const p=C1.div(A1),q=B1.neg().div(A1),K=A2.mul(q).add(B2),R=C2.sub(A2.mul(p));
    S.push([`Despeja <b>x</b> de la ecuación ${n1}`,`x = ${exprF([[p,''],[q,'y']])}`]);
    S.push([`Sustituye ese despeje en la ecuación ${n2}`,`${A2.eq(1)?'':A2.eq(-1)?'−':A2.h()}(${exprF([[p,''],[q,'y']])}) ${B2.n<0?'−':'+'} ${B2.abs().eq(1)?'':B2.abs().h()}y = ${C2.h()}`]);
    S.push(['Agrupa los términos en y',`${exprF([[K,'y']])} = ${R.h()}`]);
    S.push(['Despeja <b>y</b>',`y = ${R.h()} ÷ ${K.n<0?'('+K.h()+')':K.h()} = <b>${yv.h()}</b>`]);
    S.push(['Reemplaza y en el despeje de x',`x = ${p.h()} ${q.n<0?'−':'+'} ${q.abs().h()}·(${yv.h()}) = <b>${xv.h()}</b>`]);
  }else if(meth==='igu'){
    const p1=c1.div(b1),q1=a1.neg().div(b1),p2=c2.div(b2),q2=a2.neg().div(b2);
    S.push(['Despeja <b>y</b> de la ecuación (1)',`y = ${exprF([[p1,''],[q1,'x']])}`]);
    S.push(['Despeja <b>y</b> de la ecuación (2)',`y = ${exprF([[p2,''],[q2,'x']])}`]);
    S.push(['Iguala los dos despejes',`${exprF([[p1,''],[q1,'x']])} = ${exprF([[p2,''],[q2,'x']])}`]);
    S.push(['Pasa las x a un lado y los números al otro',`${exprF([[q1.sub(q2),'x']])} = ${p2.sub(p1).h()}`]);
    S.push(['Despeja <b>x</b>',`x = <b>${xv.h()}</b>`]);
    S.push(['Reemplaza x en cualquier despeje',`y = ${p1.h()} ${q1.n<0?'−':'+'} ${q1.abs().h()}·(${xv.h()}) = <b>${yv.h()}</b>`]);
  }else if(meth==='iguX'){
    const p1=c1.div(a1),q1=b1.neg().div(a1),p2=c2.div(a2),q2=b2.neg().div(a2);
    S.push(['Aquí conviene despejar <b>x</b> de ambas ecuaciones',`x = ${exprF([[p1,''],[q1,'y']])} · x = ${exprF([[p2,''],[q2,'y']])}`]);
    S.push(['Iguala los dos despejes',`${exprF([[p1,''],[q1,'y']])} = ${exprF([[p2,''],[q2,'y']])}`]);
    S.push(['Despeja <b>y</b>',`${exprF([[q1.sub(q2),'y']])} = ${p2.sub(p1).h()} → y = <b>${yv.h()}</b>`]);
    S.push(['Reemplaza y en un despeje',`x = <b>${xv.h()}</b>`]);
  }else{
    S.push([`Multiplica la ecuación (1) por ${b2.h()} y la (2) por ${b1.h()} para igualar los coeficientes de y`,`${eqF([a1.mul(b2),b1.mul(b2)],c1.mul(b2))}<br>${eqF([a2.mul(b1),b1.mul(b2)],c2.mul(b1))}`]);
    S.push(['Resta la segunda de la primera: la y se elimina',`${exprF([[D,'x']])} = ${c1.mul(b2).sub(c2.mul(b1)).h()}`]);
    S.push(['Despeja <b>x</b>',`x = <b>${xv.h()}</b>`]);
    const [A,B,C,n]=b1.z?[a2,b2,c2,'(2)']:[a1,b1,c1,'(1)'];
    S.push([`Reemplaza x en la ecuación ${n}`,`${exprF([[B,'y']])} = ${C.h()} − ${A.mul(xv).n<0?'('+A.mul(xv).h()+')':A.mul(xv).h()} → y = <b>${yv.h()}</b>`]);
  }
  const chk=(a,b,c)=>`${a.h()}·(${xv.h()}) ${b.n<0?'−':'+'} ${b.abs().h()}·(${yv.h()}) = ${a.mul(xv).add(b.mul(yv)).h()} ✓`;
  S.push(['Comprueba en las dos ecuaciones',`(1) ${chk(a1,b1)}<br>(2) ${chk(a2,b2)}`]);
  return{S,xv,yv,E1,E2};
}
function simMetodos(box){
  box.innerHTML=`<div class="part"><h3 class="sub">Resolución paso a paso</h3><p class="ctx">Escribe los coeficientes (puedes usar fracciones como 3/4) o pide un sistema al azar. Elige el método y avanza paso por paso: el resultado es el mismo con los tres.</p>
    <div class="sys-in" id="me-in">${[0,1].map(i=>`<div class="sys-row"><span class="tag">(${i+1})</span><input class="inp mc" data-k="a${i}" aria-label="a${i+1}"><span>x +</span><input class="inp mc" data-k="b${i}" aria-label="b${i+1}"><span>y =</span><input class="inp mc" data-k="c${i}" aria-label="c${i+1}"></div>`).join('')}</div>
    <div class="btn-row"><button type="button" class="btn btn-ghost" id="me-rnd">Sistema al azar</button><button type="button" class="btn btn-ghost" id="me-ctx">Ejemplo de planta</button></div>
    <p class="note" id="me-story"></p>
    <div class="seg" id="me-m"><button type="button" data-m="sus" aria-pressed="true">Sustitución</button><button type="button" data-m="igu" aria-pressed="false">Igualación</button><button type="button" data-m="eli" aria-pressed="false">Eliminación (reducción)</button></div>
    <ol class="steps" id="me-st"></ol><div class="btn-row"><button type="button" class="btn" id="me-next">Siguiente paso</button><button type="button" class="btn btn-ghost" id="me-all">Ver todos</button></div>
    <p class="verdict" id="me-v"></p><div class="chart-wrap" id="me-ch"></div></div>`;
  const s={m:'sus',shown:1,c:{a0:2,b0:3,c0:12,a1:1,b1:-1,c1:1}};const ins=[...box.querySelectorAll('#me-in input')];
  const fill=()=>ins.forEach(i=>i.value=String(s.c[i.dataset.k]).replace('-','−'));
  function rnd(){let a1,b1,a2,b2;do{a1=rnz(-5,5);b1=rnz(-5,5);a2=rnz(-5,5);b2=rnz(-5,5);}while(a1*b2-a2*b1===0);const x=rint(-5,5),y=rint(-5,5);s.c={a0:a1,b0:b1,c0:a1*x+b1*y,a1:a2,b1:b2,c1:a2*x+b2*y};$('#me-story',box).textContent='';fill();s.shown=1;draw();}
  function ctx(){const x=rint(4,12)*10,y=rint(3,10)*10,p1=pick([0.5,1]),p2=2;s.c={a0:1,b0:1,c0:x+y,a1:p1,b1:p2,c1:p1*x+p2*y};
    $('#me-story',box).innerHTML=`<b>Ejemplo:</b> una planta envasó ${x+y} botellas de jugo, unas de ${nf(p1,1)} L (x) y otras de ${p2} L (y), con ${nf(p1*x+p2*y,1)} L en total. ¿Cuántas de cada tipo?`;fill();s.shown=1;draw();}
  function draw(){
    const v={};for(const i of ins){const f=F(i.value);i.classList.toggle('bad',!f);if(!f){$('#me-v',box).innerHTML='Revisa los coeficientes: escribe números o fracciones como 3/4.';return;}v[i.dataset.k]=f;}
    const D=v.a0.mul(v.b1).sub(v.a1.mul(v.b0));const st=$('#me-st',box),vb=$('#me-v',box);
    const a=[v.a0.v,v.b0.v,v.c0.v,v.a1.v,v.b1.v,v.c1.v];
    const lines=[[a[0],a[1],a[2]],[a[3],a[4],a[5]]].map(([A,B,C],k)=>B?{f:x=>(C-A*x)/B,cls:k?'acc':''}:null).filter(Boolean),vl=[[a[0],a[1],a[2]],[a[3],a[4],a[5]]].filter(([A,B])=>!B&&A).map(([A,,C],k)=>({x:C/A,cls:'acc'}));
    if(D.z){st.innerHTML='';$('#me-next',box).disabled=$('#me-all',box).disabled=true;
      const coinc=v.a0.mul(v.c1).sub(v.a1.mul(v.c0)).z&&v.b0.mul(v.c1).sub(v.b1.mul(v.c0)).z;
      vb.className='verdict bad';vb.innerHTML=`<b>El determinante a₁b₂ − a₂b₁ vale 0.</b> ${coinc?'Las dos ecuaciones son la misma recta: <b>infinitas soluciones</b>.':'Las rectas son paralelas: el sistema <b>no tiene solución</b>.'} Ningún método llegará a un valor único.`;
      $('#me-ch',box).innerHTML=plane({W:cw($('#me-ch',box)),xmin:-10,xmax:10,ymin:-10,ymax:10,curves:lines,vlines:vl});return;}
    $('#me-next',box).disabled=$('#me-all',box).disabled=false;
    const R=stepsFor(s.m,v.a0,v.b0,v.c0,v.a1,v.b1,v.c1);s.shown=Math.min(s.shown,R.S.length);
    st.innerHTML=R.S.slice(0,s.shown).map(([t,e],i)=>`<li${i===s.shown-1?' class="new"':''}><span>${t}</span><div class="formula">${e}</div></li>`).join('');
    $('#me-next',box).disabled=s.shown>=R.S.length;
    vb.className='verdict'+(s.shown>=R.S.length?' ok':'');vb.innerHTML=s.shown>=R.S.length?`<b>Solución:</b> x = ${R.xv.h()}, y = ${R.yv.h()}. Es el punto donde se cortan las dos rectas.`:`Paso ${s.shown} de ${R.S.length}.`;
    const X=R.xv.v,Y=R.yv.v,L=Math.max(10,Math.ceil(Math.max(Math.abs(X),Math.abs(Y))*1.3/5)*5);
    $('#me-ch',box).innerHTML=plane({W:cw($('#me-ch',box)),xmin:-L,xmax:L,ymin:-L,ymax:L,curves:lines,vlines:vl,points:s.shown>=R.S.length?[{x:X,y:Y,label:`(${nf(X,2)}; ${nf(Y,2)})`}]:[]})+`<div class="legend"><span><i class="lg s0"></i>Ecuación (1)</span><span><i class="lg s1"></i>Ecuación (2)</span></div>`;
  }
  ins.forEach(i=>i.addEventListener('input',()=>{s.shown=1;$('#me-story',box).textContent='';draw();}));
  box.querySelectorAll('#me-m button').forEach(b=>b.addEventListener('click',()=>{s.m=b.dataset.m;s.shown=1;box.querySelectorAll('#me-m button').forEach(x=>x.setAttribute('aria-pressed',x===b));draw();}));
  $('#me-next',box).addEventListener('click',()=>{s.shown++;draw();});$('#me-all',box).addEventListener('click',()=>{s.shown=99;draw();});
  $('#me-rnd',box).addEventListener('click',rnd);$('#me-ctx',box).addEventListener('click',ctx);
  fill();draw();return draw;
}
function quizMetodos(){
  const qs=[];let a1,b1,a2,b2;do{a1=rnz(-5,5);b1=rnz(-5,5);a2=rnz(-5,5);b2=rnz(-5,5);}while(a1*b2-a2*b1===0);
  const x=rint(-5,5),y=rint(-5,5),c1=a1*x+b1*y,c2=a2*x+b2*y,E=`<span class="data">${eqN([a1,b1],c1)}</span> (1) y <span class="data">${eqN([a2,b2],c2)}</span> (2)`;
  const D=a1*b2-a2*b1,R=c1*b2-c2*b1;
  qs.push({type:'mc',mono:true,text:`En el sistema ${E}, multiplicas (1) por ${sg(b2)} y (2) por ${sg(b1)} y restas. ¿Qué ecuación queda?`,options:uniqOpts(`${eqN([D],R)}`,[eqN([a1*b2+a2*b1],c1*b2+c2*b1),eqN([D],c1*b1-c2*b2),eqN([a1-a2],c1-c2),eqN([-D],R)]),answer:0,
    explain:`(${sg(a1)}·${ps(b2)} − ${ps(a2)}·${ps(b1)})x = ${sg(c1)}·${ps(b2)} − ${ps(c2)}·${ps(b1)} → <b>${eqN([D],R)}</b>, así que x = ${sg(x)}.`});
  qs.push({type:'num',text:`Termina de resolver el mismo sistema: ¿cuánto vale <b>y</b>?`,answer:y,tol:0,explain:`Con x = ${sg(x)} en una de las ecuaciones se obtiene y = <b>${sg(y)}</b>.`});
  let m,a,b;do{m=rnz(-4,4);a=rnz(-4,4);b=rnz(-4,4);}while(a+b*m===0);const k=rint(-6,6),xs=rint(-5,5);const ys=m*xs+k,c=a*xs+b*ys;
  qs.push({type:'num',text:`Por <b>sustitución</b>: <span class="data">y = ${poly([[m,1],[k,0]])}</span> y <span class="data">${eqN([a,b],c)}</span>. ¿Cuánto vale x?`,answer:xs,tol:0,
    explain:`${sg(a)}x ${b<0?'−':'+'} ${Math.abs(b)}(${poly([[m,1],[k,0]])}) = ${sg(c)} → ${sg(a+b*m)}x = ${sg(c-b*k)} → x = <b>${sg(xs)}</b>.`});
  let m1,m2;do{m1=rnz(-4,4);m2=rnz(-4,4);}while(m1===m2);const xi=rint(-5,5),k1=rint(-8,8),yi=m1*xi+k1,k2=yi-m2*xi;
  qs.push({type:'num',text:`Por <b>igualación</b>: <span class="data">y = ${poly([[m1,1],[k1,0]])}</span> y <span class="data">y = ${poly([[m2,1],[k2,0]])}</span>. ¿Cuánto vale x?`,answer:xi,tol:0,
    explain:`${poly([[m1,1],[k1,0]])} = ${poly([[m2,1],[k2,0]])} → ${sg(m1-m2)}x = ${sg(k2-k1)} → x = <b>${sg(xi)}</b>.`});
  const G=genSys(3,2,4),i3=rint(0,2);
  qs.push({type:'num',text:`Resuelve el sistema de tres ecuaciones:<br><span class="data">${eqN(G.A[0],G.b[0])}</span><br><span class="data">${eqN(G.A[1],G.b[1])}</span><br><span class="data">${eqN(G.A[2],G.b[2])}</span><br>¿Cuánto vale <b>${V3[i3]}</b>?`,answer:G.s[i3],tol:0,
    explain:`Eliminando una variable a la vez (o con Gauss, tema 4.4) se obtiene x = ${sg(G.s[0])}, y = ${sg(G.s[1])}, z = ${sg(G.s[2])}. Así, ${V3[i3]} = <b>${sg(G.s[i3])}</b>.`});
  const nx=rint(4,15)*10,ny=rint(3,12)*10,N=nx+ny,L=0.5*nx+ny;
  qs.push({type:'num',text:`Una planta envasó ${N} botellas de jugo: unas de 0,5 L y otras de 1 L, con un total de ${nf(L,1)} L. ¿Cuántas botellas de <b>0,5 L</b> hubo?`,answer:nx,tol:0,
    explain:`x + y = ${N} y 0,5x + y = ${nf(L,1)}. Restando: 0,5x = ${nf(N-L,1)} → x = <b>${nx}</b> (y = ${ny}).`});
  return qs;
}

/* =============== 4.2 Matrices =============== */
const TYPES={fila:'Matriz fila',col:'Matriz columna',id:'Identidad',diag:'Diagonal',sup:'Triangular superior',inf:'Triangular inferior',sim:'Simétrica'};
const TYPEWHY={fila:'tiene una sola fila (1 × n).',col:'tiene una sola columna (m × 1).',id:'es cuadrada, con unos en la diagonal principal y ceros fuera de ella.',diag:'solo tiene números distintos de cero en la diagonal principal.',sup:'todo lo que está debajo de la diagonal principal es cero.',inf:'todo lo que está encima de la diagonal principal es cero.',sim:'es igual a su transpuesta: a<sub>ij</sub> = a<sub>ji</sub>.'};
function genType(t){const r=()=>rnz(-5,5),n=3;
  if(t==='fila')return[[r(),r(),r()]];if(t==='col')return[[r()],[r()],[r()]];
  if(t==='id'){const k=pick([2,3]);return Array.from({length:k},(_,i)=>Array.from({length:k},(_,j)=>i===j?1:0));}
  const M=Array.from({length:n},()=>Array(n).fill(0));
  if(t==='diag'){for(let i=0;i<n;i++)M[i][i]=r();if(M.every((row,i)=>row[i]===1))M[0][0]=2;return M;}
  if(t==='sup'||t==='inf'){for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(t==='sup'?j>=i:j<=i)M[i][j]=r();return M;}
  for(let i=0;i<n;i++)for(let j=i;j<n;j++){M[i][j]=M[j][i]=r();}if(M[0][1]===M[1][0]&&M[0][2]===M[2][0]&&M[0][1]===M[1][2]&&M[0][0]===M[1][1])M[0][1]=M[1][0]=M[0][1]+1;return M;}
const MOPS={sum:'A + B',dif:'A − B',k:'k · A',mul:'A · B',tr:'Aᵀ'};
function simMatrices(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. Calculadora de matrices</h3><p class="ctx">Ajusta el tamaño, escribe los números y elige la operación. En el producto, toca una casilla del resultado para ver de dónde sale.</p>
    <div class="mat-pair"><div class="mat-ed" id="mA"></div><div class="mat-ed" id="mB"></div></div>
    <div class="btn-row"><button type="button" class="btn btn-ghost" id="mt-rec">Ejemplo: receta × costos</button><button type="button" class="btn btn-ghost" id="mt-rnd">Números al azar</button></div><p class="note" id="mt-story"></p>
    <div class="seg" id="mt-op">${Object.entries(MOPS).map(([k,v],i)=>`<button type="button" data-o="${k}" aria-pressed="${k==='mul'}">${v}</button>`).join('')}</div>
    <div class="ctrls" id="mt-kw" hidden>${SL('mt-k','k =',-5,5,0.5,2)}</div>
    <div class="mat-out" id="mt-out"></div><div class="formula" id="mt-why"></div></div>
    <div class="part"><h3 class="sub">B. ¿Qué tipo de matriz es?</h3><p class="ctx">Elige el nombre <b>más específico</b>.</p><div class="mat-show" id="ty-m"></div>
    <div class="bins">${Object.entries(TYPES).map(([k,v])=>`<button type="button" class="bin" data-k="${k}"><b style="font-size:14.5px">${v}</b></button>`).join('')}</div>
    <p class="fb" id="ty-fb" aria-live="polite"></p><div class="btn-row"><button type="button" class="btn" id="ty-new">Otra matriz</button></div></div>`;
  const s={A:[[2,1,0],[1,3,-1]],B:[[1,2],[0,1],[4,-2]],o:'mul',k:2,sel:[0,0]};
  function editor(id,name){const M=s[name],r=M.length,c=M[0].length;
    $('#'+id,box).innerHTML=`<div class="mat-ed-h"><b>${name}</b> <select data-d="r" aria-label="Filas de ${name}">${[1,2,3].map(n=>`<option${n===r?' selected':''}>${n}</option>`).join('')}</select> × <select data-d="c" aria-label="Columnas de ${name}">${[1,2,3].map(n=>`<option${n===c?' selected':''}>${n}</option>`).join('')}</select></div>
      <div class="mgrid" style="grid-template-columns:repeat(${c},minmax(0,64px))">${M.map((row,i)=>row.map((v,j)=>`<input class="inp mc" inputmode="decimal" data-i="${i}" data-j="${j}" value="${String(v).replace('-','−')}" aria-label="${name} fila ${i+1} columna ${j+1}">`).join('')).join('')}</div>`;
    $('#'+id,box).querySelectorAll('select').forEach(sl=>sl.addEventListener('change',()=>{const R=+$('#'+id,box).querySelector('[data-d=r]').value,C=+$('#'+id,box).querySelector('[data-d=c]').value;
      s[name]=Array.from({length:R},(_,i)=>Array.from({length:C},(_,j)=>(M[i]&&M[i][j]!==undefined)?M[i][j]:0));editor(id,name);calc();}));
    $('#'+id,box).querySelectorAll('input').forEach(inp=>inp.addEventListener('input',()=>{const v=parseNum(inp.value);inp.classList.toggle('bad',!Number.isFinite(v));if(Number.isFinite(v)){s[name][+inp.dataset.i][+inp.dataset.j]=v;calc();}}));}
  function calc(){
    const A=s.A,B=s.B,o=s.o,out=$('#mt-out',box),why=$('#mt-why',box);$('#mt-kw',box).hidden=o!=='k';$('#mt-k-o',box).textContent=nf(s.k,1);
    const dim=M=>`${M.length} × ${M[0].length}`;let C=null,msg='';
    if(o==='sum'||o==='dif'){if(dim(A)!==dim(B)){msg=`No se puede: para ${o==='sum'?'sumar':'restar'}, A y B deben tener el mismo tamaño (A es ${dim(A)} y B es ${dim(B)}).`;}
      else{C=A.map((r,i)=>r.map((v,j)=>o==='sum'?v+B[i][j]:v-B[i][j]));msg=`Se ${o==='sum'?'suman':'restan'} elemento por elemento: c<sub>ij</sub> = a<sub>ij</sub> ${o==='sum'?'+':'−'} b<sub>ij</sub>. Por ejemplo, c₁₁ = ${nf(A[0][0],3)} ${o==='sum'?'+':'−'} ${ps(nf(B[0][0],3))} = ${nf(C[0][0],3)}.`;}}
    else if(o==='k'){C=A.map(r=>r.map(v=>s.k*v));msg=`Cada elemento de A se multiplica por k = ${nf(s.k,1)}.`;}
    else if(o==='tr'){C=A[0].map((_,j)=>A.map(r=>r[j]));msg=`Las filas de A pasan a ser columnas: A es ${dim(A)} y Aᵀ es ${dim(C)}.`;}
    else{if(A[0].length!==B.length){msg=`No se puede: para A · B, las <b>columnas de A</b> (${A[0].length}) deben ser iguales a las <b>filas de B</b> (${B.length}).`;}
      else{C=A.map(r=>B[0].map((_,j)=>r.reduce((t,v,k)=>t+v*B[k][j],0)));let[i,j]=s.sel;if(i>=C.length||j>=C[0].length){i=j=0;s.sel=[0,0];}
        const terms=A[i].map((v,k)=>`${ps(nf(v,3))}·${ps(nf(B[k][j],3))}`).join(' + ');
        out.innerHTML=`${matH(A,{hr:i})}<span class="op">·</span>${matH(B,{hc:j})}<span class="op">=</span><span class="mat-click">${matH(C)}</span>`;
        out.querySelectorAll('.mat-click td').forEach((td,n)=>{const ci=Math.floor(n/C[0].length),cj=n%C[0].length;if(ci===i&&cj===j)td.classList.add('sel');td.tabIndex=0;td.setAttribute('role','button');td.addEventListener('click',()=>{s.sel=[ci,cj];calc();});td.addEventListener('keydown',e=>{if(e.key==='Enter'){s.sel=[ci,cj];calc();}});});
        why.innerHTML=`A (${dim(A)}) · B (${dim(B)}) da una matriz de ${dim(C)}.<br>c<sub>${i+1}${j+1}</sub> = fila ${i+1} de A · columna ${j+1} de B = ${terms} = <b>${nf(C[i][j],3)}</b>`;return;}}
    out.innerHTML=C?`${o==='tr'?matH(A)+'<span class="op">→</span>':''}${matH(C)}`:'';why.innerHTML=msg;out.classList.toggle('empty',!C);
  }
  box.querySelectorAll('#mt-op button').forEach(b=>b.addEventListener('click',()=>{s.o=b.dataset.o;box.querySelectorAll('#mt-op button').forEach(x=>x.setAttribute('aria-pressed',x===b));calc();}));
  $('#mt-k',box).addEventListener('input',e=>{s.k=+e.target.value;calc();});
  $('#mt-rec',box).addEventListener('click',()=>{s.A=[[6,4,0.1],[5,3,0.2]];s.B=[[1.2],[0.9],[15]];s.o='mul';box.querySelectorAll('#mt-op button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.o==='mul'));
    $('#mt-story',box).innerHTML='<b>A</b>: kg de fruta, azúcar y pectina por lote de mermelada (fila 1) y de jalea (fila 2). <b>B</b>: precio por kg de cada ingrediente (USD). <b>A · B</b> = costo de ingredientes de cada lote.';editor('mA','A');editor('mB','B');calc();});
  $('#mt-rnd',box).addEventListener('click',()=>{s.A=s.A.map(r=>r.map(()=>rint(-5,5)));s.B=s.B.map(r=>r.map(()=>rint(-5,5)));$('#mt-story',box).textContent='';editor('mA','A');editor('mB','B');calc();});
  // tipos
  let T;const bins=[...box.querySelectorAll('.bin')];
  function newT(){const t=pick(Object.keys(TYPES));T={t,M:genType(t)};$('#ty-m',box).innerHTML=matH(T.M);bins.forEach(b=>{b.disabled=false;b.classList.remove('is-ok','is-bad');});$('#ty-fb',box).textContent='¿Cómo se llama esta matriz?';}
  bins.forEach(b=>b.addEventListener('click',()=>{const ok=b.dataset.k===T.t;b.classList.add(ok?'is-ok':'is-bad');if(!ok)bins.find(x=>x.dataset.k===T.t).classList.add('is-ok');bins.forEach(x=>x.disabled=true);
    $('#ty-fb',box).innerHTML=`${ok?'<strong>Correcto.</strong>':'<strong>No exactamente.</strong>'} Es <b>${TYPES[T.t].toLowerCase()}</b>: ${TYPEWHY[T.t]}${T.t==='id'?' (También es diagonal y simétrica, pero “identidad” es el nombre más específico).':''}`;}));
  $('#ty-new',box).addEventListener('click',newT);
  editor('mA','A');editor('mB','B');calc();newT();return calc;
}
function quizMatrices(){
  const qs=[],R=()=>rint(-5,5);
  const A=[[R(),R()],[R(),R()]],B=[[R(),R()],[R(),R()]],i=rint(0,1),j=rint(0,1);
  qs.push({type:'num',text:`Si A = ${matH(A)} y B = ${matH(B)}, ¿cuánto vale el elemento c<sub>${i+1}${j+1}</sub> de A − B?`,answer:A[i][j]-B[i][j],tol:0,explain:`Se resta elemento por elemento: ${sg(A[i][j])} − ${ps(B[i][j])} = <b>${sg(A[i][j]-B[i][j])}</b>.`});
  const P=[[R(),R(),R()],[R(),R(),R()]],Q=[[R(),R()],[R(),R()],[R(),R()]],pi=rint(0,1),pj=rint(0,1),val=P[pi].reduce((t,v,k)=>t+v*Q[k][pj],0);
  qs.push({type:'num',text:`Con A = ${matH(P)} y B = ${matH(Q)}, calcula el elemento c<sub>${pi+1}${pj+1}</sub> de A · B.`,answer:val,tol:0,
    explain:`Fila ${pi+1} de A por columna ${pj+1} de B: ${P[pi].map((v,k)=>`${ps(v)}·${ps(Q[k][pj])}`).join(' + ')} = <b>${sg(val)}</b>.`});
  const m=rint(2,4),n=rint(2,5),p=rint(1,4);
  qs.push({type:'mc',text:`Si A es de ${m} × ${n} y B es de ${n} × ${p}, ¿de qué tamaño es A · B?`,options:uniqOpts(`${m} × ${p}`,[`${n} × ${n}`,`${p} × ${m}`,`${m} × ${n}`,'No se puede multiplicar']),answer:0,
    explain:`Las columnas de A (${n}) coinciden con las filas de B, así que se puede. El resultado tiene las filas de A y las columnas de B: <b>${m} × ${p}</b>.`});
  const r1=rint(2,3),c1=rint(2,3);let r2;do{r2=rint(1,3);}while(r2===c1);
  qs.push({type:'mc',keepOrder:true,text:`A es de ${r1} × ${c1} y B es de ${r2} × ${rint(2,3)}. ¿Se puede calcular A · B?`,options:['Sí','No'],answer:1,
    explain:`No: las columnas de A (${c1}) deben ser iguales a las filas de B (${r2}).`});
  const T=[[R(),R(),R()],[R(),R(),R()]],ti=rint(0,2),tj=rint(0,1);
  qs.push({type:'num',text:`Si A = ${matH(T)}, ¿cuál es el elemento de la fila ${ti+1}, columna ${tj+1} de <b>Aᵀ</b>?`,answer:T[tj][ti],tol:0,explain:`En la transpuesta, el elemento (${ti+1}, ${tj+1}) de Aᵀ es el elemento (${tj+1}, ${ti+1}) de A: <b>${sg(T[tj][ti])}</b>.`});
  const kg=[rint(3,8),rint(2,6),rint(1,3)],pr=[pick([1.2,1.5,2]),pick([0.8,0.9,1]),pick([3,4,5])],tot=kg.reduce((t,v,k)=>t+v*pr[k],0);
  qs.push({type:'num',text:`Un lote de salsa usa ${matH([kg])} kg de tomate, cebolla y ají. Los precios por kg son ${matH(pr.map(v=>[v]))} USD. ¿Cuánto cuestan los ingredientes del lote (fila × columna)?`,unit:'USD',answer:round(tot,2),tol:0.011,
    explain:`${kg.map((v,k)=>`${v}·${nf(pr[k],2)}`).join(' + ')} = <b>${nf(tot,2)} USD</b>.`});
  return qs;
}

/* =============== 4.3 Determinantes y Cramer =============== */
function simDet(box){
  box.innerHTML=`<div class="part"><h3 class="sub">A. El determinante 2 × 2 es un área</h3><p class="ctx">Las columnas de la matriz son dos flechas. El paralelogramo que forman tiene área |det|. Si el determinante es 0, las flechas quedan alineadas y el área desaparece.</p>
    <div class="ctrls">${SL('d2a','a',-5,5,1,3)}${SL('d2b','b',-5,5,1,1)}${SL('d2c','c',-5,5,1,1)}${SL('d2d','d',-5,5,1,2)}</div>
    <div class="row-math" id="d2-m"></div><div class="chart-wrap" id="d2-ch"></div></div>
    <div class="part"><h3 class="sub">B. Determinante 3 × 3 con la regla de Sarrus</h3><p class="ctx">Se copian las dos primeras columnas a la derecha. Se suman los productos de las tres diagonales que bajan y se restan los de las tres que suben.</p>
    <div class="btn-row"><button type="button" class="btn btn-ghost" id="d3-new">Otra matriz</button></div><div class="row-math" id="d3-m"></div><div class="sarrus" id="d3-l"></div></div>
    <div class="part"><h3 class="sub">C. Regla de Cramer</h3><p class="ctx">Cada incógnita es un cociente de determinantes: en el numerador se reemplaza la columna de esa variable por los términos independientes.</p>
    <div class="seg" id="cr-n"><button type="button" data-n="2" aria-pressed="true">2 ecuaciones</button><button type="button" data-n="3" aria-pressed="false">3 ecuaciones</button></div>
    <div class="btn-row"><button type="button" class="btn btn-ghost" id="cr-new">Otro sistema</button></div><div class="formula" id="cr-sys"></div><div class="cramer" id="cr-out"></div></div>`;
  const s={a:3,b:1,c:1,d:2,n:2};
  function d2(){['a','b','c','d'].forEach(k=>$(`#d2${k}-o`,box).textContent=s[k]);const M=[[s.a,s.b],[s.c,s.d]],D=det2(M);
    $('#d2-m',box).innerHTML=`<span>det</span>${matH(M)}<span>= ${sg(s.a)}·${ps(s.d)} − ${ps(s.b)}·${ps(s.c)} = <b>${sg(D)}</b></span>`;
    const pts=[[0,0],[s.a,s.c],[s.a+s.b,s.c+s.d],[s.b,s.d]],L=Math.max(6,...pts.flat().map(Math.abs))+1;
    $('#d2-ch',box).innerHTML=plane({W:cw($('#d2-ch',box)),xmin:-L,xmax:L,ymin:-L,ymax:L,polys:[{pts,cls:D?'data':''}],lines:[{x1:0,y1:0,x2:s.a,y2:s.c},{x1:0,y1:0,x2:s.b,y2:s.d,cls:'acc'}],points:[{x:s.a,y:s.c,cls:'data',label:`(${sg(s.a)}; ${sg(s.c)})`},{x:s.b,y:s.d,label:`(${sg(s.b)}; ${sg(s.d)})`}]})
      +`<p class="verdict ${D?'ok':'bad'}">${D?`Área del paralelogramo = |${sg(D)}| = <b>${Math.abs(D)}</b>. ${D<0?'El signo negativo indica que las flechas están en orden horario.':''}`:'<b>det = 0:</b> las columnas son proporcionales, el paralelogramo se aplasta. Un sistema con esta matriz no tiene solución única.'}</p>`;}
  let M3;
  function d3(){const M=M3,E=M.map(r=>[...r,r[0],r[1]]);
    const dn=[0,1,2].map(k=>[0,1,2].map(i=>E[i][i+k])),up=[0,1,2].map(k=>[0,1,2].map(i=>E[2-i][i+k]));
    const P=a=>a.reduce((t,v)=>t*v,1),sp=dn.reduce((t,a)=>t+P(a),0),su=up.reduce((t,a)=>t+P(a),0);
    $('#d3-m',box).innerHTML=`<span>det</span>${matH(M)}<span>→</span>${matH(E,{ext:3})}`;
    $('#d3-l',box).innerHTML=`<div><b class="pos">Diagonales que bajan (+)</b>${dn.map(a=>`<span>${a.map(ps).join('·')} = ${sg(P(a))}</span>`).join('')}<span class="tot">Suma: ${sg(sp)}</span></div>
      <div><b class="neg">Diagonales que suben (−)</b>${up.map(a=>`<span>${a.map(ps).join('·')} = ${sg(P(a))}</span>`).join('')}<span class="tot">Suma: ${sg(su)}</span></div>
      <div class="res">det = ${sg(sp)} − ${ps(su)} = <b>${sg(sp-su)}</b></div>`;}
  let CR;
  function cr(){const n=s.n,{A,b,s:x,d}=CR,Vn=V3.slice(0,n);
    $('#cr-sys',box).innerHTML=A.map((r,i)=>eqN(r,b[i],Vn)).join('<br>');
    const Aug=A.map(r=>[...r]);
    $('#cr-out',box).innerHTML=`<div class="cr-item"><span>D =</span>${matH(Aug)}<span>= <b>${sg(d)}</b></span></div>`+Vn.map((v,j)=>{const Mj=colRep(A,j,b),Dj=detN(Mj);return`<div class="cr-item"><span>D<sub>${v}</sub> =</span>${matH(Mj,{hc:j})}<span>= ${sg(Dj)}</span><span class="res">${v} = ${FR('D<sub>'+v+'</sub>','D')} = ${FR(sg(Dj),sg(d))} = <b>${sg(x[j])}</b></span></div>`;}).join('');}
  ['a','b','c','d'].forEach(k=>$('#d2'+k,box).addEventListener('input',e=>{s[k]=+e.target.value;d2();}));
  const newM3=()=>{M3=Array.from({length:3},()=>Array.from({length:3},()=>rint(-4,4)));d3();};
  const newCR=()=>{CR=genSys(s.n,4,6);cr();};
  $('#d3-new',box).addEventListener('click',newM3);$('#cr-new',box).addEventListener('click',newCR);
  box.querySelectorAll('#cr-n button').forEach(b=>b.addEventListener('click',()=>{s.n=+b.dataset.n;box.querySelectorAll('#cr-n button').forEach(x=>x.setAttribute('aria-pressed',x===b));newCR();}));
  d2();M3=[[2,1,3],[0,-1,4],[1,2,1]];d3();newCR();return d2;
}
function quizDet(){
  const qs=[],R=(a=5)=>rint(-a,a);
  const A=[[R(),R()],[R(),R()]];qs.push({type:'num',text:`Calcula det ${matH(A)}`,answer:det2(A),tol:0,explain:`ad − bc = ${sg(A[0][0])}·${ps(A[1][1])} − ${ps(A[0][1])}·${ps(A[1][0])} = <b>${sg(det2(A))}</b>.`});
  const B=Array.from({length:3},()=>Array.from({length:3},()=>R(3)));qs.push({type:'num',text:`Calcula el determinante de ${matH(B)} (usa Sarrus o cofactores).`,answer:det3(B),tol:0,explain:`Sumando los productos de las diagonales que bajan y restando los de las que suben se obtiene <b>${sg(det3(B))}</b>.`});
  const T=[[rnz(-4,4),R(),R()],[0,rnz(-4,4),R()],[0,0,rnz(-4,4)]];const dt=T[0][0]*T[1][1]*T[2][2];
  qs.push({type:'num',text:`¿Cuánto vale el determinante de la matriz triangular ${matH(T)}?`,answer:dt,tol:0,explain:`En una matriz triangular, el determinante es el producto de la diagonal: ${sg(T[0][0])}·${ps(T[1][1])}·${ps(T[2][2])} = <b>${sg(dt)}</b>.`});
  const G=genSys(2,5,6),v=rint(0,1),Dv=det2(colRep(G.A,v,G.b));
  qs.push({type:'num',text:`Usa Cramer en <span class="data">${eqN(G.A[0],G.b[0])}</span> y <span class="data">${eqN(G.A[1],G.b[1])}</span>. ¿Cuánto vale <b>${V3[v]}</b>?`,answer:G.s[v],tol:0,
    explain:`D = ${sg(G.d)} y D<sub>${V3[v]}</sub> = ${sg(Dv)}, así que ${V3[v]} = ${sg(Dv)} / ${ps(G.d)} = <b>${sg(G.s[v])}</b>.`});
  qs.push({type:'mc',text:'Para calcular D<sub>y</sub> en la regla de Cramer…',options:['Se reemplaza la columna de y por la de términos independientes','Se reemplaza la fila 2 por los términos independientes','Se elimina la columna de y','Se multiplica D por y'],answer:0,explain:'D<sub>y</sub> es el determinante de la matriz de coeficientes con la <b>columna de y</b> reemplazada por la columna de términos independientes.'});
  qs.push({type:'mc',text:'Si el determinante D de la matriz de coeficientes vale 0, entonces…',options:['El sistema no tiene solución única y Cramer no se puede usar','La solución es x = y = 0','Hay exactamente una solución','Hay que cambiar el signo de D'],answer:0,explain:'Con D = 0 habría que dividir para cero: el sistema tiene <b>ninguna o infinitas</b> soluciones, nunca una sola.'});
  return qs;
}

/* =============== 4.4 Gauss y Gauss-Jordan =============== */
const cloneM=M=>M.map(r=>r.map(v=>F(v)));
function applyOp(M,op){const N=cloneM(M);if(op.t==='sw'){[N[op.a],N[op.b]]=[N[op.b],N[op.a]];}else if(op.t==='sc'){N[op.a]=N[op.a].map(v=>v.mul(op.k));}else{N[op.a]=N[op.a].map((v,j)=>v.add(op.k.mul(N[op.b][j])));}return N;}
function opText(op){if(op.t==='sw')return`${Fi(op.a)} ↔ ${Fi(op.b)}`;if(op.t==='sc')return`${Fi(op.a)} → ${op.k.eq(-1)?'−':op.k.h()+'·'}${Fi(op.a)}`;
  const a=op.k.abs();return`${Fi(op.a)} → ${Fi(op.a)} ${op.k.n<0?'−':'+'} ${a.eq(1)?'':a.h()+'·'}${Fi(op.b)}`;}
function opWhy(op,M,gj){if(op.t==='sw')return'El pivote no puede ser cero: se intercambian filas.';if(op.t==='sc')return'Se divide la fila para que el pivote sea 1.';
  return gj?'Se hace cero el elemento de esa columna (arriba o abajo del pivote).':'Se hace cero el elemento debajo del pivote.';}
function nextOp(M,gj){const R=M.length,C=M[0].length-1;let r=0;
  for(let c=0;c<C&&r<R;c++){let p=-1;for(let i=r;i<R;i++)if(!M[i][c].z){p=i;break;}if(p<0)continue;
    if(p!==r)return{t:'sw',a:r,b:p};if(gj&&!M[r][c].eq(1))return{t:'sc',a:r,k:F(1).div(M[r][c])};
    for(let i=0;i<R;i++){if(i===r||(!gj&&i<r))continue;if(!M[i][c].z)return{t:'ad',a:i,b:r,k:M[i][c].div(M[r][c]).neg()};}r++;}
  return null;}
function rref(M){let N=cloneM(M),op,g=0;while((op=nextOp(N,true))&&g++<60)N=applyOp(N,op);return N;}
function analyze(M){const E=rref(M),R=E.length,C=E[0].length-1;
  if(E.some(r=>r.slice(0,C).every(v=>v.z)&&!r[C].z))return{k:'none'};
  const piv=[];E.forEach((r,i)=>{const c=r.slice(0,C).findIndex(v=>!v.z);if(c>=0)piv.push([i,c]);});
  if(piv.length===C)return{k:'one',sol:piv.map(([i])=>E[i][C])};
  const pc=piv.map(p=>p[1]),free=V3.slice(0,C).filter((_,j)=>!pc.includes(j));
  return{k:'inf',free,expr:piv.map(([i,c])=>`${V3[c]} = ${exprF([[E[i][C],''],...E[i].slice(0,C).map((v,j)=>j!==c&&!pc.includes(j)?[v.neg(),V3[j]]:[0,''])])}`)};}
function backSub(M){const n=M.length,val=[],out=[];for(let i=n-1;i>=0;i--){let s=F(0);for(let j=i+1;j<n;j++)s=s.add(M[i][j].mul(val[j]));val[i]=M[i][n].sub(s).div(M[i][i]);
  out.push(`Fila ${i+1}: ${eqF(M[i].slice(0,n),M[i][n])}${i<n-1?` → con ${V3.slice(i+1,n).map((v,k)=>`${v} = ${val[i+1+k].h()}`).join(', ')}`:''} → <b>${V3[i]} = ${val[i].h()}</b>`);}return out;}
function genCase(k){let G;do{G=genSys(3,3,4);}while(G.A.some(r=>r.every(v=>!v)));let M=G.A.map((r,i)=>[...r,G.b[i]]);
  if(k!=='one'){const m=pick([1,2,-1]);M[2]=M[0].map((v,j)=>v+m*M[1][j]);if(k==='none')M[2][3]+=pick([1,2,3,-2]);if(M[2].slice(0,3).every(v=>!v))return genCase(k);}
  return M.map(r=>r.map(F));}
function simGauss(box){
  box.innerHTML=`<div class="part"><h3 class="sub">Matriz aumentada paso a paso</h3><p class="ctx">Con <b>Gauss</b> se hacen ceros debajo de la diagonal y se termina con sustitución hacia atrás. Con <b>Gauss-Jordan</b> se sigue hasta tener la matriz identidad y la solución aparece sola. Usa el paso automático o haz tus propias operaciones.</p>
    <div class="seg" id="ga-m"><button type="button" data-m="g" aria-pressed="true">Gauss</button><button type="button" data-m="gj" aria-pressed="false">Gauss-Jordan</button></div>
    <div class="btn-row"><button type="button" class="btn btn-ghost" data-c="one">Sistema nuevo</button><button type="button" class="btn btn-ghost" data-c="none">Caso sin solución</button><button type="button" class="btn btn-ghost" data-c="inf">Caso infinitas soluciones</button></div>
    <div class="formula" id="ga-sys"></div><div class="mat-show big" id="ga-mat"></div><p class="note center" id="ga-last"></p>
    <div class="btn-row center"><button type="button" class="btn" id="ga-next">Paso siguiente</button><button type="button" class="btn btn-ghost" id="ga-all">Resolver todo</button><button type="button" class="btn btn-ghost" id="ga-undo">Deshacer</button><button type="button" class="btn btn-ghost" id="ga-reset">Reiniciar</button></div>
    <details class="manual"><summary>Hacer mis propias operaciones de fila</summary><div class="ctrls">
      <label class="ctrl"><span>Operación</span><select id="mo-t"><option value="ad">Fᵢ → Fᵢ + k·Fⱼ</option><option value="sc">Fᵢ → k·Fᵢ</option><option value="sw">Fᵢ ↔ Fⱼ</option></select></label>
      <label class="ctrl"><span>Fila i</span><select id="mo-a"><option value="0">F₁</option><option value="1" selected>F₂</option><option value="2">F₃</option></select></label>
      <label class="ctrl" id="mo-bw"><span>Fila j</span><select id="mo-b"><option value="0">F₁</option><option value="1">F₂</option><option value="2">F₃</option></select></label>
      <label class="ctrl" id="mo-kw"><span>k (ej. −2 o 1/3)</span><input class="inp" id="mo-k" value="−1"></label></div>
      <div class="btn-row"><button type="button" class="btn" id="mo-go">Aplicar</button></div><p class="fb" id="mo-fb"></p></details>
    <ol class="oplog" id="ga-log"></ol><div id="ga-res"></div></div>`;
  const s={gj:false,M0:null,H:[],log:[]};const cur=()=>s.H[s.H.length-1];
  function load(k){s.M0=genCase(k);s.H=[s.M0];s.log=[];draw();}
  function push(op,auto){s.H.push(applyOp(cur(),op));s.log.push({op,why:auto?opWhy(op,cur(),s.gj):'Operación manual.'});}
  function draw(){
    const M=cur(),A0=s.M0;$('#ga-sys',box).innerHTML=A0.map(r=>eqF(r.slice(0,3),r[3])).join('<br>');
    const last=s.log[s.log.length-1];$('#ga-mat',box).innerHTML=matH(M,{aug:true,hr:last?last.op.a:undefined});
    $('#ga-last',box).innerHTML=last?`<b>${opText(last.op)}</b> · ${last.why}`:'Matriz aumentada [A | b] del sistema.';
    $('#ga-log',box).innerHTML=s.log.map(l=>`<li>${opText(l.op)}</li>`).join('');
    const nx=nextOp(M,s.gj);$('#ga-next',box).disabled=$('#ga-all',box).disabled=!nx;$('#ga-undo',box).disabled=s.H.length<2;
    const res=$('#ga-res',box);if(nx){res.innerHTML='';return;}
    const an=analyze(M);let h='';
    if(an.k==='none')h=`<p class="verdict bad"><b>Sin solución.</b> Apareció una fila del tipo [0 0 0 | c] con c ≠ 0: diría 0 = ${M.find(r=>r.slice(0,3).every(v=>v.z)&&!r[3].z)[3].h()}, lo cual es imposible. El sistema es <b>incompatible</b>.</p>`;
    else if(an.k==='inf')h=`<p class="verdict"><b>Infinitas soluciones.</b> Quedó una fila de ceros [0 0 0 | 0]: hay menos ecuaciones útiles que incógnitas. ${an.free.join(', ')} es una variable <b>libre</b> (puede tomar cualquier valor):</p><div class="formula">${an.expr.join('<br>')}</div>`;
    else if(s.gj)h=`<p class="verdict ok"><b>Matriz identidad lograda.</b> La última columna es la solución: ${an.sol.map((v,i)=>`${V3[i]} = ${v.h()}`).join(', ')}.</p>`;
    else h=`<p class="verdict ok"><b>Forma escalonada lograda.</b> Ahora se resuelve de abajo hacia arriba (sustitución hacia atrás):</p><div class="formula">${backSub(M).join('<br>')}</div>`;
    res.innerHTML=h;
  }
  $('#ga-next',box).addEventListener('click',()=>{const op=nextOp(cur(),s.gj);if(op){push(op,true);draw();}});
  $('#ga-all',box).addEventListener('click',()=>{let op,g=0;while((op=nextOp(cur(),s.gj))&&g++<60)push(op,true);draw();});
  $('#ga-undo',box).addEventListener('click',()=>{if(s.H.length>1){s.H.pop();s.log.pop();draw();}});
  $('#ga-reset',box).addEventListener('click',()=>{s.H=[s.M0];s.log=[];draw();});
  box.querySelectorAll('[data-c]').forEach(b=>b.addEventListener('click',()=>load(b.dataset.c)));
  box.querySelectorAll('#ga-m button').forEach(b=>b.addEventListener('click',()=>{s.gj=b.dataset.m==='gj';box.querySelectorAll('#ga-m button').forEach(x=>x.setAttribute('aria-pressed',x===b));draw();}));
  const mt=$('#mo-t',box);const vis=()=>{$('#mo-bw',box).hidden=mt.value==='sc';$('#mo-kw',box).hidden=mt.value==='sw';};mt.addEventListener('change',vis);
  $('#mo-go',box).addEventListener('click',()=>{const t=mt.value,a=+$('#mo-a',box).value,b=+$('#mo-b',box).value,fb=$('#mo-fb',box),k=F($('#mo-k',box).value);
    if(t!=='sc'&&a===b){fb.textContent='Elige dos filas distintas.';return;}if(t!=='sw'&&!k){fb.textContent='Escribe k como número o fracción (ej. −2 o 1/3).';return;}if(t==='sc'&&k.z){fb.textContent='No se puede multiplicar una fila por 0: se perdería una ecuación.';return;}
    fb.textContent='';push({t,a,b,k},false);draw();});
  vis();load('one');return null;
}
function quizGauss(){
  const qs=[];const a=rnz(-3,3),m=rnz(-3,3),r1=[a,rint(-4,4),rint(-4,4),rint(-6,6)],r2=[m*a,rint(-4,4),rint(-4,4),rint(-6,6)];
  qs.push({type:'num',text:`En la matriz aumentada ${matH([r1,r2,[rint(-3,3),rint(-3,3),rnz(-3,3),rint(-6,6)]],{aug:true})} quieres hacer cero el primer elemento de la fila 2 con <b>F₂ → F₂ + k·F₁</b>. ¿Cuánto vale k?`,answer:-m,tol:0,
    explain:`Se necesita ${sg(m*a)} + k·${ps(a)} = 0 → k = <b>${sg(-m)}</b>.`});
  const j=rint(1,3),kk=rnz(-3,3);
  qs.push({type:'num',text:`Con esas mismas filas, aplica <b>F₂ → F₂ ${kk<0?'−':'+'} ${Math.abs(kk)}·F₁</b>. ¿Qué número queda en la columna ${j+1} de la nueva fila 2?`,answer:r2[j]+kk*r1[j],tol:0,
    explain:`${sg(r2[j])} ${kk<0?'−':'+'} ${Math.abs(kk)}·${ps(r1[j])} = <b>${sg(r2[j]+kk*r1[j])}</b>.`});
  const x=rint(-4,4),y=rint(-4,4),z=rint(-4,4),u=[[rnz(-3,3),rint(-3,3),rint(-3,3)],[0,rnz(-3,3),rint(-3,3)],[0,0,rnz(-3,3)]],b=u.map(r=>r[0]*x+r[1]*y+r[2]*z);
  qs.push({type:'num',text:`Gauss dejó esta matriz escalonada: ${matH(u.map((r,i)=>[...r,b[i]]),{aug:true})} Con sustitución hacia atrás, ¿cuánto vale <b>x</b>?`,answer:x,tol:0,
    explain:`De la fila 3: z = ${sg(b[2])} / ${ps(u[2][2])} = ${sg(z)}. De la fila 2: y = ${sg(y)}. De la fila 1: ${sg(u[0][0])}x = ${sg(b[0])} − (${sg(u[0][1]*y+u[0][2]*z)}) → x = <b>${sg(x)}</b>.`});
  const kind=pick(['none','inf','one']),c=rnz(-6,6),p=rint(-5,5),q=rint(-5,5),w=rint(-5,5);
  const last=kind==='none'?[0,0,0,c]:kind==='inf'?[0,0,0,0]:[0,0,rnz(-3,3),c];
  qs.push({type:'mc',keepOrder:true,text:`Al final de la eliminación quedó: ${matH([[1,rint(-3,3),rint(-3,3),p],[0,rnz(-3,3),rint(-3,3),q],last],{aug:true})} ¿Qué tipo de solución tiene el sistema?`,options:['Una única solución','Ninguna solución','Infinitas soluciones'],answer:{one:0,none:1,inf:2}[kind],
    explain:{none:`La última fila dice 0 = ${sg(c)}: imposible. <b>Sin solución</b>.`,inf:'La última fila es 0 = 0: sobra una ecuación, z queda libre. <b>Infinitas soluciones</b>.',one:'Cada columna tiene su pivote y no aparece 0 = c: hay <b>una única solución</b>.'}[kind]});
  qs.push({type:'num',text:`Gauss-Jordan terminó con ${matH([[1,0,0,p],[0,1,0,q],[0,0,1,w]],{aug:true})} ¿Cuánto vale <b>y</b>?`,answer:q,tol:0,explain:`La segunda fila dice 0x + 1y + 0z = ${sg(q)}: y = <b>${sg(q)}</b>.`});
  qs.push({type:'mc',text:'¿Cuál de estas NO es una operación elemental de fila válida?',options:['Multiplicar una fila por 0','Intercambiar dos filas','Multiplicar una fila por un número distinto de cero','Sumar a una fila un múltiplo de otra'],answer:0,explain:'Multiplicar por 0 borra una ecuación y cambia la solución. Las otras tres no la cambian.'});
  return qs;
}

/* =============== 4.5 Aplicaciones: mezclas =============== */
const FL=[{n:'Harina de trigo',p:12,g:1.5,c:0.9},{n:'Harina de soya',p:38,g:20,c:2.1},{n:'Harina de quinua',p:14,g:6,c:3.2}];
function solve3(A,b){const D=det3(A);if(Math.abs(D)<1e-12)return null;return[0,1,2].map(j=>det3(colRep(A,j,b))/D);}
function simMezclas(box){
  box.innerHTML=`<div class="part"><h3 class="sub">Formula una harina compuesta</h3><p class="ctx">Quieres preparar una mezcla con tres harinas que cumpla un peso total, un % de proteína y un % de grasa. Son tres condiciones y tres incógnitas: un sistema 3 × 3.</p>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>Ingrediente</th><th>Proteína (%)</th><th>Grasa (%)</th><th>Precio (USD/kg)</th></tr></thead><tbody>${FL.map((f,i)=>`<tr><td>${f.n} (${V3[i]} kg)</td><td>${nf(f.p,1)}</td><td>${nf(f.g,1)}</td><td>${fmt(f.c,2)}</td></tr>`).join('')}</tbody></table></div>
    <div class="ctrls">${SL('mz-t','Total de mezcla (kg)',50,500,10,100)}${SL('mz-p','Proteína deseada (%)',10,40,0.5,18)}${SL('mz-g','Grasa deseada (%)',1,20,0.5,6)}</div>
    <h3 class="sub">1. Plantea el sistema</h3><div class="formula" id="mz-sys"></div>
    <h3 class="sub">2. Matriz aumentada</h3><div class="mat-show" id="mz-mat"></div>
    <h3 class="sub">3. Resultado</h3><div class="readouts" id="mz-ro"></div><p class="verdict" id="mz-v"></p>
    <h3 class="sub">¿Dónde se puede llegar?</h3><p class="ctx">Cada harina es un punto (proteína, grasa). Solo las metas <b>dentro del triángulo</b> se logran sin cantidades negativas.</p><div class="chart-wrap" id="mz-ch"></div></div>`;
  const s={t:100,p:18,g:6};
  function draw(){$('#mz-t-o',box).textContent=s.t;$('#mz-p-o',box).textContent=nf(s.p,1);$('#mz-g-o',box).textContent=nf(s.g,1);
    const A=[[1,1,1],FL.map(f=>f.p/100),FL.map(f=>f.g/100)],b=[s.t,s.p/100*s.t,s.g/100*s.t];
    $('#mz-sys',box).innerHTML=`Masa: ${eqN(A[0],b[0])}<br>Proteína: ${eqN(A[1],b[1])} <span class="note">(${nf(s.p,1)} % de ${s.t} kg)</span><br>Grasa: ${eqN(A[2],b[2])} <span class="note">(${nf(s.g,1)} % de ${s.t} kg)</span>`;
    $('#mz-mat',box).innerHTML=matH(A.map((r,i)=>[...r,b[i]]),{aug:true});
    const x=solve3(A,b),ok=x&&x.every(v=>v>-1e-9),v=$('#mz-v',box);
    $('#mz-ro',box).innerHTML=x?x.map((q,i)=>`<div class="ro${q<-1e-9?' bad':''}"><span>${FL[i].n} (${V3[i]})</span><b>${fmt(q,2)} kg</b></div>`).join('')+(ok?`<div class="ro hl"><span>Costo de la mezcla</span><b>${fmt(x.reduce((t,q,i)=>t+q*FL[i].c,0),2)} USD</b></div>`:''):'';
    v.className='verdict '+(ok?'ok':'bad');
    v.innerHTML=ok?`<b>Mezcla posible.</b> Comprobación: ${fmt(x[0]+x[1]+x[2],1)} kg en total, ${fmt(x.reduce((t,q,i)=>t+q*FL[i].p,0)/s.t,2)} % de proteína y ${fmt(x.reduce((t,q,i)=>t+q*FL[i].g,0)/s.t,2)} % de grasa.`:`<b>El sistema tiene solución matemática, pero no es una mezcla real:</b> pide una cantidad negativa de ${FL[x.findIndex(q=>q<-1e-9)].n.toLowerCase()}. Cambia las metas para entrar en el triángulo.`;
    $('#mz-ch',box).innerHTML=plane({W:cw($('#mz-ch',box)),xmin:0,xmax:45,ymin:0,ymax:25,polys:[{pts:FL.map(f=>[f.p,f.g]),cls:'data'}],points:FL.map(f=>({x:f.p,y:f.g,cls:'data',label:f.n.replace('Harina de ','')})).concat([{x:s.p,y:s.g,cls:ok?'':'open',label:'tu meta'}])})+`<p class="note">Eje horizontal: proteína (%). Eje vertical: grasa (%).</p>`;}
  ['t','p','g'].forEach(k=>$('#mz-'+k,box).addEventListener('input',e=>{s[k]=+e.target.value;draw();}));
  draw();return draw;
}
function quizMezclas(){
  const qs=[];
  const Ba=pick([10,12,14]),Bb=pick([60,65,70]),xa=rint(5,15)*10,xb=rint(1,6)*10,T=xa+xb,Bm=(Ba*xa+Bb*xb)/T;
  qs.push({type:'num',text:`Se mezclan un jugo de ${Ba} °Brix (x kg) y un concentrado de ${Bb} °Brix (y kg) para obtener ${T} kg con ${nf(Bm,3)} °Brix. Plantea x + y = ${T} y ${Ba}x + ${Bb}y = ${nf(Bm*T,3)}. ¿Cuántos kg de <b>concentrado</b> se usan?`,unit:'kg',answer:xb,tol:0.01,
    explain:`Reemplaza x = ${T} − y: ${Ba}(${T} − y) + ${Bb}y = ${nf(Bm*T,3)} → ${Bb-Ba}y = ${nf(Bm*T-Ba*T,3)} → y = <b>${xb} kg</b>.`});
  qs.push({type:'mc',text:`Una mezcla de 100 kg usa x kg de harina de trigo (12 % proteína) e y kg de harina de soya (38 % proteína) y debe tener 20 % de proteína. ¿Qué ecuación expresa la condición de proteína?`,options:['0,12x + 0,38y = 20','12x + 38y = 20','0,12x + 0,38y = 0,20','x + y = 20'],answer:0,
    explain:'La proteína total en kg debe ser el 20 % de 100 kg = 20 kg. Cada harina aporta su % por los kg usados: <b>0,12x + 0,38y = 20</b>.'});
  const xs=[rint(4,12)*5,rint(1,6)*5];xs.push(100-xs[0]-xs[1]);if(xs[2]<5){xs[0]-=10;xs[2]+=10;}
  const P=xs.reduce((t,q,i)=>t+q*FL[i].p,0)/100,G=xs.reduce((t,q,i)=>t+q*FL[i].g,0)/100,i3=rint(0,2);
  qs.push({type:'num',text:`Con las harinas del simulador (trigo 12 % prot. y 1,5 % grasa; soya 38 % y 20 %; quinua 14 % y 6 %) se quieren 100 kg con ${nf(P,3)} % de proteína y ${nf(G,3)} % de grasa. Resuelve el sistema 3 × 3: ¿cuántos kg de <b>${['trigo','soya','quinua'][i3]}</b>?`,unit:'kg',answer:xs[i3],tol:0.05,
    explain:`x + y + z = 100 · 0,12x + 0,38y + 0,14z = ${nf(P,3)} · 0,015x + 0,20y + 0,06z = ${nf(G,3)}. Con Gauss o Cramer: x = ${xs[0]}, y = ${xs[1]}, z = ${xs[2]}. Respuesta: <b>${xs[i3]} kg</b>.`});
  const cost=xs.reduce((t,q,i)=>t+q*FL[i].c,0);
  qs.push({type:'num',text:`Con esa mezcla (${xs[0]} kg de trigo, ${xs[1]} kg de soya y ${xs[2]} kg de quinua) y precios de 0,90, 2,10 y 3,20 USD/kg, ¿cuánto cuesta la mezcla?`,unit:'USD',answer:round(cost,2),tol:0.011,explain:`${xs.map((q,i)=>`${q}·${fmt(FL[i].c,2)}`).join(' + ')} = <b>${fmt(cost,2)} USD</b>.`});
  const hi=pick([42,45,50]);
  qs.push({type:'mc',text:`¿Se puede lograr una mezcla de esas tres harinas con ${hi} % de proteína?`,options:['No: ninguna harina tiene tanta proteína, el sistema daría cantidades negativas','Sí, con más harina de soya','Sí, si se aumentan los kg totales','Solo con Gauss-Jordan'],answer:0,
    explain:`Una mezcla siempre queda entre sus ingredientes. El máximo es 38 % (solo soya), así que ${hi} % es <b>imposible</b>: la solución del sistema tendría valores negativos.`});
  qs.push({type:'mc',text:'Si un sistema de mezcla da una cantidad negativa para un ingrediente, significa que…',options:['La meta no se puede lograr con esos ingredientes','Hay que restar ese ingrediente al final','El cálculo está mal y hay que repetirlo','Se debe usar el valor absoluto'],answer:0,
    explain:'La solución matemática existe, pero no tiene sentido físico: <b>la meta está fuera de lo alcanzable</b> con esos ingredientes.'});
  return qs;
}

const MODS=[
 {id:'metodos-sistemas',n:'4.1',short:'Métodos algebraicos',title:'Sustitución, igualación y eliminación',desc:'Tres caminos para resolver un sistema, paso a paso.',
  lead:'Un sistema de ecuaciones se puede resolver de varias maneras. Todas llegan al mismo resultado; elegir bien el método ahorra trabajo.',
  idea:`<div class="types"><div class="type"><b>Sustitución</b><span>Despeja una variable de una ecuación y reemplázala en la otra.</span></div><div class="type"><b>Igualación</b><span>Despeja la misma variable en ambas ecuaciones e iguala los despejes.</span></div><div class="type"><b>Eliminación</b><span>Multiplica las ecuaciones para que una variable tenga coeficientes iguales y resta.</span></div><div class="type"><b>¿Cuál uso?</b><span>Si una variable ya tiene coeficiente 1, sustitución. Si los coeficientes se igualan fácil, eliminación.</span></div></div>
   <p>Siempre <b>comprueba</b> la solución reemplazándola en las ecuaciones originales. Con tres ecuaciones se elimina una variable a la vez hasta quedar con una.</p>`,
  simHint:'Escribe un sistema, elige el método y avanza paso a paso.',sim:simMetodos,quiz:quizMetodos},
 {id:'matrices',n:'4.2',short:'Matrices',title:'Matrices: tipos y operaciones',desc:'Suma, producto por escalar, producto de matrices y transpuesta.',
  lead:'Una matriz es una tabla de números ordenada en filas y columnas. Sirve para guardar recetas, costos o los coeficientes de un sistema y operarlos de una vez.',
  idea:`<div class="formula">Tamaño: m × n (filas × columnas) · a<sub>ij</sub> = elemento de la fila i, columna j<br>(A ± B)<sub>ij</sub> = a<sub>ij</sub> ± b<sub>ij</sub> (mismo tamaño) · (kA)<sub>ij</sub> = k·a<sub>ij</sub><br>(A·B)<sub>ij</sub> = fila i de A · columna j de B · (m × n)·(n × p) = m × p<br>Aᵀ: las filas pasan a ser columnas</div>
   <ul><li>El producto <b>no es conmutativo</b>: en general A·B ≠ B·A.</li><li>Tipos: fila, columna, cuadrada, diagonal, identidad, triangular, simétrica.</li></ul>`,
  simHint:'Opera matrices y toca el resultado del producto para ver cómo se calcula.',sim:simMatrices,quiz:quizMatrices},
 {id:'determinantes',n:'4.3',short:'Determinantes y Cramer',title:'Determinantes y regla de Cramer',desc:'Determinantes 2 × 2 y 3 × 3; resolver sistemas con Cramer.',
  lead:'El determinante es un número que resume una matriz cuadrada. Dice si un sistema tiene solución única y, con la regla de Cramer, permite calcularla.',
  idea:`<div class="formula">det ${matH([['a','b'],['c','d']])} = ad − bc<br>3 × 3 (Sarrus): suma de las diagonales que bajan − suma de las que suben<br>Cramer: x = D<sub>x</sub>/D · y = D<sub>y</sub>/D · z = D<sub>z</sub>/D (con D ≠ 0)</div>
   <ul><li>Si <b>D = 0</b>, el sistema no tiene solución única.</li><li>En una matriz triangular, el determinante es el producto de la diagonal.</li></ul>`,
  simHint:'Mira el determinante como área, aplica Sarrus y resuelve con Cramer.',sim:simDet,quiz:quizDet},
 {id:'gauss',n:'4.4',short:'Gauss y Gauss-Jordan',title:'Métodos de Gauss y Gauss-Jordan',desc:'Operaciones de fila sobre la matriz aumentada.',
  lead:'Gauss y Gauss-Jordan ordenan la eliminación en una matriz aumentada. Es el método que usan las computadoras para resolver sistemas grandes.',
  idea:`<p>Operaciones elementales de fila (no cambian la solución):</p><div class="formula">Fᵢ ↔ Fⱼ (intercambiar) · Fᵢ → k·Fᵢ, k ≠ 0 (escalar) · Fᵢ → Fᵢ + k·Fⱼ (sumar un múltiplo)</div>
   <div class="types"><div class="type"><b>Gauss</b><span>Ceros debajo de la diagonal (forma escalonada) y sustitución hacia atrás.</span></div><div class="type"><b>Gauss-Jordan</b><span>Ceros arriba y abajo, pivotes iguales a 1: la solución queda en la última columna.</span></div>
   <div class="type"><b>[0 0 0 | c], c ≠ 0</b><span>Sin solución.</span></div><div class="type"><b>[0 0 0 | 0]</b><span>Infinitas soluciones (variable libre).</span></div></div>`,
  simHint:'Resuelve paso a paso, compara Gauss con Gauss-Jordan y prueba tus propias operaciones.',sim:simGauss,quiz:quizGauss},
 {id:'mezclas',n:'4.5',short:'Aplicación: mezclas',title:'Aplicaciones: formulación de mezclas',desc:'Plantear y resolver sistemas para cumplir metas de composición.',
  lead:'Formular un producto es resolver un sistema: cuánto de cada ingrediente para cumplir el peso, la proteína, la grasa o los grados Brix que pide la ficha técnica.',
  idea:`<ol><li>Define las incógnitas: kg de cada ingrediente.</li><li>Una ecuación por condición: masa total, y para cada componente Σ (% del ingrediente × kg) = % meta × total.</li><li>Resuelve con Gauss o Cramer.</li><li><b>Interpreta:</b> si alguna cantidad es negativa, la meta no se puede lograr con esos ingredientes.</li></ol>`,
  simHint:'Ajusta las metas de la harina compuesta y mira si la mezcla es posible.',sim:simMezclas,quiz:quizMezclas},
];
CIMA.addUnit(META_MN,{id:'u4',orden:4,nombre:'Unidad 4 · Sistemas de ecuaciones y matrices',topics:MODS});
})();
