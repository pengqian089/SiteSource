function initBarrage(groupName) {
    let index = 0, toolIsOpen = false, defaultColor = "#000";

    if (typeof (localStorage.barrageColor) !== "undefined") {
        defaultColor = localStorage.barrageColor;
    }


    let barrageConnection = new signalR.HubConnectionBuilder().withUrl("/barrage").withAutomaticReconnect().build();
    barrageConnection.start().then(function () {
        console.log("barrage connection");
    }).catch(function (err) {
        return console.error(err.toString());
    });

    barrageConnection.on("ReceiveMessage", function (res) {
        if (res.group === groupName) {
            $("#barrageContent").danmu("addDanmu", res);
        }
    });

    $("#barrageContent").danmu({
        height: "100%",
        width: "100%"
    });
    $('#barrageContent').danmu('danmuStart');
    $(document).delegate("#btnBarrageSend", "click", function () {
        sendBarrage();
    });
    $(document).delegate("#txtBarrage", "keyup", function (e) {
        if (e.keyCode === 13) {
            sendBarrage();
        }
    });
    $(document).delegate("#barrageColor", "change", function () {
        let value = $(this).val();
        $("#txtBarrage").css("color",value);
        localStorage.barrageColor = value;
    });
    $("body").keyup(function (e) {
        if (e.altKey && e.keyCode === 13) {
            index = openTool();
        }
    });

    $.ajax({url: "/Home/GroupBarrages", data: {group: groupName}}).done(function (result) {
        $("#barrageContent").danmu("addDanmu", result);
    });

    function openTool() {
        if (toolIsOpen === true) return;
        toolIsOpen = true;
        return layer.open({
            type: 1,
            closeBtn: 0,
            anim: 2,
            shadeClose: true,
            offset: "b",
            area: "750px",
            title: false,
            end:function(){
                toolIsOpen = false;
            },
            content: '<div style="padding:15px"><input placeholder="在这里输入弹幕" id="txtBarrage" class="barrage"/><input type="color" id="barrageColor" value="' + defaultColor + '" class="barrage-color"/><button id="btnBarrageSend" class="barrage-send">发送</button></div>'
        });
    }

    function sendBarrage() {
        if ($("#txtBarrage").val() === "") {
            layer.msg("请输入弹幕内容在发送");
            return;
        }
        let barrage = {
            text: $("#txtBarrage").val(),
            color: $("#barrageColor").val(),
            position: 0,
            size: 0,
            time: $("#barrageContent").data("nowTime") + 1,
            isnew: "1"
        };
        $("#barrageContent").danmu("addDanmu", barrage);
        barrage["group"] = groupName;
        barrageConnection.invoke("Send", barrage).catch(function (err) {
            return console.error(err.toString());
        });
        layer.close(index);        
    }
}