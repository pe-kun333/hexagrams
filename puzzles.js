/* Hexagrams hand-designed puzzles. All pictures are original. */
(function(root){
"use strict";
const COLORS={y:"#f5b82e",Y:"#ffd866",o:"#e07a1a",k:"#5b3e22",r:"#e5484d",R:"#a8262c",p:"#f28cb8",P:"#d9579a",w:"#f4f1ea",g:"#6cc070",G:"#2f7d4a",n:"#8a5a2b",c:"#7fd3f0",b:"#3d7be0",e:"#ead6ad",v:"#9b6ee0",s:"#b8c2cc"};
const DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
const hd=(a,b)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.s-b.s));
const D=c=>Math.max(Math.abs(c.q),Math.abs(c.r),Math.abs(c.s));
const near=(c,x,y,rad)=>Math.hypot(c.x-x,c.y-y)<=rad;
const at=(c,q,r)=>c.q===q&&c.r===r;
const segDist=(c,x1,y1,x2,y2)=>{const dx=x2-x1,dy=y2-y1;let t=((c.x-x1)*dx+(c.y-y1)*dy)/(dx*dx+dy*dy);t=Math.max(0,Math.min(1,t));return Math.hypot(c.x-x1-t*dx,c.y-y1-t*dy)};
const PUZZLES=[
 /* ---- 小 side 4 ---- */
 {id:"heart",name:{ja:"ハート",en:"Heart"},icon:"❤",side:4,rows:["r..r","rr.rr","rwrrrr","rrrrrrr",".rrrr.",".rrr.",".rr."]},
 {id:"fish",name:{ja:"魚",en:"Fish"},icon:"🐟",side:4,fn:c=>{
   if(near(c,1.05,-0.43,0.3))return null;
   if(((c.x-0.6)/2.3)**2+(c.y/1.45)**2<=1)return c.x>1.8?"c":"b";
   if(c.x<=-1.4&&c.x>=-3.1&&Math.abs(c.y)<=(-c.x-1.4)*0.9+0.1)return "c";return null}},
 {id:"apple",name:{ja:"りんご",en:"Apple"},icon:"🍎",side:4,fn:c=>{
   if(near(c,0.5,-2.6,0.3))return "n";if(near(c,1.5,-2.6,0.3)||near(c,1,-2.6,0.1))return "g";
   if(at(c,-1,-1))return "w";
   if(((c.x)/2.75)**2+((c.y-0.35)/2.3)**2<=1&&!near(c,0,-1.73,0.3))return "r";return null}},
 {id:"house",name:{ja:"おうち",en:"House"},icon:"🏠",side:4,fn:c=>{
   if(c.y<-0.3){return Math.abs(c.x)<=(c.y+2.7)*1.2?"r":null}
   if(Math.abs(c.x)<=2.1){if(Math.abs(c.x)<=0.5&&c.y>1)return null;if(near(c,-1.5,0.87,0.3))return "c";return "e"}return null}},
 /* ---- 中 side 5 ---- */
 {id:"flower",name:{ja:"花",en:"Flower"},icon:"🌸",side:5,fn:c=>{const d=D(c);
   if(d===0)return "o";if(d===1)return "y";
   for(const [dq,dr] of DIRS){if(hd(c,{q:3*dq,r:3*dr,s:-3*dq-3*dr})<=1)return d>=4?"P":"p"}return null}},
 {id:"bee",name:{ja:"ハチ",en:"Bee"},icon:"🐝",side:5,fn:c=>{
   const bx=c.x,by=c.y-0.55;
   if((bx/3.3)**2+(by/1.75)**2<=1){if(bx<-2.2||bx>2.9)return "k";return Math.floor((bx+2.2)/1.2)%2===0?"y":"k"}
   if(near(c,-0.9,-2.4,1.05)||near(c,1.0,-2.4,1.05))return "w";return null}},
 {id:"mush",name:{ja:"キノコ",en:"Mushroom"},icon:"🍄",side:5,fn:c=>{
   if(c.y<0.5&&(c.x/4.3)**2+((c.y-0.5)/3.3)**2<=1){if(near(c,-1.5,-0.9,0.55)||near(c,1.5,-0.9,0.55)||near(c,0,-2.6,0.55))return "w";return "r"}
   if(c.y>=0.5&&Math.abs(c.x)<=1.1)return "e";return null}},
 {id:"comb",name:{ja:"蜂の巣",en:"Honeycomb"},icon:"🍯",side:5,fn:c=>{
   const centers=[{q:0,r:0}];let q=2,r=1;for(let k=0;k<6;k++){centers.push({q,r});const s=-q-r;[q,r]=[-r,-s]}
   const hollow=[1,3,5];
   for(let k=0;k<centers.length;k++){const C=centers[k];C.s=-C.q-C.r;const d=hd(c,C);if(d===0)return hollow.includes(k)?null:"o";if(d===1)return "y"}return null}},
 {id:"star",name:{ja:"六芒星",en:"Hexagram"},icon:"✡",side:5,fn:c=>{const mx=Math.max(c.q,c.r,c.s),mn=Math.min(c.q,c.r,c.s);
   if(D(c)===0)return "o";if(mx<=2||mn>=-2)return D(c)<=1?"Y":(mx<=2&&mn>=-2?"y":"o");return null}},
 {id:"cat",name:{ja:"ねこ",en:"Cat"},icon:"🐱",side:5,rows:["o...o","oo..oo","ooooooo","ookookoo",".ooopooo.",".oeooeo.","..eee..","......","....."]},
 {id:"umbrella",name:{ja:"かさ",en:"Umbrella"},icon:"☂",side:5,fn:c=>{
   if(c.y<=0.1&&(c.x/4.4)**2+((c.y-0.1)/3.1)**2<=1)return Math.floor((c.x+5)/1.5)%2?"b":"c";
   if(c.y>0.1&&Math.abs(c.x-0.5)<0.3&&c.y<3)return "n";
   if(near(c,-0.5,3.03,0.3)||near(c,0,2.6,0.1))return "n";return null}},
 /* ---- 大 side 6 ---- */
 {id:"turtle",name:{ja:"カメ",en:"Turtle"},icon:"🐢",side:6,fn:c=>{const d=D(c);
   if(d<=1)return "G";if(d===2)return "g";if(d===3)return "G";
   if(near(c,4.6,0,0.95))return (c.q===5&&c.r===-1)?"k":"g";
   if(near(c,2.4,-3.6,0.8)||near(c,2.4,3.6,0.8)||near(c,-2.4,-3.6,0.8)||near(c,-2.4,3.6,0.8))return "g";
   if(c.q===-4&&c.r===0)return "g";return null}},
 {id:"tree",name:{ja:"木",en:"Tree"},icon:"🌳",side:6,fn:c=>{
   if(at(c,0,-2)||at(c,2,-1)||at(c,-1,0)||at(c,1,0))return "r";
   if((c.x/4.2)**2+((c.y+1.1)/3.0)**2<=1)return c.y<-2.4?"g":"G";
   if(Math.abs(c.x)<=1.1&&c.y>1.5&&c.y<4.0)return "n";
   if(c.y>3.9&&Math.abs(c.x)<=2.6)return "g";return null}},
 {id:"rocket",name:{ja:"ロケット",en:"Rocket"},icon:"🚀",side:6,fn:c=>{
   const ax=Math.abs(c.x);
   if(near(c,0,-0.87,0.6))return "c";
   if(c.y<=-2.4)return ax<=(c.y+4.6)*0.7?"r":null;
   if(c.y<=2.0)return ax<=1.6?"w":null;
   if(c.y<=3.5)return ax<=1.6?"s":(ax<=3.1?"r":null);
   return ax<=1.1?"o":null}},
 {id:"cherry",name:{ja:"さくらんぼ",en:"Cherries"},icon:"🍒",side:6,fn:c=>{
   if(near(c,-1.8,2.3,1.75)||near(c,2.2,1.7,1.75))return near(c,-2.4,1.73,0.3)||near(c,1.6,0.87,0.3)?"w":"r";
   if(segDist(c,-1.4,0.4,0.8,-3.6)<0.45||segDist(c,2,-0.1,0.8,-3.6)<0.45)return "G";
   if(near(c,2.6,-3.4,0.9))return "g";return null}},
 /* ---- 特大 side 7 ---- */
 {id:"snow",name:{ja:"雪の結晶",en:"Snowflake"},icon:"❄",side:7,fn:c=>{
   const a=[Math.abs(c.q),Math.abs(c.r),Math.abs(c.s)].sort((x,y)=>x-y);const m=a[0],d=a[2];
   if(d<=1)return "b";if(m===0)return "c";
   if((m===1&&d===3)||(m===2&&d===4)||(m===1&&d===5)||(m===2&&d===6))return "w";return null}},
 {id:"sun",name:{ja:"たいよう",en:"Sun"},icon:"☀",side:7,fn:c=>{const d=D(c);
   if(d<=2)return d===0?"Y":"y";
   const a=[Math.abs(c.q),Math.abs(c.r),Math.abs(c.s)].sort((x,y)=>x-y);
   if(a[0]===0&&d>=4)return "o";
   if(a[0]===a[1]&&d===6)return "o";if(a[0]===a[1]&&d===4)return "y";if(d===3&&a[0]===1)return "Y";return null}},
 {id:"moon",name:{ja:"月と星",en:"Moon & Star"},icon:"🌙",side:7,fn:c=>{
   if(near(c,-0.8,0.5,4.6)&&!near(c,1.2,-0.6,3.7))return "Y";
   const st={q:4,r:1,s:-5};if(hd(c,st)===0)return "Y";if(hd(c,st)===1&&[0,2,4].some(k=>at(c,st.q+DIRS[k][0],st.r+DIRS[k][1])||at(c,st.q-DIRS[k][0],st.r-DIRS[k][1])))return "y";
   return null}},
 {id:"bird",name:{ja:"ことり",en:"Little Bird"},icon:"🐦",side:7,fn:c=>{
   if(near(c,2,-2.6,0.3))return "k";
   if(c.x>3.4&&c.x<5.1&&Math.abs(c.y+2.2)<=(5.1-c.x)*0.45)return "o";
   if(near(c,1.8,-2.2,1.75))return "c";
   if(((c.x+0.2)/3.4)**2+((c.y-0.9)/2.2)**2<=1)return c.y>1.7?"w":"c";
   if(c.x<-2.6&&c.x>-6.3&&c.y<=0.9&&c.y>=-0.6+(c.x+2.6)*0.55)return "b";
   if(c.y>3.1&&c.y<4.6&&(Math.abs(c.x+0.5)<0.3||Math.abs(c.x-1)<0.3))return "o";return null}}
];
const api={COLORS,PUZZLES};
if(typeof module!=="undefined")module.exports=api;else root.HexPuzzles=api;
})(this);
