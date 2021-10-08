/*
const id_suffix = [
    '-start',
    '-end',
    '-pass',
    '-free',
    '-half',
    '-homepoint',
];
*/

// ファイル名
const filecsv_aetheryte_name = 'aetheryte_id_list.csv';

// Twitterの定型文
const twitter_str_prefix = 'https://twitter.com/intent/tweet?text=';
const twitter_str_suffix = '%20%23シャーレタイム%20https%3A%2F%2Fgelehrtecrest.github.io%2Fshalatime%2F';

$(function() {
    var all_travel_cost_table;
    // 2点間の値段を書いたcsvファイルをダウンロードします
    $.get('travel_cost_table.csv', parseTravelCostTableCsv, 'text');
    function parseTravelCostTableCsv(data) {
        // 初期化
        all_travel_cost_table = {};

        let all_travel_cost_csv = $.csv.toArrays(data);
        let start_id_list = all_travel_cost_csv[0];

        // 1行目の配列を削除
        all_travel_cost_csv.shift();

        // 2行目から出発点とテレポ代を取得する
        all_travel_cost_csv.forEach(function(end_travel_cost){
            // 1列目は到着点のid
            let end_id = end_travel_cost[0];
            // 2列目以降はテレポ代

            let travel_end_cost = {};
            for(let i = 0; i < end_travel_cost.length; i++) {
                let travel_cost = end_travel_cost[i];
                // 1行目の配列の先頭要素は空白なので2列目から取得
                if(i > 0){
                    // 特定の到着点での、出発点とテレポ代の連想配列
                    let start_id = start_id_list[i];
                    // 念の為に初期化
                    if(all_travel_cost_table[start_id] === undefined){
                        all_travel_cost_table[start_id] = {};
                    }
                    all_travel_cost_table[start_id][end_id] = travel_cost;
                }
            }
        });
    }

    // 計算ボタン
    $('#buttoncal').on('click', function() {
        // 巡回セールスマン問題を解きます
        travelingHikasen(all_travel_cost_table);
    });

    // main
    // 定義
    // 全ルート数
    var routenum_all = 0;
    // 計算したルート数
    var routenum_cal = 0;
    // 現在確認しているルート
    var route_str = "";
    // 現在最安ルートとして確認しているルート
    var route_best = "";
    // 現在最安ルートとして確認しているルートの必要なギル
    var route_best_gil = 0;

    function var_reset(){
        routenum_all = 0;
        routenum_cal = 0;
        route_str = "";
        route_best = "";
        route_best_gil = 0;
    }

    function show_travel_var(){
        // 想定されるルート数の合計
        $("#routeallnum").val(routenum_all);
        // 現在計算したルート数
        $("#routenum").val(routenum_cal);
        // 確認しているルート
        $("#checkroute").val(route_str);
        // 現在計算済みの最安ルート
        $("#goodroute").val(route_best);
        // 必要なギル
        $("#telepogil").val(route_best_gil);
        // 結果：最安ルート
        $("#bestroute").val(route_best);
    }

    // csvから2点間の値段を出す配列 travel_cost_table
    function travelingHikasen(travel_cost_table){
        // 定義のリセット
        var_reset();
        // 表示
        show_travel_var();

        // 出発点の取得
        let start = getStartPoint();
        // 出発点が未定義ならエラー
        if (start === undefined){
            alert("出発点を設定してください");
            return;
        }
        // 到着点の取得
        let end = getEndPoint();
        // 出発点が未定義ならエラー
        if (end === undefined){
            alert("到着点を設定してください");
            return;
        }
        // 通過点の取得
        // 現在未実装
        let passlist = [];

        // 実行
        // 巡回するルート一覧を出す
        let route_all = getAllRoute(start, end, passlist);
        // 各ルートを巡回し、最適なルートを探す
        travelingAllRoute(route_all);
    }


    // 出発点の取得
    function getStartPoint(){
        return $('input[name=aetheryte-start]:checked').attr('id');
    }
    function getStartPointName(){
        return get_aetheryte_name(delete_suffix(getStartPoint()));
    }

    // 到着点の取得
    function getEndPoint(){
        return $('input[name=aetheryte-end]:checked').attr('id');
    }
    function getEndPointName(){
        return get_aetheryte_name(delete_suffix(getEndPoint()));
    }
    
    // 到着点の取得
    function getPassPoints(){
        let ids = [];
        $('input[name=aetheryte-pass]:checked').each(function(){
            ids.push($(this).attr('id'));
        });
        return ids;
    }
    function getPassPointsNamelist(){
        let ids = getPassPoints();
        let str_list = []
        console.log(ids);
        ids.forEach(function(id){
            str_list.push(get_aetheryte_name(delete_suffix(id)));
        });
        return str_list;
    }
    
    // 入力から最適なルートを計算する
    function getAllRoute(start, end, passlist){
        let route_list = [];
        // 現在はstartからendへの直通ルートだけ実装
        let route = [start, end];
        route_list.push(route);
        return route_list;
    }

    // 各ルートを巡回し、最適なルートを探す
    function travelingAllRoute(route_all){
        // 全ルート数
        routenum_all = route_all.length;
        // 計算したルート数
        routenum_cal = 1;

        // 現在は一つのルートだけ
        let route = route_all[0];
        // エーテライトのリストから、ルートのStringを作る
        route_str = toRouteString(route);
        // 現在最安ルートとして確認しているルート
        route_best = route_str;
        // 現在の最安ルートのギル
        route_best_gil = calOrGetRouteCost(route);

        // 表示
        show_travel_var();

        // Twitter文章設定
        set_tweet_text(route_best, route_best_gil);
    }

    // エーテライトのリストから、ルートのStringを作る
    function toRouteString(routearr){
        let str = "";
        // とりあえずルートidを並べるだけで仮実装
        // 2つ目以降のエーテライトが無料・半額の場合はその旨も記載
        routearr.forEach(function(point){
            if(str == ""){
                str = get_aetheryte_name(point);
            } else {
                str = str + " → " + get_aetheryte_name(point) + get_zero_or_half_name(point);
            }
        });

        return str;
    }
    

    // ルートのidリストから、値段を計算する
    function calOrGetRouteCost(routearr){
        // 配列から先頭2つ取り出して、2つのテーブルを計算
        // 先頭2つ目のエーテライトが無料・半額の場合は、別途計算する
        let cost = 0;
        for(let i = 0; i< routearr.length - 1; i++){
            let cal_start = delete_suffix(routearr[i]);
            let cal_end = delete_suffix(routearr[i+1]);
            let start_cost = all_travel_cost_table[cal_start];
            let raw_cost = start_cost[cal_end];

            // 無料・半額のチェック
            let point_discount_cost = zero_or_half_cost(raw_cost, cal_end);
            // テレポ割引
            cost = cost + discount_cost(point_discount_cost);

        }

        return cost;
    }

    // 無料・半額エーテライトの格納
    let zero_point_list = [];
    let half_point_list = [];
    const zero_suffix = '-half';
    const half_suffix = '-zero';
    $('input').change(function() {
        $('input[name=aetheryte-setting]:checked').each(function(){
            let id = $(this).attr('id');
            console.log(id);
            // 無料エーテライトの場合
            if (id.indexOf(zero_suffix) != -1) {
                // 接尾辞を抜いて、idを保存
                zero_point_list.push(delete_suffix(id));
            }
            // 半額エーテライトの場合
            else if (id.indexOf(half_suffix) != -1) {
                // 接尾辞を抜いて、idを保存
                half_point_list.push(delete_suffix(id));
            }
        });
    });

    // 無料・半額のチェックコスト
    function zero_or_half_cost(raw_cost, point){
        // 無料に含まれていたら
        if (zero_point_list.indexOf(point) !== -1) {
            return 0;
        }
        // 半額に含まれていたら
        else if (zero_point_list.indexOf(point) !== -1) {
            let raw_cost_float = parseFloat(raw_cost);
            // 割り引いたあと、小数点切り捨て
            return Math.floor(raw_cost_float * 0.5);
        }

        return raw_cost;
    }

    // 無料・半額のチェックネーム
    function get_zero_or_half_name(point){
        // 無料に含まれていたら
        if (zero_point_list.indexOf(point) !== -1) {
            return ':無料';
        }
        // 半額に含まれていたら
        else if (zero_point_list.indexOf(point) !== -1) {
            return ':半額'
        }
        return '';
    }



    // 割引計算
    function discount_cost(cost){
        cost_float = parseFloat(cost);
        let discount = $('input[name=telepo-discount-setting]:checked').attr('value');
        if(discount === undefined){
            return cost_float;
        }
        let discount_float = parseFloat(discount);
        // 割り引いたあと、小数点切り捨て
        cost_float = Math.floor(cost_float * (1 - discount_float));
        return cost_float;
    }

    // 接尾リストにあればreplaceで空白に書き換える
    function delete_suffix(str){
        id_suffix.forEach(function(suffix){
            str = str.replace(suffix, '');
        });
        return str;
    }

    // テレポ先の設定
    let aetheryte_name_list = {};
    function parseCsv(data) {
        let csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();
    
        $(csv).each(function(i) {
            set_aetheryte_name(this[1].toString(), this[2].toString());
        });
    }
    $.get(filecsv_aetheryte_name, parseCsv, 'text');

    function set_aetheryte_name(id, name){
        // とりあえず日本語
        aetheryte_name_list[id] = name;
    }
    function get_aetheryte_name(id){
        let key = delete_suffix(id);
        return aetheryte_name_list[key];
    }

    const route_max_length = 80;
    function set_tweet_text(route, gil){
        let str_short;

        // 出発点の取得
        let start_point_name = getStartPointName();
        // 到着点の取得
        let end_point_name = getEndPointName();
        // 通過点の取得
        let pass_point_names = getPassPointsNamelist();

        
        // ルートの設定値チェック
        let pass_point_str = "";
        pass_point_names.forEach(function(point){
            if(pass_point_str==""){
                pass_point_str = point;
            } else {
                pass_point_str = pass_point_str + ',' + point;
            }

        });
        
        str_short = '出発点:' + start_point_name + '到着点:' + end_point_name + '通過点:' + pass_point_str + ' の最安ルートは '; 

        // ルートの文字列の長さが規定数超えていたら、後ろを削除する
        str_short = str_short + route;
        if(route.length > route_max_length){
            str_short = route.substr(0, route_max_length) + '... ';
        }

        // 割引チェック
        let discount = parseFloat($('input[name=telepo-discount-setting]:checked').attr('value')) * 100;
        let str = str_short + " (" + gil + "g " + discount + "%割引)";
        let encode_str = encodeURI(str);
        let text = twitter_str_prefix + encode_str + twitter_str_suffix;
        $('#resulttweet').attr('href', text);
    }
});