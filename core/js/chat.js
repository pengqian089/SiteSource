const layimOption = {
    CDNBaseAddress = document.head.querySelector("meta[name=cdn-base-address]").content;
};
layui.config({
    layimPath: `${layimOption.CDNBaseAddress}/lib/layim/`,
    layimAssetsPath: `${layimOption.CDNBaseAddress}/lib/layim/layim-assets/`,
}).extend({
    layim: layui.cache.layimPath + 'layim'
}).use(["layim", "layer"], function () {
    var layim = layui.layim,
        layer = layui.layer;
    // var robotConnection = new signalR.HubConnectionBuilder().withUrl("/robotChat").withAutomaticReconnect().build();
    var chatConnection = new signalR.HubConnectionBuilder().withUrl("/chathub").withAutomaticReconnect().build();
    chatConnection.start().catch(function (err) {
        return console.error(err.toString());
    });
    // robotConnection.start().then(function () {
    //     console.log("robot connection");
    // }).catch(function (err) {
    //     return console.error(err.toString());
    // });
    layim.config({
        title: "聊天室",
        copyright: true,
        isAudio: true,
        //find: '/chat/find',
        // 消息盒子
        //msgbox: layui.cache.dir + 'css/modules/layim/html/msgbox.html',
        // 查看更多聊天记录
        chatLog: "/chat/record",
        // 初始化接口
        init: {
            url: "/chat/init",
            data: {}
        },
        min:true,
        // 群成员接口
        members: {
            url: "/chat/groupMembers",
            type: "get",
            data: {}
        },

        tool: [
            {
                alias: "code",
                title: "代码",
                icon: "&#xe64e;"
            }
        ]
    });
    layim.on("tool(code)",
        function (insert) {
            layer.prompt({
                    title: "插入代码",
                    formType: 2,
                    shade: 0
                },
                function (text, index) {
                    layer.close(index);
                    insert("[pre class=layui-code]" + text + "[/pre]");
                });
        });
    layim.on("sign",
        function (value) {
            console.log(value);
            $.ajax({url: "/Account/UpdateSign", type: "post", data: {sign: value}}).done(function (result) {
                if (!result.success) {
                    layer.msg(result.msg);
                }
            }).fail(function (res) {
                console.info(res);
            });
        });
    // robotConnection.on("Question", function (res) {
    //     //layim.getMessage(res);
    // });
    // robotConnection.on("Answer", function (res) {
    //     layim.getMessage(res);
    //     //layim.setChatStatus('<span style="color:#FF5722;">在线</span>');
    // });
    // robotConnection.on("SystemError", function (res) {
    //     layer.alert(res);
    // });
    chatConnection.on("ReceiveMessage", function (res) {
        res["timestamp"] = res["timestamp"] * 1000;
        layim.getMessage(res);
    });
    chatConnection.on("System", function (res) {
        if (res.code < 0) {
            console.log("%cchatHub:" + res.content, "color:#ff00ff");
            chatConnection.stop();
        } else if (res.code === 0 && !res.isGuest) {
            layer.msg(`${res.user.name}下线了`);
            layim.setFriendStatus(res.user.id, "offline");
        } else if (res.code === 1) {
            layer.msg(`${res.user.name}上线了`);
            layim.setFriendStatus(res.user.id, "online");
        }
    });
    layim.on("sendMessage", function (data) {
        // if (data.to.type === "friend") {
        //     layim.setChatStatus('<span style="color:#FF5722;">对方正在输入。。。</span>');
        // }
        if (data.to.id === "kefu") {
            // robotConnection.invoke("SendMessage", data.mine.content).catch(function (err) {
            //     return console.error(err.toString());
            // });
        } else if (data.to.type === "friend") {
            chatConnection.invoke("SendMessageToUser", data.to.id, data.mine.content).catch(function (err) {
                return console.error(err.toString());
            });
        } else if (data.to.type === "group") {
            chatConnection.invoke("SendMessageToGroup", data.to.id, data.mine.content).catch(function (err) {
                return console.error(err.toString());
            });
        }
    });
});