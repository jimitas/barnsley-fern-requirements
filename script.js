class BarnsleyFern {
    constructor() {
        this.canvas = document.getElementById('fernCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.animationId = null;
        this.pointCount = 0;
        this.speed = 100;
        this.currentTheme = 'classic';

        this.x = 0;
        this.y = 0;

        this.transforms = [
            { a: 0,     b: 0,     c: 0,    d: 0.16,  e: 0,    f: 0,     p: 0.01 },
            { a: 0.85,  b: 0.04,  c: -0.04, d: 0.85,  e: 0,    f: 1.6,   p: 0.85 },
            { a: 0.2,   b: -0.26, c: 0.23,  d: 0.22,  e: 0,    f: 1.6,   p: 0.07 },
            { a: -0.15, b: 0.28,  c: 0.26,  d: 0.24,  e: 0,    f: 0.44,  p: 0.07 }
        ];

        this.themes = {
            classic: { color: '#90EE90', alpha: 0.8 },
            autumn: { color: '#FF6B35', alpha: 0.8 },
            ocean: { color: '#4A90E2', alpha: 0.8 },
            monochrome: { color: '#FFFFFF', alpha: 0.6 },
            rainbow: { color: null, alpha: 0.8 }
        };

        this.initCanvas();
        this.bindEvents();
    }

    initCanvas() {
        this.canvas.width = 900;
        this.canvas.height = 600;

        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height - 60;
        this.scale = 50;
    }

    bindEvents() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());

        const speedSlider = document.getElementById('speedSlider');
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = this.speed;
        });

        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.currentTheme = e.target.value;
        });

        window.addEventListener('resize', () => {
            this.initCanvas();
            this.reset();
        });
    }

    getNextPoint() {
        const rand = Math.random();
        let cumulativeP = 0;
        let selectedTransform = this.transforms[0];

        for (const transform of this.transforms) {
            cumulativeP += transform.p;
            if (rand <= cumulativeP) {
                selectedTransform = transform;
                break;
            }
        }

        const newX = selectedTransform.a * this.x + selectedTransform.b * this.y + selectedTransform.e;
        const newY = selectedTransform.c * this.x + selectedTransform.d * this.y + selectedTransform.f;

        this.x = newX;
        this.y = newY;

        return { x: newX, y: newY };
    }

    drawPoint(x, y) {
        const screenX = this.centerX + x * this.scale;
        const screenY = this.centerY - y * this.scale;

        if (screenX >= 0 && screenX < this.canvas.width && screenY >= 0 && screenY < this.canvas.height) {
            const theme = this.themes[this.currentTheme];

            this.ctx.globalAlpha = theme.alpha;

            if (this.currentTheme === 'rainbow') {
                const hue = (this.pointCount * 0.1) % 360;
                this.ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            } else {
                this.ctx.fillStyle = theme.color;
            }

            this.ctx.fillRect(Math.floor(screenX), Math.floor(screenY), 2, 2);
            this.pointCount++;
        }
    }

    animate() {
        if (!this.isRunning) return;

        for (let i = 0; i < this.speed; i++) {
            const point = this.getNextPoint();
            this.drawPoint(point.x, point.y);
        }

        document.getElementById('pointCounter').textContent = `点数: ${this.pointCount.toLocaleString()}`;

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;

        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
    }

    reset() {
        this.stop();

        this.x = 0;
        this.y = 0;
        this.pointCount = 0;

        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        document.getElementById('pointCounter').textContent = '点数: 0';
    }
}

class WelcomeModal {
    constructor() {
        this.modal = document.getElementById('welcomeModal');
        this.closeBtn = document.getElementById('closeModal');
        this.startBtn = document.getElementById('startTutorial');

        this.bindEvents();
        this.showModal();
    }

    bindEvents() {
        this.closeBtn.addEventListener('click', () => this.hideModal());
        this.startBtn.addEventListener('click', () => this.hideModal());

        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.modal.classList.contains('show')) {
                this.hideModal();
            }
        });
    }

    showModal() {
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        this.modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const fern = new BarnsleyFern();
    const modal = new WelcomeModal();

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (fern.isRunning) {
                fern.stop();
            } else {
                fern.start();
            }
        } else if (e.code === 'KeyR') {
            e.preventDefault();
            fern.reset();
        }
    });
});

if (!HTMLCanvasElement.prototype.getContext) {
    document.body.innerHTML = '<div style="text-align: center; padding: 2rem; color: red; font-size: 1.2rem;">このブラウザはCanvas APIをサポートしていません。最新のブラウザをご利用ください。</div>';
}