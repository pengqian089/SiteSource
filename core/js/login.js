(function ($) {
    "use strict";


    /*==================================================================
    [ Validate ]*/
    let input = $(".validate-input .input100");

    $(".validate-form").on('submit', function () {
        let check = true;
        let that = $(this);
        for (let i = 0; i < input.length; i++) {
            if (validate(input[i]) === false) {
                showValidate(input[i]);
                check = false;
            }
        }
        if(check) {
            const captcha = new TencentCaptcha('2084420298', function (res) {
                console.log(res);
                if (res.ret === 0) {
                    that.find("[name=ticket]").val(res["ticket"]);
                    that.find("[name=randStr]").val(res["randstr"]);
                    that.unbind("submit");
                    that.submit();
                }
            }, {
                enableDarkMode: true,
                needFeedBack: true
            });
            captcha.show();
        }
        return false;
    });   

    $(".validate-form .input100").each(function () {
        $(this).focus(function () {
            hideValidate(this);
        });
    });

    function validate(input) {
        if ($(input).attr("type") === "email" || $(input).attr('name') === "email") {
            if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) === null) {
                return false;
            }
        } else {
            if ($(input).val().trim() === "") {
                return false;
            }
        }
    }

    function showValidate(input) {
        let thisAlert = $(input).parent();

        $(thisAlert).addClass("alert-validate");
    }

    function hideValidate(input) {
        let thisAlert = $(input).parent();

        $(thisAlert).removeClass("alert-validate");
    }

    $(".js-tilt").tilt({
        scale: 1.1
    });

})(jQuery);
