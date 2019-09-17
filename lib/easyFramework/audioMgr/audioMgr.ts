/**
 * @description 声音模块
 */

cc.game.on(cc.game.EVENT_HIDE, () => {
	AudioMgr.pause();
});

cc.game.on(cc.game.EVENT_SHOW, () => {
	AudioMgr.resume();
});

class audio {
	////////////////////////////
	// 类成员
	///////////////////////////
	public static readonly _instance = new audio();
	private _isOpen = 1;
	private _soundStorageKey = 'SOUND';
	private _filePath = '';
	private soundResouces: cc.AudioClip[] = [];
	private musicID = 0;
	////////////////////////////
	//// get、set访问器
	/////////////////////////////
	public get isOpen(): boolean {
		return this._isOpen > 0;
	}

	public set isOpen(bool: boolean) {
		this._isOpen = bool ? 1 : 0;
		cc.sys.localStorage.setItem(this._soundStorageKey, this._isOpen);
	}

	public set filePath(path: string) {
		this._filePath = path;
	}

	public set soundStorageKey(key: string) {
		this._soundStorageKey = key;
	}

	////////////////////////////
	// 接口
	///////////////////////////
	private constructor() {
		this._isOpen = cc.sys.localStorage.getItem(this._soundStorageKey) || 1;
	}

	/**
	 * @description 加载音乐文件
	 */
	public loadAudioResoucre() {
		return new Promise((resolve, reject) => {
			cc.loader.loadResDir(this._filePath, cc.AudioClip, (error: Error, resources: any[]) => {
				if (error) {
					console.log('load sound error: ', error);
					reject();
					return;
				}
				for (let index = 0; index < resources.length; index++) {
					let soundResouce = resources[index];
					this.soundResouces[soundResouce._name] = soundResouce;
				}
				resolve();
				console.log('load sound resources success');
			});
		});
	}

	/**
	 * @description 播放音乐（默认循环）
	 * @param {string} fileName
	 */
	public playMusic(fileName: string) {
		let audioClicp = this.isCanPlayAudio(fileName);
		if (audioClicp) {
			this.musicID = cc.audioEngine.playMusic(audioClicp, true);
		}
	}

	/**
	 * @description 播放音效
	 * @param {string} fileName
	 */
	public playEffect(fileName: string) {
		let audioClip = this.isCanPlayAudio(fileName);
		if (audioClip) {
			cc.audioEngine.playEffect(audioClip, false);
		}
	}

	/**
	 * @description 暂停声音
	 */
	public pause() {
		if (this.isOpen) {
			cc.audioEngine.pauseMusic();
			cc.audioEngine.pauseAllEffects();
		}
	}

	/**
	 * @description 重起声音
	 */
	public resume() {
		if (this.isOpen) {
			cc.audioEngine.resumeMusic();
		}
	}
	////////////////////////////
	// 业务逻辑
	///////////////////////////
	/**
	 * @description 播放声音
	 * @param fileName
	 */
	private isCanPlayAudio(fileName: string) {
		if (!this._isOpen) {
			return null;
		}
		let file = this.soundResouces[fileName];
		if (!file) {
			console.error('sound: fieName is error, please check it');
			return null;
		}
		return file;
	}
}

export const AudioMgr = audio._instance;
