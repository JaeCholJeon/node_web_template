var boolean_check_id = false;
var boolean_check_user_name = false;
var boolean_check_real_name = false;
var boolean_check_password_confirm = false;
var boolean_check_phone = false;
var boolean_check_student_id = false;
$(function duplicate_id() {
    $('#user_id').keyup(function () {
        var user_id = $('#user_id').val();
        var check_korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|/\s/]/;
        var check_special = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/;
        if (user_id == ("")) {
            $('#check_user_id').html('<p style="color:red">아이디를 입력해주세요</p>');
            boolean_check_id = false;
            return;
        } else if (check_korean.test(user_id) || check_special.test(user_id)) {
            $('#check_user_id').html('<p style="color:red">영문 / 숫자만 입력가능합니다</p>');
            boolean_check_id = false;
            return;
        } else if (user_id.length < 5) {
            $('#check_user_id').html('<p style="color:red">5자리 이상 입력해주세요</p>');
            boolean_check_id = false;
        } else if (user_id.length > 10) {
            alert('최대 10자리 입력가능합니다');
            document.getElementById("user_id").value = user_id.substring(0, 10);

            return;

        } else
            $.get('/process/checkId?id=' + $('#user_id').val(), function (result) {
                if (result.rows != null) {
                    console.dir(result)
                    $('#check_user_id').html('<p style="color:red">이미 등록된 계정</p>');
                    boolean_check_id = false;

                } else {
                    $('#check_user_id').html('<p style="color:blue">사용가능</p>');
                    boolean_check_id = true;
                }
            });
    });
});

$(function duplicate_name() {
    $('#user_name').keyup(function () {
        var user_name = $('#user_name').val();
        var check_special = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"|/\s/]/;
        if (user_name == "") {
            $('#check_user_name').html('<p style="color:red">사용자 이름을 입력해주세요</p>');
            boolean_check_user_name = false;
            return;
        } else if (check_special.test(user_name)) {
            $('#check_user_name').html('<p style="color:red">특수문자 및 공백은 사용할수 없습니다</p>');
            boolean_check_user_name = false;
            return;
        }else if(user_name.length>15){
            
        }
        else {
            $.get('/process/check_user_name?user_name=' + $('#user_name').val(), function (result) {
                if (result.rows != null) {
                    console.dir(result)
                    $('#check_user_name').html('<p style="color:red">이미 등록된 사용자 이름</p>');
                    boolean_check_user_name = false;

                } else {
                    $('#check_user_name').html('<p style="color:blue">사용가능</p>');
                    boolean_check_user_name = true;
                }
            })
        };
    });
});

$(function check_pwd() {
    $('#password_confirm').keyup(function () {
        var password = document.getElementById("password").value;
        var password_confirm = document.getElementById("password_confirm").value;
        var check_korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|/\s/]/;
        var check_special = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/;


        if (check_korean.test(password) || check_special.test(password)) {
            $('#check_password_confirm').html('<p style="color:red">영문 / 숫자만 입력가능합니다</p>');
            boolean_check_password_confirm = false;
            return;
        } else if (password_confirm.length > 15) {
            alert('패스워드는 최대 15자리까지 입력가능합니다');
            document.getElementById("password_confirm").value = password_confirm.substring(0, 15);
            return;
        } else if (password.length < 5) {
            $('#check_password_confirm').html('<p style="color:red">5자리 이상 입력해주세요</p>');
            boolean_check_password_confirm = false;
            return;
        } else if (password === password_confirm) {
            $('#check_password_confirm').html('<p style="color:blue">사용가능한 패스워드</p>');
            boolean_check_password_confirm = true;

        } else {
            $('#check_password_confirm').html('<p style="color:red">패스워드 불일치</p>');
            boolean_check_password_confirm = false;
        }
    });
    $('#password').keyup(function () {

        var password = document.getElementById("password").value;
        var password_confirm = document.getElementById("password_confirm").value;
        var check_korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|/\s/]/;
        var check_special = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/;
        if (check_korean.test(password) || check_special.test(password)) {
            $('#check_password_confirm').html('<p style="color:red">영문 / 숫자만 입력가능합니다</p>');
            boolean_check_password_confirm = false;
            return;
        }
        if (password.length < 5) {
            $('#check_password_confirm').html('<p style="color:red">5자리 패스워드를 입력해주세요</p>');
            boolean_check_password_confirm = false;
            return;
        }
        if (password.length > 15) {
            alert('패스워드는 최대 15자리까지 입력가능합니다');
            document.getElementById("password").value = password.substring(0, 15);
            return;
        }
        if (password_confirm != "")
            if (password === password_confirm) {
                $('#check_password_confirm').html('<p style="color:blue">사용가능한 패스워드</p>');
                boolean_check_password_confirm = true;
            } else {
                $('#check_password_confirm').html('<p style="color:red">패스워드 불일치</p>');
                boolean_check_password_confirm = false;
            }
        else {
            $('#check_password_confirm').html('<p style="color:blue">사용가능한 패스워드</p>');
            boolean_check_password_confirm = true;
        }
    });
});

$(function check_phone_form() {

    $('#phone').keyup(function () {
        var regExp = /^\d{3}-\d{3,4}-\d{4}$/;


        var phone = $('#phone').val();
        if (!phone == "") {
            if (!regExp.test(phone)) {
                $('#check_phone').html('<p style="color:red">000-0000-0000 형식으로 입력해주세요</p>');
                boolean_check_phone = false;
                return;
            } else {
                $('#check_phone').html('<p style="color:blue"></p>');
                boolean_check_phone = true;
            }
        } else {
            $('#check_phone').html('<p style="color:red">000-0000-0000 형식으로 입력해주세요</p>');
            boolean_check_phone = false;
        }
    });
});

$(function check_student_id() {
    $('#student_id').keyup(function () {
        var student_id = $('#student_id').val();
        var regExp = /^[0-9]+$/;

        if (!regExp.test(student_id)) {
            $('#check_student_id').html('<p style="color:red">입학연도 숫자 2자리만 입력해주세요</p>');
            boolean_check_student_id = false;

            return;
        } else if (student_id == "") {
            $('#check_student_id').html('<p style="color:red">입학연도를 입력해주세요</p>');
            boolean_check_student_id = false;
            return;
        } else if (student_id.length > 2) {
            $('#check_student_id').html('<p style="color:red">입학연도 숫자 2자리만 입력해주세요</p>');
            boolean_check_student_id = false;
            return;
        } else {
            $('#check_student_id').html('<p style="color:blue"></p>');
            boolean_check_student_id = true;
        }
    });
});
$(function check_btn_confirm() {
    $('#btn_confirm').click(function () {
        if (!boolean_check_id ||
            !boolean_check_user_name || !boolean_check_password_confirm || !boolean_check_phone || !boolean_check_student_id) {
            alert('입력양식을 확인해주세요');

            return false;
        }
    });
});

function onWriteSubmit() {
    if ($("#user_id").val().trim() == "") {
        var message = "아이디를 입력해 주세요";
        $("#user_id").val("");
        $("#user_id").focus();
        alert(message);
        return false;
    }

    if ($("#password").val().trim() == "") {
        var message = "패스워드를 입력해 주세요";
        $("#password").val("");
        $("#password").focus();
        alert(message);
        return false;
    }
    if ($("#password_confirm").val().trim() == "") {
        var message = "패스워드를 입력해 주세요";
        $("#password_confirm").val("");
        $("#password_confirm").focus();
        alert(message);
        return false;
    }

    if ($("#content").val().trim() == "") {
        var message = "본문 내용을 입력해 주세요";
        $("#content").val("");
        $("#content").focus();
        alert(message);
        return false;
    }

    if ($("#real_name").val().trim() == "") {
        var message = "패스워드를 입력해 주세요";
        $("#real_name").val("");
        $("#real_name").focus();
        alert(message);
        return false;
    }
    if ($("#user_name").val().trim() == "") {
        var message = "패스워드를 입력해 주세요";
        $("#user_name").val("");
        $("#user_name").focus();
        alert(message);
        return false;
    }
    if ($("#phone").val().trim() == "") {
        var message = "패스워드를 입력해 주세요";
        $("#phone").val("");
        $("#phone").focus();
        alert(message);
        return false;
    }

    if ($("#email").val().trim() == "") {
        var message = "패스워드를 입력해 주세요";
        $("#email").val("");
        $("#email").focus();
        alert(message);
        return false;
    }




}
