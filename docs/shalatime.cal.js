$(function() {
    var all_travel_cost_table;
    // 2点間の値段を書いたcsvファイルをダウンロードします
    $.get('travel_cost_table.csv', parseTravelCostTableCsv, 'text');
    function parseTravelCostTableCsv(data) {
        all_travel_cost_table = $.csv.toArrays(data);
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
        // 未実装　とりあえずリムサのidを返す
        return "aetheryte-limsa";
    }

    // 到着点の取得
    function getEndPoint(){
        // 未実装　とりあえずグリダニアのidを返す
        return "aetheryte-gridania";
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
        // 未実装　とりあえず0ギルとする
        return 0;
    }
});