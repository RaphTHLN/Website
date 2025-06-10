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
    cursorX += (mouseX - cursorX) * 0.08;
    cursorY += (mouseY - cursorY) * 0.08;

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
let blobsInitialized = false; 
let starsInitialized = false; 

const SHOOTING_STAR_MIN_DELAY = 10000; 
const SHOOTING_STAR_MAX_DELAY = 30000; 
let lastShootingStarTime = 0;
let nextShootingStarDelay = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if (!blobsInitialized) {
        createBlobs();
        blobsInitialized = true;
    } 
    
    if (!starsInitialized) {
        createStars();
        starsInitialized = true;
    }
}

function createBlobs() {
    blobs = []; 
    const numBlobs = Math.min(4, Math.floor(canvas.width / 250) + 2); 

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

        const xPos = Math.random() * (maxX - minX) + minX;
        const yPos = Math.random() * (maxY - minY) + minY;

        const hue = Math.random() * 60 + 200; 
        const saturation = Math.random() * 20 + 80; 
        const lightness = Math.random() * 10 + 55; 

        blobs.push({
            x: xPos, 
            y: yPos, 
            radius: Math.random() * 250 + 200, 
            color: `hsl(${hue}, ${saturation}%, ${lightness}%)`, 
            speedX: (Math.random() - 0.5) * 0.7, 
            speedY: (Math.random() - 0.5) * 0.7,
            opacity: Math.random() * 0.4 + 0.4, 
            blur: Math.random() * 60 + 60 
        });
    }
}

function createStars() {
    stars = [];
    const numStars = Math.floor(canvas.width / 15); 

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1 + 0.5, 
            alpha: Math.random(), 
            speed: Math.random() * 0.05 + 0.01 
        });
    }
}

function createShootingStar() {
    const startX = Math.random() * canvas.width;
    const startY = -50; 
    const endX = Math.random() * canvas.width;
    const endY = canvas.height + 50;

    const length = Math.random() * 150 + 100; 
    const speed = Math.random() * 4 + 4; 

    shootingStars.push({
        x: startX,
        y: startY,
        length: length,
        speed: speed,
        alpha: 1, 
        hue: Math.random() * 30 + 200, 
        saturation: Math.random() * 20 + 80,
        lightness: Math.random() * 10 + 80, 
        angle: Math.PI / 4 + (Math.random() * Math.PI / 8 - Math.PI / 16) 
    });
}

function drawShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.x += star.speed * Math.cos(star.angle);
        star.y += star.speed * Math.sin(star.angle);
        star.alpha -= 0.01; 
        if (star.alpha <= 0 || star.x > canvas.width + star.length || star.y > canvas.height + star.length) {
            shootingStars.splice(i, 1);
            continue; 
        }
        ctx.save();
        ctx.beginPath();

        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.length * Math.cos(star.angle), star.y - star.length * Math.sin(star.angle));
        
        const gradient = ctx.createLinearGradient(
            star.x - star.length * Math.cos(star.angle), star.y - star.length * Math.sin(star.angle),
            star.x, star.y
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`); 
        gradient.addColorStop(0.5, `hsla(${star.hue}, ${star.saturation}%, ${star.lightness}%, ${star.alpha * 0.8})`); 
        gradient.addColorStop(1, `hsla(${star.hue}, ${star.saturation}%, ${star.lightness}%, ${star.alpha})`); 

        ctx.strokeStyle = gradient;
        ctx.lineWidth = Math.random() * 2 + 1; 
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
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    
    if (currentTime - lastShootingStarTime > nextShootingStarDelay) {
        createShootingStar();
        lastShootingStarTime = currentTime;
        nextShootingStarDelay = Math.random() * (SHOOTING_STAR_MAX_DELAY - SHOOTING_STAR_MIN_DELAY) + SHOOTING_STAR_MIN_DELAY;
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

window.addEventListener('resize', resizeCanvas);


resizeCanvas(); 
animateBackground(0); 
