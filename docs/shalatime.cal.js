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
const id_goodvalue_suffix = '-valid';

// ファイル名
const filecsv_aetheryte_name = 'aetheryte_id_list.csv';
const filecsv_aetheryte_short_name = 'aetheryte_id_list_short.csv';
const filecsv_travel_cost_table_name = 'travel_cost_table.csv';
const filecsv_goodvalue_point_list_name = 'goodvalue_point_list.csv';
// Twitterの定型文
const twitter_str_prefix = 'https://twitter.com/intent/tweet?text=';
const twitter_str_suffix = '%20%23シャーレタイム%20https%3A%2F%2Fgelehrtecrest.github.io%2Fshalatime%2F';
// 深さを1とする
const deep_start_to_end = 1;

$(function() {
    var all_travel_cost_table;
    // 2点間の値段を書いたcsvファイルをダウンロードします
    $.get(filecsv_travel_cost_table_name, parseTravelCostTableCsv, 'text');
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
    let goodvalue_point_list;
    $.get(filecsv_goodvalue_point_list_name, parseGoodValuePointListCsv, 'text');
    function parseGoodValuePointListCsv(data) {
        // 初期化
        goodvalue_point_list = [];

        let csv = $.csv.toArrays(data);

        // 1行目の配列を削除
        csv.shift();

        // 2行目から出発点とテレポ代を取得する
        csv.forEach(function(point){
            goodvalue_point_list.push(point[1]);
        });
    }
    // 居住区などの寄り道リストのうち、有効もしくは何も設定しないidを返す
    function get_goodvalue_point_list(){
        let return_list = [];
        goodvalue_point_list.forEach(function(goodvalue_point){
            let goodvalue_id = '#' + goodvalue_point + id_goodvalue_suffix;
            if($(goodvalue_id).length){
                // 設定がある時
                if ($(goodvalue_id).prop("checked") == true) {
                    // 有効な時
                    return_list.push(goodvalue_point);
                }
            } else {
                // 設定がないときは有効とする
                return_list.push(goodvalue_point);
            }
        });
        return return_list;
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
        // 半額・無料エーテライトの設定の保持
        if(!is_create_zero_or_half_cost_list()){
            create_zero_or_half_cost_list();
        }
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
        let passlist = getPassPoints();

        // 実行
        // 巡回するルート一覧を出す
        let route_all_count = getAllRoute(start, end, passlist);
        console.log("route_all_count--------------------");
        console.log(route_all_count);
        console.log(dp_route_to_cost);
        console.log(dp_route);
        // 各ルートを巡回し、最適なルートを探す
        travelingAllRoute(route_all_count[0]);

        // 一時的に表示上出す
        routenum_cal = route_all_count[1];
        routenum_all = route_all_count[1];
        $("#routeallnum").val(routenum_all);
        $("#routenum").val(routenum_cal);
    }

    // 出発点の取得
    function getStartPoint(){
        return $('input[name=aetheryte-start]:checked').attr('id');
    }
    function getStartPointShortName(){
        return get_aetheryte_short_name(delete_suffix(getStartPoint()));
    }

    // 到着点の取得
    function getEndPoint(){
        return $('input[name=aetheryte-end]:checked').attr('id');
    }
    function getEndPointShortName(){
        return get_aetheryte_short_name(delete_suffix(getEndPoint()));
    }
    

    function getPassPoints(){
        let ids = [];
        $('input[name=aetheryte-pass]:checked').each(function(){
            ids.push($(this).attr('id'));
        });
        return ids;
    }
    function getPassPointsShortNamelist(){
        let ids = getPassPoints();
        let str_list = []
        ids.forEach(function(id){
            str_list.push(get_aetheryte_short_name(delete_suffix(id)));
        });
        return str_list;
    }
    
    // 動的計画法のコスト確保
    let dp_route_to_cost = {};
    let dp_route = {}
    function reset_dp_route_to_cost(){
        dp_route_to_cost = {}
        dp_route = {};
    }
    function set_dp_route_to_cost(list, cost){
        let key = get_dp_key(list);
        dp_route_to_cost[key] = cost;
    }
    function set_dp_route_to_route(list, route){
        let key = get_dp_key(list);
        dp_route[key] = route;
    }
    function get_dp_route_to_cost(list){
        let key = get_dp_key(list);
        return dp_route_to_cost[key];
    }
    function get_dp_route(list){
        let key = get_dp_key(list);
        return dp_route[key];
    }
    function get_dp_key(list){
        console.log("get_dp_key-------------------");
        console.log(list);
        let key = 'key-';
        // リストを辞書順にソートする
        list.sort();
        list.forEach(function(point){
            key = key + delete_suffix(point);
        });
        return key;
    }

    // 入力から最適なルートを計算する
    function getAllRoute(start, end, passlist){
        let route_list = [];
        // 動的計画法の表をリセット
        reset_dp_route_to_cost();

        // 通過点のリストから1つ取り、現在点から通過点の最安ルートを探す
        let route_count = sub_getAllRoute(start, end, passlist, [start]);
        // 一巡のルートからdpを検索し、ルートを求める
        let key_route = passlist.concat(start, end);
        console.log("-------------------------------------------");
        console.log(dp_route_to_cost);
        console.log(dp_route);
        console.log(route_count);
        console.log(passlist);
        console.log(key_route);
        route_list = get_dp_route(key_route);
        return [route_list, route_count[1]];
    }

    // 通過点のリストから1つ取り、現在点から通過点の最安ルートを探す
    // passlistが空白の時、startからendへの最安ルートを求める
    function sub_getAllRoute(start, end, passlist, passedlist){
        if(passlist.length <= 0){
            // dp上に計算した値があったら
            let cost = get_dp_route_to_cost([start, end]);
            if(cost !== undefined){
                // そのまま返す
                return [[start, end], 0, cost];
            } else {
                // なければ、計算する
                let route_count_cost = getBest2PointRoute(start, end);
                // dpに入れる
                console.log("set_dp_route_to_cost test1---------------");
                console.log([start, end]);
                console.log(route_count_cost);
                set_dp_route_to_cost([start, end], route_count_cost[2]);
                return route_count_cost;
            }
        }
        // 通過点リストが空じゃない場合
        // 通過点リストを確保しておく
        let tmp_passlist = passlist;

        // 返り値のルートとコストの確保
        let return_cost = -1;
        let return_route = [];
        let return_count = 0;
        // startからpasslistを通ってendに向かうルートの値のキー
        let key_start_passlist_end = [start].concat(passlist, end); 

        console.log("------------------------");
        console.log(passlist);
        // 通過点リストから1つ取り出す
        passlist.forEach(function(pass){
            console.log(pass);
            // まず、通過した点とpassの値まで通過したところまでの最安ルート・コストを計算する
            let start_to_pass_cost;
            let start_to_pass_route;
            let start_to_pass_count;

            // 既に通過した点リストを確保しておく
            let tmp_passedlist = passedlist;
            // 既に通過した点リストにpassを追加する
            tmp_passedlist.push(pass);
            // 通過点リストから、選ばれていない通過点をまとめたリストを作る
            let remaining_passlist = [];
            tmp_passlist.forEach(function(tmp_pass){
                if(pass != tmp_pass){
                    remaining_passlist.push(tmp_pass);
                }
            });
                
            let dp_cost = get_dp_route_to_cost(tmp_passedlist);
            if(dp_cost !== undefined){
                // dp上に既に通過点がある場合
                // dp上にある値がstartからpassまでのコストとルートになる

                // 計算は0
                start_to_pass_count = 0;
                // ルートはdpから
                start_to_pass_route = get_dp_route(tmp_passedlist);
                // コストもdpから
                start_to_pass_cost = dp_cost;
            } else {
                // dp上にまだ通過点がない場合

                // startとpassのコストを計算する
                let dp_cost_start_to_pass = get_dp_route_to_cost([start, pass]);
                let tmp_cost;
                let tmp_route;
                let tmp_count;
                if(dp_cost_start_to_pass !== undefined){
                    // dpに入っている場合
                    tmp_count = 0;
                    tmp_route = get_dp_route([start, pass]);
                    tmp_cost = dp_cost_start_to_pass;
                } else {
                    // dpに入っていない場合
                    let start_to_pass_route_count_cost = getBest2PointRoute(start, pass);
                    tmp_cost = start_to_pass_route_count_cost[2];
                    tmp_route = start_to_pass_route_count_cost[0];
                    tmp_count = start_to_pass_route_count_cost[1];
                    // dpに入れる
                    console.log("set_dp_route_to_cost test2---------------");
                    console.log([start, pass]);
                    console.log(tmp_cost);
                    console.log(tmp_route);
                    set_dp_route_to_cost([start, pass], tmp_cost);
                    set_dp_route_to_route([start, pass], tmp_route);
                }
            }

            // 次に、passからendまでの最安ルート・コストを計算する
            let pass_to_end_list = passlist.concat(end);
            let dp_cost_pass_to_end = get_dp_route_to_cost(pass_to_end_list);
            let pass_to_end_route_count_cost;
            if(dp_cost_pass_to_end !== undefined){
                // dpにある場合
                pass_to_end_route_count_cost = [get_dp_route(pass_to_end_list), 0, dp_cost_pass_to_end];
            } else {
                // dpにない場合
                pass_to_end_route_count_cost = sub_getAllRoute(pass, end, remaining_passlist, tmp_passedlist);
            }

            // startからpasslistを通ってendに向かうルートの値を取得
            console.log("return_cost-----------------");
            console.log(start_to_pass_cost);
            console.log(pass_to_end_route_count_cost);
            if(return_cost < 0){
                return_cost = start_to_pass_cost + pass_to_end_route_count_cost[2];
                return_route = start_to_pass_route.concat(pass_to_end_route_count_cost[0]);
            } else {
                if(return_cost > start_to_pass_cost + pass_to_end_route_count_cost[2]){
                    return_cost = start_to_pass_cost + pass_to_end_route_count_cost[2];
                    return_route = start_to_pass_route.concat(pass_to_end_route_count_cost[0]);
                }
            }
            // 計算した数の追加
            return_count = return_count + start_to_pass_count + pass_to_end_route_count_cost[1];
        });
        // dpを更新
        console.log("set_dp_route_to_cost test3---------------");
        console.log(key_start_passlist_end);
        console.log(return_cost);
        set_dp_route_to_cost(key_start_passlist_end, return_cost);
        set_dp_route_to_route(key_start_passlist_end, return_route);
        return [return_route, return_count, return_cost];
    }

    // 2点間での移動でベストなルートを検索する
    // 返り値: [ルートのリスト、検索個数、必要なギル]
    function getBest2PointRoute(start, end){
        // 無料エーテライトを立ち寄るなら2点間の間の最初のエーテライト
        // 先に無料エーテライトに立ち寄るルートを考える
        let cost_with_zero = -1;
        let route_with_zero = [];
        let route = [];

        // 無料以外で立ち寄るところは、安いところだけ
        let passing_point_list = half_point_list.concat(get_goodvalue_point_list());
        // 無料に立ち寄るとしたら１箇所だけ
        zero_point_list.forEach(function(zero_point){
            let cost_and_route = getBest2PointRouteWithoutZero(zero_point, end, passing_point_list);
            let cost = cost_and_route[0];
            if(cost_with_zero < 0){
                cost_with_zero = cost;
                route = cost_and_route[1];
            } else {
                if(cost_with_zero > cost){
                    cost_with_zero = cost;
                    route = cost_and_route[1];
                }
            }
        });
        // 先頭にスタートを入れる
        if(route != []){
            route_with_zero = route;
            route_with_zero.unshift(start);
        }

        // 無料エーテライトに立ち寄らないなら、半額エーテライト・居住区から選ぶ
        let cost_and_route_without_zero = getBest2PointRouteWithoutZero(start, end, passing_point_list, deep_start_to_end, 0);
        let cost_without_zero = cost_and_route_without_zero[0];
        let route_without_zero = cost_and_route_without_zero[1];
        let count = cost_and_route_without_zero[2];
        if(cost_with_zero < 0){
            return [route_without_zero, count, cost_without_zero];
        } else {
            if(cost_with_zero > cost_without_zero){
                return [route_without_zero, count, cost_without_zero];
            }
        }
        return [route_with_zero, count, cost_with_zero];
    }

    function getBest2PointRouteWithoutZero(start, end, point_list, deep, count){
        count++;
        // point_listから選ばない場合
        let tmp_cost_without_point = calOrGetRouteCost([start, end]);

        // point_listから選ぶ場合
        let tmp_cost = -1;
        let tmp_route = [];
        // deepが0以下なら飛ばす
        if(deep > 0){
            deep--;
            point_list.forEach(function(point){
                tmp_point_list = delete_point_list_in_point(point_list, point);
                let return_start_to_point_cost = calOrGetRouteCost([start, point]);
                let return_point_to_end_cost_and_route = getBest2PointRouteWithoutZero(point, end, tmp_point_list, deep, count);
                let return_start_to_point_to_end_cost = return_start_to_point_cost + return_point_to_end_cost_and_route[0];
                let return_route = return_point_to_end_cost_and_route[1];
                count = count + return_point_to_end_cost_and_route[2];
                return_route.unshift(start)
                if(tmp_cost < 0){
                    tmp_route = return_route;
                    tmp_cost = return_start_to_point_to_end_cost;
                } else {
                    if(tmp_cost > return_start_to_point_to_end_cost){
                        tmp_route = return_route;
                        tmp_cost = return_start_to_point_to_end_cost;
                    }
                }
            });
        }
        // pointリストから選ばない方がコストが少ない場合
        if(tmp_cost < 0 || tmp_cost_without_point < tmp_cost){
            return [tmp_cost_without_point, [start, end], count];
        }
        // pointリストから選んだほうがコストが少ない場合
        return [tmp_cost, tmp_route, count];
    }

    // 配列から、含まれている要素を削除する
    function delete_point_list_in_point(point_list, delete_point){
        let return_list = [];
        point_list.forEach(function(point){
            if(delete_point != point){
                return_list.push(point);
            }
        });
        return return_list;
    }

    // 各ルートを巡回し、最適なルートを探す
    function travelingAllRoute(route_all){
        console.log("traveling-------------");
        console.log(route_all);
        // 全ルート数
        routenum_all = route_all.length;
        // 計算したルート数
        routenum_cal = 1;

        // 現在は一つのルートだけ
        let route = route_all[0];
        let route_best_list = route;
        // エーテライトのリストから、ルートのStringを作る
        route_str = toRouteString(route);
        // 現在最安ルートとして確認しているルート
        route_best = route_str;
        // 現在の最安ルートのギル
        route_best_gil = calOrGetRouteCost(route);

        // 表示
        show_travel_var();

        // Twitter文章設定
        set_tweet_text(toRouteShortString(route_best_list), route_best_gil);
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
    // エーテライトのリストから、ルートのStringを作る
    function toRouteShortString(routearr){
        let str = "";
        // とりあえずルートidを並べるだけで仮実装
        // 2つ目以降のエーテライトが無料・半額の場合はその旨も記載
        routearr.forEach(function(point){
            if(str == ""){
                str = get_aetheryte_name(point);
            } else {
                str = str + " → " + get_aetheryte_short_name(point) + get_zero_or_half_name(point);
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
    const zero_suffix = '-free';
    const half_suffix = '-half';
    $('input').change(function() {
        create_zero_or_half_cost_list();
    });
    // リストが両方とも空配列の場合は、リストが作られていないと判断する
    function is_create_zero_or_half_cost_list(){
        if(zero_point_list.length == 0 && half_point_list.length == 0){
            return false;
        }
        return true;
    }
    function create_zero_or_half_cost_list(){
        // 初期化しておく
        zero_point_list = [];
        half_point_list = [];
        $('input[name=aetheryte-setting]:checked').each(function(){
            let id = $(this).attr('id');
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
    }

    // 無料・半額のチェックコスト
    function zero_or_half_cost(raw_cost, point){
        // 無料に含まれていたら
        if (zero_point_list.indexOf(point) !== -1) {
            return 0;
        }
        // 半額に含まれていたら
        else if (half_point_list.indexOf(point) !== -1) {
            let raw_cost_float = parseFloat(raw_cost);
            // 割り引いたあと、小数点切り捨て
            return Math.floor(raw_cost_float * 0.5);
        }

        return raw_cost;
    }

    // 無料・半額のチェックネーム
    function get_zero_or_half_name(point){
        let key = delete_suffix(point);
        // 無料に含まれていたら
        if (zero_point_list.indexOf(key) !== -1) {
            return ':無料';
        }
        // 半額に含まれていたら
        else if (half_point_list.indexOf(key) !== -1) {
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
    let aetheryte_short_name_list = {};
    function parseCsv(data) {
        let csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();
    
        $(csv).each(function(i) {
            set_aetheryte_name(this[1].toString(), this[2].toString());
        });
    }
    $.get(filecsv_aetheryte_name, parseCsv, 'text');
    function parseShortCsv(data) {
        let csv = $.csv.toArrays(data);

        //一行目は見出しなので削除
        csv.shift();
    
        $(csv).each(function(i) {
            set_aetheryte_short_name(this[1].toString(), this[2].toString());
        });
    }
    $.get(filecsv_aetheryte_short_name, parseShortCsv, 'text');

    function set_aetheryte_name(id, name){
        // とりあえず日本語
        aetheryte_name_list[id] = name;
    }
    function set_aetheryte_short_name(id, name){
        // とりあえず日本語
        aetheryte_short_name_list[id] = name;
    }
    function get_aetheryte_name(id){
        let key = delete_suffix(id);
        return aetheryte_name_list[key];
    }
    function get_aetheryte_short_name(id){
        let key = delete_suffix(id);
        return aetheryte_short_name_list[key];
    }

    const route_max_length = 80;
    function set_tweet_text(route, gil){
        let str_short;

        // 出発点の取得
        let start_point_name = getStartPointShortName();
        // 到着点の取得
        let end_point_name = getEndPointShortName();
        // 通過点の取得
        let pass_point_names = getPassPointsShortNamelist();

        
        // ルートの設定値チェック
        let pass_point_str = "";
        pass_point_names.forEach(function(point){
            if(pass_point_str==""){
                pass_point_str = point;
            } else {
                pass_point_str = pass_point_str + ', ' + point;
            }

        });
        
        str_short = `出発:${start_point_name} 到着:${end_point_name} 通過点:[${pass_point_str}] の最安ルートは `; 

        // ルートの文字列の長さが規定数超えていたら、後ろを削除する
        str_short = str_short + route;
        if(route.length > route_max_length){
            str_short = route.substr(0, route_max_length) + '... ';
        }

        // 割引チェック
        let discount = parseFloat($('input[name=telepo-discount-setting]:checked').attr('value')) * 100;
        let str = str_short + " (" + gil + "g " + discount + "%割引)です";
        let encode_str = encodeURI(str);
        let text = twitter_str_prefix + encode_str + twitter_str_suffix;
        $('#resulttweet').attr('href', text);
    }
});