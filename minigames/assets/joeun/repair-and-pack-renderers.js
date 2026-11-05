
const spriteRects={};
function spriteRect(k){if(spriteRects[k])return spriteRects[k];const a=im[k];if(!a?.complete)return null;const cv=document.createElement('canvas');cv.width=a.naturalWidth;cv.height=a.naturalHeight;const x=cv.getContext('2d');x.drawImage(a,0,0);const d=x.getImageData(0,0,cv.width,cv.height).data;let l=cv.width,t=cv.height,r=0,b=0;for(let y=0;y<cv.height;y++)for(let z=0;z<cv.width;z++)if(d[(y*cv.width+z)*4+3]>18){l=Math.min(l,z);r=Math.max(r,z);t=Math.min(t,y);b=Math.max(b,y)}return spriteRects[k]=[l,t,Math.max(1,r-l+1),Math.max(1,b-t+1)]}
function cleanPic(k,x,y,w,h){const b=spriteRect(k);if(b)g.drawImage(im[k],...b,x,y,w,h)}
function roundRect(x,y,w,h,r=12){g.beginPath();g.roundRect(x,y,w,h,r)}
function panelNote(t,x,y,w=280){g.save();g.fillStyle='#fffcf3f5';g.strokeStyle='#6e887a';g.lineWidth=2;roundRect(x-w/2,y-21,w,42,10);g.fill();g.stroke();txt(t,x,y+6,17);g.restore()}
function clearMarker(x,y,label,active=true){g.save();g.shadowColor='#183e3455';g.shadowBlur=8;g.fillStyle='#fffef5';g.strokeStyle=active?'#b75b14':'#166a76';g.lineWidth=5;g.beginPath();g.arc(x,y,30,0,Math.PI*2);g.fill();g.stroke();g.shadowBlur=0;txt(label,x,y+7,19,active?'#8b3f0c':'#12545b');g.restore()}
function shirt(clean=false){if(clean)cleanPic('cloth3.webp',245,160,470,370);else pic('cloth0.webp',245,160,470,370)}
function drawCare(){
 shirt(true);stains.forEach((p,i)=>{if(S.clean[i]<1){g.fillStyle='rgba(125,83,48,'+(.52*(1-S.clean[i]))+')';g.beginPath();g.ellipse(...p,24,18,.3,0,7);g.fill();ring(...p,32)}});
 lint.forEach((p,i)=>{if(S.lint[i]<1){g.globalAlpha=1-S.lint[i];g.fillStyle='#63766b';for(let j=0;j<8;j++)g.fillRect(p[0]+j%4*8-12,p[1]+Math.floor(j/4)*9-8,4,4);g.globalAlpha=1;ring(...p,29,'#367e67')}});
 [0,1].forEach(i=>{let x=285+i*260;g.fillStyle='#fffaf0';g.strokeStyle=S.tool===i?'#8c5c27':'#acb8a9';g.lineWidth=2;roundRect(x,565,175,125,13);g.fill();g.stroke();if(drag?.type!=='care'||S.tool!==i)cleanPic('tool'+i+'.webp',x+15,573,145,80);txt(i?'보풀 롤러':'얼룩 솔',x+87,679,17)});
 panelNote('얼룩 '+S.clean.filter(v=>v>=1).length+'/3',840,245,185);panelNote('보풀 '+S.lint.filter(v=>v>=1).length+'/3',840,305,185);
 txt('주황 표시 · 얼룩 솔',840,365,16);txt('초록 표시 · 보풀 롤러',840,400,16);
 if(drag?.type==='care')cleanPic('tool'+S.tool+'.webp',P.x-55,P.y-35,110,75);
}
function drawRepair(){
 panelNote('셔츠 앞여밈 · 단추 자리 확대',500,100,470);
 {const a=im['buttonmacro.webp'];g.drawImage(a,a.width*.365,a.height*.334,a.width*.27,a.height*.332,190,145,620,430)};g.strokeStyle='#7c8879';g.lineWidth=2;g.strokeRect(190,145,620,430);
 if(!S.button){clearMarker(500,360,'단추');if(drag?.type!=='button')cleanPic('cloth5.webp',105,565,100,100);panelNote('빠진 단추 자리에 놓아 주세요',500,625,480)}
 else{
 cleanPic('cloth5.webp',410,270,180,180);
 g.strokeStyle='#7d5635';g.lineWidth=4.5;g.lineCap='round';g.beginPath();holes.slice(0,S.path).forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));if(drag?.type==='sew')g.lineTo(P.x,P.y);g.stroke();
 holes.slice(0,4).forEach((p,i)=>{if(S.path<5){const current=i===S.path||S.path===4&&i===0;g.fillStyle=current?'#e99b3d':'#fff7df';g.strokeStyle='#744523';g.lineWidth=2;g.beginPath();g.arc(...p,current?13:8,0,Math.PI*2);g.fill();g.stroke();txt(String(i+1),p[0]+(p[0]<500?-46:46),p[1]+(p[1]<360?-15:25),17)}});
 if(S.path===5){g.strokeStyle='#785334';g.lineWidth=3;g.beginPath();g.moveTo(495,359);g.bezierCurveTo(510,350,510,371,496,362);g.stroke();panelNote('단추 수선 완료 · 실이 고정됐어요',500,625,520)}
 else panelNote('실 잇기 · '+(S.path===4?'①':String(S.path+1))+'번 구멍으로',500,625,440);
 }
 if(drag?.type==='button')cleanPic('cloth5.webp',P.x-50,P.y-50,100,100);
 if(drag?.type==='sew'){g.strokeStyle='#7d8589';g.lineWidth=3;g.beginPath();g.moveTo(P.x-7,P.y+18);g.lineTo(P.x+11,P.y-20);g.stroke()}
}
const foldPoints=[[300,320],[650,340],[480,490]];
function drawFolding(){
 const key=['cloth3.webp','fold1.webp','fold2.webp','cloth4.webp'][S.fold];
 const rect=[[245,160,470,370],[310,160,370,370],[380,160,210,370],[325,200,350,300]][S.fold];cleanPic(key,...rect);
 if(S.fold<3){const p=foldPoints[S.fold];panelNote(['왼쪽 소매를 가운데로','오른쪽 소매를 가운데로','밑단을 위로 접어요'][S.fold],500,110,470);g.strokeStyle='#175b69';g.lineWidth=4;g.setLineDash([8,6]);g.beginPath();g.moveTo(...p);g.lineTo(500,S.fold===2?290:330);g.stroke();g.setLineDash([]);clearMarker(...p,S.fold===2?'↑':S.fold===1?'←':'→');if(drag?.type==='fold'){g.strokeStyle='#ad5b18';g.lineWidth=5;g.beginPath();g.moveTo(...p);g.lineTo(P.x,P.y);g.stroke()}}
 else panelNote('세 번 접기 완료!',500,140,390);
}
function tagPic(x,y,w=150,h=110){
 g.save();g.fillStyle='#fffdf0';g.strokeStyle='#8f9d8d';g.lineWidth=1.5;roundRect(x,y,w,h,7);g.fill();g.stroke();g.fillStyle='#596f60';g.beginPath();g.arc(x+w*.5,y+h*.09,Math.max(3,w*.035),0,Math.PI*2);g.fill();txt('손질 확인',x+w*.5,y+h*.48,w*.12);txt('JE-021',x+w*.5,y+h*.72,w*.11);g.restore();
}
function taggedShirt(x,y,w,h,tagged=true){
 cleanPic('cloth4.webp',x,y,w,h);if(!tagged)return;
 const ax=x+w*.5,ay=y+h*.16,tx=x+w*.67,ty=y+h*.27,tw=w*.3,th=h*.35;
 g.save();g.strokeStyle='#5a5143';g.lineWidth=Math.max(1.3,w*.006);g.beginPath();g.ellipse(ax,ay,w*.034,h*.018,0,0,Math.PI*2);g.moveTo(ax+w*.03,ay);g.bezierCurveTo(ax+w*.12,ay-h*.08,tx+tw*.4,ty-h*.08,tx+tw*.5,ty+th*.09);g.stroke();
 // Upper half of collar loop tucks under the fabric edge.
 g.beginPath();g.rect(ax-w*.04,ay-h*.02,w*.08,h*.012);g.clip();cleanPic('cloth4.webp',x,y,w,h);g.restore();
 tagPic(tx,ty,tw,th);
}
function drawQuality(){
 taggedShirt(190,170,280,340,S.tag);
 [0,1,2].forEach(i=>{g.fillStyle=S.checked[i]?'#e6f3e8':'#fffdf2';g.strokeStyle='#7c9683';g.lineWidth=2;roundRect(590,190+i*100,330,80,12);g.fill();g.stroke();txt((S.checked[i]?'✓ ':'□ ')+['얼룩·보풀 없음','단추 고정 완료','접기 상태 양호'][i],755,239+i*100,20)});
 if(S.issued&&!S.tag){clearMarker(330,224,'카라',false);if(drag?.type!=='tag')tagPic(705,555,155,120);panelNote('태그 구멍을 카라 표시로 옮기세요',390,120,550)}
 if(S.tag)panelNote('카라에 태그 연결 완료',350,560,360);
 if(drag?.type==='tag')tagPic(P.x-75,P.y-10,150,110);
}
const clothingBox={x:250,y:180,w:500,h:350};
function clothesBoxInside(){g.beginPath();g.moveTo(300,275);g.lineTo(700,275);g.lineTo(750,400);g.lineTo(250,400);g.closePath()}
function drawClothesInBox(){
 cleanPic('pack3.webp',125,80,750,450);if(S.boxed){g.save();clothesBoxInside();g.clip();const lift=Math.max(0,1-(performance.now()-S.boxedAt)/400)*15;taggedShirt(370,290-lift,260,105);g.restore();g.save();g.beginPath();g.rect(125,400,750,130);g.clip();cleanPic('pack3.webp',125,80,750,450);g.restore()}
}
function startBoxClose(){if(!S.boxed)return say('카라 태그가 달린 셔츠를 먼저 상자 안에 담아 주세요.');if(S.closed||S.closing)return;S.closing=true;S.closeProgress=0;drag=null}
function tapeSurface(p){return p.x>=285&&p.x<=715&&p.y>=210&&p.y<=510}
function appendTape(p){
 const a=S.tapePoints[S.tapePoints.length-1],dist=Math.hypot(p.x-a.x,p.y-a.y);if(dist<2||dist>75||!tapeSurface(p))return;
 S.tapePoints.push({x:p.x,y:p.y});S.tapeLength+=dist;S.tape=Math.min(.99,S.tapeLength/285);
 if(S.tapeLength>=230&&p.y>=475){S.tape=1;drag=null;tone();check()}
}
function drawMovingTape(){
 const pts=S.tapePoints;g.save();g.lineCap='butt';g.lineJoin='round';
 const trace=()=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y))};
 if(pts.length>1){for(const front of[false,true]){g.save();g.beginPath();g.rect(0,front?415:0,1000,front?285:415);g.clip();g.strokeStyle=front?'#ae7f48':'#cea66bee';g.lineWidth=29;trace();g.stroke();g.restore()}g.strokeStyle='#eed4a377';g.lineWidth=2;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x-9,p.y):g.moveTo(p.x-9,p.y));g.stroke()}
 g.restore();if(S.tape<1){const p=pts[pts.length-1];cleanPic('taperoll.webp',p.x-30,p.y-30,60,60);if(!drag)clearMarker(p.x,p.y,'↓',false)}
}
function drawDispatch(){
 if(S.closed)cleanPic('pack4.webp',250,180,500,350);else drawClothesInBox();
 if(!S.boxed&&drag?.type!=='boxshirt'){taggedShirt(90,555,190,125);panelNote('접은 셔츠',185,682,200)}
 if(S.boxed&&!S.closed&&!S.closing)panelNote('상자 덮개를 닫아요',500,130,370);
 if(S.closing){const t=S.closeProgress;g.save();g.fillStyle='#b88a54';g.strokeStyle='#795b35';g.lineWidth=2;g.beginPath();g.moveTo(315,290);g.lineTo(685,290);g.lineTo(680,290+110*t);g.lineTo(320,290+110*t);g.closePath();g.fill();g.stroke();g.fillStyle='#cfa674';g.beginPath();g.moveTo(295,425);g.lineTo(705,425);g.lineTo(680,425-85*t);g.lineTo(320,425-85*t);g.closePath();g.fill();g.stroke();g.restore();panelNote('덮개를 맞춰 닫는 중',500,130,370)}
 if(S.closed){drawMovingTape();panelNote(S.tape>=1?'포장 완료':'테이프 롤을 뚜껑에서 앞면까지 움직여 붙이세요',500,575,S.tape>=1?290:760)}
 if(drag?.type==='boxshirt')taggedShirt(P.x-100,P.y-65,200,130);
 $('closeBox').disabled=!S.boxed||S.closing||S.closed;$('closeBox').textContent=S.closed?'상자 닫힘 ✓':S.closing?'상자 닫는 중…':'상자 덮개 닫기';
}

