$(document).ready(function() {
  var products;
  var initProducts;
  var ajaxPage = 1;
  var totalLoadedProducts = 0;
  var allProductsLoaded, productLoadingStarted = false;
  var collectionSize = +$('#collection-size').data('collection-size');
  var minPriceInit = +$('.from-label').data('val');
  var maxPriceInit = +$('.to-label').data('val');

  if (restrictedFormats) {
    restrictedFormats = restrictedFormats.toLowerCase().replace(/["']/g, "").replace('[', '').replace(']', '').split(',');
  }
  if (restrictedTags) {
    restrictedTags = restrictedTags.split('<br />');
  }

  $.get(productUrlJson, function(data) {
    products = data.products;
    totalLoadedProducts += products.length;
    if (restrictedFormats || restrictedTags) {
      products = excludeRestricted(products);
    }
    initProducts = products;
    if (totalLoadedProducts >= collectionSize) {
      allProductsLoaded = true;
      if (isPartnerSite) {
        $('#collection-size').text(products.length);
      }
    } else {
      loadAllProducts();
      if (isPartnerSite) {
        $('#collection-size').text(Math.round((products.length - 10) / 10) * 10 + '+');
      }
    }
    drawGrid(1, gridSize);
    drawPagination(1, gridSize);
  });

  function excludeRestricted(products) {
    var result = products.filter(function (item) {
      if (restrictedTags && item.tags) {
        for (var i in item.tags) {
          if (restrictedTags.includes(item.tags[i])) {
            return false;
          }
        }
      }
      if (restrictedFormats) {
        for (var i in item.variants) {
          var variant = item.variants[i];
          if ((variant.option1 && restrictedFormats.includes(variant.option1.toLowerCase()) || variant.option2 && restrictedFormats.includes(variant.option2.toLowerCase()) || variant.option3 && restrictedFormats.includes(variant.option3.toLowerCase()))) {
            return false;
          }
        }
      }
      return true;
    });
    return result;
  }

  function loadAllProducts() {
    productLoadingStarted = true;
    ajaxPage++;
    $.get(productUrlJson + '&page=' + ajaxPage, function(data) {
      var newProducts = data.products;
      if (restrictedFormats || restrictedTags) {
        newProducts = excludeRestricted(newProducts);
      }
      products = products.concat(newProducts);
      initProducts = initProducts.concat(newProducts);
      totalLoadedProducts += data.products.length;
      if (totalLoadedProducts >= collectionSize) {
        allProductsLoaded = true;
      }
    });
  }

  function drawGrid(page, gridSize) {
    productsHtml = '';
    var max = gridSize * page;
    if (products.length < max && allProductsLoaded) {
      max = gridSize * (page - 1) + products.length % gridSize;
    }
    if (products.length < gridSize * page && !allProductsLoaded) {
      ajaxPage++;
      $.get(productUrlJson + '&page=' + ajaxPage, function (data) {
        var newProducts = data.products;
        if (restrictedFormats || restrictedTags) {
          newProducts = excludeRestricted(newProducts);
        }
        products = products.concat(newProducts);
        initProducts = initProducts.concat(newProducts);
        totalLoadedProducts += data.products.length;
        drawGrid(page, gridSize);
        if (totalLoadedProducts >= collectionSize) {
          allProductsLoaded = true;
        }
      });
    } else {
      $('#shown-number').text(max);
      if (products.length) {
        for (var i = gridSize * (page - 1); i < max; i++) {
          var product = products[i];
          var productUrl = "/products/" + product.handle;
          var productImg = product.images.length ? `<img src="${product.images[0].src}" width="351" height="561" alt="" style="display: inline-block;">` : "";
          var priceHtml = '';
          if (product.variants.length == 1) {
            var comparePrice = '';
            var variant = product.variants[0];
            var priceMin = +variant.price;
            if (variant.compare_at_price) {
              comparePrice += '$' + variant.compare_at_price;
            }
            priceHtml += `
            <div class="price-box price-final_price" data-role="priceBox" data-product-id="16274337" data-price-box="product-id-16274337">
              <span class="special-price">
                <span class="pricing-element price-container ">
                  <span class="price-label">Special Price</span>
                  <span class="price-wrapper single-price ">
                    <span class="price">$${priceMin.toFixed(2)}</span>
                  </span>
                </span>
              </span>
              <span class="old-price">
                <span class="pricing-element price-container ">
                  <span class="price-label">Regular Price</span>
                  <span id="old-price-16274337" class="price-wrapper single-price ">
                    <span class="price">${comparePrice}</span>
                  </span>
                </span>
              </span>
            </div>`;
          } else {
            var priceMax = 0, priceMin = 10000000000000;
            for (var j in product.variants) {
              var variant = product.variants[j];
              if (+variant.price > priceMax) {
                priceMax = +variant.price;
              }
              if (+variant.price < priceMin) {
                priceMin = +variant.price;
              }
            }
            if (priceMax != priceMin) {
              priceHtml += `
              <div class="price-box price-final_price" data-role="priceBox" data-product-id="16204906" data-price-box="product-id-16204906">
                <span class="normal-price">
                  <span class="pricing-element price-container ">
                    <span class="price-label">Regular Price</span>
                    <span class="price-wrapper price-range ">
                      <span class="price">$${priceMin.toFixed(2)}</span> - <span class="price">$${priceMax.toFixed(2)}</span>
                    </span>
                  </span>
                </span>
              </div>`;
            } else {
              priceHtml += `
              <div class="price-box price-final_price" data-role="priceBox" data-product-id="16204906" data-price-box="product-id-16204906">
                <span class="normal-price">
                  <span class="pricing-element price-container ">
                    <span class="price-label">Regular Price</span>
                    <span class="price-wrapper price-range ">
                      <span class="price">$${priceMin.toFixed(2)}</span>
                    </span>
                  </span>
                </span>
              </div>`;
            }
          }
          productsHtml += `
          <li class="item product product-item" data-handle="${product.handle.split('?')[0]}">
            <div role="group" aria-label="product" class="product-item-info" id="product-item-info_14882867" data-container="product-grid">
              <a href="${productUrl}" class="product-item-photo">
                <span class="product-image-container product-image-container-8573004" style="width: 351px;">
                  <span class="product-image-wrapper" style="padding-bottom: 125%;">
                    ${productImg}
                  </span>
                </span>
              </a>
              <div class="product details product-item-details">
                  <a href="${productUrl}" title="${product.title}"><strong class="product name product-item-name">${product.title}</strong></a> 
                  <div class="author-wrapper">
                    <a target="_blank" href="${productUrl}">
                        <p class="author"></p>
                    </a>
                    <div class="PriceMain">
                      ${priceHtml}
                    </div>
                  </div>
                  <div class="star_rating">
                    <div class="yotpo bottomLine yotpo-small" data-product-id="14882867" data-name="Soul Taken" data-yotpo-element-id="5">
                        <div class="yotpo-display-wrapper" style="visibility: hidden;">
                          <div class="yotpo-clr"></div>
                        </div>
                    </div>
                  </div>
              </div>
            </div>
        </li>`;
        }
        $('.products-grid .product-items').html(productsHtml);
      } else {
        $('.products-grid .product-items').html('<p>Nothing found</p>');
      }
    }
    getMetafields();

    if (!productLoadingStarted) {
      loadAllProducts();
    }
  }

  function getMetafields() {
    $('.products-grid .product-items .product-item').each(function () {
      var handle = $(this).attr('data-handle').split('?')[0];
      jQuery.get('/products/' + handle + '?view=data', function (data) {
        var data = JSON.parse(data);
        if (data['author']) {
          $(`.products-grid .product-items .product-item[data-handle="${handle}"]`).find('.author').text(data['author']);    
        }  
      });
    });
  }

  function drawPagination(currentPage, gridSize) {
    var pagesNum = Math.floor(products.length / gridSize);
    if (products.length % gridSize) {
      pagesNum++;
    }
    if (pagesNum <= 1) {
      $('#pagination').hide(0);
    } else {
      var numbers = [];
      paginationHtml = '';
      if (pagesNum > 5) {
        if (currentPage <= 3) {
          for (var i = 1; i <= 5; i++) {
            numbers.push(i);
          }
        } else if (currentPage >= pagesNum - 2) {
          for (var i = 4; i >= 0; i--) {
            numbers.push(pagesNum - i);
          }
        } else {
          numbers.push(currentPage - 2);
          numbers.push(currentPage - 1);
          numbers.push(currentPage);
          numbers.push(currentPage + 1);
          numbers.push(currentPage + 2);
        }
      } else {
        for (var i = 1; i <= pagesNum; i++) {
          numbers.push(i);
        }
      }
      if (currentPage != 1) {
        paginationHtml += `<li class="item pages-item-previous"> <a class="action  previous" href="" title="Previous"><span class="label">Page</span> <span>Previous</span> <i class="icon" aria-hidden="true"></i></a></li>`;
      }
      for (var i in numbers) {
        if (currentPage == numbers[i]) {
          paginationHtml += `<li class="item current"><strong class="page" data-page-num="${numbers[i]}"><span class="label">You're currently reading page</span> <span>${currentPage}</span></strong></li>`;
        } else {
          paginationHtml += `<li class="item"><a href="" class="page" data-page-num="${numbers[i]}"><span class="label">Page</span> <span>${numbers[i]}</span></a></li>`;
        }
      }
      if (currentPage != pagesNum) {
        paginationHtml += `<li class="item pages-item-next"> <a class="action  next" href="" title="Next"><span class="label">Page</span> <span>Next</span> <i class="icon" aria-hidden="true"></i></a></li>`;
      }
      $('#pagination').html(paginationHtml);

      $('#pagination .page').click(function(e) {
        e.preventDefault();
        var pageNum = $(this).data('page-num');
        drawGrid(pageNum, gridSize);
        scrollToGrid();
        drawPagination(pageNum, gridSize);
      });

      $('#pagination .previous').click(function (e) {
        e.preventDefault();
        var pageNum = +$('#pagination .current .page').data('page-num');
        pageNum--;
        drawGrid(pageNum, gridSize);
        scrollToGrid();
        drawPagination(pageNum, gridSize);
      });


      $('#pagination .next').click(function (e) {
        e.preventDefault();
        var pageNum = +$('#pagination .current .page').data('page-num');
        pageNum++;
        drawGrid(pageNum, gridSize);
        scrollToGrid();
        drawPagination(pageNum, gridSize);
      });

      if (products.length < gridSize * (currentPage + 5) && !allProductsLoaded) {
        ajaxPage++;
        $.get(productUrlJson + '&page=' + ajaxPage, function (data) {
          var newProducts = data.products;
          if (restrictedFormats || restrictedTags) {
            newProducts = excludeRestricted(newProducts);
          }
          products = products.concat(newProducts);
          initProducts = initProducts.concat(newProducts);
          totalLoadedProducts += data.products.length;
          if (totalLoadedProducts >= collectionSize) {
            allProductsLoaded = true;
          }
        });
      }

      $('#pagination').show(0);
    }
  }

  function scrollToGrid() {
    $('html, body').animate({
      scrollTop: $('#main-content').offset().top
    }, 0);
  }

  $('.grid-size-selector').click(function (e) {
    e.preventDefault();
    gridSize = +$(this).data('value');
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    var pageNum = +$('#pagination .current .page').data('page-num');
    drawGrid(pageNum, gridSize);
    drawPagination(pageNum, gridSize);
  });

  function filterProducts(products) {
    var filtredFormats = [];
    var filteredProducts = [];
    var total;
    var min = +$('.from-label').attr('data-val');
    var max = +$('.to-label').attr('data-val');

    $('#bookFormatSelector input').each(function() {
      if ($(this).is(':checked')) {
        filtredFormats.push($(this).data('option-value').toLowerCase());
      }
    });

    if (filtredFormats.length || min != minPriceInit || max != maxPriceInit) {
      for (var i in products) {
        for (var j in products[i].variants) {
          var variant = products[i].variants[j];
          if (filtredFormats.length) {
            if ((variant.option1 && filtredFormats.includes(variant.option1.toLowerCase()) || variant.option2 && filtredFormats.includes(variant.option2.toLowerCase()) || variant.option3 && filtredFormats.includes(variant.option3.toLowerCase())) && variant.price >= min && variant.price <= max) {
              var product = products[i];
              var handle = product.handle.split('?')[0];
              product.handle = handle + '?variant=' + variant.id;
              filteredProducts.push(product);
              break;
            }
          } else {
            if (variant.price >= min && variant.price <= max) {
              var product = products[i];
              filteredProducts.push(product);
              break;
            }
          }
        }
      }
      if (!allProductsLoaded) {
        total = Math.round(filteredProducts.length / 10) * 10 + '+';
      } else {
        total = filteredProducts.length;
      }
    } else {
      for (var i in initProducts) {
        initProducts[i].handle = initProducts[i].handle.split('?')[0];
      }
      filteredProducts = initProducts;
      total = $('#collection-size').data('collection-size');
    }
    $('#collection-size').text(total);

    var order = $('#sorter').find('option:selected').attr('value');
    filteredProducts = sortProducts(order, filteredProducts);
    return filteredProducts;
  }

  $('#bookFormatSelector input').click(function () {
    products = filterProducts(initProducts);
    drawGrid(1, gridSize);
    drawPagination(1, gridSize);
  });

  $( "#slider-bar" ).slider({
    min: minPriceInit,
    max: maxPriceInit,
    values: [ minPriceInit, maxPriceInit ],
    slide: function(event, ui) {
      $( ".from-label" ).text( '$' + ui.values[ 0 ].toFixed(2));
      $( ".from-label" ).attr('data-val', ui.values[ 0 ]);
      $( ".to-label" ).text( '$' + ui.values[ 1 ].toFixed(2));
      $( ".to-label" ).attr('data-val', ui.values[ 1 ]);
    },
  });

  $('#update-price').click(function(e) {
    e.preventDefault();
    products = filterProducts(initProducts);
    drawGrid(1, gridSize);
    drawPagination(1, gridSize);
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

  function sortProducts(sortParam, products) {
    if (sortParam == 'created-descending') {
      products.sort(function(a, b) {
        if (new Date(b.published_at) > new Date(a.published_at)) {
          return 1;
        } else {
          return -1;
        }
      });
    } else if (sortParam == 'created-ascending') {
      products.sort(function(a, b) {
        if (new Date(a.published_at) > new Date(b.published_at)) {
          return 1;
        } else {
          return -1;
        }
      });
    } else if (sortParam == 'title-ascending') {
      products.sort(function(a, b) {
        if (a.title.toLowerCase() > b.title.toLowerCase()) {
          return 1;
        } else {
          return -1;
        }
      });
    } else if (sortParam == 'title-descending') {
      products.sort(function(a, b) {
        if (a.title.toLowerCase() < b.title.toLowerCase()) {
          return 1;
        } else {
          return -1;
        }
      });
    } else if (sortParam == 'price-ascending') {
      products.sort(function(a, b) {
        if (+a.variants[0].price > +b.variants[0].price) {
          return 1;
        } else {
          return -1;
        }
      });
    } else if (sortParam == 'price-descending') {
      products.sort(function(a, b) {
        if (+a.variants[0].price < +b.variants[0].price) {
          return 1;
        } else {
          return -1;
        }
      });
    }
    return products;
  }

  $('#sorter').on('change', function (e) {
    e.preventDefault();
    var order = $(this).find('option:selected').attr('value');
    sortProducts(order, products);
    drawGrid(1, gridSize);
    drawPagination(1, gridSize);
  })
});