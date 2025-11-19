export class TilesetManager {
    constructor(ui) {
        this.ui = ui;
        this.tiles = []; // Array of { image, src, x, y, width, height }
        this.selectedTileIndex = -1;
        this.onTileSelect = null;
        this.mode = 'individual'; // 'individual' or 'sheet'

        // Preview Canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui.previewContainer.innerHTML = '';
        this.ui.previewContainer.appendChild(this.canvas);

        this.bindEvents();
    }

    bindEvents() {
        this.ui.fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

        // Mode switching
        this.ui.importModeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.mode = e.target.value;
                this.updateUI();
                this.tiles = []; // Clear tiles on mode switch
                this.render();
            });
        });

        // Sheet config changes
        this.ui.rowsInput.addEventListener('change', () => this.processSheet());
        this.ui.colsInput.addEventListener('change', () => this.processSheet());
    }

    updateUI() {
        if (this.mode === 'sheet') {
            this.ui.sheetControls.style.display = 'block';
            this.ui.individualHint.style.display = 'none';
            this.ui.fileInput.removeAttribute('multiple');
        } else {
            this.ui.sheetControls.style.display = 'none';
            this.ui.individualHint.style.display = 'block';
            this.ui.fileInput.setAttribute('multiple', '');
        }
        this.ui.fileInput.value = ''; // Reset file input
    }

    handleImageUpload(e) {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (this.mode === 'individual') {
            this.processIndividual(files);
        } else {
            this.processSheet(files[0]);
        }
    }

    processIndividual(files) {
        let loadedCount = 0;
        this.tiles = []; // Reset for new batch? Or append? Let's reset for now to keep it simple.

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    this.tiles.push({
                        image: img,
                        src: event.target.result,
                        width: img.width,
                        height: img.height,
                        // For individual, we use full image
                        x: 0, y: 0
                    });
                    loadedCount++;
                    if (loadedCount === files.length) {
                        this.render();
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    processSheet(file) {
        // If file is passed, store it. If not, use stored file (for config updates)
        if (file) {
            this.currentSheetFile = file;
        }

        if (!this.currentSheetFile) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                this.sheetImage = img;
                this.sheetSrc = event.target.result;
                this.sliceSheet();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(this.currentSheetFile);
    }

    sliceSheet() {
        if (!this.sheetImage) return;

        const rows = parseInt(this.ui.rowsInput.value) || 1;
        const cols = parseInt(this.ui.colsInput.value) || 1;
        const tileWidth = this.sheetImage.width / cols;
        const tileHeight = this.sheetImage.height / rows;

        this.tiles = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.tiles.push({
                    image: this.sheetImage,
                    src: this.sheetSrc, // Same source for all
                    width: tileWidth,
                    height: tileHeight,
                    x: c * tileWidth,
                    y: r * tileHeight
                });
            }
        }
        this.render();
    }

    render() {
        if (!this.tiles.length) {
            this.canvas.width = 0;
            this.canvas.height = 0;
            return;
        }

        const padding = 10;
        const cols = 4;
        const cellWidth = (this.canvas.parentElement.clientWidth - (padding * (cols + 1))) / cols;
        const cellHeight = cellWidth; // Square preview cells

        const rows = Math.ceil(this.tiles.length / cols);
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = rows * (cellHeight + padding) + padding;

        this.tiles.forEach((tile, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);

            const x = padding + col * (cellWidth + padding);
            const y = padding + row * (cellHeight + padding);

            // Draw background
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(x, y, cellWidth, cellHeight);

            // Draw Image (Contain)
            const scale = Math.min(cellWidth / tile.width, cellHeight / tile.height);
            const w = tile.width * scale;
            const h = tile.height * scale;
            const dx = x + (cellWidth - w) / 2;
            const dy = y + (cellHeight - h) / 2;

            this.ctx.drawImage(
                tile.image,
                tile.x, tile.y, tile.width, tile.height,
                dx, dy, w, h
            );

            // Highlight selected
            if (index === this.selectedTileIndex) {
                this.ctx.strokeStyle = 'yellow';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(x, y, cellWidth, cellHeight);
            }
        });
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const padding = 10;
        const cols = 4;
        const cellWidth = (this.canvas.width - (padding * (cols + 1))) / cols;
        const cellHeight = cellWidth;

        const col = Math.floor((x - padding) / (cellWidth + padding));
        const row = Math.floor((y - padding) / (cellHeight + padding));

        if (col >= 0 && col < cols && row >= 0) {
            const index = row * cols + col;
            if (index >= 0 && index < this.tiles.length) {
                this.selectedTileIndex = index;
                this.render();

                if (this.onTileSelect) {
                    this.onTileSelect(this.tiles[index]);
                }
            }
        }
    }
}
