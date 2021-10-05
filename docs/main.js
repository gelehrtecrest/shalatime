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

    // localStorageから情報を取得する。
    // CSVファイルからidを取得

    function parseCsv(data) {
        var csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();

        $(csv).each(function(i) {
            local_storage_get(this[1].toString());
        });
    }
    $.get('aetheryte_id_list.csv', parseCsv, 'text');

    // localStorageからデータ取得
    function local_storage_get(str){
        $.each(id_suffix, function(_, value) {
            var key = str + value;
            var local_storage_data = localStorage.getItem(key);
            console.log("get-------------------------");
            console.log(key);
            console.log(local_storage_data);
            set_value(key, local_storage_data);
        });
    }

    // 取得したデータからinputに反映
    function set_value(key, local_storage_data){
        // localStorage読み込むタイミングで、undefinedになったら処理をとばす
        if (local_storage_data === undefined){
            return;
        }

        if(local_storage_data == yes){
            $('#' + key).prop("checked", true);
        } else {
            $('#' + key).prop("checked", false);
        }
    }


    // localStorageに情報を格納する
    $('input').change(function() {
        if ($("#settinglocal_storage").prop("checked") == true) {
            local_storage_all_set();
        } else {
            local_storage_all_delete();
        }
    });

    // localStorageに情報を格納
    function local_storage_all_set(){
        $.get('aetheryte_id_list.csv', setparseCsv, 'text');
    }
    function setparseCsv(data) {
        var csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();
        set_data = new Object();
        $(csv).each(function(i) {
            local_storage_set(this[1].toString());
        });
    }
    function local_storage_set(str){
        
        $.each(id_suffix, function(_, value) {
            var key = str + value;
            if ($('#' + key).prop("checked") == true) {
                localStorage.setItem(key, yes);
            } else {
                localStorage.setItem(key, no);
            }

            console.log("set-------------------------");
            console.log(key);
            var local_storage_data = localStorage.getItem(key);
            console.log(local_storage_data);
        });
        
    }    

    // localStorageに情報を格納しないチェックのときには、情報を全削除する
    function local_storage_all_delete(){
        $.get('aetheryte_id_list.csv', deleteparseCsv, 'text');
    }
    function deleteparseCsv(data) {
        var csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();

        $(csv).each(function(i) {
            local_storage_delete(this[0].toString());
        });
    }
    function local_storage_delete(str){
        $.each(id_suffix, function(_, value) {
            var key = str + value;
            localStorage.removeItem(key);
        });
    }


});