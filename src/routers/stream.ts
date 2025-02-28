import express from "express";
import { TorrentSearch } from "../thepiratebay/thepiratebay";
import { Upload } from "../real-debrid/real-debrid";

import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { FIREBASE_CONFIG } from "../utilities/config";
import { FirebaseTorrentInfo } from "../models/firebase";
import { Torrent } from "../models/torrent";
import { MerlMovieResponse } from "../utilities/helper";

const firebaseApp = initializeApp(FIREBASE_CONFIG);

const store = getFirestore(firebaseApp);

const colRef = collection(store, "files");

const router = express.Router();

async function upload(tor: Torrent) {
    let info = {};
    let download = {};

    let resp = await Upload(tor, (event) => {
        info = event;
    });

    if (resp.id) {
        download = resp;
    }

    let torrented = {
        info,
        download,
    };

    return torrented;
}

router.get("/stream/:id", async (req, res) => {
    const mediaId = req.params.id;

    const docRef = doc(colRef, mediaId);

    const docRes = await getDoc(docRef);

    let debrid: FirebaseTorrentInfo = {};

    if (docRes.exists()) {
        debrid = docRes.data();
    } else {

        const torrents = await TorrentSearch(mediaId, { limit: 5 });

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

router.get("/stream/:id/:s/:e", (req, res) => {
    res.send("Here is the TV shows stream route!" + req.params);
});

export default router;