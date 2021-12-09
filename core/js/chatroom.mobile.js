layui.config({
    version: true
}).use("mobile", function () {
    var mobile = layui.mobile, layim = mobile.layim, layer = mobile.layer;
    layim.config({
        init: {
            mine: {
                "username": "访客",
                "id": "100000123",
                "status": "online",
                "remark": "你就是一个臭匿名用户",
                "avatar": "/images/guest.png"
            }
        },
        brief: true
    });


    layim.chat({
        name: "在线客服一",
        type: "kefu",
        avatar: "/images/ai.jpg",
        id: "kefu"
    });

    //layim.setChatMin();
});