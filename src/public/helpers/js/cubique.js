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

    this.name          = options.name;
    this.columns       = options.columns;
    this.rowsOnPage    = options.rows_on_page;
    this.columnsToSort = options.columns_to_sort;
    this.count         = 0;
    this.currPage      = 1;
    this.sort          = '';
    this.renderGrid();
    this.displayData();
}

/**
 * Render main grid HTML
 * @return void
 */
Cubique.prototype.renderGrid = function Cubique_renderGrid()
{
    var html   = '<table class="cubique"><thead>';
    var column = '';
    for (var columnName in this.columns) {
        if (typeof(this.columnsToSort[columnName]) != 'undefined') {
            column = '<a href="#" class="sort-by" sort-column="' + columnName + '" sort-rotation="ASC">' + this.columns[columnName] + '</a>';
        } else {
            column = this.columns[columnName];
        }
        html += '<th>' + column + '</th>';
    }
    html += '</thead><tbody></tbody></table>';
    $('#cubique-' + this.name).html(html);
    var sortRotation = 'ASC';
    var local = this;
    $('#cubique-' + this.name + ' a.sort-by').click(function() {
        local.currPage = 1;
        sortRotation = $(this).attr('sort-rotation');
        $(this).attr('sort-rotation', sortRotation == 'ASC' ? 'DESC' : 'ASC');
        local.sort = $(this).attr('sort-column') + ' ' + sortRotation;
        local.displayData();
        return false;
    });
    this.tbody = $('#cubique-' + this.name + ' tbody');
}

/**
 * Make AJAX request to the server and display data
 * @return void
 */
Cubique.prototype.displayData = function Cubique_displayData()
{
    var loading = $('<tr><td colspan="' + Object.size(this.columns) + '" class="loading">' +
                    '<img src="/helpers/img/cubique_loading.gif"/></td></tr>');
    this.tbody.html(loading);
    var local = this;
    $.ajax({
        type:     'post',
        data:     {
            cubique_grid_name:      local.name,
            cubique_grid_curr_page: local.currPage,
            cubique_grid_sort:      local.sort
        },
        url:      location.href,
        dataType: 'json',
        success:  function(response) {
            if (response.error) {
                alert('Error has been occurred. Try to refresh the page.');
            } else {
                local.count = response.count;
                var html = '';
                var tdClass = '';
                for (var rowKey in response.data) {
                    tdClass = (rowKey%2) ? ' gray' : '';
                    html += '<tr>';
                    for (var columnName in response.data[rowKey]) {
                        html += '<td class="' + tdClass + '">' + response.data[rowKey][columnName] + '</td>';
                    }
                    html += '</tr>';
                }
                local.tbody.html(html);
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
    if (pagesCount > 20) {
        if (this.currPage <= 10) {
            from = 1;
            to   = 20;
        } else {
            from = this.currPage - 9;
            to   = (this.currPage + 10 <= pagesCount) ? this.currPage + 10 : pagesCount;
            pages += '<a href="#" class="go-to-page" page-number="1">1</a>...';
        }
    }
    for (var i = from; i <= to; i++) {
        currClass = i == this.currPage ? ' curr' : ''
        pages += '<a href="#" class="go-to-page' + currClass + '" page-number="' + i + '">' + i + '</a>';
    }
    if (pagesCount > to) {
        pages += '...<a href="#" class="go-to-page" page-number="' + pagesCount + '">' + pagesCount + '</a>';
    }
    var html = '<tr><th colspan="' + Object.size(this.columns) + '">' + pages + '<span class="in-total">' +
               this.count + ' in total</span></th></tr>';
    this.tbody.append(html);
    var local = this;
    this.tbody.find('.go-to-page').click(function() {
        local.currPage = parseInt($(this).attr('page-number'));
        local.displayData();
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