<script lang="ts">
    import TitleHeader from '../TitleHeader.svelte';
    import { dateString } from '$lib/utils';

    let messages = $state([]);
    let query = $state("");
    let loading = $state(false);

    function sendQuestion() {
        messages.push({
            'sender': 'user',
            'text': query
        })
        const api = "https://pmlog.ca/api/question/1/?q=" + encodeURI(query);
        query = "";
        loading = true;
        fetch(api).then(response => response.json()).then(data => {
            if (data.length > 0) {
                for (let answer of data) {
                    messages.push({
                        'sender': 'bot',
                        'text':answer.passage,
                        'attachment': answer.attachment,
                    });
                }
            } else {
                messages.push({
                    'sender': 'bot',
                    'text': "idk.",
                });
            }
            loading = false;
        })
    }
</script>

<svelte:head>
	<title>Carney Chat - PM Log</title>
	<meta name="description" content="Gimmicky interface for searching machine transcriptions of Canadian Prime Minsiter Mark Carney's remarks." />
</svelte:head>

<section>
    <TitleHeader />

    <div class="container">

        <div class="messages">
            {#each messages as message}
                <div class={"message " + message.sender}>
                    {#if message.attachment}
                    <div class="header">
                    {dateString(message.attachment.published_at)} - <a href={message.attachment.source}>{message.attachment.title}</a>
                    </div>
                    {/if}
                    {message.text}
                </div>
            {/each}
            {#if loading}
                <div class="message bot">Loading...</div>
            {/if}
        </div>

        <div class="message-console">
            <input onkeypress={e => {if (e.key == "Enter") sendQuestion()}} bind:value={query} type="text" placeholder="Ask Mark Carney something...">
            <button onclick={sendQuestion}>Send</button>
        </div>
    </div>
</section>

<style>
    @keyframes messagePopup {
        from {opacity: 0; top: 1em;}
        to {opacity: 1; top: 0;}
    }

    .container {
        margin: auto;
        max-width: 800px;
        position: relative;
    }
    .messages {
        margin-bottom: 5em;
        min-height: 50vh;
    }
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
    .message-console {
        margin: auto;
        display: flex;
        position: sticky;
        bottom: 0;
        z-index: 10;
        background: var(--color-bg-1);
        padding: 2em;
    }
    .message-console input {
        width: 100%;
        padding: 0.5em 1em;
        border: 2px solid var(--color-border);
        border-radius: 0.5em;
        background: var(--translucent);
        color: var(--color-text-200);
        font-size: 1em;
    }
    .message-console button {
        margin-left: 1em;
        padding-inline: 1em;        
        background: var(--translucent);
        color: var(--color-text-200);
        border: 2px solid var(--color-border);
        border-radius: 0.5em;
    }
</style>