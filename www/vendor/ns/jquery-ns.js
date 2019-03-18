(function($) {

  $.fn.alterClass = function(removals, additions) {

    var self = this;

    if (removals.indexOf('*') === -1) {
      // Use native jQuery methods if there is no wildcard matching
      self.removeClass(removals);
      return !additions ? self : self.addClass(additions);
    }

    removals = removals.split(' ');
    for (var i = 0; i < removals.length; i++) {
      removals[i] = new RegExp(removals[i].replace(/\*/g, '[A-Za-z0-9-_]+'), 'g');
    };

    self.each(function() {
      var $me = $(this);
      var classNames = $me.attr('class') || '';
      classNames = classNames.split(/ +/g);
      for (var i = 0; i < classNames.length; i++) {
        for (var j = 0; j < removals.length; j++) {
          if (classNames[i].match(removals[j])) {
            classNames[i] = '';
          };
        };
      };
      $me.attr('class', classNames.join(' '));
    });

    return !additions ? self : self.addClass(additions);
  };

  $.fn.inAppLink = function(methodOrOptions) {

    var self = this;

    self.each(function() {
      var $me = $(this);
      $me.click(function() {
        var _methodOrOptions = methodOrOptions || {};
        if (device && device != 'browser') {
          var url = (_methodOrOptions.url || $me.data('link-url')) || $me.attr('href');
          var target = (_methodOrOptions.target || $me.data('link-target')) || $me.attr('target');
          var options = (_methodOrOptions.options || $me.data('link-options')) || undefined;
          window.open(url, target, options);
          return false;
        };
      });
    });

    return self;
  };

  $.fn.nsNoPaste = function(methodOrOptions) {

    var self = this;

    self.each(function() {
      var $me = $(this);
      $me.on('paste', function(e) {
        e.preventDefault();
      });
    });

    return self;
  };

})(jQuery);

(function($) {
  $.fn.selectPlaceholder = function(methodOrOptions) {
    methodOrOptions = methodOrOptions || {};
    $(this)
            .each(function() {
              new SelectWithPlaceholder(this, methodOrOptions);
            });
  };

  var SelectWithPlaceholder = function(selectElement, methodOrOptions) {
    var select = $(selectElement);
    if ( select.data('selectPlaceholderApi') )
      return false;
    select.data('selectPlaceholderApi', this);
    var placeholderValue = methodOrOptions.placeholderValue || '',
        originalColor = select.css('color'),
        placeholderText = select.attr('placeholder'),
        placeholderOptionBuilder = new PlaceholderOptionBuilder(placeholderValue),
        lastSelectedValue;
    
    select.bind('change', itemChanged).end();

    var option = placeholderOptionBuilder.build(placeholderText);
    select.prepend(option);

    if ( !select.attr('selectedvalue') && !select.children('option[selected="selected"]').length )
        option.attr('selected', true);

    function itemChanged() {
      if (select.val() !== placeholderValue) {
        lastSelectedValue = select.val();
        lookLikeOptionSelected();
      } else {
        select.val(lastSelectedValue);
      }
    }

    function lookLikeOptionSelected() {
      select.find('option[value="' + placeholderValue + '"]');
    }
  };

  var PlaceholderOptionBuilder = function(placeholderValue) {
    this.build = function(placeholderText) {
      var option =
                $('<option>')
              .val(placeholderValue)
              .text(placeholderText)
              ;
      lastSelectedValue = option.val();
      return option;
    };
  };
})(jQuery);
