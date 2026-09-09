<script lang="ts">
import {now} from "../lib/time.js";
import { timeString } from "$lib/utils.js";
let {name, timezone} = $props();
let canvas;
let date = $derived(convertedDate($now, timezone));
let totalSeconds = $derived(getTotalSeconds(date));

function convertedDate(date, timezone) {
    return new Date(date.toLocaleString('en-US', {
        timeZone: timezone
    }));
}

function getTotalSeconds(date) {
    const totalSeconds = (date.getHours()*60*60) + (date.getMinutes()*60) + (date.getSeconds());
    return totalSeconds;
}

function drawClock(totalSeconds) {
    var ctx = canvas.getContext("2d");
    const radius = 50;
    const linewidth = 3.5;

    ctx.clearRect(0, 0, radius*2, radius*2);

    ctx.lineCap = "round";
    ctx.lineWidth = linewidth;
    ctx.strokeStyle = "black";

    ctx.beginPath();
    ctx.arc(radius, radius, radius-linewidth, 0, 2 * Math.PI);
    ctx.stroke();

    //const text = String(Math.floor(totalSeconds / (60*60)));
    //ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    //ctx.font = String(radius) + "px roboto";
    //ctx.textAlign = "center"; 
    //ctx.fillText(text, radius, radius*1.35, radius);
    
    const tickLength = 5;
    const tickWidth = 5;
    const tickCount = 8
    for (let i=0; i< tickCount; i++) {
        const tickAngle = (i/tickCount) * (Math.PI * 2);

        ctx.lineWidth = tickWidth;
        ctx.beginPath();
        ctx.moveTo(radius - (radius-tickLength-tickWidth)*Math.cos(tickAngle), radius-(radius-tickLength-tickWidth)*Math.sin(tickAngle));
        ctx.lineTo(radius - (radius-tickWidth)*Math.cos(tickAngle), radius-(radius-tickWidth)*Math.sin(tickAngle));
        ctx.stroke();
    }

    const hourAngle = (totalSeconds / (60*60*12)) * 2 * Math.PI;
    const hourHandLength = radius * 0.75;
    const hourHandWidth = 5;
    drawHand(hourAngle, hourHandLength, hourHandWidth);

    const minutesAngle = ((totalSeconds % (60*60))/(60*60)) * 2 * Math.PI;
    const minutesHandLength = radius * 0.9;
    console.log((totalSeconds % (60*60))/(60*60));
    const minutesHandWidth = 4;
    drawHand(minutesAngle, minutesHandLength, minutesHandWidth);

    function drawHand(angle, length, width) {
        angle = angle + Math.PI/2;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(radius+(width)*Math.cos(angle), radius+(width)*Math.sin(angle));
        ctx.lineTo(radius-(length-width-linewidth)*Math.cos(angle), radius-(length-width-linewidth)*Math.sin(angle));
        ctx.stroke();
    }

}

$effect(() => {
    drawClock(totalSeconds)
})

</script>

<div class="clock">
    <canvas width="100" height="100" bind:this={canvas}></canvas>
    <div class="label"><time datetime={date.toString()}>{new Intl.DateTimeFormat('en-US', {  timeStyle: "short", }).format(date).toLowerCase() + "."}</time> {name.split(",")[0]}</div>
</div>

<style>
    .clock {
        width: fit-content;
        flex-direction: column;
        display: flex;
    }
    .label {
        font-size: 0.75em;
        text-align: center;
        color: var(--color-text-300);
        width: 100%;
        text-transform: uppercase;
    }
    time {
        display: block;
    }
    canvas {
        width: 60px;
        height: auto;
        margin-inline: auto;
        margin-bottom: 0.25em;
        opacity: 0.2;
    }
</style>