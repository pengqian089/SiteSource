$location = Get-Location
$path = $location.Path
[System.Console]::WriteLine($path)
[string[]]$cssPaths = 
    "./core/lib/layui/css/layui.css",
    "./library/music-player/index.css",
    "./core/css/site.css",
    "./core/css/site-dark.css",
    "./core/css/nprogress.min.css",
    "./core/font-awesome/css/font-awesome.css",
    "./library/prism/prism.css",
    "./core/lib/tocbot/tocbot.css",
    "./core/lib/sakura-js/sakura.min.css",
    "./core/lib/photoswipe/photoswipe.css",
    "./core/lib/photoswipe/default-skin/default-skin.css",
    "./fonts/chinese-font.css",
    "./core/css/friends.css",
    "./core/css/comment.css",
    "./core/css/steam.css",
    "./core/css/mumble.css",
    "./core/css/markdown.css",
    "./core/css/bookmark.css",
    "./core/css/video.css",
    "./core/css/music.css"

foreach($item in $cssPaths){
    #$newCssPath = $item.Replace("./", "").Replace("/", "\");
    #$filePath = [System.IO.Path]::Combine($path,$newCssPath)
    $filePath = [System.IO.Path]::Combine($path,$item)
    if(![System.IO.File]::Exists($filePath)){
        #[System.Console]::WriteLine()
        Write-Host "$filePath file not exists" -ForegroundColor red
        return;
    }
}

$inputParameters = [System.String]::Join(" ",$cssPaths)

#Write-Host $inputParameters

#cleancss -o ./core/css/global.min.css $inputParameters --with-rebase

$execute = "cleancss -o ./core/css/global.min.css $inputParameters --with-rebase --debug"

Invoke-Expression $execute