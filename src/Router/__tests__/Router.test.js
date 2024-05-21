import Router from "../Router.ts";
import { describe, it, expect, beforeEach, afterEach, vi,test } from 'vitest';
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
        expect(router.routes).toEqual({});
        expect(router.currentComponent).toBeNull();
    });

    test('router.addRoute 成功', () => {
        const router = new Router();
        router.addRoute('/home', HELLO);
        expect(router.routes).toEqual({ "/home": HELLO });
    });

    // router.addRoute 接受的不是个组件
    test('router.addRoute 接受的不是个组件', () => {
        const router = new Router();
        expect(() => {
            router.addRoute('/home', 'HELLO');
        }).toThrowError('component is not a Vue component');
    });


    // router.addRoute 添加的应该是个动态url
    test('router.addRoute 添加的应该是个动态url', () => {
        const router = new Router();
        router.addRoute('/home/:id', HELLO);
        expect(router.routes).toEqual({ '/home/:id': HELLO });
    });

    // router 应该有navigate方法
    test('router 应该有navigate方法', () => {
        const router = new Router();
        expect(router.navigate).toBeDefined();
    });

    test('router.navigate 成功', async () => {
        const router = new Router();
        router.addRoute('/home', HELLO);
        await router.navigate('/home');
        expect(router.getCurrentComponent()).toEqual(HELLO);
    });

    // // router.navigate 成功
    // test('router.navigate 成功', async() => {
    //     const router = new Router();
    //     router.addRoute('home', HELLO);
    //     await router.navigate('home');
    //     expect(router.currentComponent).toEqual(HELLO);
    // });

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
    it('应该可以监听 popstate 事件', () => {
        new Router({ mode: 'hash' });
        expect(addEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
    });


    // routerchange 方法 改变渲染组件
    
    

});