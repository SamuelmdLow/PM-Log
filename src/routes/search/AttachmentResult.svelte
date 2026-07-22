<script lang="ts">
    import M3UVideo from "../M3UVideo.svelte";
    import { dateString } from "$lib/utils";
    let {attachment} = $props();
    let json = $derived(JSON.parse(attachment.json));

    function formatTranscript(transcriptJson) {
        if (transcriptJson['transcription']) {
            return transcriptJson['transcription']["segments"].map(s => s['text']);
        }
    }

    let transcript = $derived(formatTranscript(json));
</script>

<div class="result-container">
    <div class="video-container">
        <M3UVideo video_json={json} />
        <div class="video-meta">
            <a href={attachment.source}>
                <h3>{attachment.title}</h3>
            </a>
            <div>{dateString(attachment.publishedAt)}</div>
        </div>
    </div>

    <div class="transcript-container">
        {#if transcript}
        <div class="transcript">
            {#each transcript as segment}
            <p>{segment}</p>
            {/each}
        </div>
        {:else}
        <p>No transcript generated yet.</p>
        {/if}
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
        .transcript {
            padding-right: 1em;
            position: absolute;
            top: 0;
            bottom: 0;
            overflow-y: scroll;
        }
        .video-container {
            max-width: 400px;
        }
    }
    @media screen and (max-width: 780px) {
        .transcript-container {
            max-height: 300px;
            width: auto;
            margin: 0 1em 1em 1em;
            overflow-y: scroll;
        }
        .result-container {
            flex-direction: column;
        }
    }
</style>