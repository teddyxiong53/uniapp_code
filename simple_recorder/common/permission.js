//null：未请求 
//1： 已允许
//0：拒绝或者受限
//2：系统未开启
var isIOS


function requestAndroid(permissionID) {
	return new Promise((resolve, reject)=> {
		plus.android.requestPermissions(
			[permissionID],
			function(resultObj) {
				var result = 0;
				for(var i=0; i<resultObj.granted.length; i++) {
					var grantedPermission = resultObj.granted[i];
					console.log("已经获取到权限：" + grantedPermission);
					result = 1;
				}
				for(var i=0 ;i<resultObj.deniedPresent.length; i++) {
					var deniedPresentPermission = resultObj.deniedPresent[i];
					console.log("拒绝本次申请的权限：" + deniedPresentPermission);
					result = 0;
				}
				for(var i=0; i<resultObj.deniedAlways.length; i++) {
					var deniedAlwaysPermission = resultObj.deniedAlways[i];
					console.log("永久拒绝申请的权限：" + deniedAlwaysPermission);
					result = -1;
				}
				resolve(result);
			},
			function(err) {
				console.log("result error : " + err.message);
				resolve({
					code: err.code,
					message: err.message
				});
			}
		);
	});
}

function gotoAppPermissionSetting() {
	if(permission.isIOS) {
		
	} else {
		var Intent = plus.android.importClass("android.content.Intent");
		var Settings = plus.android.importClass("android.provider.Settings");
		var Uri = plus.android.importClass("android.net.Uri");
		var mainActivity = plus.android.runtimeMainActivity();
		var intent = new Intent();
		intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
		var uri = Uri.fromParts("package", mainActivity.getPackageName(), null);
		intent.setData(uri);
		mainActivity.startActivity(intent);
	}
}
function requestIOS(permissionID) {
	return new Promise((resolve, reject)=> {
		resolve(0);
	});
}
const permission = {
	get isIOS() {
		return uni.getSystemInfoSync().platform === 'ios';
	},
	requestIOS: requestIOS,
	requestAndroid: requestAndroid,
	gotoAppSetting: gotoAppPermissionSetting
};
module.exports = permission;
