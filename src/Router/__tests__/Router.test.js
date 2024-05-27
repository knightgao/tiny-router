import Router from "../Router.ts";
import { describe, it, expect, beforeEach, afterEach, vi, test } from 'vitest';
// 模拟一个 Vue 组件
const HELLO = { template: '<div>Hello World</div>' };

describe('Router init', () => {

    let addEventListenerSpy;

    beforeEach(() => {
        // 使用 vi.spyOn 监控 window.addEventListener 方法
        addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    });

    afterEach(() => {
        // 在每个测试后还原 spy
        addEventListenerSpy.mockRestore();
    });

    test('router 应该是个类', () => {
        const router = new Router();
        expect(router.routes).toEqual(new Map());
        expect(router.currentComponent).toBeNull();
    });

    test('router.addRoute 成功', () => {
        const router = new Router();
        router.addRoute('/home', HELLO);
        expect(router.routes).toEqual(new Map([['/home', HELLO]]));
    });

    // router.addRoute 添加的应该是个动态url
    test('router.addRoute 添加的应该是个动态url', () => {
        const router = new Router();
        router.addRoute('/home/:id', HELLO);
        expect(router.routes).toEqual(new Map([['/home/:id', HELLO]]));
    });

    // router.addRoute 接受的不是个组件
    test('router.addRoute 接受的不是个组件', () => {
        const router = new Router();
        expect(() => {
            router.addRoute('/home', 'HELLO');
        }).toThrowError('component is not a Vue component');
    });

    // router 应该有push方法
    test('router 应该有push方法', () => {
        const router = new Router();
        expect(router.push).toBeDefined();
    });

    test('router.push 成功', async () => {
        const router = new Router();
        router.addRoute('/home', HELLO);
        await router.push('/home');
        expect(router.getCurrentComponent()).toEqual(HELLO);
    });

    // router 应该可以设置history模式
    test('router 应该可以设置history模式', () => {
        const router = new Router({ mode: 'history' });
        expect(router.mode).toBe('history');
    });

    // 监听路由变化 history模式 popstate
    it('应该可以监听 popstate 事件', () => {
        new Router({ mode: 'history' });
        expect(addEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
    });

    // 监听路由变化 hash模式 hashchange
    it('应该可以监听 hashchange 事件', () => {
        new Router({ mode: 'hash' });
        expect(addEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
    });

    // router 匹配动态路由
    test('router 匹配动态路由', () => {
        const router = new Router();
        router.addRoute('/home/:id', HELLO);
        expect(router.matchTargetUrl('/home/1')).toBe('/home/:id');
    });

    // router 匹配不上则返回 /404
    test('router 匹配不上则返回 /404', () => {
        const router = new Router();
        router.addRoute('/home', HELLO);
        expect(router.matchTargetUrl('/333')).toBe('/404');
    });

    // router 可以配置路由列表
    test('router 可以配置路由列表', () => {
        const router = new Router({ routes: [{ path: '/home', component: HELLO }] });
        expect(router.routes).toEqual(new Map([['/home', HELLO]]));
    });

    // router 应该有replace方法
    test('router 应该有replace方法', () => {
        const router = new Router();
        expect(router.replace).toBeDefined();
    });

    test('router.replace 成功', async () => {
        const router = new Router();
        router.addRoute('/home', HELLO);
        await router.replace('/home');
        expect(router.getCurrentComponent()).toEqual(HELLO);
    });

    // router 应该有back方法
    test('router 应该有back方法', () => {
        const router = new Router();
        expect(router.back).toBeDefined();
    });

    // router 应该有forward方法
    test('router 应该有forward方法', () => {
        const router = new Router();
        expect(router.forward).toBeDefined();
    });

    // router 应该有go方法
    test('router 应该有go方法', () => {
        const router = new Router();
        expect(router.go).toBeDefined();
    });

    // router 应该有go方法
    test('router 应该有go方法', () => {
        const router = new Router();
        expect(router.go).toBeDefined();
    });

    // 测试 beforeResolve 钩子
    test('beforeResolve 钩子应该在导航前执行', async () => {
        const router = new Router();
        const beforeResolveHook = vi.fn().mockResolvedValue(undefined);

        router.addRoute('/home', HELLO);
        router.beforeResolve(beforeResolveHook);

        await router.push('/home');

        expect(beforeResolveHook).toHaveBeenCalled();
    });

    // 测试 onError 钩子
    test('onError 钩子应该在导航错误时执行', async () => {
        const router = new Router();
        const errorHook = vi.fn();

        router.addRoute('/home', HELLO);
        router.onError(errorHook);

        const error = new Error('Test Error');
        router.beforeEach(() => {
            throw error;
        });

        await router.push('/home');

        expect(errorHook).toHaveBeenCalledWith(error);
    });

    // 测试 beforeEach, beforeResolve 和 afterEach 钩子执行顺序
    test('钩子执行顺序应该是 beforeEach -> beforeResolve -> afterEach', async () => {
        const router = new Router();
        const callOrder = [];

        const beforeEachHook = vi.fn().mockImplementation(() => {
            callOrder.push('beforeEach');
            return Promise.resolve();
        });
        const beforeResolveHook = vi.fn().mockImplementation(() => {
            callOrder.push('beforeResolve');
            return Promise.resolve();
        });
        const afterEachHook = vi.fn().mockImplementation(() => {
            callOrder.push('afterEach');
            return Promise.resolve();
        });

        router.addRoute('/home', HELLO);
        router.beforeEach(beforeEachHook);
        router.beforeResolve(beforeResolveHook);
        router.afterEach(afterEachHook);

        await router.push('/home');

        expect(callOrder).toEqual(['beforeEach', 'beforeResolve', 'afterEach']);
    });
});