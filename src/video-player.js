/**
 * @Description: HTML5 Video Player
 * @Author: wangjun
 * @Update: 2017-01-05 12:00
 * @version: 1.3
 * @Github URL: https://github.com/nevergiveup-j/html5-video-player
 */
;(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD模式
    define([ "jQuery" ], factory);
  } else {
    // 全局模式
    factory(jQuery);
  }
}(function ($) {

  var defaults = {
    // 播放器宽度
    width: 720,
    // 播放器高度
    height: 480,
    // 在视频播放之前所显示的图片的 URL
    autoplay: true,
    poster: '',
    controlBar: {},
    // 浏览器不支持video标签时的提示，可使用html标签
    notsuportmsg:"您的浏览器不支持html5，无法使用该插件！"   
  }

  function vPlayer(video, options) {
    var self = this;

    this.$video = $(video);
    this.video = this.$video[0];
    this.opts = $.extend(true, {}, defaults, options || {});

    this.init();
  }

  /**
   * 初始化
   */
  vPlayer.prototype.init = function() {
    var self = this;

    this.controlTimer = null;
    // 总时间长
    this.durationTime = 0;

    this.render();
    this.showControlBar();
    this.bind();
    this.readyBind();
    this._events();
  }

  /**
   * 渲染
   */
  vPlayer.prototype.render = function() {

    var controlTpl = [
      '<div class="vplay-control-bar">',
        '<div class="vplay-progress-control">',
          '<div class="vplay-progress-holder">',
            '<div class="vplay-load-progress"></div>',
            '<div class="vplay-play-progress"></div>',
            '<div class="vplay-mouse-display"><span>3:06</span></div>',
          '</div>',
        '</div>',
        '<div class="vplay-control-fn">',
          '<div class="vplay-button vplay-play-control vplay-button-paused">',
            '<span></span>',
          '</div>',
          '<div class="vplay-current-time">00:00</div>',
          '<div class="vplay-remaining-time">/<span class="vplay-duration-time">00:00</span></div>',
          '<div class="vplay-volume-menu-button">',
            '<span></span>',
          '</div>',
          '<div class="vplay-button vplay-fullscreen-control">',
            '<span></span>',
          '</div>',
        '</div>',        
      '</div>'
    ].join('')

    var posterTpl = [
      '<div class="vplay-poster"></div>'
    ].join('')


    this.$video.wrap('<div class="vplay-wrap" id="J_vplayWrap" />');

    this.$wrap = $('#J_vplayWrap');

    this.$wrap.append(controlTpl);

    this.$progress = $('.vplay-progress-control');
    this.$playProgress = $('.vplay-play-progress');
  }

  /**
   * 事件
   */
  vPlayer.prototype.bind = function() {
    var self = this;

    this.$wrap.hover(
      function() {
        self.showControlBar();
      },
      function() {
        self.hideControlBar();
      }
    );
  }

  /**
   * 视频准备事件
   */
  vPlayer.prototype.readyBind = function() {
    var self = this;

    console.log('ready');

    // Play按钮
    $('.vplay-play-control').on('click', function() {
      self.togglePlay();
    });

    this.$progress.on('click', function(e) {
      var width = $(this).width(),
        per = e.offsetX / width * 10,
        perTime = self.durationTime * 0.1,
        currentTime = perTime * per;

      self.setCurrentTime(currentTime);
      self.uploadProgress(currentTime);  
    });
  }

  /**
   * 显示控制框
   */
  vPlayer.prototype.showControlBar = function() {
    clearTimeout(this.controlTimer);
    this.$wrap.addClass('vplay-has-started');
  }

  /**
   * 隐藏控制框
   */
  vPlayer.prototype.hideControlBar = function() {
    var self = this;

    this.controlTimer = setTimeout(function() {
      self.$wrap.removeClass('vplay-has-started');
    }, 3000);
  }

  /**
   * 开关播放
   * @return {[type]} [description]
   */
  vPlayer.prototype.togglePlay = function() {
    if(this.isPlaying()) {
      this.pause();
    }else{
      this.play();
    }
  }

  /**
   * 更新进度条
   * @return {[type]} [description]
   */
  vPlayer.prototype.uploadProgress = function(time) {
    var per = time / this.durationTime * 100;

    per = (per <= 1) ? 1 : per;

    this.$playProgress.css({
      width: per + '%'
    })
  }

  /**
   * 播放事件
   */
  vPlayer.prototype._events = function() {
    var self = this;
    var event = [
      'ready',
      'play',
      'pause',
      'loadedmetadata',
      'timeupdate'
    ]

    $.each(event, function(index, key) {
      self.$video.on(key, function() {
        switch(key) {
          case 'ready':
            break;
          // 播放  
          case 'play':
            $('.vplay-play-control')
              .removeClass('vplay-button-play')
              .addClass('vplay-button-paused');
            break;
          // 暂时  
          case 'pause':
            $('.vplay-play-control')
              .removeClass('vplay-button-paused')
              .addClass('vplay-button-play');
            break;  
          // 视频总时间  
          case 'loadedmetadata':
            self.durationTime = self.getDuration();
            var time = self.transferTime(self.durationTime);

            $('.vplay-duration-time').text(time);
            break;
          // 当前播放时间  
          case 'timeupdate':
            var currentTime = self.getCurrentTime();
            var time = self.transferTime(currentTime);

            $('.vplay-current-time').text(time);
            self.uploadProgress(currentTime);
            break;  
          default:
            break;
        }
      })
    })
  }

  /**
   * 播放事件
   */
  vPlayer.prototype.play = function() {
    this.video.play();
  }

  /**
   * 暂停事件
   */
  vPlayer.prototype.pause = function() {
    this.video.pause();      
  }

  /**
   * 设置当前时间
   */
  vPlayer.prototype.setCurrentTime = function(time) {
    this.video.currentTime = time;
  }

  /**
   * 获取视频当前时间
   * @return {[number]} [时间]
   */
  vPlayer.prototype.getCurrentTime = function() {
    return this.video.currentTime || 0;
  }

  /**
   * 获取视频总播放时间
   * @return {[number]} [时间]
   */
  vPlayer.prototype.getDuration = function() {
    return this.video.duration || 0;
  }

  /**
   * 获取缓冲进度
   * @return {[number]} [时间]
   */
  vPlayer.prototype.getBuffered = function() {
    return this.video.buffered.end(0);
  }

  /**
   * 是否正在播放
   * @return {[boolean]} [状态]
   */
  vPlayer.prototype.isPlaying = function() {
    return !this.video.paused && !this.video.ended;
  }

  /**
   * 转换时间
   */
  vPlayer.prototype.transferTime = function(second) {
    //秒数转换
    var time = second.toFixed(1),
      minutes = Math.floor((time / 60) % 60),
      seconds = Math.floor(time % 60);

    if(seconds < 10) {
      seconds = '0' + seconds;
    }

    return minutes + ':' + seconds;
  }

  window.vPlayer = vPlayer;

  return vPlayer;
})); 