/**
 * Small javascript library to generate a color palette.
 *
 * @namespace jPalette
 * @version 0.4.0
 * @author Julien Descamps
 */
;(function(namespace, undefined) {
  'use strict';

  /**
   * Create an instance of Color.
   *
   * @memberof jPalette
   * @constructor
   * @param {number} r - Red color in range [0,255]
   * @param {number} g - Green color in range [0,255]
   * @param {number} b - Blue color in range [0,255]
   * @param {number} a - Alpha transparency in range [0,255]
   */
  var Color = function(r, g, b, a) {
    this.r = r || 0;
    this.g = g || 0;
    this.b = b || 0;
    this.a = a || 0;
  };

  /**
   * Return a color with substracted components from an inputed color.
   *
   * @param {object} color - Color to substract.
   * @return {object}
   * @todo Check range.
   */
  Color.prototype.delta = function(color) {
    return new Color(
      this.r - color.r,
      this.g - color.g,
      this.b - color.b,
      this.a - color.a
    );
  };

  /**
   * Return the css rgb notation.
   *
   * @return {string}
   */
  Color.prototype.rgb = function() {
    return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
  };

  /**
   * Return a predefined color (closure).
   *
   * @param {string} name - Name of the predefined color
   * @return {function}
   */
  Color.get = function(name) {
    return function(alpha) {
      switch (name) {
        default:
        case 'white':
          return new Color(255, 255, 255, alpha);
        case 'black':
          return new Color(0  ,   0,   0, alpha);
        case 'red':
          return new Color(255,   0,   0, alpha);
        case 'green':
          return new Color(0  , 255,   0, alpha);
        case 'blue':
          return new Color(0  ,   0, 255, alpha);
        case 'yellow':
          return new Color(255, 255,   0, alpha);
        case 'cyan':
          return new Color(0  , 255, 255, alpha);
        case 'magenta':
          return new Color(255,   0, 255, alpha);
        case 'indigo':
          return new Color(128,   0, 255, alpha);
        case 'pink':
          return new Color(255,   0, 128, alpha);
        case 'orange':
          return new Color(255, 128,   0, alpha);
        case 'apple':
          return new Color(128, 255,   0, alpha);
        case 'manganese':
          return new Color(0  , 128, 255, alpha);
        case 'guppie':
          return new Color(0  , 255, 128, alpha);
        case 'purple':
          return new Color(128,   0, 128, alpha);
        case 'teal':
          return new Color(0  , 128, 128, alpha);
        case 'olive':
          return new Color(128, 128,   0, alpha);
        case 'coral':
          return new Color(255, 128, 128, alpha);
      }
    };
  };

  /**
   * Main class to create the palette.
   *
   * @memberof jPalette
   * @constructor
   * @param {number} numSteps - number of colors shades in the palette.
   * @param {object[]} colors - Color array to display in the palette.
   */
  var ColorMap = function(numSteps, colors) {
    if (colors.length <= 1) {
      throw 'Two colors minimum.';
    }
    this.map      = [];
    this.numSteps = numSteps;
    this.colors   = colors;
    this.init();
  };

  /**
   * Initialize the palette.
   * @private
   */
  ColorMap.prototype.init = function() {
    var i, globalRatio, firstIndex, lastIndex, localRatio, deltaColor,
        colorDelta = 1 / (this.colors.length - 1),
        that       = this,
        compute    = function(component) {
          return parseInt(
            that.colors[firstIndex][component] + localRatio * deltaColor[component], 10
          );
        };
    for (i = 0; i < this.numSteps; i++) {
      globalRatio = i / (this.numSteps - 1);
      firstIndex  = Math.floor(globalRatio / colorDelta);
      lastIndex   = Math.min(this.colors.length - 1, firstIndex + 1);
      localRatio  = (globalRatio - firstIndex * colorDelta) / colorDelta;
      deltaColor  = this.colors[lastIndex].delta(this.colors[firstIndex]);

      this.map.push(new Color(compute('r'), compute('g'), compute('b'), compute('a')));
    }
  };

  /**
   * Return a color instance from a decimal number between 0 and 1.
   *
   * @param {number} value - Normalized decimal number in range [0,1].
   * @return {object} color - Color instance.
   * @todo Check range.
   */
  ColorMap.prototype.getColor = function(value) {
    var delta = Math.max(0, Math.min(1, value)),
        index = Math.floor(delta * (this.map.length - 1));
    return this.map[index];
  };

  /**
   * Return a predefined palette (closure).
   *
   * @param {string} name - Name of the predefined palette
   * @return {function}
   */
  ColorMap.get = function(name) {
    return function(steps) {
      switch (name) {
        default:
        case 'whitetoblack':
          return new ColorMap(steps, [
            new Color(255, 255, 255, 255),
            new Color(  0,   0,   0, 255)
            ]);
        case 'rgb':
          return new ColorMap(steps, [
            new Color(255,   0,   0, 255),
            new Color(  0, 255,   0, 255),
            new Color(  0,   0, 255, 255)
            ]);
        case 'rainbow':
          return new ColorMap(steps, [
            new Color(255,   0,   0, 255),
            new Color(255, 128,   0, 255),
            new Color(255, 255,   0, 255),
            new Color(0  , 255,   0, 255),
            new Color(128,   0, 128, 255),
            new Color(128,   0, 255, 255),
            new Color(255,   0,   0, 255)
            ]);
        case 'night':
          return new ColorMap(steps, [
            new Color(0  ,   0, 102, 255),
            new Color(255, 255, 255, 255),
            new Color(255, 102,   0, 255),
            new Color(0  ,   0, 102, 255)
            ]);
        case 'blacknwhite':
          return new ColorMap(steps, [
            new Color(255, 255, 255, 255),
            new Color(0  ,   0,   0, 255),
            new Color(255, 255, 255, 255),
            new Color(0  ,   0,   0, 255)
            ]);
        case 'fire':
          return new ColorMap(steps, [
            new Color(0  ,   0,   0, 255),
            new Color(255,   0,   0, 255),
            new Color(255, 255,   0, 255),
            new Color(255,   0,   0, 255)
            ]);
        case 'sky':
          return new ColorMap(steps, [
            new Color(0  ,   0, 120, 255),
            new Color(200, 255, 255, 255),
            new Color(0  ,   0, 120, 255)
            ]);
      }
    };
  };

  // Declare classes into namespace
  namespace.Color = Color;
  namespace.ColorMap = ColorMap;

}(window.jPalette = window.jPalette || {}));
