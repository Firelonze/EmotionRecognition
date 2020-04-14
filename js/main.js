//const for Emotion Recognition
const video = document.getElementById("video");
const isScreenSmall = window.matchMedia("(max-width: 700px)");
const canvas = document.getElementById("canvas");
const context = document.getElementById("2d");
const invocation = new XMLHttpRequest();
const url = './models';
//predict ages from Emotion Recognition
let predictedAges = [];
//include all FaceApi models for Emotion Recog
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
  faceapi.nets.ageGenderNet.loadFromUri("./models")
]).then(startVideo);    
function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then( stream => video.srcObject = stream)
    //.error( err => console.error(err))
  ;
}
//resizes screen if it's too small
function screenResize(isScreenSmall) {
  if (isScreenSmall.matches) {
    video.style.width = "320px";
  } else {
    video.style.width = "500px";
  }
}
screenResize(isScreenSmall); // Call listener function at run time
isScreenSmall.addListener(screenResize);
video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  let container = document.querySelector(".container");
  container.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    if (resizedDetections && Object.keys(resizedDetections).length > 0) {
      const age = resizedDetections.age;
      const interpolatedAge = interpolateAgePredictions(age);
      const gender = resizedDetections.gender;
      const expressions = resizedDetections.expressions;
      const maxValue = Math.max(...Object.values(expressions));
      const emotion = Object.keys(expressions).filter(
        item => expressions[item] === maxValue  
      );
      document.getElementById("age").innerText = `Age - ${interpolatedAge}`;
      document.getElementById("gender").innerText = `Gender - ${gender}`;
      document.getElementById("emotion").innerText = `Emotion - ${emotion[0]}`;
    }
  }, 250);
});
function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30);
  const avgPredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length;
    return Math.round(avgPredictedAge);
}



//const for snake
const GAME_SPEED = 100;
const CANVAS_BORDER_COLOUR = 'black';
const CANVAS_BACKGROUND_COLOUR = "white";
const SNAKE_COLOUR = 'Blue';
const SNAKE_BORDER_COLOUR = 'darkgreen';
const FOOD_COLOUR = 'crimson';
const FOOD_BORDER_COLOUR = 'darkred';
const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext("2d");
let up = false;
let down = false;
let right = false;
let left = false;
//preset Snake location
let snake = [
  {x: 150, y: 150},
  {x: 140, y: 150},
  {x: 130, y: 150},
  {x: 120, y: 150},
  {x: 110, y: 150}
]
//player score
let score = 0;
//is Snake allowed to change direction
let changingDirection = false;
//food location
let foodX;
let foodY;
//Vector locations
let dx = 10;
let dy = 0;

let width = window.innerWidth;
let height = window.innerHeight;
gameCanvas.width = width;
gameCanvas.height = height;

// Start game
main();
//creates food
createFood();

function main() {
  // If the game ended return early to stop game
  if (didGameEnd()) return;

  setTimeout(function onTick() {
    changingDirection = false;
    clearCanvas();
    drawFood();
    advanceSnake();
    drawSnake();

    // Call game again
    main();
  }, GAME_SPEED)
}

function clearCanvas() {
  //  Select the colour to fill the drawing
  ctx.fillStyle = CANVAS_BACKGROUND_COLOUR;
  //  Select the colour for the border of the canvas
  ctx.strokestyle = CANVAS_BORDER_COLOUR;

  // Draw a "filled" rectangle to cover the entire canvas
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  // Draw a "border" around the entire canvas
  ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
}
function drawFood() {
  ctx.fillStyle = FOOD_COLOUR;
  ctx.strokestyle = FOOD_BORDER_COLOUR;
  ctx.fillRect(foodX, foodY, 10, 10);
  ctx.strokeRect(foodX, foodY, 10, 10);
}
function advanceSnake() {
  // Create the new Snake's head
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};
  // Add the new head to the beginning of snake body
  snake.unshift(head);

  const didEatFood = snake[0].x === foodX && snake[0].y === foodY;
  if (didEatFood) {
    // Increase score
    score += 10;
    // Display score on screen
    document.getElementById('score').innerHTML = score;

    // Generate new food location
    createFood();
  } else {
    // Remove the last part of snake body
    snake.pop();
  }
}

function didGameEnd() {
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true
  }

  const hitLeftWall = snake[0].x < 0;
  const hitRightWall = snake[0].x > gameCanvas.width - 10;
  const hitToptWall = snake[0].y < 0;
  const hitBottomWall = snake[0].y > gameCanvas.height - 10;

  return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall
}

function randomTen(min, max) {
  return Math.round((Math.random() * (max-min) + min) / 10) * 10;
}

function createFood() {
  foodX = randomTen(0, gameCanvas.width - 10);
  foodY = randomTen(0, gameCanvas.height - 10);

  snake.forEach(function isFoodOnSnake(part) {
    const foodIsoNsnake = part.x == foodX && part.y == foodY;
    if (foodIsoNsnake) createFood();
  });
}

function drawSnake() {
  // loop through the snake parts drawing each part on the canvas
  snake.forEach(drawSnakePart)
}

function drawSnakePart(snakePart) {
  ctx.fillStyle = SNAKE_COLOUR;

  // Set the border colour of the snake part
  ctx.strokestyle = SNAKE_BORDER_COLOUR;

  // Draw a "filled" rectangle to represent the snake part at the coordinates
  // the part is located
  ctx.fillRect(snakePart.x, snakePart.y, 10, 10);

  // Draw a border around the snake part
  ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
}

function changeDirection(event) {

  switch (0){ 
    case "happy": up = true;
      break;
    case "sad": left = true;
      break;
    case "angry": right = true;
      break;
    case "neutral": down = true;
      break;
  }
   

  if (changingDirection) return;
  changingDirection = true;

  // const keyPressed = event.keyCode;

  const goingUp = dy === -10;
  const goingDown = dy === 10;
  const goingRight = dx === 10;
  const goingLeft = dx === -10;

  if (left == true && !goingRight) {
    dx = -10;
    dy = 0;
    left = false;
  }
  if (up == true && !goingDown) {
    dx = 0;
    dy = -10;
    up = false;
  }
  if (right == true && !goingLeft) {
    dx = 10;
    dy = 0;
    right = false;
  }
  if (down = true && !goingUp) {
    dx = 0;
    dy = 10;
    down = false;
  }
} 