export type ResponseUploaded = {
  id: string,
  uri: string,
}

export type FilePath = {
  id: number;
  path: string;
  bytes: number;
  selected: number;
};

export type TorrentStatusInfo = Partial<{
  id: string;
  filename: string;
  original_filename: string;
  hash: string;
  bytes: number;
  original_bytes: number;
  host: string;
  split: number;
  progress: number;
  status: string;
  added: string;
  files: FilePath[];
  links: string[];
}>;

export type DownloadInfo = Partial<{
  id: string;
  filename: string;
  mimeType: string;
  filesize: number;
  link: string;
  host: string;
  host_icon: string;
  chunks: number;
  download: string;
  streamable: number;
}>;

export type StreamLinks = Partial<{
  apple: {
    full: string;
  };
  dash: {
    full: string;
  };
  liveMP4: {
    full: string;
  };
  h264WebM: {
    full: string;
  };
}>;


export enum TorrentStatus {
  MagnetError = "magnet_error",
  MagnetConversion = "magnet_conversion",
  WaitingFilesSelection = "waiting_files_selection",
  Queued = "queued",
  Downloading = "downloading",
  Downloaded = "downloaded",
  Error = "error",
  Virus = "virus",
  Compressing = "compressing",
  Uploading = "uploading",
  Dead = "dead"
}
