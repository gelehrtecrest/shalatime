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

    // クッキーからデータ取得
    function cookie_get(str){
        $.each(id_suffix, function(_, value) {
            var key = str + value;
            var cookie_data = $.cookie(key);
            set_value(key, cookie_data);
        });
    }

    // 取得したデータからinputに反映
    function set_value(key, data){
        if(data >= 1){
            $(key).prop("checked", true);
        } else {
            $(key).prop("checked", false);
        }
    }


    // クッキーに情報を格納する
    $('input').change(function() {
        if ($("#settingcookie").prop("checked") == true) {
            cookie_all_set();
        } else {
            cookie_all_delete();
        }
    });

    // クッキーに情報を格納
    function cookie_all_set(){
        $.get('aetheryte_id_list.csv', setparseCsv, 'text');
    }
    function setparseCsv(data) {
        var csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();

        $(csv).each(function(i) {
            cookie_set(this[0].toString());
        });
    }
    function cookie_set(str){
        $.each(id_suffix, function(_, value) {
            var key = str + value;
            console.log(key);
            if ($('#' + key).prop("checked") == true) {
                $.cookie(key, 1, { expires: 30 });
                console.log(1);
            } else {
                $.cookie(key, -1, { expires: 30 });
                console.log(-1);
            }
        });
    }    

    // クッキーに情報を格納しないチェックのときには、情報を全削除する
    function cookie_all_delete(){
        $.get('aetheryte_id_list.csv', deleteparseCsv, 'text');
    }
    function deleteparseCsv(data) {
        var csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();

        $(csv).each(function(i) {
            cookie_delete(this[0].toString());
        });
    }
    function cookie_delete(str){
        $.each(id_suffix, function(_, value) {
            var key = str + value;
            $.removeCookie(key);
            console.log("delete-----------");
            console.log(key);
        });
    }


});