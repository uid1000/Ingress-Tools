// ==UserScript==
// @id             iitc-plugin-checkpoint-countdown@uid1000
// @name           IITC plugin: Checkpoint Countdown
// @category       Info
// @version        0.0.1.20210311
// @description    Show the time and ETA to checkpoint, plus the cycle end date/time
// @updateURL      https://localhost/checkpoint-countdown.user.js
// @downloadURL    https://localhost/checkpoint-countdown.user.js
// @include        https://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

// Forked from https://iitc.modos189.ru/build/release/plugins/score-cycle-times.user.js

function wrapper(plugin_info) {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if (typeof window.plugin !== 'function') window.plugin = function () { };

    //PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
    //(leaving them in place might break the 'About IITC' page or break update checks)
    plugin_info.buildName = 'release';
    plugin_info.dateTimeVersion = '20190315.122355';
    plugin_info.pluginId = 'score-cycle-times';
    //END PLUGIN AUTHORS NOTE



    // PLUGIN START ////////////////////////////////////////////////////////

    const etaHighlightUnder = 15; // minutes

    // use own namespace for plugin
    window.plugin.scoreCycleTimes = function () { };

    window.plugin.scoreCycleTimes.CHECKPOINT = 5 * 60 * 60; //5 hours per checkpoint
    window.plugin.scoreCycleTimes.CYCLE = 7 * 25 * 60 * 60; //7 25 hour 'days' per cycle


    window.plugin.scoreCycleTimes.setup = function () {

        // add a div to the sidebar, and basic style
        $('#sidebar').append('<div id="score_cycle_times_display"></div>');
        $('#score_cycle_times_display').css({ 'color': '#ffce00' });

        window.plugin.scoreCycleTimes.update();
    };



    window.plugin.scoreCycleTimes.update = function () {

        // checkpoint and cycle start times are based on a simple modulus of the timestamp
        // no special epoch (other than the unix timestamp/javascript's 1970-01-01 00:00 UTC) is required

        // when regional scoreboards were introduced, the first cycle would have started at 2014-01-15 10:00 UTC - but it was
        // a few checkpoints in when scores were first added

        var now = new Date()    //.getTime();

        var cycleStart = Math.floor(now.getTime() / (window.plugin.scoreCycleTimes.CYCLE * 1000)) * (window.plugin.scoreCycleTimes.CYCLE * 1000);
        var cycleEnd = cycleStart + window.plugin.scoreCycleTimes.CYCLE * 1000;

        var checkpointStart = Math.floor(now.getTime() / (window.plugin.scoreCycleTimes.CHECKPOINT * 1000)) * (window.plugin.scoreCycleTimes.CHECKPOINT * 1000);
        var checkpointEnd = checkpointStart + window.plugin.scoreCycleTimes.CHECKPOINT * 1000;

        var nextCP = new Date(checkpointEnd);

        var formatRow = function (label, time) {

            //var timeStr = unixTimeToString(time,true);

            let timeFormat = { hour: 'numeric', minute: 'numeric' };
            let dateFormat = { month: 'numeric', day: 'numeric' };

            //let now = new Date();
            let rowTime = new Date(time);
            //var timeStr = time.toLocaleTimeString(navigator.language, { second: false });
            //var timeStr = time.toISOString();
            let timeStr = new Intl.DateTimeFormat(navigator.language, timeFormat).format(rowTime);

            if (rowTime.getDate() !== now.getDate()) {
                // not today- display date with time
                timeStr = new Intl.DateTimeFormat(navigator.language, dateFormat).format(rowTime) + ' ' + timeStr;
            }

            return '<tr><td>' + label + '</td><td style="text-align: right;">' + timeStr + '</td></tr>';
        };

        var formatTime = function (time) {

            let timeFormat = { hour: 'numeric', minute: 'numeric' };
            let dateFormat = { month: 'numeric', day: 'numeric' };

            //let now = new Date();
            let rowTime = new Date(time);
            //var timeStr = time.toLocaleTimeString(navigator.language, { second: false });
            //var timeStr = time.toISOString();
            let timeStr = new Intl.DateTimeFormat(navigator.language, timeFormat).format(rowTime);

            if (rowTime.getDate() !== now.getDate()) {
                // not today- display date with time
                timeStr = new Intl.DateTimeFormat(navigator.language, dateFormat).format(rowTime) + ' ' + timeStr;
            }

            return timeStr;
        };

        // hopefully making timeDiff a Date() object will factor in DST changes...
        var timeDiff = new Date(nextCP - now);
        //var timeDiffSeconds = (nextCP - now) / 1000;
        var diffHours = Math.floor(timeDiff / 1000 / 60 / 60);
        var diffMinutes = Math.floor(timeDiff / 1000 / 60 % 60);
        var diffSeconds = Math.floor(timeDiff / 1000 % 60);

        var h = (diffHours == 0 ? '' : diffHours + ':');
        var mm = ('0' + diffMinutes).slice(-2);
        var ss = ('0' + diffSeconds).slice(-2);

        var eta = `${h}${mm}:${ss}`;
        //var eta = new Intl.DateTimeFormat(navigator.language, { hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(timeDiff);

        var html = `
            <table>     <!-- style="width: 100%;" -->
                <tr>
                    <td${diffHours == 0 ? ' style="color: #000;background-color: #fc0;"' : ''}>Next checkpoint</td>
                    <td style="text-align:right;${diffHours == 0 ? 'color: #000;background-color: #fc0;' : ''}">${formatTime(checkpointEnd)}</td>
                </tr>
                <tr>
                    <td${diffHours == 0 && diffMinutes < etaHighlightUnder
                ? ' style="background-color: #f00; text-align: center; font-weight: bold; font-size: 150%; padding: 5px;">'
                : '>&nbsp;'}
                        ${eta}
                    </td>
                    <td></td>
                </tr>
                <tr style="height: 1px;">
                    <td colspan="2" style="height: 1px; background-color: #999;"></td>
                </tr>
                <tr>
                    <td>Cycle end</td>
                    <td style="text-align:right;">${formatTime(cycleEnd)}</td>
                </tr>
            </table>
            `;

        $('#score_cycle_times_display').html(html);

        setTimeout(window.plugin.scoreCycleTimes.update, 1000); //checkpointEnd - now);
    };





    var setup = window.plugin.scoreCycleTimes.setup;

    // PLUGIN END //////////////////////////////////////////////////////////


    setup.info = plugin_info; //add the script info data to the function as a property
    if (!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if (window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);
