const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];

// Adjust canvas size if the browser window is resized
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1; // Slightly smaller
        this.type = type; 
        this.speedY = Math.random() * 0.5 + 0.2; // Much slower fall
        this.speedX = Math.random() * 0.4 - 0.2; // Very gentle horizontal drift
    }
    
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.24)'; // Made them a bit more transparent
        ctx.font = this.size * 5 + "px 'Courier New'";
        
        if (this.type === 'dot') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillText(this.type, this.x, this.y);
        }
    }
    
    update() {
        // Simple falling movement
        this.y += this.speedY;
        this.x += this.speedX;

        // Reset to the top of the screen if it falls off the bottom
        if (this.y > canvas.height) {
            this.y = 0 - 20;
            this.x = Math.random() * canvas.width;
        }
        
        // Wrap around the sides of the screen seamlessly
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;

        this.draw();
    }
}

function init() {
    particlesArray = [];
    // Divided by a much larger number to spawn way fewer particles
    let numberOfParticles = (canvas.width * canvas.height) / 15000; 
    const types = ['dot', '<3', ':3'];
    
    for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let type = types[Math.floor(Math.random() * types.length)];
        particlesArray.push(new Particle(x, y, type));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    requestAnimationFrame(animate);
}

init();
animate();

// Get the elements
const profilePic = document.getElementById('profile-pic');
const body = document.body;
const blackoutOverlay = document.getElementById('blackout-overlay');

// Audio setup (requires hit.mp3 and dizzy.mp3 in your folder)
const hitSound = new Audio('assets/hit.mp3');
const dizzySound = new Audio('assets/dizzy.mp3'); 

let clickCount = 0;
let resetTimer;
let isBlackingOut = false; 

// Image sources updated to your file names!
const imgNormal = 'assets/Gemini_Generated_Image_o0an0do0an0do0an.png';
const imgMad = 'assets/mad.png';
const imgDisoriented = 'assets/droozy.png';

if (profilePic) {
    profilePic.addEventListener('click', () => {
        
        // If a blackout is currently happening, stop right here and ignore the click
        if (isBlackingOut) return;
        
        // 1. Audio logic: Clone the audio node so sounds overlap perfectly!
        const hitSoundClone = hitSound.cloneNode();
        hitSoundClone.play();

        // 2. Shake screen
        body.classList.remove('is-shaking');
        void body.offsetWidth; // Restart animation trick
        body.classList.add('is-shaking');

        // 3. Count clicks
        clickCount++;
        
        // 4. Handle states based on click count
        if (clickCount >= 10) {
            
            // LOCK THE CLICKING
            isBlackingOut = true; 
            
            // TRIGGER BLACKOUT
            blackoutOverlay.classList.remove('is-blacked-out');
            void blackoutOverlay.offsetWidth; 
            blackoutOverlay.classList.add('is-blacked-out');
            
            // Reset clicks 
            clickCount = 0; 

            // PLAY DIZZY SOUND
            dizzySound.currentTime = 0;
            dizzySound.play();

            // Force dizzy sound to stop after exactly 5 seconds
            setTimeout(() => {
                dizzySound.pause();
                dizzySound.currentTime = 0;
            }, 5000);
            
            // Revert image to normal and UNLOCK clicking right as the eyes open again
            setTimeout(() => {
                profilePic.src = imgNormal;
                isBlackingOut = false; 
            }, 3500); 
            
        } else if (clickCount >= 6) {
            // Disoriented state
            profilePic.src = imgDisoriented;
        } else if (clickCount >= 3) {
            // Mad state
            profilePic.src = imgMad;
        }

        // 5. Cooldown timer (only runs if we haven't hit 10 yet)
        if (clickCount > 0 && clickCount < 10) {
            clearTimeout(resetTimer); 
            resetTimer = setTimeout(() => {
                // Fully reset the character after 5 seconds of inactivity
                clickCount = 0;
                profilePic.src = imgNormal;
            }, 5000); 
        }
    });
}