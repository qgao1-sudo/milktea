// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
const game = {
    money: 100,
    reputation: 0,
    day: 1,
    served: 0,
    currentCustomer: null,
    currentDrink: {
        base: null,
        milk: null,
        toppings: [],
        sweetness: 5,
        shaken: false
    },
    ingredients: [],
    animations: []
};

// Customer Database
const customers = [
    {
        name: "Sarah",
        sprite: "👩",
        color: "#FFB6C1",
        order: {
            text: "I want milk tea with pearls!",
            base: "black-tea",
            milk: "fresh-milk",
            toppings: ["pearl"],
            sweetness: 5
        }
    },
    {
        name: "Mike",
        sprite: "👨",
        color: "#87CEEB",
        order: {
            text: "Green tea with oat milk please!",
            base: "green-tea",
            milk: "oat-milk",
            toppings: [],
            sweetness: 3
        }
    },
    {
        name: "Emma",
        sprite: "👧",
        color: "#FFD700",
        order: {
            text: "Something fruity and sweet!",
            base: "jasmine-tea",
            milk: "fresh-milk",
            toppings: ["fruit"],
            sweetness: 7
        }
    },
    {
        name: "Lisa",
        sprite: "👱‍♀️",
        color: "#FF69B4",
        order: {
            text: "Classic milk tea, extra pearls!",
            base: "black-tea",
            milk: "fresh-milk",
            toppings: ["pearl", "pearl"],
            sweetness: 5
        }
    },
    {
        name: "Alex",
        sprite: "🤠",
        color: "#DEB887",
        order: {
            text: "Oolong tea with soy milk!",
            base: "oolong-tea",
            milk: "soy-milk",
            toppings: ["jelly"],
            sweetness: 4
        }
    }
];

// Ingredient Definitions with Isometric Positions
const ingredientDB = {
    // Tea bases (back shelf)
    "black-tea": { name: "Black Tea", color: "#8B4513", emoji: "🍵", x: 920, y: 200, type: "base" },
    "green-tea": { name: "Green Tea", color: "#90EE90", emoji: "🍃", x: 1000, y: 200, type: "base" },
    "oolong-tea": { name: "Oolong Tea", color: "#CD853F", emoji: "🫖", x: 1080, y: 200, type: "base" },
    "jasmine-tea": { name: "Jasmine Tea", color: "#F0E68C", emoji: "🌸", x: 920, y: 270, type: "base" },

    // Milk options (middle counter)
    "fresh-milk": { name: "Fresh Milk", color: "#FFFFFF", emoji: "🥛", x: 700, y: 350, type: "milk" },
    "oat-milk": { name: "Oat Milk", color: "#F5DEB3", emoji: "🌾", x: 790, y: 350, type: "milk" },
    "soy-milk": { name: "Soy Milk", color: "#FFFACD", emoji: "🫘", x: 880, y: 350, type: "milk" },

    // Toppings (front counter)
    "pearl": { name: "Pearls", color: "#000000", emoji: "⚫", x: 700, y: 480, type: "topping" },
    "jelly": { name: "Jelly", color: "#90EE90", emoji: "🟢", x: 790, y: 480, type: "topping" },
    "fruit": { name: "Fruit", color: "#FF69B4", emoji: "🍓", x: 880, y: 480, type: "topping" },
    "pudding": { name: "Pudding", color: "#FFE4B5", emoji: "🍮", x: 970, y: 480, type: "topping" }
};

// Initialize ingredients array
for (let key in ingredientDB) {
    game.ingredients.push({
        id: key,
        ...ingredientDB[key],
        width: 60,
        height: 60
    });
}

// Animation Class
class Animation {
    constructor(type, x, y, data) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.data = data;
        this.frame = 0;
        this.maxFrame = data.duration || 30;
    }

    update() {
        this.frame++;
        return this.frame >= this.maxFrame;
    }

    draw() {
        if (this.type === 'ingredient-fly') {
            const progress = this.frame / this.maxFrame;
            const currentX = this.data.startX + (this.data.endX - this.data.startX) * progress;
            const currentY = this.data.startY + (this.data.endY - this.data.startY) * progress - Math.sin(progress * Math.PI) * 50;

            ctx.save();
            ctx.globalAlpha = 1 - progress * 0.5;
            ctx.font = '32px Arial';
            ctx.fillText(this.data.emoji, currentX, currentY);
            ctx.restore();
        } else if (this.type === 'shake') {
            const shake = Math.sin(this.frame * 0.5) * 5;
            ctx.save();
            ctx.translate(shake, 0);
            ctx.restore();
        }
    }
}

// Draw Isometric Floor
function drawFloor() {
    const floorPattern = ctx.createLinearGradient(0, 500, 0, 700);
    floorPattern.addColorStop(0, '#E8D5B7');
    floorPattern.addColorStop(1, '#C4A77D');

    ctx.fillStyle = floorPattern;
    ctx.fillRect(0, 500, 1200, 200);

    // Floor tiles
    ctx.strokeStyle = '#A0826D';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 120, 500);
        ctx.lineTo(i * 120, 700);
        ctx.stroke();
    }
}

// Draw Background Wall and Shelves
function drawBackground() {
    // Wall
    const wallGradient = ctx.createLinearGradient(0, 0, 0, 500);
    wallGradient.addColorStop(0, '#FFE5CC');
    wallGradient.addColorStop(1, '#FFD4A3');

    ctx.fillStyle = wallGradient;
    ctx.fillRect(0, 0, 1200, 500);

    // Back shelf
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(850, 150, 350, 200);

    // Shelf shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(850, 340, 350, 10);

    // Menu board
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(50, 100, 300, 250);
    ctx.fillStyle = '#f39c12';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('🧋 MENU', 120, 140);
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText('Milk Tea ......... $4.5', 70, 180);
    ctx.fillText('Fruit Tea ........ $5.0', 70, 210);
    ctx.fillText('Special ......... $6.0', 70, 240);
    ctx.fillText('+ Toppings ...... $0.5', 70, 280);
}

// Draw Counter (Isometric)
function drawCounter() {
    // Main counter - isometric view
    ctx.save();

    // Counter top (light brown)
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.moveTo(400, 400);
    ctx.lineTo(1100, 400);
    ctx.lineTo(1100, 550);
    ctx.lineTo(400, 550);
    ctx.closePath();
    ctx.fill();

    // Counter edge (darker)
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(400, 550, 700, 20);

    // Counter front face
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(400, 570, 700, 80);

    // Counter details (drawers)
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
        const x = 450 + i * 140;
        ctx.strokeRect(x, 590, 120, 50);
        // Drawer handles
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 50, 610, 20, 10);
    }

    ctx.restore();
}

// Draw Tea Brewer
function drawTeaBrewer() {
    const x = 950;
    const y = 300;

    // Brewer base
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x, y, 80, 100);

    // Brewer top
    ctx.fillStyle = '#A9A9A9';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 80, y);
    ctx.lineTo(x + 70, y - 20);
    ctx.lineTo(x + 10, y - 20);
    ctx.closePath();
    ctx.fill();

    // Steam
    if (game.currentDrink.base) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '20px Arial';
        ctx.fillText('💨', x + 30, y - 30);
    }

    // Display
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 10, y + 20, 60, 30);
    if (game.currentDrink.base) {
        ctx.fillStyle = '#0F0';
        ctx.font = '12px monospace';
        ctx.fillText('BREWING', x + 12, y + 38);
    }
}

// Draw Current Drink Cup
function drawDrinkCup() {
    const x = 500;
    const y = 420;

    // Cup body
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, 80, 120);

    // Cup outline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, 80, 120);

    // Lid
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(x + 40, y, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Straw hole
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + 40, y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Straw
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x + 40, y - 50);
    ctx.lineTo(x + 40, y + 20);
    ctx.stroke();

    // Drink layers
    let layerY = y + 110;
    const layerHeight = 25;

    // Toppings at bottom
    if (game.currentDrink.toppings.length > 0) {
        game.currentDrink.toppings.forEach((topping, i) => {
            ctx.fillStyle = ingredientDB[topping].color;
            ctx.fillRect(x + 5, layerY - i * 15, 70, 15);
        });
        layerY -= game.currentDrink.toppings.length * 15;
    }

    // Milk layer
    if (game.currentDrink.milk) {
        ctx.fillStyle = ingredientDB[game.currentDrink.milk].color;
        ctx.fillRect(x + 5, layerY - layerHeight, 70, layerHeight);
        layerY -= layerHeight;
    }

    // Tea base layer
    if (game.currentDrink.base) {
        ctx.fillStyle = ingredientDB[game.currentDrink.base].color;
        ctx.fillRect(x + 5, layerY - layerHeight, 70, layerHeight);
    }

    // Shake indicator
    if (game.currentDrink.shaken) {
        ctx.fillStyle = '#2ecc71';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('✓ SHAKEN', x - 10, y + 150);
    }
}

// Draw Customer
function drawCustomer() {
    if (!game.currentCustomer) return;

    const x = 150;
    const y = 350;

    // Customer body (simple character)
    ctx.fillStyle = game.currentCustomer.color;

    // Body
    ctx.fillRect(x - 30, y + 40, 60, 100);

    // Head
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();

    // Face emoji
    ctx.font = '50px Arial';
    ctx.fillText(game.currentCustomer.sprite, x - 25, y + 15);

    // Name tag
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(game.currentCustomer.name, x - 40, y + 170);

    // Patience indicator
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(x - 40, y + 180, 80, 8);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(x - 40, y + 180, 80 * 0.8, 8); // 80% patience for now
}

// Draw Thought Bubble
function showThoughtBubble() {
    if (!game.currentCustomer) return;

    const bubble = document.getElementById('thoughtBubble');
    bubble.style.display = 'block';
    bubble.style.left = '200px';
    bubble.style.top = '200px';
    bubble.innerHTML = `<strong>${game.currentCustomer.name}:</strong><br>"${game.currentCustomer.order.text}"`;
}

// Draw Ingredients on Counter
function drawIngredients() {
    game.ingredients.forEach(ing => {
        // Ingredient container
        ctx.fillStyle = '#fff';
        ctx.fillRect(ing.x - 5, ing.y - 5, ing.width + 10, ing.height + 10);

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(ing.x - 5, ing.y - 5, ing.width + 10, ing.height + 10);

        // Ingredient emoji/icon
        ctx.font = '48px Arial';
        ctx.fillText(ing.emoji, ing.x + 5, ing.y + 45);

        // Label
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 11px Arial';
        const textWidth = ctx.measureText(ing.name).width;
        ctx.fillText(ing.name, ing.x + (ing.width - textWidth) / 2, ing.y + 75);
    });
}

// Draw Cash Register
function drawCashRegister() {
    const x = 280;
    const y = 450;

    // Register body
    ctx.fillStyle = '#34495e';
    ctx.fillRect(x, y, 100, 80);

    // Screen
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 10, y + 10, 80, 40);

    // Display amount
    ctx.fillStyle = '#0F0';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`$${game.money.toFixed(0)}`, x + 20, y + 35);

    // Buttons
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(x + 15 + j * 25, y + 55 + i * 8, 20, 6);
        }
    }
}

// Main Render Function
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw scene layers (back to front)
    drawBackground();
    drawFloor();
    drawCounter();
    drawTeaBrewer();
    drawCashRegister();
    drawIngredients();
    drawDrinkCup();
    drawCustomer();

    // Draw animations
    game.animations = game.animations.filter(anim => {
        anim.draw();
        return !anim.update();
    });

    requestAnimationFrame(render);
}

// Handle Click
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check ingredient clicks
    game.ingredients.forEach(ing => {
        if (x >= ing.x && x <= ing.x + ing.width &&
            y >= ing.y && y <= ing.y + ing.height) {
            addIngredient(ing.id);
        }
    });

    // Check if clicking cup to shake
    if (x >= 500 && x <= 580 && y >= 420 && y <= 540) {
        shakeCup();
    }
});

// Add Ingredient
function addIngredient(id) {
    const ing = ingredientDB[id];

    if (ing.type === 'base' && !game.currentDrink.base) {
        game.currentDrink.base = id;
        createFlyAnimation(ing.emoji, ing.x, ing.y, 540, 480);
        playSound('add');
    } else if (ing.type === 'milk' && !game.currentDrink.milk) {
        game.currentDrink.milk = id;
        createFlyAnimation(ing.emoji, ing.x, ing.y, 540, 460);
        playSound('add');
    } else if (ing.type === 'topping' && game.currentDrink.toppings.length < 3) {
        game.currentDrink.toppings.push(id);
        createFlyAnimation(ing.emoji, ing.x, ing.y, 540, 520);
        playSound('add');
    }
}

// Create Flying Animation
function createFlyAnimation(emoji, startX, startY, endX, endY) {
    game.animations.push(new Animation('ingredient-fly', 0, 0, {
        emoji: emoji,
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        duration: 20
    }));
}

// Shake Cup
function shakeCup() {
    if (!game.currentDrink.shaken &&
        (game.currentDrink.base || game.currentDrink.milk || game.currentDrink.toppings.length > 0)) {
        game.currentDrink.shaken = true;

        // Shake animation
        let shakeCount = 0;
        const shakeInterval = setInterval(() => {
            shakeCount++;
            if (shakeCount > 10) {
                clearInterval(shakeInterval);
            }
        }, 50);

        playSound('shake');
    }
}

// Serve Drink
function serveDrink() {
    if (!game.currentCustomer) return;

    // Calculate score
    const score = calculateScore();
    const earnings = calculateEarnings(score);

    // Update game state
    game.money += earnings;
    game.served++;
    game.reputation += score >= 0.8 ? 10 : score >= 0.6 ? 5 : 2;

    // Show result
    showResult(score, earnings);

    // Reset for next customer
    setTimeout(() => {
        resetDrink();
        spawnCustomer();
        updateUI();
    }, 3000);
}

// Calculate Score
function calculateScore() {
    const order = game.currentCustomer.order;
    const drink = game.currentDrink;

    let score = 0;
    let total = 0;

    // Check base
    if (order.base) {
        total++;
        if (drink.base === order.base) score++;
    }

    // Check milk
    if (order.milk) {
        total++;
        if (drink.milk === order.milk) score++;
    }

    // Check toppings
    if (order.toppings && order.toppings.length > 0) {
        total += order.toppings.length;
        order.toppings.forEach(topping => {
            if (drink.toppings.includes(topping)) score++;
        });
    }

    // Shake bonus
    if (drink.shaken) {
        score += 0.5;
        total += 0.5;
    }

    return total > 0 ? score / total : 0;
}

// Calculate Earnings
function calculateEarnings(score) {
    const basePrice = 4.5;
    const multiplier = 0.7 + (score * 1.3); // 0.7x to 2.0x
    const tip = score >= 0.9 ? basePrice * 0.5 : score >= 0.7 ? basePrice * 0.2 : 0;

    return parseFloat((basePrice * multiplier + tip).toFixed(2));
}

// Show Result Modal
function showResult(score, earnings) {
    const modal = document.getElementById('resultModal');
    const emoji = document.getElementById('scoreEmoji');
    const feedback = document.getElementById('feedbackText');
    const earningsText = document.getElementById('earningsText');

    if (score >= 0.9) {
        emoji.textContent = '🤩';
        feedback.textContent = 'PERFECT! Exactly what I wanted!';
    } else if (score >= 0.7) {
        emoji.textContent = '😊';
        feedback.textContent = 'Great job! This is delicious!';
    } else if (score >= 0.5) {
        emoji.textContent = '🙂';
        feedback.textContent = 'Pretty good, thanks!';
    } else {
        emoji.textContent = '😐';
        feedback.textContent = 'Not quite what I ordered...';
    }

    earningsText.textContent = `Earned: $${earnings} (${(score * 100).toFixed(0)}% match)`;
    modal.classList.add('active');
}

// Close Result Modal
function closeResultModal() {
    document.getElementById('resultModal').classList.remove('active');
}

// Reset Drink
function resetDrink() {
    game.currentDrink = {
        base: null,
        milk: null,
        toppings: [],
        sweetness: 5,
        shaken: false
    };
}

// Spawn Customer
function spawnCustomer() {
    game.currentCustomer = customers[Math.floor(Math.random() * customers.length)];
    showThoughtBubble();
}

// Update UI
function updateUI() {
    document.getElementById('money').textContent = `$${game.money.toFixed(2)}`;
    document.getElementById('reputation').textContent = game.reputation;
    document.getElementById('day').textContent = game.day;
    document.getElementById('served').textContent = game.served;
}

// Sound Effects (simple)
function playSound(type) {
    // You can add Web Audio API sounds here
    console.log(`Playing sound: ${type}`);
}

// Hover effect for ingredients
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let hovering = false;
    game.ingredients.forEach(ing => {
        if (x >= ing.x && x <= ing.x + ing.width &&
            y >= ing.y && y <= ing.y + ing.height) {
            hovering = true;
            canvas.style.cursor = 'pointer';
        }
    });

    if (!hovering) {
        canvas.style.cursor = 'default';
    }
});

// Initialize Game
function init() {
    spawnCustomer();
    updateUI();
    render();
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', init);
