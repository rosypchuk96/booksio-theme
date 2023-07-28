$(document).ready(function () {
  $('#addToCartForm button.amount').click(function (e) {
    e.preventDefault();
    var val = $(this).data('value');
    $(this).addClass('active');
    $(this).siblings().removeClass('active');
  });

  $('#product-addtocart-button').click(function (e) {
    e.preventDefault();
    var isValid = true;

    if (!$('#giftcard-amount-box .amount.active').length) {
      $('#amount-error').show(0);
      isValid = false;
    } else {
      $('#amount-error').hide(0);
    }

    $('#addToCartForm .giftcard.form .field').each(function () {
      if (!$(this).find('input,textarea').val()) {
        $(this).find('.mage-error:not(.email-not-valid)').show();
        isValid = false;
      } else {
        $(this).find('.mage-error:not(.email-not-valid)').hide();
      }
    });

    if ($('#giftcard_recipient_email').val()) {
      if (!isEmail($('#giftcard_recipient_email').val())) {
        $('.field.email .email-not-valid').show(0);
        isValid = false;
      } else {
        $('.field.email .email-not-valid').hide(0);
      }
    }

    console.log(isValid)
    if (isValid) {
      addProducts();
    }
  });

  function addProducts() {
    console.log('ok')
    var variant = $('#giftcard-amount-box .amount.active').data('variant');

    var data = {
      "id": variant,
      "quantity": 1,
      properties: {
        'Recipient name': $('#giftcard_recipient_name').val(),
        'Recipient email': $('#giftcard_recipient_email').val(),
        'Message': $('#giftcard-message').val(),
        '__shopify_send_gift_card_to_recipient': true
      }
    }

    if (variant) {
      jQuery.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: data,
        dataType: 'json',
        success: function (data) {
          jQuery.ajax({
            type: 'GET',
            url: '/cart.js',
            dataType: 'json',
            success: function (data) {
              $('#popup-cart-quantity').text(data.item_count);
              $('#popup-cart-total').text('$' + (data.total_price / 100).toFixed(2));
              $('#confirmOverlay').fadeIn(200);
              drawMiniCart(data);

              var t = setTimeout(function () {
                $('#confirmOverlay').fadeOut(200);
                clearTimeout(t);
              }, 5000);
            }
          });
        }
      });
    }
  }

  $('#confirmBox .close').click(function () {
    $('#confirmOverlay').fadeOut(200);
  })

  function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
  }
});