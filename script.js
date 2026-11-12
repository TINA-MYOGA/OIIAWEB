const cat = document.getElementById('cat');
const statusText = document.getElementById('status-text');
let audioCtx = null;
let isPressing = false;
let soundTimer = null;

// 「オイア（O-I-I-A）」風の電子音を鳴らす関数
function playOiiaSound() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const notes = [330, 440, 440, 392]; // O-I-I-A の音程
  let step = 0;

  soundTimer = setInterval(() => {
    if (!isPressing) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(notes[step % notes.length], audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.09);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
    step++;
  }, 100);
}

// 押し始めたときの処理
function startSpin(e) {
  if (e.cancelable) e.preventDefault();
  if (isPressing) return;
  isPressing = true;

  cat.classList.add('spinning');
  statusText.textContent = 'O-I-I-A-I-O-I-I-I-A!!';
  statusText.classList.add('active-text');
  document.body.style.backgroundColor = '#2a1a4a';
  playOiiaSound();
}

// 指・マウスを離したときの処理
function stopSpin() {
  if (!isPressing) return;
  isPressing = false;

  cat.classList.remove('spinning');
  statusText.textContent = '画面を長押しして回す！';
  statusText.classList.remove('active-text');
  document.body.style.backgroundColor = '#1a1a2e';
  clearInterval(soundTimer);
}

// パソコン（マウス）とスマホ（タッチ）の両方の操作に対応
window.addEventListener('mousedown', startSpin);
window.addEventListener('mouseup', stopSpin);
window.addEventListener('mouseleave', stopSpin);

window.addEventListener('touchstart', startSpin, { passive: false });
window.addEventListener('touchend', stopSpin);
window.addEventListener('touchcancel', stopSpin);