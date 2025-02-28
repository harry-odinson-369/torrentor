import { limit } from "../utilities/helper";
import { Torrent, TorrentFile } from "../models/torrent";

const CATEGORIES = {
    AUDIO: 100,
    VIDEO: 200,
    APPS: 300,
    GAMES: 400,
    PORN: 500
};

function BASE_URL(endpoint: string) {
    return "https://apibay.org" + endpoint;
}
const DEFAULT_TIMEOUT = 5000;

type Options = {
    category?: number,
    limit?: number,
}

export async function TorrentSearch(query: string, options?: Options): Promise<Array<Torrent>> {
    const keyword = query.substring(0, limit(query.length, 60));

    const category = options?.category || CATEGORIES.VIDEO;

    const targetUrl = BASE_URL(`/q.php?q=${keyword}&cat=${category}`);

    const response = await fetch(targetUrl, { signal: AbortSignal.timeout(DEFAULT_TIMEOUT) });

    if (response.status === 200) {
        const arr = (await response.json()) as Array<Torrent>;
        return arr.slice(0, limit(arr.length, options?.limit || 10));
    }

    return [];
}

export async function TorrentFiles(torrent: Torrent): Promise<Array<TorrentFile>> {
    const targetUrl = BASE_URL(`/f.php?id=${torrent.id}`);
    
    const response = await fetch(targetUrl, { signal: AbortSignal.timeout(DEFAULT_TIMEOUT) });

    if (response.status === 200) return (await response.json()) as Array<TorrentFile>;

    return [];
}