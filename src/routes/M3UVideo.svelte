<script lang="ts">
    import { onMount } from 'svelte';
    import Hls from 'hls.js';
    let { video_json } = $props();
    let loaded = false;

    let video; 

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
    <video bind:this={video} poster={video_json['video_poster']} controls> </video>
</div>

<style>
	video {
		margin-bottom: 1em;
		display: block;
		width: 100%;
	}
    .video-wrapper {
        position: relative;
    }
    button {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
</style>
