export class Router {
    constructor(routes) {
        this.routes = routes;
        this.app = document.getElementById('app');
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash || '#/';
        const route = this.routes[hash] || this.routes['#/'];

        if (route) {
            this.app.innerHTML = '';
            route(this.app);
        } else {
            this.app.innerHTML = '<h1>404 - Page Not Found</h1>';
        }
    }

    navigate(path) {
        window.location.hash = path;
    }
}
