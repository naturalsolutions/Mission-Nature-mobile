(function($) {

  $.fn.nsFabDial = function(methodOrOptions) {

    var self = this;

    self.each(function() {
      var $me = $(this);
      $me.on('show.bs.dropdown', function(e) {
        setTimeout(function() {
          $me.addClass('open-animate');
        });
      });
      $me.on('hide.bs.dropdown', function(e) {
        setTimeout(function() {
          $me.removeClass('open-animate');
        });
      });
    });

    return self;
  };

})(jQuery);
