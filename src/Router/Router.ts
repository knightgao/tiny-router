
class Router {
    currentUrl: string;
    routesMapper: Map<string, any>;
    currentComponent: null;
    mode: string;
    beforeHooks: any[] = [];
    afterHooks: any[] = [];
    
    constructor({ mode = 'history'}={}) {
        this.routesMapper = new Map();
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

    beforeEach(hook: (from: string, to: string) => Promise<void>) {
        this.beforeHooks.push(hook);
    }

    afterEach(hook: (from: string,to: string) => Promise<void>) {
        this.afterHooks.push(hook);
    }

    addRoute(path:string, component: any) {
        if (typeof component !== 'object') {
            throw new Error('component is not a Vue component');
        }
        this.routesMapper.set(path, component);
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
        // 提前处理一下路径
        const targetPath = this.matchTargetUrl(path);

        await this.handleRouteChange(targetPath);
    }

    async handleRouteChange(path:string) {
        const from = this.currentUrl;
        const to = path;

        console.log("from", from)
        console.log("to", to)

        for (const hook of this.beforeHooks) await hook(from, to);

        // 更新路径
        this.currentUrl = path;
        // 更新组件
        this.currentComponent = this.matchRouteComponent(path);

        for (const hook of this.afterHooks) await hook(from,to);
    }

    matchTargetUrl(path: string) {
        const routesMapper = Array.from(this.routesMapper.keys());
        for (const route of routesMapper) {
            const regex = new RegExp(`^${this.convertToRegex(route)}$`);
            const match = path.match(regex);
            if (match) {
                return route;
            }
        }
        // 匹配不上返回404
        return '/404';
    }

    convertToRegex(route: string) {
        return route.replace(/:[^\s/]+/g, '([^\\s/]+)');
    }

    matchRouteComponent(path: string) {
        return this.routesMapper.get(path);
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