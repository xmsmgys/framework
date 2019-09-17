/**
 * Created by 许宇
 *
 * ViewBase
 * view 基类
 */
// import
import ComponentBase from "./ComponentBase";
import { MgrView } from "../manager/MgrView";

// main
export default class ViewBase extends ComponentBase {

    protected nodeBg: cc.Node = null;

    protected addBackground(): void {
        this.nodeBg = this.node.getChildByName('nodeBg');
        if (this.nodeBg) return;
        this.nodeBg = this.node.getChildByName('_nodeBg');
        if (this.nodeBg) return;

        this.nodeBg = new cc.Node('nodeBg');
        this.nodeBg.parent = this.node;
        this.addWidgetWithAdaptive(this.nodeBg, -10);
        this.nodeBg.setSiblingIndex(0);

        let spt = this.nodeBg.addComponent(cc.Sprite);
        spt.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        spt.type = cc.Sprite.Type.SLICED;
        this.setSpriteResource('/image/default_sprite_splash', spt);

        this.nodeBg.opacity = 200;
        this.nodeBg.color = cc.Color.BLACK;
        this.nodeBg.addComponent(cc.BlockInputEvents);

        this.nodeBg.on(cc.Node.EventType.TOUCH_END, () => {
            this.closeView();
        }, this);
    };

    /**
     * 增加自适应 widget
     * @param node
     * @param alignNum 边距
     */
    private addWidgetWithAdaptive(node: cc.Node, alignNum: number = 0): cc.Widget {
        let widget: cc.Widget = node.getComponent(cc.Widget);
        if (widget) {
            widget.bottom = widget.left = widget.top = widget.right = alignNum;
            return widget;
        }
        widget = node.addComponent(cc.Widget);
        widget.isAlignBottom = widget.isAlignTop = widget.isAlignRight = widget.isAlignLeft = true;
        widget.bottom = widget.left = widget.top = widget.right = alignNum;
        widget.alignMode = cc.Widget.AlignMode.ONCE;
        widget.updateAlignment();
        return widget;
    };


    public openView(name: string, parent?: cc.Node, closeView?: string | cc.Node): void {
        MgrView.openView(name, parent, closeView);
    };


    public closeView(closeView?: string | cc.Node): void {
        if (!closeView)
            this.node.removeFromParent();
        else
            MgrView.closeView(closeView);
    };
};
