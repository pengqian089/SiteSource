/**
 * 评论系统 JavaScript - Version 2.0
 * 适配 Design System 2.0 样式系统
 *
 * 主要功能：
 * - 评论提交与回复
 * - 加载更多评论
 * - 刷新评论列表
 * - 图片插入
 * - 按钮状态管理
 */
"use strict";

(function(){
    // 添加发送中按钮的旋转动画样式
    if (!document.getElementById('comment-loading-styles')) {
        const style = document.createElement('style');
        style.id = 'comment-loading-styles';
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .ds-button-loading {
                position: relative;
                pointer-events: none;
                opacity: 0.8;
            }
            
            .ds-button-loading svg {
                animation: spin 1s linear infinite;
            }
            
            .ds-button-error {
                background-color: #ef4444;
                border-color: #dc2626;
                color: white;
            }
            
            .ds-button-error:hover {
                background-color: #dc2626;
                border-color: #b91c1c;
            }
        `;
        document.head.appendChild(style);
    }

    // 按钮状态管理函数
    function setButtonState($button, state) {
        const states = {
            loading: {
                class: 'ds-button-loading',
                disabled: true,
                html: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                </svg> 发送中...`
            },
            normal: {
                class: '',
                disabled: false,
                html: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                </svg> 发送`
            },
            error: {
                class: 'ds-button-error',
                disabled: false,
                html: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg> 重试`
            }
        };

        const config = states[state] || states.normal;

        // 移除所有状态类
        $button.removeClass('ds-button-loading ds-button-error');

        // 添加新状态类
        if (config.class) {
            $button.addClass(config.class);
        }

        // 设置disabled状态
        if (config.disabled) {
            $button.attr('disabled', 'disabled');
        } else {
            $button.removeAttr('disabled');
        }

        // 设置HTML内容
        $button.html(config.html);
    }
    // 评论查看更多
    $(document).delegate(".comments-area .load-more .ds-button", "click", function () {
        let $area = $(this).parents(".comments-area");
        let $loadMore = $(this).parent();
        let $commentCount = $(this).parents().find(".comment-count span")
        let src = $(this).parent().data("loadingIco");
        $loadMore.html(`<img src="${src}" class="comment-loading" alt="loading"/>`);
        let pageIndex = parseInt($(this).data("pageIndex"));
        let pageSize = parseInt($(this).data("pageSize"));
        // let count = parseInt($(this).data("itemCount"));
        // let pageCount = parseInt($(this).data("pageCount"));
        // let node = $(this).data("node");
        // let relation = $(this).data("relation");
        let request = $(this).data("pageRequest");
        let $that = $(this);
        $.ajax({
            url: request,
            type: "get",
            data: { pageIndex: pageIndex + 1, pageSize: pageSize }
        }).done(function (result, _, xhr) {
            //let nextPage = $(result).find(".comments-area").html();
            $area.append(result);
            $loadMore.remove();
            $commentCount.text(xhr.getResponseHeader("commentCount"));
            $("time.timeago").relativeTime();
            lightCode();
        }).fail(function() {
            layer.msg('加载更多评论失败', { icon: 2, anim: 6 });
            if (typeof ajaxFail === 'function') {
                ajaxFail.apply(this, arguments);
            }
        });
    });

    $(document).delegate("form.comment-form :input:not(textarea)", "keydown", function (e) {
        return e.key !== "Enter";
    });

    // 提交评论
    $(document).delegate("form.comment-form", "submit", function () {
        event.preventDefault();
        let data = new FormData(this);
        let $that = $(this);
        let $commentCount = $(this).parents(".comment-block").find(".comment-count span");
        let $submitButton = $(this).find("button.ds-button");
        setButtonState($submitButton, 'loading');
        $.ajax({
            url: $that.attr("action"),
            processData: false,
            contentType: false,
            data: data,
            type: "post"
        }).done(function (result, _, xhr) {
            if (result.hasOwnProperty("success") && result["success"] === false) {
                layer.msg(result.msg, { icon: 2, anim: 6 });
                setButtonState($submitButton, 'error');
                // 3秒后恢复正常状态
                setTimeout(() => {
                    setButtonState($submitButton, 'normal');
                }, 3000);
            } else {
                let $commentBlock = $that.parents(".comment-block");
                let $area = $commentBlock.find(".comments-area:first");

                // 创建新的表单并重置状态
                let $newForm = $that.clone();
                $newForm.find("textarea").val("");
                setButtonState($newForm.find("button.ds-button"), 'normal');
                $newForm.find("input[name=replyId]").val("");
                $newForm.find(".comment-btn-close").hide();
                $newForm.find(".comment-btn-close").off("click");

                // 更新评论列表
                $commentBlock.find(".comments-area").html(result);

                // 移除当前表单
                $that.remove();

                // 将新表单插入到正确位置（评论区域前面）
                $area.before($newForm);

                // 更新评论计数和其他状态
                $commentCount.text(xhr.getResponseHeader("commentCount"));
                $("time.timeago").relativeTime();
                lightCode();
            }
        }).fail(function() {
            setButtonState($submitButton, 'error');
            layer.msg('提交失败，请检查网络连接', { icon: 2, anim: 6 });
            // 3秒后恢复正常状态
            setTimeout(() => {
                setButtonState($submitButton, 'normal');
            }, 3000);
        }).always(function () {
            // 只有在成功的情况下才恢复正常状态，错误状态由其他地方处理
            if (!$submitButton.hasClass('ds-button-error') && !$submitButton.hasClass('ds-button-loading')) {
                setButtonState($submitButton, 'normal');
            }
        });
    });

    // 刷新评论
    $(document).delegate(".comment-count button.refresh", "click", function () {
        let $commentBlock = $(this).parents(".comment-block");
        let $area = $commentBlock.find(".comments-area");
        let request = $(this).data("refresh") + "?t=" + new Date().getTime();
        let $commentCount = $(this).parent().find("span");

        // 检查是否有表单在评论区域内（回复状态）
        let $formInComments = $area.find("form.comment-form");
        let $savedForm = null;
        let isReplying = false;

        if ($formInComments.length > 0) {
            // 保存表单状态
            $savedForm = $formInComments.clone();
            isReplying = true;
            // 重置表单状态
            $savedForm.find("input[name=replyId]").val("");
            $savedForm.find(".comment-btn-close").hide();
            setButtonState($savedForm.find("button.ds-button"), 'normal');
        }

        let index = layer.load();
        $.ajax({
            url: request,
            type: "get"
        }).done(function (result, _, xhr) {
            $area.html(result);
            $commentCount.text(xhr.getResponseHeader("commentCount"));

            // 如果之前在回复状态，恢复表单到原位置
            if (isReplying && $savedForm) {
                $area.before($savedForm);
            }

            $("time.timeago").relativeTime();
            lightCode();
        }).fail(function() {
            layer.msg('刷新评论失败', { icon: 2, anim: 6 });

            // 即使刷新失败也要恢复表单
            if (isReplying && $savedForm) {
                $area.before($savedForm);
            }

            if (typeof ajaxFail === 'function') {
                ajaxFail.apply(this, arguments);
            }
        }).always(function () {
            layer.close(index);
        });
    });

    // 添加网络图片
    $(document).delegate(".footer-action-item[data-image]", "click", function () {
        let $editor = $(this).parents().find("textarea.comment-form-editor");
        layer.prompt({
            title: "请输入网络图片地址",
        }, function (value, index) {
            let url;
            try {
                url = new URL(value);
            } catch {
                layer.msg("请输入正确的地址嗷~");
                return;
            }
            if (url.protocol !== "https:") {
                layer.msg("使用https协议的网络图片嗷~");
                return;
            }
            let markdownImg = `![](${url.toString()})`;
            $editor.val($editor.val() + "\r\n" + markdownImg);
            layer.close(index);
        });
    });

    // 回复按钮事件
    $(document).delegate(".comments-area .comment-item button.btn-reply", "click", function () {
        let $commentBlock = $(this).parents(".comment-block");
        let $commentsArea = $(this).parents(".comments-area");
        let $that = $(this);
        let replyId = $(this).data("replyId");

        // 查找现有的表单
        let $existingForm = $commentBlock.find("form.comment-form");
        let $form;

        if ($existingForm.length === 0) {
            // 如果没有表单，说明可能出现了异常情况，跳过操作
            layer.msg('评论表单未找到，请刷新页面重试', { icon: 2, anim: 6 });
            return;
        }

        // 如果表单已经在评论区域内，说明正在回复其他评论
        if ($commentsArea.find("form.comment-form").length > 0) {
            $form = $commentsArea.find("form.comment-form").first();
        } else {
            // 表单在正常位置，克隆并移动
            $form = $existingForm.clone();
            // 重置按钮状态
            setButtonState($form.find("button.ds-button"), 'normal');
            $existingForm.remove();
        }

        // 设置回复信息
        $form.find("input[name=replyId]").val(replyId);
        $form.find(".comment-btn-close").show();

        // 取消回复按钮事件
        $form.find(".comment-btn-close").off("click").on("click", function () {
            // 重置表单状态
            $form.find("input[name=replyId]").val("");
            $form.find("textarea").val("");
            setButtonState($form.find("button.ds-button"), 'normal');

            // 移动表单回原位置
            $commentsArea.before($form);
            $(this).hide();
        });

        // 将表单插入到评论内容后面
        $that.parents(".comment-block .comment-item:first").find(".detail > .comment-content:first").after($form);
    });

    // 表单保护机制 - 确保每个评论块都有表单
    function ensureCommentForm() {
        $(".comment-block").each(function() {
            let $commentBlock = $(this);
            let $existingForm = $commentBlock.find("form.comment-form");

            if ($existingForm.length === 0) {
                console.warn('Comment form missing, this should not happen in normal operation');
                // 这种情况不应该在正常操作中发生
                // 如果发生，可能需要页面重新加载
            }
        });
    }

    // 页面加载完成后检查表单状态
    $(document).ready(function() {
        ensureCommentForm();
    });

    // 初始化完成日志
    console.log('Comment system v2.0 initialized with Design System styles');
})();