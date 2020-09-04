<template>
	<view>
		<view class="recorder_text">
			<text v-if="!isPlaying">录音：{{recordTime}}</text>
			<text v-else>播放：{{playTime}}</text>
		</view>
		
		<button type="default" @click="startRecord">开始录音</button>
		<button type="default" @click="stopRecord">停止录音</button>
		<button type="default" @click="playFile">播放录音</button>
		<button type="default" @click="showFiles">查看文件</button>
	</view>
	
</template>
<script>
	const recorderManager = uni.getRecorderManager();
	const innerAudioContext = uni.createInnerAudioContext();
	
	export default {
		data() {
			return {
				text: "录音播放",
				voicePath: "",
				recordTime: 0,
				playTime: 0,
				isPlaying: false,
				recordTimer: null,
				playTimer: null
			}
		},
		onLoad() {
			let self = this;
			recorderManager.onStop(function(res) {
				console.log("recorder stop :" + JSON.stringify(res));
				self.recordTime = 0;
				clearInterval(self.recordTimer);
				//这里保存文件
				//saveFile 会把临时文件移动，因此调用成功后传入的 tempFilePath 将不可用。
				//先弹窗让用户选择路径
				//弹窗比较难，先不做。保存默认路径吧。
				uni.saveFile({
					tempFilePath: res.tempFilePath,
					success:function(res){
						self.voicePath = res.savedFilePath;
						console.log("save file to:" + res.savedFilePath);
					}
				})
			});
		},
		methods:{
			startRecord: function() {
				console.log("startRecord");
				recorderManager.start();
				let self = this;
				this.recordTimer = setInterval(function() {
					//console.log("1s timer ");
					self.recordTime++;
				}, 1000);
				uni.showToast({
					complete:function(){
						console.log("toast complete");
					},
					title:"开始录音",
					duration:1000
				})
			},
			stopRecord: function() {
				console.log("stopRecord");
				recorderManager.stop();
				
			},
			playFile: function() {
				console.log("playFile");
				let self = this;
				if(this.voicePath) {
					this.isPlaying = true;
					innerAudioContext.src = this.voicePath;
					innerAudioContext.onEnded( function(){
						console.log("onEnded");
						clearInterval(self.playTimer);
						self.playTime = 0;
						self.isPlaying = false;//这个事件反而没有检测到。
					});
					innerAudioContext.onPlay(function(){
						console.log("onPlay");
					});
					innerAudioContext.onCanplay(function(){
						console.log("onCanPlay");
					});
					innerAudioContext.onPlay(function(){
						console.log("onPlay");
					});
					innerAudioContext.onPause(function(){
						console.log("onPause");
						clearInterval(self.playTimer);
						self.playTime = 0;
						self.isPlaying = false;//播放完成，反而是触发了这个事件。
					});
					innerAudioContext.onStop(function() {
						console.log("onStop");
					});
					innerAudioContext.onTimeUpdate(function(){
						//console.log("onTimeUpdate");
					})
					console.log("volume:" + innerAudioContext.volume);
					innerAudioContext.play();
					
					self.playTimer = setInterval(function() {
						self.playTime++;
					}, 1000);
				}
			},
			showFiles:function() {
				/*
				uni.getSavedFileList({
					complete: function(res) {
						console.log(res);
					},
					fail: function(res) {
						console.log(res);
					},
					success:function(res){
						console.log(res.fileList);
					}
				})
				*/
			    uni.navigateTo({
			    	url:"../filelist/filelist"
			    })
			}
		}
	}
</script> 
<style>
	.recorder_text {
		justify-content: center;
		font-size: 40rpx;
		background-color: #007AFF;
	}
</style>