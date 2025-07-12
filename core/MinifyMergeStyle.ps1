$location = Get-Location
$path = $location.Path
[System.Console]::WriteLine($path)
[string[]]$cssPaths = 
    "./core/lib/layui/css/layui.css",
    "./library/music-player/index.css",
    "./core/css/site.css",
    "./core/css/site-dark.css",
    "./core/css/nprogress.min.css",
    "./core/css/version_2_0/pager_version_2_0.css",
    "./core/css/version_2_0/home_version_2_0.css",
    "./core/css/version_2_0/right_version_2_0.css",
    "./core/css/version_2_0/article_list_version_2_0.css",
    "./core/css/version_2_0/article_read_version_2_0.css",
    "./core/css/version_2_0/timeline_version_2_0.css",
    "./core/font-awesome/css/font-awesome.css",
    "./library/prism/prism.css",
    "./core/lib/tocbot/tocbot_version_2_0.css",
    "./core/lib/sakura-js/sakura.min.css",
    "./core/lib/photoswipe/photoswipe.css",
    "./core/lib/photoswipe/default-skin/default-skin.css",
    "./fonts/chinese-font.css",
    "./core/css/version_2_0/friends_version_2_0.css",
    "./core/css/version_2_0/comment_version_2_0.css",
    "./core/css/version_2_0/steam_version_2_0.css",
    "./core/css/version_2_0/mumble_version_2_0.css",
    "./core/css/version_2_0/home_version_2_0.css",
    "./core/css/version_2_0/home_version_2_0.css",
    "./core/css/version_2_0/home_version_2_0.css",
    "./core/css/markdown.css",
    "./core/css/version_2_0/bookmark_version_2_0.css",
    "./core/css/video.css",
    "./core/css/version_2_0/music_version_2_0.css",
    "./core/css/version_2_0/notification_version_2_0.css",
    "./core/css/version_2_0/albums_version_2_0.css"

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