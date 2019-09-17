
/**
 * Created by 许宇
 *
 * ComponentBase
 * 组件基类
 */
// import
import { LoaderTool } from "./LoaderTool";
import Commom from "./easyFramework/commom";

// main
export default class ComponentBase extends Commom {

    // 按钮cd时长
    protected BTN_CLICK_CD_TIME: number = 0.5;

    protected onLoad(): void {
        this.node["childList"] = {}
        this.parseAllChildren(this.node)
        this.initView();
    };

    protected initView() {

    }



    /**
     * 遍历所有节点，并存储到 node[childList] 里
     * 绑定相关事件
     */
    protected parseAllChildren(nodeParent: cc.Node, extraName: string = "") {
        if (nodeParent == this.node) {// 自身，解析子节点
            for (var childNode of nodeParent.children) {
                this.parseAllChildren(childNode, extraName);
            }
            return true;
        }

        // 处理普通节点
        if (nodeParent.name[0] == "_") {
            // 绑定事件
            let nodeName = nodeParent.name.substr(1) + extraName;
            if (nodeName.indexOf("btnTouch_") !== -1) {
                nodeName = nodeName.substr(9);
                this.bindTouchEvent(nodeParent, nodeName);
            } else if (nodeName.indexOf("btn") !== -1) {
                nodeName = nodeName.substr(3);
                this.bindButtonEvent(nodeParent, nodeName);
            }

            if (!this.node["childList"][nodeName])
                this.node["childList"][nodeName] = nodeParent;
            else
                cc.warn("--> 节点名称重复", nodeParent.name, this.name);

            for (var childNode of nodeParent.children) {
                this.parseAllChildren(childNode, extraName);
            }
            return true;
        }
        return false;
    }

    /**
    * 按钮事件绑定
    * @param button 按钮节点
    * @param sName 绑定的事件名称，默认为按钮名称，去除第一个 '_'（函数名自动加上ClickEvent）
    */
    protected bindButtonEvent(button: cc.Node, sName: string, oParam: any = null) {
        if (!button) {
            cc.error("button is null , comp = %s", this.node.name);
            return;
        }
        let funcName = 'onBtn' + sName + "ClickEvent";
        let eventType = null;
        if (button.getComponent(cc.Button))
            eventType = 'click';
        else
            eventType = cc.Node.EventType.TOUCH_END;

        if (!this[funcName])
            return;


        button.on(eventType, (event: cc.Event.EventCustom) => {
            if (button["bDisable"]) {
                return;
            }

            // 按钮点击cd
            button["bDisable"] = true;
            button.runAction(cc.sequence(cc.delayTime(0.5),
                cc.callFunc(() => {
                    button["bDisable"] = false;
                }))
            )

            // 触发事件回调
            if (this[funcName]) {
                event["oParam"] = oParam;
                this[funcName](event);
            } else {
                cc.log("--> bindButton, no function:", funcName, this.name);
            }
        }, this);
    }

    protected bindTouchEvent(node: cc.Node, sName: string, oParam: any = null) {
        let callFunc = (event) => {
            // 当次事件是否无效
            if (cc.Node.EventType.TOUCH_START == event.type) {
                node["bEventInvalid"] = node["bDisable"];
            }

            if (node["bEventInvalid"] || node["bDisable"]) {
                return;
            }

            if (this[sName + "LongTouchEvent"]) {
                if (cc.Node.EventType.TOUCH_START == event.type) {
                    this.scheduleOnce(this[sName + "LongTouchEvent"], 1);
                } else if (cc.Node.EventType.TOUCH_END == event.type
                    || cc.Node.EventType.TOUCH_CANCEL == event.type) {
                    this.unschedule(this[sName + "LongTouchEvent"]);
                }
            }

            if (cc.Node.EventType.TOUCH_END == event.type) {
                node["bDisable"] = true;
                node.runAction(cc.sequence(cc.delayTime(this.BTN_CLICK_CD_TIME),
                    cc.callFunc(() => {
                        node["bDisable"] = false;
                    }))
                )
            }

            let funcName = sName + event.type[0].toUpperCase() + event.type.slice(1) + "Event";
            if (this[funcName]) {
                event["oParam"] = oParam;
                this[funcName](event);
            }
        };

        // sName + "TouchstartEvent"
        node.on(cc.Node.EventType.TOUCH_START, callFunc, this);
        // sName + "TouchmoveEvent"
        node.on(cc.Node.EventType.TOUCH_MOVE, callFunc, this);
        // sName + "TouchendEvent"
        node.on(cc.Node.EventType.TOUCH_END, callFunc, this);
        // sName + "TouchcancelEvent"
        node.on(cc.Node.EventType.TOUCH_CANCEL, callFunc, this);
    }

    /**
     * 绑定属性
     */
    protected bindProperty(data: any): void {
        for (let key in data) {
            let type = data[key];
            if (type == cc.Node)
                this[key] = this.getNode(key);
            else
                this[key] = this.getComp(key, type);
        }
    };

    // 获取子节点
    protected getNode(nodeName: string): cc.Node {
        if (this.node["childList"] && this.node["childList"][nodeName]) {
            let node = this.node["childList"][nodeName] as cc.Node;
            return node;
        }
        return null;
    }

    // 获取子节点上的组件
    protected getComp<T extends cc.Component>(nodeName: string, type: { prototype: T }): T {
        let node = this.getNode(nodeName);
        return this.findComponent(node, type);
    }

    protected findComponent<T extends cc.Component>(node: cc.Node, type: { prototype: T }): T {
        if (node) {
            let com = node.getComponent(type);
            return com;
        }
        return null;
    }

    /**
     * 异步加载资源
     * @param path 资源路径
     * @param type 类型
     * @param foo 加载成功后回调
     */
    public async getResourceAsync(path: string | string[] | { [key: string]: string },
        type?: typeof cc.Asset, foo?: Function
    ): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            let cbLoadRes = function (res) {
                if (!cc.isValid(that.node))
                    return;
                if (foo)
                    foo(res);
                resolve(res);
            }
            let tData = {};
            let tType = LoaderTool.getTypeToKey(type);
            if (typeof (path) == "string") {
                tData[tType] = {};
                tData[tType][path] = 1;
            } else {
                tData[tType] = {};
                for (let key in path) {
                    tData[tType][path[key]] = key;
                }
            }
            LoaderTool.loadRes(tData, cbLoadRes);
        });
    }

    public setSpriteResource(sPath: string, oSprite: cc.Sprite | cc.Mask, fLoadCb?: Function) {
        if (!oSprite) {
            return;
        }
        if (!sPath) {
            oSprite.spriteFrame = null;
            return;
        }
        let res = cc.loader.getRes(sPath, cc.Sprite);
        if (res) {
            oSprite.spriteFrame = res;
            if (fLoadCb)
                fLoadCb();
        } else {
            this.getResourceAsync(sPath, cc.SpriteFrame, res => {
                if (cc.isValid(this.node)) {
                    oSprite.spriteFrame = res;
                    if (fLoadCb)
                        fLoadCb();
                }
            });
        }
    }

    public setSpineResource(sPath: string, oSpine: sp.Skeleton, fLoadCb?: Function) {
        if (!oSpine) {
            return;
        }
        if (!sPath) {
            oSpine.skeletonData = null;
            return;
        }
        let onLoadSuccess = (res) => {
            oSpine.skeletonData = res;
            if (fLoadCb)
                fLoadCb();
        };
        let res = cc.loader.getRes(sPath, sp.SkeletonData);
        if (res) {
            onLoadSuccess(res);
        } else {
            this.getResourceAsync(sPath, sp.SkeletonData, (res) => {
                if (cc.isValid(this.node)) {
                    onLoadSuccess(res);
                }
            });
        }
    }
};
