import Nerv, { Component } from 'nervjs'

if(process.env.TARO_ENV==='weapp') {
  require('./app.css')
} else {
  require('./app.h5.css')
}

class App extends Component {

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App
