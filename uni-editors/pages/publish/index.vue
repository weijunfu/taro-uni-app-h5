<template>
	<view class="container">
		<view class="page-body">
			<view class='wrapper'>
				<view class="next-step" @click="nextStep">下一步</view>
				
				<input maxlength="30" :value="title" v-model="title" class="title" type="text" placeholder="标题" />
				
				<view :class="{toolbar:true, hide: !showEditorBar}" @tap="format">
					<view class="iconfont icon-charutupian" @tap="insertImage"></view>
					<view :class="formats.bold ? 'ql-active' : ''" class="iconfont icon-zitijiacu" data-name="bold"></view>
					<view class="iconfont icon-undo" @tap="undo"></view>
					<view class="iconfont icon-redo" @tap="redo"></view>
				</view>

				<editor id="editor" class="ql-container" placeholder="请您详细描述发布的信息……" showImgSize showImgToolbar showImgResize
				 @statuschange="onStatusChange" :read-only="readOnly" @ready="onEditorReady"
				 @blur="onBlur" @focus="onFocus" @input="editorChange">
				</editor>
				
				<view class="font-box">
					<label><label class="font-count">{{ fontCount }}</label>{{ '/' + fontTotal }}</label>
				</view>
				
				<view class="video-box">
				      <!-- 预览 -->
				      <view class="video-prev-box" v-if='videoUrl.length > 0'>
				        <img class="video-x" :src="delIcon" @click="delVideo">
				        <video :src="videoUrlAll" autoplay='true' muted="true" controls="true" show-mute-btn="true" play-btn-position="center" class="video"></video>
				      </view>
				
				      <!-- 上传 -->
				      <view class="video-func-box" v-else @click='uploadVideo'>
				        <view class="upload-lines">
				          <input type="file" name="video" class="videofile" accept="video/mp4" id="videofile">
				          <view class="upload-lines-x"></view>
				          <view class="upload-lines-y"></view>
				        </view>
				        <view class="upload-label">上传视频</view>
				      </view>
				    </view>
				  </view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
                readOnly: false,
				formats: {},
				videoUrl:'',	//提交
				videoUrlAll:'',//回显
				title:'',//标题
				content:'',//富文本内容
				imgs:'',	//富文本中的图片
				mediaHost:'https://img.zhuanjuan.net/',//图片或视频访问主机
				delIcon: 'https://img.zhuanjuan.net//app/imgs/x.png',
				showEditorBar: false,	//是否显示富文本编辑器工具条
				fontCount: 0,	//当前录入字数
				fontTotal: 800,//总限制字数
				
			}
		},
		methods: {
			readOnlyChange() {
				this.readOnly = !this.readOnly
			},
			onEditorReady() {
				uni.createSelectorQuery().select('#editor').context((res) => {
					this.editorCtx = res.context
				}).exec()
			},
			onFocus(){
				this.showEditorBar = true
			},
			onBlur(){
				// console.log('blur')
				// this.showEditorBar = false
				setTimeout(()=>{
					this.showEditorBar = false
				}, 5000)
			},
			undo() {
				this.editorCtx.undo()
			},
			redo() {
				this.editorCtx.redo()
			},
			format(e) {
				let {
					name,
					value
				} = e.target.dataset
				if (!name) return
				// console.log('format', name, value)
				this.editorCtx.format(name, value)

			},
			onStatusChange(e) {
				const formats = e.detail
				this.formats = formats
			},
			insertviewider() {
				this.editorCtx.insertviewider({
					success: function() {
						console.log('insert viewider success')
					}
				})
			},
			clear() {
				this.editorCtx.clear({
					success: function(res) {
						console.log("clear success")
					}
				})
			},
			removeFormat() {
				this.editorCtx.removeFormat()
			},
			insertDate() {
				const date = new Date()
				const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
				this.editorCtx.insertText({
					text: formatDate
				})
			},
			editorChange(e){
				// console.log(e)
				let { text } = e.detail,
					len = text.length
					
					this.fontCount = len
					
				if(len > 800) return uni.showToast({
					title:'超出字数限制',
					icon:'none'
				})
			},
			insertImage() {
				uni.chooseImage({
					count: 1,
					success: async (res) => {
						//获取七牛上传token
						let token = ''
						let res1 = await uni.request({
							url:'/upload/getQiNiuToken.do',
							header: {
								'Access-Control-Allow-Origin':'*'
							}
							})
							
							console.log('token', res1[1])
							
							let tokenObj = res1[1].data
						if(tokenObj.code === 200) {
							token = tokenObj.data
						} else {
							return uni.showToast({
								title: tokenObj.message,
								icon:'none'
							})
						}
						
						let files = res.tempFilePaths,
							file = files[0],
							fileStr = file.toString(),
							suffix = fileStr.substring(fileStr),
							key = '/app/article/' + Date.now() + '.png'
							
						console.log(token, key)
						
						//上传文件至七牛
						await uni.uploadFile({
							url:'https://up-z1.qiniup.com',
							// files:res.tempFilePaths[0],
							filePath: file,
							fileType:'image',
							name:'file',
							formData: {
								token,
								key
							},
							success: (res) => {
								let { statusCode, data } = res
								console.log(statusCode, data)
								
								let path = ''
								if(statusCode === 200) {
									this.imgs = key + ','
									
									path = JSON.parse(data).key
								} else {
									return uni.showToast({
										title:'上传失败',
										icon:'none'
									})
								}
								
								this.editorCtx.insertImage({
									src: this.mediaHost+path,
									alt: '图像',
									success: function() {
										console.log('insert image success')
									}
								})
							}
						})
					
					}//success 选择图片
				})//end 选择图片
			},
			uploadVideo(){
				uni.chooseVideo({
					sourceType:['album', 'camera'],
					compressed:true,
					maxDuration: 60,
					success: async (res) => {
						console.log(res)
						uni.showLoading({
							title:'数据处理中……',
							mask:true
						})
						//获取七牛上传token
						let token = ''
						let res1 = await uni.request({
							url:'/upload/getQiNiuToken.do',
							header: {
								'Access-Control-Allow-Origin':'*'
							}
							})
							
							console.log('token', res1[1])
							
							let tokenObj = res1[1].data
						if(tokenObj.code === 200) {
							token = tokenObj.data
						} else {
							return uni.showToast({
								title: tokenObj.message,
								icon:'none'
							})
						}
						
						let file = res.tempFilePath,
							key = '/app/article/' + Date.now() + '.mp4'
							
						console.log(token, key)
						
						//上传文件至七牛
						await uni.uploadFile({
							url:'https://up-z1.qiniup.com',
							// files:res.tempFilePaths[0],
							filePath: file,
							fileType: 'video',
							name:'file',
							formData: {
								token,
								key
							},
							success: (res) => {
								let { statusCode, data } = res
								console.log(statusCode, data)
								
								let path = ''
								if(statusCode === 200) {
									this.videoUrl = key
									this.videoUrlAll = this.mediaHost + key
									path = JSON.parse(data).key
								} else {
									return uni.showToast({
										title:'上传失败',
										icon:'none'
									})
								}
							}
						})
					
						uni.hideLoading()
					}
				})
			},
			delVideo(){
				this.videoUrl = ''
			},
			nextStep(){
				console.log('next step')
				console.log('title', this.title, this.imgs, this.videoUrl)
				if(this.title.length < 4) return uni.showToast({title:'请尽可能的简要的概述', icon:'none'})
				
				// if(this.imgs.length < 2) return uni.showToast({title:'至少上传一张图片', icon:'none'})
				
				this.editorCtx.getContents({
					success: (res) => {
						let { html, text } = res
						if(text.length < 6) return uni.showToast({title:'请详细的说明您要发布的内容', icon:'none'})
						
						if(text.length > 800) return uni.showToast({title:'内容超出字数限制', icon:'none'})
						
						uni.setStorageSync('H5_PUBLISH', 
							JSON.stringify({'data': JSON.stringify({title: this.title, content: html, image_url: this.imgs.substring(0, this.imgs.length-1), video_url: this.videoUrl})})
						)
						// console.log('h', uni.getStorageSync('H5_PUBLISH'))
						
						//跳转 H5 发布第二步
						window.location.href = 'https://www.zhuanjuan.net/h5/index.html#/pages/publish_next/index'
					}
				})
			}
		},
		onLoad() {
			uni.loadFontFace({
				family: 'Pacifico',
				source: 'url("https://sungd.github.io/Pacifico.ttf")'
			})
		},
	}
</script>

<style>
	@import "./editor-icon.css";

	@import "../../static/editor.css";
	
	.title {
		margin: 0 auto;
		margin-top: 1.5rem;
		width: 90vw;
		height: 2rem;
		font-size: 1.2rem;
		font-weight: 500;
		color: #A3A3A3;
		border: none;
	}
	
	.title:focus {
		outline: none;
	}
</style>
