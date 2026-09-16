<script lang="ts">
    import { onMount } from 'svelte';
    import Hls from 'hls.js';
    let { video=$bindable(), video_json, currentTime=$bindable(), diarizedSegments=null } = $props();
    let loaded = false;
    let paused = $state(true);

    export function seek(time:number) {
        console.log(time);
        video.currentTime = time;
        video.play();
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

    function createSpeakerIndicator(diarizedSegments) {
        let speakerDurations = {};
        for (let speakerSegments of diarizedSegments) {
            if (!(speakerSegments['speaker'] in speakerDurations)) {
                    speakerDurations[speakerSegments['speaker']] = 0;
            }
            speakerDurations[speakerSegments['speaker']] += speakerSegments['segments'][speakerSegments['segments'].length-1]['data']['end'] - speakerSegments['segments'][0]['data']['start'];
        }

        let orderedSpeakers = Object.keys(speakerDurations).map(function(key) {
          return [key, speakerDurations[key]];
        });
        orderedSpeakers.sort(function(first, second) {
            return second[1] - first[1];
        })

        const colours = ["red", "yellow", "orange"];
        let speakerColours = {};
        for (let i=0; i< orderedSpeakers.length; i++) {
            if (i < colours.length) {
                speakerColours[orderedSpeakers[i][0]] = colours[i];
            } else {
                const tone = 150 - (100 * (i-colours.length)/(orderedSpeakers.length - colours.length));
                speakerColours[orderedSpeakers[i][0]] = "rgb(" + String(tone) + ", " + String(tone) + ", " + String(tone) + ")";
            }
        }
        
        let lg = "to right, grey";
        for (let speakerSegments of diarizedSegments) {
            let speakerColour = speakerColours[speakerSegments['speaker']];
            const start = progress(speakerSegments['segments'][0]['data']['start']);
            const end = progress(speakerSegments['segments'][speakerSegments['segments'].length-1]['data']['end']);
            lg = lg + ", grey " + start + ", " + speakerColour + " " + start + ", " + speakerColour + " " + end + ", grey " + end;
        }
        console.log(lg);
        return "linear-gradient(" + lg + ")";
    }

    onMount(() => {
        video.addEventListener("play", () => {
            if (!loaded) {
                loadVideo();
                loaded=true;
            }
        })
    })
</script>

<div class="video-wrapper">
    <video onclick={() => paused ? video.play() : video.pause()} bind:paused={paused} bind:this={video} bind:currentTime={currentTime} poster={video_json['video_poster']} playsinline> </video>
    {#if paused}
        <button onclick={video.play()}>Unpause</button>
    {/if}
    <div class="bar">
        {#if diarizedSegments}
        <div class="speakerbar innerbar" style:background={createSpeakerIndicator(diarizedSegments)}></div>
        {/if}
        <div onclick={(e) => video.currentTime = video_json["video_duration"] * e.offsetX/e.target.offsetWidth} class="playbar innerbar" style:--progress={progress(currentTime)}></div>
    </div>
</div>

<style>
	video {
		display: block;
		width: 100%;
	}
    .video-wrapper {
		margin-bottom: 1em;
        position: relative;
    }
    .bar {
        height: 6px;
        width: 100%;
        position: relative;
    }
    .bar .innerbar {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }
    .playbar {
        --viewed: rgba(255, 255, 255, 0);
        --unviewed: rgba(0, 0, 0, 0.3);
        background: linear-gradient(to right, var(--viewed) var(--progress), var(--unviewed) var(--progress), var(--unviewed));
    }
    button {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
</style>
