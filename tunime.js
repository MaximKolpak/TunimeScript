// ==UserScript==
// @name         Tunime Script
// @namespace    UserScripts
// @version      0.3
// @description  helps to maintain a list of watched TV shows, with a nice visual part
// @author       Anoncer (https://github.com/MaximKolpak)
// @match        https://yummyanime.club/*
// @grant        GM_addStyle
// @grant        GM.getValue
// @grant        GM.setValue
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @icon         https://www.google.com/s2/favicons?domain=yummyanime.club
// @updateURL    https://raw.githubusercontent.com/MaximKolpak/TunimeScript/main/tunime.js
// ==/UserScript==

(function(){
'use strict';
    const WebAuth = "https://shikimori.one/oauth/authorize?client_id=EKv75uNamao_d3uzFREIfo71l6cpyG2IEUIpBxFgcAM&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&response_type=code&scope=user_rates+comments+topics";
    const parametrs = "TunimeUser";

    const request = {
        user_agent: "Tunime",
        client_id: "EKv75uNamao_d3uzFREIfo71l6cpyG2IEUIpBxFgcAM",
        client_secret: "WKDClcJlc3grYpBWDbxqQyAFEW0SquPgrvTdXeAfhds"
    }

    const web_buffer = {
        authorization: "",
        animeinfo: "",
        settings: "",
        search: "",
        maine: ""
    }

    const urls = {
        maine: "https://cdn.jsdelivr.net/gh/MaximKolpak/TunimeScript/visualpart/jstype/main.tunime",
        authorization: "https://cdn.jsdelivr.net/gh/MaximKolpak/TunimeScript/visualpart/jstype/auth.tunime",
        style: "https://cdn.jsdelivr.net/gh/MaximKolpak/TunimeScript/visualpart/jstype/style.tunime"
    }

    let param = {
        access: "",
        refresh: "",
        date: ""
    }

    let visual_id = ""; //Visual id on style and correct work


    $(document).ready(async function(){
        visual_id = RandomUi();
        SimpleGet(urls.style, (data) => {
            let e = visual_id;          //Load style
            GM_addStyle(eval(data));    //Import style
        });
        web_buffer.maine = await SimpleGetAsync(urls.maine);
        AddMain(visual_id);
        CheckLogin();
    });

    /**
     * Adding to body Main
     * @param {String} e 
     */
    function AddMain(e){
        $("body").append(eval(web_buffer.maine));
    }


    /**
     * Check authorization shikomiri
     */
    async function CheckLogin(){
        param = await GM.getValue(parametrs, param);
        if(param.access == "" || param.refresh == ""){
            web_buffer.authorization = await SimpleGetAsync(urls.authorization);
            Authorization(visual_id);
        }
    }

    function Authorization(e){
        $(`.script-window-${visual_id}`).append(eval(web_buffer.authorization));
        $(`.authorization-token-${visual_id}`).attr("href", WebAuth);

        UiControl();

        function UiControl(){
            $(`.script-bg-${visual_id}`).click(function(){
                if($(`.script-bg-${visual_id}`).hasClass(`script-bg-hide-${visual_id}`)){
                    $(`.script-bg-${visual_id}`).removeClass(`script-bg-hide-${visual_id}`);
                }else{
                    $(`.script-bg-${visual_id}`).addClass(`script-bg-hide-${visual_id}`);
                    $(`.script-window-${visual_id}`).addClass(`script-window-hide-${e}`);
                }
            });

            $(`.script-header-${visual_id}`).click(function(){
                 if($(`.script-bg-${visual_id}`).hasClass(`script-bg-hide-${visual_id}`)){
                    $(`.script-bg-${visual_id}`).removeClass(`script-bg-hide-${visual_id}`);
                    $(`.script-window-${visual_id}`).removeClass(`script-window-hide-${e}`);
                 }
            });
        }
    }


    /**
     * Simple Get Async Request
     * @param {String} e - url to get response
     * @returns {String} - return data from response
     */
    async function SimpleGetAsync(e){
        return new Promise((resolve)=>{
            $.get(e).done((data)=>resolve(data));
        });
    }

    /**
     * Simple Get Request
     * @param {String} e - url to get response
     * @param {Function} f - to complete response
     */
    function SimpleGet(e, f){
        $.get(e).done((data)=>f(data));
    }

    /**
     * Generate random id
     * @returns {String} - Random count lenght 23
     */
    function RandomUi(){
        return Math.random().toString(36).substring(2, 9);
    }
})();
