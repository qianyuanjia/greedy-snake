let snake=[
  {
    coordsX:140,
    coordsY:200,
    color:'#000',
    width:12,
    height:12
  }
]
let touchPoint={
  fstPoint:{
    coordsX:0,
    coordsY:0
  },
  secPoint:{
    coordsX: 0,
    coordsY: 0
  },
  diffX:0,
  diffY:0
}
let direction='right'
let frameNum = 0
let ctx = wx.createCanvasContext('game', this) 
let food=[]
let bodycolor='#00f'
let windowWidth=0
let windowHeight=0
let start=true
let id=0
let requestAnimationFrame = (function () {
  return requestAnimationFrame ||
    function (callback) {
      setTimeout(callback, 1000 / 60);
    };
})();
let cancelAnimationFrame = (function () {
  return cancelAnimationFrame || clearTimeout
})();

Page({ 
  onReady:function(){
    wx.showModal({
      title: '提示',
      content: '长按可重新开始游戏，退出点右上角',
      success:(res)=>{
        if(res.confirm){
          wx.getSystemInfo({
            success: (res) => {
              windowWidth = res.windowWidth
              windowHeight = res.windowHeight
              for (let i = 0; i < 30; i++) {
                food.push({
                  coordsX: this.getRand(0, windowWidth),
                  coordsY: this.getRand(0, windowHeight),
                  width: 12,
                  height: 12,
                  color: `rgba(${this.getRand(0, 255)},${this.getRand(0, 255)},${this.getRand(0, 255)},${Math.random()})`
                })
              }
              this.initGame()
            }
          })
        }else{
          wx.showToast({
            title: '点击右上角可退出游戏，长按可重新开始',
            icon:'none'
          })
        }
      }
    })
    
    
    
  },
  initGame:function(){
    //初始化
    this.drawStuff(snake)
    this.drawStuff(food)
    ctx.draw()
    //贪吃蛇移动
    if (start) {
      this.snakeMove()
    }
  },
  getRand:function(min,max){
    return parseInt(Math.random()*(max-min))+min
  },
  drawStuff:function(stuff){
    for (let item of stuff){
      this.drawReact(item)
    }
  },
  //获取方块边界
  getBorder:function(item){
    return {
      T:item.coordsY,
      B:item.coordsY + item.height,
      L:item.coordsX,
      R:item.coordsX + item.width
    }
  },
  restart:function(){
    this.failInit()
  },
  //失败处理
  failFn:function(content){
    start = false
    wx.showModal({
      title: 'Fuck',
      content: content,
      success: (res)=> {
        if (res.confirm) {       
          this.failInit()
        } else if (res.cancel) {
          wx.showToast({
            title: '点击右上角可退出游戏，长按可重新开始',
            icon: 'none'
          })
        }
      }
    })
  },
  //失败初始化
  failInit:function(){
    wx.navigateTo({
      url: '../index/index',
      success: () => {
        snake = [
          {
            coordsX: 140,
            coordsY: 200,
            color: '#000',
            width: 12,
            height: 12
          }
        ]
        direction = 'right'
        food = []
        start = true
      }
    })
  },
  //碰撞检测
  detectTouch:function(_this){
    let snakeHeadBorder=_this.getBorder(snake[0])
    if(snake[0].coordsX<0 || snake[0].coordsX>windowWidth-snake[0].width || snake[0].coordsY<0 || snake[0].coordsY>windowHeight-snake[0].height){
      _this.failFn('You Knock The Wall !')
    }
    for(let item of snake.slice(1)){
      let snakeBodyBorder=_this.getBorder(item)
      if (snakeHeadBorder.B > snakeBodyBorder.T && snakeHeadBorder.T < snakeBodyBorder.B && snakeHeadBorder.R > snakeBodyBorder.L && snakeHeadBorder.L < snakeBodyBorder.R){
        _this.failFn('You Eat Yourself !') 
      }
    }
    for(let item of food){
      let foodBorder = _this.getBorder(item)
      if (snakeHeadBorder.B > foodBorder.T && snakeHeadBorder.T < foodBorder.B && snakeHeadBorder.R > foodBorder.L && snakeHeadBorder.L < foodBorder.R){
        bodycolor = item.color
        item.coordsX = _this.getRand(0, windowWidth)
        item.coordsY=_this.getRand(0,windowHeight)
        item.color = `rgba(${_this.getRand(0, 255)},${_this.getRand(0, 255)},${_this.getRand(0, 255)},${Math.random()})`
        snake.push({
          coordsX: snake[0].coordsX,
          coordsY: snake[0].coordsY,
          color: bodycolor,
          width: 12,
          height: 12
        })
        _this.drawStuff(snake)
        _this.drawStuff(food)
        ctx.draw()
      }
    }
  },
  snakeMove:function(){
    if (frameNum % 20 == 0 && start) {
      let _this = this
      snake.push({
        coordsX: snake[0].coordsX,
        coordsY: snake[0].coordsY,
        color: bodycolor,
        width: 12,
        height: 12
      })
      if (snake.length > 5) {
        snake.splice(1, 1)
      }
  
      this.changeHeadCoords()
      this.drawStuff(snake)
      this.drawStuff(food)
      ctx.draw()   
      this.detectTouch(_this)
    }
    if(start){
      cancelAnimationFrame(id)
      frameNum++
      id=requestAnimationFrame(this.snakeMove)
    }
  },
  
  changeHeadCoords:function(){
    switch (direction) {
      case 'right':
        snake[0].coordsX += snake[0].width; break;
      case 'left':
        snake[0].coordsX -= snake[0].width; break;
      case 'top':
        snake[0].coordsY -= snake[0].height; break;
      case 'bottom':
        snake[0].coordsY += snake[0].height; break;
    }
  },
  drawReact:function (snakePart){
    ctx.setFillStyle(snakePart.color)
    ctx.fillRect(snakePart.coordsX, snakePart.coordsY, snakePart.width, snakePart.height)
  },
  touchstart:function(ev){
    touchPoint.fstPoint.coordsX=ev.touches[0].x
    touchPoint.fstPoint.coordsY=ev.touches[0].y
  },
  touchmove:function(ev){
    touchPoint.secPoint.coordsX=ev.touches[0].x
    touchPoint.secPoint.coordsY=ev.touches[0].y
  },
  touchend:function(){
    touchPoint.diffX=touchPoint.fstPoint.coordsX-touchPoint.secPoint.coordsX
    touchPoint.diffY = touchPoint.fstPoint.coordsY - touchPoint.secPoint.coordsY
    if(Math.abs(touchPoint.diffX)>Math.abs(touchPoint.diffY)){
      if(touchPoint.diffX<0){
        direction='right'
      }else{
        direction='left'
      }
    }else{
      if (touchPoint.diffY > 0) {
        direction = 'top'
      } else {
        direction = 'bottom'
      }
    }
  }
})