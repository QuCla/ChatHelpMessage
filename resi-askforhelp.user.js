// ==UserScript==
// @name         ReSi- Hilfeanfrage Chat
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  shows current rank for rettungssimulator.online
// @author       QuCla
// @match        https://rettungssimulator.online/*
// @updateURL    https://github.com/QuCla/resi-chat-askforhelp/raw/main/resi-askforhelp.user.js
// @grant        none
// @run-at       document-end
// ==/UserScript==
'use strict';

var userLang = navigator.language;
var langObj;

const deText = {
    title   : 'Verbandshilfe anfordern',
    text    : 'Möchtest du den Verband um Hilfe bitten?',
    confirm : 'Ja',
    cancel  : 'Ne doch nicht',
    Button  : `<button type='button' class='button button-success button-round button-info' data-tooltip='Bitte den Verband im Chat um Hilfe.' id='callHelp_alert'>
                <i class='fa-solid fa-phone-rotary'></i>
                Hilfe rufen! </button>`
}

const enText = {
    title   : 'Request association help',
    text    : 'Do you really want to ask for help?',
    confirm : 'Yes',
    cancel  : 'No',
    Button  : `<button type='button' class='button button-success button-round button-info' data-tooltip='Ask your association for support.' id='callHelp_alert'>
                <i class='fa-solid fa-phone-rotary'></i>
                Call Help! </button>`
}


function CallHelpBuild() {
    $('.button-group.fixed-footer')
        .prepend(langObj.Button);}
                
function associationMember() {
    var answer = 3;
    var VTest = '';
    $.ajax({
        url: "/api/association/",
        dataType: "json",
        type : "GET",
        success : function(r) {
            VTest = r.status;
            }
        })
    if (VTest != 'error'){
        answer = 1;
    return answer;
    }
}

if(userLang.match('de')){
    langObj = deText;
    }
else{
    langObj = enText;
    }

if(location.pathname.includes('mission/') & associationMember() == 1){
    var missionID = +$('.detail-title').attr('missionid');
    var UserMissionID = +$('.detail-title').attr('usermissionid');

    CallHelpBuild();;

    $(document).on('click', '#callHelp_alert', () => {
        //Abfrage über modal
        modal(langObj.title, langObj.text, langObj.confirm, langObj.cancel, function CallHelp () {

            $.ajax({
                url: "/api/shareMission",
                dataType: "json",
                type : "POST",
                data: {
                    "userMissionID": UserMissionID
                },
                success : function(r) {
                    console.log(r);
                }
            });

            $.ajax({
                url: "/api/sendCustomMissionLog",
                dataType: "json",
                type : "POST",
                data: {
                    'message': 'Bitte unterstütze mich',
                    "userMissionID": UserMissionID
                },
                success : function(r) {
                    console.log(r);
                }
            });

        });
        //Deaktivieren nach Benutzung
        $('#callHelp_alert').addClass('button-disabled')
    });
};
