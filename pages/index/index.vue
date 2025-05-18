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
		images.getImages().then(res => {
			console.log('所有用户数据', res)
		})
	},
	methods: {
		async chooseAndUpload() {
			const res = await uni.chooseImage({
				count: 1,
				sizeType: ['original', 'compressed'],
				sourceType: ['album', 'camera']
			});

			const filePath = res.tempFilePaths[0];
			const fileName = res.tempFiles[0].name;
			const uploadRes = await uniCloud.uploadFile({
				cloudPath: 'images/' + fileName,
				filePath
			});

			if (uploadRes.fileID) {
				uni.showToast({ title: '上传成功', icon: 'success' });
			} else {
				uni.showToast({ title: '上传失败', icon: 'none' });
			}
		}
	}
}
</script>

<style></style>
