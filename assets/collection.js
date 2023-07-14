$(document).ready(function() {
  var min = +$('.from-label').data('val');
  var max = +$('.to-label').data('val');
  $( "#slider-bar" ).slider({
    min: min,
    max: max,
    values: [ min, max ],
    slide: function(event, ui) {
      $( ".from-label" ).text( '$' + ui.values[ 0 ].toFixed(2));
      $( ".from-label" ).attr('data-val', ui.values[ 0 ]);
      $( ".to-label" ).text( '$' + ui.values[ 1 ].toFixed(2));
      $( ".to-label" ).attr('data-val', ui.values[ 1 ]);
    }
  });

  $('#update-price').click(function(e) {
    e.preventDefault();
    var urlBase = $(this).data('url-to-remove');
    var min = $('.from-label').attr('data-val');
    var max = $('.to-label').attr('data-val');
    if (urlBase.includes('?')) {
      urlBase += '&';
    } else {
      urlBase += '?';
    }
    urlBase += 'filter.v.price.gte=' + min;
    urlBase += '&filter.v.price.lte=' + max;
    window.location.href = urlBase;
  });

  $('.filter-options-title').click(function (e) {
    e.preventDefault();
    $(this).closest('.filter-options-item').toggleClass('active');
    $(this).siblings('.filter-options-content').toggle(0);
  });

  $('.filter-title').click(function () {
    $('#layered-filter-block').toggleClass('active');
    $('body').toggleClass('filter-active');
  });
});