document.addEventListener("DOMContentLoaded", () => {
    // --- Config & DOM Elements ---
    const DISCORD_WEBHOOK_URL = "https://ntfy.sh/ajay_priyanka_2926"; // Pre-configured ntfy channel
    
    const heartsBg = document.getElementById("heartsBg");
    const musicController = document.getElementById("musicController");
    const romanticTrack = document.getElementById("romanticTrack");
    const envelope = document.getElementById("envelope");
    const btnNextStory = document.getElementById("btnNextStory");
    const btnPrevStory = document.getElementById("btnPrevStory");
    const btnYes = document.getElementById("btnYes");
    const btnNo = document.getElementById("btnNo");
    const btnRestart = document.getElementById("btnRestart");

    // Screens
    const screenEnvelope = document.getElementById("screenEnvelope");
    const screenStory = document.getElementById("screenStory");
    const screenProposal = document.getElementById("screenProposal");
    const screenCelebration = document.getElementById("screenCelebration");
    const proposalCard = document.querySelector(".proposal-card");

    // Story Slides
    const storySlides = document.querySelectorAll(".story-slide");
    const storyProgress = document.getElementById("storyProgress");

    let currentStoryStep = 1;
    const totalStorySteps = storySlides.length;
    let isMusicPlaying = false;
    let confettiAnimationId = null;
    let storyTimer = null;

    // --- 1. Floating Hearts Background Generator ---
    function createFloatingHeart() {
        const heart = document.createElement("div");
        heart.classList.add("heart-particle");
        
        // Randomize sizes
        const size = Math.random() * 15 + 10; // 10px to 25px
        heart.style.width = `${size}px`;
        heart.style.height = `${size}px`;

        // Randomize starting positions
        heart.style.left = `${Math.random() * 100}vw`;

        // Randomize animation delays and durations
        const duration = Math.random() * 5 + 6; // 6s to 11s
        heart.style.animationDuration = `${duration}s`;
        
        const delay = Math.random() * 3;
        heart.style.animationDelay = `${delay}s`;

        // Add dynamically to background
        heartsBg.appendChild(heart);

        // Remove element after it floats out of view
        setTimeout(() => {
            heart.remove();
        }, (duration + delay) * 1000);
    }

    // Initialize floating hearts
    for (let i = 0; i < 15; i++) {
        setTimeout(createFloatingHeart, i * 400);
    }
    setInterval(createFloatingHeart, 600);

    // --- 2. Music Controller Engine ---
    function toggleMusic(forcePlay = null) {
        const shouldPlay = forcePlay !== null ? forcePlay : !isMusicPlaying;
        
        if (shouldPlay) {
            romanticTrack.play()
                .then(() => {
                    isMusicPlaying = true;
                    musicController.classList.add("playing");
                    musicController.querySelector(".music-text").innerText = "Music On";
                })
                .catch((err) => {
                    console.log("Audio autoplay restricted. Waiting for direct user action.", err);
                });
        } else {
            romanticTrack.pause();
            isMusicPlaying = false;
            musicController.classList.remove("playing");
            musicController.querySelector(".music-text").innerText = "Music Off";
        }
    }

    musicController.addEventListener("click", () => toggleMusic());

    // --- 3. Screen Transitions ---
    function showScreen(screenToShow) {
        const screens = [screenEnvelope, screenStory, screenProposal, screenCelebration];
        
        screens.forEach(screen => {
            if (screen === screenToShow) {
                screen.classList.add("active");
            } else {
                screen.classList.remove("active");
            }
        });
    }

    // --- 4. Screen 1: Envelope Click & Auto-Open Event ---
    function openEnvelope() {
        if (envelope.classList.contains("open")) return;
        envelope.classList.add("open");
        
        // Play romantic background tune when she opens the letter
        setTimeout(() => {
            toggleMusic(true);
        }, 300);

        // Wait for envelope animation to finish, then go to story
        setTimeout(() => {
            showScreen(screenStory);
            updateStoryView();
            startStoryAutoPlay(); // Start the 10s auto-play slideshow
        }, 1000);
    }

    envelope.addEventListener("click", openEnvelope);

    // Auto-open envelope 1.2 seconds after page load
    setTimeout(openEnvelope, 1200);

    // --- 5. Screen 2: Memory Lane Story Navigation ---
    function updateStoryView() {
        // Show correct slide
        storySlides.forEach(slide => {
            const step = parseInt(slide.getAttribute("data-step"));
            if (step === currentStoryStep) {
                slide.classList.add("active");
            } else {
                slide.classList.remove("active");
            }
        });

        // Update progress bar
        const progressPercentage = (currentStoryStep / totalStorySteps) * 100;
        storyProgress.style.width = `${progressPercentage}%`;

        // Update button states
        if (currentStoryStep === 1) {
            btnPrevStory.style.display = "none";
        } else {
            btnPrevStory.style.display = "inline-flex";
        }

        if (currentStoryStep === totalStorySteps) {
            btnNextStory.innerText = "Read My Confession ❤️";
        } else {
            btnNextStory.innerText = "Continue 💖";
        }
    }

    // Autoplay slideshow functions
    function startStoryAutoPlay() {
        stopStoryAutoPlay();
        storyTimer = setTimeout(() => {
            advanceStory();
        }, 10000); // 10 seconds per slide
    }

    function stopStoryAutoPlay() {
        if (storyTimer) {
            clearTimeout(storyTimer);
            storyTimer = null;
        }
    }

    function advanceStory() {
        if (currentStoryStep < totalStorySteps) {
            currentStoryStep++;
            updateStoryView();
            startStoryAutoPlay(); // Reset timer for next slide
        } else {
            // End of story, go to proposal
            stopStoryAutoPlay();
            showScreen(screenProposal);
        }
    }

    btnNextStory.addEventListener("click", () => {
        // Autoplay fallback: start music on first user interaction if blocked on load
        if (!isMusicPlaying) {
            toggleMusic(true);
        }

        advanceStory();
    });

    btnPrevStory.addEventListener("click", () => {
        if (currentStoryStep > 1) {
            currentStoryStep--;
            updateStoryView();
            startStoryAutoPlay(); // Reset timer on going back
        }
    });

    // --- 6. Screen 3: Playful Dodging No Button ---
    // Make the No button run away when hovered or touched
    function dodgeNoButton(e) {
        // Get dimensions
        const btnRect = btnNo.getBoundingClientRect();
        const cardRect = proposalCard.getBoundingClientRect();
        
        // Safe boundaries relative to the proposalCard
        const padding = 20;
        const minX = padding;
        const maxX = Math.max(minX + 50, proposalCard.clientWidth - btnRect.width - padding);
        const minY = Math.max(50, proposalCard.clientHeight * 0.4);
        const maxY = Math.max(minY + 50, proposalCard.clientHeight - btnRect.height - padding);

        let randomX = Math.random() * (maxX - minX) + minX;
        let randomY = Math.random() * (maxY - minY) + minY;

        // Ensure the button doesn't teleport exactly under the mouse pointer
        let clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        let clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

        if (clientX && clientY) {
            // Convert viewport pointer coords to card-relative coords
            const pointerCardX = clientX - cardRect.left;
            const pointerCardY = clientY - cardRect.top;

            const dx = randomX - pointerCardX;
            const dy = randomY - pointerCardY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If the random position is too close to the cursor (within 100px),
            // we flip it to the opposite side of the card
            if (distance < 100) {
                if (pointerCardX < proposalCard.clientWidth / 2) {
                    randomX = maxX; // Move to right
                } else {
                    randomX = minX; // Move to left
                }
                
                if (pointerCardY < proposalCard.clientHeight / 2) {
                    randomY = maxY; // Move to bottom
                } else {
                    randomY = minY; // Move to top
                }
            }
        }

        // Apply new position using absolute positioning relative to the card container
        btnNo.style.position = "absolute";
        btnNo.style.left = `${Math.round(randomX)}px`;
        btnNo.style.top = `${Math.round(randomY)}px`;
        btnNo.style.margin = "0"; // Reset spacing
        
        // Add a cute wiggle animation trigger
        btnNo.style.transform = `scale(0.9) rotate(${Math.random() * 20 - 10}deg)`;
    }

    btnNo.addEventListener("mouseover", dodgeNoButton);
    btnNo.addEventListener("mouseenter", dodgeNoButton);
    btnNo.addEventListener("click", (e) => {
        e.preventDefault();
        dodgeNoButton(e);
    });
    btnNo.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Prevent accidental clicks on mobile touch
        dodgeNoButton(e);
    });

    // --- 7. Screen 4: Celebration Confetti Loop ---
    const canvas = document.getElementById("confettiCanvas");
    const ctx = canvas.getContext("2d");
    let confettiParticles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);

    class Confetti {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height - canvas.height;
            this.size = Math.random() * 12 + 6;
            this.type = Math.random() > 0.45 ? "circle" : (Math.random() > 0.5 ? "heart" : "square");
            
            const palette = ["#ff3b7e", "#ff6b8b", "#ffd166", "#06d6a0", "#118ab2", "#ffb3c6", "#ffffff"];
            this.color = palette[Math.floor(Math.random() * palette.length)];
            
            this.speedX = Math.random() * 4 - 2;
            this.speedY = Math.random() * 4 + 3;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 4 - 2;
            this.opacity = Math.random() * 0.4 + 0.6;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;

            // Loop back to top if it goes off screen
            if (this.y > canvas.height) {
                this.y = -20;
                this.x = Math.random() * canvas.width;
                this.speedY = Math.random() * 4 + 3;
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            
            if (this.type === "heart") {
                this.drawHeart(this.x, this.y, this.size, this.color, (this.rotation * Math.PI) / 180);
            } else if (this.type === "circle") {
                ctx.beginPath();
                ctx.fillStyle = this.color;
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            }
            ctx.restore();
        }

        drawHeart(x, y, size, color, angle) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, -size / 4);
            ctx.bezierCurveTo(-size / 2, -size * 0.7, -size, -size * 0.3, -size, size / 5);
            ctx.bezierCurveTo(-size, size * 0.6, -size / 3, size, 0, size * 1.2);
            ctx.bezierCurveTo(size / 3, size, size, size * 0.6, size, size / 5);
            ctx.bezierCurveTo(size, -size * 0.3, size / 2, -size * 0.7, 0, -size / 4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    function initConfetti() {
        resizeCanvas();
        confettiParticles = [];
        for (let i = 0; i < 150; i++) {
            confettiParticles.push(new Confetti());
        }
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiParticles.forEach(p => {
            p.update();
            p.draw();
        });

        confettiAnimationId = requestAnimationFrame(animateConfetti);
    }

    // --- 8. Yes Button Action ---
    btnYes.addEventListener("click", () => {
        showScreen(screenCelebration);
        
        // Play sweet celebration effects
        initConfetti();
        animateConfetti();

        // Extra dynamic touch: Make background music louder/cleaner
        if (isMusicPlaying) {
            romanticTrack.volume = 1.0;
        } else {
            toggleMusic(true);
        }

        // Silent Webhook Notification trigger
        sendWebhookNotification("YES");
    });

    // --- 9. Restart/WhatsApp Button ---
    btnRestart.addEventListener("click", () => {
        const text = encodeURIComponent("Yes! ❤️ I Love You Too! 💍");
        const whatsappUrl = `https://api.whatsapp.com/send?phone=917318104815&text=${text}`;
        window.open(whatsappUrl, "_blank");
    });

    // --- 10. Voice Message Player (Proposer Audio) ---
    const proposerVoice = document.getElementById("proposerVoice");
    const playVoiceBtn = document.getElementById("playVoiceBtn");
    const voiceProgressContainer = document.getElementById("voiceProgressContainer");
    const voiceProgressFill = document.getElementById("voiceProgressFill");
    const voiceTime = document.getElementById("voiceTime");
    const proposerVoiceCard = document.getElementById("proposerVoiceCard");

    // Silent check if proposer voice note exists in local folders, show only if present
    fetch("voice.mp3", { method: "HEAD" })
        .then(response => {
            if (response.ok) {
                proposerVoiceCard.style.display = "block";
            } else {
                proposerVoiceCard.style.display = "none";
            }
        })
        .catch(() => {
            proposerVoiceCard.style.display = "none";
        });

    let isVoicePlaying = false;

    playVoiceBtn.addEventListener("click", () => {
        if (isVoicePlaying) {
            proposerVoice.pause();
            playVoiceBtn.innerText = "▶";
            isVoicePlaying = false;
        } else {
            // Mute background music slightly while listening to voice note
            if (isMusicPlaying) {
                romanticTrack.volume = 0.15;
            }
            proposerVoice.play().then(() => {
                playVoiceBtn.innerText = "⏸";
                isVoicePlaying = true;
            }).catch(err => {
                console.log("No audio file found or format error. Place voice.mp3 in the directory.", err);
                alert("Place a 'voice.mp3' file in the Proposal folder to play your own voice message!");
            });
        }
    });

    proposerVoice.addEventListener("timeupdate", () => {
        const progress = (proposerVoice.currentTime / proposerVoice.duration) * 100;
        voiceProgressFill.style.width = `${progress}%`;
        
        // Format time
        const currentMin = Math.floor(proposerVoice.currentTime / 60);
        const currentSec = Math.floor(proposerVoice.currentTime % 60).toString().padStart(2, '0');
        const durationMin = Math.floor(proposerVoice.duration / 60) || 0;
        const durationSec = (Math.floor(proposerVoice.duration % 60) || 0).toString().padStart(2, '0');
        
        voiceTime.innerText = `${currentMin}:${currentSec} / ${durationMin}:${durationSec}`;
    });

    proposerVoice.addEventListener("ended", () => {
        playVoiceBtn.innerText = "▶";
        isVoicePlaying = false;
        voiceProgressFill.style.width = "0%";
        // Restore background music volume
        if (isMusicPlaying) {
            romanticTrack.volume = 1.0;
        }
    });

    voiceProgressContainer.addEventListener("click", (e) => {
        const rect = voiceProgressContainer.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        if (proposerVoice.duration) {
            proposerVoice.currentTime = clickPosition * proposerVoice.duration;
        }
    });

    // --- 11. Live Voice Reaction Recorder ---
    const recordBtn = document.getElementById("recordBtn");
    const recordTimer = document.getElementById("recordTimer");
    const playbackContainer = document.getElementById("playbackContainer");
    const recordedPlayback = document.getElementById("recordedPlayback");
    const downloadVoiceBtn = document.getElementById("downloadVoiceBtn");

    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    let recordingStartTime = 0;
    let recordingTimerInterval = null;
    let latestAudioBlob = null; // Store the recorded audio blob for uploading

    recordBtn.addEventListener("click", async () => {
        if (!isRecording) {
            // Request microphone access
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];

                mediaRecorder.addEventListener("dataavailable", (event) => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", () => {
                    latestAudioBlob = new Blob(audioChunks, { type: "audio/webm" });
                    const audioUrl = URL.createObjectURL(latestAudioBlob);
                    recordedPlayback.src = audioUrl;
                    
                    // Set download link
                    downloadVoiceBtn.href = audioUrl;
                    downloadVoiceBtn.download = "Priyanka-voice-reply.webm";
                    
                    playbackContainer.style.display = "flex";
                });

                // Start recording
                mediaRecorder.start();
                isRecording = true;
                recordBtn.innerText = "Stop Recording ⏹️";
                recordBtn.classList.add("recording");
                
                // Start timer
                recordTimer.style.display = "inline-block";
                recordingStartTime = Date.now();
                recordingTimerInterval = setInterval(updateRecordingTimer, 1000);
            } catch (err) {
                console.error("Microphone access denied or error:", err);
                alert("Please allow microphone access to record your voice reaction! 🎤");
            }
        } else {
            // Stop recording
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
                // Stop microphone tracks
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
            
            isRecording = false;
            recordBtn.innerText = "Record Reply 🔴";
            recordBtn.classList.remove("recording");
            
            clearInterval(recordingTimerInterval);
            recordTimer.style.display = "none";
            recordTimer.innerText = "00:00";
        }
    });

    function updateRecordingTimer() {
        const elapsedMs = Date.now() - recordingStartTime;
        const elapsedSec = Math.floor(elapsedMs / 1000);
        const mins = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
        const secs = (elapsedSec % 60).toString().padStart(2, '0');
        recordTimer.innerText = `${mins}:${secs}`;
    }

    // Redirect to WhatsApp after initiating download
    downloadVoiceBtn.addEventListener("click", () => {
        if (!latestAudioBlob) {
            alert("No voice recording found!");
            return;
        }

        // Trigger manual browser download so she can attach it in WhatsApp
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(latestAudioBlob);
        downloadLink.download = "Priyanka-voice-reply.webm";
        downloadLink.click();

        // Send Webhook reaction update to your phone
        sendWebhookNotification("VOICE");

        // Redirect to WhatsApp with instructions to attach the downloaded audio file
        const text = encodeURIComponent("Yes! ❤️ I Love You Too! 💍 I recorded a voice message reaction for you! (Please check your downloads folder to attach and send the audio file) 🎤❤️");
        const whatsappUrl = `https://api.whatsapp.com/send?phone=917318104815&text=${text}`;
        
        // Wait 800ms for the download dialog to pop up, then open WhatsApp in a new tab
        setTimeout(() => {
            window.open(whatsappUrl, "_blank");
        }, 800);
    });

    // --- Helper: Webhook Notification Sender ---
    function sendWebhookNotification(type) {
        if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes("YOUR_DISCORD_WEBHOOK_URL")) {
            console.log("Discord Webhook URL not configured. Skipping background alert.");
            return;
        }

        let contentText = "";
        if (type === "YES") {
            contentText = "🎉 **GREAT NEWS!** 🎉\n\n**Priyanka** clicked **YES! ❤️** on your web proposal card! 💍💖";
        } else if (type === "VOICE") {
            contentText = "🎙️ **Voice Note Reply Recorded!**\n\n**Priyanka** just recorded a voice reply! She is sending it via WhatsApp attachment. 🎤";
        }

        const payload = {
            username: "Proposal Bot 💍",
            avatar_url: "https://i.imgur.com/8QG9v3v.png", // Heart avatar icon
            content: contentText
        };

        fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(() => console.log(`Background Webhook notification (${type}) sent successfully!`))
        .catch(err => console.error("Error sending webhook notification:", err));
    }
});
