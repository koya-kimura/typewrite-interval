let font;
let performersData;

const canvasMarginScale = 0.05;
const columnNum = 30;
const textScale = 0.9;

let gridSize;
let rowNum;

let typeWrite;

function preload() {
    font = loadFont("font/M-NijimiMincho.otf");
    performersData = loadJSON("data/performers.json");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont(font);
    noCursor();

    gridSize = (width * (1 - canvasMarginScale)) / columnNum;
    rowNum = floor(height * (1 - canvasMarginScale) / gridSize);

    typeWrite = new TypeWrite(performersData.performers);
}

function draw() {
    background(0);

    push();
    typeWrite.draw();
    pop();

    push();
    fill(255);
    textSize(gridSize * textScale);
    textAlign(RIGHT, BOTTOM);
    text("Flow vol.8", width - width * canvasMarginScale * 0.5, height - height * canvasMarginScale * 0.5);
    pop();
}

class TypeWrite {
    constructor(data){
        this.data = data;
        this.currentIndex = 0;
        this.displayText = [];

        this.typeIndex = 0;
        this.showStartTime = 0;
        this.showMaxTime = 30000; // ミリ秒

        this.rotateAngle = 0;

        this.setText();
    }

    setText(){
        const artistName = this.data[this.currentIndex].name;
        const artistProfile = this.data[this.currentIndex].profile;
        const performerText = artistName + "\n" + "\n" + artistProfile.replace(/\\n/g, "\n"); // replace不明

        let currentLine = [];
        for (let i = 0; i < performerText.length; i ++){
            const char = performerText.charAt(i);

            if (char == "\n" || currentLine.length > columnNum || i == performerText.length - 1){
                let i = 0;
                while (currentLine.length < columnNum) {
                    currentLine.push({ char: [..."FLOW"][i%4], isPerformerText: false });
                    i ++;
                }
                this.displayText.push(currentLine);
                currentLine = [];
            }

            if (char != "\n"){
                currentLine.push({ char: char, isPerformerText: true });
            }
        }
    }

    draw(){
        const fullTyped = this.typeIndex > (this.displayText.length * columnNum + 5);

        // 文字回転角度更新
        if (fullTyped){
            this.rotateAngle += 0.01;
        }

        // 文字更新
        if (fullTyped && (millis() - this.showStartTime > this.showMaxTime)){
            this.showStartTime = millis();
            this.typeIndex = 0;
            this.rotateAngle = 0;
            this.displayText = [];
            this.currentIndex = (this.currentIndex + 1) % this.data.length;
            this.setText();
        }

        // 四角形描画
        for (let i = 0; i < this.displayText.length; i++) {
            for (let j = 0; j < columnNum; j++) {
                const s = gridSize * 0.4;
                const x = width * canvasMarginScale * 0.5 + s * j + s * 0.5;
                const y = height - height * canvasMarginScale * 0.5 - s * this.displayText.length + s * i + s * 0.5;
                const index = columnNum * i + j;
                const isPerformerText = this.displayText[i][j].isPerformerText;

                push();
                if (index < this.typeIndex){
                    noStroke();
                    isPerformerText ? fill(200) : fill(20);
                } else {
                    noFill();
                    stroke(200);
                    strokeWeight(min(width, height) * 0.001);
                }
                rectMode(CENTER);
                rect(x, y, s*0.7, s*0.7);
                pop();
            }
        }

        // 文字描画
        for (let i = 0; i < this.displayText.length; i++) {
            for (let j = 0; j < columnNum; j++) {
                const gx = gridSize * j - (width * (1 - canvasMarginScale)) * 0.5 + gridSize * 0.5;
                const gy = gridSize * i - (height * (1 - canvasMarginScale)) * 0.5 + gridSize * 0.5;
                const x = gx;
                const y = gy;

                const index = columnNum * i + j;
                const char = this.displayText[i][j].char;

                const alpha = map(max(this.showMaxTime - 2000, millis() - this.showStartTime) - (this.showMaxTime - 2000), 0, 2000, 255, -255);

                const isPerformerText = this.displayText[i][j].isPerformerText;

                if (index < this.typeIndex){
                    push();
                    textSize(gridSize * textScale);
                    textAlign(CENTER, CENTER);
                    noStroke();
                    isPerformerText ? fill(200, alpha) : fill(20, alpha);
                    translate(width / 2, height / 2);
                    translate(0, (height - gridSize * rowNum) * 0.3)
                    translate(x, y);
                    if (fullTyped){
                        scale(cos(this.rotateAngle), 1);
                    }
                    text(char, 0, 0);
                    pop();
                }
            }
        }

        this.typeIndex += map(pow(random(), 2), 0, 1, 0.02, 0.5);
    }
}

function keyPressed(){
    if(keyCode == 32){
        fullscreen(true);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    gridSize = (width * (1 - canvasMarginScale)) / columnNum;
    rowNum = floor(height * (1 - canvasMarginScale) / gridSize);
}
