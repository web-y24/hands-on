// main.js
(() => {
  // 開発時のデバッグ用（本番ビルドで terser が削除）
  const DEBUG = true;

  // 未使用の変数（terser が取り除く）
  const unusedValue = 42;

  // 使用する関数
  function greet(name) {
    return 'こんにちは、' + (name || 'ゲスト') + 'さん';
  }

  // 実際に使う変数
  const message = greet('hands-on Gulp');

  // 開発向けログ（本番で不要）
  console.log('DEBUG:', DEBUG, 'message:', message);

  // DOM に出力（#app がなければコンソール）
  const el = document.getElementById('app');
  if (el) {
    el.textContent = message;
  } else {
    console.log(message);
  }
})();
