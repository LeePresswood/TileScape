import './style.css';
import { Router } from './router.js';
import { Home } from './views/Home.js';
import { Editor } from './views/Editor.js';
import { News } from './views/News.js';
import { Blog } from './views/Blog.js';

const routes = {
    '#/': Home,
    '#/editor': Editor,
    '#/news': News,
    '#/blog': Blog,
};

new Router(routes);
