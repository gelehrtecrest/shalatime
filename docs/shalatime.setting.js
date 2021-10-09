const id_suffix = [
    '-start',
    '-end',
    '-pass',
    '-free',
    '-half',
    '-homepoint',
    '-valid',
];

const id_suffix_start_end_pass = [
    '-start',
    '-end',
    '-pass',
];

const yes = "YES";
const no = "NO";

// ファイル名
const filecsv_aetheryte = 'aetheryte_id_list.csv';
const filecsv_setting = 'setting_id_list.csv';

$(function() {

    // localStorageから情報を取得する。
    // CSVファイルからidを取得

    // テレポ先の設定
    function parseCsv(data) {
        let csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();

        $(csv).each(function(i) {
            local_storage_get(this[1].toString());
        });
    }
    $.get(filecsv_aetheryte, parseCsv, 'text');

    // UIの設定
    function parseSettingCsv(data) {
        let csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();

        $(csv).each(function(i) {
            local_storage_setting_get(this[1].toString());
        });
    }
    $.get(filecsv_setting, parseSettingCsv, 'text');

    // localStorageからデータ取得
    function local_storage_get(str){
        $.each(id_suffix, function(_, value) {
            let key = str + value;
            let local_storage_data = localStorage.getItem(key);
            set_value(key, local_storage_data);
        });
    }
    function local_storage_setting_get(key){
        let local_storage_data = localStorage.getItem(key);
        set_value(key, local_storage_data);
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


    // 出発・到着・通過点の設定を消す
    $('#buttoncheckreset-start-end-pass').on('click', function() {
        // 設定を削除する
        $.get(filecsv_aetheryte, resetStartEndPassCsv, 'text');
        // その後、localStorageに格納する
        local_storage_function();
    });
    function resetStartEndPassCsv(data) {
        let csv = $.csv.toArrays(data);
        //一行目は見出しなので削除
        csv.shift();
        $(csv).each(function(i) {
            let id = this[1].toString();
            id_suffix_start_end_pass.forEach(function(suffix){
                $('#' + id + suffix).prop('checked', false);
            });
        });
    }

    // localStorageに情報を格納する
    $('input').change(function() {
        local_storage_function()
    });
    function local_storage_function() {
        if ($("#setting_local_storage").prop("checked") == true) {
            local_storage_all_set();
        } else {
            localStorage.clear();
        }
    }

    // localStorageに情報を格納
    function local_storage_all_set(){
        // テレポ先の設定
        $.get(filecsv_aetheryte, setparseCsv, 'text');
        // 設定
        $.get(filecsv_setting, setparseSettingCsv, 'text');
    }
    function setparseCsv(data) {
        let csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();
        set_data = new Object();
        $(csv).each(function(i) {
            local_storage_set(this[1].toString());
        });
    }
    function setparseSettingCsv(data) {
        let csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();
        set_data = new Object();
        $(csv).each(function(i) {
            local_storage_setting_set(this[1].toString());
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
        });    
    }
    function local_storage_setting_set(key){
        if ($('#' + key).prop("checked") == true) {
            localStorage.setItem(key, yes);
        } else {
            localStorage.setItem(key, no);
        }
    }
});