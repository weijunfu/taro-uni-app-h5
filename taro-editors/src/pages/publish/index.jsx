import Nerv, {  Component } from 'nervjs'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View } from '@tarojs/components'

export default class Index extends Component {
  
  constructor(props){
    super(props)
  }

  state = {
  }

  componentWillMount (){
    // 跳转至uni-app 富文本编辑器页面
    window.location.href=''
  }

  componentDidMount(){}

  render () {
    return (
      <View scrollY className='page'>

      </View>
    )
  }
}
