<script>
    import { durationString } from "$lib/utils";
    import { onMount } from "svelte";
    let {content, video, diarizedSegments, currentTime=$bindable(), videoElem=$bindable()} = $props();
    let transcriptElem;


    function highlightWord(data, time) {
        let words = structuredClone(data.words);
        const edge = data.words.filter(word => word.start < time);
        if (edge.filter(word => word.end > time).length > 0) {
            const i = edge.length-1;
            words[i].word = '<span class="current-word">' + words[i].word + '</span>';
        }
        return words.map(word => word.word).join('');
    }

    function getTranscriptLineOffset(lineElem) {
        return lineElem.parentNode.offsetTop + lineElem.offsetTop - 25;
    }

    function jumpToLine(behavior, time) {
        const i = content.map(segment => segment.data.end).filter(ordering => ordering < time).length;
                    
        const line = transcriptElem.getElementsByClassName('transcript-line')[i];
        transcriptElem.scrollTo({
            top: getTranscriptLineOffset(line),
            left: 0,
            behavior: behavior,
            });
    }

    onMount(() => {
        if (transcriptElem && content.length > 0) {
            const i = content.map(segment => segment.score).reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
            currentTime = content[i].data.start;
            jumpToLine("instant", currentTime);
        }
        setInterval(() => {
            if (videoElem && transcriptElem) {

                if (!videoElem.paused) {
                    jumpToLine("smooth", currentTime);
                }
            }

        }, 10);
    })

</script>

{#if content.length > 0}
<div bind:this={transcriptElem} class="transcript">
    {#each diarizedSegments as speaker_segment}
    <div class="speaker-group">
        <div class="speaker-label">{speaker_segment.speaker}</div>
        {#each speaker_segment.segments as segment}
        <p class="transcript-line" style={"--score: " + segment["score"]}>
            <button class="transcript-line-time-button" onclick={() => {video.seek(segment["data"]["start"]); jumpToLine("smooth", segment["data"]["start"]);}}>{durationString(segment["data"]["start"])}</button>
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
    {/each}
</div>
{:else}
<p>No transcript generated yet.</p>
{/if}

<style>
    .speaker-label {
        font-weight: 600;
        position: sticky;
        top: 0;
        background: var(--color-bg-1);
    }
    .speaker-group {
        position: relative;
    }
    .transcript-line + .speaker-label {
        margin-top: 1em;
    }
    .transcript-line {
        margin-left: 0.25em;
        margin-block: 0.5em;
        scroll-margin: 1em;
    }
    .transcript-line mark {
        background-color: rgb(240, 31, 66, calc(0.5* var(--score)));
        border-left: 0.25em solid rgb(240, 31, 66, var(--score));
        padding-left: 0.25em;
    }
    .transcript-line-time-button {
        font-size: 0.75em;
        color: var(--color-text-300);
    }
    .transcript {
        overflow-y: scroll;
        font-size: 15px;
    }


    @media screen and (min-width: 781px) {
        .transcript {
            padding-right: 1em;
            position: absolute;
            top: 0;
            bottom: 0;
        }
    }
    @media screen and (max-width: 780px) {
        .transcript {
            max-height: 300px;
        }
    }

</style>