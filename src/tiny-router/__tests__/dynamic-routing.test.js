import Router from "../Router.ts";
import { describe, it, expect, beforeAll } from 'vitest';
// 模拟一个 Vue 组件
const HELLO = { template: '<div>Hello World</div>' };

describe('Router', () => {
    let router;
  
    beforeAll(() => {
      const routes = [
        { path: '/home', component: HELLO },
        { path: '/users/:userId', component: HELLO },
        { path: '/products/:productId', component: HELLO },
        { path: '/categories/:categoryId/products/:productId', component: HELLO },
        { path: '/search/:query?', component: HELLO },
        { path: '/departments/:departmentId/employees/:employeeId', component: HELLO }
      ];
      router = new Router({ routes: routes, mode: 'history' });
    });
  
    it('should match basic route', () => {
      expect(router.matchTargetUrl('/home')).toBe('/home');
    });
  
    it('should match route with userId parameter', () => {
      expect(router.matchTargetUrl('/users/123')).toBe('/users/:userId');
    });
  
    it('should match route with productId parameter', () => {
      expect(router.matchTargetUrl('/products/456')).toBe('/products/:productId');
    });
  
    it('should match route with categoryId and productId parameters', () => {
      expect(router.matchTargetUrl('/categories/789/products/123')).toBe('/categories/:categoryId/products/:productId');
    });
  
    it('should match route with optional query parameter', () => {
      expect(router.matchTargetUrl('/search/something')).toBe('/search/:query?');
    });
  
    it('should return 404 for unmatched path', () => {
      expect(router.matchTargetUrl('/contact')).toBe('/404');
    });
  
    it('should match route with departmentId and employeeId parameters', () => {
      expect(router.matchTargetUrl('/departments/001/employees/002')).toBe('/departments/:departmentId/employees/:employeeId');
    });
});