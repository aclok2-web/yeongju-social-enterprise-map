'use strict';
const $=id=>document.getElementById(id),c=$('c'),g=c.getContext('2d'),im={},bounds={};
let phase=0,S={},drag=null,P={x:0,y:0},ready=false,started=false,last=0,sound=false,ac,batch={gin:0,fruit:0};
const names=['원료 선별','배합 연구','혼합·성형','포장 완성'],raw=[0,1,2,0,3,1],good=[true,true,false,true,false,true];
const descriptions=[
 ['좋은 원료를 골라요','인삼·온전한 사과는 왼쪽 준비 트레이, 손상된 사과와 돌은 오른쪽 확인 트레이로 옮기세요.','실제 원료 검사 기준을 단순화한 가상 분류입니다.'],
 ['인삼과 과일을 배합해요','인삼 2스푼과 과일 3스푼을 볼에 넣으세요. 원료 카드나 숟가락을 끌어 넣거나 아래 1스푼 넣기 버튼을 누를 수 있어요.','2:3은 게임용 비율입니다. 실제 제품의 배합비와 무관합니다.'],
 ['섞고, 틀 안에 모양을 잡아요','오른쪽 주걱으로 볼 안을 크게 3바퀴 저으세요. 혼합 후 틀 구멍 세 곳을 각각 1초씩 누르면 시제품이 구멍 안에 만들어집니다.','실제 공정과 시간을 단순화한 가상 제품개발 체험입니다.'],
 ['담고 밀봉해 선물로 준비해요','시제품 3개를 파우치 입구로 넣으세요. 윗부분을 왼쪽에서 오른쪽으로 밀봉한 뒤 라벨을 붙이고 파우치를 빈 선물상자에 넣습니다.','지역 원료가 가공·포장되어 새 제품이 되는 과정을 생각해 보세요.']
];
const cavities=[{x:312,y:542},{x:500,y:542},{x:688,y:542}],pouchRect={x:640,y:140,w:260,h:350};
function pic(k,x,y,w,h,alpha=1){if(!im[k]?.naturalWidth)return;g.save();g.globalAlpha=alpha;g.drawImage(im[k],x,y,w,h);g.restore()}
function spriteBounds(k){if(bounds[k])return bounds[k];const a=im[k];if(!a?.naturalWidth)return null;const cv=document.createElement('canvas');cv.width=a.naturalWidth;cv.height=a.naturalHeight;const x=cv.getContext('2d');x.drawImage(a,0,0);const d=x.getImageData(0,0,cv.width,cv.height).data;let l=cv.width,t=cv.height,r=0,b=0;for(let y=0;y<cv.height;y++)for(let z=0;z<cv.width;z++)if(d[(y*cv.width+z)*4+3]>18){l=Math.min(l,z);r=Math.max(r,z);t=Math.min(t,y);b=Math.max(b,y)}return bounds[k]=[l,t,Math.max(1,r-l+1),Math.max(1,b-t+1)]}
function asset(k,x,y,w,h){const b=spriteBounds(k);if(b)g.drawImage(im[k],...b,x,y,w,h)}
function text(t,x,y,size=22,col='#234638'){g.fillStyle=col;g.font='bold '+size+'px sans-serif';g.textAlign='center';g.fillText(t,x,y)}
function rounded(x,y,w,h,r=12){g.beginPath();g.roundRect(x,y,w,h,r)}
function card(x,y,w,h){g.fillStyle='#fffdf4ed';g.strokeStyle='#b7c2a6';g.lineWidth=2;rounded(x,y,w,h,14);g.fill();g.stroke()}
function panel(x,y,w,h){card(x,y,w,h)}
function hit(x,y,w,h){return P.x>=x&&P.x<=x+w&&P.y>=y&&P.y<=y+h}
function near(p,x,y,r=55){return Math.hypot(p.x-x,p.y-y)<r}
function say(t){$('feedback').textContent=t}
function tone(){if(!sound)return;ac??=new(window.AudioContext||window.webkitAudioContext)();ac.resume();let o=ac.createOscillator(),v=ac.createGain();o.connect(v);v.connect(ac.destination);v.gain.value=.04;o.frequency.value=640;o.start();v.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.12);o.stop(ac.currentTime+.12)}
function init(){
 if(phase<2)batch={gin:0,fruit:0};
 S={sorted:Array(6).fill(false),gin:0,fruit:0,mix:0,angle:null,pressed:[0,0,0],packed:[false,false,false],arrivals:[null,null,null],seal:0,label:false,boxed:false,inGift:false,boxing:false,boxProgress:0,lastDose:null};drag=null;
 $('title').textContent=descriptions[phase][0];$('desc').textContent=descriptions[phase][1];$('tip').textContent=descriptions[phase][2];$('phaseLabel').textContent='MISSION '+(phase+1)+' / 4';
 $('steps').innerHTML=names.map((n,i)=>'<span class="'+(i===phase?'on':'')+'">'+(i+1)+'. '+n+'</span>').join('');$('next').textContent=phase===3?'체험 완료':'다음 작업';
 $('phaseControls').innerHTML=phase===0?'<p class="dose-status" id="rawStatus" aria-live="polite"></p>':phase===1?'<p class="dose-status" id="doseStatus" aria-live="polite"></p><div class="dose-actions"><button id="addGin">인삼 1스푼 넣기</button><button id="addFruit">과일 1스푼 넣기</button></div>':'';
 if(phase===1){$('addGin').onclick=()=>addDose('gin');$('addFruit').onclick=()=>addDose('fruit')}
 say('');check();
}
function progress(){return phase===0?S.sorted.filter(Boolean).length/6:phase===1?(S.gin+S.fruit)/5:phase===2?(Math.min(1,S.mix/18.85)+S.pressed.reduce((a,b)=>a+b,0))/4:(S.packed.filter(Boolean).length+S.seal+Number(S.label)+Number(S.boxed))/6}
function check(){
 const ok=phase===0?S.sorted.every(Boolean):phase===1?S.gin===2&&S.fruit===3:phase===2?S.pressed.every(v=>v>=1):S.boxed;
 $('next').disabled=!ok;$('fill').style.width=progress()*100+'%';
 if(phase===0)$('rawStatus').textContent='준비 트레이 · 인삼 '+raw.filter((v,i)=>v===0&&S.sorted[i]).length+' / 2개 · 사과 '+raw.filter((v,i)=>v===1&&S.sorted[i]).length+' / 2개 · 추가 확인 '+S.sorted.filter((v,i)=>v&&!good[i]).length+' / 2개';
 if(phase===1){$('doseStatus').textContent='인삼 '+S.gin+' / 2스푼 · 과일 '+S.fruit+' / 3스푼';$('addGin').disabled=S.gin>=2;$('addFruit').disabled=S.fruit>=3}
 if(ok)say(phase===3?'선물상자 포장까지 완성했어요!':'작업 완료! 다음으로 이동하세요.');return ok;
}
function addDose(type){
 if(phase!==1||!['gin','fruit'].includes(type))return;
 const max=type==='gin'?2:3;if(S[type]>=max)return say((type==='gin'?'인삼':'과일')+'은 필요한 양을 모두 넣었어요.');
 S[type]++;S.lastDose={type,time:performance.now()};tone();say((type==='gin'?'인삼':'과일')+' 1스푼 반영 · 인삼 '+S.gin+'/2, 과일 '+S.fruit+'/3');check();
}
function drawDosing(){
 for(let i=0;i<2;i++){const x=i?710:50,type=i?'fruit':'gin',value=S[type],max=i?3:2;card(x,120,240,390);pic(i?'a1':'a0',x+30,148,180,155);text(i?'과일 원료':'인삼 원료',x+120,334,23);asset(i?'fruitSpoon':'ginSpoon',x+40,360,160,100);text(value+' / '+max+' 스푼',x+120,490,24,value===max?'#286846':'#8b622c')}
 asset('a4',315,180,370,310);if(S.gin+S.fruit){g.save();g.globalAlpha=(S.gin+S.fruit)/5;asset('a5',315,180,370,310);g.restore()}
 const doses=[...Array(S.gin).fill('gin'),...Array(S.fruit).fill('fruit')];doses.forEach((k,i)=>{g.fillStyle=k==='gin'?'#d8c39b':'#e4ac55';g.beginPath();g.ellipse(405+(i%3)*83,300+Math.floor(i/3)*55,29,19,.1,0,Math.PI*2);g.fill()});
 card(320,535,360,86);text('인삼 '+S.gin+' / 2 · 과일 '+S.fruit+' / 3',500,574,26);text('원료 카드 전체에서 끌어 넣을 수 있어요',500,603,15);
}
function drawForming(){
 asset('a5',280,115,440,310);text('반영된 배합 · 인삼 '+batch.gin+' + 과일 '+batch.fruit,500,105,18);
 if(S.mix<18.85){asset('a6',drag?.kind==='mix'?P.x-95:735,drag?.kind==='mix'?P.y-60:260,180,145);text('혼합 '+Math.min(100,Math.round(S.mix/18.85*100))+'%',500,445);g.strokeStyle='#987237';g.lineWidth=4;g.setLineDash([8,10]);g.beginPath();g.ellipse(500,285,130,85,0,0,Math.PI*2);g.stroke();g.setLineDash([])}
 else{asset('a8',215,455,570,175);cavities.forEach((p,i)=>{g.save();g.beginPath();g.arc(p.x,p.y,60,0,Math.PI*2);g.clip();if(S.pressed[i]>0){g.fillStyle='#b8914c';g.beginPath();g.arc(p.x,p.y+8*(1-S.pressed[i]),53,0,Math.PI*2);g.fill();g.globalAlpha=S.pressed[i];asset('tablet',p.x-53,p.y-53,106,106)}g.restore();if(S.pressed[i]<1){g.strokeStyle='#437354';g.lineWidth=5;g.beginPath();g.arc(p.x,p.y,67,-Math.PI/2,-Math.PI/2+S.pressed[i]*Math.PI*2);g.stroke()}text(S.pressed[i]>=1?'성형 완료':'눌러 성형 '+Math.round(S.pressed[i]*100)+'%',p.x,670,16)});text('틀 구멍 안에 3개 만들기',500,435,20)}
}
function labelCard(x,y,w,h){g.fillStyle='#fffcf0';g.strokeStyle='#a5ad90';g.lineWidth=1.5;rounded(x,y,w,h,5);g.fill();g.stroke();text('풍기인삼 × 과일',x+w/2,y+h*.42,w*.1);text('체험용 시제품',x+w/2,y+h*.75,w*.09)}
function drawPouch(x,y,w,h,animated=false){
 asset(S.seal>=1?'pouchSealed':'a10',x,y,w,h);
 const wx=x+w*.16,wy=y+h*.43,ww=w*.68,wh=h*.4;
 g.save();rounded(wx,wy,ww,wh,Math.min(w,h)*.06);g.clip();const win=g.createLinearGradient(wx,wy,wx+ww,wy+wh);win.addColorStop(0,'#dfdfbbbf');win.addColorStop(.5,'#f6efd377');win.addColorStop(1,'#abb68f99');g.fillStyle=win;g.fillRect(wx,wy,ww,wh);
 const slots=[[.35,.54],[.66,.54],[.5,.74]];
 S.packed.forEach((v,i)=>{if(!v)return;let xx=x+w*slots[i][0],yy=y+h*slots[i][1];const a=S.arrivals[i],age=animated&&a?Math.min(1,(performance.now()-a.time)/520):1;if(age<.35)return;if(age<1){let t=(age-.35)/.65;xx=x+w*.5+(xx-x-w*.5)*t;yy=y+h*.12+(yy-y-h*.12)*t}asset('tablet',xx-w*.11,yy-h*.08,w*.22,h*.16)});
 g.strokeStyle='#ffffffb3';g.lineWidth=2;g.beginPath();g.moveTo(wx+ww*.13,wy+4);g.lineTo(wx+ww*.38,wy+wh-4);g.moveTo(wx+ww*.74,wy+4);g.lineTo(wx+ww*.9,wy+wh*.65);g.stroke();g.restore();
 g.strokeStyle='#9eae8b';g.lineWidth=2;rounded(wx,wy,ww,wh,Math.min(w,h)*.06);g.stroke();
 if(S.label)labelCard(x+w*.19,y+h*.23,w*.62,h*.16);
 if(S.packed.every(Boolean)){g.strokeStyle='#aaaf89';g.lineWidth=7;g.beginPath();g.moveTo(x+w*.12,y+h*.1);g.lineTo(x+w*.88,y+h*.1);g.stroke();g.strokeStyle='#416a44';g.lineWidth=5;g.beginPath();g.moveTo(x+w*.12,y+h*.1);g.lineTo(x+w*(.12+.76*S.seal),y+h*.1);g.stroke();if(S.seal<1){g.fillStyle='#e2c48b';g.beginPath();g.arc(x+w*(.12+.76*S.seal),y+h*.1,9,0,Math.PI*2);g.fill()}}
 if(animated)S.arrivals.forEach((a,i)=>{if(!a||!S.packed[i])return;const t=(performance.now()-a.time)/520;if(t>=.35)return;let f=Math.min(1,t/.35),xx=a.from.x+(x+w*.5-a.from.x)*f,yy=a.from.y+(y+h*.1-a.from.y)*f;asset('tablet',xx-28,yy-28,56,56)});
}
function giftBox(x,y,w,h,closing=0){
 if(closing<1){g.save();g.globalAlpha=1-closing;asset('a11',x,y,w,h);if(S.inGift){g.save();g.beginPath();g.moveTo(x+w*.14,y+h*.58);g.lineTo(x+w*.86,y+h*.58);g.lineTo(x+w*.94,y+h*.85);g.lineTo(x+w*.06,y+h*.85);g.closePath();g.clip();drawPouch(x+w*.3,y+h*.62,w*.4,h*.22);g.restore();g.save();g.beginPath();g.rect(x,y+h*.85,w,h*.15);g.clip();asset('a11',x,y,w,h);g.restore()}g.restore()}
 if(closing>0){g.save();g.globalAlpha=closing;asset('giftClosed',x,y+h*.5,w,h*.5);if(closing>.8)labelCard(x+w*.28,y+h*.62,w*.44,h*.12);g.restore()}
}
function drawPacking(){
 if(S.inGift){const t=Math.min(1,S.boxProgress/.55),ease=1-Math.pow(1-t,3),x=55+195*ease,y=145-5*ease,w=330+170*ease,h=310+90*ease,close=S.boxed?1:Math.max(0,(S.boxProgress-.55)/.45);giftBox(x,y,w,h,close);text(S.boxed?'선물 포장 완료':'파우치를 담고 상자를 닫는 중…',500,620,26);return}
 giftBox(55,145,330,310);text('빈 선물상자',220,488,19);
 if(drag?.kind!=='pouch')drawPouch(pouchRect.x,pouchRect.y,pouchRect.w,pouchRect.h,true);
 text(S.packed.filter(Boolean).length+' / 3알 · '+(S.seal>=1?'밀봉 완료':'입구로 넣기'),770,525,20);
 if(S.packed.every(Boolean)&&S.seal<1)text('입구를 왼쪽에서 오른쪽으로 밀봉',760,120,16);
 if(S.seal>=1&&!S.label&&drag?.kind!=='label'){labelCard(410,140,150,85);text('라벨 붙이기',485,258,18)}
 for(let i=0;i<3;i++)if(!S.packed[i]&&drag?.kind!=='tablet'+i){asset('tablet',395+i*100,565,80,80);text('시제품 '+(i+1),435+i*100,679,16)}
}
function draw(){
 g.clearRect(0,0,1000,700);pic('bg',0,0,1000,700);card(30,20,940,65);text(['원료의 상태를 살펴요','가상 배합표 · 인삼 2 + 과일 3','혼합하고 · 틀 안에 성형해요','한 알씩 담아 선물로 완성해요'][phase],500,62,25);
 if(phase===0){card(55,125,420,245);card(525,125,420,245);text('원료 준비',265,160);text('추가 확인',735,160);raw.forEach((v,i)=>{if(!S.sorted[i]&&drag?.i!==i)pic('a'+v,45+i*155,490,140,150);if(S.sorted[i]){const slot=good.slice(0,i).filter(b=>b===good[i]).length;pic('a'+v,good[i]?95+(slot%2)*200:565+slot*170,good[i]?180+Math.floor(slot/2)*90:210,good[i]?140:150,good[i]?80:125)}});text('인삼 '+raw.filter((v,i)=>v===0&&S.sorted[i]).length+' / 2개 · 사과 '+raw.filter((v,i)=>v===1&&S.sorted[i]).length+' / 2개',265,400,21);text('확인 '+S.sorted.filter((v,i)=>v&&!good[i]).length+' / 2개',735,400,21);text('원료를 알맞은 트레이로 옮기세요',500,455,18)}
 if(phase===1)drawDosing();if(phase===2)drawForming();if(phase===3)drawPacking();
 if(drag){if(drag.kind==='raw')pic('a'+raw[drag.i],P.x-70,P.y-70,140,140);if(drag.kind==='spoon')asset(drag.type==='gin'?'ginSpoon':'fruitSpoon',P.x-80,P.y-55,160,120);if(drag.kind.startsWith('tablet'))asset('tablet',P.x-40,P.y-40,80,80);if(drag.kind==='label')labelCard(P.x-70,P.y-35,140,70);if(drag.kind==='pouch')drawPouch(P.x-75,P.y-100,150,200)}
}
function position(e){const r=c.getBoundingClientRect();P={x:(e.clientX-r.left)*1000/r.width,y:(e.clientY-r.top)*700/r.height}}
c.onpointerdown=e=>{
 if(!started||$('end').open)return;position(e);c.setPointerCapture(e.pointerId);
 if(phase===0)for(let i=0;i<6;i++)if(!S.sorted[i]&&hit(45+i*155,490,140,150))drag={kind:'raw',i};
 if(phase===1){if(hit(50,120,240,400))drag={kind:'spoon',type:'gin'};else if(hit(710,120,240,400))drag={kind:'spoon',type:'fruit'}}
 if(phase===2){if(S.mix<18.85&&hit(725,250,210,180)){drag={kind:'mix'};S.angle=null}else if(S.mix>=18.85)cavities.forEach((p,i)=>{if(S.pressed[i]<1&&near(P,p.x,p.y,70))drag={kind:'press',i}})}
 if(phase===3&&!S.inGift){if(S.label&&hit(640,140,260,350))drag={kind:'pouch'};else if(!S.label&&S.seal>=1&&hit(410,140,150,85))drag={kind:'label'};else if(S.packed.every(Boolean)&&!S.label&&S.seal<1&&near(P,671+198*S.seal,175,35))drag={kind:'seal'};else for(let i=0;i<3;i++)if(!S.packed[i]&&hit(395+i*100,555,80,100))drag={kind:'tablet'+i,i}}
};
c.onpointermove=e=>{
 position(e);
 if(drag?.kind==='mix'){const dx=P.x-500,dy=(P.y-285)*1.4,r=Math.hypot(dx,dy);if(r>45&&r<190){let a=Math.atan2(dy,dx);if(S.angle!==null){let d=Math.atan2(Math.sin(a-S.angle),Math.cos(a-S.angle));if(Math.abs(d)<.65)S.mix=Math.min(18.85,S.mix+Math.abs(d))}S.angle=a;if(S.mix>=18.85){drag=null;tone();say('혼합 완료! 틀 구멍 세 곳을 눌러 성형하세요.')}}else S.angle=null}
 if(drag?.kind==='seal'&&Math.abs(P.y-175)<40){S.seal=Math.max(S.seal,Math.min(1,(P.x-671)/198));if(S.seal>=.98){S.seal=1;drag=null;tone();say('밀봉 완료! 라벨을 파우치 앞쪽에 붙여 주세요.')}}
 check();
};
c.onpointerup=e=>{
 position(e);if(drag?.kind==='raw'){const correct=good[drag.i]?hit(55,125,420,245):hit(525,125,420,245);if(correct){S.sorted[drag.i]=true;tone()}else say('원료 상태를 다시 살펴 알맞은 칸으로 옮겨 주세요.')}
 if(drag?.kind==='spoon'){if(hit(305,165,390,345))addDose(drag.type);else say('가운데 볼 안에 놓으면 1스푼이 반영됩니다.')}
 if(drag?.kind.startsWith('tablet')&&hit(640,140,260,350)){const i=drag.i;S.packed[i]=true;S.arrivals[i]={time:performance.now(),from:{...P}};tone();say('시제품 '+S.packed.filter(Boolean).length+' / 3알이 파우치에 들어갔어요.')}
 if(drag?.kind==='label'&&hit(640,140,260,350)){S.label=true;tone();say('내용물이 든 파우치를 왼쪽 빈 선물상자로 옮기세요.')}
 if(drag?.kind==='pouch'&&hit(55,145,330,310)){S.inGift=true;S.boxing=true;S.boxProgress=0;tone();say('파우치를 담아 선물상자를 닫고 있어요.')}
 drag=null;S.angle=null;check();
};c.onpointercancel=()=>{drag=null;S.angle=null};
function loop(t){const dt=Math.max(0,Math.min(.05,(t-last)/1000||0));last=t;
 if(drag?.kind==='press'){const i=drag.i,p=cavities[i];if(near(P,p.x,p.y,70)){S.pressed[i]=Math.min(1,S.pressed[i]+dt);if(S.pressed[i]>=1){drag=null;tone()}check()}}
 if(S.boxing){S.boxProgress=Math.min(1,S.boxProgress+dt/1.3);if(S.boxProgress>=1){S.boxing=false;S.boxed=true;tone();check()}}
 if(ready)draw();requestAnimationFrame(loop);
}
$('next').onclick=()=>{if(!check())return;if(phase<3){if(phase===1)batch={gin:S.gin,fruit:S.fruit};phase++;init()}else{draw();$('giftPreview').src=c.toDataURL('image/png');$('end').showModal();window.parent.postMessage({type:'yeongju-enterprise-experience-complete',businessId:24},'*')}};
$('reset').onclick=init;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'소리 켬':'소리 끔';$('sound').setAttribute('aria-pressed',String(sound));if(sound)tone()};
$('again').onclick=()=>{$('end').close();phase=0;init()};$('save').onclick=()=>{draw();const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='소백지엔에프_체험완성.png';a.click()};
async function load(){ready=false;$('start').disabled=true;let n=0;const all=Object.keys(ASSET),out=await Promise.allSettled(all.map(k=>new Promise((resolve,reject)=>{const a=new Image(),timer=setTimeout(()=>reject(k),12000);a.onload=()=>{clearTimeout(timer);if(!a.naturalWidth)return reject(k);im[k]=a;$('load').textContent='이미지 '+(++n)+' / '+all.length;resolve()};a.onerror=()=>{clearTimeout(timer);reject(k)};a.src=ASSET[k]})));const fail=out.filter(x=>x.status==='rejected');$('start').disabled=false;if(fail.length){$('start').textContent='이미지 다시 준비';$('load').textContent='불러오지 못한 이미지: '+fail.map(x=>x.reason).join(', ');$('start').onclick=load}else{ready=true;init();draw();$('start').textContent='제품개발 시작';$('load').textContent='모든 이미지 준비 완료 · 터치 / 마우스 지원';$('start').onclick=()=>{started=true;$('cover').style.display='none'}}}
load();requestAnimationFrame(loop);

