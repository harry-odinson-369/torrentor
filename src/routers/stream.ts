import express from "express";
import { TorrentSearch } from "../thepiratebay/thepiratebay";
import { GetDownloads, GetStreamLinks, Upload } from "../real-debrid/real-debrid";

import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { FIREBASE_CONFIG } from "../utilities/config";
import { FirebaseTorrentInfo } from "../models/firebase";
import { Torrent } from "../models/torrent";
import { MerlMovieResponse, limit } from "../utilities/helper";

const firebaseApp = initializeApp(FIREBASE_CONFIG);

const store = getFirestore(firebaseApp);

const colRef = collection(store, "files");

const router = express.Router();

async function upload(tor: Torrent) {
    let info = {};
    let download = {};
    let streams = {};

    let res = await Upload(tor, (event) => {
        info = event;
    });

    const results = await GetDownloads();
    const re = results.filter(e => `${e.filename}${e.filesize}${e.chunks}${e.mimeType}${e.streamable}` === `${res.filename}${res.filesize}${res.chunks}${res.mimeType}${res.streamable}`);

    if (re.length) {
        streams = await GetStreamLinks(re[0].id || "");
    }

    if (res.id) {
        download = res;
    }

    let torrented = {
        info,
        streams,
        download,
    };

    return torrented;
}

router.get("/stream/:type/:id", async (req, res) => {
    const mediaId = req.params.id;
    const isRefresh = req.query.refresh === "yes";
    const type = req.params.type;

    if (type !== 'movie') {
        res.status(404).json({
            status: 404,
            message: "There no available route for " + type + " - " + mediaId,
        });

        return;
    }

    if (!mediaId.startsWith("tt")) {
        res.status(404).json({
            status: 404,
            message: "The id must be started with tt as prefix",
        });

        return;
    }

    const docRef = doc(colRef, mediaId);

    const docRes = await getDoc(docRef);

    let debrid: FirebaseTorrentInfo = {};

    if (docRes.exists() && !isRefresh) {
        debrid = docRes.data();
    } else {

        const torrents = await TorrentSearch(mediaId);

        const torrented = await upload(torrents[0]);

        debrid = {
            "real-debrid": [
                torrented,
            ]
        }

        await setDoc(docRef, debrid);

        async function doRest() {
            for (let tor of torrents.filter(e => e.id !== torrents[0].id)) {
                const torrented = await upload(tor);
                debrid["real-debrid"]?.push(torrented);
                await setDoc(docRef, debrid, { merge: true });
            }
        }

        doRest();
    }

    res.json(MerlMovieResponse(debrid));

});

router.get("/stream/:type/:id/:s/:e", async (req, res) => {
    const mediaId = req.params.id;
    let season = req.params.s;
    let episode = req.params.e;
    const type = req.params.type;

    if (type !== 'shows') {
        res.status(404).json({
            status: 404,
            message: "There no available route for " + type + " with - " + mediaId + " - " + req.params.s + " - " + req.params.e,
        });

        return;
    }

    if (!mediaId.startsWith("tt")) {
        res.status(404).json({
            status: 404,
            message: "The id must be started with tt as prefix",
        });

        return;
    }

    const isRefresh = req.query.refresh === "yes";

    if (!season.includes("0") && parseInt(season) < 10) {
        season = `s0${season}`;
    } else {
        season = `s${season}`;
    }

    if (!episode.includes("0") && parseInt(episode) < 10) {
        episode = `e0${episode}`;
    } else {
        episode = `e${episode}`;
    }

    const docRef = doc(colRef, `${mediaId}-${season}-${episode}`);

    const docRes = await getDoc(docRef);

    let debrid: FirebaseTorrentInfo = {};

    if (docRes.exists() && !isRefresh) {
        debrid = docRes.data();
    } else {
        let arr: Array<Torrent> = [];

        const torrents = await TorrentSearch(mediaId, { limit: 9999 });

        for (const tor of torrents) {
            const name = tor.name.toLowerCase();

            const match = (name.includes(season) && name.includes(episode)) || name.includes(`${season}-${episode}`);

            if (match) {
                arr.push(tor);
            }
        }

        if (!arr.length) {
            for (const tor of torrents) {
                const name = tor.name.toLowerCase();

                const se = parseInt(req.params.s);

                const s1 = `season ${se > 10 ? se : `0${se}`}`;
                const s2 = `s${se > 10 ? se : `0${se}`}`;
                const s3 = `s${se}`;
                const s4 = `season ${se}`

                const match = name.includes(s1) || name.includes(s2) || name.includes(s3) || name.includes(s4);

                if (match) {
                    arr.push(tor);
                }
            }
        }

        if (!arr.length) {
            res.status(404).json({
                status: 404,
                message: "There is no data for " + mediaId + " - " + req.params.s + " - " + req.params.e,
            });
        } else {

            arr = arr.slice(0, limit(arr.length, 10));

            const torrented = await upload(arr[0]);

            debrid = {
                "real-debrid": [
                    torrented,
                ]
            }

            await setDoc(docRef, debrid);

            async function doRest() {
                for (let tor of arr.filter(e => e.id !== arr[0].id)) {
                    const torrented = await upload(tor);
                    debrid["real-debrid"]?.push(torrented);
                    await setDoc(docRef, debrid, { merge: true });
                }
            }

            doRest();
        }
    }

    res.json(MerlMovieResponse(debrid));
});

export default router;