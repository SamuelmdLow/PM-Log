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

    onMount(() => {
        video.addEventListener("play", () => {
            if (!loaded) {
                loadVideo();
                loaded=true;
            }
        });
        controlElem.addEventListener("keydown", keyControls);

        function keyControls(e) {
            console.log(e.code);
            if (e.code == "ArrowRight") {
                seek(currentTime + 15);
            } else if (e.code == "ArrowLeft") {
                seek(currentTime - 15);
            } else if (e.code == "Space") {
                if (paused) {
                    video.play();
                } else {
                    video.pause();
                }
            }
        }
    })
</script>

<div class="video-wrapper" aria-label="Video Player">
    <video bind:paused={paused} bind:this={video} bind:currentTime={currentTime} poster={video_json['video_poster']} playsinline> </video>

    <div bind:this={controlElem} class={"video-control-wrapper" + (paused ? " paused":"")}>
        <button class="video-inner-play" onclick={() => paused ? video.play() : video.pause()} onkeydown={(e) => e.preventDefault()}></button>
        {#if diarizedSegments}
        <div class="speakerbar innerbar" style:background={createSpeakerIndicator(diarizedSegments, currentSpeaker)}></div>
        {/if}
        <div aria-label="Seeker slider" role="slider" onclick={(e) => seek(video_json["video_duration"] * e.offsetX/e.target.offsetWidth)} class="playbar innerbar" style:--progress={progress(currentTime)}></div>
        <button class={"playbutton " + (paused ? "playbutton boxicons--play-filled" : "boxicons--pause-filled")} onclick={() =>  paused ? video.play() : video.pause()} onkeydown={(e) => e.preventDefault()}>Unpause</button>
    </div>
</div>

<style>
	video {
		display: block;
		width: 100%;
        height: auto;
        aspect-ratio: 16/9;
	}
    .video-wrapper {
		margin-bottom: 1em;
        position: relative;
    }
    .video-control-wrapper, .video-inner-play {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        cursor: default;
    }
    .video-control-wrapper.paused::before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: linear-gradient(to bottom, transparent, transparent 80%, #0003);
    }
    .innerbar {
        position: absolute;
        left: 3em;
        right: 1em;
    }
    .playbar {
        --viewed: red;
        --unviewed: grey;
        background: linear-gradient(to right, var(--viewed) var(--progress), var(--unviewed) var(--progress), var(--unviewed));
        bottom: 1em;
        height: 5px;
        border-radius: 1em;
        cursor: pointer;
    }
    .speakerbar {
        --current-speaker: #cf203d;
        bottom: calc(1em + 7px);
        height: 3px;
    }
    .playbutton {
        position: absolute;
        left: 0.5em;
        bottom: 0.25em;
    }
</style>
