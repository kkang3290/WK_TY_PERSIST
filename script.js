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
    cherryTreeImage.src = 'cherry_tree.png';
    const loverImage = new Image();
    loverImage.src = 'lover.png';
    const sunImage = new Image();
    sunImage.src = 'sun.png';
    const moonImage = new Image();
    moonImage.src = 'moon.png';
    const arrowImage = new Image();
    arrowImage.src = 'arrow.png';
    const riderImage = new Image();
    riderImage.src = 'rider.gif';
    const cloudImage = new Image();
    cloudImage.src = 'cloud.gif';
    const flowerImage = new Image();
    flowerImage.src = 'flower.webp';
    let imageLoaded = false;
    let loverImageLoaded = false;
    let sunImageLoaded = false;
    let moonImageLoaded = false;
    let arrowImageLoaded = false;
    let riderImageLoaded = false;
    let cloudImageLoaded = false;
    let flowerImageLoaded = false;

    // Load landscape images
    const landscapeImages = [];
    const landscapeImageNames = ['beijing', 'shanghai', 'xizang', 'guilin'];
    let landscapeImagesLoaded = 0;
    let currentLandscapeIndex = 0;

    landscapeImageNames.forEach(name => {
        const img = new Image();
        img.src = `landscape/${name}.png`;
        img.onload = () => {
            landscapeImagesLoaded++;
            console.log(`Loaded landscape image: ${name}.png`);
            if (landscapeImagesLoaded === landscapeImageNames.length) {
                console.log('All landscape images loaded');
            }
        };
        img.onerror = () => {
            console.error(`Failed to load landscape image: ${name}.png`);
        };
        landscapeImages.push(img);
    });

    arrowImage.onload = () => {
        arrowImageLoaded = true;
    };

    cherryTreeImage.onload = () => {
        imageLoaded = true;
        resizeCanvas();
        animate(performance.now());
    };

    loverImage.onload = () => {
        loverImageLoaded = true;
    };

    sunImage.onload = () => {
        sunImageLoaded = true;
    };

    moonImage.onload = () => {
        moonImageLoaded = true;
    };

    riderImage.onload = () => {
        riderImageLoaded = true;
    };

    cloudImage.onload = () => {
        cloudImageLoaded = true;
    };

    flowerImage.onload = () => {
        flowerImageLoaded = true;
    };

    // State
    let currentState = 'pre-initial';
    let journeyStartTime = null;

    // Text Content
    const preInitialMessage = [
        "亲爱的越：",
        "2024年5月22日，我们第一次见面，期间我们经历了许多甜蜜，",
        "你知道吗？二月我们只有四天没有聊天，三月仅一天，四月是全勤，",
        "它似乎早就不是闲聊，而且暗藏着情愫。"
    ];
    const initialMessage = [
        "我喜欢你，可这情愫长绵，我又难免羞涩，于是托这封信替我去讲。",
        "这些年，我去过许多地方，淋过重庆的雨，登过西安的城墙，饮过成都著名的桃花酿，",
        "在武汉也见过大雪一场，往后将会看看苏州的杨，可这所有的所有啊，都不及你让我心安，不及你生得漂亮。"
    ];
    const acceptedTitle = "我就知道你也喜欢我！";
    const acceptedMessage = [
        "❤️ 让我们一起去看看这个世界 ❤️",
        "重庆的雨、西安的城墙、成都的桃花酿、武汉的雪、苏州的杨...",
        "还有西藏的天山、北京的长城、上海的滩、桂林的山水...",
        "这一次，我们一起去看。"
    ];
    const titleText = "致亲爱的越";

    // Button properties
    let yesButton = { text: "接受", x: 0, y: 0, width: 0, height: 0, isHovered: false };
    let noButton = { text: "考虑一下", x: 0, y: 0, width: 0, height: 0, isHovered: false };
    let startButton = { text: "出发！", x: 0, y: 0, width: 0, height: 0, isHovered: false };
    let continueButton = { text: "继续", x: 0, y: 0, width: 0, height: 0, isHovered: false };

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
        const padding = isMobile ? canvas.width * 0.05 : canvas.width * 0.04;

        textArea.x = padding;
        textArea.width = textColumnWidth - padding * 2;
        textArea.height = canvas.height - padding * 2;

        // Calculate positions
        titleY = padding + canvas.height * 0.08;
        heartY = titleY + canvas.height * 0.1;
        heartX = textColumnWidth * 0.5;
        let currentTextY = heartY + heartSize * 0.7 + padding;

        // Calculate text line heights
        ctx.font = `${isMobile ? 1 : 1.2}rem 'Ma Shan Zheng', cursive`;
        const lineHeight = isMobile ? canvas.height * 0.03 : canvas.height * 0.035;
        let totalTextHeight = 0;
        const messageToMeasure = currentState === 'pre-initial' ? preInitialMessage : 
                               currentState === 'initial' ? initialMessage : acceptedMessage;

        if (currentState === 'pre-initial') {
            totalTextHeight += canvas.height * 0.08;
            messageToMeasure.forEach(paragraph => {
                const lines = getWrappedTextLines(ctx, paragraph, textArea.width);
                totalTextHeight += lines.length * lineHeight;
            });
            totalTextHeight += canvas.height * 0.12;
        } else if (currentState === 'initial') {
            totalTextHeight += canvas.height * 0.08;
            totalTextHeight += heartSize * 0.7;
            messageToMeasure.forEach(paragraph => {
                const lines = getWrappedTextLines(ctx, paragraph, textArea.width);
                totalTextHeight += lines.length * lineHeight;
            });
            totalTextHeight += canvas.height * 0.15;
        } else {
            totalTextHeight += canvas.height * 0.08;
            messageToMeasure.forEach(paragraph => {
                const lines = getWrappedTextLines(ctx, paragraph, textArea.width);
                totalTextHeight += lines.length * lineHeight;
            });
            totalTextHeight += canvas.height * 0.06;
        }

        let startY = padding + (canvas.height - padding * 2 - totalTextHeight) * 0.5;
        startY = Math.max(padding, startY);

        titleY = startY + canvas.height * 0.05;
        heartY = titleY + canvas.height * 0.1;
        currentTextY = heartY + heartSize * 0.7 + padding;

        textArea.y = startY;
        textArea.height = canvas.height - startY - padding;

        // Calculate button dimensions
        ctx.font = `1.1rem 'Ma Shan Zheng', cursive`;
        const btnPadding = { 
            x: canvas.width * 0.03,
            y: canvas.height * 0.02
        };

        const yesBtnMetrics = ctx.measureText(yesButton.text);
        yesButton.width = yesBtnMetrics.width + btnPadding.x * 2;
        yesButton.height = canvas.height * 0.04 + btnPadding.y * 2;

        const noBtnMetrics = ctx.measureText(noButton.text);
        noButton.width = noBtnMetrics.width + btnPadding.x * 2;
        noButton.height = canvas.height * 0.04 + btnPadding.y * 2;

        const startBtnMetrics = ctx.measureText(startButton.text);
        startButton.width = startBtnMetrics.width + btnPadding.x * 2;
        startButton.height = canvas.height * 0.04 + btnPadding.y * 2;

        const continueBtnMetrics = ctx.measureText(continueButton.text);
        continueButton.width = continueBtnMetrics.width + btnPadding.x * 2;
        continueButton.height = canvas.height * 0.04 + btnPadding.y * 2;

        const buttonGap = isMobile ? canvas.width * 0.04 : canvas.width * 0.02;
        const totalButtonWidth = yesButton.width + noButton.width + buttonGap;
        const startButtonX = textColumnWidth * 0.5 - totalButtonWidth * 0.5;

        // Position buttons based on state
        if (currentState === 'pre-initial') {
            // Position continue button
            continueButton.x = canvas.width * 0.5 - continueButton.width * 0.5;
            continueButton.y = canvas.height * 0.8;
        } else if (currentState === 'initial') {
            // Position yes/no buttons
            yesButton.x = canvas.width * 0.5 - totalButtonWidth * 0.5;
            yesButton.y = canvas.height * 0.8;
            noButton.x = yesButton.x + yesButton.width + buttonGap;
            noButton.y = yesButton.y;
        } else if (currentState === 'accepted') {
            // Position start button
            startButton.x = canvas.width * 0.5 - startButton.width * 0.5;
            startButton.y = canvas.height * 0.8;
        }

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

        if (currentState === 'initial') {
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
        } else if (currentState === 'accepted') {
            // Start Button
            const startBtnColor = startButton.isHovered ? '#ff3333' : '#ff4b4b';
            drawRoundedRect(context, startButton.x, startButton.y, startButton.width, startButton.height, radius, startBtnColor);
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.font = `1.1rem 'Ma Shan Zheng', cursive`;
            context.fillText(startButton.text, startButton.x + startButton.width * 0.5, startButton.y + startButton.height * 0.5);
        }
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

    // Day/Night Cycle Manager
    class DayNightCycle {
        constructor() {
            this.isDay = true;
            this.transitionProgress = 0;
            this.transitionDuration = 5 * 1000; // 5 seconds
            this.lastTransitionTime = performance.now();
            this.fadeDuration = 6000; // 6 seconds fade
            this.fadeStartTime = null;
            this.isFading = false;
        }

        update(currentTime) {
            const elapsed = currentTime - this.lastTransitionTime;
            if (elapsed >= this.transitionDuration) {
                if (!this.isFading) {
                    this.isFading = true;
                    this.fadeStartTime = currentTime;
                }
                
                const fadeElapsed = currentTime - this.fadeStartTime;
                if (fadeElapsed >= this.fadeDuration) {
                    this.isDay = !this.isDay;
                    this.lastTransitionTime = currentTime;
                    this.transitionProgress = 0;
                    this.isFading = false;
                    // Change landscape image when day/night changes
                    currentLandscapeIndex = (currentLandscapeIndex + 1) % landscapeImageNames.length;
                } else {
                    this.transitionProgress = fadeElapsed / this.fadeDuration;
                }
            } else {
                this.transitionProgress = elapsed / this.transitionDuration;
            }
        }

        draw(ctx, canvasWidth, canvasHeight) {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
            
            if (this.isDay) {
                // Day to night transition with smoother colors
                const dayColor = `rgba(135, 206, 235, ${1 - this.transitionProgress})`;
                const nightColor = `rgba(25, 25, 112, ${this.transitionProgress})`;
                gradient.addColorStop(0, this.isFading ? dayColor : '#87CEEB');
                gradient.addColorStop(0.5, this.isFading ? 
                    `rgba(${135 + (25 - 135) * this.transitionProgress}, 
                          ${206 + (25 - 206) * this.transitionProgress}, 
                          ${235 + (112 - 235) * this.transitionProgress}, 
                          ${0.8 + 0.2 * this.transitionProgress})` : 
                    '#87CEEB');
                gradient.addColorStop(1, this.isFading ? nightColor : '#FFFFFF');
            } else {
                // Night to day transition with smoother colors
                const nightColor = `rgba(25, 25, 112, ${1 - this.transitionProgress})`;
                const dayColor = `rgba(135, 206, 235, ${this.transitionProgress})`;
                gradient.addColorStop(0, this.isFading ? nightColor : '#191970');
                gradient.addColorStop(0.5, this.isFading ? 
                    `rgba(${25 + (135 - 25) * this.transitionProgress}, 
                          ${25 + (206 - 25) * this.transitionProgress}, 
                          ${112 + (235 - 112) * this.transitionProgress}, 
                          ${0.8 + 0.2 * this.transitionProgress})` : 
                    '#191970');
                gradient.addColorStop(1, this.isFading ? dayColor : '#000033');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
    }

    // Weather Effect Manager
    class WeatherEffect {
        constructor() {
            this.weatherTypes = ['sunny', 'rainy', 'snowy', 'cloudy'];
            this.currentWeather = 'sunny';
            this.lastWeatherChange = performance.now();
            this.weatherDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            this.moonPhase = 0;
            this.moonPhaseChangeTime = performance.now();
            this.moonPhaseDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
            this.sunSize = 100;  // Size of sun image
            this.moonSize = 80;  // Size of moon image
            this.landscapeSize = 300; // Size of landscape image
        }

        update(currentTime) {
            // Update moon phase
            const moonElapsed = currentTime - this.moonPhaseChangeTime;
            if (moonElapsed >= this.moonPhaseDuration) {
                this.moonPhaseChangeTime = currentTime;
            }
            this.moonPhase = (moonElapsed % this.moonPhaseDuration) / this.moonPhaseDuration;

            // Change weather every 24 hours
            if (currentTime - this.lastWeatherChange >= this.weatherDuration) {
                const oldWeather = this.currentWeather;
                this.currentWeather = this.weatherTypes[Math.floor(Math.random() * this.weatherTypes.length)];
                this.lastWeatherChange = currentTime;

                // 如果天气变为下雨，创建雨滴效果
                if (this.currentWeather === 'rainy' && oldWeather !== 'rainy') {
                    createRaindrops();
                }
                // 如果天气从下雨变为其他，移除雨滴效果
                else if (oldWeather === 'rainy' && this.currentWeather !== 'rainy') {
                    const raindrops = document.querySelectorAll('.raindrop');
                    raindrops.forEach(drop => drop.remove());
                }
            }
        }

        drawSun(ctx) {
            if (sunImageLoaded) {
                const x = canvas.width * 0.1;  // 10% from left
                const y = canvas.height * 0.1; // 10% from top
                ctx.drawImage(sunImage, x, y, this.sunSize, this.sunSize);
            }
        }

        drawMoon(ctx) {
            if (moonImageLoaded) {
                const x = canvas.width * 0.1;  // 10% from left
                const y = canvas.height * 0.1; // 10% from top
                ctx.drawImage(moonImage, x, y, this.moonSize, this.moonSize);
            }
        }

        drawLandscape(ctx) {
            if (landscapeImagesLoaded === landscapeImageNames.length) {
                const x = canvas.width - this.landscapeSize - 200; // 20px from right edge
                const y = 20; // 20px from top
                ctx.drawImage(landscapeImages[currentLandscapeIndex], x, y, this.landscapeSize*1.5, this.landscapeSize*1.5);
            }
        }

        drawStars(ctx) {
            if (!dayNightCycle.isDay) {
                const starCount = 50; // 减少星星数量

                for (let i = 0; i < starCount; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * (canvas.height * 0.4); // 减少星星分布范围
                    const size = Math.random() * 1.5 + 0.5; // 减小星星大小
                    const brightness = Math.random() * 0.3 + 0.2; // 降低亮度
                    
                    ctx.globalAlpha = brightness;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            }
        }

        drawArrow(ctx) {
            if (arrowImageLoaded) {
                const x = canvas.width * 0.5 - 50; // Center horizontally
                const y = canvas.height * 0.5 - 50; // Center vertically
                ctx.drawImage(arrowImage, x, y, 250, 250); // Size of arrow image
            }
        }

        draw(ctx) {
            // Draw landscape first
            this.drawLandscape(ctx);

            // Draw arrow in center
            this.drawArrow(ctx);

            // Draw sun or moon based on day/night cycle
            if (dayNightCycle.isDay && this.currentWeather === 'sunny') {
                this.drawSun(ctx);
            } else if (!dayNightCycle.isDay) {
                this.drawMoon(ctx);
                this.drawStars(ctx);
            }
        }
    }

    // Weather Particles
    class SnowFlake {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 3 + 2;
            this.speed = Math.random() * 2 + 1;
            this.swing = Math.random() * 0.5;
            this.swingOffset = Math.random() * Math.PI * 2;
        }

        update() {
            this.y += this.speed;
            this.x += Math.sin(this.swingOffset) * this.swing;
            this.swingOffset += 0.02;
        }

        isDead() {
            return this.y > canvas.height;
        }

        draw(ctx) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Cloud class for journey screen
    class Cloud {
        constructor(x, y, speed) {
            this.x = x;
            this.y = y;
            this.speed = speed;
            this.width = Math.min(window.innerWidth, window.innerHeight) * 0.3;  // 30% of smaller dimension
            this.height = this.width * 0.5; // Maintain aspect ratio
        }

        update() {
            this.x += this.speed;
            if (this.x > canvas.width) {
                this.x = -this.width;
            }
        }

        draw(ctx) {
            if (cloudImageLoaded) {
                ctx.drawImage(cloudImage, this.x, this.y, this.width, this.height);
            }
        }
    }

    // Lover class for drawing the lover character
    class Lover {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.width = 550;  // Adjust size as needed
            this.height = 550; // Adjust size as needed
        }

        update(canvasWidth, canvasHeight) {
            this.x = canvasWidth * 0.1;
            this.y = canvasHeight * 0.5;
        }

        draw(ctx) {
            if (loverImageLoaded) {
                ctx.drawImage(loverImage, this.x, this.y, this.width, this.height);
            }
        }
    }

    // Create instances of new managers
    let dayNightCycle = new DayNightCycle();
    let weatherEffect = new WeatherEffect();
    let lover = new Lover();

    // Journey Scene Manager
    class JourneyScene {
        constructor() {
            this.clouds = [];
            this.initializeClouds();
        }

        initializeClouds() {
            const isMobile = window.innerWidth <= 768;
            const cloudSize = Math.min(canvas.width, canvas.height) * 0.3;
            
            // Create clouds with relative positioning
            const cloudPositions = [
                { x: -cloudSize, y: canvas.height * 0.1 },     // Left cloud
                { x: canvas.width * 0.2, y: canvas.height * 0.15 },   // Left middle
                { x: canvas.width + 100 + cloudSize, y: canvas.height * 0.08 },    // Right middle
                { x: canvas.width + 100 + cloudSize * 4, y: canvas.height * 0.12 }     // Right cloud
            ];

            cloudPositions.forEach(pos => {
                const speed = Math.random() * 0.3 + 0.1;
                this.clouds.push(new Cloud(pos.x, pos.y, speed));
            });
        }

        update() {
            this.clouds.forEach(cloud => cloud.update());
        }

        draw(ctx) {
            this.clouds.forEach(cloud => cloud.draw(ctx));
        }
    }

    // Create journey scene instance
    let journeyScene = new JourneyScene();

    // Create rider image element
    const riderElement = document.createElement('img');
    riderElement.src = 'rider.gif';
    riderElement.style.position = 'absolute';
    riderElement.style.zIndex = '2';
    riderElement.style.pointerEvents = 'none';
    riderElement.style.display = 'none'; // Initially hidden
    document.body.appendChild(riderElement);

    // Create flower image element
    const flowerElement = document.createElement('img');
    flowerElement.src = 'flower.webp';
    flowerElement.style.position = 'absolute';
    flowerElement.style.zIndex = '2';
    flowerElement.style.pointerEvents = 'none';
    flowerElement.style.display = 'none'; // Initially hidden
    document.body.appendChild(flowerElement);

    // Animation loop
    function animate(currentTime) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (currentState === 'pre-initial') {
            riderElement.style.display = 'none'; // Hide rider
            // Show and position flower
            const isMobile = window.innerWidth <= 768;
            const flowerSize = isMobile ? 
                Math.min(canvas.width, canvas.height) * 0.6 : // 60% on mobile
                Math.min(canvas.width, canvas.height) * 0.4; // 40% on desktop
            flowerElement.style.display = 'block';
            flowerElement.style.width = `${flowerSize}px`;
            flowerElement.style.height = `${flowerSize}px`;
            
            // Adjust flower position based on screen size
            if (isMobile) {
                flowerElement.style.right = `${canvas.width * 0.05}px`; // 5% from right
                flowerElement.style.bottom = `${canvas.height * 0.15}px`; // 15% from bottom
            } else {
                flowerElement.style.right = `${canvas.width * 0.2}px`; // 20% from right
                flowerElement.style.bottom = `${canvas.height * 0.2}px`; // 20% from bottom
            }

            // Draw background gradient for pre-initial state
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#f3e7e9');
            gradient.addColorStop(1, '#e3eeff');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw text content more towards center
            const textX = isMobile ? 
                canvas.width * 0.1 : // 10% from left on mobile
                canvas.width * 0.25; // 25% from left on desktop
            const textY = isMobile ? 
                canvas.height * 0.15 : // 15% from top on mobile
                canvas.height * 0.25; // 25% from top on desktop
            const textWidth = isMobile ? 
                canvas.width * 0.8 : // 80% width on mobile
                canvas.width * 0.35; // 35% width on desktop

            // Draw title
            ctx.fillStyle = '#ff4b4b';
            ctx.textAlign = 'left';
            ctx.font = `${isMobile ? 1.8 : 2.5}rem 'Ma Shan Zheng', cursive`;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillText("致亲爱的越", textX, textY);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Draw message
            const lineHeight = isMobile ? 22 : 30;
            ctx.fillStyle = '#666';
            ctx.font = `${isMobile ? 1 : 1.2}rem 'Ma Shan Zheng', cursive`;
            let currentY = textY + (isMobile ? canvas.height * 0.05 : canvas.height * 0.08); // 5% or 8% of screen height
            preInitialMessage.forEach(paragraph => {
                const lines = getWrappedTextLines(ctx, paragraph, textWidth);
                lines.forEach(line => {
                    ctx.fillText(line, textX, currentY);
                    currentY += lineHeight;
                });
                currentY += lineHeight * 0.5;
            });
            
            // Draw continue button
            const radius = 25;
            const continueBtnColor = continueButton.isHovered ? '#ff3333' : '#ff4b4b';
            drawRoundedRect(ctx, continueButton.x, continueButton.y, continueButton.width, continueButton.height, radius, continueBtnColor);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `${isMobile ? 1 : 1.1}rem 'Ma Shan Zheng', cursive`;
            ctx.fillText(continueButton.text, continueButton.x + continueButton.width * 0.5, continueButton.y + continueButton.height * 0.5);
        } else if (currentState === 'initial') {
            flowerElement.style.display = 'none';
            riderElement.style.display = 'none';
            
            // Draw background gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#f3e7e9');
            gradient.addColorStop(1, '#e3eeff');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw cherry blossom scene
            scene.update(currentTime);
            scene.draw();

            // Draw text content and heart
            drawTitle(ctx, titleText, titleY, textArea.width);
            drawHeart(ctx, heartX, heartY * 0.9, heartSize);
            const lineHeight = window.innerWidth <= 768 ? 25 : 30;
            drawTextContent(ctx, initialMessage, heartY + heartSize * 0.7 + (window.innerWidth <= 768 ? 10 : 20), textArea.width, lineHeight);
            
            // Draw buttons
            const radius = 25;
            
            // Yes Button
            const yesBtnColor = yesButton.isHovered ? '#ff3333' : '#ff4b4b';
            drawRoundedRect(ctx, yesButton.x, yesButton.y, yesButton.width, yesButton.height, radius, yesBtnColor);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `1.1rem 'Ma Shan Zheng', cursive`;
            ctx.fillText(yesButton.text, yesButton.x + yesButton.width * 0.5, yesButton.y + yesButton.height * 0.5);

            // No Button
            const noBtnColor = noButton.isHovered ? '#e0e0e0' : '#f0f0f0';
            drawRoundedRect(ctx, noButton.x, noButton.y, noButton.width, noButton.height, radius, noBtnColor);
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `1.1rem 'Ma Shan Zheng', cursive`;
            ctx.fillText(noButton.text, noButton.x + noButton.width * 0.5, noButton.y + noButton.height * 0.5);
        } else if (currentState === 'accepted') {
            riderElement.style.display = 'none';
            // Update and draw day/night cycle
            dayNightCycle.update(currentTime);
            dayNightCycle.draw(ctx, canvas.width, canvas.height);

            // Update and draw weather effects
            weatherEffect.update(currentTime);
            weatherEffect.draw(ctx);

            // Update and draw lover
            lover.update(canvas.width, canvas.height);
            lover.draw(ctx);
            
            // Draw text content
            drawTitle(ctx, acceptedTitle, titleY, textArea.width);
            const lineHeight = window.innerWidth <= 768 ? 25 : 30;
            drawTextContent(ctx, acceptedMessage, titleY + 60 + (window.innerWidth <= 768 ? 10 : 20), textArea.width, lineHeight);
            drawButtons(ctx);
        } else if (currentState === 'journey') {
            riderElement.style.display = 'block';
            // Draw background gradient for journey state
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#87CEEB');  // Sky blue
            gradient.addColorStop(1, '#E0F7FF');  // Light blue
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Only draw if images are loaded
            if (cloudImageLoaded) {
                journeyScene.update();
                journeyScene.draw(ctx);

                // Update rider position with relative sizing
                const isMobile = window.innerWidth <= 768;
                const riderSize = isMobile ? 
                    Math.min(canvas.width, canvas.height) * 0.4 : // 40% on mobile
                    Math.min(canvas.width, canvas.height) * 0.3; // 30% on desktop
                
                const x = canvas.width * 0.5 - riderSize * 0.5; // Center horizontally
                const y = canvas.height * 0.6 - riderSize * 0.5; // Position at 60% of screen height
                
                riderElement.style.width = `${riderSize}px`;
                riderElement.style.height = `${riderSize}px`;
                riderElement.style.left = `${x}px`;
                riderElement.style.top = `${y}px`;

                // Draw timer text with relative positioning
                if (journeyStartTime) {
                    const elapsedSeconds = Math.floor((performance.now() - journeyStartTime) / 1000);
                    ctx.fillStyle = '#333';
                    ctx.font = `${isMobile ? 1.5 : 2}rem "Ma Shan Zheng", cursive`;
                    ctx.textAlign = 'center';
                    ctx.fillText(
                        `我们已经一起度过了 ${elapsedSeconds} 秒`, 
                        canvas.width * 0.5, 
                        canvas.height * 0.3 // Position text at 30% of screen height
                    );
                }
            }
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
        let startHovered = mouseX > startButton.x && mouseX < startButton.x + startButton.width && mouseY > startButton.y && mouseY < startButton.y + startButton.height;
        let continueHovered = mouseX > continueButton.x && mouseX < continueButton.x + continueButton.width && mouseY > continueButton.y && mouseY < continueButton.y + continueButton.height;

        if (yesHovered !== yesButton.isHovered) {
            yesButton.isHovered = yesHovered;
        }
        if (noHovered !== noButton.isHovered) {
            noButton.isHovered = noHovered;
            if (noButton.isHovered && currentState === 'initial') {
                rejectCount++;
                if (rejectCount >= 2) {
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
        if (startHovered !== startButton.isHovered) {
            startButton.isHovered = startHovered;
        }
        if (continueHovered !== continueButton.isHovered) {
            continueButton.isHovered = continueHovered;
        }
    });

    // Handle clicks on canvas for buttons
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (currentState === 'pre-initial') {
            if (mouseX >= continueButton.x && 
                mouseX <= continueButton.x + continueButton.width && 
                mouseY >= continueButton.y && 
                mouseY <= continueButton.y + continueButton.height) {
                currentState = 'initial';
                resizeCanvas(); // Recalculate positions for new state
            }
        } else if (currentState === 'initial') {
            if (mouseX >= yesButton.x && 
                mouseX <= yesButton.x + yesButton.width && 
                mouseY >= yesButton.y && 
                mouseY <= yesButton.y + yesButton.height) {
                currentState = 'accepted';
                createFireworks();
                resizeCanvas(); // Recalculate positions for new state
            } else if (mouseX >= noButton.x && 
                      mouseX <= noButton.x + noButton.width && 
                      mouseY >= noButton.y && 
                      mouseY <= noButton.y + noButton.height) {
                rejectCount++;
                if (rejectCount >= 3) {
                    currentState = 'accepted';
                    createFireworks();
                    resizeCanvas(); // Recalculate positions for new state
                } else {
                    // Move no button
                    const maxX = canvas.width - noButton.width - 20;
                    const maxY = canvas.height - noButton.height - 20;
                    const minX = 20;
                    const minY = 20;
                    
                    noButton.x = Math.min(Math.max(Math.random() * maxX, minX), maxX);
                    noButton.y = Math.min(Math.max(Math.random() * maxY, minY), maxY);
                }
            }
        } else if (currentState === 'accepted') {
            if (mouseX >= startButton.x && 
                mouseX <= startButton.x + startButton.width && 
                mouseY >= startButton.y && 
                mouseY <= startButton.y + startButton.height) {
                currentState = 'journey';
                journeyStartTime = performance.now();
                resizeCanvas(); // Recalculate positions for new state
            }
        }
    });

    // Add touch event handling for mobile
    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;

        if (currentState === 'pre-initial') {
            if (touchX >= continueButton.x && 
                touchX <= continueButton.x + continueButton.width && 
                touchY >= continueButton.y && 
                touchY <= continueButton.y + continueButton.height) {
                currentState = 'initial';
                resizeCanvas(); // Recalculate positions for new state
            }
        } else if (currentState === 'initial') {
            if (touchX >= yesButton.x && 
                touchX <= yesButton.x + yesButton.width && 
                touchY >= yesButton.y && 
                touchY <= yesButton.y + yesButton.height) {
                currentState = 'accepted';
                createFireworks();
                resizeCanvas(); // Recalculate positions for new state
            } else if (touchX >= noButton.x && 
                      touchX <= noButton.x + noButton.width && 
                      touchY >= noButton.y && 
                      touchY <= noButton.y + noButton.height) {
                rejectCount++;
                if (rejectCount >= 3) {
                    currentState = 'accepted';
                    createFireworks();
                    resizeCanvas(); // Recalculate positions for new state
                } else {
                    // Move no button
                    const maxX = canvas.width - noButton.width - 20;
                    const maxY = canvas.height - noButton.height - 20;
                    const minX = 20;
                    const minY = 20;
                    
                    noButton.x = Math.min(Math.max(Math.random() * maxX, minX), maxX);
                    noButton.y = Math.min(Math.max(Math.random() * maxY, minY), maxY);
                }
            }
        } else if (currentState === 'accepted') {
            if (touchX >= startButton.x && 
                touchX <= startButton.x + startButton.width && 
                touchY >= startButton.y && 
                touchY <= startButton.y + startButton.height) {
                currentState = 'journey';
                journeyStartTime = performance.now();
                resizeCanvas(); // Recalculate positions for new state
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

    // 雨滴效果
    function createRaindrops() {
        // 清除现有的雨滴
        const existingRaindrops = document.querySelectorAll('.raindrop');
        existingRaindrops.forEach(drop => drop.remove());

        // 创建新的雨滴
        for (let i = 0; i < 100; i++) {
            const raindrop = document.createElement('div');
            raindrop.className = 'raindrop';
            raindrop.style.left = Math.random() * 100 + 'vw';
            raindrop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's'; // 0.5-1秒
            raindrop.style.animationDelay = (Math.random() * 0.5) + 's'; // 0-0.5秒延迟
            raindrop.style.height = (Math.random() * 10 + 15) + 'px'; // 15-25px高度
            raindrop.style.opacity = (Math.random() * 0.3 + 0.3).toString(); // 0.3-0.6透明度
            document.body.appendChild(raindrop);
        }
    }

    // Add music control
    const bgMusic = document.getElementById('bgMusic');
    const musicControl = document.getElementById('musicControl');
    let isMusicPlaying = false;

    // Function to toggle music
    function toggleMusic() {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicControl.classList.remove('playing');
        } else {
            bgMusic.play();
            musicControl.classList.add('playing');
        }
        isMusicPlaying = !isMusicPlaying;
    }

    // Add click event to music control button
    musicControl.addEventListener('click', toggleMusic);

    // Auto play music when page loads
    bgMusic.play().then(() => {
        isMusicPlaying = true;
        musicControl.classList.add('playing');
    }).catch(error => {
        console.log('Auto-play failed:', error);
        // If auto-play fails, try to play on first user interaction
        document.addEventListener('click', () => {
            if (!isMusicPlaying) {
                toggleMusic();
            }
        }, { once: true });
    });

    // Initial setup: start loading image. Resize and animation will start on image load.
    // resizeCanvas(); // Called on image load
    // animate(0); // Called on image load
}); 