document.addEventListener('DOMContentLoaded', () => {

    // --- 全局變數和DOM元素定義 ---
    const TOTAL_PIECES = 6;
    const GOAL_AMOUNT = 1500;
    const PIECE_PREFIX = 'M';

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

    // 預設的使用者資料結構
    const defaultUserData = {
        collectedMapPieces: [],
        totalAmount: 0,
        isGameWon: false
    };

    let userData = { ...defaultUserData };

    // --- 函式定義 ---

    // 更新使用者資料並儲存到 localStorage
    function updateUserData(data) {
        userData = data;
        localStorage.setItem('eventUserData', JSON.stringify(userData));
        renderAll();
    }
    
    // 渲染地圖
    function renderMap() {
        mapBoard.innerHTML = '';
        for (let i = 1; i <= TOTAL_PIECES; i++) {
            const pieceId = PIECE_PREFIX + String(i).padStart(2, '0');
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'map-piece';
            pieceDiv.dataset.pieceId = pieceId;

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

    // 渲染羅盤/心形
    function renderCompass() {
        const percentage = Math.min((userData.totalAmount / GOAL_AMOUNT) * 100, 100);
        compassProgressBar.style.background = `conic-gradient(#ff8a65 ${percentage}%, #ffe0b2 0%)`;
        compassProgressText.textContent = `${userData.totalAmount} / ${GOAL_AMOUNT}`;
    }
    
    // 渲染所有畫面
    function renderAll() {
        renderMap();
        renderCompass();
    }

    // 檢查勝利條件
    function checkWinCondition() {
        if (userData.isGameWon) return; 

        const mapIsComplete = userData.collectedMapPieces.length === TOTAL_PIECES;
        const compassIsFull = userData.totalAmount >= GOAL_AMOUNT;

        if (mapIsComplete && compassIsFull) {
            updateUserData({ ...userData, isGameWon: true });
            showTreasureLocation();
        }
    }

    // 顯示最終結果的函式
    function showTreasureLocation() {
        mapBoard.style.boxShadow = '0 0 30px 10px #ffd54f';
        mapBoard.style.transition = 'box-shadow 1s';
        compassNeedle.style.transform = 'rotate(360deg)';
        
        setTimeout(() => {
            alert('恭喜你！匠心地圖已然完整，微笑之心也因你的信賴而閃耀。你已理解它的真諦！請至【服務台】出示此畫面，領取你的「傳承之禮」！');
        }, 1200);
    }

    // 處理探索碼
    function handleDiscover(pieceId) {
        if (!userData.collectedMapPieces.includes(pieceId)) {
            const newCollectedPieces = [...userData.collectedMapPieces, pieceId].sort();
            updateUserData({ ...userData, collectedMapPieces: newCollectedPieces });
            alert(`恭喜！你領悟了一片匠心碎片： #${pieceId.substring(1)}！`);
            checkWinCondition();
        } else {
            alert('這片匠心你已經領悟過了喔！');
        }
    }

    // 處理消費碼
    function handlePurchase(storeId) {
        modalStoreName.textContent = `在 ${storeId} 店家`;
        purchaseModal.style.display = 'flex';
        
        const submitHandler = () => {
            const amount = parseInt(amountInput.value, 10);
            if (isNaN(amount) || amount <= 0) {
                alert('請輸入有效的金額！');
                return;
            }
            const newTotalAmount = userData.totalAmount + amount;
            updateUserData({ ...userData, totalAmount: newTotalAmount });
            closeModal();
            alert(`感謝您的支持！信賴指數增加了 ${amount} 點！`);
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

    // --- 初始化程式 ---
    function init() {
        const savedData = localStorage.getItem('eventUserData');
        if (savedData) {
            userData = { ...defaultUserData, ...JSON.parse(savedData) };
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
                if(pieceId) handleDiscover(pieceId);
            } else if (type === 'purchase') {
                const storeId = urlParams.get('store_id');
                if(storeId) handlePurchase(storeId);
            }
            history.replaceState(null, '', window.location.pathname);
        }
    }

    init();
});