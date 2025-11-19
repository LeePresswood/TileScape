import { Header } from '../components/Header.js';

export function Home(container) {
    container.appendChild(Header());

    const content = document.createElement('div');
    content.className = 'view-content home-view';
    content.innerHTML = `
    <div class="hero">
      <h1>Welcome to TileScape</h1>
      <p>Create stunning isometric maps with ease.</p>
      <div class="actions">
        <a href="#/editor" class="btn primary">Start Creating</a>
        <a href="#/news" class="btn secondary">What's New</a>
      </div>
    </div>
  `;
    container.appendChild(content);
}
