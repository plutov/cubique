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
    this.count        = 0;
    this.currPage     = 1;
    this.sort         = '';
    this.search       = {};
    this.searchValues = {};
    try {
        this.isLocalStorageAvailable = 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        this.isLocalStorageAvailable = false;
    }
    var perPagesOptions = [10, 25, 50, 100];
    perPagesOptions.push(this.rowsOnPage);
    perPagesOptions.sort(function(a,b){return a-b;});
    perPagesOptions.join();
    var rowsOnPageState = parseInt(this.getState('rowsOnPage'));
    var currPageState   = parseInt(this.getState('currPage'));
    var sortColumnState = this.getState('sortColumn');
    var sortOrderState  = this.getState('sortOrder');
    var local = this;
    var searchState     = $.parseJSON(local.getState('search'));
    if (sortColumnState && sortOrderState) {
        this.sort = sortColumnState + ' ' + sortOrderState;
    }
    if (rowsOnPageState && $.inArray(rowsOnPageState, perPagesOptions) != -1) {
        this.rowsOnPage = rowsOnPageState;
        if (currPageState) {
            this.currPage = currPageState;
        }
    } else {
        this.setState('rowsOnPage', this.rowsOnPage);
        this.setState('currPage', this.currPage);
    }
    if (searchState) {
        this.search = searchState;
    }
    this.perPageOptions  = {};
    for (var j in perPagesOptions) {
        this.perPageOptions[perPagesOptions[j]] = perPagesOptions[j];
    }
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
    var sortColumnState = this.getState('sortColumn');
    var sortOrderState  = this.getState('sortOrder');
    var spanValue       = '';
    var dataOrder       = 'ASC';
    for (var i in this.columns) {
        if (typeof(this.columnsToSort[i]) != 'undefined') {
            spanValue = (sortColumnState == this.columnsToSort[i]) ? (sortOrderState == 'ASC' ? '&#9660' : '&#9650') : '';
            dataOrder = (sortColumnState == this.columnsToSort[i]) ? (sortOrderState == 'ASC' ? 'DESC' : 'ASC') : 'ASC';
            column = '<span class="order">' + spanValue + '</span> <a href="#" class="sort-by" data-column="' + i + '" data-order="' + dataOrder + '">' + this.columns[i] + '</a>';
        } else {
            column = this.columns[i];
        }
        html += '<th>' + column + '</th>';
    }
    html += '</tr>';
    var searchType = '<select class="search-type"></select>';
    if (this.getObjectSize(this.columnsToSearch)) {
        html += '<tr>';
        var searchValue = '';
        var tempSearchType = '';
        var conditions     = ['LIKE', 'NOT LIKE', '=', '<>', '<', '>', '<=', '>='];
        for (var j in this.columns) {
            column = '';
            if (typeof(this.columnsToSearch[j]) != 'undefined') {
                searchValue = (typeof(this.search[j]) != 'undefined') ? this.search[j][0] : '';
                tempSearchType = (typeof(this.search[j]) != 'undefined') ? this.search[j][1] : '';
                column += '<select class="search-type">';
                for (var k in conditions) {
                    column += '<option value="' + conditions[k] + '"' + (tempSearchType == '' + conditions[k] + '' ? ' selected=selected' : '') + '>' + conditions[k] + '</option>';
                }
                column += '</select>' +
                          '<input type="text" data-column="' + j + '" placeholder="search" value="' + searchValue + '"/> ' +
                          '<a href="#" class="reset-search">&times;</a>';
                this.searchValues[j] = (typeof(this.search[j]) != 'undefined') ? this.search[j] : '';
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
        local.setState('currPage', 1);
        local.setState('sortColumn', sortColumn);
        local.setState('sortOrder', sortOrder);
        $(this).attr('data-order', sortOrder == 'ASC' ? 'DESC' : 'ASC');
        $(this).prev('span').html(sortOrder == 'ASC' ? '&#9660;' : '&#9650;');
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
    $('#cubique-' + this.name + ' .reset-search').click(function() {
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
    var date = new Date();
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
        url: (local.url ? local.url : location.href) + '?nocache=' + date.getTime(),
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
    this.thead.append($('<tr class="pages"><th colspan="' + this.getObjectSize(this.columns) + '">' + pages +
                        '<a href="#" class="csv">csv</a>' +
                        '<a href="#" class="refresh">refresh</a>' + select + '<span class="in-total">' +
                        this.count + ' in total</span></th></tr>'));
    var local = this;
    this.thead.find('.go-to-page').click(function() {
        local.currPage = parseInt($(this).attr('data-number'));
        local.setState('currPage', local.currPage);
        local.showData();
        return false;
    });
    this.thead.find('.per-page').change(function() {
        local.rowsOnPage = $(this).val();
        local.setState('rowsOnPage', local.rowsOnPage);
        local.setState('currPage', 1);
        local.currPage   = 1;
        local.showData();
        return false;
    }).val(this.rowsOnPage);
    this.thead.find('.refresh').click(function() {
        local.showData();
        return false;
    });
    this.thead.find('.csv').click(function() {
        data = {
            cubique: {
                name:         local.name,
                curr_page:    local.currPage,
                sort:         local.sort,
                search:       local.search,
                rows_on_page: local.rowsOnPage
            }
        };
        data = local.stringify(data);
        document.location.href = (local.url ? local.url : location.href) + '?cubique_data=' + encodeURIComponent(data);
        return false;
    });
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
        this.setState('currPage', 1);
        this.setState('search', this.stringify(this.search));
        this.searchValues[searchColumn]  = search;
        this.currPage = 1;
        this.showData();
    }
}

/**
 * Returns JSON string.
 * @param   obj object
 * @return  string
 */
Cubique.prototype.stringify = function Cubique_stringify(obj)
{
    if ('JSON' in window) {
        return JSON.stringify(obj);
    }

    var t = typeof (obj);
    if (t != 'object' || obj === null) {
        if (t == 'string') {
            obj = '"' + obj + '"';
        }
        return String(obj);
    } else {
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n];
            t = typeof(v);
            if (obj.hasOwnProperty(n)) {
                if (t == 'string') {
                    v = '"' + v + '"';
                } else if (t == 'object' && v !== null) {
                    v = this.stringify(v);
                }

                json.push((arr ? "" : '"' + n + '":') + String(v));
            }
        }

        return (arr ? '[' : '{') + String(json) + (arr ? ']' : '}');
    }
}

/**
 * Returns key value from local storage or cookies.
 * @param  key string
 * @return string
 */
Cubique.prototype.getState = function Cubique_getState(key)
{
    key = this.name + '_' + key;
    if (this.isLocalStorageAvailable) {
        return localStorage.getItem(key);
    } else {
        var cookie = ' ' + document.cookie;
        var search = ' ' + key + '=';
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
}

/**
 * Sets value of state in local storage or cookies.
 * @param  key string
 * @param  value string
 * @return void
 */
Cubique.prototype.setState = function Cubique_setState(key, value)
{
    key = this.name + '_' + key;
    if (this.isLocalStorageAvailable) {
        localStorage.setItem(key, value);
    } else {
        var now    = new Date();
        var expire = new Date();
        expire.setTime(now.getTime() + 3600000 * 24 * 10); // Just 10 days
        document.cookie = key + '=' + value + ';expires=' + expire.toGMTString() + ';path=/';
    }
}