# CSS 分块压缩脚本 - 高级版本
param(
    [int]$MaxSizeKB = 500,           # 每个分块的最大大小（KB）
    [string]$OutputPrefix = "global.min", # 输出文件前缀
    [switch]$ByFileCount,            # 按文件数量分组而不是大小
    [int]$FilesPerChunk = 5,         # 当使用 -ByFileCount 时每个分块的文件数
    [switch]$ShowDetails             # 显示详细信息
)

$location = Get-Location
$path = $location.Path
[System.Console]::WriteLine("Working directory: $path")

$maxChunkSize = $MaxSizeKB * 1024

[string[]]$cssPaths = 
    "./core/lib/layui/css/layui.css",
    "./library/music-player/index.css",
    "./core/css/site.css",
    "./core/css/site-dark.css",
    "./core/css/nprogress.min.css",
    "./core/font-awesome/css/font-awesome.css",
    "./library/prism/prism.css",
    "./core/lib/tocbot/tocbot_version_2_0.css",
    "./core/lib/sakura-js/sakura.min.css",
    "./core/lib/photoswipe/photoswipe.css",
    "./core/lib/photoswipe/default-skin/default-skin.css",
    "./fonts/chinese-font.css",
    "./core/css/friends.css",
    "./core/css/comment.css",
    "./core/css/version_2_0/steam_version_2_0.css",
    "./core/css/version_2_0/mumble_version_2_0.css",
    "./core/css/markdown.css",
    "./core/css/version_2_0/bookmark_version_2_0.css",
    "./core/css/video.css",
    "./core/css/music.css"

# 检查所有文件是否存在
Write-Host "Checking file existence..." -ForegroundColor Yellow
foreach($item in $cssPaths){
    $filePath = [System.IO.Path]::Combine($path,$item)
    if(![System.IO.File]::Exists($filePath)){
        Write-Host "$filePath file not exists" -ForegroundColor Red
        return;
    }
}
Write-Host "All files exist!" -ForegroundColor Green

# 分组CSS文件
$chunks = @()

if ($ByFileCount) {
    # 按文件数量分组
    Write-Host "Grouping by file count ($FilesPerChunk files per chunk)..." -ForegroundColor Yellow
    for ($i = 0; $i -lt $cssPaths.Count; $i += $FilesPerChunk) {
        $chunkFiles = $cssPaths[$i..([Math]::Min($i + $FilesPerChunk - 1, $cssPaths.Count - 1))]
        $chunks += ,$chunkFiles
    }
} else {
    # 按文件大小分组
    Write-Host "Grouping by file size (max $MaxSizeKB KB per chunk)..." -ForegroundColor Yellow
    $currentChunk = @()
    $currentChunkSize = 0

    foreach($cssPath in $cssPaths) {
        $filePath = [System.IO.Path]::Combine($path, $cssPath)
        $fileSize = (Get-Item $filePath).Length
        
        # 如果当前分块加上新文件会超过限制，则开始新分块
        if (($currentChunkSize + $fileSize) -gt $maxChunkSize -and $currentChunk.Count -gt 0) {
            $chunks += ,$currentChunk
            $currentChunk = @()
            $currentChunkSize = 0
        }
        
        $currentChunk += $cssPath
        $currentChunkSize += $fileSize
    }

    # 添加最后一个分块
    if ($currentChunk.Count -gt 0) {
        $chunks += ,$currentChunk
    }
}

Write-Host "CSS files will be split into $($chunks.Count) chunks:" -ForegroundColor Green

# 处理每个分块
$totalOriginalSize = 0
$totalCompressedSize = 0

for ($i = 0; $i -lt $chunks.Count; $i++) {
    $chunkFiles = $chunks[$i]
    $outputFile = "./core/css/$OutputPrefix.$($i + 1).css"
    
    Write-Host "`nCreating chunk $($i + 1) with $($chunkFiles.Count) files -> $outputFile" -ForegroundColor Yellow
    
    $chunkOriginalSize = 0
    
    # 计算当前分块的原始大小（总是需要计算，不仅仅是在ShowDetails时）
    foreach($file in $chunkFiles) {
        $fileInfo = Get-Item ([System.IO.Path]::Combine($path, $file))
        $chunkOriginalSize += $fileInfo.Length
        
        # 只有在ShowDetails时才显示详细信息
        if ($ShowDetails) {
            Write-Host "  - $file ($([math]::Round($fileInfo.Length / 1024, 2)) KB)" -ForegroundColor Cyan
        }
    }
    
    # 显示总原始大小（如果开启详细模式）
    if ($ShowDetails) {
        Write-Host "  Total original size: $([math]::Round($chunkOriginalSize / 1024, 2)) KB" -ForegroundColor White
    }
    
    $totalOriginalSize += $chunkOriginalSize
    
    $inputParameters = [System.String]::Join(" ", $chunkFiles)
    $execute = "cleancss -o $outputFile $inputParameters --with-rebase --source-map  "
    
    if ($ShowDetails) {
        $execute += " --debug"
        Write-Host "Executing: $execute" -ForegroundColor Gray
    }
    
    Invoke-Expression $execute
    
    # 显示生成文件的大小
    if ([System.IO.File]::Exists([System.IO.Path]::Combine($path, $outputFile))) {
        $outputFileInfo = Get-Item ([System.IO.Path]::Combine($path, $outputFile))
        $compressedSize = $outputFileInfo.Length
        $totalCompressedSize += $compressedSize
        
        # 安全计算压缩比，避免除以0
        $compressionRatio = if ($chunkOriginalSize -gt 0) {
            [math]::Round((1 - $compressedSize / $chunkOriginalSize) * 100, 1)
        } else {
            0
        }
        
        Write-Host "Generated: $outputFile ($([math]::Round($compressedSize / 1024, 2)) KB)" -ForegroundColor Green
        if ($ShowDetails) {
            Write-Host "Compression ratio: $compressionRatio%" -ForegroundColor Magenta
        }
    }
    
    Write-Host "----------------------------------------" -ForegroundColor Gray
}

# 总结信息
Write-Host "`nSummary:" -ForegroundColor Green
Write-Host "Total original size: $([math]::Round($totalOriginalSize / 1024, 2)) KB" -ForegroundColor White
Write-Host "Total compressed size: $([math]::Round($totalCompressedSize / 1024, 2)) KB" -ForegroundColor White

# 安全计算总体压缩比，避免除以0
$overallCompressionRatio = if ($totalOriginalSize -gt 0) {
    [math]::Round((1 - $totalCompressedSize / $totalOriginalSize) * 100, 1)
} else {
    0
}
Write-Host "Overall compression ratio: $overallCompressionRatio%" -ForegroundColor Magenta
Write-Host "Generated $($chunks.Count) CSS chunk files successfully!" -ForegroundColor Green 