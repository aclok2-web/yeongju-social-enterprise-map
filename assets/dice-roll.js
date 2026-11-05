(function () {
  'use strict';
  const pipPositions = {1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
  const rotations = {1:[0,0],2:[-90,0],3:[0,-90],4:[0,90],5:[90,0],6:[0,180]};
  let overlay;
  function createOverlay() {
    overlay = document.createElement('dialog');
    overlay.id = 'diceRollDialog';
    overlay.className = 'dice-roll-dialog';
    overlay.setAttribute('aria-labelledby','diceRollTitle');
    overlay.setAttribute('aria-describedby','diceRollResult');
    const cube = index => `<div class="dice-toss dice-toss-${index}"><div class="dice-cube">${[1,6,3,4,2,5].map(value => `<div class="die-face die-face-${value}" data-value="${value}">${Array.from({length:9},(_,i)=>`<span class="${pipPositions[value].includes(i)?'die-pip':''}"></span>`).join('')}</div>`).join('')}</div></div>`;
    overlay.innerHTML = `<div class="dice-roll-panel"><span class="dice-roll-eyebrow">YEONGJU VALUE ADVENTURE</span><h2 id="diceRollTitle">주사위를 굴려요!</h2><div class="dice-roll-stage" aria-hidden="true"><span class="dice-floor-ring"></span>${cube(0)}${cube(1)}</div><div id="diceRollResult" class="dice-roll-result" role="status" aria-live="polite"><span class="dice-equation">두근두근, 어디로 갈까요?</span><strong class="dice-total">주사위 두 개가 굴러갑니다</strong></div><p class="dice-roll-note">잠시 후 이동 칸 수가 공개돼요</p></div>`;
    overlay.addEventListener('cancel',event=>event.preventDefault());
    document.body.appendChild(overlay);
  }
  const wait = ms => new Promise(resolve=>setTimeout(resolve,ms));
  async function show(values) {
    if (!overlay) createOverlay();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cubes = [...overlay.querySelectorAll('.dice-cube')];
    const tosses = [...overlay.querySelectorAll('.dice-toss')];
    overlay.classList.remove('dice-revealed');
    overlay.querySelector('#diceRollTitle').textContent='주사위를 굴려요!';
    overlay.querySelector('.dice-equation').textContent='두근두근, 어디로 갈까요?';
    overlay.querySelector('.dice-total').textContent='주사위 두 개가 굴러갑니다';
    overlay.querySelector('.dice-roll-note').textContent='잠시 후 이동 칸 수가 공개돼요';
    const finalTransforms=values.map(value=>{const [x,y]=rotations[value];return `rotateX(-14deg) rotateY(-18deg) rotateX(${x}deg) rotateY(${y}deg)`});
    cubes.forEach((cube,i)=>{cube.style.transform=finalTransforms[i];});
    overlay.showModal();
    try {
      if (!reduced) {
        const animations=cubes.flatMap((cube,i)=>{
          const [x,y]=rotations[values[i]],direction=i===0?-1:1;
          const spin=cube.animate([
            {transform:`rotateX(-14deg) rotateY(-18deg) rotateX(${x+1080}deg) rotateY(${y+direction*1080}deg)`,offset:0},
            {transform:`rotateX(-14deg) rotateY(-18deg) rotateX(${x+250}deg) rotateY(${y+direction*210}deg)`,offset:.65},
            {transform:`rotateX(-14deg) rotateY(-18deg) rotateX(${x-12}deg) rotateY(${y-direction*10}deg)`,offset:.9},
            {transform:finalTransforms[i],offset:1}
          ],{duration:1400+i*140,easing:'cubic-bezier(.16,.6,.28,1)'});
          const bounce=tosses[i].animate([
            {transform:`translate(${direction*90}px,-75px) scale(.65)`,opacity:0,offset:0},
            {transform:`translate(${direction*28}px,16px) scale(1.05)`,opacity:1,offset:.3},
            {transform:`translate(${direction*-16}px,-42px) scale(.95)`,opacity:1,offset:.5},
            {transform:`translate(${direction*8}px,8px) scale(1.02)`,offset:.72},
            {transform:'translate(0,-9px) scale(1)',offset:.86},
            {transform:'translate(0,0) scale(1)',offset:1}
          ],{duration:1400+i*140,easing:'ease-out'});
          return [spin.finished,bounce.finished];
        });
        await Promise.all(animations);
      }
      const total=values[0]+values[1];
      overlay.classList.add('dice-revealed');
      overlay.querySelector('#diceRollTitle').textContent='이만큼 이동해요!';
      overlay.querySelector('.dice-equation').textContent=values[0]+' + '+values[1]+' =';
      overlay.querySelector('.dice-total').innerHTML=`<b>${total}</b><span>칸 이동!</span>`;
      overlay.querySelector('.dice-roll-note').textContent='잠시 후 말이 자동으로 이동해요';
      await wait(reduced?1100:1500);
    } finally { if(overlay.open)overlay.close(); }
  }
  window.YeongjuDice={show,close:()=>{if(overlay?.open)overlay.close()}};
})();
