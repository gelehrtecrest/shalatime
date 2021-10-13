const filecsv_keyword_tab_table = 'keyword_tab_table.csv';


$(function() {
    let keyword_tab = {};
    let key_list = [];

    function searchWord(){
        //
        let searchText = $('#search-text').val();
        let searchResult = [];
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
                        searchResult.push(key);
                    }
                }
            });
        }

        // searchResultが0の場合
        if(searchResult.length <= 0){
            if(searchText ==''){
                searchInfo('');
            } else {
                searchInfo('検索で見つかりませんでした。キーワードを変えてみてください');
            }
        } else if(searchResult.length == 1){
            searchInfo('以下のタブが見つかりました');
            showTab(searchResult[0]);
        } else {
            searchInfo('検索で複数のタブが見つかりました。もう少し絞り込んでください。')
        }
    };

    function searchInfo(message){
        $('#searchInfo').text(message);
    }

    function showTab(tab){
        // 現在アクティブなタブからactiveを消す
        let remove_id = $(".active").attr('id');
        $('#' + remove_id).removeClass('active')
        // 現在表示されているタブからshowを消す
        $('#' + remove_id).removeClass("show");

        // 新しく表示されるtabにactiveをつける
        console.log(tab);
        $('#' + tab).addClass("active");
        // 新しく表示されるtabにactiveをつける
        $('#' + tab).addClass("show");
    }

    // 
    $.get(filecsv_keyword_tab_table, parseKeywordTabTableCsv, 'text');
    function parseKeywordTabTableCsv(data) {
        // 初期化
        keyword_tab = {};
        key_list = [];

        let keyword_tab_csv = $.csv.toArrays(data);

        // 1行目の配列を削除
        keyword_tab_csv.shift();

        // 2行目から出発点とテレポ代を取得する
        keyword_tab_csv.forEach(function(item){
            // 3列目はtabのリスト
            let tab = item[2];
            // 4列目は検索キーワード(日本語)
            let keyword = item[3];
            // 5列名は金策キーワード(英語)
            let keyword_en = item[4];

            keyword_tab[keyword] = tab;
            keyword_tab[keyword_en] = tab;
            key_list.push(keyword);
            key_list.push(keyword_en);
        });
    }

       
    // searchWordの実行
    $('#search-text').on('input', searchWord);
});