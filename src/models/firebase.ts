import { DownloadInfo, StreamLinks, TorrentStatusInfo } from "./real-debrid"

export type FirebaseTorrentInfo = Partial<{
    "real-debrid": Array<FirebaseRealDebridItem>
}>

export type FirebaseRealDebridItem = Partial<{
    info: TorrentStatusInfo,
    download: DownloadInfo,
    streams: StreamLinks
}>;

export type FirebaseConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
};
