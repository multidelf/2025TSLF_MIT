document.addEventListener('DOMContentLoaded', () => {

    // --- DOM元素定義 ---
    const mapBoard = document.getElementById('map-board');
    const mapProgressText = document.getElementById('map-progress-text');
    const compassProgressBar = document.getElementById('compass-progress-bar');
    const compassProgressText = document.getElementById('compass-progress-text');
    const compassNeedle = document.querySelector('.compass-needle-overlay');
    const purchaseModal = document.getElementById('purchase-modal');
    const modalStoreName = document.getElementById('modal-store-name');
    const amountInput = document.getElementById('amount-input');
    const submitAmountButton = document.getElementById('submit-amount-button');
    const cancelButton = document.getElementById('cancel-button');
    const customAlertModal = document.getElementById('custom-alert-modal');
    const customAlertMessage = document.getElementById('custom-alert-message');
    const customAlertOkButton = document.getElementById('custom-alert-ok-button');

    // --- 全局變數 ---
    const TOTAL_PIECES = 6;
    const GOAL_AMOUNT = 1500;
    const PIECE_PREFIX = 'M';
    const storeData = {
        'A01': '老王的手工皮件', 'A02': '小草的溫暖織物', 'A03': '阿明設計工作室',
        'A04': '山谷裡的烘焙坊', 'A05': '轉角那間咖啡廳',
        // --- 請繼續將您所有店家的名稱填寫完畢 ---
    };
    const defaultUserData = { collectedMapPieces: [], totalAmount: 0, isGameWon: false };
    let userData = { ...defaultUserData };

    // --- 函式定義 ---

    function showAlert(message) {
        customAlertMessage.textContent = message;
        customAlertModal.style.display = 'flex';
        customAlertOkButton.addEventListener('click', () => {
            customAlertModal.style.display = 'none';
        }, { once: true });
    }

    function updateUserData(data) {
        userData = data;
        localStorage.setItem('eventUserData', JSON.stringify(userData));
        renderAll();
    }
    
    function renderMap() {
        mapBoard.innerHTML = '';
        for (let i = 1; i <= TOTAL_PIECES; i++) {
            const pieceId = PIECE_PREFIX + String(i).padStart(2, '0');
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'map-piece';
            if (userData.collectedMapPieces.includes(pieceId)) {
                pieceDiv.classList.add('unlocked');
                const img = document.createElement('img');
                img.src = `images/${pieceId}.png`;
                img.alt = `匠心碎片 ${i}`;
                pieceDiv.appendChild(img);
            }
            mapBoard.appendChild(pieceDiv);
        }
        mapProgressText.textContent = `${userData.collectedMapPieces.length} / ${TOTAL_PIECES}`;
    }

    function renderCompass() {
        const percentage = Math.min((userData.totalAmount / GOAL_AMOUNT) * 100, 100);
        compassProgressBar.style.background = `conic-gradient(#ff8a65 ${percentage}%, #ffe0b2 0%)`;
        compassProgressText.textContent = `${userData.totalAmount} / ${GOAL_AMOUNT}`;
    }
    
    function renderAll() { renderMap(); renderCompass(); }

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
        compassNeedle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            showAlert('恭喜你！匠心地圖已然完整，微笑之心也因你的信賴而閃耀。你已理解它的真諦！請至【服務台】出示此畫面，領取你的「傳承之禮」！');
        }, 1200);
    }

    function handleDiscover(pieceId) {
        if (!userData.collectedMapPieces.includes(pieceId)) {
            const newCollectedPieces = [...userData.collectedMapPieces, pieceId].sort();
            updateUserData({ ...userData, collectedMapPieces: newCollectedPieces });
            showAlert(`恭喜！你領悟了一片匠心碎片： #${pieceId.substring(1)}！`);
            checkWinCondition();
        } else {
            showAlert('這片匠心你已經領悟過了喔！');
        }
    }

    function handlePurchase(storeId) {
        const storeName = storeData[storeId] || storeId; 
        modalStoreName.textContent = `在 ${storeName} 消費`;
        purchaseModal.style.display = 'flex';
        
        const submitHandler = () => {
            const amount = parseInt(amountInput.value, 10);
            if (isNaN(amount) || amount <= 0) {
                showAlert('請輸入有效的金額！');
                return;
            }
            updateUserData({ ...userData, totalAmount: userData.totalAmount + amount });
            closeModal();
            showAlert(`感謝您的支持！信賴指數增加了 ${amount} 點！`);
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

    function init() {
        const savedData = localStorage.getItem('eventUserData');
        if (savedData) { userData = { ...defaultUserData, ...JSON.parse(savedData) }; }
        renderAll();
        if (userData.isGameWon) { showTreasureLocation(); }
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
