const canvas = document.getElementById('cavernCanvas');
const ctx = canvas.getContext('2d');
const log = document.getElementById('log');
const genBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');

canvas.width = window.innerWidth - 300;
canvas.height = window.innerHeight;

let caves = [];
const GRID_SIZE = 30;

// Isometric math formulas
function toIso(x, y, z) {
    return {
        x: (canvas.width / 2) + (x - y) * Math.cos(0.523),
        y: (canvas.height / 2) + (x + y) * Math.sin(0.523) - z
    };
}

function roll(d) { return Math.floor(Math.random() * d) + 1; }

function explode(die) {
    let total = 0;
    let currentDie = die;
    while (true) {
        let r = roll(currentDie);
        total += r;
        if (r === currentDie) { currentDie += 2; } 
        else { break; }
    }
    return total;
}

function addLog(msg) {
    log.innerHTML = `<div>${msg}</div>` + log.innerHTML;
}

function generateCave() {
    // 1. ROLL 2D6 ON PIECE OF PAPER (Simulated coordinates)
    let d1 = { x: roll(100), y: roll(100), val: roll(6) };
    let d2 = { x: roll(100), y: roll(100), val: roll(6) };

    // 2. SIZE OF CAVE
    let dist = Math.sqrt(Math.pow(d1.x - d2.x, 2) + Math.pow(d1.y - d2.y, 2));
    let sizeFeet = 10;
    if (dist < 5) sizeFeet = 5;
    else if (dist < 15) sizeFeet = 10;
    else if (dist < 30) sizeFeet = 30;
    else if (dist < 60) sizeFeet = 60;
    else sizeFeet = 100;

    // 4 & 5. EXIT SIZE
    let mainExitSize = d1.val + d2.val;
    let numExits = Math.abs(d1.val - d2.val);

    // Position the cave (relative to last)
    let prev = caves.length > 0 ? caves[caves.length - 1] : { x: 0, y: 0, z: 0 };
    
    // Determine height change (Z axis)
    let zChange = (roll(6) - 3) * 20; 
    let newCave = {
        x: prev.x + (roll(100) - 50),
        y: prev.y + (roll(100) - 50),
        z: prev.z + zChange,
        size: sizeFeet,
        isSpecial: d1.val === d2.val
    };

    caves.push(newCave);
    render();

    // Log logic
    let specialText = newCave.isSpecial ? "<strong>SPECIAL ROUTE!</strong>" : "";
    addLog(`Cave ${caves.length}: ${sizeFeet}ft wide. Exit: ${mainExitSize}ft. ${specialText}`);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid (Optional for 3D feel)
    ctx.strokeStyle = "#333";
    ctx.beginPath();
    for(let i=-500; i<500; i+=GRID_SIZE) {
        let p1 = toIso(i, -500, 0); let p2 = toIso(i, 500, 0);
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        let p3 = toIso(-500, i, 0); let p4 = toIso(500, i, 0);
        ctx.moveTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
    }
    ctx.stroke();

    // Draw Caves and Connections
    caves.forEach((cave, i) => {
        let pos = toIso(cave.x, cave.y, cave.z);
        
        // Draw Connection to previous
        if (i > 0) {
            let prevPos = toIso(caves[i-1].x, caves[i-1].y, caves[i-1].z);
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "#888";
            ctx.beginPath();
            ctx.moveTo(prevPos.x, prevPos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Vertical travel time: 1 turn per 10 feet
            let depthDiff = Math.abs(cave.z - caves[i-1].z);
            let turns = Math.ceil(depthDiff / 10);
            if (turns > 0) {
                ctx.fillStyle = "yellow";
                ctx.fillText(`${turns} Turns`, (pos.x + prevPos.x)/2, (pos.y + prevPos.y)/2 - 10);
            }
        }

        // Draw the Cave as a Box
        ctx.fillStyle = cave.isSpecial ? "#ff4d4d" : "#00b4d8";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, cave.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.stroke();
    });
}

genBtn.addEventListener('click', generateCave);
clearBtn.addEventListener('click', () => { caves = []; render(); log.innerHTML = ""; });
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth - 300;
    canvas.height = window.innerHeight;
    render();
});