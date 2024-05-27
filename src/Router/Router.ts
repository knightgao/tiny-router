import { type App, shallowRef } from 'vue';

class Router {
    currentRoute = shallowRef<string>('');
    routes = new Map<string, any>();
    currentComponent = shallowRef<any>(null);
    mode: string;
    beforeGuards: any[] = [];
    beforeResolveGuards: any[] = [];
    afterGuards: any[] = [];
    errorHandlers: any[] = [];
    readyPromise: Promise<void>;
    readyResolve!: () => void;

    constructor({ mode = 'history', routes = [] }: { mode?: string, routes?: any[] } = {}) {
        this.mode = mode;
        this.readyPromise = new Promise((resolve) => {
            this.readyResolve = resolve;
        });
        this.init();
        this.addRoutes(routes);
    }

    init() {
        if (this.mode === 'history') {
            window.addEventListener('popstate', async () => {
                await this.onRouteChange();
            });
        } else if (this.mode === 'hash') {
            window.addEventListener('hashchange', async () => {
                await this.onRouteChange();
            });
        }
        this.onRouteChange(); // Initialize the first route
    }

    addRoutes(routes: any[]) {
        routes.forEach(route => {
            this.addRoute(route.path, route.component);
        });
    }

    beforeEach(hook: (from: string, to: string) => Promise<void>) {
        this.beforeGuards.push(hook);
    }

    beforeResolve(hook: (from: string, to: string) => Promise<void>) {
        this.beforeResolveGuards.push(hook);
    }

    afterEach(hook: (from: string, to: string) => Promise<void>) {
        this.afterGuards.push(hook);
    }

    onError(handler: (error: Error) => void) {
        this.errorHandlers.push(handler);
    }

    isReady(): Promise<void> {
        return this.readyPromise;
    }

    addRoute(path: string, component: any) {
        if (typeof component !== 'object') {
            throw new Error('component is not a Vue component');
        }
        this.routes.set(path, component);
    }

    async push(path: string) {
        if (this.mode === 'history') {
            window.history.pushState({}, '', path);
        } else if (this.mode === 'hash') {
            window.location.hash = path;
        }
        await this.onRouteChange();
    }

    async replace(path: string) {
        if (this.mode === 'history') {
            window.history.replaceState({}, '', path);
        } else if (this.mode === 'hash') {
            const newHash = '#' + path;
            window.location.replace(window.location.pathname + window.location.search + newHash);
        }
        await this.onRouteChange();
    }

    back() {
        window.history.back();
    }

    forward() {
        window.history.forward();
    }

    go(delta: number) {
        window.history.go(delta);
    }

    async onRouteChange() {
        const path = this.getCurrentPath();
        const targetPath = this.matchTargetUrl(path);

        await this.handleRouteChange(targetPath);
    }

    async handleRouteChange(path: string) {
        const from = this.currentRoute.value;
        const to = path;

        try {
            for (const hook of this.beforeGuards) await hook(from, to);
            for (const hook of this.beforeResolveGuards) await hook(from, to);

            this.currentRoute.value = path;
            this.currentComponent.value = this.matchRouteComponent(path);

            for (const hook of this.afterGuards) await hook(from, to);

            this?.readyResolve();
        } catch (error) {
            for (const handler of this.errorHandlers) handler(error);
        }
    }

    matchTargetUrl(path: string) {
        const routes = Array.from(this.routes.keys());
        for (const route of routes) {
            const regex = new RegExp(`^${this.convertToRegex(route)}$`);
            const match = path.match(regex);
            if (match) {
                return route;
            }
        }
        return '/404';
    }

    convertToRegex(route: string) {
        return route.replace(/:[^\s/]+/g, '([^\\s/]+)');
    }

    matchRouteComponent(path: string) {
        return this.routes.get(path) || null;
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

    install(app: App) {
        app.config.globalProperties.$router = this;
        app.provide('router', this);
        this.onRouteChange(); // Initialize the first route
    }
}

export default Router;