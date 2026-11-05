/* CC0 recording: levypeck, Freesound 593682. See audio/출처.md. */
(()=>{'use strict';
 const voices=Array.from({length:4},()=>{const a=new Audio('assets/seunghye/audio/meat-cut.wav');a.preload='auto';a.volume=.72;a.load();return a});
 let cursor=0;
 window.HanwooCutAudio={
  play(){const voice=voices[cursor++%voices.length];voice.pause();voice.currentTime=0;voice.playbackRate=.97+Math.random()*.06;const playing=voice.play();if(playing)playing.catch(()=>{})},
  stop(){voices.forEach(voice=>{voice.pause();voice.currentTime=0})}
 };
})();

