/**
 * Cubique
 * @author    Alexander Plutov
 * @copyright (c) 2011 Alexander Plutov
 * @license   https://github.com/plutov/cubique/wiki/License
 */

/**
 * Constructor
 * @param  object options
 * @return void
 */
Cubique = function(options)
{
    for (var i in options) {
        this[i] = options[i];
    }
    this.count          = 0;
    this.currPage       = 1;
    this.sort           = '';
    this.search         = {};
    var perPagesOptions = [10, 25, 50, 100];
    if (isLocalStorageAvailable()) {
        var rowsOnPageLS = localStorage.getItem(this.name + '_rowsOnPage');
        var currPageLS   = localStorage.getItem(this.name + '_currPage');
        if (rowsOnPageLS) {
            this.rowsOnPage = rowsOnPageLS;
        }
        if (currPageLS) {
            this.currPage = currPageLS;
        }
    }
    perPagesOptions.push(this.rowsOnPage);
    perPagesOptions.sort(function(a,b){return a-b;});
    perPagesOptions.join();
    this.perPageOptions  = {};
    for (var j in perPagesOptions) {
        this.perPageOptions[perPagesOptions[j]] = perPagesOptions[j];
    }
    this.renderGrid();
    this.showData();
}

/**
 * Render main grid HTML
 * @return void
 */
Cubique.prototype.renderGrid = function Cubique_renderGrid()
{
    var html   = '<table class="cubique"><thead><tr>';
    var column = '';
    for (var i in this.columns) {
        if (typeof(this.columnsToSort[i]) != 'undefined') {
            column = '<span></span> <a href="#" class="sort-by" sort-column="' + i + '" sort-rotation="ASC">' + this.columns[i] + '</a>';
        } else {
            column = this.columns[i];
        }
        html += '<th>' + column + '</th>';
    }
    html += '</tr>';
    if (Object.size(this.columnsToSearch)) {
        var inputValues = {};
        html += '<tr>';
        for (var j in this.columns) {
            if (typeof(this.columnsToSearch[j]) != 'undefined') {
                column         = '<input type="text" search-column="' + j + '" placeholder="search"/>';
                inputValues[j] = '';
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
    $('#cubique-' + this.name + ' a.sort-by').click(function() {
        $('#cubique-' + local.name + ' a.sort-by').prev('span').html('');
        sortOrder   = $(this).attr('sort-rotation');
        sortColumn     = $(this).attr('sort-column');
        local.currPage = 1;
        local.sort     = sortColumn + ' ' + sortOrder;
        $(this).attr('sort-rotation', sortOrder == 'ASC' ? 'DESC' : 'ASC');
        $(this).prev('span').html(sortOrder == 'ASC' ? '&darr;' : '&uarr;');
        local.showData();
        return false;
    });
    var searchColumn = null;
    var searchVal    = '';
    $('#cubique-' + this.name + ' input').keyup(function() {
        searchColumn = $(this).attr('search-column');
        searchVal    = $(this).val();
        if (inputValues[searchColumn] != searchVal) {
            local.search[searchColumn] = searchVal;
            inputValues[searchColumn]  = searchVal;
            local.currPage = 1;
            local.showData();
        }
        return false;
    });
    this.tbody = $('#cubique-' + this.name + ' tbody');
}

/**
 * Make AJAX request to the server and display data
 * @return void
 */
Cubique.prototype.showData = function Cubique_showData()
{
    var columnsCount = Object.size(this.columns);
    var loading      = $('<tr><td colspan="' + columnsCount + '" class="loading">' +
                       '<img src="/helpers/img/cubique_loading.gif"/></td></tr>');
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
                local.tbody.prev('thead').find('.pages').remove();
                local.renderPagesSection();
            }
            loading.remove();
        }
    });
}

/**
 * Render pages section
 * @return void
 */
Cubique.prototype.renderPagesSection = function Cubique_renderPagesSection()
{
    var pages      = '';
    var currClass  = '';
    var pagesCount = Math.ceil(this.count/this.rowsOnPage);
    var from       = 1;
    var to         = pagesCount;
    if (pagesCount > 10) {
        if (this.currPage <= 6) {
            from = 1;
            to   = 10;
        } else if (pagesCount - this.currPage <= 5) {
            from = pagesCount - 11;
            to   = pagesCount;
            pages += '<a href="#" class="go-to-page" page-number="1">1</a>' + '...';
        } else {
            from = this.currPage - 5;
            to   = (this.currPage + 5 <= pagesCount) ? this.currPage + 5 : pagesCount;
            pages += '<a href="#" class="go-to-page" page-number="1">1</a>';
            if (this.currPage > 7) {
                pages += '...';
            }
        }
    }
    for (var i = from; i <= to; i++) {
        currClass = i == this.currPage ? ' curr' : ''
        pages += '<a href="#" class="go-to-page' + currClass + '" page-number="' + i + '">' + i + '</a>';
    }
    if (pagesCount > to) {
        if (pagesCount - this.currPage >= 7) {
            pages += '...';
        }
        pages += '<a href="#" class="go-to-page" page-number="' + pagesCount + '">' + pagesCount + '</a>';
    }
    var select = '<select class="per-page">';
    for (var i in this.perPageOptions) {
        select += '<option value="' + this.perPageOptions[i] + '">' + this.perPageOptions[i] + '</option>';
    }
    select += '</select>';
    var tHead = this.tbody.prev('thead');
    tHead.append($('<tr class="pages"><th colspan="' + Object.size(this.columns) + '">' + pages + select + '<span class="in-total">' +
               this.count + ' in total</span></th></tr>'));
    var local = this;
    tHead.find('.go-to-page').click(function() {
        local.currPage = parseInt($(this).attr('page-number'));
        if (isLocalStorageAvailable()) {
            localStorage.setItem(local.name + '_currPage', local.currPage);
        }
        local.showData();
        return false;
    });
    tHead.find('.per-page').change(function() {
        local.rowsOnPage = $(this).val();
        if (isLocalStorageAvailable()) {
            localStorage.setItem(local.name + '_rowsOnPage', local.rowsOnPage);
            localStorage.setItem(local.name + '_currPage', 1);
        }
        local.currPage   = 1;
        local.showData();
        return false;
    }).val(this.rowsOnPage);
}

/**
 * Get object size (count of elements)
 * @param  object obj
 * @return int
 */
Object.size = function(obj)
{
    var size = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

/**
 * Checks if client's browser supports Local Storage
 * @return bool
 */
function isLocalStorageAvailable() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}