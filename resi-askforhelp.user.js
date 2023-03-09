// ==UserScript==
// @name         ReSi - Hilfeanfrage Chat
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  script for rettungssimulator.online
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
    label   : 'Dein Hilferuf:',
    placeholder : 'Bitte unterstütze mich!',
    confirmText : 'Absenden',
    cancelText : 'Abbruch',
    Button  : `<button type='button' class='button button-success button-round button-info' data-tooltip='Bitte den Verband im Chat um Hilfe.' id='callHelp_alert'>
                <i class='fa-solid fa-phone-rotary'></i>
                Hilfe rufen! </button>`
}

const enText = {
    title   : 'Request association support',
    label   : 'Your request text:',
    placeholder : 'Please help me!',
    confirmText : 'Submit',
    cancelText : 'Cancel',
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

    CallHelpBuild();

    $(document).on('click', '#callHelp_alert', () => {
        //Abfrage über modal
        async function iModal(){
            var title = langObj.title;
            var label = langObj.label;
            var placeholder = langObj.placeholder;
            var confirmText = langObj.confirmText;
            var cancelText = langObj.cancelText;

            let PostMessage = await inputModal({title, label, placeholder, confirmText, cancelText});
            //Bei Abbruch wird die Funktion nicht weiter ausgeführt, Mission wird nicht freigegeben

            if (PostMessage == ''){
                PostMessage = 'Bitte unterstütze mich!'
            }

            //Mission im Verband teilen
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
            
            //Senden der Nachricht im einsatzloh
            $.ajax({
                url: "/api/sendCustomMissionLog",
                dataType: "json",
                type : "POST",
                data: {
                    'message': PostMessage,
                    "userMissionID": UserMissionID
                },
                success : function(r) {
                    console.log(r);
                }
            });          

            //Deaktivieren nach Benutzung
            $('#callHelp_alert').addClass('button-disabled')
        }
        //Aufrufen der Modalfunktion
        iModal();
    });
};




