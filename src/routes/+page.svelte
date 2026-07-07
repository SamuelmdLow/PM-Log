<script lang="ts">
	import { queryStore, gql, getContextClient } from '@urql/svelte';
	import ScheduleItem from './ScheduleItem.svelte';

	const schedule = queryStore({
		client: getContextClient(),
		query: gql`
			query MyQuery {
				allScheduleItems {
					edges {
						node {
							content
							source
							datetime
							location {
								name
							}
							attachments {
								edges {
									node {
										title
										content
										source
									}
								}
							}
						}
					}
				}
			}
		`
	});

	function getDate(edge: any) {
		const date = new Date(edge.node.datetime);
		return date.toDateString();
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>PM Log</h1>

	<div class="schedule">
		<div>
			<h2>Upcoming</h2>
			{#if $schedule.fetching}
				<p>Loading...</p>
			{:else if $schedule.error}
				<p>Oh no... {$schedule.error.message}</p>
			{:else}
				<ul>
					{#each Object.entries(Object.groupBy($schedule.data.allScheduleItems.edges
								.filter((edge: any) => new Date(edge.node.datetime) > new Date())
								.reverse(), getDate)) as [date, items]}
						<li class="date-group">
							<h3>{date}</h3>
							<ul>
								{#each items as item}
									<li>
										<ScheduleItem node={item.node} />
									</li>
								{/each}
							</ul>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div>
			{#if $schedule.fetching}
				<p>Loading...</p>
			{:else if $schedule.error}
				<p>Oh no... {$schedule.error.message}</p>
			{:else}
				<ul>
					{#each Object.entries(Object.groupBy( $schedule.data.allScheduleItems.edges.filter((edge: any) => new Date(edge.node.datetime) <= new Date()), getDate )) as [date, items]}
						<li class="date-group">
							<h3 class="date-heading">{date}</h3>
							<ul>
								{#each items as item}
									<li>
										<ScheduleItem node={item.node} />
									</li>
								{/each}
							</ul>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</section>

<style>
	.schedule {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-start;
		width: 100%;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.date-group {
		margin-bottom: 2rem;
	}

	.date-heading {
		padding-block: 0.75em;
		border-block: 2px solid var(--color-border);
		text-align: center;
	}
</style>
