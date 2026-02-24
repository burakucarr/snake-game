// Ensure the canvas resizes responsively
function resizeCanvas() {
    const canvas = document.getElementById('gameCanvas');
    canvas.width = window.innerWidth;  // Set width based on window width
    canvas.height = window.innerHeight; // Set height based on window height
}

// Listen for touch events for swipe detection
let touchStartX = null;
let touchStartY = null;

document.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

document.addEventListener('touchend', function(e) {
    if (touchStartX === null || touchStartY === null) {
        return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            // Swiped right
            game.snake.moveRight();
        } else {
            // Swiped left
            game.snake.moveLeft();
        }
    } else {
        if (deltaY > 0) {
            // Swiped down
            game.snake.moveDown();
        } else {
            // Swiped up
            game.snake.moveUp();
        }
    }

    touchStartX = null;
    touchStartY = null; // Reset touch points
});

// Restart game on mobile tap
document.addEventListener('click', function(e) {
    if (game.isOver) {
        game.restart(); // Restart game if it's over
    }
});

// We call resizeCanvas initially to set the correct size at the start
resizeCanvas();
window.addEventListener('resize', resizeCanvas); // Call on window resize
