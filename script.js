const waitCat = document.getElementById('wait-cat');
const spinCat = document.getElementById('spin-cat');
const modeBtn = document.getElementById('mode-btn');
const stopBtn = document.getElementById('stop-btn');
const uiPanel = document.getElementById('ui-panel');

// 音声の準備
const bgm = new Audio('oiia-song.mp3');
bgm.loop = true;

const uSound = new Audio('u.mp3');       // 1つ目の音声
const festivalSound = new Audio('OIIA-OIIA.mp3'); // 2つ目のW&W風フェス音声

const BASE_BPM = 111;

let currentMode = 'hold'; 
let currentBpm = BASE_BPM;
let playbackRate = 1.0;
let isPressing = false;
let isMetroPlaying = false;
let isRaving = false;

let tapTimes = [];
let lastClickTime = 0;
let raveTapCount = 0; // 10秒間のタップ蓄積用

// ==========================================
// ★ 秒数や回数などの設定（ここを変更して調整できます！）
// ==========================================
const CONFIG = {
  tapTimeLimitSec: 10,       // 10秒間で
  requiredTaps: 60,          // 何回素早くタップしたら発動するか
  wait1Sec: 2000,            // 最初の2秒待機 (ms)
  wait2Sec: 2000,            // 次の2秒待機 (ms)
  smoothColorInterval: 3000, // 背景色が滑らかに変わる間隔 (ms)
  repeatCount: 3,            // 繰り返し回数
  randomCatDurationSec: 0.8    // 猫が縦横無尽に動く秒数
};

const bgColors = ['#111111', '#1a1a2e', '#2a1a4a', '#1a2e1a', '#2e1a1a'];
let bgIndex = 0;

function updateSpeed(newBpm) {
  if (isRaving) return;
  currentBpm = Math.max(40, Math.min(300, Math.round(newBpm)));
  playbackRate = Math.max(0.25, Math.min(4.0, currentBpm / BASE_BPM));

  spinCat.playbackRate = playbackRate;
  bgm.playbackRate = playbackRate;
}

function playCatAndMusic(isReset = false) {
  waitCat.classList.add('hidden');
  spinCat.classList.remove('hidden');

  if (isReset) {
    spinCat.currentTime = 0;
    bgm.currentTime = 0;
  }

  spinCat.playbackRate = playbackRate;
  bgm.playbackRate = playbackRate;

  spinCat.play().catch(err => {});
  bgm.play().catch(err => {});

  if (!isRaving) {
    bgIndex = (bgIndex + 1) % bgColors.length;
    document.body.style.backgroundColor = bgColors[bgIndex];
  }
}

function stopCatAndMusic() {
  if (isRaving) return;
  spinCat.pause();
  spinCat.classList.add('hidden');
  waitCat.classList.remove('hidden');
  bgm.pause();
  document.body.style.backgroundColor = '#111111';
}

// タップテンポ計算
function recordTap() {
  const now = performance.now();
  if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > 2000) {
    tapTimes = [];
  }
  tapTimes.push(now);
  if (tapTimes.length > 5) tapTimes.shift();

  if (tapTimes.length >= 2) {
    let totalInterval = 0;
    for (let i = 1; i < tapTimes.length; i++) {
      totalInterval += tapTimes[i] - tapTimes[i - 1];
    }
    const avgInterval = totalInterval / (tapTimes.length - 1);
    const calculatedBpm = 60000 / avgInterval;
    updateSpeed(calculatedBpm);
  }
}

// ==========================================
// イースターエッグ（指定シーケンス実行）
// ==========================================
function checkRaveEasterEgg() {
  if (isRaving || currentMode !== 'metronome') return;
  const now = performance.now();

  // 10秒以上間が空いたらリセット
  if (now - lastClickTime > CONFIG.tapTimeLimitSec * 1000) {
    raveTapCount = 0;
  }

  raveTapCount++;
  lastClickTime = now;

  if (raveTapCount >= CONFIG.requiredTaps) {
    startEasterEggSequence();
  }
}

async function startEasterEggSequence() {
  isRaving = true;
  raveTapCount = 0;
  bgm.pause();
  bgm.currentTime = 0;
  // 1. 背景を黒に、操作不可能に（ボタンを隠す）
  document.body.style.backgroundColor = '#000000';
  uiPanel.classList.add('hidden');

  // 2. u.mp3再生、wait-catにする
  spinCat.pause();
  spinCat.classList.add('hidden');
  waitCat.classList.remove('hidden');
  uSound.currentTime = 0;
  uSound.play().catch(err => {});

  // 3. 2秒待機
  await new Promise(r => setTimeout(r, CONFIG.wait1Sec));

  // 4. oiia-song.mp3を一度だけ再生 ＆ oiia-cat.webmを再生
  bgm.playbackRate = 1.0;
  spinCat.playbackRate = 1.0;
  bgm.loop = false; // 一度だけ
  bgm.currentTime = 0;
  bgm.play().catch(err => {});
  waitCat.classList.add('hidden');
  spinCat.classList.remove('hidden');
  spinCat.currentTime = 0;
  spinCat.play().catch(err => {});

  // 曲が終わるか、あるいは一定時間待機 (ここでは音楽の長さに合わせるか適宜調整)
  await new Promise(r => setTimeout(r, 2000)); 

  // 5. wait-catにする
  spinCat.pause();
  spinCat.classList.add('hidden');
  waitCat.classList.remove('hidden');

  // 6. 2秒待機
  await new Promise(r => setTimeout(r, CONFIG.wait2Sec));

  // 7. OIIA-OIIA.mp3再生 ＆ 背景の色を滑らかに変える ＆ oiia-cat.webm再生
  festivalSound.loop = true;
  festivalSound.currentTime = 0;
  festivalSound.play().catch(err => {});

  waitCat.classList.add('hidden');
  spinCat.classList.remove('hidden');
  spinCat.play().catch(err => {});

  await new Promise(r => setTimeout(r, 6500));

  document.body.style.transition = 'none';
  document.body.style.backgroundColor = '#ff0055';

  await new Promise(r => setTimeout(r, 1600));
  document.body.style.backgroundColor = '#4a00e0';

  await new Promise(r => setTimeout(r, 1600));
  document.body.style.backgroundColor = '#00f2fe';

  await new Promise(r => setTimeout(r, 1600));
  document.body.style.backgroundColor = '#f857a6';

  await new Promise(r => setTimeout(r, 1600));
  document.body.style.backgroundColor = '#ff5858';

  // 滑らかな色変化ループ開始
  document.body.style.transition = '';
  const colorList = ['#ff0055', '#4a00e0', '#00f2fe', '#f857a6', '#ff5858', '#22c1c3'];
  let colorIdx = 0;
  const colorInterval = setInterval(() => {
    colorIdx = (colorIdx + 1) % colorList.length;
    document.body.style.backgroundColor = colorList[colorIdx];
  }, CONFIG.smoothColorInterval);


const catContainer = document.getElementById('cat-container');

// ① 動かし始める直前に、JSから直接transition（滑らか移動）を設定する
catContainer.style.transition = 'transform 0.3s ease-out';

const moveInterval = setInterval(() => {
  const maxX = (window.innerWidth / 2) - 100;
  const maxY = (window.innerHeight / 2) - 100;

  const randomX = (Math.random() * 2 - 1) * maxX;
  const randomY = (Math.random() * 2 - 1) * maxY;
  const randomRotate = (Math.random() * 2 - 1) * 45;

  catContainer.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
}, 300);

  await new Promise(r => setTimeout(r, 11000));
  clearInterval(moveInterval);
  catContainer.style.transform = '';
  catContainer.style.transition = '';

  spinCat.pause();
  spinCat.classList.add('hidden');
  waitCat.classList.remove('hidden');

  await new Promise(r => setTimeout(r, 2000));


  // 1. 猫を大量に出現させる（例：15匹）
const activeCats = [];
const catCount = 35; // ← 増やしたい数に自由に変更OK
for(let d = 0; d < 3; d++){
    waitCat.classList.add('hidden');
  spinCat.classList.remove('hidden');
  spinCat.currentTime = 0; // 頭出し（必要に応じて）
  spinCat.play().catch(err => {});
for (let c = 0; c < catCount; c++) {
  const flyingImg = document.createElement('img');
  flyingImg.src = 'oiia-cat.gif';
  flyingImg.className = 'flying-cat';
  
  // CSSを触らずにJSだけで位置と滑らかな動きを設定
  flyingImg.style.position = 'fixed';
  flyingImg.style.width = '150px'; // 猫の大きさ（お好みで調整）
  flyingImg.style.pointerEvents = 'none'; // タップの邪魔にならないようにする
  flyingImg.style.transition = 'all 0.3s ease-out';
  flyingImg.style.zIndex = '9999';

  // 初期位置を画面内のランダムな場所に設定
  flyingImg.style.left = Math.random() * (window.innerWidth - 150) + 'px';
  flyingImg.style.top = Math.random() * (window.innerHeight - 150) + 'px';
  
  document.body.appendChild(flyingImg);
  activeCats.push(flyingImg);
  await new Promise(r => setTimeout(r, 50));
}

// 2. 縦横無尽に飛び回らせるタイマー
const moveTimer = setInterval(() => {
  activeCats.forEach(cat => {
    const randomX = Math.random() * (window.innerWidth - 150);
    const randomY = Math.random() * (window.innerHeight - 150);
    const randomRotate = (Math.random() * 2 - 1) * 45;

    cat.style.left = randomX + 'px';
    cat.style.top = randomY + 'px';
    cat.style.transform = `rotate(${randomRotate}deg)`;
  });
}, 20); // 0.3秒ごとに次の場所へ移動

// 3. 指定した秒数だけ暴れさせる
await new Promise(r => setTimeout(r, CONFIG.randomCatDurationSec * 1000));
clearInterval(moveTimer);

// 4. すべてを wait-cat.png（静止画）に一斉に切り替える！
activeCats.forEach(cat => {
  cat.src = 'wait-cat.png';
});
spinCat.pause();
spinCat.classList.add('hidden');
waitCat.classList.remove('hidden');

// 5. 静止画の状態で少し待つ（例: 0.5秒）
await new Promise(r => setTimeout(r, 500));

// 6. 画面上の猫をすべて消す
activeCats.forEach(cat => cat.remove());

}
waitCat.classList.add('hidden');
spinCat.classList.remove('hidden');
spinCat.currentTime = 0; // 頭出し（必要に応じて）
spinCat.play().catch(err => {});
for (let c = 0; c < 70; c++) {
    const flyingImg = document.createElement('img');
    flyingImg.src = 'oiia-cat.gif';
    flyingImg.className = 'flying-cat';
    
    // CSSを触らずにJSだけで位置と滑らかな動きを設定
    flyingImg.style.position = 'fixed';
    flyingImg.style.width = '150px'; // 猫の大きさ（お好みで調整）
    flyingImg.style.pointerEvents = 'none'; // タップの邪魔にならないようにする
    flyingImg.style.transition = 'all 0.3s ease-out';
    flyingImg.style.zIndex = '9999';
  
    // 初期位置を画面内のランダムな場所に設定
    flyingImg.style.left = Math.random() * (window.innerWidth - 150) + 'px';
    flyingImg.style.top = Math.random() * (window.innerHeight - 150) + 'px';
    
    document.body.appendChild(flyingImg);
    activeCats.push(flyingImg);
    await new Promise(r => setTimeout(r, 30));
  }
  // --- イースターエッグ終了時の処理 ---
  activeCats.forEach(cat => cat.remove());
  document.querySelectorAll('.flying-cat').forEach(el => el.remove()); // 念のため残骸も消す

  clearInterval(colorInterval);
  festivalSound.pause();
  bgm.loop = true;

  isRaving = false;
  uiPanel.classList.remove('hidden');
  currentMode = 'metronome';
  modeBtn.textContent = 'MODE: AUTO';
  modeBtn.classList.add('metronome-active');
  stopBtn.classList.add('hidden');
  stopCatAndMusic();

  // ★追加：モードを「カチッと切り替えた時」と同じリセット・初期化処理をここに呼ぶ！
  // （もしモード切り替え時に実行している共通の初期化関数があれば、それをここで実行します）
  resetToNormalMode();
}

// モード切り替え
modeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (isRaving) return;
  tapTimes = [];

  if (currentMode === 'hold') {
    currentMode = 'metronome';
    modeBtn.textContent = 'MODE: AUTO';
    modeBtn.classList.add('metronome-active');
    isMetroPlaying = false;
    stopCatAndMusic();
    stopBtn.classList.add('hidden');
  } else {
    currentMode = 'hold';
    modeBtn.textContent = 'MODE: HOLD';
    modeBtn.classList.remove('metronome-active');
    stopBtn.classList.add('hidden');
    isPressing = false;
    isMetroPlaying = false;
    stopCatAndMusic();
  }

  // 1. 猫をすべて削除・片付ける
activeCats.forEach(cat => cat.remove());

// 2. 背景や音楽を元のメトロノームモードの状態に戻す
document.body.style.backgroundColor = ''; // 色を元に戻す
document.body.style.transition = '';

// 3. ★ここが重要：通常モード時の猫のタップ（再生）イベントを再度有効化する
initCatTapEvents();
});

// 停止ボタン
stopBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (isRaving) return;
  if (currentMode === 'metronome' && isMetroPlaying) {
    isMetroPlaying = false;
    stopCatAndMusic();
    stopBtn.classList.add('hidden');
  }
});

uiPanel.addEventListener('mousedown', e => e.stopPropagation());
uiPanel.addEventListener('touchstart', e => e.stopPropagation());

function handleStart(e) {
  if (e.cancelable) e.preventDefault();
  if (isRaving) return;

  if (currentMode === 'hold') {
    if (isPressing) return;
    isPressing = true;
    playCatAndMusic(false);
  } else {
    // AUTO (メトロノーム) モード時
    checkRaveEasterEgg(); // 10秒間の素早いタップ判定

    if (!isRaving) {
      if (!isMetroPlaying) {
        isMetroPlaying = true;
        playCatAndMusic(true);
        stopBtn.classList.remove('hidden');
      }
      recordTap();
    }
  }
}

function handleEnd() {
  if (isRaving) return;
  if (currentMode === 'hold') {
    if (!isPressing) return;
    isPressing = false;
    stopCatAndMusic();
  }
}

spinCat.addEventListener('ended', () => {
  spinCat.currentTime = 0;
  spinCat.play();
});

window.addEventListener('mousedown', handleStart);
window.addEventListener('mouseup', handleEnd);
window.addEventListener('mouseleave', handleEnd);

window.addEventListener('touchstart', handleStart, { passive: false });
window.addEventListener('touchend', handleEnd);
window.addEventListener('touchcancel', handleEnd);

updateSpeed(BASE_BPM);