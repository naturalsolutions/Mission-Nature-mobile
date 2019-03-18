'use strict';
var console = console || {log: function() {}};

_.mixin({
  log10: function(value) {
    return Math.log(value) / Math.LN10;
  }
});

_.mixin({
  binarySearchIndex: function(values, target, start, end, comparatorCallback) {
    if ( start > end )
      return -1;//does not exist

    var middle = Math.floor((start + end) / 2);
    var value = values[middle];
    var comparator;
    if ( comparatorCallback )
      comparator = comparatorCallback(value, target);
    else
      comparator = value > target ? 1 : -1;

    if ( comparator > 0 )
      return _.binarySearchIndex(values, target, start, middle-1, comparatorCallback);
    if ( comparator < 0 )
      return _.binarySearchIndex(values, target, middle+1, end, comparatorCallback);
    return middle; //found!
  }
});

_.mixin({
  clamp: function(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
});

_.mixin({
  upperFirst: function(str) {
    return _.capitalize(str);
  }
});

_.mixin({
  getDistanceFromLatLon: function(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = _.deg2rad(lat2 - lat1); // deg2rad below
    var dLon = _.deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(_.deg2rad(lat1)) * Math.cos(_.deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return c;
  }
});

_.mixin({
  getDistanceFromLatLonInKm: function(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var c = _.getDistanceFromLatLon(lat1, lon1, lat2, lon2);
    var d = R * c; // Distance in km
    return d;
  }
});

_.mixin({
  getPointOnCircle: function(angle, radius, centerX, centerY) {
    var angle = _.deg2rad(angle);
    return {
      x: radius * Math.cos(angle) + centerX,
      y: radius * Math.sin(angle) + centerY
    };
  }
});

_.mixin({
  deg2rad: function(deg) {
    return deg * (Math.PI / 180);
  }
});

_.mixin({trim: function(input) {
  if (!input)
      return '';
  if (_.isString(input))
      return input.replace(/^\s+|\s+$/g, '');
  else if (_.isArray(input))
        return _.map(input, function(str) {
          return str.replace(/^\s+|\s+$/g, '');
        });
  return '';
}});

_.mixin({toTitleCase: function(str) {
  if (!str)
      return '';
  return str.replace(/([^\W_]+[^\s-]*) */g, function(txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}});

_.mixin({pushAt: function(source, index, values) {
  if (typeof values !== 'array')
      values = [values];
  var args = [index, 0].concat(values);
  return Array.prototype.splice.apply(source, args);
}});

_.mixin({fileExtension: function(str, keepDot) {
  if (!str)
      return '';
  var split = str.split('.');
  if (split.length < 2)
      return '';
  return (keepDot ? '.' : '') + split.pop();
}});

_.mixin({unserialize: function(params) {
  var digitTest = /^\d+$/,
      keyBreaker = /([^\[\]]+)|(\[\])/g,
      plus = /\+/g,
      paramTest = /([^?#]*)(#.*)?$/;

  if (!params || !paramTest.test(params))
      return {};

  var data = {},
    pairs = params.split('&'),
    lastPart,
    current;

  for (var i = 0; i < pairs.length; i++) {
    current = data;
    var pair = pairs[i].split('=');

    if (pair.length != 2)
        pair = [pair[0], pair.slice(1).join('=')];

    var key = decodeURIComponent(pair[0].replace(plus, ' ')),
            value = decodeURIComponent(pair[1].replace(plus, ' ')),
        parts = key.match(keyBreaker);

    for (var j = 0; j < parts.length - 1; j++) {
      var part = parts[j];
      if (!current[part])
          current[part] = digitTest.test(parts[j + 1]) || parts[j + 1] == '[]' ? [] : {};
      current = current[part];
    };
    lastPart = parts[parts.length - 1];
    if (lastPart == '[]')
        current.push(value);
    else
        current[lastPart] = value;
  };
  return data;
}});

_.mixin({parseQueryString: function(queryString) {
  var params = {};

  if (queryString) {
    _.each(
            _.map(decodeURI(queryString).split(/&/g),function(el, i) {
              var aux = el.split('='), o = {};
              if (aux.length >= 1) {
                var val = undefined;
                if (aux.length == 2)
                    val = aux[1];
                o[aux[0]] = val;
              }
              return o;
            }),
            function(o) {
              _.extend(params,o);
            }
        );
  };

  return params;
}});

_.mixin({parseQueryHash: function(queryHash) {
  var params = [];

  if (queryHash) {
    var regex = /\/|\?/;
    params = queryHash.split(regex);
    params[0] = params[0].replace('#','');
    if(params[1]){
      var r = /\d+/;
      var findNumber = params[1].match(r);
      if(findNumber)
        params[1] = '';
      params = params[0] + params[1];
    }
    if(params.length === 1)
      params = params[0];

    return params;
  }
}});

_.mixin({filename: function(path) {
  return _.urlObject({url: path}).filename;
}});

_.mixin({urlObject: function(options) {
  var url_search_arr,
      option_key,
      i,
      urlObj,
      get_param,
      key,
      val,
      url_query,
      url_get_params = {},
      a = document.createElement('a'),
        default_options = {
          'url': window.location.href,
          'unescape': true,
          'convert_num': true
        };

  if (typeof options !== 'object') {
    options = default_options;
  } else {
    for (option_key in default_options) {
      if (default_options.hasOwnProperty(option_key)) {
        if (options[option_key] === undefined) {
          options[option_key] = default_options[option_key];
        }
      }
    }
  }

  a.href = options.url;
  url_query = a.search.substring(1);
  url_search_arr = url_query.split('&');

  if (url_search_arr[0].length > 1) {
    for (i = 0; i < url_search_arr.length; i += 1) {
      get_param = url_search_arr[i].split('=');

      if (options.unescape) {
        key = decodeURI(get_param[0]);
        val = decodeURI(get_param[1]);
      } else {
        key = get_param[0];
        val = get_param[1];
      }

      if (options.convert_num) {
        if (val.match(/^\d+$/)) {
          val = parseInt(val, 10);
        } else if (val.match(/^\d+\.\d+$/)) {
          val = parseFloat(val);
        }
      }

      if (url_get_params[key] === undefined) {
        url_get_params[key] = val;
      } else if (typeof url_get_params[key] === 'string') {
        url_get_params[key] = [url_get_params[key], val];
      } else {
        url_get_params[key].push(val);
      }

      get_param = [];
    }
  }

  urlObj = {
    protocol: a.protocol,
    hostname: a.hostname,
    host: a.host,
    port: a.port,
    hash: a.hash.substr(1),
    pathname: a.pathname,
    filename: a.pathname.split('/').pop(),
    search: a.search,
    parameters: url_get_params
  };

  return urlObj;
}});

_.mixin({dateFormat: function(date, format) {
  Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  Date.longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  Date.shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  Date.longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // defining patterns
  var replaceChars = {
    // Day
    d: function() { return (date.getDate() < 10 ? '0' : '') + date.getDate(); },
    D: function() { return Date.shortDays[date.getDay()]; },
    j: function() { return date.getDate(); },
    l: function() { return Date.longDays[date.getDay()]; },
    N: function() { return (date.getDay() == 0 ? 7 : date.getDay()); },
    S: function() { return (date.getDate() % 10 == 1 && date.getDate() != 11 ? 'st' : (date.getDate() % 10 == 2 && date.getDate() != 12 ? 'nd' : (date.getDate() % 10 == 3 && date.getDate() != 13 ? 'rd' : 'th'))); },
    w: function() { return date.getDay(); },
    z: function() { var d = new Date(date.getFullYear(),0,1); return Math.ceil((date - d) / 86400000); }, // Fixed now
    // Week
    W: function() {
      var target = new Date(date.valueOf());
      var dayNr = (date.getDay() + 6) % 7;
      target.setDate(target.getDate() - dayNr + 3);
      var firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
      }
      return 1 + Math.ceil((firstThursday - target) / 604800000);
    },
    // Month
    F: function() { return Date.longMonths[date.getMonth()]; },
    m: function() { return (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1); },
    M: function() { return Date.shortMonths[date.getMonth()]; },
    n: function() { return date.getMonth() + 1; },
    t: function() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0).getDate(); }, // Fixed now, gets #days of date
    // Year
    L: function() { var year = date.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)); },   // Fixed now
    o: function() { var d  = new Date(date.valueOf());  d.setDate(d.getDate() - ((date.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
    Y: function() { return date.getFullYear(); },
    y: function() { return ('' + date.getFullYear()).substr(2); },
    // Time
    a: function() { return date.getHours() < 12 ? 'am' : 'pm'; },
    A: function() { return date.getHours() < 12 ? 'AM' : 'PM'; },
    B: function() { return Math.floor((((date.getUTCHours() + 1) % 24) + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) * 1000 / 24); }, // Fixed now
    g: function() { return date.getHours() % 12 || 12; },
    G: function() { return date.getHours(); },
    h: function() { return ((date.getHours() % 12 || 12) < 10 ? '0' : '') + (date.getHours() % 12 || 12); },
    H: function() { return (date.getHours() < 10 ? '0' : '') + date.getHours(); },
    i: function() { return (date.getMinutes() < 10 ? '0' : '') + date.getMinutes(); },
    s: function() { return (date.getSeconds() < 10 ? '0' : '') + date.getSeconds(); },
    u: function() { var m = date.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ?
    '0' : '')) + m; },
    // Timezone
    e: function() { return /\((.*)\)/.exec(new Date().toString())[1]; },
    I: function() {
      var DST = null;
      for (var i = 0; i < 12; ++i) {
        var d = new Date(date.getFullYear(), i, 1);
        var offset = d.getTimezoneOffset();

        if (DST === null) DST = offset;
        else if (offset < DST) { DST = offset; break; }                     else if (offset > DST) break;
      }
      return (date.getTimezoneOffset() == DST) | 0;
    },
    O: function() { return (-date.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(date.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(date.getTimezoneOffset() / 60)) + '00'; },
    P: function() { return (-date.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(date.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(date.getTimezoneOffset() / 60)) + ':00'; }, // Fixed now
    T: function() { return date.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); },
    Z: function() { return -date.getTimezoneOffset() * 60; },
    // Full Date/Time
    //TODO
    //c: function() { return date.format("Y-m-d\\TH:i:sP"); }, // Fixed now
    r: function() { return date.toString(); },
    U: function() { return date.getTime() / 1000; }
  };

  return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
    return (esc === '' && replaceChars[chr]) ? replaceChars[chr].call(date) : chr;
  });
}});

