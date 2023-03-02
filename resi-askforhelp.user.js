// ==UserScript==
// @name         Resi- Hilfeanfrage Chat
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  shows current rank for rettungssimulator.online
// @author       QuCla
// @match        https://rettungssimulator.online/*
// @updateURL    https://github.com/QuCla/resi-rank-navleiste/raw/master/current-rank.user.js
// @grant        none
// @run-at       document-end
// ==/UserScript==
'use strict';

var missionID = 123456789

// Abfrage ob Verbandsmitglied
// De & En
// Variabler Anfragetext
// Link nicht in neuem Tab?
// readme ausfüllen


function CallHelpBuild() {
    $('.button-group.fixed-footer')
        .prepend(`<button type='button' class='button button-success button-round button-info' data-tooltip='Bitte den Verband im Chat um Hilfe.' id='callHelp_alert'>
                    <i class='fa-solid fa-phone-rotary'></i>
                    Hilfe rufen! </button>`);}



if(location.pathname.includes('mission/')){
    missionID = +$('.detail-title').attr('usermissionid')
    CallHelpBuild();

    $(document).on('click', '#callHelp_alert', () => {
        //Abfrage über modal
        modal('Verbandshilfe anfordern', 'Möchtest du den Verband um Hilfe bitten?', 'Ja', 'Ne doch nicht', function CallHelp () {
            // Aufbau der Nachricht
            var ChatMessage = 'Ich benötige eure Hilfe! ' + 'https://rettungssimulator.online/mission/' + missionID

            $.ajax({
                url: "/api/sendAssociationChatMessage",
                dataType: "json",
                type : "POST",
                data: {
                    "message": ChatMessage
                },
                success : function(r) {
                    console.log(r);
                }
            });
        });
    });
};