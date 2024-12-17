const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const columns = 5;
const columnWidth = canvas.width / columns; 

const basketImg = new Image();
basketImg.src = "basket.png"; 
const fruitImg = new Image();
fruitImg.src = "fruit.png";
const bombImg = new Image();
bombImg.src = "bomb.png";
const grassImg = new Image();
grassImg.src = "grass.png";


const catchSound = new Audio("catch.wav");
const bombSound = new Audio("bomb.wav");
const gameOverSound = new Audio("gameover.wav");
const menuClickSound = new Audio("menu-click.wav");


catchSound.volume = 0.7; 
bombSound.volume = 0.8; 

const backgroundMusic = new Audio("background-music.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.9; 


let gameState = "menu"; 
let basketWidth = 120;
let basketHeight = 100;
let basketX = (canvas.width - basketWidth) / 2;
let fruits = [];
let score = 0;
let lives = 3;
let fruitSpeed = 6; 
let bombSpeed = 3; 
let bombs = [];
let lastFruitColumn = null;

// Interval untuk kontrol permainan
let fruitInterval, bombInterval, drawInterval;


function drawBasket() {
    ctx.drawImage(basketImg, basketX, canvas.height - basketHeight - 20, basketWidth, basketHeight);
}


function drawFruit(fruit) {
    ctx.drawImage(fruitImg, fruit.x, fruit.y, 45, 45);
}


function drawScore() {
    ctx.font = "23px Arial";
    ctx.fillStyle = "#ff0000";
    ctx.fillText("Score: " + score, 50, 25);
}


function drawLives() {
    ctx.font = "23px Arial";
    ctx.fillStyle = "#ff0000";
    ctx.fillText("Lives: " + lives, canvas.width - 50, 25);
}

// Memperbarui buah
function updateFruits() {
    fruits.forEach((fruit, index) => {
        fruit.y += fruitSpeed;

        // Deteksi apakah buah tertangkap
        const basketHitBox = {
            x: basketX + 20,
            y: canvas.height - basketHeight - 10,
            width: basketWidth - 30,
            height: basketHeight
        };

        if (fruit.y + 45 > basketHitBox.y && 
            fruit.x > basketHitBox.x && 
            fruit.x < basketHitBox.x + basketHitBox.width) {
            score++;
            fruits.splice(index, 1);
            catchSound.play(); // Suara menangkap buah
        }

        // Jika buah terlewat
        if (fruit.y > canvas.height) {
            lives--;
            fruits.splice(index, 1);
            if (lives <= 0) {
                gameOver();
            }
        }
    });
}

// Tambah buah
function addFruit() {
    const column = Math.floor(Math.random() * columns); // Pilih kolom acak untuk buah
    const x = column * columnWidth + columnWidth / 2 - 20;
    fruits.push({ x: x, y: 0 });
    lastFruitColumn = column;
}


function drawMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px Comic sans ms";
    ctx.fillStyle = "#ff0000";
    ctx.textAlign = "center";

   
    ctx.fillText("MONKEY LIKE BANANAS", canvas.width / 2, canvas.height / 2 - 50);

    // Tombol "Mulai"
    ctx.fillStyle = "#2222";
    ctx.fillRect(canvas.width / 2 - 75, canvas.height / 2, 150, 50);
    ctx.fillStyle = "#fff";
    ctx.fillText("Mulai", canvas.width / 2, canvas.height / 2 + 35);
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrass();
    drawBasket();
    fruits.forEach(drawFruit);
    bombs.forEach(drawBomb);
    drawScore();
    drawLives();
    updateFruits();
    updateBombs();
}

// Gerakan keranjang
function moveBasket(event) {
    if (gameState !== "play") return;

    const arrowKey = event.key;
    if (arrowKey === "ArrowLeft" && basketX > 0) {
        basketX -= 65;
    } else if (arrowKey === "ArrowRight" && basketX < canvas.width - basketWidth) {
        basketX += 65;
    }
}

// Tambahkan bom
function addBomb() {
    let column;
    let attempts = 0;

    do {
        column = Math.floor(Math.random() * columns);
        attempts++;
    } while (column === lastFruitColumn && attempts < 10);

    const x = column * columnWidth + columnWidth / 2 - 20;
    bombs.push({ x: x, y: 0 });
}

// Gambar bom
function drawBomb(bomb) {
    ctx.drawImage(bombImg, bomb.x, bomb.y, 60, 60);
}

// Memperbarui bom
function updateBombs() {
    bombs.forEach((bomb, index) => {
        bomb.y += bombSpeed;

        const basketHitBox = {
            x: basketX + 20,
            y: canvas.height - basketHeight - 10,
            width: basketWidth - 40,
            height: basketHeight
        };

        if (
            bomb.y + 60 > basketHitBox.y &&
            bomb.x > basketHitBox.x &&
            bomb.x < basketHitBox.x + basketHitBox.width
        ) {
            bombSound.play(); 
            alert("Game Over! Anda menangkap bom!");
            resetGame();
            return;
        }

        if (bomb.y > canvas.height) {
            bombs.splice(index, 1);
        }
    });
}

// Fungsi game over
function gameOver() {
    gameOverSound.play(); // Suara game over
    alert("Game Over! Skor Anda: " + score);
    
    // Setelah game over dan alert ditutup, reset game
    resetGame();
}

// Reset permainan
function resetGame() {
    score = 0;
    lives = 3;
    fruitSpeed = 6;
    bombSpeed = 3;
    bombs = [];
    fruits = [];
    basketX = (canvas.width - basketWidth) / 2;

    gameState = "menu";
    clearInterval(fruitInterval);
    clearInterval(bombInterval);
    clearInterval(drawInterval);

    // Mulai ulang permainan
    setTimeout(() => {
        // Reset background music jika game selesai
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;

        // Reset gambar menu
        draw();
    }, 100); // Menunggu sedikit sebelum menggambar ulang menu

}


// Fungsi suara klik menu
canvas.addEventListener("click", function(event) {
    if (gameState === "menu") {
        menuClickSound.play(); // Suara klik menu
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (
            mouseX > canvas.width / 2 - 75 &&
            mouseX < canvas.width / 2 + 75 &&
            mouseY > canvas.height / 2 &&
            mouseY < canvas.height / 2 + 50
        ) {
            gameState = "play";
            fruitInterval = setInterval(addFruit, 3000);
            bombInterval = setInterval(addBomb, 8000);
            drawInterval = setInterval(draw, 40);
            backgroundMusic.play(); // Mulai musik latar belakang saat game mulai
        }
    }
});


function drawGrass() {
    ctx.drawImage(grassImg, 0, canvas.height - 210, canvas.width, 270);
}


document.addEventListener("keydown", moveBasket);

// Loop utama untuk menggambar
function draw() {
    if (gameState === "menu") drawMenu();
    else if (gameState === "play") drawGame();
}

// Mulai permainan
draw();
