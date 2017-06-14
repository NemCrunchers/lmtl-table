# LMTL Table
Designed for Lone Mountain Truck Leasing in Omaha, NE this modular table plugin is intended to be a powerful yet modifiable. It was heavily inspired by wenzhixin's bootstrapTable

##Change Log v0.5
Features
- Kool AJAX Integration
- Popover Column Filtering
- Sorting Capability
- MultiSort Capability based on time applied
- Pagination

## Requirements
- jQuery 2.2.0
- Bootstrap 3.3.6
- Font Awesome 4.3.0
- Kool AJAX

## Usage
### html
```
<table id='#testTable'>
        	<thead>
        		<tr>
                    <th data-field='amount' data-filter='true' data-sortable='true'>Amount</th>
                    <th data-field='processed' data-sortable=true data-filter='false'>Processed</th>
                    <th data-field='requested_by' data-filter='true' data-sortable='true'>Requested By</th>
                    <th data-field='notes' data-filter='true'>Notes</th>
                </tr>

        	</thead>
        </table>
```
### javascript
```
$(function(){
   
    $('#testTable').lmtlTable({
	koolajax: 'getRefundRequests',
	uniqueId: 'id',
	pagination: true,
	pagesShown: 5,
	showFilterClear: true,
	multiSort: true
    });
});
```
