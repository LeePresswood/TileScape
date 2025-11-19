import { Header } from '../components/Header.js';
import { TilesetManager } from '../editor/TilesetManager.js';
import { MapManager } from '../editor/MapManager.js';
import { StorageManager } from '../services/StorageManager.js';

export function Editor(container) {
  container.appendChild(Header());

  const content = document.createElement('div');
  content.className = 'view-content editor-view';
  content.innerHTML = `
    <aside class="sidebar">
      <div class="panel tileset-panel">
        <h2>Tileset</h2>
        <div class="controls" style="margin-bottom: 1rem;">
            <label><input type="radio" name="import-mode" value="individual" checked> Individual</label>
            <label><input type="radio" name="import-mode" value="sheet"> Tilesheet</label>
        </div>
        <input type="file" id="tileset-upload" accept="image/*" multiple>
        <div class="controls" id="sheet-controls" style="display:none;">
          <label>Rows: <input type="number" id="tileset-rows" value="1" min="1"></label>
          <label>Cols: <input type="number" id="tileset-cols" value="1" min="1"></label>
        </div>
        <div class="controls" id="individual-hint">
          <p class="hint">Select multiple images to build your palette.</p>
        </div>
        <div id="tileset-preview" class="preview-area"></div>
      </div>
    </aside>
    <main class="canvas-area">
      <canvas id="map-canvas"></canvas>
    </main>
    <aside class="sidebar right-sidebar">
      <div class="panel map-panel">
        <h2>Map Settings</h2>
        <div class="controls" style="margin-bottom: 1rem;">
            <label><input type="radio" name="map-perspective" value="isometric"> Isometric</label>
            <label><input type="radio" name="map-perspective" value="flat" checked> Flat</label>
        </div>

        <div class="controls">
          <label>Map Width: <input type="number" id="map-width" value="10" min="1"></label>
          <label>Map Height: <input type="number" id="map-height" value="10" min="1"></label>
        </div>
        <div class="actions" style="margin-top: 1rem;">
          <button id="save-map" class="btn primary" style="width: 100%;">Save Map</button>
          <button id="load-map" class="btn secondary" style="width: 100%;">Load Map</button>
        </div>
      </div>
    </aside>
  `;
  container.appendChild(content);

  // Initialize Tileset Manager
  const tilesetManager = new TilesetManager({
    fileInput: document.getElementById('tileset-upload'),
    rowsInput: document.getElementById('tileset-rows'),
    colsInput: document.getElementById('tileset-cols'),
    sheetControls: document.getElementById('sheet-controls'),
    individualHint: document.getElementById('individual-hint'),
    importModeRadios: document.getElementsByName('import-mode'),
    previewContainer: document.getElementById('tileset-preview')
  });

  // Initialize Map Manager
  const mapManager = new MapManager(
    document.getElementById('map-canvas'),
    {
      mapWidthInput: document.getElementById('map-width'),
      mapHeightInput: document.getElementById('map-height'),
      perspectiveRadios: document.getElementsByName('map-perspective')
    }
  );

  // Connect them
  tilesetManager.onTileSelect = (tileData) => {
    mapManager.setSelectedTile(tileData);
  };

  // Storage Logic
  const storageManager = new StorageManager();

  document.getElementById('save-map').addEventListener('click', () => {
    const mapData = StorageManager.serializeMap(mapManager);
    const id = storageManager.saveMap(mapData);
    alert(`Map saved with ID: ${id}`);
  });

  document.getElementById('load-map').addEventListener('click', () => {
    const id = prompt('Enter Map ID to load:');
    if (id) {
      const mapData = storageManager.loadMap(id);
      if (mapData) {
        StorageManager.deserializeMap(mapData, mapManager);
        console.log('Loading map:', mapData);
      } else {
        alert('Map not found');
      }
    }
  });
}
