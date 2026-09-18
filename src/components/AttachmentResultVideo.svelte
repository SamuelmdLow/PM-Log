<script lang="ts">
    import M3UVideo from "$components/M3UVideo.svelte";
    import Transcript from "$components/Transcript.svelte";
    import { groupBySpeaker } from "$lib/utils";
    import { dateString } from "$lib/utils";
    let {attachment} = $props();
    let json = $derived(JSON.parse(attachment.json));
    let scored_content = $derived(JSON.parse(attachment.scoredContent));
    let currentTime = $state(0);
    let video;
    let videoElem;

    let diarizedSegments = $derived(groupBySpeaker(scored_content));
</script>

<div class="result-container">
    <div class="video-container">
        <M3UVideo bind:currentTime={currentTime} bind:this={video} bind:video={videoElem} video_json={json} diarizedSegments={diarizedSegments} />
        <div class="video-meta">
            <a href={attachment.source}>
                <h3>{attachment.title}</h3>
            </a>
            <div>{dateString(attachment.publishedAt)}</div>
        </div>
    </div>

    <div class="transcript-container">
        <Transcript scored_content={scored_content} diarizedSegments={diarizedSegments} video={video} bind:videoElem={videoElem} bind:currentTime={currentTime} /> 
    </div>
</div>

<style>
    .result-container {
        display: flex;
        position: relative;
        padding-block: 1.5em;
        border-bottom: 1px solid var(--color-border);
    }
    .video-container {
        width: 100%;
        flex-shrink: 0;
    }
    .transcript-container {
        margin: 0em 0 1em 1em;
        width: 100%;
        clip-path: content-box;
        position: relative;
    }

    .video-meta {
        margin: 1em;
    }
    .video-meta h3 {
        margin: 0 0 0.5em 0;
    }

    @media screen and (min-width: 781px) {
        .video-container {
            max-width: 500px;
        }
    }
    @media screen and (max-width: 780px) {
        .transcript-container {
            width: auto;
            margin: 0 1em 1em 1em;
        }
        .result-container {
            flex-direction: column;
        }
    }
</style>