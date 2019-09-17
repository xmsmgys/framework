/**
 * Created by 许宇
 *
 * LoaderTool
 * 加载器
 */
// import

export const LOADER_TYPE = cc.Enum({
    'Spine': 'Spine',
    'Image': 'Image',
    'TiledMap': 'TiledMap',
    'Prefab': 'Prefab',
    'Font': 'Font',
    'TTFont': 'TTFont',
    'BitMapFont': 'BitMapFont',
    'Animation': 'Animation',
    'Sound': 'Sound',
    'RawAsset': 'RawAsset',
})

class myClass {
    private load_Type = {
        'Spine': sp.SkeletonData,
        'Image': cc.SpriteFrame,
        'Atlas': cc.SpriteAtlas,
        'TiledMap': cc.TiledMapAsset,
        'Prefab': cc.Prefab,
        'Font': cc.Font,
        'TTFont': cc.TTFFont,
        'BitMapFont': cc.BitmapFont,
        'Animation': cc.AnimationClip,
        'Sound': cc.AudioClip,
        // 'Sound': cc.AudioSource,
        'Json': cc.JsonAsset,
        'RawAsset': "RawAsset",
    }

    /**
     * 加载单个资源
     * @param url 路径
     * @param type 类型
     * @param cb 完成回调
     */
    public loadUrl(url: string, type: any, cb?: Function): void {
        this.asyncLoadUrl(url, type).then((res: any) => {
            if (cb)
                cb(res);
        })
    }

    /**
     * 加载单个资源(async)
     * @param url 路径
     * @param type 类型
     */
    public asyncLoadUrl(url: string, type: any): Promise<any> {
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(url, type, (err: Error, res: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        })
    };


    /**
     * 加载多个资源
     * @param {Object} tData Spine,Image,TiledMap,Prefab,Font,TTFont,BitMapFont,Animation,Sound,RawAsset,Other
     * @param {Function} [finishCallback]
     * @example
     * LoaderTool.loadRes({
     *     'Prefab': { "prefab/prefabLoading": 1},
     *     'Image': { "prefab/prefabLoading": 1},
     * })
     */
    public async loadRes(tData: any, finishCallback?: Function) {
        let res = [];
        for (let key in tData) {
            let item = tData[key];
            let type = this.getKeyToType(key);
            let arrUrl = this.pushUrl(item, type && type == 'RawAsset');
            if (arrUrl.length > 0) {
                if (type) {
                    if (type == 'RawAsset') {
                        this.pushRes(res, await this.loadRaw(arrUrl));
                    } else
                        this.pushRes(res, await this.loadResArr(arrUrl, type));
                } else
                    this.pushRes(res, await this.loadResArr(arrUrl));
            }
        }
        if (finishCallback) {
            finishCallback(this.returnRes(res), tData);
        }
    };

    /**
     * 远程加载
     *
     */
    public load(url: any, progressCallback?: Function, finishCallback?: Function): void {
        cc.loader.load(url, (completedCount: number, completedTotal: number, item: Object) => {
            if (progressCallback && finishCallback) {
                progressCallback(completedCount, completedTotal, item);
            }
        }, (err, res, ...args) => {
            if (err) {
                cc.error("--> load err", err);
                return;
            }

            let arr = []
            if (url.constructor === Array) {
                for (let index in url) {
                    let key = url[index];
                    let item = res.getContent(key);
                    arr.push(item);
                }
            } else {
                arr.push(res.getContent(url));
            }
            if (progressCallback && !finishCallback)
                progressCallback(this.returnRes(arr));
            else if (finishCallback)
                finishCallback(this.returnRes(arr));
        })
    };
    private async loadRaw(url: any) {
        return new Promise((resolve, reject) => {
            this.load(url, (res) => {
                this.loadFinish(resolve, reject, null, res);
            })
        })
    };

    /**
     * 释放资源
     */
    public release(tData: Object): void {
        for (let key in tData) {
            let url = tData[key];
            let type = this.getKeyToType(key);
            let res = null;
            if (type && type != 'RawAsset') {
                res = cc.loader.getRes(url, type);
            } else res = cc.loader.getRes(cc.url.raw('resources' + url));
            if (res)
                cc.loader.release(res);
        }
    };

    /**
     * 同 cc.loader.getRes()
     */
    public getRes(url: string, type?: any): any {
        let oRes = cc.loader.getRes(url, type);
        if (!oRes) {
            cc.error("getRes;加载不到资源url=", url)
        }
        return oRes
    };

    private loadResArr(arrUrl: Array<string>, type?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (type) {
                cc.loader.loadResArray(arrUrl, type, (completedCount: number, totalCount: number, item: object) => {
                    // cc.log("----> loading", totalCount, completedCount, item);
                }, (err, res) => {
                    this.loadFinish(resolve, reject, err, res);
                })
            } else {
                cc.loader.loadResArray(arrUrl, (completedCount: number, totalCount: number, item: object) => {
                }, (err, res) => {
                    this.loadFinish(resolve, reject, err, res);
                })
            }
        })
    }

    private loadFinish(resolve, reject, err, res) {
        if (err) {
            cc.error(err);
            reject();
            return;
        }
        resolve(this.returnRes(res));
    }

    private getKeyToType(key: string): any {
        return this.load_Type[key];
    };
    public getTypeToKey(type: any): string {
        for (let key in this.load_Type) {
            let item = this.load_Type[key];
            if (type == item)
                return key;
        }
        return null;
    };

    public buildList(type: string, urlList: Array<string>, oldData: { [key: string]: any } = {}): { [key: string]: any } {
        for (let key in urlList) {
            let url = urlList[key];
            if (!oldData[type])
                oldData[type] = {};
            oldData[type][url] = 1;
        }
        return oldData;
    };

    private pushUrl(tData: Object, isRawUrl: boolean = false): Array<string> {
        if (typeof tData == 'string') {
            cc.error("--> LoaderTool 格式错误，不能为 string, 请检查，", tData);
        }

        let arrUrl: Array<string> = [];
        for (let key in tData) {
            if (typeof key != 'string') {
                cc.error("--> LoaderTool 格式错误，不能为 string, 请检查，", key);
            }
            if (!isRawUrl)
                arrUrl.push(key);
            else {
                if (key.charAt(0) == '/') //修正缺失‘/’的情况
                    arrUrl.push(cc.url.raw('resources' + key));
                else
                    arrUrl.push(cc.url.raw('resources/' + key));
            }
        }
        return arrUrl;
    };

    private pushRes(arr: Array<any>, res): Array<any> {
        if (res.constructor === Array) {
            for (let index in res)
                arr.push(res[index])
        } else
            arr.push(res);
        return arr
    };

    private returnRes(res: Array<any>): any {
        if (res.constructor !== Array || res.length > 1)
            return res;
        else
            return res[0];
    };
}

export const LoaderTool = new myClass();
