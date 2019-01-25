setTimeout(() => {
  $('.logo-container').toggleClass('bot');
  $('.tdd-logo').toggleClass('bot');
}, 1500);

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
