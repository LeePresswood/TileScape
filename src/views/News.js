import { Header } from '../components/Header.js';

export function News(container) {
    container.appendChild(Header());

    const content = document.createElement('div');
    content.className = 'view-content news-view';
    content.innerHTML = `
    <h1>Latest News</h1>
    <div class="news-feed">
      <article class="card">
        <h3>TileScape Launch</h3>
        <date>2025-11-18</date>
        <p>We are excited to announce the initial release of TileScape!</p>
      </article>
    </div>
  `;
    container.appendChild(content);
}
