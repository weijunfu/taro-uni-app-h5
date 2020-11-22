import Nerv, {  Component } from 'nervjs'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Text, Input, Editor,RichText , Swiper, SwiperItem, Button, ScrollView, Video, Textarea, Image } from '@tarojs/components'

import classNames from 'classnames'

import { showToast } from '../../utils/taro'
import { isWechat } from '../../utils/tools'
import { getArticleDetail, getRedAndArticleDetail, isUserGetRed, getShareDataForH5, H5_URL  } from '../../utils/network'

if(process.env.TARO_ENV === 'weapp') {
  require('./index.css')
} else {
  require('./index.h5.css')
}

export default class Index extends Component {

  constructor(props){
    super(props)
  }

  state = {
    id: 0,
    time: 5,
    timeInfo:'',
    article: null,
    imgs:[],
    closeIcon: 'https://img.zhuanjuan.net//app/imgs/x.png',
    isShow: false,
    redOpened: false,
    redClosedIcon: 'https://img.zhuanjuan.net//app/imgs/0red.png',
    redClosedFont: 'https://img.zhuanjuan.net//app/imgs/0red2.png',
    redClosedTitle: '抢多少得多少',
    redOpenedIcon: 'https://img.zhuanjuan.net//app/imgs/box_red_s.png',
    redOpenedTitle: '恭喜您抢到',
    redOpenedLabel: '阅读文章后，自动存入您的账户',
    closedIcon: '',
    openedIcon:'',
    curtainTitle:'',
    isChange: false,
    isSuccess: 0,
    info:'',
    videoUrl:'',
    isPromisedShow: false,  //是否允许抢红包
    isShowShareForH5: false,  //是否显示分享 --- H5
    curURL: window.location.href, //当前地址
  }

  async componentWillMount () {
    let { id } = getCurrentInstance().router.params

    // if(!id) showToast('无效数据')

    Taro.showLoading(({title:'加载中...'}))

    let res = await getArticleDetail(id)
    console.log(1, '文章', res)
    
    if(res.data.code !== 200) {
      showToast('获取数据失败, 3s后返回')

      setTimeout(()=>{
        Taro.navigateBack({
          delta:1
        })
      }, 3000)
    }

    let article = res.data.data

    this.setState({
      id: id || 0,
      article,
      videoUrl: article.video_url || '',
      imgs: article.image_urls?article.image_urls.split(','):''
    }, async ()=>{
      this.wechatShareHandle(article)
    })

    let resp = await isUserGetRed(id)
      console.log('是否抢红包', resp, resp.data.code === 200, resp.data.data === 1)
      if(resp.data.code === 200) {
        let flag = true
        if(resp.data.data === 1) {
          flag = false
        }

        if(flag) this.timeHandle()
        
        this.setState({
          isShow: flag
        })
      }
      Taro.hideLoading()

      // this.video = Taro.createVideoContext('myVideo', this)

  }

  timeHandle(){
    let { time } = this.state

    let timer = null,
        _this = this
    
    setTimeout(function opt(){
      let { isShow } = _this.state

      if(time > 0) {
        _this.setState({
          time,
          timeInfo: time + 's'
        })
      } else {
        _this.setState({
          isPromisedShow: isShow,
          time:0,
          timeInfo: ''
        }, ()=> clearTimeout(timer))
      }

      --time
      timer = setTimeout(opt, 1000)

    }, 1000)

  }
  
  componentDidMount () {}

  componentWillUnmount () { }

  async componentDidShow () { 
    this.video && this.video.play()

  }

  componentDidHide () { 
    this.video && this.video.stop()
  }

  async wechatShareHandle(article) {
    let env = process.env.TARO_ENV
    console.log('分享', env)

    if(env === 'h5') {//H5 
      let curURL = window.location.href,
          mainURL = curURL.split('#')[0]
      console.log(H5_URL)
      console.log(curURL)
      console.log(mainURL)

      let wxParamsRes = await getShareDataForH5(mainURL),
          wxParamsObj = wxParamsRes.data
      console.log(wxParamsRes)

      if(wxParamsObj.code === 200) {
        let { appId, noncestr, signature, timestamp } = wxParamsObj.data

        let wxConfigParams = {
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: appId, // 必填，公众号的唯一标识
          timestamp: timestamp, // 必填，生成签名的时间戳
          nonceStr: noncestr, // 必填，生成签名的随机串
          signature: signature,// 必填，签名
          jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'] // 必填，需要使用的JS接口列表
        }
        console.log(wxConfigParams)

        wx.config(wxConfigParams);

        wx.ready(function(){
          // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
          let title = article.title,
              desc = '来自《纯粹的转捐社区》',
              link = window.location.href,
              imgUrl = article.share_info.image_url

          let options = {
            title, // 分享标题
            desc, // 分享描述
            link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl,
            success: (res)=>{
              console.log('wechat setting: success', res)
            },
            fail: (res)=>{
              console.log('wechat setting: fail', res)
            },
            cancel: (res)=>{
              console.log('wechat setting: cancel', res)
            }
          }

          console.log('分享配置信息', options)

          // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容
          wx.updateAppMessageShareData(options)

          // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容
          wx.updateTimelineShareData(options)
        
          // 获取“分享到朋友圈”按钮点击状态及自定义分享内容接口（即将废弃）
          // wx.onMenuShareTimeline(options)

          // 获取“分享给朋友”按钮点击状态及自定义分享内容接口（即将废弃）
          // wx.onMenuShareAppMessage(options)

        }); 

        wx.error(function(res){
          // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
          
          console.log('error', res)
        });
      } else {
        showToast(wxParamsObj.message)
      }
    }
  }
  
  onShareAppMessage(){
    let { article } = this.state
    return {
      title:article.share_info.title,
      imageUrl: article.share_info.image_url || '',
      path:'/pages/publish_detail_red/index?id=' + article.article_id
    }
  }

  // 关闭幕帘
  closeCurtain() {

    let { time } = this.state
    if(time !== 0) return

    this.setState({
      isShow: false,
      isPromisedShow: false
    })
  }

  async getRed() {
    console.log('get red')
    let { time, id } = this.state
    if(time !== 0) return


    this.setState({
      redOpened: true
    })

    let res = await getRedAndArticleDetail(id) 
    console.log(1, '红包详情', res)
    if(res.data.code === 200) {
      this.setState({
        isChange: true,
        isSuccess: res.data.data.isget_red === 1,
        info: parseFloat(res.data.data.red_money/100).toFixed(2)+'元'
      })
    } else {
      this.setState({
        isChange: true,
        info: '就差一点点哟'
      })
    }

  }

  goback(){
    Taro.navigateBack({
      delta:1
    })
  }

  // H5 分享
  toShare = async ()=> {
    let env = process.env.TARO_ENV
    console.log('分享', env)

    if(env === 'h5') {//H5 

      // 是否是使用微信内置浏览器
      let isWeChatRes = await isWechat()
      console.log('微信内置浏览器', isWeChatRes.result)

      if(isWeChatRes.result === true) {
        Taro.showToast({title:'请点击右上角...按钮进行分享', duration:5000, icon:'none'})
      } else {
        this.setState({
          isShowShareForH5: true
        }, async ()=>{
          await this.cliCode()
        })
      }
    }
  }

  // 关闭分享界面
  closeShare = () => {
    this.setState({
      isShowShareForH5: false
    })
  }

  render () {
    return (
      <View className='page'>
        {/* 幕帘 */}
        <View className={classNames('curtain', {hidden: !this.state.isPromisedShow})} >
          <View className={classNames('curtain-box', {'hidden': this.state.isChange})}>

            {/* 红包背景图 */}
            <Image className='red-icon' src={this.state.redClosedIcon} />

            <View className='red-content' onClick={this.getRed.bind(this)}>
              <View className='content-title'>{this.state.redClosedTitle}</View>

              {/* 红包字 */}
              <Image className={classNames('red-icon-font', {'ani-rotateY':this.state.redOpened})} src={this.state.redClosedFont}></Image>


              <View className='curtain-article-title center'>{this.state.article?this.state.article.title:''}</View>
            </View>
            
          </View>
          
          {/* 打开 */}
          <View className={classNames('curtain-open-box', {'hidden': !this.state.isChange})}>
            <Image className='curtain-open-icon' src={this.state.redOpenedIcon}></Image>
            <View className='curtain-open-content'>
              <View className={classNames('curtain-open-title', {'hidden2': !this.state.isSuccess})}>{this.state.redOpenedTitle}</View>
              <View className={classNames('curtain-open-money', {'font-size30':!this.state.isSuccess})}>{this.state.info}</View>
              <View className='curtain-open-detail'>{this.state.redOpenedLabel}</View>
            </View>
          </View>

          <Image src={this.state.closeIcon} className='close-icon' onClick={this.closeCurtain.bind(this)}></Image>
        </View>

        <View className='content'>
        <View className='article-title'>{this.state.article?this.state.article.title:''}</View>

        {
            this.state.videoUrl.length>10 && !this.state.isPromisedShow?(
              <View className='video-box'>
                <Video
                    className={classNames('article-video')} 
                    autoplay={true}
                    loop={true}
                    showProgress={true}
                    controls={true}
                    muted={true}
                    showMuteBtn={true}
                    title={this.state.article?this.state.article.title:''}
                    src={this.state.videoUrl}   style='height:320px;' ></Video>
              </View>
            ):null
          }
  
        <RichText className='article-content' nodes={this.state.article?this.state.article.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto" '):''}>

        </RichText>

        <View className='article-bottom'>
          <Button className='article-share-btn center' plain  type='default' openType='share' onClick={this.toShare.bind(this)}>分享</Button>
          <View className='article-time center'>{this.state.timeInfo}</View>
          <Button className='article-project-detail center' plain={false} type={this.state.time === 0?'primary':'default'} disabled={this.state.time !== 0} onClick={this.goback.bind(this)}>关闭</Button>
        </View> 
        </View>

        {/* 分享 */}
        {
          this.state.isShowShareForH5 === true ? (
            <View className='h5-share-wrapper'>
              <View className='h5-share-title-wrapper'>
                <View className='h5-share-title'>分享</View>
                <View className='h5-share-subtitle'>长按复制，分享给好友</View>
                <Image className='h5-share-close' src='https://img.zhuanjuan.net//app/imgs/x.png' onClick={this.closeShare.bind(this)} ></Image>
              </View>
              <View className='h5-share-content-wrapper' id="copyCode" data-clipboard-action='copy'>
                {this.state.curURL}
              </View>
            </View>
          ) : null
        }
      </View>
    )
  }
}
