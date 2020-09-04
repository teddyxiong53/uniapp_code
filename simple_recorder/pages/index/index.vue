<template>
	<view>
		<page-head :title="title"></page-head>
		<view class="uni-padding-wrap">
			<!-- 为什么使用block方式？ -->
			<block v-if="!recording&&!playing && !hasRecord">
				<!-- 一进来就是满足这个条件的 -->
				<!-- 时间显示 -->
				<view class="page-body-time">
					<text class="time-big">
						{{formatedRecordTime}}
					</text>
				</view>
				<!-- 按钮组 -->
				<view class="page-body-buttons">
					<view class="page-body-button">
						<!-- 这个是播放按钮 -->
					</view>
					<view class="page-body-button" @click="startRecord">
						<image src="../../static/record.png"></image>
					</view>
					<view class="page-body-button">
						<!-- 这个是删除按钮 -->
					</view>
				</view>
			</block>
			<!-- 又一个block -->
			<block v-if="recording===true">
				<view class="page-body-time">
					<text class="time-big">{{formatedRecordTime}}</text>
				</view>
				<!-- 按钮组 -->
				<view class="page-body-buttons">
					<!-- 按钮1 -->
					<view class="page-body-button">
						<!-- 不显示 -->
					</view>
					<!-- 按钮2：现在是停止录音 -->
					<view class="page-body-button" @click="stopRecord">
						<view class="button-stop-record">
							<!-- 停止按钮，不是图片，而是靠css画出来的一个圆环 -->
						</view>
					</view>
					<view class="page-body-button">
						<!-- 空的 -->
					</view>
				</view>
			</block>
			<!-- 如果有录音文件，又没有在播放状态，则显示播放按钮 -->
			<block v-if="hasRecord===true && playing===false">
				<!-- 显示2个时间，一个是当前播放时间，一个是当前录音文件的时间长度 -->
				<view class="page-body-time">
					<text class="time-big">
						{{formatedPlayTime}}
					</text>
					<text class="time-small">
						{{formatedRecordTime}}
					</text>
				</view>
				
				<!-- 然后是2个按钮，一个播放，一个删除 -->
				<view class="page-body-buttons">
					<view class="page-body-button" @click="playVoice">
						<image src="../../static/play.png" ></image>
					</view>
					<view class="page-body-button" @click="clear">
						<image src="../../static/trash.png" ></image>
					</view>
				</view>
			</block>
			<!-- 播放文件的情况 -->
			<block v-if="hasRecord===true && playing===true">
				<view class="page-body-time">
					<text class="time-big">
						{{formatedPlayTime}}
					</text>
					<text class="time-small">
						{{formatedRecordTime}}
					</text>
				</view>
				<view class="page-body-buttons">
					<view class="page-body-button" @click="stopVoice">
						<image src="../../static/stop.png" ></image>
					</view>
					<view class="page-body-button" @click="clear">
						<image src="../../static/trash.png" ></image>
					</view>
				</view>
			</block>
		</view>
	</view>
	
</template>
<script>
	import permission from "@/common/permission.js"
	var util = require("@/common/util.js")
	var playTimeInterval = null;
	var recordTimeInterval = null;
	var recorderManager = null;
	var music = null;
	
	export default {
		data() {
			return {
				title: "录音播放",
				recording: false,
				playing: false,
				hasRecord: false,//是否有一个录音文件
				tempFilePath: "",
				recordTime: 0,
				playTime: 0,
				formatedRecordTime: "00:00:00",
				formatedPlayTime: "00:00:00"
			}
		},
		onUnload: function() {
			this.end();
		},
		onLoad: function() {
			//获取播放器
			music = uni.createInnerAudioContext();
			music.onEnded(()=>{
				clearInterval(playTimeInterval);
				var playTime = 0;
				console.log("play voice finished");
				this.playing = false;
				this.formatedPlayTime = util.formatTime(playTime);
				this.playTime = playTime;//清零
			});
			//获取录音设备
			recorderManager = uni.getRecorderManager();
			//设置录音设备的回调。
			recorderManager.onStart(()=> {
				console.log("record start");
				this.recording = true;
				recordTimeInterval = setInterval(()=> {
					this.recordTime +=1;
					this.formatedRecordTime = util.formatTime(this.recordTime);
				}, 1000);//每秒时间加1
			});
			recorderManager.onStop((res)=> {
				console.log("record stop");
				music.src = res.tempFilePath;
				this.hasRecord = true;
				this.recording = false;
			});
			//出错回调
			recorderManager.onError(()=> {
				console.log('record error');
			});
			
		},
		methods:{
			async startRecord() {
				//异步录音
				let status = await this.checkPermission();
				if(status !== 1) {
					return ;
				}
				recorderManager.start({
					format: "mp3"
				});
			},
			stopRecord() {
				recorderManager.stop();
				clearInterval(recordTimeInterval);//停止即时。
			},
			playVoice() {
				console.log("play voice");
				this.playing = true;
				playTimeInterval = setInterval(()=>{
					this.playTime +=1;
					this.formatedPlayTime = util.formatTime(this.playTime);
				}, 1000);
				music.play();
			},
			stopVoice() {
				console.log("stop voice");
				this.playing = false;
				this.formatedPlayTime = util.formatTime(0);
				this.playTime = 0;
				music.stop();
			},
			end() {
				//退出的时候
				music.stop();//停止播放
				//停止录音
				recorderManager.stop();
				//停止计时
				clearInterval(recordTimeInterval);
				clearInterval(playTimeInterval);
				//清除标志
				this.recording = false;
				this.playTime = 0;
				this.recordTime = 0;
				this.hasRecord = false;
				this.playing = false;
				this.formatedRecordTime = "00:00:00";
				this.formatedPlayTime = "00:00:00";
			},
			clear() {
				this.end();
			},
			async checkPermission() {
				let status = await permission.requestAndroid("android.permission.RECORD_AUDIO");
				if(status === null || status === 1) {
					status = 1;
				} else if(status == 2) {
					uni.showModal({
						content:"系统麦克风已经关闭",
						confirmText:"确定",
						showCancel:false,
						success: function(res) {
							console.log("xx");
						}
					});
					
				} else {
					uni.showModal({
						content:"需要麦克风权限",
						confirmText:"设置",
						success: function(res) {
							if(res.confirm) {
								permission.gotoAppSetting();
							}
						}
					})
				}
				return status;
			}
		}
	}
</script> 
<style>
	image {
		width: 150rpx;
		height: 150rpx;
	}
	
	.page-body-time {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.time-big {
		font-size: 60rpx;
		margin: 20rpx;
	}
	.time-small {
		font-size: 30rpx;
	}
	.page-body-buttons {
		margin-top: 60rpx;
		display: flex;
		justify-content: space-around;
	}
	.page-body-button {
		width: 250rpx;
		text-align: center;
	}
	.button-stop-record {
		width: 110rpx;
		height: 110rpx;
		border: 20rpx solid #fff;
		background-color: #f55c23;
		border-radius: 130rpx;
		margin: 0 auto;
	}
</style>