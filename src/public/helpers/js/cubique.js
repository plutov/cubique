/**
 * Cubique
 * @author    Alexander Plutov
 * @copyright (c) 2011-2012 Alexander Plutov
 * @link      https://github.com/plutov/cubique
 * @license   https://github.com/plutov/cubique/blob/master/LICENSE
 */

/**
 * Set common variables, render grid, get data.
 * @param  options object
 * @return void
 */
Cubique = function(options)
{
    $.extend(this, options);
    this.count          = 0;
    this.currPage       = 1;
    this.sort           = '';
    this.search         = {};
    var perPagesOptions = [10, 25, 50, 100];
    perPagesOptions.push(this.rowsOnPage);
    perPagesOptions.sort(function(a,b){return a-b;});
    perPagesOptions.join();
    if (this.isLocalStorageAvailable()) {
        var rowsOnPageLS = parseInt(localStorage.getItem(this.name + '_rowsOnPage'));
        var currPageLS   = parseInt(localStorage.getItem(this.name + '_currPage'));
        if (rowsOnPageLS && $.inArray(rowsOnPageLS, perPagesOptions) != -1) {
            this.rowsOnPage = rowsOnPageLS;
            if (currPageLS) {
                this.currPage = currPageLS;
            }
        } else {
            localStorage.setItem(this.name + '_rowsOnPage', this.rowsOnPage);
            localStorage.setItem(this.name + '_currPage', this.currPage);
        }
    } else {
        var rowsOnPageLS = parseInt(this.getCookie(this.name + '_rowsOnPage'));
        var currPageLS   = parseInt(this.getCookie(this.name + '_currPage'));
        if (rowsOnPageLS && $.inArray(rowsOnPageLS, perPagesOptions) != -1) {
            this.rowsOnPage = rowsOnPageLS;
            if (currPageLS) {
                this.currPage = currPageLS;
            }
        } else {
            this.setCookie(this.name + '_rowsOnPage', this.rowsOnPage);
            this.setCookie(this.name + '_currPage', this.currPage);
        }
    }
    this.perPageOptions  = {};
    for (var j in perPagesOptions) {
        this.perPageOptions[perPagesOptions[j]] = perPagesOptions[j];
    }
    this.searchValues = {};
    this.renderGrid();
    this.showData();
}

/**
 * Render main grid HTML.
 * @return void
 */
Cubique.prototype.renderGrid = function Cubique_renderGrid()
{
    var html   = '<table class="cubique"><thead><tr>';
    var column = '';
    for (var i in this.columns) {
        if (typeof(this.columnsToSort[i]) != 'undefined') {
            column = '<span class="order"></span> <a href="#" class="sort-by" data-column="' + i + '" data-order="ASC">' + this.columns[i] + '</a>';
        } else {
            column = this.columns[i];
        }
        html += '<th>' + column + '</th>';
    }
    html += '</tr>';
    var searchType = '<select class="search-type"></select>';
    if (this.getObjectSize(this.columnsToSearch)) {
        html += '<tr>';
        for (var j in this.columns) {
            if (typeof(this.columnsToSearch[j]) != 'undefined') {
                column = '<select class="search-type"><option value="LIKE">LIKE</option>' +
                         '<option value="=">=</option>' +
                         '<option value="<>"><></option>' +
                         '<option value="<"><</option>' +
                         '<option value=">">></option>' +
                         '<option value="<="><=</option>' +
                         '<option value=">=">>=</option>' +
                         '</select>' +
                         '<input type="text" data-column="' + j + '" placeholder="search"/> ' +
                         '<a href="#" class="reset-search">&times</a>';
                this.searchValues[j] = '';
            } else {
                column = '';
            }
            html += '<th>' + column + '</th>';
        }
        html += '</tr>';
    }
    html += '</thead><tbody></tbody></table>';
    $('#cubique-' + this.name).html(html);
    var sortOrder  = 'ASC';
    var sortColumn = '';
    var local      = this;
    var sortLinks  = $('#cubique-' + this.name + ' a.sort-by');
    sortLinks.click(function() {
        sortLinks.prev('span').html('');
        sortOrder      = $(this).attr('data-order');
        sortColumn     = $(this).attr('data-column');
        local.currPage = 1;
        local.sort     = sortColumn + ' ' + sortOrder;
        $(this).attr('data-order', sortOrder == 'ASC' ? 'DESC' : 'ASC');
        $(this).prev('span').html(sortOrder == 'ASC' ? '&darr;' : '&uarr;');
        local.showData();
        return false;
    });
    $('#cubique-' + this.name + ' input').keyup(function() {
        local.makeSearch($(this), $(this).prev('select'));
        return false;
    });
    $('#cubique-' + this.name + ' .search-type').change(function() {
        local.makeSearch($(this).next('input'), $(this));
        return false;
    });
    $('.reset-search').click(function() {
        var input  = $(this).prev();
        var select = input.prev();
        input.val(null);
        select.val('LIKE');
        local.makeSearch(input, select);
        return false;
    });
    this.tbody = $('#cubique-' + this.name + ' tbody');
    this.thead = $('#cubique-' + this.name + ' thead');
}

/**
 * Make AJAX request to the server and display data.
 * @return void
 */
Cubique.prototype.showData = function Cubique_showData()
{
    var columnsCount    = this.getObjectSize(this.columns);
    var loading         = $('<tr><td colspan="' + columnsCount + '" class="loading">.</td></tr>');
    var loadingInterval = setInterval(function() { $('.loading').html($('.loading').html() + '.'); }, 50);
    this.tbody.html(loading);
    var local = this;
    $.ajax({
        type: 'post',
        data: {
            cubique: {
                name:         local.name,
                curr_page:    local.currPage,
                sort:         local.sort,
                search:       local.search,
                rows_on_page: local.rowsOnPage
            }
        },
        url: local.url ? local.url : location.href,
        dataType: 'json',
        success:  function(response) {
            if (response.error) {
                local.tbody.html('<tr><td colspan="' + columnsCount + '" class="error">' + local.error_message + '</td></tr>');
            } else {
                local.count = response.count;
                var html = '';
                for (var rowKey in response.data) {
                    html += '<tr>';
                    for (var columnName in response.data[rowKey]) {
                        if (null == response.data[rowKey][columnName]) {
                            response.data[rowKey][columnName] = '';
                        }
                        html += '<td>' + response.data[rowKey][columnName] + '</td>';
                    }
                    html += '</tr>';
                }
                local.tbody.html(html);
                $('table.cubique tbody td').mouseover(function() {
                    $(this).parent().addClass('hovered');
                })
                .mouseleave(function() {
                    $(this).parent().removeClass('hovered');
                });
                local.thead.find('.pages').remove();
                local.renderPagesSection();
            }
            clearInterval(loadingInterval);
            loading.remove();
        }
    });
}

/**
 * Render pages section.
 * @return void
 */
Cubique.prototype.renderPagesSection = function Cubique_renderPagesSection()
{
    var pages      = '';
    var pagesCount = Math.ceil(this.count/this.rowsOnPage);
    var from       = 1;
    var to         = pagesCount;
    var moreSpan   = '<span class="more">...</span>';
    if (pagesCount > 10) {
        if (this.currPage <= 6) {
            from = 1;
            to   = 10;
        } else if (pagesCount - this.currPage <= 5) {
            from = pagesCount - 11;
            to   = pagesCount;
            pages += this.getGoToPageLink(1, false) + moreSpan;
        } else {
            from = this.currPage - 5;
            to   = (this.currPage + 5 <= pagesCount) ? this.currPage + 5 : pagesCount;
            pages += this.getGoToPageLink(1, false);
            if (this.currPage > 7) {
                pages += moreSpan;
            }
        }
    }
    var i = null;
    for (i = from; i <= to; i++) {
        pages += this.getGoToPageLink(i, i == this.currPage);
    }
    if (pagesCount > to) {
        if (pagesCount - this.currPage >= 7) {
            pages += moreSpan;
        }
        pages += this.getGoToPageLink(pagesCount, false);
    }
    var select = '<select class="per-page">';
    var j = null;
    for (j in this.perPageOptions) {
        select += '<option value="' + this.perPageOptions[j] + '">' + this.perPageOptions[j] + '</option>';
    }
    select += '</select>';
    this.thead.append($('<tr class="pages"><th colspan="' + this.getObjectSize(this.columns) + '">' + pages + select + '<span class="in-total">' +
               this.count + ' in total</span></th></tr>'));
    var local = this;
    this.thead.find('.go-to-page').click(function() {
        local.currPage = parseInt($(this).attr('data-number'));
        if (local.isLocalStorageAvailable()) {
            localStorage.setItem(local.name + '_currPage', local.currPage);
        } else {
            local.setCookie(local.name + '_currPage', local.currPage);
        }
        local.showData();
        return false;
    });
    this.thead.find('.per-page').change(function() {
        local.rowsOnPage = $(this).val();
        if (local.isLocalStorageAvailable()) {
            localStorage.setItem(local.name + '_rowsOnPage', local.rowsOnPage);
            localStorage.setItem(local.name + '_currPage', 1);
        } else {
            local.setCookie(local.name + '_rowsOnPage', local.rowsOnPage);
            local.setCookie(local.name + '_currPage', 1);
        }
        local.currPage   = 1;
        local.showData();
        return false;
    }).val(this.rowsOnPage);
}

Cubique.prototype.getGoToPageLink = function Cubique_getGoToPageLink(pageNumber, isCurrent)
{
    return '<a href="#" class="go-to-page' + (isCurrent ? ' curr' : '') + '" data-number="' + pageNumber + '">' + pageNumber + '</a>'
}

/**
 * Get object size.
 * @param  obj object
 * @return int
 */
Cubique.prototype.getObjectSize = function Cubique_getObjectSize(obj)
{
    var size = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            size++;
        }
    }
    return size;
}

/**
 * Checks if client's browser supports Local Storage.
 * @return bool
 */
Cubique.prototype.isLocalStorageAvailable = function Cubique_isLocalStorageAvailable()
{
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

/**
 * Sets search data and makes AJAX request.
 * @param  value object
 * @param  type object
 * @return void
 */
Cubique.prototype.makeSearch = function Cubique_makeSearch(value, type)
{
    var searchColumn = value.attr('data-column');
    var search       = [value.val(), type.val()];
    if (this.searchValues[searchColumn] != search) {
        this.search[searchColumn] = search;
        this.searchValues[searchColumn]  = search;
        this.currPage = 1;
        this.showData();
    }
}

/**
 * Sets cookie value.
 * @param  name string
 * @param  value string|number
 * @return void
 */
Cubique.prototype.setCookie = function Cubique_setCookie(name, value)
{
    var now    = new Date();
    var expire = new Date();
    expire.setTime(now.getTime() + 3600000 * 24 * 10); // Just 10 days
    document.cookie = name + '=' + value + ';expires=' + expire.toGMTString() + ';path=/';
}

/**
 * Returns cookie value or empty string.
 * @param  name string
 * @return string
 */
Cubique.prototype.getCookie = function Cubique_getCookie(name)
{
    var cookie = ' ' + document.cookie;
    var search = ' ' + name + '=';
    var value = '';
    var offset = 0;
    var end = 0;
    if (cookie.length > 0) {
        offset = cookie.indexOf(search);
        if (offset != -1) {
            offset += search.length;
            end = cookie.indexOf(';', offset);
            if (end == -1) {
                end = cookie.length;
            }
            value = cookie.substring(offset, end);
        }
    }
    return(value);
}