const waitCat = document.getElementById('wait-cat');
const spinCat = document.getElementById('spin-cat');
const statusText = document.getElementById('status-text');

// 音楽ファイルを読み込む（ループ設定）
const bgm = new Audio('oiia-song.mp3');
bgm.loop = true;

// ★回転スピードの調整（1.0が等倍、遅くしたい場合は 0.8 や 0.5 などに調整できます）
spinCat.playbackRate = 1.0;

let isPressing = false;

// 押し始めたときの処理
function startSpin(e) {
  if (e.cancelable) e.preventDefault();
  if (isPressing) return;
  isPressing = true;

  // 待機画像を隠し、回転WebM動画を表示する
  waitCat.classList.add('hidden');
  spinCat.classList.remove('hidden');

  // 動画を前回の続きの位置から再生
  spinCat.play().catch(err => {
    console.log("動画の再生エラー:", err);
  });

  // 音楽を前回の続きの位置から再生
  bgm.play().catch(err => {
    console.log("音声の再生エラー:", err);
  });

  statusText.textContent = 'O-I-I-A-I-O-I-I-I-A!!';
  statusText.classList.add('active-text');
  document.body.style.backgroundColor = '#2a1a4a';
}

// 指・マウスを離したときの処理
function stopSpin() {
  if (!isPressing) return;
  isPressing = false;

  // 動画を一時停止（現在のフレーム位置が保持される）
  spinCat.pause();

  // 回転動画を隠し、待機画像に戻す
  spinCat.classList.add('hidden');
  waitCat.classList.remove('hidden');

  // 音楽を一時停止（再生位置は保持される）
  bgm.pause();

  statusText.textContent = '画面を長押しして回す！';
  statusText.classList.remove('active-text');
  document.body.style.backgroundColor = '#1a1a2e';
}

// 動画が最後までいったら自動で頭に戻してループさせる処理
spinCat.addEventListener('ended', () => {
  spinCat.currentTime = 0;
  spinCat.play();
});

// パソコン（マウス）とスマホ（タッチ）の両方の操作に対応
window.addEventListener('mousedown', startSpin);
window.addEventListener('mouseup', stopSpin);
window.addEventListener('mouseleave', stopSpin);

window.addEventListener('touchstart', startSpin, { passive: false });
window.addEventListener('touchend', stopSpin);
window.addEventListener('touchcancel', stopSpin);