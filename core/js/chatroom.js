$(function () {
    var connection = new signalR.HubConnectionBuilder().withUrl("/robotChat").build();

    connection.start().then(() => console.info("websocket start")).catch(x => console.error(x.toString()));

    connection.on("Connected", function (result, sessionId) {
        console.info(result);
        console.info(sessionId);
    });

    connection.on("Disconnected", function (result, sessionId) {
        console.info(result);
        console.info(sessionId);
    });

    connection.on("Answer", function (result) {
        var $msg = $("#MsgTemp").clone().removeAttr("style").removeAttr("id").removeClass("myself");
        $msg.find(".detail").text(result.data.answer);
        $msg.find(".avatar img").attr({ src: result.userInfo.avatar, alt: result.userInfo.name });
        $msg.find(".info").text(result.userInfo.name);
        $msg.find(".time span").text(result.replyTime);
        $(".chatroom-item.current").append($msg);
        scroll();
        //console.info(result);
    });

    connection.on("Question", function (result) {
        var $msg = $("#MsgTemp").clone().removeAttr("style").removeAttr("id");
        $msg.find(".detail").text(result.message);
        if (result.questioner != null) {
            $msg.find(".info").text(result.questioner.name);
            $msg.find(".avatar img").attr({ src: result.questioner.avatar, alt: result.questioner.name });
            $msg.find(".time span").text(result.sendTime);
        } else {
            $msg.find(".info").text("我");
            $msg.find(".time span").text(result.sendTime);
        }
        $(".chatroom-item.current").append($msg);
        scroll();
    });

    function sendMsg(msg) {
        connection.invoke("SendMessage", msg).catch(function (err) {
            return console.error(err.toString());
        });
    }

    $(".chatroom-tribe.current").click(function () {
        if ($(".chatroom").hasClass("chatroom-fold")) {
            $('.chatroom').removeClass('chatroom-fold');
        }
    });
    
    $(".chatroom-info").on('click', function (evt) {
        evt.preventDefault();
        // $('.chatroom').toggleClass('chatroom-fold');
        if (!$('.chatroom').hasClass('chatroom-fold')) {
            $('.chatroom').addClass('chatroom-fold');
            $('.chatroom textarea').focus();
            $('.chatroom-tribe').removeClass('current');
            $('.chatroom-item').removeClass('current');
            $('.chatroom-tribes>li').first().addClass('current');
            $('.chatroom-item').first().addClass('current');
            $('.chatroom .count').eq(0).text(0).css('visibility', 'hidden');
        } else {
            $('.chatroom').removeClass('chatroom-fold');
        }
    });

    $(".chatroom-send-btn").click(function (evt) {
        var $input = $(".chatroom-input");
        if ($.trim($input.val())) {
            var msg = $input.val();
            sendMsg(msg);
            $input.val("");
        }
    });

    $('.chatroom-input').on('keydown', function (evt) {
        var $this = $(this);
        if ((evt.ctrlKey || evt.metaKey) && evt.keyCode == '13' && $.trim($this.val()) || evt.isTrigger) {
            var msg = $this.val();
            sendMsg(msg);
            $this.val("");
        }
    });
});

function scroll() {
    var $target = $(".chatroom-item.current");
    var $box = $(".chatroom-pannel-bd");
    var height = $target.height();
    var delta = 300;
    if ($box.scrollTop() < height - delta) {
        $box.scrollTop(height);
        $target.attr("data-lastscroll", height);
    }
}


//layui.use(["layim"], function (layim) {
//    layim.config({
//        init: {
//            mine: {
//                "username": "访客",
//                "id": "100000123",
//                "status": "online",
//                "remark": "你就是一个臭匿名用户",
//                "avatar": "/images/guest.png"
//            },
//            right:0
//        },
//        brief: true
//    });


//    layim.chat({
//        name: "人工智障AI",
//        type: "kefu",
//        avatar: "/images/ai.jpg",
//        id: "kefu"
//    });
//    layim.setChatMin();
//    layim.on("ready", function(res) {

        
//    });
    
//});