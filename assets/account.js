$(document).ready(function () {
  $('#subscribe-btn').click(function (e) {
    e.preventDefault();
    $('.subscribe-form form').submit();
  });

  $('#html-body.account a').click(function (e) {
    var tabId = $(this).attr('href');
    console.log(tabId)
    var tab = $(`.tabs ${tabId}`);
    if (tab.length) {
      e.preventDefault();
      $(`.tabs .column`).removeClass('active');
      $(`.tabs ${tabId}`).addClass('active');
    }
  })
});