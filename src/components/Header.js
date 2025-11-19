export function Header() {
    const header = document.createElement('header');
    header.className = 'main-header';
    header.innerHTML = `
    <div class="logo">TileScape</div>
    <nav>
      <a href="#/">Home</a>
      <a href="#/editor">Editor</a>
      <a href="#/news">News</a>
      <a href="#/blog">Blog</a>
    </nav>
  `;
    return header;
}
