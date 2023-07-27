$(document).ready(function () {
  var hash = window.location.hash.substr(1);
  if (hash) {
    var tab = $(`.tabs #${hash}`);
    if (tab.length) {
      $(`.tabs .column`).removeClass('active');
      tab.addClass('active');
      $('.account-navigation li').removeClass('current');
      $(`.account-navigation a[href="#${hash}"]`).closest('li').addClass('current');
    }
  }

  $('#subscribe-btn').click(function (e) {
    e.preventDefault();
    $('.subscribe-form form').submit();
  });

  $('#html-body.account a').click(function (e) {
    var tabId = $(this).attr('href');
    var tab = $(`.tabs ${tabId}`);
    if (tab.length) {
      e.preventDefault();
      $(`.tabs .column`).removeClass('active');
      $(`.tabs ${tabId}`).addClass('active');
      $('.account-navigation li').removeClass('current');
      $(`.account-navigation a[href="${tabId}"]`).closest('li').addClass('current');
      window.scrollTo(0, 0);
    }
  });

  $('#save-address').on('click', function (e) {
    e.preventDefault();
    var isValid = true;
    var form = $(this).closest('form');
    form.find('.field.required').each(function () {
      if ($(this).find('input').length) {
        if (!$(this).find('input').val()) {
          $(this).find('.error').show(0);
          isValid = false;
        } else {
          $(this).find('.error').hide(0);
        }
      } else if ($(this).find('select').length) {
        if ($(this).find('select :selected:disabled').length) {
          $(this).find('.error').show(0);
          isValid = false;
        } else {
          $(this).find('.error').hide(0);
        }
      }
    });

    var zipInput = $('.field.zip input');
    if (zipInput.val()) {
      var zipRegex = /^\d{5}$/;
      if (zipRegex.test(zipInput.val())) {
        $('.field.zip .wrong-zip').hide(0);
      } else {
        $('.field.zip .wrong-zip').show(0);
        isValid = false;
      }
    }

    if (isValid) {
      form.submit();
    }
  });

  $('.field.choice.set input[type="radio"]').on('change', function() {
    if ($(this).is(':checked')) {
      var id = $(this).data('address-id');
      $('.column.main.active form').attr('action', '/account/addresses/' + id);
      if (!$('.column.main.active form input[value="put"]').length) {
        $('.column.main.active form').append('<input type="hidden" name="_method" value="put" id="put-method">');
      }
    }
    if (!$('.field.choice.set input[type="radio"]:checked').length) {
      $('.column.main.active form').attr('action', '/account/addresses');
      $('#put-method').remove();
    }
  })
});