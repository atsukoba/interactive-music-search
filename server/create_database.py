import json
import os
from glob import glob

import pandas as pd
from sqlalchemy import create_engine
from src.datasets import MMD_audio_matches, MMD_md5_metainfo
from src.utils import create_logger, env

logger = create_logger(os.path.basename(__file__))

if __name__ == "__main__":

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
    logger.info(f"Got {len(songs)} songs info")
    songs.columns = ["md5", "artist", "title", "spotify_track_id"]
    logger.info(f"Removing duplicates...")
    songs.drop_duplicates(subset=["md5"], inplace=True)
    songs.drop_duplicates(subset=["spotify_track_id"], inplace=True)
    logger.info(f"Got {len(songs)} unique songs info")
    # NOTE: need drop cascade to set if_exists=replace
    songs.to_sql("song", con=engine, if_exists="append", index=False)
