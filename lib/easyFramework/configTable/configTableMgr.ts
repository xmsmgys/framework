/**
 * @description 声音模块
 */
class configTableMgr {
	////////////////////////////
	// 类成员
	///////////////////////////
	public static readonly _instance = new configTableMgr();
	private configTableMap = {};
	////////////////////////////
	// get、set访问器
	///////////////////////////

	////////////////////////////
	// 接口
	///////////////////////////
	/**
	 * @description 加载json文件夹
	 * @param pathName
	 */
	public loadConfigTable(pathName: string) {
		// let cfg = this.getConfigTableItem(pathName);
		// if (cfg) return cfg;
		return new Promise((resolve, reject) => {
			cc.loader.loadResDir(pathName, cc.JsonAsset, (error: any, resource: any[], urls: string[]) => {
				if (error) {
					console.error('=====> @framework, 加载配置表失败: ', error);
					reject();
					return;
				}
				resource.forEach((jsonAsset: any) => {
					this.configTableMap[jsonAsset.name] = jsonAsset.json;
				});
				resolve();
			});
		});
	}

	/**
	 * @description 获取json文件
	 * @param jsonName
	 */
	public getConfigTableItem(jsonName: string) {
		let item = this.configTableMap[jsonName];
		if (item) {
			return item;
		} else {
			console.error(`=====> @framework, 获取配置表文件失败, 文件:${jsonName}.json 不存在`);
			return null;
		}
	}
}

export const ConfigTableMgr = configTableMgr._instance;
