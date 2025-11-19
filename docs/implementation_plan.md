# Isometric Map Editor Implementation Plan

## Goal Description
Create a web-based isometric map editor that allows users to import tilesets, configure them, and place tiles onto an isometric grid.

## Proposed Changes

### Project Structure
- **Name**: TileScape
- **Framework**: Vite with Vanilla JavaScript.
- **Routing**: Custom hash-based router for SPA feel (Home, Editor, News, Blog).
- **Testing**:
    - **Unit**: Vitest.
    - **E2E**: Playwright.
- **Configuration**: `.env` for secrets (API keys).

### Core Components
- `src/main.js`: Entry point & Router.
- `src/router.js`: Handles navigation.
- `src/config.js`: Secure config loading.
- `src/services/`: Storage and API interaction.
- `src/components/`: Reusable UI components (Header, Footer, Card).

### Features

#### Editor (The Core)
- **Tileset Manager**: Import, Grid Config, Selection.
- **Map Editor**: Isometric Grid, Placement, Replacement.
- **Collections**: Save/Load maps and tilesets (Local Storage initially, prepared for API).

#### Content Sections
- **News**: Reverse-chronological updates.
- **Blog**: Dev logs and articles.

#### UI/UX
- **Header**: Navigation (Editor, News, Blog, Collections).
- **Theme**: Premium dark mode, "Glassmorphism".


### Tileset Management
- **Import Modes**:
    - **Individual**: Upload multiple images (current).
    - **Tilesheet**: Upload single image + Rows/Cols config.
- **UI**: Radio buttons to toggle import mode.
- **Storage**: Handle both list of images and single sheet + grid data.

### Map Management
- **Perspectives**:
    - **Isometric**: Standard 2:1 iso grid.
    - **Flat**: Top-down orthogonal grid (Default).
- **UI**: Radio buttons to toggle map perspective.
- **Rendering**: `MapManager` switches render logic based on selected perspective.
- **Interaction**:
    - **Paint**: Click or Drag to place tiles.
    - **Erase**: Right-click to remove tiles.
    - **Pan**: Middle-click and drag to move the camera.

### UI/UX
- Modern dark theme.
- Sidebar for controls (Tileset, Map Settings).
- Main area for the Map Canvas.
- **Tileset Preview**: Scrollable container for large tilesets.

### Documentation
- **README**: Project overview, "Vibe Coded" attribution, and screenshot.
- **Assets**: Include demo screenshot.



## Verification Plan

### Automated Tests
- **Unit Tests**: Vitest for core logic (Grid math, State management).
    - `npm run test:unit`
- **E2E Tests**: Playwright for user flows (Create Map, Place Tile, Navigate).
    - `npm run test:e2e`

### Manual Verification
- **Navigation**: Click links in header, verify view changes.
- **Editor**:
    - Import Tileset -> Configure -> Select Tile -> Place on Map.
    - Save Map -> Refresh -> Load Map.
- **Secrets**: Verify `.env` values are loaded but not exposed in client bundles (careful usage).

