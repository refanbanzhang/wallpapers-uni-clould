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
	async uploadImage() {
		const httpInfo = this.getHttpInfo()
		let bodyString = httpInfo.body;
		let params = {};

		// 检查是否 Base64 编码
		if (httpInfo.isBase64Encoded && bodyString) {
			bodyString = Buffer.from(bodyString, 'base64').toString('utf8');
		}

		// 默认处理 JSON 格式
		if (bodyString) {
			try {
				// 检查 Content-Type 是否为 application/json
				// uniCloud 在某些情况下可能已经解析了 JSON，或者 bodyString 仍然是字符串
				// 如果 httpInfo.body 直接就是对象，uniCloud 已经处理了 Content-Type application/json
				if (typeof bodyString === 'string' && httpInfo.headers && httpInfo.headers['content-type'] && httpInfo.headers['content-type'].toLowerCase().includes('application/json')) {
					params = JSON.parse(bodyString);
				} else if (typeof bodyString === 'object') { // 如果 uniCloud 已经解析了 body
					params = bodyString;
				} else {
					console.warn("Request body is a string but Content-Type is not application/json, or body could not be parsed as an object. Raw body string:", bodyString);
					// 尝试从 queryStringParameters 作为备选方案
					if (httpInfo.queryStringParameters) {
						params = httpInfo.queryStringParameters;
					}
				}
			} catch (e) {
				console.error("Error parsing request body:", e);
				console.error("Raw body string before parsing:", bodyString);
				return {
					code: 400, // Bad Request
					message: "无效的请求体格式",
					error: e.message
				};
			}
		} else if (httpInfo.queryStringParameters) { // 如果 body 为空，尝试从 query string 获取
			params = httpInfo.queryStringParameters;
		}


		const fileContent = params.fileContent;
		const fileName = params.fileName;

		if (!fileContent || !fileName) {
			console.error("Missing fileContent or fileName in request.", "Received params:", params, "Raw HTTP Info:", httpInfo);
			return {
				code: 400, // Bad Request
				message: "缺少必需的参数 fileContent 或 fileName"
			};
		}

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
