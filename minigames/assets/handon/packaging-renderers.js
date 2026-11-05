
// Shared inner-container rendering; all sprites have genuine alpha.
const foodBounds={};
function spriteBounds(key){
 if(foodBounds[key])return foodBounds[key];const a=im[key];if(!a?.complete)return null;
 const cv=document.createElement('canvas');cv.width=a.naturalWidth;cv.height=a.naturalHeight;const x=cv.getContext('2d');x.drawImage(a,0,0);const d=x.getImageData(0,0,cv.width,cv.height).data;let l=cv.width,t=cv.height,r=0,b=0;
 for(let y=0;y<cv.height;y++)for(let z=0;z<cv.width;z++)if(d[(y*cv.width+z)*4+3]>18){l=Math.min(l,z);r=Math.max(r,z);t=Math.min(t,y);b=Math.max(b,y)}
 return foodBounds[key]=[l,t,Math.max(1,r-l+1),Math.max(1,b-t+1)];
}
function fitSprite(key,x,y,w,h){const b=spriteBounds(key);if(b)g.drawImage(im[key],...b,x,y,w,h)}
function rounded(x,y,w,h,r=15){g.beginPath();g.roundRect(x,y,w,h,r)}
function dropLift(id){return Math.max(0,1-(performance.now()-(S.drops[id]||0))/380)*18}
function item(i,x,y,w=125,h=90){fitSprite('meat'+(part+3)+'.webp',x-w/2,y-h/2,w,h)}
function foodTray(x,y,w,h,ids){
 fitSprite('pack0.webp',x,y,w,h);
 g.save();rounded(x+w*.085,y+h*.12,w*.83,h*.73,Math.min(w,h)*.07);g.clip();
 ids.forEach((id,j)=>{g.save();g.shadowColor='#0007';g.shadowBlur=5;g.shadowOffsetY=3;if(phase>=3){const px=x+w*(.15+j*.175),py=y+h*.49-dropLift('meat'+id);g.translate(px,py);if(part===0){g.rotate(Math.PI/2);item(id,0,0,h*.72,w*.18)}else item(id,0,0,w*.18,h*.72)}else{const px=x+w*(.23+(j%3)*.27),py=y+h*(j<3?.34:.66)-dropLift('meat'+id),small=weights[id]===50?.84:1;item(id,px,py,w*.29*small,h*.4*small)}g.restore()});g.restore();
 // The lower inner lip is in front of the food, not behind it.
 g.save();g.beginPath();g.rect(x,y+h*.91,w,h*.09);g.clip();fitSprite('pack0.webp',x,y,w,h);g.restore();
}
function trayFood(x,y,w=360,h=225,n=5){foodTray(x,y,w,h,(packed.length?packed:[0,1,2,3,4]).slice(0,n))}
function labelOnPack(x,y,w,h){g.save();g.fillStyle='#fffdf2';rounded(x,y,w,h,5);g.fill();g.strokeStyle='#b5b9b0';g.lineWidth=1;g.stroke();text(parts[part]+' 450g',x+w/2,y+h*.36,w*.085);text('YJ-042 · 체험용',x+w/2,y+h*.61,w*.06);g.fillStyle='#223a32';for(let n=0;n<27;n++){const bw=n%3===0?3:1;g.fillRect(x+w*.12+n*w*.027,y+h*.73,bw,h*.14)}g.restore()}
function packagePic(x,y,w=350,h=220){
 fitSprite('vacuum'+part+'.webp',x,y,w,h);if((labelDone&&phase!==4)||phase===5)labelOnPack(x+w*.27,y+h*.32,w*.46,h*.43)
}
function drawWeigh(){
 pic('tool5.webp',275,125,470,370);
 if(S.tray)foodTray(340,170,340,190,S.on.filter(i=>drag?.type!=='remove'||drag.i!==i));else{fitSprite('pack0.webp',40,330,180,120);plaque('빈 트레이',130,490,180)}
 pic('ui1.webp',370,390,280,70);text((S.tare?weight():S.tray?80:0)+' g',510,438,35,'#e9f8d8');text(S.tare?'TARE 0 · 목표 450g':'빈 트레이를 올리고 영점을 누르세요',510,510,18);
 weights.forEach((w,i)=>{if(!S.on.includes(i)&&drag?.type!=='weigh'+i){let x=90+i*164;item(i,x,600,w===50?85:115,80);plaque(w+'g',x,680,130)}});
 if(drag?.type.startsWith('weigh')||drag?.type==='remove')item(drag.i,P.x,P.y,115,80);
}
function filmOverTray(progress,vac){
 if(progress<=0)return;g.save();g.beginPath();g.rect(270,224,460*progress,320);g.clip();
 const inset=vac*5;rounded(270+inset,224+inset,460-inset*2,320-inset*2,15);const shine=g.createLinearGradient(270,224,730,544);shine.addColorStop(0,'#ffffff42');shine.addColorStop(.32,'#ffffff06');shine.addColorStop(.5,'#ffffff3d');shine.addColorStop(.55,'#ffffff05');shine.addColorStop(1,'#ffffff35');g.fillStyle=shine;g.fill();g.strokeStyle='#b6d9dfaa';g.lineWidth=2;g.stroke();
 g.strokeStyle='#ffffffa0';g.lineWidth=1.5;for(let i=0;i<7;i++){const x=282+i*70;g.beginPath();g.moveTo(x,238);g.lineTo(x+10+vac*8,257+vac*10);g.moveTo(x,526);g.lineTo(x+18,508-vac*10);g.stroke()}
 if(vac>0){g.strokeStyle='#fffc';for(let i=0;i<5;i++){g.beginPath();g.moveTo(295+i*85,485);g.quadraticCurveTo(310+i*85,485-vac*22,323+i*85,505);g.stroke()}}g.restore();
}
function drawVacuum(){
 const all=S.placed.length===packed.length;
 fitSprite('pack2.webp',240,92,520,160);
 foodTray(290,280,420,245,S.placed);if(S.vac>.65){g.save();g.globalAlpha=Math.min(1,(S.vac-.65)/.35);fitSprite('vacuum'+part+'.webp',290,280,420,245);g.restore()}
 filmOverTray(S.film,S.vac);
 // The package mouth sits directly between the actual sealing jaws.
 if(all&&S.film<1){const hx=270+460*S.film;g.fillStyle='#e4f7fa99';g.strokeStyle='#619da5';rounded(hx-9,237,18,280,6);g.fill();g.stroke();plaque('필름 손잡이를 오른쪽 끝까지 당겨요',500,575,600)}
 if(S.film===1&&S.vac<1)plaque(S.vac>0?'공기가 빠지며 필름이 조여들어요':'진공 버튼을 길게 눌러요',500,575,560);
 // Pressing closes a straight jaw over the bag mouth; no disconnected drawn line.
 const closed=S.seal>=1?Math.max(0,1-(performance.now()-S.sealedAt)/800):S.seal;
 g.save();g.shadowColor='#0005';g.shadowBlur=6;g.shadowOffsetY=4;const y=220+closed*17;
 const metal=g.createLinearGradient(0,y,0,y+25);metal.addColorStop(0,'#d4dcdd');metal.addColorStop(.4,'#727d80');metal.addColorStop(1,'#cbd2d3');g.fillStyle=metal;rounded(270,y,460,25,6);g.fill();g.fillStyle='#323e41';rounded(425,y+3,150,14,5);g.fill();g.restore();
 if(S.seal>=1){g.strokeStyle='#b0d7dc';g.lineWidth=3;g.beginPath();g.moveTo(283,255);g.lineTo(717,255);g.stroke();plaque('진공 · 열 밀봉 완료',500,575,440)}
 else if(S.vac>=1)plaque('밀봉 바를 길게 눌러 입구를 닫아요',500,575,580);
 text('진공 '+Math.round(S.vac*100)+'%   밀봉 '+Math.round(S.seal*100)+'%',500,65,19);
 packed.forEach((i,j)=>{if(!S.placed.includes(i)&&drag?.type!=='pack'+i){item(i,110+j*180,625,115,70);plaque(weights[i]+'g',110+j*180,682,125)}});
 if(drag?.type.startsWith('pack'))item(drag.i,P.x,P.y,120,85);
 $('vac').disabled=!all||S.film<1||S.vac>=1; $('sealPress').disabled=S.vac<1||S.seal>=1;
 $('vac').textContent=S.vac>=1?'진공 완료 ✓':'길게 눌러 진공';$('sealPress').textContent=S.seal>=1?'밀봉 완료 ✓':'길게 눌러 밀봉 바 닫기';
}
const cooler={x:230,y:180,w:540,h:350};
function coolerInside(){const b=cooler;g.beginPath();g.moveTo(b.x+b.w*.17,b.y+b.h*.12);g.lineTo(b.x+b.w*.83,b.y+b.h*.12);g.lineTo(b.x+b.w*.94,b.y+b.h*.64);g.lineTo(b.x+b.w*.06,b.y+b.h*.64);g.closePath()}
function drawColdBox(){
 const b=cooler;fitSprite('pack3.webp',b.x,b.y,b.w,b.h);
 g.save();coolerInside();g.clip();
 S.ice.forEach((v,i)=>{if(v)fitSprite('pack4.webp',i?610:295,315-dropLift('ice'+i),105,70)});
 if(S.box)packagePic(350,295-dropLift('box'),300,100);g.restore();
 // Repaint the front wall over contents to show their depth in the cavity.
 g.save();g.beginPath();g.rect(b.x,b.y+b.h*.67,b.w,b.h*.33);g.clip();fitSprite('pack3.webp',b.x,b.y,b.w,b.h);g.restore();
}
function closeCooler(from){
 if(!S.ice.every(Boolean)||!S.box)return feedback('아이스팩 두 개와 완성 팩을 먼저 상자 안에 담아 주세요.');
 if(S.lid||S.closing)return;S.closing=true;S.lidProgress=0;S.lidFrom=from||{x:780,y:180};drag=null;feedback('뚜껑을 상자 테두리에 맞춰 내려 덮고 있어요.');
}
function tapeHead(v){return{x:500,y:212+v*285}}
function tapeOnCooler(){
 const end=tapeHead(S.tape);if(S.tape>0){
 const grad=g.createLinearGradient(483,0,517,0);grad.addColorStop(0,'#9e7137');grad.addColorStop(.24,'#d5ae72ee');grad.addColorStop(.78,'#cba365f5');grad.addColorStop(1,'#9e7137');
 g.fillStyle=grad;g.beginPath();g.moveTo(484,212);g.lineTo(516,212);g.lineTo(520,Math.min(end.y,410));g.lineTo(480,Math.min(end.y,410));g.closePath();g.fill();
 if(end.y>410){g.fillStyle='#b68a50';g.fillRect(480,410,40,end.y-410);g.strokeStyle='#edd1a2';g.lineWidth=2;g.beginPath();g.moveTo(480,411);g.lineTo(520,411);g.stroke()}
 }
 if(S.tape<1){g.save();g.translate(end.x,end.y);g.fillStyle='#c69a5c';g.strokeStyle='#8e6234';g.lineWidth=2;g.beginPath();g.ellipse(0,0,27,16,0,0,Math.PI*2);g.fill();g.stroke();g.fillStyle='#f7f0d5';g.beginPath();g.ellipse(0,0,12,7,0,0,Math.PI*2);g.fill();g.restore()}
}
function drawShipping(){
 if(S.lid)fitSprite('closedbox.webp',cooler.x,cooler.y,cooler.w,cooler.h);else drawColdBox();
 if(!S.lid&&!S.closing){S.ice.forEach((v,i)=>{if(!v&&drag?.type!=='ice'+i){fitSprite('pack4.webp',80+i*170,565,130,90);plaque('아이스팩 '+(i+1),145+i*170,682,150)}});if(!S.box&&drag?.type!=='box'){packagePic(690,560,240,130);plaque('완성 팩',810,692,180)}
 if(S.ice.every(Boolean)&&S.box){if(drag?.type!=='lid'){fitSprite('lid.webp',755,103,220,120);text('뚜껑을 상자 위로',855,82,17);text('끌어 내려 덮어요',855,248,17)}}else text('보냉 상자 안에 담아 주세요',500,115,23);
 }
 if(S.closing){const t=1-Math.pow(1-S.lidProgress,3),from=S.lidFrom;const x=from.x+(cooler.x-from.x)*t,y=from.y+(cooler.y-from.y)*t;g.save();g.shadowColor='#193b3b44';g.shadowBlur=(1-t)*15;g.shadowOffsetY=10*(1-t);fitSprite('lid.webp',x,y,220+(cooler.w-220)*t,120+110*t);g.restore();text('뚜껑 맞추기 '+Math.round(S.lidProgress*100)+'%',500,130,20)}
 if(S.lid){tapeOnCooler();if(S.tape<1){text('테이프 롤을 잡아 뚜껑에서 앞면 아래로 당겨요',500,130,21);const p=tapeHead(S.tape);ring(p.x,p.y,36);g.save();g.setLineDash([5,7]);g.strokeStyle='#bd9b5b88';g.lineWidth=2;g.beginPath();g.moveTo(500,p.y+27);g.lineTo(500,500);g.stroke();g.restore()}else{text('보냉 포장 · 봉함 완료',500,130,23);labelOnPack(560,413,140,75)}}
 if(drag?.type.startsWith('ice'))fitSprite('pack4.webp',P.x-60,P.y-45,120,90);if(drag?.type==='box')packagePic(P.x-125,P.y-70,250,140);if(drag?.type==='lid')fitSprite('lid.webp',P.x-110,P.y-60,220,120);
 $('closeLid').disabled=!S.ice.every(Boolean)||!S.box||S.closing||S.lid;$('closeLid').textContent=S.lid?'뚜껑 닫힘 ✓':S.closing?'뚜껑 덮는 중…':'뚜껑을 맞춰 덮기';
}

