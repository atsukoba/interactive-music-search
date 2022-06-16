import argparse
import json
import os
from glob import glob
from typing import List

import librosa
import numpy as np
import pandas as pd
from sqlalchemy import create_engine
from tqdm import tqdm

from src.datasets import MMD_audio_matches, MMD_md5_metainfo
from src.utils import create_logger, env, AudioFeatureName

logger = create_logger(os.path.basename(__file__))


def average_in_n_block(d: np.ndarray, n=5) -> List[float]:
    l: List[np.ndarray] = np.array_split(y, 5)
    ave = [ll.mean() for ll in l]
    return ave


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
    results = []
    for path in tqdm(audio_files[:args.num_of_files_limit]):
        spotidy_track_id = path.split(os.path.sep)[-1].replace(".mp3", "")
        y, sr = librosa.load(path)
        tempo = librosa.beat.tempo(y=y, sr=sr)[0]
        zcr = librosa.feature.zero_crossing_rate(y=y, pad=False)[0]
        y_harm, y_perc = librosa.effects.hpss(y=y)
        y_harm_rms = librosa.feature.rms(y=y_harm)[0]
        y_perc_rms = librosa.feature.rms(y=y_perc)[0]
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        chromagram = librosa.feature.chroma_stft(
            y=y, sr=sr, hop_length=512).mean(axis=1)
        results.append([
            spotidy_track_id,
            tempo,
            average_in_n_block(zcr, n_blocks),
            average_in_n_block(y_harm_rms, n_blocks),
            average_in_n_block(y_perc_rms, n_blocks),
            average_in_n_block(spectral_centroids, n_blocks),
            average_in_n_block(spectral_rolloff, n_blocks),
            chromagram
        ])

    results = pd.DataFrame(results)
    results.columns = ["sid", "tempo", "zcr", "harm",
                       "perc", "spec_cent", "spec_roll", "chroma"]

    connection_config = {
        "user": env["DATABASE_USER"],
        "password": env["DATABASE_PASSWORD"],
        "host": env["DATABASE_HOST"],
        "database": "audio_features"
    }
    engine = create_engine(
        "postgresql://{user}:{password}@{host}/{database}".format(
            **connection_config), echo=True)

    results.drop_duplicates(subset=["sid"], inplace=True)
    results.to_sql("audio", con=engine, if_exists="append", index=False)
