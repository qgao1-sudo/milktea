// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

console.log('Game initializing...', canvas, ctx);

// Load Background Image
const bgImage = new Image();
bgImage.src = 'tea_shop_interior_bg.png';
let bgImageLoaded = false;

bgImage.onload = function() {
    bgImageLoaded = true;
    console.log('Background image loaded!');
};

bgImage.onerror = function() {
    console.error('Failed to load background image');
};

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
            toppings: ["pearl"]
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
            toppings: []
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
            toppings: ["fruit"]
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
            toppings: ["pearl", "pearl"]
        }
    }
];

// Ingredient Definitions - All jars positioned on the large table
const ingredientDB = {
    // Tea bases (back row on table)
    "black-tea": { name: "Black Tea", color: "#8B4513", emoji: "🍵", x: 200, y: 320, type: "base" },
    "green-tea": { name: "Green Tea", color: "#90EE90", emoji: "🍃", x: 320, y: 320, type: "base" },
    "jasmine-tea": { name: "Jasmine Tea", color: "#F0E68C", emoji: "🌸", x: 440, y: 320, type: "base" },

    // Milk options (middle row on table)
    "fresh-milk": { name: "Fresh Milk", color: "#FFFFFF", emoji: "🥛", x: 200, y: 410, type: "milk" },
    "oat-milk": { name: "Oat Milk", color: "#F5DEB3", emoji: "🌾", x: 320, y: 410, type: "milk" },

    // Toppings (front row on table)
    "pearl": { name: "Pearls", color: "#000000", emoji: "⚫", x: 200, y: 500, type: "topping" },
    "fruit": { name: "Fruit", color: "#FF69B4", emoji: "🍓", x: 320, y: 500, type: "topping" }
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
    constructor(emoji, startX, startY, endX, endY) {
        this.emoji = emoji;
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.frame = 0;
        this.maxFrame = 20;
    }

    update() {
        this.frame++;
        return this.frame >= this.maxFrame;
    }

    draw() {
        const progress = this.frame / this.maxFrame;
        const currentX = this.startX + (this.endX - this.startX) * progress;
        const currentY = this.startY + (this.endY - this.startY) * progress - Math.sin(progress * Math.PI) * 50;

        ctx.save();
        ctx.globalAlpha = 1 - progress * 0.5;
        ctx.font = '32px Arial';
        ctx.fillText(this.emoji, currentX, currentY);
        ctx.restore();
    }
}

// Draw Functions
function drawFloor() {
    // Only draw floor if background image hasn't loaded
    if (!bgImageLoaded) {
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
}

function drawBackground() {
    if (bgImageLoaded) {
        // Draw the background image
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback: draw gradient background
        const wallGradient = ctx.createLinearGradient(0, 0, 0, 500);
        wallGradient.addColorStop(0, '#FFE5CC');
        wallGradient.addColorStop(1, '#FFD4A3');

        ctx.fillStyle = wallGradient;
        ctx.fillRect(0, 0, 1200, 500);

        // Menu board on left wall
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(50, 80, 250, 200);
        ctx.fillStyle = '#f39c12';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('🧋 MENU', 100, 120);
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText('Milk Tea ..... $4.5', 70, 160);
        ctx.fillText('Fruit Tea .... $5.0', 70, 190);
        ctx.fillText('Special ..... $6.0', 70, 220);
    }
}

function drawCounter() {
    // Skip drawing counter if background image is loaded
    if (bgImageLoaded) return;

    // Large work table in center
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(150, 300, 900, 280);

    // Table edge highlight
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(150, 300, 900, 15);

    // Table shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(155, 585, 890, 10);

    // Table legs
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(180, 580, 40, 70);
    ctx.fillRect(1000, 580, 40, 70);
}

function drawTeaBrewer() {
    // Skip drawing tea brewer if background image is loaded
    if (bgImageLoaded) return;

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

function drawDrinkCup() {
    // Cup positioned on the right side of the table
    const x = 700;
    const y = 370;

    // Cup body
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, 80, 120);
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

    // Draw drink layers
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

function drawCustomer() {
    if (!game.currentCustomer) return;

    // Customer positioned behind the table - larger size
    const x = 600;
    const y = 180;

    // Body
    ctx.fillStyle = game.currentCustomer.color;
    ctx.fillRect(x - 50, y + 60, 100, 150);

    // Head
    ctx.beginPath();
    ctx.arc(x, y, 55, 0, Math.PI * 2);
    ctx.fill();

    // Face sprite - much larger
    ctx.font = '80px Arial';
    ctx.fillText(game.currentCustomer.sprite, x - 40, y + 25);

    // Name label
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(game.currentCustomer.name, x - ctx.measureText(game.currentCustomer.name).width / 2, y + 235);

    // Patience bar (optional - larger)
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(x - 50, y + 245, 100, 10);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(x - 50, y + 245, 80, 10);
}

function drawIngredients() {
    game.ingredients.forEach(ing => {
        const jarX = ing.x;
        const jarY = ing.y;
        const jarWidth = ing.width;
        const jarHeight = ing.height + 20;

        // Draw glass jar
        // Jar body (glass effect)
        const gradient = ctx.createLinearGradient(jarX, jarY, jarX + jarWidth, jarY);
        gradient.addColorStop(0, 'rgba(200, 230, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(200, 230, 255, 0.8)');

        ctx.fillStyle = gradient;
        ctx.fillRect(jarX + 5, jarY + 10, jarWidth - 10, jarHeight - 15);

        // Jar outline
        ctx.strokeStyle = 'rgba(100, 150, 200, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(jarX + 5, jarY + 10, jarWidth - 10, jarHeight - 15);

        // Jar lid (metal cap)
        const lidGradient = ctx.createLinearGradient(jarX, jarY, jarX + jarWidth, jarY);
        lidGradient.addColorStop(0, '#8B7355');
        lidGradient.addColorStop(0.5, '#D4A76A');
        lidGradient.addColorStop(1, '#8B7355');

        ctx.fillStyle = lidGradient;
        ctx.fillRect(jarX, jarY, jarWidth, 12);

        // Lid rim
        ctx.strokeStyle = '#5D4E37';
        ctx.lineWidth = 2;
        ctx.strokeRect(jarX, jarY, jarWidth, 12);

        // Lid top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(jarX + 5, jarY + 2, jarWidth - 10, 3);

        // Contents inside jar (colored based on ingredient)
        ctx.fillStyle = ing.color;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(jarX + 10, jarY + 40, jarWidth - 20, jarHeight - 50);
        ctx.globalAlpha = 1.0;

        // Ingredient emoji on jar
        ctx.font = '32px Arial';
        ctx.fillText(ing.emoji, jarX + 15, jarY + 35);

        // Glass shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(jarX + 8, jarY + 12, 8, jarHeight - 20);

        // Label on jar
        ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
        const labelHeight = 18;
        const labelY = jarY + jarHeight - labelHeight - 5;
        ctx.fillRect(jarX + 8, labelY, jarWidth - 16, labelHeight);

        // Label border
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 1;
        ctx.strokeRect(jarX + 8, labelY, jarWidth - 16, labelHeight);

        // Label text
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 9px Arial';
        const textWidth = ctx.measureText(ing.name).width;
        ctx.fillText(ing.name, jarX + (jarWidth - textWidth) / 2, labelY + 12);

        // Shadow under jar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(jarX + jarWidth / 2, jarY + jarHeight + 3, jarWidth / 2 - 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawCashRegister() {
    // Skip drawing cash register if background image is loaded
    if (bgImageLoaded) return;

    const x = 280;
    const y = 450;

    // Register body
    ctx.fillStyle = '#34495e';
    ctx.fillRect(x, y, 100, 80);

    // Screen
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 10, y + 10, 80, 40);

    // Amount
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

// Main Render Loop
function render() {
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all layers
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

    } catch (error) {
        console.error('Render error:', error);
    }

    requestAnimationFrame(render);
}

// Click Handler
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('Click at:', x, y);

    // Check ingredients
    game.ingredients.forEach(ing => {
        if (x >= ing.x && x <= ing.x + ing.width &&
            y >= ing.y && y <= ing.y + ing.height) {
            addIngredient(ing.id);
        }
    });

    // Check cup (shake) - new position: x=700, y=370, width=80, height=120
    if (x >= 700 && x <= 780 && y >= 370 && y <= 490) {
        shakeCup();
    }
});

// Add Ingredient
function addIngredient(id) {
    const ing = ingredientDB[id];
    console.log('Adding ingredient:', id, ing);

    if (ing.type === 'base' && !game.currentDrink.base) {
        game.currentDrink.base = id;
        game.animations.push(new Animation(ing.emoji, ing.x, ing.y, 740, 430));
    } else if (ing.type === 'milk' && !game.currentDrink.milk) {
        game.currentDrink.milk = id;
        game.animations.push(new Animation(ing.emoji, ing.x, ing.y, 740, 410));
    } else if (ing.type === 'topping' && game.currentDrink.toppings.length < 3) {
        game.currentDrink.toppings.push(id);
        game.animations.push(new Animation(ing.emoji, ing.x, ing.y, 740, 470));
    }
}

// Shake Cup
function shakeCup() {
    if (!game.currentDrink.shaken &&
        (game.currentDrink.base || game.currentDrink.milk || game.currentDrink.toppings.length > 0)) {
        game.currentDrink.shaken = true;
        console.log('Cup shaken!');
    }
}

// Serve Drink
function serveDrink() {
    if (!game.currentCustomer) return;

    const score = calculateScore();
    const earnings = calculateEarnings(score);

    game.money += earnings;
    game.served++;
    game.reputation += score >= 0.8 ? 10 : score >= 0.6 ? 5 : 2;

    showResult(score, earnings);

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

    if (order.base) {
        total++;
        if (drink.base === order.base) score++;
    }

    if (order.milk) {
        total++;
        if (drink.milk === order.milk) score++;
    }

    if (order.toppings && order.toppings.length > 0) {
        total += order.toppings.length;
        order.toppings.forEach(topping => {
            if (drink.toppings.includes(topping)) score++;
        });
    }

    if (drink.shaken) {
        score += 0.5;
        total += 0.5;
    }

    return total > 0 ? score / total : 0;
}

// Calculate Earnings
function calculateEarnings(score) {
    const basePrice = 4.5;
    const multiplier = 0.7 + (score * 1.3);
    const tip = score >= 0.9 ? basePrice * 0.5 : score >= 0.7 ? basePrice * 0.2 : 0;
    return parseFloat((basePrice * multiplier + tip).toFixed(2));
}

// Show Result
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

// Close Modal
function closeResultModal() {
    document.getElementById('resultModal').classList.remove('active');
}

// Reset Drink
function resetDrink() {
    game.currentDrink = {
        base: null,
        milk: null,
        toppings: [],
        shaken: false
    };
}

// Spawn Customer
function spawnCustomer() {
    game.currentCustomer = customers[Math.floor(Math.random() * customers.length)];
    showThoughtBubble();
    console.log('New customer:', game.currentCustomer.name);
}

// Show Thought Bubble
function showThoughtBubble() {
    if (!game.currentCustomer) return;

    const bubble = document.getElementById('thoughtBubble');
    bubble.style.display = 'block';
    bubble.style.left = '700px';
    bubble.style.top = '80px';
    bubble.innerHTML = `<strong>${game.currentCustomer.name}:</strong><br>"${game.currentCustomer.order.text}"`;
}

// Update UI
function updateUI() {
    document.getElementById('money').textContent = `$${game.money.toFixed(2)}`;
    document.getElementById('reputation').textContent = game.reputation;
    document.getElementById('day').textContent = game.day;
    document.getElementById('served').textContent = game.served;
}

// Mouse hover
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let hovering = false;
    game.ingredients.forEach(ing => {
        if (x >= ing.x && x <= ing.x + ing.width &&
            y >= ing.y && y <= ing.y + ing.height) {
            hovering = true;
        }
    });

    canvas.style.cursor = hovering ? 'pointer' : 'default';
});

// Initialize
function init() {
    console.log('Initializing game...');
    spawnCustomer();
    updateUI();
    render();
    console.log('Game started!');
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
