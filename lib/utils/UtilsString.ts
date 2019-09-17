/**
 * Created by 许宇
 *
 * UtilsString
 * 字符串工具
 */
export default class UtilsString {
    /**
     * 转意符换成普通字符
     */
    public converHtml2Str(str) {
        let arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
        return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) { return arrEntities[t]; });
    }
    /**
     * 普通字符转换成转意符
     */
    public converStr2Html(str) {
        return str.replace(/[<>&"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; });
    }

    /**
    * 格式文本
    * @param str 带有 {key}
    * @param args 替换参数 包含{key}
    */
    public formatStr(str, ...args) {
        let result = str;
        if (args.length > 0) {
            if (args.length == 1 && typeof (args[0]) == "object") {
                let arg = args[0];
                if (arg.__proto__.constructor == Array) {
                    for (let key in arg) {
                        let reg = new RegExp("({[" + key + "]})", "g");
                        result = result.replace(reg, arg[key]);
                    }
                } else
                    for (let key in arg) {
                        let reg = new RegExp("({" + key + "})", "g");
                        result = result.replace(reg, arg[key]);
                    }
            }
            else {
                for (let i = 0; i < args.length; i++) {
                    if (args[i] == undefined) {
                        continue;
                    }
                    else {
                        let reg = new RegExp("({[" + i + "]})", "g");
                        result = result.replace(reg, args[i]);
                    }
                }
            }
        }
        return result;
    }

    /**
     * 数字过大，转换成金钱（xx亿xx万）
     */
    public numberToMoney(value: number): string {
        value = Math.round(value);
        let nStrLen = value.toString().length;
        let sValue: string;
        if (nStrLen >= 10) {
            let nNewValue = Math.floor(value / 100000000);
            if (nNewValue > 99999) {
                nNewValue = 99999;
            }
            sValue = String(nNewValue) + '亿';
        } else if (nStrLen >= 6) {
            sValue = String(Math.floor(value / 10000)) + '万';
        } else
            sValue = value.toString();
        return sValue;
    }


    /**
     * 计算字符串 ascii码的总和
     * @param str
     */
    public calcStrAsciiSum(str: string): number {
        let len = str.length;
        let num = 0;
        for (let i = 0; i < len; i++) {
            num += str.charCodeAt(i);
        }
        return num;
    };

    /**
     * 字符串截取
     * @param content 内容
     * @param len 需要的长度
     */
    public cutString(content: string, len: number): string {
        if (content.length > len) {
            return `${content.slice(0, len)}...`;
        }
        return content;
    }
    /**
     * 字符串转换
     * @param content 内容
     * @param keyword 关键字
     * @param ReplaceWords 替换字数组
     */
    public stringReplace(content: string, keyword: string, ReplaceWords: string[]) {
        for (let i = 0; i < ReplaceWords.length; i++) {
            content = content.replace(keyword, ReplaceWords[i])
        }
        return content;
    }

    /**
     * 数字省略
     * @param num 数字
     */
    public numberEllipsis(num: number): string {
        let output = null;
        if (num >= 100000) {
            output = Math.floor(num / 1000).toString() + "k";
        }
        else {
            output = num.toString();
        }
        return output;
    }
};
