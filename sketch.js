let video;
let facemesh;
let predictions = [];

// 需要連線的特徵點編號 (嘴唇外輪廓)
const targetPoints = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();
  
  // 初始化 ml5 的 Facemesh 模型
  facemesh = ml5.facemesh(video, () => { console.log('Facemesh Model Ready!'); });
  
  // 當辨識到臉部時，將結果存入 predictions 陣列
  facemesh.on('predict', results => {
    predictions = results;
  });
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
  
  // 畫出臉部特徵點連線 (嘴唇外輪廓)
  if (predictions.length > 0 && video.width > 0) {
    // 取得第一張臉的點位資料
    let keypoints = predictions[0].scaledMesh;
    
    stroke(255, 0, 0); // 線條顏色為紅色
    strokeWeight(15);  // 線條粗細為 15
    strokeJoin(ROUND); // 讓線條轉折處變圓滑
    noFill();
    
    beginShape();
    for (let i = 0; i < targetPoints.length; i++) {
      let index = targetPoints[i];
      if (keypoints[index]) {
        let x = keypoints[index][0];
        let y = keypoints[index][1];
        
        // 因為影像有縮放 50% 且原點移到中心，需將原始座標映射(map)到目前的畫布空間
        let mappedX = map(x, 0, video.width, -imgWidth / 2, imgWidth / 2);
        let mappedY = map(y, 0, video.height, -imgHeight / 2, imgHeight / 2);
        vertex(mappedX, mappedY);
      }
    }
    endShape(CLOSE); // 封閉形狀
  }
  
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
