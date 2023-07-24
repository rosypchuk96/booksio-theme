$(document).ready(function() {
  var products;
  var initProducts;
  var totalLoadedProducts = 0;
  var allProductsLoaded, productLoadingStarted = false;
  var collectionSize = +$('#collection-size').data('collection-size');
  var minPriceInit = +$('.from-label').data('val');
  var maxPriceInit = +$('.to-label').data('val');

  var newURL = location.href.split("&usf_take")[0];
  window.history.pushState('object', document.title, newURL);

  $('.action.search').on('click', function () {
    updateSearchResults();
  });

  $("input#search").on('keyup', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      updateSearchResults();
    } 
  });

  updateSearchResults();
  function updateSearchResults() {
    let i = setInterval(function() {
      if (Window.searchResults){
        $('#search-query-breadcrumbs, #search-query-title').text(Window.searchResults.query);
        if (Window.searchResults.total > Window.searchResults.items.length) {
          loadAllProducts();
        } else {
          allProductsLoaded = true;
          products = Window.searchResults.items;
          if (restrictedFormats || restrictedTags) {
            products = excludeRestricted(products);
          }
          initProducts = products;
          drawGrid(1, gridSize);
          drawPagination(1, gridSize);
          $('#collection-size').text(Window.searchResults.total);
        }
        clearInterval(i);
      }
    }, 300);
  }
  // $.get(productUrlJson, function(data) {
  //   products = data.products;
  //   totalLoadedProducts += products.length;
  //   initProducts = products;
  //   if (totalLoadedProducts >= collectionSize) {
  //     allProductsLoaded = true;
  //     if (isPartnerSite) {
  //       $('#collection-size').text(products.length);
  //     }
  //   } else {
  //     loadAllProducts();
  //     if (isPartnerSite) {
  //       $('#collection-size').text(Math.round((products.length - 10) / 10) * 10 + '+');
  //     }
  //   }
  // });

  function excludeRestricted(products) {
    console.log(products)
    var result = products.filter(function (item) {
      if (restrictedTags && item.tags) {
        for (var i in item.tags) {
          if (restrictedTags.includes(item.tags[i].toLowerCase())) {
            console.log(item.tags[i])
            return false;
          }
        }
      }
      if (restrictedFormats) {
        for (var j in item.options) {
          var option = item.options[j];
          if (option.name == 'Format' || option.name == 'Type') {
            var counter = 0;
            for (var k in option.values) {
              if (restrictedFormats.includes(option.values[k].toLowerCase())) {
                if (counter == option.values.length) {
                  return false;
                } else {
                  counter++;
                }
              } else {
                item.urlName = item.urlName.split('?')[0] + '?variant=' + item.variants[k].id;
                return true;
              }
            }
          }
        }
      }
      return true;
    });
    return result;
  }

  function loadAllProducts() {
    let i = setInterval(function() {
      if ($('.usf-load-more').length){
        $('.usf-load-more').click();
        products = Window.searchResults.items;
        if (restrictedFormats || restrictedTags) {
          products = excludeRestricted(products);
        }
        initProducts = products;
        drawGrid(1, gridSize);
        drawPagination(1, gridSize);
        if (restrictedFormats || restrictedTags) {
          products = excludeRestricted(products);
        }
        if (Window.searchResults.total > Window.searchResults.items.length) {
          loadAllProducts();
        } else {
          $('#collection-size').text(Window.searchResults.total);
          allProductsLoaded = true;
          $('#collection-size').text(products.length);
        }
        clearInterval(i);
      } else {
        $('#collection-size').text(Window.searchResults.total);
        allProductsLoaded = true;
        $('#collection-size').text(products.length);
      }
    }, 300);
  }

  function drawGrid(page, gridSize) {
    productsHtml = '';
    console.log(page)
    console.log(products)
    var max = gridSize * page;
    if (products.length < max && allProductsLoaded) {
      max = gridSize * (page - 1) + products.length % gridSize;
    }
    if (products.length < gridSize * page && !allProductsLoaded) {
      var t = setTimeout(function () {
        clearTimeout(t);
        drawGrid(page, gridSize);
      }, 300);
    } else {
      $('#shown-number').text(max);
      if (products.length) {
        for (var i = gridSize * (page - 1); i < max; i++) {
          var product = products[i];
          var productUrl = "/products/" + product.urlName;
          var productImg = product.images.length ? `<img src="${product.images[0].url}" width="351" height="561" alt="" style="display: inline-block;">` : "";
          var priceHtml = '';
          var author = '';
          if (product.metafields.length) {
            for (var j in product.metafields) {
              if (product.metafields[j].namespace && product.metafields[j].key && product.metafields[j].namespace == 'custom' && product.metafields[j].key == 'author') {
                author += `<p class="author">${product.metafields[j].value}</p>`;
              }
            }
          }
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
          <li class="item product product-item" data-handle="${product.urlName.split('?')[0]}">
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
                        ${author}
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
    if (!pageNum) {
      pageNum = 1;
    }
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
        if (filtredFormats.length) {
          for (var j in products[i].options) {
            var option = products[i].options[j];
            if (option.name == 'Format' || option.name == 'Type') {
              for (var k in option.values) {
                var variant = products[i].variants[k];
                if (filtredFormats.includes(option.values[k].toLowerCase()) && variant.price >= min && variant.price <= max) {
                  var handle = products[i].urlName.split('?')[0];
                  products[i].urlName = handle + '?variant=' + variant.id;
                  filteredProducts.push(products[i]);
                  break;
                }
              }
            }
          }
        } else {
          for (var j in products[i].variants) {
            var variant = products[i].variants[j];
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
        initProducts[i].urlName = initProducts[i].urlName.split('?')[0];
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
  });
});