declare namespace tt {
	function getGameRecorderManager();
	function setKeepScreenOn(boolean);
	function shareVideo(argument);
	function shareAppMessage(argument);
	function onShareAppMessage(argument);
	function getLaunchOptionsSync():any;
	function getSystemInfoSync():any;
	function login(argument);
	function authorize(argument);
	function checkSession(argument);
	function getUserInfo(argument):any;
	function vibrateShort(); // 手机震动
	function vibrateLong();//长时间震动
	function getOpenDataContext();
	function createBannerAd(argument);
	function createRewardedVideoAd(argument);
	function getSetting(argument);
}
