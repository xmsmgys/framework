import Sha1 = require('./encrypt/sha1.js');
import { Http } from './http/http';

class networkMgr {
	////////////////////////////
	// 类成员
	///////////////////////////
	public static readonly _instance = new networkMgr();
	/** 消息ID */
	private mid = 0;
	/** 消息队列 */
	private messageList = {};
	/** 每条消息最多的发送次数 */
	private limitMessageNum = 5;
	/** 时间 */
	private timer = null;
	/** token */
	private token = '';
	/** 消息锁: false, 可以正常发送消息，已上锁 */
	private isLock = false;
	private _dealHeadListener: Function = null;
	/** 加密规则 */
	private _encryptRule = ['mid:', 'uid:', 'key:', 'data:'];
	/** 加密code, 服务端客户端要统一 */
	private _encryptCode = 'mxwj';
	/** 计时时间: 1s */
	private _intervalTime = 1000;
	/** 服务器报错 */
	private _errorServerCode = 500;
	/** 成功回包code */
	private _successCode = 0;
	/** 重起游戏的错误码 */
	private _errorRestartGameCode = [102];
	/** 错误码列表 */
	private _errorNetCode = {};
	/** 超过时间 */
	private _overTime = 5000;
	/** uid */
	private _uid = 0;
	////////////////////////////
	// get、set构造器
	///////////////////////////
	public set errorNetCode(codes: Object) {
		this._errorNetCode = codes;
	}

	public set encryptCode(str: string) {
		this._encryptCode = str;
	}

	public set errorRestartGameCode(array: Array<number>) {
		this._errorRestartGameCode = array;
	}

	public set successCode(code: number) {
		this._successCode = code;
	}

	public set errorServerCode(code: number) {
		this._errorServerCode = code;
	}

	public set encryptRule(array: Array<string>) {
		this._encryptRule = array;
	}

	public set intervalTime(time: number) {
		this._intervalTime = time;
	}

	public set overTime(time: number) {
		this._overTime = time;
	}

	public set dealHeadListener(cb: Function) {
		this._dealHeadListener = cb;
	}

	public set uid(uid: number) {
		this._uid = uid;
	}
	////////////////////////////
	// 接口
	///////////////////////////
	public constructor() {
		this.mid = 0;
		this.messageList = {};
		this.timer = null;
	}
	/**
	 * @description 发送xhr消息
	 * @param {string} _route
	 * @param {Object} data
	 * @param {Function} cb
	 */
	public xhrPost(_route: string, data: Object, cb: Function) {
		this.mid += 1;
		// 包
		let msg = {
			head: {
				route: _route,
				mid: this.mid.toString(),
				uid: this._uid
			},
			body: data
		};
		// 消息队列的数据结构
		this.messageList[this.mid] = {
			lock: false,
			mid: this.mid,
			data: msg,
			callback: cb,
			time: Date.now(),
			sendNum: 0
		};
		// 开始计时
		this.startTimer();
		if (!this.isLock) {
			this.sendMessage(this.mid);
		}
	}

	/**
	 * @description 检查回包
	 * @param _respone
	 */
	public checkRespone(route, _respone: any) {
		// 解密
		let respone: any = this.jsdecrypt(_respone);
		let head: any = respone.head;
		let body: any = respone.body;
		let code = head.code || 0;
		let mid = head.mid;
		// 刷新token
		this.token = head.token;
		let message = this.messageList[mid];
		// 头部回包处理
		this.succeedResponeHead(head);
		// 服务端回包，返回需要的数据
		if (code === this._successCode) {
			console.log("----> 返回数据", route, body);
			this.succeedResponeBody(message, body, mid);
			// 服务端回包中出现错误码
		} else {
			this.checkErrorCode(code, mid);
		}
	}

	private succeedResponeHead(head: any) {
		this._dealHeadListener(head);
	}
	////////////////////////////
	// 业务逻辑
	///////////////////////////
	/**
	 * @description 没有错误信息，把服务端数据发送到业务逻辑层
	 * @param message
	 * @param body
	 * @param mid
	 */
	private succeedResponeBody(message: any, body: any, mid: number) {
		this.isLock = false;
		this.clearTimer();
		this.deleteMessageListItem(mid);
		this.checkNextMessage();
		if (message.callback) {
			message.callback(body);
		}
	}
	/**
	 * @description 网络消息code检查
	 * @param code 错误码；需要和服务端协定
	 * @param mid
	 */
	private checkErrorCode(code: number, mid: number) {
		// 收到消息500 则继续重发直到发送次数限制.
		if (code !== this._errorServerCode) {
			this.deleteMessageListItem(mid);
		}
		// 重启游戏
		for (let index = 0; index < this._errorRestartGameCode.length; index ++) {
			let errorCode = this._errorRestartGameCode[index];
			if (code === errorCode) {
				this.restartGame();
			}
		}
		let resultStr = this.getErrorCodeMeaning(code);
		console.error("----> 返回错误, code:", code, resultStr);
		// TODO: 把错误码信息返回给业务逻辑
	}

	private checkNextMessage() {
		for (let key in this.messageList) {
			let message = this.messageList[key];
			if (message.sendNum === 0) {
				this.sendMessage(message.mid);
			}
		}
	}

	/**
	 * @description 删除消息队列中的元素
	 * @param mid
	 */
	private deleteMessageListItem(mid: number) {
		if (this.messageList && this.messageList[mid]) {
			delete this.messageList[mid];
		}
	}

	/**
	 * @description 数据加密（需要和服务端约定）
	 * @param data
	 */
	private jsencrypt(data: any) {
		let head = data.head;
		let body = JSON.stringify(data.body);
		let encryptData = `${this._encryptRule[0]}${head.mid}&${this._encryptRule[1]}${head.uid}&${this._encryptRule[2]}${this._encryptCode}&${this._encryptRule[3]}${body}`;
		data.head.mi = Sha1.hex_hmac_sha1(this._encryptCode, encryptData).slice(5);
		return data;
	}

	/**
	 * @description 解密
	 * @param _data
	 */
	private jsdecrypt(_data) {
		let data: string = JSON.parse(_data);
		return data;
	}

	/**
	 * @description 发送消息队列
	 * @param {number} mid
	 */
	private sendMessage(mid: number) {
		// 消息队列为空
		if (Object.keys(this.messageList).length === 0) {
			console.log('message list is null...');
			return;
		}
		let message = this.messageList[mid];
		// 一条消息的发送次数大于限制次数，建议重启游戏
		if (message.sendNum >= this.limitMessageNum) {
			console.error('message send too much time');
			return;
		}
		message.sendNum += 1;
		let data = message.data;
		let route = data.head.route;
		data.head.token = this.token;
		// 加密
		console.log('----> 请求数据', route, data);

		Http.post(route, this.jsencrypt(data));
	}

	/**
	 * @description 获取错误码对应的意思
	 * @param code
	 */
	private getErrorCodeMeaning(code: number) {
		let errStr = this._errorNetCode[code];
		let resultStr = errStr;
		if (!errStr) {
			resultStr = `服务器错误码： ${code}`;
		}
		return resultStr;
	}

	/**
	 * @description 重起游戏
	 */
	private restartGame() {

	}

	/**
	 * @description 开始定时器
	 */
	private startTimer() {
		if (!this.timer) {
			this.timer = setInterval(this.checkPackage.bind(this), this._intervalTime);
		}
	}

	/**
	 * @description 检查发包
	 */
	private checkPackage() {
		if (Object.keys(this.messageList).length !== 0) {
			for (let key in this.messageList) {
				let message = this.messageList[key];
				let time = Date.now();
				if (time - message.time > this._overTime) {
					let mid = message.mid;
					this.sendMessage(mid);
					break;
				}
			}
		} else {
			this.clearTimer();
		}
	}

	/**
	 * @description 清理定时器
	 */
	private clearTimer() {
		if (this.timer) {
			clearInterval(this.timer);
		}
	}

}

export const NetworkMgr = networkMgr._instance;
