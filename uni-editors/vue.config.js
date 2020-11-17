module.exports = {
  publicPath: './',
  devServer: {
    proxy: {
      '/upload': {
        target: 'https://www.zhuanjuan.net',
        ws: true,
        changeOrigin: true,
		}
	 }
}
}