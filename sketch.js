let video;

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();
}

function draw() {
  background('#e7c6ff');
  
  let imgWidth = width * 0.5;
  let imgHeight = height * 0.5;
  
  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  imageMode(CENTER);
  image(video, 0, 0, imgWidth, imgHeight);
  pop();
  
  // 在攝影機畫面上方產生文字 (必須放在 pop() 之後，避免文字被顛倒)
  fill(0); // 設定文字顏色為黑色
  textSize(32); // 設定文字大小
  textAlign(CENTER, BOTTOM); // 水平置中，垂直對齊基準線為下方
  // 計算影像的上邊緣 Y 座標，再往上減 20 像素作為留白
  text('414737089 林佑倫', width / 2, (height - imgHeight) / 2 - 20);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
