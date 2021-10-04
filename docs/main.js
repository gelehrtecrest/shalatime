$(function() {

    
    function parseCsv(data) {
        var csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();

        $(csv).each(function(i) {
            console.log("------");
            console.log(this[0].toString());
        });
    }
    $.get('aetheryte_id_list.csv', parseCsv, 'text');
  
});