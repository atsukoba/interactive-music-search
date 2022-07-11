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
from sqlalchemy import create_engine
from tqdm import tqdm

from src.datasets import MMD_audio_matches, MMD_md5_metainfo
from src.utils import AudioFeatureName, create_logger, env

warnings.simplefilter('ignore')
logger = create_logger(os.path.basename(__file__))

AudioFeatures = List[Union[str, List[float], float]]


def average_in_n_block(d: np.ndarray, n=5) -> List[float]:
    l: List[np.ndarray] = np.array_split(d, 5)
    ave = [float(ll.mean()) for ll in l]
    return ave


def calc_audio_features(path: str) -> AudioFeatures:
    spotidy_track_id = path.split(os.path.sep)[-1].replace(".mp3", "")
    y, sr = librosa.load(path)
    tempo = float(librosa.beat.tempo(y=y, sr=sr)[0])
    zcr = librosa.feature.zero_crossing_rate(y=y, pad=False)[0]
    y_harm, y_perc = librosa.effects.hpss(y=y)
    y_harm_rms = librosa.feature.rms(y=y_harm)[0]
    y_perc_rms = librosa.feature.rms(y=y_perc)[0]
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    chromagram = librosa.feature.chroma_stft(
        y=y, sr=sr, hop_length=512).mean(axis=1).astype(float).tolist()
    return [
        spotidy_track_id,
        tempo,
        average_in_n_block(zcr, n_blocks),
        average_in_n_block(y_harm_rms, n_blocks),
        average_in_n_block(y_perc_rms, n_blocks),
        average_in_n_block(spectral_centroids, n_blocks),
        average_in_n_block(spectral_rolloff, n_blocks),
        chromagram
    ]


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

    audio_files = glob(os.path.join(
        env["DATASET_PATH"], "spotify_sample", "**", "*.mp3"), recursive=True)
    n_blocks = 5
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
