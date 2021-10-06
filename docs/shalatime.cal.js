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
$(function() {
    var all_travel_cost_table;
    // 2点間の値段を書いたcsvファイルをダウンロードします
    $.get('travel_cost_table.csv', parseTravelCostTableCsv, 'text');
    function parseTravelCostTableCsv(data) {
        // 初期化
        all_travel_cost_table = {};

        let all_travel_cost_csv = $.csv.toArrays(data);
        console.log(all_travel_cost_csv);
        let end_id_list = all_travel_cost_csv[0];

        // 1行目の配列を削除
        all_travel_cost_csv.shift();

        // 2行目から出発点とテレポ代を取得する
        all_travel_cost_csv.forEach(function(start_travel_cost){
            // 1列目は出発点のid
            let start_id = start_travel_cost[0];
            // 2列目以降はテレポ代

            let travel_end_cost = {};
            for(let i = 0; i < start_travel_cost.length; i++) {
                let travel_cost = start_travel_cost[i];
                // 1行目の配列の先頭要素は空白なので2列目から取得
                if(i > 0){
                    // 特定の出発点での、到着点とテレポ代の連想配列
                    travel_end_cost = {};
                    let end_id = end_id_list[i];
                    console.log(end_id);
                    console.log(travel_cost);
                    travel_end_cost[end_id] = travel_cost;
                }
            }
            console.log(travel_end_cost);
            all_travel_cost_table[start_id] = travel_end_cost;
        });

        console.log(all_travel_cost_table);
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

    // 到着点の取得
    function getEndPoint(){
        return $('input[name=aetheryte-end]:checked').attr('id');
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
    }

    // エーテライトのリストから、ルートのStringを作る
    function toRouteString(routearr){
        let str = "";
        // とりあえずルートidを並べるだけで仮実装
        routearr.forEach(function(point){
            str = str + point + " ";
        });

        // 未実装なので、リムサからグリダニアのルートだけ返すようになっている旨を記載
        str = "未実装なのでリムサからグリダニアのルートだけ表示しています " + str;

        return str;
    }

    // ルートのidリストから、値段を計算する
    function calOrGetRouteCost(routearr){
        // とりあえず、配列の最初と最後のコスト
        let cal_start = delete_suffix(routearr[0]);
        let cal_end = delete_suffix(routearr[routearr.length - 1]);
        console.log("cal-----------------");
        console.log(cal_start);
        console.log(cal_end);
        console.log(all_travel_cost_table);
        let start_cost = all_travel_cost_table[cal_start];
        console.log(start_cost);
        let cost = start_cost[cal_end];

        return cost;
    }

    // 接尾リストにあればreplaceで空白に書き換える
    function delete_suffix(str){
        let output;
        console.log(str);
        id_suffix.forEach(function(suffix){
            console.log(suffix);
            output = str.replace(suffix, '');
            console.log(output);
        });
        return output;
    }
});