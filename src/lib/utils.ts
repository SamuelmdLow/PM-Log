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