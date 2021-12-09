var closeOrSuccess = 0; // default close value is 0,success values is 1;
layui.use(["table", "form", "layer"], function () {
    let layer = layui.layer, mediaRecorder = null, audioChunks = [],recordIndex = -1;
    let parentIndex = parent.layer.getFrameIndex(window.name);
    let editor = editormd("editor", {
        htmlDecode: "script,iframe|on*",
        width: "99%",
        height: $(document).height() - 20 - 38,
        theme: "dark",
        saveHTMLToTextarea: true,
        imageUpload: true,
        imageFormats: ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
        imageUploadURL: "/Talk/Upload",
        path: "/lib/editor.md/lib/",
        onload: function () {

        },
        toolbarIcons: function () {
            return [
                "undo", "redo", "|", "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|",
                "h1", "h2", "h3", "h4", "h5", "h6", "|", "list-ul", "list-ol", "hr", "|", "link",
                "reference-link", "image", "code", "preformatted-text", "code-block", "table", "datetime",
                "html-entities", "pagebreak", "|", "goto-line", "watch", "preview",
                "clear", "search", "|", "record"
            ];
        },
        toolbarIconTexts: {
            record: "录音"
        },
        toolbarHandlers: {
            record: function (cm, icon, cursor, selection) {
                navigator.mediaDevices.getUserMedia({audio: true})
                    .then(stream => {
                        $.notify(`麦克风已授权`, "success");
                        recordIndex = layer.open({
                            type:1,
                            title: '录音',
                            content: $('#recorder'),
                            success:function(){
                                mediaRecorder = new MediaRecorder(stream);
                                mediaRecorder.addEventListener("dataavailable", event => {
                                    audioChunks.push(event.data);
                                });
                            },
                            end:function(){
                                recordIndex = -1;
                                clearAudio();
                            }
                        });                        
                    })
                    .catch(function () {
                        $.notify(`麦克风已被用户拒绝授权`, "error");
                    });
            }
        },
        lang: {
            toolbar: {
                record: "录音"
            }
        }
    });
    $("#save").click(function () {
        if (editor.getMarkdown().length < 5) {
            layer.msg("这么点?", {icon: 2, anim: 6});
            return;
        }
        let index = layer.load(1);
        $.ajax({
            url: "/Talk/Publish",
            data: {markdown: editor.getMarkdown(), html: editor.getHTML(), id: $("#Id").val()},
            type: "post"
        }).done(function (result) {
            if (!result.success) {
                layer.msg(result.msg, {icon: 2, anim: 6});
            } else {
                parent.layer.close(parentIndex);
                closeOrSuccess = 1;
            }
        }).fail(function (data) {
            if (data && data.responseJSON && data.responseJSON.success === false) {
                layer.alert(data.responseJSON.msg);
            }
        }).always(function () {
            layer.close(index);
        });
    });
    $("#cancel").click(function () {
        parent.layer.close(parentIndex);
        closeOrSuccess = 0;
    });

    $(document).delegate("#recordAudio", "click", function () {
        if (mediaRecorder == null) return;
        let start = $(this).data("start") === "true";
        if (start) {
            $("#recordAudio")                
                .text("开始录制")
                .addClass("layui-btn-disabled")
                .attr("disabled", "disabled")
                .data("start","false");
            mediaRecorder.stop();
            $("#playAudio,#clearAudio,#uploadAudio")
                .removeClass("layui-btn-disabled")
                .removeAttr("disabled");
        } else {
            $("#recordAudio").text("停止录制")
                .removeClass("layui-btn-disabled")
                .removeAttr("disabled")
                .data("start","true");
            mediaRecorder.start();
        }
    });

    $(document).delegate("#playAudio", "click", function () {
        if (audioChunks.length === 0) return;
        const audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.addEventListener("play",function(){
            $("#playAudio").text("正在试听")
                .addClass("layui-btn-disabled")
                .attr("disabled", "disabled");
            $("#clearAudio,#uploadAudio")
                .addClass("layui-btn-disabled")
                .attr("disabled", "disabled");
        });
        audio.addEventListener("ended",function(){
            $("#playAudio").text("试听")
                .removeClass("layui-btn-disabled")
                .removeAttr("disabled", "disabled");
            $("#clearAudio,#uploadAudio")
                .removeClass("layui-btn-disabled")
                .removeAttr("disabled", "disabled");
        });
        audio.play();
    });

    function clearAudio(){
        audioChunks = [];
        $("#playAudio,#clearAudio,#uploadAudio")
            .addClass("layui-btn-disabled")
            .attr("disabled", "disabled");
        $("#recordAudio")
            .removeClass("layui-btn-disabled")
            .removeAttr("disabled")
            .data("start","false")
            .text("开始录制");
    }
       
    $(document).delegate("#clearAudio", "click", function () {
        clearAudio();
    });

    $(document).delegate("#uploadAudio", "click", function () {
        if (audioChunks.length === 0) return;
        if(recordIndex === -1)return;
        let index = layer.load(1);
        const audioBlob = new Blob(audioChunks);
        let form = new FormData();
        form.append("record", audioBlob, `${new Date().getTime()}.wav`);
        $.ajax({
            url: "/Audio/Upload",
            type: "post",
            cache: false,
            contentType: false,
            processData: false,
            data: form
        }).done(function (result) {
            if (!result.success) {
                layer.msg(result.msg, {icon: 2, anim: 6});
            } else {
                editor.insertValue(`<audio controls src="/Audio/Result/${result.data.id}" preload="metadata"></audio>`);
                layer.close(recordIndex);
            }
        }).fail(function (data) {
            if (data && data.responseJSON && data.responseJSON.success === false) {
                layer.alert(data.responseJSON.msg);
            }
        }).always(function () {
            layer.close(index);
        });
    });
});

DarkReader.auto({
    brightness: 100,
    contrast: 90,
    sepia: 10
});