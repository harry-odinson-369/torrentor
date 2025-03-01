import { DownloadInfo, FilePath, ResponseUploaded, StreamLinks, TorrentStatus, TorrentStatusInfo } from "../models/real-debrid";
import { ToMagnetUri, Torrent } from "../models/torrent";

import axios from "axios";

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
    try {
        const targetUrl = BASE_URL(`/torrents/addMagnet`);

        const response = await axios.post(targetUrl, `magnet=${encodeURIComponent(magnetUri)}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (response.status === 201) return response.data as ResponseUploaded;

        return {} as ResponseUploaded;
    } catch (e) {
        console.error(e);
        return {} as ResponseUploaded;
    }
}

export async function FileStatus(id: string): Promise<TorrentStatusInfo> {
    try {
        const target = BASE_URL(`/torrents/info/${id}`);

        const response = await axios.get(target);

        if (response.status === 200) return response.data as TorrentStatusInfo;

        return {} as TorrentStatusInfo;
    } catch (e) {
        console.error(e);
        return {} as TorrentStatusInfo;
    }
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
    try {
        const target = BASE_URL(`/torrents/selectFiles/${id}`);

        await axios.post(target, `files=${files.map(e => e.id).join(",")}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    } catch (e) {
        console.error(e);
    }
}

export async function UnrestrictLink(link: string): Promise<DownloadInfo> {
    try {
        const target = BASE_URL(`/unrestrict/link`);

        const response = await axios.post(target, `link=${encodeURIComponent(link)}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (response.status === 200) return response.data as DownloadInfo;

        return {} as DownloadInfo;
    } catch (e) {
        console.error(e);
        return {} as DownloadInfo;
    }

}

export async function GetStreamLinks(id: string): Promise<StreamLinks> {

    try {
        const target = BASE_URL(`/streaming/transcode/${id}`);

        const response = await axios.get(target);

        if (response.status === 200) return response.data as StreamLinks;

        return {} as StreamLinks;
    } catch (e) {
        console.error(e);
        return {} as StreamLinks;
    }


}

export async function GetDownloads(): Promise<Array<DownloadInfo>> {
    try {
        const target = BASE_URL(`/downloads?limit=5000`);

        const response = await axios.get(target);

        if (response.status === 200) return response.data as Array<DownloadInfo>;

        return [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

export type OnStatusUpdateChanged = (info: TorrentStatusInfo) => void

export async function UploadUri(magnet: string, onStatusUpdateChanged?: OnStatusUpdateChanged) {
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

export async function Upload(torrent: Torrent, onStatusUpdateChanged?: OnStatusUpdateChanged): Promise<DownloadInfo> {
    const magnet = ToMagnetUri(torrent);
    return await UploadUri(magnet, onStatusUpdateChanged);
}