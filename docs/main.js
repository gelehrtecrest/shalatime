let id_suffix = [
    '-start',
    '-end',
    '-pass',
    '-free',
    '-half',
    '-homepoint',
];
let yes = "YES";
let no = "NO";

$(function() {

    // クッキーから情報を取得する。
    // CSVファイルからidを取得

    var get_data;
    function parseCsv(data) {
        var csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();

        var jsondata = $.cookie("jsondata");
        get_data = JSON.parse(jsondata);
        console.log(get_data);
        $(csv).each(function(i) {
            cookie_get(this[0].toString(), this[1].toString());
        });
    }
    $.get('aetheryte_id_list.csv', parseCsv, 'text');

    // クッキーからデータ取得
    function cookie_get(num, str){
        $.each(id_suffix, function(_, value) {
            var num_key = num + value;
            var key = str + value;
            var cookie_data = get_data[num_key];
            set_value(key, cookie_data);
        });
    }

    // 取得したデータからinputに反映
    function set_value(key, cookie_data){
        // クッキー読み込むタイミングで、undefinedになったら処理をとばす
        if (cookie_data === undefined){
            return;
        }

        if(cookie_data == yes){
            $('#' + key).prop("checked", true);
        } else {
            $('#' + key).prop("checked", false);
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
    var set_data;
    function setparseCsv(data) {
        var csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();
        set_data = new Object();
        $(csv).each(function(i) {
            cookie_set(this[0].toString(), this[1].toString());
        });
        var jsondata = JSON.stringify(set_data);
        console.log(jsondata);
        $.cookie("jsondata", jsondata, {expires:7});
        console.log("------------------------------------");
        console.log($.cookie("jsondata"));
    }
    function cookie_set(num, str){
        
        $.each(id_suffix, function(_, value) {
            var num_key = num + value;
            var key = str + value;
            if ($('#' + key).prop("checked") == true) {
                set_data[num_key] = yes;
            } else {
                set_data[num_key] = no;
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
        });
    }


});