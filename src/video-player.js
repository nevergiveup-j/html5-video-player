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

    this.control_time = null;

    this.render();
    this.bind();
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
            '<div class="vplay-play-progress" style="width: 40%;"></div>',
          '</div>',
        '</div>',
        '<div class="vplay-control-fn">',
          '<div class="vplay-button vplay-play-control vplay-button-paused">',
            '<span></span>',
          '</div>',
          '<div class="vplay-current-time">02:11</div>',
          '<div class="vplay-remaining-time">/10:11</div>',
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
    )
  }

  /**
   * 显示控制框
   */
  vPlayer.prototype.showControlBar = function() {
    clearTimeout(this.control_time);
    this.$wrap.addClass('vplay-has-started');
  }

  /**
   * 隐藏控制框
   */
  vPlayer.prototype.hideControlBar = function() {
    var self = this;

    this.control_time = setTimeout(function() {
      self.$wrap.removeClass('vplay-has-started');
    }, 5000);
  }

  /**
   * 播放事件
   */
  vPlayer.prototype.events = function() {
    var event = [
      'ready',
      'play',
      'pause'
    ]
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

  window.vPlayer = vPlayer;

  return vPlayer;
})); 