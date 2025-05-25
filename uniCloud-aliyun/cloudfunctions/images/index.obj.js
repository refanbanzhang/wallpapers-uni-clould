// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129

// 如何访问云对象的方法？
// images云对象的getImages方法
// https://fc-mp-901c2eda-ac99-48e4-af67-19411b9d7eb7.next.bspapp.com/images/getImages

module.exports = {
	_before: function () { // 通用预处理器

	},
	/**
	 * method1方法描述
	 * @param {string} param1 参数1描述
	 * @returns {object} 返回值描述
	 */
	/**
	 * 获取所有图片
	 * @returns {object} 图片列表
	 */
	async getImages() {
		// 查询 images 集合所有图片
		const db = uniCloud.database();
		const res = await db.collection('images').get();

		return {
			code: 0,
			data: res.data
		};
	},

	/**
	 * 上传图片到云存储
	 * @param {string} fileContent base64字符串（不带data:image前缀）
	 * @param {string} fileName 文件名（如 xxx.jpg）
	 * @returns {object} 上传结果
	 */
	async uploadImage({ fileContent, fileName }) {
		const buffer = Buffer.from(fileContent, 'base64');

		// https://doc.dcloud.net.cn/uniCloud/storage/dev.html#clouduploadfile
		const { fileID } = await uniCloud.uploadFile({
			cloudPathAsRealPath: true,
			cloudPath: `images/${fileName}`,
			fileContent: buffer
		});

		// 将图片信息保存到数据库中
		const db = uniCloud.database();
		await db.collection('images').add({
			url: fileID,
			fileName,
			createTime: new Date(),
		});

		return {
			code: 0,
			data: {
				fileName,
				url: fileID,
			}
		};
	},
}
