<script lang="ts">
    import { onMount } from "svelte";
    import { base } from '$app/paths';
    let {search_value=$bindable(), display} = $props();
    let placeholder = $state("");
    let input;
    let focused = $state(false);

    const placeholders = [
        'Canada-US Trade War?',
        'Alberta Separtism?',
        'Defence spending?',
        'FIFA World Cup?',
        'Variable geometry?',
        'Heated Rivalry?',
        'Davos speech?',
        'Rolling back climate policies?',
        'Free trade agreements?',
    ];

    function setPlaceholder(i:number, direction: number) {
        const interval = setInterval(() => {
            if (placeholder.length == placeholders[i].length && direction > 0) {
                clearInterval(interval);
                setTimeout(() => {
                    setPlaceholder(i, -1);
                }, 7500);
            } else if (placeholder.length == 0 && direction < 0) {
                clearInterval(interval);
                setTimeout(() => {
                    placeholder = "";
                    i = i + 1;
                    if (i >= placeholders.length) {
                        i = 0;
                    }
                    setPlaceholder(i, 1);
                }, 100);
            } else {
                placeholder = placeholders[i].substring(0, placeholder.length + direction);
            }
        }, 100);
    }

    onMount(() => {
        setPlaceholder(0, 1);
        input.addEventListener("focus", () => focused = true);
        input.addEventListener("focusout", () => focused = false);
    })

</script>

<div class={"search-box " + display}>
<form action="{base}/search/">
    <input type="search" name='q' bind:this={input} bind:value={search_value} placeholder={focused ? "Search something..." : placeholder} />
    <button class="button">Search</button>
</form>
</div>

<style>
    .search-box {
        margin: 1.5em auto;
        width: auto;
        max-width: 350px;
        input {
            margin-right: 0.5em;
            font-size: 1em;
            padding: 0.25em 0.5em;
            background: none;
            border:none;
            border-bottom: 2px solid var(--color-border);
            min-width: 0;
            width: 100%;
        }
        ::placeholder {
            color: var(--color-text-300);
            opacity: 1; /* Firefox */
        }

        ::-ms-input-placeholder { /* Edge 12 -18 */
            color: var(--color-text-300);
        }

        form {
            display: flex;
        }
    }
    .central input {
        font-size: 1.25em;
    }
</style>