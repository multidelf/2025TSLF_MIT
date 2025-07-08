document.addEventListener('DOMContentLoaded', () => {

    // --- DOM元素定義 ---
    const mainContent = document.getElementById('main-content');
    const mapSection = document.getElementById('map-section');
    const compassSection = document.getElementById('compass-section');
    const mapBoard = document.getElementById('map-board');
    const mapProgressText = document.getElementById('map-progress-text');
    const compassProgressText = document.getElementById('compass-progress-text');
    const logoVivid = document.querySelector('.logo-vivid');
    const purchaseModal = document.getElementById('purchase-modal');
    const modalStoreName = document.getElementById('modal-store-name');
    const amountInput = document.getElementById('amount-input');
    const submitAmountButton = document.getElementById('submit-amount-button');
    const cancelButton = document.getElementById('cancel-button');
    const customAlertModal = document.getElementById('custom-alert-modal');
    const customAlertMessage = document.getElementById('custom-alert-message');
    const customAlertOkButton = document.getElementById('custom-alert-ok-button');
    const storyTextElement = document.getElementById('story-text');
    const redeemButton = document.getElementById('redeem-button');
    const resetGameButton = document.getElementById('reset-game-button');
    const discoveryOverlay = document.getElementById('discovery-overlay');
    const discoveryImage = document.getElementById('discovery-image');
    const wakeUpButton = document.getElementById('wake-up-button');

    // --- 全局變數 ---
    const TOTAL_PIECES = 4;
    const GOAL_AMOUNT = 500;
    const storeData = { 'A01': '酷頂合穩實業有限公司', 'A02': '廣福毛巾股份有限公司', 'A03': '上比實業有限公司', 'A04': '新聯昌針織有限公司', 'A05': '欣合信股份有限公司(BAW)', 'A06': '新科紡科技工程有限公司', 'A07': '台灣日用織品股份有限公司', 'A08': '偉榮棉織廠', 'A09': '恆裕企業社', 'A10': '元葵有限公司', 'A11': 'deBo Bags', 'A12': '元艇企業有限公司', 'A13': '足好有限公司', 'A14': '台灣儂儂褲襪股份有限公司', 'A15': '村林欣國際有限公司', 'A16': '四季織企業有限公司', 'A17': '聖手企業有限公司', 'A18': '仁富內衣實業有限公司', 'A19': '芃果企業有限公司', 'A20': '斯傑利企業有限公司', 'A21': '金頂鞋業', 'A22': '織步加服飾有限公司', 'A23': '雅伯斯國際通商有限公司', 'A24': '信發行有限公司', 'A25': '和悅開發有限公司', 'A26': '諾鎷客企業社', 'A27': '九億開發有限公司', 'A28': '喬尼有限公司', 'A29': '華果企業有限公司', 'A30': '龍峰開發有限公司' };
    const defaultUserData = { 
        userId: 'user_' + Date.now() + Math.random().toString(36).substr(2, 9), 
        collectedMapPieces: [], 
        totalAmount: 0, 
        isGameWon: false 
    };
    let userData = { ...defaultUserData };
    let fanfareSynth, purchaseSynth;

    // --- 函式定義 ---

    function playSound(type, detail = null) {
        Tone.start();
        const now = Tone.now();
        if (type === 'discover') {
            if (!fanfareSynth) {
                fanfareSynth = new Tone.PolySynth(Tone.Synth, {
                    volume: -20,
                    oscillator: { type: 'triangle8' },
                    envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.5 }
                }).toDestination();
            }
            fanfareSynth.releaseAll();
            switch (detail) {
                case 'M01': fanfareSynth.triggerAttackRelease(["C4"], "8n", now); fanfareSynth.triggerAttackRelease(["E4"], "8n", now + 0.3); fanfareSynth.triggerAttackRelease(["G4"], "8n", now + 0.6); fanfareSynth.triggerAttackRelease(["C5"], "2n", now + 0.9); break;
                case 'M02': fanfareSynth.triggerAttackRelease(["C3", "G3", "C4"], "2n", now); fanfareSynth.triggerAttackRelease(["G3", "D4", "G4"], "2n", now + 0.6); fanfareSynth.triggerAttackRelease(["C4", "E4", "G4"], "2n", now + 1.2); break;
                case 'M03': fanfareSynth.triggerAttackRelease(["C4", "E4", "G4"], "4n", now); fanfareSynth.triggerAttackRelease(["F4", "A4", "C5"], "4n", now + 0.5); fanfareSynth.triggerAttackRelease(["C5", "E5"], "4n", now + 1.0); break;
                case 'M04': fanfareSynth.triggerAttackRelease(["A4", "C5", "E5"], "4n", now); fanfareSynth.triggerAttackRelease(["G4", "B4", "D5"], "4n", now + 0.5); fanfareSynth.triggerAttackRelease(["C5", "E5", "G5"], "2n", now + 1.0); break;
                default: fanfareSynth.triggerAttackRelease(["C5", "E5", "G5"], "4n", now); break;
            }
        }
    }

    // ===== START: 已修改的 showAlert 函式 =====
    function showAlert(message, isCongrats = false) {
        const modalContent = customAlertModal.querySelector('.modal-content');
        const confettiContainer = document.getElementById('confetti-container');
        
        // 清理舊狀態
        document.getElementById('qrcode-container').style.display = 'none';
        confettiContainer.innerHTML = '';
        modalContent.classList.remove('congrats-modal');

        if (isCongrats) {
            modalContent.classList.add('congrats-modal');
            // 產生彩帶
            for(let i = 0; i < 9; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confettiContainer.appendChild(confetti);
            }
        }
        
        customAlertMessage.textContent = message;
        customAlertModal.style.display = 'flex';
    }
    // ===== END: 已修改的 showAlert 函式 =====

    function updateUserData(data) {
        userData = data;
        localStorage.setItem('eventUserData', JSON.stringify(userData));
    }
    
    function renderMap() {
        const allPieceDivs = document.querySelectorAll('.map-piece');
        allPieceDivs.forEach(pieceDiv => {
            const pieceId = pieceDiv.dataset.pieceId;
            if (userData.collectedMapPieces.includes(pieceId)) {
                pieceDiv.classList.add('unlocked');
            } else {
                pieceDiv.classList.remove('unlocked');
            }
        });
        mapProgressText.textContent = `${userData.collectedMapPieces.length} / ${TOTAL_PIECES}`;
    }

    function renderCompass(amount) {
        const displayAmount = Math.round(amount);
        const percentage = Math.min((displayAmount / GOAL_AMOUNT) * 100, 100);
        compassProgressText.textContent = `${displayAmount} / ${GOAL_AMOUNT}`;
        const maskStyle = `conic-gradient(#FFD700 ${percentage}%, transparent ${percentage}%)`;
        logoVivid.style.maskImage = maskStyle;
        logoVivid.style.webkitMaskImage = maskStyle;
    }
    
    function renderAll() { 
        renderMap(); 
        renderCompass(userData.totalAmount); 
    }

    function animateProgress(startAmount, endAmount) {
        const duration = 2000;
        const amountToAnimate = endAmount - startAmount;
        let startTime = null;
        if (amountToAnimate <= 0) { renderCompass(endAmount); return; }
        if (!purchaseSynth) {
            purchaseSynth = new Tone.Synth({
                volume: -30,
                oscillator: { type: 'sine' },
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.2 }
            }).toDestination();
        }
        const soundMilestones = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85];
        const notesToPlay = ["C6", "E6", "G6", "C7", "E7", "G7"];
        let milestonesReached = 0;
        function animationStep(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const currentAmount = startAmount + (amountToAnimate * progress);
            renderCompass(currentAmount);
            if (milestonesReached < soundMilestones.length && progress >= soundMilestones[milestonesReached]) {
                const now = Tone.now();
                purchaseSynth.triggerAttackRelease(notesToPlay[milestonesReached], "16n", now);
                milestonesReached++;
            }
            if (progress < 1) {
                requestAnimationFrame(animationStep);
            } else {
                renderCompass(endAmount);
                const now = Tone.now();
                purchaseSynth.triggerAttackRelease("C8", "8n", now);
            }
        }
        requestAnimationFrame(animationStep);
    }

    function checkWinCondition() {
        if (userData.isGameWon) return; 
        const mapIsComplete = userData.collectedMapPieces.length === TOTAL_PIECES;
        const compassIsFull = userData.totalAmount >= GOAL_AMOUNT;
        if (mapIsComplete && compassIsFull) {
            updateUserData({ ...userData, isGameWon: true });
            // ===== START: 修改勝利觸發 =====
            // 延遲一小段時間，讓最後的動畫或音效播完
            setTimeout(() => {
                showTreasureLocation();
            }, 500);
            // ===== END: 修改勝利觸發 =====
        }
    }

    // ===== START: 已修改的 showTreasureLocation 函式 =====
    function showTreasureLocation() {
        mapBoard.style.boxShadow = '0 0 30px 10px #ffd54f';
        // 呼叫祝賀視窗
        showAlert("🎉 恭喜！您已完成所有任務！🎉\n現在可以兌換您的專屬獎勵了！", true);
        
        // 在使用者按下確定後，再顯示兌換按鈕
        customAlertOkButton.addEventListener('click', () => {
            redeemButton.style.display = 'block';
        }, { once: true });
    }
    // ===== END: 已修改的 showTreasureLocation 函式 =====

    function handleDiscover(pieceId) {
        if (!userData.collectedMapPieces.includes(pieceId)) {
            showDiscoveryScreen(pieceId);
        } else {
            showAlert('這位夥伴你已經找到過了喔！');
        }
    }

    function showDiscoveryScreen(pieceId) {
        discoveryImage.src = `images/${pieceId}.png`;
        discoveryImage.style.transition = 'none';
        discoveryImage.style.transform = 'translate(-50%, -50%) scale(1)';
        discoveryImage.style.opacity = '1';
        discoveryOverlay.classList.add('visible');
        wakeUpButton.addEventListener('click', () => {
            playSound('discover', pieceId);
            const targetPieceElement = document.querySelector(`.map-piece[data-piece-id="${pieceId}"]`);
            if (!targetPieceElement) return;
            const targetRect = targetPieceElement.getBoundingClientRect();
            const translateX = (targetRect.left + targetRect.width / 2) - (window.innerWidth / 2);
            const translateY = (targetRect.top + targetRect.height / 2) - (window.innerHeight / 2);
            const scale = targetRect.width / discoveryImage.offsetWidth;
            discoveryImage.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            discoveryImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            discoveryImage.style.opacity = '0';
            setTimeout(() => {
                discoveryOverlay.classList.remove('visible');
                const newCollectedPieces = [...userData.collectedMapPieces, pieceId].sort();
                updateUserData({ ...userData, collectedMapPieces: newCollectedPieces });
                renderMap();
                showAlert(`太棒了！你找到了一位「綠色寶寶夥伴」，他加入了你的隊伍！`);
                checkWinCondition();
            }, 1500);
        }, { once: true });
    }

    function handlePurchase(storeId) {
        const storeName = storeData[storeId] || storeId; 
        modalStoreName.textContent = `在 ${storeName} 消費`;
        modalStoreName.dataset.storeId = storeId;
        modalStoreName.dataset.storeName = storeName;
        purchaseModal.style.display = 'flex';
    }

    function logPurchaseToServer(storeId, storeName, amount, userId) {
        const API_URL = 'https://script.google.com/macros/s/AKfycbz-6CiVtDU251TKiQc73NYYlfg8gTqESOvAOUc1VWtFz-_g7J0a1cdgfBUZWuDDs5x0PA/exec';
        const params = new URLSearchParams({ action: 'log_purchase', storeId, storeName, amount, userId });
        const urlWithParams = `${API_URL}?${params.toString()}`;
        if (navigator.sendBeacon) { navigator.sendBeacon(urlWithParams); } else { fetch(urlWithParams, { method: 'POST', mode: 'no-cors' }); }
    }

    function handleSubmit() {
        const amount = parseInt(amountInput.value, 10);
        if (isNaN(amount) || amount <= 0) { showAlert('請輸入有效的金額！'); return; }
        const previousAmount = userData.totalAmount;
        const newTotalAmount = previousAmount + amount;
        const storeId = modalStoreName.dataset.storeId; 
        const storeName = modalStoreName.dataset.storeName;
        updateUserData({ ...userData, totalAmount: newTotalAmount });
        animateProgress(previousAmount, newTotalAmount);
        hidePurchaseModal();
        showAlert(`「微笑之心」吸收了 ${amount} 點純粹的信賴，變得更溫暖了！`);
        logPurchaseToServer(storeId, storeName, amount, userData.userId);
        checkWinCondition();
    }
    
    function hidePurchaseModal() {
        purchaseModal.style.display = 'none';
        amountInput.value = '';
    }

    const storySnippets = [ "您是一位熱衷探尋台灣優質寶物的「MIT收藏家」...", "偶然的機會你得到一顆「微笑之心」，並得知需要找到四位失散的「綠色寶寶夥伴」...", "您的旅途就此展開：找回夥伴，並用您的支持為「微笑之心」注入能量！" ];
    let snippetIndex = 0;
    let charIndex = 0;
    let typingTimeout;
    function typeWriter() {
        if (charIndex < storySnippets[snippetIndex].length) {
            storyTextElement.textContent += storySnippets[snippetIndex].charAt(charIndex);
            charIndex++;
            typingTimeout = setTimeout(typeWriter, 100);
        } else {
            typingTimeout = setTimeout(() => {
                storyTextElement.textContent = '';
                charIndex = 0;
                snippetIndex = (snippetIndex + 1) % storySnippets.length;
                typeWriter();
            }, 4000);
        }
    }

    // --- 事件監聽器 ---
    customAlertOkButton.addEventListener('click', () => { customAlertModal.style.display = 'none'; });
    submitAmountButton.addEventListener('click', handleSubmit);
    cancelButton.addEventListener('click', hidePurchaseModal);
    redeemButton.addEventListener('click', () => {
        if (confirm('確定要產生兌換碼嗎？\n請在服務台人員面前點擊此按鈕。')) {
            showAlert('兌換碼產生中，請稍候...');
            redeemButton.disabled = true;
            const clientSideUserData = JSON.parse(localStorage.getItem('eventUserData'));
            const userId = clientSideUserData.userId;
            const API_URL = 'https://script.google.com/macros/s/AKfycbz-6CiVtDU251TKiQc73NYYlfg8gTqESOvAOUc1VWtFz-_g7J0a1cdgfBUZWuDDs5x0PA/exec';
            fetch(`${API_URL}?action=generate&userId=${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success' || data.status === 'already_generated') {
                        const qrcodeContainer = document.getElementById('qrcode-container');
                        qrcodeContainer.innerHTML = '';
                        qrcodeContainer.style.display = 'block';
                        const verificationUrl = `https://multidelf.github.io/2025TSLF_MIT/verify.html?code=${data.code}`;
                        new QRCode(qrcodeContainer, { text: verificationUrl, width: 180, height: 180, colorDark: "#000000", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H });
                        document.getElementById('custom-alert-message').textContent = `您的專屬兌換碼已產生！\n請將此 QR Code 出示給工作人員掃描。`;
                        redeemButton.style.display = 'none';
                    } else {
                        showAlert(`發生錯誤：${data.message}`);
                        redeemButton.disabled = false;
                    }
                })
                .catch(error => {
                    showAlert(`網路連線錯誤，請稍後再試。`);
                    redeemButton.disabled = false;
                });
        }
    });
    
    resetGameButton.addEventListener('click', () => {
        const isConfirmed = window.confirm('您確定要清除所有遊戲紀錄並從頭開始嗎？\n這個操作無法復原！');
        if (isConfirmed) {
            localStorage.removeItem('eventUserData');
            window.location.reload();
        }
    });

    function unlockAudio() {
        if (Tone.context.state !== 'running') { Tone.start(); }
        console.log('AudioContext unlocked!');
        document.body.removeEventListener('click', unlockAudio);
        document.body.removeEventListener('touchstart', unlockAudio);
    }

    // --- 初始化程式 ---
    function init() {
        const savedData = localStorage.getItem('eventUserData');
        if (savedData) {
            userData = { ...defaultUserData, ...JSON.parse(savedData) };
        } else {
            localStorage.setItem('eventUserData', JSON.stringify(userData));
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');

        if (type === 'discover') {
            mainContent.classList.add('discover-mode');
        } else {
            mainContent.classList.remove('discover-mode');
        }

        renderAll();
        
        if (userData.isGameWon) {
             showTreasureLocation();
        }

        document.body.addEventListener('click', unlockAudio);
        document.body.addEventListener('touchstart', unlockAudio);

        if (type) {
            if (type === 'discover') {
                const pieceId = urlParams.get('piece_id');
                if (pieceId) handleDiscover(pieceId);
            } else if (type === 'purchase') {
                const storeId = urlParams.get('store_id');
                if (storeId) handlePurchase(storeId);
            }
            history.replaceState(null, '', window.location.pathname);
        }
        
        typeWriter();
    }

    init();
});
