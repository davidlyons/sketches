// No Sleep

// from http://vr.chromeexperiments.com/app.js

(function() {

  var root = this;
  var previousHas = root.has || {};

  // Navigator Detections

  var ua = root.navigator.userAgent;

  var has = {

    // Mobile Detection

    Android: !!ua.match(/Android/ig),
    Blackberry: !!ua.match(/BlackBerry/ig),
    iOS: !!ua.match(/iPhone|iPad|iPod/ig),
    OperaMini: !!ua.match(/Opera Mini/ig),
    Windows: !!ua.match(/IEMobile/ig),
    WebOS: !!ua.match(/webOS/ig),

    noConflict: function() {
      return previousHas;
    },

    localStorage: !!root.localStorage

  };

  has.mobile = has.Android || has.Blackberry || has.iOS || has.OperaMini || has.Windows || has.WebOS;

  root.has = has;

  // --------------------------------------------------------------------

  var noSleepTimer, noSleepVideo;

  if(has.Android) {
    noSleepVideo = document.createElement('video');

    // loop the video
    noSleepVideo.addEventListener('ended', function(ev) {
      noSleepVideo.play();
    });

    var noSleepBtn = document.querySelector('#no-sleep');

    // start the video on the first touch
    var triggerNoSleep = function() {
      enableNoSleep();
      noSleepBtn.removeEventListener('touchstart', triggerNoSleep, false);
    }
    noSleepBtn.addEventListener('touchstart', triggerNoSleep, false);

  }


  // from inside of promise
  // if (has.mobile) {
  //   enableNoSleep();
  // }


  // Add cross-browser functionality to keep a mobile device from auto-locking.
  function enableNoSleep(duration) {
    if (has.iOS) {
      disableNoSleep();
      noSleepTimer = setInterval(function() {
        window.location = window.location;
        setTimeout(window.stop, 0);
      }, duration || 30000);
    } else if (has.Android) {
      noSleepVideo.src = 'nosleep/nosleep.webm';
      console.log('video play');
      noSleepVideo.play();
    }

  }

  // Turn off cross-browser functionality to keep a mobile device from
  // auto-locking.
  function disableNoSleep() {
    if (has.iOS) {
      if (noSleepTimer) {
        clearInterval(noSleepTimer);
        noSleepTimer = null;
      }
    } else if (has.Android) {
      noSleepVideo.pause();
      noSleepVideo.src = '';
    }
  }

})();

