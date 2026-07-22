<script lang="ts">
    import { onMount } from "svelte";
    let {newSearch=$bindable(), display} = $props();
    let placeholder = $state("");

    const placeholders = [
        'Alberta Separtism',
        'Defence spending',
        'FIFA World Cup',
        'Variable geometry',
        'Heated Rivalry',
    ];

    function setPlaceholder(i:number) {
        const interval = setInterval(() => {
            console.log(placeholder);
            if (placeholder.length < placeholders[i].length) {
                placeholder = placeholders[i].substring(0, placeholder.length + 1);
            } else if (placeholder.length == placeholders[i].length) {
                clearInterval(interval);
                setTimeout(() => {
                    placeholder = "";
                    i = i + 1;
                    if (i >= placeholders.length) {
                        i = 0;
                    }
                    setPlaceholder(i);
                }, 5000);
            }
        }, 100);
    }

    onMount(() => {
        setPlaceholder(0);
    })

</script>

<div class={"search-box " + display}>
<form action="search/">
    <input type="search" name='q' bind:value={newSearch} placeholder={placeholder} />
    <button>Search</button>
</form>
</div>

<style>
    .search-box {
        margin: 1.5em auto;
        width: fit-content;
        input {
            margin-right: 0.5em;
            font-size: 1em;
            padding: 0.25em 0.5em;
            background: none;
            border:none;
            border-bottom: 2px solid var(--color-border);
        }
        ::placeholder {
            color: var(--color-text-300);
            opacity: 1; /* Firefox */
        }

        ::-ms-input-placeholder { /* Edge 12 -18 */
            color: var(--color-text-300);
        }
        button {
            padding: 0.5em 1em;
            border: 2px solid var(--color-border);
            border-radius: 0.5em;
            background: var(--translucent);
            color: var(--color-text-200)
        }
        form {
            display: flex;
        }
    }
    .central input {
        text-align: center;
        font-size: 1.25em;
    }
</style>