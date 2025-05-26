// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129

// 如何访问云对象的方法？
// images云对象的getImages方法
// https://fc-mp-901c2eda-ac99-48e4-af67-19411b9d7eb7.next.bspapp.com/images/getImages

const Jimp = require('jimp');

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

		// 使用 jimp 处理图片 (Jimp 变量是 require('jimp') 返回的模块对象)
		const image = await Jimp.Jimp.read(buffer); // 您的修正是正确的
		const resolution = {
			width: image.bitmap.width,
			height: image.bitmap.height
		};

		// 生成缩略图
		const thumbnailImage = image.clone(); // 操作前克隆图像
		if (thumbnailImage.bitmap.width > 200 || thumbnailImage.bitmap.height > 200) {
			thumbnailImage.contain({ w: 200, h: 200 }); // 使用选项对象
		}

		// 获取缩略图的buffer
		const thumbnailBuffer = await thumbnailImage.getBuffer(Jimp.JimpMime.jpeg); // 使用 getBuffer 和正确的MIME类型

		// 上传原图
		const { fileID } = await uniCloud.uploadFile({
			cloudPathAsRealPath: true,
			cloudPath: `images/${fileName}`,
			fileContent: buffer
		});

		// 上传缩略图
		const { fileID: thumbnailFileID } = await uniCloud.uploadFile({
			cloudPathAsRealPath: true,
			cloudPath: `images/thumbnail_${fileName}`,
			fileContent: thumbnailBuffer
		});

		// 将图片信息保存到数据库中
		const db = uniCloud.database();
		await db.collection('images').add({
			fileName,
			createTime: new Date(),
			originalUrl: fileID,
			thumbnailUrl: thumbnailFileID,
			category: '',
			resolution
		});

		return {
			code: 0,
			data: {
				fileName,
				url: fileID,
				thumbnailUrl: thumbnailFileID
			}
		};
	},
}
