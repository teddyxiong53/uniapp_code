<template>
	<view >
		<view class="uni-list" v-for="(filename, index) in files" :key="index">
			<view class="uni-list-cell">
				{{filename}}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				files: []
			}
		},
		onLoad:function(){
			//获取文件，填入到files里面。
			var self = this;
			uni.getSavedFileList({
				success:function(res){
					//self.data.files.push( res.fileList.filePath);
					console.log(res);
					for(let item of res.fileList) {
						self.files.push(item.filePath);
					}
				}
			})
		}
	}
	
</script>

<style>
</style>
