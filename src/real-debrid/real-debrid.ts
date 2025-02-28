import { DownloadInfo, FilePath, ResponseUploaded, StreamLinks, TorrentStatus, TorrentStatusInfo } from "../models/real-debrid";
import { ToMagnetUri, Torrent } from "../models/torrent";

const AUTH_TOKEN = process.env.AUTH_TOKEN || "PL7X5CLJEJTECMDLGZVIVUIXE65UZKOH2QIBU4Q3ZEI24FQWIOBQ";

function BASE_URL(endpoint: string) {
    if (!endpoint.includes("auth_token")) {
        if (endpoint.includes("?")) {
            endpoint = endpoint + "&auth_token=" + AUTH_TOKEN;
        } else {
            endpoint = endpoint + "?auth_token=" + AUTH_TOKEN;
        }
    }
    return "https://api.real-debrid.com/rest/1.0" + endpoint;
}

export async function AddMagnetUri(magnetUri: string): Promise<ResponseUploaded> {
    const targetUrl = BASE_URL(`/torrents/addMagnet`);

    const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `magnet=${encodeURIComponent(magnetUri)}`,
    });

    if (response.status === 201) return (await response.json()) as ResponseUploaded;

    return {} as ResponseUploaded;
}

export async function FileStatus(id: string): Promise<TorrentStatusInfo> {
    const target = BASE_URL(`/torrents/info/${id}`);

    const response = await fetch(target);

    if (response.status === 200) return (await response.json()) as TorrentStatusInfo;
    
    return {} as TorrentStatusInfo;
}

export function GetActualFile(info: TorrentStatusInfo): FilePath {

    let temp = {} as FilePath;

    for (let file of (info.files || [])) {
        if (file.bytes > (temp.bytes || 0)) {
            temp = file;
        }
    }

    return temp;
}

export async function SelectFiles(id: string, files: Array<FilePath>) {
    const target = BASE_URL(`/torrents/selectFiles/${id}`);

    await fetch(target, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `files=${files.map(e => e.id).join(",")}`,
    });
}

export async function UnrestrictLink(link: string): Promise<DownloadInfo> {
    const target = BASE_URL(`/unrestrict/link`);

    const response = await fetch(target, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `link=${encodeURIComponent(link)}`,
    });

    if (response.status === 200) return (await response.json()) as DownloadInfo;

    return {} as DownloadInfo;
    
}

export async function GetStreamLinks(id: string): Promise<StreamLinks>{
    const target = BASE_URL(`/streaming/transcode/${id}`);
    
    const response = await fetch(target);
    
    if (response.status === 200) return (await response.json()) as StreamLinks;

    return {} as StreamLinks;
}

export type OnStatusUpdateChanged = (info: TorrentStatusInfo) => void

export async function Upload(torrent: Torrent, onStatusUpdateChanged?: OnStatusUpdateChanged): Promise<DownloadInfo> {
    const magnet = ToMagnetUri(torrent);
    const resp = await AddMagnetUri(magnet);
    
    if (resp.id) {

        let status = {} as TorrentStatusInfo;

        while ((status.progress || 0) < 100) {
            status = await FileStatus(resp.id);

            if (onStatusUpdateChanged && status.id) {
                onStatusUpdateChanged(status);
            }

            if (status.status === TorrentStatus.WaitingFilesSelection) {
                const file = GetActualFile(status);
                await SelectFiles(resp.id, [file]);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (status.links?.length) {
            const info = await UnrestrictLink(status.links[0]);
            return info;
        }
    }

    return {} as DownloadInfo;
}