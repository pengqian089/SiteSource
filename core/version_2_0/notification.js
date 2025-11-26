"use strict";

(async function () {
    let connection = new signalR
        .HubConnectionBuilder()
        .withUrl("/notification",
            {

                skipNegotiation : true,
                transport : signalR.HttpTransportType.WebSockets,
            }
        )
        .withAutomaticReconnect()
        .build();

    try {
        await connection.start();
        await connection.invoke("Init");
    } catch (error) {
        console.error(error);
    }

    connection.on("pushMessage", async function (result) {
        let option = {title: "小喇叭开始广播辣", content: result.markdown};
        let ntf = await showNotify(option);
        if (ntf !== null) {
            ntf.onclick = function () {
                window.open("/talk.html");
            };
        }
        console.info(result);
    });

    connection.on("pushLogMessage", function (type, message) {
        if (type === 0) {
            outPutSuccess(message);
            $.notify(`${moment().format('YYYY-MM-DD HH:mm:ss')}\n${message}`, "success");
        } else if (type === 1) {
            outPutInfo(message);
            $.notify(`${moment().format('YYYY-MM-DD HH:mm:ss')}\n${message}`, "warn");
        } else if (type === 2) {
            outPutError(message);
            $.notify(`${moment().format('YYYY-MM-DD HH:mm:ss')}\n${message}`, "error");
        }
    });

    let cnBetaBox = null;
    connection.on("cnBetaSubscribe", function (result) {
        let values = [];
        if (result.hasOwnProperty("progressValues") && Array.isArray(result["progressValues"])) {
            for (let i = 0; i < result["progressValues"].length; i++) {
                let value = (result["progressValues"][i] * 100).toFixed(2);
                values.push(parseFloat(value));
            }
        }
        if (cnBetaBox == null) {
            cnBetaBox = notification.show({
                title: "文章发布",
                content: result.message,
                bars: values
            });
        } else {
            notification.setContent(cnBetaBox, result.message);
            notification.setProgress(cnBetaBox, values);
        }
        switch (result.type) {
            case 0:
                outPutSuccess(result.message);
                break;
            case 1:
                outPutInfo(result.message);
                break;
            case 2:
                outPutError(result.message);
                break;
            case 3:
                outPutSuccess(result.message);
                setTimeout(function () {
                    notification.close(cnBetaBox);
                    cnBetaBox = null;
                }, 1000);
                break;
        }
    });

    connection.on("ready", function (result) {
        console.info(result);
    });

    setTimeout(function () {
        updateRunTime();
    }, 1000);

    function updateRunTime() {
        connection.invoke("getRunTime");
    }

    connection.on("ReceiveRunTime", function (msg) {
        let runTime = $("#runTime");
        if (runTime.length > 0) {
            runTime.text("运行时间 " + msg);
            setTimeout(updateRunTime, 1000);
        }
    });

    connection.on("systemNotification", function (msg) {
        layer.msg(msg);
    });
})();

(async () => {
    let appConnection = new signalR
        .HubConnectionBuilder()
        .withUrl("/app/notification",
            {
                skipNegotiation : true,
                transport : signalR.HttpTransportType.WebSockets,
            }
        )
        .withAutomaticReconnect()
        .build();

    try {
        await appConnection.start();
    } catch (error) {
        console.error(error);
    }
    appConnection.on("systemMessage", function (level, message) {
        if (level === 0) {
            outPutSuccess(message);
            $.notify(message, "success");
        } else if (level === 1) {
            outPutInfo(message);
            $.notify(message, "warn");
        } else if (level === 2) {
            outPutError(message);
            $.notify(message, "error");
        }
    });
})();

async function showNotify(option) {
    if (!("Notification" in window)) {
        return null;
    }

    let permission = await Notification.requestPermission();

    let setting = {
        title: "",
        content: "",
        image: "https://cdn.dpangzi.com/logo.png"
    };
    $.extend(setting, option);

    if (permission === "granted") {
        return new Notification(setting.title, {
            icon: setting.image,
            body: setting.content,
            lang: "zh-cn",
            tag: setting.tag
        });
    }
    return null;
}

let notification = {
    // 私有变量，用于跟踪通知框实例
    _instances: new Set(),
    
    /**
     * 显示通知框
     * @typedef {Object} Options
     * @property {string} [title=""] - 通知框标题
     * @property {string} [content=""] - 通知框内容
     * @property {number[]} [bars=[]] - 进度条数组
     * @property {number} [autoClose=0] - 自动关闭时间(毫秒)，0表示不自动关闭
     * @property {string} [type="info"] - 通知类型：info/success/warning/error
     * @param {Options} option
     * @returns {jQuery} 通知框DOM元素
     */
    show: function (option) {
        // 输入验证和默认值设置
        if (!option || typeof option !== "object") {
            option = {};
        }
        
        const setting = {
            title: "",
            content: "",
            bars: [],
            autoClose: 0,
            type: "info",
            ...option
        };

        // 计算位置
        const top = this._calculateTopPosition();
        
        // 创建通知框
        const $box = this._createBox(setting);
        $box.css("top", `${top}px`);
        
        // 添加到DOM并跟踪实例
        $("body").append($box);
        this._instances.add($box[0]);
        
        // 设置自动关闭
        if (setting.autoClose > 0) {
            setTimeout(() => this.close($box), setting.autoClose);
        }
        
        // 添加入场动画
        requestAnimationFrame(() => {
            $box.addClass('notification-enter');
        });

        return $box;
    },

    /**
     * 设置通知框内容
     * @param {jQuery} $box - 通知框元素
     * @param {string} content - 新内容
     */
    setContent: function ($box, content) {
        if (!this._validateBox($box)) return;
        
        const $contentEl = $box.find(".content");
        if ($contentEl.length > 0) {
            $contentEl.text(String(content || ""));
        }
    },

    /**
     * 设置通知框标题
     * @param {jQuery} $box - 通知框元素
     * @param {string} title - 新标题
     */
    setTitle: function ($box, title) {
        if (!this._validateBox($box)) return;
        
        const $titleEl = $box.find(".title");
        if ($titleEl.length > 0) {
            $titleEl.text(String(title || ""));
        }
    },

    /**
     * 设置进度条的进度
     * @param {jQuery} $box - 要设置的提示框
     * @param {number[]} values - 进度值数组
     */
    setProgress: function ($box, values) {
        if (!this._validateBox($box) || !Array.isArray(values)) return;

        const $progressBars = $box.find('.content-container .progress .bar');
        
        values.forEach((value, index) => {
            if (typeof value === "number" && index < $progressBars.length) {
                const clampedValue = Math.max(0, Math.min(100, value));
                const $bar = $progressBars.eq(index);
                $bar.css("width", `${clampedValue}%`)
                    .text(`${clampedValue.toFixed(1)}%`);
            }
        });
    },

    /**
     * 关闭通知框
     * @param {jQuery} $box - 要关闭的提示框
     */
    close: function ($box) {
        if (!this._validateBox($box)) return;

        // 添加退场动画
        $box.addClass('notification-exit');
        
        // 动画完成后移除
        setTimeout(() => {
            if ($box[0]) {
                this._instances.delete($box[0]);
                $box.remove();
                this._recalculatePositions();
            }
        }, 300);
    },

    /**
     * 关闭所有通知框
     */
    closeAll: function () {
        const boxes = Array.from(this._instances);
        boxes.forEach(boxEl => {
            const $box = $(boxEl);
            if ($box.length > 0) {
                this.close($box);
            }
        });
    },

    /**
     * 获取当前活跃的通知框数量
     * @returns {number}
     */
    getActiveCount: function () {
        return this._instances.size;
    },

    /**
     * 测试函数
     */
    test: function () {
        const $box = this.show({
            title: "测试通知",
            content: "正在加载...",
            bars: [0],
            type: "info"
        });

        let progressValue = 0;
        const progressInterval = setInterval(() => {
            if (progressValue >= 100) {
                this.setContent($box, "加载完毕，即将关闭！");
                clearInterval(progressInterval);
                setTimeout(() => this.close($box), 1000);
                return;
            }
            
            progressValue += 2;
            this.setContent($box, `进度: ${progressValue}%`);
            this.setProgress($box, [progressValue]);
        }, 50);
    },

    // ========== 私有方法 ==========

    /**
     * 验证通知框元素
     * @private
     */
    _validateBox: function ($box) {
        return $box && $box.length > 0 && this._instances.has($box[0]);
    },

    /**
     * 计算顶部位置
     * @private
     */
    _calculateTopPosition: function () {
        let top = 15;
        this._instances.forEach(boxEl => {
            const $box = $(boxEl);
            if ($box.is(':visible')) {
                top += $box.outerHeight(true) + 15;
            }
        });
        return top;
    },

    /**
     * 重新计算所有通知框位置
     * @private
     */
    _recalculatePositions: function () {
        let currentTop = 15;
        this._instances.forEach(boxEl => {
            const $box = $(boxEl);
            if ($box.is(':visible')) {
                $box.css('top', `${currentTop}px`);
                currentTop += $box.outerHeight(true) + 15;
            }
        });
    },

    /**
     * 创建通知框DOM
     * @private
     */
    _createBox: function (setting) {
        const $box = $("<div>").addClass(`notification-box notification-${setting.type}`);
        
        // 创建标题
        if (setting.title) {
            const $title = $("<div>").addClass("title").text(setting.title);
            $box.append($title);
        }
        
        // 创建内容容器
        const $container = $("<div>").addClass("content-container");
        
        // 创建内容
        const $content = $("<div>").addClass("content").text(setting.content);
        $container.append($content);
        
        // 创建进度条
        this._createProgressBars($container, setting.bars);
        
        $box.append($container);
        
        // 添加关闭按钮
        this._addCloseButton($box);
        
        return $box;
    },

    /**
     * 创建进度条
     * @private
     */
    _createProgressBars: function ($container, bars) {
        if (!Array.isArray(bars) || bars.length === 0) return;
        
        bars.forEach(value => {
            if (typeof value === "number") {
                const clampedValue = Math.max(0, Math.min(100, value));
                const $progress = $("<div>").addClass("progress");
                const $bar = $("<div>")
                    .addClass("bar")
                    .css("width", `${clampedValue}%`)
                    .text(`${clampedValue.toFixed(1)}%`);
                
                $progress.append($bar);
                $container.append($progress);
            }
        });
    },

    /**
     * 添加关闭按钮
     * @private
     */
    _addCloseButton: function ($box) {
        const $closeBtn = $("<button>")
            .addClass("notification-close")
            .html("&times;")
            .attr("aria-label", "关闭通知")
            .on("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.close($box);
            });
        
        $box.append($closeBtn);
    }
};
