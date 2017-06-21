<?
require_once('../inc/header.php');

?>

        <link rel="stylesheet" href="style.css" />
<div id="wrapper">
        <div class="overlay"></div>
    
        <!-- Sidebar -->
        <nav class="navbar navbar-inverse navbar-fixed-top" id="sidebar-wrapper" role="navigation">
            <ul class="nav sidebar-nav">
                <li class="sidebar-brand">
                    <a href="#">
                       Brand
                    </a>
                </li>
                <li>
                    <a href="#">Home</a>
                </li>
                
                <li>
                    <a href="#table_options">Table Options</a>
                </li>
                <li>
                    <a href="#">Column Options</a>
                </li>
                <li>
                    <a href="#">Column Options</a>
                </li>
                <li>
                    <a href="https://github.com/NemCrunchers/lmtl-table">Github Project</a>
                </li>
            </ul>
        </nav>
        <!-- /#sidebar-wrapper -->

        <!-- Page Content -->
        <div id="">
            <button type="button" class="hamburger is-closed" data-toggle="offcanvas">
                <span class="hamb-top"></span>
    			<span class="hamb-middle"></span>
				<span class="hamb-bottom"></span>
            </button>
            <div class="">
                <div class="row">
                    <div class="col-xs-9 col-xs-offset-2 col-sm-offset-1">
                    <h1>Getting Started</h1>
                    <br>	<br>	<br>	<br>	
                        <h1 id="table_options">Table Options</h1>
                        <table class="table table-hover table-responsive">	
							<thead>	
								<th>Option Name</th><th>Data Type</th> <th>	Default</th><th>Description</th>
							</thead>
							<tbody>	
								<tr>
									<td>cache <br>	<i>	data-cache</i></td>
									<td>string|boolean</td>
									<td>false</td>
									<td>
										Determines whether to store all filter and sort data in cache <br>	
										<b>	String:</b>
										<ul>
											<li><i>local: </i>Stored in localStorage</li>
											<li><i>page: </i>Stored as a variable on page</li>
											<li><i>session: </i>Stored in sessionStorage</li>
										</ul></td>
								</tr>
								<tr id=callbackType>
									<td>callbackType <br> <i>data-callback-type</i></td>
									<td>string</td>
									<td>koolajax</td>
									<td><b>String: </b>
										<ul>
											<li>Traditional ajax
												<ul>
													<li><i>	get</i></li>
													<li><i>	post</i></li>
												</ul>
											</li>
											<li>KoolAjax by KoolPHP
												<ul>
											<li><i>	koolajax</i></li></ul>
											</li>
										</ul>
									</td>
								</tr>
								<tr>
									<td>classes <br> <i>data-classes</i></td>
									<td>string</td>
									<td></td>
									<td>Appends defined classes to table element</td>
								</tr>
								<tr>
									<td>koolajax <br> <i>data-koolajax</i></td>
									<td>string</td>
									<td></td>
									<td>KoolAjax function name
										<br> (<b>Required</b>) <a href="#callbackType">callbackType</a>: koolajax
									</td>
								</tr>
								<tr>
									<td>multiSort <br> <i>data-multi-sort</i></td>
									<td>boolean|function</td>
									<td>false <br>	
										<b>	Default sorting function:</b> <br>
										<pre>data.multiSort.sort(function(a, b){
  var aTime = a.sortDate;
  var bTime = b.sortDate; 
  return ((aTime < bTime) ? -1 : ((aTime > bTime) ? 1 : 0));
});</pre>
									</td>
									<td>Whether to allow multiple columns to sort the table
									</td>
								</tr>
								<tr>
									<td>methods</td>
									<td>object</td>
									<td></td>
									<td>Object of method functions. See <a href="#methods">Methods Documentation</a> for more details</td>
								</tr>
								<tr>
									<td>page <br> <i>data-page</i></td>
									<td>integer</td>
									<td>1</td>
									<td>Determines the table's starting page</td>
								</tr>
								<tr>
									<td>pageSize <br> <i>data-page-size</i></td>
									<td>integer|string</td>
									<td>10</td>
									<td>Determines the table's starting page size. <br>	<i>All</i> is the only available string and shows all rows</td>
								</tr>
								<tr>
									<td>pageSizeOptions <br> <i>data-page-size-options</i></td>
									<td>array</td>
									<td>[10, 25, 50, 'All']</td>
									<td>Determines the available options for the table size</td>
								</tr>
								<tr>
									<td>size <br> <i>data-size</i></td>
									<td>string</td>
									<td></td>
									<td>Javascript solution to setting size of the div container. This is not recommended as it is better to use css to set your size</td>
								</tr>
								<tr>
									<td>stickyHeaders <br> <i>data-sticky-headers</i></td>
									<td>boolean</td>
									<td>false</td>
									<td>(<b>Required</b>) <a href='https://github.com/jmosbech/StickyTableHeaders'>StickyTableHeaders</a> </td>
								</tr>
								<tr>
									<td>url <br> <i>data-url</i></td>
									<td>string</td>
									<td></td>
									<td>(<b>Required</b>) <a href="#callbackType">callbackType</a>: Traditional ajax </td>
								</tr>
							</tbody>
                        </table>
                    <br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	<br>	              
                    </div>
                </div>
            </div>
        </div>
        <!-- /#page-content-wrapper -->

    </div>

    <?
    require_once('../inc/footer.php');

    ?>

    <script src="main.js"></script>