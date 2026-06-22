// ==========================================
// Canvas Particle System (Muted Stardust)
// ==========================================

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];

// Color palette for stardust particles (slate, grey, silver, white)
const colors = [
  'rgba(131, 145, 161, 0.45)',  // Slate grey
  'rgba(200, 205, 215, 0.4)',   // Silver grey
  'rgba(255, 255, 255, 0.55)',  // White
  'rgba(240, 243, 246, 0.5)',   // Cool white
  'rgba(82, 109, 130, 0.3)'     // Slate blue
];

// Handle Window Resize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Particle Class
class StardustParticle {
  constructor(x, y, size) {
    this.x = x || Math.random() * canvas.width;
    this.y = y || canvas.height + 20;
    this.size = size || Math.random() * 4 + 2; // Muted, small stardust
    this.speedX = Math.random() * 0.8 - 0.4;
    this.speedY = -(Math.random() * 0.8 + 0.3);
    this.opacity = Math.random() * 0.5 + 0.3;
    this.glow = Math.random() > 0.6;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Gentle drift wave
    this.x += Math.sin(this.y * 0.008) * 0.25;

    // Fade out as it rises
    if (this.y < canvas.height * 0.8) {
      this.opacity -= 0.0015;
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    if (this.glow) {
      ctx.shadowBlur = this.size * 2;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
    }

    ctx.beginPath();
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Populate background particles
function initBackgroundParticles() {
  if (particles.length < 45) {
    particles.push(new StardustParticle());
  }
}

// Canvas Animation Loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  initBackgroundParticles();

  particles.forEach((p, idx) => {
    p.update();
    p.draw();
    if (p.opacity <= 0 || p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
      particles.splice(idx, 1);
    }
  });

  requestAnimationFrame(animate);
}
animate();

// Spawn floating stardust on screen click
window.addEventListener('click', (e) => {
  for (let i = 0; i < 4; i++) {
    particles.push(new StardustParticle(e.clientX, e.clientY, Math.random() * 3 + 1.5));
  }
});

// ==========================================
// Navigation & Interactive Scroll Logic
// ==========================================

const landingScreen = document.getElementById('landing-screen');
const letterScreen = document.getElementById('letter-screen');

const touchMeBtn = document.getElementById('touch-me-btn');
const scrollContainer = document.getElementById('scroll-container');
const scrollContent = document.getElementById('scroll-content');
const closeBtn = document.getElementById('close-btn');

const bgMusic = document.getElementById('bg-music');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const iconPlaying = document.querySelector('.icon-playing');
const iconPaused = document.querySelector('.icon-paused');

// 1. Music Play / Pause Toggle Logic
function updateMusicIconState(isPaused) {
  if (isPaused) {
    iconPlaying.style.display = 'none';
    iconPaused.style.display = 'block';
  } else {
    iconPlaying.style.display = 'block';
    iconPaused.style.display = 'none';
  }
}

musicToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (bgMusic.paused) {
    bgMusic.play()
      .then(() => updateMusicIconState(false))
      .catch(err => console.log("Audio playback error:", err));
  } else {
    bgMusic.pause();
    updateMusicIconState(true);
  }
});

// 2. Touch Me Button Click (Landing -> Letter Screen + Auto Open Scroll)
touchMeBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Avoid click spawning particles at click coordinates

  // Start music playing automatically
  bgMusic.volume = 1.0;
  bgMusic.play()
    .then(() => updateMusicIconState(false))
    .catch(err => {
      console.log("Audio autoplay restricted. Music will launch on next toggle or click.");
      updateMusicIconState(true);
    });

  // Transition screens
  landingScreen.classList.remove('active');
  letterScreen.classList.add('active');

  // Automatically open the scroll after transition starts
  setTimeout(() => {
    scrollContainer.classList.add('open');
    sendDiscordAlert("📜 Scroll Opened & Unrolling");
  }, 400);
});

// 3. Close Scroll Click
closeBtn.addEventListener('click', (e) => {
  e.stopPropagation();

  // Collapse the scroll unroll state
  scrollContainer.classList.remove('open');
  sendDiscordAlert("👋 Scroll Closed");

  // Reset text scroll offset back to top
  setTimeout(() => {
    scrollContent.scrollTop = 0;
  }, 1000);

  // Transition back to the landing screen after it rolls shut
  setTimeout(() => {
    letterScreen.classList.remove('active');
    landingScreen.classList.add('active');

    // Smoothly fade out the music over 1.5 seconds
    let vol = bgMusic.volume;
    const fadeInterval = setInterval(() => {
      if (vol > 0.05) {
        vol -= 0.05;
        bgMusic.volume = vol;
      } else {
        bgMusic.volume = 0;
        bgMusic.pause();
        clearInterval(fadeInterval);
      }
    }, 75);
  }, 1200);
});

// ==========================================
// Discord Webhook Alerts
// ==========================================
const webhookUrl = "https://discord.com/api/webhooks/1484624481212170461/6Y8HD_P7wlJzM6tH6O9iyV2nwhRTw3HhkcMO22lgpXjaKcfwk_gAJ8FOuXZJQXLxVLo7";

function sendDiscordAlert(action) {
  fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      embeds: [
        {
          title: "Activity Update",
          description: `Event: **${action}**`,
          color: 5393794, // decimal for #526D82 (slate grey/blue)
          timestamp: new Date().toISOString()
        }
      ]
    })
  }).catch(err => console.log("Failed to send webhook log:", err));
}

// Initial page load alert
sendDiscordAlert("🌐 Website Loaded / Opened");
