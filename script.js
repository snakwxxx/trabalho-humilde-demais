(function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // --- ESTADO DO JOGO ---
    const GAME_STATE = {
        MENU: 0,
        FIGHT: 1,
        KO: 2
    };

    let state = GAME_STATE.MENU;
    let winner = null;

    // --- JOGADORES ---
    const players = {
        player1: {
            x: 160,
            y: 310,
            w: 40,
            h: 70,
            vx: 0,
            vy: 0,
            hp: 100,
            maxHp: 100,
            attackTimer: 0,
            hitTimer: 0,
            isBlocking: false,
            facing: 1,
            baseY: 310,
            comboCount: 0,
            color: '#c04040',
            darkColor: '#802020',
            lightColor: '#e06060',
            name: 'SCORPION'
        },
        player2: {
            x: 600,
            y: 310,
            w: 40,
            h: 70,
            vx: 0,
            vy: 0,
            hp: 100,
            maxHp: 100,
            attackTimer: 0,
            hitTimer: 0,
            isBlocking: false,
            facing: -1,
            baseY: 310,
            comboCount: 0,
            color: '#3070c0',
            darkColor: '#104080',
            lightColor: '#5090e0',
            name: 'SUB-ZERO'
        }
    };

    // --- CONTROLES ---
    const keys = {
        a: false, d: false, w: false, s: false,
        ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false,
        j: false, k: false, l: false,
        n: false, m: false, comma: false
    };

    // --- JOYSTICK STATE ---
    const joystickState = {
        p1: { x: 0, y: 0, active: false },
        p2: { x: 0, y: 0, active: false }
    };

    // --- HELPERS ---
    function resetGame() {
        const p1 = players.player1;
        const p2 = players.player2;
        p1.x = 160;
        p1.y = 310;
        p1.hp = 100;
        p1.attackTimer = 0;
        p1.hitTimer = 0;
        p1.isBlocking = false;
        p1.facing = 1;
        p1.comboCount = 0;
        p2.x = 600;
        p2.y = 310;
        p2.hp = 100;
        p2.attackTimer = 0;
        p2.hitTimer = 0;
        p2.isBlocking = false;
        p2.facing = -1;
        p2.comboCount = 0;
        winner = null;
        state = GAME_STATE.FIGHT;
        document.getElementById('statusDisplay').innerText = '⚔️ LUTA!';
    }

    function goToMenu() {
        state = GAME_STATE.MENU;
        winner = null;
        document.getElementById('statusDisplay').innerText = '🏁 MENU';
        const p1 = players.player1;
        const p2 = players.player2;
        p1.hp = 100;
        p2.hp = 100;
        p1.x = 160;
        p2.x = 600;
        p1.y = 310;
        p2.y = 310;
        p1.attackTimer = 0;
        p2.attackTimer = 0;
        p1.hitTimer = 0;
        p2.hitTimer = 0;
        p1.isBlocking = false;
        p2.isBlocking = false;
        p1.facing = 1;
        p2.facing = -1;
    }

    function rectCollide(r1, r2) {
        return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
               r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
    }

    function performAttack(attacker, defender) {
        if (attacker.attackTimer > 0) return false;
        const dist = Math.abs(attacker.x - defender.x);
        const attackRange = 60;
        if (dist > attackRange) return false;

        if (defender.isBlocking) {
            const facingDef = defender.facing;
            const attackerIsRight = attacker.x > defender.x;
            if ((facingDef === 1 && !attackerIsRight) || (facingDef === -1 && attackerIsRight)) {
                attacker.attackTimer = 12;
                return false;
            }
        }

        const damage = 8 + Math.floor(Math.random() * 6);
        defender.hp = Math.max(0, defender.hp - damage);
        defender.hitTimer = 10;
        attacker.attackTimer = 14;
        attacker.comboCount += 1;

        const knockDir = attacker.x < defender.x ? 1 : -1;
        defender.x += knockDir * 18;
        defender.x = Math.max(30, Math.min(770 - defender.w, defender.x));

        if (defender.hp <= 0) {
            defender.hp = 0;
            winner = attacker === players.player1 ? 'player1' : 'player2';
            state = GAME_STATE.KO;
            document.getElementById('statusDisplay').innerText = `💀 ${attacker.name} VENCE!`;
        }
        return true;
    }

    // --- ATUALIZAÇÃO ---
    function update() {
        if (state === GAME_STATE.MENU || state === GAME_STATE.KO) return;

        const p1 = players.player1;
        const p2 = players.player2;

        // Player 1 - Joystick ou Teclado
        let dx1 = 0, dy1 = 0;
        if (keys.a || joystickState.p1.x < -0.2) dx1 = -1;
        if (keys.d || joystickState.p1.x > 0.2) dx1 = 1;
        if (keys.w || joystickState.p1.y < -0.2) dy1 = -1;
        if (keys.s || joystickState.p1.y > 0.2) dy1 = 1;
        
        if (dx1 !== 0 && dy1 !== 0) { dx1 *= 0.7; dy1 *= 0.7; }
        p1.x += dx1 * 3.2;
        p1.y += dy1 * 2.8;
        p1.y = Math.max(240, Math.min(380, p1.y));
        p1.x = Math.max(30, Math.min(770 - p1.w, p1.x));

        // Player 2 - Joystick ou Teclado
        let dx2 = 0, dy2 = 0;
        if (keys.ArrowLeft || joystickState.p2.x < -0.2) dx2 = -1;
        if (keys.ArrowRight || joystickState.p2.x > 0.2) dx2 = 1;
        if (keys.ArrowUp || joystickState.p2.y < -0.2) dy2 = -1;
        if (keys.ArrowDown || joystickState.p2.y > 0.2) dy2 = 1;
        
        if (dx2 !== 0 && dy2 !== 0) { dx2 *= 0.7; dy2 *= 0.7; }
        p2.x += dx2 * 3.2;
        p2.y += dy2 * 2.8;
        p2.y = Math.max(240, Math.min(380, p2.y));
        p2.x = Math.max(30, Math.min(770 - p2.w, p2.x));

        p1.facing = p1.x < p2.x ? 1 : -1;
        p2.facing = p2.x < p1.x ? 1 : -1;

        // Ataque e Bloqueio via teclado ou botões touch
        p1.isBlocking = keys.k || document.getElementById('block1').classList.contains('active');
        p2.isBlocking = keys.m || document.getElementById('block2').classList.contains('active');

        if (keys.j || document.getElementById('attack1').classList.contains('active')) {
            performAttack(p1, p2);
        }
        if (keys.n || document.getElementById('attack2').classList.contains('active')) {
            performAttack(p2, p1);
        }

        if (p1.attackTimer > 0) p1.attackTimer--;
        if (p1.hitTimer > 0) p1.hitTimer--;
        if (p2.attackTimer > 0) p2.attackTimer--;
        if (p2.hitTimer > 0) p2.hitTimer--;

        if (p1.attackTimer === 0) p1.comboCount = 0;
        if (p2.attackTimer === 0) p2.comboCount = 0;

        if (rectCollide(p1, p2)) {
            if (p1.x < p2.x) {
                p1.x -= 4;
                p2.x += 4;
            } else {
                p1.x += 4;
                p2.x -= 4;
            }
        }
    }

    // --- DESENHO ---
    function drawPixelBar(x, y, w, h, val, max, color, bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, w, h);
        const fill = Math.max(0, (val / max) * w);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, fill, h);
        ctx.strokeStyle = '#1a0f0a';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
    }

    function drawPlayer(p, isP1) {
        const x = p.x, y = p.y, w = p.w, h = p.h;
        const f = p.facing;

        ctx.fillStyle = '#0a0604';
        ctx.fillRect(x + 4, y + h - 4, w, 6);

        ctx.fillStyle = p.color;
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = p.darkColor;
        ctx.fillRect(x + 4, y + 14, w - 8, 10);
        ctx.fillRect(x + 8, y + 28, w - 16, 8);
        ctx.fillRect(x + 2, y + h - 12, w - 4, 6);

        ctx.fillStyle = p.lightColor;
        ctx.fillRect(x + 6, y - 8, w - 12, 14);
        ctx.fillStyle = '#1a0f0a';
        ctx.fillRect(x + 10, y - 4, 4, 4);
        ctx.fillRect(x + w - 14, y - 4, 4, 4);

        ctx.fillStyle = '#f0e8d0';
        if (f === 1) {
            ctx.fillRect(x + w - 10, y - 2, 4, 4);
            ctx.fillRect(x + 4, y - 2, 4, 4);
        } else {
            ctx.fillRect(x + 4, y - 2, 4, 4);
            ctx.fillRect(x + w - 10, y - 2, 4, 4);
        }

        ctx.fillStyle = p.darkColor;
        if (p.attackTimer > 0) {
            const extend = f === 1 ? 12 : -12;
            ctx.fillRect(x + (f === 1 ? w : -8), y + 10, 12, 8);
            ctx.fillRect(x + (f === 1 ? w + 8 : -16), y + 6, 6, 6);
        } else if (p.isBlocking) {
            ctx.fillRect(x + (f === 1 ? 4 : w - 12), y - 2, 12, 10);
            ctx.fillRect(x + (f === 1 ? 8 : w - 16), y - 6, 6, 8);
        } else {
            ctx.fillRect(x + (f === 1 ? 2 : w - 8), y + 12, 8, 8);
            ctx.fillRect(x + (f === 1 ? 8 : w - 14), y + 8, 6, 6);
        }

        ctx.fillStyle = p.darkColor;
        ctx.fillRect(x + 4, y + h - 6, 10, 8);
        ctx.fillRect(x + w - 14, y + h - 6, 10, 8);

        ctx.fillStyle = '#b8860b';
        ctx.fillRect(x + 6, y + h - 16, w - 12, 4);
        ctx.fillRect(x + 2, y + h - 18, 6, 6);
        ctx.fillRect(x + w - 8, y + h - 18, 6, 6);

        ctx.font = 'bold 16px "Courier New", Courier, monospace';
        ctx.fillStyle = '#f0d8b0';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#0a0604';
        ctx.shadowBlur = 4;
        ctx.fillText(p.name, x + w/2, y - 22);
        ctx.shadowBlur = 0;

        if (p.comboCount > 1) {
            ctx.font = 'bold 20px "Courier New", Courier, monospace';
            ctx.fillStyle = '#ffcc00';
            ctx.textAlign = 'center';
            ctx.fillText(`${p.comboCount}x`, x + w/2, y - 44);
        }
    }

    function drawMenu() {
        ctx.fillStyle = '#1f130a';
        ctx.fillRect(0, 0, 800, 450);
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, 760, 410);

        ctx.font = 'bold 60px "Courier New", Courier, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#b8860b';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#f0d080';
        ctx.fillText('⚡ KOMBAT', 400, 140);
        ctx.shadowBlur = 0;
        ctx.font = '28px "Courier New", Courier, monospace';
        ctx.fillStyle = '#d4b48a';
        ctx.fillText('PIXEL EDITION', 400, 200);

        ctx.font = '24px "Courier New", Courier, monospace';
        ctx.fillStyle = '#b08050';
        ctx.fillText('WASD  ·  J (ataque)  ·  K (bloqueio)', 400, 290);
        ctx.fillText('SETAS  ·  N (ataque)  ·  M (bloqueio)', 400, 340);
        ctx.fillStyle = '#f0d080';
        ctx.font = '18px "Courier New", Courier, monospace';
        ctx.fillText('▶  PRESSIONE "INICIAR"  ◀', 400, 410);
    }

    function drawKO() {
        ctx.fillStyle = 'rgba(10,0,0,0.7)';
        ctx.fillRect(0, 0, 800, 450);
        ctx.font = 'bold 80px "Courier New", Courier, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ff2200';
        ctx.shadowBlur = 40;
        ctx.fillStyle = '#ffcc00';
        ctx.fillText('K.O.!', 400, 180);
        ctx.shadowBlur = 0;
        ctx.font = '36px "Courier New", Courier, monospace';
        ctx.fillStyle = '#f0d8b0';
        const name = winner ? players[winner].name : '---';
        ctx.fillText(`${name} VENCEU!`, 400, 280);
        ctx.font = '20px "Courier New", Courier, monospace';
        ctx.fillStyle = '#b08050';
        ctx.fillText('Pressione RESET para recomeçar', 400, 370);
    }

    function draw() {
        ctx.clearRect(0, 0, 800, 450);

        if (state === GAME_STATE.MENU) {
            drawMenu();
            return;
        }

        ctx.fillStyle = '#2d1f14';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(0, 400, 800, 50);
        for (let i = 0; i < 800; i += 40) {
            ctx.fillStyle = '#4d3a2a';
            ctx.fillRect(i, 410, 20, 8);
            ctx.fillStyle = '#2a1a0a';
            ctx.fillRect(i + 20, 410, 20, 8);
        }
        ctx.fillStyle = '#4d3a2a';
        ctx.fillRect(30, 100, 20, 300);
        ctx.fillRect(750, 100, 20, 300);
        ctx.fillStyle = '#6a4f3a';
        ctx.fillRect(35, 110, 10, 280);
        ctx.fillRect(755, 110, 10, 280);

        const p1 = players.player1;
        const p2 = players.player2;
        drawPixelBar(70, 30, 220, 22, p1.hp, p1.maxHp, '#d04040', '#1a0a0a');
        drawPixelBar(510, 30, 220, 22, p2.hp, p2.maxHp, '#4080d0', '#1a0a0a');
        ctx.font = 'bold 18px "Courier New", Courier, monospace';
        ctx.fillStyle = '#f0d8b0';
        ctx.textAlign = 'left';
        ctx.fillText('SCORPION', 70, 66);
        ctx.textAlign = 'right';
        ctx.fillText('SUB-ZERO', 730, 66);

        drawPlayer(p1, true);
        drawPlayer(p2, false);

        if (p1.isBlocking) {
            ctx.fillStyle = '#80d0ff';
            ctx.font = 'bold 14px monospace';
            ctx.fillText('🛡️', p1.x - 10, p1.y - 40);
        }
        if (p2.isBlocking) {
            ctx.fillStyle = '#80d0ff';
            ctx.font = 'bold 14px monospace';
            ctx.fillText('🛡️', p2.x + p2.w + 2, p2.y - 40);
        }

        if (state === GAME_STATE.KO) {
            drawKO();
        }

        if (state === GAME_STATE.FIGHT) {
            ctx.font = '14px monospace';
            ctx.fillStyle = '#b08050';
            ctx.textAlign = 'center';
            ctx.fillText('J / N ataque  ·  K / M bloqueio', 400, 440);
        }
    }

    // --- LOOP ---
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // --- JOYSTICK CONTROLS ---
    function setupJoystick(elementId, thumbId, player) {
        const container = document.getElementById(elementId);
        const thumb = document.getElementById(thumbId);
        const base = container.querySelector('.joystick-base');
        const rect = base.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const maxDist = rect.width / 2 - thumb.offsetWidth / 2;

        function handleMove(clientX, clientY) {
            const baseRect = base.getBoundingClientRect();
            const x = clientX - baseRect.left - centerX;
            const y = clientY - baseRect.top - centerY;
            const dist = Math.sqrt(x*x + y*y);
            const maxDist = baseRect.width / 2 - thumb.offsetWidth / 2;
            
            let normX = 0, normY = 0;
            if (dist > 0) {
                const clamped = Math.min(dist, maxDist);
                const angle = Math.atan2(y, x);
                normX = Math.cos(angle) * clamped / maxDist;
                normY = Math.sin(angle) * clamped / maxDist;
                
                const thumbX = centerX + Math.cos(angle) * clamped;
                const thumbY = centerY + Math.sin(angle) * clamped;
                thumb.style.left = thumbX + 'px';
                thumb.style.top = thumbY + 'px';
            } else {
                thumb.style.left = '50%';
                thumb.style.top = '50%';
                normX = 0;
                normY = 0;
            }
            
            joystickState[player] = { x: normX, y: normY, active: true };
        }

        function handleEnd() {
            thumb.style.left = '50%';
            thumb.style.top = '50%';
            joystickState[player] = { x: 0, y: 0, active: false };
        }

        // Touch events
        container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        }, { passive: false });

        container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        }, { passive: false });

        container.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleEnd();
        }, { passive: false });

        container.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            handleEnd();
        }, { passive: false });

        // Mouse events (para desktop)
        let isDragging = false;
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            handleMove(e.clientX, e.clientY);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                handleMove(e.clientX, e.clientY);
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                handleEnd();
            }
        });
    }

    // --- BOTÕES TOUCH ---
    function setupTouchButton(elementId, action) {
        const btn = document.getElementById(elementId);
        
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.classList.add('active');
        }, { passive: false });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.classList.remove('active');
        }, { passive: false });

        btn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            btn.classList.remove('active');
        }, { passive: false });

        btn.addEventListener('mousedown', () => {
            btn.classList.add('active');
        });

        btn.addEventListener('mouseup', () => {
            btn.classList.remove('active');
        });

        btn.addEventListener('mouseleave', () => {
            btn.classList.remove('active');
        });
    }

    // --- EVENTOS TECLADO ---
    function keyDown(e) {
        const key = e.key;
        if (key in keys) {
            keys[key] = true;
            e.preventDefault();
        }
        if (key === 'Enter' && state === GAME_STATE.MENU) {
            resetGame();
            e.preventDefault();
        }
    }

    function keyUp(e) {
        const key = e.key;
        if (key in keys) {
            keys[key] = false;
            e.preventDefault();
        }
    }

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    // --- INICIALIZAR CONTROLES MOBILE ---
    setupJoystick('joystick1', 'thumb1', 'p1');
    setupJoystick('joystick2',
