import json
import os
from glob import glob

import pandas as pd
from sqlalchemy import create_engine
from src.datasets import MMD_audio_matches, MMD_md5_metainfo
from src.utils import create_logger

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
        "postgresql://{user}:{password}@{host}/{database}".format(
            **connection_config), echo=True)

    songs = pd.merge(
        MMD_md5_metainfo[["md5", "artist", "title"]],
        MMD_audio_matches[["md5", "sid"]]).dropna()
    songs.columns = ["md5", "artist", "title", "spotify_track_id"]
    songs.drop_duplicates(subset=["md5"], inplace=True)
    songs.drop_duplicates(subset=["spotify_track_id"], inplace=True)
    songs.to_sql("song", con=engine, if_exists="append", index=False)
