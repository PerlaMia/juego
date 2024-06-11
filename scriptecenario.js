

// Pregunta si estás listo al principio
var ready = confirm("¿Estás listo?");
if (ready) {
  // Inicia el juego
  document.addEventListener("DOMContentLoaded", function() {
    var canvas = document.getElementById("cityCanvas");
    var ctx = canvas.getContext("2d");

    // Variables del juego
    var gato = {
      x: canvas.width * 0.1,
      y: canvas.height * 0.82 - 50, // Posiciona al gato sobre la carretera
      width: 100,
      height: 150,
      invulnerable: false,
      moveLeft: function() {
        this.x -= 20;
        if (this.x < 5) { // Limita el movimiento hacia la izquierda
          this.x = 0;
        }
      },
      moveRight: function() {
        this.x += 20;
        if (this.x > canvas.width - this.width) { // Limita el movimiento hacia la derecha
          this.x = canvas.width - this.width;
        }
      },
      moveUp: function() {
        this.y -= 20;
        if (this.y < canvas.height * 0.62) { // Limita el movimiento hacia arriba dentro de la carretera
          this.y = canvas.height * 0.72;
        }
      },
      moveDown: function() {
        this.y += 20;
        if (this.y > canvas.height * 0.92 - this.height) { // Limita el movimiento hacia abajo dentro de la carretera
          this.y = canvas.height * 0.92 - this.height;
        }
      },
      makeInvulnerable: function() {
        this.invulnerable = true;
        setTimeout(() => {
          this.invulnerable = false;
        }, 9000); // 2 segundos de invulnerabilidad
      }
    };

    var obstacles = [];
    var obstacleFrequency = 180; // Frecuencia de aparición de obstáculos (en frames)
    var frameCount = 0;
    var score = 0;
    var lives = 3;
      
    var gameOver = false;
    var gameWon = false;

    var imgGato = new Image();
    imgGato.src = 'gatito.png'; // Reemplaza 'gatito.png' con la ruta correcta de la imagen del gatito

    var imgCar1 = new Image();
    imgCar1.src = 'carro1.webp'; // Reemplaza 'carro1.webp' con la ruta correcta de la imagen del carro

    var imgCar2 = new Image();
    imgCar2.src = 'carro1.webp'; // Reemplaza 'carro1.webp' con la ruta correcta de la imagen del carro

    var imgCar3 = new Image();
    imgCar3.src = 'carro1.webp'; // Reemplaza 'carro1.webp' con la ruta correcta de la imagen del carro

    var carImages = [imgCar1, imgCar2, imgCar3];

    var imgSky = new Image();
    imgSky.src = 'cielo.webp'; // Reemplaza 'sky.png' con la ruta correcta de la imagen del cielo

    var imgCloud = new Image();
    imgCloud.src = 'nubeSola.png'; // Reemplaza 'cloud.png' con la ruta correcta de la imagen de la nube
      

    var clouds = [
      { x: 0, y: 50, width: 200, height: 100, dx: 2 },
      { x: 300, y: 100, width: 250, height: 120, dx: 0.8},
      { x: 600, y: 70, width: 220, height: 110, dx: 1.2 }
    ];

    var imagesLoaded = 0;
    var totalImages = 6;

    function imageLoaded() {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        gameLoop();
      }
    }

    imgGato.onload = imageLoaded;
    imgCar1.onload = imageLoaded;
    imgCar2.onload = imageLoaded;
    imgCar3.onload = imageLoaded;
    imgSky.onload = imageLoaded;
    imgCloud.onload = imageLoaded;

    // Función para dibujar una casa
    function drawHouse(ctx, x, y, width, height) {
      // Cuerpo de la casa
      ctx.fillStyle = "#CD853F";
      ctx.fillRect(x, y, width, height);
      
      // Techo de la casa
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width / 2, y - height / 2);
      ctx.lineTo(x + width, y);
      ctx.closePath();
      ctx.fillStyle = "#8B4513";
      ctx.fill();

      // Ventanas
      ctx.fillStyle = "white";
      ctx.fillRect(x + width * 0.1, y + height * 0.4, width * 0.2, height * 0.4);
      ctx.fillRect(x + width * 0.7, y + height * 0.4, width * 0.2, height * 0.4);
      ctx.fillRect(x + width * 0.4, y + height * 0.1, width * 0.2, height * 0.2);
    }

    function drawSky() {
      ctx.drawImage(imgSky, 0, 0, canvas.width, canvas.height * 0.7);
    }

    function drawClouds() {
      clouds.forEach(function(cloud) {
        ctx.drawImage(imgCloud, cloud.x, cloud.y, cloud.width, cloud.height);
      });
    }

    function updateClouds() {
      clouds.forEach(function(cloud) {
        cloud.x += cloud.dx;
        if (cloud.x > canvas.width) {
          cloud.x = -cloud.width; // Reaparece en el otro lado
        }
      });
    }

    function drawGato() {
      ctx.drawImage(imgGato, gato.x, gato.y, gato.width, gato.height);
    }

    function drawObstacles() {
      obstacles.forEach(function(obstacle) {
        ctx.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });
    }

    function updateObstacles() {
      if (frameCount % obstacleFrequency === 0) {
        var obstacleWidth = 80; // Ajusta el ancho del carro
        var obstacleHeight = 60; // Ajusta la altura del carro
        var obstacleY = canvas.height * 0.72 + (Math.random() * (canvas.height * 0.20 - obstacleHeight));
        var randomCarImage = carImages[Math.floor(Math.random() * carImages.length)];
        obstacles.push({
          x: canvas.width,
          y: obstacleY,
          width: obstacleWidth,
          height: obstacleHeight,
          dx: -5,
          img: randomCarImage
        });
      }

      obstacles.forEach(function(obstacle) {
        obstacle.x += obstacle.dx;
      });

      obstacles = obstacles.filter(function(obstacle) {
        return obstacle.x + obstacle.width > 0;
      });
    }

    function detectCollisions() {
      if (!gato.invulnerable) {
        obstacles.forEach(function(obstacle) {
          if (gato.x < obstacle.x + obstacle.width &&
              gato.x + gato.width > obstacle.x &&
              gato.y < obstacle.y + obstacle.height &&
              gato.y + gato.height > obstacle.y) {
            lives--;
            gato.makeInvulnerable(); // Hacer invulnerable al gato después de una colisión
            if (lives <= 0) {
              gameOver = true;
            } else {
              // Reinicia al gato
              gato.x = canvas.width * 0.1;
              gato.y = canvas.height * 0.82 - gato.height;
            }
          }
        });
      }
    }
  function drawScore() {
      ctx.fillRect(0, 0, 150, 80); // Tamaño del fondo
      
      // Cambiar tipo de letra
      ctx.fillStyle = "black";
      ctx.font = "bold 20px Times New Roman"; // Tipo de letra y tamaño
      ctx.fillText("Puntuación: " + score, 10, 30);
      ctx.fillText("Vidas: " + lives, 10, 60);
  }


    function drawGameOver() {
      ctx.fillStyle = "black";
      ctx.font = "40px Arial";
      ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
    }

    function drawGameWon() {
      ctx.fillStyle = "black";
      ctx.font = "40px Arial";
      ctx.fillText("¡Felicidades, tus compañeros están a salvo!", canvas.width / 200, canvas.height / 2);
    }

    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dibuja el cielo y las nubes
      drawSky();
      updateClouds();
      drawClouds();

      // Redibuja el fondo y los elementos estáticos
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.4);
      ctx.beginPath();
      ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 50, 0, Math.PI * 2);
      var grad = ctx.createRadialGradient(canvas.width * 0.8, canvas.height * 0.2, 10, canvas.width * 0.8, canvas.height * 0.2, 50);
      grad.addColorStop(0, "#FFD700"); // Amarillo
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.closePath();
      drawHouse(ctx, 100, canvas.height * 0.5, 120, 120);
      drawHouse(ctx, 300, canvas.height * 0.55, 150, 100);
      drawHouse(ctx, 550, canvas.height * 0.52, 100, 150);
      ctx.fillStyle = "green";
      ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
      ctx.fillStyle = "#A9A9A9";
      ctx.fillRect(0, canvas.height * 0.72, canvas.width, canvas.height * 0.20);
      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.setLineDash([15, 15]);
      ctx.moveTo(5, canvas.height * 0.775);
      ctx.lineTo(canvas.width, canvas.height * 0.775);
      ctx.stroke();

      if (gameOver) {
        drawGameOver();
      } else if (gameWon) {
        drawGameWon();
      } else {
        // Actualiza los obstáculos
        updateObstacles();

        // Detecta colisiones
        detectCollisions();

        // Incrementa la puntuación
        score++;
        if (score >= 1000) {
          gameWon = true;
        }

        // Dibuja los elementos móviles
        drawGato();
        drawObstacles();
        drawScore();

        frameCount++;
        requestAnimationFrame(gameLoop);
      }
    }

    document.addEventListener("keydown", function(event) {
      if (event.code === "ArrowLeft") {
        gato.moveLeft();
      } else if (event.code === "ArrowRight") {
        gato.moveRight();
      } else if (event.code === "ArrowUp") {
        gato.moveUp();
      } else if (event.code === "ArrowDown") {
        gato.moveDown();
      }
    });
  });
} else {
  // Muestra un mensaje de confirmación
  alert("¡OKEY!");
}
