document.addEventListener('DOMContentLoaded', () => {
    const mainMachine = document.getElementById('mainMachine');
    const pushBtn = document.getElementById('pushBtn');
    const pushImg = document.getElementById('pushImg');
    const gaugeFill = document.getElementById('gaugeFill');

    // Preload All Assets to fix rotation/animation lag on GitHub Pages
    const assetsToPreload = [
        'assets/imgs/OpenPage_BG.png',
        'assets/imgs/Machine_Capsule_Hide.png',
        'assets/imgs/ItemBox/ItemBox_C.png',
        'assets/imgs/PUSH/PUSH_UP.png',
        'assets/imgs/PUSH/PUSH_Focus.png',
        'assets/imgs/PUSH/PUSH_Down.png',
        'assets/imgs/PUSH/PUSH_Dis.png',
        'assets/imgs/OpenGauge_Bar/OpenGauge_Bar_BG.png',
        'assets/imgs/OpenGauge_Bar/OpenGauge_Bar.png'
    ];

    const ballImages = [
        'assets/imgs/GachaMachine_Ball/GachaMachine_Ball_Cash_Normal.png',
        'assets/imgs/GachaMachine_Ball/GachaMachine_Ball_Cash_Rare.png',
        'assets/imgs/GachaMachine_Ball/GachaMachine_Ball_GP_Normal.png',
        'assets/imgs/GachaMachine_Ball/GachaMachine_Ball_GP_Rare.png'
    ];

    // Collect all Machine_Cash and Machine_Shoot frames
    for (let i = 0; i <= 8; i++) assetsToPreload.push(`assets/imgs/Machine_Cash/Machine_Cash_0${i}.png`);
    for (let i = 1; i <= 5; i++) assetsToPreload.push(`assets/imgs/Machine_Cash/Machine_Cash_Rolling_0${i}.png`);
    for (let i = 1; i <= 6; i++) assetsToPreload.push(`assets/imgs/Machine_Shoot/Machine_GP_Shoot_0${i}.png`);
    assetsToPreload.push('assets/imgs/Machine_Cash/Machine_Cash_Shoot.png');
    assetsToPreload.push('assets/imgs/Machine_Cash/Machine_Cash_Opacity.png');
    
    // Merge balls
    assetsToPreload.push(...ballImages);

    function preloadImages() {
        console.log("Preloading assets...");
        assetsToPreload.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    preloadImages();

    // 1. Random Start Frame (Machine_Cash_00 to 08)
    const startFrames = [];
    for (let i = 0; i <= 8; i++) {
        startFrames.push(`assets/imgs/Machine_Cash/Machine_Cash_0${i}.png`);
    }

    // Set initial random frame
    mainMachine.src = startFrames[Math.floor(Math.random() * startFrames.length)];

    let holdInterval = null;
    let rollInterval = null;
    let gaugeProgress = 100; // 100% inset means fully cropped (hidden)
    let isHolding = false;
    let isDisabled = false;
    let rollFrame = 1;

    // Button States (Hover/Focus)
    pushBtn.addEventListener('mouseover', () => {
        if (!isHolding && !isDisabled) {
            pushImg.src = 'assets/imgs/PUSH/PUSH_Focus.png';
        }
    });

    pushBtn.addEventListener('mouseout', () => {
        if (!isHolding && !isDisabled) {
            pushImg.src = 'assets/imgs/PUSH/PUSH_UP.png';
        }
    });

    // Mouse Down (Hold)
    pushBtn.addEventListener('mousedown', () => {
        if (isDisabled) return;
        
        // Hide previous rewards if visible
        rewardContainer.classList.add('hidden');

        isHolding = true;
        pushImg.src = 'assets/imgs/PUSH/PUSH_Down.png';
        
        // Start Machine Rolling Animation (01 to 05 loop)
        rollFrame = 1;
        if (rollInterval) clearInterval(rollInterval);
        rollInterval = setInterval(() => {
            mainMachine.src = `assets/imgs/Machine_Cash/Machine_Cash_Rolling_0${rollFrame}.png`;
            rollFrame++;
            if (rollFrame > 5) rollFrame = 1;
        }, 80); // Adjust speed if necessary

        // Gauge Fill Logic (Crop from right to left using clip-path)
        gaugeProgress = 100;
        if (holdInterval) clearInterval(holdInterval);
        holdInterval = setInterval(() => {
            gaugeProgress -= 1.5; // Decreasing inset reveals the image
            if (gaugeProgress < 0) gaugeProgress = 0;
            gaugeFill.style.clipPath = `inset(0 ${gaugeProgress}% 0 0)`;
        }, 20); // 20ms for smooth 60fps gauge filling
    });

    const machineFlash = document.getElementById('machineFlash');
    const machineCapsule = document.getElementById('machineCapsule');
    const rewardContainer = document.getElementById('rewardContainer');
    const rewardBoxes = [
        document.getElementById('reward1'),
        document.getElementById('reward2'),
        document.getElementById('reward3')
    ];

    // Mouse Up (Release)
    function handleRelease() {
        if (!isHolding) return;
        isHolding = false;
        isDisabled = true;

        // Show Disabled state for 2 seconds
        pushImg.src = 'assets/imgs/PUSH/PUSH_Dis.png';
        setTimeout(() => {
            isDisabled = false;
            if (pushBtn.matches(':hover')) {
                pushImg.src = 'assets/imgs/PUSH/PUSH_Focus.png';
            } else {
                pushImg.src = 'assets/imgs/PUSH/PUSH_UP.png';
            }
        }, 2000);

        // Stop Rolling and Filling
        clearInterval(rollInterval);
        clearInterval(holdInterval);

        // Instantly Reset Gauge
        gaugeFill.style.clipPath = `inset(0 100% 0 0)`;

        // Show Shoot Frame
        mainMachine.src = 'assets/imgs/Machine_Cash/Machine_Cash_Shoot.png';

        // Then return to base machine and show overlays
        setTimeout(() => {
            mainMachine.src = 'assets/imgs/Machine_Cash/Machine_Cash_00.png';
            machineCapsule.classList.remove('hidden');

            machineFlash.classList.remove('hidden');
            let flashFrame = 1;
            let flashInterval = setInterval(() => {
                flashFrame++;
                if (flashFrame <= 6) {
                    machineFlash.src = `assets/imgs/Machine_Shoot/Machine_GP_Shoot_0${flashFrame}.png`;
                } else {
                    clearInterval(flashInterval);
                    machineFlash.classList.add('hidden');
                    machineFlash.src = `assets/imgs/Machine_Shoot/Machine_GP_Shoot_01.png`;
                }
            }, 130);

            // After a bit, hide the capsule and show opacity state + rewards
            setTimeout(() => {
                machineCapsule.classList.add('hidden');
                mainMachine.src = 'assets/imgs/Machine_Cash/Machine_Cash_Opacity.png';

                // Randomize and show rewards
                rewardBoxes.forEach(box => {
                    const randomBall = ballImages[Math.floor(Math.random() * ballImages.length)];
                    box.innerHTML = `<img src="${randomBall}" class="reward-ball">`;
                });
                rewardContainer.classList.remove('hidden');

                // After another second, reset machine BUT KEEP REWARDS VISIBLE
                setTimeout(() => {
                    mainMachine.src = startFrames[Math.floor(Math.random() * startFrames.length)];
                }, 1000);
            }, 1000);

        }, 100);
    }

    pushBtn.addEventListener('mouseup', handleRelease);
    pushBtn.addEventListener('mouseleave', handleRelease);
});
