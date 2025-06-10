const customCursor = document.getElementById('custom-cursor');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    customCursor.style.left = `${cursorX}px`;
    customCursor.style.top = `${cursorY}px`;

    requestAnimationFrame(animateCursor);
}

animateCursor();

const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

let blobs = [];
let stars = [];
let shootingStars = [];

const SHOOTING_STAR_MIN_DELAY = 10000;
const SHOOTING_STAR_MAX_DELAY = 30000;
let lastShootingStarTime = 0;
let nextShootingStarDelay = 0;

const random = (min, max) => Math.random() * (max - min) + min;

function resizeCanvas() {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (blobs.length === 0) {
        createBlobs();
    } else {
        blobs.forEach(blob => {
            blob.x = (blob.x / oldWidth) * canvas.width;
            blob.y = (blob.y / oldHeight) * canvas.height;
        });
    }

    if (stars.length === 0) {
        createStars();
    } else {
        stars.forEach(star => {
            star.x = (star.x / oldWidth) * canvas.width;
            star.y = (star.y / oldHeight) * canvas.height;
        });
    }
}

function createBlobs() {
    blobs = [];
    const numBlobs = Math.min(5, Math.floor(canvas.width / 300) + 1);

    const gridX = 3;
    const gridY = 2;
    const cellWidth = canvas.width / gridX;
    const cellHeight = canvas.height / gridY;

    for (let i = 0; i < numBlobs; i++) {
        const cellIndexX = i % gridX;
        const cellIndexY = Math.floor(i / gridX) % gridY;

        const minX = cellIndexX * cellWidth + cellWidth * 0.1;
        const maxX = (cellIndexX + 1) * cellWidth - cellWidth * 0.1;
        const minY = cellIndexY * cellHeight + cellHeight * 0.1;
        const maxY = (cellIndexY + 1) * cellHeight - cellHeight * 0.1;

        const xPos = random(minX, maxX);
        const yPos = random(minY, maxY);

        const hue = random(200, 260);
        const saturation = random(80, 100);
        const lightness = random(55, 65);

        blobs.push({
            x: xPos,
            y: yPos,
            radius: random(200, 450),
            color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
            speedX: random(-0.5, 0.5),
            speedY: random(-0.5, 0.5),
            opacity: random(0.4, 0.8),
            blur: random(60, 100)
        });
    }
}

function createStars() {
    stars = [];
    const numStars = Math.floor(canvas.width / 20);

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: random(0, canvas.width),
            y: random(0, canvas.height),
            radius: random(0.5, 1.5),
            alpha: random(0.2, 1),
            speed: random(0.01, 0.05)
        });
    }
}

function createShootingStar() {
    const startX = random(0, canvas.width);
    const startY = -50;

    const length = random(100, 200);
    const speed = random(5, 10);
    const angle = random(Math.PI / 4 - Math.PI / 16, Math.PI / 4 + Math.PI / 8);

    shootingStars.push({
        x: startX,
        y: startY,
        length: length,
        speed: speed,
        alpha: 1,
        hue: random(200, 230),
        saturation: random(80, 100),
        lightness: random(80, 95),
        angle: angle
    });
}

function drawShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];

        star.x += star.speed * Math.cos(star.angle);
        star.y += star.speed * Math.sin(star.angle);

        star.alpha -= 0.015;

        if (star.alpha <= 0 || star.x > canvas.width + star.length || star.y > canvas.height + star.length || star.y < -star.length) {
            shootingStars.splice(i, 1);
            continue;
        }

        ctx.save();
        ctx.beginPath();

        const gradient = ctx.createLinearGradient(
            star.x - star.length * Math.cos(star.angle), star.y - star.length * Math.sin(star.angle),
            star.x, star.y
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(0.5, `hsla(${star.hue}, ${star.saturation}%, ${star.lightness}%, ${star.alpha * 0.8})`);
        gradient.addColorStop(1, `hsla(${star.hue}, ${star.saturation}%, ${star.lightness}%, ${star.alpha})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = random(1, 3);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(star.x, star.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${star.hue}, ${star.saturation}%, 95%, ${star.alpha})`;
        ctx.fill();

        ctx.restore();
    }
}

function drawStars() {
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();

        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
            star.speed *= -1;
        }
    });
}

function animateBackground(currentTime) {
    if (!ctx) {
        requestAnimationFrame(animateBackground);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentTime - lastShootingStarTime > nextShootingStarDelay) {
        createShootingStar();
        lastShootingStarTime = currentTime;
        nextShootingStarDelay = random(SHOOTING_STAR_MIN_DELAY, SHOOTING_STAR_MAX_DELAY);
    }

    blobs.forEach(blob => {
        ctx.save();
        ctx.filter = `blur(${blob.blur}px)`;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fillStyle = blob.color;
        ctx.globalAlpha = blob.opacity;
        ctx.fill();
        ctx.restore();

        blob.x += blob.speedX;
        blob.y += blob.speedY;

        if (blob.x - blob.radius < 0 || blob.x + blob.radius > canvas.width) {
            blob.speedX *= -1;
        }
        if (blob.y - blob.radius < 0 || blob.y + blob.radius > canvas.height) {
            blob.speedY *= -1;
        }
    });

    drawStars();

    drawShootingStars();

    requestAnimationFrame(animateBackground);
}

document.addEventListener('DOMContentLoaded', () => {
    const canvasElement = document.getElementById('background-canvas');
    if (canvasElement) {
        resizeCanvas();
        animateBackground(0);
    } else {
        console.error("Canvas element 'background-canvas' not found!");
    }
});

window.addEventListener('resize', () => {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    blobs.forEach(blob => {
        blob.x = (blob.x / oldWidth) * canvas.width;
        blob.y = (blob.y / oldHeight) * canvas.height;
    });
    stars.forEach(star => {
        star.x = (star.x / oldWidth) * canvas.width;
        star.y = (star.y / oldHeight) * canvas.height;
    });
});