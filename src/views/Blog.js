import { Header } from '../components/Header.js';

export function Blog(container) {
    container.appendChild(Header());

    const content = document.createElement('div');
    content.className = 'view-content blog-view';
    content.innerHTML = `
    <h1>Developer Blog</h1>
    <div class="blog-list">
      <article class="card">
        <h3>Building an Isometric Engine</h3>
        <p>Insights into the math and logic behind the grid...</p>
      </article>
    </div>
  `;
    container.appendChild(content);
}
