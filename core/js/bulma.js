(function () {
    var burger = document.querySelector('.burger');
    var menu = document.querySelector('#' + burger.dataset.target);
    burger.addEventListener('click', function () {
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
    });
})();
inbox = {
    uid: -1
};
$(function () {
    $(document).delegate("#inbox-messages>.card[data-message]", "click", function () {
        const uid = parseInt($(this).data("uid"));
        if (uid === inbox.uid) {
            return;
        }
        inbox.uid = uid;
        $('.card').removeClass('active');
        $(this).addClass("active");
        var load = layer.load();
        $.ajax($(this).data("message")).done(function (result) {
            if (result.success && result.success === false) {
                layer.alert(result.msg);
                return;
            }
            $(".box.message-preview").html(result);
            $('#message-pane').removeClass('is-hidden');
        }).fail(function (data,status,xhr) {
            if(data && data.responseJSON && data.responseJSON.success === false){
                layer.alert(data.responseJSON.msg);
            }
        }).always(function () {
            layer.close(load);
        });
    });
    
    
    $.pjax.defaults.timeout = 10000;
    $(document).pjax("#inbox-pager .button.is-small:not(.curr),#email-refresh", "#message-feed");

    $(document).on("pjax:send", function () {
        NProgress.start();
    });
    $(document).on("pjax:complete", function (event, xhr) {
        NProgress.done();
    });
});