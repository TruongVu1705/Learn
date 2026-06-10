let players = [];
let action = "";
let historyData = [];

const START_MONEY = 10000000000;

// MQTT & Room globals
let mqttClient = null;
let myClientId = localStorage.getItem("monopolyClientId") || "user_" + Math.random().toString(36).substring(2, 9);
localStorage.setItem("monopolyClientId", myClientId);

let isHost = false;
let roomId = "";
let myPlayerName = "";
let hostId = null;

const BROKER_URL = "wss://broker.hivemq.com:8884/mqtt";
const TOPIC_PREFIX = "antigravity_monopoly/rooms";


/* ---------- AUDIO SYSTEM ---------- */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'add') {
        // Coin/Ting sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.1); // E6
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    } else if (type === 'subtract') {
        // Pay/Error sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'transfer') {
        // Whoosh sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(600, now + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        osc2.connect(gainNode);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'start') {
        // Start game melody
        osc.type = 'square';
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, i) => {
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
        });
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'reset') {
        // Boom/Reset
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    }
}

/* ---------- STORAGE ---------- */
function saveData() {
    localStorage.setItem("monopolyPlayers", JSON.stringify(players));
    localStorage.setItem("monopolyHistory", JSON.stringify(historyData));
    if (isHost) {
        publishState();
    }
}

function loadData() {
    roomId = localStorage.getItem("monopolyRoomId");
    const isHostStr = localStorage.getItem("monopolyIsHost");
    myPlayerName = localStorage.getItem("monopolyMyPlayerName") || "";
    
    if (roomId && isHostStr !== null) {
        isHost = isHostStr === "true";
        if (isHost) {
            hostId = myClientId;
        }
        
        const cachedPlayers = localStorage.getItem("monopolyPlayers");
        const cachedHistory = localStorage.getItem("monopolyHistory");
        if (cachedPlayers) players = JSON.parse(cachedPlayers);
        if (cachedHistory) historyData = JSON.parse(cachedHistory);
        
        document.getElementById("roomCodeDisplay").innerText = roomId;
        showPage(2);
        updateScoreList();
        updateHistory();
        updateHostControlsVisibility();
        
        // Connect to MQTT to sync
        connectMQTT();
    } else {
        showPage(1);
    }
}

function formatMoney(num) {
    return num.toLocaleString("vi-VN") + " VND";
}


/* ---------- PAGE ---------- */
function showPage(n) {
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    document.getElementById("page" + n).classList.remove("hidden");
}

/* ---------- PAGE 1 (ROOMS) ---------- */
function switchTab(tab) {
    const tabCreateBtn = document.getElementById("tabCreateBtn");
    const tabJoinBtn = document.getElementById("tabJoinBtn");
    const createRoomSection = document.getElementById("createRoomSection");
    const joinRoomSection = document.getElementById("joinRoomSection");
    
    if (tab === 'create') {
        tabCreateBtn.classList.add("active");
        tabJoinBtn.classList.remove("active");
        createRoomSection.classList.remove("hidden");
        joinRoomSection.classList.add("hidden");
    } else {
        tabCreateBtn.classList.remove("active");
        tabJoinBtn.classList.add("active");
        createRoomSection.classList.add("hidden");
        joinRoomSection.classList.remove("hidden");
    }
}

function createRoom() {
    const playerCountInput = document.getElementById("playerCount");
    const count = parseInt(playerCountInput.value) || 0;
    
    if (count <= 0) {
        alert("Vui lòng nhập số người chơi hợp lệ!");
        return;
    }
    
    players = [];
    for (let i = 0; i < count; i++) {
        const nameInput = document.getElementById(`playerName${i}`);
        const name = nameInput ? nameInput.value.trim() : "";
        players.push({
            name: name || `Người chơi ${i + 1}`,
            money: START_MONEY
        });
    }
    
    isHost = true;
    roomId = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    myPlayerName = "Host";
    hostId = myClientId;
    
    historyData = [{
        type: "start",
        text: `🎩 Phòng game được tạo (Mã: ${roomId})`,
        time: new Date().toLocaleString("vi-VN")
    }];
    
    localStorage.setItem("monopolyRoomId", roomId);
    localStorage.setItem("monopolyIsHost", "true");
    localStorage.setItem("monopolyMyPlayerName", myPlayerName);
    saveData();
    
    document.getElementById("roomCodeDisplay").innerText = roomId;
    showPage(2);
    updateScoreList();
    updateHistory();
    updateHostControlsVisibility();
    
    playSound('start');
    
    connectMQTT();
}

function joinRoom() {
    const roomCodeInput = document.getElementById("roomCodeInput");
    const roomCodeVal = roomCodeInput.value.trim().toUpperCase();
    
    if (!roomCodeVal) {
        alert("Vui lòng nhập mã phòng!");
        return;
    }
    
    const connectionStatusDiv = document.getElementById("connectionStatus");
    const statusText = document.getElementById("statusMessageText");
    connectionStatusDiv.classList.remove("hidden");
    statusText.innerText = "Đang kết nối tới máy chủ...";
    
    isHost = false;
    roomId = roomCodeVal;
    
    if (window.joinTimeoutId) clearTimeout(window.joinTimeoutId);
    
    window.joinTimeoutId = setTimeout(() => {
        alert("Không tìm thấy phòng hoặc chủ phòng không hoạt động!");
        connectionStatusDiv.classList.add("hidden");
        if (mqttClient) {
            mqttClient.end();
            mqttClient = null;
        }
        updateStatusBadge("disconnected");
    }, 8000);
    
    connectMQTT();
}

/* ---------- MQTT COMMUNICATION ---------- */
function connectMQTT() {
    updateStatusBadge("connecting");
    
    if (mqttClient) {
        try { mqttClient.end(); } catch(e) {}
    }
    
    mqttClient = mqtt.connect(BROKER_URL, {
        clientId: myClientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 2000
    });
    
    mqttClient.on('connect', () => {
        console.log("MQTT Connected");
        updateStatusBadge("connected");
        
        if (isHost) {
            publishState();
        } else {
            mqttClient.subscribe(`${TOPIC_PREFIX}/${roomId}/state`, (err) => {
                if (err) console.error("Subscribe state error", err);
            });
        }
    });
    
    mqttClient.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log("MQTT Message:", topic, data);
            
            if (topic === `${TOPIC_PREFIX}/${roomId}/state` && !isHost) {
                handleStateUpdate(data);
            }
        } catch (e) {
            console.error("Error processing message", e);
        }
    });
    
    mqttClient.on('close', () => {
        console.log("MQTT Connection Closed");
        updateStatusBadge("disconnected");
    });
    
    mqttClient.on('error', (err) => {
        console.error("MQTT Error", err);
        updateStatusBadge("disconnected");
    });
}

function handleStateUpdate(data) {
    if (isHost) return;
    
    if (data.disbanded) {
        alert("Chủ phòng đã giải tán phòng!");
        localStorage.clear();
        location.reload();
        return;
    }
    
    if (window.joinTimeoutId) {
        clearTimeout(window.joinTimeoutId);
        window.joinTimeoutId = null;
        document.getElementById("connectionStatus").classList.add("hidden");
    }
    
    players = data.players;
    historyData = data.history;
    hostId = data.hostId;
    roomId = data.roomId;
    
    localStorage.setItem("monopolyRoomId", roomId);
    localStorage.setItem("monopolyIsHost", "false");
    
    localStorage.setItem("monopolyPlayers", JSON.stringify(players));
    localStorage.setItem("monopolyHistory", JSON.stringify(historyData));
    
    document.getElementById("roomCodeDisplay").innerText = roomId;
    showPage(2);
    updateScoreList();
    updateHistory();
    updateHostControlsVisibility();
}

function publishState() {
    if (!mqttClient || !mqttClient.connected || !isHost) return;
    const state = {
        players: players,
        history: historyData,
        hostId: myClientId,
        roomId: roomId
    };
    mqttClient.publish(`${TOPIC_PREFIX}/${roomId}/state`, JSON.stringify(state), { qos: 1, retain: true });
}

function updateStatusBadge(status) {
    const badge = document.getElementById("roomStatusBadge");
    if (!badge) return;
    badge.className = "badge";
    if (status === "connected") {
        badge.classList.add("badge-connected");
        badge.innerText = "🟢 Đã kết nối";
    } else if (status === "disconnected") {
        badge.classList.add("badge-disconnected");
        badge.innerText = "🔴 Mất kết nối";
    } else if (status === "connecting") {
        badge.classList.add("badge-loading");
        badge.innerText = "🟡 Đang kết nối...";
    }
}

function updateHostControlsVisibility() {
    const resetMoneyBtn = document.getElementById("resetMoneyBtn");
    const resetAllBtn = document.getElementById("resetAllBtn");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");
    
    if (!resetMoneyBtn || !resetAllBtn || !clearHistoryBtn) return;
    
    if (isHost) {
        resetMoneyBtn.classList.remove("hidden");
        clearHistoryBtn.classList.remove("hidden");
        resetAllBtn.innerText = "🗑️ Giải tán phòng / Reset";
    } else {
        resetMoneyBtn.classList.add("hidden");
        clearHistoryBtn.classList.add("hidden");
        resetAllBtn.innerText = "🚪 Thoát phòng";
    }
}

/* ---------- PAGE 2 ---------- */
function updateScoreList() {
    scoreList.innerHTML = "";
    players.forEach((p, i) => {
        scoreList.innerHTML += `
            <div class="player-row">
                <div class="player-info">
                    <strong>${p.name}</strong>
                    <span>${p.money.toLocaleString("vi-VN")} VND</span>
                </div>
                ${isHost ? `
                <div class="player-actions">
                    <button class="action-btn add-btn" onclick="quickAdd(${i})">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="action-btn subtract-btn" onclick="quickSubtract(${i})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="action-btn transfer-btn" onclick="quickTransfer(${i})">
                        <i class="fas fa-exchange-alt"></i>
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    });
}

function goToPage3(type, playerIndex) {
    if (!isHost) {
        alert("Chỉ chủ phòng mới có quyền thực hiện giao dịch!");
        return;
    }
    action = type;
    showPage(3);

    if (type === "transfer") {
        singlePlayer.classList.add("hidden");
        transferPlayers.classList.remove("hidden");
        
        fromPlayer.innerHTML = "";
        toPlayer.innerHTML = "";
        players.forEach((p, i) => {
            fromPlayer.innerHTML += `<option value="${i}">${p.name}</option>`;
            toPlayer.innerHTML += `<option value="${i}">${p.name}</option>`;
        });
        
        if (playerIndex !== undefined) {
            fromPlayer.value = playerIndex;
        }
    } else {
        singlePlayer.classList.remove("hidden");
        transferPlayers.classList.add("hidden");
        
        selectedPlayer.innerText = players[playerIndex].name;
        playerIndex_global = playerIndex;
    }

    actionTitle.innerText =
        type === "add" ? "➕ Cộng tiền" :
        type === "subtract" ? "➖ Trừ tiền" :
        "🔁 Chuyển tiền";
}

let playerIndex_global = null;

function quickAdd(playerIndex) {
    goToPage3('add', playerIndex);
}

function quickSubtract(playerIndex) {
    goToPage3('subtract', playerIndex);
}

function quickTransfer(playerIndex) {
    goToPage3('transfer', playerIndex);
}

/* ---------- MONEY ---------- */
function toggleCustomMoney() {
    customMoney.classList.toggle("hidden", moneySelect.value !== "custom");
    customMoney.value = "";
    customMoney.dataset.raw = "";
}

/* ✅ FIX CUỐI – KHÔNG SINH SỐ ẢO */
function handleMoneyInput(input) {
    let raw = input.value.replace(/\./g, "").replace(/\D/g, "");
    raw = raw.replace(/^0+/, "");
    if (raw === "") raw = "0";
    input.dataset.raw = raw;
    input.value = Number(raw).toLocaleString("vi-VN");
}

function getAmount() {
    if (moneySelect.value === "custom") {
        return Number(customMoney.dataset.raw || 0);
    }
    return Number(moneySelect.value);
}

function applyMoney() {
    const amount = getAmount();
    if (amount <= 0) return alert("Số tiền không hợp lệ");

    const time = new Date().toLocaleString("vi-VN");

    if (action === "add" || action === "subtract") {
        const i = playerIndex_global;

        players[i].money += action === "add" ? amount : -amount;

        historyData.unshift({
            type: action,
            text:
                action === "add"
                    ? `➕ ${players[i].name} được cộng ${formatMoney(amount)}`
                    : `➖ ${players[i].name} bị trừ ${formatMoney(amount)}`,
            time
        });
        
        playSound(action === 'add' ? 'add' : 'subtract');
    }

    if (action === "transfer") {
        const from = fromPlayer.value;
        const to = toPlayer.value;

        if (from === to) return alert("Không thể tự chuyển");
        if (players[from].money < amount) return alert("Không đủ tiền");

        players[from].money -= amount;
        players[to].money += amount;

        historyData.unshift({
            type: "transfer",
            text: `🔁 ${players[from].name} chuyển ${formatMoney(amount)} cho ${players[to].name}`,
            time
        });
        
        playSound('transfer');
    }

    saveData();
    updateScoreList();
    updateHistory();
    backToPage2();
}

function updateHistory() {
    historyList.innerHTML = "";

    historyData.forEach(item => {
        historyList.innerHTML += `
            <div class="history-item">
                ${item.text}<br>
                <small>${item.time}</small>
            </div>
        `;
    });
}

function clearHistory() {
    if (confirm("Xóa toàn bộ lịch sử?")) {
        historyData = [];
        saveData();
        updateHistory();
        playSound('reset');
    }
}


/* ---------- RESET ---------- */
function resetMoney() {
    players.forEach(p => p.money = START_MONEY);
    saveData();
    updateScoreList();
    playSound('reset');
}

function resetAll() {
    const confirmMsg = isHost 
        ? "Bạn có chắc chắn muốn giải tán phòng và xóa toàn bộ dữ liệu?" 
        : "Bạn có chắc chắn muốn thoát khỏi phòng?";
        
    if (confirm(confirmMsg)) {
        playSound('reset');
        if (isHost && mqttClient && mqttClient.connected) {
            // Publish disbanded state
            mqttClient.publish(`${TOPIC_PREFIX}/${roomId}/state`, JSON.stringify({ disbanded: true }), { qos: 1, retain: true });
        }
        setTimeout(() => {
            localStorage.clear();
            location.reload();
        }, 400); // Đợi âm thanh chạy xong mới reload
    }
}

function backToPage2() {
    showPage(2);
}

/* ---------- INIT ---------- */
const playerCountInput = document.getElementById("playerCount");
const nameInputsDiv = document.getElementById("nameInputs");
if (playerCountInput && nameInputsDiv) {
    playerCountInput.addEventListener("input", () => {
        nameInputsDiv.innerHTML = "";
        const count = parseInt(playerCountInput.value) || 0;
        for (let i = 0; i < count; i++) {
            nameInputsDiv.innerHTML +=
                `<input id="playerName${i}" placeholder="Tên người chơi ${i + 1}">`;
        }
    });
}

loadData();
