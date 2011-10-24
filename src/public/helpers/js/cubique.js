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
        html += '<tr>';
        for (var j in this.columns) {
            if (typeof(this.columnsToSearch[j]) != 'undefined') {
                column = '<input type="text" search-column="' + j + '"/>';
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
    $('#cubique-' + this.name + ' input').keyup(function() {
        local.search[$(this).attr('search-column')] = $(this).val();
        local.currPage = 1;
        local.showData();
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
    var loading = $('<tr><td colspan="' + Object.size(this.columns) + '" class="loading">' +
                    '<img src="/helpers/img/cubique_loading.gif"/></td></tr>');
    this.tbody.html(loading);
    var local = this;
    $.ajax({
        type: 'post',
        data: {
            cubique_grid_name:         local.name,
            cubique_grid_curr_page:    local.currPage,
            cubique_grid_sort:         local.sort,
            cubique_grid_search:       local.search,
            cubique_grid_rows_on_page: local.rowsOnPage
        },
        url: local.url ? local.url : location.href,
        dataType: 'json',
        success:  function(response) {
            if (response.error) {
                alert('Error has been occurred. Try to refresh the page.');
            } else {
                local.count = response.count;
                var html = '';
                for (var rowKey in response.data) {
                    html += '<tr>';
                    for (var columnName in response.data[rowKey]) {
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
    var maxShown   = 10;
    var to         = pagesCount;
    if (pagesCount > maxShown) {
        if (this.currPage <= maxShown / 2 + 1) {
            from = 1;
            to   = maxShown;
        } else if (pagesCount - this.currPage <= maxShown / 2) {
            from = pagesCount - maxShown + 1;
            to   = pagesCount;
            pages += '<a href="#" class="go-to-page" page-number="1">1</a>...';
        } else {
            from = this.currPage - maxShown / 2;
            to   = (this.currPage + maxShown / 2 <= pagesCount) ? this.currPage + maxShown / 2 : pagesCount;
            pages += '<a href="#" class="go-to-page" page-number="1">1</a>';
            if (this.currPage - maxShown / 2 > 2) {
                pages += '...';
            }
        }
    }
    for (var i = from; i <= to; i++) {
        currClass = i == this.currPage ? ' curr' : ''
        pages += '<a href="#" class="go-to-page' + currClass + '" page-number="' + i + '">' + i + '</a>';
    }
    if (pagesCount > to) {
        if (pagesCount - this.currPage >= maxShown / 2 + 2) {
            pages += '...';
        }
        pages += '<a href="#" class="go-to-page" page-number="' + pagesCount + '">' + pagesCount + '</a>';
    }
    var select = '<select class="per-page">';
    for (var i in this.perPageOptions) {
        select += '<option value="' + this.perPageOptions[i] + '">' + this.perPageOptions[i] + '</option>';
    }
    select += '</select>';
    var html = '<tr><th colspan="' + Object.size(this.columns) + '">' + pages + select + '<span class="in-total">' +
               this.count + ' in total</span></th></tr>';
    this.tbody.append(html);
    this.tbody.find('.per-page').val(this.rowsOnPage);
    var local = this;
    this.tbody.find('.go-to-page').click(function() {
        local.currPage = parseInt($(this).attr('page-number'));
        local.showData();
        return false;
    });
    this.tbody.find('.per-page').change(function() {
        local.rowsOnPage = $(this).val();
        local.currPage   = 1;
        local.showData();
        return false;
    });
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