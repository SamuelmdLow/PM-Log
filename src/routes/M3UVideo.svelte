<script lang="ts">
    import muxjs from 'mux.js';
    import { onMount } from 'svelte';    
    let { video_json } = $props();
    let blob = $state(new Blob());
    let src = $state("");

    onMount(() => {
        //let m3u8 = video_json["video_m3u8"] + ".m3u8";

        // https://github.com/videojs/mux.js/#npm

        let segments = [
            'https://cpac-vod.cdn.vustreams.com/cpac/vod/a217041e-48c9-406d-be9c-27d0ae054a6d/a217041e-48c9-406d-be9c-27d0ae054a6d_nodrm_5ed6ae4b-647c-41fc-b623-9a3e736985e7.ism/a217041e-48c9-406d-be9c-27d0ae054a6d_nodrm_5ed6ae4b-647c-41fc-b623-9a3e736985e7-video=600000-1.ts'
        ];

        // Replace this value with your files codec info
        let mime = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

        let mediaSource = new MediaSource();
        let transmuxer = new muxjs.mp4.Transmuxer();

        src = URL.createObjectURL(mediaSource);
        mediaSource.addEventListener("sourceopen", appendFirstSegment);

        function appendFirstSegment(){
            if (segments.length == 0){
                return;
            }

            URL.revokeObjectURL(src);
            let sourceBuffer = this.addSourceBuffer(mime);
            sourceBuffer.addEventListener('updateend', appendNextSegment);

            transmuxer.on('data', (segment) => {
                let data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
                data.set(segment.initSegment, 0);
                data.set(segment.data, segment.initSegment.byteLength);
                sourceBuffer.appendBuffer(data);
                // reset the 'data' event listener to just append (moof/mdat) boxes to the Source Buffer
                transmuxer.off('data');
            })

            fetch(segments.shift()).then((response)=>{
                return response.arrayBuffer();
            }).then((response)=>{
                transmuxer.push(new Uint8Array(response));
                transmuxer.flush();
            })
        }

        function appendNextSegment(){
                transmuxer.on('data', (segment) =>{
                this.appendBuffer(new Uint8Array(segment.data));
                transmuxer.off('data');
            })

            if (segments.length == 0){
                // notify MSE that we have no more segments to append.
                mediaSource.endOfStream();
            }

            segments.forEach((segment) => {
                // fetch the next segment from the segments array and pass it into the transmuxer.push method
                fetch(segments.shift()).then((response)=>{
                    return response.arrayBuffer();
                }).then((response)=>{
                    transmuxer.push(new Uint8Array(response));
                    transmuxer.flush();
                })
            })
        }
    })
</script>

<video poster={video_json["video_poster"]} src={src} controls>

</video>


<style>

video {
    margin-bottom: 1em;
    display: block;
    width: 100%;
}
</style>