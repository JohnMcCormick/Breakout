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

const draw = (canvasContext, gameState) => {
  const { stage } = gameState;
  canvasContext.clearRect(0, 0, stage.width, stage.height);

  drawPerformanceMetrics(canvasContext, gameState);
  drawBall(canvasContext, gameState);
  drawPaddle(canvasContext, gameState);
};

const detectBallCollisions = ({ stage, ball, paddle }) => {
  if (ball.x <= ball.radius || ball.x >= stage.width - ball.radius) {
    ball.xVelocity *= -1;
  }
  if (ball.y <= ball.radius || ball.y >= stage.height - ball.radius) {
    ball.yVelocity *= -1;
  }

  if (ball.x >= paddle.x - (paddle.width / 2) - ball.radius && ball.x <= paddle.x + (paddle.width / 2) + ball.radius && ball.y >= paddle.y - (paddle.height / 2) - ball.radius && ball.y <= paddle.y + (paddle.height / 2) + ball.radius) {
    ball.yVelocity *= -1;
    const distanceFromCenter = ball.x - paddle.x;
    ball.xVelocity = distanceFromCenter * .01;
  }
}

const moveBall = ({ deltaTime, ball }) => {
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
  moveBall(gameState);
  movePaddle(gameState);

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
  
  const ball = {
    x: stage.width / 2,
    y: stage.height / 2,
    radius: 10,
    xVelocity: 0,
    yVelocity: 0.5,
  };

  const gameState = {
    stage,
    mouse,
    deltaTime: 0,
    timestamp: 0,
    timestampPrev: 0,
    ball,
    paddle,
  };

  window.requestAnimationFrame((timestamp) =>
    loop(timestamp, canvasContext, gameState)
  );
};

window.addEventListener("load", init);