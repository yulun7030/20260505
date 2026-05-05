let video;
let facemesh;
let predictions = [];
let seaCreatures = []; // 儲存海洋生物陣列

// 需要連線的特徵點編號 (外嘴唇)
const outerLipPoints = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
// 需要連線的特徵點編號 (內嘴唇)
const innerLipPoints = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];
// 需要連線的特徵點編號 (左眼內輪廓)
const leftEyeInnerPoints = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
// 需要連線的特徵點編號 (左眼外輪廓)
const leftEyeOuterPoints = [130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
// 需要連線的特徵點編號 (右眼內輪廓)
const rightEyeInnerPoints = [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382];
// 需要連線的特徵點編號 (右眼外輪廓)
const rightEyeOuterPoints = [359, 467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 255];
// 臉部輪廓特徵點
const faceSilhouette = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

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
  
  // 產生海洋生物 (章魚、烏賊等)
  const emojis = ['🐙', '🦑', '🐠', '🐟', '🫧'];
  for (let i = 0; i < 40; i++) {
    seaCreatures.push({
      x: random(windowWidth),
      y: random(windowHeight),
      emoji: random(emojis),
      size: random(30, 80),
      speed: random(0.5, 2.5)
    });
  }
}

function draw() {
  background('#e7c6ff');
  
  // --- 畫出大海背景與海洋生物 (在最下層) ---
  push();
  noStroke();
  fill(0, 105, 148, 180); // 半透明海洋藍，與原本背景混合
  rect(0, 0, width, height);
  
  textAlign(CENTER, CENTER);
  for (let i = 0; i < seaCreatures.length; i++) {
    let c = seaCreatures[i];
    textSize(c.size);
    text(c.emoji, c.x, c.y);
    c.y -= c.speed; // 讓生物往上浮動
    if (c.y < -100) {
      c.y = height + 100;
      c.x = random(width);
    }
  }
  pop();

  let imgWidth = width * 0.5;
  let imgHeight = height * 0.5;
  
  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  imageMode(CENTER);
  
  if (predictions.length > 0 && video.width > 0) {
    // 取得第一張臉的點位資料
    let keypoints = predictions[0].scaledMesh;
    
    // --- 使用臉部輪廓作為遮罩 (Clip)，讓影像只顯示在臉部內 ---
    drawingContext.save();
    drawingContext.beginPath();
    for (let i = 0; i < faceSilhouette.length; i++) {
      let index = faceSilhouette[i];
      if (keypoints[index]) {
        let x = keypoints[index][0];
        let y = keypoints[index][1];
        let mappedX = map(x, 0, video.width, -imgWidth / 2, imgWidth / 2);
        let mappedY = map(y, 0, video.height, -imgHeight / 2, imgHeight / 2);
        if (i === 0) drawingContext.moveTo(mappedX, mappedY);
        else drawingContext.lineTo(mappedX, mappedY);
      }
    }
    drawingContext.closePath();
    drawingContext.clip(); // 啟動遮罩
    
    // 畫出攝影機畫面 (此時只有臉部範圍看得到，外面則露出海洋背景)
    image(video, 0, 0, imgWidth, imgHeight);
    
    // 恢復繪圖狀態，移除遮罩，以便繼續畫線條
    drawingContext.restore();
    
    // ------ 畫出臉部特徵點連線 ------
    strokeWeight(1);  // 將所有線條粗細改為 1
    strokeJoin(ROUND); // 讓線條轉折處變圓滑
    noFill();
    
    // 1. 畫出臉部輪廓 (紫色，帶有螢光感)
    stroke(180, 0, 255); // 紫色
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = '#b400ff'; // 紫色發光特效
    drawFeature(keypoints, faceSilhouette, imgWidth, imgHeight);
    drawingContext.shadowBlur = 0; // 重置陰影，避免影響後續繪圖
    
    // 2. 畫出外嘴唇與內嘴唇 (紅色)
    stroke(255, 0, 0); 
    drawFeature(keypoints, outerLipPoints, imgWidth, imgHeight);
    drawFeature(keypoints, innerLipPoints, imgWidth, imgHeight);
    
    // 3. 畫出左眼與右眼內外圈特徵點連線 (綠色)
    stroke(0, 255, 0); 
    drawFeature(keypoints, leftEyeInnerPoints, imgWidth, imgHeight);
    drawFeature(keypoints, leftEyeOuterPoints, imgWidth, imgHeight);
    drawFeature(keypoints, rightEyeInnerPoints, imgWidth, imgHeight);
    drawFeature(keypoints, rightEyeOuterPoints, imgWidth, imgHeight);

  } else {
    // 如果還沒偵測到臉，正常畫出整個影像
    image(video, 0, 0, imgWidth, imgHeight);
  }
  
  pop();
  
  // 畫出潛水艇外框 (環繞著攝影機的範圍)
  drawSubmarineFrame(width / 2, height / 2, imgWidth, imgHeight);
  
  // 在攝影機畫面上方產生文字 (必須放在 pop() 之後，避免文字被顛倒)
  fill(0); // 設定文字顏色為黑色
  textSize(32); // 設定文字大小
  textAlign(CENTER, BOTTOM); // 水平置中，垂直對齊基準線為下方
  // 計算影像的上邊緣 Y 座標，再往上減 90 像素作為留白 (避開潛水艇厚窗框)
  text('414737089 林佑倫', width / 2, (height - imgHeight) / 2 - 90);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- 共用的特徵點連線繪製函式 ---
function drawFeature(keypoints, indices, imgWidth, imgHeight) {
  beginShape();
  for (let i = 0; i < indices.length; i++) {
    let index = indices[i];
    if (keypoints[index]) {
      let x = keypoints[index][0];
      let y = keypoints[index][1];
      let mappedX = map(x, 0, video.width, -imgWidth / 2, imgWidth / 2);
      let mappedY = map(y, 0, video.height, -imgHeight / 2, imgHeight / 2);
      vertex(mappedX, mappedY);
    }
  }
  endShape(CLOSE);
}

// --- 畫出潛水艇金屬外框 ---
function drawSubmarineFrame(x, y, w, h) {
  push();
  translate(x, y);
  rectMode(CENTER);
  
  // 加上深色金屬外框與環境陰影
  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.7)';
  noFill();
  stroke('#5C6B73'); // 鐵灰色
  strokeWeight(80); // 恢復原本的粗外框，否則看不到潛水艇
  rect(0, 0, w + 80, h + 80, 40); // 圓角外框
  
  // 關閉陰影以免影響後續繪圖
  drawingContext.shadowBlur = 0;
  
  // 內側金屬邊緣 (靠近攝影機畫面的地方)
  stroke('#2A3236');
  strokeWeight(10);
  rect(0, 0, w + 10, h + 10, 10);
  
  // 外側金屬邊緣
  stroke('#364147');
  strokeWeight(10);
  rect(0, 0, w + 150, h + 150, 75);
  
  // 畫上潛水艇的鉚釘 (螺絲)
  fill('#1E2529');
  noStroke();
  let rivetRadius = 12;
  let padding = 40; // 位於 80 寬度外框的正中間
  
  // 頂部與底部的鉚釘
  for (let i = -w/2 + 20; i <= w/2 - 20; i += 60) {
    circle(i, -h/2 - padding, rivetRadius); // 上方
    circle(i, h/2 + padding, rivetRadius);  // 下方
  }
  
  // 左側與右側的鉚釘
  for (let i = -h/2 + 20; i <= h/2 - 20; i += 60) {
    circle(-w/2 - padding, i, rivetRadius); // 左側
    circle(w/2 + padding, i, rivetRadius);  // 右側
  }
  
  pop();
}

// --- 加入滑鼠點擊產生泡泡的互動效果 ---
function mousePressed() {
  for (let i = 0; i < 5; i++) {
    seaCreatures.push({
      x: mouseX + random(-30, 30), // 在滑鼠點擊的周圍隨機散開
      y: mouseY + random(-30, 30),
      emoji: '🫧',
      size: random(30, 60),
      speed: random(1.5, 3.5)
    });
  }
}
