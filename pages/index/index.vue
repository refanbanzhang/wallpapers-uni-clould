<template>
	<view>
		<button @click="chooseAndUpload">选择并上传图片</button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			title: 'Hello'
		}
	},
	onLoad() {
		const images = uniCloud.importObject('images')
		// images.getImages().then(res => {
		// 	console.log('所有用户数据', res)
		// })
	},
	methods: {
		async chooseAndUpload() {
			try {
				const { tempFiles } = await uni.chooseImage({
					count: 1, // 默认9，设置为1表示一次只能选择一张图片
					sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album', 'camera'], // 从相册选择或使用相机
				});

				if (tempFiles.length > 0) {
					const images = uniCloud.importObject('images')
					const file = tempFiles[0]

					// 使用FileReader读取文件并转换为base64
					const base64 = await new Promise((resolve, reject) => {
						const reader = new FileReader()
						reader.onload = (e) => {
							const base64Data = e.target.result.split(',')[1]
							resolve(base64Data)
						}
						reader.onerror = reject
						reader.readAsDataURL(file)
					})

					await images.uploadImage({
						fileContent: base64,
						fileName: file.name
					})

					uni.showToast({
						title: '上传成功',
						icon: 'success'
					})
				}
			} catch (e) {
				console.error(e)
				uni.showToast({
					title: '上传失败',
					icon: 'error'
				})
			}
		}
	}
}
</script>

<style></style>
