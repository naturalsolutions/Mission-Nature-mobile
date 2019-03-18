var $ = require('jquery');

$.fn.nsDonutChart = function(methodOrOptions) {
  var $_this = this;

  var Api = function($el, options) {
    var self = this;
    self.$el = $el;

    self.context = {
      value: 0,
      angle: 0,
      rightAngle: 0,
      leftAngle: 0
      /*capEndPoint: {
          x: 0,
          y: 0
      }*/
    };

    self.settings = {
      orientation: 0,
      value: 0
    };

    self.__construct = function(options) {
      if (self.$el.data('donutchart-value') !== undefined)
          self.settings.value = self.$el.data('donutchart-value');
      self.settings = $.extend(self.settings, options);
      var tpl = '<div class="inner">';
      tpl += '<div class="circle-bg border"></div>';
      tpl += '<div class="circle-clipper circle-clipper-left"><div class="circle border"></div></div>';
      tpl += '<div class="gap-patch"><div class="circle"></div></div>';
      tpl += '<div class="circle-clipper circle-clipper-right"><div class="circle border"></div></div>';
      tpl += '<div class="cap-outer cap-start border"><div class="cap"></div></div>';
      tpl += '<div class="cap-outer cap-end border"><div class="cap"></div></div>';
      tpl += '</div>';

      self.$el.html(tpl);
      self.$el.addClass('donutchart');
      self.$el.children('.inner').css('transform', 'rotate(' + (self.settings.orientation) + 'deg)');

      self.$circleLeft = self.$el.find('.circle-clipper-left .circle');
      self.$circleRight = self.$el.find('.circle-clipper-right .circle');
      /*self.$capEnd = self.$el.find('.cap-end');*/
      self.$capOuterEnd = self.$el.find('.cap-end');

      setTimeout(function() {
        self.setValue(self.settings.value);
        if (self.settings.onCreate)
            self.settings.onCreate(self);
      });
    };

    self.setValue = function(value) {
      self.context.value = value;
      self.context.angle = 360 * value;

      var rightValue = Math.min(0.5, value);
      self.context.rightAngle = -135 + 360 * rightValue;

      var leftValue = Math.max(0, value - 0.5);
      self.context.leftAngle = 135 + 360 * leftValue;

      self.draw();
    };

    self.draw = function() {
      self.$circleRight.css('transform', 'rotate(' + self.context.rightAngle + 'deg)');
      self.$circleLeft.css('transform', 'rotate(' + self.context.leftAngle + 'deg)');
      self.$capOuterEnd.css('transform', 'rotate(' + self.context.angle + 'deg)');

      /*var borderWidth = parseInt(self.$circleLeft.css('border-width'));
      console.log(self.$el.width());
      var r = self.$el.width()/2;
      var center = r;
      r -= borderWidth/2;
      var point = self.context.capEndPoint = _.getPointOnCircle(360*self.context.value-90, r, center, center);

      self.$capEnd.css({
          left: point.x,
          top: point.y
      });*/

      self.$el.alterClass('status-*', 'status-' + (!self.context.value ? 'empty' : (self.context.value == 1 ? 'full' : 'running')));
    };

    self.destroy = function() {
      self.$el.data('nsDonutChart', null);
    };

    self.__construct(options);
  };

  $_this.each(function() {
    var $el = $(this);
    var api = $el.data('nsDonutChart');
    if (!api) {
      api = new Api($el, methodOrOptions);
      $el.data('nsDonutChart', api);
    }
  });

  return $_this;
};
