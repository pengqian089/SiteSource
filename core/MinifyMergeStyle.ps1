$location = Get-Location
$path = $location.Path
[System.Console]::WriteLine($path)

Write-Host "--------------------------------" -ForegroundColor yellow
Write-Host "Merge global style" -ForegroundColor yellow
Write-Host "--------------------------------" -ForegroundColor yellow

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
    "./core/css/version_2_0/markdown_version_2_0.css",
    "./core/css/version_2_0/bookmark_version_2_0.css",
    "./core/css/video.css",
    "./core/css/version_2_0/music_version_2_0.css",
    "./core/css/version_2_0/notification_version_2_0.css",
    "./core/css/version_2_0/albums_version_2_0.css",
    "./core/css/version_2_0/menu_version_2_0.css"

foreach($item in $cssPaths){
    $filePath = [System.IO.Path]::Combine($path,$item)
    if(![System.IO.File]::Exists($filePath)){
        Write-Host "$filePath file not exists" -ForegroundColor red
        return;
    }
}

$inputParameters = [System.String]::Join(" ",$cssPaths)

#Write-Host $inputParameters

#cleancss -o ./core/css/global.min.css $inputParameters --with-rebase

$execute = "cleancss -o ./core/css/global.min.css $inputParameters --with-rebase --debug"

Invoke-Expression $execute

Write-Host "merge global style complete" -ForegroundColor green


Write-Host "--------------------------------" -ForegroundColor yellow
Write-Host "Merge member style" -ForegroundColor yellow
Write-Host "--------------------------------" -ForegroundColor yellow


[string[]]$memberCssPaths = 
    "./member_version_2_0/css/dark-mode.css",
    "./member_version_2_0/css/member.css",
    "./core/font-awesome/css/font-awesome.css"

foreach($item in $memberCssPaths){
    $filePath = [System.IO.Path]::Combine($path,$item)
    if(![System.IO.File]::Exists($filePath)){
        Write-Host "$filePath file not exists" -ForegroundColor red
        return;
    }
}

$memberInputParameters = [System.String]::Join(" ",$memberCssPaths)

$memberExecute = "cleancss -o ./member_version_2_0/css/global-member.min.css $memberInputParameters --with-rebase --debug"

Invoke-Expression $memberExecute

Write-Host "merge member style complete" -ForegroundColor green