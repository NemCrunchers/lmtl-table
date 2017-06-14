/**
 * @author Andrew Schmidt <andrew.schmidt@huskers.unl.edu>
 * version: 0.1
 */
(function ($) {
    'use strict';
   
    var LMTLTable = function (el, options) {
        this.options = options;
        this.$el = $(el);
        this.$el_ = this.$el.clone();
        this.timeoutId_ = 0;
        this.timeoutFooter_ = 0;

        this.init();
    };
    LMTLTable.DEFAULTS = {
        classes: 'table table-hover',
        koolajax: false,
        pagination: false,
        page: 1,
        pageSize: 10,
        pageSizeOptions : [10, 25, 50, 'All'],
        size: '500px',
        multiSort:false

    }
    LMTLTable.COLUMN_DEFAULTS = {
        sortable: false,
        order: undefined,
        filter: false,
        filterDistinct: undefined,
        sort: null
    }

    LMTLTable.prototype.init = function () {
        this.initColumns();
        this.initTable();
        this.getData();
    };
    LMTLTable.prototype.clearColumnFilter = function(index){
        var column = this.columns[index];
        column.filterData = undefined;

        column.$el.find('button.lmtl-filter').removeClass('btn-primary');

    }
    LMTLTable.prototype.clearColumnSort = function(index){
        var column = this.columns[index];
        column.sort = null;
        column.$el.find('i.sort').removeClass('fa-sort-asc').removeClass('fa-sort-desc').addClass('fa-unsorted');
    }
    LMTLTable.prototype.initColumns = function () {
        var that = this;
        this.columns = [];
        //if($el)
        //this.$el.append('<tbody></tbody>');
        this.$el.find('th').each(function(index, el){
            $(el).data('col-index', index);
            that.columns[index] = $.extend({}, LMTLTable.COLUMN_DEFAULTS, $(el).data(), {$el: $(el)} );

            //Add Filters
            if(that.columns[index].filter){
                var text = $(el).text();
                $(el).append("<button class='btn btn-xs lmtl-filter  pull-right' ><span class='fa fa-filter'></span></button>");
                $(el).find('button.lmtl-filter').popover({
                    placement: function (context, source) {
                        var position = $(source).position();

                        if ($( document ).width()-position.left < 300) {
                            if(position.left < 300){
                                if($( document ).height()-position.top < 300){
                                    return "top";
                                }
                                return "bottom";
                            }
                            return "left";
                        }

                        return "right";

                    },
                    title: '<b>Filter '+ text+'</b>',
                    content: "<input class='form-control filter'></input><select class='form-control operator'><option value='' selected >Contains</option><option value='='  >Equal</option><option value='<'  >Less Than</option><option value='>'>Greater than</option></select>",
                    html: true
                }).on('shown.bs.popover', function(event){
                    var target = event.target;
                    var column = $(event.target).closest('th');
                    column.find('.popover').addClass('lmtl-filter-popover');
                    var filterControl = column.find('.popover input.filter');
                    var operatorControl = column.find('.popover select.operator');
                    var data = that.columns[column.data('col-index')].filterData;
                    $(target).closest('table').find('.popover').not($(target).siblings('.popover')).siblings('button.lmtl-filter').click();
                    filterControl.on('keypress', function(event){
                        if(event.which == 13){
                            $(target).trigger('click');
                        }
                    });
                    if(data !== undefined){
                        filterControl.val(data.value);
                        operatorControl.val(data.operator);
                    }
                    filterControl.focus();
                    that.$el.trigger('lmtl.table.filter.shown', [that, that.columns[index], filterControl]);

                    column.find('.popover input.filter, .popover select.operator').change(function(){
                        that.options.page =1;
                    })

                }).on('hide.bs.popover', function(event){

                    //console.log(event);
                        var column = $(event.target).closest('th');
                        var filterControl = column.find('.popover input.filter');
                        var operatorControl = column.find('.popover select.operator');
                        if(filterControl.val() == ''){  // clear filter
                            that.clearColumnFilter(column.data('col-index'));
                        }else{
                            that.columns[column.data('col-index')].filterData = {operator:operatorControl.val(),value:filterControl.val()};
                            column.find('button.lmtl-filter').addClass('btn-primary');    
                        }
                        //that.options.page =1;
                        that.getData();
                });
            }
            if(that.columns[index].sortable){
                $(el).append("&nbsp<i  class='fa sort fa-unsorted' style='cursor: pointer;' aria-hidden='true'></i>");
                $(el).css('cursor', 'pointer');
                $(el).click(function(event){
                    if($(event.target).is('i.sort') || $(event.target).is('th')){
                        var column = $(el);
                        var data = that.columns[column.data('col-index')].sort;
                        if(that.options.multiSort == false){
                            $('thead th').not(column).find('i.sort:not(.fa-unsorted)').each(function(){
                                that.clearColumnSort($(this).closest('th').data('col-index'));
                            })
                        }
                        if(data == null){
                            that.columns[column.data('col-index')].sort = {sortOrder: 'asc', sortName: column.data('field'), sortDate: (new Date()).getTime()};
                            column.find('i.sort').removeClass('fa-unsorted').removeClass('fa-sort-desc').addClass('fa-sort-asc');
                        }else if(data.sortOrder == 'asc'){
                            that.columns[column.data('col-index')].sort = {sortOrder: 'desc', sortName: column.data('field'), sortDate: (new Date()).getTime()};
                            column.find('i.sort').removeClass('fa-unsorted').removeClass('fa-sort-asc').addClass('fa-sort-desc');
                        }else{
                            that.clearColumnSort(column.data('col-index'));
                        }
                        that.getData();
                    }
                });
            }
            
        });
        console.log(this.columns);
    };
    LMTLTable.prototype.initTable = function () {
        var that = this;
        //POPOVER DISMISS
        $('html').on('click', function(e) {
          if (!$(e.target).parents().is('.lmtl-filter-popover') && !($(e.target).is('button.lmtl-filter') || $(e.target).parents().is('button.lmtl-filter'))) {
            $('.lmtl-filter-popover').siblings('button.lmtl-filter').click();
          }
        });

        //SET UP TABLE
        this.$el.wrap("<div class='lmtl-table-parent'></div>");
        this.$el.wrap("<div class='lmtl-table'></div>");
        this.$div = this.$el.closest('div.lmtl-table-parent');
        if(this.$el.find('tbody').length == 0){
            this.$el.append('<tbody></tbody>');
        }
        if(this.options.size !== undefined){
            this.$el.closest('div.lmtl-table').css('max-height', this.options.size)   
        }
        this.$el.addClass(this.options.classes);
        



        //PAGINATION
        if(this.options.pagination){
            this.$div.append("<div class='lmtl-table-pagination'><div class='col-sm-6'><div style='font-size:16px' class='lmtl-table-pagination-status'></div></div><div class='col-sm-6'><ul class='pagination pull-right'></ul></div></div>");
            var that = this;
            this.$div.find('.lmtl-table-pagination').on('click', 'li.page-number', function(event){
                that.options.page = $(this).data('page');
                that.getData();
            });
            this.$div.find('.lmtl-table-pagination-status').on('change', '.lmtl-table-pagination-size', function(event){
                that.options.pageSize = $(this).val();
                that.options.page = 1;
                that.getData();
            });
        }

        //TOOLBAR
        this.$div.prepend('<div class="lmtl-table-toolbar" style="display:none;" ><div class="btn-group pull-right" role="group"></div></div><div class=clearfix></div>')
        if(this.options.showFilterClear){
            this.$div.find('.lmtl-table-toolbar').show();
            this.$div.find('.lmtl-table-toolbar .btn-group').append("<button class='lmtl-table-clear-filter' type='button' class='btn btn-secondary'><i class='fa fa-eraser'/></button>");
            this.$div.find('.lmtl-table-clear-filter').click(function(){
                that.$el.find('.btn-primary.lmtl-filter').each(function(){
                    that.clearColumnFilter($(this).closest('th').data('col-index'))
                });
                that.$el.find('i.sort:not(.fa-unsorted)').each(function(){
                    that.clearColumnSort($(this).closest('th').data('col-index'));
                })
                that.getData();
            })
        }
    };

    LMTLTable.prototype.getData = function () {
        var that = this;
        var filter = {};
        var sort = [];
        //build Filters
        for(var index in this.columns){
            var col = this.columns[index];
            if(col.filterData !== undefined){
                eval('filter.'+col.field+' = '+ JSON.stringify(col.filterData));
            }
            if(col.sortable && col.sort !== null){
                sort.push(col.sort);
            }
            sort.sort(function(a, b){
              var aTime = a.sortDate;
              var bTime = b.sortDate; 
              return ((aTime < bTime) ? -1 : ((aTime > bTime) ? 1 : 0));
            });
        }




        var data = {
            filter: filter,
            multiSort: sort,
        };
        if(that.options.pagination && that.options.pageSize != 'All'){

            data.offset= (that.options.page-1)*that.options.pageSize;
            data.limit= that.options.pageSize;
        }


        data = JSON.stringify(data);
        koolajax.callback(eval(this.options.koolajax+'(data)'), function(response){
            if(response.success){

                that.$el.find('tbody').html('');
                for(var index in response.rows){
                    that.$el.find('tbody').append('<tr '+((that.options.uniqueId !== undefined)?'data-unique-id="'+response.rows[index][that.options.uniqueId]+'"':'')+'></tr>')
                    var page_row = that.$el.find('tbody tr:last');
                    $(that.columns).each(function(col_index, col){
                        var classes = col.$el.attr('class');
                        page_row.append('<td class='+classes+'>'+response.rows[index][col.field]+'</td>');
                    })

                }
                if(that.options.pagination){
                    var lastPage = Math.ceil(response.total/that.options.pageSize);
                    var page = that.options.page;
                    var paginationDIV = that.$div.find('.lmtl-table-pagination');
                    paginationDIV.find('ul').html('');
                    var pages = Math.floor(that.options.pagesShown/2);
                    if(page>pages+1){
                        paginationDIV.find('ul').append("<li class='page-number' data-page='1'><a href='javascript:void(0)'>First</a></li>");
                    }
                    if(page>1){
                        paginationDIV.find('ul').append("<li class='page-number' data-page='"+(page-1)+"'><a href='javascript:void(0)'>&laquo;</a></li>");
                    }
                    for (var i = Math.max(1, page-pages); i <= Math.min(page+pages, lastPage); i++) {
                        paginationDIV.find('ul').append("<li class='page-number "+(page==i?'active':'')+"' data-page='"+i+"'><a href='javascript:void(0)'>"+i+"</a></li>");
                    }
                    if(page<lastPage){
                        paginationDIV.find('ul').append("<li class='page-number' data-page='"+(page+1)+"'><a href='javascript:void(0)'>&raquo;</a></li>");
                    }
                    if(page<lastPage-pages){
                        paginationDIV.find('ul').append("<li class='page-number' data-page='"+lastPage+"'><a href='javascript:void(0)'>Last</a></li>");
                    }


                    $('div.lmtl-table-pagination-status').html('');
                    if(that.options.pageSize != 'All'){
                        $('div.lmtl-table-pagination-status').append('Showing row '+((page-1)*that.options.pageSize+1)+'-'+page*that.options.pageSize+' of '+lastPage*that.options.pageSize+ ' rows');
                    }
                    var select = "&nbsp<select style='width:70px;display: inline;' class='form-control lmtl-table-pagination-size'>";
                    for(var i = 0; i<that.options.pageSizeOptions.length; i++){
                        var pageOption = that.options.pageSizeOptions[i];
                        select += ("<option value='"+pageOption+"' "+(that.options.pageSize == pageOption?'selected':'')+">"+pageOption+"</option>");
                    }
                    $('div.lmtl-table-pagination-status').append(select+"</select> rows per page");
                }
            }else{
                throwBootboxError(response);
            }
        },'selector');
        
    };



$.fn.lmtlTable = function (option) {
        var value,
            args = Array.prototype.slice.call(arguments, 1);

        this.each(function () {
            var $this = $(this);
            var data = $this.data('lmtl.table');
            var options = $.extend({}, LMTLTable.DEFAULTS, $this.data(),
                    typeof option === 'object' && option);

            if (!data) {
                $this.data('lmtl.table', (data = new LMTLTable(this, options)));
            }
        });

        return typeof value === 'undefined' ? this : value;
    };





    $.fn.lmtlTable.Constructor = LMTLTable;


})(jQuery);