'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const art=key=>'assets/medical-cleaning/'+key+'.png';
const clothes=[
 {name:'의사 가운',type:'general',image:'doctor-coat',note:'흰색 긴 가운'},
 {name:'환자복',type:'general',image:'patient-clothes',note:'연한 파란색 무늬 잠옷'},
 {name:'수술복',type:'surgery',image:'surgical-scrubs',note:'진한 청록색 V넥'},
 {name:'수술포',type:'surgery',image:'surgical-drape',note:'접은 수술용 천'},
 {name:'혈액 오염복',type:'blood',image:'doctor-coat',note:'혈액 오염 · 밀봉 수거',badge:'혈액 오염'},
 {name:'격리실 가운',type:'isolation',image:'doctor-coat',note:'격리실 사용 · 별도 수거',badge:'격리실 전용'}
];
const types=[['general','일반 의료세탁물','의사 가운 · 환자복','doctor-coat'],['surgery','수술실 세탁물','수술복 · 수술포','surgical-scrubs'],['blood','혈액 오염 세탁물','혈액 오염 표시 의류','doctor-coat'],['isolation','격리 세탁물','격리실 전용 표시 의류','doctor-coat']];
const deliveries=[
 {name:'의사 가운',qty:10,hospital:'영주중앙병원',department:'일반진료동',image:'doctor-coat',code:'COAT'},
 {name:'수술복',qty:8,hospital:'새빛외과병원',department:'수술센터',image:'surgical-scrubs',code:'SCRUB'},
 {name:'환자복',qty:12,hospital:'효마음요양병원',department:'입원병동',image:'patient-clothes',code:'PATIENT'}
];
let game={stage:0,score:0,life:3,time:90,tries:0,correct:0,selected:null,timer:null,delivery:0,locked:false,finished:false};
let toastTimer, washTimer, pending=[];
const later=(fn,ms)=>{const id=setTimeout(()=>{pending=pending.filter(x=>x!==id);if(!game.finished)fn()},ms);pending.push(id)};
function show(id){$$('.screen').forEach(x=>x.classList.remove('active'));$('#'+id).classList.add('active')}
function hud(){$('#score').textContent=game.score;$('#life').textContent='❤'.repeat(Math.max(0,game.life));$('#time').textContent=game.time}
function toast(text,good=true){clearTimeout(toastTimer);const x=$('#toast');x.textContent=(good?'✓ ':'! ')+text;x.style.background=good?'#16324f':'#b32c43';x.classList.add('show');toastTimer=setTimeout(()=>x.classList.remove('show'),1600)}
function setStage(n){game.stage=n;game.locked=false;$$('.step').forEach((x,i)=>x.className='step '+(i<n-1?'done':i===n-1?'on':''));show('s'+n)}
function startGame(){if(game.stage||game.finished)return;setStage(1);renderSort();game.timer=setInterval(()=>{game.time--;hud();if(game.time<=0)finish()},1000)}
function garmentImage(c){return '<span class="garment-photo '+(c.type||'')+'"><img src="'+art(c.image)+'" alt="" draggable="false">'+(c.badge?'<span class="garment-badge">'+c.badge+'</span>':'')+'</span>'}
function renderSort(){
 $('#garments').innerHTML=[...clothes].sort(()=>Math.random()-.5).map(c=>'<button type="button" class="garment" data-type="'+c.type+'" aria-pressed="false" onclick="pick(this)">'+garmentImage(c)+'<strong>'+c.name+'</strong><em>'+c.note+'</em><small>선택하기</small></button>').join('');
 $('#bins').innerHTML=types.map(t=>'<button type="button" class="bin bin-'+t[0]+'" data-type="'+t[0]+'" onclick="put(\''+t[0]+'\')"><span class="bin-label">'+t[1]+'</span><span class="bin-examples">'+t[2]+'</span><span class="bin-opening">이곳에 넣기 ↓</span></button>').join('')
}
function pick(el){if(game.locked||game.finished)return;$$('.garment').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});game.selected=el;el.classList.add('selected');el.setAttribute('aria-pressed','true')}
function put(type){
 if(game.locked||game.finished)return;if(!game.selected)return toast('먼저 의료복을 선택하세요',false);
 game.tries++;if(game.selected.dataset.type===type){game.correct++;game.score+=100;game.selected.remove();toast('정확하게 분류했어요!')}else{game.life--;game.score=Math.max(0,game.score-30);toast('의류의 이름과 오염 표시를 확인하세요',false);game.selected.classList.remove('selected');game.selected.setAttribute('aria-pressed','false')}
 game.selected=null;hud();if(game.life<=0)return finish();if(!$('#garments').children.length){game.locked=true;later(()=>{setStage(2);bindOptions()},500)}
}
function bindOptions(){$$('.opt').forEach(b=>b.onclick=()=>{if(game.locked)return;b.parentElement.querySelectorAll('.opt').forEach(x=>x.classList.remove('on'));b.classList.add('on')})}
function runWash(){
 if(game.locked||game.finished)return;const groups=$$('.options');if(groups.some(g=>!g.querySelector('.on')))return toast('모든 조건을 선택하세요',false);
 const ok=groups.every(g=>g.querySelector('.on')?.hasAttribute('data-correct'));game.tries+=3;
 if(!ok){game.life--;game.score=Math.max(0,game.score-50);$('#washstatus').textContent='화면에 안내된 세탁 조건을 확인하세요.';toast('세탁 조건을 다시 선택하세요',false);hud();if(game.life<=0)finish();return}
 game.locked=true;game.correct+=3;game.score+=300;hud();$('#washerScene').classList.add('washing');$('#washStart').disabled=true;$('#washstatus').textContent='세탁·소독 진행 중…';$('#door').textContent='세탁 중';let progress=0;
 washTimer=setInterval(()=>{progress+=5;$('#washbar').style.width=progress+'%';if(progress>=100){clearInterval(washTimer);$('#washerScene').classList.remove('washing');$('#door').textContent='완료';$('#washstatus').textContent='세탁·소독 완료!';toast('다음은 의류 검수입니다');later(()=>{setStage(3);renderInspect()},700)}},50)
}
function renderInspect(){
 $('#inspection').innerHTML=clothes.slice(0,3).map((c,i)=>'<div class="inspect"><div class="inspect-photo">'+garmentImage(c)+'<button type="button" class="spot" aria-label="'+c.name+'의 잔여 오염 제거" onclick="cleanSpot(this)" style="left:'+([46,50,52][i])+'%;top:'+([45,36,42][i])+'%">얼룩<br>제거</button></div><b>'+c.name+'</b><p>사진 속 얼룩을 먼저 눌러 주세요.</p><button class="inspect-confirm" onclick="passInspect(this)">검수 완료</button></div>').join('')
}
function cleanSpot(x){if(game.finished)return;x.remove();game.score+=50;toast('잔여 오염 제거!');hud()}
function passInspect(btn){if(game.finished||game.locked||btn.disabled)return;game.tries++;const card=btn.closest('.inspect');if(card.querySelector('.spot')){game.life--;toast('사진에 남은 얼룩부터 제거하세요',false);hud();if(game.life<=0)finish();return}game.correct++;game.score+=100;card.classList.add('clean');btn.textContent='검수 통과 ✓';btn.disabled=true;hud();if($$('.inspect.clean').length===3){game.locked=true;later(()=>{setStage(4);renderDelivery()},600)}}
function renderDelivery(){game.delivery=0;nextDelivery()}
function nextDelivery(){
 const d=deliveries[game.delivery];if(!d)return finish();game.locked=false;clearTimeout(toastTimer);$('#toast').classList.remove('show');
 $('#deliveryCount').textContent=(game.delivery+1)+' / '+deliveries.length;
 $('#deliveryItem').innerHTML='<div class="packed-garment"><img src="'+art(d.image)+'" alt="'+d.name+'"><span>검수 완료 · 청결 포장</span></div><div class="shipping-label"><small>배송표 · 물품과 목적지 확인</small><h3>'+d.name+' <b>'+d.qty+'벌</b></h3><p class="ship-route"><span>보낼 병원</span><strong>'+d.hospital+'</strong></p><p><span>납품 부서</span><strong>'+d.department+'</strong></p><div class="route-help">아래에서 <b>'+d.name+' 전용 납품처</b>를 눌러 주세요.</div></div>';
 $('#hospitals').innerHTML=deliveries.map((x,i)=>'<button type="button" class="hospital '+(x.code===d.code?'matching':'')+'" data-order="'+i+'" aria-label="'+x.name+' 전용 납품처, '+x.hospital+', '+x.department+'" onclick="deliver('+i+')"><span class="destination-heading">'+x.name+' 전용 납품처</span><img src="'+art(x.image)+'" alt=""><b>'+x.hospital+'</b><span class="department">'+x.department+'</span><span class="accepted">받는 물품: '+x.name+'</span><span class="match-label">'+(x.code===d.code?'✓ 현재 배송 물품과 일치':'이곳은 '+x.name+'을 받습니다')+'</span></button>').join('')
}
function deliver(index){
 if(game.locked||game.finished)return;const d=deliveries[game.delivery],destination=deliveries[index];if(!destination||!d)return;game.tries++;
 if(destination.code===d.code){game.locked=true;game.correct++;game.score+=150;$$('.hospital').forEach(b=>b.disabled=true);$('.hospital.matching').classList.add('delivered');$('.hospital.matching .match-label').textContent='✓ '+d.name+' '+d.qty+'벌 납품 완료';game.delivery++;toast(d.hospital+' · '+d.department+'에 전달했어요');hud();later(nextDelivery,800)}
 else{game.life--;game.score=Math.max(0,game.score-40);toast(d.name+'은 '+d.hospital+' · '+d.department+'로 보내세요',false);hud();if(game.life<=0)finish()}
}
function finish(){if(game.finished)return;if(game.delivery>=deliveries.length)window.parent.postMessage({type:"yeongju-enterprise-experience-complete",businessId:3},"*");game.finished=true;game.locked=true;clearInterval(game.timer);clearInterval(washTimer);pending.forEach(clearTimeout);pending=[];show('result');$$('.step').forEach(x=>x.className='step done');const acc=game.tries?Math.round(game.correct/game.tries*100):0,timeBonus=Math.max(0,game.time)*3,total=Math.min(100,Math.round((game.score+timeBonus)/16));$('#ring').style.setProperty('--score',total);$('#ring').dataset.score=total;$('#rScore').textContent=game.score+timeBonus;$('#rAcc').textContent=acc+'%';$('#rGrade').textContent=total>=90?'S':total>=75?'A':total>=60?'B':'C'}

