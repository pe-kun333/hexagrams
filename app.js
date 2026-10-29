/* Hexagrams UI */
(function(){
"use strict";
const {SQ3,makeBoard,runs,cluesOf,solve,buildPuzzle,randomPuzzle}=window.HexCore;
const {COLORS,PUZZLES}=window.HexPuzzles;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const NS="http://www.w3.org/2000/svg";
const el=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e};

/* ---------------- i18n ---------------- */
const T={
ja:{list:"パズル一覧",rndGroup:"生成した問題",random:"ランダム生成",s4:"小",s5:"中",s6:"大",s7:"特大",rndBtn:"🎲 問題を作る",
 rndInfo:"線の論理だけで答えが1つに決まる問題が出るまで作り直します。",rndDone:"{n}回目で、答えが1つに決まる問題ができました（{ms}ms）。",rndFail:"条件に合う問題を作れませんでした。もう一度お試しください",
 settings:"設定",hard:"ハードモード",hardDesc:"数字の一部を隠します（答えは1つのまま）",checkMiss:"ミスチェック",checkMissDesc:"間違って塗ったマスをその場で赤く表示",
 longPress:"長押しで×印",longPressDesc:"タッチ操作のとき",wipe:"保存データを消去",wipeQ:"すべての進み具合・クリア記録・設定を消去します。よろしいですか？",wiped:"保存データを消去しました",
 privacy:"進み具合と記録はこの端末のブラウザ内（localStorage）にだけ保存されます。外部への通信はしません。",
 tools:"操作",inputMode:"入力モード",fill:"塗る",mark:"×印",undo:"戻す",hint:"ヒント",reset:"リセット",answer:"答え",
 zoom:"ズーム",zoomIn:"拡大",zoomOut:"縮小",zoomFit:"全体を表示",time:"タイム",miss:"ミス",hints:"ヒント",howto:"遊び方",close:"閉じる",
 foot:"マスに触れると、そのマスを通る3本の列と数字が光ります。2本指でズーム・移動できます。",
 kbdHelp:"矢印キーでカーソル移動、スペースで塗る、Xで×印、Deleteで消す、Ctrl+Zで元に戻す。",
 tagline:"六角形のノノグラム ― 3方向の数字から絵を描き出すロジックパズル",play:"はじめる",cont:"つづきから",
 tmeta:"{c} / {n} 問クリア",exQ:"例題",exA:"答え",
 d1:"初級",d2:"中級",d3:"上級",uniq:"✔ 一意",uniqT:"3方向の列の論理だけで答えが1つに決まります",notUniq:"⚠ 推測が必要",cleared:"クリア済",best:"ベスト",
 cells:"{n}マス",
 toastReset:"リセットしました",toastFixed:"間違っているマスを1つ直しました",toastHint:"正しいマスを1つ塗りました",toastNoHint:"塗り残しはありません",
 toastAns:"答えを表示しました（クリア扱いにはなりません）",toastWrong:"そのマスは塗らないマスです",
 toastHardOn:"ハードモード：{n}個の数字を隠しました（答えは1つのままです）",toastHardOff:"ハードモードをOFFにしました",
 toastLP:"長押し：×印モード",copied:"結果をコピーしました",copyFail:"コピーできませんでした。下の文をコピーしてください",
 clear:"クリア！",cardTime:"タイム {t}",cardHints:"ヒント {n}回",perfect:"✨ ノーミス・ノーヒント！",nomiss:"✔ ノーミス",misses:"間違えて塗った回数：{n}",
 newBest:"🏅 ベスト更新！",next:"次のパズルへ",copy:"結果をコピー",again:"もう一度遊ぶ",already:"クリア済み ・ ベスト {t}",
 shareClear:"クリア",shareNoMiss:"ノーミス",shareNoHint:"ノーヒント",shareHard:"ハード",shareMiss:"ミス{n}",
 boardLabel:"{name}の盤面。{n}マス。",
 cellSay:"{r}段目 {k}番目：{st}。横 {a}、右下がり {b}、右上がり {c}",stF:"塗り",stX:"×印",stE:"空き",hidden:"？",
 howHtml:`<h4>ルール</h4><ul>
<li>六角形の盤面には <b>横・右下がり・右上がり</b> の3方向の列があります。</li>
<li>列の外側の数字は、その列で<b>連続して塗るマスの数</b>です。「2 1」なら、2マス続けて塗り、1マス以上あけて1マス塗ります。0 はその列に塗るマスがないことを表します。</li>
<li>数字は<b>線の向き（横は左→右、斜めは外側へ向かう向き）</b>の順に並んでいます。</li>
<li>すべての列の数字を満たすと絵が完成します。条件を満たした列の数字は灰色になります。</li>
<li>どの問題も、推測なしで<b>列ごとの論理だけで答えが1つに決まる</b>ことを確認済みです。</li></ul>
<h4>操作</h4><ul>
<li><b>マウス</b>：左クリックで塗る、右クリックで×印。ドラッグでまとめて塗れます。</li>
<li><b>タッチ</b>：下の「塗る／×印」で切り替え。なぞるとまとめて塗れます。長押しで×印（設定で切替）。2本指でズーム・移動。</li>
<li><b>キーボード</b>：<kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> 移動、<kbd>Space</kbd> 塗る、<kbd>X</kbd> ×印、<kbd>Delete</kbd> 消す、<kbd>Ctrl</kbd>+<kbd>Z</kbd> 戻す、<kbd>+</kbd>/<kbd>-</kbd> ズーム。</li></ul>
<h4>そのほか</h4><ul><li>ハードモードでは数字の一部が「？」になります。それでも答えが1つに決まるように隠す数字を選んでいます。</li>
<li>進み具合とベストタイムは自動で保存されます。</li></ul>`},
en:{list:"Puzzles",rndGroup:"Generated",random:"Random puzzle",s4:"S",s5:"M",s6:"L",s7:"XL",rndBtn:"🎲 Generate",
 rndInfo:"Regenerates until the puzzle has a single solution reachable by line logic alone.",rndDone:"Unique puzzle found on try {n} ({ms} ms).",rndFail:"Couldn't generate a suitable puzzle. Please try again.",
 settings:"Settings",hard:"Hard mode",hardDesc:"Hides some clues (still a single solution)",checkMiss:"Mistake check",checkMissDesc:"Highlights wrongly filled cells in red",
 longPress:"Long-press to mark ×",longPressDesc:"For touch input",wipe:"Delete saved data",wipeQ:"Delete all progress, records and settings?",wiped:"Saved data deleted",
 privacy:"Progress and records are stored only in this browser (localStorage). Nothing is sent anywhere.",
 tools:"Tools",inputMode:"Input mode",fill:"Fill",mark:"Mark ×",undo:"Undo",hint:"Hint",reset:"Reset",answer:"Answer",
 zoom:"Zoom",zoomIn:"Zoom in",zoomOut:"Zoom out",zoomFit:"Fit board",time:"Time",miss:"Miss",hints:"Hints",howto:"How to play",close:"Close",
 foot:"Hover or touch a cell to highlight its three lines and clues. Pinch with two fingers to zoom and pan.",
 kbdHelp:"Arrow keys move the cursor, Space fills, X marks, Delete clears, Ctrl+Z undoes.",
 tagline:"Hexagonal nonograms — a logic puzzle where three directions of clues reveal a picture",play:"Play",cont:"Continue",
 tmeta:"{c} / {n} cleared",exQ:"Puzzle",exA:"Solution",
 d1:"Easy",d2:"Medium",d3:"Hard",uniq:"✔ Unique",uniqT:"Uniquely solvable using line logic on all three directions",notUniq:"⚠ Needs guessing",cleared:"Cleared",best:"Best",
 cells:"{n} cells",
 toastReset:"Board reset",toastFixed:"Fixed one wrong cell",toastHint:"Filled one correct cell",toastNoHint:"Nothing left to fill",
 toastAns:"Showing the answer (doesn't count as a clear)",toastWrong:"That cell should stay empty",
 toastHardOn:"Hard mode: {n} clues hidden (still a single solution)",toastHardOff:"Hard mode off",
 toastLP:"Long-press: marking ×",copied:"Result copied",copyFail:"Couldn't copy automatically. Please copy the text below",
 clear:"Solved!",cardTime:"Time {t}",cardHints:"{n} hints",perfect:"✨ No mistakes, no hints!",nomiss:"✔ No mistakes",misses:"Wrong fills: {n}",
 newBest:"🏅 New best!",next:"Next puzzle",copy:"Copy result",again:"Play again",already:"Cleared · Best {t}",
 shareClear:"cleared",shareNoMiss:"no mistakes",shareNoHint:"no hints",shareHard:"hard",shareMiss:"{n} mistakes",
 boardLabel:"{name} board, {n} cells.",
 cellSay:"Row {r}, cell {k}: {st}. Row clue {a}, down-right {b}, up-right {c}",stF:"filled",stX:"marked",stE:"empty",hidden:"?",
 howHtml:`<h4>Rules</h4><ul>
<li>The hexagonal board has lines in <b>three directions</b>: horizontal, down-right and up-right.</li>
<li>The numbers outside each line give the lengths of the <b>runs of filled cells</b> in that line, in order. "2 1" means a run of 2, at least one gap, then a run of 1. 0 means the line is empty.</li>
<li>Numbers are listed <b>along the line direction</b> (left→right for rows, outward for diagonals).</li>
<li>Satisfy every line to reveal the picture. Satisfied clues turn grey.</li>
<li>Every puzzle is verified to have a <b>single solution reachable by line logic alone</b> — no guessing.</li></ul>
<h4>Controls</h4><ul>
<li><b>Mouse</b>: left-click fills, right-click marks ×. Drag to paint several cells.</li>
<li><b>Touch</b>: switch Fill / Mark × at the bottom, slide to paint, long-press to mark ×. Two fingers to zoom and pan.</li>
<li><b>Keyboard</b>: <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> move, <kbd>Space</kbd> fill, <kbd>X</kbd> mark, <kbd>Delete</kbd> clear, <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo, <kbd>+</kbd>/<kbd>-</kbd> zoom.</li></ul>
<h4>More</h4><ul><li>Hard mode replaces some clues with "?" — chosen so the solution is still unique.</li>
<li>Progress and best times are saved automatically.</li></ul>`}
};
let LANG="ja";
const t=(k,v)=>{let s=(T[LANG][k]!==undefined?T[LANG][k]:T.ja[k]);if(v)for(const x in v)s=s.split("{"+x+"}").join(v[x]);return s};
const pname=p=>p.name[LANG]||p.name.ja;
/* grid values: 0 empty, 1 colour 1 (the only colour in mono puzzles), 2 mark ×, 3.. colour 2.. */
const colOf=v=>v===1?1:(v>=3?v-1:0),vOf=c=>c===1?1:(c>=2?c+1:0);
const isQ=()=>!!(S.P&&S.P.quest);
const cellColor=(P,i)=>P.pal?P.pal[P.sol[i]]:(COLORS[P.col[i]]||COLORS.y);
const isGiven=i=>!!(S.P&&S.P.given&&S.P.given[i]);
const HOOK={}; // filled in by quest.js
const lumHex=h=>{const n=parseInt(h.slice(1),16);return (0.2126*(n>>16)+0.7152*((n>>8)&255)+0.0722*(n&255))/255};

/* ---------------- storage ---------------- */
const KEY="hexagrams.v1";
let DB={v:1,settings:{},p:{}};
function loadDB(){try{const j=JSON.parse(localStorage.getItem(KEY)||"null");if(j&&j.v===1)DB=Object.assign({v:1,settings:{},p:{}},j)}catch(e){}}
let saveT=0;
let quotaWarned=0;
function saveDB(now){clearTimeout(saveT);const f=()=>{try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){if(Date.now()-quotaWarned>20000){quotaWarned=Date.now();toast(t("quota"))}}};if(now)f();else saveT=setTimeout(f,150)}
function rec(id){return DB.p[id]||(DB.p[id]={})}

/* ---------------- state ---------------- */
const S={P:null,grid:null,hist:[],mode:"fill",hard:false,hints:0,miss:0,shown:false,won:false,base:0,t0:0,tick:null,hover:-1,cur:-1,curX:null,
  drag:null,pcol:1,checkMiss:false,longPress:true,view:null,ptrs:new Map(),gesture:null,suppress:false,lpTimer:0};
const BUILT=PUZZLES.map(buildPuzzle);
let LIST=BUILT.slice();
const SIZE_KEY={4:"s4",5:"s5",6:"s6",7:"s7"};

/* ---------------- board drawing ---------------- */
function hexPts(cx,cy,s){const p=[];for(let k=0;k<6;k++){const a=Math.PI/180*(60*k-30);p.push((cx+s*Math.cos(a)).toFixed(2)+","+(cy+s*Math.sin(a)).toFixed(2))}return p.join(" ")}
const DIRV=[[-1,0],[Math.cos(Math.PI/3),Math.sin(Math.PI/3)],[Math.cos(-Math.PI/3),Math.sin(-Math.PI/3)]];
/* Clues are upright numbers stacked outward from the line end:
   rows: to the left of the first cell (last number nearest the board);
   diagonals: beyond the last cell along the line direction (first number nearest the board). */
function drawBoard(svgEl,P,opt){
  opt=opt||{};const B=P.B,s=20,u=s*SQ3,fs=s*(B.side>=7?1.0:0.95);
  svgEl.innerHTML="";svgEl.classList.remove("solved");svgEl.classList.toggle("lightbd",!!(P.pal&&P.K>1&&lumHex(P.pal[0])>0.5));svgEl.classList.toggle("colorbd",!!(P.pal&&P.K>1));
  const defs=el("defs",{});
  defs.innerHTML=`<linearGradient id="gF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd257"/><stop offset="1" stop-color="#e09a14"/></linearGradient><linearGradient id="gFh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe28a"/><stop offset="1" stop-color="#f0ac2a"/></linearGradient>`;
  svgEl.appendChild(defs);
  const g=el("g",{});svgEl.appendChild(g);
  const X=c=>c.x*u,Y=c=>c.y*u;
  const gl=el("g",{});g.appendChild(gl);
  const guides=B.lines.map(l=>{const a=B.cells[l.cells[0]],b=B.cells[l.cells[l.cells.length-1]];const e=el("line",{x1:X(a),y1:Y(a),x2:X(b),y2:Y(b),class:"guide"});gl.appendChild(e);return e});
  const cells=[],xs=[];
  B.cells.forEach((c,i)=>{
    const poly=el("polygon",{points:hexPts(X(c),Y(c),s*0.96),class:"cell"+(P.given&&P.given[i]?" gv":""),"data-i":i});
    const d=s*0.38,x=X(c),y=Y(c);
    const xm=el("path",{d:`M${x-d},${y-d}L${x+d},${y+d}M${x+d},${y-d}L${x-d},${y+d}`,class:"xm"+(P.given&&P.given[i]?" gv":"")});
    g.appendChild(poly);g.appendChild(xm);cells.push(poly);xs.push(xm);
    if(P.given&&P.given[i])g.appendChild(el("circle",{cx:x,cy:y+s*0.52,r:s*0.1,class:"gvdot"}));
  });
  const clues=B.lines.map((l,li)=>{
    const cc=P.cclues?(P.cclues[li].length?P.cclues[li]:[{n:0,c:0}]):null;
    const grp=el("g",{class:"clue"+(cc?" cc":""),"font-size":fs});
    const nums=cc?cc.map(x=>x.n):(P.clues[li].length?P.clues[li]:[0]);
    const cseq=cc?(f0=>f0===0?cc.slice().reverse():cc)(l.f):null;
    const f=l.f,[dx,dy]=DIRV[f];
    const anchor=B.cells[f===0?l.cells[0]:l.cells[l.cells.length-1]];
    const seq=f===0?nums.slice().reverse():nums; // ordered from board outward
    let dist=u*0.78,prevW=0,first=0;const texts=[],badges=[];
    seq.forEach((n,k)=>{
      const w=String(n).length*fs*0.6;
      if(k>0)dist+=f===0?(prevW/2+w/2+fs*0.42):fs*1.08;else first=f===0?w/2:fs*0.55;
      const tx=X(anchor)+dx*dist,ty=Y(anchor)+dy*dist;
      const te=el("text",{x:tx.toFixed(1),y:ty.toFixed(1)});te.textContent=n;texts.push(te);
      if(cseq&&cseq[k].c){const col=P.pal[cseq[k].c],bw=Math.max(fs*0.92,w+fs*0.32),bh=fs*0.98;
        badges.push(el("rect",{class:"cbadge",x:(tx-bw/2).toFixed(1),y:(ty-bh/2).toFixed(1),width:bw.toFixed(1),height:bh.toFixed(1),rx:(fs*0.24).toFixed(1),fill:col}));
        te.style.fill=lumHex(col)>0.55?"#1a140c":"#fff";te.dataset.c=cseq[k].c}
      prevW=w;
    });
    // lane: a faint pill behind the numbers so each stack reads as one line's clue
    const last=f===0?prevW/2:fs*0.55,st0=u*0.78-first-fs*0.22,len=dist+last+fs*0.22-st0,hh=fs*1.12;
    const ang=Math.atan2(dy,dx)*180/Math.PI,ax=X(anchor)+dx*st0,ay=Y(anchor)+dy*st0;
    grp.appendChild(el("rect",{class:"lane"+(l.v&1?" alt":""),x:0,y:(-hh/2).toFixed(1),width:len.toFixed(1),height:hh.toFixed(1),rx:(hh/2).toFixed(1),transform:`translate(${ax.toFixed(1)} ${ay.toFixed(1)}) rotate(${ang.toFixed(1)})`}));
    badges.forEach(b=>grp.appendChild(b));texts.forEach(te=>grp.appendChild(te));
    g.appendChild(grp);return grp;
  });
  const bb=g.getBBox(),pad=8;
  const vb={x:bb.x-pad,y:bb.y-pad,w:bb.width+pad*2,h:bb.height+pad*2};
  svgEl.setAttribute("viewBox",`${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  if(opt.solved){svgEl.classList.add("solved");cells.forEach((e,i)=>{if(P.sol[i]){e.classList.add("f");e.style.fill=cellColor(P,i)}})}
  return {cells,xs,clues,guides,vb};
}
let D=null; // current board elements
const svg=$("#board");

/* ---------------- view (zoom / pan) ---------------- */
function applyView(){const v=S.view;if(!v)return;const w=D.vb.w/v.z,h=D.vb.h/v.z;svg.setAttribute("viewBox",`${v.cx-w/2} ${v.cy-h/2} ${w} ${h}`)}
function fitView(){S.view={cx:D.vb.x+D.vb.w/2,cy:D.vb.y+D.vb.h/2,z:1};applyView()}
function clampView(){const v=S.view;v.z=Math.max(1,Math.min(4,v.z));const hw=D.vb.w/2,hh=D.vb.h/2,mx=hw-hw/v.z,my=hh-hh/v.z,cx0=D.vb.x+hw,cy0=D.vb.y+hh;
  v.cx=Math.max(cx0-mx,Math.min(cx0+mx,v.cx));v.cy=Math.max(cy0-my,Math.min(cy0+my,v.cy))}
function svgPoint(cx,cy){const m=svg.getScreenCTM();if(!m)return{x:0,y:0};const p=new DOMPoint(cx,cy).matrixTransform(m.inverse());return{x:p.x,y:p.y}}
function zoomAt(factor,clientX,clientY){
  const v=S.view;const before=clientX!==undefined?svgPoint(clientX,clientY):{x:v.cx,y:v.cy};
  v.z*=factor;clampView();applyView();
  if(clientX!==undefined){const after=svgPoint(clientX,clientY);v.cx+=before.x-after.x;v.cy+=before.y-after.y;clampView();applyView()}
}

/* ---------------- render state ---------------- */
function crunsOf(vals){const o=[];let c=0,n=0;for(const v of vals){if(v===c&&v)n++;else{if(c&&n)o.push(c+":"+n);c=v;n=v?1:0}}if(c&&n)o.push(c+":"+n);return o.join(" ")}
function lineDone(li){const l=S.P.B.lines[li];
  if(S.P.cclues)return crunsOf(l.cells.map(i=>colOf(S.grid[i])))===S.P.cclues[li].map(x=>x.c+":"+x.n).join(" ");
  const a=runs(l.cells.map(i=>S.grid[i]===1?1:0)),b=S.P.clues[li];return a.length===b.length&&a.every((v,k)=>v===b[k])}
function isHidden(li){return S.hard&&!isQ()&&S.P.hidden[li]}
function updateAll(){
  const B=S.P.B,focus=S.hover>=0?S.hover:(S.kbd?S.cur:-1);
  const hl=new Set(),hll=new Set();
  if(focus>=0&&!S.won&&!S.shown)B.cellLines[focus].forEach(li=>{hll.add(li);B.lines[li].cells.forEach(i=>hl.add(i))});
  const multi=S.P.K>1;
  D.cells.forEach((e,i)=>{const v=S.grid[i],c=colOf(v);
    e.classList.toggle("f",c>0);e.classList.toggle("hl",hl.has(i));e.classList.toggle("hov",i===S.hover);e.classList.toggle("cur",i===S.cur&&S.kbd);
    e.classList.toggle("bad",S.checkMiss&&c>0&&c!==S.P.sol[i]&&!S.won);
    D.xs[i].classList.toggle("on",v===2);
    e.style.fill=multi&&c>0?S.P.pal[c]:((S.won||S.shown)&&c>0?cellColor(S.P,i):"");
  });
  D.clues.forEach((e,li)=>{const hid=isHidden(li);e.classList.toggle("hid",hid);
    if(hid!==!!e._hid){e._hid=hid;const nums=S.P.clues[li].length?S.P.clues[li]:[0];const tx=[...e.querySelectorAll("text")];
      tx.forEach((x,k)=>{x.textContent=hid?(k===0?t("hidden"):""):x.dataset.n||x.textContent});}
    e.classList.toggle("done",!hid&&lineDone(li));e.classList.toggle("hl",hll.has(li))});
  D.guides.forEach((e,li)=>e.classList.toggle("on",hll.has(li)));
  $("#hints").textContent=S.hints;
  $("#miss").textContent=S.checkMiss?S.miss:"—";
  $("#undoBtn").disabled=!S.hist.length||S.won||S.shown;
}
function toast(msg){const e=$("#toast");e.textContent=msg;e.classList.add("show");clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove("show"),2400)}
function say(msg){const e=$("#live");e.textContent="";setTimeout(()=>e.textContent=msg,30)}
const fmt=ms=>{const s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
const elapsed=()=>S.base+(S.t0?Date.now()-S.t0:0);
function startTimer(){if(S.t0||S.won||S.shown)return;S.t0=Date.now();S.tick=setInterval(()=>{$("#timer").textContent=fmt(elapsed())},500)}
function stopTimer(){if(S.t0){S.base=elapsed();S.t0=0}clearInterval(S.tick);S.tick=null;$("#timer").textContent=fmt(S.base)}

function diffBadge(p){return `<span class="bd d${p.diff}">${t("d"+p.diff)}</span>`}
function renderList(){
  const groups=[4,5,6,7];let h="";
  for(const side of groups){const ps=LIST.filter(p=>p.side===side&&!p.random);if(!ps.length)continue;
    h+=`<h3>${t(SIZE_KEY[side])} · ${t("cells",{n:ps[0].B.cells.length})}</h3>`;
    h+=ps.map(card).join("")}
  const r=LIST.find(p=>p.random);if(r)h+=`<h3>${t("rndGroup")}</h3>`+card(r);
  $("#list").innerHTML=`<h3 style="margin-top:2px">${t("list")}</h3>`+h;
  const c=BUILT.filter(p=>(DB.p[p.id]||{}).done).length;$("#tmeta").textContent=t("tmeta",{c,n:BUILT.length});
}
function card(p){const r=DB.p[p.id]||{};
  return `<button class="pz ${S.P&&S.P.id===p.id?"on":""}" data-pz="${p.id}" aria-current="${S.P&&S.P.id===p.id}"><span class="ic" aria-hidden="true">${p.icon}</span><span><div class="nm">${pname(p)}</div>
   <div class="sm">${diffBadge(p)}<span>${t(SIZE_KEY[p.side])}</span>
   ${p.unique?`<span class="bd ok" title="${t("uniqT")}">${t("uniq")}</span>`:`<span class="bd ng">${t("notUniq")}</span>`}
   ${r.done?`<span class="bd cl">${t("cleared")}${r.best?" · "+fmt(r.best):""}</span>`:""}</div></span></button>`}
function setTitle(){const p=S.P;
  if(p.quest)$("#ptitle").innerHTML=`${p.icon} ${p.qname.replace(/</g,"&lt;")} · ${t("stageN",{k:p.quest.k+1,n:p.quest.n})} <span class="bd d${p.diff} dl">${t("d"+p.diff)}</span> <span style="font-size:12px">${t("cells",{n:p.B.cells.length})}${p.K>1?" · "+t("colorsN",{n:p.K}):""}</span>`;
  else $("#ptitle").innerHTML=`${p.icon} ${pname(p)} <span class="bd d${p.diff} dl">${t("d"+p.diff)}</span> <span style="font-size:12px">${t(SIZE_KEY[p.side])} · ${t("cells",{n:p.B.cells.length})}</span>`;
  svg.setAttribute("aria-label",t("boardLabel",{name:pname(p),n:p.B.cells.length}))}

/* ---------------- load / save puzzle ---------------- */
function persist(){
  if(!S.P||S.shown)return;const r=rec(S.P.id);
  r.g=S.grid.join("");r.t=elapsed();r.h=S.hints;r.m=S.miss;
  DB.settings.last=S.P.id;saveDB();
}
function load(p,opts){
  opts=opts||{};stopTimer();
  S.P=p;S.hist=[];S.shown=false;S.won=false;S.hover=-1;S.drag=null;S.cur=Math.floor(p.B.cells.length/2);S.curX=null;
  const r=DB.p[p.id]||{};
  const n=p.B.cells.length;
  if(!opts.fresh&&r.g&&r.g.length===n){S.grid=[...r.g].map(Number);S.base=r.t||0;S.hints=r.h||0;S.miss=r.m||0}
  else{S.grid=new Array(n).fill(0);S.base=0;S.hints=0;S.miss=0}
  if(p.given)p.given.forEach((g,i)=>{if(g)S.grid[i]=p.sol[i]?vOf(p.sol[i]):2});
  S.pcol=1;buildPal();$("#mapBtn").hidden=!p.quest;document.body.classList.toggle("inquest",!!p.quest);
  S.t0=0;$("#timer").textContent=fmt(S.base);$("#overlay").classList.remove("show");
  D=drawBoard(svg,p);
  D.clues.forEach((g,li)=>[...g.querySelectorAll("text")].forEach(x=>x.dataset.n=x.textContent));
  fitView();setTitle();renderList();
  const solvedNow=S.grid.every((v,i)=>colOf(v)===p.sol[i]);
  if(r.done&&solvedNow){S.won=true;svg.classList.add("solved");updateAll();showCard({already:true})}
  else updateAll();
  if(!p.quest)DB.settings.last=p.id;saveDB();
  if(opts.fresh)persist();
}
function buildPal(){const p=S.P,e=$("#palSeg");
  if(!p||!(p.K>1)){e.hidden=true;e.innerHTML="";return}
  e.hidden=false;e.innerHTML=p.pal.slice(1).map((c,k)=>`<button data-c="${k+1}" role="radio" aria-checked="${S.pcol===k+1}" class="${S.pcol===k+1?"on":""}" aria-label="${t("colorK",{k:k+1})}" title="${t("colorK",{k:k+1})} (${k+1})"><span class="sw" style="background:${c}"></span><span class="k">${k+1}</span></button>`).join("")}
function setPcol(c){S.pcol=c;$$("#palSeg button").forEach(b=>{const on=+b.dataset.c===c;b.classList.toggle("on",on);b.setAttribute("aria-checked",on)});if(S.mode!=="fill")setMode("fill")}

/* ---------------- input ---------------- */
function push(){S.hist.push(S.grid.slice());if(S.hist.length>400)S.hist.shift()}
function cellAt(x,y){const e=document.elementFromPoint(x,y);return e&&e.dataset&&e.dataset.i!==undefined&&svg.contains(e)?+e.dataset.i:-1}
function paint(i){
  const d=S.drag;if(!d||d.done.has(i))return;d.done.add(i);
  if(S.grid[i]!==d.from||isGiven(i))return;
  S.grid[i]=d.to;d.changed=true;
  if(colOf(d.to)>0&&colOf(d.to)!==S.P.sol[i]){S.miss++;if(S.checkMiss)toast(t("toastWrong"))}
}
function beginStroke(i,mark,pointerType){
  const fv=S.P.K>1?vOf(S.pcol):1;
  const from=S.grid[i];const to=mark?(from===2?0:2):(from===fv?0:fv);
  push();S.drag={from,to,done:new Set(),changed:false,start:i,mark,missBefore:S.miss};startTimer();paint(i);
  clearTimeout(S.lpTimer);
  if(pointerType==="touch"&&!mark&&S.longPress){
    S.lpTimer=setTimeout(()=>{const d=S.drag;if(!d||d.done.size!==1||S.gesture)return;
      // convert this stroke into a mark stroke
      S.grid=S.hist[S.hist.length-1].slice();S.miss=d.missBefore;const f=S.grid[i];
      S.drag={from:f,to:f===2?0:2,done:new Set(),changed:false,start:i,mark:true,missBefore:S.miss};paint(i);
      if(navigator.vibrate)try{navigator.vibrate(12)}catch(e){}
      toast(t("toastLP"));updateAll()},480);
  }
}
function endStroke(){clearTimeout(S.lpTimer);if(!S.drag)return;if(!S.drag.changed)S.hist.pop();S.drag=null;updateAll();persist();checkWin()}
function cancelStroke(){clearTimeout(S.lpTimer);if(!S.drag)return;const prev=S.hist.pop();if(prev)S.grid=prev;S.miss=S.drag.missBefore;S.drag=null;updateAll()}

svg.addEventListener("contextmenu",e=>e.preventDefault());
svg.addEventListener("pointerdown",e=>{
  S.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  try{svg.setPointerCapture(e.pointerId)}catch(_){}
  e.preventDefault();
  if(S.ptrs.size>=2){ // pinch / pan
    cancelStroke();const [a,b]=[...S.ptrs.values()];
    S.gesture={d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2};S.suppress=true;return}
  if(e.button===1||(e.shiftKey&&e.pointerType==="mouse")){S.gesture={pan:true,mx:e.clientX,my:e.clientY};return}
  S.suppress=false;S.kbd=false;
  if(S.won||S.shown)return;
  const i=e.target.dataset?+e.target.dataset.i:NaN;if(isNaN(i))return;
  if(isGiven(i)){toast(t("givenCell"));return}
  beginStroke(i,e.button===2||S.mode==="mark",e.pointerType);S.hover=e.pointerType==="mouse"?i:-1;S.cur=i;updateAll();
});
svg.addEventListener("pointermove",e=>{
  if(S.ptrs.has(e.pointerId))S.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const g=S.gesture;
  if(g){
    if(g.pan&&S.ptrs.size===1){const v=S.view,m=svg.getScreenCTM();v.cx-=(e.clientX-g.mx)/m.a;v.cy-=(e.clientY-g.my)/m.d;g.mx=e.clientX;g.my=e.clientY;clampView();applyView();return}
    if(S.ptrs.size>=2){const [a,b]=[...S.ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
      const m=svg.getScreenCTM();S.view.cx-=(mx-g.mx)/m.a;S.view.cy-=(my-g.my)/m.d;clampView();applyView();
      if(g.d>10)zoomAt(d/g.d,mx,my);g.d=d;g.mx=mx;g.my=my;}
    return}
  if(S.suppress)return;
  const i=cellAt(e.clientX,e.clientY);
  if(S.drag&&i>=0){if(i!==S.drag.start)clearTimeout(S.lpTimer);paint(i)}
  if(e.pointerType==="mouse"||S.drag){const h=i;if(h!==S.hover){S.hover=h;if(h>=0)S.cur=h;updateAll()}else if(S.drag)updateAll()}
});
function ptrEnd(e){
  S.ptrs.delete(e.pointerId);
  if(S.gesture){if(S.ptrs.size===0){S.gesture=null}else if(!S.gesture.pan&&S.ptrs.size<2){S.gesture=null}return}
  endStroke();
  if(e.pointerType!=="mouse"){S.hover=-1;updateAll()}
}
svg.addEventListener("pointerup",ptrEnd);svg.addEventListener("pointercancel",e=>{S.ptrs.delete(e.pointerId);if(S.drag)endStroke();if(!S.ptrs.size)S.gesture=null});
svg.addEventListener("pointerleave",e=>{if(!S.drag&&e.pointerType==="mouse"){S.hover=-1;updateAll()}});
svg.addEventListener("wheel",e=>{e.preventDefault();zoomAt(e.deltaY<0?1.15:1/1.15,e.clientX,e.clientY)},{passive:false});
["gesturestart","gesturechange"].forEach(n=>$("#wrap").addEventListener(n,e=>e.preventDefault()));
$("#wrap").addEventListener("touchmove",e=>e.preventDefault(),{passive:false});

/* keyboard */
function moveCursor(dir){
  const B=S.P.B,c=B.cells[S.cur];if(!c)return;
  let tgt=null;
  if(dir==="left"||dir==="right"){const q=c.q+(dir==="left"?-1:1);const j=B.idx.get(q+","+c.r);if(j!==undefined)tgt=j;S.curX=null}
  else{const r=c.r+(dir==="up"?-1:1);if(S.curX===null)S.curX=c.x;let best=-1,bd=1e9;
    B.cells.forEach((d,j)=>{if(d.r===r){const dd=Math.abs(d.x-S.curX);if(dd<bd-1e-6){bd=dd;best=j}}});if(best>=0&&bd<1)tgt=best}
  if(tgt!==null){S.cur=tgt;announce()}
}
function announce(){const B=S.P.B,c=B.cells[S.cur],v=S.grid[S.cur];
  const row=B.lines[B.cellLines[S.cur][0]];const k=row.cells.indexOf(S.cur)+1;
  const cl=f=>{const li=B.cellLines[S.cur][f];if(S.P.cclues){const x=S.P.cclues[li];return x.length?x.map(o=>o.n+(S.P.K>1?"("+t("colorK",{k:o.c})+")":"")).join(" "):"0"}
    return isHidden(li)?t("hidden"):(S.P.clues[li].length?S.P.clues[li].join(" "):"0")};
  const cv=colOf(v);let st=cv>0?(S.P.K>1?t("colorK",{k:cv}):t("stF")):v===2?t("stX"):t("stE");if(isGiven(S.cur))st+=" ("+t("givenShort")+")";
  say(t("cellSay",{r:c.r+B.R+1,k,st,a:cl(0),b:cl(1),c:cl(2)}))}
function keySet(to){if(S.won||S.shown)return;const i=S.cur;if(isGiven(i)){toast(t("givenCell"));return}const fv=S.P.K>1?vOf(S.pcol):1;const from=S.grid[i];const val=to==="fill"?(from===fv?0:fv):to==="mark"?(from===2?0:2):0;
  if(val===from)return;push();startTimer();S.grid[i]=val;if(colOf(val)>0&&colOf(val)!==S.P.sol[i]){S.miss++;if(S.checkMiss)toast(t("toastWrong"))}updateAll();persist();announce();checkWin()}
svg.addEventListener("focus",()=>{S.kbd=true;updateAll()});
svg.addEventListener("blur",()=>{S.kbd=false;updateAll()});
svg.addEventListener("keydown",e=>{
  const k=e.key;const map={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"};
  if(map[k]){e.preventDefault();S.kbd=true;moveCursor(map[k]);updateAll();return}
  if(k===" "||k==="Enter"){e.preventDefault();keySet("fill");return}
  if(k==="x"||k==="X"){e.preventDefault();keySet("mark");return}
  if(k==="Delete"||k==="Backspace"){e.preventDefault();keySet("clear");return}
});
document.addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();undo();return}
  if(e.key==="Escape"){closeHow();closeDrawer();if(HOOK.esc)HOOK.esc();return}
  const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);if(typing||e.ctrlKey||e.metaKey||e.altKey)return;
  if(S.P&&S.P.K>1&&/^[1-4]$/.test(e.key)&&+e.key<=S.P.K&&$("#titleScreen").hidden){setPcol(+e.key);return}
  if(e.key==="+"||e.key==="="){zoomAt(1.25)}else if(e.key==="-"){zoomAt(0.8)}else if(e.key==="0"){fitView()}
});

/* ---------------- actions ---------------- */
function undo(){if(!S.hist.length||S.won||S.shown)return;S.grid=S.hist.pop();updateAll();persist()}
function checkWin(){
  if(S.won||S.shown)return;
  if(!S.grid.every((v,i)=>colOf(v)===S.P.sol[i]))return;
  S.won=true;stopTimer();
  S.grid=S.grid.map(v=>colOf(v)>0?v:0);svg.classList.add("solved");S.hover=-1;updateAll();
  const r=rec(S.P.id),time=S.base;const newBest=!r.best||time<r.best;
  r.done=true;if(newBest)r.best=time;r.lastT=time;r.lastHints=S.hints;r.lastMiss=S.miss;r.lastHard=S.hard;r.g=S.grid.join("");r.t=time;r.h=S.hints;r.m=S.miss;saveDB(true);
  if(S.P.quest&&HOOK.onWin)HOOK.onWin(S.P);
  renderList();showCard({newBest});confetti();
}
function shareText(){
  const r=DB.p[S.P.id]||{};const time=S.won?S.base:(r.lastT||0);const miss=S.won?S.miss:(r.lastMiss||0),hints=S.won?S.hints:(r.lastHints||0);
  const parts=["Hexagrams",`#${pname(S.P)}`,t("shareClear"),fmt(time)];
  if(miss===0)parts.push(t("shareNoMiss"));else parts.push(t("shareMiss",{n:miss}));
  if(hints===0)parts.push(t("shareNoHint"));
  if(S.hard)parts.push(t("shareHard"));
  const url=location.href.split("#")[0].split("?")[0];
  return parts.join(" ")+"\n"+url;
}
function showCard(o){
  const r=DB.p[S.P.id]||{};let h;
  if(o.already){h=`<h2>✔ ${pname(S.P)}</h2><div class="st">${t("already",{t:fmt(r.best||r.t||0)})}</div>`}
  else{h=`<h2>🎉 ${t("clear")} 「${pname(S.P)}」</h2><div class="st">${t("cardTime",{t:fmt(S.base)})} ・ ${t("cardHints",{n:S.hints})}</div>
    ${S.miss===0&&S.hints===0?`<div class="nm">${t("perfect")}</div>`:S.miss===0?`<div class="nm">${t("nomiss")}</div>`:`<div class="st">${t("misses",{n:S.miss})}</div>`}
    ${o.newBest?`<div class="nm" style="color:var(--amber2)">${t("newBest")}</div>`:""}`}
  if(S.P.quest){const info=HOOK.info?HOOK.info(S.P):{};
    if(info.complete)h+=`<div class="nm" style="color:var(--amber2)">${t("qAllDone")}</div>`;else if(info.cleared!==undefined)h+=`<div class="st">${t("qProgress",{c:info.cleared,n:info.total})}</div>`;
    h+=`<div class="row"><button class="btn" id="copyBtn">📋 ${t("copy")}</button>${o.already?`<button class="btn" id="againBtn">${t("again")}</button>`:""}<button class="btn${info.complete||!info.hasNext?" pri":""}" id="qMapBtn">${info.complete?"🎉 "+t("qSeeArt"):"🗺 "+t("qMap")}</button>${!info.complete&&info.hasNext?`<button class="btn pri" id="qNextBtn">${t("qNext")} →</button>`:""}</div>`}
  else h+=`<div class="row"><button class="btn" id="copyBtn">📋 ${t("copy")}</button>${o.already?`<button class="btn" id="againBtn">${t("again")}</button>`:""}<button class="btn pri" id="nextBtn">${t("next")} →</button></div>`;
  h+=`<div id="shareBox"></div><button class="x" id="cardX" aria-label="${t("close")}">✕</button>`;
  S.cardOpts=o;$("#card").innerHTML=h;$("#overlay").classList.add("show");
}
async function copyResult(){
  const txt=shareText();let ok=false;
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(txt);ok=true}}catch(e){}
  if(!ok){try{const ta=document.createElement("textarea");ta.value=txt;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();ok=document.execCommand("copy");ta.remove()}catch(e){}}
  window.__lastShare=txt;
  if(ok)toast(t("copied"));else{toast(t("copyFail"));$("#shareBox").innerHTML=`<textarea readonly rows="3" style="width:100%;margin-top:8px;background:#0f0c08;color:var(--text);border:1px solid var(--line);border-radius:6px">${txt.replace(/</g,"&lt;")}</textarea>`;$("#shareBox textarea").select()}
}
function confetti(){
  const w=$("#wrap");const cols=Object.values(COLORS);
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  for(let k=0;k<60;k++){const d=document.createElement("div");d.className="conf";d.style.left=Math.random()*100+"%";d.style.background=cols[k%cols.length];
    d.style.animationDuration=(1.8+Math.random()*1.8)+"s";d.style.animationDelay=Math.random()*0.6+"s";w.appendChild(d);setTimeout(()=>d.remove(),4500)}
}
$("#undoBtn").onclick=undo;
$("#resetBtn").onclick=()=>{const p=S.P;const r=rec(p.id);delete r.g;delete r.t;delete r.h;delete r.m;load(p,{fresh:true});toast(t("toastReset"))};
$("#hintBtn").onclick=()=>{
  if(S.won||S.shown)return;const P=S.P,wrong=[],todo=[];
  S.grid.forEach((v,i)=>{if(isGiven(i))return;const c=colOf(v);if(c>0&&c!==P.sol[i])wrong.push(i);else if(v===2&&P.sol[i])wrong.push(i);else if(c!==P.sol[i]&&P.sol[i])todo.push(i)});
  const pool=wrong.length?wrong:todo;if(!pool.length){toast(t("toastNoHint"));return}
  const i=pool[Math.floor(Math.random()*pool.length)];
  push();startTimer();S.grid[i]=P.sol[i]?vOf(P.sol[i]):2;S.hints++;
  D.cells[i].classList.remove("hint");void D.cells[i].getBBox();D.cells[i].classList.add("hint");
  toast(wrong.length?t("toastFixed"):t("toastHint"));updateAll();persist();checkWin();
};
$("#ansBtn").onclick=()=>{if(S.won)return;persist();S.shown=true;stopTimer();S.grid=S.P.sol.map(v=>vOf(v));svg.classList.add("solved");S.hover=-1;updateAll();toast(t("toastAns"))};
$("#modeSeg").onclick=e=>{const b=e.target.closest("[data-mode]");if(b)setMode(b.dataset.mode)};
function setMode(m){S.mode=m;$$("#modeSeg button").forEach(x=>{const on=x.dataset.mode===m;x.classList.toggle("on",on);x.setAttribute("aria-checked",on)});DB.settings.mode=m;saveDB()}
$("#hardChk").onchange=e=>{S.hard=e.target.checked;DB.settings.hard=S.hard;saveDB();updateAll();toast(isQ()&&S.hard?t("hardNoQuest"):S.hard?t("toastHardOn",{n:S.P.hiddenCount}):t("toastHardOff"))};
$("#palSeg").onclick=e=>{const b=e.target.closest("[data-c]");if(b)setPcol(+b.dataset.c)};
$("#mapBtn").onclick=()=>{if(S.P&&S.P.quest&&HOOK.openMap){persist();HOOK.openMap(S.P.quest.qid)}};
$("#missChk").onchange=e=>{S.checkMiss=e.target.checked;DB.settings.checkMiss=S.checkMiss;saveDB();updateAll()};
$("#lpChk").onchange=e=>{S.longPress=e.target.checked;DB.settings.longPress=S.longPress;saveDB()};
$("#wipeBtn").onclick=()=>{if(!confirm(t("wipeQ")))return;try{localStorage.removeItem(KEY)}catch(e){}DB={v:1,settings:{lang:LANG},p:{}};saveDB(true);if(HOOK.wipe)HOOK.wipe();LIST=BUILT.slice();load(LIST[0],{fresh:true});toast(t("wiped"))};
let rndSide=5;
$("#sizeSeg").onclick=e=>{const b=e.target.closest("[data-side]");if(!b)return;rndSide=+b.dataset.side;$$("#sizeSeg button").forEach(x=>x.classList.toggle("on",x===b))};
$("#rndBtn").onclick=()=>{
  const t0=performance.now();const r=randomPuzzle(rndSide);
  if(!r){toast(t("rndFail"));return}
  const p=buildPuzzle(r.def);LIST=LIST.filter(x=>!x.random);LIST.push(p);
  DB.random={side:p.side,sol:p.sol.join(""),col:p.col};delete DB.p.random;saveDB();
  load(p,{fresh:true});closeDrawer();
  $("#rndInfo").textContent=t("rndDone",{n:r.tries,ms:Math.round(performance.now()-t0)});
};
$("#list").onclick=e=>{const b=e.target.closest("[data-pz]");if(b){persist();load(LIST.find(p=>p.id===b.dataset.pz));closeDrawer()}};
$("#card").onclick=e=>{const id=e.target.closest("button")&&e.target.closest("button").id;
  if(id==="nextBtn"){const L=LIST.filter(p=>!p.random);const i=L.indexOf(S.P);const nx=L.slice(i+1).concat(L.slice(0,i+1)).find(p=>!(DB.p[p.id]||{}).done)||L[(i+1)%L.length];load(nx)}
  else if(id==="copyBtn")copyResult();
  else if(id==="againBtn"){const r=rec(S.P.id);delete r.g;delete r.t;delete r.h;delete r.m;load(S.P,{fresh:true})}
  else if(id==="qMapBtn"&&HOOK.openMap)HOOK.openMap(S.P.quest.qid,{reveal:true});
  else if(id==="qNextBtn"&&HOOK.nextStage)HOOK.nextStage(S.P);
  else if(id==="cardX")$("#overlay").classList.remove("show")};
$("#zoomIn").onclick=()=>zoomAt(1.3);$("#zoomOut").onclick=()=>zoomAt(1/1.3);$("#zoomFit").onclick=fitView;
/* drawer (phones) */
function openDrawer(){document.body.classList.add("drawer");$("#drawerBtn").setAttribute("aria-expanded","true")}
function closeDrawer(){document.body.classList.remove("drawer");$("#drawerBtn").setAttribute("aria-expanded","false")}
$("#drawerBtn").onclick=()=>document.body.classList.contains("drawer")?closeDrawer():openDrawer();
$("#backdrop").onclick=closeDrawer;
/* title & how-to */
function closeTitle(){$("#titleScreen").hidden=true;svg.focus({preventScroll:true});S.kbd=false;updateAll()}
$("#playBtn").onclick=closeTitle;
$("#tHowBtn").onclick=()=>{openHow()};
$("#howBtn").onclick=openHow;
$("#howClose").onclick=closeHow;
$("#howScreen").onclick=e=>{if(e.target.id==="howScreen")closeHow()};
let howBuilt=false;
function openHow(){$("#howScreen").hidden=false;buildHow();$("#howClose").focus()}
function closeHow(){if($("#howScreen").hidden)return;$("#howScreen").hidden=true;DB.settings.seenHow=true;saveDB()}
const MINI=buildPuzzle({id:"mini",name:{ja:"例",en:"Example"},side:3,rows:["y.y","yyyy","y.y.y","yyy.",".y."]});
function buildHow(){
  $("#howText").innerHTML=t("howHtml");
  if(howBuilt)return;howBuilt=true;
  drawBoard($("#miniQ"),MINI);drawBoard($("#miniA"),MINI,{solved:true});
}
/* language */
function applyLang(){
  document.documentElement.lang=LANG;
  $$("[data-i18n]").forEach(e=>{e.textContent=t(e.dataset.i18n)});
  $$("[data-i18n-aria]").forEach(e=>e.setAttribute("aria-label",t(e.dataset.i18nAria)));
  $$("[data-i18n-title]").forEach(e=>e.setAttribute("title",t(e.dataset.i18nTitle)));
  $("#langBtn").textContent=LANG==="ja"?"EN":"JA";$("#tLangBtn").textContent=LANG==="ja"?"English":"日本語";
  $("#playBtn").textContent=t(Object.keys(DB.p).some(k=>DB.p[k].g)?"cont":"play");
  if(!$("#howScreen").hidden)$("#howText").innerHTML=t("howHtml");
  if(S.P){setTitle();renderList();buildPal();D.clues.forEach(e=>e._hid=undefined);updateAll();if($("#overlay").classList.contains("show")&&S.cardOpts)showCard(S.cardOpts)}
  if(HOOK.lang)HOOK.lang();
}
function toggleLang(){LANG=LANG==="ja"?"en":"ja";DB.settings.lang=LANG;saveDB();applyLang()}
$("#langBtn").onclick=toggleLang;$("#tLangBtn").onclick=toggleLang;
document.addEventListener("visibilitychange",()=>{if(document.hidden){if(S.t0){stopTimer()}persist();saveDB(true)}});
window.addEventListener("pagehide",()=>{persist();saveDB(true)});

/* ---------------- boot ---------------- */
loadDB();
const st=DB.settings;
LANG=st.lang||((navigator.language||"ja").toLowerCase().startsWith("ja")?"ja":"en");
S.hard=!!st.hard;S.checkMiss=!!st.checkMiss;S.longPress=st.longPress!==false;
$("#hardChk").checked=S.hard;$("#missChk").checked=S.checkMiss;$("#lpChk").checked=S.longPress;
if(DB.random&&DB.random.sol){try{const R=DB.random;const p=buildPuzzle({id:"random",name:{ja:"ランダム",en:"Random"},icon:"🎲",side:R.side,sol:[...R.sol].map(Number),col:R.col,random:true});LIST.push(p)}catch(e){}}
setMode(st.mode==="mark"?"mark":"fill");
const first=LIST.find(p=>p.id===st.last)||LIST[0];
load(first);
applyLang();
window.__hex={S,get LIST(){return LIST},get DB(){return DB},solve,cluesOf,randomPuzzle,load,shareText,KEY};
window.HexApp={T,t,get LANG(){return LANG},S,HOOK,load,persist,saveDB,rec,get DB(){return DB},toast,fmt,closeTitle,closeDrawer,applyLang,drawBoard,colOf,vOf,
  addStrings(o){for(const l in o)Object.assign(T[l],o[l])},current:()=>S.P,list:()=>LIST};
})();
