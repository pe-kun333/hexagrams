/* Hexagrams Picture Quest core (DOM-free): image -> hex grid -> stages, colour line solver, givens. */
(function(root){
"use strict";
const HC=(typeof module!=="undefined")?require("./core.js"):root.HexCore;
const {SQ3,DIRS,hexDist}=HC;

/* ---------- big grid: H rows of W cells, odd rows shifted right by half a cell ---------- */
function gridDims(aspect,N){
  const H=Math.max(4,Math.round(Math.sqrt(N/(aspect*SQ3/2))));
  const W=Math.max(4,Math.round(N/H));
  return {W,H};
}
function bigGrid(W,H){
  const cells=[],idx=new Map();
  for(let r=0;r<H;r++)for(let j=0;j<W;j++){const q=j-Math.floor(r/2);idx.set(q+","+r,cells.length);cells.push({q,r,s:-q-r,j,x:j+(r&1)/2,y:r*SQ3/2})}
  return {W,H,cells,idx};
}
/* average colour of each hex from RGBA pixels {width,height,data} */
function sampleImage(img,G){
  const {width:w,height:h,data}=img,spanX=G.W-0.5+1,spanY=(G.H-1)*SQ3/2+1;
  const sx=w/spanX,sy=h/spanY,out=[];
  for(const c of G.cells){
    let R=0,Gg=0,B=0,n=0;
    for(let a=0;a<4;a++)for(let b=0;b<4;b++){
      const px=Math.min(w-1,Math.max(0,Math.floor((c.x+0.5+(a-1.5)*0.24)*sx)));
      const py=Math.min(h-1,Math.max(0,Math.floor((c.y+0.5+(b-1.5)*0.24)*sy)));
      const o=(py*w+px)*4,al=data[o+3]/255;
      R+=data[o]*al+255*(1-al);Gg+=data[o+1]*al+255*(1-al);B+=data[o+2]*al+255*(1-al);n++;
    }
    out.push([R/n,Gg/n,B/n]);
  }
  return out;
}
const lumOf=c=>0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
function neighbors(G,i){const c=G.cells[i],o=[];for(const[dq,dr]of DIRS){const j=G.idx.get((c.q+dq)+","+(c.r+dr));if(j!==undefined)o.push(j)}return o}
function otsu(vals){
  const hist=new Array(256).fill(0);vals.forEach(v=>hist[Math.max(0,Math.min(255,Math.round(v)))]++);
  const n=vals.length;let sum=0;for(let i=0;i<256;i++)sum+=i*hist[i];
  let sB=0,wB=0,best=0,thr=128;
  for(let t=0;t<256;t++){wB+=hist[t];if(!wB)continue;const wF=n-wB;if(!wF)break;sB+=t*hist[t];
    const mB=sB/wB,mF=(sum-sB)/wF,v=wB*wF*(mB-mF)*(mB-mF);if(v>best){best=v;thr=t+0.5}}
  return Math.round(thr);
}
/* enhance: "none" | "contrast" | "edge" -> new rgb list */
function enhance(G,rgb,mode){
  if(mode==="none")return rgb.map(c=>c.slice());
  const L=rgb.map(lumOf).sort((a,b)=>a-b);const lo=L[Math.floor(L.length*0.02)],hi=L[Math.ceil(L.length*0.98)-1];
  const k=hi-lo>8?255/(hi-lo):1;
  let out=rgb.map(c=>c.map(v=>Math.max(0,Math.min(255,(v-lo)*k))));
  if(mode==="edge"){
    const base=out;out=base.map((c,i)=>{const nb=neighbors(G,i);if(!nb.length)return c;
      return c.map((v,ch)=>{let m=0;nb.forEach(j=>m+=base[j][ch]);m/=nb.length;return Math.max(0,Math.min(255,v+1.2*(v-m)))})});
  }
  return out;
}
/* k-means with deterministic luminance-quantile seeds */
function kmeans(pts,k,iters){
  const order=pts.map((p,i)=>i).sort((a,b)=>lumOf(pts[a])-lumOf(pts[b]));
  let cen=[];for(let c=0;c<k;c++)cen.push(pts[order[Math.min(order.length-1,Math.floor((c+0.5)/k*order.length))]].slice());
  let asg=new Array(pts.length).fill(0);
  const d2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;
  for(let it=0;it<(iters||14);it++){
    asg=pts.map(p=>{let b=0,bd=1e18;cen.forEach((c,ci)=>{const d=d2(p,c);if(d<bd){bd=d;b=ci}});return b});
    const sum=cen.map(()=>[0,0,0,0]);pts.forEach((p,i)=>{const s=sum[asg[i]];s[0]+=p[0];s[1]+=p[1];s[2]+=p[2];s[3]++});
    cen=sum.map((s,ci)=>{if(s[3])return [s[0]/s[3],s[1]/s[3],s[2]/s[3]];
      // empty cluster: reseed at the point farthest from its centre
      let far=0,fd=-1;pts.forEach((p,i)=>{const d=d2(p,cen[asg[i]]);if(d>fd){fd=d;far=i}});return pts[far].slice()});
  }
  return {cen,asg};
}
const hex2=v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,"0");
const toHex=c=>"#"+hex2(c[0])+hex2(c[1])+hex2(c[2]);
/* opts: {enhance, colors:1..4 (1 = monochrome), threshold (null=auto), invert}
   returns {sol:[0..K], K, pal:[bg, c1..cK], thr, autoThr} */
function convert(G,rgb,opts){
  const e=enhance(G,rgb,opts.enhance||"none");
  if(!opts.colors||opts.colors<=1){
    const L=e.map(lumOf),autoThr=otsu(L),thr=opts.threshold==null?autoThr:opts.threshold;
    const sol=L.map(v=>(opts.invert?v>thr:v<thr)?1:0);
    return {sol,K:1,pal:["#f4e9d2","#1f2a44"],thr,autoThr};
  }
  const K=opts.colors,{cen,asg}=kmeans(e,K+1);
  const border=new Array(K+1).fill(0),size=new Array(K+1).fill(0);
  G.cells.forEach((c,i)=>{size[asg[i]]++;if(c.r===0||c.r===G.H-1||c.j===0||c.j===G.W-1)border[asg[i]]++});
  let bg=0;for(let c=1;c<=K;c++)if(border[c]>border[bg]||(border[c]===border[bg]&&size[c]>size[bg]))bg=c;
  if(opts.invert){ // invert in colour mode: treat the cluster most *unlike* the border as background
    let lo=0;for(let c=1;c<=K;c++)if(border[c]/Math.max(1,size[c])<border[lo]/Math.max(1,size[lo]))lo=c;bg=lo}
  const rest=[...Array(K+1).keys()].filter(c=>c!==bg).sort((a,b)=>lumOf(cen[a])-lumOf(cen[b]));
  const map=new Array(K+1);map[bg]=0;rest.forEach((c,k)=>map[c]=k+1);
  return {sol:asg.map(a=>map[a]),K,pal:[toHex(cen[bg])].concat(rest.map(c=>toHex(cen[c]))),thr:null,autoThr:null};
}

/* ---------- tiling: hexagons of radius R on the lattice (2R+1,-R),(R,R+1) ---------- */
function tileKey(q,r,R,oq,or){
  const N=3*R*R+3*R+1,dq=q-oq,dr=r-or;
  const a0=Math.floor(((R+1)*dq-R*dr)/N),b0=Math.floor((R*dq+(2*R+1)*dr)/N);
  for(let a=a0-1;a<=a0+2;a++)for(let b=b0-1;b<=b0+2;b++){
    const cq=oq+a*(2*R+1)+b*R,cr=or-a*R+b*(R+1);
    if(Math.max(Math.abs(q-cq),Math.abs(r-cr),Math.abs(q+r-cq-cr))<=R)return a+","+b;
  }
  return null;
}
const TINY=6;
function tile(G,R){
  let best=null;
  for(let oq=-R;oq<=R;oq++)for(let or=-R;or<=R;or++){
    if(Math.max(Math.abs(oq),Math.abs(or),Math.abs(oq+or))>R)continue;
    const m=new Map();G.cells.forEach((c,i)=>{const k=tileKey(c.q,c.r,R,oq,or);if(!m.has(k))m.set(k,[]);m.get(k).push(i)});
    let score=0;for(const v of m.values())score+=v.length<TINY?30:(v.length<12?6:(v.length<20?1:0))+0.6;
    if(!best||score<best.score-1e-9)best={score,off:[oq,or],m};
  }
  const regions=[...best.m.values()].map(ix=>{const cx=ix.reduce((s,i)=>s+G.cells[i].x,0)/ix.length,cy=ix.reduce((s,i)=>s+G.cells[i].y,0)/ix.length;return{cells:ix,cx,cy}});
  regions.sort((a,b)=>(Math.round(a.cy*2)-Math.round(b.cy*2))||(a.cx-b.cx));
  const stageOf=new Array(G.cells.length);regions.forEach((rg,k)=>rg.cells.forEach(i=>stageOf[i]=k));
  return {R,off:best.off,regions,stageOf};
}
/* region board: lines are maximal runs of region cells along each axis */
function makeRegion(G,gIdx,R){
  const cells=gIdx.map(gi=>{const c=G.cells[gi];return{q:c.q,r:c.r,s:c.s,x:c.x,y:c.y,gi}});
  const idx=new Map();cells.forEach((c,i)=>idx.set(c.q+","+c.r,i));
  const keyOf=[c=>c.r,c=>c.q,c=>c.s],ord=[c=>c.q,c=>c.r,c=>c.q];
  const lines=[],cellLines=cells.map(()=>[0,0,0]);
  for(let f=0;f<3;f++){
    const groups=new Map();cells.forEach((c,i)=>{const k=keyOf[f](c);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(i)});
    [...groups.keys()].sort((a,b)=>a-b).forEach(k=>{
      const l=groups.get(k).sort((a,b)=>ord[f](cells[a])-ord[f](cells[b]));
      let run=[l[0]];
      const flush=()=>{run.forEach(i=>cellLines[i][f]=lines.length);lines.push({f,v:k,cells:run})};
      for(let t=1;t<l.length;t++){if(ord[f](cells[l[t]])===ord[f](cells[l[t-1]])+1)run.push(l[t]);else{flush();run=[l[t]]}}
      flush();
    });
  }
  const minR=Math.min(...cells.map(c=>c.r));
  return {side:(R||4)+1,R:-minR,cells,idx,lines,cellLines,region:true};
}

/* ---------- colour nonogram ---------- */
function cluesOfC(B,sol){return B.lines.map(l=>{const o=[];let c=0,n=0;for(const i of l.cells){const v=sol[i];if(v===c&&v)n++;else{if(c&&n)o.push({n,c});c=v;n=v?1:0}}if(c&&n)o.push({n,c});return o})}
/* masks: bit0 = empty, bit c = colour c. Returns refined masks or null on contradiction. */
function lineSolveC(m,clue){
  const L=m.length,K=clue.length;
  const g=[];for(let k=0;k<=K;k++)g.push(new Array(L+1).fill(false));
  g[K][L]=true;for(let i=L-1;i>=0;i--)g[K][i]=g[K][i+1]&&!!(m[i]&1);
  const trans=(k,i,cb)=>{ // enumerate placements of block k starting at >= i
    const {n,c}=clue[k],bit=1<<c,same=k+1<K&&clue[k+1].c===c;
    for(let st=i;st+n<=L;st++){
      if(st>i&&!(m[st-1]&1))break;
      let ok=true;for(let j=st;j<st+n;j++)if(!(m[j]&bit)){ok=false;break}
      if(!ok)continue;let nx=st+n;
      if(same){if(nx>=L||!(m[nx]&1))continue;nx++}
      if(cb(st,nx))return true;
    }
    return false;
  };
  for(let k=K-1;k>=0;k--)for(let i=L;i>=0;i--)g[k][i]=i<L||clue[k].n===0?trans(k,i,(st,nx)=>g[k+1][nx]):false;
  if(!g[0][0])return null;
  const reach=[];for(let k=0;k<=K;k++)reach.push(new Array(L+1).fill(false));reach[0][0]=true;
  const res=new Array(L).fill(0);
  for(let k=0;k<=K;k++)for(let i=0;i<=L;i++){
    if(!reach[k][i])continue;
    if(k===K){if(g[K][i])for(let j=i;j<L;j++)res[j]|=1;continue}
    const {n,c}=clue[k],bit=1<<c;
    trans(k,i,(st,nx)=>{if(!g[k+1][nx])return false;reach[k+1][nx]=true;
      for(let j=i;j<st;j++)res[j]|=1;for(let j=st;j<st+n;j++)res[j]|=bit;if(nx>st+n)res[st+n]|=1;return false});
  }
  return res.map((v,j)=>v&m[j]);
}
const pop=v=>{let n=0;while(v){n+=v&1;v>>=1}return n};
function solveC(B,clues,K,init){
  const full=(1<<(K+1))-1,st=init?init.slice():new Array(B.cells.length).fill(full);
  let dirty=new Set(B.lines.map((l,i)=>i)),rounds=0,steps=0;
  while(dirty.size){
    rounds++;const next=new Set();
    for(const li of dirty){steps++;const line=B.lines[li].cells;const res=lineSolveC(line.map(i=>st[i]),clues[li]);
      if(!res)return{ok:false,contradiction:true,rounds,steps};
      res.forEach((v,j)=>{const ci=line[j];if(v!==st[ci]){st[ci]=v;B.cellLines[ci].forEach(l2=>{if(l2!==li)next.add(l2)})}});
    }
    dirty=next;
  }
  const unknown=st.filter(v=>pop(v)!==1).length;
  return{ok:unknown===0,unknown,rounds,steps,state:st};
}
/* minimal-ish set of pre-revealed cells so that line logic finishes the stage */
function addGivens(B,clues,K,sol){
  const full=(1<<(K+1))-1,giv=new Set();
  const init=()=>B.cells.map((_,i)=>giv.has(i)?(1<<sol[i]):full);
  let r=solveC(B,clues,K,init()),guard=0;
  while(!r.ok&&guard++<B.cells.length){
    const unk=r.state.map((v,i)=>pop(v)>1?i:-1).filter(i=>i>=0);
    const step=Math.max(1,Math.floor(unk.length/12)),cand=[];for(let t=0;t<unk.length&&cand.length<12;t+=step)cand.push(unk[t]);
    let best=cand[0],bu=1e9;
    for(const c of cand){giv.add(c);const rr=solveC(B,clues,K,init());giv.delete(c);if(rr.unknown<bu){bu=rr.unknown;best=c}}
    giv.add(best);r=solveC(B,clues,K,init());
  }
  for(const gv of [...giv].reverse()){giv.delete(gv);if(!solveC(B,clues,K,init()).ok)giv.add(gv)}
  const fin=solveC(B,clues,K,init());
  return{givens:[...giv].sort((a,b)=>a-b),rounds:fin.rounds,steps:fin.steps,ok:fin.ok};
}
/* build all stages of a quest. q: {W,H,R,sol(string|array),K,givens?(array of arrays, local idx)} */
function buildStages(q){
  const G=bigGrid(q.W,q.H),T=tile(G,q.R),sol=typeof q.sol==="string"?[...q.sol].map(Number):q.sol;
  const stages=T.regions.map((rg,k)=>{
    const B=makeRegion(G,rg.cells,q.R),ls=B.cells.map(c=>sol[c.gi]);
    const cclues=cluesOfC(B,ls),filled=ls.filter(v=>v).length;
    const tiny=B.cells.length<TINY,empty=filled===0,fullOne=filled===B.cells.length&&ls.every(v=>v===ls[0]);
    const st={k,B,sol:ls,cclues,filled,cx:rg.cx,cy:rg.cy,auto:tiny?"tiny":(empty?"empty":(fullOne?"full":null))};
    if(!st.auto){
      let gv=q.givens&&q.givens[k];
      if(!gv||gv.some(i=>i>=B.cells.length)){const r=addGivens(B,cclues,q.K,ls);gv=r.givens;st.rounds=r.rounds;st.steps=r.steps}
      st.givens=gv;
      const chk=solveC(B,cclues,q.K,B.cells.map((_,i)=>gv.includes(i)?(1<<ls[i]):(1<<(q.K+1))-1));
      st.unique=chk.ok;st.steps=chk.steps;st.rounds=chk.rounds;
      const per=chk.steps/B.lines.length,gshare=gv.length/B.cells.length;
      st.diff=per+gshare*4<1.9?1:(per<2.6?2:3);
    }else{st.givens=[];st.unique=true;st.diff=1}
    return st;
  });
  return{G,T,sol,stages};
}
const api={gridDims,bigGrid,sampleImage,lumOf,otsu,enhance,kmeans,convert,toHex,tile,tileKey,makeRegion,cluesOfC,lineSolveC,solveC,addGivens,buildStages,neighbors,TINY};
if(typeof module!=="undefined")module.exports=api;else root.HexQuest=api;
})(this);
