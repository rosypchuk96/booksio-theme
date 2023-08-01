$(document).ready(function () {
  $('#product-addtocart-button').click(function (e) {
    e.preventDefault();
    addProducts();
  });

  function addProducts() {
    var variant = $('.swatch-option.selected').data('variant');

    var properties = {};
    if (preorderConfig && preorderConfig.product.variants[variant].config.status == "ACTIVE" && preorderSettings && preorderSettings.cart.labelText) {
      properties[preorderSettings.cart.labelText.key] = preorderSettings.cart.labelText.value;
    }

    var data = {
      "id": variant,
      "quantity": +$('input#qty').val(),
      properties: properties
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
              console.log(data)
              $('#popup-cart-quantity').text(data.item_count);
              if (data.item_count > 1) {
                $('#amcart-count .is').text('are');
                $('#amcart-count .item-text').text('items');
              } else {
                $('#amcart-count .is').text('is');
                $('#amcart-count .item-text').text('item');
              }
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

  $('#confirmBox .cross').click(function () {
    $('#confirmOverlay').fadeOut(200);
  })

  function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
  }

  $('.swatch-option').click(function (e) {
    e.preventDefault();
    $(this).siblings('.swatch-option').removeClass('selected');
    $(this).addClass('selected');
    $('.field.qty, .product-actions-box .price-box').show(0);
    $('#product-addtocart-button').prop("disabled", false);
    $('#product-addtocart-button').css('margin-left', '15px');
    $('.product-actions-box .price-box .price').html($(this).data('variant-price'));
    $('#cms-product-mapping-container .cms-wrapper').removeClass('active').addClass('inactive');
    var format = $(this).data('variant-title');
    $('#cms-product-mapping-container .cms-wrapper').each(function () {
      if ($(this).data('type') && $(this).data('type').includes(format)) {
        $(this).removeClass('inactive').addClass('active');
      }
    });
    var variant = $(this).data('variant');
    $('#detail-content tr').each(function () {
      if ($(this).data('variant') == variant) {
        if ($(this).hasClass('isbn')) {
          $(this).siblings('.isbn').hide(0);
        } else if ($(this).hasClass('publisher')) {
          $(this).siblings('.publisher').hide(0);
        }
        $(this).show(0);
      }
    });
    if (preorderConfig && preorderConfig.product.variants[variant].config.status == "ACTIVE") {
      $('.pre-back-order-text').show(0);
      $('#product-addtocart-button').text('Pre-order');
    } else {
      $('.pre-back-order-text').hide(0);
      $('#product-addtocart-button').text('Add to Cart');
    }
  })
});