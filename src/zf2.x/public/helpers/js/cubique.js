/**
 * Cubique
 * @author    Alexander Plutov
 * @copyright (c) 2011-2012 Alexander Plutov
 * @link      https://github.com/plutov/cubique
 * @license   https://github.com/plutov/cubique/blob/master/LICENSE
 */

/**
 * Sets common variables, render grid, get data.
 * @param o object Grid options from server
 * @return void
 */
Cubique = function(o)
{
    var l = this;
    $.extend(l, o);
    l.c  = 0; // total count
    l.cp = 1; // current page
    l.sv = {}; // temp stored search values
    // islsa - is local storage available
    try {
        l.islsa = 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        l.islsa = false;
    }
    var ppo  = [10, 25, 50, 100], // per page options
        rops = parseInt(l.gs('rop')), // rows on page state
        cps  = parseInt(l.gs('cp')), // current page state
        scs  = l.gs('sc'), // sort column state
        sos  = l.gs('so'), // sort order state
        srs  = $.parseJSON(l.gs('sr')); // search state
    ppo.push(l.rop);
    ppo.sort(function(a,b){return a-b;});
    ppo.join();
    l.s = (scs && sos) ? (scs + ' ' + sos) : '';
    if (rops && $.inArray(rops, ppo) != -1) {
        l.rop = rops;
        if (cps) {
            l.cp = cps;
        }
    } else {
        l.ss('rop', l.rop);
        l.ss('cp', l.cp);
    }
    l.sr = srs ? srs : {};
    l.ppo  = {};
    for (var j in ppo) {
        l.ppo[ppo[j]] = ppo[j];
    }
    l.r();
    l.sd();
}

/**
 * Renders main grid HTML.
 * @return void
 */
Cubique.prototype.r = function Cubique_r()
{
    var h   = '<table class="cubique"><thead><tr>',
        l   = this,
        ct  = '', // columns temp
        scs = l.gs('sc'),
        sos = l.gs('so');
    for (var i in l.co) {
        if (typeof(l.coso[i]) != 'undefined') {
            ct = '<span class="order">' + ((scs == l.coso[i]) ? (sos == 'ASC' ? '&#9660' : '&#9650') : '') +
                 '</span> <a href="#" title="Sort by ' + l.co[i] + '" class="sort-by" data-column="' + i + '" data-order="' +
                 ((scs == l.coso[i]) ? (sos == 'ASC' ? 'DESC' : 'ASC') : 'ASC') + '">' + l.co[i] + '</a>';
        } else {
            ct = l.co[i];
        }
        h += '<th>' + ct + '</th>';
    }
    h += '</tr>';
    if (l.gos(l.cosr)) {
        h += '<tr>';
        var tst = '', // temp search type
            cnd  = ['LIKE', 'NOT LIKE', '=', '<>', '<', '>', '<=', '>='];
        for (var j in this.co) {
            ct = '';
            if (typeof(l.cosr[j]) != 'undefined') {
                tst = (typeof(l.sr[j]) != 'undefined') ? l.sr[j][1] : '';
                ct += '<select class="search-type" title="Search type">';
                for (var k in cnd) {
                    ct += '<option value="' + cnd[k] + '"' + (tst == '' + cnd[k] + '' ? ' selected=selected' : '') + '>' + cnd[k] + '</option>';
                }
                ct += '</select>' +
                      '<input type="text" data-column="' + j + '" placeholder="search" value="' +
                      ((typeof(l.sr[j]) != 'undefined') ? l.sr[j][0] : '') + '"/> ' +
                      '<a href="#" class="reset-search" title="Reset search">&times;</a>';
                l.sv[j] = (typeof(l.sr[j]) != 'undefined') ? l.sr[j] : '';
            }
            h += '<th>' + ct + '</th>';
        }
        h += '</tr>';
    }
    h += '</thead><tbody></tbody></table>';
    $('#cubique-' + l.n).html(h);
    var so = 'ASC',
        sc = '',
        sl = $('#cubique-' + l.n + ' a.sort-by');
    sl.click(function() {
        sl.prev('span').html('');
        so = $(this).attr('data-order');
        sc = $(this).attr('data-column');
        l.cp = 1;
        l.s  = sc + ' ' + so;
        l.ss('cp', 1);
        l.ss('sc', sc);
        l.ss('so', so);
        $(this).attr('data-order', so == 'ASC' ? 'DESC' : 'ASC');
        $(this).prev('span').html(so == 'ASC' ? '&#9660;' : '&#9650;');
        l.sd();
        return false;
    });
    $('#cubique-' + l.n + ' input').keyup(function() {
        l.makeSearch($(this), $(this).prev('select'));
        return false;
    });
    $('#cubique-' + l.n + ' .search-type').change(function() {
        l.makeSearch($(this).next('input'), $(this));
        return false;
    });
    $('#cubique-' + l.n + ' .reset-search').click(function() {
        var i  = $(this).prev(),
            sl = i.prev();
        i.val(null);
        sl.val('LIKE');
        l.makeSearch(i, sl);
        return false;
    });
    l.tbody = $('#cubique-' + l.n + ' tbody');
    l.thead = $('#cubique-' + l.n + ' thead');
}

/**
 * Makes AJAX request to the server and display data.
 * @return void
 */
Cubique.prototype.sd = function Cubique_sd()
{
    var l   = this,
        cc  = l.gos(l.co),
        ldn = $('<tr><td colspan="' + cc + '" class="loading">.</td></tr>'),
        li  = setInterval(function() { $('.loading').html($('.loading').html() + '.'); }, 50),
        d   = new Date();
    this.tbody.html(ldn);
    $.ajax({
        type: 'post',
        data: l.gpd(),
        url: (l.url ? l.url : location.href) + '?nocache=' + d.getTime(),
        dataType: 'json',
        success:  function(r) {
            if (r.error) {
                l.tbody.html('<tr><td colspan="' + cc + '" class="error">' + l.em + '</td></tr>');
            } else {
                l.c = r.count;
                var h = '';
                for (var i in r.data) {
                    h += '<tr>';
                    for (var j in r.data[i]) {
                        if (null == r.data[i][j]) {
                            r.data[i][j] = '';
                        }
                        h += '<td>' + r.data[i][j] + '</td>';
                    }
                    h += '</tr>';
                }
                l.tbody.html(h);
                $('table.cubique tbody td').mouseover(function() {
                    $(this).parent().addClass('hovered');
                })
                .mouseleave(function() {
                    $(this).parent().removeClass('hovered');
                });
                l.thead.find('.pages').remove();
                l.rps();
            }
            clearInterval(li);
            ldn.remove();
        }
    });
}

/**
 * Renders pages section.
 * @return void
 */
Cubique.prototype.rps = function Cubique_rps()
{
    var ph   = '',
        pc   = Math.ceil(this.c/this.rop),
        to   = pc,
        from = 1,
        l    = this,
        ms   = '<span class="more">...</span>';
    if (pc > 10) {
        if (l.cp <= 6) {
            from = 1;
            to   = 10;
        } else if (pc - l.cp <= 5) {
            from = pc - 11;
            to   = pc;
            ph += l.gtp(1, false) + ms;
        } else {
            from = l.cp - 5;
            to   = (l.cp + 5 <= pc) ? l.cp + 5 : pc;
            ph   += l.gtp(1, false);
            if (l.cp > 7) {
                ph += ms;
            }
        }
    }
    for (var i = from; i <= to; i++) {
        ph += l.gtp(i, i == l.cp);
    }
    if (pc > to) {
        if (pc - l.cp >= 7) {
            ph += ms;
        }
        ph += this.gtp(pc, false);
    }
    var slc = '<select class="per-page" title="Rows on page">';
    for (var j in l.ppo) {
        slc += '<option value="' + l.ppo[j] + '">' + l.ppo[j] + '</option>';
    }
    slc += '</select>';
    l.thead.append($('<tr class="pages"><th colspan="' + l.gos(l.co) + '">' + ph +
                        '<a href="#" class="csv" title="Export to CSV">csv</a>' +
                        '<a href="#" class="refresh" title="Refresh page">refresh</a>' + slc + '<span class="in-total">' +
                        l.c + ' in total</span></th></tr>'));
    l.thead.find('.go-to-page').click(function() {
        l.cp = parseInt($(this).attr('data-number'));
        l.ss('cp', l.cp);
        l.sd();
        return false;
    });
    l.thead.find('.per-page').change(function() {
        l.rop = $(this).val();
        l.ss('rop', l.rop);
        l.ss('cp', 1);
        l.cp   = 1;
        l.sd();
        return false;
    }).val(this.rop);
    l.thead.find('.refresh').click(function() {
        l.sd();
        return false;
    });
    l.thead.find('.csv').click(function() {
        var data = l.str(l.gpd());
        document.location.href = (l.url ? l.url : location.href) + '?cubique_data=' + encodeURIComponent(data);
        return false;
    });
}

/**
 * Returns go-to-page link.
 * @param p number
 * @param c bool
 * @return string
 */
Cubique.prototype.gtp = function Cubique_gtp(p, c)
{
    return '<a href="#" title="Go to page ' + p + '" class="go-to-page' + (c ? ' curr' : '') + '" data-number="' + p + '">' + p + '</a>'
}

/**
 * Get object size.
 * @param o object
 * @return int
 */
Cubique.prototype.gos = function Cubique_gos(o)
{
    var s = 0;
    for (var k in o) {
        if (o.hasOwnProperty(k)) {
            s++;
        }
    }
    return s;
}

/**
 * Sets search data and makes AJAX request.
 * @param v object
 * @param t object
 * @return void
 */
Cubique.prototype.makeSearch = function Cubique_makeSearch(v, t)
{
    var sc = v.attr('data-column'),
        sr = [v.val(), t.val()],
        l  = this;
    if (l.sv[sc] != sr) {
        l.sr[sc] = sr;
        l.ss('cp', 1);
        l.ss('sr', l.str(l.sr));
        l.sv[sc]  = sr;
        l.cp = 1;
        l.sd();
    }
}

/**
 * Returns JSON string.
 * @param o object
 * @return string
 */
Cubique.prototype.str = function Cubique_str(o)
{
    if ('JSON' in window) {
        return JSON.stringify(o);
    }

    var t = typeof (o);
    if (t != 'object' || o === null) {
        if (t == 'string') {
            o = '"' + o + '"';
        }
        return String(o);
    } else {
        var n, v, json = [], arr = (o && o.constructor == Array);
        for (n in o) {
            v = o[n];
            t = typeof(v);
            if (o.hasOwnProperty(n)) {
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
 * @param k string
 * @return string
 */
Cubique.prototype.gs = function Cubique_gs(k)
{
    var l = this,
    k = l.n + '_' + k;
    if (l.islsa) {
        return localStorage.getItem(k);
    } else {
        var c = ' ' + document.cookie,
            sr = ' ' + k + '=',
            v = '',
            o = 0,
            e = 0;
        if (c.length > 0) {
            o = c.indexOf(sr);
            if (o != -1) {
                o += sr.length;
                e = c.indexOf(';', o);
                if (e == -1) {
                    e = c.length;
                }
                v = c.substring(o, e);
            }
        }
        return(v);
    }
}

/**
 * Sets value of state in local storage or cookies.
 * @param k string
 * @param v string
 * @return void
 */
Cubique.prototype.ss = function Cubique_ss(k, v)
{
    var now = new Date(),
        ex  = now,
        l   = this;
    k = l.n + '_' + k;
    if (l.islsa) {
        localStorage.setItem(k, v);
    } else {
        ex.setTime(now.getTime() + 864000000); // Just 10 days
        document.cookie = k + '=' + v + ';expires=' + expire.toGMTString() + ';path=/';
    }
}

/**
 * Returns data for AJAX or CSV export.
 * @return obj
 */
Cubique.prototype.gpd = function Cubique_gpd()
{
    var l = this;
    return {
        cubique: {
            cp:  l.cp,
            so:  l.s,
            sr:  l.sr,
            rop: l.rop
        }
    };
}