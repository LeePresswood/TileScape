export class MapManager {
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.ui = ui;

        this.mapWidth = 10;
        this.mapHeight = 10;
        this.tileWidth = 64;
        this.tileHeight = 32;
        this.perspective = 'flat'; // 'isometric' or 'flat'

        this.tiles = new Map(); // Key: "x,y", Value: { src, x, y, width, height, image }
        this.hoverTile = null;

        this.offsetX = this.canvas.width / 2;
        this.offsetY = 100;

        this.isPanning = false;
        this.isPainting = false;
        this.lastPanX = 0;
        this.lastPanY = 0;
        this.selectedTileData = null;

        this.bindEvents();
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.renderLoop();
    }

    bindEvents() {
        this.ui.mapWidthInput.addEventListener('input', (e) => {
            this.mapWidth = parseInt(e.target.value) || 1;
        });
        this.ui.mapHeightInput.addEventListener('input', (e) => {
            this.mapHeight = parseInt(e.target.value) || 1;
        });

        this.ui.perspectiveRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.perspective = e.target.value;
                this.centerMap();
                this.render();
            });
        });

        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;

        // Only reset offset if it's the first load or perspective switch, 
        // but we might want to keep it if just resizing window.
        // For now, let's keep the center logic simple.
        if (!this.hasCentered) {
            this.centerMap();
            this.hasCentered = true;
        }

        this.render();
    }

    centerMap() {
        if (this.perspective === 'isometric') {
            this.offsetX = this.canvas.width / 2;
            this.offsetY = 100;
        } else {
            this.offsetX = (this.canvas.width - (this.mapWidth * this.tileWidth)) / 2;
            this.offsetY = (this.canvas.height - (this.mapHeight * this.tileWidth)) / 2;
        }
    }

    screenToIso(screenX, screenY) {
        const adjX = screenX - this.offsetX;
        const adjY = screenY - this.offsetY;
        const isoX = (adjX / (this.tileWidth / 2) + adjY / (this.tileHeight / 2)) / 2;
        const isoY = (adjY / (this.tileHeight / 2) - (adjX / (this.tileWidth / 2))) / 2;
        return { x: Math.floor(isoX), y: Math.floor(isoY) };
    }

    isoToScreen(isoX, isoY) {
        const screenX = (isoX - isoY) * (this.tileWidth / 2) + this.offsetX;
        const screenY = (isoX + isoY) * (this.tileHeight / 2) + this.offsetY;
        return { x: screenX, y: screenY };
    }

    screenToFlat(screenX, screenY) {
        const size = this.tileWidth;
        const col = Math.floor((screenX - this.offsetX) / size);
        const row = Math.floor((screenY - this.offsetY) / size);
        return { x: col, y: row };
    }

    flatToScreen(col, row) {
        const size = this.tileWidth;
        return {
            x: this.offsetX + col * size,
            y: this.offsetY + row * size
        };
    }

    handleMouseDown(e) {
        if (e.button === 1) { // Middle click
            this.isPanning = true;
            this.lastPanX = e.clientX;
            this.lastPanY = e.clientY;
            e.preventDefault();
        } else if (e.button === 0) { // Left click
            this.isPainting = true;
            this.handlePaint(e);
        }
    }

    handleMouseMove(e) {
        if (this.isPanning) {
            const dx = e.clientX - this.lastPanX;
            const dy = e.clientY - this.lastPanY;
            this.offsetX += dx;
            this.offsetY += dy;
            this.lastPanX = e.clientX;
            this.lastPanY = e.clientY;
            this.render();
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let gridPos;
        if (this.perspective === 'isometric') {
            gridPos = this.screenToIso(x, y);
        } else {
            gridPos = this.screenToFlat(x, y);
        }

        if (gridPos.x >= 0 && gridPos.x < this.mapWidth && gridPos.y >= 0 && gridPos.y < this.mapHeight) {
            this.hoverTile = gridPos;
        } else {
            this.hoverTile = null;
        }

        if (this.isPainting) {
            this.handlePaint(e);
        }
    }

    handleMouseUp(e) {
        this.isPanning = false;
        this.isPainting = false;
    }

    handleContextMenu(e) {
        e.preventDefault();
        if (this.hoverTile) {
            const key = `${this.hoverTile.x},${this.hoverTile.y}`;
            this.tiles.delete(key);
            this.render();
        }
    }

    handlePaint(e) {
        if (this.hoverTile && this.selectedTileData) {
            const key = `${this.hoverTile.x},${this.hoverTile.y}`;
            this.tiles.set(key, { ...this.selectedTileData });
            this.render();
        }
    }

    setSelectedTile(tileData) {
        this.selectedTileData = tileData;
    }

    renderLoop() {
        this.render();
        requestAnimationFrame(() => this.renderLoop());
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                this.drawTile(x, y);
            }
        }

        if (this.hoverTile) {
            this.drawHighlight(this.hoverTile.x, this.hoverTile.y);
        }
    }

    drawTile(x, y) {
        let screen;
        if (this.perspective === 'isometric') {
            screen = this.isoToScreen(x, y);
        } else {
            screen = this.flatToScreen(x, y);
        }

        const key = `${x},${y}`;
        const tile = this.tiles.get(key);

        if (tile) {
            if (this.perspective === 'isometric') {
                const drawX = screen.x - (this.tileWidth / 2);
                const drawY = screen.y - (this.tileHeight / 2) - (tile.height - this.tileHeight);
                this.ctx.drawImage(
                    tile.image,
                    tile.x, tile.y, tile.width, tile.height,
                    drawX, drawY, this.tileWidth, tile.height
                );
            } else {
                // Flat render
                // Draw square tile
                const size = this.tileWidth;
                this.ctx.drawImage(
                    tile.image,
                    tile.x, tile.y, tile.width, tile.height,
                    screen.x, screen.y, size, size
                );
            }
        } else {
            // Grid outline
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;

            if (this.perspective === 'isometric') {
                this.ctx.beginPath();
                this.ctx.moveTo(screen.x, screen.y);
                this.ctx.lineTo(screen.x + this.tileWidth / 2, screen.y + this.tileHeight / 2);
                this.ctx.lineTo(screen.x, screen.y + this.tileHeight);
                this.ctx.lineTo(screen.x - this.tileWidth / 2, screen.y + this.tileHeight / 2);
                this.ctx.closePath();
                this.ctx.stroke();
            } else {
                const size = this.tileWidth;
                this.ctx.strokeRect(screen.x, screen.y, size, size);
            }
        }
    }

    drawHighlight(x, y) {
        let screen;
        if (this.perspective === 'isometric') {
            screen = this.isoToScreen(x, y);

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.beginPath();
            this.ctx.moveTo(screen.x, screen.y);
            this.ctx.lineTo(screen.x + this.tileWidth / 2, screen.y + this.tileHeight / 2);
            this.ctx.lineTo(screen.x, screen.y + this.tileHeight);
            this.ctx.lineTo(screen.x - this.tileWidth / 2, screen.y + this.tileHeight / 2);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        } else {
            screen = this.flatToScreen(x, y);
            const size = this.tileWidth;

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(screen.x, screen.y, size, size);
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(screen.x, screen.y, size, size);
        }
    }
}
