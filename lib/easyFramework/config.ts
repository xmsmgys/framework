import { CHANNELTYPE } from './channel/channelMgr';
const GameClubIcon = {
	green: 'green',
	white: 'white',
	dark: 'dark',
	light: 'light'
};

export const ConfigFrameWork = {
	// 渠道模块
	/** 渠道类型 */
	Channel: CHANNELTYPE.DEVELOP,
	/** 是否开启日志 */
	IsOpenLog: true,
	/** 微信登录按钮信息 */
	UserInfoButtonData: {
		width: 230,
		height: 88,
		x: 0.5,
		y: 0.7,
		/** 布置在外网的登录按钮地址 */
		url: 'https://wxgame.088youxi.com/qstg/res/qstg_loginBtn.png'
	},
	/** banner广告id */
	// BannerAdUnitId: 'adunit-860dd1f8b802b855', // 微信
	BannerAdUnitId: '3sepk1sscm9254p162',
	/** 奖励视频广告id */
	// RewardedVideoAdUnitId: 'adunit-8860f24049ae69c1', // 微信
	RewardedVideoAdUnitId: '1ng95d1gksd5g013l4',
	/** 插屏广告id */
	InterstitialAdUnitId: 'adunit-57a7d5e17388d34d',
	/** banner广告的像素大小 */
	BannerSize: {
		width: 600,
		height: 172
	},
	/** 分享图片地址 */
	SharePictureAddress: [
		'https://img.088youxi.com/Adv/channel/share/qstg/qstg_share_0.jpg',
		'https://img.088youxi.com/Adv/channel/share/xlgs/qstg_share_1.jpg'
	],
	/** 分享图片用语 */
	ShareWord: [
		'紧急呼救！，我被丧尸包围了！',
		'无敌是多么的寂寞~~~',
		'我是枪神，是兄弟就来帮我打僵尸',
		'对面内个僵尸，浪我只看一眼，就想立刻打死它'
	],
	/** 微信游戏圈 */
	GameClubSize: {
		icon: GameClubIcon.green, //
		x: 110,
		y: 120,
		width: 40,
		height: 40
	},
	/** 分享需要3s时间 */
	ShareWaitTime: 3 * 1000,
	// 声音模块
	/** 声音资源地址，在resources文件下面 */
	AudioFilePath: 'audio',
	// 网络模块
	/** 服务器地址 */
	HttpUrl: 'https://qstg-tt.088youxi.com',
	/** 加密code: 需要和服务端统一 */
	EncryptCode: '',
	/** 错误码列表 */
	ErrorNetCode: {
		/** 系统error code */
		0: '成功',
		1: '请求失败',
		500: '500服务器报错',
		99: '账号不存在',
		100: '请求header缺少参数',
		101: 'token不存在',
		102: '账号在其他设备登录',
		103: 'mid不存在',
		104: '非法的mid请求',
		105: '签名错误',
		107: '参数错误',
		120: '请求body缺少参数',
		121: '微信登录失败'
		/** 业务逻辑error code */
	},
	/** 重起游戏的错误码 */
	ErrorRestartGameCode: [102]
};

if (!ConfigFrameWork.IsOpenLog) {
	console.log = function log() {};
	console.table = function table() {};
	console.error = function error() {};
	cc.log = function log() {};
	cc.error = function error() {};
}
