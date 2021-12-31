## https://www.dpangzi.com 静态资源文件

``` powershell
# 压缩css
cleancss -o ./more/css/global.min.css ./more/css/index.css --with-rebase

# 压缩 app.js
uglifyjs ./more/js/app.js --source-map "url='app.min.js.map',base='./more/js'" -o ./more/js/app.min.js -c -m

```