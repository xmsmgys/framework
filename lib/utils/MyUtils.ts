import UtilsMath from "./UtilsMath";
import UtilsString from "./UtilsString";
import UtilsTime from "./UtilsTime";

/**
 * Created by 许宇
 *
 * MyUtils
 * 工具
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class MyUtils {
    /** 数学工具 */
    public static math: UtilsMath = new UtilsMath();
    /** 字符串工具 */
    public static string: UtilsString = new UtilsString();
    /** 时间工具 */
    public static time: UtilsTime = new UtilsTime();

    // public  createSpriteSplash(width, height): cc.Node {
    //     if (width == null || width == undefined) width = 20;
    //     if (height == null || height == undefined) height = 20;
    //     let res = cc.loader.getRes('temporary/default_sprite_splash', cc.SpriteFrame);

    //     let node = new cc.Node();
    //     let spt = node.addComponent(cc.Sprite);
    //     spt.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    //     node.setContentSize(width, height);
    //     if (res)
    //         spt.spriteFrame = res;
    //     else {
    //         cc.loader.loadRes('temporary/default_sprite_splash', cc.SpriteFrame, (err, res) => {
    //             spt.spriteFrame = res;
    //         })
    //     }
    //     return node;
    // };

    // public  createButton(parent: cc.Node, title: string, foo: Function): cc.Node {
    //     let node = new cc.Node("btn");
    //     parent.addChild(node);
    //     let spt = node.addComponent(cc.Sprite);
    //     spt.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    //     node.setContentSize(100, 50);
    //     let res = cc.loader.getRes('temporary/default_btn', cc.SpriteFrame);
    //     if (res)
    //         spt.spriteFrame = res;
    //     else {
    //         cc.loader.loadRes('temporary/default_btn', cc.SpriteFrame, (err, res) => {
    //             spt.spriteFrame = res;
    //         })
    //     }
    //     node.on(cc.Node.EventType.TOUCH_END, (event) => {
    //         foo(event);
    //     });
    //     let nLabel = new cc.Node();
    //     nLabel.color = cc.color(0, 0, 0, 255);
    //     node.addChild(nLabel);
    //     let label = nLabel.addComponent(cc.Label);
    //     label.string = title;
    //     label.fontSize = label.lineHeight = 28;
    //     return node;
    // };

    public static tileCoordForPosition(tiledMap, position): cc.Vec2 {
        let mapSize = tiledMap.getMapSize();
        let tileSize = tiledMap.getTileSize();
        let x = position.x / tileSize.width;
        let y = (mapSize.height * tileSize.height - position.y) / tileSize.height;
        return cc.v2(x, y);
    }
    // tile坐标转成瓦片格子中心的OpenGL坐标
    public static positionForTileCoord(tiledMap, tileCoord): cc.Vec2 {
        let mapSize = tiledMap.getMapSize();
        let tileSize = tiledMap.getTileSize();
        let x = tileCoord.x * tileSize.width + tileSize.width / 2;
        let y = (mapSize.height - tileCoord.y) * tileSize.height - tileSize.height / 2;
        return cc.v2(x, y);
    }



    /**
     * 矩形碰撞
     */
    public static hitTestRect(rect1: cc.Rect, rect2: cc.Rect): boolean {
        return rect1.x < rect2.x + rect2.width
            && rect1.x + rect1.width > rect2.x
            && rect1.y < rect2.y + rect2.height
            && rect1.height + rect1.y > rect2.y
    };


    /**
     * 设置节点是否置灰
     * @param node 节点
     * @param bool 是否置灰
     */
    public static setNodeGray(node, bool) {
        if (!node) {
            return;
        }
        let oNode = node;
        if (node instanceof cc.Component) {
            oNode = node.node;
        }
        this.setNodeState(oNode, bool ? cc.Sprite.State.GRAY : cc.Sprite.State.NORMAL);
    }
    /**
     * 设置node状态
     * @param node
     * @param value
     */
    public static setNodeState(node: cc.Node, state: cc.Sprite.State) {
        let spt: any = node.getComponent(cc.Sprite);

        if (spt) {
            // spt.setState(state); //2.0的实现方式

            // 2.1的实现方式
            if (state == cc.Sprite.State.GRAY)
                spt.setMaterial(0, cc.Material.getInstantiatedBuiltinMaterial('2d-gray-sprite', spt));
            else
                spt.setMaterial(0, cc.Material.getInstantiatedBuiltinMaterial('2d-sprite', spt));
        }
        for (let index = 0; index < node.childrenCount; index++) {
            let item: cc.Node = node.children[index];
            this.setNodeState(item, state);
        }
    }

    /**
     * 搜索数据
     * @param list 数组
     * @param value 目标值
     * @param key 目标索引
     */
    public static arrIndexOf(list: Array<any>, value: any, key?: string): cc.Vec2 {
        let len = list.length;
        for (let i = 0; i < len; i++) {
            let item = list[i];
            if ((key && item[key] == value) || item == value)
                return item;
        }
        return null;
    }

    /**
     * 获取spine的BoundingBox
     */
    public static getSpineBoundingBox(comp: sp.Skeleton, name: string): object {
        let sData: sp.SkeletonData = comp.skeletonData;
        let sJson = sData.skeletonJson;
        let skin = sJson.skins.default;
        let data = skin[name]
        if (data)
            return data[name];
        else
            return null;
    };


    // /**
    //  * 截屏
    //  */
    // public static  captureScreenshot(node: cc.Node | any): cc.Node {
    //     let newNode: cc.Node | any = new cc.Node();

    //     let size: cc.Size = cc.view.getVisibleSize();
    //     let texture;
    //     if (cc.sys.isNative || cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
    //         texture = new cc.RenderTexture(size.width, size.height, 2, gl.DEPTH24_STENCIL8_OES);
    //     } else {
    //         texture = new cc.RenderTexture(size.width, size.height, 2, 0x88f0);
    //     }
    //     // node.parent._sgNode.addChild(texture); //把 renderTexture 添加到场景中去，否则截屏的时候，场景中的元素会移动
    //     // texture.setVisible(false); //把 renderTexture 设置为不可见，可以避免截图成功后，移除 renderTexture 造成的闪烁
    //     texture.begin();
    //     node._sgNode.visit();
    //     texture.end();
    //     // node.parent._sgNode.removeChild(texture);
    //     // texture.setVisible(true);
    //     // let spt = newNode.addComponent(cc.Sprite).spriteFrame = texture.getSprite().getSpriteFrame();
    //     newNode._sgNode.addChild(texture, 9999);
    //     // texture.saveToFile(filename, cc.IMAGE_FORMAT_PNG);
    //     return newNode
    // }

    public static comparison(nTarget, nInit, sCompareType) {
        let bPass = false
        switch (sCompareType) {
            case "=":
                bPass = nTarget == nInit
                break;
            case ">":
                bPass = nTarget > nInit
                break;
            case "<":
                bPass = nTarget < nInit
                break;
            case ">=":
                bPass = nTarget >= nInit
                break;
            case "<=":
                bPass = nTarget <= nInit
                break;
            case "<>":
                bPass = nTarget != nInit
                break;
            default:
                break;
        }
        return bPass
    }


    public static clone(initalObj, finalObj) {
        let obj = finalObj || {};
        for (let i in initalObj) {
            let prop = initalObj[i];
            if (prop === obj || prop == null || prop == undefined) // 避免相互引用对象导致死循环，如initalObj.a = initalObj的情况
                continue;
            if (typeof prop === 'object') {
                if (obj[i] == null || obj[i] == undefined)
                    obj[i] = (prop.constructor === Array) ? [] : {};
                this.clone(prop, obj[i]);
            } else {
                obj[i] = prop;
            }
        }
        return obj;
    }

    public static deepClone(initalObj, newObj?) {
        if (!initalObj) {
            cc.log("ERROR;DeepClone;initalObj is null")
            return
        }
        if (!newObj)
            newObj = (initalObj.constructor) ? new initalObj.constructor : {};

        for (let key in initalObj) {
            let copy = initalObj[key];
            // Beware that typeof null == "object" !
            if (typeof copy === "object" &&
                copy &&
                //!(copy instanceof cc._ccsg.Node) &&
                (CC_JSB || !(copy instanceof HTMLElement))) {
                newObj[key] = cc.clone(copy);
            } else {
                newObj[key] = copy;
            }
        }
        return newObj;
    };


    public static isSameObjeck(obj1, obj2) {
        let nLength1 = Object.keys(obj1).length
        let nLength2 = Object.keys(obj2).length

        if (nLength1 != nLength2) {
            return false
        }

        for (const key in obj1) {
            if (obj2[key] != obj1[key]) {
                return false
            }
        }
        return true
    }

    /**
     * 设置节点是否开启事件穿透
     * @param node
     * @param bool
     */
    // public static  setSwallowTouches(node: cc.Node, bool: boolean): void {
    //     if (node && node._touchListener)
    //         node._touchListener.setSwallowTouches(bool);
    // };

    /**
     * 创建prefab
     * @param url
     */
    public static createPrefab(url: string): cc.Node {
        let prefab: cc.Prefab = cc.loader.getRes(url, cc.Prefab);
        if (prefab) {
            let node: cc.Node = cc.instantiate(prefab);
            return node;
        }
        return null
    };

    /**
     * 创建prefab并返回class
     * @param url
     * @param className 类名
     */
    public static createPrefabAndReturnClass(url: string, className: string): any {
        let prefab: cc.Prefab = cc.loader.getRes(url);
        if (prefab) {
            let node: cc.Node = cc.instantiate(prefab);
            let cls = node.getComponent(className);
            return cls;
        }
        return null
    };

    /**
     * 获得随机数
     * @param maxNum 上限
     * @param minNum 下限
     * @param floatLen 取小数点后n位
     */
    public static getRandom(maxNum: number, minNum: number, floatLen: number = 0): number {
        return this.math.getRandom3(maxNum, minNum, floatLen);
    };
};
