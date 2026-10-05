class GothicGame {
    constructor() {
        this.players = [
            { id: 0, name: "Кровавая Мэри", token: "🪦", blood: 1000, pos: 0, inJail: 0, isAi: false, color: "#9c7c38", dead: false },
            { id: 1, name: "Инквизитор", token: "⚔️", blood: 1000, pos: 0, inJail: 0, isAi: true, color: "#8b1818", dead: false },
            { id: 2, name: "Вампир-Граф", token: "🦇", blood: 1000, pos: 0, inJail: 0, isAi: true, color: "#7a2b9e", dead: false },
            { id: 3, name: "Некромант", token: "💀", blood: 1000, pos: 0, inJail: 0, isAi: true, color: "#256956", dead: false }
        ];
        this.turn = 0;
        this.tiles = TILES_CONFIG.map(t => ({
            ...t,
            owner: null,
            crypts: 0,
            mausoleum: false
        }));
        this.isRolling = false;
        this.buildGridPositions();
        this.renderBoard();
        this.updateUI();
        this.log("Да начнется великий передел проклятого города. Первый ход за Чумным Доктором!", "log-gold");
    }

    buildGridPositions() {
        this.gridMapping = {};
        for (let c = 7; c >= 1; c--) this.gridMapping[7 - c] = { r: 7, c: c };
        for (let r = 6; r >= 1; r--) this.gridMapping[6 + (7 - r)] = { r: r, c: 1 };
        for (let c = 2; c <= 7; c++) this.gridMapping[12 + (c - 1)] = { r: 1, c: c };
        for (let r = 2; r <= 6; r++) this.gridMapping[18 + (r - 1)] = { r: r, c: 7 };
    }

    renderBoard() {
        const wrapper = document.getElementById("board-wrapper");
        document.querySelectorAll(".tile").forEach(e => e.remove());

        this.tiles.forEach(tile => {
            const pos = this.gridMapping[tile.id];
            const div = document.createElement("div");
            div.className = "tile";
            div.id = `tile-${tile.id}`;
            div.style.gridRow = pos.r;
            div.style.gridColumn = pos.c;

            let topBar = tile.group
                ? `<div class="tile-header" style="background:${tile.group}"></div>`
                : `<div class="tile-header" style="background:#222; font-size:8px;">ЦЕРЕМОНИАЛ</div>`;

            let subText = "";
            if (tile.type === "property") {
                subText = `<div class="tile-price">${tile.cost}🩸</div>`;
            } else if (tile.desc) {
                subText = `<div style="font-size:9px; color:var(--text-muted); text-align:center;">${tile.desc}</div>`;
            }

            div.innerHTML = `
        ${topBar}
        <div class="tile-title">${tile.name}</div>
        <div class="buildings-indicator" id="build-${tile.id}"></div>
        ${subText}
        <div class="tokens-container" id="tokens-${tile.id}"></div>
      `;
            wrapper.appendChild(div);
        });
        this.renderTokens();
    }

    renderTokens() {
        document.querySelectorAll(".tokens-container").forEach(c => c.innerHTML = "");
        this.players.forEach(p => {
            if (p.dead) return;
            const container = document.getElementById(`tokens-${p.pos}`);
            if (container) {
                const el = document.createElement("div");
                el.className = "p-token";
                el.style.borderColor = p.color;
                el.innerHTML = p.token;
                el.title = p.name;
                container.appendChild(el);
            }
        });
    }

    updateUI() {
        const list = document.getElementById("players-list");
        list.innerHTML = "";
        this.players.forEach((p, idx) => {
            const card = document.createElement("div");
            card.className = `player-card ${idx === this.turn ? 'active' : ''}`;
            if (p.dead) card.style.opacity = "0.35";
            card.innerHTML = `
        <div>
          <div style="font-weight:bold; color:${p.color};">${p.token} ${p.name} ${p.dead ? '(ПОГИБ)' : ''}</div>
          <div style="font-size:11px; color:var(--text-muted);">${p.inJail ? 'Казематы: ' + p.inJail + 'х.' : 'На свободе'}</div>
        </div>
        <div style="font-size:16px; color:#eed07a;">${p.blood} 🩸</div>
      `;
            list.appendChild(card);
        });

        const activeP = this.players[this.turn];
        document.getElementById("turn-indicator").innerHTML = `Ход: <span style="color:${activeP.color}">${activeP.name}</span>`;
        document.getElementById("btn-roll").disabled = this.isRolling || activeP.isAi || activeP.dead;

        this.tiles.forEach(t => {
            const bEl = document.getElementById(`build-${t.id}`);
            if (bEl) {
                if (t.mausoleum) bEl.innerHTML = "🏛️ МАВЗОЛЕЙ";
                else if (t.crypts > 0) bEl.innerHTML = "🪦".repeat(t.crypts);
                else bEl.innerHTML = "";
            }
            const tDiv = document.getElementById(`tile-${t.id}`);
            if (tDiv && t.owner) {
                tDiv.style.boxShadow = `inset 0 0 10px ${t.owner.color}`;
            }
        });
    }

    log(msg, cls = "") {
        const console = document.getElementById("log-console");
        const div = document.createElement("div");
        div.className = `log-entry ${cls}`;
        div.innerHTML = msg;
        console.appendChild(div);
        console.scrollTop = console.scrollHeight;
    }

    toggleSound() {
        audio.enabled = !audio.enabled;
        document.getElementById("sound-status").innerText = audio.enabled ? "ВКЛ" : "ВЫКЛ";
    }

    handleRollClick() {
        if (this.isRolling) return;
        this.executeTurn();
    }

    async executeTurn() {
        this.isRolling = true;
        const p = this.players[this.turn];

        if (p.dead) {
            this.nextTurn();
            return;
        }

        if (p.inJail > 0) {
            p.inJail--;
            this.log(`${p.name} томится в казематах инквизиции (осталось ходов: ${p.inJail}).`);
            audio.playGong();
            await this.sleep(1200);
            this.nextTurn();
            return;
        }

        audio.playDice();
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const diceIcons = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
        document.getElementById("die1").innerText = diceIcons[d1 - 1];
        document.getElementById("die2").innerText = diceIcons[d2 - 1];

        const steps = d1 + d2;
        this.log(`${p.name} бросает кости: <b>${steps}</b> [${d1}+${d2}].`);

        for (let i = 0; i < steps; i++) {
            p.pos = (p.pos + 1) % 24;
            if (p.pos === 0) {
                p.blood += 200;
                audio.playCoin();
                this.log(`${p.name} пересекает Врата Ада и питается сущностями (+200🩸).`, "log-blood");
            }
            this.renderTokens();
            await this.sleep(130);
        }

        await this.handleTileAction(p);
    }

    triggerScreamer() {
        if (audio.playScreamer) {
            audio.playScreamer();
        }
        const overlay = document.getElementById("screamer-overlay");
        const container = document.getElementById("game-container");
        if (overlay && container) {
            overlay.style.display = "flex";
            container.classList.add("shake-screen");

            setTimeout(() => {
                overlay.style.display = "none";
                container.classList.remove("shake-screen");
            }, 600);
        }
    }

    async handleTileAction(player) {
        const tile = this.tiles[player.pos];

        if (tile.type === "tax") {
            player.blood -= tile.cost;
            audio.playGong();
            this.log(`${player.name} приносит кровавую дань на клетке [${tile.name}]: -${tile.cost}🩸.`, "log-blood");
            this.checkBankruptcy(player);
            this.finishStep();
        } else if (tile.type === "goto_jail") {
            // Скример при попадании под стражу
            this.triggerScreamer();
            player.pos = 6;
            player.inJail = 2;
            this.renderTokens();
            this.log(`Инквизиция схватила ${player.name}! Заточение на 2 хода.`, "log-blood");
            this.finishStep();
        } else if (tile.type === "event") {
            const card = CARDS[Math.floor(Math.random() * CARDS.length)];
            player.blood += card.blood;
            this.log(`<b>Таро Судьбы:</b> ${card.text}`, card.blood >= 0 ? "log-gold" : "log-blood");
            if (card.blood > 0) audio.playCoin(); else audio.playGong();
            this.checkBankruptcy(player);
            this.finishStep();
        } else if (tile.type === "property") {
            if (!tile.owner) {
                if (!player.isAi) {
                    this.askBuyProperty(player, tile);
                } else {
                    if (player.blood >= tile.cost * 1.5) {
                        this.buyProperty(player, tile);
                    } else {
                        this.log(`${player.name} решает не приобретать [${tile.name}].`);
                    }
                    this.finishStep();
                }
            } else if (tile.owner === player) {
                if (!player.isAi) {
                    if (!tile.mausoleum && player.blood >= Math.floor(tile.cost * 0.7)) {
                        this.askUpgradeProperty(player, tile);
                    } else {
                        this.finishStep();
                    }
                } else {
                    if (!tile.mausoleum && player.blood >= tile.cost * 1.8) {
                        this.upgradeProperty(player, tile);
                    }
                    this.finishStep();
                }
            } else {
                let rent = tile.rent;
                if (tile.mausoleum) rent *= 5;
                else rent += tile.crypts * Math.floor(tile.rent * 0.8);

                player.blood -= rent;
                tile.owner.blood += rent;
                audio.playCoin();
                this.log(`${player.name} ступил на владения ${tile.owner.name} [${tile.name}] и платит оброк ${rent}🩸!`, "log-blood");
                this.checkBankruptcy(player, tile.owner);
                this.finishStep();
            }
        } else {
            this.finishStep();
        }
    }

    askBuyProperty(player, tile) {
        if (player.blood < tile.cost) {
            this.log(`Недостаточно крови для приобретения [${tile.name}].`);
            this.finishStep();
            return;
        }
        const modal = document.getElementById("interactive-modal");
        document.getElementById("modal-title").innerText = "Приобретение Квартала";
        document.getElementById("modal-desc").innerHTML = `Желаете ли вы захватить <b>${tile.name}</b> за <b>${tile.cost}🩸</b>?<br>Базовый сбор: ${tile.rent}🩸`;
        const btn = document.getElementById("modal-btn-confirm");
        btn.onclick = () => {
            this.buyProperty(player, tile);
            this.closeModal();
            this.finishStep();
        };
        modal.style.display = "block";
    }

    askUpgradeProperty(player, tile) {
        const cost = Math.floor(tile.cost * 0.7);
        const modal = document.getElementById("interactive-modal");
        document.getElementById("modal-title").innerText = "Возведение Склепа";
        const nextType = tile.crypts === 3 ? "Мавзолей (х5 рента)" : "Склеп (+рента)";
        document.getElementById("modal-desc").innerHTML = `Возвести <b>${nextType}</b> в [${tile.name}] за <b>${cost}🩸</b>?`;
        const btn = document.getElementById("modal-btn-confirm");
        btn.onclick = () => {
            this.upgradeProperty(player, tile);
            this.closeModal();
            this.finishStep();
        };
        modal.style.display = "block";
    }

    buyProperty(player, tile) {
        player.blood -= tile.cost;
        tile.owner = player;
        audio.playCoin();
        this.log(`${player.name} подчиняет себе квартал [${tile.name}] за ${tile.cost}🩸!`, "log-gold");
        this.updateUI();
    }

    upgradeProperty(player, tile) {
        const cost = Math.floor(tile.cost * 0.7);
        player.blood -= cost;
        if (tile.crypts < 3) {
            tile.crypts++;
            this.log(`${player.name} возводит склеп (${tile.crypts}/3) в [${tile.name}] за ${cost}🩸.`, "log-gold");
        } else {
            tile.mausoleum = true;
            this.log(`${player.name} венчает [${tile.name}] величественным МАВЗОЛЕЕМ!`, "log-gold");
        }
        audio.playDice();
        this.updateUI();
    }

    closeModal() {
        document.getElementById("interactive-modal").style.display = "none";
    }

    cancelAction() {
        this.closeModal();
        this.log(`${this.players[this.turn].name} решает воздержаться от сделки.`);
        this.finishStep();
    }

    checkBankruptcy(player, creditor = null) {
        if (player.blood <= 0) {
            player.dead = true;
            audio.playGong();
            this.log(`☠️ <b>${player.name} пал жертвой Мора и объявляет о вечной погибели!</b>`, "log-blood");
            this.tiles.forEach(t => {
                if (t.owner === player) {
                    t.owner = creditor;
                    if (!creditor) { t.crypts = 0; t.mausoleum = false; }
                }
            });
            this.renderTokens();
        }
    }

    finishStep() {
        this.updateUI();
        this.isRolling = false;
        this.checkWinner();
        this.nextTurn();
    }

    checkWinner() {
        const alive = this.players.filter(p => !p.dead);
        if (alive.length === 1) {
            const winner = alive[0];
            this.log(`🏆 <b>ТРИУМФ ТЬМЫ: ${winner.name} становится единоличным Владыкой Города!</b>`, "log-gold");
            alert(`Игра окончена! Владыка: ${winner.name}`);
        }
    }

    nextTurn() {
        do {
            this.turn = (this.turn + 1) % this.players.length;
        } while (this.players[this.turn].dead && this.players.filter(p => !p.dead).length > 1);

        this.updateUI();
        const curP = this.players[this.turn];
        if (curP.isAi && !curP.dead) {
            setTimeout(() => this.executeTurn(), 1000);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Привязка событий к элементам страницы
window.addEventListener("DOMContentLoaded", () => {
    window.game = new GothicGame();

    const rollBtn = document.getElementById("btn-roll");
    if (rollBtn) {
        rollBtn.addEventListener("click", () => window.game.handleRollClick());
    }

    const soundBtn = document.getElementById("btn-toggle-sound");
    if (soundBtn) {
        soundBtn.addEventListener("click", () => window.game.toggleSound());
    }

    const cancelBtn = document.getElementById("modal-btn-cancel");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => window.game.cancelAction());
    }
});