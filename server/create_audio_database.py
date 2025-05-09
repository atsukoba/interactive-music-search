import argparse
import multiprocessing as mp
import os
import warnings
from concurrent.futures import Future, ProcessPoolExecutor
from typing import List
import pandas as pd
from sqlalchemy import text
from tqdm import tqdm

from src.audio_feature import (AudioFeatures, calc_audio_features,
                               sid_to_filepath)
from src.db import create_engine
from src.utils import AudioFeatureName, create_logger

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
                        default=None)
    args = parser.parse_args()

    # Connect to DB
    engine = create_engine()
    # extract track id data from song table once set before
    q = text("SELECT spotify_track_id FROM song;")
    logger.debug(q)
    logger.info("Loading database: songs.song")
    res_df = pd.read_sql_query(sql=q, con=engine)
    res_df.columns = ["sid"]  # type: ignore
    logger.info(f"Got {len(res_df)} records")
    audio_files = [sid_to_filepath(sid) for sid in res_df.sid.values]

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
    results_df.columns = ["spotify_track_id",
                          "tempo",
                          "zero_crossing_rate",
                          "harmonic_components",
                          "percussive_components",
                          "spectral_centroid",
                          "spectral_rolloff",
                          "chroma_frequencies"]  # type: ignore
    results_df.drop_duplicates(subset=["spotify_track_id"], inplace=True)
    results_df.to_sql("audio_features", con=engine,
                      if_exists="append", index=False)
