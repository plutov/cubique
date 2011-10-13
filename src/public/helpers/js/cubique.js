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
    local         = this;
    local.name    = options.name;
    local.columns = options.columns;
    local.renderGrid();
    local.displayData();
}

/**
 * Render main grid HTML
 * @return void
 */
Cubique.prototype.renderGrid = function Cubique_renderGrid()
{
    var html = '<table class="cubique"><thead>';
    for (var columnName in local.columns) {
        html += '<th>' + local.columns[columnName] + '</th>';
    }
    html += '</thead><tbody></tbody></table>';
    $('#cubique-' + local.name).html(html);
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
            cubique_grid_name: local.name
        },
        url:      location.href,
        dataType: 'json',
        success:  function(response) {
            if (response.error) {
                alert('Error has been occurred. Try to refresh the page.');
            } else {
                var html = '';
                for (var rowKey in response.data) {
                    html += '<tr>';
                    for (var columnName in response.data[rowKey]) {
                        html += '<td>' + response.data[rowKey][columnName] + '</td>';
                    }
                    html += '</tr>';
                }
                local.tbody.html(html);
            }
            loading.remove();
        }
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