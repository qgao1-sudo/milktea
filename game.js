// Game State
const gameState = {
    money: 100,
    reputation: 0,
    day: 1,
    time: 9.0, // 9:00 AM
    upgrades: [],
    menu: [
        { name: "Classic Milk Tea", price: 4.5, recipe: {} }
    ],
    currentCustomer: null,
    customerQueue: [],
    currentDrink: {
        base: null,
        sweetness: 5,
        syrup: null,
        ingredients: [],
        toppings: [],
        seal: null,
        shakeQuality: 0
    },
    currentStep: 1,
    researches: {},
    stats: {
        drinksServed: 0,
        perfectDrinks: 0,
        totalEarnings: 0
    }
};

// Customer Types and Templates
const customerTypes = {
    clear: {
        probability: 0.3,
        name: "Clear Customer",
        orderStyle: "specific",
        tolerance: 0.8 // Low tolerance for mistakes
    },
    descriptive: {
        probability: 0.4,
        name: "Descriptive Customer",
        orderStyle: "descriptive",
        tolerance: 0.6
    },
    challenge: {
        probability: 0.2,
        name: "Challenge Customer",
        orderStyle: "challenge",
        tolerance: 0.4,
        reward: 2.0 // Double reward
    },
    special: {
        probability: 0.1,
        name: "Special Customer",
        orderStyle: "special",
        tolerance: 0.9
    }
};

// Customer Database
const customers = [
    // Clear Customers
    {
        name: "Sarah",
        type: "clear",
        avatar: "👩",
        order: {
            text: "I want a large milk tea with pearls, 30% sugar, less ice, and add coconut jelly.",
            requirements: {
                base: "black-tea",
                sweetness: 3,
                ingredients: ["fresh-milk"],
                toppings: ["black-pearl", "coconut-jelly"]
            }
        }
    },
    {
        name: "Mike",
        type: "clear",
        avatar: "👨",
        order: {
            text: "Green tea with oat milk, half sugar, add white pearls please.",
            requirements: {
                base: "green-tea",
                sweetness: 5,
                ingredients: ["oat-milk"],
                toppings: ["white-pearl"]
            }
        }
    },
    // Descriptive Customers
    {
        name: "Emma",
        type: "descriptive",
        avatar: "👧",
        order: {
            text: "Give me something that makes me happy, but not too sweet!",
            hints: ["❤️", "🌸"],
            requirements: {
                base: ["jasmine-tea", "four-season-tea"],
                sweetness: [4, 5, 6],
                ingredients: ["strawberry", "fresh-milk"],
                toppings: ["colorful-pearl"]
            }
        }
    },
    {
        name: "David",
        type: "descriptive",
        avatar: "🧔",
        order: {
            text: "I want something like first love... sweet with a bit of sourness.",
            hints: ["💖", "🍋"],
            requirements: {
                base: ["black-tea", "green-tea"],
                sweetness: [4, 5],
                ingredients: ["lemon", "passion-fruit"],
                toppings: []
            }
        }
    },
    {
        name: "Lisa",
        type: "descriptive",
        avatar: "👱‍♀️",
        order: {
            text: "Something refreshing for a hot day, fruity and light!",
            hints: ["❄️", "🍊"],
            requirements: {
                base: ["green-tea", "jasmine-tea"],
                sweetness: [3, 4, 5],
                ingredients: ["lemon", "mango"],
                toppings: ["popping-boba"]
            }
        }
    },
    // Challenge Customers
    {
        name: "Alex",
        type: "challenge",
        avatar: "🤠",
        order: {
            text: "Surprise me with your weirdest combination!",
            requirements: "random"
        }
    },
    // Special Customers
    {
        name: "Linda (Blogger)",
        type: "special",
        avatar: "📸",
        specialty: "instagram",
        order: {
            text: "Make me something Instagram-worthy! It needs to look amazing!",
            hints: ["📷", "⭐"],
            requirements: {
                base: ["strawberry", "mango"],
                ingredients: ["fresh-milk", "cream"],
                toppings: ["colorful-pearl", "pudding"],
                needsBeauty: true
            }
        }
    },
    {
        name: "Jack (Trainer)",
        type: "special",
        avatar: "💪",
        specialty: "fitness",
        order: {
            text: "I need something healthy. Show me the nutrition info!",
            hints: ["🏋️", "❤️"],
            requirements: {
                base: ["green-tea"],
                sweetness: [0, 1, 2],
                ingredients: ["oat-milk", "soy-milk"],
                toppings: [],
                needsNutrition: true
            }
        }
    },
    {
        name: "Grandma Chen",
        type: "special",
        avatar: "👵",
        specialty: "regular",
        order: {
            text: "Just like the old days... classic milk tea with pearls, nothing fancy.",
            requirements: {
                base: "black-tea",
                sweetness: 7,
                ingredients: ["fresh-milk"],
                toppings: ["black-pearl"]
            }
        }
    }
];

// Ingredient Database
const ingredients = {
    bases: {
        "black-tea": { name: "Black Tea", color: "#8B4513", cost: 0.5 },
        "green-tea": { name: "Green Tea", color: "#90EE90", cost: 0.5 },
        "oolong-tea": { name: "Oolong Tea", color: "#CD853F", cost: 0.7 },
        "jasmine-tea": { name: "Jasmine Tea", color: "#F0E68C", cost: 0.6 },
        "pu-erh-tea": { name: "Pu-erh Tea", color: "#654321", cost: 0.8 },
        "four-season-tea": { name: "Four Season Tea", color: "#FFD700", cost: 0.7 }
    },
    syrups: {
        "cane-sugar": { name: "Cane Sugar", cost: 0.2 },
        "honey": { name: "Honey", cost: 0.4 },
        "brown-sugar": { name: "Brown Sugar", cost: 0.3 },
        "zero-calorie": { name: "Zero Calorie", cost: 0.3 }
    },
    mainIngredients: {
        "fresh-milk": { name: "Fresh Milk", color: "#FFFFFF", cost: 0.8 },
        "oat-milk": { name: "Oat Milk", color: "#F5DEB3", cost: 1.0 },
        "soy-milk": { name: "Soy Milk", color: "#FFFACD", cost: 0.9 },
        "cream": { name: "Heavy Cream", color: "#FFFAF0", cost: 1.2 },
        "mango": { name: "Mango", color: "#FFD700", cost: 1.5 },
        "strawberry": { name: "Strawberry", color: "#FF69B4", cost: 1.3 },
        "lemon": { name: "Lemon", color: "#FFFF00", cost: 0.8 },
        "passion-fruit": { name: "Passion Fruit", color: "#FF8C00", cost: 1.4 }
    },
    toppings: {
        "black-pearl": { name: "Black Pearls", color: "#000000", cost: 0.5 },
        "white-pearl": { name: "White Pearls", color: "#FFFFFF", cost: 0.5 },
        "colorful-pearl": { name: "Colorful Pearls", color: "#FF1493", cost: 0.7 },
        "grass-jelly": { name: "Grass Jelly", color: "#2F4F4F", cost: 0.4 },
        "coconut-jelly": { name: "Coconut Jelly", color: "#F0FFFF", cost: 0.5 },
        "pudding": { name: "Pudding", color: "#FFE4B5", cost: 0.6 },
        "popping-boba": { name: "Popping Boba", color: "#FF69B4", cost: 0.8 },
        "red-bean": { name: "Red Bean", color: "#8B0000", cost: 0.5 }
    }
};

// Initialize Game
function initGame() {
    updateUI();
    spawnCustomer();
    startGameLoop();
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    // Base selection
    document.querySelectorAll('#step-1 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectOption(this, 'base', this.dataset.base);
            setTimeout(() => nextStep(), 500);
        });
    });

    // Sweetness slider
    const sweetnessSlider = document.getElementById('sweetness-slider');
    const sweetnessValue = document.getElementById('sweetness-value');
    sweetnessSlider.addEventListener('input', function() {
        gameState.currentDrink.sweetness = parseInt(this.value);
        const percentage = this.value * 10;
        sweetnessValue.textContent = `${percentage}% Sweet`;
        updateDrinkPreview();
    });

    // Syrup selection
    document.querySelectorAll('#step-2 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectOption(this, 'syrup', this.dataset.syrup);
        });
    });

    // Ingredient selection
    document.querySelectorAll('#step-3 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            toggleSelection(this, 'ingredients', this.dataset.ingredient);
        });
    });

    // Topping selection
    document.querySelectorAll('#step-4 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            toggleSelection(this, 'toppings', this.dataset.topping);
        });
    });

    // Seal selection
    document.querySelectorAll('#step-5 .option-btn[data-seal]').forEach(btn => {
        btn.addEventListener('click', function() {
            selectOption(this, 'seal', this.dataset.seal);
        });
    });

    // Shake button
    document.getElementById('shake-btn').addEventListener('click', shakeGame);

    // Upgrade buttons
    document.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            purchaseUpgrade(this.dataset.upgrade, parseInt(this.dataset.cost));
        });
    });
}

// Select single option
function selectOption(button, category, value) {
    // Remove selection from siblings
    button.parentElement.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    button.classList.add('selected');

    gameState.currentDrink[category] = value;
    updateDrinkPreview();
}

// Toggle multiple selection
function toggleSelection(button, category, value) {
    button.classList.toggle('selected');

    if (button.classList.contains('selected')) {
        if (!gameState.currentDrink[category].includes(value)) {
            gameState.currentDrink[category].push(value);
        }
    } else {
        gameState.currentDrink[category] = gameState.currentDrink[category].filter(v => v !== value);
    }

    updateDrinkPreview();
}

// Next Step
function nextStep() {
    if (gameState.currentStep < 5) {
        // Mark current step as completed
        document.querySelector(`.step[data-step="${gameState.currentStep}"]`).classList.add('completed');
        document.querySelector(`.step[data-step="${gameState.currentStep}"]`).classList.remove('active');

        gameState.currentStep++;

        // Hide current panel, show next
        document.querySelectorAll('.step-panel').forEach(panel => {
            panel.classList.add('hidden');
        });
        document.getElementById(`step-${gameState.currentStep}`).classList.remove('hidden');

        // Update step indicator
        document.querySelector(`.step[data-step="${gameState.currentStep}"]`).classList.add('active');
    }
}

// Update Drink Preview
function updateDrinkPreview() {
    const drinkLayers = document.getElementById('drink-layers');
    const drinkDetails = document.getElementById('drink-details');

    drinkLayers.innerHTML = '';
    drinkDetails.innerHTML = '';

    // Add base layer
    if (gameState.currentDrink.base) {
        const baseInfo = ingredients.bases[gameState.currentDrink.base];
        const layer = document.createElement('div');
        layer.className = 'drink-layer';
        layer.style.backgroundColor = baseInfo.color;
        layer.style.height = '30%';
        drinkLayers.appendChild(layer);

        drinkDetails.innerHTML += `<div class="detail-item"><span class="detail-label">Base:</span> ${baseInfo.name}</div>`;
    }

    // Add ingredient layers
    gameState.currentDrink.ingredients.forEach(ing => {
        const ingInfo = ingredients.mainIngredients[ing];
        const layer = document.createElement('div');
        layer.className = 'drink-layer';
        layer.style.backgroundColor = ingInfo.color;
        layer.style.height = '20%';
        drinkLayers.appendChild(layer);
    });

    // Add toppings at bottom
    if (gameState.currentDrink.toppings.length > 0) {
        const layer = document.createElement('div');
        layer.className = 'drink-layer';
        layer.style.backgroundColor = ingredients.toppings[gameState.currentDrink.toppings[0]].color;
        layer.style.height = '15%';
        drinkLayers.appendChild(layer);

        drinkDetails.innerHTML += `<div class="detail-item"><span class="detail-label">Toppings:</span> ${gameState.currentDrink.toppings.length}</div>`;
    }

    drinkDetails.innerHTML += `<div class="detail-item"><span class="detail-label">Sweetness:</span> ${gameState.currentDrink.sweetness * 10}%</div>`;
}

// Shake Mini-Game
let shakeInterval;
let shakePosition = 0;
let shakeActive = false;

function shakeGame() {
    if (shakeActive) {
        // Stop and check
        clearInterval(shakeInterval);
        shakeActive = false;

        const indicator = document.getElementById('shake-indicator');
        const target = document.getElementById('shake-target');
        const scoreEl = document.getElementById('shake-score');

        // Calculate if in target zone (45-55%)
        if (shakePosition >= 45 && shakePosition <= 55) {
            gameState.currentDrink.shakeQuality = 1.0;
            scoreEl.textContent = '🎯 Perfect Shake! +20% Quality';
            scoreEl.style.color = '#4caf50';
        } else if (shakePosition >= 35 && shakePosition <= 65) {
            gameState.currentDrink.shakeQuality = 0.7;
            scoreEl.textContent = '👍 Good Shake! +10% Quality';
            scoreEl.style.color = '#ff9800';
        } else {
            gameState.currentDrink.shakeQuality = 0.5;
            scoreEl.textContent = '😅 Okay Shake...';
            scoreEl.style.color = '#f44336';
        }

        document.getElementById('shake-btn').textContent = '✅ Shaken!';
        document.getElementById('shake-btn').disabled = true;
    } else {
        // Start shaking
        shakeActive = true;
        shakePosition = 0;
        document.getElementById('shake-btn').textContent = '🛑 Stop!';

        const indicator = document.getElementById('shake-indicator');
        shakeInterval = setInterval(() => {
            shakePosition += 2;
            if (shakePosition > 100) shakePosition = 0;
            indicator.style.left = shakePosition + '%';
        }, 50);
    }
}

// Complete Drink
function completeDrink() {
    if (!gameState.currentCustomer) {
        alert('No customer waiting!');
        return;
    }

    // Calculate quality score
    const quality = calculateDrinkQuality();
    const price = calculatePrice(quality);

    // Show quality report
    showQualityReport(quality, price);

    // Update stats
    gameState.money += price;
    gameState.stats.drinksServed++;
    gameState.stats.totalEarnings += price;

    if (quality.overall >= 0.9) {
        gameState.reputation += 10;
        gameState.stats.perfectDrinks++;
    } else if (quality.overall >= 0.7) {
        gameState.reputation += 5;
    }

    // Add to research
    trackRecipe();

    // Reset for next customer
    setTimeout(() => {
        resetDrinkMaking();
        gameState.currentCustomer = null;
        spawnCustomer();
        updateUI();
    }, 3000);
}

// Calculate Drink Quality
function calculateDrinkQuality() {
    const customer = gameState.currentCustomer;
    const drink = gameState.currentDrink;
    const req = customer.order.requirements;

    let scores = {
        base: 0,
        sweetness: 0,
        ingredients: 0,
        toppings: 0,
        shake: drink.shakeQuality
    };

    // Check base
    if (Array.isArray(req.base)) {
        scores.base = req.base.includes(drink.base) ? 1 : 0.5;
    } else if (req.base === "random" || req.base === drink.base) {
        scores.base = 1;
    }

    // Check sweetness
    if (Array.isArray(req.sweetness)) {
        scores.sweetness = req.sweetness.includes(drink.sweetness) ? 1 : 0.7;
    } else if (req.sweetness) {
        const diff = Math.abs(req.sweetness - drink.sweetness);
        scores.sweetness = Math.max(0, 1 - (diff * 0.15));
    } else {
        scores.sweetness = 1;
    }

    // Check ingredients
    if (req.ingredients && req.ingredients.length > 0) {
        const matches = req.ingredients.filter(ing => drink.ingredients.includes(ing)).length;
        scores.ingredients = matches / req.ingredients.length;
    } else {
        scores.ingredients = 1;
    }

    // Check toppings
    if (req.toppings && req.toppings.length > 0) {
        const matches = req.toppings.filter(top => drink.toppings.includes(top)).length;
        scores.toppings = matches / req.toppings.length;
    } else {
        scores.toppings = drink.toppings.length > 0 ? 1 : 0.8;
    }

    // Calculate overall
    const overall = (scores.base + scores.sweetness + scores.ingredients + scores.toppings + scores.shake) / 5;

    return {
        ...scores,
        overall
    };
}

// Calculate Price
function calculatePrice(quality) {
    const basePrice = 4.5;
    const multiplier = 0.8 + (quality.overall * 1.2); // 0.8x to 2.0x

    // Calculate cost
    let cost = 0;
    if (gameState.currentDrink.base) {
        cost += ingredients.bases[gameState.currentDrink.base].cost;
    }
    gameState.currentDrink.ingredients.forEach(ing => {
        cost += ingredients.mainIngredients[ing].cost;
    });
    gameState.currentDrink.toppings.forEach(top => {
        cost += ingredients.toppings[top].cost;
    });

    const price = (basePrice + cost) * multiplier;

    // Add tip for perfect orders
    let tip = 0;
    if (quality.overall >= 0.95) {
        tip = price * 0.3; // 30% tip
    } else if (quality.overall >= 0.85) {
        tip = price * 0.15; // 15% tip
    }

    return parseFloat((price + tip).toFixed(2));
}

// Show Quality Report
function showQualityReport(quality, price) {
    const modal = document.getElementById('quality-modal');
    const report = document.getElementById('quality-report');
    const feedback = document.getElementById('customer-feedback');

    report.innerHTML = `
        <div class="report-item">
            <span class="report-label">Base Match:</span>
            <span class="report-value">${(quality.base * 100).toFixed(0)}%</span>
        </div>
        <div class="report-item">
            <span class="report-label">Sweetness:</span>
            <span class="report-value">${(quality.sweetness * 100).toFixed(0)}%</span>
        </div>
        <div class="report-item">
            <span class="report-label">Ingredients:</span>
            <span class="report-value">${(quality.ingredients * 100).toFixed(0)}%</span>
        </div>
        <div class="report-item">
            <span class="report-label">Toppings:</span>
            <span class="report-value">${(quality.toppings * 100).toFixed(0)}%</span>
        </div>
        <div class="report-item">
            <span class="report-label">Shake Quality:</span>
            <span class="report-value">${(quality.shake * 100).toFixed(0)}%</span>
        </div>
        <div class="report-item" style="border-top: 2px solid #667eea; margin-top: 10px; padding-top: 10px;">
            <span class="report-label">Overall Quality:</span>
            <span class="report-value" style="font-size: 24px;">${(quality.overall * 100).toFixed(0)}%</span>
        </div>
    `;

    let emoji, text;
    if (quality.overall >= 0.95) {
        emoji = '🤩';
        text = 'Absolutely perfect! This is exactly what I wanted!';
    } else if (quality.overall >= 0.85) {
        emoji = '😊';
        text = 'Really good! I love it!';
    } else if (quality.overall >= 0.7) {
        emoji = '🙂';
        text = 'Pretty good, thanks!';
    } else if (quality.overall >= 0.5) {
        emoji = '😐';
        text = 'It\'s okay... not quite what I expected.';
    } else {
        emoji = '😞';
        text = 'This isn\'t really what I ordered...';
    }

    feedback.innerHTML = `
        <div class="feedback-score">${emoji}</div>
        <div class="feedback-text">"${text}"</div>
        <div class="feedback-tip">Earned: $${price}</div>
    `;

    modal.classList.remove('hidden');
}

// Close Quality Modal
function closeQualityModal() {
    document.getElementById('quality-modal').classList.add('hidden');
}

// Track Recipe for Research
function trackRecipe() {
    const drink = gameState.currentDrink;
    const key = `${drink.base}-${drink.sweetness}-${drink.ingredients.join(',')}-${drink.toppings.join(',')}`;

    if (!gameState.researches[key]) {
        gameState.researches[key] = {
            count: 0,
            recipe: { ...drink },
            ratings: []
        };
    }

    gameState.researches[key].count++;
}

// Reset Drink Making
function resetDrinkMaking() {
    gameState.currentDrink = {
        base: null,
        sweetness: 5,
        syrup: null,
        ingredients: [],
        toppings: [],
        seal: null,
        shakeQuality: 0
    };
    gameState.currentStep = 1;

    // Reset UI
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    document.querySelector('.step[data-step="1"]').classList.add('active');

    document.querySelectorAll('.step-panel').forEach(panel => {
        panel.classList.add('hidden');
    });
    document.getElementById('step-1').classList.remove('hidden');

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    document.getElementById('sweetness-slider').value = 5;
    document.getElementById('sweetness-value').textContent = '50% Sweet';
    document.getElementById('shake-btn').textContent = '🫨 Shake!';
    document.getElementById('shake-btn').disabled = false;
    document.getElementById('shake-score').textContent = '';

    updateDrinkPreview();
}

// Spawn Customer
function spawnCustomer() {
    // Random customer selection
    const customer = customers[Math.floor(Math.random() * customers.length)];
    gameState.currentCustomer = customer;

    const currentCustomerEl = document.getElementById('current-customer');
    currentCustomerEl.innerHTML = `
        <div class="customer-avatar">${customer.avatar}</div>
        <div class="customer-name">${customer.name}</div>
        <div class="customer-type">${customerTypes[customer.type].name}</div>
        <div class="customer-order">
            <div class="order-text">"${customer.order.text}"</div>
            ${customer.order.hints ? `
                <div class="order-hints">
                    ${customer.order.hints.map(hint => `<span class="hint-icon">${hint}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Update UI
function updateUI() {
    document.getElementById('money').textContent = `$${gameState.money.toFixed(2)}`;
    document.getElementById('reputation').textContent = gameState.reputation;
    document.getElementById('day').textContent = gameState.day;

    const hours = Math.floor(gameState.time);
    const minutes = Math.floor((gameState.time - hours) * 60);
    document.getElementById('time').textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Purchase Upgrade
function purchaseUpgrade(upgradeId, cost) {
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.upgrades.push(upgradeId);

        // Disable button
        event.target.disabled = true;
        event.target.textContent = '✅ Purchased';

        updateUI();
        alert(`Upgrade purchased: ${upgradeId}`);
    } else {
        alert(`Not enough money! Need $${cost}`);
    }
}

// Show Tab
function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
}

// Game Loop
function startGameLoop() {
    setInterval(() => {
        gameState.time += 0.1; // 6 minutes per real second

        if (gameState.time >= 21.0) { // 9 PM
            endDay();
        }

        updateUI();
    }, 1000);
}

// End Day
function endDay() {
    const modal = document.getElementById('day-end-modal');
    const summary = document.getElementById('day-summary');

    summary.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Drinks Served:</span>
            <span class="summary-value">${gameState.stats.drinksServed}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Perfect Drinks:</span>
            <span class="summary-value">${gameState.stats.perfectDrinks}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Today's Earnings:</span>
            <span class="summary-value">$${gameState.stats.totalEarnings.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Money:</span>
            <span class="summary-value">$${gameState.money.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Reputation:</span>
            <span class="summary-value">${gameState.reputation}</span>
        </div>
    `;

    modal.classList.remove('hidden');
}

// Start New Day
function startNewDay() {
    gameState.day++;
    gameState.time = 9.0;
    gameState.stats = {
        drinksServed: 0,
        perfectDrinks: 0,
        totalEarnings: 0
    };

    document.getElementById('day-end-modal').classList.add('hidden');
    updateUI();
    spawnCustomer();
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', initGame);
