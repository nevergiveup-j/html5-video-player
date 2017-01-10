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
    // 视频流地址
    stream: [],
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
    this._showControlBar();
    this.bind();
    this.readyBind();
    this._events();
  }

  /**
   * 渲染
   */
  vPlayer.prototype.render = function() {
    var clarityTpl = '';

    // 视频流
    if(this.opts.stream.length) {
      var stream = this.opts.stream,
        len = stream.length;

      clarityTpl = '<div class="vplay-clarity vplay-menu-button vplay-clarity-menu-button">';
      clarityTpl += '<div class="vplay-clarity-text">'+ stream[len - 1].name +'</div><div class="vplay-menu">';

      for(var i = 0; i < len; i++) {
        if(i >= len -1) {
          clarityTpl += '<a href="javascript:" class="active" data-index="'+ i +'">'+ stream[i].name +'</a>';
        }else{
          clarityTpl += '<a href="javascript:" data-index="'+ i +'">'+ stream[i].name +'</a>';
        }
      }

      clarityTpl += '</div></div>';
    }

    var controlTpl = [
      '<div class="vplay-control-bar">',
        '<div class="vplay-progress-control">',
          '<div class="vplay-progress-holder">',
            '<div class="vplay-load-progress"></div>',
            '<div class="vplay-play-progress"></div>',
            '<div class="vplay-mouse-display"><span></span></div>',
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
          clarityTpl,
        '</div>',        
      '</div>'
    ].join('')

    var posterTpl = [
      '<div class="vplay-poster"></div>'
    ].join('');


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

    // this.$wrap.hover(
    //   function() {
    //     self._showControlBar();
    //   },
    //   function() {
    //     self._hideControlBar();
    //   }
    // );
  }

  /**
   * 视频准备事件
   */
  vPlayer.prototype.readyBind = function() {
    var self = this;
    var moveTimer = null,
        offsetX = 0,
        $buttonPlay = $('.vplay-play-control'),
        $mouseDisplay = $('.vplay-mouse-display');

    // Play
    $buttonPlay.on('click', function() {
      self.togglePlay();
    });

    // 进度条
    this.$progress
      .on('mousemove', function(e) {
        offsetX = (e.offsetX === 0) ? offsetX : e.offsetX;

        var currentTime = self.transferProgressTime(offsetX),
          time = self.transferTime(currentTime);

        $mouseDisplay
          .css({
            left: offsetX
          })
          .html('<span>'+ time +'</span>');
      })
      .hover(
        function() {
          self.$wrap.addClass('vplay-mouse-hover');
        },
        function() {
          self.$wrap.removeClass('vplay-mouse-hover');
        }
      )
      .on('click', function(e) {
        var x = e.offsetX || offsetX,
            currentTime = self.transferProgressTime(x);  

        self.setCurrentTime(currentTime);
        self.uploadProgress(currentTime);  
      });

    // 全屏
    $('.vplay-fullscreen-control').on('click', function() {
      self.fullScreen();
    })

    // 清晰度
    $('.vplay-menu-button').on('click', function(e) {
      var $target = $(e.target);

      $(this).toggleClass('vplay-menu-button-hover');

      if($target.is('a')) {
        var index = $target.attr('data-index');

        if(!$target.hasClass('active')) {
          $(this).find('.vplay-menu a').removeClass('active');
          $target.addClass('active');
          $(this).find('.vplay-clarity-text').text($target.text());

          self.resetAddress(self.opts.stream[index].url);
        }
      }
    })
  }

  /**
   * 显示控制框
   */
  vPlayer.prototype._showControlBar = function() {
    clearTimeout(this.controlTimer);
    this.$wrap.addClass('vplay-has-started');
  }

  /**
   * 隐藏控制框
   */
  vPlayer.prototype._hideControlBar = function() {
    var self = this;

    this.controlTimer = setTimeout(function() {
      self.$wrap.removeClass('vplay-has-started');
    }, 3000);
  }

  /**
   * 更新进度条
   * @return {[type]} [description]
   */
  vPlayer.prototype.uploadProgress = function(time) {
    var per = time / this.durationTime * 100;

    time = this.transferTime(time);
    per = (per <= 1) ? 1 : per;

    this.$playProgress
      .css({
        width: per + '%'
      })
      .html('<span>'+ time +'</span>')
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
   * 视频加载
   */
  vPlayer.prototype.load = function() {
    this.video.load();      
  }

  /**
   * 全屏
   */
  vPlayer.prototype.fullScreen = function() {
    if(fullScreenApi.supportsFullScreen) {
      fullScreenApi.requestFullScreen(this.video);
    }
  }

  /**
   * 重置视频地址
   * @param  {string} url [视频地址]
   */
  vPlayer.prototype.resetAddress = function(url) {
    var $source = this.$video.find('source');

    this.pause();

    $source.attr('src', url);

    this.load();
    this.play();
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
   * @return {number} [时间]
   */
  vPlayer.prototype.getDuration = function() {
    return this.video.duration || 0;
  }

  /**
   * 获取缓冲进度
   * @return {number} [时间]
   */
  vPlayer.prototype.getBuffered = function() {
    return this.video.buffered.end(0);
  }

  /**
   * 是否正在播放
   * @return {boolean} [状态]
   */
  vPlayer.prototype.isPlaying = function() {
    return !this.video.paused && !this.video.ended;
  }

  /**
   * 转换进度时间
   * @param  {number}  x  [坐标]
   * @return {string}     [时间]
   */
  vPlayer.prototype.transferProgressTime = function(x) {
    var width = this.$progress.width(),
      per = x / width * 10,
      perTime = this.durationTime * 0.1,
      currentTime = perTime * per;

    return currentTime;
  }

  /**
   * 转换时间格式
   * @param  {number} second [时间秒]
   * @return {string}        [返回时间格式：00:00]
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


// FullScreen Api
(function() {
    var
        fullScreenApi = {
            supportsFullScreen: false,
            isFullScreen: function() { return false; },
            requestFullScreen: function() {},
            cancelFullScreen: function() {},
            fullScreenEventName: '',
            prefix: ''
        },
        browserPrefixes = 'webkit moz o ms khtml'.split(' ');
 
    // check for native support
    if (typeof document.cancelFullScreen != 'undefined') {
        fullScreenApi.supportsFullScreen = true;
    } else {
        // check for fullscreen support by vendor prefix
        for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
            fullScreenApi.prefix = browserPrefixes[i];
 
            if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
                fullScreenApi.supportsFullScreen = true;
 
                break;
            }
        }
    }
 
    // update methods to do something useful
    if (fullScreenApi.supportsFullScreen) {
        fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
 
        fullScreenApi.isFullScreen = function() {
            switch (this.prefix) {
                case '':
                    return document.fullScreen;
                case 'webkit':
                    return document.webkitIsFullScreen;
                default:
                    return document[this.prefix + 'FullScreen'];
            }
        }
        fullScreenApi.requestFullScreen = function(el) {
            return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
        }
        fullScreenApi.cancelFullScreen = function(el) {
            return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
        }
    }
 
    // export api
    window.fullScreenApi = fullScreenApi;
})();