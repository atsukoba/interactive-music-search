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
from src.utils import create_logger, env

logger = create_logger(os.path.basename(__file__))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Fetching MIDI Data from Spotify API",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument("-N",
                        "--num_of_files_limit",
                        metavar="NUM_OF_MIDI FILE",
                        type=int,
                        help="The limit number of midi files to calculate features",
                        default=1000)
    args = parser.parse_args()

    midi_files = glob(os.path.join(
        env["DATASET_PATH"], "MMD_MIDI", "**", "*.mid"), recursive=True)
    n_blocks = 5
    results = []
    for path in tqdm(midi_files[:args.num_of_files_limit]):

        md5 = None
        total_used_pitch = None
        bar_used_pitch = None
        total_used_note = None
        bar_used_note = None
        bar_pitch_class_histogram = None
        pitch_range = None
        avg_pitch_shift = None
        avg_IOI = None
        note_length_hist = None
        results.append([
            md5,
            total_used_pitch,
            bar_used_pitch,
            total_used_note,
            bar_used_note,
            bar_pitch_class_histogram,
            pitch_range,
            avg_pitch_shift,
            avg_IOI,
            note_length_hist,
        ])

    results = pd.DataFrame(results)
    results.columns = [
        "md5",
        "total_used_pitch",
        "bar_used_pitch",
        "total_used_note",
        "bar_used_note",
        "bar_pitch_class_histogram",
        "pitch_range",
        "avg_pitch_shift",
        "avg_IOI",
        "note_length_hist",
    ]

    connection_config = {
        "user": env["DATABASE_USER"],
        "password": env["DATABASE_PASSWORD"],
        "host": env["DATABASE_HOST"],
        "database": "songs"
    }
    engine = create_engine(
        "postgresql://{user}:{password}@{host}/{database}".format(
            **connection_config), echo=True)

    results.drop_duplicates(subset=["sid"], inplace=True)
    results.to_sql("midi_features", con=engine,
                   if_exists="append", index=False)
