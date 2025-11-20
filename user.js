// ==UserScript==
// @name         GeoFS A350 Better Sound Addon (Force Replace Sound)
// @namespace    https://geofs.com
// @version      2.0
// @description  Replace all A350 sounds with custom audio + auto mute GeoFS default sounds
// @match        https://*/geofs.php*
// @match        http://*/geofs.php*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    //-----------------------------------------------------------------------
    // --- LOAD CUSTOM AUDIO
    //-----------------------------------------------------------------------

    const flapSound = new Audio("https://audio.jukehost.co.uk/VuQjxNQKCK2DLlrDAC4x3guifJTAB6aL");
    const takeoffSound = new Audio("https://audio.jukehost.co.uk/0zyPprmtiLZqqots7hVAf0WOoNhIRFDA");
    const boardingSound = new Audio("https://audio.jukehost.co.uk/VuQjxNQKCK2DLlrDAC4x3guifJTAB6aL");
    const touchdownSound = new Audio("touchdownA350.mp3");
    boardingSound.loop = true;

    //-----------------------------------------------------------------------
    // --- ONLY FOR A350
    //-----------------------------------------------------------------------
    function isA350() {
        return geofs?.aircraft?.instance?.id == 24;
    }

    //-----------------------------------------------------------------------
    // --- MUTE ENTIRE GEOFS BUILT-IN SOUNDS
    //-----------------------------------------------------------------------

    function forceMuteGeoFSSounds() {
        try {
            // 1) mute main sound engine
            geofs.fx.volume = 0;

            // 2) mute all defined aircraft sounds
            if (geofs.aircraft.instance.definition.sounds) {
                for (let snd in geofs.aircraft.instance.definition.sounds) {
                    geofs.aircraft.instance.definition.sounds[snd] = "";
                }
            }

            // 3) mute sound channels
            if (window.geofs && geofs.sound) {
                if (geofs.sound.fx) geofs.sound.fx.gain.gain.value = 0;
                if (geofs.sound.atc) geofs.sound.atc.gain.gain.value = 0;
            }
        } catch (e) {
            console.log("GeoFS mute error:", e);
        }
    }

    //-----------------------------------------------------------------------
    // --- AUTO CHECK + APPLY MUTE WHEN A350 SELECTED
    //-----------------------------------------------------------------------

    setInterval(() => {
        if (isA350()) forceMuteGeoFSSounds();
    }, 500);

    //-----------------------------------------------------------------------
    // --- UI BOARDING PANEL
    //-----------------------------------------------------------------------

    const ui = document.createElement("div");
    ui.id = "a350BoardingPanel";
    ui.style = `
        position: absolute;
        top: 80px;
        left: 20px;
        width: 220px;
        padding: 15px;
        background: rgba(20, 20, 20, 0.6);
        backdrop-filter: blur(8px);
        border-radius: 14px;
        color: white;
        z-index: 99999;
        font-family: 'Segoe UI';
        border: 1px solid rgba(255,255,255,0.15);
    `;

    ui.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <b>A350 Boarding Panel</b>
            <button id="a350HideBtn" style="
                background:#0003;
                border:1px solid #fff2;
                color:white;
                padding:2px 8px;
                border-radius:6px;
                cursor:pointer;">
                Hide
            </button>
        </div>

        <hr style="border-color:#ffffff22;">

        <button id="boardingPlay" style="
            width:100%;
            padding:8px;
            border:none;
            border-radius:8px;
            margin-top:5px;
            background:#222;
            color:white;
            cursor:pointer;">
            ▶ Play Boarding Sound
        </button>

        <button id="boardingStop" style="
            width:100%;
            padding:8px;
            border:none;
            border-radius:8px;
            margin-top:5px;
            background:#222;
            color:white;
            cursor:pointer;">
            ■ Stop Boarding Sound
        </button>
    `;

    document.body.appendChild(ui);

    //-----------------------------------------------------------------------
    // UI BUTTONS
    //-----------------------------------------------------------------------

    document.getElementById("a350HideBtn").onclick = () => {
        ui.style.display = "none";
        setTimeout(() => alert("Bảng Boarding đã ẩn — reload trang để hiện lại"), 100);
    };

    document.getElementById("boardingPlay").onclick = () => {
        if (isA350()) boardingSound.play();
    };

    document.getElementById("boardingStop").onclick = () => {
        boardingSound.pause();
        boardingSound.currentTime = 0;
    };

    //-----------------------------------------------------------------------
    // FLAPS SOUND
    //-----------------------------------------------------------------------

    let lastFlap = 0;
    setInterval(() => {
        if (!isA350()) return;

        let current = geofs.aircraft.instance.animationValues.flaps;
        if (current !== lastFlap) {
            flapSound.currentTime = 0;
            flapSound.play();
            lastFlap = current;
        }
    }, 150);

    //-----------------------------------------------------------------------
    // TAKEOFF THRUST SOUND
    //-----------------------------------------------------------------------

    setInterval(() => {
        if (!isA350()) return;

        let thrust = geofs.aircraft.instance.animationValues.throttle;
        if (thrust > 0.95 && takeoffSound.paused) {
            takeoffSound.currentTime = 0;
            takeoffSound.play();
        }
    }, 200);

    //-----------------------------------------------------------------------
    // TOUCHDOWN SOUND
    //-----------------------------------------------------------------------

    let wasOnGround = false;

    setInterval(() => {
        if (!isA350()) return;

        let onGround = geofs.animation.values.groundContact == 1;
        if (onGround && !wasOnGround) {
            touchdownSound.currentTime = 0;
            touchdownSound.play();
        }
        wasOnGround = onGround;
    }, 120);

})();
