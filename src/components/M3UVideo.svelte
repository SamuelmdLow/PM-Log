<script lang="ts">
    import { onMount } from 'svelte';
    import Hls from 'hls.js';
    let { video=$bindable(), video_json, currentTime=$bindable(), diarizedSegments=null } = $props();
    let loaded = false;
    let paused = $state(true);
    let controlElem;

    let currentSpeaker = $derived(getCurrentSpeaker(diarizedSegments, currentTime));

    export function seek(time:number) {
        if (!loaded) {
            loadVideo();
            loaded=true;
        }
        video.currentTime = time;
    }

    function loadVideo() {
        const videoSrc = video_json["video_m3u8"] + ".m3u8";
        if (Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(videoSrc);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // HLS.js is not supported on platforms that do not have Media Source
            // Extensions (MSE) enabled.
            //
            // When the browser has built-in HLS support (check using `canPlayType`),
            // we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video
            // element through the `src` property. This is using the built-in support
            // of the plain video element, without using HLS.js.
            video.src = videoSrc;
        }
    }

    function progress(time) {
        return String((100*time) / video_json["video_duration"]) + "%";
    }

    function createSpeakerIndicator(diarizedSegments, currentSpeaker) {
        let speakerDurations = {};
        for (let speakerSegments of diarizedSegments) {
            if (!(speakerSegments['speaker'] in speakerDurations)) {
                    speakerDurations[speakerSegments['speaker']] = 0;
            }
            speakerDurations[speakerSegments['speaker']] += speakerSegments['end'] - speakerSegments['start'];
        }

        let orderedSpeakers = Object.keys(speakerDurations).map(function(key) {
          return [key, speakerDurations[key]];
        });
        orderedSpeakers.sort(function(first, second) {
            return second[1] - first[1];
        })


        let speakerColours = {};
        for (let i=0; i< orderedSpeakers.length; i++) {
            const tone = 150 - (100 * i/(orderedSpeakers.length));
            speakerColours[orderedSpeakers[i][0]] = "rgba(" + String(tone) + ", " + String(tone) + ", " + String(tone) + ", 0.33)";
        }
        
        const currentSpeakerColour = "var(--current-speaker)";
        const emptyColour = "#0000";
        let speakerColour = emptyColour;
        let lg = "to right, " + emptyColour;
        for (let speakerSegment of diarizedSegments) {
            if (speakerSegment['speaker'] == currentSpeaker) {
                speakerColour = currentSpeakerColour;
            } else {
                speakerColour = speakerColours[speakerSegment['speaker']];
            }
            const start = progress(speakerSegment['start']);
            const end = progress(speakerSegment['end']);
            lg = lg + ", " + emptyColour + " " + start + ", " + speakerColour + " " + start + ", " + speakerColour + " " + end + ", " + emptyColour + " " + end;
        }
        return "linear-gradient(" + lg + ")";
    }

    function getCurrentSpeaker(diarizedSegments, time){
        for (let speakerSegment of diarizedSegments) {
            if (speakerSegment['start'] <= time && time <= speakerSegment['end']) {
                return speakerSegment['speaker'];
            }
        }
        return null;
    }
    function getVideoDuration(video) {
        return video ? video.duration ? video.duration : video_json['video_duration'] : video_json['video_duration'];
    }

    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds/(60*60));
        const minutes = Math.floor(totalSeconds%(60*60)/ 60);
        const seconds = Math.floor(totalSeconds % 60);
        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;  
        }
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function getVideoDurationAriaText(totalSeconds) {
        const hours = Math.floor(totalSeconds/(60*60));
        const minutes = Math.floor(totalSeconds%(60*60)/ 60);
        const seconds = Math.floor(totalSeconds % 60);

        const text = hours > 0 ?
            `${hours} Hours {minutes} Minutes ${seconds} Seconds`
        :   `${minutes} Minutes ${seconds} Seconds`;
        return text;
    }

    function keyControls(e) {
        console.log(e.code);
        if (e.code == "ArrowRight") {
            e.preventDefault()
            seek(currentTime + 15);
        } else if (e.code == "ArrowLeft") {
            e.preventDefault()
            seek(currentTime - 15);
        } else if (e.code == "Space" || e.code == "KeyK") {
            e.preventDefault()
            if (paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    }

    onMount(() => {
        video.addEventListener("play", () => {
            if (!loaded) {
                loadVideo();
                loaded=true;
            }
        });
        controlElem.addEventListener("keydown", keyControls);
    })
</script>

<div class="video-wrapper" aria-label="Video Player">
    <video tabindex="-1" bind:paused={paused} bind:this={video} bind:currentTime={currentTime} poster={video_json['video_poster']} playsinline> </video>

    <div bind:this={controlElem} class={"video-control-wrapper" + (paused ? " paused":"")}>
        <button tabindex="-1" class="video-inner-play" onclick={() => paused ? video.play() : video.pause()} onkeydown={keyControls}></button>

        <button tabindex="0" aria-label="Play button shortcut k" class={"playbutton " + (paused ? "playbutton boxicons--play-filled" : "boxicons--pause-filled")} onclick={() =>  paused ? video.play() : video.pause()} onkeydown={keyControls}></button>

        <div class="video-control-bottom-row">
            <div class="bars">
                {#if diarizedSegments}
                <div class="speakerbar innerbar" style:background={createSpeakerIndicator(diarizedSegments, currentSpeaker)}></div>
                {/if}
                <div tabindex="0" aria-label="Seeker slider" role="slider" aria-valuenow={currentTime} aria-valuemin="0" aria-valuemax={getVideoDuration(video)} aria-valuetext={getVideoDurationAriaText(currentTime) + " of " + getVideoDurationAriaText(getVideoDuration(video))}
                onkeydown={keyControls} onmouseup={(e) => seek(video_json["video_duration"] * e.offsetX/e.target.offsetWidth)} class="playbar innerbar" style:--progress={progress(currentTime)}></div>
            </div>

            <div class="durationMark">{formatTime(currentTime)} <span class="full-duration">{formatTime(getVideoDuration(video))}</span></div>
        </div>
    </div>
</div>

<style lang="scss">
	video {
		display: block;
		width: 100%;
        height: auto;
        aspect-ratio: 16/9;
	}
    .video-wrapper {
		margin-bottom: 1em;
        position: relative;
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
    }
    .video-control-wrapper, .video-inner-play {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        cursor: default;
    }
    .video-control-bottom-row {
        display: flex;
        position: absolute;
        bottom: 0;
        left: 3em;
        right: 1em;
    }
    .video-inner-play {
        bottom: 2em;
    }
    .video-control-wrapper::before {
        content: "";
        opacity: 0;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: linear-gradient(to bottom, transparent, transparent 80%, #0005);
        transition: opacity 0.5s;
    }
    .video-control-wrapper.paused, .video-control-wrapper:hover {
        &::before {
            opacity: 1;
        }
        > * {
            filter: drop-shadow(0 0 0.5em black);
        }
    }
    .bars {
        width: 100%;
        position: relative;
    }
    .innerbar {
        position: absolute;
        width: 100%;
    }
    .playbar {
        --viewed: #eee;
        --unviewed: grey;
        background: linear-gradient(to right, var(--viewed) var(--progress), var(--unviewed) var(--progress), var(--unviewed));
        bottom: 1em;
        height: 5px;
        border-radius: 1em;
        cursor: pointer;
    }
    .speakerbar {
        --current-speaker: #cf203db2;
        height: 3px;
        bottom: calc(1em + 9px);
    }
    .playbutton {
        position: absolute;
        bottom: .25em;
        left: .5em;
    }
    .durationMark {
        margin-bottom: 0.7em;
        margin-left: 1em;
        flex-shrink: 0;
        color: white;
        font-size: 14px;
        .full-duration {
            &::before {
                content: "/ "
            }
            color: #ddd;
        }
    }
</style>
