class wechat {
	////////////////////////////
	// 类成员
	///////////////////////////
	public static readonly _instance: wechat = new wechat();
	/** 系统信息 */
	private systemInfo: wx.types.SystemInfo = null;
	/** 登录按钮对象 */
	private userInfoButton: UserInfoButton = null;
	/** banner广告对象 */
	private bannerAd: BannerAd = null;
	/** 奖励视频广告对象 */
	private rewardedVideoAd: RewardedVideoAd = null;
	/** 插屏广告对象 */
	private interstitialAd = null;
	/** 游戏画面录制对象 */
	private GameRecorder: GameRecorder = null;
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
	/** 录屏取消事件 */
	private abortListener: Function = null;
	/** 录制时间更新事件。在录制过程中触发该事件 */
	private timeUpdateListener: Function = null;
	/** 游戏圈对象 */
	private gameClub: GameClubButton = null;
	/** 意见反馈按钮 */
	private feedbackButton: FeedbackButton = null;
	/** 切换到前台事件 */
	private showListener: Function = null;
	/** 切换到后台事件 */
	private hideListener: Function = null;
	/** banner广告id */
	private _bannerAdUnitId = '';
	/** 奖励视频广告id */
	private _rewardedVideoAdUnitId = '';
	/** 插屏广告id */
	private _interstitialAdUnitId = '';
	/** 登录按钮信息 */
	private _userInfoButtonData = {
		width: null,
		height: null,
		x: null,
		y: null,
		url: null
	};
	/** 反馈页面的按钮信息 */
	private _feedbackButtonData = {
		width: null,
		height: null,
		x: null,
		y: null,
		url: null
	};
	/** banner广告的像素大小 */
	private _bannerSize = {
		width: 600,
		heigth: 172
	};

	private _gameClubSize = {
		icon: '',
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};
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

	public set interstitialAdUnitId(adUnitId: string) {
		this._interstitialAdUnitId = adUnitId;
	}

	public set bannerSize(size: any) {
		this._bannerSize.width = size.width;
		this._bannerSize.heigth = size.height;
	}

	public set gameClubSize(size: any) {
		this._gameClubSize.x = size.x;
		this._gameClubSize.y = size.y;
		this._gameClubSize.width = size.width;
		this._gameClubSize.height = size.height;
		this._gameClubSize.icon = size.icon;
	}

	public set userInfoButtonData(data: any) {
		this._userInfoButtonData.width = data.width;
		this._userInfoButtonData.height = data.height;
		this._userInfoButtonData.x = data.x;
		this._userInfoButtonData.y = data.y;
		this._userInfoButtonData.url = data.url;
	}

	public set closeRewardVideoListener(cb: Function) {
		this._closeRewardVideoListener = cb;
	}

	////////////////////////////
	// get、set访问器
	///////////////////////////
	public constructor() {
		if (window.wx) {
			this.registerRecordScreenEvent();
		}
	}
	////////////////////////////
	// 登录模块
	///////////////////////////
	public wetchatLogin() {
		return new Promise((resolve, reject) => {
			this.getSystemInfoSync();
			this.getSetting().then((isUserInfo) => {
				let data = {
					wccode: null,
					wcencrypted: null,
					wciv: null,
					// userInfo: null
				};
				// 获取玩家数据
				let getLoginData = () => {
					this.login().then((code: any) => {
						data.wccode = code;
						return this.getUserInfo();
					}).then((res: any) => {
						data.wcencrypted = res.encryptedData;
						data.wciv = res.iv;
						// data.userInfo = res.userInfo;
						resolve(data);
					});
				};
				// 玩家当前授权状态
				// 同意授权
				if (isUserInfo) {
					getLoginData();
					// 授权过期、或者新玩家第一次登录，创建登录按钮
				} else {
					this.createUserInfoButton().then(() => {
						return this.onTapUserInfoButton();
					}).then(() => {
						getLoginData();
					});
				}
			});
		});
	}

	/**
	 * @description 获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限
	 */
	private getSetting() {
		return new Promise((resolve, reject) => {
			if (wechat.isSupportedAPI(wx.getSetting)) {
				wx.getSetting({
					success: (res: { authSetting: wx.types.AuthSetting }) => {
						resolve(res.authSetting['scope.userInfo']);
					},
					fail: () => {
						reject();
					}
				});
			} else {
				reject();
			}
		});
	}

	/**
	 * @description 创建用户登录按钮
	 */
	private createUserInfoButton() {
		return new Promise((resolve, reject) => {
			if (wechat.isSupportedAPI(wx.createUserInfoButton)) {
				this.userInfoButton = wx.createUserInfoButton({
					type: 'image',
					image: this._userInfoButtonData.url,
					style: {
						left: this.systemInfo.screenWidth * this._userInfoButtonData.x - this._userInfoButtonData.width / 2,
						top: this.systemInfo.screenHeight * this._userInfoButtonData.y - this._userInfoButtonData.height / 2,
						width: this._userInfoButtonData.width,
						height: this._userInfoButtonData.height
					}
				});
				resolve();
			} else {
				reject();
			}
		});
	}

	/**
	 * @description 监听用户点击登录按钮的事件
	 */
	private onTapUserInfoButton() {
		return new Promise((resolve, reject) => {
			if (this.userInfoButton) {
				this.userInfoButton.onTap((res: any) => {
					// 点击登录按钮，用户授权成功
					if (res.userInfo) {
						this.userInfoButton.hide();
						resolve();
					} else {
						reject();
					}
				});
			} else {
				resolve();
			}
		});

	}

	/**
	 * @description 登录游戏服务
	 */
	private login() {
		return new Promise((resolve, reject) => {
			wx.login({
				success: (res: { code: string }) => {
					resolve(res.code);
				},
				fail: () => {
					reject();
				}
			});
		});
	}

	/**
	 * @description 获取用户信息
	 */
	private getUserInfo() {
		return new Promise((resolve, reject) => {
			wx.getUserInfo({
				withCredentials: true,
				success: (res: any) => {
					resolve(res);
				},
				fail: () => {
					reject();
				}
			});
		});
	}

	////////////////////////////
	// 分享
	///////////////////////////
	/**
	 * @description 分享，主动拉起转发，进入选择通讯录界面
	 * @param _title
	 * @param _imageUrl
	 * @param _query
	 */
	public shareAppMessage(_title: string, _imageUrl: string, _query: string) {
		wx.shareAppMessage({
			title: _title,
			imageUrl: _imageUrl,
			query: _query
		});
	}

	////////////////////////////
	// banner广告
	///////////////////////////
	/**
	 * @description 显示banner广告
	 */
	public showBannerAd() {
		if (!wechat.isSupportedAPI(wx.createBannerAd)) return;
		this.createBannerAd();
		this.bannerAd.show();
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
	 */
	private createBannerAd() {
		let bannerSize = {
			width: this._bannerSize.width / this.systemInfo.pixelRatio,
			heigth: this._bannerSize.heigth / this.systemInfo.pixelRatio
		};

		this.bannerAd = wx.createBannerAd({
			// 广告单元 id
			adUnitId: this._bannerAdUnitId,
			// 广告自动刷新的间隔时间，单位为秒，参数值必须大于等于30（该参数不传入时 Banner 广告不会自动刷新）
			adIntervals: 30,
			style: {
				left: this.systemInfo.windowWidth / 2 - bannerSize.width / 2,
				top: this.systemInfo.windowHeight - bannerSize.heigth + this.systemInfo.windowHeight * 0.1,
				height: bannerSize.heigth,
				width: bannerSize.width
			}
		});
		console.log('bannerSize: ', bannerSize, ', systemInfo: ', this.systemInfo, ',this.bannerAd.style: ', this.bannerAd.style);

		this.bannerAd.onLoad(() => {
			console.log('=====> @framework, banner广告加载成功');
		});
		this.bannerAd.onError((res) => {
			console.log('=====> @framework, banner广告加载失败：', res);
		});
		this.bannerAd.onResize((res: { width: number; height: number }) => {
			this.bannerAd.style.left = this.systemInfo.windowWidth / 2 - res.width / 2;
			this.bannerAd.style.top = this.systemInfo.windowHeight - res.height + 0.1;
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
			this.rewardedVideoAd.load().then(() => {
				this.rewardedVideoAd.show();
			});
			let closeListener = (res: { isEnded: boolean }) => {
				let isComplete: boolean;
				// 小于 2.1.0 的基础库版本，res 是一个 undefined
				if (res && res.isEnded || res === undefined) {
					isComplete = true;
					resolve(isComplete);
				} else {
					isComplete = false;
					resolve(isComplete);
				}
				this.closeRewardVideo();
				this.rewardedVideoAd.offClose(closeListener);
			};

			let errorListener = (res: { errMsg: string; errCode: number }) => {
				console.log('=====> @framework, 奖励视频发生错误：', res);
				// 再拉一次视频
				this.rewardedVideoAd.load()
					.then(() => {
						return this.rewardedVideoAd.show();
					})
					.then(() => {
						this.rewardedVideoAd.offError(errorListener);
					})
					.catch(() => {
						reject();
						this.rewardedVideoAd.offError(errorListener);
					});
			};
			this.rewardedVideoAd.onClose(closeListener);
			this.rewardedVideoAd.onError(errorListener);
		});
	}

	/**
	 * @description 创建奖励视频单例（小游戏端是全局单例）
	 */
	private createRewardedVideoAd() {
		if (!wx.createRewardedVideoAd) {
			console.log('=====> @framework,当前微信版本过低，无法使用奖励视频功能，请升级到最新微信版本后重试');
			return;
		}
		if (this.rewardedVideoAd) {
			return;
		}
		this.rewardedVideoAd = wx.createRewardedVideoAd({
			adUnitId: this._rewardedVideoAdUnitId
		});

		this.rewardedVideoAd.onLoad(() => {
			console.log('=====> @framework, 加载视频广告成功');
		});
	}

	private closeRewardVideo() {
		if (this._closeRewardVideoListener) {
			this._closeRewardVideoListener();
		}
	}

	////////////////////////////
	// 插屏广告
	///////////////////////////
	public showInterstitialAd() {
		if (!wx.createInterstitialAd) {
			console.log('=====> @framework,当前微信版本过低，无法使用插屏广告功能，请升级到最新微信版本后重试');
			return;
		}

		let createInterstitialAd = () => {
			if (!this.interstitialAd) {
				this.interstitialAd = wx.createInterstitialAd({
					adUnitId: this._interstitialAdUnitId
				});
			}
		};

		createInterstitialAd();
		this.interstitialAd.onLoad(() => {
			console.log('=====> @framework,插屏创建成功');
		});

		this.interstitialAd.onError((res) => {
			console.log('=====> @framework,插屏创建失败: ', res);
		});

		this.interstitialAd.onClose(() => {
			// this.interstitialAd.destroy();
			this.interstitialAd = null;
			createInterstitialAd();
		});
		this.interstitialAd.show();
	}

	////////////////////////////
	// 游戏圈
	///////////////////////////
	/**
	 * @description 创建微信游戏圈
	 */
	public createGameClubButton() {
		// 微信圈是用户必要的功能，不需求弹出提示
		if (!wx.createGameClubButton) {
			console.log('=====> @framework,当前微信版本过低，无法使用游戏圈功能，请升级到最新微信版本后重试');
			return;
		}
		if (this.gameClub) {
			return;
		}
		this.gameClub = wx.createGameClubButton({
			icon: this._gameClubSize.icon,
			style: {
				left: this._gameClubSize.x / this.systemInfo.pixelRatio,
				top: this._gameClubSize.y / this.systemInfo.pixelRatio,
				width: this._gameClubSize.width,
				height: this._gameClubSize.height
			}
		});
		this.gameClub.hide();
		console.log('gameClub', this.gameClub);
	}

	/**
	 * @description 显示微信游戏圈
	 */
	public showGameClub() {
		console.log('显示游戏圈：', this.gameClub);
		this.createGameClubButton();
		if (this.gameClub) {
			this.gameClub.show();
			console.log('显示游戏圈成功');
		}
	}

	/**
	 * @description 隐藏微信游戏圈
	 */
	public hideGameClub() {
		if (this.gameClub) {
			this.gameClub.hide();
		}
	}

	////////////////////////////
	// 开放数据域
	///////////////////////////
	/**
	 * @description 向开放数据域发送消息
	 * @param message 要发送的消息，message 中及嵌套对象中 key 的 value 只能是 primitive value。即 number、string、boolean、null、undefined
	 */
	public postMessage(message: any) {
		wx.getOpenDataContext().postMessage(message);
	}

	////////////////////////////
	// 意见反馈
	///////////////////////////
	/**
	 * @description 创建打开意见反馈页面的按钮, 默认使用图片按钮的形式创建
	 */
	public createFeedbackButton() {
		return new Promise((resolve, reject) => {
			if (wechat.isSupportedAPI(wx.createFeedbackButton)) {
				this.feedbackButton = wx.createFeedbackButton({
					type: 'image', // 按钮的类型.支持text、image
					image: this._feedbackButtonData.url,
					style: {
						left: this._feedbackButtonData.x, // 左上角横坐标
						top: this._feedbackButtonData.y, // 左上角纵坐标
						width: this._feedbackButtonData.width, // 宽度
						height: this._feedbackButtonData.height // 高度
					}
				});
				resolve(this.feedbackButton);
			} else {
				console.log('=====> @framework,当前微信版本过低，无法使用反馈按钮，请升级到最新微信版本后重试');
				reject();
			}
		});
	}

	/**
	 * @description 监听意见反馈按钮的点击事件(在创建意见反馈按钮后，立即执行该函数，注册点击事件)，只能使用一次
	 */
	public onTapFeedbackButton() {
		return new Promise((resolve, reject) => {
			if (this.feedbackButton) {
				this.feedbackButton.onTap(() => {
					resolve();
				});
			} else {
				reject();
			}
		});
	}

	/**
	 * @description 显示意见反馈按钮
	 */
	public showFeedbackButton() {
		if (this.feedbackButton) {
			this.feedbackButton.show();
		}
	}

	/**
	 * @description 隐藏意见反馈按钮
	 */
	public hideFeedbackButton() {
		if (this.feedbackButton) {
			this.feedbackButton.hide();
		}
	}

	////////////////////////////
	// 录屏
	///////////////////////////
	/**
	 * @description 获取全局唯一的游戏画面录制对象
	 */
	public getGameRecorder() {
		return new Promise((resolve, reject) => {
			if (wechat.isSupportedAPI(wx.getGameRecorder)) {
				this.GameRecorder = wx.getGameRecorder();
				resolve();
			} else {
				reject();
			}
		});
	}

	public registerRecordScreenEvent() {
		if (!wechat.isSupportedAPI(wx.getGameRecorder)) {
			console.log('=====> @framework,当前客户端版过低，无法使用录制功能，请升级到最新客户端版本后重试');
			return;
		}
		this.GameRecorder = wx.getGameRecorder();
		// 监听录屏继续事件
		this.GameRecorder.on('start', (res: { currentTime?: number; error?: { code: number; message: string }; duration?: number }) => {
			if (this.resumeListener) {
				this.resumeListener();
			}
		});
		// 监听录屏暂停事件
		this.GameRecorder.on('pause', (res: { currentTime?: number; error?: { code: number; message: string }; duration?: number }) => {
			if (this.pauseListener) {
				this.pauseListener();
			}
		});
		// 监听录屏结束事件。可以通过 onStop 接口监听录屏结束事件，获得录屏地址
		this.GameRecorder.on('stop', (res: { currentTime?: number; error?: { code: number; message: string }; duration?: number }) => {
			if (this.stopListener) {
				console.log('视频的时长：', res.duration);
				this.stopListener(res.duration);
			}
		});

		// 监听录屏错误事件
		this.GameRecorder.on('error', (res: { currentTime?: number; error?: { code: number; message: string }; duration?: number }) => {
			console.log('=====> @framework,录屏错误：', res.error.message, ',code: ', res.error.code);
			if (this.errorListener) {
				this.errorListener();
			}
		});

		// 录制时间更新事件。在录制过程中触发该事件
		this.GameRecorder.on('timeUpdate', (res: { currentTime?: number; error?: { code: number; message: string }; duration?: number }) => {
			console.log('=====> @framework,录屏到第几秒：', res.currentTime);
			if (this.timeUpdateListener) {
				this.timeUpdateListener();
			}
		});

		// 录制取消事件
		this.GameRecorder.on('abort', (res: { currentTime?: number; error?: { code: number; message: string }; duration?: number }) => {
			if (this.abortListener) {
				this.abortListener();
			}
		});
	}

	/**
	 *  @description 开始录屏
	 * @param callback
	 */
	public startRecordScreen(callback?: Function) {
		this.startListener = callback;
		this.GameRecorder.start({
			fps: 24,
			duration: 7200,
			bitrate: 1000,
			gop: 12
		});
	}

	/**
	 * @description 暂停录屏
	 */
	public pauseRecordScreen(callback?: Function) {
		this.pauseListener = callback;
		this.GameRecorder.pause();
	}

	/**
	 * @description 恢复录制游戏画面
	 * @param callback
	 */
	public resumeRecordScreen(callback?: Function) {
		this.resumeListener = callback;
		this.GameRecorder.resume();
	}

	/**
	 * @description 结束录制游戏画面。结束录制后可以发起分享
	 * @param callback
	 */
	public stopRecordScreen(callback?: Function) {
		this.stopListener = callback;
		this.GameRecorder.stop();
	}

	/**
	 * @description 放弃录制游戏画面。此时已经录制的内容会被丢弃
	 * @param callback
	 */
	public abortRecordScreen(callback?: Function) {
		this.abortListener = callback;
		this.GameRecorder.abort();
	}

	public createGameRecorderShareButton() {

	}

	////////////////////////////
	// 其他能力
	///////////////////////////
	/**
	 * 监听小游戏回到前台的事件
	 * @param callbak
	 */
	public onShow(callbak) {
		this.showListener = callbak;
		wx.onShow(this.onShowListener.bind(this));
	}

	/**
	 * @description 取消监听小游戏回到前台的事件
	 */
	public offShow() {
		wx.offShow(this.onShowListener);
	}

	/**
	 * @description 监听小游戏隐藏到后台事件。锁屏、按 HOME 键退到桌面、显示在聊天顶部等操作会触发此事件
	 * @param callbak
	 */
	public onHide(callbak) {
		this.hideListener = callbak;
		wx.onHide(this.onHideListener.bind(this));
	}

	/**
	 * @description 取消监听小游戏隐藏到后台事件
	 */
	public offHide() {
		this.hideListener = null;
		wx.offHide(this.onHideListener);
	}

	public onShowListener(res) {
		if (this.showListener) {
			this.showListener(res);
		}
	}

	public onHideListener() {
		if (this.hideListener) {
			this.hideListener();
		}
	}

	/**
	 * @description 打开另一个小程序
	 * @param _appId
	 * @param _path
	 */
	public navigateToMiniProgram(_appId: string, _path: string) {
		return new Promise((resolve, reject) => {
			if (wechat.isSupportedAPI(wx.navigateToMiniProgram)) {
				wx.navigateToMiniProgram({
					appId: _appId,
					path: _path,
					envVersion: 'release',
					success: () => {
						resolve();
					},
					fail: () => {
						reject();
					},
					complete: () => {
					}
				});
			} else {
				reject();
			}
		});
	}

	////////////////////////////
	// 通用
	///////////////////////////
	/**
	 * @description 获取系统信息
	 */
	private getSystemInfoSync() {
		this.systemInfo = wx.getSystemInfoSync();
	}

	/**
	 * @description 是否支持改API
	 * @param api
	 */
	private static isSupportedAPI(api: any): boolean {
		if (api) {
			return true;
		} else {
			wx.showModal({
				title: '提示',
				content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
			});
			return false;
		}
	}

}

export const Wechat = wechat._instance;
