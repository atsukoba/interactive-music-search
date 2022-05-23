import json
import os

import pandas as pd

from utils import create_logger, env

logger = create_logger(os.path.basename(__file__))

logger.info("Loading MMD_audio_matched_genre data")
with open(os.path.join(env["DATASET_PATH"], "MMD_audio_matched_genre.jsonl"), "r") as f:
    MMD_audio_matched_genre = [json.loads(d) for d in list(f)]

logger.info("Loading MMD_md5_metainfo data")
MMD_md5_metainfo = pd.read_csv(os.path.join(
    env["DATASET_PATH"], "MMD_md5_metainfo.tsv"),  sep="\t")

logger.info("Loading MMD_audio_matches data")
MMD_audio_matches = pd.read_csv(os.path.join(
    env["DATASET_PATH"], "MMD_audio_matches.tsv"), sep="\t")

if __name__ == "__main__":
    logger.info("MMD_md5_metainfo")
    MMD_md5_metainfo.head()
    logger.info("MMD_audio_matches")
    MMD_audio_matches.head()
    logger.info(MMD_audio_matched_genre[:5])
