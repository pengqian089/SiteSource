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
        lyricsItems = new Map();
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
            item.classList.remove("active");
        }
        if (liElements.length > 0) {
            liElements[lineNo].classList.add("active");
        }
        if (lineNo > preLine) {
            document.querySelectorAll(".meta-lyrics ul")[0].style.transform = `translateY(-${((lineNo - preLine + 2) * lineHeight)}px)`;
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
    document.getElementById('large-visualization').style.height = document.getElementById('album-art').offsetWidth + 'px';
}