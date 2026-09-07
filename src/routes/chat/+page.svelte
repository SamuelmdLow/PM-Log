<script lang="ts">
    import TitleHeader from '../TitleHeader.svelte';
    import ChatBubble from './ChatBubble.svelte';
    import { dateString } from '$lib/utils';

    let messages = $state([]);
    let query = $state("");
    let loading = $state(0);

    function sendQuestion() {
        messages.push({
            'sender': 'user',
            'text': query
        })
        const api = "https://pmlog.ca/api/question/1/?q=" + encodeURI(query);
        loading = loading + 1;
        query = "";
        fetch(api).then(response => response.json()).then(data => {
            if (data.length > 0) {
                messages.push({
                    'sender': 'bot',
                    'passages': data,
                    });
            } else {
                messages.push({
                    'sender': 'bot',
                    'text': "idk.",
                });
            }
            loading = loading - 1;
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
                <ChatBubble message={message} />
            {/each}
            {#if loading > 0}
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