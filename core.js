/* Hexagrams core: geometry, line solver, puzzle building (DOM-free) */
(function(root){
"use strict";
const SQ3=Math.sqrt(3);
const DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];

/* Board: axial coords (q,r), s=-q-r. Pointy-top hexes. x=q+r/2, y=r*sqrt3/2 (unit = horizontal spacing).
   Line families: 0 = rows (r const, ordered by q, left->right)
                  1 = down-right diagonals (q const, ordered by r)
                  2 = up-right diagonals (s const, ordered by q) */
function makeBoard(side){
  const R=side-1,cells=[],idx=new Map();
  for(let r=-R;r<=R;r++)for(let q=-R;q<=R;q++){const s=-q-r;if(Math.abs(s)<=R){idx.set(q+","+r,cells.length);cells.push({q,r,s,x:q+r/2,y:r*SQ3/2})}}
  const keyOf=[c=>c.r,c=>c.q,c=>c.s],ord=[c=>c.q,c=>c.r,c=>c.q];
  const lines=[],cellLines=cells.map(()=>[0,0,0]);
  for(let f=0;f<3;f++)for(let v=-R;v<=R;v++){
    const l=cells.map((c,i)=>i).filter(i=>keyOf[f](cells[i])===v).sort((a,b)=>ord[f](cells[a])-ord[f](cells[b]));
    l.forEach(i=>cellLines[i][f]=lines.length);lines.push({f,v,cells:l});
  }
  return {side,R,cells,idx,lines,cellLines};
}
const hexDist=(a,b)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.s-b.s));
const runs=a=>{const o=[];let n=0;for(const v of a){if(v===1)n++;else if(n){o.push(n);n=0}}if(n)o.push(n);return o};
function cluesOf(B,sol){return B.lines.map(l=>runs(l.cells.map(i=>sol[i])))}

/* Single line: enumerate placements consistent with known cells (-1 unknown, 0 empty, 1 filled). */
function lineSolve(cur,clue){
  const L=cur.length,K=clue.length,canF=new Array(L).fill(false),canE=new Array(L).fill(false),arr=new Array(L);
  const minRest=new Array(K+1).fill(0);
  for(let k=K-1;k>=0;k--)minRest[k]=clue[k]+(k<K-1?1+minRest[k+1]:0);
  let found=false;
  (function rec(i,k){
    if(k===K){for(let j=i;j<L;j++)if(cur[j]===1)return;for(let j=i;j<L;j++)arr[j]=0;
      found=true;for(let j=0;j<L;j++){if(arr[j])canF[j]=true;else canE[j]=true}return}
    const len=clue[k];
    for(let st=i;st+minRest[k]<=L;st++){
      if(st>i&&cur[st-1]===1)break;
      let ok=true;for(let j=st;j<st+len;j++)if(cur[j]===0){ok=false;break}
      if(ok&&st+len<L&&cur[st+len]===1)ok=false;
      if(ok){for(let j=i;j<st;j++)arr[j]=0;for(let j=st;j<st+len;j++)arr[j]=1;if(st+len<L)arr[st+len]=0;rec(Math.min(L,st+len+1),k+1)}
    }
  })(0,0);
  if(!found)return null;
  return cur.map((v,j)=>canF[j]&&canE[j]?-1:(canF[j]?1:0));
}
/* Propagate line logic in rounds. active: array<bool> per line (which clues are visible). */
function solve(B,clues,active){
  if(!active)active=B.lines.map(()=>true);
  const st=new Array(B.cells.length).fill(-1);
  let dirty=new Set(B.lines.map((l,i)=>i).filter(i=>active[i])),rounds=0,steps=0;
  while(dirty.size){
    rounds++;const next=new Set();
    for(const li of dirty){
      steps++;const line=B.lines[li].cells;const res=lineSolve(line.map(i=>st[i]),clues[li]);
      if(!res)return {ok:false,contradiction:true,rounds,steps};
      res.forEach((v,j)=>{const ci=line[j];if(v!==-1&&st[ci]===-1){st[ci]=v;B.cellLines[ci].forEach(l2=>{if(active[l2]&&l2!==li)next.add(l2)})}});
    }
    dirty=next;
  }
  const unknown=st.filter(v=>v===-1).length;
  return {ok:unknown===0,unknown,rounds,steps,state:st};
}
/* Hard mode: hide as many clues as possible (whole axis if possible) while staying uniquely line-solvable. */
function chooseHidden(B,clues){
  for(const f of [2,1,0]){const act=B.lines.map(l=>l.f!==f);if(solve(B,clues,act).ok)return {hidden:B.lines.map(l=>l.f===f),axis:f}}
  const act=B.lines.map(()=>true);const order=B.lines.map((l,i)=>i).sort((a,b)=>(B.lines[b].f-B.lines[a].f)||(a-b));
  let n=0;const cap=Math.ceil(B.lines.length/3);
  for(const li of order){if(n>=cap)break;act[li]=false;if(solve(B,clues,act).ok)n++;else act[li]=true}
  return {hidden:act.map(a=>!a),axis:-1};
}
function difficultyOf(B,clues,res){
  // score = board size + line work per line + share of cells NOT decidable from a single line on an empty board
  const st=new Array(B.cells.length).fill(-1);
  B.lines.forEach((l,li)=>{const r=lineSolve(l.cells.map(()=>-1),clues[li]);if(r)r.forEach((v,j)=>{if(v!==-1)st[l.cells[j]]=v})});
  const known1=st.filter(v=>v!==-1).length/B.cells.length;
  const score=B.side+2*res.steps/B.lines.length+3*(1-known1);
  return score<9.3?1:(score<11?2:3);
}
function buildPuzzle(def){
  const B=makeBoard(def.side),n=B.cells.length,sol=new Array(n).fill(0),col=new Array(n).fill(null);
  if(def.rows){const R=B.R;def.rows.forEach((row,ri)=>{const r=ri-R,qs=Math.max(-R,-r-R);[...row].forEach((ch,j)=>{const i=B.idx.get((qs+j)+","+r);if(i!==undefined&&ch!=="."){sol[i]=1;col[i]=ch}})})}
  else if(def.fn){B.cells.forEach((c,i)=>{const v=def.fn(c,B);if(v){sol[i]=1;col[i]=v}})}
  else if(def.sol){def.sol.forEach((v,i)=>{sol[i]=v;col[i]=v?def.col[i]:null})}
  const clues=cluesOf(B,sol),res=solve(B,clues);
  const hid=res.ok?chooseHidden(B,clues):{hidden:B.lines.map(()=>false),axis:-1};
  const resHard=solve(B,clues,hid.hidden.map(h=>!h));
  return Object.assign({},def,{B,sol,col,clues,unique:res.ok,rounds:res.rounds,diff:def.diff||difficultyOf(B,clues,res),
    hidden:hid.hidden,hiddenAxis:hid.axis,hiddenCount:hid.hidden.filter(Boolean).length,uniqueHard:resHard.ok,filled:sol.filter(v=>v).length});
}
function randomPuzzle(side,rand){
  rand=rand||Math.random;const B=makeBoard(side);let tries=0;
  while(tries<800){
    tries++;
    let sol=B.cells.map(()=>rand()<0.56?1:0);
    sol=B.cells.map((c,i)=>{let n=sol[i]*2;for(const[dq,dr]of DIRS){const j=B.idx.get((c.q+dq)+","+(c.r+dr));if(j!==undefined)n+=sol[j]}return n>=4?1:(n<=1?0:sol[i])});
    const fill=sol.reduce((a,b)=>a+b,0);if(fill<B.cells.length*0.3||fill>B.cells.length*0.8)continue;
    if(!solve(B,cluesOf(B,sol)).ok)continue;
    const pal=["y","Y","o"];
    const col=B.cells.map((c,i)=>sol[i]?pal[(Math.floor((c.y+20)/1.3)+(c.q&1))%3]:null);
    return {def:{id:"random",name:{ja:"ランダム",en:"Random"},icon:"🎲",side,sol,col,random:true},tries};
  }
  return null;
}
const api={SQ3,DIRS,makeBoard,hexDist,runs,cluesOf,lineSolve,solve,chooseHidden,buildPuzzle,randomPuzzle};
if(typeof module!=="undefined")module.exports=api;else root.HexCore=api;
})(this);
