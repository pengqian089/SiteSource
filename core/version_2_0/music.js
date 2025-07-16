$(function () {
    let cdnBaseAddress = $("meta[name=cdn-base-address]").attr("content");
    if (typeof (Amplitude) === "undefined") {
        $.when(
            $.getScript(`${cdnBaseAddress}/lib/amplitudejs/amplitude.min.js`),
            $.getScript(`${cdnBaseAddress}/lib/amplitudejs/visualizations/michaelbromley.js`),
            $.Deferred(function (deferred) {
                $(deferred.resolve);
            })
        ).done(function () {
            musicInit();
        });
    } else {
        musicInit();
    }

    $(document).on("pjax:send", function () {
        Amplitude?.stop()
    });
});

function musicInit() {
    let songElements = document.getElementsByClassName('song'),
        songs = [],
        title = document.title,
        volumeElement = document.getElementsByClassName("amplitude-volume-slider")[0],
        volume = 50,
        lineNo = 0,
        preLine = 2,
        lineHeight = 20,
        lycElement = document.getElementsByClassName("meta-lyrics")[0],
        lyricsItems = new Map(),
        enableScrollingLyrics = true, // 设置为 false 可禁用歌词滚动效果
        searchInput = document.getElementById('music-search-input'),
        searchClearBtn = document.getElementById('search-clear-btn'),
        songsContainer = document.querySelector('.songs-list-container'),
        allSongs = [];
    if (localStorage["music-volume"] === undefined) {
        localStorage["music-volume"] = volumeElement.value;
    } else {
        volume = parseInt(localStorage["music-volume"]);
        volumeElement.value = isNaN(volume) ? 50 : volume;
    }
    volumeElement.addEventListener("change", function () {
        localStorage["music-volume"] = this.value;
    });
    for (let i = 0; i < songElements.length; i++) {
        /*
          Show and hide the play button container on the song when the song is clicked.
        */
        songElements[i].addEventListener('click', function () {
            this.querySelectorAll('.play-button-container')[0].style.display = 'none';
        });

        songs.push({
            "name": songElements[i].dataset["title"],
            "artist": songElements[i].dataset["artist"],
            "album": songElements[i].dataset["group"],
            "url": songElements[i].dataset["url"],
            "cover_art_url": songElements[i].dataset["cover"],
            "visualization": "michaelbromley_visualization",
            "lrc": songElements[i].dataset["lrc"],
            "time_callbacks": {
                0: function () {
                    let metadata = Amplitude.getActiveSongMetadata();
                    lineNo = 0;
                    if (!lyricsItems.has(metadata.url)) {
                        const xhr = new XMLHttpRequest();
                        xhr.onreadystatechange = () => {
                            if (xhr.readyState === 4) {
                                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                                    lyricsItems.set(metadata.url, parseLyrics(xhr.responseText));
                                    lyricsToPanel(metadata.url);
                                } else {
                                    console.log(`LRC file request fails: status ${xhr.status}`);
                                }
                            }
                        };
                        xhr.open('get', metadata.lrc, true);
                        xhr.send(null);
                    } else {
                        lyricsToPanel(metadata.url);
                    }
                    //console.log("0 start.")
                }
            }
        });
    }

    function lyricsToPanel(key) {
        lycElement.innerHTML = "";
        const lyrics = lyricsItems.get(key);
        //console.log(lyrics);
        
        // 根据配置决定是否启用滚动歌词效果
        if (enableScrollingLyrics) {
            lycElement.classList.add("scrolling-lyrics");
        } else {
            lycElement.classList.remove("scrolling-lyrics");
        }
        
        let ul = document.createElement("ul");
        for (let item of lyrics) {
            let li = document.createElement("li");
            li.innerHTML = item[1];
            ul.appendChild(li);
        }
        lycElement.appendChild(ul);
        highLight();
    }

    function highLight() {
        const liElements = document.querySelectorAll(".meta-lyrics ul li");
        for (let item of liElements) {
            item.classList.remove("active", "long-text", "medium-text");
        }
        if (liElements.length > 0) {
            const currentLi = liElements[lineNo];
            currentLi.classList.add("active");
            
            // 只有在启用滚动歌词时才检测文本长度并添加滚动效果类
            if (enableScrollingLyrics && lycElement.classList.contains("scrolling-lyrics")) {
                const textLength = currentLi.textContent.length;
                if (textLength > 50) {
                    currentLi.classList.add("long-text");
                } else if (textLength > 30) {
                    currentLi.classList.add("medium-text");
                }
            }
        }
        if (lineNo > preLine) {
            const ul = document.querySelectorAll(".meta-lyrics ul")[0];
            if (ul) {
                ul.style.transform = `translateY(-${((lineNo - preLine + 2) * lineHeight)}px)`;
            }
        }

    }

    function getLineNumber(currentTime, key) {
        const lyrics = lyricsItems.get(key);
        for (let i = lineNo; i < lyrics.length; i++) {
            if (currentTime < lyrics[i + 1][0] && currentTime > lyrics[i][0]) {
                lineNo = i;
                break;
            }
        }
    }

    function parseLyrics(lrcContent) {
        if (lrcContent) {
            lrcContent = lrcContent.replace(/([^\]^\n])\[/g, (match, p1) => p1 + '\n[');
            const lyric = lrcContent.split('\n');
            let lrc = [];
            const lyricLen = lyric.length;
            for (let i = 0; i < lyricLen; i++) {
                // match lrc time
                const lrcTimes = lyric[i].match(/\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g);
                // match lrc text
                const lrcText = lyric[i]
                    .replace(/.*\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g, '')
                    .replace(/<(\d{2}):(\d{2})(\.(\d{2,3}))?>/g, '')
                    .replace(/^\s+|\s+$/g, '');

                if (lrcTimes) {
                    // handle multiple time tag
                    const timeLen = lrcTimes.length;
                    for (let j = 0; j < timeLen; j++) {
                        const oneTime = /\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/.exec(lrcTimes[j]);
                        const min2sec = oneTime[1] * 60;
                        const sec2sec = parseInt(oneTime[2]);
                        const msec2sec = oneTime[4] ? parseInt(oneTime[4]) / ((oneTime[4] + '').length === 2 ? 100 : 1000) : 0;
                        const lrcTime = min2sec + sec2sec + msec2sec;
                        lrc.push([lrcTime, lrcText]);
                    }
                }
            }
            // sort by time
            lrc = lrc.filter((item) => item[1]);
            lrc.sort((a, b) => a[0] - b[0]);
            lrc[lrc.length] = [lrc[lrc.length - 1][0] + 3, ""];
            return lrc;
        } else {
            return [];
        }
    }

    function setTitle(){
        const metadata = Amplitude.getActiveSongMetadata();
        document.querySelector(".song-name[data-amplitude-song-info=name]")?.setAttribute("title",metadata.name);
    }

    /*
      Initializes AmplitudeJS
    */
    Amplitude.init({
        "songs": songs,
        "volume": volume,
        "callbacks": {
            'initialized':function(){
                setTitle();
            },
            'song_change':function(){
                setTitle();
            },
            'play': function () {
                document.getElementById('album-art').style.visibility = 'hidden';
                document.getElementById('large-visualization').style.visibility = 'visible';
                let musicMetadata = Amplitude.getActiveSongMetadata();
                document.title = `正在播放《${musicMetadata.name}》 - ${musicMetadata.artist} ${title}`;
            },
            'pause': function () {
                document.getElementById('album-art').style.visibility = 'visible';
                document.getElementById('large-visualization').style.visibility = 'hidden';
                document.title = title;
            },
            'timeupdate': function () {
                const metadata = Amplitude.getActiveSongMetadata();
                if (lyricsItems.get(metadata.url) !== undefined) {
                    // console.log(event);
                    // console.log(lyricsItems);
                    const lyrics = lyricsItems.get(metadata.url);
                    const currentTime = (event.currentTarget || event.target).currentTime;
                    //console.log(currentTime);
                    if (lineNo === lyrics.length) return;
                    //lineNo = getLineNumber(currentTime, metadata.url);
                    getLineNumber(currentTime, metadata.url);
                    highLight();
                    //lineNo++;
                    //console.log(lineNo);

                } else {
                    lycElement.innerHTML = "loading...";
                }
            },
            'seeked': function () {
                //console.log(event);
                const metadata = Amplitude.getActiveSongMetadata();
                if (lyricsItems.get(metadata.url) !== undefined) {
                    const currentTime = (event.currentTarget || event.target).currentTime;
                    const lyrics = lyricsItems.get(metadata.url);
                    for (let i = 0; i < lyrics.length; i++) {
                        if (currentTime < lyrics[i + 1][0] && currentTime < lyrics[i][0]) {
                            lineNo = i;
                            break;
                        }
                    }
                }
            }
        },
        waveforms: {
            sample_rate: 100
        },
        visualization: 'michaelbromley_visualization',
        visualizations: [
            {
                object: MichaelBromleyVisualization,
                params: {}
            }
        ]
    });
    // 移除动态设置可视化画板高度的代码，让CSS的aspect-ratio自然处理高度匹配
    
    // 初始化搜索功能
    initSearchFunction();
    
    function initSearchFunction() {
        // 获取所有歌曲元素
        allSongs = Array.from(document.querySelectorAll('.song'));
        
        if (!searchInput || !searchClearBtn || !songsContainer) {
            console.warn('搜索框元素未找到');
            return;
        }
        
        // 搜索输入事件
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.trim().toLowerCase();
            
            // 显示/隐藏清除按钮
            if (searchTerm) {
                searchClearBtn.style.display = 'flex';
            } else {
                searchClearBtn.style.display = 'none';
            }
            
            filterSongs(searchTerm);
        });
        
        // 清除搜索
        searchClearBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchClearBtn.style.display = 'none';
            filterSongs('');
            searchInput.focus();
        });
        
        // 按 ESC 键清除搜索
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchClearBtn.style.display = 'none';
                filterSongs('');
                searchInput.blur();
            }
        });
    }
    
    function filterSongs(searchTerm) {
        if (!searchTerm) {
            // 显示所有歌曲
            allSongs.forEach(song => {
                song.style.display = 'flex';
                song.classList.remove('search-highlight');
            });
            return;
        }
        
        let visibleCount = 0;
        
        allSongs.forEach((song, index) => {
            const title = song.dataset.title?.toLowerCase() || '';
            const artist = song.dataset.artist?.toLowerCase() || '';
            
            // 检查歌曲标题或艺术家是否包含搜索词
            const isMatch = title.includes(searchTerm) || artist.includes(searchTerm);
            
            if (isMatch) {
                song.style.display = 'flex';
                song.classList.add('search-highlight');
                visibleCount++;
            } else {
                song.style.display = 'none';
                song.classList.remove('search-highlight');
            }
        });
        
        // 如果没有找到匹配项，显示提示
        if (visibleCount === 0) {
            showNoResultsMessage();
        } else {
            hideNoResultsMessage();
        }
    }
    
    function showNoResultsMessage() {
        let noResultsMsg = document.querySelector('.no-search-results');
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-search-results';
            noResultsMsg.innerHTML = `
                <div class="no-results-content">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                        <line x1="11" y1="8" x2="11" y2="12"></line>
                        <line x1="11" y1="16" x2="11" y2="16"></line>
                    </svg>
                    <p>未找到匹配的歌曲</p>
                    <span>试试搜索其他关键词</span>
                </div>
            `;
            songsContainer.appendChild(noResultsMsg);
        }
        noResultsMsg.style.display = 'flex';
    }
    
    function hideNoResultsMessage() {
        const noResultsMsg = document.querySelector('.no-search-results');
        if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }
}