// ==UserScript==
// @name         Tunime Script
// @namespace    UserScripts
// @version      0.4
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
        maine: "",
        message: ""
    }

    const urls = {
        maine: "https://cdn.jsdelivr.net/gh/MaximKolpak/TunimeScript@master/visualpart/jstype/main.tunime",
        authorization: "https://cdn.jsdelivr.net/gh/MaximKolpak/TunimeScript/visualpart/jstype/auth.tunime",
        style: "https://cdn.jsdelivr.net/gh/MaximKolpak/TunimeScript@master/visualpart/jstype/style.tunime",
        message: "https://cdn.jsdelivr.net/gh/MaximKolpak/TunimeScript@master/visualpart/jstype/message.tunime"
    }

    let param = {
        access: "",
        refresh: "",
        created_at: "",
        expires_in: ""
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
        SimpleGet(urls.message, (data) => {web_buffer.message = data;});
        
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
         }else{
             RefreshToken((data, status)=>{
                 if(status == "success"){
                     param.access = data.access_token;
                     param.refresh = data.refresh_token;
                     param.created_at = data.created_at;
                     param.expires_in = data.expires_in;
                     GM.setValue(parametrs, param);
                     GetMe();
                 }
             });
        }
    }

    async function GetMe(){
        user_object = await GetAsync('/api/users/whoami');
        ShowMessage(`Account: ${user_object.nickname}`, "Welcome");
    }

    /**
     * 
     * @param {Function} func - Function response 
     */
    function RefreshToken(func){
        $.ajax({
            url: 'https://shikimori.one/oauth/token',
            method: 'POST',
            beforeSend: function(req){
                req.setRequestHeader('User-Agent', request.user_agent);
            },
            data:{
                grant_type: "refresh_token",
                client_id: request.client_id,
                client_secret: request.client_secret,
                refresh_token: param.refresh,
            }
        }).always(function(data, status){func(data, status);});
    }


    /**
     * Show Authorization Visual Login
     * @param {String} Visual ID * 
     */
    function Authorization(e){
        $(`.script-window-${visual_id}`).append(eval(web_buffer.authorization));
        $(`.authorization-token-${visual_id}`).attr("href", WebAuth);

        UiControl();

        /**
         * Ui Control Click and Another
         */
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

            $(`.script-form-${visual_id} > button`).click(async function(){
                let data = $(`#token_${visual_id}`).val();
                if(data != ""){
                    PostAuth(data, Auth);
                }
            });
        }

        /**
         * Authinification api Shikimori
         * @param {String} code - Token from auth 
         * @param {*} func - Function response
         */
        function PostAuth(code, func){
                $.ajax({
                    url: 'https://shikimori.one/oauth/token',
                    method: 'POST',
                    beforeSend: function(req){
                        req.setRequestHeader('User-Agent', request.user_agent);
                    },
                    data:{
                        grant_type: "authorization_code",
                        client_id: request.client_id,
                        client_secret: request.client_secret,
                        code: code,
                        redirect_uri: "urn:ietf:wg:oauth:2.0:oob"
                    }
                }).always(function(data, status){func(data, status);});
        }

        /**
         * Response api shikimori
         * @param {Object} data 
         * @param {String} status 
         */
        function Auth(data, status){
            if(status == "success"){
                param.access = data.access_token;
                param.refresh = data.refresh_token;
                param.created_at = data.created_at;
                param.expires_in = data.expires_in;
                param = GM.setValue(parametrs, param);
                GetMe();
            }
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

    function ShowMessage(mes1, mes2){
        let e = visual_id;
        $("body").append(eval(web_buffer.message));
        $(`.script-message-${e} > span:nth-child(1)`).html(mes1);
        $(`.script-message-${e} > span:nth-child(2)`).html(mes2);
        let t = 0;
        $(`.script-message-${e}`).addClass(`script-message-show-${e}`);
        let i = setInterval(()=>{
            if(t >= 2){
                $(`.script-message-${e}`).removeClass(`script-message-show-${e}`);
            }
            if(t >= 3){
                clearInterval(i);
                $(`.script-message-${e}`).remove();
            }
            t += 1;
        },1000);
    }


    //Main Functions 

    const base_url = "https://shikimori.one";
    let user_object;

    async function GetAsync(url){
        return new Promise((resolve)=>{
            $.ajax({
                method: "GET",
                url: base_url + url,
                beforeSend: function(req){
                    req.setRequestHeader('User-Agent', request.user_agent);
                    req.setRequestHeader('Authorization', 'Bearer ' + param.access);
                }
            }).done(function(data){resolve(data)});
        });
    }
})();
