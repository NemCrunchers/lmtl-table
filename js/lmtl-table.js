/**
 * @author Andrew Schmidt <andrew.schmidt@huskers.unl.edu>
 * version: 0.1
 */
(function ($) {
    var bootstrap_enabled = (typeof $().modal == 'function');
    var bootstrapSelect_enabled = (typeof $().selectpicker == 'function');
    var lmtlTableCache = [];

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
        classes: '',
        koolajax: false,
        url:'',
        callbackType: 'koolajax',
        pagination: false,
        page: 1,
        pageSize: 10,
        pageSizeOptions : [10, 25, 50, 'All'],
        size: '',
        multiSort:false,
        stickyHeaders: false,
        cache: false,
        methods:{
            preRequest : function(lmtlTable,data){
                return data;
            }, 
            postRequest : function(lmtlTable,response){
                return response;
            }
        },
        columnData: {}
    }
    LMTLTable.COLUMN_DEFAULTS = {
        sortable: false,
        order: undefined,
        filter: false,
        filterDistinct: undefined,
        sort: null,
        filterType: 'input',
        cache: true,
        editable: false,
        editableData: {},
        koolajax: false
    }
    LMTLTable.FILTER_TEMPLATES = {
        input: "<input class='form-control filter'></input><select class='form-control operator'><option value='' selected >Contains</option><option value='='  >Equal</option><option value='<'  >Less Than</option><option value='>'>Greater than</option></select>",
        select: "<select class='form-control filter'><option value=''></option></select>"
    }

    LMTLTable.prototype.init = function () {

        this.initCache();

        this.initColumns();
        this.initTable();

        this.$el.trigger('lmtl.table.shown');

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
    LMTLTable.prototype.initFilter = function(index, callback=null){
        var that = this;
        var el = this.columns[index].$el[0];
        if(callback == null){
            callback = function(response){
                    var text = $(el).text();
                    var content = LMTLTable.FILTER_TEMPLATES[that.columns[index].filterType];
                    if(that.columns[index].filterType == 'select'){
                        content = $(content);
                        for (var i = 0; i < Object.keys(response.rows).length ; i++) {
                            content.append("<option value='"+response.rows[i]['value']+"'>"+response.rows[i]['text']+"</option>");
                        }
                        content = $('<div>').append($(content).clone()).html();
                    }

                    $(el).append("<button class='btn btn-xs lmtl-filter  pull-right' ><span class='fa fa-filter'></span></button>");

                    if(that.columns[index].filter && that.columns[index].filterData !== undefined){
                        that.columns[index].$el.find('button.lmtl-filter').addClass('btn-primary');
                    }
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
                        content: content,
                        html: true
                    }).on('shown.bs.popover', function(event){

                        var target = event.target;
                        var column = $(event.target).closest('th');
                        column.find('.popover').addClass('lmtl-filter-popover');
                        var filterControl = column.find('.popover .filter');
                        var operatorControl = column.find('.popover select.operator');
                        var data = that.columns[column.data('col-index')].filterData;
                        var popover = $(target).siblings('.popover');



                        $(target).closest('table').find('.popover').not(popover).siblings('button.lmtl-filter').click();
                        
                        filterControl.on('keypress', function(event){
                            if(event.which == 13){
                                event.preventDefault();
                                $(target).trigger('click');
                            }
                        });
                        if(data !== undefined){
                            filterControl.val(data.value);
                            operatorControl.val(data.operator);
                        }
                        filterControl.focus();
                        that.$el.trigger('lmtl.table.filter.shown', [that, that.columns[index], filterControl]);

                        column.find('.popover .filter, .popover select.operator').change(function(){
                            that.options.page =1;
                        })

                    }).on('hide.bs.popover', function(event){

                        //console.log(event);
                            var column = $(event.target).closest('th');
                            var filterControl = column.find('.popover .filter');
                            var operatorControl = column.find('.popover select.operator');
                            if(filterControl.val() == ''){  // clear filter
                                that.clearColumnFilter(column.data('col-index'));
                            }else{
                                var data = {operator:operatorControl.val(),value:filterControl.val()};
                                if(that.columns[column.data('col-index')].filterType == 'select'){
                                    data.operator = '=';
                                }
                                that.columns[column.data('col-index')].filterData = data;
                                column.find('button.lmtl-filter').addClass('btn-primary');    
                            }
                            //that.options.page =1;
                            that.getData();
                    });
                
                };
        }
            //Add Filters
            if(this.columns[index].filter){
                if(this.columns[index].filterType == 'select'){
                        if(this.columns[index].filterCallbackType == 'koolajax'){
                            var response = koolajax.callback(eval(this.columns[index].filterCallback+'()'), callback);
                            
                        }else if(['GET', 'POST'].indexOf(this.columns[index].filterCallbackType) > -1){
                            $.ajax({
                              type: this.columns[index].filterCallbackType,
                              url: this.columns[index].filterCallback,
                              data: {},
                              success: callback,
                              dataType: 'json'
                            });
                        }
                }else if(this.columns[index].filterType == 'input'){
                        callback();
                }



            }
    }
    LMTLTable.prototype.destroyFilter = function(index){
        this.columns[index].$el.find('button.lmtl-filter').remove();
        
    }
    LMTLTable.prototype.refreshFilter = function(index, callback){
        var that = this;
        this.initFilter(index,function(response){
            var content = LMTLTable.FILTER_TEMPLATES[that.columns[index].filterType];
            if(that.columns[index].filterType == 'select'){
                    content = $(content);
                    for (var i = 0; i < Object.keys(response.rows).length ; i++) {
                        content.append("<option value='"+response.rows[i]['value']+"'>"+response.rows[i]['text']+"</option>");
                    }
                    content = $('<div>').append($(content).clone()).html();
                    var temp =that.columns[index].$el.find('button.lmtl-filter').data('bs.popover');
                    temp.options.content = content;
                    that.columns[index].$el.find('button.lmtl-filter').data('bs.popover', temp).options;
                }

        });
        
        
    }
    LMTLTable.prototype.setCache = function(data){
        if(this.options.cache == 'session'){
            sessionStorage.setItem('lmtl-table-columns-'+this.options.cacheId, JSON.stringify(data));
        }else if(this.options.cache == 'local'){
            localStorage.setItem('lmtl-table-columns-'+this.options.cacheId, JSON.stringify(data));
        }else if(this.options.cache == 'page'){
            lmtlTableCache['lmtl-table-columns-'+this.options.cacheId] = data;
        }

    }
    LMTLTable.prototype.getCache = function(){
        if(this.options.cache == 'session'){
            return JSON.parse(sessionStorage.getItem('lmtl-table-columns-'+this.options.cacheId));
        }else if(this.options.cache == 'local'){
            return JSON.parse(localStorage.getItem('lmtl-table-columns-'+this.options.cacheId));
        }else if(this.options.cache == 'page'){
            return lmtlTableCache['lmtl-table-columns-'+this.options.cacheId];
        }
    }
    LMTLTable.prototype.initCache = function(){

        if(this.options.cache == 'page'){
            var cache = lmtlTableCache['lmtl-table-columns-'+that.options.cacheId];
            if(cache == undefined){
                lmtlTableCache['lmtl-table-columns-'+that.options.cacheId] = null;
            }
        }
    }
    LMTLTable.prototype.initColumns = function () {
        var that = this;
        this.columns = [];
        if(this.options.cache){
          var old_columns = this.getCache();
        }
        //if($el)
        //this.$el.append('<tbody></tbody>');
        this.$el.find('th').each(function(index, el){
            $(el).data('col-index', index);
            
            var colData = {};
            if( typeof that.options.columnData[index] == 'object'){
                colData = that.options.columnData[index];
            }

            var oldCol = {};
            if(that.options.cache && old_columns !== null){
                oldCol = old_columns[index];
            }
              that.columns[index] = $.extend({}, LMTLTable.COLUMN_DEFAULTS, $(el).data(), colData, oldCol, {$el: $(el)} );
            

            that.initFilter(index);
            if(that.columns[index].sortable){
                $(el).append("&nbsp<i  class='fa sort fa-unsorted' style='cursor: pointer;' aria-hidden='true'></i>");
                $(el).css('cursor', 'pointer');
                $(el).find('i.sort').removeClass('fa-unsorted').addClass('fa-'+(that.columns[index].sort == undefined? 'unsorted': 'sort-'+that.columns[index].sort.sortOrder))
                $(el).click(function(event){
                    if($(event.target).is('i.sort') || $(event.target).is('th')){
                        var column = $(el);
                        var data = that.columns[column.data('col-index')].sort;
                        if(that.options.multiSort == false){
                            $(that.columns).each(function(index, col){
                                if(col.$el.not(column).length>0 && col.$el.find('i.sort:not(.fa-unsorted)').length>0){
                                    that.clearColumnSort(index);
                                }
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
                $(el).mousedown(function(e){ 
                    if($(e.target).is('th')){
                            e.preventDefault(); 
                    }
                })
            }
            
        });
        //console.log(this.columns);
    };
    LMTLTable.prototype.initTable = function () {
        var that = this;


        //POPOVER DISMISS
        $('html').on('click', function(e) {
          if ($('.lmtl-filter-popover').length>0 && !$(e.target).parents().is('.lmtl-filter-popover') && !($(e.target).is('button.lmtl-filter') || $(e.target).parents().is('button.lmtl-filter'))) {
            $('.lmtl-filter-popover').siblings('button.lmtl-filter').click();
            $('.lmtl-filter-popover').remove();
          }
        });

        //SET UP TABLE
        this.$el.wrap("<div class='lmtl-table-parent' id=lmtl-table#'"+this.$el.attr('id')+"'></div>");
        this.$el.wrap("<div class='lmtl-table-div'></div>");
        this.$parent = this.$el.closest('div.lmtl-table-parent');
        if(this.$el.find('tbody').length == 0){
            this.$el.append('<tbody></tbody>');
        }
        if(this.options.size !== undefined){
            this.$el.closest('div.lmtl-table-div').css('max-height', this.options.size)   
        }
        this.$el.addClass(this.options.classes);
        

        this.$parent.append("<div class='col-md-12 lmtl-table-status'><center><b>No records were found</b></center></div>");

        //PAGINATION
        if(this.options.pagination){
            this.$parent.append("<div class='lmtl-table-pagination'><div class='col-sm-6'><div style='font-size:16px' class='lmtl-table-pagination-status'></div></div><div class='col-sm-6'><ul class='pagination pull-right'></ul></div></div>");
            var that = this;
            this.$parent.find('.lmtl-table-pagination').on('click', 'li.page-number', function(event){
                that.options.page = $(this).data('page');
                that.getData();
            });
            this.$parent.find('.lmtl-table-pagination-status').on('change', '.lmtl-table-pagination-size', function(event){
                that.options.pageSize = $(this).val();
                that.options.page = 1;
                that.getData();
            });
        }

        //TOOLBAR
        this.$parent.prepend('<div class="lmtl-table-toolbar" style="display:none;" ><div class="btn-group pull-right" role="group"></div></div><div class=clearfix></div>')
        if(this.options.showFilterClear){
            this.$parent.find('.lmtl-table-toolbar').show();
            this.$parent.find('.lmtl-table-toolbar .btn-group').append("<button class='lmtl-table-clear-filter' title='Clear Filter/Sort' type='button' class='btn btn-secondary'><i class='fa fa-eraser'/></button>");
            this.$parent.find('.lmtl-table-clear-filter').click(function(){
                that.$el.find('.btn-primary.lmtl-filter').each(function(){
                    that.clearColumnFilter($(this).closest('th').data('col-index'))
                });
                that.$el.find('i.sort:not(.fa-unsorted)').each(function(){
                    that.clearColumnSort($(this).closest('th').data('col-index'));
                })
                that.getData();
            })
        }
        if(this.options.stickyHeaders){
            this.$el.stickyTableHeaders({scrollableArea: this.$parent.find('.lmtl-table-div')});
            this.$el.find('.tableFloatingHeader i.sort,.tableFloatingHeader button.lmtl-filter').remove();
        }
        if(this.options.showPrintButton){
            this.$parent.find('.lmtl-table-toolbar').show();
            this.$parent.parents().addClass('lmtl-table-print-parents');
            this.$parent.find('.lmtl-table-toolbar .btn-group').append("<button class='lmtl-table-print' title='Print Table' type='button' class='btn btn-secondary'><i class='fa fa-print'/></button>");
            
            this.$parent.find('button.lmtl-table-print').click(function(){
                that.$parent.find('.lmtl-table-div').addClass('lmtl-table-print');
                $('html').addClass('lmtl-table-print');
                window.print();
            })
            if (window.matchMedia) {
                var mediaQueryList = window.matchMedia('print');
                mediaQueryList.addListener(function(mql) {
                    if (!mql.matches) {
                        $('html.lmtl-table-print').removeClass('lmtl-table-print')
                        $('.lmtl-table-div.lmtl-table-print').removeClass('lmtl-table-print')
                    }
                });
            }

        }

        if(this.options.showExportButton){
            this.$parent.find('.lmtl-table-toolbar').show();
            this.$parent.find('.lmtl-table-toolbar .btn-group').append("<button class='lmtl-table-export' title='Export Table' type='button' class='btn btn-secondary'><i class='fa fa-table'/></button>");
            
            this.$parent.find('button.lmtl-table-export').click(function(){
                var data = [];

                var arrGetter = function(){
                  return '"'+$(this).text().trim()+'"';
                };
                var csv = that.$el.find('th:not(.lmtl-no-export)').map(arrGetter).get().join(',')+"\n";
                that.$el.find('tbody tr').each(function(index, el){
                    csv += $(el).find('td:not(.lmtl-no-export)').map(arrGetter).get().join(',')+"\n";
                })
                var today = new Date();
                var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var filename = 'export';
                //console.log(csv);
                if(that.options.exportFilename){
                    filename = that.options.exportFilename;
                }

                var hiddenElement = document.createElement('a');
                hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
                hiddenElement.target = '_blank';
                hiddenElement.download = filename+'_'+date+'.csv';
                hiddenElement.click();
            })

        }
    };
    LMTLTable.prototype.method = function(callback, data, index=0){
        var that = this;
        if(typeof data == 'function'){
            this.options.methods[callback] = data;
        }else {
            //if(typeof data == 'array'){
                var passback = this.options.methods[callback].apply(this, data);
            //}
            if(passback == undefined){
                    passback = data[index];
            }
            return passback;
        }

    }
    LMTLTable.prototype.getData = function (userData = {}) {
        var that = this;
        var data = {filter:{}, multiSort:[]};
        this.$el.find('tbody').html('');
        this.$parent.find('.lmtl-table-status').html('<center class="lmtl-table-loading">Loading Data...</center>');
        //build Filters
        this.$parent.find('.lmtl-table-pagination').hide();
        for(var index in this.columns){
            var col = this.columns[index];
            if(col.filterData !== undefined){
                eval('data.filter.'+col.field+' = '+ JSON.stringify(col.filterData));
            }
            if(col.sortable && col.sort !== null){
                data.multiSort.push(col.sort);
            }
            data.multiSort.sort(function(a, b){
              var aTime = a.sortDate;
              var bTime = b.sortDate; 
              return ((aTime < bTime) ? -1 : ((aTime > bTime) ? 1 : 0));
            });
            if(typeof that.options.multiSort == 'function'){
                data.multiSort.sort(multiSort);
            }
        }




        if(that.options.pagination && that.options.pageSize != 'All'){

            data.offset= (that.options.page-1)*that.options.pageSize;
            data.limit= that.options.pageSize;
        }
        data = $.extend({}, data, userData);
        this.method('preRequest', [data]);


        data = JSON.stringify(data);
        if(this.options.cache !== false){
            this.setCache(this.columns);
        }
        var dataProccess = function(response){
            that.$parent.find('.lmtl-table-pagination').show();
            that.$el.find('tbody').html('');
                for(var index in response.rows){
                    that.$el.find('tbody').append('<tr '+((that.options.uniqueId !== undefined)?'data-unique-id="'+response.rows[index][that.options.uniqueId]+'"':'')+'></tr>')
                    var page_row = that.$el.find('tbody tr:last');
                    $(that.columns).each(function(col_index, col){
                        var classes = col.$el.attr('class');
                        if(classes == undefined){
                            classes = '';
                        }
                        page_row.append('<td class="'+classes+'">'+response.rows[index][col.field]+'</td>');
                        if(col.editable){
                            var datetimepicker = col.editableData.type == 'datetimepicker';

                            if(datetimepicker){
                                col.editableData.type = 'text';
                            }

                            page_row.find('td:last').wrapInner('<a></a>');
                            var options = {
                                type: 'text',
                                pk: response.rows[index][that.options.uniqueId],
                                name: col.field,
                                title: 'Edit: '+$(that.$el.find('thead th')[col_index]).clone().children().remove().end().text() // get text not in child tags
                            };
                            if(that.options.koolajax){

                                options.url =  function(res){
                                    res = JSON.stringify(res);
                                    koolajax.callback(eval(col.editableData.koolajax+'(res)'), function(response){
                                        if(response.success){
                                            
                                        }else{
                                            
                                        }
                                    },'selector');
                                }
                                if(col.editableData.type == 'select'){
                                    options.source = function(){
                                        var response = koolajax.callback(eval(col.editableData.sourceKoolajax + '()'));
                                        if(response.success){
                                            if(typeof response.rows == 'object'){
                                                response.rows.length = Object.keys(response.rows).length;
                                                response.rows = Array.prototype.slice.call(response.rows,0); // convert to array
                                            }
                                            return response.rows;
                                        }else{
                                            
                                        }
                                    }
                                    //options.source = [{"value":"1","text":"DRT"},{"value":"2","text":"Hoovestol"},{"value":"3","text":"Eagle Express Lines"},{"value":"4","text":"Eagle Atlantic"},{"value":"5","text":"Lone Mountain Truck Leasing"},{"value":"6","text":"Cresco Capital"},{"value":"7","text":"Red Rock Capital"},{"value":"8","text":"Red Rock Trailer"}];
                                }

                            }
                            if(datetimepicker){
                                page_row.find('td:last a').on('shown', function(e, editable) {
                                    editable.input.$input.datetimepicker({
                                        format: col.editableData.format
                                    });
                                });
                            }
                            page_row.find('td:last a').editable($.extend({}, options, col.editableData));

                            if(datetimepicker){
                                col.editableData.type = 'datetimepicker';
                            }
                        }
                        
                    })

                }
                if(that.options.pagination){
                    var lastPage = Math.ceil(response.total/that.options.pageSize);
                    var page = that.options.page;
                    var paginationDIV = that.$parent.find('.lmtl-table-pagination');
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

                    
                    if(Object.keys(response.rows).length == 0){
                        that.$parent.find('div.lmtl-table-status').html("<center><b>No records were found</b></center>");
                    }else{
                        that.$parent.find('div.lmtl-table-status').html("");
                    }
                    paginationDIV.find('div.lmtl-table-pagination-status').html('');
                    if(that.options.pageSize != 'All' && Object.keys(response.rows).length > 0){
                        paginationDIV.find('div.lmtl-table-pagination-status').append('Showing row '+((page-1)*that.options.pageSize+1)+'-'+((page-1)*that.options.pageSize+Object.keys(response.rows).length)+' of '+response.total+ ' rows');
                    }
                    var select = "&nbsp<select style='width:70px;display: inline;' class='form-control lmtl-table-pagination-size'>";
                    for(var i = 0; i<that.options.pageSizeOptions.length; i++){
                        var pageOption = that.options.pageSizeOptions[i];
                        select += ("<option value='"+pageOption+"' "+(that.options.pageSize == pageOption?'selected':'')+">"+pageOption+"</option>");
                    }
                    paginationDIV.find('div.lmtl-table-pagination-status').append(select+"</select> rows per page");
                }
        }

        for (index in this.columns) { 
            if(!this.columns[index].cache){
                var that = this;
                this.refreshFilter(index);
            }
        }
        return new Promise(/* executor*/ function (resolve, reject) {

            if(that.options.callbackType == 'koolajax'){
                koolajax.callback(eval(that.options.koolajax+'(data)'), function(response){
                    if(response.success){
                        response = that.method('postRequest',[response]);
                        dataProccess(response);
                        resolve(response);
                    }else{
                        throwBootboxError(response);
                        reject(response);
                    }
                },'selector');
            }else if(['GET', 'POST'].indexOf(that.options.callbackType) > -1){
                $.ajax({
                  type: that.options.callbackType,
                  url: that.options.url,
                  data: data,
                  success: function(response){
                    response = that.method('postRequest', [response]);
                    dataProccess(response);
                    resolve(response);
                  },
                  dataType: 'json'
                });
            }
        });
        
    };

$.fn.lmtlTable = function (option) {
        var value,
            args = Array.prototype.slice.call(arguments, 1);

        this.each(function () {
            var $this = $(this);
            var data = $this.data('lmtlTable');
            var options = $.extend({}, LMTLTable.DEFAULTS, {cacheId: $this.attr('id')}, $this.data(),
                    typeof option === 'object' && option);

            if (!data) {
                $this.data('lmtlTable', (data = new LMTLTable(this, options)));
            }
        });

        return typeof value === 'undefined' ? this : value;
    };





    $.fn.lmtlTable.Constructor = LMTLTable;


})(jQuery);