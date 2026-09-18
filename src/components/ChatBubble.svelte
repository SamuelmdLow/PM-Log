<script>
import { dateString } from "$lib/utils";
let {message} = $props();
let passage_num = $state(0);
let passage = $derived(message.passages ? message.passages[passage_num] : null)

function flipPassage(dir) {
    passage_num = (passage_num+dir+message.passages.length) % message.passages.length;
}
</script>

{#if passage }
    <div class={"message " + message.sender}>

        <div class="header">
            {#if message.passages.length > 1}
            <span class="message-page-indicator">
                <button onclick={(e) => flipPassage(-1)}>{"<"}</button>
                {passage_num+1}/{message.passages.length}
                <button onclick={(e) => flipPassage(1)}>{">"}</button>
            </span>
            {/if}
            <a href={passage.attachment.source} title={passage.attachment.title}>{dateString(passage.attachment.published_at)}</a>
        </div>

        {passage.passage}
    </div>
{:else}
    <div class={"message " + message.sender}>
        {message.text}
    </div>
{/if}

<style>
    .message {
        margin: 1em;
        padding: 1em 0.5em;
        position: relative;
        border-radius: 1em;
        max-width: 75%;
        width: fit-content;
        animation-name: messagePopup;
        animation-duration: 0.5s;
    }
    .message.user {
        margin-left: auto;
        background: #eee;
        color: #111;
    }
    .message.bot {
        background: #aa1111;
        color: white;
    }
    .message .header {
        margin-bottom: 0.5em;
        font-size: 0.75em;
    }
    .message-page-indicator {
        color: white;
        font-weight: 600;
    }
    .message-page-indicator button{
        color: white;
        font-weight: 600;
    }
</style>