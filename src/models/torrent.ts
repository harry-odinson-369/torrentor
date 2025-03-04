export type Torrent = {
    id: string,
    name: string,
    info_hash: string,
    leechers: string,
    seeders: string,
    num_files: string,
    size: string,
    username: string,
    added: string,
    status: string,
    category: string,
    imdb: string,
}

export type TorrentFile = {
    path: string,
    size: number,
}

export function ToMagnetUri(torrent: Torrent): string {
    var uri = "magnet:"
        + "?xt=urn:btih:" + torrent.info_hash
        + "&dn=" + encodeURIComponent(torrent.name || "")
        + "&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80"
        + "&tr=udp%3A%2F%2Fopentor.org%3A2710"
        + "&tr=udp%3A%2F%2Ftracker.ccc.de%3A80"
        + "&tr=udp%3A%2F%2Ftracker.blackunicorn.xyz%3A6969"
        + "&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969"
        + "&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969"
        + "&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337"
        + "&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce"
        + "&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce"
        + "&tr=udp%3A%2F%2Ftracker.bittor.pw%3A1337%2Fannounce"
        + "&tr=udp%3A%2F%2Fpublic.popcorn-tracker.org%3A6969%2Fannounce"
        + "&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce"
        + "&tr=udp%3A%2F%2Fexodus.desync.com%3A6969"
        + "&tr=udp%3A%2F%2Fopen.demonii.com%3A1337%2Fannounce";
    return uri;
}