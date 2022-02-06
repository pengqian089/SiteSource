(function ($) {

	"use strict";
	$("form#signIn-form").submit(async () => {
		event.preventDefault();
		let index = layer.load(1, { shade: [0.1, '#fff'] });

		let postData = { UserName: $("#account").val(), Password: $("#password").val()}
		let response = await fetch("/api/Community/SignIn", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(postData)
		});
		let data = await response.json();
		if (data["signIn"] === true) {
			location.href = "/runtask";
		} else {
			layer.close(index);
			layer.msg("用户名或密码错误");
		}

		return false;
	});

})(jQuery);
