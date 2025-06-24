document.addEventListener('DOMContentLoaded', () => {

    // --- DOM元素定義 ---
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
    const toggleStoryButton = document.getElementById('toggle-story-button');
    const storyOriginDiv = document.querySelector('.story-origin');
    const redeemButton = document.getElementById('redeem-button');
    const resetGameButton = document.getElementById('reset-game-button');

    // --- 全局變數 ---
    const TOTAL_PIECES = 6;
    const GOAL_AMOUNT = 500;
    const storeData = { 'A01': '鞋寶觀光工廠', 'A02': '小幫手庇護工場', 'A03': '麥子庇護工場', 'A04': '山谷裡的麵包店', 'A05': '轉角沒有咖啡廳', 'A06': '範例店家六號' };
    const defaultUserData = { 
        userId: 'user_' + Date.now() + Math.random().toString(36).substr(2, 9), 
        collectedMapPieces: [], 
        totalAmount: 0, 
        isGameWon: false 
    };
    let userData = { ...defaultUserData };
    let animationInterval = null;

    // --- 函式定義 ---

    function showAlert(message) {
        document.getElementById('qrcode-container').innerHTML = '';
        document.getElementById('qrcode-container').style.display = 'none';
        customAlertMessage.textContent = message;
        customAlertModal.style.display = 'flex';
        customAlertOkButton.addEventListener('click', () => {
            customAlertModal.style.display = 'none';
        }, { once: true });
    }

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
        
        const maskStyle = `conic-gradient(black ${percentage}%, transparent ${percentage}%)`;
        logoVivid.style.maskImage = maskStyle;
        logoVivid.style.webkitMaskImage = maskStyle;
    }
    
    function renderAll() { 
        renderMap(); 
        renderCompass(userData.totalAmount); 
    }

    function animateProgress(startAmount, endAmount) {
        if (animationInterval) {
            clearInterval(animationInterval);
        }
        const TOTAL_SEGMENTS = 10;
        const duration = 1200;
        const frameRate = 60;
        const totalFrames = duration / (1000 / frameRate);
        const amountToAnimate = endAmount - startAmount;
        const incrementPerFrame = amountToAnimate / totalFrames;
        let currentAmount = startAmount;
        let displayedSegments = Math.floor((startAmount / GOAL_AMOUNT) * TOTAL_SEGMENTS);

        animationInterval = setInterval(() => {
            currentAmount += incrementPerFrame;
            if (currentAmount >= endAmount) {
                currentAmount = endAmount;
                clearInterval(animationInterval);
                animationInterval = null;
                renderCompass(endAmount);
                return;
            }
            const targetSegments = Math.floor((currentAmount / GOAL_AMOUNT) * TOTAL_SEGMENTS);
            if (targetSegments > displayedSegments) {
                displayedSegments = targetSegments;
                const displayAmountForSegment = (displayedSegments / TOTAL_SEGMENTS) * GOAL_AMOUNT;
                renderCompass(displayAmountForSegment);
            }
        }, 1000 / frameRate);
    }

    function checkWinCondition() {
        if (userData.isGameWon) return; 
        const mapIsComplete = userData.collectedMapPieces.length === TOTAL_PIECES;
        const compassIsFull = userData.totalAmount >= GOAL_AMOUNT;
        if (mapIsComplete && compassIsFull) {
            updateUserData({ ...userData, isGameWon: true });
            showTreasureLocation();
        }
    }

    function showTreasureLocation() {
        mapBoard.style.boxShadow = '0 0 30px 10px #ffd54f';
        redeemButton.style.display = 'block';
    }

    function handleDiscover(pieceId) {
        if (!userData.collectedMapPieces.includes(pieceId)) {
            const newCollectedPieces = [...userData.collectedMapPieces, pieceId].sort();
            updateUserData({ ...userData, collectedMapPieces: newCollectedPieces });
            renderMap();
            showAlert(`恭喜！你得到了一片匠心碎片： #${pieceId.substring(1)}！`);
            checkWinCondition();
        } else {
            showAlert('這片匠心你已經得到過了喔！');
        }
    }

    function handlePurchase(storeId) {
        const storeName = storeData[storeId] || storeId; 
        modalStoreName.textContent = `在 ${storeName} 消費`;
        modalStoreName.dataset.storeId = storeId;
        purchaseModal.style.display = 'flex';
        
        const submitHandler = () => {
            const amount = parseInt(amountInput.value, 10);
            if (isNaN(amount) || amount <= 0) {
                showAlert('請輸入有效的金額！');
                return;
            }
            const previousAmount = userData.totalAmount;
            const newTotalAmount = previousAmount + amount;
            animateProgress(previousAmount, newTotalAmount);
            closeModal();
            showAlert(`感謝您的支持！信賴指數增加了 ${amount} 點！`);
            updateUserData({ ...userData, totalAmount: newTotalAmount });
            checkWinCondition();
        };

        const cancelHandler = () => closeModal();
        const closeModal = () => {
             purchaseModal.style.display = 'none';
             amountInput.value = '';
             submitAmountButton.removeEventListener('click', submitHandler);
             cancelButton.removeEventListener('click', cancelHandler);
        };
        
        submitAmountButton.addEventListener('click', submitHandler);
        cancelButton.addEventListener('click', cancelHandler);
    }

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
                        new QRCode(qrcodeContainer, {
                            text: verificationUrl,
                            width: 180, height: 180,
                            colorDark: "#000000", colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
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

    toggleStoryButton.addEventListener('click', () => {
        storyOriginDiv.classList.toggle('is-expanded');
        toggleStoryButton.classList.toggle('active');
        const arrow = toggleStoryButton.querySelector('.arrow');
        if (storyOriginDiv.classList.contains('is-expanded')) {
            arrow.textContent = '▲';
        } else {
            arrow.textContent = '▼';
        }
    });

    resetGameButton.addEventListener('click', () => {
        const isConfirmed = window.confirm('您確定要清除所有遊戲紀錄並從頭開始嗎？\n這個操作無法復原！');
        if (isConfirmed) {
            localStorage.removeItem('eventUserData');
            window.location.reload();
        }
    });

    function init() {
        const savedData = localStorage.getItem('eventUserData');
        if (savedData) {
            userData = { ...defaultUserData, ...JSON.parse(savedData) };
        } else {
            localStorage.setItem('eventUserData', JSON.stringify(userData));
        }
        renderAll();
        if (userData.isGameWon) {
             showTreasureLocation();
        }
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');
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
    }

    init();
});
