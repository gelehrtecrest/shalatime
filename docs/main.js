var id_suffix = [
    '-start',
    '-end',
    '-pass',
    '-free',
    '-half',
    '-homepoint',
];

$(function() {

    // クッキーから情報を取得する。
    // CSVファイルからidを取得

    function parseCsv(data) {
        var csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();

        $(csv).each(function(i) {
            cookie_get(this[0].toString());
        });
    }
    $.get('aetheryte_id_list.csv', parseCsv, 'text');

    function cookie_get(str){
        id_suffix.each(function(i) {
            var key = str + this;
            console.log(key);
        });
    }
});