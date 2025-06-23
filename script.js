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

    // ===== ▼▼▼ 新增的店家資料對照表 ▼▼▼ =====
    const storeData = {
        'A01': '老王的手工皮件',
        'A02': '小草的溫暖織物',
        'A03': '阿明設計工作室',
        'A04': '山谷裡的烘焙坊',
        'A05': '轉角那間咖啡廳',
        // --- 請在這裡將您所有店家的名稱填寫完畢 ---
        // 'A06': '下一個店家名稱',
        // ...
        'A40': '最後一個店家名稱'
    };
    // =====================================

    const defaultUserData = { collectedMapPieces: [], totalAmount: 0, isGameWon: false };
    let userData = { ...defaultUserData };

    // --- 函式定義 ---

    function showAlert(message) { /* ... 內容不變 ... */ }
    function updateUserData(data) { /* ... 內容不變 ... */ }
    function renderMap() { /* ... 內容不變 ... */ }
    function renderCompass() { /* ... 內容不變 ... */ }
    function renderAll() { /* ... 內容不變 ... */ }
    function checkWinCondition() { /* ... 內容不變 ... */ }
    function showTreasureLocation() { /* ... 內容不變 ... */ }
    function handleDiscover(pieceId) { /* ... 內容不變 ... */ }
    
    // 舊有函式內容，為求簡潔省略，請參考您原有的檔案，底下只列出修改的函式
    // ... (此處省略未變動的函式，以節省篇幅)

    // (此處省略未變動的函式，以節省篇幅，請直接複製貼上以確保完整性)
    // 實際上您需要複製的是整個檔案的內容
    
    // ... (The actual response will contain the full code, this is just a thought process summary)
    // The user needs the full file, so I will provide it.
    
    // **新的客製化提示函式**
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

    // ===== ▼▼▼ 主要修改的函式 ▼▼▼ =====
    function handlePurchase(storeId) {
        // 從字典查詢名稱，如果找不到，就用原本的ID
        const storeName = storeData[storeId] || storeId; 
        modalStoreName.textContent = `在 ${storeName} 消費`; // 使用查詢到的名稱

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
    // =====================================

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
