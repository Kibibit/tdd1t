$(document).ready(function() {
  waitForWebfonts([ 'Major Mono Display' ], function() {

    setTimeout(() => {

      const headers = [
        '#section01 .title',
        '#section02 .title',
        '#section03 .title',
        '#section04 .title'
      ];

      // Init ScrollMagic
      const controller = new ScrollMagic.Controller();

      headers.forEach(function (header, index) {

        // number for highlighting scenes
        var num = index + 1;

        // make scene
        new ScrollMagic.Scene({
        // trigger CSS animation when header is in the middle of the viewport
          triggerElement: header,
          // offset triggers the animation 95 earlier then
          // middle of the viewport, adjust to your liking
          offset: -95
        })
          // set class to active slide
          .setClassToggle('#section0' + num, 'is-active')
          // add indicators (requires plugin), use for debugging
          // .addIndicators()
          .addTo(controller);
      });

      setTimeout(() => {
        $('.logo-container').toggleClass('bot');
        $('.tdd-logo').toggleClass('bot');
      }, 1800);

    }, 150);
  });

});

hljs.initHighlightingOnLoad();

// TODO: We might change more elements based on first installation
// like including more specific documentation
if (getUrlVars().setup_action === 'install') {
  $('#kb-main-subtitle')
    .text('Thanks for integrating tdd1t')
    .addClass('has-text-success');

  $('.kb-hide-on-install').hide();

}

function getUrlVars() {
  var vars = {};

  window.location.href
    .replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
    });

  return vars;
}

// https://stackoverflow.com/a/11689060/1788884
function waitForWebfonts(fonts, callback) {
  var loadedFonts = 0;
  for (var i = 0, l = fonts.length; i < l; ++i) {
    (function(font) {
      var node = document.createElement('span');
      // Characters that vary significantly among different fonts
      node.innerHTML = 'giItT1WQy@!-/#';
      // Visible - so we can measure it - but not on the screen
      node.style.position      = 'absolute';
      node.style.left          = '-10000px';
      node.style.top           = '-10000px';
      // Large font size makes even subtle changes obvious
      node.style.fontSize      = '300px';
      // Reset any font properties
      node.style.fontFamily    = 'sans-serif';
      node.style.fontVariant   = 'normal';
      node.style.fontStyle     = 'normal';
      node.style.fontWeight    = 'normal';
      node.style.letterSpacing = '0';
      document.body.appendChild(node);

      // Remember width with no applied web font
      var width = node.offsetWidth;

      node.style.fontFamily = font + ', sans-serif';

      var interval;
      function checkFont() {
        // Compare current width with original width
        if (node && node.offsetWidth !== width) {
          ++loadedFonts;
          node.parentNode.removeChild(node);
          node = null;
        }

        // If all fonts have been loaded
        if (loadedFonts >= fonts.length) {
          if (interval) {
            clearInterval(interval);
          }
          if (loadedFonts === fonts.length) {
            callback();
            return true;
          }
        }
      };

      if (!checkFont()) {
        interval = setInterval(checkFont, 50);
      }
    })(fonts[i]);
  }
}
