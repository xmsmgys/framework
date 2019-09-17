/**
 * Created by 许宇
 *
 * MgrView
 * 本地缓存数据管理模块
 */
class myCache {
    /**
     * 获取缓存数据
     * @param key 键名
     */
    public getItem(key: string): any {
        let data = cc.sys.localStorage.getItem(key);
        return data ? (data[0] == "[" || data[0] == "{" ? JSON.parse(data) : data) : null;
    }
    /**
     * 缓存数据
     * @param key 键名
     * @param value 值
     */
    public setItem(key: string, value: string | object | number): void {
        let data = typeof value === 'string' ? value : JSON.stringify(value);
        cc.sys.localStorage.setItem(key, data);
    }
    /**
     * 删除缓存数据
     * @param key 键名
     */
    public removeItemByKey(key: string): void {
        cc.sys.localStorage.removeItem(key);
    }
    /**
     * 清空缓存数据
     */
    public clear() {
        cc.sys.localStorage.clear();
    }
}
export const LocalCache = new myCache();
