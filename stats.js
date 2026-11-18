/* =====================================================================
   CIMA · Motor estadístico compartido (window.ST)
   Distribuciones F, t, normal y rango estudentizado (Tukey); Shapiro-Wilk;
   Levene; ANOVA balanceados (DCA, DBCA, factorial 2^k).
   ===================================================================== */
(function(){
"use strict";
const ST={};
ST.sum=a=>a.reduce((s,v)=>s+v,0);
ST.mean=a=>ST.sum(a)/a.length;
ST.vari=a=>{const m=ST.mean(a);return ST.sum(a.map(v=>(v-m)**2))/(a.length-1);};
ST.sd=a=>Math.sqrt(ST.vari(a));
/* normal */
function erfc(x){const z=Math.abs(x),t=1/(1+0.5*z);
  const r=t*Math.exp(-z*z-1.26551223+t*(1.00002368+t*(0.37409196+t*(0.09678418+t*(-0.18628806+t*(0.27886807+t*(-1.13520398+t*(1.48851587+t*(-0.82215223+t*0.17087277)))))))));
  return x>=0?r:2-r;}
ST.Phi=z=>0.5*erfc(-z/Math.SQRT2);
ST.phi=z=>Math.exp(-z*z/2)/Math.sqrt(2*Math.PI);
ST.qnorm=p=>{ // Acklam
  const a=[-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00],
  b=[-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01],
  c=[-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00],
  d=[7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00];
  const pl=0.02425;let q,r;
  if(p<pl){q=Math.sqrt(-2*Math.log(p));return(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
  if(p>1-pl){q=Math.sqrt(-2*Math.log(1-p));return-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
  q=p-0.5;r=q*q;return(((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);};
/* gamma y beta incompleta */
ST.lgamma=x=>{const g=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];
  let y=x,t=x+5.5;t-=(x+0.5)*Math.log(t);let s=1.000000000190015;for(const c of g)s+=c/++y;return -t+Math.log(2.5066282746310005*s/x);};
function betacf(a,b,x){const MAXIT=300,EPS=3e-14,FPMIN=1e-300;let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap;if(Math.abs(d)<FPMIN)d=FPMIN;d=1/d;let h=d;
  for(let m=1;m<=MAXIT;m++){const m2=2*m;let aa=m*(b-m)*x/((qam+m2)*(a+m2));d=1+aa*d;if(Math.abs(d)<FPMIN)d=FPMIN;c=1+aa/c;if(Math.abs(c)<FPMIN)c=FPMIN;d=1/d;h*=d*c;
    aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));d=1+aa*d;if(Math.abs(d)<FPMIN)d=FPMIN;c=1+aa/c;if(Math.abs(c)<FPMIN)c=FPMIN;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<EPS)break;}return h;}
ST.ibeta=(x,a,b)=>{if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(ST.lgamma(a+b)-ST.lgamma(a)-ST.lgamma(b)+a*Math.log(x)+b*Math.log(1-x));
  return x<(a+1)/(a+b+2)?bt*betacf(a,b,x)/a:1-bt*betacf(b,a,1-x)/b;};
ST.pF=(F,d1,d2)=>F<=0?1:ST.ibeta(d2/(d2+d1*F),d2/2,d1/2);           // P(F > f)
ST.pT2=(t,df)=>ST.ibeta(df/(df+t*t),df/2,0.5);                      // bilateral
const bisect=(f,lo,hi,target,dec)=>{for(let i=0;i<80;i++){const m=(lo+hi)/2,v=f(m);if(dec?v>target:v<target)lo=m;else hi=m;}return(lo+hi)/2;};
ST.qF=(alpha,d1,d2)=>bisect(f=>ST.pF(f,d1,d2),0,1000,alpha,true);
ST.qT=(alpha,df)=>bisect(t=>ST.pT2(t,df),0,1000,alpha,true);         // crítico bilateral
/* rango estudentizado */
function wprob(w,k){ // P(rango de k normales estándar < w)
  if(w<=0)return 0;const N=96,lo=-7,hi=7,h=(hi-lo)/N;let s=0;
  for(let i=0;i<=N;i++){const z=lo+i*h,v=ST.phi(z)*Math.pow(Math.max(0,ST.Phi(z)-ST.Phi(z-w)),k-1);s+=(i===0||i===N?1:i%2?4:2)*v;}
  return Math.min(1,k*s*h/3);}
ST.ptukey=(q,k,df)=>{if(q<=0)return 0;if(df>2000)return wprob(q,k);
  const lc=(df/2)*Math.log(df)-ST.lgamma(df/2)-(df/2-1)*Math.log(2);
  const sd=1/Math.sqrt(2*df),lo=Math.max(1e-6,1-9*sd),hi=1+9*sd+(df<5?6:0),N=120,h=(hi-lo)/N;let s=0;
  for(let i=0;i<=N;i++){const x=lo+i*h,f=Math.exp(lc+(df-1)*Math.log(x)-df*x*x/2);s+=(i===0||i===N?1:i%2?4:2)*f*wprob(q*x,k);}
  return Math.min(1,s*h/3);};
const QC={};ST.qtukey=(p,k,df)=>{const key=p+'|'+k+'|'+df;if(QC[key])return QC[key];let lo=0,hi=30;for(let i=0;i<34;i++){const m=(lo+hi)/2;if(ST.ptukey(m,k,df)<p)lo=m;else hi=m;}return QC[key]=(lo+hi)/2;};
/* Shapiro-Wilk (Royston 1995) */
ST.shapiro=x0=>{const x=[...x0].sort((a,b)=>a-b),n=x.length;if(n<3)return{W:NaN,p:NaN};
  const mean=ST.mean(x),ssq=ST.sum(x.map(v=>(v-mean)**2));if(ssq<1e-14)return{W:1,p:1};
  let a=new Array(n).fill(0);
  if(n===3){a[0]=-Math.SQRT1_2;a[2]=Math.SQRT1_2;}
  else{const m=x.map((_,i)=>ST.qnorm((i+1-0.375)/(n+0.25))),mm=ST.sum(m.map(v=>v*v)),u=1/Math.sqrt(n);
    const an=m[n-1]/Math.sqrt(mm)+0.221157*u-0.147981*u**2-2.071190*u**3+4.434685*u**4-2.706056*u**5;
    let phi,i0;
    if(n>5){const an1=m[n-2]/Math.sqrt(mm)+0.042981*u-0.293762*u**2-1.752461*u**3+5.682633*u**4-3.582633*u**5;
      phi=(mm-2*m[n-1]**2-2*m[n-2]**2)/(1-2*an**2-2*an1**2);a[n-1]=an;a[0]=-an;a[n-2]=an1;a[1]=-an1;i0=2;}
    else{phi=(mm-2*m[n-1]**2)/(1-2*an**2);a[n-1]=an;a[0]=-an;i0=1;}
    for(let i=i0;i<n-i0;i++)a[i]=m[i]/Math.sqrt(phi);}
  const W=Math.min(1,ST.sum(a.map((v,i)=>v*x[i]))**2/ssq);let p;
  if(n===3){p=Math.max(0,Math.min(1,6/Math.PI*(Math.asin(Math.sqrt(W))-Math.asin(Math.sqrt(0.75)))));}
  else if(n<=11){const g=-2.273+0.459*n,mu=0.5440-0.39978*n+0.025054*n**2-0.0006714*n**3,s=Math.exp(1.3822-0.77857*n+0.062767*n**2-0.0020322*n**3);
    const w=-Math.log(g-Math.log(1-W));p=1-ST.Phi((w-mu)/s);}
  else{const L=Math.log(n),mu=-1.5861-0.31082*L-0.083751*L**2+0.0038915*L**3,s=Math.exp(-0.4803-0.082676*L+0.0030302*L**2);p=1-ST.Phi((Math.log(1-W)-mu)/s);}
  return{W,p};};
/* ANOVA de un factor a partir de grupos */
ST.oneway=groups=>{const all=groups.flat(),N=all.length,k=groups.length,gm=ST.mean(all);
  const ssb=ST.sum(groups.map(g=>g.length*(ST.mean(g)-gm)**2)),sst=ST.sum(all.map(v=>(v-gm)**2)),ssw=sst-ssb;
  const d1=k-1,d2=N-k,msb=ssb/d1,msw=ssw/d2,F=msb/msw;return{ssb,ssw,sst,d1,d2,msb,msw,F,p:ST.pF(F,d1,d2),N,k,gm};};
/* Levene (basado en la media), como SPSS */
ST.levene=groups=>{const z=groups.map(g=>{const m=ST.mean(g);return g.map(v=>Math.abs(v-m));});const r=ST.oneway(z);return{F:r.F,d1:r.d1,d2:r.d2,p:r.p};};
/* Tukey HSD para grupos de igual tamaño n */
ST.tukey=(means,names,msw,df,n)=>{const k=means.length,se=Math.sqrt(msw/n),qc=ST.qtukey(0.95,k,df),hsd=qc*se,pairs=[];
  for(let i=0;i<k;i++)for(let j=0;j<k;j++){if(i===j)continue;const d=means[i]-means[j],q=Math.abs(d)/se;
    pairs.push({i,j,d,se:Math.sqrt(2)*se,p:Math.max(0,Math.min(1,1-ST.ptukey(q,k,df))),lo:d-hsd,hi:d+hsd});}
  return{hsd,qc,se,pairs};};
/* Subconjuntos homogéneos (letras) por medias ordenadas */
ST.letters=(means,hsd)=>{const idx=means.map((m,i)=>i).sort((a,b)=>means[a]-means[b]),sets=[];
  for(let s=0;s<idx.length;s++){let e=s;while(e+1<idx.length&&means[idx[e+1]]-means[idx[s]]<=hsd+1e-12)e++;
    const set=idx.slice(s,e+1);if(!sets.some(t=>set.every(v=>t.includes(v))))sets.push(set);}
  return{order:idx,sets};};

/* chi-cuadrado (cola derecha) vía gamma incompleta */
function gser(a,x){let ap=a,sum=1/a,del=sum;for(let n=0;n<500;n++){ap++;del*=x/ap;sum+=del;if(Math.abs(del)<Math.abs(sum)*1e-15)break;}return sum*Math.exp(-x+a*Math.log(x)-ST.lgamma(a));}
function gcf(a,x){let b=x+1-a,c=1/1e-300,d=1/b,h=d;for(let i=1;i<500;i++){const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<1e-300)d=1e-300;c=b+an/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<1e-15)break;}return Math.exp(-x+a*Math.log(x)-ST.lgamma(a))*h;}
ST.gammaQ=(a,x)=>x<=0?1:x<a+1?1-gser(a,x):gcf(a,x);
ST.pChi=(x,df)=>ST.gammaQ(df/2,x/2);
ST.qChi=(alpha,df)=>bisect(x=>ST.pChi(x,df),0,500,alpha,true);
ST.pT1=(t,df)=>{const p2=ST.pT2(Math.abs(t),df)/2;return t>0?p2:1-p2;};   // P(T > t)
ST.cor=(x,y)=>{const mx=ST.mean(x),my=ST.mean(y);let sxy=0,sxx=0,syy=0;x.forEach((v,i)=>{sxy+=(v-mx)*(y[i]-my);sxx+=(v-mx)**2;syy+=(y[i]-my)**2;});return sxy/Math.sqrt(sxx*syy);};
ST.linreg=(x,y)=>{const n=x.length,mx=ST.mean(x),my=ST.mean(y);let sxy=0,sxx=0,syy=0;x.forEach((v,i)=>{sxy+=(v-mx)*(y[i]-my);sxx+=(v-mx)**2;syy+=(y[i]-my)**2;});
  const b1=sxy/sxx,b0=my-b1*mx,sse=syy-b1*sxy,df=n-2,mse=sse/df,se1=Math.sqrt(mse/sxx),se0=Math.sqrt(mse*(1/n+mx*mx/sxx)),t1=b1/se1,t0=b0/se0,r=sxy/Math.sqrt(sxx*syy),R2=r*r;
  return{n,mx,my,sxy,sxx,syy,b1,b0,sse,ssr:syy-sse,df,mse,se1,se0,t1,t0,p1:ST.pT2(Math.abs(t1),df),p0:ST.pT2(Math.abs(t0),df),r,R2,R2a:1-(1-R2)*(n-1)/df,rmse:Math.sqrt(mse),F:(syy-sse)/mse};};
window.ST=ST;
})();
