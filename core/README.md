### 需要合并压缩的css
+ `./core/lib/layui/css/layui.min.css`
+ `./core/lib/aplayer/APlayer.min.css`
+ `./core/css/site.min.css`
+ `./core/css/nprogress.min.css`
+ `./core/font-awesome/css/font-awesome.min.css`
+ `./core/css/code-style.min.css`
+ `./core/lib/tocbot/tocbot.min.css`
+ `./core/lib/sakura-js/sakura.min.css`
+ `./core/lib/photoswipe/photoswipe.min.css`
+ `./core/lib/photoswipe/default-skin/default-skin.min.css`

``` powershell
# 压缩合并css
cleancss -o ./core/css/global.min.css ./core/lib/layui/css/layui.css ./core/lib/aplayer/Aplayer.min.css ./core/css/site.css ./core/css/nprogress.css ./core/font-awesome/css/font-awesome.css ./core/css/code-style.css ./core/lib/tocbot/tocbot.css ./core/lib/sakura-js/sakura.min.css ./core/lib/photoswipe/photoswipe.css ./core/lib/photoswipe/default-skin/default-skin.css --with-repowershellpowershellpowershell
``` powershell
# 压缩 site.js
uglifyjs ./core/js/site.js --source-map "url='site.min.js.map',base='./core/js'" -o ./core/js/site.min.js -c -m

# 压缩 chat.js
uglifyjs ./core/js/chat.js --source-map "url='chat.min.js.map',base='./core/js'" -o ./core/js/chat.min.js -c -m

# 压缩 notify.js
uglifyjs ./core/js/notify.js --source-map "url='notify.min.js.map',base='./core/js'" -o ./core/js/notify.min.js -c -m

# 压缩 music.js
uglifyjs ./core/js/music.js --source-map "url='music.min.js.map',base='./core/js'" -o ./core/js/music.min.js -c -m

# 压缩 account.js
uglifyjs ./core/js/account.js --source-map "url='account.js.map',base='./core/js'" -o ./core/js/account.min.js -c -m

# 压缩 talk.js
uglifyjs ./core/js/editor/talk.js --source-map "url='talk.js.map',base='./core/js'" -o ./core/js/editor/talk.min.js -c -m
```