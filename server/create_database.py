import json
import os
from glob import glob

import pandas as pd
from sqlalchemy import create_engine

from server.src.utils import create_logger

logger = create_logger(os.path.basename(__file__))

if __name__ == "__main__":

    with open("../environment.json", "r") as f:
        env = json.load(f)

    connection_config = {
        "user": env["DATABASE_USER"],
        "password": env["DATABASE_PASSWORD"],
        "host": env["DATABASE_HOST"],
        "database": "songs"
    }
    engine = create_engine(
        "postgresql://{user}:{password}@{host}/{database}".format(**connection_config), echo=True)

    with open(os.path.join(env["DATASET_PATH"], "MMD_audio_matched_genre.jsonl"), "r") as f:
        MMD_audio_matched_genre = [json.loads(d) for d in list(f)]
    MMD_md5_metainfo = pd.read_csv(os.path.join(
        env["DATASET_PATH"], "MMD_md5_metainfo.tsv"),  sep="\t")
    MMD_audio_matches = pd.read_csv(os.path.join(
        env["DATASET_PATH"], "MMD_audio_matches.tsv"), sep="\t")

    songs = pd.merge(MMD_md5_metainfo[[
                     "md5", "artist", "title"]], MMD_audio_matches[["md5", "sid"]]).dropna()
    songs.columns = ["md5", "artist", "title", "spotify_track_id"]
    songs.drop_duplicates(subset=["md5"], inplace=True)
    songs.drop_duplicates(subset=["spotify_track_id"], inplace=True)
    songs.to_sql("song", con=engine, if_exists="append", index=False)
