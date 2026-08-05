<script lang="ts">
    import M3UVideo from "../M3UVideo.svelte";
    import { onMount } from "svelte";
    import { dateString, durationString } from "$lib/utils";
    let {attachment} = $props();
    let json = $derived(JSON.parse(attachment.json));
    let scored_content = $derived(JSON.parse(attachment.scoredContent));
    let currentTime = $state(0);
    let video;
    let videoElem;
    let transcriptElem;

    onMount(() => {
        if (videoElem && transcriptElem && transcriptElem.children.length > 0) {
            const i = scored_content.map(segment => segment.score).reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
            videoElem.currentTime = scored_content[i].data.start;
            transcriptElem.scrollTo(0, transcriptElem.children[i].offsetTop);
        }

        setInterval(() => {
            if (videoElem && transcriptElem) {
                currentTime = videoElem.currentTime;

                if (!videoElem.paused) {
                    const i = scored_content.map(segment => segment.data.end).filter(ordering => ordering < videoElem.currentTime).length;
                    transcriptElem.scrollTo({
                        top: transcriptElem.children[i].offsetTop,
                        left: 0,
                        behavior: "smooth",
                        });
                }
            }

        }, 10);
    })

    function highlightWord(data, time) {
        let words = structuredClone(data.words);
        const edge = data.words.filter(word => word.start < time);
        if (edge.filter(word => word.end > time).length > 0) {
            const i = edge.length-1;
            words[i].word = '<span class="current-word">' + words[i].word + '</span>';
        }
        return words.map(word => word.word).join('');
    }
</script>

<div class="result-container">
    <div class="video-container">
        <M3UVideo bind:this={video} bind:video={videoElem} video_json={json} />
        <div class="video-meta">
            <a href={attachment.source}>
                <h3>{attachment.title}</h3>
            </a>
            <div>{dateString(attachment.publishedAt)}</div>
        </div>
    </div>

    <div class="transcript-container">
        {#if scored_content.length > 0}
        <div bind:this={transcriptElem} class="transcript">
            {#each scored_content as segment}
            <p class="transcript-line" style={"--score: " + segment["score"]}>
                <button class="transcript-line-time-button" onclick={video.seek(segment["data"]["start"])}>{durationString(segment["data"]["start"])}</button>
                {#if segment["score"] >  0.25}
                    <mark class={segment["score"] >  0.45 ? "highlight" : ""}>
                        {@html highlightWord(segment["data"], currentTime)}
                    </mark>
                {:else}
                    {@html highlightWord(segment["data"], currentTime)}
                {/if}
            </p>
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
    .transcript-line mark {
        background-color: rgb(255, 0,0, var(--score));
    }
    .transcript-line mark.highlight {
        color: rgba(255,255,255,0.9);
    }
    .transcript-line-time-button {
        font-size: 0.75em;
        color: var(--color-text-300);
    }
    .transcript {
        overflow-y: scroll;
        font-size: 15px;
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
        }
        .video-container {
            max-width: 400px;
        }
    }
    @media screen and (max-width: 780px) {
        .transcript-container {
            width: auto;
            margin: 0 1em 1em 1em;
        }
        .transcript {
            max-height: 300px;
        }
        .result-container {
            flex-direction: column;
        }
    }
</style>