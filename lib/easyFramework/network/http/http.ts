import { NetworkMgr } from '../networkMgr';

class http {
	////////////////////////////
	// 类成员
	///////////////////////////
	public static readonly _instance = new http();
	private _timeOut = 10 * 1000;
	private _httpUrl = '';
	////////////////////////////
	// get、set构造器
	///////////////////////////
	public set timeOut(time: number) {
		this._timeOut = time;
	}

	public set httpUrl(url: string) {
		this._httpUrl = url;
	}

	////////////////////////////
	// 构造函数
	///////////////////////////
	public constructor() {
	}

	public init(httpUrl: string) {
		this._httpUrl = httpUrl;
	}

	////////////////////////////
	// 业务逻辑
	///////////////////////////
	public post(route: string, msg: Object) {
		let xhr = new XMLHttpRequest();
		// 超时时间1s，单位是毫秒
		xhr.timeout = this._timeOut;
		xhr.open('POST', this._httpUrl, true);
		// 服务端也需要设置
		xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
		xhr.send(JSON.stringify(msg));

		xhr.onreadystatechange = function onreadystatechange() {
			// 请求完成。在此进行处理。
			if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
				let respone: any = xhr.responseText;
				if (!respone) {
					console.error('http request respone is null');
					return;
				}
				NetworkMgr.checkRespone(route, respone);
			}
		};
		// XMLHttpRequest 超时
		xhr.ontimeout = function ontimeout(res) {
			console.error('http request timeout: ', res);
		};
		// XMLHttpRequest 错误
		xhr.onerror = function onerror(error) {
			console.error('http request error: ', error);
		};
	}
}

export const Http = http._instance;
