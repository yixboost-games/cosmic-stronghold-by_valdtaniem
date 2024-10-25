// Get the canvas element and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions to match window size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Define game variables
let coins = 100; // Initial coins
let towers = []; // Array to store towers
let enemies = []; // Array to store enemies

// Tower object
class Tower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.projectile = null; // Projectile fired by the tower
  }

  draw() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
  }
}

// Enemy object
class Enemy {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.speed = speed;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
  }
}

// Update towers to shoot projectiles at enemies within range
function updateTowers() {
    towers.forEach(tower => {
      const targetEnemy = findClosestEnemy(tower.x, tower.y);
      console.info(targetEnemy)
      if (targetEnemy) { 
        tower.projectile = new Projectile(tower.x, tower.y, targetEnemy.x, targetEnemy.y);
        tower.projectile.update();
        tower.projectile.draw();


      }
    });
  }
  
// Find the closest enemy to the tower within a certain range
function findClosestEnemy(towerX, towerY) {
  let closestEnemy = null;
  let closestDistance = Infinity;

  enemies.forEach(enemy => {
    const distance = Math.sqrt(
      (towerX - enemy.x) ** 2 + (towerY - enemy.y) ** 2
    );

    if (distance < closestDistance && distance < 100) { /////////////////////////////////////////////////////////////////// Adjust the radius (100) as needed
      closestEnemy = enemy;
      closestDistance = distance;
    }
  });

  return closestEnemy;
}

// Projectile object
class Projectile {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = 3;
  }

  update() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > this.speed) {
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    } else {
      const index = enemies.findIndex(enemy => enemy.x === this.targetX && enemy.y === this.targetY);
      if (index !== -1) {
        enemies.splice(index, 1);
        coins += 10; // Award coins for killing an enemy
      }
      const projectileIndex = towers.findIndex(tower => tower.projectile === this);
      if (projectileIndex !== -1) {
        towers[projectileIndex].projectile = null;
      }
    }
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = 'yellow';
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

// Modify the game loop to include updating towers and projectiles
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateTowers(); // Update towers and shoot projectiles

  towers.forEach(tower => {
    tower.draw();
    if (tower.projectile) {
      tower.projectile.update();
      tower.projectile.draw();
    }
  });

  enemies.forEach(enemy => {
    enemy.draw();
    enemy.x += enemy.speed;
  });

  // Eliminate enemies within tower radius
  towers.forEach(tower => {
    enemies.forEach(enemy => {
      const distance = Math.sqrt(
        (tower.x - enemy.x) ** 2 + (tower.y - enemy.y) ** 2
      );
      if (distance < 200) {//////////////////////////////////////define tower radius here!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        const index = enemies.indexOf(enemy);
        if (index !== -1) {
          enemies.splice(index, 1);
          coins += 10; 
        }
      }
    });
  });

  // Draw coins display
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText(`Coins: ${coins}`, 20, 30);

  // Call the game loop recursively
  requestAnimationFrame(gameLoop);
}

// Function to handle window resizing
window.addEventListener('resize', () => {
  resizeCanvas();
});

// Function to place towers on click
canvas.addEventListener('click', function(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  if (coins >= 10) {
    const newTower = new Tower(mouseX, mouseY);
    towers.push(newTower);
    coins -= 10; // Deduct coins when placing a tower
  }
});

// Function to create enemies at intervals
function createEnemy() {
  const speed = 1 + Math.random() * 2; // Random speed
  const y = Math.random() * canvas.height; // Random Y position
  const newEnemy = new Enemy(0, y, speed); // Spawn from the left side
  enemies.push(newEnemy);
}

// Start the game when the window loads
window.onload = () => {
  resizeCanvas();
  startGame();

  // Spawn enemies at intervals
  setInterval(createEnemy, 2000); // Adjust the interval as needed
};

// Function to start the game
function startGame() {
  resizeCanvas();
  gameLoop();
}
