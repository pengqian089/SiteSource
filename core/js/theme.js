layui.use(["util"],function(){
    let util = layui.util;
    let theme = ["","purple","magenta","red","volcano","orange","gold","lime","green","cyan","blue","geek-blue"];
    let defaultSkin = $("link#skinColor");
    if(typeof(layui.data("theme").color) === "undefined"){
        layui.data("theme",{key :"color",value:"purple"});
    }
    let currentTheme = layui.data('theme').color;
    
    if(currentTheme === ""){
        defaultSkin.remove();
    }else{
        let href = `/css/Theme/${currentTheme}.css`;
        if(defaultSkin.length === 0){
            defaultSkin = $("<link>").attr({"rel":"stylesheet","id":"skinColor","href":href});
            $("head").append(defaultSkin);
        }else{
            defaultSkin.attr("href",href);    
        }        
    }
    util.fixbar({
        bar1:"&#xe66a;",click:function(type){
            if(type === "bar1"){
                let skinColor = $("link#skinColor");
                console.log(currentTheme);
                let index = theme.indexOf(currentTheme) + 1;
                
                if(index === theme.length) {
                    currentTheme = "";
                    layui.data("theme",{key :"color",value:""});                    
                    skinColor.remove();
                    return;
                }                
                currentTheme = theme[index];
                layui.data("theme",{key :"color",value:theme[index]});
                let skinHref = `/css/Theme/${theme[index]}.css`;
                if(skinColor.length === 0){
                    skinColor = $("<link>").attr({"rel":"stylesheet","id":"skinColor","href":skinHref});
                    $("head").append(skinColor);
                    return;
                }
                skinColor.attr("href",skinHref);
            }
        }
    });
});