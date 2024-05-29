import Router from "../Router.ts";
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// 模拟一个 Vue 组件
const HELLO = { template: '<div>Hello World</div>' };

describe('路由初始化', () => {
    let addEventListenerSpy;
    let originalPathname;
    let originalHash;

    beforeEach(() => {
        originalPathname = window.location.pathname;
        originalHash = window.location.hash;
        addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    });

    afterEach(() => {
        window.history.pushState({}, '', originalPathname);
        window.location.hash = originalHash;
        addEventListenerSpy.mockRestore();
    });

    it('路由构造函数默认值', () => {
        const router = new Router();
        expect(router.mode).toBe('history');
        expect(router.routes.size).toBe(0);
    });

    it('路由构造函数自定义值', () => {
        const routes = [{ path: '/home', component: HELLO }];
        const router = new Router({ mode: 'hash', routes });
        expect(router.mode).toBe('hash');
        expect(router.routes.size).toBe(1);
    });

    it('处理路由变化时调用错误处理程序', async () => {
        const router = new Router();
        const errorHandler = vi.fn();
        const error = new Error('测试错误');

        router.onError(errorHandler);
        router.beforeEach(() => { throw error; });

        await router.handleRouteChange('/home');

        expect(errorHandler).toHaveBeenCalledWith(error);
    });

    it('readyResolve 在路由变化后应只调用一次', async () => {
        const router = new Router();
        const readyResolveSpy = vi.spyOn(router, 'readyResolve');

        router.addRoute('/home', HELLO);
        await router.push('/home');

        expect(readyResolveSpy).toHaveBeenCalledTimes(1);
    });

    it('convertToRegex 应该正确转换动态路由', () => {
        const router = new Router();
        const regex = router.convertToRegex('/home/:id');
        expect(regex).toBe('/home/([^\\s/]+)');
    });

    it('getCurrentPath 在不同模式下应返回正确路径', () => {
        const routerHistory = new Router({ mode: 'history' });
        window.history.pushState({}, '', '/home');
        expect(routerHistory.getCurrentPath()).toBe('/home');

        const routerHash = new Router({ mode: 'hash' });
        window.location.hash = '#/home';
        expect(routerHash.getCurrentPath()).toBe('/home');
    });

    it('install 应该将路由器注入 Vue 应用', () => {
        const app = { config: { globalProperties: {} }, provide: vi.fn(),component: vi.fn()};
        const router = new Router();
        router.install(app);
        expect(app.config.globalProperties.$router).toBe(router);
        expect(app.provide).toHaveBeenCalledWith('router', router);
    });

    it('init 方法应设置事件监听器并调用 onRouteChange', async () => {
        const routerHistory = new Router({ mode: 'history' });
        expect(addEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));

        const routerHash = new Router({ mode: 'hash' });
        expect(addEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));

        const onRouteChangeSpyHistory = vi.spyOn(routerHistory, 'onRouteChange');
        const onRouteChangeSpyHash = vi.spyOn(routerHash, 'onRouteChange');
        await routerHistory.init();
        await routerHash.init();
        expect(onRouteChangeSpyHistory).toHaveBeenCalled();
        expect(onRouteChangeSpyHash).toHaveBeenCalled();
    });

    it('matchRouteComponent 对于未匹配的路径应返回 null', () => {
        const router = new Router();
        expect(router.matchRouteComponent('/unknown')).toBeNull();
    });

    it('在路由变化时 currentComponent 应该更新', async () => {
        const router = new Router();
        router.addRoute('/home', HELLO);
        await router.push('/home');
        expect(router.currentComponent.value).toEqual(HELLO);
    });

    it('isReady 应该在路由变化后解析', async () => {
        const router = new Router();
        const readyPromise = router.isReady();
        await router.push('/home');
        await expect(readyPromise).resolves.toBeUndefined();
    });

    it('测试 navigation 方法（go, back, forward）', () => {
        const router = new Router();
        const goSpy = vi.spyOn(window.history, 'go');
        const backSpy = vi.spyOn(window.history, 'back');
        const forwardSpy = vi.spyOn(window.history, 'forward');

        router.go(1);
        expect(goSpy).toHaveBeenCalledWith(1);

        router.back();
        expect(backSpy).toHaveBeenCalled();

        router.forward();
        expect(forwardSpy).toHaveBeenCalled();
    });

    it('router.addRoute 应该成功添加路由', () => {
        const router = new Router();
        router.addRoute('/home', HELLO);
        expect(router.routes).toEqual(new Map([['/home', HELLO]]));
    });

    it('router.addRoute 接受的不是个组件', () => {
        const router = new Router();
        expect(() => {
            router.addRoute('/home', 'HELLO');
        }).toThrowError('component is not a Vue component');
    });

    it('router.push 和 replace 方法应更新路径并调用 onRouteChange', async () => {
        const router = new Router();
        router.addRoute('/home', HELLO);
        const onRouteChangeSpy = vi.spyOn(router, 'onRouteChange');

        await router.push('/home');
        expect(router.getCurrentPath()).toBe('/home');
        expect(onRouteChangeSpy).toHaveBeenCalled();

        await router.replace('/home');
        expect(router.getCurrentPath()).toBe('/home');
        expect(onRouteChangeSpy).toHaveBeenCalled();
    });

    it('router.replace 成功', async () => {
        const router = new Router();
        router.addRoute('/home', HELLO);
        await router.replace('/home');
        expect(router.getCurrentComponent().value).toEqual(HELLO);
    });

    it('钩子执行顺序应该是 beforeEach -> beforeResolve -> afterEach', async () => {
        const router = new Router();
        const callOrder = [];

        router.beforeEach(() => { callOrder.push('beforeEach'); return Promise.resolve(); });
        router.beforeResolve(() => { callOrder.push('beforeResolve'); return Promise.resolve(); });
        router.afterEach(() => { callOrder.push('afterEach'); return Promise.resolve(); });

        router.addRoute('/home', HELLO);
        await router.push('/home');

        expect(callOrder).toEqual(['beforeEach', 'beforeResolve', 'afterEach']);
    });

    it('onRouteChange 应该正确处理当前路径和未匹配路径', async () => {
        const router = new Router();
        router.addRoute('/home', HELLO);

        window.history.pushState({}, '', '/home');
        await router.onRouteChange();
        expect(router.currentRoute.value).toBe('/home');
        expect(router.currentComponent.value).toBe(HELLO);

        window.history.pushState({}, '', '/unknown');
        await router.onRouteChange();
        expect(router.currentRoute.value).toBe('/404');
    });

    it('getCurrentPath 方法在未定义模式下应返回根路径', () => {
        const router = new Router({ mode: 'invalid' });
        expect(router.getCurrentPath()).toBe('/');
    });

    it('push 和 replace 方法在 hash 模式下应更新 hash 并调用 onRouteChange', async () => {
        const router = new Router({ mode: 'hash' });
        router.addRoute('/home', HELLO);
        const onRouteChangeSpy = vi.spyOn(router, 'onRouteChange');

        await router.push('/home');
        expect(window.location.hash).toBe('#/home');
        expect(onRouteChangeSpy).toHaveBeenCalled();

        await router.replace('/home');
        expect(window.location.hash).toBe('#/home');
        expect(onRouteChangeSpy).toHaveBeenCalled();
    });

    it('push 和 replace 方法在 hash 模式下应正确处理空 hash', async () => {
        const router = new Router({ mode: 'hash' });
        const onRouteChangeSpy = vi.spyOn(router, 'onRouteChange');

        await router.push('');
        expect(window.location.hash).toBe('#/');
        expect(onRouteChangeSpy).toHaveBeenCalled();

        await router.replace('');
        expect(window.location.hash).toBe('#/');
        expect(onRouteChangeSpy).toHaveBeenCalled();
    });

    it('构造函数应该调用 addRoutes 方法', () => {
        const addRoutesSpy = vi.spyOn(Router.prototype, 'addRoutes');
        new Router({ routes: [{ path: '/home', component: HELLO }] });
        expect(addRoutesSpy).toHaveBeenCalled();
        addRoutesSpy.mockRestore();
    });

    it('调用 addRoutes 方法时应该添加所有路由', () => {
        const router = new Router();
        const routes = [{ path: '/home', component: HELLO }, { path: '/about', component: HELLO }];
        router.addRoutes(routes);
        expect(router.routes.size).toBe(2);
        expect(router.routes.get('/home')).toBe(HELLO);
        expect(router.routes.get('/about')).toBe(HELLO);
    });

    it('readyResolve 在 handleRouteChange 方法中应被调用', async () => {
        const router = new Router();
        const readyResolveSpy = vi.spyOn(router, 'readyResolve');

        router.addRoute('/home', HELLO);
        await router.push('/home');

        expect(readyResolveSpy).toHaveBeenCalled();
    });

    it('测试 beforeResolve 钩子', async () => {
        const router = new Router();
        const beforeResolveHook = vi.fn().mockResolvedValue(undefined);

        router.addRoute('/home', HELLO);
        router.beforeResolve(beforeResolveHook);

        await router.push('/home');

        expect(beforeResolveHook).toHaveBeenCalled();
    });

    it('测试 onError 钩子', async () => {
        const router = new Router();
        const errorHook = vi.fn();

        router.addRoute('/home', HELLO);
        router.onError(errorHook);

        const error = new Error('测试错误');
        router.beforeEach(() => {
            throw error;
        });

        await router.push('/home');

        expect(errorHook).toHaveBeenCalledWith(error);
    });
});