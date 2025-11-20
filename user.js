// ==UserScript==
// @name         GeoFS A350 Better Sound Addon
// @namespace    https://geofs.com
// @version      1.0
// @description  Better sound pack for A350 – flaps, takeoff, boarding, touchdown
// @match        https://*/geofs.php*
// @match        http://*/geofs.php*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    //-----------------------------------------------------------------------
    // --- CONFIG: AUDIO FILES (bạn thay link MP3 vào đây)
    //-----------------------------------------------------------------------

    const flapSound = new Audio("A350flapsound.mp3");
    const takeoffSound = new Audio("TakeoffA350.mp3");
    const boardingSound = new Audio("passenger-boarding-noise_RgCFFnpO.mp3");
    const touchdownSound = new Audio("touchdownA350.mp3");

    boardingSound.loop = true;

    //-----------------------------------------------------------------------
    // --- ONLY ACTIVATE FOR A350
    //-----------------------------------------------------------------------
    function isA350() {
        return geofs.aircraft.instance.id == 24;
    }

    //-----------------------------------------------------------------------
    // --- CREATE UI
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

    // hide / show
    document.getElementById("a350HideBtn").onclick = () => {
        if (ui.style.display !== "none") {
            ui.style.display = "none";
            setTimeout(() => alert("Bảng Boarding đã ẩn — reload trang để hiện lại"), 100);
        }
    };

    // play boarding
    document.getElementById("boardingPlay").onclick = () => {
        if (isA350()) boardingSound.play();
    };

    // stop boarding
    document.getElementById("boardingStop").onclick = () => {
        boardingSound.pause();
        boardingSound.currentTime = 0;
    };

    //-----------------------------------------------------------------------
    // --- EVENT: FLAP SOUND
    //-----------------------------------------------------------------------

    let lastFlap = 0;
    setInterval(() => {
        if (!isA350()) return;

        let currentFlap = geofs.aircraft.instance.animationValues.flaps;

        if (currentFlap !== lastFlap) {
            flapSound.currentTime = 0;
            flapSound.play();
            lastFlap = currentFlap;
        }
    }, 150);

    //-----------------------------------------------------------------------
    // --- EVENT: TAKEOFF FULL THRUST SOUND
    //-----------------------------------------------------------------------

    setInterval(() => {
        if (!isA350()) return;

        let thrust = geofs.aircraft.instance.animationValues.throttle;

        if (thrust > 0.95) { 
            if (takeoffSound.paused) {
                takeoffSound.currentTime = 0;
                takeoffSound.play();
            }
        }
    }, 200);

    //-----------------------------------------------------------------------
    // --- EVENT: TOUCHDOWN SOUND
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
