class Router {
    currentUrl: string;
    routes: any;
    currentComponent: null;
    mode: string;
    constructor({ mode = 'history'}={}) {
        this.routes = {};
        this.currentComponent = null;
        this.currentUrl = ""; // Add the currentUrl property
        this.mode = mode;
        this.init();
    }

    init() {
        // 两个事件就可以监听路由的变化了
        if (this.mode === 'history') {
            window.addEventListener('popstate', async () => {
                await this.routeChanged();
            });
        } else if (this.mode === 'hash') {
            window.addEventListener('hashchange', async () => {
                await this.routeChanged();
            });
        }
    }

    addRoute(path:string, component: any) {
        if (typeof component !== 'object') {
            throw new Error('component is not a Vue component');
        }
        this.routes[path] = component;
    }

    async navigate(path: string) {
        if (this.mode === 'history') {
            window.history.pushState({}, '', path);
        } else if (this.mode === 'hash') {
            window.location.hash = path;
        }
        await this.routeChanged();
    }

    async routeChanged() {
        const path = this.getCurrentPath();
        console.log('path', path);
        this.currentComponent = this.routes[path];
    }

    getCurrentPath(): string {
        if (this.mode === 'history') {
            return window.location.pathname || '/';
        } else if (this.mode === 'hash') {
            return window.location.hash.slice(1) || '/';
        }
        return '/';
    }

    getCurrentComponent() {
        return this.currentComponent;
    }
}

export default Router;