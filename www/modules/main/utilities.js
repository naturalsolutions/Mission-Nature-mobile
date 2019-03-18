'use strict';

module.exports = {
  checkConnection: function() {
    if (navigator.connection) {
      var networkState = navigator.connection.type;
      var states = {};
      states[window.Connection.UNKNOWN] = 'Unknown connection';
      states[window.Connection.ETHERNET] = 'Ethernet connection';
      states[window.Connection.WIFI] = 'WiFi connection';
      states[window.Connection.CELL_2G] = 'Cell 2G connection';
      states[window.Connection.CELL_3G] = 'Cell 3G connection';
      states[window.Connection.CELL_4G] = 'Cell 4G connection';
      states[window.Connection.CELL] = 'Cell generic connection';
      states[window.Connection.NONE] = 'No network connection';
      return states[networkState];
    } else {
      return navigator.onLine;
    }
  }
};
