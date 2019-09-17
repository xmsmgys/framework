import { AudioMgr } from './audioMgr/audioMgr';
import { ChannelMgr } from './channel/channelMgr';
import { Toutiao } from './channel/toutiao/toutiao';
import { Wechat } from './channel/wechat/wechat';
import { ConfigFrameWork } from './config';
import { ConfigTableMgr } from './configTable/configTableMgr';
import { Message } from './message/message';
import { Http } from './network/http/http';
import { NetworkMgr } from './network/networkMgr';
import { Notifications } from './notification/notifications';
import { UserCenter } from './userCenter/userCenter';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Commom extends cc.Component {
	// ///////////////////////////
	// ///成员变量
	// /////////////////////////

	////////////////////////////
	// get、set访问器
	///////////////////////////
	public get channelMgr() {
		return ChannelMgr;
	}

	public get notifications() {
		return Notifications;
	}

	public get audioMgr() {
		return AudioMgr;
	}

	public get configTable() {
		return ConfigTableMgr;
	}

	public get message() {
		return Message;
	}
	// ///////////////////////////
	// ///cc.class 生命周期函数
	// /////////////////////////

	////////////////////////////
	// 网络模块
	///////////////////////////
	/**
	 * 初始化网络模块
	 * @param userCenter 数据层
	 */
	public static initNetWorkMgr(userCenter: UserCenter) {
		NetworkMgr.encryptCode = ConfigFrameWork.EncryptCode;
		NetworkMgr.errorRestartGameCode = ConfigFrameWork.ErrorRestartGameCode;
		NetworkMgr.errorNetCode = ConfigFrameWork.ErrorNetCode;
		NetworkMgr.dealHeadListener = (head) => { userCenter.dealHead(head); };
		Http.httpUrl = ConfigFrameWork.HttpUrl;
	}
	////////////////////////////
	// 渠道模块
	///////////////////////////
	public static initChannelMgr() {
		ChannelMgr.channel = ConfigFrameWork.Channel;
		ChannelMgr.sharePictureAddress = ConfigFrameWork.SharePictureAddress;
		ChannelMgr.shareWord = ConfigFrameWork.ShareWord;
		ChannelMgr.wxShareWaiteTime = ConfigFrameWork.ShareWaitTime;
		if (ChannelMgr.isWechatGame()) {
			ChannelMgr.switchShowAndHide();
			Wechat.bannerAdUnitId = ConfigFrameWork.BannerAdUnitId;
			Wechat.rewardedVideoAdUnitId = ConfigFrameWork.RewardedVideoAdUnitId;
			Wechat.interstitialAdUnitId = ConfigFrameWork.InterstitialAdUnitId;
			Wechat.userInfoButtonData = ConfigFrameWork.UserInfoButtonData;
			Wechat.bannerSize = ConfigFrameWork.BannerSize;
			Wechat.gameClubSize = ConfigFrameWork.GameClubSize;
			Wechat.closeRewardVideoListener = () => {
				AudioMgr.resume();
			};
		} else if (ChannelMgr.isTouTiao()) {
			Toutiao.bannerAdUnitId = ConfigFrameWork.BannerAdUnitId;
			Toutiao.rewardedVideoAdUnitId = ConfigFrameWork.RewardedVideoAdUnitId;
			Toutiao.closeRewardVideoListener = () => {
				AudioMgr.resume();
			};
		}
	}
	////////////////////////////
	// 音频模块
	///////////////////////////
	public static initAudioMgr() {
		AudioMgr.filePath = ConfigFrameWork.AudioFilePath;
		return AudioMgr.loadAudioResoucre();
	}
	////////////////////////////
	// JSON配表管理
	///////////////////////////
	public static initConfigMgr(pathName: string) {
		ConfigTableMgr.loadConfigTable(pathName);
	}

}
