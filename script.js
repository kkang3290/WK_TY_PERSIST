document.addEventListener('DOMContentLoaded', () => {
    // Removed unused elements related to old background animation
    // const typingText = document.querySelector('.typing-text');
    // const rain = document.querySelector('.rain');
    // const snow = document.querySelector('.snow');
    // const yang = document.querySelector('.yang');

    const canvas = document.getElementById('cherryTree');
    const ctx = canvas.getContext('2d');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');

    let animationFrameId = null; // Track animation frame
    let rejectCount = 0; // Add rejection counter

    // Image loading
    const cherryTreeImage = new Image();
    cherryTreeImage.src = 'cherry_tree.png'; // Make sure cherry_tree.png is in the same directory or specify path
    let imageLoaded = false;

    cherryTreeImage.onload = () => {
        imageLoaded = true;
        // Once image is loaded, resize and start animation immediately
        resizeCanvas();
        // Start the animation loop with the initial time
        // The image animation will now start immediately as delayDuration is skipped
        animate(performance.now());
    };

    // State
    let currentState = 'initial';

    // Text Content
    const initialMessage = [
        "我想写信给你，可这情愫长绵，我又难免羞涩，于是托这封信替我去讲。",
        "这些年，我去过许多地方，淋过重庆的雨，登过西安的城墙，饮过成都著名的桃花酿，",
        "在武汉也见过大雪一场，往后将会看看苏州的杨，可这所有的所有啊，都不及你让我心安，不及你生得漂亮。"
    ];
    const acceptedTitle = "我就知道你也喜欢我！";
    const acceptedMessage = [
        "❤️ 让我们一起去看看这个世界 ❤️",
        "重庆的雨、西安的城墙、成都的桃花酿、武汉的雪、苏州的杨...",
        "这一次，我们一起去看。"
    ];
    const titleText = "致亲爱的越";

    // Button properties
    let yesButton = { text: "接受", x: 0, y: 0, width: 0, height: 0, isHovered: false };
    let noButton = { text: "考虑一下", x: 0, y: 0, width: 0, height: 0, isHovered: false };

    // Layout properties
    let textArea = { x: 0, y: 0, width: 0, height: 0 };
    let titleY = 0;
    let buttonsY = 0;
    let heartX = 0;
    let heartY = 0;
    let heartSize = 60;

    // Set canvas size and calculate layout
    function resizeCanvas() {
        // Set canvas size to window size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Calculate layout dimensions and positions
        const isMobile = window.innerWidth <= 768;
        const textColumnWidth = isMobile ? canvas.width : canvas.width * 0.5;
        const padding = isMobile ? 20 : 40;

        textArea.x = padding;
        textArea.width = textColumnWidth - padding * 2;
        textArea.height = canvas.height - padding * 2;

        // Calculate positions
        titleY = padding + 60;
        heartY = titleY + 80;
        heartX = textColumnWidth * 0.5;
        let currentTextY = heartY + heartSize * 0.7 + padding;

        // Calculate text line heights
        ctx.font = `${isMobile ? 1 : 1.2}rem 'Ma Shan Zheng', cursive`;
        const lineHeight = isMobile ? 25 : 30;
        let totalTextHeight = 0;
        const messageToMeasure = currentState === 'initial' ? initialMessage : acceptedMessage;

        if (currentState === 'initial') {
            totalTextHeight += 60;
            totalTextHeight += heartSize * 0.7;
            messageToMeasure.forEach(paragraph => {
                const lines = getWrappedTextLines(ctx, paragraph, textArea.width);
                totalTextHeight += lines.length * lineHeight;
            });
            totalTextHeight += 150;
        } else {
            totalTextHeight += 60;
            messageToMeasure.forEach(paragraph => {
                const lines = getWrappedTextLines(ctx, paragraph, textArea.width);
                totalTextHeight += lines.length * lineHeight;
            });
            totalTextHeight += 50;
        }

        let startY = padding + (canvas.height - padding * 2 - totalTextHeight) * 0.5;
        startY = Math.max(padding, startY);

        titleY = startY + 40;
        heartY = titleY + 80;
        currentTextY = heartY + heartSize * 0.7 + padding;

        textArea.y = startY;
        textArea.height = canvas.height - startY - padding;

        buttonsY = currentTextY + totalTextHeight - (currentState === 'initial' ? 100 : 0);
        if (currentState === 'accepted') {
            buttonsY = canvas.height + 100;
        }

        // Calculate button dimensions
        ctx.font = `1.1rem 'Ma Shan Zheng', cursive`;
        const yesBtnPadding = { x: 30, y: 15 };
        const noBtnPadding = { x: 30, y: 15 }; // Increased padding for better touch target

        const yesBtnMetrics = ctx.measureText(yesButton.text);
        yesButton.width = yesBtnMetrics.width + yesBtnPadding.x * 2;
        yesButton.height = 25 + yesBtnPadding.y * 2;

        const noBtnMetrics = ctx.measureText(noButton.text);
        noButton.width = noBtnMetrics.width + noBtnPadding.x * 2;
        noButton.height = 25 + noBtnPadding.y * 2;

        const buttonGap = isMobile ? 30 : 20; // Increased gap for mobile
        const totalButtonWidth = yesButton.width + noButton.width + buttonGap;
        const startButtonX = textColumnWidth * 0.5 - totalButtonWidth * 0.5;

        yesButton.x = startButtonX;
        yesButton.y = buttonsY;

        noButton.x = startButtonX + yesButton.width + buttonGap;
        noButton.y = buttonsY;

        if (imageLoaded && scene) {
            scene.adjustTreePosition(canvas.width, canvas.height);
            scene.petals = [];
        }
    }

    // Helper function to wrap text
    function getWrappedTextLines(context, text, maxWidth) {
        const words = text.split('');
        const lines = [];
        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + word;
            if (context.measureText(testLine).width < maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    // Draw text content on canvas
    function drawTextContent(context, message, startY, maxWidth, lineHeight) {
        context.fillStyle = '#666';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.font = `${window.innerWidth <= 768 ? 1 : 1.2}rem 'Ma Shan Zheng', cursive`;

        let currentY = startY;
        message.forEach(paragraph => {
            const lines = getWrappedTextLines(context, paragraph, maxWidth);
            lines.forEach(line => {
                context.fillText(line, textArea.x, currentY);
                currentY += lineHeight;
            });
            currentY += lineHeight * 0.5;
        });
    }

    // Draw title on canvas
    function drawTitle(context, title, yPosition, maxWidth) {
        context.fillStyle = '#ff4b4b';
        context.textAlign = 'center';
        context.font = `${window.innerWidth <= 768 ? 2 : 2.5}rem 'Ma Shan Zheng', cursive`;
        context.shadowColor = 'rgba(0, 0, 0, 0.1)';
        context.shadowBlur = 4;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;

        const centerX = textArea.x + textArea.width * 0.5;
        context.fillText(title, centerX, yPosition);

        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
    }

    // Draw a rounded rectangle (for buttons)
    function drawRoundedRect(context, x, y, width, height, radius, color) {
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
        context.fill();
    }

    // Draw buttons on canvas
    function drawButtons(context) {
        const radius = 25;
        const textOffset = { x: 0, y: 0 };

        // Yes Button
        const yesBtnColor = yesButton.isHovered ? '#ff3333' : '#ff4b4b';
        drawRoundedRect(context, yesButton.x, yesButton.y, yesButton.width, yesButton.height, radius, yesBtnColor);
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = `1.1rem 'Ma Shan Zheng', cursive`;
        context.fillText(yesButton.text, yesButton.x + yesButton.width * 0.5, yesButton.y + yesButton.height * 0.5);

        // No Button
        const noBtnColor = noButton.isHovered ? '#e0e0e0' : '#f0f0f0';
        drawRoundedRect(context, noButton.x, noButton.y, noButton.width, noButton.height, radius, noBtnColor);
        context.fillStyle = '#666';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = `1.1rem 'Ma Shan Zheng', cursive`;
        context.fillText(noButton.text, noButton.x + noButton.width * 0.5, noButton.y + noButton.height * 0.5);
    }

    // Draw heart on canvas
    function drawHeart(context, x, y, size, color = '#ff4b4b') {
        const width = size;
        const height = size;
    
        context.save();
        context.fillStyle = color;
        context.beginPath();
    
        // 起点：底部尖端
        context.moveTo(x, y);
    
        // 左上圆弧
        context.bezierCurveTo(
            x - width * 0.5, y - height * 0.3,
            x - width , y + height * 0.5,
            x, y + height
        );
    
        // 右上圆弧
        context.bezierCurveTo(
            x + width, y + height * 0.5,
            x + width * 0.5, y - height * 0.3,
            x, y
        );
    
        context.closePath();
        context.fill();
        context.restore();
    }
    

    // Petal class for falling petals (watercolor style)
    class Petal {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = 4 + Math.random() * 3; // Slightly larger petals
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = Math.random() * 1 + 0.8;
            this.alpha = 0.8; // Start with some transparency
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.05; // Slower rotation
            this.sway = (Math.random() - 0.5) * 0.3; // Reduced sway
            this.swayTimer = Math.random() * Math.PI * 2;
        }

        update() {
            this.vy += 0.03; // Gravity
            this.vx += this.sway * Math.sin(this.swayTimer);
            this.swayTimer += 0.03; // Update sway timer

            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= 0.002; // Fade out slowly
            this.rotation += this.rotationSpeed;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = 'rgba(255, 182, 193, 0.6)'; // Semi-transparent pink
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            // Draw a slightly irregular shape for watercolor feel
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.8, 0, 0, Math.PI * 2); // Ellipse shape
            ctx.fill();
            ctx.restore();
        }
    }

    // Cherry Blossom Image Scene Manager
    class CherryBlossomScene {
        constructor() {
            this.petals = [];
            this.imageAnimationProgress = 1; // Set to 1 to show image immediately
            this.animationDuration = 3000;
            this.animationStartTime = null;

            this.treeFinalHeight = 0;
            this.treeFinalWidth = 0;
            this.treeFinalX = 0;
            this.treeFinalY = 0;
        }

        adjustTreePosition(canvasWidth, canvasHeight){
             if (imageLoaded) {
                 // Calculate dimensions and position to fit within the right half of canvas while maintaining aspect ratio
                 const imageAspectRatio = cherryTreeImage.width / cherryTreeImage.height;
                 const availableWidth = canvasWidth * 0.5; // Right half
                 const availableHeight = canvasHeight; // Full height
                 const availableAspectRatio = availableWidth / availableHeight;

                 let drawWidth, drawHeight;

                 if (availableAspectRatio > imageAspectRatio) {
                     // Available area is wider than image, fit by height
                     drawHeight = availableHeight * 0.9; // Use 90% of available height
                     drawWidth = drawHeight * imageAspectRatio;
                 } else {
                     // Available area is taller or same aspect ratio as image, fit by width
                     drawWidth = availableWidth * 0.9; // Use 90% of available width
                     drawHeight = drawWidth / imageAspectRatio;
                 }

                 this.treeFinalWidth = drawWidth;
                 this.treeFinalHeight = drawHeight;
                 this.treeFinalX = canvasWidth * 0.5 + (availableWidth - drawWidth) * 0.5; // Position in the center of the right half
                 this.treeFinalY = canvasHeight * 0.95 - drawHeight; // Position base slightly above bottom of the screen
             }
        }

        addFallingPetal() {
            if (imageLoaded && this.imageAnimationProgress >= 1) {
                // Generate petals across the entire canvas width
                const startX = Math.random() * canvas.width;
                const startY = Math.random() * (canvas.height * 0.3); // Start from top 30% of canvas
                
                // Only add petals if within canvas bounds
                if (startX >= 0 && startX <= canvas.width && startY >= 0 && startY <= canvas.height) {
                    this.petals.push(new Petal(startX, startY));
                }
            }
        }

        update(currentTime) {
            if (!this.animationStartTime && imageLoaded) {
                this.animationStartTime = currentTime;
            }

            if (imageLoaded && this.animationStartTime !== null) {
                // Remove animation delay, set progress to 1 immediately
                this.imageAnimationProgress = 1;

                if (this.imageAnimationProgress >= 1) {
                    if (Math.random() < 0.1) {
                        this.addFallingPetal();
                    }
                }
            }

            // Update petals regardless of image animation progress
            for (let i = 0; i < this.petals.length; i++) {
                this.petals[i].update();
                if (this.petals[i].alpha <= 0 || this.petals[i].y > canvas.height + 50) {
                    this.petals.splice(i, 1);
                    i--;
                }
            }
        }

        draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw bottom glow effect (centered horizontally, positioned below tree base)
            const gradient = ctx.createRadialGradient(this.treeFinalX + this.treeFinalWidth * 0.5, this.treeFinalY + this.treeFinalHeight, 0, this.treeFinalX + this.treeFinalWidth * 0.5, this.treeFinalY + this.treeFinalHeight, Math.min(this.treeFinalWidth, this.treeFinalHeight) * 0.3);
            // gradient.addColorStop(0, 'rgba(255, 105, 180, 0.4)'); // Pink glow (reduced alpha)
            gradient.addColorStop(1, 'rgba(255, 105, 180, 0)');
            ctx.fillStyle = gradient;
            // Draw glow area relative to the tree's base
            ctx.fillRect(this.treeFinalX - this.treeFinalWidth * 0.2, this.treeFinalY + this.treeFinalHeight - Math.min(this.treeFinalWidth, this.treeFinalHeight) * 0.1, this.treeFinalWidth * 1.4, Math.min(this.treeFinalWidth, this.treeFinalHeight) * 0.4);


            // Draw the cherry tree image with animation
            if (imageLoaded && this.imageAnimationProgress > 0) {
                // Calculate the source and destination rectangles for drawing
                const sourceWidth = cherryTreeImage.width;
                const sourceHeight = cherryTreeImage.height * this.imageAnimationProgress;
                const sourceX = 0;
                const sourceY = cherryTreeImage.height - sourceHeight; // Draw from the bottom of the source image

                const destWidth = this.treeFinalWidth;
                const destHeight = this.treeFinalHeight * this.imageAnimationProgress;
                const destX = this.treeFinalX;
                const destY = this.treeFinalY + (this.treeFinalHeight - destHeight); // Position on canvas to draw from bottom up

                ctx.drawImage(
                    cherryTreeImage, // Image source
                    sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle (x, y, width, height)
                    destX, destY, destWidth, destHeight // Destination rectangle (x, y, width, height)
                );
            }

            // Draw falling petals on top
            this.petals.forEach(petal => petal.draw());
        }
    }

    // Create scene instance
    let scene = new CherryBlossomScene();

    // Animation loop
    // Use performance.now() for more accurate time tracking
    function animate(currentTime) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#f3e7e9');
        gradient.addColorStop(1, '#e3eeff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw cherry blossom scene
        scene.update(currentTime);
        scene.draw();

        // Draw text content, heart, and buttons based on state
        if (currentState === 'initial') {
            drawTitle(ctx, titleText, titleY, textArea.width);
            drawHeart(ctx, heartX, heartY, heartSize);
            const lineHeight = window.innerWidth <= 768 ? 25 : 30;
            drawTextContent(ctx, initialMessage, heartY + heartSize * 0.7 + (window.innerWidth <= 768 ? 10 : 20), textArea.width, lineHeight);
            drawButtons(ctx);
        } else if (currentState === 'accepted') {
            drawTitle(ctx, acceptedTitle, titleY, textArea.width);
            const lineHeight = window.innerWidth <= 768 ? 25 : 30;
            drawTextContent(ctx, acceptedMessage, titleY + 60 + (window.innerWidth <= 768 ? 10 : 20), textArea.width, lineHeight);
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // Handle resize
    window.addEventListener('resize', resizeCanvas);

    // Handle mouse move for button hover effects
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        let yesHovered = mouseX > yesButton.x && mouseX < yesButton.x + yesButton.width && mouseY > yesButton.y && mouseY < yesButton.y + yesButton.height;
        let noHovered = mouseX > noButton.x && mouseX < noButton.x + noButton.width && mouseY > noButton.y && mouseY < noButton.y + noButton.height;

        if (yesHovered !== yesButton.isHovered) {
            yesButton.isHovered = yesHovered;
        }
        if (noHovered !== noButton.isHovered) {
            noButton.isHovered = noHovered;
            if (noButton.isHovered && currentState === 'initial') {
                rejectCount++;
                if (rejectCount >= 3) {
                    noButton.text = "我同意";
                } else {
                    // Ensure button stays within visible area on mobile
                    const isMobile = window.innerWidth <= 768;
                    const maxX = isMobile ? canvas.width - noButton.width - 20 : canvas.width * 0.5 - noButton.width - 20;
                    const maxY = canvas.height - noButton.height - 20;
                    const minX = isMobile ? 20 : 20;
                    const minY = 20;
                    
                    const x = Math.min(Math.max(Math.random() * maxX, minX), maxX);
                    const y = Math.min(Math.max(Math.random() * maxY, minY), maxY);
                    
                    noButton.x = x;
                    noButton.y = y;
                }
            }
        }
    });

    // Handle clicks on canvas for buttons
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (currentState === 'initial') {
            const yesClicked = mouseX > yesButton.x && mouseX < yesButton.x + yesButton.width && 
                             mouseY > yesButton.y && mouseY < yesButton.y + yesButton.height;
            const noClicked = mouseX > noButton.x && mouseX < noButton.x + noButton.width && 
                            mouseY > noButton.y && mouseY < noButton.y + noButton.height;

            if (yesClicked || (noClicked && rejectCount >= 3)) {
                currentState = 'accepted';
                createFireworks();
            }
        }
    });

    // Add touch event handling for mobile
    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault(); // Prevent default touch behavior
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;

        if (currentState === 'initial') {
            const yesTouched = touchX > yesButton.x && touchX < yesButton.x + yesButton.width && 
                             touchY > yesButton.y && touchY < yesButton.y + yesButton.height;
            const noTouched = touchX > noButton.x && touchX < noButton.x + noButton.width && 
                            touchY > noButton.y && touchY < noButton.y + noButton.height;

            if (yesTouched || (noTouched && rejectCount >= 3)) {
                currentState = 'accepted';
                createFireworks();
            } else if (noTouched) {
                rejectCount++;
                if (rejectCount >= 2) {
                    noButton.text = "我同意";
                } else {
                    // Ensure button stays within visible area on mobile
                    const maxX = canvas.width - noButton.width - 20;
                    const maxY = canvas.height - noButton.height - 20;
                    const minX = 20;
                    const minY = 20;
                    
                    const x = Math.min(Math.max(Math.random() * maxX, minX), maxX);
                    const y = Math.min(Math.max(Math.random() * maxY, minY), maxY);
                    
                    noButton.x = x;
                    noButton.y = y;
                }
            }
        }
    });

    // 烟花效果
    function createFireworks() {
        for (let i = 0; i < 50; i++) {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * 100 + 'vw';
            firework.style.animationDuration = (Math.random() * 3 + 2) + 's';
            firework.style.animationDelay = (Math.random() * 2) + 's';
            document.body.appendChild(firework);

            setTimeout(() => {
                firework.remove();
            }, 5000);
        }
    }

    // Initial setup: start loading image. Resize and animation will start on image load.
    // resizeCanvas(); // Called on image load
    // animate(0); // Called on image load
}); 