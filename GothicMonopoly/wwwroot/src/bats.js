class BatManager {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.bats = [];
        this.maxBats = 7; // Количество мышей на экране
        this.init();
    }

    init() {
        this.canvas.id = "bats-canvas";
        this.canvas.style.position = "fixed";
        this.canvas.style.top = "0";
        this.canvas.style.left = "0";
        this.canvas.style.width = "100vw";
        this.canvas.style.height = "100vh";
        this.canvas.style.pointerEvents = "none";
        this.canvas.style.zIndex = "40"; // Поверх поля, но под модальными окнами
        document.body.appendChild(this.canvas);

        window.addEventListener("resize", () => this.resize());
        this.resize();

        for (let i = 0; i < this.maxBats; i++) {
            this.bats.push(this.createBat(true));
        }

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createBat(randomStart = false) {
        const fromLeft = Math.random() > 0.5;
        return {
            x: randomStart ? Math.random() * window.innerWidth : (fromLeft ? -40 : window.innerWidth + 40),
            y: Math.random() * (window.innerHeight * 0.75),
            vx: (fromLeft ? 1 : -1) * (1.8 + Math.random() * 2.2),
            vy: (Math.random() - 0.5) * 1.5,
            size: 10 + Math.random() * 12,
            wingState: Math.random() * Math.PI * 2,
            wingSpeed: 0.18 + Math.random() * 0.1,
            alpha: 0.25 + Math.random() * 0.45
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.bats.length; i++) {
            const b = this.bats[i];

            b.x += b.vx;
            b.y += Math.sin(b.x * 0.02) * 1.2 + b.vy;
            b.wingState += b.wingSpeed;

            // Отрисовка силуэта готической мыши
            this.drawBat(b);

            // Если вылетела за экран — перезапускаем
            if (b.vx > 0 && b.x > window.innerWidth + 50) {
                this.bats[i] = this.createBat();
            } else if (b.vx < 0 && b.x < -50) {
                this.bats[i] = this.createBat();
            }
        }

        requestAnimationFrame(() => this.animate());
    }

    drawBat(b) {
        const ctx = this.ctx;
        const flap = Math.sin(b.wingState);
        const facing = b.vx > 0 ? 1 : -1;

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.scale(facing, 1);
        ctx.fillStyle = `rgba(18, 12, 22, ${b.alpha})`;
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 4;

        ctx.beginPath();
        // Тельце и голова с ушками
        ctx.ellipse(0, 0, b.size * 0.28, b.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Крылья
        ctx.beginPath();
        ctx.moveTo(0, -b.size * 0.2);
        // Левое крыло
        ctx.quadraticCurveTo(
            -b.size * 0.8, -b.size * (0.8 + flap * 0.5),
            -b.size * 1.5, -b.size * (0.2 + flap * 0.7)
        );
        ctx.quadraticCurveTo(-b.size * 1.1, b.size * 0.3, -b.size * 0.3, b.size * 0.2);

        // Правое крыло
        ctx.quadraticCurveTo(b.size * 0.3, b.size * 0.2, b.size * 1.1, b.size * 0.3);
        ctx.quadraticCurveTo(
            b.size * 1.5, -b.size * (0.2 + flap * 0.7),
            b.size * 0.8, -b.size * (0.8 + flap * 0.5)
        );
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

// Запуск стаи
window.addEventListener("DOMContentLoaded", () => {
    window.batManager = new BatManager();
});