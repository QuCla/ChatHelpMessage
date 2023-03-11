// ==UserScript==
// @name         ReSi - Hilfeanfrage Chat
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  script for rettungssimulator.online
// @author       QuCla
// @match        https://rettungssimulator.online/*
// @updateURL    https://github.com/QuCla/resi-chat-askforhelp/raw/main/resi-askforhelp.user.js
// @grant        none
// @run-at       document-end
// ==/UserScript==
'use strict';
// ====== Versionhandling und Updatenachricht ==========
var Script_LocalStorageName = 'QuCla_SandkastenVersion';
var NewVersionNumber = '1.3';
var OldVersionNumber = '1.1';
var UpdateNachricht = 'Das Skript AskForHelp hat ein Update erhalten <br> Das ist neu: <br> Missioncounter des Einsatzlog <br> <br>Viel Spaß & schön dass du das Skript benutzt!';
// =====================================================
var NewUserTitle = 'Du nutzt jetzt das Skript "AskForHelp"!'
var NewUserMessage = 'Es freut mich, dass du mein Skript benutzt. <br>Die Features sind: <br>- Button zum Hilferufen im Einsatzlog <br>- Anzeige offener Einsätze im Log<br>Habe viel Spass damit!'

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
        .prepend(langObj.Button);
    }

function VerHandling(){
    OldVersionNumber = localStorage.getItem(Script_LocalStorageName);
    
    // Neuer User
    if (OldVersionNumber == null){
        systemMessage({
            'title': NewUserTitle,
            'message': NewUserMessage,
            'type': 'info',
            'timeout':5000
        });
    }
    
    // Update
    if (NewVersionNumber != OldVersionNumber & OldVersionNumber != null){
        systemMessage({
            'title': `Update von ` + OldVersionNumber + ` auf ` + NewVersionNumber,
            'message': UpdateNachricht,
            'type': 'info',
            'timeout':5000
        });
    }
    // Neue Version in local schreiben
    localStorage.setItem(Script_LocalStorageName, NewVersionNumber);
}

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

function CountMissionsLog(){
    let MissionsLog = document.getElementById('association-missions-messages').childElementCount;
    let MissionsLog2 = MissionsLog - 1;
    return MissionsLog2
}

function BuildCounter(amount){
    const Einsatzlog = document.querySelector('div[tab="missionLog"]');
    Einsatzlog.insertAdjacentHTML('afterbegin','<span class="badge-container"><span class="badge ncOpenMissionsLog" style="color: #fff !important; background-color: red !important;"><span id="MissionLogCounter">' +
                                  amount + '</span></span></span>');
}

function RewriteCount(){
    let amount = CountMissionsLog();
    let position = document.getElementById('MissionLogCounter');
    position.innerHTML = amount;
}


if(userLang.match('de')){
    langObj = deText;
}
else{
    langObj = enText;
}

//Nachricht über Versionsveränderung
VerHandling();
//Einbinden Anzeige offener Missionen im Einsatzlog
BuildCounter(CountMissionsLog());
//Regelmäßige Aktualisierung
setInterval(RewriteCount, 60000);

//Aktualisierung bei eingehender Mission
socket.on("associationCustomMissionLog", (associationCustomMissionLogObject) =>{
    //Dieser Code wird ausgeführt sobald eine Mission im Einsatzlog pusht
    RewriteCount();
});

//Einbinden Button zum Teilen inklusive Modal für eigene Nachricht
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
                PostMessage = placeholder;
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
            
            //Senden der Nachricht im Einsatzlog
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




