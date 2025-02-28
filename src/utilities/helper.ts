import path from "path";
import { FirebaseTorrentInfo } from "../models/firebase";

export function limit(actual: number, max: number) {
    if (actual > max) return max;
    return actual;
}

export function isVideo(path: string) {

    const video_extensions = [
        "3g2",
        "3gp",
        "aaf",
        "asf",
        "avchd",
        "avi",
        "drc",
        "flv",
        "m2v",
        "m4p",
        "m4v",
        "mkv",
        "mng",
        "mov",
        "mp2",
        "mp4",
        "mpe",
        "mpeg",
        "mpg",
        "mpv",
        "mxf",
        "nsv",
        "ogg",
        "ogv",
        "qt",
        "rm",
        "rmvb",
        "roq",
        "svi",
        "vob",
        "webm",
        "wmv",
        "yuv"
    ];

    const splited = path.split(".");
    const ext = splited[splited.length - 1];

    for (const e of video_extensions) {
        if (e == ext.toLowerCase()) return true;
    }

    return false;
}

export function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`
}

export function MerlMovieResponse(info: FirebaseTorrentInfo) {
    let qualities: Array<{
        name: string,
        link: string,
    }> = [];

    let subtitles: Array<{
        name: string,
        link: string,
    }> = [];

    for (let deb of info["real-debrid"] || []) {
        qualities.push({
            name: `${formatBytes(deb.download.filesize || 0)} ${deb.download.filename}`,
            link: (deb.download.download || ""),
        });
    }

    return {
        qualities,
        subtitles,
    }

}