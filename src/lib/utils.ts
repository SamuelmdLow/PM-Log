export function timeString(datetime: string, now: Date) {
    const date = new Date(datetime);
    const delta = now.valueOf() - date.valueOf()
    if (Math.abs(delta) < 60 * 60 * 1000) {
        if (delta > 0 && delta < 60 * 1000) {
            return "Just now.";
        }

        if (delta < 0) {
            return "In " + Math.floor(Math.abs(delta) / (60 * 1000)) + "m.";
        }

        return Math.floor(delta / (60 * 1000)) + "m ago.";
    } 
    return new Intl.DateTimeFormat('en-US', {  timeStyle: "short", }).format(date).toLowerCase() + ".";
}

export function dateString(datetime: string) {
    const date = new Date(datetime);
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    } as Intl.DateTimeFormatOptions;
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function durationString(duration: number) {
    const hours = Math.floor(duration / (60*60));
    const minutes = Math.floor((duration % (60*60)) / 60);
    const seconds =  Math.floor(duration % 60);

    let string = "";
    if (hours > 0) {
        string = string + String(hours) + ":";
    }
    string = string + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    return string;
}