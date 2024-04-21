const drawPerformanceMetrics = (canvasContext, { timestamp, deltaTime, ball }) => {
  canvasContext.font = "20px Arial";

  canvasContext.textAlign = "left";
  canvasContext.fillText(`${(1000 / deltaTime).toFixed(2)}`, 5, 20);
  canvasContext.fillText(`x: ${(ball.x.toFixed(0))}`, 5, 40);
  canvasContext.fillText(`y: ${(ball.y.toFixed(0))}`, 5, 60);

  canvasContext.textAlign = "right";
  canvasContext.fillText(
    `${(timestamp / 1000).toFixed(0)}`,
    canvas.width - 5,
    20
  );
}

const drawBall = (canvasContext, { ball }) => {
  canvasContext.beginPath();
  canvasContext.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
  canvasContext.fill();
}

const drawPaddle = (canvasContext, { paddle }) => {
  canvasContext.strokeRect(paddle.x - (paddle.width / 2), paddle.y - (paddle.height / 2), paddle.width, paddle.height )
}

const drawBlocks = (canvasContext, { blockWidth, blockHeight, blocks }) => {
  blocks.forEach((blockRow) => blockRow.forEach(({ active, x, y }) => {
    active && canvasContext.fillRect(x, y, blockWidth, blockHeight)
  }));
}

const draw = (canvasContext, gameState) => {
  const { stage } = gameState;
  canvasContext.clearRect(0, 0, stage.width, stage.height);

  // drawPerformanceMetrics(canvasContext, gameState);
  drawBall(canvasContext, gameState);
  drawPaddle(canvasContext, gameState);
  drawBlocks(canvasContext, gameState)
};

const isBallInRect = (ball, rectX, rectY, rectWidth, rectHeight) => {
  if (ball.x >= rectX - (rectWidth / 2) - ball.radius 
      && ball.x <= rectX + (rectWidth / 2) + ball.radius 
      && ball.y >= rectY - (rectHeight / 2) - ball.radius 
      && ball.y <= rectY + (rectHeight / 2) + ball.radius) {
    return true;
  }
  return false;
}

const detectBallCollisions = ({ stage, ball, paddle, blocks, blockWidth, blockHeight }) => {
  // Detect horizontal boundaries
  if (ball.x <= ball.radius || ball.x >= stage.width - ball.radius) {
    ball.xVelocity *= -1;
  }

  // Detect vertical boundaries
  if (ball.y <= ball.radius || ball.y >= stage.height - ball.radius) {
    ball.yVelocity *= -1;
  }
  
  // Detect paddle
  if (isBallInRect(ball, paddle.x, paddle.y, paddle.width, paddle.height)) {
    if (ball.yVelocity > 0) {
      ball.yVelocity *= -1;
      const distanceFromCenter = ball.x - paddle.x;
      ball.xVelocity = distanceFromCenter * .01;
    }
  }
  
  // Detect blocks
  blocks.forEach((blockRow, yIndex) => blockRow.map((block, xIndex) => {
    let { active } = block;
    if (active && isBallInRect(ball, block.x, block.y, blockWidth, blockHeight)) {
      ball.yVelocity *= -1;
      blocks[yIndex][xIndex].active = false;
    }
  }));
}

const moveBall = ({ started, deltaTime, ball, paddle }) => {
  if (!started) {
    ball.x = paddle.x
  }

  ball.x += ball.xVelocity * deltaTime;
  ball.y += ball.yVelocity * deltaTime;
}

const movePaddle = ({ stage, paddle, mouse }) => {
  paddle.x = mouse.x < 0 ? 0 : mouse.x > stage.width ? stage.width : mouse.x;
}

const loop = (timestamp, canvasContext, gameState) => {
  const { timestampPrev } = gameState;
  gameState.deltaTime = timestamp - timestampPrev;
  gameState.timestamp = timestamp;

  detectBallCollisions(gameState);
  movePaddle(gameState);
  moveBall(gameState);

  draw(canvasContext, gameState);

  gameState.timestampPrev = timestamp;

  window.requestAnimationFrame((timestamp) =>
    loop(timestamp, canvasContext, gameState)
  );
};

const init = () => {
  const canvas = document.getElementById("canvas");
  const canvasContext = canvas.getContext("2d");

  const stage = { width: canvas.width, height: canvas.height };

  const blockWidth = 48, blockHeight = 18;

  const numberOfBlocksHorizontally = stage.width / (blockWidth + 2);
  const numberOfBlocksVertically = Math.floor(stage.height / 2 / (blockHeight + 2));
  const blocks = new Array(numberOfBlocksVertically).fill()
    .map((_, yIndex) => new Array(numberOfBlocksHorizontally - 2).fill()
    .map((_, xIndex) => ({ active: true, x: ((xIndex + 1) * blockWidth) + (xIndex * 2), y: ((yIndex + 1) * blockHeight) + (yIndex * 2)})));

  const paddle = {
    x: stage.width / 2,
    y: stage.height - (stage.height / 10),
    width: 80,
    height: 15,
  };

  const mouse = { x: stage.width / 2, y: 0 };
  window.addEventListener("mousemove", (event) => { 
    let canvasRect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - canvasRect.left,
    mouse.y = event.clientY - canvasRect.top
  });
  
  const ballRadius = 10;
  const ball = {
    x: stage.width / 2,
    y: paddle.y - (paddle.height / 2) - ballRadius,
    radius: ballRadius,
    xVelocity: 0,
    yVelocity: 0,
  };

  const gameState = {
    started: false,
    stage,
    mouse,
    deltaTime: 0,
    timestampPrev: 0,
    ball,
    paddle,
    blockWidth,
    blockHeight,
    blocks
  };

  window.addEventListener("mousedown", () => {
    if (!gameState.started) {
      gameState.started = true;
      ball.yVelocity = -0.5;
    }
  })

  window.requestAnimationFrame((timestamp) =>
    loop(timestamp, canvasContext, gameState)
  );
};

window.addEventListener("load", init);