const filecsv_keyword_tab_table = 'keyword_tab_table.csv';


$(function() {
    let keyword_id = {};
    let keyword_tab = {};
    let key_list = [];

    function searchWord(){
        //
        let searchText = $('#search-text').val();
        let searchResult = [];
        let searchResult_id = [];
        // 検索ボックスに値が入ってる場合
        if (searchText != '') {
            key_list.forEach(function(key){
                if(key.indexOf(searchText) != -1){
                    // 検索キーワードとkeyが部分一致している場合
                    let flag = false;
                    searchResult.forEach(function(result){
                        if(key == result){
                            flag = true;
                        }
                    })
                    if(!flag){
                        searchResult.push(keyword_tab[key]);
                        searchResult_id.push(keyword_id[key]);
                    }
                }
            });
        }

        // searchResultが0の場合
        if(searchResult.length <= 0){
            colorNav(['']);
            if(searchText ==''){
                searchInfo('検索できます');
            } else {
                searchInfo('検索で見つかりませんでした。キーワードを変えてみてください');
            }
        } else if(searchResult.length == 1){
            searchInfo('以下のタブが見つかりました');
            showTab(searchResult[0]);
            colorNav(searchResult_id);
        } else {
            searchInfo('検索で複数のタブが見つかりましたので、その1つを表示します');
            showTab(searchResult[0]);
            colorNav(searchResult_id);
        }
    };

    function searchInfo(message){
        $('#searchInfo').text(message);
    }

    function colorNav(ids){
        // リセット
        key_list.forEach(function(keyword){
            let tmp_ids = keyword_id[keyword];
            let tmp_id_list = tmp_ids.split('/');
            tmp_id_list.forEach(function(tmp_id){
                let tmp = $("#" + tmp_id);
                if(tmp !== undefined){
                    tmp.removeClass("bg-warning");
                }
            });
        });

        // 色をつける
        key_list.forEach(function(keyword){
            ids.forEach(function(ids_str){
                let tmp_ids = keyword_id[keyword];
                let tmp_id_list = tmp_ids.split('/');
                tmp_id_list.forEach(function(tmp_id){
                    let tmp = $("#" + tmp_id);
                    if(tmp !== undefined){
                        let id_list = ids_str.split('/');
                        id_list.forEach(function(id){
                            if(id == tmp_id){
                                tmp.addClass("bg-warning");
                            }
                        });
                    }
                });
            });
        });
    }

    function showTab(tab){
        $(".tab-pane").each(function(){
            // すべてのタブからactiveを消す
            $(this).removeClass('active')
            // タブからshowを消す
            $(this).removeClass("show");
        });

        // 新しく表示されるtabにactiveをつける
        $('#' + tab).addClass("active");
        // 新しく表示されるtabにactiveをつける
        $('#' + tab).addClass("show");
    }

    // 
    $.get(filecsv_keyword_tab_table, parseKeywordTabTableCsv, 'text');
    function parseKeywordTabTableCsv(data) {
        // 初期化
        keyword_id = {};
        keyword_tab = {};
        key_list = [];

        let keyword_tab_csv = $.csv.toArrays(data);

        // 1行目の配列を削除
        keyword_tab_csv.shift();

        // 2行目から出発点とテレポ代を取得する
        keyword_tab_csv.forEach(function(item){
            // 2列目はid
            let id = item[1];
            // 3列目はtabのリスト
            let tab = item[2];
            // 4列目は検索キーワード(日本語)
            let keyword = item[3];
            // 5列名は金策キーワード(英語)
            let keyword_en = item[4];

            keyword_id[keyword] = id;
            keyword_id[keyword_en] = id;
            keyword_tab[keyword] = tab;
            keyword_tab[keyword_en] = tab;
            key_list.push(keyword);
            key_list.push(keyword_en);
        });
    }

       
    // searchWordの実行
    $('#search-text').on('input', searchWord);
});