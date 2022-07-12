import argparse
import multiprocessing as mp
import os
import warnings
from concurrent.futures import Future, ProcessPoolExecutor
from glob import glob
from typing import List

import numpy as np
import pandas as pd
from sqlalchemy import column, text
from tqdm import tqdm

from src.datasets import MMD_audio_matches, MMD_md5_metainfo
from src.db import create_engine
from src.midi_feature import MidiFeatures, calc_midi_features, md5_to_filepath
from src.utils import create_logger, env

warnings.simplefilter('ignore')
logger = create_logger(os.path.basename(__file__))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Fetching MIDI Data from Meta MIDI Dataset",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument("-N",
                        "--num_of_files_limit",
                        metavar="NUM_OF_MIDI FILE",
                        type=int,
                        help="The limit number of midi files to calculate features",
                        default=10000)
    args = parser.parse_args()

    # Connect to DB
    engine = create_engine()
    # extract track id data from song table once set before
    q = text("SELECT md5 FROM song;")
    logger.debug(q)
    logger.info("Loading database: songs.md5")
    res_df = pd.read_sql_query(sql=q, con=engine)
    res_df.columns = ["md5"]
    logger.info(f"Got {len(res_df)} records")
    midi_files = [md5_to_filepath(md5) for md5 in res_df.md5.values]

    results: List[MidiFeatures] = []
    num_cores = mp.cpu_count()
    with ProcessPoolExecutor(max_workers=num_cores) as pool:
        with tqdm(total=len(midi_files[:args.num_of_files_limit or 999999999]),
                  desc="Loading MIDI files") as progress:
            futures: List[Future] = []
            for idx, data_path in enumerate(
                    midi_files[:args.num_of_files_limit or 999999999]):
                future = pool.submit(calc_midi_features,
                                     data_path)
                future.add_done_callback(lambda p: progress.update())
                futures.append(future)
            for future in futures:
                result: MidiFeatures = future.result()
                if result is not None:
                    results.append(result)
    results_df = pd.DataFrame(results)
    results_df.columns = [
        "md5",
        "pitch_range",
        "n_pitches_used",
        "n_pitch_classes_used",
        "polyphony",
        "polyphony_rate",
        "scale_consistency",
        "pitch_entropy",
        "pitch_class_entropy",
        "empty_beat_rate",
        "drum_in_duple_rate",
        "drum_in_triple_rate",
        "drum_pattern_consistency"
    ]
    results_df.drop_duplicates(subset=["md5"], inplace=True)
    results_df.to_sql("midi_features", con=engine,
                      if_exists="append", index=False)
