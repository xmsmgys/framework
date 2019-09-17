/**
 * @description 玩家数据管理
 */
export class UserCenter {
	////////////////////////////
	// 类成员
	///////////////////////////
	/**获取单例 子类需覆写 */
	public static readonly _instance = new UserCenter();
	public static getInstance(): UserCenter {
		return UserCenter._instance;
	};

	/** 玩家id */
	protected _id: number;
	/** 玩家唯一标识: 出登录外，每一条协议的head.uid 都是改值 */
	protected _openid: string;
	/** 玩家昵称 */
	protected _nickname: string;
	/** 头像地址 */
	protected _avatar: string;
	////////////////////////////
	//// get、set访问器
	/////////////////////////////
	public get id() {
		return this._id;
	}
	public get openid() {
		return this._openid;
	}

	////////////////////////////
	// 接口 子类覆写
	///////////////////////////
	public initUserInfo(data: any) {
		this._id = data.id;
		this._openid = data.openid;
	}
	public dealHead(head: any) {

	}
}

