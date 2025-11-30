// Gestion des monnaies
let platine = 100;
let corruption = 0;
let fragments = 0;
let exhaustion = 0;

// État du jeu
let currentBet = null;
let betAmount = 0;
let slotFailCount = 0;

// Mise à jour de l'affichage des monnaies
function updateCurrency() {
    document.getElementById('platine-count').textContent = platine;
    document.getElementById('corruption-count').textContent = corruption;
    document.getElementById('fragments-count').textContent = fragments;
}

// Fonction pour lancer un dé
function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

// Fonction pour lancer plusieurs dés
function rollMultipleDice(count, sides) {
    let total = 0;
    for (let i = 0; i < count; i++) {
        total += rollDice(sides);
    }
    return total;
}

// Fonction pour ajouter un log
function addLog(gameId, message, type = 'info') {
    const logDiv = document.getElementById(`${gameId}-log`);
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logDiv.insertBefore(logEntry, logDiv.firstChild);

    // Garder seulement les 10 derniers logs
    while (logDiv.children.length > 10) {
        logDiv.removeChild(logDiv.lastChild);
    }
}

// ========================================
// NAVIGATION ENTRE LES JEUX
// ========================================

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const game = btn.dataset.game;

        // Mise à jour des boutons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Mise à jour des sections
        document.querySelectorAll('.game-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`${game}-game`).classList.add('active');
    });
});

// ========================================
// JEU 1: ROULETTE CORROMPUE
// ========================================

const rouletteNumbers = [
    { num: 0, color: 'vert' },
    { num: 1, color: 'rouge' }, { num: 2, color: 'noir' }, { num: 3, color: 'rouge' },
    { num: 4, color: 'noir' }, { num: 5, color: 'rouge' }, { num: 6, color: 'noir' },
    { num: 7, color: 'rouge' }, { num: 8, color: 'noir' }, { num: 9, color: 'rouge' },
    { num: 10, color: 'noir' }, { num: 11, color: 'rouge' }, { num: 12, color: 'noir' },
    { num: 13, color: 'rouge' }, { num: 14, color: 'noir' }, { num: 15, color: 'rouge' },
    { num: 16, color: 'noir' }, { num: 17, color: 'rouge' }, { num: 18, color: 'noir' },
    { num: 19, color: 'rouge' }, { num: 20, color: 'noir' }, { num: 21, color: 'rouge' },
    { num: 22, color: 'noir' }, { num: 23, color: 'rouge' }, { num: 24, color: 'noir' },
    { num: 25, color: 'rouge' }, { num: 26, color: 'noir' }, { num: 27, color: 'rouge' },
    { num: 28, color: 'noir' }, { num: 29, color: 'rouge' }, { num: 30, color: 'noir' },
    { num: 31, color: 'rouge' }, { num: 32, color: 'noir' }, { num: 33, color: 'rouge' },
    { num: 34, color: 'noir' }, { num: 35, color: 'rouge' }
];

let rouletteSpinning = false;

// Dessiner la roulette
function drawRoulette(angle = 0) {
    const canvas = document.getElementById('roulette-canvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner les segments
    const angleStep = (Math.PI * 2) / 36;

    rouletteNumbers.forEach((slot, index) => {
        const startAngle = angle + (index * angleStep);
        const endAngle = startAngle + angleStep;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        if (slot.color === 'rouge') {
            ctx.fillStyle = '#8B0000';
        } else if (slot.color === 'noir') {
            ctx.fillStyle = '#1a1a1a';
        } else {
            ctx.fillStyle = '#4B0082';
        }

        ctx.fill();
        ctx.strokeStyle = '#6B46C1';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dessiner le numéro
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + angleStep / 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(slot.num, radius - 30, 5);
        ctx.restore();
    });

    // Indicateur
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX - 10, 30);
    ctx.lineTo(centerX + 10, 30);
    ctx.closePath();
    ctx.fillStyle = '#FFD700';
    ctx.fill();
}

drawRoulette();

// Sélection des paris couleur/pair/impair
document.querySelectorAll('.bet-options .bet-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const betType = btn.dataset.bet;
        const amount = parseInt(document.getElementById('roulette-bet').value);

        if (amount <= 0 || amount > platine) {
            addLog('roulette', 'Mise invalide ou fonds insuffisants !', 'error');
            return;
        }

        currentBet = { type: betType, amount: amount };
        addLog('roulette', `Paris placé: ${betType} pour ${amount} pp`, 'info');
    });
});

// Pari sur un numéro
document.getElementById('bet-number').addEventListener('click', () => {
    const num = parseInt(document.getElementById('number-bet').value);
    const amount = parseInt(document.getElementById('roulette-bet').value);

    if (isNaN(num) || num < 0 || num > 35) {
        addLog('roulette', 'Numéro invalide (0-35) !', 'error');
        return;
    }

    if (amount <= 0 || amount > platine) {
        addLog('roulette', 'Mise invalide ou fonds insuffisants !', 'error');
        return;
    }

    currentBet = { type: 'numero', value: num, amount: amount };
    addLog('roulette', `Paris placé: numéro ${num} pour ${amount} pp`, 'info');
});

// Lancer la roulette
document.getElementById('spin-btn').addEventListener('click', () => {
    if (rouletteSpinning) return;

    if (!currentBet) {
        addLog('roulette', 'Placez d\'abord un pari !', 'error');
        return;
    }

    if (platine < currentBet.amount) {
        addLog('roulette', 'Fonds insuffisants !', 'error');
        return;
    }

    rouletteSpinning = true;
    platine -= currentBet.amount;
    updateCurrency();

    // Animation de rotation
    // Générer une rotation aléatoire finale
    const randomSpins = 5 + Math.random() * 3; // Entre 5 et 8 tours complets
    const randomExtraAngle = Math.random() * Math.PI * 2; // Angle aléatoire supplémentaire
    const totalRotation = (randomSpins * Math.PI * 2) + randomExtraAngle;

    let currentAngle = 0;
    const duration = 3000; // 3 secondes
    const startTime = Date.now();

    const spinInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Fonction d'easing pour ralentir progressivement
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentAngle = totalRotation * easeOut;

        drawRoulette(currentAngle);

        if (progress >= 1) {
            clearInterval(spinInterval);

            // S'assurer que la roue est exactement sur l'angle final
            drawRoulette(totalRotation);

            // Calculer le numéro sur lequel la roulette s'est arrêtée
            // L'indicateur est en haut (à 0 degrés / -PI/2 en radians)
            // Chaque segment fait (360/36) = 10 degrés = (2*PI/36) radians
            const segmentAngle = (Math.PI * 2) / 36; // 10 degrés en radians

            // Normaliser l'angle entre 0 et 2*PI
            const normalizedAngle = ((totalRotation % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);

            // Calculer l'index du segment sous l'indicateur (en haut)
            // On inverse car la roue tourne dans le sens horaire
            let resultIndex = Math.floor((Math.PI * 2 - normalizedAngle + Math.PI / 2) / segmentAngle) % 36;

            // Correction du décalage de -18
            resultIndex = (resultIndex - 18 + 36) % 36;

            const finalResult = rouletteNumbers[resultIndex];

            displayRouletteResult(finalResult);
        }
    }, 16);
});

function displayRouletteResult(result) {
    const resultDiv = document.getElementById('roulette-result');
    resultDiv.textContent = `${result.num} ${result.color.toUpperCase()}`;
    resultDiv.style.display = 'block';

    setTimeout(() => {
        resultDiv.style.display = 'none';
    }, 3000);

    // Vérifier les gains
    let win = false;
    let multiplier = 0;

    if (currentBet.type === 'rouge' && result.color === 'rouge') {
        win = true;
        multiplier = 2;
    } else if (currentBet.type === 'noir' && result.color === 'noir') {
        win = true;
        multiplier = 2;
    } else if (currentBet.type === 'vert' && result.color === 'vert') {
        win = true;
        multiplier = 35;
    } else if (currentBet.type === 'pair' && result.num % 2 === 0 && result.num !== 0) {
        win = true;
        multiplier = 2;
    } else if (currentBet.type === 'impair' && result.num % 2 === 1) {
        win = true;
        multiplier = 2;
    } else if (currentBet.type === 'numero' && result.num === currentBet.value) {
        win = true;
        multiplier = 35;
    }

    if (win) {
        const winAmount = currentBet.amount * multiplier;
        corruption += winAmount;
        addLog('roulette', `🎉 VICTOIRE ! +${winAmount} pièces de corruption (x${multiplier})`, 'success');
    } else {
        addLog('roulette', `Perdu... Résultat: ${result.num} ${result.color}`, 'error');
    }

    updateCurrency();
    currentBet = null;
    rouletteSpinning = false;
}

// ========================================
// JEU 2: LOOTBOXES
// ========================================

const lootboxData = {
    fletrie: {
        cost: 5,
        runeChance: 0.4,
        fragmentDice: '1d4',
        rarities: { rare: 1.0 }
    },
    malveillante: {
        cost: 10,
        runeChance: 0.55,
        fragmentDice: '1d6',
        rarities: { rare: 0.8, superRare: 0.2 }
    },
    abysses: {
        cost: 20,
        runeChance: 0.75,
        fragmentDice: '1d8',
        rarities: { rare: 0.5, superRare: 0.35, legendaire: 0.15, speciale: 0.05, unique: 0.01 }
    },
    occulte: {
        cost: 40,
        runeChance: 0.9,
        fragmentDice: '2d6',
        rarities: { rare: 0.3, superRare: 0.4, legendaire: 0.25, speciale: 0.2, unique: 0.05 }
    },
    interdite: {
        cost: 100,
        runeChance: 1.0,
        fragmentDice: null,
        rarities: { rare: 0, superRare: 0.2, legendaire: 0.5, speciale: 0.25, unique: 0.05 }
    }
};

const runeTypes = ['Attaque', 'Dégâts', 'Contrôle', 'Spéciale', 'Unique'];
const rarityColors = {
    rare: '🔵',
    superRare: '🟡',
    legendaire: '🟣',
    speciale: '⭐',
    unique: '⚫'
};

const rarityNames = {
    rare: 'Rare',
    superRare: 'Super-Rare',
    legendaire: 'Légendaire',
    speciale: 'Spéciale',
    unique: 'Unique'
};

document.querySelectorAll('.buy-box-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const boxType = btn.parentElement.dataset.box;
        const box = lootboxData[boxType];

        if (corruption < box.cost) {
            addLog('lootbox', 'Pièces de corruption insuffisantes !', 'error');
            return;
        }

        corruption -= box.cost;
        updateCurrency();

        openLootbox(boxType, box);
    });
});

// Boutons de détails des lootboxes
const lootboxDetails = {
    fletrie: {
        name: 'Boîte Flétrie',
        cost: 5,
        runeChance: '40%',
        fragmentChance: '60%',
        fragmentAmount: '1d4 (1-4)',
        rarities: [
            { name: 'Rare 🔵', chance: '100%' }
        ]
    },
    malveillante: {
        name: 'Boîte Malveillante',
        cost: 10,
        runeChance: '55%',
        fragmentChance: '45%',
        fragmentAmount: '1d6 (1-6)',
        rarities: [
            { name: 'Rare 🔵', chance: '80%' },
            { name: 'Super-Rare 🟡', chance: '20%' }
        ]
    },
    abysses: {
        name: 'Boîte des Abysses',
        cost: 20,
        runeChance: '75%',
        fragmentChance: '25%',
        fragmentAmount: '1d8 (1-8)',
        rarities: [
            { name: 'Rare 🔵', chance: '50%' },
            { name: 'Super-Rare 🟡', chance: '35%' },
            { name: 'Légendaire 🟣', chance: '15%' },
            { name: 'Spéciale ⭐', chance: '5%' },
            { name: 'Unique ⚫', chance: '1%' }
        ]
    },
    occulte: {
        name: 'Boîte Occulte',
        cost: 40,
        runeChance: '90%',
        fragmentChance: '10%',
        fragmentAmount: '2d6 (2-12)',
        rarities: [
            { name: 'Rare 🔵', chance: '30%' },
            { name: 'Super-Rare 🟡', chance: '40%' },
            { name: 'Légendaire 🟣', chance: '25%' },
            { name: 'Spéciale ⭐', chance: '20%' },
            { name: 'Unique ⚫', chance: '5%' }
        ]
    },
    interdite: {
        name: 'Boîte Interdite',
        cost: 100,
        runeChance: '100%',
        fragmentChance: '0%',
        fragmentAmount: 'Aucun',
        rarities: [
            { name: 'Super-Rare 🟡', chance: '20%' },
            { name: 'Légendaire 🟣', chance: '50%' },
            { name: 'Spéciale ⭐', chance: '25%' },
            { name: 'Unique ⚫', chance: '5%' }
        ]
    }
};

document.querySelectorAll('.details-box-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const boxType = btn.dataset.box;
        const details = lootboxDetails[boxType];

        const modal = document.getElementById('lootbox-details-modal');
        const modalName = document.getElementById('modal-box-name');
        const modalDetails = document.getElementById('modal-box-details');

        modalName.textContent = details.name;

        let detailsHTML = `
            <div class="details-section">
                <p class="detail-item"><strong>Coût:</strong> ${details.cost} 💜</p>
                <p class="detail-item"><strong>Chance de Rune:</strong> ${details.runeChance}</p>
                <p class="detail-item"><strong>Chance de Fragments:</strong> ${details.fragmentChance}</p>
                <p class="detail-item"><strong>Fragments possibles:</strong> ${details.fragmentAmount}</p>
            </div>
            <div class="details-section">
                <h4>Raretés des Runes:</h4>
                <ul class="rarity-list">
        `;

        details.rarities.forEach(rarity => {
            detailsHTML += `<li>${rarity.name} - ${rarity.chance}</li>`;
        });

        detailsHTML += `
                </ul>
            </div>
            <div class="details-section">
                <p class="detail-note"><em>Types de runes: Attaque, Dégâts, Contrôle, Spéciale, Unique</em></p>
            </div>
        `;

        modalDetails.innerHTML = detailsHTML;
        modal.style.display = 'flex';
    });
});

// Fermer le modal
document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('lootbox-details-modal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('lootbox-details-modal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

function openLootbox(boxType, box) {
    const animationDiv = document.getElementById('lootbox-animation');
    const rewardDiv = document.getElementById('lootbox-reward');

    // Animation d'ouverture
    animationDiv.style.display = 'flex';
    rewardDiv.textContent = '📦 Ouverture...';

    setTimeout(() => {
        const isRune = Math.random() < box.runeChance;

        if (isRune) {
            // Déterminer la rareté
            const rand = Math.random();
            let cumulativeChance = 0;
            let rarity = 'rare';

            for (const [rarityKey, chance] of Object.entries(box.rarities)) {
                cumulativeChance += chance;
                if (rand <= cumulativeChance) {
                    rarity = rarityKey;
                    break;
                }
            }

            // Choisir un type de rune
            const runeType = runeTypes[Math.floor(Math.random() * runeTypes.length)];

            rewardDiv.innerHTML = `
                <div class="rune-reward ${rarity}">
                    ${rarityColors[rarity]} RUNE ${rarityNames[rarity].toUpperCase()}<br>
                    Type: ${runeType}
                </div>
            `;
            addLog('lootbox', `Rune obtenue: ${rarityNames[rarity]} - ${runeType} ${rarityColors[rarity]}`, 'success');
        } else {
            // Fragments
            let fragmentAmount = 0;
            if (box.fragmentDice === '1d4') fragmentAmount = rollDice(4);
            else if (box.fragmentDice === '1d6') fragmentAmount = rollDice(6);
            else if (box.fragmentDice === '1d8') fragmentAmount = rollDice(8);
            else if (box.fragmentDice === '2d6') fragmentAmount = rollMultipleDice(2, 6);

            fragments += fragmentAmount;
            updateCurrency();

            rewardDiv.innerHTML = `
                <div class="fragment-reward">
                    🧩 ${fragmentAmount} Fragments de Rune
                </div>
            `;
            addLog('lootbox', `${fragmentAmount} fragments de rune obtenus !`, 'info');
        }

        setTimeout(() => {
            animationDiv.style.display = 'none';
        }, 3000);
    }, 1500);
}

// ========================================
// JEU 3: MACHINE À SOUS
// ========================================

const slotSymbols = [
    { symbol: '💀', name: 'Crâne violet', weight: 20, reward: 'Objet rare', partial: 1 },
    { symbol: '🔥', name: 'Flamme noire', weight: 15, reward: 'Objet super-rare', partial: 2 },
    { symbol: '👁️', name: 'Œil violet', weight: 5, reward: 'Objet légendaire', partial: 3 },
    { symbol: '💎', name: 'Fragment maudit', weight: 25, reward: '5d4 fragments', partial: 1 },
    { symbol: '🪙', name: 'Pièce maudite', weight: 20, reward: '50 pièces corruption', partial: 2 },
    { symbol: '❌', name: 'Griffe ratée', weight: 15, reward: 'Rien', partial: 0 }
];

const slotMessages = [
    "Encore ?",
    "Ton âme vibre d'espoir... inutile.",
    "Les dés sont pipés, mortel.",
    "Tu reviendras...",
    "La corruption te guette."
];

function getWeightedSymbol() {
    const totalWeight = slotSymbols.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;

    for (const symbol of slotSymbols) {
        rand -= symbol.weight;
        if (rand <= 0) {
            return symbol;
        }
    }
    return slotSymbols[0];
}

let slotSpinning = false;

document.getElementById('slot-spin-btn').addEventListener('click', () => {
    if (slotSpinning) return;

    if (corruption < 5) {
        addLog('slot', 'Pièces de corruption insuffisantes (5 requis) !', 'error');
        return;
    }

    corruption -= 5;
    updateCurrency();
    slotSpinning = true;

    // Message aléatoire de la machine
    const msgDiv = document.getElementById('slot-message');
    msgDiv.textContent = slotMessages[Math.floor(Math.random() * slotMessages.length)];

    // Animation des rouleaux
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];

    const results = [
        getWeightedSymbol(),
        getWeightedSymbol(),
        getWeightedSymbol()
    ];

    // Animation de rotation
    let spins = 0;
    const maxSpins = 20;

    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            const randomSymbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            reel.querySelector('.symbol').textContent = randomSymbol.symbol;
        });

        spins++;

        if (spins >= maxSpins) {
            clearInterval(spinInterval);

            // Afficher les résultats finaux
            reels[0].querySelector('.symbol').textContent = results[0].symbol;
            reels[1].querySelector('.symbol').textContent = results[1].symbol;
            reels[2].querySelector('.symbol').textContent = results[2].symbol;

            processSlotResult(results);
        }
    }, 100);
});

function processSlotResult(results) {
    const [s1, s2, s3] = results;

    // Vérifier triple alignement
    if (s1.symbol === s2.symbol && s2.symbol === s3.symbol) {
        handleTripleMatch(s1);
        slotFailCount = 0;
    }
    // Vérifier double alignement
    else if (s1.symbol === s2.symbol || s2.symbol === s3.symbol || s1.symbol === s3.symbol) {
        const matchedSymbol = s1.symbol === s2.symbol ? s1 : (s2.symbol === s3.symbol ? s2 : s1);
        handlePartialMatch(matchedSymbol);
        slotFailCount = 0;
    }
    // Échec
    else {
        addLog('slot', 'Aucune combinaison...', 'error');
        slotFailCount++;

        // Système d'épuisement
        if (slotFailCount >= 3) {
            exhaustion++;
            slotFailCount = 0;

            const exhaustionWarning = document.getElementById('exhaustion-warning');
            const exhaustionCount = document.getElementById('exhaustion-count');
            exhaustionWarning.style.display = 'block';
            exhaustionCount.textContent = exhaustion;

            addLog('slot', `⚠️ Point d'épuisement gagné ! (${exhaustion}/6)`, 'danger');

            if (exhaustion >= 6) {
                addLog('slot', '💀 TU ES MORT ! La corruption t\'a consumé...', 'danger');
                document.getElementById('slot-spin-btn').disabled = true;
            }
        }
    }

    document.getElementById('fail-count').textContent = slotFailCount;
    slotSpinning = false;
}

function handleTripleMatch(symbol) {
    addLog('slot', `🎉 TRIPLE ! ${symbol.symbol}${symbol.symbol}${symbol.symbol}`, 'success');

    switch (symbol.symbol) {
        case '💀':
            addLog('slot', '🎁 Objet Rare obtenu !', 'success');
            break;
        case '🔥':
            addLog('slot', '🎁 Objet Super-Rare obtenu !', 'success');
            break;
        case '👁️':
            addLog('slot', '🎁 Objet LÉGENDAIRE obtenu !', 'success');
            break;
        case '💎':
            const fragmentWin = rollMultipleDice(5, 4);
            fragments += fragmentWin;
            addLog('slot', `🧩 ${fragmentWin} fragments de rune obtenus !`, 'success');
            break;
        case '🪙':
            corruption += 50;
            addLog('slot', '💜 +50 pièces de corruption !', 'success');
            break;
        case '❌':
            addLog('slot', '💀 Effet néfaste... Malus temporaire appliqué.', 'danger');
            break;
    }

    updateCurrency();
}

function handlePartialMatch(symbol) {
    if (symbol.partial > 0) {
        fragments += symbol.partial;
        addLog('slot', `Combinaison partielle ! +${symbol.partial} fragment(s)`, 'info');
        updateCurrency();
    } else {
        addLog('slot', 'Combinaison partielle sans gain...', 'error');
    }
}

// ========================================
// PAGE D'ÉCHANGE DE RUNES
// ========================================

const rarityDisplayNames = {
    rare: 'Rare',
    'super-rare': 'Super-Rare',
    legendary: 'Légendaire'
};

const rarityEmojis = {
    rare: '🔵',
    'super-rare': '🟡',
    legendary: '🟣'
};

document.querySelectorAll('.exchange-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const rarity = btn.dataset.rarity;
        const cost = parseInt(btn.dataset.cost);

        if (fragments < cost) {
            addLog('exchange', `Fragments insuffisants ! (${cost} requis)`, 'error');
            return;
        }

        // Déterminer le type sélectionné
        let runeType = '';
        if (rarity === 'rare') {
            runeType = document.getElementById('rare-type').value;
        } else if (rarity === 'super-rare') {
            runeType = document.getElementById('super-rare-type').value;
        } else if (rarity === 'legendary') {
            runeType = document.getElementById('legendary-type').value;
        }

        // Déduire les fragments
        fragments -= cost;
        updateCurrency();

        // Afficher le résultat
        addLog('exchange', `${rarityEmojis[rarity]} Rune ${rarityDisplayNames[rarity]} de type ${runeType} achetée pour ${cost} fragments !`, 'success');
    });
});

// ========================================
// PAGE CHEAT
// ========================================

document.querySelectorAll('.cheat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const resource = btn.dataset.resource;
        let value = 0;

        switch(resource) {
            case 'platine':
                value = parseInt(document.getElementById('cheat-platine').value);
                if (value >= 0) {
                    platine = value;
                    addLog('cheat', `Pièces de platine modifiées: ${value} pp`, 'success');
                }
                break;
            case 'corruption':
                value = parseInt(document.getElementById('cheat-corruption').value);
                if (value >= 0) {
                    corruption = value;
                    addLog('cheat', `Pièces de corruption modifiées: ${value} 💜`, 'success');
                }
                break;
            case 'fragments':
                value = parseInt(document.getElementById('cheat-fragments').value);
                if (value >= 0) {
                    fragments = value;
                    addLog('cheat', `Fragments de rune modifiés: ${value} 🧩`, 'success');
                }
                break;
            case 'exhaustion':
                value = parseInt(document.getElementById('cheat-exhaustion').value);
                if (value >= 0 && value <= 6) {
                    exhaustion = value;
                    document.getElementById('exhaustion-count').textContent = exhaustion;

                    if (exhaustion > 0) {
                        document.getElementById('exhaustion-warning').style.display = 'block';
                    } else {
                        document.getElementById('exhaustion-warning').style.display = 'none';
                    }

                    if (exhaustion >= 6) {
                        document.getElementById('slot-spin-btn').disabled = true;
                        addLog('cheat', `Points d'épuisement modifiés: ${value}/6 (Machine bloquée)`, 'danger');
                    } else {
                        document.getElementById('slot-spin-btn').disabled = false;
                        addLog('cheat', `Points d'épuisement modifiés: ${value}/6`, 'success');
                    }
                }
                break;
        }

        updateCurrency();
    });
});

// Bouton de réinitialisation
document.querySelector('.cheat-reset-btn').addEventListener('click', () => {
    platine = 100;
    corruption = 0;
    fragments = 0;
    exhaustion = 0;
    slotFailCount = 0;

    document.getElementById('cheat-platine').value = 100;
    document.getElementById('cheat-corruption').value = 0;
    document.getElementById('cheat-fragments').value = 0;
    document.getElementById('cheat-exhaustion').value = 0;
    document.getElementById('exhaustion-count').textContent = 0;
    document.getElementById('fail-count').textContent = 0;
    document.getElementById('exhaustion-warning').style.display = 'none';
    document.getElementById('slot-spin-btn').disabled = false;

    updateCurrency();
    addLog('cheat', 'Toutes les ressources ont été réinitialisées !', 'info');
});

// Initialisation
updateCurrency();
