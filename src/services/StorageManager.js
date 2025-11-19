export class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'tilescape_collections';
    }

    getCollections() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : { maps: [], tilesets: [] };
    }

    saveCollection(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }

    saveMap(mapData) {
        const collections = this.getCollections();
        const existingIndex = collections.maps.findIndex(m => m.id === mapData.id);

        if (existingIndex >= 0) {
            collections.maps[existingIndex] = mapData;
        } else {
            mapData.id = Date.now().toString();
            collections.maps.push(mapData);
        }

        this.saveCollection(collections);
        return mapData.id;
    }

    loadMap(id) {
        const collections = this.getCollections();
        return collections.maps.find(m => m.id === id);
    }

    // Helper to serialize MapManager state
    static serializeMap(mapManager) {
        const tiles = [];
        for (const [key, value] of mapManager.tiles.entries()) {
            tiles.push({
                key,
                src: value.src, // Save the image data URL
                width: value.width,
                height: value.height
            });
        }
        return {
            width: mapManager.mapWidth,
            height: mapManager.mapHeight,
            perspective: mapManager.perspective,
            tiles: tiles
        };
    }

    static deserializeMap(mapData, mapManager) {
        mapManager.mapWidth = mapData.width;
        mapManager.mapHeight = mapData.height;
        mapManager.perspective = mapData.perspective || 'isometric';

        // Update UI radios
        if (mapManager.ui.perspectiveRadios) {
            mapManager.ui.perspectiveRadios.forEach(radio => {
                radio.checked = (radio.value === mapManager.perspective);
            });
        }

        mapManager.tiles.clear();

        mapData.tiles.forEach(t => {
            const img = new Image();
            img.src = t.src;
            img.onload = () => {
                mapManager.tiles.set(t.key, {
                    image: img,
                    src: t.src,
                    width: t.width,
                    height: t.height
                });
                mapManager.render(); // Re-render when image loads
            };
        });

        mapManager.resize(); // Trigger resize/render
    }
}
