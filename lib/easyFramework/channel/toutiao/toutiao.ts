// TODO: 录制视频成功，并且打印出视频所在位置，分享视频的时候显示shareVideo: fail parse share info fail; 把功能移植到特工上面是可以分享的，不知道是不是录制内容问题
class toutiao {
	////////////////////////////
	// 类成员
	///////////////////////////
	public static readonly _instance: toutiao = new toutiao();
	/** 系统信息 */
	private systemInfo: any = null;
	/** banner广告对象 */
	private bannerAd: any = null;
	/** 奖励视频广告对象 */
	private rewardedVideoAd: any = null;
	/** 全局唯一的录屏管理器 */
	private GameRecorderManager: any = null;
	/** 录屏开始事件 */
	private startListener: Function = null;
	/** 监听录屏继续事件 */
	private resumeListener: Function = null;
	/** 录屏暂停事件 */
	private pauseListener: Function = null;
	/**  录屏结束事件 */
	private stopListener: Function = null;
	/**  录屏错误事件 */
	private errorListener: Function = null;
	/** 录屏中断开始事件 */
	private interrupBeginListener: Function = null;
	/** 录屏中断结束事件 */
	private interrupEndListener: Function = null;
	/** banner广告id */
	private _bannerAdUnitId = '';
	/** 奖励视频广告id */
	private _rewardedVideoAdUnitId = '';
	private _closeRewardVideoListener: Function = null;

	////////////////////////////
	// get、set访问器
	///////////////////////////
	public set bannerAdUnitId(adUnitId: string) {
		this._bannerAdUnitId = adUnitId;
	}

	public set rewardedVideoAdUnitId(adUnitId: string) {
		this._rewardedVideoAdUnitId = adUnitId;
	}

	public set closeRewardVideoListener(cb: Function) {
		this._closeRewardVideoListener = cb;
	}
	////////////////////////////
	// 构造器
	///////////////////////////
	protected constructor() {
		if (window.tt) {
			this.registerRecordScreenEvent();
		}
	}
	////////////////////////////
	// 登录模块
	///////////////////////////
	public toutiaoLogin() {
		return new Promise((resolve, reject) => {
			this.getSystemInfoSync();
			let loginData = {
				code: '',
				anonymousCode: '',
				name: null,
				photo: null
			};
			this.login()
				.then((res: {code: string; anonymousCode: string; isLogin: boolean}) => {
					loginData.code = res.code;
					loginData.anonymousCode = res.anonymousCode;
					if (res.isLogin) {
						this.getUserInfo()
							.then((data: {userInfo: any; rawData: string; signature?: string; encryptedData?: string; iv?: string}) => {
								loginData.name = data.userInfo.nickName;
								loginData.photo = data.userInfo.avatarUrl;
								resolve(loginData);
							})
							.catch(() => {
								reject(loginData);
							});
					} else {
						resolve(loginData);
					}
				})
				.catch(() => {
					reject();
				});
		});
	}

	/**
	 * @description 获取临时登录凭证
	 */
	private login() {
		return new Promise((resolve, reject) => {
			tt.login({
				/** 未登录时，是否强制调起登录框 */
				force: false,
				success: (res: {code: string; anonymousCode: string; isLogin: boolean}) => {
					console.log(`login调用成功${res.code} ${res.anonymousCode}`);
					resolve(res);
				},
				fail: (res: any) => {
					console.log('login调用失败');
					reject();
				}
			});
		});
	}

	/**
	 * @description 获取已登录用户的基本信息或特殊信息
	 * @tips 本 API 依赖于login，请确保调用前已经调用了该API
	 */
	private getUserInfo() {
		return new Promise((resolve, reject) => {
			tt.getUserInfo({
				/** 是否需要返回敏感数据 */
				withCredentials: true,
				success: (res: {userInfo: object; rawData: string; signature?: string; encryptedData?: string; iv?: string}) => {
					console.log(`getUserInfo调用成功${res.userInfo}`);
					resolve(res);
				},
				fail: (res: any) => {
					console.log('getUserInfo调用失败: ', res);
					reject();
				}
			});
		});
	}

	////////////////////////////
	// banner广告
	///////////////////////////
	/**
	 * @description 显示banner广告
	 */
	public showBannerAd() {
		if (!toutiao.isSupportedAPI(tt.createBannerAd)) {
			console.log('不支持banner广告');
			return;
		}
		this.hideBannerAd();
		this.createBannerAd();
		this.bannerAd.onLoad(() => {
			console.log('=====> @framework, banner广告加载成功');
			this.bannerAd.show();
		});
	}

	/**
	 * @description 隐藏banner广告
	 */
	public hideBannerAd() {
		if (this.bannerAd) {
			this.bannerAd.hide();
			this.bannerAd.destroy();
			this.bannerAd = null;
		}
	}

	/**
	 * @description 创建banner广告
	 * @tips 每个广告实例只会与一条固定的广告素材绑定。开发者如果想要展示另一条广告，需要创建一个新的bannerAd实例。
	 * Banner广告一般的比例为16:9，最小宽度是128（设备像素），最大宽度是208（设备像素）。开发者可以在这之间自由指定广告宽度。广告组件会自动等比例缩放素材。
	 */
	private createBannerAd() {
		if (this.bannerAd) {
			return;
		}
		let targetBannerAdWidth = 208;
		this.bannerAd = tt.createBannerAd({
			// 广告单元 id
			adUnitId: this._bannerAdUnitId,
			style: {
				// 根据系统约定尺寸计算出广告高度
				top: this.systemInfo.windowHeight - (targetBannerAdWidth / 16 * 9),
				left: (this.systemInfo.windowWidth - targetBannerAdWidth) / 2,
				width: targetBannerAdWidth
			}
		});

		this.bannerAd.onError((res) => {
			console.log('=====> @framework, banner广告加载失败：', res);
		});
		this.bannerAd.onResize((res: { width: number; height: number }) => {
			if (targetBannerAdWidth !== res.width) {
				this.bannerAd.style.top = this.systemInfo.windowHeight - (res.width / 16 * 9);
				this.bannerAd.style.left = (this.systemInfo.windowWidth - res.width) / 2;
				this.bannerAd.style.width = res.width;
			}
		});
	}

	////////////////////////////
	// 奖励广告
	///////////////////////////
	public showRewardVideoAd() {
		return new Promise((resolve, reject) => {
			this.createRewardedVideoAd();
			if (!this.rewardedVideoAd) {
				console.log('=====> @framework, 奖励视频对象为不存在');
				reject();
				return null;
			}
			this.rewardedVideoAd.load()
				.then(() => {
					this.rewardedVideoAd.show();
				});
			let closeListener = (res: {isEnded: boolean}) => {
				let isComplete: boolean;
				if (res.isEnded) {
					isComplete = true;
					resolve(isComplete);
				} else {
					isComplete = false;
					resolve(isComplete);
				}
				this.closeRewardVideo();
				this.rewardedVideoAd.offClose(closeListener);
			};
			this.rewardedVideoAd.onClose(closeListener);
			let errorListener = (res: {errCode: number; errMsg: string}) => {
				console.log('=====> @framework, 加载奖励视频错误：', res);
				// 可以手动加载一次
				this.rewardedVideoAd.load()
					.then(() => {
						return this.rewardedVideoAd.show();
					})
					.catch(() => {
						reject();
					});
				this.rewardedVideoAd.offError(errorListener);
			};
			this.rewardedVideoAd.onError(errorListener);
		});
	}

	/**
	 * @description 创建视频广告单例（小游戏端是全局单例）
	 * @tips 全局只有一个videoAd实例，重复创建没有用
	 */
	private createRewardedVideoAd() {
		if (!wx.createRewardedVideoAd) {
			console.log('=====> @framework, 当前客户端版本过低，无法使用奖励视频功能，请升级到最新客户端版本后重试');
			return;
		}
		if (this.rewardedVideoAd) {
			return;
		}
		this.rewardedVideoAd = wx.createRewardedVideoAd({
			adUnitId: this._rewardedVideoAdUnitId
		});
		console.log('创建成功');
	}

	private closeRewardVideo() {
		if (this._closeRewardVideoListener) {
			this._closeRewardVideoListener();
		}
	}
	////////////////////////////
	// 分享
	///////////////////////////
	/**
	 * @description 主动拉起转发界面
	 * @param _title 转发标题，不传则默认使用当前小游戏的名称。
	 * @param _imageUrl 转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径，显示图片长宽比推荐 5:4
	 * @param _query 查询字符串，必须是 key1=val1&key2=val2 的格式。从这条转发消息进入后，可通过 tt.getLaunchOptionSync() 或 tt.onShow() 获取启动参数中的 query。
	 */
	public shareAppMessage(_title: string, _imageUrl: string, _query?: string) {
		return new Promise((resolve, reject) => {
			tt.shareAppMessage({
				// article	发布图文内容
				// video	发布视频内容
				// token	口令分享，生成一串特定的字符串文本，仅头条APP支持
				channel: 'article', //
				title: _title,
				imageUrl: _imageUrl,
				query: _query,
				/** 附加信息 */
				extra: null,
				success: () => {
					resolve();
					console.log('分享视频成功');
				},
				fail: () => {
					reject();
					console.log('分享视频失败');
				}
			});
		});
	}

	////////////////////////////
	// 视频录制
	///////////////////////////
	/**
	 * @description 主动拉起发布视频界面
	 * @param _videoPath 要转发的视频地址
	 * @param _query 查询字符串，必须是 key1=val1&key2=val2 的格式。从这条转发消息进入后，可通过 tt.getLaunchOptionSync() 或 tt.onShow() 获取启动参数中的 query。分享挑战视频时有效
	 * @param _title 要转发的视频描述，分享挑战视频时有效
	 * @param _createChallenge 为true时，指定分享的为挑战视频 (仅头条支持), 默认为false
	 */

	public shareVideo(_videoPath: string, _query?: string, _title?: string, _createChallenge?: boolean) {
		return new Promise((resolve, reject) => {
			console.log('_videoPath: ', _videoPath);
			console.log('_title: ', _title);
			tt.shareVideo({
				videoPath: _videoPath,
				query: _query,
				title: _title,
				extra: {
					createChallenge: false
				},
				success: () => {
					resolve();
				},
				fail: (res: any) => {
					console.log('分享视频失败：', res);
					reject();
				}
			});
		});
	}
	/**
	 * @description 注册GameRecorderManager
	 */
	private registerRecordScreenEvent() {
		if (!toutiao.isSupportedAPI(tt.getGameRecorderManager)) {
			console.log('=====> @framework,当前客户端版过低，无法使用奖励视频功能，请升级到最新客户端版本后重试');
			return;
		}
		this.GameRecorderManager = tt.getGameRecorderManager();
		// 监听录屏开始事件
		this.GameRecorderManager.onStart((res: any) => {
			if (this.startListener) {
				this.startListener();
			}
		});
		// 监听录屏继续事件
		this.GameRecorderManager.onResume(() => {
			if (this.resumeListener) {
				this.resumeListener();
			}
		});
		// 监听录屏暂停事件
		this.GameRecorderManager.onPause(() => {
			if (this.pauseListener) {
				this.pauseListener();
			}
		});
		// 监听录屏结束事件。可以通过 onStop 接口监听录屏结束事件，获得录屏地址
		this.GameRecorderManager.onStop((res: {videoPath: string}) => {
			if (this.stopListener) {
				console.log('视频地址：', res.videoPath);
				this.stopListener(res.videoPath);
			}
		});
		// 监听录屏错误事件
		this.GameRecorderManager.onError((res: {errMsg: string}) => {
			console.log('=====> @framework,录屏错误：', res.errMsg);
			if (this.errorListener) {
				this.errorListener();
			}
		});
		// 监听录屏中断开始
		this.GameRecorderManager.onInterruptionBegin(() => {
			if (this.interrupBeginListener) {
				this.interrupBeginListener();
			}
		});
		// 监听录屏中断结束
		this.GameRecorderManager.onInterruptionEnd(() => {
			if (this.interrupEndListener) {
				this.interrupEndListener();
			}
		});
	}

	/**
	 * @description 开始录屏
	 * @param _duration 录屏的时长，单位 s，必须大于3s，最大值 120（2 分钟）
	 */
	public startRecordScreen(_duration: number, callback?: Function) {
		this.startListener = callback;
		this.GameRecorderManager.start({
			duration: _duration
		});
	}

	/**
	 * @description 暂停录屏
	 */
	public pauseRecordScreen(callback?: Function) {
		this.pauseListener = callback;
		this.GameRecorderManager.pause();
	}

	public recordClipRecordScreen() {

	}

	public clipVideoRecordScreen() {

	}

	public resumeRecordScreen(callback?: Function) {
		this.resumeListener = callback;
		this.GameRecorderManager.resume();
	}

	/**
	 * @description 暂停录屏
	 * @param callback
	 */
	public stopRecordScreen(callback?: Function) {
		this.stopListener = callback;
		this.GameRecorderManager.stop();
	}
	////////////////////////////
	// 其他能力
	///////////////////////////
	/**
	 * @description 检查用户当前的 session 状态是否有效。
	 * @tips 只有成功调用 tt.login 才会生成 session，checkSession 才会进入 success 回调当用户退出登录会清除 session
	 */
	private checkSession() {
		return new Promise((resolve, reject) => {
			tt.checkSession({
				success: () => {
					resolve();
					console.log('session未过期');
				},
				fail: () => {
					reject();
					console.log('session已过期，需要重新登录');
				}
			});
		});
	}

	/**
	 * @description 获取用户已经授权过的配置。结果中只会包含小程序向用户请求过的权限
	 */
	private getSetting() {
		return new Promise((resolve, reject) => {
			tt.getSetting({
				success: (res: any) => {
					resolve(res.authSetting);
					console.log('session未过期');
				},
				fail: () => {
					reject();
					console.log('session已过期，需要重新登录');
				}
			});
		});
	}

	/**
	 * @description 返回小游戏启动参数(好友邀请中获取query)
	 */
	private getLaunchOptionsSync() {
		return tt.getLaunchOptionsSync();
	}
	////////////////////////////
	// 通用
	///////////////////////////
	/**
	 * @description 获取系统信息
	 */
	private getSystemInfoSync() {
		try {
			this.systemInfo = tt.getSystemInfoSync();
		} catch (e) {
			console.log('获取系统信息失败');
		}
	}

	/**
	 * @description 是否支持改API
	 * @param api
	 */
	private static isSupportedAPI(api: any): boolean {
		return !!api;
	}
}
export const Toutiao = toutiao._instance;
