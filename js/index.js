document.addEventListener("DOMContentLoaded", function() {

  var myHeaders = new Headers();
  myHeaders.append("X-WP-Nonce", wpr.wp_rest);

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  // Selecting The Container.
  const container = document.querySelector('#wpr-data');
  createProductItem();

  // It append it to the container.
  function createProductItem(pro_page = 1){


    fetch(wpr.wp_rest_url+"wc/store/v1/products?status=publish&per_page=30&orderby=menu_order&order=asc&page="+pro_page, requestOptions)
        .then(
            function(response) {
              if (response.status !== 200) {
                document.getElementById("wpr-status").innerHTML('Looks like there was a problem. Status Code: ' +
                    response.status);
                return;
              }

              response.json().then(function(data) {
               // console.log(data);
                data.forEach(p => {
                  let productItem = document.createElement('li');
                  let iCat = [p.categories].map(e => e.map(f => f.slug).join(' '));
                  let iTag = [p.tags].map(e => e.map(f => f.slug));
                  if(p.images.length > 0) {
                    var pImage = p.images[0].thumbnail;
                  }
                  else {
                    var pImage = wpr.placeholder;
                  }



                  productItem.setAttribute("data-order", p.menu_order);
                  productItem.setAttribute("data-pid", p.id);
                  productItem.setAttribute("data-tags", iTag);
                  productItem.className = 'pro-item product-grid-item '+iCat;
                  let iQR = "<div class='wqr-image'><img class='wpr-product-img' width='100%' src='"+pImage+"'></div>";
                  let iId = "<span class='iid'>#" +p.id+ "</span>";
                  let iName = "<div class='iname wpr-product-title'>" +p.name+ "</div>";
                  let iPrice = "<div class='iprice wpr-product-price'>" +p.price_html+ "</div>";

                  productItem.innerHTML = iQR + iId+  iName + iPrice;

                  //   Appending the post to the container.
                  container.appendChild(productItem);

                });
                pro_page += 1;

                if( pro_page <= response.headers.get('X-WP-TotalPages')) {
                  setTimeout(createProductItem(pro_page),100);
                }
                else {
                  document.getElementById("wpr-loader").style.display = "none";
                }

              });
            }
        )
        .catch(function(err) {
          document.getElementById("wpr-status").innerHTML('Fetch Error :-S', err);
        });

  }

  const cat_container = document.querySelector('#wpr-categories');
  wpr_fetch_categories();

  function wpr_fetch_categories(cat_page=1) {
    fetch(wpr.wp_rest_url+"wc/v3/products/categories?status=publish&per_page=30&orderby=name&order=asc&page="+cat_page, requestOptions)
        .then(
            function(response) {
              if (response.status !== 200) {
                document.getElementById("wpr-status").innerHTML('Looks like there was a problem. Status Code: ' +
                    response.status);
                return;
              }

              response.json().then(function(data) {
                //console.log(data);

                data.forEach(p => {
                  if(p.count > 0) {
                    let catItem = document.createElement('option');

                    catItem.value = p.slug;
                    catItem.innerHTML = p.name + " (" + p.count + ")";
                    catItem.setAttribute("data-pid", p.id);

                    //   Appending the post to the container.
                    cat_container.appendChild(catItem);
                  }
                });
                cat_page += 1;

                if( cat_page <= response.headers.get('X-WP-TotalPages')) {
                  setTimeout(wpr_fetch_categories(cat_page),100);
                }
                else {
                  //document.getElementById("wpr-loader").style.display = "none";
                }


              });
            }
        )
        .catch(function(err) {
          document.getElementById("wpr-status").innerHTML('Fetch Error :-S', err);
        });
  }

  const tag_container = document.querySelector('#wpr-tags');
  wpr_fetch_tags();

  function wpr_fetch_tags(tag_page=1) {
    fetch(wpr.wp_rest_url+"wc/v3/products/tags?status=publish&per_page=30&orderby=name&order=asc&page="+tag_page, requestOptions)
        .then(
            function(response) {
              if (response.status !== 200) {
                document.getElementById("wpr-status").innerHTML('Looks like there was a problem. Status Code: ' +
                    response.status);
                return;
              }

              response.json().then(function(data) {
                //console.log(data);

                data.forEach(p => {
                  if(p.count > 0) {
                    let tagItem = document.createElement('option');

                    tagItem.value = p.slug;
                    tagItem.innerHTML = p.name + " (" + p.count + ")";
                    tagItem.setAttribute("data-pid", p.id);

                    //   Appending the post to the container.
                    tag_container.appendChild(tagItem);
                  }
                });
                tag_page += 1;

                if( tag_page <= response.headers.get('X-WP-TotalPages')) {
                  setTimeout(wpr_fetch_tags(tag_page),100);
                }
                else {
                  //document.getElementById("wpr-loader").style.display = "none";
                }


              });
            }
        )
        .catch(function(err) {
          document.getElementById("wpr-status").innerHTML('Fetch Error :-S', err);
        });
  }

  window.search_wpr_list = function(cat) {
    var input, filter, ul, li, a, i, txtValue;
    input = cat.value;


    ul = document.getElementById("wpr-data");
    li = ul.getElementsByClassName("product-grid-item");
    for (i = 0; i < li.length; i++) {
      a = li[i].classList.contains(input);
      // console.log(a);

      if (a || input=="all") {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
    return true
  }


  window.search_wpr_tag_list = function(tag) {
    var input, filter, ul, li, a, i, txtValue;
    input = tag.value;


    ul = document.getElementById("wpr-data");
    li = ul.getElementsByClassName("product-grid-item");
    for (i = 0; i < li.length; i++) {

      a = li[i].getAttribute('data-tags');
      a = a.split(',');

      if (a.includes(input) || input=="all") {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
    return true
  }

});

jQuery(document).ready(function($) {

  $("#wpr-reset-filters").on("click", function () {
    $('#wpr-filter-type').val("none").change();
  });

  $("#wpr-filter-type").on("change", function(){
    $('#wpr-tags').val("all").change();
    $("#wpr-categories").val("all").change();

    if($(this).val() == "category") {

      $("#wpr-tags-wrap").hide();
      $("#wpr-categories-wrap").show();
    }
    else if($(this).val() == "tag") {
      $("#wpr-categories-wrap").hide();
      $("#wpr-tags-wrap").show();
    }
    else {
      $("#wpr-tags-wrap").hide();
      $("#wpr-categories-wrap").hide();
    }
  })

  jQuery("#save_order").click(function() {
    jsonObj = [];
    var counter = 0;
    jQuery("#wpr-data .product-grid-item").each(function() {
      counter++;
      var index1 = jQuery(this).index();
      jQuery(this).attr("data-order", index1);
      var key1 = jQuery(this).data("pid");
      var value1 = index1;

      item = {};
      item["ID"] = key1;
      item["menu_order"] = value1;
      jsonObj.push(item);
    });

    jQuery.ajax({
      url: ajaxurl,
      type: "POST",
      data: { action: "wpr_order", obj: jsonObj },
      success: function(data) {
        alert("Sort order saved!");
      }
    });
  });

  $(function() {
    $( "#wpr-data" ).sortable({
      update: function(event, ui) {
      }
    });

  });
});