/**
 * Cubique
 * @author    Alexander Plutov
 * @copyright (c) 2011 Alexander Plutov
 * @license   https://github.com/plutov/cubique/blob/master/LICENSE
 */

/**
 * Constructor
 * @param  object options
 * @return void
 */
Cubique = function(options)
{
    local               = this;
    local.name          = options.name;
    local.columns       = options.columns;
    local.rowsOnPage    = options.rows_on_page;
    local.columnsToSort = options.columns_to_sort;
    local.count         = 0;
    local.currPage      = 1;
    local.sort          = '';
    local.renderGrid();
    local.displayData();
}

/**
 * Render main grid HTML
 * @return void
 */
Cubique.prototype.renderGrid = function Cubique_renderGrid()
{
    var html   = '<table class="cubique"><thead>';
    var column = '';
    for (var columnName in local.columns) {
        if (typeof(local.columnsToSort[columnName]) != 'undefined') {
            column = '<a href="#" class="sort-by" sort-column="' + columnName + '" sort-rotation="ASC">' + local.columns[columnName] + '</a>';
        } else {
            column = local.columns[columnName];
        }
        html += '<th>' + column + '</th>';
    }
    html += '</thead><tbody></tbody></table>';
    $('#cubique-' + local.name).html(html);
    var sortRotation = 'ASC';
    $('#cubique-' + local.name + ' a.sort-by').click(function() {
        local.currPage = 1;
        sortRotation = $(this).attr('sort-rotation');
        $(this).attr('sort-rotation', sortRotation == 'ASC' ? 'DESC' : 'ASC');
        local.sort = $(this).attr('sort-column') + ' ' + sortRotation;
        local.displayData();
        return false;
    });
    local.tbody = $('#cubique-' + local.name + ' tbody');
}

/**
 * Make AJAX request to the server and display data
 * @return void
 */
Cubique.prototype.displayData = function Cubique_displayData()
{
    var loading = $('<tr><td colspan="' + Object.size(local.columns) + '" class="loading">' +
                    '<img src="/helpers/img/cubique_loading.gif"/></td></tr>');
    local.tbody.html(loading);
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
    var pagesCount = Math.ceil(local.count/local.rowsOnPage);
    for (var i = 1; i <= pagesCount; i++) {
        currClass = i == local.currPage ? ' curr' : ''
        pages += '<a href="#" class="go-to-page' + currClass + '" page-number="' + i + '">' + i + '</a>';
    }
    var html = '<tr><th colspan="' + Object.size(local.columns) + '">' + pages + '</th></tr>';
    local.tbody.append(html);
    local.tbody.find('.go-to-page').click(function() {
        local.currPage = $(this).attr('page-number');
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