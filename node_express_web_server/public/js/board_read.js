$(function check_reply_confirm() {


    comment_list();
    $('#comment_submit').click(function () {
        var comment_content = $('#comment_content').val();
        if (comment_contents.trim() == "") {
            alert('내용을 입력해주세요');
            return false;
        }
    });
    $('form').submit(function () {
        var urls = document.getElementById("board_position").href;
        var user_name = document.getElementById("user_names").innerText;
        var comment_data = $('#comment_contents').val();
        var board_idx = document.getElementById("board_idx").innerText;
        urls = urls.substring(urls.lastIndexOf("/"));
        var data = {};
        data.user_name = user_name;
        data.comment_data = comment_data;
        data.idx = board_idx;
        comment_insert(urls, data);
        $('#comment_content').val("");
        return false;
    });
});

function comment_insert(urls, data) {
    $.ajax({
        url: '/open_home' + urls + '/comment/insert',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data) {
            $('#comment_contents').val("");
            alert("등록 완료!");
            comment_list();
        }
    });

}

function comment_list() {
    var urls = document.getElementById("board_position").href;
    var board_idx = document.getElementById("board_idx").innerText;
    urls = urls.substring(urls.lastIndexOf("/"));

    var data = {};
    data.idx = board_idx;

    $.ajax({

        url: '/open_home' + urls + '/comment/list',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data) {
            if (data.length >= 1) {
                var html_data = "<table>";
                $.each(data, function (key, value) {
                    html_data += "<div><p>" + value.name + " " + value.text + "</p></div>";
                });
                $('#comment_list').html(html_data);
            }
        }
    });
}
