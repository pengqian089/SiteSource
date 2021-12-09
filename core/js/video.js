(function(){
    const dp = new DPlayer({
        container: document.getElementById('player'),
        //live: true,
        danmaku: {
            api:"/history/chat/",
            id:"3985C6F1199BF2DB0DA0F2A31C117B45",
            maximum:2000,
            token: "tokendemo",
            user:"阿胖",
            bottom: "15%"
            
        },
        theme:"#bb0662",
        video: {
            url: 'https://cdn.jsdelivr.net/gh/pengqian089/SiteSource@latest/Videos/Happy-housemates/1080p.m3u8',
            type: 'hls',
        },
    });
    
})();