<script lang="ts">
    // https://www.d3indepth.com/geographic/
    import { geoPath, geoOrthographic, geoGraticule } from 'd3-geo';
    import { onMount } from 'svelte';
    import { select } from 'd3';
    import { zoom, zoomTransform, zoomIdentity } from 'd3-zoom';

    let {focus = $bindable()} = $props();
    let rotation = $state(focus);

    onMount(() => {

        const canvas = <HTMLCanvasElement> document.getElementById("canvas");
            
        let context = < CanvasRenderingContext2D> canvas.getContext('2d');

        let geojson: Record<string, any> = {}

        let projection = geoOrthographic()
        .scale(300);

        let geoGenerator = geoPath()
        .projection(projection)
        .pointRadius(4)
        .context(context);
        // 79.3839347, -43.6534817
        projection.rotate(rotation);

        
        function update() {
            const difLong = focus[0] - rotation[0];
            const difLat = focus[1] - rotation[1];
            const difTotal = Math.sqrt(Math.pow(difLong, 2) + Math.pow(difLat, 2));
            if (difTotal > 1) {
                const ratio = 1/Math.sqrt(difTotal);

                rotation[0] = rotation[0] + (difLong * ratio);
                rotation[1] = rotation[1] + (difLat * ratio);

                projection.rotate(rotation);
            }

            context.clearRect(0, 0, 800, 600);

            context.lineWidth = 0.5;
            context.strokeStyle = '#333';

            context.beginPath();
            geoGenerator({type: 'FeatureCollection', features: geojson.features})
            context.stroke();

            // Graticule
            let graticule = geoGraticule();
            context.beginPath();
            context.strokeStyle = '#ccc';
            geoGenerator(graticule());
            context.stroke();
        }
        fetch('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')
            .then(response => response.text())
            .then(response => {
                geojson = JSON.parse(response);
                window.setInterval(update, 100);
            })
    })
</script>

<div id="content">
    <canvas id="canvas" width="800" height="600"></canvas>
</div>

<style>
    canvas {
        width: 100%;
    }
</style>