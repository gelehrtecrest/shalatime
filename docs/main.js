$(function() {
    function parseCsv(data) {
        var csv = $.csv.toArrays(data);
  
        var insert = '';
        $(csv).each(function(i) {
            console.log("------");
            if (this.length > 0) {
                $(this).each(function() {
                    console.log(this);
                });
            }
        });
    }
    $.get('aetheryte_id_list.csv', parseCsv, 'text');
  
});