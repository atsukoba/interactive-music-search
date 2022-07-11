import argparse
import json
import multiprocessing as mp
import os
import warnings
from concurrent.futures import Future, ProcessPoolExecutor
from glob import glob
from typing import List, Union

import librosa
import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text
from tqdm import tqdm

from src.audio_feature import AudioFeatures, calc_audio_features
from src.datasets import MMD_audio_matches, MMD_md5_metainfo
from src.db import connection_config
from src.utils import AudioFeatureName, create_logger, env

warnings.simplefilter('ignore')
logger = create_logger(os.path.basename(__file__))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Fetching Audio Data from Spotify API",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument("-N",
                        "--num_of_files_limit",
                        metavar="NUM_OF_MP3_FILE",
                        type=int,
                        help="The limit number of mp3 files to download from Spotify API",
                        default=1000)
    args = parser.parse_args()

    if connection_config["host"]:
        engine = create_engine(
            "postgresql://{user}:{password}@{host}/{database}".format(
                **connection_config), echo=True)
    else:
        engine = create_engine(
            "postgresql://{user}:{password}@/{database}?host={socket}".format(
                **connection_config), echo=True)

    q = text("FROM song SELECT spotify_track_id;")
    logger.debug(q)
    res_df = pd.read_sql_query(sql=q, con=engine)
    audio_files = []

    results: List[AudioFeatures] = []
    num_cores = mp.cpu_count()
    with ProcessPoolExecutor(max_workers=num_cores) as pool:
        with tqdm(total=len(audio_files[:args.num_of_files_limit or 999999999]),
                  desc="Loading Audio files") as progress:
            futures: List[Future] = []
            for idx, data_path in enumerate(audio_files[:args.num_of_files_limit or 999999999]):
                future = pool.submit(calc_audio_features,
                                     data_path)
                future.add_done_callback(lambda p: progress.update())
                futures.append(future)
            for future in futures:
                result: AudioFeatures = future.result()
                if result is not None:
                    results.append(result)

    results_df = pd.DataFrame(results)
    results_df.columns = ["spotidy_track_id", "tempo", "zero_crossing_rate",
                          "harmonic_and_percussive_components",
                          "spectral_centroid", "spectral_rolloff",
                          "mfcc", "chroma_frequencies"]

    connection_config = {
        "user": env["DATABASE_USER"],
        "password": env["DATABASE_PASSWORD"],
        "host": env["DATABASE_HOST"],
        "database": "songs"
    }
    engine = create_engine(
        "postgresql://{user}:{password}@{host}/{database}".format(
            **connection_config), echo=True)

    results_df.drop_duplicates(subset=["spotidy_track_id"], inplace=True)
    results_df.to_sql("audio_features", con=engine,
                      if_exists="append", index=False)
