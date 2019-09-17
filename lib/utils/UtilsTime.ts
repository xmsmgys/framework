import MyUtils from "./MyUtils";

/**
 * Created by 许宇
 *
 * UtilsTime
 * 时间工具
 */
export default class UtilsTime {
    /**
     * 转换时间 （例如 00:00， 0小时0分钟）
     * @param _time 时间戳
     * @param isWord 是否使用文字格式
     */
    public formatTime3(_time, isWord?: boolean) {
        _time = Math.floor(_time);
        if (_time <= 0) return "00:00";
        let tf = function (i) {
            return (i < 10 ? "0" : "") + i;
        };

        let mm = Math.floor(_time / 60);
        let ss = (_time - (mm * 60));
        if (!isWord)
            return tf(mm) + ":" + tf(ss);
        else
            return tf(mm) + "小时" + tf(ss) + '分钟';
    };

    /**
     * 数字补0 (例如 00:00:00)
     */
    public formatNumberZero(value: number) {
        return (value < 10 ? "0" : "") + value;
    }

    //time  秒
    public formatTime(time: number) {
        if (time <= 0) {
            return "00:00:00";
        }
        let tTime = this.getTimeH_M_S(time)
        return this.formatNumberZero(tTime[0]) + ":" + this.formatNumberZero(tTime[1]) + ":" + this.formatNumberZero(tTime[2]);
    }

    //时间戳转换成 时分秒
    public getTimeH_M_S(nSecond: number) {
        let nHours = Math.floor(nSecond / 3600);
        let nMinute = Math.floor(nSecond / 60) % 60;
        let nSecond1 = Math.floor(nSecond % 60);
        return [nHours, nMinute, nSecond1]
    }

    /**
     * 倒计时冒号格式的时间文本
     * @param tInfo
     */
    public countDownColonFormatTime(oLabel: cc.Label, nSecond: number, fCoundDownFinish?: Function, ) {
        let fooCoundDownFinish = () => {
            let sTime = "00:00:00"
            oLabel.string = sTime
            oLabel.unscheduleAllCallbacks()
            if (fCoundDownFinish) {
                fCoundDownFinish()
            }
        }
        if (nSecond <= 0) {
            fooCoundDownFinish()
            return
        }

        let tTime = this.getTimeH_M_S(nSecond)
        let sHours = this.formatNumberZero(tTime[0])
        let sMinute = this.formatNumberZero(tTime[1])
        let sSecond = this.formatNumberZero(tTime[2])
        oLabel.string = sHours + ":" + sMinute + ":" + sSecond

        let fSchedule = () => {
            if (--tTime[2] < 0) {//秒
                tTime[2] = 59
                if (--tTime[1] < 0) {//分
                    tTime[1] = 59
                    if (--tTime[0] < 0) {//时
                        fooCoundDownFinish()
                        return
                    }
                    sHours = this.formatNumberZero(tTime[0])
                }
                sMinute = this.formatNumberZero(tTime[1])
            }
            sSecond = this.formatNumberZero(tTime[2])

            oLabel.string = sHours + ":" + sMinute + ":" + sSecond
        }
        oLabel.schedule(fSchedule, 1)
    }

    /**
     * 时间戳转换成当年第几周
     * @param {Number} time 时间戳（毫秒）
     * @returns {Number}
     */
    public getWeekNumber(time): number {
        return Math.floor((Math.floor(time / 86400000) + 4) / 7);
    }

    /**
     * 判断时间在范围内
     * @param tDate ={
      timestamp:1,
      tHourList: [[12, 14], [17, 19], [20, 22]]
      }
     */
    public getTimeInRange(tDate) {
        let date = new Date(tDate.timestamp);

        let hour = date.getHours();
        for (let i = 0; i < tDate.tHourList.length; i++) {
            let startHour = tDate.tHourList[i][0],
                endHour = tDate.tHourList[i][1];
            if (hour >= startHour && hour < endHour) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 时间戳转换为日期格式
     * @param tData = {timestamp:1,bHasTime:false}
     */
    public timestampToTime(tDate) {
        if (String(tDate.timestamp).length != 13) {
            return "";
        }

        let date = this.timestampToDate(tDate.timestamp);
        let time = date.Y + "-" + MyUtils.math.textNumString(date.M, 2) + "-" + MyUtils.math.textNumString(date.D, 2);
        if (tDate.bHasTime)
            time += " " + this.formatNumberZero(date.h) + ":" + this.formatNumberZero(date.m) + ":" + this.formatNumberZero(date.s);
        return time;
    }

    /**
     * 时间戳转换为日期格式
     * @param timestamp 时间戳
     * @param hasTime 是否带时间
     * @param separator 分隔符，默认空为文字
     */
    public timestampToDay(timestamp, hasTime = true, separator = ''): string {
        let date = this.timestampToDate(timestamp);
        let time = '';
        if (separator == '')
            time = date.Y + "年" + MyUtils.math.textNumString(date.M, 2) + "月" + MyUtils.math.textNumString(date.D, 2) + "日";
        else
            time = date.Y + separator + MyUtils.math.textNumString(date.M, 2) + separator + MyUtils.math.textNumString(date.D, 2);
        if (hasTime)
            time += " " + this.formatNumberZero(date.h) + ":" + this.formatNumberZero(date.m) + ":" + this.formatNumberZero(date.s);
        return time;
    }
    /**
     * 时间戳转换为日期格式
     * @param timestamp 时间戳
     */
    public timestampToDate(timestamp: number) {
        let date = new Date(timestamp);
        return {
            'Y': date.getFullYear(),
            'M': date.getMonth() + 1,
            'D': date.getDate(),
            'h': date.getHours(),
            'm': date.getMinutes(),
            's': date.getSeconds()
        };
    }

    /**
     * 返回系统时间
     *
     * @param {boolean} [isMillisecond=false] 返回毫秒数
     */
    public getSystemTime(isMillisecond: boolean = false) {
        let curTime = new Date().getTime();
        if (isMillisecond == false)
            curTime = curTime / 1000;
        return parseFloat(curTime.toFixed(2));
    }



    /**
     * 倒计时
     * @param tData = {time:1}// time 秒
     */
    public getCountDownTime(tData) {
        let time = Math.floor(tData.time);
        let countDownTime = { D: 0, h: 0, m: 0, s: 0 };
        if (time <= 0)
            return countDownTime;
        countDownTime.D = parseInt((time / 60 / 60 / 24).toString(), 10); //计算剩余的天数
        countDownTime.h = parseInt((time / 60 / 60 % 24).toString(), 10); //计算剩余的小时
        countDownTime.m = parseInt((time / 60 % 60).toString(), 10);//计算剩余的分钟
        countDownTime.s = parseInt((time % 60).toString(), 10);//计算剩余的秒数
        return countDownTime;
    }

    /**
     * 倒计时， n分钟前，n小时前，n天前
     * @param timeBefore 之前的时间,毫秒
     * @param timeAfter 现在的时间,毫秒
     */
    public getPassTime(timeBefore, timeAfter, isPass = true) {
        timeBefore = Math.floor(timeBefore);
        timeBefore = Math.floor(timeAfter - timeBefore);
        let str = isPass ? '前' : '后';
        if (timeBefore <= 0)
            return "1分钟" + str;

        let year = Math.floor(timeBefore / (31104000000));
        let mt = Math.floor(timeBefore / (2592000000));
        let day = Math.floor(timeBefore / 86400000);
        let hh = Math.floor(timeBefore / 3600000);
        let mm = Math.floor(timeBefore / 60000);
        if (year >= 1) {
            return (year + "年" + str);
        } else if (mt >= 1) {
            return (mt + "个月" + str);
        } else if (day >= 1) {
            return (day + "天" + str);
        } else if (hh >= 1) {
            return (hh + "小时" + str);
        } else if (mm >= 1) {
            return (mm + "分钟" + str);
        } else {
            return "1分钟" + str;
        }
    };
    public getPassTime2(timestamp):string {
        timestamp = Math.floor(timestamp);
        if (timestamp <= 0)
            return "1秒";

        let year = Math.floor(timestamp / (31104000000));
        let mt = Math.floor(timestamp / (2592000000));
        let day = Math.floor(timestamp / 86400000);
        let hh = Math.floor(timestamp / 3600000);
        let mm = Math.floor(timestamp / 60000);
        let ss = Math.floor(timestamp / 1000);
        if (year >= 1) {
            return (year + "年");
        } else if (mt >= 1) {
            return (mt + "个月");
        } else if (day >= 1) {
            return (day + "天");
        } else if (hh >= 1) {
            return (hh + "小时");
        } else if (mm >= 1) {
            return (mm + "分钟");
        } else if (ss >= 1) {
            return (ss + "秒");
        } else {
            return "1秒";
        }
    };


    /**
     * 获取周第n天的时间戳
     * @param week 星期1-7
     * @param nowTime
     */
    public getWeekDayTimestamp(week: number, nowTime?: number): number {
        let now = nowTime ? new Date(nowTime) : new Date();
        let firstDay = new Date(now.getTime() - (now.getDay() - 1) * 86400000);
        firstDay.setDate(firstDay.getDate() + week - 1);
        return now.getTime();
    };

    /**
     * 是否同一周（周一是周的第一天）
     * 计算思路 （316800000是1970-01-05 00:00:00这一天是星期一，把这一天当成时间戳初始值）
     * 从这个时间点开始经历了几个七天
     * @param old
     * @param now
     * @returns {boolean}
     */
    public isSameWeek(old: number, now: number): boolean {
        let oneDayTime = 1000 * 60 * 60 * 24;
        old = old - 316800000;
        now = now - 316800000;
        let old_count = Math.floor(old / oneDayTime);
        let now_other = Math.floor(now / oneDayTime);
        return Math.floor((old_count) / 7) === Math.floor((now_other) / 7);
    };
};
