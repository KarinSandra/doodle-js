"use strict";

/* Intro
 *
 */

//the global object
var doodle = {};
//packages
doodle.geom = {};

/* ES5 compatibility
 */
  
if (typeof Function.prototype.bind !== 'function') {
  Function.prototype.bind = function (thisArg /*, args...*/) {
    var fn = this;
    return function () {
      return fn.apply(thisArg, arguments);
    };
  };
}
/*globals doodle, document*/
doodle.utils = {
  rgb_to_hex: function (r, g, b) {
    /*DEBUG*/
    if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number') {
      throw new TypeError("rgb_to_hex: Color values must be numbers.");
    }
    /*END_DEBUG*/
    var hex_color = (b | (g << 8) | (r << 16)).toString(16);
    return '#'+ String('000000'+hex_color).slice(-6); //pad out
  },

  rgb_str_to_hex: function (rgb_str) {
    var utils = doodle.utils;
    /*DEBUG*/
    if (typeof rgb_str !== 'string') {
      throw new TypeError('rgb_str_to_hex(rgb_str): Parameter must be a string.');
    }
    /*END_DEBUG*/
    
    var rgb = utils.rgb_str_to_rgb(rgb_str);
    
    /*DEBUG*/
    if (!Array.isArray(rgb)) {
      throw new SyntaxError('rgb_str_to_hex(rgb_str): Parameter must be in the format: "rgb(n, n, n)".');
    }
    /*END_DEBUG*/
    return utils.rgb_to_hex(parseInt(rgb[0], 10), parseInt(rgb[1], 10), parseInt(rgb[2], 10));
  },
  
  rgb_to_rgb_str: function (r, g, b, a) {
    a = (a === undefined) ? 1 : a;
    /*DEBUG*/
    var check_number_type = doodle.utils.types.check_number_type;
    check_number_type(r, 'rgb_to_rgb_str', '*r*, g, b, a');
    check_number_type(g, 'rgb_to_rgb_str', 'r, *g*, b, a');
    check_number_type(b, 'rgb_to_rgb_str', 'r, g, *b*, a');
    check_number_type(a, 'rgb_to_rgb_str', 'r, g, b, *a*');
    /*END_DEBUG*/
    a = (a < 0) ? 0 : ((a > 1) ? 1 : a);
    if (a === 1) {
      return "rgb("+ r +","+ g +","+ b +")";
    } else {
      return "rgba("+ r +","+ g +","+ b +","+ a +")";
    }
  },

  rgb_str_to_rgb: (function () {
    var rgb_regexp = new RegExp("^rgba?\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,?(.*)\\)$");
    return function (color) {
      /*DEBUG*/
      doodle.utils.types.check_string_type(color, 'rgb_str_to_rgb', '*color*');
      /*END_DEBUG*/
      color = color.trim().match(rgb_regexp);
      /*DEBUG*/
      if (!Array.isArray(color)) {
        throw new SyntaxError('rgb_str_to_rgb(color): Parameter must be in the format: "rgba(n, n, n, n)".');
      }
      /*END_DEBUG*/
      var rgb = [parseInt(color[1], 10),
                 parseInt(color[2], 10),
                 parseInt(color[3], 10)],
          alpha = parseFloat(color[4]);
      if (typeof alpha === 'number' && !isNaN(alpha)) {
        rgb.push(alpha);
      }
      return rgb;
    };
  }()),
  
  hex_to_rgb: function (color) {
    //number in octal format or string prefixed with #
    if (typeof color === 'string') {
      color = (color[0] === '#') ? color.slice(1) : color;
      color = parseInt(color, 16);
    }
    /*DEBUG*/
    if (typeof color !== 'number') {
      throw new TypeError("hex_to_rgb: Color in invalid hex format.");
    }
    /*END_DEBUG*/
    return [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff];
  },

  hex_to_rgb_str: function (color, alpha) {
    var utils = doodle.utils;
    alpha = (alpha === undefined) ? 1 : alpha;
    /*DEBUG*/
    if (typeof alpha !== 'number') {
      throw new TypeError("hex_to_rgb_str(color, *alpha*): Parameter must be a number.");
    }
    /*END_DEBUG*/
    color = utils.hex_to_rgb(color);
    return utils.rgb_to_rgb_str(color[0], color[1], color[2], alpha);
  }
};

/* also contains:
 * check_point_type
 * check_matrix_type
 * check_rect_type
 * These can't be added to utils.types until they're created.
 */
doodle.utils.types = (function () {
  function throw_type_error (type, caller, param) {
    if (typeof type !== 'string') {
      throw new TypeError("throw_type_error: type must be a string.");
    }
    caller = (caller === undefined) ? "throw_type_error" : caller;
    param = (param === undefined) ? "" : '('+param+')';
    throw new TypeError(caller + param +": Parameter must be a "+ type +".");
  }
  
  return {
    check_number_type: function (n, caller, param) {
      return (typeof n === 'number') ?
        true : throw_type_error('number', caller || 'check_number_type', param);
    },

    check_boolean_type: function (bool, caller, param) {
      return (typeof bool === 'boolean') ?
        true : throw_type_error('boolean', caller || 'check_boolean_type', param);
    },

    check_string_type: function (str, caller, param) {
      return (typeof str === 'string') ?
        true : throw_type_error('string', caller || 'check_string_type', param);
    },

    check_function_type: function (fn, caller, param) {
      return (typeof fn === 'function') ?
        true : throw_type_error('function', caller || 'check_function_type', param);
    },

    check_array_type: function (array, caller, param) {
      return (Array.isArray(array)) ?
        true : throw_type_error('array', caller || 'check_array_type', param);
    },

    check_event_type: function (evt, caller, param) {
      //list all event types
      if (evt && (evt.toString() === '[object Event]' ||
                  evt.toString() === '[object UIEvent]' ||
                  evt.toString() === '[object MouseEvent]' ||
                  evt.toString() === '[object KeyboardEvent]' ||
                  evt.toString() === '[object TextEvent]')) {
        return true;
      } else {
        throw_type_error('event', caller || 'check_event_type', param);
      }
    },

    check_canvas_type: function (canvas, caller, param) {
      return (canvas && canvas.toString() === '[object HTMLCanvasElement]') ?
        true : throw_type_error('canvas element', caller || 'check_canvas_type', param);
    },

    check_context_type: function (ctx, caller, param) {
      return (ctx && ctx.toString() === '[object CanvasRenderingContext2D]') ?
        true : throw_type_error('canvas context', caller || 'check_context_type', param);
    },

    check_block_element: function (element, caller, param) {
      try {
        return (doodle.utils.get_style_property(element, 'display') === "block") ?
          true : throw_type_error('HTML block element', caller || 'check_block_type', param);
      } catch (e) {
        throw_type_error('HTML block element', caller || 'check_block_type', param);
      }
    }
    
  };
}());


/* Returns HTML element from id name or element itself.
 */
doodle.utils.get_element = function (id) {
  if (typeof id === 'string') {
    //lop off pound-sign if given
    id = (id[0] === '#') ? id.slice(1) : id;
  } else {
    id = (id && id.id) ? id.id : null;
  }
  return document.getElementById(id);
};

/* Returns css property of element, it's own or inherited.
 */
doodle.utils.get_style_property = function (element, property) {
  try {
    if (document.defaultView && document.defaultView.getComputedStyle) {
      return document.defaultView.getComputedStyle(element, null)[property];
    } else if (element.currentStyle) {
      return element.currentStyle[property];
    } else if (element.style) {
      return element.style[property];
    } else {
      throw new ReferenceError("get_style_property: Cannot read property '"+property+"' of "+element+".");
    }
  } catch (e) {
    throw new ReferenceError("get_style_property: Cannot read property '"+property+"' of "+element+".");
  }
};

/* Returns property of an element.
 * CSS properties take precedence over HTML attributes.
 * @param type {String} 'int'|'float' Return type.
 */
doodle.utils.get_element_property = function (element, property, type) {
  var val;
  try {
    val = doodle.utils.get_style_property(element, property);
  } catch (e) {
    val = undefined;
  }
  if (val === undefined || val === null) {
    val = element.getAttribute(property);
  }
  if (type !== undefined) {
    switch (type) {
    case 'int':
      val = parseInt(val, 10);
      val = isNaN(val) ? null : val;
      break;
    case 'float':
      val = parseFloat(val);
      val = isNaN(val) ? null : val;
      break;
    default:
      break;
    }
  }
  return val;
};

/*
 * @param type {String} 'css'|'html' Set CSS property or HTML attribute.
 */
doodle.utils.set_element_property = function (element, property, value, type) {
  type = (type === undefined) ? 'css' : type;
  /*DEBUG*/
  doodle.utils.types.check_string_type(property, 'set_element_property', 'element, *property*, value, type');
  doodle.utils.types.check_string_type(type, 'set_element_property', 'element, property, value, *type*');
  /*END_DEBUG*/
  switch (type) {
  case 'css':
    element.style[property] = value;
    break;
  case 'html':
    element.setAttribute(property, value);
    break;
  default:
    throw new SyntaxError("set_element_property: type must be 'css' property or 'html' attribute.");
  }
  return value;
};
/*
 * stats.js r4
 * http://github.com/mrdoob/stats.js
 *
 * Released under MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * How to use:
 *
 *  var stats = new Stats();
 *  parentElement.appendChild(stats.domElement);
 *
 *  setInterval(function () {
 *
 *  	stats.update();
 *
 *  }, 1000/60);
 *
 */

var Stats = function () {

	var _container, _mode = 'fps',
	_frames = 0, _time = new Date().getTime(), _timeLastFrame = _time, _timeLastSecond = _time,
	_fps = 0, _fpsMin = 1000, _fpsMax = 0, _fpsText, _fpsCanvas, _fpsContext, _fpsImageData,
	_ms = 0, _msMin = 1000, _msMax = 0, _msText, _msCanvas, _msContext, _msImageData;

	_container = document.createElement( 'div' );
	_container.style.fontFamily = 'Helvetica, Arial, sans-serif';
	_container.style.fontSize = '9px';
	_container.style.backgroundColor = '#000020';
	_container.style.opacity = '0.9';
	_container.style.width = '80px';
	_container.style.paddingTop = '2px';
	_container.style.cursor = 'pointer';
	_container.addEventListener( 'click', swapMode, false );

	_fpsText = document.createElement( 'div' );
	_fpsText.innerHTML = '<strong>FPS</strong>';
	_fpsText.style.color = '#00ffff';
	_fpsText.style.marginLeft = '3px';
	_fpsText.style.marginBottom = '3px';
	_container.appendChild(_fpsText);

	_fpsCanvas = document.createElement( 'canvas' );
	_fpsCanvas.width = 74;
	_fpsCanvas.height = 30;
	_fpsCanvas.style.display = 'block';
	_fpsCanvas.style.marginLeft = '3px';
	_fpsCanvas.style.marginBottom = '3px';
	_container.appendChild(_fpsCanvas);

	_fpsContext = _fpsCanvas.getContext( '2d' );
	_fpsContext.fillStyle = '#101030';
	_fpsContext.fillRect( 0, 0, _fpsCanvas.width, _fpsCanvas.height );

	_fpsImageData = _fpsContext.getImageData( 0, 0, _fpsCanvas.width, _fpsCanvas.height );

	_msText = document.createElement( 'div' );
	_msText.innerHTML = '<strong>MS</strong>';
	_msText.style.color = '#00ffff';
	_msText.style.marginLeft = '3px';
	_msText.style.marginBottom = '3px';
	_msText.style.display = 'none';
	_container.appendChild(_msText);

	_msCanvas = document.createElement( 'canvas' );
	_msCanvas.width = 74;
	_msCanvas.height = 30;
	_msCanvas.style.display = 'block';
	_msCanvas.style.marginLeft = '3px';
	_msCanvas.style.marginBottom = '3px';
	_msCanvas.style.display = 'none';
	_container.appendChild(_msCanvas);

	_msContext = _msCanvas.getContext( '2d' );
	_msContext.fillStyle = '#101030';
	_msContext.fillRect( 0, 0, _msCanvas.width, _msCanvas.height );

	_msImageData = _msContext.getImageData( 0, 0, _msCanvas.width, _msCanvas.height );

	function updateGraph( data, value ) {

		var x, y, index;

		for ( y = 0; y < 30; y++ ) {

			for ( x = 0; x < 73; x++ ) {

				index = (x + y * 74) * 4;

				data[ index ] = data[ index + 4 ];
				data[ index + 1 ] = data[ index + 5 ];
				data[ index + 2 ] = data[ index + 6 ];

			}

		}

		for ( y = 0; y < 30; y++ ) {

			index = (73 + y * 74) * 4;

			if ( y < value ) {

				data[ index ] = 16;
				data[ index + 1 ] = 16;
				data[ index + 2 ] = 48;

			} else {

				data[ index ] = 0;
				data[ index + 1 ] = 255;
				data[ index + 2 ] = 255;

			}

		}

	}

	function swapMode() {

		switch( _mode ) {

			case 'fps':

				_mode = 'ms';

				_fpsText.style.display = 'none';
				_fpsCanvas.style.display = 'none';
				_msText.style.display = 'block';
				_msCanvas.style.display = 'block';

				break;

			case 'ms':

				_mode = 'fps';

				_fpsText.style.display = 'block';
				_fpsCanvas.style.display = 'block';
				_msText.style.display = 'none';
				_msCanvas.style.display = 'none';

				break;

		}

	}

	return {

		domElement: _container,

		update: function () {

			_frames ++;

			_time = new Date().getTime();

			_ms = _time - _timeLastFrame;
			_msMin = Math.min( _msMin, _ms );
			_msMax = Math.max( _msMax, _ms );

			updateGraph( _msImageData.data, Math.min( 30, 30 - ( _ms / 200 ) * 30 ) );

			_msText.innerHTML = '<strong>' + _ms + ' MS</strong> (' + _msMin + '-' + _msMax + ')';
			_msContext.putImageData( _msImageData, 0, 0 );

			_timeLastFrame = _time;

			if ( _time > _timeLastSecond + 1000 ) {

				_fps = Math.round( ( _frames * 1000) / ( _time - _timeLastSecond ) );
				_fpsMin = Math.min( _fpsMin, _fps );
				_fpsMax = Math.max( _fpsMax, _fps );

				updateGraph( _fpsImageData.data, Math.min( 30, 30 - ( _fps / 100 ) * 30 ) );

				_fpsText.innerHTML = '<strong>' + _fps + ' FPS</strong> (' + _fpsMin + '-' + _fpsMax + ')';
				_fpsContext.putImageData( _fpsImageData, 0, 0 );

				_timeLastSecond = _time;
				_frames = 0;

			}

		}

	};

};

Object.defineProperty(doodle, 'Keyboard', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {

    'BACKSPACE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 8
    },
    'TAB': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 9
    },
    
    'ENTER': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 13
    },
    
    'COMMAND': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 15
    },
    'SHIFT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 16
    },
    'CONTROL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 17
    },
    'ALTERNATE': { //Option key
      enumerable: true,
      writable: false,
      configurable: false,
      value: 18
    },
    'PAUSE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 19
    },
    'CAPS_LOCK': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 20
    },
    'NUMPAD': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 21
    },
    
    'ESCAPE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 27
    },

    'SPACE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 32
    },    
    'PAGE_UP': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 33
    },
    'PAGE_DOWN': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 34
    },
    'END': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 35
    },
    'HOME': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 36
    },

    /* ARROWS
     */ 
    'LEFT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 37
    },
    'UP': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 38
    },
    'RIGHT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 39
    },
    'DOWN': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 40
    },

    /*
     */
    'INSERT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 45
    },
    'DELETE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 46
    },

    /* NUMBERS
     */
    'NUMBER_0': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 48
    },
    'NUMBER_1': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 49
    },
    'NUMBER_2': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 50
    },
    'NUMBER_3': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 51
    },
    'NUMBER_4': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 52
    },
    'NUMBER_5': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 53
    },
    'NUMBER_6': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 54
    },
    'NUMBER_7': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 55
    },
    'NUMBER_8': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 56
    },
    'NUMBER_9': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 57
    },

    /* LETTERS
     */
    'A': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 65
    },
    'B': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 66
    },
    'C': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 67
    },
    'D': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 68
    },
    'E': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 69
    },
    'F': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 70
    },
    'G': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 71
    },
    'H': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 72
    },
    'I': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 73
    },
    'J': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 74
    },
    'K': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 75
    },
    'L': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 76
    },
    'M': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 77
    },
    'N': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 78
    },
    'O': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 79
    },
    'P': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 80
    },
    'Q': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 81
    },
    'R': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 82
    },
    'S': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 83
    },
    'T': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 84
    },
    'U': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 85
    },
    'V': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 86
    },
    'W': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 87
    },
    'X': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 88
    },
    'Y': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 89
    },
    'Z': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 90
    },

    'WINDOWS_KEY': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 91
    },

    /* NUMBER PAD
     */
    'NUMPAD_0': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 96
    },
    'NUMPAD_1': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 97
    },
    'NUMPAD_2': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 98
    },
    'NUMPAD_3': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 99
    },
    'NUMPAD_4': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 100
    },
    'NUMPAD_5': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 101
    },
    'NUMPAD_6': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 102
    },
    'NUMPAD_7': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 103
    },
    'NUMPAD_8': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 104
    },
    'NUMPAD_9': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 105
    },
    'NUMPAD_MULTIPLY': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 106
    },
    'NUMPAD_ADD': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 107
    },
    'NUMPAD_ENTER': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 108
    },
    'NUMPAD_SUBTRACT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 109
    },
    'NUMPAD_DECIMAL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 110
    },
    'NUMPAD_DIVIDE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 111
    },

    /* FUNCTION KEYS
     */
    'F1': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 112
    },
    'F2': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 113
    },
    'F3': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 114
    },
    'F4': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 115
    },
    'F5': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 116
    },
    'F6': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 117
    },
    'F7': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 118
    },
    'F8': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 119
    },
    'F9': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 120
    },
    'F10': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 121
    },
    'F11': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 122
    },
    'F12': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 123
    },
    'F13': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 124
    },
    'F14': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 125
    },
    'F15': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 126
    },

    'SCROLL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 145
    },

    /* PUNCTUATION
     */
    'SEMICOLON': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 186
    },
    'EQUAL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 187
    },
    'COMMA': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 188
    },
    'MINUS': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 189
    },
    'PERIOD': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 190
    },
    'SLASH': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 191
    },
    'BACKQUOTE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 192
    },
    
    'LEFTBRACKET': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 219
    },
    'BACKSLASH': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 220
    },
    'RIGHTBRACKET': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 221
    },
    'QUOTE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 222
    }
    
  })
});

Object.defineProperty(doodle, 'GradientType', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    'LINEAR': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'linearGradient'
    },
    'RADIAL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'radialGradient'
    }
  })
});

Object.defineProperty(doodle, 'Pattern', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    'REPEAT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'repeat'
    },
    
    'REPEAT_X': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'repeat-x'
    },
    
    'REPEAT_Y': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'repeat-y'
    },
    
    'NO_REPEAT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'no-repeat'
    }
  })
});

Object.defineProperty(doodle, 'LineCap', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    //default
    'BUTT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'butt'
    },
    'ROUND': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'round'
    },
    'SQUARE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'square'
    }
  })
});

Object.defineProperty(doodle, 'LineJoin', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: Object.create(null, {
    // default
    'MITER': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'miter'
    },
    'ROUND': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'round'
    },
    'BEVEL': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 'bevel'
    }
  })
});
/*globals doodle*/

/* Will probably want to implement the dom event interface:
 * http://www.w3.org/TR/DOM-Level-3-Events/
 * But this works for now.
 */
(function () {
  var event_prototype,
      event_static_properties,
      isEvent,
      check_boolean_type = doodle.utils.types.check_boolean_type,
      check_number_type = doodle.utils.types.check_number_type,
      check_string_type = doodle.utils.types.check_string_type;
  
  /* Super constructor
   * @param {String} type
   * @param {Boolean} bubbles = false
   * @param {Boolean} cancelable = false
   *
   * @alternative instantiation
   * @param {Event} initializer event to wrap
   *
   * @return {Object}
   */
  doodle.Event = function (type, bubbles, cancelable) {
    var event = Object.create(event_prototype),
        arg_len = arguments.length,
        init_obj, //function, event
        copy_event_properties; //fn declared per event for private vars

    /*DEBUG*/
    if (arg_len === 0 || arg_len > 3) {
      throw new SyntaxError("[object Event](type, bubbles, cancelable): Invalid number of parameters.");
    }
    /*END_DEBUG*/

    Object.defineProperties(event, event_static_properties);
    //properties that require privacy
    Object.defineProperties(event, (function () {
      var evt_type,
          evt_bubbles,
          evt_cancelable,
          evt_cancelBubble = false,
          evt_defaultPrevented = false,
          evt_eventPhase = 0,
          evt_currentTarget = null,
          evt_target = null,
          evt_srcElement = null,
          evt_timeStamp = new Date(),
          evt_returnValue = true,
          evt_clipboardData,
          //internal use
          __cancel = false,
          __cancelNow = false;

      copy_event_properties = function  (evt) {
        evt_type = evt.type;
        evt_bubbles = evt.bubbles;
        evt_cancelable = evt.cancelable;
        evt_cancelBubble = evt.cancelBubble;
        evt_defaultPrevented = evt.defaultPrevented;
        evt_eventPhase = evt.eventPhase;
        evt_currentTarget = evt.currentTarget;
        evt_target = evt.target;
        evt_srcElement = evt.srcElement;
        evt_timeStamp = evt.timeStamp;
        evt_returnValue = evt.returnValue;
        evt_clipboardData = evt.clipboardData;
        //check for doodle internal event properties
        if (evt.__cancel) {
          __cancel = true;
        }
        if (evt.__cancelNow) {
          __cancelNow = true;
        }
      };
      
      return {
        'type': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_type; }
        },
        
        '__setType': {
          enumerable: false,
          value: function (typeArg) {
            /*DEBUG*/
            check_string_type(typeArg, this+'.__setType', '*type*');
            /*END_DEBUG*/
            evt_type = typeArg;
          }
        },
        
        'bubbles': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_bubbles; }
        },
        
        'cancelable': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_cancelable; }
        },
        
        'cancelBubble': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_cancelBubble; },
          set: function (cancelArg) {
            /*DEBUG*/
            check_boolean_type(cancelArg, this+'.cancelBubble');
            /*END_DEBUG*/
            evt_cancelBubble = cancelArg;
          }
        },
        
        //test if event propagation should stop after this node
        //@internal
        '__cancel': {
          enumerable: false,
          configurable: false,
          get: function () { return __cancel; }
        },
        
        //test if event propagation should stop immediately,
        //ignore other handlers on this node
        //@internal
        '__cancelNow': {
          enumerable: false,
          configurable: false,
          get: function () { return __cancelNow; }
        },
        
        'currentTarget': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_currentTarget; }
        },
        
        //currentTarget is read-only, but damnit I need to set it sometimes
        '__setCurrentTarget': {
          enumerable: false,
          value: function (targetArg) {
            evt_currentTarget = targetArg;
          }
        },
        
        'target': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_target; }
        },
        
        '__setTarget': {
          enumerable: false,
          value: function (targetArg) {
            evt_target = targetArg;
          }
        },
        
        'eventPhase': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_eventPhase; }
        },
        
        '__setEventPhase': {
          enumerable: false,
          value: function (phaseArg) {
            /*DEBUG*/
            check_number_type(phaseArg, this+'.__setEventPhase', '*phase*');
            /*END_DEBUG*/
            evt_eventPhase = phaseArg;
          }
        },
        
        'srcElement': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_srcElement; }
        },
        
        'timeStamp': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_timeStamp; }
        },
        
        'returnValue': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_returnValue; }
        },
        
        /*
         * METHODS
         */
        'initEvent': {
          enumerable: true,
          configurable: false,
          value: function (typeArg, canBubbleArg, cancelableArg) {
            //parameter defaults
            canBubbleArg = (canBubbleArg === undefined) ? false : canBubbleArg;
            cancelableArg = (cancelableArg === undefined) ? false : cancelableArg;
            /*DEBUG*/
            check_string_type(typeArg, this+'.initEvent', '*type*, bubbles, cancelable');
            check_boolean_type(canBubbleArg, this+'.initEvent', 'type, *bubbles*, cancelable');
            check_boolean_type(cancelableArg, this+'.initEvent', 'type, bubbles, *cancelable*');
            /*END_DEBUG*/

            evt_type = typeArg;
            evt_bubbles = canBubbleArg;
            evt_cancelable = cancelableArg;
            
            return this;
          }
        },

        'preventDefault': {
          enumerable: true,
          configurable: false,
          value: function () {
            evt_defaultPrevented = true;
          }
        },

        'stopPropagation': {
          enumerable: true,
          configurable: false,
          value: function () {
            if (!this.cancelable) {
              throw new Error(this+'.stopPropagation: Event can not be cancelled.');
            } else {
              __cancel = true;
            }
          }
        },

        'stopImmediatePropagation': {
          enumerable: true,
          configurable: false,
          value: function () {
            if (!this.cancelable) {
              throw new Error(this+'.stopImmediatePropagation: Event can not be cancelled.');
            } else {
              __cancel = true;
              __cancelNow = true;
            }
          }
        }
      };
    }()));//end defineProperties

    
    //using a function or another event object to init?
    if (arg_len === 1 && (typeof arguments[0] === 'function' || isEvent(arguments[0]))) {
      init_obj = arguments[0];
      type = undefined;
    }

    //initialize event
    if (init_obj) {
      if (typeof init_obj === 'function') {
        init_obj.call(event);
        /*DEBUG*/
        if (event.type === undefined ||
            event.bubbles === undefined ||
            event.cancelable === undefined) {
          throw new SyntaxError("[object Event](function): Must call 'this.initEvent(type, bubbles, cancelable)' within the function argument.");
        }
        /*END_DEBUG*/
      } else {
        //passed a doodle or dom event object
        copy_event_properties(init_obj);
      }
    } else {
      //standard instantiation
      event.initEvent(type, bubbles, cancelable);
    }

    return event;
  };
  
  
  event_static_properties = {
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return "[object Event]";
      }
    }
  };//end event_static_properties

  event_prototype = Object.create({}, {
    'CAPTURING_PHASE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 1
    },
    'AT_TARGET': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 2
    },
    'BUBBLING_PHASE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 3
    },
    
    'MOUSEDOWN': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 1
    },
    'MOUSEUP': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 2
    },
    'MOUSEOVER': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 4
    },
    'MOUSEOUT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 8
    },
    'MOUSEMOVE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 16
    },
    'MOUSEDRAG': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 32
    },
    'CLICK': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 64
    },
    'DBLCLICK': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 128
    },
    'KEYDOWN': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 256
    },
    'KEYUP': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 512
    },
    'KEYPRESS': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 1024
    },
    'DRAGDROP': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 2048
    },
    'FOCUS': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 4096
    },
    'BLUR': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 8192
    },
    'SELECT': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 16384
    },
    'CHANGE': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: 32768
    }
  });//end event_prototype

  /*
   * CLASS METHODS
   */

  /* Test if an object is an event of any kind (Event/MouseEvent/etc).
   * Returns true on Doodle events as well as DOM events.
   * @param {Event} event
   * @return {Boolean}
   */
  isEvent = doodle.Event.isEvent = function (event) {
    if (!event || typeof event !== "object") {
      return false;
    } else {
      event = event.toString();
    }
    return (event === '[object Event]' ||
            event === '[object UIEvent]' ||
            event === '[object MouseEvent]' ||
            event === '[object TouchEvent]' ||
            event === '[object KeyboardEvent]' ||
            event === '[object TextEvent]' ||
            event === '[object WheelEvent]');
  };
  
}());//end class closure
/*globals doodle*/

/* DOM 2 Event: UIEvent:Event
 * http://www.w3.org/TR/DOM-Level-3-Events/#events-Events-UIEvent
 */
(function () {
  var uievent_static_properties,
      isEvent = doodle.Event.isEvent,
      check_boolean_type = doodle.utils.types.check_boolean_type,
      check_number_type = doodle.utils.types.check_number_type,
      check_string_type = doodle.utils.types.check_string_type;
  
  /* Super constructor
   * @param {String} type
   * @param {Boolean} bubbles
   * @param {Boolean} cancelable
   * @param {DOM Object} view
   * @param {Number} detail
   *
   * @alternative instantiation
   * @param {Event} initializer event to wrap
   *
   * @return {UIEvent}
   */
  doodle.UIEvent = function (type, bubbles, cancelable, view, detail) {
    var uievent,
        arg_len = arguments.length,
        init_obj, //function, event
        copy_uievent_properties; //fn declared per event for private vars

    /*DEBUG*/
    if (arg_len === 0 || arg_len > 5) {
      throw new SyntaxError("[object UIEvent](type, bubbles, cancelable, view, detail): Invalid number of parameters.");
    }
    /*END_DEBUG*/

    //initialize uievent prototype with another event, function, or args
    if (isEvent(arguments[0])) {
      /*DEBUG*/
      if (arg_len > 1) {
        throw new SyntaxError("[object UIEvent](event): Invalid number of parameters.");
      }
      /*END_DEBUG*/
      init_obj = arguments[0];
      type = undefined;
      uievent = Object.create(doodle.Event(init_obj));
    } else if (typeof arguments[0] === 'function') {
      /*DEBUG*/
      if (arg_len > 1) {
        throw new SyntaxError("[object UIEvent](function): Invalid number of parameters.");
      }
      /*END_DEBUG*/
      init_obj = arguments[0];
      type = undefined;
      //use empty event type for now, will check after we call the init function.
      uievent = Object.create(doodle.Event(''));
    } else {
      //parameter defaults
      bubbles = (bubbles === undefined) ? false : bubbles;
      cancelable = (cancelable === undefined) ? false : cancelable;
      /*DEBUG*/
      check_string_type(type, '[object UIEvent]', '*type*, bubbles, cancelable, view, detail');
      check_boolean_type(bubbles, '[object UIEvent]', 'type, *bubbles*, cancelable, view, detail');
      check_boolean_type(cancelable, '[object UIEvent]', 'type, bubbles, *cancelable*, view, detail');
      /*END_DEBUG*/
      uievent = Object.create(doodle.Event(type, bubbles, cancelable));
    }
    
    Object.defineProperties(uievent, uievent_static_properties);
    //properties that require privacy
    Object.defineProperties(uievent, (function () {
      var evt_view = null,
          evt_detail = 0,
          evt_which = 0,
          evt_charCode = 0,
          evt_keyCode = 0,
          evt_layerX = 0,
          evt_layerY = 0,
          evt_pageX = 0,
          evt_pageY = 0;

      copy_uievent_properties = function (evt) {
        //only looking for UIEvent properties
        if (evt.view !== undefined) { evt_view = evt.view; }
        if (evt.detail !== undefined) { evt_detail = evt.detail; }
        if (evt.which !== undefined) { evt_which = evt.which; }
        if (evt.charCode !== undefined) { evt_charCode = evt.charCode; }
        if (evt.keyCode !== undefined) { evt_keyCode = evt.keyCode; }
        if (evt.layerX !== undefined) { evt_layerX = evt.layerX; }
        if (evt.layerY !== undefined) { evt_layerY = evt.layerY; }
        if (evt.pageX !== undefined) { evt_pageX = evt.pageX; }
        if (evt.pageY !== undefined) { evt_pageY = evt.pageY; }
      };
      
      return {
        'view': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_view; }
        },

        'detail': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_detail; }
        },

        'which': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_which; }
        },

        'charCode': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_charCode; }
        },

        'keyCode': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_keyCode; }
        },

        'layerX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_layerX; }
        },

        'layerY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_layerY; }
        },

        'pageX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_pageX; }
        },

        'pageY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_pageY; }
        },
        
        'initUIEvent': {
          value: function (typeArg, canBubbleArg, cancelableArg, viewArg, detailArg) {
            //parameter defaults
            canBubbleArg = (canBubbleArg === undefined) ? false : canBubbleArg;
            cancelableArg = (cancelableArg === undefined) ? false : cancelableArg;
            viewArg = (viewArg === undefined) ? null : viewArg;
            detailArg = (detailArg === undefined) ? 0 : detailArg;
            /*DEBUG*/
            check_string_type(typeArg, this+'.initUIEvent', '*type*, bubbles, cancelable, view, detail');
            check_boolean_type(canBubbleArg, this+'.initUIEvent', 'type, *bubbles*, cancelable, view, detail');
            check_boolean_type(cancelableArg, this+'.initUIEvent', 'type, bubbles, *cancelable*, view, detail');
            check_number_type(detailArg, this+'.initUIEvent', 'type, bubbles, cancelable, view, *detail*');
            /*END_DEBUG*/
            evt_view = viewArg;
            evt_detail = detailArg;
            
            this.initEvent(typeArg, canBubbleArg, cancelableArg);
            return this;
          }
        }
      };
    }()));//end defineProperties

    
    //initialize uievent
    if (init_obj) {
      if (typeof init_obj === 'function') {
        init_obj.call(uievent);
        /*DEBUG*/
        //make sure we've checked our dummy type string
        if (uievent.type === undefined || uievent.type === '' ||
            uievent.bubbles === undefined ||
            uievent.cancelable === undefined) {
          throw new SyntaxError("[object UIEvent](function): Must call 'this.initUIEvent(type, bubbles, cancelable, view, detail)' within the function argument.");
        }
        /*END_DEBUG*/
      } else {
        //passed a doodle or dom event object
        copy_uievent_properties(init_obj);
      }
    } else {
      //standard instantiation
      uievent.initUIEvent(type, bubbles, cancelable, view, detail);
    }
    
    return uievent;
  };

  
  uievent_static_properties = {
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return "[object UIEvent]";
      }
    }
  };

}());//end class closure
/*globals doodle*/

/* DOM 2 Event: MouseEvent:UIEvent
 * http://www.w3.org/TR/DOM-Level-3-Events/#events-mouseevents
 */
(function () {
  var mouseevent_static_properties,
      isEvent = doodle.Event.isEvent,
      check_boolean_type = doodle.utils.types.check_boolean_type,
      check_number_type = doodle.utils.types.check_number_type,
      check_string_type = doodle.utils.types.check_string_type;
  
  /* Super constructor
   * @param {String} type
   * @param {Boolean} bubbles
   * @param {Boolean} cancelable
   * @param {DOM Object} view
   * @param {Number} detail
   * @param {Number} screenX
   * @param {Number} screenY
   * @param {Number} clientX
   * @param {Number} clientY
   * @param {Boolean} ctrlKey
   * @param {Boolean} altKey
   * @param {Boolean} shiftKey
   * @param {Boolean} metaKey
   * @param {Number} button Mouse button that caused the event (0|1|2)
   * @param {Node} relatedTarget Secondary target for event (only for some events)
   *
   * @alternative instantiation
   * @param {Event} initializer event to wrap
   *
   * @return {MouseEvent}
   */
  doodle.MouseEvent = function (type, bubbles, cancelable, view, detail,
                                screenX, screenY, clientX, clientY, 
                                ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget) {
    var mouseevent,
        arg_len = arguments.length,
        init_obj, //function, event
        copy_mouseevent_properties; //fn declared per event for private vars
    
    /*DEBUG*/
    if (arg_len === 0 || arg_len > 15) {
      throw new SyntaxError("[object MouseEvent](type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget): Invalid number of parameters.");
    }
    /*END_DEBUG*/

    //initialize uievent prototype with another event, function, or args
    if (isEvent(arguments[0])) {
      /*DEBUG*/
      if (arg_len > 1) {
        throw new SyntaxError("[object MouseEvent](event): Invalid number of parameters.");
      }
      /*END_DEBUG*/
      init_obj = arguments[0];
      type = undefined;
      mouseevent = Object.create(doodle.UIEvent(init_obj));
    } else if (typeof arguments[0] === 'function') {
      /*DEBUG*/
      if (arg_len > 1) {
        throw new SyntaxError("[object MouseEvent](function): Invalid number of parameters.");
      }
      /*END_DEBUG*/
      init_obj = arguments[0];
      type = undefined;
      //use empty event type for now, will check after we call the init function.
      mouseevent = Object.create(doodle.UIEvent(''));
    } else {
      //parameter defaults
      bubbles = (bubbles === undefined) ? false : bubbles;
      cancelable = (cancelable === undefined) ? false : cancelable;
      view = (view === undefined) ? null : view;
      detail = (detail === undefined) ? 0 : detail;
      /*DEBUG*/
      check_string_type(type, '[object MouseEvent]', '*type*, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget');
      check_boolean_type(bubbles, '[object MouseEvent]', 'type, *bubbles*, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget');
      check_boolean_type(cancelable, '[object MouseEvent]', 'type, bubbles, *cancelable*, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget');
      check_number_type(detail, '[object MouseEvent]', 'type, bubbles, cancelable, view, *detail*, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget');
      /*END_DEBUG*/
      mouseevent = Object.create(doodle.UIEvent(type, bubbles, cancelable, view, detail));
    }
    
    
    Object.defineProperties(mouseevent, mouseevent_static_properties);
    //properties that require privacy
    Object.defineProperties(mouseevent, (function () {
      var evt_x = 0,
          evt_y = 0,
          evt_offsetX = 0,
          evt_offsetY = 0,
          evt_screenX = 0,
          evt_screenY = 0,
          evt_clientX = 0,
          evt_clientY = 0,
          evt_ctrlKey = false,
          evt_altKey = false,
          evt_shiftKey = false,
          evt_metaKey = false,
          evt_button = 0,
          evt_relatedTarget = null;

      copy_mouseevent_properties = function (evt) {
        //only looking for MouseEvent properties
        evt_x = (evt.x !== undefined) ? evt.x : 0;
        evt_y = (evt.y !== undefined) ? evt.y : 0;
        evt_offsetX = (evt.offsetX !== undefined) ? evt.offsetX : 0;
        evt_offsetY = (evt.offsetY !== undefined) ? evt.offsetY : 0;
        if (evt.screenX !== undefined) { evt_screenX = evt.screenX; }
        if (evt.screenY !== undefined) { evt_screenY = evt.screenY; }
        if (evt.clientX !== undefined) { evt_clientX = evt.clientX; }
        if (evt.clientY !== undefined) { evt_clientY = evt.clientY; }
        if (evt.ctrlKey !== undefined) { evt_ctrlKey = evt.ctrlKey; }
        if (evt.altKey !== undefined) { evt_altKey = evt.altKey; }
        if (evt.shiftKey !== undefined) { evt_shiftKey = evt.shiftKey; }
        if (evt.metaKey !== undefined) { evt_metaKey = evt.metaKey; }
        if (evt.button !== undefined) { evt_button = evt.button; }
        if (evt.relatedTarget !== undefined) { evt_relatedTarget = evt.relatedTarget; }
      };
      
      return {
        'x': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_x; }
        },

        'y': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_y; }
        },

        'screenX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_screenX; }
        },

        'screenY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_screenY; }
        },

        'clientX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_clientX; }
        },

        'clientY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_clientY; }
        },

        'offsetX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_offsetX; }
        },

        'offsetY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_offsetY; }
        },

        'ctrlKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_ctrlKey; }
        },

        'altKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_altKey; }
        },

        'shiftKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_shiftKey; }
        },

        'metaKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_metaKey; }
        },

        'button': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_button; }
        },

        'relatedTarget': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_relatedTarget; }
        },

        'initMouseEvent': {
          value: function (typeArg, canBubbleArg, cancelableArg, viewArg, detailArg,
                           screenXArg, screenYArg, clientXArg, clientYArg,
                           ctrlKeyArg, altKeyArg, shiftKeyArg, metaKeyArg,
                           buttonArg, relatedTargetArg) {
            //parameter defaults
            canBubbleArg = (canBubbleArg === undefined) ? false : canBubbleArg;
            cancelableArg = (cancelableArg === undefined) ? false : cancelableArg;
            viewArg = (viewArg === undefined) ? null : viewArg;
            detailArg = (detailArg === undefined) ? 0 : detailArg;
            screenXArg = (screenXArg === undefined) ? 0 : screenXArg;
            screenYArg = (screenYArg === undefined) ? 0 : screenYArg;
            clientXArg = (clientXArg === undefined) ? 0 : clientXArg;
            clientYArg = (clientYArg === undefined) ? 0 : clientYArg;
            ctrlKeyArg = (ctrlKeyArg === undefined) ? false : ctrlKeyArg;
            altKeyArg = (altKeyArg === undefined) ? false : altKeyArg;
            shiftKeyArg = (shiftKeyArg === undefined) ? false : shiftKeyArg;
            metaKeyArg = (metaKeyArg === undefined) ? false : metaKeyArg;
            buttonArg = (buttonArg === undefined) ? 0 : buttonArg;
            relatedTarget = (relatedTargetArg === undefined) ? null : relatedTargetArg;
            /*DEBUG*/
            check_string_type(typeArg, this+'.initMouseEvent', '*type*, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget');
            check_boolean_type(canBubbleArg, this+'.initMouseEvent', 'type, *bubbles*, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget');
            check_boolean_type(cancelableArg, this+'.initMouseEvent', 'type, bubbles, *cancelable*, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget');
            check_number_type(detailArg, this+'.initMouseEvent', 'type, bubbles, cancelable, view, *detail*, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget');
            check_number_type(screenXArg, this+'.initMouseEvent', 'type, bubbles, cancelable, view, detail, *screenX*, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget');
            check_number_type(screenYArg, this+'.initMouseEvent', 'type, bubbles, cancelable, view, detail, screenX, *screenY*, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget');
            check_number_type(clientXArg, this+'.initMouseEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, *clientX*, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget');
            check_number_type(clientYArg, this+'.initMouseEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, clientX, *clientY*, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget');
            check_boolean_type(ctrlKeyArg, this+'.initMouseEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, *ctrlKey*, altKey, shiftKey, metaKey, button, relatedTarget');
            check_boolean_type(altKeyArg, this+'.initMouseEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, *altKey*, shiftKey, metaKey, button, relatedTarget');
            check_boolean_type(shiftKeyArg, this+'.initMouseEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, *shiftKey*, metaKey, button, relatedTarget');
            check_boolean_type(metaKeyArg, this+'.initMouseEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, *metaKey*, button, relatedTarget');
            check_number_type(buttonArg, this+'.initMouseEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, *button*, relatedTarget');
            /*END_DEBUG*/
            evt_screenX = screenXArg;
            evt_screenY = screenYArg;
            evt_clientX = clientXArg;
            evt_clientY = clientYArg;
            evt_ctrlKey = ctrlKeyArg;
            evt_altKey = altKeyArg;
            evt_shiftKey = shiftKeyArg;
            evt_metaKey = metaKeyArg;
            evt_button = buttonArg;
            evt_relatedTarget = relatedTargetArg;

            this.initUIEvent(typeArg, canBubbleArg, cancelableArg, viewArg, detailArg);
            return this;
          }
        },

        /* Queries the state of a modifier using a key identifier.
         * @param {String} key A modifier key identifier
         * @return {Boolean} True if it is a modifier key and the modifier is activated, false otherwise.
         * This is an incomplete list of modifiers.
         */
        'getModifierState': {
          value: function (key) {
            check_string_type(key, this+'.getModifierState', '*key*');
            switch (key) {
            case 'Alt':
              return evt_altKey;
            case 'Control':
              return evt_ctrlKey;
            case 'Meta':
              return evt_metaKey;
            case 'Shift':
              return evt_shiftKey;
            default:
              return false;
            }
          }
        }
      };
    }()));//end defineProperties


    //initialize mouseevent
    if (init_obj) {
      if (typeof init_obj === 'function') {
        init_obj.call(mouseevent);
        /*DEBUG*/
        //make sure we've checked our dummy type string
        if (mouseevent.type === undefined || mouseevent.type === '' ||
            mouseevent.bubbles === undefined ||
            mouseevent.cancelable === undefined) {
          throw new SyntaxError("[object MouseEvent](function): Must call 'this.initMouseEvent(type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget)' within the function argument.");
        }
        /*END_DEBUG*/
      } else {
        //passed a doodle or dom event object
        copy_mouseevent_properties(init_obj);
      }
    } else {
      //standard instantiation
      mouseevent.initMouseEvent(type, bubbles, cancelable, view, detail,
                                screenX, screenY, clientX, clientY, 
                                ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget);
    }
    
    return mouseevent;
  };
    
  
  mouseevent_static_properties = {
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return "[object MouseEvent]";
      }
    }
  };

}());//end class closure
/*globals doodle*/

/* TouchEvent support is expermental.
 * http://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchEventClassReference/TouchEvent/TouchEvent.html
 */
(function () {
  var touchevent_static_properties,
      isEvent = doodle.Event.isEvent,
      check_boolean_type = doodle.utils.types.check_boolean_type,
      check_number_type = doodle.utils.types.check_number_type,
      check_string_type = doodle.utils.types.check_string_type;
  
  /* Super constructor
   * @param {String} type
   * @param {Boolean} bubbles
   * @param {Boolean} cancelable
   * @param {DOM Object} view
   * @param {Number} detail
   * @param {Number} screenX
   * @param {Number} screenY
   * @param {Number} clientX
   * @param {Number} clientY
   * @param {Boolean} ctrlKey
   * @param {Boolean} altKey
   * @param {Boolean} shiftKey
   * @param {Boolean} metaKey
   * @param {} touches
   * @param {} targetTouches
   * @param {} changedTouches
   * @param {Number} scale
   * @param {Number} rotation
   *
   * @alternative instantiation
   * @param {Event} initializer event to wrap
   *
   * @return {TouchEvent}
   */
  doodle.TouchEvent = function (type, bubbles, cancelable, view, detail,
                                screenX, screenY, clientX, clientY,
                                ctrlKey, altKey, shiftKey, metaKey,
                                touches, targetTouches, changedTouches,
                                scale, rotation) {
    var touchevent,
        arg_len = arguments.length,
        init_obj, //function, event
        copy_touchevent_properties; //fn declared per event for private vars
    
    /*DEBUG*/
    if (arg_len === 0 || arg_len > 18) {
      throw new SyntaxError("[object TouchEvent](type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation");
    }
    /*END_DEBUG*/

    //initialize uievent prototype with another event, function, or args
    if (isEvent(arguments[0])) {
      /*DEBUG*/
      if (arg_len > 1) {
        throw new SyntaxError("[object TouchEvent](event): Invalid number of parameters.");
      }
      /*END_DEBUG*/
      init_obj = arguments[0];
      type = undefined;
      touchevent = Object.create(doodle.UIEvent(init_obj));
    } else if (typeof arguments[0] === 'function') {
      /*DEBUG*/
      if (arg_len > 1) {
        throw new SyntaxError("[object TouchEvent](function): Invalid number of parameters.");
      }
      /*END_DEBUG*/
      init_obj = arguments[0];
      type = undefined;
      //use empty event type for now, will check after we call the init function.
      touchevent = Object.create(doodle.UIEvent(''));
    } else {
      //parameter defaults
      bubbles = (bubbles === undefined) ? false : bubbles;
      cancelable = (cancelable === undefined) ? false : cancelable;
      view = (view === undefined) ? null : view;
      detail = (detail === undefined) ? 0 : detail;
      /*DEBUG*/
      check_string_type(type, '[object TouchEvent]', '*type*, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
      check_boolean_type(bubbles, '[object TouchEvent]', 'type, *bubbles*, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
      check_boolean_type(cancelable, '[object TouchEvent]', 'type, bubbles, *cancelable*, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
      check_number_type(detail, '[object TouchEvent]', 'type, bubbles, cancelable, view, *detail*, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
      /*END_DEBUG*/
      touchevent = Object.create(doodle.UIEvent(type, bubbles, cancelable, view, detail));
    }
    
    
    Object.defineProperties(touchevent, touchevent_static_properties);
    //properties that require privacy
    Object.defineProperties(touchevent, (function () {
      var evt_screenX = 0,
          evt_screenY = 0,
          evt_clientX = 0,
          evt_clientY = 0,
          evt_ctrlKey = false,
          evt_altKey = false,
          evt_shiftKey = false,
          evt_metaKey = false,
          evt_touches = null,
          evt_targetTouches = null,
          evt_changedTouches = null,
          evt_scale = 1,
          evt_rotation = 0;

      copy_touchevent_properties = function (evt) {
        //only looking for TouchEvent properties
        if (evt.screenX !== undefined) { evt_screenX = evt.screenX; }
        if (evt.screenY !== undefined) { evt_screenY = evt.screenY; }
        if (evt.clientX !== undefined) { evt_clientX = evt.clientX; }
        if (evt.clientY !== undefined) { evt_clientY = evt.clientY; }
        if (evt.ctrlKey !== undefined) { evt_ctrlKey = evt.ctrlKey; }
        if (evt.altKey !== undefined) { evt_altKey = evt.altKey; }
        if (evt.shiftKey !== undefined) { evt_shiftKey = evt.shiftKey; }
        if (evt.metaKey !== undefined) { evt_metaKey = evt.metaKey; }
        if (evt.touches !== undefined) { evt_touches = evt.touches; }
        if (evt.targetTouches !== undefined) { evt_targetTouches = evt.targetTouches; }
        if (evt.changedTouches !== undefined) { evt_changedTouches = evt.changedTouches; }
        if (evt.scale !== undefined) { evt_scale = evt.scale; }
        if (evt.rotation !== undefined) { evt_rotation = evt.rotation; }
      };
      
      return {
        'screenX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_screenX; }
        },

        'screenY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_screenY; }
        },

        'clientX': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_clientX; }
        },

        'clientY': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_clientY; }
        },
        
        'ctrlKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_ctrlKey; }
        },

        'altKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_altKey; }
        },

        'shiftKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_shiftKey; }
        },

        'metaKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_metaKey; }
        },

        'touches': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_touches; }
        },

        'targetTouches': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_targetTouches; }
        },

        'changedTouches': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_changedTouches; }
        },

        'scale': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_scale; }
        },

        'rotation': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_rotation; }
        },

        'initTouchEvent': {
          value: function (typeArg, canBubbleArg, cancelableArg, viewArg, detailArg,
                           screenXArg, screenYArg, clientXArg, clientYArg,
                           ctrlKeyArg, altKeyArg, shiftKeyArg, metaKeyArg,
                           touchesArg, targetTouchesArg, changedTouchesArg,
                           scaleArg, rotationArg) {
            //parameter defaults
            canBubbleArg = (canBubbleArg === undefined) ? false : canBubbleArg;
            cancelableArg = (cancelableArg === undefined) ? false : cancelableArg;
            viewArg = (viewArg === undefined) ? null : viewArg;
            detailArg = (detailArg === undefined) ? 0 : detailArg;
            screenXArg = (screenXArg === undefined) ? 0 : screenXArg;
            screenYArg = (screenYArg === undefined) ? 0 : screenYArg;
            clientXArg = (clientXArg === undefined) ? 0 : clientXArg;
            clientYArg = (clientYArg === undefined) ? 0 : clientYArg;
            ctrlKeyArg = (ctrlKeyArg === undefined) ? false : ctrlKeyArg;
            altKeyArg = (altKeyArg === undefined) ? false : altKeyArg;
            shiftKeyArg = (shiftKeyArg === undefined) ? false : shiftKeyArg;
            metaKeyArg = (metaKeyArg === undefined) ? false : metaKeyArg;
            touchesArg = (touchesArg === undefined) ? null : touchesArg;
            targetTouchesArg = (targetTouchesArg === undefined) ? null : targetTouchesArg;
            changedTouchesArg = (changedTouchesArg === undefined) ? null : changedTouchesArg;
            scaleArg = (scaleArg === undefined) ? 1 : scaleArg;
            rotationArg = (rotationArg === undefined) ? 0 : rotationArg;
            /*DEBUG*/
            check_string_type(typeArg, this+'.initTouchEvent', '*type*, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
            check_boolean_type(canBubbleArg, this+'.initTouchEvent', 'type, *bubbles*, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
            check_boolean_type(cancelableArg, this+'.initTouchEvent', 'type, bubbles, *cancelable*, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
            check_number_type(detailArg, this+'.initTouchEvent', 'type, bubbles, cancelable, view, *detail*, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
            check_number_type(screenXArg, this+'.initTouchEvent', 'type, bubbles, cancelable, view, detail, *screenX*, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
            check_number_type(screenYArg, this+'.initTouchEvent', 'type, bubbles, cancelable, view, detail, screenX, *screenY*, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
            check_number_type(clientXArg, this+'.initTouchEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, *clientX*, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
            check_number_type(clientYArg, this+'.initTouchEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, clientX, *clientY*, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
            check_boolean_type(ctrlKeyArg, this+'.initTouchEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, *ctrlKey*, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
            check_boolean_type(altKeyArg, this+'.initTouchEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, *altKey*, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation');
            check_boolean_type(shiftKeyArg, this+'.initTouchEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, *shiftKey*, metaKey, touches, targetTouches, changedTouches, scale, rotation');
            check_boolean_type(metaKeyArg, this+'.initTouchEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, *metaKey*, touches, targetTouches, changedTouches, scale, rotation');
            check_number_type(scaleArg, this+'.initTouchEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, *scale*, rotation');
            check_number_type(rotationArg, this+'.initTouchEvent', 'type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, *rotation*');
            /*END_DEBUG*/
            evt_screenX = screenXArg;
            evt_screenY = screenYArg;
            evt_clientX = clientXArg;
            evt_clientY = clientYArg;
            evt_ctrlKey = ctrlKeyArg;
            evt_altKey = altKeyArg;
            evt_shiftKey = shiftKeyArg;
            evt_metaKey = metaKeyArg;
            evt_touches = touchesArg;
            evt_targetTouches = targetTouchesArg;
            evt_changedTouches = changedTouchesArg;
            evt_scale = scaleArg;
            evt_rotation = rotationArg;

            this.initUIEvent(typeArg, canBubbleArg, cancelableArg, viewArg, detailArg);
            return this;
          }
        },

        /* Queries the state of a modifier using a key identifier.
         * @param {String} key A modifier key identifier
         * @return {Boolean} True if it is a modifier key and the modifier is activated, false otherwise.
         * This is an incomplete list of modifiers.
         */
        'getModifierState': {
          value: function (key) {
            check_string_type(key, this+'.getModifierState', '*key*');
            switch (key) {
            case 'Alt':
              return evt_altKey;
            case 'Control':
              return evt_ctrlKey;
            case 'Meta':
              return evt_metaKey;
            case 'Shift':
              return evt_shiftKey;
            default:
              return false;
            }
          }
        }
      };
    }()));//end defineProperties


    //initialize touchevent
    if (init_obj) {
      if (typeof init_obj === 'function') {
        init_obj.call(touchevent);
        /*DEBUG*/
        //make sure we've checked our dummy type string
        if (touchevent.type === undefined || touchevent.type === '' ||
            touchevent.bubbles === undefined ||
            touchevent.cancelable === undefined) {
          throw new SyntaxError("[object TouchEvent](function): Must call 'this.initTouchEvent(type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation)' within the function argument.");
        }
        /*END_DEBUG*/
      } else {
        //passed a doodle or dom event object
        copy_touchevent_properties(init_obj);
      }
    } else {
      //standard instantiation
      touchevent.initTouchEvent(type, bubbles, cancelable, view, detail,
                                screenX, screenY, clientX, clientY,
                                ctrlKey, altKey, shiftKey, metaKey,
                                touches, targetTouches, changedTouches, scale, rotation);
    }
    
    return touchevent;
  };
    
  
  touchevent_static_properties = {
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return "[object TouchEvent]";
      }
    }
  };

}());//end class closure
/*globals doodle*/

/* DOM 3 Event: TextEvent:UIEvent
 * http://www.w3.org/TR/DOM-Level-3-Events/#events-textevents
 */
(function () {
  var textevent_static_properties,
      isEvent = doodle.Event.isEvent,
      check_boolean_type = doodle.utils.types.check_boolean_type,
      check_number_type = doodle.utils.types.check_number_type,
      check_string_type = doodle.utils.types.check_string_type;
  
  /* Super constructor
   * @param {String} type
   * @param {Boolean} bubbles
   * @param {Boolean} cancelable
   * @param {DOM Object} view
   * @param {String} data
   * @param {Number} inputMode
   *
   * @alternative instantiation
   * @param {Event} initializer event to wrap
   *
   * @return {TextEvent}
   */
  doodle.TextEvent = function (type, bubbles, cancelable, view, data, inputMode) {
    var textevent,
        arg_len = arguments.length,
        init_obj, //function, event
        copy_textevent_properties; //fn declared per event for private vars

    /*DEBUG*/
    if (arg_len === 0 || arg_len > 6) {
      throw new SyntaxError("[object TextEvent](type, bubbles, cancelable, view, data, inputMode): Invalid number of parameters.");
    }
    /*END_DEBUG*/

    //initialize uievent prototype with another event, function, or args
    if (isEvent(arguments[0])) {
      /*DEBUG*/
      if (arg_len > 1) {
        throw new SyntaxError("[object TextEvent](event): Invalid number of parameters.");
      }
      /*END_DEBUG*/
      init_obj = arguments[0];
      type = undefined;
      textevent = Object.create(doodle.UIEvent(init_obj));
    } else if (typeof arguments[0] === 'function') {
      /*DEBUG*/
      if (arg_len > 1) {
        throw new SyntaxError("[object TextEvent](function): Invalid number of parameters.");
      }
      /*END_DEBUG*/
      init_obj = arguments[0];
      type = undefined;
      //use empty event type for now, will check after we call the init function.
      textevent = Object.create(doodle.UIEvent(''));
    } else {
      //parameter defaults
      bubbles = (bubbles === undefined) ? false : bubbles;
      cancelable = (cancelable === undefined) ? false : cancelable;
      view = (view === undefined) ? null : view;
      /*DEBUG*/
      check_string_type(type, '[object TextEvent]', '*type*, bubbles, cancelable, view, data, inputMode');
      check_boolean_type(bubbles, '[object TextEvent]', 'type, *bubbles*, cancelable, view, data, inputMode');
      check_boolean_type(cancelable, '[object TextEvent]', 'type, bubbles, *cancelable*, view, data, inputMode');
      /*END_DEBUG*/
      textevent = Object.create(doodle.UIEvent(type, bubbles, cancelable, view));
    }
    
    Object.defineProperties(textevent, textevent_static_properties);
    //properties that require privacy
    Object.defineProperties(textevent, (function () {
      var evt_data = '',
          evt_inputMode = doodle.TextEvent.INPUT_METHOD_UNKNOWN;

      copy_textevent_properties = function (evt) {
        //only looking for TextEvent properties
        if (evt.data !== undefined) { evt_data = evt.data; }
        if (evt.inputMode !== undefined) { evt_inputMode = evt.inputMode; }
      };
      
      return {
        'data': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_data; }
        },

        'inputMode': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_inputMode; }
        },

        'initTextEvent': {
          value: function (typeArg, canBubbleArg, cancelableArg, viewArg, dataArg, inputModeArg) {
            //parameter defaults
            canBubbleArg = (canBubbleArg === undefined) ? false : canBubbleArg;
            cancelableArg = (cancelableArg === undefined) ? false : cancelableArg;
            viewArg = (viewArg === undefined) ? null : viewArg;
            dataArg = (dataArg === undefined) ? '' : dataArg;
            inputModeArg = (inputModeArg === undefined) ? doodle.TextEvent.INPUT_METHOD_UNKNOWN : inputModeArg;
            /*DEBUG*/
            check_string_type(typeArg, this+'.initTextEvent', '*type*, bubbles, cancelable, view, data, inputMode');
            check_boolean_type(canBubbleArg, this+'.initTextEvent', 'type, *bubbles*, cancelable, view, data, inputMode');
            check_boolean_type(cancelableArg, this+'.initTextEvent', 'type, bubbles, *cancelable*, view, data, inputMode');
            check_string_type(dataArg, this+'.initTextEvent', 'type, bubbles, cancelable, view, *data*, inputMode');
            check_number_type(inputModeArg, this+'.initTextEvent', 'type, bubbles, cancelable, view, data, *inputMode*');
            /*END_DEBUG*/
            evt_data = dataArg;
            evt_inputMode = inputModeArg;
            
            this.initUIEvent(typeArg, canBubbleArg, cancelableArg, viewArg);
            return this;
          }
        }
      };
    }()));

    //initialize textevent
    if (init_obj) {
      if (typeof init_obj === 'function') {
        init_obj.call(textevent);
        /*DEBUG*/
        //make sure we've checked our dummy type string
        if (textevent.type === undefined || textevent.type === '' ||
            textevent.bubbles === undefined ||
            textevent.cancelable === undefined) {
          throw new SyntaxError("[object TextEvent](function): Must call 'this.initTextEvent(type, bubbles, cancelable, view, data, inputMode)' within the function argument.");
        }
        /*END_DEBUG*/
      } else {
        //passed a doodle or dom event object
        copy_textevent_properties(init_obj);
      }
    } else {
      //standard instantiation
      textevent.initTextEvent(type, bubbles, cancelable, view, data, inputMode);
    }
    
    return textevent;
  };
  
  
  textevent_static_properties = {
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return "[object TextEvent]";
      }
    }
  };
  
}());//end class closure
/*globals doodle*/

/* DOM 3 Event: KeyboardEvent:UIEvent
 * http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
 */

(function () {
  var keyboardevent_static_properties,
      isEvent = doodle.Event.isEvent,
      check_boolean_type = doodle.utils.types.check_boolean_type,
      check_number_type = doodle.utils.types.check_number_type,
      check_string_type = doodle.utils.types.check_string_type;
  
  /* Super constructor
   * @param {String} type
   * @param {Boolean} bubbles
   * @param {Boolean} cancelable
   * @param {DOM Object} view
   * @param {String} keyIdentifier
   * @param {Number} keyLocation
   * @param {String} modifiersList White-space separated list of key modifiers.
   * @param {Boolean} repeat
   *
   * @alternative instantiation
   * @param {Event} initializer event to wrap
   *
   * @return {KeyboardEvent}
   */
  doodle.KeyboardEvent = function (type, bubbles, cancelable, view,
                                   keyIdentifier, keyLocation, modifiersList, repeat) {
    var keyboardevent,
        arg_len = arguments.length,
        init_obj, //function, event
        copy_keyboardevent_properties; //fn declared per event for private vars

    /*DEBUG*/
    if (arg_len === 0 || arg_len > 8) {
      throw new SyntaxError("[object KeyboardEvent](type, bubbles, cancelable, view, keyIdentifier, keyLocation, modifiersList, repeat): Invalid number of parameters.");
    }
    /*END_DEBUG*/

    //initialize uievent prototype with another event, function, or args
    if (isEvent(arguments[0])) {
      /*DEBUG*/
      if (arg_len > 1) {
        throw new SyntaxError("[object KeyboardEvent](event): Invalid number of parameters.");
      }
      /*END_DEBUG*/
      init_obj = arguments[0];
      type = undefined;
      keyboardevent = Object.create(doodle.UIEvent(init_obj));
    } else if (typeof arguments[0] === 'function') {
      /*DEBUG*/
      if (arg_len > 1) {
        throw new SyntaxError("[object KeyboardEvent](function): Invalid number of parameters.");
      }
      /*END_DEBUG*/
      init_obj = arguments[0];
      type = undefined;
      //use empty event type for now, will check after we call the init function.
      keyboardevent = Object.create(doodle.UIEvent(''));
    } else {
      //parameter defaults
      bubbles = (bubbles === undefined) ? false : bubbles;
      cancelable = (cancelable === undefined) ? false : cancelable;
      view = (view === undefined) ? null : view;
      /*DEBUG*/
      check_string_type(type, '[object KeyboardEvent]', '*type*, bubbles, cancelable, view, keyIdentifier, keyLocation, modifiersList, repeat');
      check_boolean_type(bubbles, '[object KeyboardEvent]', 'type, *bubbles*, cancelable, view, keyIdentifier, keyLocation, modifiersList, repeat');
      check_boolean_type(cancelable, '[object KeyboardEvent]', 'type, bubbles, *cancelable*, view, keyIdentifier, keyLocation, modifiersList, repeat');
      /*END_DEBUG*/
      keyboardevent = Object.create(doodle.UIEvent(type, bubbles, cancelable, view));
    }
    
    Object.defineProperties(keyboardevent, keyboardevent_static_properties);
    //properties that require privacy
    Object.defineProperties(keyboardevent, (function () {
      var evt_keyIdentifier = "",
          evt_keyLocation = 0,
          evt_repeat = false,
          evt_ctrlKey = false,
          evt_altKey = false,
          evt_shiftKey = false,
          evt_metaKey = false;

      copy_keyboardevent_properties = function (evt) {
        //only looking for KeyboardEvent properties
        if (evt.keyIdentifier !== undefined) { evt_keyIdentifier = evt.keyIdentifier; }
        if (evt.keyLocation !== undefined) { evt_keyLocation = evt.keyLocation; }
        if (evt.repeat !== undefined) { evt_repeat = evt.repeat; }
        if (evt.ctrlKey !== undefined) { evt_ctrlKey = evt.ctrlKey; }
        if (evt.altKey !== undefined) { evt_altKey = evt.altKey; }
        if (evt.shiftKey !== undefined) { evt_shiftKey = evt.shiftKey; }
        if (evt.metaKey !== undefined) { evt_metaKey = evt.metaKey; }
      };
      
      return {
        'keyIdentifier': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_keyIdentifier; }
        },

        'keyLocation': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_keyLocation; }
        },

        'repeat': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_repeat; }
        },

        'ctrlKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_ctrlKey; }
        },
        
        'altKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_altKey; }
        },

        'shiftKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_shiftKey; }
        },

        'metaKey': {
          enumerable: true,
          configurable: false,
          get: function () { return evt_metaKey; }
        },

        'initKeyboardEvent': {
          value: function (typeArg, canBubbleArg, cancelableArg, viewArg,
                           keyIdentifierArg, keyLocationArg, modifiersListArg, repeatArg) {
            //parameter defaults
            canBubbleArg = (canBubbleArg === undefined) ? false : canBubbleArg;
            cancelableArg = (cancelableArg === undefined) ? false : cancelableArg;
            viewArg = (viewArg === undefined) ? null : viewArg;
            keyIdentifierArg = (keyIdentifierArg === undefined) ? "" : keyIdentifierArg;
            keyLocationArg = (keyLocationArg === undefined) ? 0 : keyLocationArg;
            modifiersListArg = (modifiersListArg === undefined) ? "" : modifiersListArg;
            repeatArg = (repeatArg === undefined) ? false : repeatArg;
            /*DEBUG*/
            check_string_type(typeArg, this+'.initKeyboardEvent', '*type*, bubbles, cancelable, view, keyIdentifier, keyLocation, modifiersList, repeat');
            check_boolean_type(canBubbleArg, this+'.initKeyboardEvent', 'type, *bubbles*, cancelable, view, keyIdentifier, keyLocation, modifiersList, repeat');
            check_boolean_type(cancelableArg, this+'.initKeyboardEvent', 'type, bubbles, *cancelable*, view, keyIdentifier, keyLocation, modifiersList, repeat');
            check_string_type(keyIdentifierArg, this+'.initKeyboardEvent', 'type, bubbles, cancelable, view, *keyIdentifier*, keyLocation, modifiersList, repeat');
            check_number_type(keyLocationArg, this+'.initKeyboardEvent', 'type, bubbles, cancelable, view, keyIdentifier, *keyLocation*, modifiersList, repeat');
            check_string_type(modifiersListArg, this+'.initKeyboardEvent', 'type, bubbles, cancelable, view, keyIdentifier, keyLocation, *modifiersList*, repeat');
            check_boolean_type(repeatArg, this+'.initKeyboardEvent', 'type, bubbles, cancelable, view, keyIdentifier, keyLocation, modifiersList, *repeat*');
            /*END_DEBUG*/
            evt_keyIdentifier = keyIdentifierArg;
            evt_keyLocation = keyLocationArg;
            evt_repeat = repeatArg;
            
            //parse string of white-space separated list of modifier key identifiers
            modifiersListArg.split(" ").forEach(function (modifier) {
              switch (modifier) {
              case 'Alt':
                evt_altKey = true;
                break;
              case 'Control':
                evt_ctrlKey = true;
                break;
              case 'Meta':
                evt_metaKey = true;
                break;
              case 'Shift':
                evt_shiftKey = true;
                break;
              }
            });
            
            this.initUIEvent(typeArg, canBubbleArg, cancelableArg, viewArg);
            return this;
          }
        },

        /* Queries the state of a modifier using a key identifier.
         * @param {String} key A modifier key identifier
         * @return {Boolean} True if it is a modifier key and the modifier is activated, false otherwise.
         * This is an incomplete list of modifiers.
         */
        'getModifierState': {
          value: function (key) {
            check_string_type(key, this+'.getModifierState', '*key*');
            switch (key) {
            case 'Alt':
              return evt_altKey;
            case 'Control':
              return evt_ctrlKey;
            case 'Meta':
              return evt_metaKey;
            case 'Shift':
              return evt_shiftKey;
            default:
              return false;
            }
          }
        }
      };
    }()));

    //initialize keyboardevent
    if (init_obj) {
      if (typeof init_obj === 'function') {
        init_obj.call(keyboardevent);
        /*DEBUG*/
        //make sure we've checked our dummy type string
        if (keyboardevent.type === undefined || keyboardevent.type === '' ||
            keyboardevent.bubbles === undefined ||
            keyboardevent.cancelable === undefined) {
          throw new SyntaxError("[object KeyboardEvent](function): Must call 'this.initKeyboardEvent(type, bubbles, cancelable, view, keyIdentifier, keyLocation, modifiersList, repeat)' within the function argument.");
        }
        /*END_DEBUG*/
      } else {
        //passed a doodle or dom event object
        copy_keyboardevent_properties(init_obj);
      }
    } else {
      //standard instantiation
      keyboardevent.initKeyboardEvent(type, bubbles, cancelable, view,
                                      keyIdentifier, keyLocation, modifiersList, repeat);
    }
    
    return keyboardevent;
  };
    

  keyboardevent_static_properties = {
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () {
        return "[object KeyboardEvent]";
      }
    }
  };

}());//end class closure

/* EVENT
 */
Object.defineProperties(doodle.Event, {

  'CAPTURING_PHASE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 1
  },

  'AT_TARGET': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 2
  },

  'BUBBLING_PHASE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 3
  },

  /* Dispatched when object is added to display path.
   */
  'ADDED': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "added"
  },

  /* Dispatched when object is removed from display path.
   */
  'REMOVED': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "removed"
  },

  'ENTER_FRAME': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "enterFrame"
  },

  /* Dispatched when element is loaded.
   */
  'LOAD': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "load"
  },

  'CHANGE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "change"
  }
});


/* UI EVENT
 */
Object.defineProperties(doodle.UIEvent, {
  'FOCUS_IN': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "focusIn"
  }
});


/* MOUSE EVENT
 * Compatibility tables: http://www.quirksmode.org/dom/events/index.html
 */
Object.defineProperties(doodle.MouseEvent, {

  /* To test for left/middle/right button check value for event.which (0,1,2)
   */
  'CLICK': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "click"
  },

  'DOUBLE_CLICK': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "dblclick"
  },

  'CONTEXT_MENU': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "contextmenu"
  },

  'MOUSE_DOWN': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mousedown"
  },

  'MOUSE_UP': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mouseup"
  },

  'MOUSE_WHEEL': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mousewheel"
  },

  'MOUSE_MOVE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mousemove"
  },

  'MOUSE_OUT': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mouseout"
  },

  'MOUSE_OVER': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mouseover"
  },

  'MOUSE_ENTER': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mouseenter"
  },

  'MOUSE_LEAVE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "mouseleave"
  }
  
});


/* TOUCH EVENT
 * http://developer.apple.com/library/safari/#documentation/UserExperience/Reference/TouchEventClassReference/TouchEvent/TouchEvent.html
 */
Object.defineProperties(doodle.TouchEvent, {
  
  'TOUCH_START': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "touchstart"
  },

  'TOUCH_MOVE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "touchmove"
  },

  'TOUCH_END': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "touchend"
  },

  'TOUCH_CANCEL': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "touchcancel"
  }
  
});


/* KEYBOARD EVENT
 */
Object.defineProperties(doodle.KeyboardEvent, {
  
  'KEY_PRESS': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "keypress"
  },

  'KEY_UP': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "keyup"
  },

  'KEY_DOWN': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "keydown"
  },

  'KEY_LOCATION_STANDARD': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x00
  },

  'KEY_LOCATION_LEFT': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x01
  },

  'KEY_LOCATION_RIGHT': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x02
  },

  'KEY_LOCATION_NUMPAD': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x03
  },

  'KEY_LOCATION_MOBILE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x04
  },

  'KEY_LOCATION_JOYSTICK': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x05
  }  
});


/* TEXT EVENT
 */
Object.defineProperties(doodle.TextEvent, {

  'TEXT_INPUT': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: "textInput"
  },

  'INPUT_METHOD_UNKNOWN': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x00
  },

  'INPUT_METHOD_KEYBOARD': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x01
  },

  'INPUT_METHOD_PASTE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x02
  },

  'INPUT_METHOD_DROP': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x03
  },

  'INPUT_METHOD_IME': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x04
  },

  'INPUT_METHOD_OPTION': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x05
  },

  'INPUT_METHOD_HANDWRITING': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x06
  },

  'INPUT_METHOD_VOICE': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x07
  },

  'INPUT_METHOD_MULTIMODAL': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x08
  },

  'INPUT_METHOD_SCRIPT': {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 0x09
  }  
});
(function () {
  var point_static_properties,
      isPoint,
      doodle_Point,
      check_point_type,
      check_number_type = doodle.utils.types.check_number_type;
  
  /* Super constructor
   * @param {Number|Array|Point|Function} (x,y)|initializer
   * @return {Object}
   */
  doodle_Point = doodle.geom.Point = function (x, y) {
    var point = {},
        arg_len = arguments.length,
        init_obj; //function, array, point

    /*DEBUG*/
    if (arg_len > 2) {
      throw new SyntaxError("[object Point](x, y): Invalid number of parameters.");
    }
    /*END_DEBUG*/

    Object.defineProperties(point, point_static_properties);
    //properties that require privacy
    Object.defineProperties(point, {
      /* The horizontal coordinate of the point.
       * @param {Number} x
       */
      'x': {
        enumerable: true,
        configurable: false,
        get: function () { return x; },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.x');
          /*END_DEBUG*/
          x = n;
        }
      },

      /* The vertical coordinate of the point.
       * @param {Number} y
       */
      'y': {
        enumerable: true,
        configurable: false,
        get: function () { return y; },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.y');
          /*END_DEBUG*/
          y = n;
        }
      }
    });

    //initialize point
    if (arg_len === 0) {
      //default instantiation: {x:0, y:0}
      point.compose(0, 0);
    } else if (arg_len === 2) {
      //standard instantiation
      point.compose(x, y);
    } else {
      //passed an initialization obj
      init_obj = arguments[0];
      x = undefined;
      
      if (typeof init_obj === 'function') {
        point.compose(0, 0);
        init_obj.call(point);
      }  else if (Array.isArray(init_obj)) {
        /*DEBUG*/
        if (init_obj.length !== 2) {
          throw new SyntaxError("[object Point]([x, y]): Invalid array parameter.");
        }
        /*END_DEBUG*/
        point.compose.apply(point, init_obj);
      } else {
        /*DEBUG*/
        check_point_type(init_obj, '[object Point](point)');
        /*END_DEBUG*/
        point.compose(init_obj.x, init_obj.y);
      }
    }

    return point;
  };

  
  point_static_properties = {
    /* The length of the line segment from (0,0) to this point.
     * @return {Number}
     */
    'length': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.distance({x:0,y:0}, this);
      }
    },

    /*
     * METHODS
     */
    
    /* Set point coordinates.
     * @param {Number} x
     * @param {Number} y
     * @return {Point}
     */
    'compose': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (x, y) {
        /*DEBUG*/
        check_number_type(x, this+'.compose', '*x*, y');
        check_number_type(y, this+'.compose', 'x, *y*');
        /*END_DEBUG*/
        this.x = x;
        this.y = y;
        return this;
      }
    },

    /* Creates a copy of this Point object.
     * @return {Point}
     */
    'clone': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return doodle_Point(this.x, this.y);
      }
    },

    /* Returns an array that contains the values of the x and y coordinates.
     * @return {Array}
     */
    'toArray': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        var a = new Array(2);
        a[0] = this.x;
        a[1] = this.y;
        return a;
      }
    },
    
    /* Returns a string that contains the values of the x and y coordinates.
     * @return {String}
     */
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return "(x=" + this.x + ", y=" + this.y + ")";
      }
    },

    /* Returns the distance between pt1 and pt2.
     * @return {Number}
     */
    'distance': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (pt1, pt2) {
        /*DEBUG*/
        check_point_type(pt1, this+'.distance', '*pt1*, pt2');
        check_point_type(pt2, this+'.distance', 'pt1, *pt2*');
        /*END_DEBUG*/
        var dx = pt2.x - pt1.x,
            dy = pt2.y - pt1.x;
        return Math.sqrt(dx*dx+dy*dy);
      }
    },

    /* Scales the line segment between (0,0) and the
     * current point to a set length.
     * @param {Number} thickness The scaling value.
     * @return {Point}
     */
    'normalize': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (thickness) {
        /*DEBUG*/
        check_number_type(thickness, this+'.normalize', '*thickness*');
        /*END_DEBUG*/
        var len = this.length;
        this.x = (this.x / len) * thickness;
        this.y = (this.y / len) * thickness;
        return this;
        /*correct version?
          var angle:Number = Math.atan2(this.y, this.x);
          this.x = Math.cos(angle) * thickness;
          this.y = Math.sin(angle) * thickness;
        */
      }
    },

    /* Determines whether two points are equal.
     * @param {Point} pt The point to be compared.
     * @return {Boolean}
     */
    'equals': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (pt) {
        /*DEBUG*/
        check_point_type(pt, this+'.equals', '*point*');
        /*END_DEBUG*/
        return ((this && pt &&
                 this.x === pt.x &&
                 this.y === pt.y) ||
                (!this && !pt));
      }
    },

    /* Determines a point between two specified points.
     * @static
     * @param {Point} pt1 The first point.
     * @param {Point} pt2 The second point.
     * @param {Number} t The level of interpolation between the two points, between 0 and 1.
     * @return {Point}
     */
    'interpolate': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (pt1, pt2, t) {
        /*DEBUG*/
        check_point_type(pt1, this+'.interpolate', '*pt1*, pt2, t');
        check_point_type(pt2, this+'.interpolate', 'pt1, *pt2*, t');
        check_number_type(t, this+'.interpolate', 'pt1, pt2, *t*');
        /*END_DEBUG*/
        var x = pt1.x + (pt2.x - pt1.x) * t,
            y = pt1.y + (pt2.y - pt1.y) * t;
        return doodle_Point(x, y);

        /* correct version?
           var nx = pt2.x - pt1.x;
           var ny = pt2.y - pt1.y;
           var angle = Math.atan2(ny , nx);
           var dis = Math.sqrt(x * nx + ny * ny) * t;
           var sx = pt2.x - Math.cos(angle) * dis;
           var sy = pt2.y - Math.sin(angle) * dis;
           return Object.create(point).compose(sx, sy);
        */
      }
    },

    /* Converts a pair of polar coordinates to a Cartesian point coordinate.
     * @static
     * @param {Number} len The length coordinate of the polar pair.
     * @param {Number} angle The angle, in radians, of the polar pair.
     * @return {Point}
     */
    'polar': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (len, angle) {
        /*DEBUG*/
        check_number_type(len, this+'.polar', '*len*, angle');
        check_number_type(angle, this+'.polar', 'len, *angle*');
        /*END_DEBUG*/
        var x = len * Math.cos(angle),
            y = len * Math.sin(angle);
        return doodle_Point(x, y);
      }
    },

    /* Adds the coordinates of another point to the coordinates of
     * this point to create a new point.
     * @param {Point} pt The point to be added.
     * @return {Point} The new point.
     */
    'add': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (pt) {
        /*DEBUG*/
        check_point_type(pt, this+'.add', '*point*');
        /*END_DEBUG*/
        var x = this.x + pt.x,
            y = this.y + pt.y;
        return doodle_Point(x, y);
      }
    },

    /* Subtracts the coordinates of another point from the
     * coordinates of this point to create a new point.
     * @param {Point} pt The point to be subtracted.
     * @return {Point} The new point.
     */
    'subtract': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (pt) {
        /*DEBUG*/
        check_point_type(pt, this+'.subtract', '*point*');
        /*END_DEBUG*/
        var x = this.x - pt.x,
            y = this.y - pt.y;
        return doodle_Point(x, y);
      }
    },

    'offset': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (dx, dy) {
        /*DEBUG*/
        check_number_type(dx, this+'.offset', '*dx*, dy');
        check_number_type(dy, this+'.offset', 'dx, *dy*');
        /*END_DEBUG*/
        this.x += dx;
        this.y += dy;
        return this;
      }
    }
  };//end point_static_properties definition

  /*
   * CLASS FUNCTIONS
   */

  /* Check if a given object contains a numeric x and y property.
   * Does not check if a point is actually a doodle.geom.point.
   * @param {Point} point Object with x and y numeric parameters.
   * @param {String} fn_name Function name to show in TypeError message.
   * @return {Boolean}
   */
  isPoint = doodle.geom.Point.isPoint = function (pt) {
    return (pt && typeof pt.x === 'number' && typeof pt.y === 'number');
  };

  check_point_type = doodle.utils.types.check_point_type = function (pt, caller, param) {
    if (!isPoint(pt)) {
      caller = (caller === undefined) ? "check_point_type" : caller;
      param = (param === undefined) ? "" : '('+param+')';
      throw new TypeError(caller + param +": Parameter must be a point.");
    } else {
      return true;
    }
  };
  
}());//end class closure
(function () {
  var matrix_static_properties,
      doodle_Matrix,
      isMatrix,
      check_matrix_type,
      doodle_Point = doodle.geom.Point,
      check_number_type = doodle.utils.types.check_number_type,
      check_point_type = doodle.utils.types.check_point_type,
      sin = Math.sin,
      cos = Math.cos,
      atan2 = Math.atan2,
      tan = Math.tan;
  
  /* Super constructor
   * @param {Number|Array|Matrix|Function} (a, b, c, d, tx, ty)|initializer
   * @return {Object}
   */
  doodle_Matrix = doodle.geom.Matrix = function (a, b, c, d, tx, ty) {
    var matrix = {},
        arg_len = arguments.length,
        init_obj; //function, array, matrix

    /*DEBUG*/
    if (arg_len !== 0 && arg_len !== 1 && arg_len !== 6) {
      throw new SyntaxError("[object Matrix](a, b, c, d, tx, ty): Invalid number of parameters.");
    }
    /*END_DEBUG*/
    
    Object.defineProperties(matrix, matrix_static_properties);
    //properties that require privacy
    Object.defineProperties(matrix, {

      /* The value that affects the positioning of pixels along the x axis
       * when scaling or rotating an image.
       * @param {Number} a
       */
      'a': {
        enumerable: true,
        configurable: false,
        get: function () { return a; },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.a');
          /*END_DEBUG*/
          a = n;
        }
      },

      /* The value that affects the positioning of pixels along the y axis
       * when rotating or skewing an image.
       * @param {Number} b
       */
      'b': {
        enumerable: true,
        configurable: false,
        get: function () { return b; },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.b');
          /*END_DEBUG*/
          b = n;
        }
      },

      /* The value that affects the positioning of pixels along the x axis
       * when rotating or skewing an image.
       * @param {Number} c
       */
      'c': {
        enumerable: true,
        configurable: false,
        get: function () { return c; },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.c');
          /*END_DEBUG*/
          c = n;
        }
      },

      /* The value that affects the positioning of pixels along the y axis
       * when scaling or rotating an image.
       * @param {Number} d
       */
      'd': {
        enumerable: true,
        configurable: false,
        get: function () { return d; },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.d');
          /*END_DEBUG*/
          d = n;
        }
      },

      /* The distance by which to translate each point along the x axis.
       * @param {Number} tx
       */
      'tx': {
        enumerable: true,
        configurable: false,
        get: function () { return tx; },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.tx');
          /*END_DEBUG*/
          tx = n;
        }
      },

      /* The distance by which to translate each point along the y axis.
       * @param {Number} ty
       */
      'ty': {
        enumerable: true,
        configurable: false,
        get: function () { return ty; },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.ty');
          /*END_DEBUG*/
          ty = n;
        }
      }
    });//end defineProperties

    //initialize matrix
    if (arg_len === 0) {
      //default instantiation: 1,0,0,1,0,0
      matrix.identity();
    } else if (arg_len === 6) {
      //standard instantiation
      matrix.compose(a, b, c, d, tx, ty);
    } else {
      //passed an initialization obj
      init_obj = arguments[0];
      a = undefined;
      
      if (typeof init_obj === 'function') {
        matrix.identity();
        init_obj.call(matrix);
      }  else if (Array.isArray(init_obj)) {
        /*DEBUG*/
        if (init_obj.length !== 6) {
          throw new SyntaxError("[object Matrix]([a, b, c, d, tx, ty]): Invalid array parameter.");
        }
        /*END_DEBUG*/
        matrix.compose.apply(matrix, init_obj);
      } else {
        /*DEBUG*/
        check_matrix_type(init_obj, '[object Matrix](matrix)');
        /*END_DEBUG*/
        matrix.compose(init_obj.a, init_obj.b, init_obj.c,
                       init_obj.d, init_obj.tx, init_obj.ty);
      }
    }
    
    return matrix;
  };

  
  matrix_static_properties = {
    /* Set values of this matrix with the specified parameters.
     * @param {Number} a The value that affects the positioning of pixels along the x axis when scaling or rotating an image.
     * @param {Number} b The value that affects the positioning of pixels along the y axis when rotating or skewing an image.
     * @param {Number} c The value that affects the positioning of pixels along the x axis when rotating or skewing an image.
     * @param {Number} d The value that affects the positioning of pixels along the y axis when scaling or rotating an image.
     * @param {Number} tx The distance by which to translate each point along the x axis.
     * @param {Number} ty The distance by which to translate each point along the y axis.
     * @return {Matrix}
     */
    'compose': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (a, b, c, d, tx, ty) {
        /*DEBUG*/
        check_number_type(a, this+'.compose', '*a*, b, c, d, tx, ty');
        check_number_type(b, this+'.compose', 'a, *b*, c, d, tx, ty');
        check_number_type(c, this+'.compose', 'a, b, *c*, d, tx, ty');
        check_number_type(d, this+'.compose', 'a, b, c, *d*, tx, ty');
        check_number_type(tx, this+'.compose', 'a, b, c, d, *tx*, ty');
        check_number_type(ty, this+'.compose', 'a, b, c, d, tx, *ty*');
        /*END_DEBUG*/
        this.a  = a;
        this.b  = b;
        this.c  = c;
        this.d  = d;
        this.tx = tx;
        this.ty = ty;
        return this;
      }
    },
    
    /* Returns an array value containing the properties of the Matrix object.
     * @return {Array}
     */
    'toArray': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        var a = new Array(6);
        a[0] = this.a;
        a[1] = this.b;
        a[2] = this.c;
        a[3] = this.d;
        a[4] = this.tx;
        a[5] = this.ty;
        return a;
      }
    },
    
    /* Returns a text value listing the properties of the Matrix object.
     * @return {String}
     */
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return ("(a="+ this.a +", b="+ this.b +", c="+ this.c +
                ", d="+ this.d +", tx="+ this.tx +", ty="+ this.ty +")");
      }
    },

    /* Test if matrix is equal to this one.
     * @param {Matrix} m
     * @return {Boolean}
     */
    'equals': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (m) {
        /*DEBUG*/
        check_matrix_type(m, this+'.equals', '*matrix*');
        /*END_DEBUG*/
        return ((this && m && 
                 this.a  === m.a &&
                 this.b  === m.b &&
                 this.c  === m.c &&
                 this.d  === m.d &&
                 this.tx === m.tx &&
                 this.ty === m.ty) || 
                (!this && !m));
      }
    },

    /* Sets each matrix property to a value that causes a null transformation.
     * @return {Matrix}
     */
    'identity': {
      enumerable: false,
      writable: false,
      configurable: false,
      value:  function () {
        this.a  = 1;
        this.b  = 0;
        this.c  = 0;
        this.d  = 1;
        this.tx = 0;
        this.ty = 0;
        return this;
      }
    },

    /* Returns a new Matrix object that is a clone of this matrix,
     * with an exact copy of the contained object.
     * @return {Matrix}
     */
    'clone': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return doodle_Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
      }
    },

    /* Multiplies a matrix with the current matrix,
     * effectively combining the geometric effects of the two.
     * @param {Matrix} m The matrix to be concatenated to the source matrix.
     * @return {Matrix}
     */
    'multiply': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (m) {
        /*DEBUG*/
        check_matrix_type(m, this+'.multiply', '*matrix*');
        /*END_DEBUG*/
        var a  = this.a * m.a  + this.c * m.b,
            b  = this.b * m.a  + this.d * m.b,
            c  = this.a * m.c  + this.c * m.d,
            d  = this.b * m.c  + this.d * m.d,
            tx = this.a * m.tx + this.c * m.ty + this.tx,
            ty = this.b * m.tx + this.d * m.ty + this.ty;
        
        return this.compose(a, b, c, d, tx, ty);
      }
    },

    /* Applies a rotation transformation to the Matrix object.
     * @param {Number} angle The rotation angle in radians.
     * @return {Matrix}
     */
    'rotate': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (radians) {
        /*DEBUG*/
        check_number_type(radians, this+'.rotate', '*radians*');
        /*END_DEBUG*/
        var c = cos(radians),
            s = sin(radians),
            m = doodle_Matrix(c, s, -s, c, 0, 0);
        return this.multiply(m);
      }
    },

    /* Applies a rotation transformation to the Matrix object, ignore translation.
     * @param {Number} angle The rotation angle in radians.
     * @return {Matrix}
     */
    'deltaRotate': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (radians) {
        /*DEBUG*/
        check_number_type(radians, this+'.deltaRotate', '*radians*');
        /*END_DEBUG*/
        var x = this.tx,
            y = this.ty;
        this.rotate(radians);
        this.tx = x;
        this.ty = y;
        return this;
      }
    },

    /* Return the angle of rotation in radians.
     * @return {Number} radians
     */
    'rotation': {
      enumerable: true,
      configurable: false,
      get: function () {
        return atan2(this.b, this.a);
      },
      /* Set a new rotation for matrix.
       * @param {Number} angle, in radians
       * @return {Matrix}
       */
      set: function (radians) {
        /*DEBUG*/
        check_number_type(radians, this+'.rotation', '*radians*');
        /*END_DEBUG*/
        var c = cos(radians),
            s = sin(radians);
        return this.compose(c, s, -s, c, this.tx, this.ty);
      }
    },

    /* Applies a scaling transformation to the matrix.
     * @param {Number} sx A multiplier used to scale the object along the x axis.
     * @param {Number} sy A multiplier used to scale the object along the y axis.
     * @return {Matrix}
     */
    'scale': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (sx, sy) {
        /*DEBUG*/
        check_number_type(sx, this+'.scale', '*sx*, sy');
        check_number_type(sy, this+'.scale', 'sx, *sy*');
        /*END_DEBUG*/
        var m = doodle_Matrix(sx, 0, 0, sy, 0, 0);
        return this.multiply(m);
      }
    },

    /* Applies a scaling transformation to the matrix, ignores translation.
     * @param {Number} sx A multiplier used to scale the object along the x axis.
     * @param {Number} sy A multiplier used to scale the object along the y axis.
     * @return {Matrix}
     */
    'deltaScale': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (sx, sy) {
        /*DEBUG*/
        check_number_type(sx, this+'.deltaScale', '*sx*, sy');
        check_number_type(sy, this+'.deltaScale', 'sx, *sy*');
        /*END_DEBUG*/
        var x = this.tx,
            y = this.ty;
        this.scale(sx, sy);
        this.tx = x;
        this.ty = y;
        return this;
      }
    },

    /* Translates the matrix along the x and y axes.
     * @param {Number} dx The amount of movement along the x axis to the right, in pixels.
     * @param {Number} dy The amount of movement down along the y axis, in pixels.
     * @return {Matrix}
     */
    'translate': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (dx, dy) {
        /*DEBUG*/
        check_number_type(dx, this+'.translate', '*dx*, dy');
        check_number_type(dy, this+'.translate', 'dx, *dy*');
        /*END_DEBUG*/
        this.tx += dx;
        this.ty += dy;
        return this;
      }
    },

    /*
     * @param {Number} skewX
     * @param {Number} skewY
     * @return {Matrix}
     */
    'skew': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (skewX, skewY) {
        /*DEBUG*/
        check_number_type(skewX, this+'.skew', '*skewX*, skewY');
        check_number_type(skewY, this+'.skew', 'skewX, *skewY*');
        /*END_DEBUG*/
        var sx = tan(skewX),
            sy = tan(skewY),
            m = doodle_Matrix(1, sy, sx, 1, 0, 0);
        return this.multiply(m);
      }
    },

    /* Skew matrix and ignore translation.
     * @param {Number} skewX
     * @param {Number} skewY
     * @return {Matrix}
     */
    'deltaSkew': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (skewX, skewY) {
        /*DEBUG*/
        check_number_type(skewX, this+'.deltaSkew', '*skewX*, skewY');
        check_number_type(skewY, this+'.deltaSkew', 'skewX, *skewY*');
        /*END_DEBUG*/
        var x = this.tx,
            y = this.ty;
        this.skew(skewX, skewY);
        this.tx = x;
        this.ty = y;
        return this;
      }
    },

    /* Add a matrix with the current matrix.
     * @param {Matrix} m
     * @return {Matrix}
     */
    'add': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (m) {
        /*DEBUG*/
        check_matrix_type(m, this+'.add', '*matrix*');
        /*END_DEBUG*/
        this.a  += m.a;
        this.b  += m.b;
        this.c  += m.c;
        this.d  += m.d;
        this.tx += m.tx;
        this.ty += m.ty;
        return this;
      }
    },

    /* Performs the opposite transformation of the original matrix.
     * @return {Matrix}
     */
    'invert': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        var det = this.a * this.d - this.b * this.c,
            a  =  this.d / det,
            b  = -this.b / det,
            c  = -this.c / det,
            d  =  this.a / det,
            tx =  (this.ty * this.c - this.d * this.tx) / det,
            ty = -(this.ty * this.a - this.b * this.tx) / det;
        return this.compose(a, b, c, d, tx, ty);
      }
    },

    /* Returns the result of applying the geometric transformation
     * represented by the Matrix object to the specified point.
     * @param {Point} pt
     * @return {Point}
     */
    'transformPoint': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (pt) {
        /*DEBUG*/
        check_point_type(pt, this+'.transformPoint', '*point*');
        /*END_DEBUG*/
        return doodle_Point(this.a * pt.x + this.c * pt.y + this.tx,
                            this.b * pt.x + this.d * pt.y + this.ty);
      }
    },

    /* Given a point in the pretransform coordinate space, returns
     * the coordinates of that point after the transformation occurs.
     * Unlike 'transformPoint', does not consider translation.
     * @param {Point} pt
     * @return {Point}
     */
    'deltaTransformPoint': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (pt) {
        /*DEBUG*/
        check_point_type(pt, this+'.deltaTransformPoint', '*point*');
        /*END_DEBUG*/
        return doodle_Point(this.a * pt.x + this.c * pt.y,
                            this.b * pt.x + this.d * pt.y);
      }
    },
    
    'rotateAroundExternalPoint': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (pt, radians) {
        /*DEBUG*/
        check_point_type(pt, this+'.rotateAroundExternalPoint', '*point*, radians');
        check_number_type(radians, this+'.rotateAroundExternalPoint', 'point, *radians*');
        /*END_DEBUG*/
        var parent_matrix = doodle_Matrix().rotate(radians), //global space
            reg_pt, //new registration point
            dx = pt.x,
            dy = pt.y;
        
        this.translate(-dx, -dy);
        
        reg_pt = parent_matrix.transformPoint({x:this.tx, y:this.ty});
        this.tx = reg_pt.x;
        this.ty = reg_pt.y;
        //apply parents rotation, and put back
        return this.multiply(parent_matrix).translate(dx, dy);
      }
    },
    
    'rotateAroundInternalPoint': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (pt, radians) {
        /*DEBUG*/
        check_point_type(pt, this+'.rotateAroundInternalPoint', '*point*, radians');
        check_number_type(radians, this+'.rotateAroundInternalPoint', 'point, *radians*');
        /*END_DEBUG*/
        var p = this.transformPoint(pt);
        return this.rotateAroundExternalPoint(p, radians);
      }
    },
    
    'matchInternalPointWithExternal': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (pt_int, pt_ext) {
        /*DEBUG*/
        check_point_type(pt_int, this+'.matchInternalPointWithExternal', '*pt_int*, pt_ext');
        check_point_type(pt_ext, this+'.matchInternalPointWithExternal', 'pt_int, *pt_ext*');
        /*END_DEBUG*/
        var pt = this.transformPoint(pt_int),
            dx = pt_ext.x - pt.x,
            dy = pt_ext.y - pt.y;
        return this.translate(dx, dy);
      }
    },

    /* Update matrix 'in-between' this and another matrix
     * given a value of t bewteen 0 and 1.
     * @return {Matrix}
     */
    'interpolate': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (m, t) {
        /*DEBUG*/
        check_matrix_type(m, this+'.interpolate', '*matrix*, t');
        check_number_type(t, this+'.interpolate', 'matrix, *t*');
        /*END_DEBUG*/
        this.a  = this.a  + (m.a  - this.a)  * t;
        this.b  = this.b  + (m.b  - this.b)  * t;
        this.c  = this.c  + (m.c  - this.c)  * t;
        this.d  = this.d  + (m.d  - this.d)  * t;
        this.tx = this.tx + (m.tx - this.tx) * t;
        this.ty = this.ty + (m.ty - this.ty) * t;
        return this;
      }
    }
    
  };//end matrix_static_properties defintion

  
  /*
   * CLASS FUNCTIONS
   */
  
  /* Check if a given object contains a numeric matrix properties.
   * Does not check if a matrix is actually a doodle.geom.matrix.
   * @param {Matrix} m Object with numeric matrix parameters.
   * @return {Boolean}
   */
  isMatrix = doodle.geom.Matrix.isMatrix = function (m) {
    return (m !== undefined && m !== null &&
            typeof m.a  === 'number' && typeof m.b  === 'number' &&
            typeof m.c  === 'number' && typeof m.d  === 'number' &&
            typeof m.tx === 'number' && typeof m.ty === 'number');
  };

  check_matrix_type = doodle.utils.types.check_matrix_type = function (m, caller_name) {
    if (!isMatrix(m)) {
      caller_name = (caller_name === undefined) ? "check_matrix_type" : caller_name;
      throw new TypeError(caller_name + ": Parameter must be a matrix.");
    } else {
      return true;
    }
  };
  
}());//end class closure
/*globals doodle*/
(function () {
  var rect_static_properties,
      doodle_Rectangle, 
      isRect,
      check_rect_type,
      check_number_type = doodle.utils.types.check_number_type,
      check_point_type = doodle.utils.types.check_point_type;
  
  /* Super constructor
   * @param {Number|Array|Rectangle|Function} (x,y,w,h)|initializer
   * @return {Object}
   */
  doodle_Rectangle = doodle.geom.Rectangle = function (x, y, width, height) {
    var rect = {},
        arg_len = arguments.length,
        init_obj;

    /*DEBUG*/
    if (arg_len !== 0 && arg_len !== 1 && arg_len !== 4) {
      throw new SyntaxError("[object Rectangle](x, y, width, height): Invalid number of parameters.");
    }
    /*END_DEBUG*/

    Object.defineProperties(rect, rect_static_properties);
    //properties that require privacy
    Object.defineProperties(rect, {
      'x': {
        enumerable: true,
        configurable: false,
        get: function () { return x; },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.x');
          /*END_DEBUG*/
          x = n;
        }
      },
      
      'y': {
        enumerable: true,
        configurable: false,
        get: function () { return y; },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.y');
          /*END_DEBUG*/
          y = n;
        }
      },
      
      'width': {
        enumerable: true,
        configurable: false,
        get: function () { return width; },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.width');
          /*END_DEBUG*/
          width = n;
        }
      },
      
      'height': {
        enumerable: true,
        configurable: false,
        get: function () { return height; },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.height');
          /*END_DEBUG*/
          height = n;
        }
      }
    });//end defineProperties

    //initialize rectangle
    if (arg_len === 0) {
      //default instantiation: {x:0, y:0, width:0, height:0}
      rect.compose(0, 0, 0, 0);
    } else if (arg_len === 4) {
      //standard instantiation
      rect.compose(x, y, width, height);
    } else {
      //passed an initialization obj
      init_obj = arguments[0];
      x = undefined;
      
      if (typeof init_obj === 'function') {
        rect.compose(0, 0, 0, 0);
        init_obj.call(rect);
      }  else if (Array.isArray(init_obj)) {
        /*DEBUG*/
        if (init_obj.length !== 4) {
          throw new SyntaxError("[object Rectangle]([x, y, width, height]): Invalid array parameter.");
        }
        /*END_DEBUG*/
        rect.compose.apply(rect, init_obj);
      } else {
        /*DEBUG*/
        check_rect_type(init_obj, '[object Rectangle](rect)');
        /*END_DEBUG*/
        rect.compose(init_obj.x, init_obj.y, init_obj.width, init_obj.height);
      }
    }

    return rect;
  };


  rect_static_properties = {
    'top': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.y;
      },
      set: function (n) {
        /*DEBUG*/
        check_number_type(n, this+'.top');
        /*END_DEBUG*/
        this.y = n;
        this.height -= n;
      }
    },
    
    'right': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.x + this.width;
      },
      set: function (n) {
        /*DEBUG*/
        check_number_type(n, this+'.right');
        /*END_DEBUG*/
        this.width = n - this.x;
      }
    },
    
    'bottom': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.y + this.height;
      },
      set: function (n) {
        /*DEBUG*/
        check_number_type(n, this+'.bottom');
        /*END_DEBUG*/
        this.height = n - this.y;
      }
    },
    
    'left': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.x;
      },
      set: function (n) {
        /*DEBUG*/
        check_number_type(n, this+'.left');
        /*END_DEBUG*/
        this.x = n;
        this.width -= n;
      }
    },
    
    /*
     * METHODS
     */
    
    'clone': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return doodle_Rectangle(this.x, this.y, this.width, this.height);
      }
    },
    
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return "(x="+ this.x +", y="+ this.y +", w="+ this.width +", h="+ this.height +")";
      }
    },
    
    'toArray': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return [this.top, this.right, this.bottom, this.left];
      }
    },
    
    /* Sets this rectangle's parameters.
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     * @return {Rectangle}
     */
    'compose': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (x, y, width, height) {
        /*DEBUG*/
        check_number_type(x, this+'.compose', '*x*, y, width, height');
        check_number_type(y, this+'.compose', 'x, *y*, width, height');
        check_number_type(width, this+'.compose', 'x, y, *width*, height');
        check_number_type(height, this+'.compose', 'x, y, width, *height*');
        /*END_DEBUG*/
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
      }
    },

    /* Adjusts the location of the rectangle, as determined by
     * its top-left corner, by the specified amounts.
     * @param {Number} dx
     * @param {Number} dy
     */
    'offset': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (dx, dy) {
        /*DEBUG*/
        check_number_type(dx, this+'.offset', '*dx*, dy');
        check_number_type(dy, this+'.offset', 'dx, *dy*');
        /*END_DEBUG*/
        this.x += dx;
        this.y += dy;
        return this;
      }
    },

    /* Increases the size of the rectangle by the specified amounts, in pixels.
     * The center point of the Rectangle object stays the same, and its size
     * increases to the left and right by the dx value, and to the top and the
     * bottom by the dy value.
     * @param {Number} dx
     * @param {Number} dy
     */
    'inflate': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (dx, dy) {
        /*DEBUG*/
        check_number_type(dx, this+'.inflate', '*dx*, dy');
        check_number_type(dy, this+'.inflate', 'dx, *dy*');
        /*END_DEBUG*/
        this.x -= dx;
        this.width += 2 * dx;
        this.y -= dy;
        this.height += 2 * dy;
        return this;
      }
    },

    /* Determines whether the rectangle argument is equal to this rectangle.
     * @param {Rectangle} rect
     * @return {Boolean}
     */
    'equals': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (rect) {
        /*DEBUG*/
        check_rect_type(rect, this+'.equals', '*rect*');
        /*END_DEBUG*/
        return (this.x === rect.x && this.y === rect.y &&
                this.width === rect.width && this.height === rect.height);
      }
    },

    /* Determines whether or not this Rectangle object is empty.
     */
    'isEmpty': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return (this.width >= 0 || this.height >= 0);
      }
    },

    /* Determines whether the specified point is contained within this rectangle object.
     * @param {Point} pt
     * @return {Boolean}
     */
    'containsPoint': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (pt) {
        /*DEBUG*/
        check_point_type(pt, this+'.containsPoint', '*point*');
        /*END_DEBUG*/
        var x = pt.x,
            y = pt.y;
        return (x >= this.left && x <= this.right &&
                y >= this.top && y <= this.bottom);
      }
    },

    /* Determines whether the rectangle argument is contained within this rectangle.
     * @param {Rectangle} rect
     * @return {Boolean}
     */
    'containsRect': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (rect) {
        /*DEBUG*/
        check_rect_type(rect, this+'.containsRect', '*rect*');
        /*END_DEBUG*/
        //check each corner
        return (this.containsPoint({x: rect.x, y: rect.y}) &&           //top-left
                this.containsPoint({x: rect.right, y: rect.y}) &&       //top-right
                this.containsPoint({x: rect.right, y: rect.bottom}) &&  //bot-right
                this.containsPoint({x: rect.x, y: rect.bottom}));       //bot-left
      }
    },

    /* Determines whether the rectangle argument intersects with this rectangle.
     * @param {Rectangle} rect
     * @return {Boolean}
     */
    'intersects': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (rect) {
        /*DEBUG*/
        check_rect_type(rect, this+'.intersects', '*rect*');
        /*END_DEBUG*/
        //check each corner
        return (this.containsPoint({x: rect.x, y: rect.y}) ||           //top-left
                this.containsPoint({x: rect.right, y: rect.y}) ||       //top-right
                this.containsPoint({x: rect.right, y: rect.bottom}) ||  //bot-right
                this.containsPoint({x: rect.x, y: rect.bottom}));       //bot-left
      }
    },

    /* If the rectangle argument intersects with this rectangle, returns
     * the area of intersection as a Rectangle object.
     * If the rectangles do not intersect, this method returns an empty
     * Rectangle object with its properties set to 0.
     * @param {Rectangle} rect
     * @return {Rectangle}
     */
    'intersection': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (rect) {
        /*DEBUG*/
        check_rect_type(rect, this+'.intersection', '*rect*');
        /*END_DEBUG*/
        var r = doodle_Rectangle();
        if (this.intersects(rect)) {
          r.left = Math.max(this.left, rect.left);
          r.top = Math.max(this.top, rect.top);
          r.right = Math.min(this.right, rect.right);
          r.bottom = Math.min(this.bottom, rect.bottom);
        }
        return r;
      }
    },

    /* Adds two rectangles together to create a new Rectangle object,
     * by filling in the horizontal and vertical space between the two.
     * @param {Rectangle} rect
     * @return {Rectangle}
     */
    'union': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (rect) {
        /*DEBUG*/
        check_rect_type(rect, this+'.union', '*rect*');
        /*END_DEBUG*/
        var r = doodle_Rectangle();
        r.left = Math.min(this.left, rect.left);
        r.top = Math.min(this.top, rect.top);
        r.right = Math.max(this.right, rect.right);
        r.bottom = Math.max(this.bottom, rect.bottom);
        return r;
      }
    }
    
  };//end rect_static_properties definition

  /*
   * CLASS FUNCTIONS
   */

  /* Check if a given object contains a numeric rectangle properties including
   * x, y, width, height, top, bottom, right, left.
   * Does not check if a rectangle is actually a doodle.geom.rectangle.
   * @param {Rectangle} rect Object with numeric rectangle parameters.
   * @return {Boolean}
   */
  isRect = doodle.geom.Rectangle.isRect = function (rect) {
    return (typeof rect.x     === "number" && typeof rect.y      === "number" &&
            typeof rect.width === "number" && typeof rect.height === "number" &&
            typeof rect.top   === "number" && typeof rect.bottom === "number" &&
            typeof rect.left  === "number" && typeof rect.right  === "number");
  };

  check_rect_type = doodle.utils.types.check_rect_type = function (rect, caller_name) {
    if (!isRect(rect)) {
      caller_name = (caller_name === undefined) ? "check_rect_type" : caller_name;
      throw new TypeError(caller_name + ": Parameter must be a rectangle.");
    } else {
      return true;
    }
  };
  
}());//end class closure
/*globals doodle*/

(function () {
  var evtDisp_static_properties,
      dispatcher_queue,
      isEventDispatcher,
      inheritsEventDispatcher,
      /*DEBUG*/
      check_boolean_type = doodle.utils.types.check_boolean_type,
      check_string_type = doodle.utils.types.check_string_type,
      check_function_type = doodle.utils.types.check_function_type,
      check_event_type = doodle.utils.types.check_event_type,
      /*END_DEBUG*/
      CAPTURING_PHASE = doodle.Event.CAPTURING_PHASE,
      AT_TARGET = doodle.Event.AT_TARGET,
      BUBBLING_PHASE = doodle.Event.BUBBLING_PHASE;
  
  /* Super constructor
   * @param {Function} initializer
   * @return {Object}
   */
  doodle.EventDispatcher = function () {
    var evt_disp = {};

    /*DEBUG*/
    if (typeof arguments[0] !== 'function') {
      if (arguments.length > 0) {
        throw new SyntaxError("[object EventDispatcher]: Invalid number of parameters.");
      }
    }
    /*END_DEBUG*/

    Object.defineProperties(evt_disp, evtDisp_static_properties);
    //properties that require privacy
    Object.defineProperties(evt_disp, {
      'eventListeners': (function () {
        var event_listeners = {};
        return {
          enumerable: true,
          configurable: false,
          get: function () { return event_listeners; }
        };
      }())
    });//end defineProperties

    //passed an initialization function
    if (typeof arguments[0] === 'function') {
      arguments[0].call(evt_disp);
    }

    return evt_disp;
  };

  
  evtDisp_static_properties = {
    /* Returns the string representation of the specified object.
     * @return {String}
     */
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return "[object EventDispatcher]";
      }
    },

    /* Call function passing object as 'this'.
     * @param {Function} fn
     * @return {Object}
     */
    'modify': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (fn) {
        /*DEBUG*/
        check_function_type(fn, this+'.modify', '*function*');
        /*END_DEBUG*/
        fn.call(this);
        return this;
      }
    },

    /* Registers an event listener object with an EventDispatcher object
     * so that the listener receives notification of an event.
     * @param {String} type
     * @param {Function} listener
     * @param {Boolean} useCapture
     */
    'addEventListener': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (type, listener, useCapture) {
        useCapture = (useCapture === undefined) ? false : useCapture;
        /*DEBUG*/
        check_string_type(type, this+'.addEventListener', '*type*, listener, useCapture');
        check_function_type(listener, this+'.addEventListener', 'type, *listener*, useCapture');
        check_boolean_type(useCapture, this+'.addEventListener', 'type, listener, *useCapture*');
        /*END_DEBUG*/
        
        var self = this;
        //if new event type, create it's array to store callbacks
        if (!this.eventListeners[type]) {
          this.eventListeners[type] = {capture:[], bubble:[]};
        }
        this.eventListeners[type][useCapture ? 'capture':'bubble'].push(listener);
        
        //object ready for events, add to receivers if not already there
        if (dispatcher_queue.every(function(obj) { return self !== obj; })) {
          dispatcher_queue.push(self);
        }
      }
    },

    /* Removes a listener from the EventDispatcher object.
     * @param {String} type
     * @param {Function} listener
     * @param {Boolean} useCapture
     */
    'removeEventListener': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (type, listener, useCapture) {
        useCapture = (useCapture === undefined) ? false : useCapture;
        /*DEBUG*/
        check_string_type(type, this+'.removeEventListener', '*type*, listener, useCapture');
        check_function_type(listener, this+'.removeEventListener', 'type, *listener*, useCapture');
        check_boolean_type(useCapture, this+'.removeEventListener', 'type, listener, *useCapture*');
        /*END_DEBUG*/
        
        //make sure event type exists
        if (this.eventListeners[type]) {
          //grab our event type array and remove the callback function
          var evt_type = this.eventListeners[type],
          listeners = evt_type[useCapture ? 'capture':'bubble'];

          listeners.splice(listeners.indexOf(listener), 1);
          
          //if none left, remove event type
          if (evt_type.capture.length === 0 && evt_type.bubble.length === 0) {
            delete this.eventListeners[type];
          }
          //if no more listeners, remove from object queue
          if (Object.keys(this.eventListeners).length === 0) {
            dispatcher_queue.splice(dispatcher_queue.indexOf(this), 1);
          }
        }
      }
    },

    /* Lookup and call listener if registered for specific event type.
     * @param {Event} event
     * @return {Boolean} true if node has listeners of event type.
     */
    'handleEvent': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (event) {
        /*DEBUG*/
        check_event_type(event, this+'.handleEvent');
        /*END_DEBUG*/
        
        //check for listeners that match event type
        //if capture not set, using bubble listeners - like for AT_TARGET phase
        var phase = (event.eventPhase === CAPTURING_PHASE) ? 'capture' : 'bubble',
            listeners = this.eventListeners[event.type], //obj
            count = 0, //listener count
            rv,  //return value of handler
            i; //counter

        listeners = listeners && listeners[phase];
        if (listeners && listeners.length > 0) {
          //currentTarget is the object with addEventListener
          event.__setCurrentTarget(this);
          
          //if we have any, call each handler with event object
          count = listeners.length;
          for (i = 0; i < count; i += 1) {
            /*DEBUG*/
            check_function_type(listeners[i], this+'.handleEvent::listeners['+i+']');
            /*END_DEBUG*/
            //pass event to handler
            rv = listeners[i].call(this, event);
            
            //when event.stopPropagation is called
            //cancel event for other nodes, but check other handlers on this one
            //returning false from handler does the same thing
            if (rv === false || event.returnValue === false) {
              //set event stopped if not already
              if (!event.__cancel) {
                event.stopPropagation();
              }
            }
            //when event.stopImmediatePropagation is called
            //ignore other handlers on this target
            if (event.__cancelNow) {
              break;
            }
          }
        }
        
        //any handlers found on this node?
        return (count > 0) ? true : false;
      }
    },
    
    /* Dispatches an event into the event flow. The event target is the
     * EventDispatcher object upon which the dispatchEvent() method is called.
     * @param {Event} event
     * @return {Boolean} true if the event was successfully dispatched.
     */
    'dispatchEvent': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (event) {
        //events are dispatched from the child,
        //capturing goes down to the child, bubbling then goes back up
        var target,
            node,
            node_path = [],
            len, //count of nodes up to root
            i; //counter

        /*DEBUG*/
        check_event_type(event, this+'.dispatchEvent', '*event*');
        /*END_DEBUG*/

        //can't dispatch an event that's already stopped
        if (event.__cancel) {
          return false;
        }
        
        //set target to the object that dispatched it
        //if already set, then we're re-dispatching an event for another target
        if (!event.target) {
          event.__setTarget(this);
        }

        target = event.target;
        //path starts at node parent
        node = target.parent || null;

        //create path from node's parent to top of tree
        while (node) {
          node_path.push(node);
          node = node.parent;
        }

        //enter capture phase: down the tree
        event.__setEventPhase(CAPTURING_PHASE);
        i = len = node_path.length;
        while ((i=i-1) >= 0) {
          node_path[i].handleEvent(event);
          //was the event stopped inside the handler?
          if (event.__cancel) {
            return true;
          }
        }

        //enter target phase
        event.__setEventPhase(AT_TARGET);
        target.handleEvent(event);
        //was the event stopped inside the handler?
        if (event.__cancel) {
          return true;
        }

        //does event bubble, or bubbling cancelled in capture/target phase?
        if (!event.bubbles || event.cancelBubble) {
          return true;
        }

        //enter bubble phase: back up the tree
        event.__setEventPhase(BUBBLING_PHASE);
        for (i = 0; i < len; i = i+1) {
          node_path[i].handleEvent(event);
          //was the event stopped inside the handler?
          if (event.__cancel || event.cancelBubble) {
            return true;
          }
        }

        return true; //dispatched successfully
      }
    },

    /* Dispatches an event to every object with an active listener.
     * Ignores propagation path, objects come from 
     * @param {Event} event
     * @return {Boolean} true if the event was successfully dispatched.
     */
    'broadcastEvent': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (event) {
        var receivers, //event listeners of correct type
            len, //count of event listeners
            i = 0; //counter
        
        /*DEBUG*/
        check_event_type(event, this+'.broadcastEvent', '*event*');
        /*END_DEBUG*/

        if (event.__cancel) {
          throw new Error(this+'.broadcastEvent: Can not dispatch a cancelled event.');
        }
        
        //set target to the object that dispatched it
        //if already set, then we're re-dispatching an event for another target
        if (!event.target) {
          event.__setTarget(this);
        }
        
        //pare down to eligible receivers with event type listener
        receivers = dispatcher_queue.filter(function (obj) {
          return obj.hasEventListener(event.type);
        });
        
        //and call each
        for (len = receivers.length; i < len; i=i+1) {
          receivers[i].handleEvent(event);
          //event cancelled in listener?
          if (event.__cancel) {
            break;
          }
        }
        
        return true;
      }
    },

    /* Checks whether the EventDispatcher object has any listeners
     * registered for a specific type of event.
     * @param {String} type
     * @return {Boolean}
     */
    'hasEventListener': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (type) {
        /*DEBUG*/
        check_string_type(type, this+'.hasEventListener', '*type*');
        /*END_DEBUG*/
        return this.eventListeners !== null && this.eventListeners.hasOwnProperty(type);
      }
    },

    /* Checks whether an event listener is registered with this EventDispatcher object
     * or any of its ancestors for the specified event type.
     * The difference between the hasEventListener() and the willTrigger() methods is
     * that hasEventListener() examines only the object to which it belongs,
     * whereas the willTrigger() method examines the entire event flow for the
     * event specified by the type parameter.
     * @param {String} type The type of event.
     * @return {Boolean}
     */
    'willTrigger': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (type) {
        /*DEBUG*/
        check_string_type(type, this+'.willTrigger', '*type*');
        /*END_DEBUG*/
        
        if (this.hasEventListener(type)) {
          return true;
        } else if (!this.children || this.children.length === 0) {
          //requires scene graph be in place to proceed down the tree
          return false;
        } else {
          for (var i in this.children) {
            if (this.children[i].willTrigger(type)) {
              return true;
            }
          }
        }
        return false;
      }
    }
    
  };//end evtDisp_static_properties definition

  
  /*
   * CLASS PROPERTIES
   */
  
  //holds all objects with event listeners
  dispatcher_queue = doodle.EventDispatcher.dispatcher_queue = [];

  /* Test if an object is an event dispatcher.
   * Not the best way to test object, but it'll do for now.
   * @param {Object} obj
   * @return {Boolean}
   */
  isEventDispatcher = doodle.EventDispatcher.isEventDispatcher = function (obj) {
    return (obj.toString() === '[object EventDispatcher]');
  };

  /* Check if object inherits from event dispatcher.
   * @param {Object} obj
   * @return {Boolean}
   */
  inheritsEventDispatcher = doodle.EventDispatcher.inheritsEventDispatcher = function (obj) {
    while (obj) {
      if (isEventDispatcher(obj)) {
        return true;
      } else {
        if (typeof obj !== 'object') {
          return false;
        }
        obj = Object.getPrototypeOf(obj);
      }
    }
    return false;
  };

  doodle.utils.types.check_eventdispatcher_type = function (obj, caller, param) {
    if (inheritsEventDispatcher(obj)) {
      return true;
    } else {
      caller = (caller === undefined) ? "check_eventdispatcher_type" : caller;
      param = (param === undefined) ? "" : '('+param+')';
      throw new TypeError(caller + param +": Parameter must be an EventDispatcher.");
    }
  };
  
}());//end class closure
(function () {
  var node_count = 0,
      node_static_properties,
      isNode,
      inheritsNode,
      check_node_type,
      inDisplayList,
      check_boolean_type = doodle.utils.types.check_boolean_type,
      check_number_type = doodle.utils.types.check_number_type,
      check_string_type = doodle.utils.types.check_string_type,
      check_matrix_type = doodle.utils.types.check_matrix_type,
      check_point_type = doodle.utils.types.check_point_type,
      doodle_Point = doodle.geom.Point,
      doodle_Event = doodle.Event,
      to_degrees = 180 / Math.PI,
      to_radians = Math.PI / 180;
  
  /* Super constructor
   * @param {Function} init_fn
   * @return {Object}
   */
  doodle.Node = function (id) {
    var node = Object.create(doodle.EventDispatcher());
    
    /*DEBUG*/
    if (arguments.length > 1) {
      throw new SyntaxError("[object Node](id): Invalid number of parameters.");
    }
    /*END_DEBUG*/

    Object.defineProperties(node, node_static_properties);
    //properties that require privacy
    Object.defineProperties(node, {
      
      'id': (function () {
        var node_id;
        return {
          enumerable: true,
          configurable: true,
          get: function () { return node_id; },
          set: function (idArg) {
            /*DEBUG*/
            check_string_type(idArg, this+'.id');
            /*END_DEBUG*/
            node_id = idArg;
          }
        };
      }()),
      
      'root': (function () {
        var root = null;
        return {
          enumerable: true,
          configurable: false,
          get: function () { return root; },
          set: function (node) {
            /*DEBUG*/
            if (node !== null) {
              if (!inheritsNode(node)) {
                throw new TypeError(this+".root: Parameter must be a node.");
              }
            }
            /*END_DEBUG*/
            root = node;
          }
        };
      }()),
      
      'parent': (function () {
        var parent = null;
        return {
          enumerable: true,
          configurable: false,
          get: function () { return parent; },
          set: function (node) {
            /*DEBUG*/
            if (node !== null) {
              if (!inheritsNode(node)) {
                throw new TypeError(this+".parent: Parameter must be a node.");
              }
            }
            /*END_DEBUG*/
            parent = node;
          }
        };
      }()),
      
      'children': (function () {
        var children = [];
        return {
          enumerable: true,
          configurable: false,
          get: function () {
            return children;
          }
        };
      }()),
      
      'transform': (function () {
        var transform = doodle.geom.Matrix();
        return {
          enumerable: true,
          configurable: false,
          get: function () { return transform; },
          set: function (matrix) {
            /*DEBUG*/
            check_matrix_type(matrix, this+'.transform');
            /*END_DEBUG*/
            transform = matrix;
          }
        };
      }()),

      'visible': (function () {
        var visible = true;
        return {
          enumerable: true,
          configurable: true,
          get: function () { return visible; },
          set: function (isVisible) {
            /*DEBUG*/
            check_boolean_type(isVisible, node+'.visible');
            /*END_DEBUG*/
            visible = isVisible;
          }
        };
      }()),

      'alpha': (function () {
        var alpha = 1;
        return {
          enumerable: true,
          configurable: true,
          get: function () { return alpha; },
          set: function (alphaValue) {
            /*DEBUG*/
            check_number_type(alphaValue, node+'.alpha');
            /*END_DEBUG*/
            //alpha is between 0 and 1
            alpha = (alphaValue > 1) ? 1 : ((alphaValue < 0) ? 0 : alphaValue);
          }
        };
      }())
    });//end defineProperties

    //passed an initialization function
    if (typeof arguments[0] === 'function') {
      arguments[0].call(node);
      id = undefined;
    }

    //node defaults
    if (node.id === undefined) {
      node.id = (id !== undefined) ? id : "node"+ String('000'+node_count).slice(-3);
      node_count += 1;
    }

    return node;
  };

  
  /* Dispatches and event type from all of a nodes children and grandchildren.
   * @param {Node} node
   * @param {String} event_type
   * @param {Function} child_action
   */
  function children_dispatch_event (node, event_type, child_action) {
    node.children.forEach(function (child) {
      if (typeof child_action === 'function') {
        child_action(child);
      }
      child.dispatchEvent(doodle_Event(event_type, true));
      children_dispatch_event(child, event_type, child_action);
    });
  }

  node_static_properties = {
    
    'x': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.transform.tx;
      },
      set: function (d) {
        /*DEBUG*/
        check_number_type(d, this+'.x');
        /*END_DEBUG*/
        this.transform.tx = d;
      }
    },
    
    'y': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.transform.ty;
      },
      set: function (d) {
        /*DEBUG*/
        check_number_type(d, this+'.y');
        /*END_DEBUG*/
        this.transform.ty = d;
      }
    },

    //registration point
    'axis': {
      //temp value
      value: {x: this.x, y: this.y}
    },

    /*
    'rotate': { //around external point?
      value: function (deg) {
      
        check_number_type(deg, this+'.rotate', '*degrees*');

        if (this.axis.x !== undefined && this.axis.y !== undefined) {
          this.transform.rotateAroundInternalPoint(this.axis, deg*to_radians);
        } else {
          this.transform.rotate(deg * to_radians);
        }
      }
    },
    */

    'rotate': { //around external point?
      value: function (deg) {
        /*DEBUG*/
        check_number_type(deg, this+'.rotate');
        /*END_DEBUG*/
        this.transform.rotate(deg * to_radians);
      }
    },
    
    'rotation': {
      enumerable: true,
      configurable: true,
      get: function () {
        return this.transform.rotation * to_degrees;
      },
      set: function (deg) {
        /*DEBUG*/
        check_number_type(deg, this+'.rotation', '*degrees*');
        /*END_DEBUG*/
        this.transform.rotation = deg * to_radians;
      }
    },

    'scaleX': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.transform.a;
      },
      set: function (sx) {
        /*DEBUG*/
        check_number_type(sx, this+'.scaleX');
        /*END_DEBUG*/
        this.transform.a = sx;
      }
    },
    
    'scaleY': {
      enumerable: true,
      configurable: false,
      get: function () {
        return this.transform.d;
      },
      set: function (sy) {
        /*DEBUG*/
        check_number_type(sy, this+'.scaleY');
        /*END_DEBUG*/
        this.transform.d = sy;
      }
    },

    /*
     * METHODS
     */

    /* Returns the string representation of the specified object.
     * @return {String}
     */
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return "[object Node]";
      }
    },

    'addChildAt': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (node, index) {
        //if already a child then ignore
        if (this.children.indexOf(node) !== -1) {
          return false;
        }

        /*DEBUG*/
        check_node_type(node, this+'.addChildAt', '*node*, index');
        check_number_type(index, this+'.addChildAt', 'node, *index*');
        /*END_DEBUG*/
        
        //make sure parent/child share same root
        if (node.root !== this.root) {
          node.root = this.root;
        }
        //if has previous parent, remove from it's children
        if (node.parent !== null && node.parent !== this) {
          node.parent.removeChild(node);
        }
        node.parent = this;
        this.children.splice(index, 0, node);
        
        //is the node now a part of the display list?
        if (inDisplayList(node)) {
          node.dispatchEvent(doodle_Event(doodle_Event.ADDED, true));
          children_dispatch_event(node, doodle_Event.ADDED);
        }

        return node;
      }
    },
    
    'addChild': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (node) {
        /*DEBUG*/
        check_node_type(node, this+'.addChild', '*node*');
        /*END_DEBUG*/
        return this.addChildAt(node, this.children.length);
      }
    },
    
    'removeChildAt': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: (function () {
        /* Called on every child of removed node with a context.
         * Ensures it's old bounds are cleared before being re-parented.
         */
        function clear_node_bounds (child, context) {
          var bounds = child.getBounds(child.root);
          if (context) {
            context.clearRect(bounds.x, bounds.y, bounds.width, bounds.height);
          }
          child.root = null;
        }
        
        return function (index) {
          /*DEBUG*/
          check_number_type(index, this+'.removeChildAt', '*index*');
          /*END_DEBUG*/
          var node = this.children[index],
          ctx = node.context;
          
          this.children.splice(index, 1);

          //is it no longer a part of the display list?
          if (ctx) {
            clear_node_bounds(node, ctx);
            node.dispatchEvent(doodle_Event(doodle_Event.REMOVED, true));
            children_dispatch_event(node, doodle_Event.REMOVED, function (child) {
              clear_node_bounds(child, ctx);
            });
          }
          //these are needed for final transversal
          node.root = null;
          node.parent = null;
        };
      }())
    },
    
    'removeChild': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (node) {
        /*DEBUG*/
        check_node_type(node, this+'.removeChild', '*node*');
        /*END_DEBUG*/
        this.removeChildAt(this.children.indexOf(node));
      }
    },
    
    'removeChildById': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (id) {
        /*DEBUG*/
        check_string_type(id, this+'.removeChildById', '*id*');
        /*END_DEBUG*/
        this.removeChild(this.getChildById(id));
      }
    },
    
    'removeAllChildren': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        //just assign an empty array to this.children?
        var i = this.children.length;
        while ((i -= 1) >= 0) {
          this.removeChildAt(i);
        }
      }
    },
    
    'getChildById': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (id) {
        /*DEBUG*/
        check_string_type(id, this+'.getChildById', '*id*');
        /*END_DEBUG*/
        return this.children.filter(function (child) {
          return child.id === id;
        })[0];
      }
    },

    'setChildIndex': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function (child, index) {
        /*DEBUG*/
        check_node_type(child, this+'.setChildIndex', '*child*, index');
        check_number_type(index, this+'.setChildIndex', 'child, *index*');
        /*END_DEBUG*/
        var children = this.children,
        len = children.length,
        pos = children.indexOf(child);
        if (pos === -1) {
          throw new ReferenceError(this+'.setChildIndex(*child*, index): ' + child + ' does not exist on child list.');
        }
        if (index > len || index < -len) {
          throw new RangeError(this+'.setChildIndex(child, *index*): ' + index + ' does not exist on child list.');
        }
        children.splice(pos, 1); //remove element
        children.splice(index, 0, child); //set new position
      }
    },
    
    'swapChildrenAt': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (index1, index2) {
        /*DEBUG*/
        check_number_type(index1, this+'.swapChildrenAt', '*index1*, index2');
        check_number_type(index2, this+'.swapChildrenAt', 'index1, *index2*');
        /*END_DEBUG*/
        var a = this.children;
        a[index1] = a.splice(index2, 1, a[index1])[0];
      }
    },
    
    'swapChildren': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (node1, node2) {
        /*DEBUG*/
        check_node_type(node1, this+'.swapChildren', '*node1*, node2');
        check_node_type(node2, this+'.swapChildren', 'node1, *node2*');
        /*END_DEBUG*/
        var children = this.children;
        this.swapChildrenAt(children.indexOf(node1), children.indexOf(node2));
      }
    },

    //change this nodes depth in parent
    'swapDepths': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function I(node) {
        /*DEBUG*/
        check_node_type(node, this+'.swapDepths', '*node*');
        /*END_DEBUG*/
        var parent = this.parent;
        if (!parent || !Array.isArray(parent.children)) {
          throw new Error(this+".swapDepths: no parent found.");
        } else {
          parent.swapChildren(this, node);
        }
      }
    },

    'swapDepthAt': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (index) {
        /*DEBUG*/
        check_number_type(index, this+'.swapDepthAt', '*index*');
        /*END_DEBUG*/
        var parent = this.parent;
        if (!parent || !Array.isArray(parent.children)) {
          throw new Error(this+".swapDepthAt: no parent found.");
        } else {
          parent.swapChildrenAt(index, parent.children.indexOf(this));
        }
      }
    },
    
    /* Determine if node is among it's children, grandchildren, etc.
     * @return {Boolean}
     *
     * THIS ONLY CHECKS PARENTS / GRANDPARENTS
     */
    'contains': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (node) {
        while (node) {
          if (node === this) {
            return true;
          }
          node = node.parent;
        }
        return false;
      }
    },

    'localToGlobal': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (pt) {
        /*DEBUG*/
        check_point_type(pt, this+'.localToGlobal', '*point*');
        /*END_DEBUG*/
        var node = this;
        while (node) {
          pt = node.transform.transformPoint(pt);
          node = node.parent;
        }
        return pt;
      }
    },

    'globalToLocal': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (pt) {
        /*DEBUG*/
        check_point_type(pt, this+'.globalToLocal', '*point*');
        /*END_DEBUG*/
        var global_pos = this.localToGlobal({x: 0, y: 0});
        return doodle_Point(pt.x - global_pos.x, pt.y - global_pos.y);
      }
    }
  };//end node_static_properties

  
  /*
   * CLASS METHODS
   */

  /* Test if an object is an node.
   * Not the best way to test object, but it'll do for now.
   * @param {Object} obj
   * @return {Boolean}
   */
  isNode = doodle.Node.isNode = function (obj) {
    return (obj.toString() === '[object Node]');
  };

  /* Check if object inherits from node.
   * @param {Object} obj
   * @return {Boolean}
   */
  inheritsNode = doodle.Node.inheritsNode = function (obj) {
    while (obj) {
      if (isNode(obj)) {
        return true;
      } else {
        if (typeof obj !== 'object') {
          return false;
        }
        obj = Object.getPrototypeOf(obj);
      }
    }
    return false;
  };

  check_node_type = doodle.utils.types.check_node_type = function (node, caller, param) {
    if (inheritsNode(node)) {
      return true;
    } else {
      caller = (caller === undefined) ? "check_node_type" : caller;
      param = (param === undefined) ? "" : '('+param+')';
      throw new TypeError(caller + param +": Parameter must be a Node.");
    }
  };

  /* A node is part of the display list if it can find a context to
   * draw on in it's scene graph.
   */
  inDisplayList = doodle.Node.inDisplayList = function (node) {
    while (node) {
      if (node.context) {
        return true;
      }
      node = node.parent;
    }
    return false;
  };
  
}());//end class closure
/*globals doodle, Image*/
(function () {
  var graphics_static_properties,
      check_number_type = doodle.utils.types.check_number_type,
      check_string_type = doodle.utils.types.check_string_type,
      check_function_type = doodle.utils.types.check_function_type,
      check_array_type = doodle.utils.types.check_array_type,
      check_point_type = doodle.utils.types.check_point_type,
      hex_to_rgb_str = doodle.utils.hex_to_rgb_str,
      get_element = doodle.utils.get_element,
      doodle_Event = doodle.Event,
      LINEAR = doodle.GradientType.LINEAR,
      RADIAL = doodle.GradientType.RADIAL;
  
  /* Super constructor
   * @param {Sprite} Reference to sprite object.
   * @param {Array} Reference to draw commands array.
   * @param {Object} Reference to object's extrema points.
   * @return {Object}
   */
  doodle.Graphics = function (sprite, draw_commands, extrema) {
    var graphics = Object.create(null),
        cursor_x = 0,
        cursor_y = 0;
    
    Object.defineProperties(graphics, graphics_static_properties);
    //properties that require privacy
    Object.defineProperties(graphics, {

      /*
       * METHODS
       */

      /* Provide direct access to the canvas drawing api.
       * Canvas context is called as the first argument to function.
       * Unable to set bounds from a user supplied function unless explictly set.
       * @param {Function} fn
       * Ex:
       * x = Object.create(doodle.sprite);
       * x.graphics.draw(function (ctx) {
       *   ctx.fillStyle = "#ff0000";
       *   ctx.fillRect(this.x, this.y, 100, 100);
       * });
       * x.draw();
       */
      'draw': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (fn) {
          /*DEBUG*/
          check_function_type(fn, this+'.graphics.draw', '*function*');
          /*END_DEBUG*/
          draw_commands.push(fn);
        }
      },

      /* Remove all drawing commands for sprite.
       */
      'clear': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function () {
          //should probably test, better to assign new empty array?
          var i = draw_commands.length;
          while ((i=i-1) >= 0) {
            draw_commands.splice(i, 1);
          }
          //reset dimensions
          sprite.width = 0;
          sprite.height = 0;

          extrema.min_x = extrema.min_y = extrema.max_x = extrema.max_y = 0;
          cursor_x = cursor_y = 0;
          
        }
      },

      /*
       * @param {Number} x
       * @param {Number} y
       * @param {Number} w
       * @param {Number} h
       */
      'rect': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (x, y, width, height) {
          /*DEBUG*/
          check_number_type(x, this+'.graphics.rect', '*x*, y, width, height');
          check_number_type(y, this+'.graphics.rect', 'x, *y*, width, height');
          check_number_type(width, this+'.graphics.rect', 'x, y, *width*, height');
          check_number_type(height, this+'.graphics.rect', 'x, y, width, *height*');
          /*END_DEBUG*/

          //update extremas
          extrema.min_x = Math.min(0, x, extrema.min_x);
          extrema.min_y = Math.min(0, y, extrema.min_y);
          extrema.max_x = Math.max(0, x, x+width, extrema.max_x);
          extrema.max_y = Math.max(0, y, y+height, extrema.max_y);
          
          //update size for bounding box
          sprite.width = -extrema.min_x + extrema.max_x;
          sprite.height = -extrema.min_y + extrema.max_y;
          
          draw_commands.push(function (ctx) {
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.closePath();
            ctx.stroke();
          });
          
        }
      },

      /*
       * @param {Number} x The x location of the center of the circle relative to the registration point of the parent display object (in pixels).
       * @param {Number} y The y location of the center of the circle relative to the registration point of the parent display object (in pixels).
       * @param {Number} radius
       */
      'circle': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (x, y, radius) {
          /*DEBUG*/
          check_number_type(x, this+'.graphics.circle', '*x*, y, radius');
          check_number_type(y, this+'.graphics.circle', 'x, *y*, radius');
          check_number_type(radius, this+'.graphics.circle', 'x, y, *radius*');
          /*END_DEBUG*/

          //update extremas
          extrema.min_x = Math.min(0, -radius+x, extrema.min_x);
          extrema.min_y = Math.min(0, -radius+y, extrema.min_y);
          extrema.max_x = Math.max(0, x, x+radius, extrema.max_x);
          extrema.max_y = Math.max(0, y, y+radius, extrema.max_y);
          
          //update size for bounding box
          sprite.width = -extrema.min_x + extrema.max_x;
          sprite.height = -extrema.min_y + extrema.max_y;

          draw_commands.push(function (ctx) {
            ctx.beginPath();
            //x, y, radius, start_angle, end_angle (Math.PI*2), anti-clockwise
            ctx.arc(x, y, radius, 0, 6.283185307179586, true);
            ctx.closePath();
            ctx.stroke();
          });
          
        }
      },

      /*
       * @param {Number} x
       * @param {Number} y
       * @param {Number} width
       * @param {Number} height
       */
      'ellipse': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (x, y, width, height) {
          height = (height === undefined) ? width : height; //default to circle
          /*DEBUG*/
          check_number_type(x, this+'.graphics.ellipse', '*x*, y, width, height');
          check_number_type(y, this+'.graphics.ellipse', 'x, *y*, width, height');
          check_number_type(width, this+'.graphics.ellipse', 'x, y, *width*, height');
          check_number_type(height, this+'.graphics.ellipse', 'x, y, width, *height*');
          /*END_DEBUG*/
          var rx = width / 2,
              ry = height / 2,
              krx = 0.5522847498 * rx, //kappa * radius_x
              kry = 0.5522847498 * ry;

          //update extremas
          extrema.min_x = Math.min(0, -rx+x, extrema.min_x);
          extrema.min_y = Math.min(0, -ry+y, extrema.min_y);
          extrema.max_x = Math.max(0, x, x+rx, extrema.max_x);
          extrema.max_y = Math.max(0, y, y+ry, extrema.max_y);
          
          //update size for bounding box
          sprite.width = -extrema.min_x + extrema.max_x;
          sprite.height = -extrema.min_y + extrema.max_y;

          draw_commands.push(function (ctx) {
            ctx.beginPath();
            ctx.moveTo(x+rx, y);
            //(cp1), (cp2), (pt)
            ctx.bezierCurveTo(x+rx, y-kry, x+krx, y-ry, x, y-ry);
            ctx.bezierCurveTo(x-krx, y-ry, x-rx, y-kry, x-rx, y);
            ctx.bezierCurveTo(x-rx, y+kry, x-krx, y+ry, x, y+ry);
            ctx.bezierCurveTo(x+krx, y+ry, x+rx, y+kry, x+rx, y);
            ctx.closePath();
            ctx.stroke();
          });
          
        }
      },

      /*
       * @param {Number} x
       * @param {Number} y
       * @param {Number} width
       * @param {Number} height
       * @param {Number} rx
       * @param {Number} ry
       */
      'roundRect': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (x, y, width, height, rx, ry) {
          rx = (rx === undefined) ? 0 : rx; //default to rectangle
          ry = (ry === undefined) ? 0 : ry;
          /*DEBUG*/
          check_number_type(x, this+'.graphics.roundRect', '*x*, y, width, height, rx, ry');
          check_number_type(y, this+'.graphics.roundRect', 'x, *y*, width, height, rx, ry');
          check_number_type(width, this+'.graphics.roundRect', 'x, y, *width*, height, rx, ry');
          check_number_type(height, this+'.graphics.roundRect', 'x, y, width, *height*, rx, ry');
          check_number_type(rx, this+'.graphics.roundRect', 'x, y, width, height, *rx*, ry');
          check_number_type(ry, this+'.graphics.roundRect', 'x, y, width, height, rx, *ry*');
          /*END_DEBUG*/
          var x3 = x + width,
              x2 = x3 - rx,
              x1 = x + rx,
              y3 = y + height,
              y2 = y3 - ry,
              y1 = y + ry;

          //update extremas
          extrema.min_x = Math.min(0, x, extrema.min_x);
          extrema.min_y = Math.min(0, y, extrema.min_y);
          extrema.max_x = Math.max(0, x, x+width, extrema.max_x);
          extrema.max_y = Math.max(0, y, y+height, extrema.max_y);
          
          //update size for bounding box
          sprite.width = -extrema.min_x + extrema.max_x;
          sprite.height = -extrema.min_y + extrema.max_y;

          draw_commands.push(function (ctx) {
            ctx.beginPath();
            //clockwise
            ctx.moveTo(x1, y);
            ctx.beginPath();
            ctx.lineTo(x2, y);
            ctx.quadraticCurveTo(x3, y, x3, y1);
            ctx.lineTo(x3, y2);
            ctx.quadraticCurveTo(x3, y3, x2, y3);
            ctx.lineTo(x1, y3);
            ctx.quadraticCurveTo(x, y3, x, y2);
            ctx.lineTo(x, y1);
            ctx.quadraticCurveTo(x, y, x1, y);
            ctx.closePath();
            ctx.stroke();
          });
          
        }
      },

      /*
       * @param {Number} x
       * @param {Number} y
       */
      'moveTo': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (x, y) {
          /*DEBUG*/
          check_number_type(x, this+'.graphics.moveTo', '*x*, y');
          check_number_type(y, this+'.graphics.moveTo', 'x, *y*');
          /*END_DEBUG*/
          draw_commands.push(function (ctx) {
            ctx.moveTo(x, y);
          });
          //update cursor
          cursor_x = x;
          cursor_y = y;
          
        }
      },

      /*
       * @param {Number} x
       * @param {Number} y
       */
      'lineTo': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (x, y) {
          /*DEBUG*/
          check_number_type(x, this+'.graphics.lineTo', '*x*, y');
          check_number_type(y, this+'.graphics.lineTo', 'x, *y*');
          /*END_DEBUG*/

          //update extremas
          extrema.min_x = Math.min(0, x, cursor_x, extrema.min_x);
          extrema.min_y = Math.min(0, y, cursor_y, extrema.min_y);
          extrema.max_x = Math.max(0, x, cursor_x, extrema.max_x);
          extrema.max_y = Math.max(0, y, cursor_y, extrema.max_y);
          
          //update size for bounding box
          sprite.width = extrema.max_x - extrema.min_x;
          sprite.height = extrema.max_y - extrema.min_y;
          
          draw_commands.push(function (ctx) {
            ctx.lineTo(x, y);
          });

          //update cursor
          cursor_x = x;
          cursor_y = y;
          
        }
      },

      /* Quadratic curve to point.
       * @param {Point} pt1 Control point
       * @param {Point} pt2 End point
       */
      'curveTo': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (pt1, pt2) {
          /*DEBUG*/
          check_point_type(pt1, this+'.graphics.curveTo', '*ctl_point*, point');
          check_point_type(pt2, this+'.graphics.curveTo', 'ctl_point, *point*');
          /*END_DEBUG*/
          var x0 = cursor_x,
              y0 = cursor_y,
              x1 = pt1.x,
              y1 = pt1.y,
              x2 = pt2.x,
              y2 = pt2.y,
              t,
              cx = 0,
              cy = 0;
          
          //curve ratio of extrema
          t = (x0 - x1) / (x0 - 2 * x1 + x2);
          //if true, store extrema position
          if (0 <= t && t <= 1) {
            cx = (1-t) * (1-t) * x0 + 2 * (1-t) * t * x1 + t * t * x2;
          }

          t = (y0 - y1) / (y0 - 2 * y1 + y2);
          if (0 <= t && t <= 1) {
            cy = (1-t) * (1-t) * y0 + 2 * (1-t) * t * y1 + t * t * y2;
          }
          
          //update extremas
          extrema.min_x = Math.min(0, x0, cx, x2, extrema.min_x);
          extrema.min_y = Math.min(0, y0, cy, y2, extrema.min_y);
          extrema.max_x = Math.max(0, x0, cx, x2, extrema.max_x);
          extrema.max_y = Math.max(0, y0, cy, y2, extrema.max_y);
          
          //update size for bounding box
          sprite.width = -extrema.min_x + extrema.max_x;
          sprite.height = -extrema.min_y + extrema.max_y;

          draw_commands.push(function (ctx) {
            ctx.quadraticCurveTo(x1, y1, x2, y2);
          });

          //update cursor
          cursor_x = x2;
          cursor_y = y2;
          
        }
      },

      /* Bezier curve to point.
       * @param {Point} pt1 Control point 1
       * @param {Point} pt2 Control point 2
       * @param {Point} pt3 End point
       */
      'bezierCurveTo': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (pt1, pt2, pt3) {
          /*DEBUG*/
          check_point_type(pt1, this+'.graphics.bezierCurveTo', '*ctl_point1*, ctl_point2, point');
          check_point_type(pt2, this+'.graphics.bezierCurveTo', 'ctl_point1, *ctl_point2*, point');
          check_point_type(pt3, this+'.graphics.bezierCurveTo', 'ctl_point1, ctl_point2, *point*');
          /*END_DEBUG*/
          var pow = Math.pow,
              max = Math.max,
              min = Math.min,
              x0 = cursor_x,
              y0 = cursor_y,
              x1 = pt1.x,
              y1 = pt1.y,
              x2 = pt2.x,
              y2 = pt2.y,
              x3 = pt3.x,
              y3 = pt3.y,
              t,
              xt,
              yt,
              cx_max = 0,
              cx_min = 0,
              cy_max = 0,
              cy_min = 0;

          /* Solve for t on curve at various intervals and keep extremas.
           * Kinda hacky until I can find a real equation.
           * 0 <= t && t <= 1
           */
          for (t = 0.1; t < 1; t += 0.1) {
            xt = pow(1-t,3) * x0 + 3 * pow(1-t,2) * t * x1 +
              3 * pow(1-t,1) * pow(t,2) * x2 + pow(t,3) * x3;
            //extremas
            if (xt > cx_max) { cx_max = xt; }
            if (xt < cx_min) { cx_min = xt; }
            
            yt = pow(1-t,3) * y0 + 3 * pow(1-t,2) * t * y1 +
              3 * pow(1-t,1) * pow(t,2) * y2 + pow(t,3) * y3;
            //extremas
            if (yt > cy_max) { cy_max = yt; }
            if (yt < cy_min) { cy_min = yt; }
          }

          //update extremas
          extrema.min_x = min(0, x0, cx_min, x3, extrema.min_x);
          extrema.min_y = min(0, y0, cy_min, y3, extrema.min_y);
          extrema.max_x = max(0, x0, cx_max, x3, extrema.max_x);
          extrema.max_y = max(0, y0, cy_max, y3, extrema.max_y);
          
          //update size for bounding box
          sprite.width = -extrema.min_x + extrema.max_x;
          sprite.height = -extrema.min_y + extrema.max_y;

          draw_commands.push(function (ctx) {
            ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
          });

          //update cursor
          cursor_x = x3;
          cursor_y = y3;

        }
      },

      /* Specifies a simple one-color fill that subsequent calls to other
       * graphics methods use when drawing.
       * @param {Color} color In hex format.
       * @param {Number} alpha
       */
      'beginFill': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (color, alpha) {
          alpha = (alpha === undefined) ? 1 : alpha;
          /*DEBUG*/
          check_number_type(alpha, this+'.graphics.beginFill', 'color, *alpha*');
          /*END_DEBUG*/
          draw_commands.push(function (ctx) {
            ctx.fillStyle = hex_to_rgb_str(color, alpha);
          });
        }
      },

      'beginGradientFill': {
        enumerable: true,
        writable: false,
        configurable: false,
        value: function (type, pt1, pt2, ratios, colors, alphas) {
          /*DEBUG*/
          check_point_type(pt1, this+'.graphics.beginGradientFill', 'type, *point1*, point2, ratios, colors, alphas');
          check_point_type(pt2, this+'.graphics.beginGradientFill', 'type, point1, *point2*, ratios, colors, alphas');
          check_array_type(ratios, this+'.graphics.beginGradientFill', 'type, point1, point2, *ratios*, colors, alphas');
          check_number_type(ratios, this+'.graphics.beginGradientFill', 'type, point1, point2, *ratios*, colors, alphas');
          check_array_type(colors, this+'.graphics.beginGradientFill', 'type, point1, point2, ratios, *colors*, alphas');
          check_array_type(alphas, this+'.graphics.beginGradientFill', 'type, point1, point2, ratios, colors, *alphas*');
          /*END_DEBUG*/
          
          draw_commands.push(function (ctx) {
            var hex_to_rgb_str = doodle.utils.hex_to_rgb_str,
                gradient,
                len = ratios.length,
                i = 0;
            
            if (type === LINEAR) {
              //not really too keen on creating this here, but I need access to the context
              gradient = ctx.createLinearGradient(pt1.x, pt1.y, pt2.x, pt2.y);
              
            } else if (type === RADIAL) {
              /*DEBUG*/
              check_number_type(pt1.radius, this+'.graphics.beginGradientFill', 'type, *circle1.radius*, circle2, ratios, colors, alphas');
              check_number_type(pt2.radius, this+'.graphics.beginGradientFill', 'type, circle1, *circle2.radius*, ratios, colors, alphas');
              /*END_DEBUG*/
              gradient = ctx.createRadialGradient(pt1.x, pt1.y, pt1.radius,
                                                  pt2.x, pt2.y, pt2.radius);
            } else {
              throw new TypeError(this+'.graphics.beginGradientFill(*type*, point1, point2, ratios, colors, alphas): Unknown gradient type.');
            }
            //add color ratios to our gradient
            for (; i < len; i+=1) {
              gradient.addColorStop(ratios[i], hex_to_rgb_str(colors[i], alphas[i]));
            }
            ctx.fillStyle = gradient;
          });
        }
      },

      'beginPatternFill': {
        enumerable: true,
        writable: false,
        configurable: false,
        value: function (image, repeat) {
          var img_loaded = null, //image after loaded
              on_image_error,
              Pattern = doodle.Pattern;
          
          repeat = (repeat === undefined) ? Pattern.REPEAT : repeat;
          /*DEBUG*/
          check_string_type(repeat, this+'.graphics.beginPatternFill', 'image, *repeat*');
          /*END_DEBUG*/
          if (repeat !== Pattern.REPEAT && repeat !== Pattern.NO_REPEAT &&
              repeat !== Pattern.REPEAT_X && repeat !== Pattern.REPEAT_Y) {
            throw new SyntaxError(this+'.graphics.beginPatternFill(image, *repeat*): Invalid pattern repeat type.');
          }
          
          if (typeof image === 'string') {
            //element id
            if (image[0] === '#') {
              image = get_element(image, this+'.beginPatternFill');
            } else {
              //url
              (function () {
                var img_url = encodeURI(image);
                image = new Image();
                image.src = img_url;
              }());
            }
          }
          
          /*DEBUG*/
          if (image && image.tagName !== 'IMG') {
            throw new TypeError(this+'.graphics.beginPatternFill(*image*, repeat): Parameter must be an src url, image object, or element id.');
          }
          /*END_DEBUG*/

          //check if image has already been loaded
          if (image.complete) {
            img_loaded = image;
          } else {
            //if not, assign load handlers
            image.onload = function () {
              img_loaded = image;
              sprite.dispatchEvent(doodle_Event(doodle_Event.LOAD));
            };
            on_image_error = function () {
              throw new URIError(this+'.graphics.beginPatternFill(*image*,repeat): Unable to load ' + image.src);
            };
            image.onerror = on_image_error;
            image.onabort = on_image_error;
          }
          
          draw_commands.push(function (ctx) {
            if (img_loaded) {
              ctx.fillStyle = ctx.createPattern(img_loaded, repeat);
            } else {
              //use transparent fill until image is loaded
              ctx.fillStyle = 'rgba(0,0,0,0)';
            }
          });
          
        }
      },

      'lineStyle': {
        enumerable: true,
        writable: false,
        configurable: false,
        value: function (thickness, color, alpha, caps, joints, miterLimit) {
          //defaults
          thickness = (thickness === undefined) ? 1 : thickness;
          color = (color === undefined) ? "#000000" : color;
          alpha = (alpha === undefined) ? 1 : alpha;
          caps = (caps === undefined) ? doodle.LineCap.BUTT : caps;
          joints = (joints === undefined) ? doodle.LineJoin.MITER : joints;
          miterLimit = (miterLimit === undefined) ? 10 : miterLimit;
          
          /*DEBUG*/
          check_number_type(thickness, this+'.graphics.lineStyle', '*thickness*, color, alpha, caps, joints, miterLimit');
          check_number_type(alpha, this+'.graphics.lineStyle', 'thickness, color, *alpha*, caps, joints, miterLimit');
          check_string_type(caps, this+'.graphics.lineStyle', 'thickness, color, alpha, *caps*, joints, miterLimit');
          check_string_type(joints, this+'.graphics.lineStyle', 'thickness, color, alpha, caps, *joints*, miterLimit');
          check_number_type(miterLimit, this+'.graphics.lineStyle', 'thickness, color, alpha, caps, joints, *miterLimit*');
          /*END_DEBUG*/
          
          //convert color to canvas rgb() format
          if (typeof color === 'string' || typeof color === 'number') {
            color = hex_to_rgb_str(color, alpha);
          } else {
            throw new TypeError(this+'.graphics.lineStyle(thickness,*color*,alpha,caps,joints,miterLimit): Color must be a hex value.');
          }

          draw_commands.push(function (ctx) {
            ctx.lineWidth = thickness;
            ctx.strokeStyle = color;
            ctx.lineCap = caps;
            ctx.lineJoin = joints;
            ctx.miterLimit = miterLimit;
          });
          
        }
      },

      'beginPath': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function () {
          draw_commands.push(function (ctx) {
            ctx.beginPath();
            ctx.moveTo(cursor_x, cursor_y);
          });
        }
      },

      'closePath': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function () {
          draw_commands.push(function (ctx) {
            ctx.closePath();
            ctx.stroke();
          });
          cursor_x = 0;
          cursor_y = 0;
        }
      },

      //temp
      'endFill': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function () {
          draw_commands.push(function (ctx) {
            ctx.fill();
          });
        }
      },
      
      //temp
      'stroke': {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function () {
          draw_commands.push(function (ctx) {
            ctx.stroke();
          });
          cursor_x = 0;
          cursor_y = 0;
        }
      }

    });//end defineProperties

    return graphics;
  };
  

  graphics_static_properties = {
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return "[object Graphics]";
      }
    }
  };

}());//end class closure
/*globals doodle*/

(function () {
  var sprite_static_properties,
      isSprite,
      inheritsSprite,
      check_sprite_type,
      hex_to_rgb_str = doodle.utils.hex_to_rgb_str,
      rgb_str_to_hex = doodle.utils.rgb_str_to_hex,
      check_number_type = doodle.utils.types.check_number_type,
      check_function_type = doodle.utils.types.check_function_type,
      check_point_type = doodle.utils.types.check_point_type,
      check_rect_type = doodle.utils.types.check_rect_type,
      check_context_type = doodle.utils.types.check_context_type,
      inheritsNode = doodle.Node.inheritsNode,
      doodle_Rectangle = doodle.geom.Rectangle;

  /* Super constructor
   * @param {String|Function} id|initializer
   * @return {Object}
   */
  doodle.Sprite = function (id) {
    //only pass id if string, an init function will be called later
    var sprite = Object.create(doodle.Node((typeof id === 'string') ? id : undefined));

    /*DEBUG*/
    if (arguments.length > 1) {
      throw new SyntaxError("[object Sprite](id): Invalid number of parameters.");
    }
    /*END_DEBUG*/

    Object.defineProperties(sprite, sprite_static_properties);
    //properties that require privacy
    Object.defineProperties(sprite, (function () {
      var draw_commands = [],
          extrema = {min_x:0, max_x:0, min_y:0, max_y:0};
      
      return {
        /* The graphics object contains drawing operations to be stored in draw_commands.
         * Objects and Arrays are passed by reference, so these will be modified
         */
        'graphics': {
          enumerable: false,
          configurable: false,
          value:  Object.create(doodle.Graphics(sprite, draw_commands, extrema))
        },
        
        /*
         * PROPERTIES
         */

        /* Indicates the width of the sprite, in pixels.
         * @param {Number}
         */
        'width': (function () {
          var width = 0;
          return {
            enumerable: true,
            configurable: false,
            get: function () {
              return width;
            },
            set: function (n) {
              /*DEBUG*/
              check_number_type(n, this+'.width');
              /*END_DEBUG*/
              width = n;
            }
          };
        }()),

        /* Indicates the height of the sprite, in pixels.
         * @param {Number}
         */
        'height': (function () {
          var height = 0;
          return {
            enumerable: true,
            configurable: false,
            get: function () {
              return height;
            },
            set: function (n) {
              /*DEBUG*/
              check_number_type(n, this+'.height');
              /*END_DEBUG*/
              height = n;
            }
          };
        }()),

        /*
         * @param {Node|Matrix} targetCoordSpace
         * @return {Rectangle}
         */
        'getBounds': {
          enumerable: true,
          writable: true,
          configurable: false,
          value: function (targetCoordSpace) {
            /*DEBUG*/
            if (!inheritsNode(targetCoordSpace)) {
              throw new TypeError(this+'.getBounds(targetCoordinateSpace): Parameter must inherit from doodle.Node.');
            }
            /*END_DEBUG*/
            var bounding_box = doodle_Rectangle(),
                w = this.width,
                h = this.height,
                min = Math.min,
                max = Math.max,
                //transform corners to global
                tl = this.localToGlobal({x: extrema.min_x, y: extrema.min_y}), //top left
                tr = this.localToGlobal({x: extrema.min_x+w, y: extrema.min_y}), //top right
                br = this.localToGlobal({x: extrema.min_x+w, y: extrema.min_y+h}), //bot right
                bl = this.localToGlobal({x: extrema.min_x, y: extrema.min_y+h}); //bot left
            
            //transform global to target space
            tl = targetCoordSpace.globalToLocal(tl);
            tr = targetCoordSpace.globalToLocal(tr);
            br = targetCoordSpace.globalToLocal(br);
            bl = targetCoordSpace.globalToLocal(bl);

            //set rect with extremas
            bounding_box.left = min(tl.x, tr.x, br.x, bl.x);
            bounding_box.right = max(tl.x, tr.x, br.x, bl.x);
            bounding_box.top = min(tl.y, tr.y, br.y, bl.y);
            bounding_box.bottom = max(tl.y, tr.y, br.y, bl.y);

            return bounding_box;
          }
        },
        
        'hitArea': (function () {
          var hit_area = null;
          return {
            enumerable: true,
            configurable: false,
            get: function () {
              if (hit_area === null) {
                return this.getBounds(this);
              } else {
                return hit_area;
              }
            },
            set: function (rect) {
              //accepts null/false or rectangle area for now
              rect = (rect === false) ? null : rect;
              /*DEBUG*/
              if (rect !== null) {
                check_rect_type(rect, this+'.hitArea');
              }
              /*END_DEBUG*/
              hit_area = rect;
            }
          };
        }()),

        'hitTestObject': {
          enumerable: true,
          writable: true,
          configurable: false,
          value: function (obj) {
            /*DEBUG*/
            check_sprite_type(obj, this+'.hitTestObject', '*sprite*');
            /*END_DEBUG*/
            return this.getBounds(this).intersects(obj.getBounds(this));
          }
        },

        'hitTestPoint': {
          enumerable: true,
          writable: true,
          configurable: false,
          value: function (pt) {
            /*DEBUG*/
            check_point_type(pt, this+'.hitTestPoint', '*point*');
            /*END_DEBUG*/
            return this.getBounds(this).containsPoint(this.globalToLocal(pt));
          }
        },

        //drawing context to use
        'context': {
          get: function () {
            //will keep checking parent for context till found or null
            var node = this.parent;
            while (node) {
              if (node.context) {
                /*DEBUG*/
                check_context_type(node.context, this+'.context (traversal)');
                /*END_DEBUG*/
                return node.context;
              }
              node = node.parent;
            }
            return null;
          }
        },

        /*
         * METHODS
         */

        /* When called execute all the draw commands in the stack.
         * This draws from screen 0,0 - transforms are applied when the
         * entire scene graph is drawn.
         * @private
         * @param {Context} ctx 2d canvas context to draw on.
         */
        '__draw': {
          enumerable: false,
          writable: false,
          configurable: false,
          value: function (ctx) {
            /*DEBUG*/
            check_context_type(ctx, this+'.__draw', '*context*');
            /*END_DEBUG*/
            draw_commands.forEach(function (cmd) {
              /*DEBUG*/
              check_function_type(cmd, sprite+'.__draw: [draw_commands]::', '*command*');
              /*END_DEBUG*/
              cmd.call(sprite, ctx);
            });
          }
        },

        /* Debug
         */
        'debug': {
          enumerable: true,
          configurable: false,
          value: Object.create(null, {
            'boundingBox': (function () {
              var debug_boundingBox = "rgb(0,0,255)";
              return {
                enumerable: true,
                configurable: false,
                get: function () {
                  return rgb_str_to_hex(debug_boundingBox);
                },
                set: function (color) {
                  /*DEBUG*/
                  if (typeof color === 'number') {
                    color = hex_to_rgb_str(color);
                  } else if (typeof color === 'string' && color[0] === '#') {
                    color = hex_to_rgb_str(color);
                  }
                  /*END_DEBUG*/
                  debug_boundingBox = color;
                }
              };
            }())
          })
        }
      };
    }()));//end defineProperties

    //passed an initialization function
    if (typeof arguments[0] === 'function') {
      arguments[0].call(sprite);
    }
    
    return sprite;
  };

  
  sprite_static_properties = {
    'rotation': (function () {
      var to_degrees = 180 / Math.PI,
          to_radians = Math.PI / 180;
      return {
        enumerable: true,
        configurable: false,
        get: function () {
          return this.transform.rotation * to_degrees;
        },
        set: function (deg) {
          /*DEBUG*/
          check_number_type(deg, this+'.rotation', '*degrees*');
          /*END_DEBUG*/
          this.transform.rotation = deg * to_radians;
        }
      };
    }()),

    /*
     * METHODS
     */

    /* Returns the string representation of the specified object.
     * @param {String}
     */
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return "[object Sprite]";
      }
    },

    /* Updates the position and size of this sprite.
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     * @return {Sprite}
     */
    'compose': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (x, y, width, height) {
        /*DEBUG*/
        check_number_type(x, this+'.compose', '*x*, y, width, height');
        check_number_type(y, this+'.compose', 'x, *y*, width, height');
        check_number_type(width, this+'.compose', 'x, y, *width*, height');
        check_number_type(height, this+'.compose', 'x, y, width, *height*');
        /*END_DEBUG*/
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
      }
    }
  };//end sprite_static_properties
  
  
  /*
   * CLASS METHODS
   */
  
  isSprite = doodle.Sprite.isSprite = function (obj) {
    return obj.toString() === '[object Sprite]';
  };

  /* Check if object inherits from Sprite.
   * @param {Object} obj
   * @return {Boolean}
   */
  inheritsSprite = doodle.Sprite.inheritsSprite = function (obj) {
    while (obj) {
      if (isSprite(obj)) {
        return true;
      } else {
        if (typeof obj !== 'object') {
          return false;
        }
        obj = Object.getPrototypeOf(obj);
      }
    }
    return false;
  };

  check_sprite_type = doodle.utils.types.check_sprite_type = function (sprite, caller, param) {
    if (inheritsSprite(sprite)) {
      return true;
    } else {
      caller = (caller === undefined) ? "check_sprite_type" : caller;
      param = (param === undefined) ? "" : '('+param+')';
      throw new TypeError(caller + param +": Parameter must inherit from Sprite.");
    }
  };
  
}());//end class closure
/*globals doodle*/
(function () {
  var node_static_properties,
      doodle_utils = doodle.utils,
      check_number_type = doodle_utils.types.check_number_type,
      check_string_type = doodle_utils.types.check_string_type,
      check_boolean_type = doodle_utils.types.check_boolean_type,
      rgb_str_to_hex = doodle_utils.rgb_str_to_hex,
      hex_to_rgb_str = doodle_utils.hex_to_rgb_str,
      get_element = doodle_utils.get_element,
      get_element_property = doodle_utils.get_element_property,
      set_element_property = doodle_utils.set_element_property;
  
  /* Super constructor
   * @param {String|Function} id|initializer
   * @return {Object}
   */
  doodle.ElementNode = function (element) {
    var element_node = Object.create(doodle.Node());

    /*DEBUG*/
    if (arguments.length > 1) {
      throw new SyntaxError("[object ElementNode](element): Invalid number of parameters.");
    }
    /*END_DEBUG*/

    Object.defineProperties(element_node, node_static_properties);
    //properties that require privacy
    Object.defineProperties(element_node, {
      'element': (function () {
        var dom_element = null;
        return {
          configurable: true,
          get: function () {
            return dom_element;
          },
          set: function (elementArg) {
            if (elementArg === null) {
              dom_element = null;
            } else {
              elementArg = get_element(elementArg);
              /*DEBUG*/
              if (!elementArg) {
                throw new TypeError("[object ElementNode]: Parameter must be a DOM Element");
              }
              /*END_DEBUG*/
              dom_element = elementArg;
            }
          }
        };
      }())
    });//end defineProperties

    //passed an initialization function
    if (typeof arguments[0] === 'function') {
      arguments[0].call(element_node);
    } else if (element !== undefined) {
      //standard instantiation
      element_node.element = element;
    }

    return element_node;
  };

  
  node_static_properties = {
    'id': {
      get: function () {
        return get_element_property(this.element, 'id');
      },
      set: function (name) {
        /*DEBUG*/
        check_string_type(name, this+'.id');
        /*END_DEBUG*/
        return set_element_property(this.element, 'id', name, 'html');
      }
    },
    
    'width': {
      enumerable: true,
      configurable: true,
      get: function () {
        return get_element_property(this.element, 'width', 'int');
      },
      set: function (n) {
        /*DEBUG*/
        check_number_type(n, this+'.width');
        /*END_DEBUG*/
        set_element_property(this.element, 'width', n+"px");
        return n;
      }
    },
    
    'height': {
      enumerable: true,
      configurable: true,
      get: function () {
        return get_element_property(this.element, 'height', 'int');
      },
      set: function (n) {
        /*DEBUG*/
        check_number_type(n, this+'.height');
        /*END_DEBUG*/
        set_element_property(this.element, 'height', n+"px");
        return n;
      }
    },

    'backgroundColor': {
      get: function () {
        return rgb_str_to_hex(get_element_property(this.element, 'backgroundColor'));
      },
      set: function (color) {
        if (typeof color === 'number') {
          color = hex_to_rgb_str(color);
        }
        return set_element_property(this.element, 'backgroundColor', color);
      }
    },

    'backgroundImage': (function () {
      var url_regexp = new RegExp("^url\\((.*)\\)");
      return {
        get: function () {
          var url = get_element_property(this.element, 'backgroundImage');
          url = (url === "none") ? null : url.match(url_regexp);
          //returns the captured substring match
          return url ? url[1] : null;
        },
        set: function (image) {
          if (!image) {
            return set_element_property(this.element, 'backgroundImage', null);
          }
          //a string can be a page element or url
          if (typeof image === 'string') {
            if (image[0] === '#') {
              image = get_element(image).src;
            }
          } else if (image && image.tagName === 'IMG') {
            //passed an image element
            image = image.src;
          }
          /*DEBUG*/
          check_string_type(image, this+'.backgroundImage');
          /*END_DEBUG*/

          //url path at this point, make sure it's in the proper format
          if (!url_regexp.test(image)) {
            image = "url("+ encodeURI(image) +")";
          }
          return set_element_property(this.element, 'backgroundImage', image);
        }
      };
    }()),

    /* Default is repeat.
     */
    'backgroundRepeat': {
      get: function () {
        return get_element_property(this.element, 'backgroundRepeat');
      },
      set: function (repeat) {
        /*DEBUG*/
        check_string_type(repeat, this+'.backgroundRepeat');
        switch (repeat) {
        case 'repeat':
        case 'repeat-x':
        case 'repeat-y':
        case 'no-repeat':
        case 'inherit':
          break;
        default:
          throw new SyntaxError(this+'.backgroundRepeat: Invalid CSS value.');
        }
        /*END_DEBUG*/
        return set_element_property(this.element, 'backgroundRepeat', repeat);
      }
    },

    'alpha': {
      get: function () {
        return get_element_property(this.element, 'opacity', 'float');
      },
      set: function (alpha) {
        /*DEBUG*/
        check_number_type(alpha, this+'.alpha');
        alpha = (alpha < 0) ? 0 : ((alpha > 1) ? 1 : alpha);
        /*END_DEBUG*/
        return set_element_property(this.element, 'opacity', alpha);
      }
    },

    'visible': {
      get: function () {
        switch (get_element_property(this.element, 'visibility')) {
        case 'visible':
          return true;
        case 'hidden':
          return false;
        default:
          throw new ReferenceError(this+".visible: Unable to determine visibility.");
        }
      },
      set: function (isVisible) {
        /*DEBUG*/
        check_boolean_type(isVisible, this+'.visible');
        /*END_DEBUG*/
        if (isVisible) {
          set_element_property(this.element, 'visibility', 'visible');
        } else {
          set_element_property(this.element, 'visibility', 'hidden');
        }
        return isVisible;
      }
    },

    /*
     * METHODS
     */

    /* Returns the string representation of the specified object.
     * @return {String}
     */
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return "[object ElementNode]";
      }
    }
  };//end node_static_properties
  
}());//end class closure
(function () {
  var layer_static_properties,
      layer_count = 0,
      check_number_type = doodle.utils.types.check_number_type,
      check_canvas_type = doodle.utils.types.check_canvas_type,
      get_element_property = doodle.utils.get_element_property,
      set_element_property = doodle.utils.set_element_property;
  
  /* Super constructor
   * @param {String|Function} id|initializer
   * @return {Object}
   */
  doodle.Layer = function (id, element) {
    var arg_len = arguments.length,
        initializer,
        layer = Object.create(doodle.ElementNode()),
        layer_name = "layer" + layer_count;

    //check if passed an init function
    if (arg_len === 1 && typeof arguments[0] === 'function') {
      initializer = arguments[0];
      id = undefined;
    } else if (arg_len > 2) {
      throw new SyntaxError("[object Layer]: Invalid number of parameters.");
    }

    Object.defineProperties(layer, layer_static_properties);
    //properties that require privacy
    Object.defineProperties(layer, {
      'element': {
        get: function () {
          return element;
        },
        set: function (canvas) {
          /*DEBUG*/
          check_canvas_type(canvas, this+'.element');
          /*END_DEBUG*/
          element = canvas;
        }
      }
    });

    //init
    layer.element = element || document.createElement('canvas');
    //need to stack canvas elements inside div
    layer.element.style.position = "absolute";

    //passed an initialization object: function
    if (initializer) {
      initializer.call(layer);
    }

    if (!layer.id) {
      layer.id = (typeof id === 'string') ? id : "layer" + String('00'+layer_count).slice(-2);
      layer_count += 1;
    }

    return layer;
  };

  (function () {
    /*
     * CLASS METHODS
     */

    /* Test if an object is an node.
     * Not the best way to test object, but it'll do for now.
     * @param {Object} obj
     * @return {Boolean}
     */
    var isLayer = doodle.Layer.isLayer = function (obj) {
      return obj.toString() === '[object Layer]';
    };

    /* Check if object inherits from node.
     * @param {Object} obj
     * @return {Boolean}
     */
    var inheritsLayer = doodle.Layer.inheritsLayer = function (obj) {
      while (obj) {
        if (isLayer(obj)) {
          return true;
        } else {
          if (typeof obj !== 'object') {
            return false;
          }
          obj = Object.getPrototypeOf(obj);
        }
      }
      return false;
    };

    doodle.utils.types.check_layer_type = function (layer, caller, param) {
      if (inheritsLayer(layer)) {
        return true;
      } else {
        caller = (caller === undefined) ? "check_layer_type" : caller;
        param = (param === undefined) ? "" : '('+param+')';
        throw new TypeError(caller + param +": Parameter must be a Layer.");
      }
    };
    
  }());

  /* STATIC PROPERTIES
   */
  layer_static_properties = {
    'context': {
      get: function () {
        return this.element.getContext('2d');
      }
    },

    /* Canvas dimensions need to apply to HTML attributes.
     */
    'width': {
        get: function () {
          return get_element_property(this.element, 'width', 'int');
        },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.width');
          /*END_DEBUG*/
          set_element_property(this.element, 'width', n, 'html');
          return n;
        }
      },
      
      'height': {
        get: function () {
          return get_element_property(this.element, 'height', 'int');
        },
        set: function (n) {
          /*DEBUG*/
          check_number_type(n, this+'.height');
          /*END_DEBUG*/
          set_element_property(this.element, 'height', n, 'html');
          return n;
        }
      },

    /* Returns the string representation of the specified object.
     * @return {String}
     */
    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return "[object Layer]";
      }
    }
    
  };//end layer_static_properties
  
}());//end class closure
(function () {
  var display_static_properties,
      check_boolean_type = doodle.utils.types.check_boolean_type,
      check_number_type = doodle.utils.types.check_number_type,
      check_string_type = doodle.utils.types.check_string_type,
      check_layer_type = doodle.utils.types.check_layer_type,
      check_context_type = doodle.utils.types.check_context_type,
      check_block_element = doodle.utils.types.check_block_element,
      isLayer = doodle.Layer.isLayer,
      get_element = doodle.utils.get_element,
      get_element_property = doodle.utils.get_element_property,
      set_element_property = doodle.utils.set_element_property,
      inheritsSprite = doodle.Sprite.inheritsSprite,
      doodle_Event = doodle.Event,
      doodle_MouseEvent = doodle.MouseEvent,
      ENTER_FRAME = doodle_Event.ENTER_FRAME,
      enterFrame = doodle_Event(ENTER_FRAME),
      dispatcher_queue = doodle.EventDispatcher.dispatcher_queue;
  
  /* Super constructor
   * @param {String|Function} id|initializer
   * @return {Object}
   */
  doodle.Display = function (element) {
    var arg_len = arguments.length,
        initializer,
        display = Object.create(doodle.ElementNode()),
        frame_count = 0,
        mouseX = 0,
        mouseY = 0,
        debug_stats = null, //stats object
        debug_bounding_box = false;
    
    //check if passed an init function
    if (arg_len === 1 && typeof arguments[0] === 'function') {
      initializer = arguments[0];
      element = undefined;
    } else if (arg_len > 1) {
      throw new SyntaxError("[object Display]: Invalid number of parameters.");
    }

    Object.defineProperties(display, display_static_properties);
    //properties that require privacy
    Object.defineProperties(display, {
      'element': {
        get: function () {
          return element;
        },
        set: function (id) {
          //get by name or actual element
          //element = document.getElementById(id);
          var e = get_element(id, '[object Display]'),
              type,
              w, h;
          
          /*DEBUG*/
          check_block_element(e, this+'.element');
          /*END_DEBUG*/
          
          element = e;

          //we need to stack the canvas elements on top of each other
          element.style.position = "relative";
          //init rest - can you transfer layers to another div?
          this.root = this;

          //check for default values
          w = e.getAttribute('width');
          h = e.getAttribute('height');
          if (w) { this.width = parseInt(w); }
          if (h) { this.height = parseInt(h); }

          //add listeners to dom events that we'll re-dispatch to the scene graph
          for (type in doodle_MouseEvent) {
            element.addEventListener(doodle_MouseEvent[type], dispatch_mouse_event, false);
          }

          element.addEventListener(doodle_MouseEvent.MOUSE_MOVE, function (evt) {
            mouseX = evt.offsetX;
            mouseY = evt.offsetY;
          }, false);
          
          //add keyboard listeners to document
          //how to make this work for multiple displays?
          document.addEventListener(doodle.KeyboardEvent.KEY_PRESS, dispatch_keyboard_event, false);
          document.addEventListener(doodle.KeyboardEvent.KEY_DOWN, dispatch_keyboard_event, false);
          document.addEventListener(doodle.KeyboardEvent.KEY_UP, dispatch_keyboard_event, false);
          
        }
      },

      /* Determines the interval to dispatch the event type Event.ENTER_FRAME.
       * This event is dispatched simultaneously to all display objects listenting
       * for this event. It does not go through a "capture phase" and is dispatched
       * directly to the target, whether the target is on the display list or not.
       */
      'frameRate': (function () {
        var frame_rate = false, //fps
            framerate_interval_id;
        return {
          get: function () { return frame_rate; },
          set: function (fps) {
            //turn off interval
            if (fps === 0 || fps === false) {
              frame_rate = false;
              clearInterval(framerate_interval_id);
            } else if (typeof fps === 'number' && isFinite(1000/fps)) {
              frame_rate = fps;
              clearInterval(framerate_interval_id);
              framerate_interval_id = setInterval(create_frame, 1000/frame_rate);
            } else {
              throw new TypeError('[object Display].frameRate: Parameter must be a valid number or false.');
            }
          }
        }
      }()),

      'mouseX': {
        enumerable: false,
        configurable: false,
        get: function () {
          return mouseX;
        }
      },

      'mouseY': {
        enumerable: false,
        configurable: false,
        get: function () {
          return mouseY;
        }
      },

      /* For debugging
       */
      'debug': {
        enumerable: true,
        configurable: false,
        value: Object.create(null, {
          'stats': {
            enumerable: true,
            configurable: false,
            get: function () {
              return debug_stats ? true : false;
            },
            set: function (useStats) {
              /*DEBUG*/
              check_boolean_type(useStats, display+'.debug.stats');
              /*END_DEBUG*/
              if (useStats && !debug_stats) {
                //fps counter from http://github.com/mrdoob/stats.js
                debug_stats = new Stats();
                display.element.appendChild(debug_stats.domElement);
              } else if (!useStats && debug_stats) {
                display.element.removeChild(debug_stats.domElement);
                debug_stats = null;
              }
            }
          },
          'boundingBox': {
            enumerable: true,
            configurable: false,
            get: function () {
              return debug_bounding_box;
            },
            set: function (showBoundingBox) {
              /*DEBUG*/
              check_boolean_type(showBoundingBox, display+'.debug.boundingBox');
              /*END_DEBUG*/
              debug_bounding_box = showBoundingBox;
            }
          }
        })
      }
      
    });

    //passed an initialization object: function
    if (initializer) {
      initializer.call(display);
    } else {
      //init
      display.element = element;
    }

    if (!display.element) {
      throw new ReferenceError("[object Display]: Requires a HTML element.");
    }

    /* Redraw scene graph when children are added and removed.
     */
    display.addEventListener(doodle_Event.ADDED, redraw_scene_graph);
    display.addEventListener(doodle_Event.REMOVED, redraw_scene_graph);

    //draw_scene_graph(display);
    redraw_scene_graph();
    return display;

    
    /* Clear, move, draw.
     * Dispatches Event.ENTER_FRAME to all objects listening to it,
     * reguardless if it's on the scene graph or not.
     */
    function create_frame () {
      clear_scene_graph(display);
      dispatcher_queue.forEach(function dispatch_enterframe_evt (obj) {
        if (obj.hasEventListener(ENTER_FRAME)) {
          enterFrame.__setTarget(obj);
          obj.handleEvent(enterFrame);
        }
      });
      draw_scene_graph(display);
      frame_count += 1;
      //update our stats counter if needed
      if (debug_stats) {
        debug_stats.update();
      }
    }
    
    function clear_scene_graph (node, context) {
      /* Brute way, clear entire layer in big rect.
       */
      display.children.forEach(function (layer) {
        var ctx = layer.context;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); //reset
        ctx.clearRect(0, 0, layer.width, layer.height);
        ctx.restore();
      });
      /*
      node.children.forEach(function (child) {
        context = context || child.context;
        context.clearRect(0, 0, child.width, child.height);
      });
      */
      
      /* Clear each object individually by clearing it's bounding box.
       * Will need to test speed, and it's not working now.
       *
      node.children.forEach(function (child) {
        
        context = context || child.context;
        check_context_type(context, this+'.clear_scene_graph', 'context');
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0); //reset
        
        if (typeof child.getBounds === 'function') {
          var bounds = child.getBounds(display);
          //console.log(bounds.toString());
          //take into account bounding box border
          context.clearRect(bounds.x-1, bounds.y-1, bounds.width+2, bounds.height+2);
          //context.fillRect(bounds.x-1, bounds.y-1, bounds.width+2, bounds.height+2);
        }
        context.restore();
        clear_scene_graph(child, context);
      });
      */
    }
    
    function draw_scene_graph (node, context) {
      var m, //child transform matrix
          bounding_box,
          global_pt; //transformed point for bounding box
      
      node.children.forEach(function draw_child (child) {
        //if node is invisible, don't draw it or it's children
        //this is the behavior in as3
        if (child.visible) {
          context = context || child.context;
          m = child.transform.toArray();
          context.save();
          context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

          if (debug_bounding_box) {
            draw_bounding_box(child, context);
          }
          
          //apply alpha to node and it's children
          if (!isLayer(child)) {
            if (child.alpha !== 1) {
              context.globalAlpha = child.alpha;
            }
          }
          
          if (typeof child.__draw === 'function') {
            child.__draw(context);
          };
          
          draw_scene_graph(child, context); //recursive
          context.restore();
        }
      });
    }

    function draw_bounding_box (sprite, context) {
      if (typeof sprite.getBounds === 'function') {
        //calculate bounding box relative to parent
        var bbox = sprite.getBounds(display);
        
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0); //reset
        //bounding box
        context.lineWidth = 0.5;
        context.strokeStyle = sprite.debug.boundingBox;
        context.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
        context.restore();
      }
    }
    
    function redraw_scene_graph (evt) {
      clear_scene_graph(display);
      draw_scene_graph(display);
    }

    /* Event dispatching - not ready for prime-time.
     */
    function dispatch_mouse_event (event) {
      //console.log(event.type + ", " + event);
      //last_event = event;
      //position on canvas element
      //offset is relative to div, however this implementation adds 1 to y?
      var dispatcher_queue = doodle.EventDispatcher.dispatcher_queue,
          dq_len = dispatcher_queue.length,
          MOUSE_OVER = doodle_MouseEvent.MOUSE_OVER,
          MOUSE_OUT = doodle_MouseEvent.MOUSE_OUT,
          MOUSE_MOVE = doodle_MouseEvent.MOUSE_MOVE,
          evt = doodle_MouseEvent(event), //wrap dom event in doodle event
          evt_type = evt.type,
          local_pt;

      /* Hack --
       * The idea is that I only want to dispatch a mouse event to the display
       * if there are no other objects under the point to dispatch to.
       */
      var evt_dispatched_p = false;
      
      dispatcher_queue.forEach(function (obj) {
        if (inheritsSprite(obj)) {
          var point_in_bounds = obj.getBounds(display).containsPoint({x: evt.offsetX,
                                                                      y: evt.offsetY});

          evt.__setTarget(null); //dom setting target as canvas element

          if (point_in_bounds && obj.hasEventListener(evt_type)) {
            obj.dispatchEvent(evt);

            evt_dispatched_p = true;
            
          }
          
          //have to manufacture mouse over/out since dom element won't know
          if (point_in_bounds && obj.hasEventListener(MOUSE_OVER)) {
            // __mouse_over property is only used here
            if (!obj.__mouse_over) {
              obj.__mouse_over = true;
              evt.__setType(MOUSE_OVER)
              obj.dispatchEvent(evt);

              evt_dispatched_p = true;
            }
          }
          if (!point_in_bounds && obj.hasEventListener(MOUSE_OUT)) {
            if (obj.__mouse_over) {
              obj.__mouse_over = false;
              evt.__setType(MOUSE_OUT)
              obj.dispatchEvent(evt);

              evt_dispatched_p = true;
            }
          }
          
        } else if (obj.hasEventListener(evt_type)) {
          //if in queue and not sprite, could be ElementNode - display, layer
          //don't want these going off if sprite is in front
          evt.__setTarget(null);
          obj.dispatchEvent(evt);
          evt_dispatched_p = true;
        }
      });

      //dispatch to display if no other object under cursor has
      dispatcher_queue.forEach(function (obj) {
        if (obj === display && !evt_dispatched_p && obj.hasEventListener(MOUSE_MOVE)) {
          if (evt_type === MOUSE_MOVE) {
            evt.__setType(MOUSE_MOVE)
          }
          evt.__setTarget(null)
          obj.dispatchEvent(evt);
          
          evt_dispatched_p = true;
        }
      });
    }

    function dispatch_keyboard_event (event) {
      //console.log("event type: " + event.type + ", bubbles: " + event.bubbles);
      var dispatcher_queue = doodle.EventDispatcher.dispatcher_queue,
          evt = doodle.KeyboardEvent(event); //wrap dom event in doodle event
      
      dispatcher_queue.forEach(function (obj) {
        if (obj.hasEventListener(evt.type)) {
          obj.handleEvent(evt);
        }
      });
    }

  };//end doodle.Display

  
  display_static_properties = {
    'width': {
      get: function () {
        return get_element_property(this.element, 'width', 'int');
      },
      set: function (n) {
        /*DEBUG*/
        check_number_type(n, this+'.width');
        /*END_DEBUG*/
        set_element_property(this.element, 'width', n+"px");
        //cascade down to our canvas layers
        this.children.forEach(function (layer) {
          layer.width = n;
        });
        return n;
      }
    },

    'height': {
      get: function () {
        return get_element_property(this.element, 'height', 'int');
      },
      set: function (n) {
        /*DEBUG*/
        check_number_type(n, this+'.height');
        /*END_DEBUG*/
        set_element_property(this.element, 'height', n+"px");
        //cascade down to our canvas layers
        this.children.forEach(function (layer) {
          layer.height = n;
        });
        return n;
      }
    },

    'toString': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function () {
        return "[object Display]";
      }
    },

    'toDataUrl': {
      value: function () {
        //iterate over each canvas layer,
        //output image data and merge in new file
        //output that image data
        return;
      }
    },

    'addChildAt': {
      value: function (layer, index) {
        /*DEBUG*/
        check_layer_type(layer, this+'.addChildAt', '*layer*, index');
        check_number_type(index, this+'.addChildAt', 'layer, *index*');
        /*END_DEBUG*/
        
        //if has previous parent, remove from it's children
        if (layer.parent !== null && layer.parent !== this) {
          layer.parent.removeChild(node);
        }
        //set ancestry
        layer.root = this;
        layer.parent = this;
        //set layer size to display size
        layer.width = this.width;
        layer.height = this.height;
        //add to children
        this.children.splice(index, 0, layer);
        //add dom element
        this.element.appendChild(layer.element);
        return this;
      }
    },

    'removeChildAt': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (index) {
        /*DEBUG*/
        check_number_type(index, this+'.removeChildAt', '*index*');
        /*END_DEBUG*/
        var layer = this.children[index];
        layer.root = null;
        layer.parent = null;
        //remove from children
        this.children.splice(index, 1);
        //remove from dom
        this.element.removeChild(layer.element);
      }
    },

    'swapChildrenAt': {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function (index1, index2) {
        /*DEBUG*/
        check_number_type(index1, this+'.swapChildrenAt', '*index1*, index2');
        check_number_type(index2, this+'.swapChildrenAt', 'index1, *index2*');
        /*END_DEBUG*/
        var a = this.children;
        a[index1] = a.splice(index2, 1, a[index1])[0];
        //swap dom elements
        if (index1 > index2) {
          this.element.insertBefore(a[index2].element, a[index1].element);
        } else {
          this.element.insertBefore(a[index1].element, a[index2].element);
        }
      }
    },

    /* Convenience methods.
     */
    'addLayer': {
      value: function (id) {
        var layer = doodle.Layer(id); //layer will auto-name
        this.addChild(layer);
        return layer;
      }
    },

    'removeLayer': {
      value: function (id) {
        /*DEBUG*/
        check_string_type(id, this+'.removeLayer', '*id*');
        /*END_DEBUG*/
        this.removeChildById(id);
      }
    }
    
  };//end display_static_properties
}());//end class closure
