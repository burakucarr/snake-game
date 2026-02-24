var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var grid = 16;
var count = 0;
var score = 0;
var speedThreshold = 4;
var appleFlash = 0;
var gameActive = true;

// Sound effects using Web Audio API
var audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSoundEat() {
    var now = audioContext.currentTime;
    var osc = audioContext.createOscillator();
    var gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.setValueAtTime(800, now);
    osc.frequency.setValueAtTime(600, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.setValueAtTime(0, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
}

function playSoundGameOver() {
    var now = audioContext.currentTime;
    var osc = audioContext.createOscillator();
    var gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.setValueAtTime(0, now + 0.3);

    osc.frequency.setValueAtTime(400, now);
    osc.frequency.setValueAtTime(200, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
}

function showScorePopup(x, y, points) {
    var popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + points;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    document.getElementById('popupContainer').appendChild(popup);

    setTimeout(function () {
        popup.remove();
    }, 600);
}

var snake = {
    x: 160,
    y: 160,

    // snake velocity. moves one grid length every frame in either the x or y direction
    dx: grid,
    dy: 0,

    // keep track of all grids the snake body occupies
    cells: [],

    maxCells: 4
};
var apple = {
    x: 320,
    y: 320
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function loop() {
    requestAnimationFrame(loop);

    if (++count < speedThreshold) {
        return;
    }

    count = 0;
    context.clearRect(0, 0, canvas.width, canvas.height);

    snake.x += snake.dx;
    snake.y += snake.dy;

    if (snake.x < 0) {
        snake.x = canvas.width - grid;
    }
    else if (snake.x >= canvas.width) {
        snake.x = 0;
    }

    if (snake.y < 0) {
        snake.y = canvas.height - grid;
    }
    else if (snake.y >= canvas.height) {
        snake.y = 0;
    }

    snake.cells.unshift({ x: snake.x, y: snake.y });

    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }

    // draw apple with animation
    appleFlash = (appleFlash + 1) % 20;
    var appleColor = appleFlash < 10 ? 'red' : '#FF4500';
    context.fillStyle = appleColor;
    context.fillRect(apple.x, apple.y, grid - 1, grid - 1);

    // Apple highlight
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(apple.x + 1, apple.y + 1, 3, 3);

    snake.cells.forEach(function (cell, index) {
        // Snake body gradient effect
        var intensity = index / snake.cells.length;
        var shade = Math.floor(100 + intensity * 100);
        context.fillStyle = 'rgb(0, ' + shade + ', 0)';
        context.fillRect(cell.x, cell.y, grid - 1, grid - 1);

        // Snake head highlight
        if (index === 0) {
            context.fillStyle = 'rgba(255, 255, 0, 0.3)';
            context.fillRect(cell.x + 2, cell.y + 2, 2, 2);
        }

        if (cell.x === apple.x && cell.y === apple.y) {
            snake.maxCells++;
            score += 10;
            playSoundEat();
            showScorePopup(apple.x + 8, apple.y + 8, 10);
            document.getElementById('score').textContent = score;

            apple.x = getRandomInt(0, 25) * grid;
            apple.y = getRandomInt(0, 25) * grid;
            appleFlash = 0;
        }

        for (var i = index + 1; i < snake.cells.length; i++) {

            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                playSoundGameOver();
                gameActive = false;

                // Show game over text
                var gameOverElement = document.getElementById('gameOverText');
                gameOverElement.classList.add('show');

                // Flash effect on game over
                for (var j = 0; j < 4; j++) {
                    setTimeout(function () {
                        if (j % 2 === 0) {
                            context.fillStyle = 'rgba(255, 0, 0, 0.3)';
                            context.fillRect(0, 0, canvas.width, canvas.height);
                        }
                    }, j * 100);
                }

                setTimeout(function () {
                    snake.x = 160;
                    snake.y = 160;
                    snake.cells = [];
                    snake.maxCells = 4;
                    snake.dx = grid;
                    snake.dy = 0;
                    score = 0;
                    document.getElementById('score').textContent = score;
                    apple.x = getRandomInt(0, 25) * grid;
                    apple.y = getRandomInt(0, 25) * grid;
                    appleFlash = 0;
                    gameOverElement.classList.remove('show');
                    gameActive = true;
                }, 2500);
            }
        }
    });
}

// listen to keyboard events to move the snake
document.addEventListener('keydown', function (e) {
    // prevent snake from backtracking on itself by checking that it's 
    // not already moving on the same axis (pressing left while moving
    // left won't do anything, and pressing right while moving left
    // shouldn't let you collide with your own body)

    // left arrow key
    if (e.which === 37 && snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
    }
    // up arrow key
    else if (e.which === 38 && snake.dy === 0) {
        snake.dy = -grid;
        snake.dx = 0;
    }
    // right arrow key
    else if (e.which === 39 && snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
    }
    // down arrow key
    else if (e.which === 40 && snake.dy === 0) {
        snake.dy = grid;
        snake.dx = 0;
    }
});

// listen to + and - keys to adjust speed
document.addEventListener('keydown', function (e) {
    // + key (187 on most keyboards, 107 on numpad)
    if ((e.which === 187 || e.which === 107) && speedThreshold > 1) {
        speedThreshold--;
        document.getElementById('speed').textContent = (11 - speedThreshold);
    }
    // - key (189 on most keyboards, 109 on numpad)
    else if ((e.which === 189 || e.which === 109) && speedThreshold < 10) {
        speedThreshold++;
        document.getElementById('speed').textContent = (11 - speedThreshold);
    }
});

// start the game
requestAnimationFrame(loop);