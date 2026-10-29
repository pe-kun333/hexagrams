/* Hexagrams — Picture Quest UI: image -> hex pixel art -> stages -> honeycomb map */
(function(){
"use strict";
const A=window.HexApp,HQ=window.HexQuest,{SQ3}=window.HexCore;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const NS="http://www.w3.org/2000/svg";
const el=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

A.addStrings({
ja:{qTitle:"ピクチャークエスト",qTitleSub:"画像から作る六角ドット絵パズル",qFromPic:"画像からパズルを作る",qSideHelp:"好きな絵を六角形のドット絵に変換し、いくつかのステージに分けて遊べます。",
 qLead:"画像を六角形のドット絵に変換し、いくつかのステージ（六角ノノグラム）に分けます。ステージをすべて解くと絵が完成します。",
 qListH:"クエスト",qNewH:"新しく作る",qPick:"画像を選ぶ",qDropHelp:"ここにドラッグ＆ドロップ、または貼り付け（Ctrl+V / ⌘V）もできます",
 qPrivacy:"🔒 画像はこの端末のブラウザの中だけで処理され、どこにもアップロードされません。保存されるのは変換後のマス目と小さな縮小画像だけです。",
 qPreview:"変換プレビュー",qShowOrig:"元画像を重ねて表示",qName:"名前",qRes:"細かさ",qResS:"小 ~150",qResM:"中 ~350",qResL:"大 ~700",
 qStage:"1ステージの大きさ",qStage3:"標準（37マス）",qStage4:"大きめ（61マス）",qColors:"色",qMono:"白黒",qC2:"2色",qC3:"3色",qC4:"4色",
 qThr:"しきい値",qAuto:"自動",qInvert:"反転（明るい部分を塗る）",qEnh:"強調",qEnhNone:"なし",qEnhC:"コントラスト",qEnhE:"コントラスト＋輪郭",
 qOther:"別の画像",qStart:"▶ このクエストをはじめる",qBackList:"一覧",qViewPuz:"パズルの色",qViewOrig:"元の色",qCompare:"元画像と比べる",qCompareOff:"比較を閉じる",qPng:"PNGで保存",
 qOrig:"元画像（縮小）",qArt:"六角ドット絵",qMapHelp:"ステージを選ぶと遊べます。クリアしたステージには絵が現れます。",
 qStats:"{w}×{h}・{c}マス ／ ステージ {s}（うち自動クリア {a}）",qStatsThr:"しきい値 {t}（自動 {a}）",
 qProg:"{c} / {n} クリア",qOpen:"開く",qDel:"削除",qReset:"最初から",qDelQ:"クエスト「{n}」を削除しますか？（進み具合も消えます）",qResetQ:"「{n}」の進み具合を消して最初からにしますか？",
 qDeleted:"削除しました",qSample:"サンプル：気球",qBuiltin:"お試し用",qEmpty:"まだ自分で作ったクエストはありません。",qMade:"{n}ステージのクエストを作りました",
 qNotImg:"画像ファイルを選んでください",qTooBig:"ファイルが大きすぎます（40MBまで）",qLoadFail:"画像を読み込めませんでした",
 qSavedNoThumb:"保存容量が少ないため、比較用の縮小画像は保存しませんでした",qSaveFail:"保存容量が足りないため保存できませんでした。このクエストはページを閉じるまで遊べます。古いクエストを削除すると保存できます",
 quota:"保存容量（localStorage）がいっぱいです。古いクエストを削除してください",
 stageN:"ステージ {k}/{n}",colorsN:"{n}色",colorK:"色{k}",palette:"色",qMap:"マップ",qNext:"次のステージ",qSeeArt:"完成した絵を見る",qAllDone:"🎉 すべてのステージをクリア！絵が完成しました",
 qProgress:"クエスト進行：{c} / {n}",givenCell:"最初から開いているマスは変更できません",givenShort:"固定",hardNoQuest:"ハードモードはピクチャークエストには適用されません",
 qComplete:"完成！",qCompleteSub:"{n}ステージをすべてクリアしました",qAuto2:"自動",qGivens:"開始マス {n}",qStageLbl:"ステージ {k}",qPngDone:"PNGを保存しました",
 qColorNote:"色つきの数字は、その色が続く数です。違う色どうしは間をあけずに並ぶことがあります。",qMapAria:"クエストのマップ。{c} / {n} ステージクリア"},
en:{qTitle:"Picture Quest",qTitleSub:"Turn any picture into hex pixel-art puzzles",qFromPic:"Make puzzles from a picture",qSideHelp:"Convert a picture into hexagonal pixel art, split into stages you solve one by one.",
 qLead:"Your picture is converted into hexagonal pixel art and split into stages (hex nonograms). Clear every stage to reveal the whole picture.",
 qListH:"Quests",qNewH:"Create new",qPick:"Choose image",qDropHelp:"…or drag & drop it here, or paste (Ctrl+V / ⌘V)",
 qPrivacy:"🔒 Images are processed only inside this browser on your device and never uploaded. Only the converted grid and a small thumbnail are saved.",
 qPreview:"Conversion preview",qShowOrig:"Overlay the original",qName:"Name",qRes:"Detail",qResS:"S ~150",qResM:"M ~350",qResL:"L ~700",
 qStage:"Stage size",qStage3:"Standard (37 cells)",qStage4:"Large (61 cells)",qColors:"Colours",qMono:"B/W",qC2:"2 colours",qC3:"3 colours",qC4:"4 colours",
 qThr:"Threshold",qAuto:"Auto",qInvert:"Invert (fill bright areas)",qEnh:"Enhance",qEnhNone:"None",qEnhC:"Contrast",qEnhE:"Contrast + edges",
 qOther:"Other image",qStart:"▶ Start this quest",qBackList:"Quests",qViewPuz:"Puzzle colours",qViewOrig:"Original colours",qCompare:"Compare with original",qCompareOff:"Close comparison",qPng:"Save PNG",
 qOrig:"Original (thumbnail)",qArt:"Hex pixel art",qMapHelp:"Pick a stage to play. Cleared stages reveal their part of the picture.",
 qStats:"{w}×{h} · {c} cells / {s} stages ({a} auto-cleared)",qStatsThr:"Threshold {t} (auto {a})",
 qProg:"{c} / {n} cleared",qOpen:"Open",qDel:"Delete",qReset:"Restart",qDelQ:"Delete the quest \"{n}\"? Its progress will be lost.",qResetQ:"Clear the progress of \"{n}\" and start over?",
 qDeleted:"Deleted",qSample:"Sample: Balloon",qBuiltin:"Built-in",qEmpty:"You haven't created any quests yet.",qMade:"Created a quest with {n} stages",
 qNotImg:"Please choose an image file",qTooBig:"File is too large (max 40 MB)",qLoadFail:"Couldn't read that image",
 qSavedNoThumb:"Storage is low, so the comparison thumbnail wasn't saved",qSaveFail:"Not enough storage to save. You can play this quest until you close the page; delete old quests to free space",
 quota:"Browser storage (localStorage) is full. Please delete old quests",
 stageN:"Stage {k}/{n}",colorsN:"{n} colours",colorK:"colour {k}",palette:"Colour",qMap:"Map",qNext:"Next stage",qSeeArt:"See the picture",qAllDone:"🎉 All stages cleared — the picture is complete!",
 qProgress:"Quest progress: {c} / {n}",givenCell:"Pre-revealed cells can't be changed",givenShort:"given",hardNoQuest:"Hard mode doesn't apply to Picture Quest stages",
 qComplete:"Complete!",qCompleteSub:"You cleared all {n} stages",qAuto2:"auto",qGivens:"{n} given",qStageLbl:"Stage {k}",qPngDone:"PNG saved",
 qColorNote:"Coloured numbers are runs of that colour. Runs of different colours may touch without a gap.",qMapAria:"Quest map. {c} of {n} stages cleared"}
});
const t=A.t;
const QKEY="hexagrams.quests.v1";
const RES={s:150,m:350,l:700};
let STORE={v:1,quests:[]};
function loadStore(){try{const j=JSON.parse(localStorage.getItem(QKEY)||"null");if(j&&j.v===1&&Array.isArray(j.quests))STORE=j}catch(e){}}
function saveStore(){try{localStorage.setItem(QKEY,JSON.stringify(STORE));return true}catch(e){return false}}
const CACHE=new Map(); // qid -> built
let SAMPLE=null,MEMQ=[]; // in-memory quests (sample + unsaved)

/* ---------- quest records ---------- */
function allQuests(){return (SAMPLE?[SAMPLE]:[]).concat(STORE.quests,MEMQ)}
function getQ(id){return allQuests().find(q=>q.id===id)}
const qname=q=>q.id==="sample"?t("qSample"):q.name;
function built(q){let b=CACHE.get(q.id);if(!b){b=HQ.buildStages(q);CACHE.set(q.id,b)}return b}
const sid=(q,k)=>`q:${q.id}:${k}`;
function stageDone(q,b,k){return !!b.stages[k].auto||!!(A.DB.p[sid(q,k)]||{}).done}
function progress(q){const b=built(q);const c=b.stages.filter((s,k)=>stageDone(q,b,k)).length;return{c,n:b.stages.length,complete:c===b.stages.length}}
function stagePuzzle(q,k){
  const b=built(q),st=b.stages[k],n=b.stages.length,nm=qname(q);
  const P={id:sid(q,k),name:{ja:`${nm} ステージ${k+1}`,en:`${nm} stage ${k+1}`},qname:nm,icon:"🧩",B:st.B,side:q.R+1,sol:st.sol,col:st.sol.map(()=>"y"),
    K:q.K,clues:st.cclues.map(x=>x.map(o=>o.n)),hidden:st.B.lines.map(()=>false),hiddenCount:0,given:st.B.cells.map((_,i)=>st.givens.includes(i)),
    diff:st.diff,unique:st.unique,quest:{qid:q.id,k,n}};
  if(q.K>1){P.pal=q.pal;P.cclues=st.cclues}
  return P;
}
function openStage(q,k){
  closeAll();A.closeTitle();A.closeDrawer();A.persist();
  A.load(stagePuzzle(q,k));
  $("#foot").textContent=q.K>1?t("qColorNote"):t("foot");
}
A.HOOK.info=P=>{const q=getQ(P.quest.qid);if(!q)return{};const pr=progress(q),b=built(q);
  const hasNext=b.stages.some((s,k)=>k!==P.quest.k&&!stageDone(q,b,k));return{complete:pr.complete,cleared:pr.c,total:pr.n,hasNext}};
A.HOOK.nextStage=P=>{const q=getQ(P.quest.qid);if(!q)return;const b=built(q),n=b.stages.length;
  for(let d=1;d<=n;d++){const k=(P.quest.k+d)%n;if(!stageDone(q,b,k)){openStage(q,k);return}}openMap(q.id)};
A.HOOK.onWin=P=>{const q=getQ(P.quest.qid);if(q&&progress(q).complete&&!q.doneAt){q.doneAt=Date.now();if(q.id!=="sample")saveStore()}};
A.HOOK.openMap=(id,o)=>openMap(id,o);
A.HOOK.wipe=()=>{try{localStorage.removeItem(QKEY)}catch(e){}STORE={v:1,quests:[]};MEMQ=[];CACHE.clear();if(SAMPLE)delete SAMPLE.doneAt;renderList()};
A.HOOK.esc=()=>{if(!$("#qMapScr").hidden)closeMap();else if(!$("#qHub").hidden)closeHub()};
A.HOOK.lang=()=>{if(!$("#qHub").hidden){renderList();if(IMP)updatePreview()}if(!$("#qMapScr").hidden&&MAP)renderMap(false);
  if(A.current()&&A.current().quest){const q=getQ(A.current().quest.qid);$("#foot").textContent=q&&q.K>1?t("qColorNote"):t("foot")}};
document.addEventListener("click",e=>{const b=e.target.closest("[data-pz]");if(b)$("#foot").textContent=t("foot")},true);

/* ---------- colours / drawing ---------- */
const hexN=h=>{const n=parseInt(h.slice(1),16);return[n>>16,(n>>8)&255,n&255]};
function cellColors(q,b,style,revealAll){
  const out=[];const avg=q.avg||"";
  b.G.cells.forEach((c,i)=>{
    const k=b.T.stageOf[i],show=revealAll||stageDone(q,b,k);
    if(!show){out.push(null);return}
    if(style==="orig"&&avg.length>=6*(i+1))out.push("#"+avg.substr(6*i,6));
    else out.push(q.pal[b.sol[i]]);
  });
  return out;
}
function hexPath(ctx,cx,cy,r){ctx.beginPath();for(let k=0;k<6;k++){const a=Math.PI/180*(60*k-30);const x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);k?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath()}
/* draw the hex art on a canvas; r = hex radius in px */
function drawArt(cv,G,colors,r,opt){
  opt=opt||{};const u=r*SQ3,pad=opt.pad==null?r:opt.pad;
  const w=Math.ceil((G.W-0.5)*u+u+pad*2),h=Math.ceil((G.H-1)*1.5*r+2*r+pad*2);
  cv.width=w;cv.height=h;const ctx=cv.getContext("2d");
  ctx.fillStyle=opt.bg||"#14110c";ctx.fillRect(0,0,w,h);
  const ox=pad+u/2,oy=pad+r;
  G.cells.forEach((c,i)=>{hexPath(ctx,ox+c.x*u,oy+c.y*u,r*(opt.gap||0.985));ctx.fillStyle=colors[i]||opt.hidden||"#3d3427";ctx.fill()});
  if(opt.borders){ctx.strokeStyle=opt.borderColor||"#f5b82ecc";ctx.lineWidth=Math.max(1,r*0.16);ctx.beginPath();
    G.cells.forEach((c,i)=>{const cx=ox+c.x*u,cy=oy+c.y*u;
      window.HexCore.DIRS.forEach(([dq,dr])=>{const j=G.idx.get((c.q+dq)+","+(c.r+dr));if(j!==undefined&&opt.borders[j]===opt.borders[i])return;if(j===undefined)return;
        const nx=dq+dr/2,ny=dr*SQ3/2,th=Math.atan2(ny,nx);ctx.moveTo(cx+r*Math.cos(th-Math.PI/6),cy+r*Math.sin(th-Math.PI/6));ctx.lineTo(cx+r*Math.cos(th+Math.PI/6),cy+r*Math.sin(th+Math.PI/6))})});
    ctx.stroke()}
  return cv;
}

/* ---------- list ---------- */
function renderList(){
  const L=$("#qList");if(!L)return;
  const qs=allQuests();let h="";
  qs.forEach(q=>{let pr={c:0,n:0};try{pr=progress(q)}catch(e){}
    h+=`<div class="qitem" data-q="${esc(q.id)}"><canvas class="qthumb" data-th="${esc(q.id)}" aria-hidden="true"></canvas>
      <div class="qinfo"><div class="nm">${esc(qname(q))}${q.id==="sample"?` <span class="bd">${t("qBuiltin")}</span>`:""}</div>
      <div class="sm"><span class="bd ${pr.c===pr.n?"ok":"cl"}">${t("qProg",{c:pr.c,n:pr.n})}</span><span>${q.W*q.H} · ${q.K>1?t("colorsN",{n:q.K}):t("qMono")}</span></div></div>
      <div class="qacts"><button class="btn pri small" data-act="open">${t("qOpen")}</button>${q.id==="sample"?`<button class="btn small" data-act="reset">${t("qReset")}</button>`:`<button class="btn small danger" data-act="del" aria-label="${t("qDel")}: ${esc(qname(q))}">${t("qDel")}</button>`}</div></div>`});
  if(!STORE.quests.length&&!MEMQ.length)h+=`<div class="help">${t("qEmpty")}</div>`;
  L.innerHTML=h;
  $$("#qList canvas[data-th]").forEach(cv=>{const q=getQ(cv.dataset.th);if(!q)return;const b=built(q);drawArt(cv,b.G,cellColors(q,b,"puz",false),4,{pad:2,hidden:"#3d3427"})});
}
$("#qList").onclick=e=>{const b=e.target.closest("[data-act]");if(!b)return;const q=getQ(b.closest("[data-q]").dataset.q);if(!q)return;
  const act=b.dataset.act;
  if(act==="open")openMap(q.id);
  else if(act==="del"){if(!confirm(t("qDelQ",{n:qname(q)})))return;removeProgress(q);STORE.quests=STORE.quests.filter(x=>x.id!==q.id);MEMQ=MEMQ.filter(x=>x.id!==q.id);CACHE.delete(q.id);saveStore();
    const cur=A.current();if(cur&&cur.quest&&cur.quest.qid===q.id)A.load(A.list()[0]);renderList();A.toast(t("qDeleted"))}
  else if(act==="reset"){if(!confirm(t("qResetQ",{n:qname(q)})))return;removeProgress(q);delete q.doneAt;renderList()}};
function removeProgress(q){const pre=`q:${q.id}:`;Object.keys(A.DB.p).forEach(k=>{if(k.startsWith(pre))delete A.DB.p[k]});A.saveDB(true)}

/* ---------- import ---------- */
let IMP=null;
const MAXPX=1024;
async function readImage(file){
  if(!file||!/^image\//.test(file.type||"")){A.toast(t("qNotImg"));return}
  if(file.size>40*1024*1024){A.toast(t("qTooBig"));return}
  let src;
  try{
    if(window.createImageBitmap)src=await createImageBitmap(file);
    else src=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=URL.createObjectURL(file)});
  }catch(e){A.toast(t("qLoadFail"));return}
  const nm=(file.name||"").replace(/\.[^.]+$/,"").slice(0,40)||(A.LANG==="ja"?"わたしの絵":"My picture");
  setImage(src,nm);
}
function setImage(src,name){
  const w0=src.width,h0=src.height,sc=Math.min(1,MAXPX/Math.max(w0,h0));
  const cv=document.createElement("canvas");cv.width=Math.max(1,Math.round(w0*sc));cv.height=Math.max(1,Math.round(h0*sc));
  const ctx=cv.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,cv.width,cv.height);ctx.drawImage(src,0,0,cv.width,cv.height);
  let data;try{data=ctx.getImageData(0,0,cv.width,cv.height)}catch(e){A.toast(t("qLoadFail"));return}
  const tc=document.createElement("canvas"),ts=Math.min(1,240/Math.max(cv.width,cv.height));tc.width=Math.round(cv.width*ts);tc.height=Math.round(cv.height*ts);
  tc.getContext("2d").drawImage(cv,0,0,tc.width,tc.height);
  IMP={data,aspect:cv.width/cv.height,thumb:tc.toDataURL("image/jpeg",0.72),canvas:cv,cache:{},opts:IMP?IMP.opts:{res:"m",R:3,colors:1,enhance:"contrast",thr:null,invert:false}};
  IMP.opts.thr=null;
  $("#qName").value=name;$("#qEdit").hidden=false;syncCtl();updatePreview();
  setTimeout(()=>$("#qEdit").scrollIntoView({block:"nearest",behavior:"smooth"}),30);
}
function syncCtl(){const o=IMP.opts;
  $$("#qResSeg button").forEach(b=>b.classList.toggle("on",b.dataset.v===o.res));
  $$("#qStageSeg button").forEach(b=>b.classList.toggle("on",+b.dataset.v===o.R));
  $$("#qColSeg button").forEach(b=>b.classList.toggle("on",+b.dataset.v===o.colors));
  $("#qInv").checked=o.invert;$("#qEnh").value=o.enhance;
  const mono=o.colors===1;$("#qThr").disabled=!mono;$("#qAuto").disabled=!mono;$("#qThrRow").classList.toggle("off",!mono)}
function compute(){
  const o=IMP.opts,{W,H}=HQ.gridDims(IMP.aspect,RES[o.res]),key=W+"x"+H;
  let c=IMP.cache[key];if(!c){const G=HQ.bigGrid(W,H);c=IMP.cache[key]={G,rgb:HQ.sampleImage(IMP.data,G),tiles:{}}}
  if(!c.tiles[o.R])c.tiles[o.R]=HQ.tile(c.G,o.R);
  const cv=HQ.convert(c.G,c.rgb,{enhance:o.enhance,colors:o.colors,threshold:o.thr,invert:o.invert});
  return{W,H,G:c.G,rgb:c.rgb,T:c.tiles[o.R],cv};
}
function updatePreview(){
  if(!IMP)return;const r=compute(),o=IMP.opts;IMP.last=r;
  if(r.cv.thr!=null){$("#qThr").value=r.cv.thr;$("#qThrOut").textContent=r.cv.thr}
  const colors=r.cv.sol.map(v=>r.cv.pal[v]);
  const pv=$("#qPrev"),rad=Math.max(3,Math.min(14,Math.floor(560/((r.W+0.5)*SQ3))));
  drawArt(pv,r.G,colors,rad,{borders:r.T.stageOf,pad:rad});
  if($("#qShowOrig").checked){const ctx=pv.getContext("2d");ctx.globalAlpha=0.45;ctx.drawImage(IMP.canvas,rad,rad,pv.width-rad*2,pv.height-rad*2);ctx.globalAlpha=1}
  let auto=0;r.T.regions.forEach(rg=>{const v=rg.cells.map(i=>r.cv.sol[i]);if(rg.cells.length<HQ.TINY||v.every(x=>x===0)||v.every(x=>x===v[0]))auto++});
  $("#qStats").innerHTML=t("qStats",{w:r.W,h:r.H,c:r.G.cells.length,s:r.T.regions.length,a:auto})+(r.cv.thr!=null?"<br>"+t("qStatsThr",{t:r.cv.thr,a:r.cv.autoThr}):"")+
    `<div class="qpal">${r.cv.pal.map((c,k)=>`<span class="sw" style="background:${c}" title="${k?t("colorK",{k}):"bg"}"></span>`).join("")}</div>`;
}
const segPick=(sel,fn)=>{$(sel).onclick=e=>{const b=e.target.closest("[data-v]");if(!b||!IMP)return;fn(b.dataset.v);syncCtl();updatePreview()}};
segPick("#qResSeg",v=>IMP.opts.res=v);segPick("#qStageSeg",v=>IMP.opts.R=+v);segPick("#qColSeg",v=>IMP.opts.colors=+v);
$("#qThr").oninput=e=>{if(!IMP)return;IMP.opts.thr=+e.target.value;$("#qThrOut").textContent=e.target.value;updatePreview()};
$("#qAuto").onclick=()=>{if(!IMP)return;IMP.opts.thr=null;updatePreview()};
$("#qInv").onchange=e=>{if(!IMP)return;IMP.opts.invert=e.target.checked;updatePreview()};
$("#qEnh").onchange=e=>{if(!IMP)return;IMP.opts.enhance=e.target.value;IMP.opts.thr=null;updatePreview()};
$("#qShowOrig").onchange=updatePreview;
$("#qFile").onchange=e=>{const f=e.target.files&&e.target.files[0];if(f)readImage(f);e.target.value=""};
$("#qCancel").onclick=()=>{IMP=null;$("#qEdit").hidden=true;$("#qFile").click()};
const drop=$("#qDrop"),hub=$("#qHub");
["dragenter","dragover"].forEach(n=>hub.addEventListener(n,e=>{e.preventDefault();drop.classList.add("over")}));
["dragleave","drop"].forEach(n=>hub.addEventListener(n,e=>{if(n==="dragleave"&&hub.contains(e.relatedTarget))return;drop.classList.remove("over")}));
hub.addEventListener("drop",e=>{e.preventDefault();const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f)readImage(f)});
document.addEventListener("paste",e=>{if(hub.hidden)return;const it=[...(e.clipboardData&&e.clipboardData.items||[])].find(x=>x.type&&x.type.startsWith("image/"));
  if(it){e.preventDefault();const f=it.getAsFile();if(f){if(!f.name||f.name==="image.png")try{Object.defineProperty(f,"name",{value:A.LANG==="ja"?"貼り付けた画像":"Pasted image"})}catch(_){}readImage(f)}}});
$("#qStart").onclick=()=>{
  if(!IMP)return;const r=IMP.last||compute(),o=IMP.opts;
  const q={id:"u"+Date.now().toString(36),name:($("#qName").value.trim()||"Quest").slice(0,40),created:Date.now(),W:r.W,H:r.H,R:o.R,K:r.cv.K,pal:r.cv.pal,
    sol:r.cv.sol.join(""),avg:r.rgb.map(c=>HQ.toHex(c).slice(1)).join(""),thumb:IMP.thumb,opts:Object.assign({},o)};
  const b=HQ.buildStages(q);q.givens=b.stages.map(s=>s.givens);CACHE.set(q.id,b);
  STORE.quests.unshift(q);
  if(!saveStore()){delete q.thumb;if(saveStore())A.toast(t("qSavedNoThumb"));else{STORE.quests.shift();MEMQ.unshift(q);A.toast(t("qSaveFail"))}}
  else A.toast(t("qMade",{n:b.stages.length}));
  IMP=null;$("#qEdit").hidden=true;openMap(q.id);
};

/* ---------- sample quest (built-in, drawn for this game) ---------- */
function buildSample(){
  return new Promise(res=>{if(SAMPLE||!window.HEX_SAMPLE)return res();const im=new Image();im.onload=()=>{
    const cv=document.createElement("canvas");cv.width=im.width;cv.height=im.height;const ctx=cv.getContext("2d");ctx.drawImage(im,0,0);
    const data=ctx.getImageData(0,0,cv.width,cv.height),{W,H}=HQ.gridDims(cv.width/cv.height,RES.m),G=HQ.bigGrid(W,H),rgb=HQ.sampleImage(data,G);
    const c=HQ.convert(G,rgb,{enhance:"none",colors:3});
    SAMPLE={id:"sample",name:"Sample",W,H,R:3,K:c.K,pal:c.pal,sol:c.sol.join(""),avg:rgb.map(x=>HQ.toHex(x).slice(1)).join(""),thumb:window.HEX_SAMPLE};
    res()};im.onerror=()=>res();im.src=window.HEX_SAMPLE});
}

/* ---------- screens ---------- */
let lastFocus=null;
function openHub(){lastFocus=document.activeElement;closeMap();$("#qHub").hidden=false;renderList();$("#qHubClose").focus()}
function closeHub(){$("#qHub").hidden=true}
function closeMap(){$("#qMapScr").hidden=true;MAP=null}
function closeAll(){closeHub();closeMap()}
$("#qHubClose").onclick=closeHub;$("#qMapClose").onclick=closeMap;
$("#qBack").onclick=()=>{closeMap();openHub()};
$("#qSideBtn").onclick=()=>{A.closeDrawer();openHub()};
$("#tQuestBtn").onclick=()=>{A.closeTitle();openHub()};
$("#qHub").onclick=e=>{if(e.target.id==="qHub")closeHub()};

/* ---------- map ---------- */
let MAP=null;
function openMap(id,o){
  const q=getQ(id);if(!q)return;o=o||{};closeHub();
  MAP={q,style:MAP&&MAP.q===q?MAP.style:"puz",cmp:false};
  $("#qMapScr").hidden=false;$("#qCmp").hidden=true;
  const pr=progress(q);
  renderMap(!!(o.reveal&&pr.complete));
  $("#qBack").focus();
}
function renderMap(reveal){
  const {q}=MAP,b=built(q),pr=progress(q);
  $("#qMapTtl").textContent=qname(q);$("#qProg").textContent=t("qProg",{c:pr.c,n:pr.n});
  $$("#qViewSeg button").forEach(x=>x.classList.toggle("on",x.dataset.v===MAP.style));
  $("#qPng").disabled=!pr.complete;$("#qCompare").disabled=!q.thumb;$("#qCompare").textContent=MAP.cmp?t("qCompareOff"):t("qCompare");
  const sv=$("#qMap");sv.innerHTML="";const s=10,u=s*SQ3,G=b.G;
  sv.setAttribute("aria-label",t("qMapAria",{c:pr.c,n:pr.n}));
  const cols=cellColors(q,b,MAP.style,false);
  const pts=(cx,cy,r)=>{const p=[];for(let k=0;k<6;k++){const a=Math.PI/180*(60*k-30);p.push((cx+r*Math.cos(a)).toFixed(1)+","+(cy+r*Math.sin(a)).toFixed(1))}return p.join(" ")};
  const groups=b.stages.map((st,k)=>{const done=stageDone(q,b,k);const g=el("g",{class:"mst"+(done?" done":"")+(st.auto?" auto":""),"data-k":k});
    if(!st.auto){g.setAttribute("tabindex","0");g.setAttribute("role","button");g.setAttribute("aria-label",t("qStageLbl",{k:k+1})+(done?" ✔":""))}
    sv.appendChild(g);return g});
  const polys=[];
  G.cells.forEach((c,i)=>{const k=b.T.stageOf[i];const p=el("polygon",{points:pts(c.x*u,c.y*u,s*1.0),class:"mc"});
    if(cols[i])p.style.fill=cols[i];groups[k].appendChild(p);polys[i]=p});
  // stage borders
  let d="";G.cells.forEach((c,i)=>{const cx=c.x*u,cy=c.y*u;window.HexCore.DIRS.forEach(([dq,dr])=>{const j=G.idx.get((c.q+dq)+","+(c.r+dr));
    if(j===undefined||b.T.stageOf[j]===b.T.stageOf[i]||j<i)return;const nx=dq+dr/2,ny=dr*SQ3/2,th=Math.atan2(ny,nx);
    d+=`M${(cx+s*Math.cos(th-Math.PI/6)).toFixed(1)},${(cy+s*Math.sin(th-Math.PI/6)).toFixed(1)}L${(cx+s*Math.cos(th+Math.PI/6)).toFixed(1)},${(cy+s*Math.sin(th+Math.PI/6)).toFixed(1)}`})});
  sv.appendChild(el("path",{d,class:"mborder"+(pr.complete?" faint":"")}));
  b.stages.forEach((st,k)=>{if(stageDone(q,b,k))return;const tx=el("text",{x:(st.cx*u).toFixed(1),y:(st.cy*u).toFixed(1),class:"mlbl"});tx.textContent=k+1;groups[k].appendChild(tx)});
  const W=(G.W+0.5)*u,H=(G.H-1)*u*SQ3/2+2*s;sv.setAttribute("viewBox",`${(-u/2-4).toFixed(1)} ${(-s-4).toFixed(1)} ${(W+8).toFixed(1)} ${(H+8).toFixed(1)}`);
  const dn=$("#qDone");
  if(pr.complete){
    dn.hidden=false;dn.innerHTML=`<b>🎉 ${t("qComplete")}</b> <span>${t("qCompleteSub",{n:pr.n})}</span>`;
    if(reveal&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)){
      const cx=G.cells.reduce((a,c)=>a+c.x,0)/G.cells.length,cy=G.cells.reduce((a,c)=>a+c.y,0)/G.cells.length;
      sv.classList.add("revealing");dn.classList.remove("show");
      polys.forEach((p,i)=>{const c=G.cells[i];const dd=Math.hypot(c.x-cx,c.y-cy);p.style.transitionDelay=(dd*45).toFixed(0)+"ms";p.dataset.fill=p.style.fill;p.style.fill="#3d3427"});
      requestAnimationFrame(()=>requestAnimationFrame(()=>{polys.forEach(p=>p.style.fill=p.dataset.fill);setTimeout(()=>{sv.classList.remove("revealing");dn.classList.add("show");sv.dataset.revealed="1"},1400)}));
      sv.dataset.revealed="0";
    }else{dn.classList.add("show");sv.dataset.revealed="1"}
  }else{dn.hidden=true;dn.classList.remove("show")}
  if(MAP.cmp)renderCompare();
}
$("#qMap").onclick=e=>{const g=e.target.closest(".mst");if(!g||g.classList.contains("auto"))return;openStage(MAP.q,+g.dataset.k)};
$("#qMap").onkeydown=e=>{if(e.key!=="Enter"&&e.key!==" ")return;const g=e.target.closest(".mst");if(!g||g.classList.contains("auto"))return;e.preventDefault();openStage(MAP.q,+g.dataset.k)};
$("#qViewSeg").onclick=e=>{const b=e.target.closest("[data-v]");if(!b||!MAP)return;MAP.style=b.dataset.v;renderMap(false)};
$("#qCompare").onclick=()=>{if(!MAP)return;MAP.cmp=!MAP.cmp;$("#qCmp").hidden=!MAP.cmp;$("#qCompare").textContent=MAP.cmp?t("qCompareOff"):t("qCompare");if(MAP.cmp)renderCompare()};
function renderCompare(){const {q}=MAP,b=built(q);$("#qCmpImg").src=q.thumb||"";$("#qCmpImg").alt=t("qOrig");
  drawArt($("#qCmpArt"),b.G,cellColors(q,b,MAP.style,false),5,{pad:3,hidden:"#3d3427"})}
function pngCanvas(q){const b=built(q),cv=document.createElement("canvas");return drawArt(cv,b.G,cellColors(q,b,MAP?MAP.style:"puz",true),18,{pad:24})}
$("#qPng").onclick=()=>{if(!MAP)return;const q=MAP.q,cv=pngCanvas(q),fn="hexagrams-"+(qname(q).replace(/[\\/:*?"<>|\s]+/g,"_")||"quest")+".png";
  const go=url=>{const a=document.createElement("a");a.href=url;a.download=fn;document.body.appendChild(a);a.click();a.remove();A.toast(t("qPngDone"))};
  if(cv.toBlob)cv.toBlob(bl=>{const url=URL.createObjectURL(bl);go(url);setTimeout(()=>URL.revokeObjectURL(url),4000)},"image/png");else go(cv.toDataURL("image/png"))};

/* ---------- boot ---------- */
loadStore();
buildSample().then(()=>{if(!$("#qHub").hidden)renderList()});
A.applyLang();
window.__quest={get STORE(){return STORE},getQ,built,progress,stagePuzzle,openStage,openMap,openHub,allQuests,QKEY,get IMP(){return IMP},pngCanvas,get SAMPLE(){return SAMPLE}};
})();
