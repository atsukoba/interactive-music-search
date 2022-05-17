import argparse
import json
import os
import time
from glob import glob
from pathlib import Path
from typing import List
from urllib.request import urlretrieve

import numpy as np
import pandas as pd
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from sqlalchemy import desc
from tqdm import tqdm

from src.utils import create_logger, env, slack_notify_info

SID = str

logger = create_logger(os.path.basename(__file__))


def _sid_to_filepath(sid: SID) -> str:
    return os.path.join(env["DATASET_PATH"], "spotify_sample",
                        sid[0], sid[1], sid[2], sid + ".mp3")


def is_downloaded(sid: SID) -> bool:
    return Path(_sid_to_filepath(sid)).exists()


def download_mp3s_from_sids(sids: List[SID]) -> None:

    assert len(
        sids) <= 50, f"Spotify `tracks` API limits the num of sids to 50, got {len(sids)}"

    # ignore already downloaded tracks
    sids = list(filter(lambda sid: not is_downloaded(sid), sids))

    try:
        results: dict = spotify.tracks(sids)
    except Exception as e:
        logger.info("Failed to get info from Spotify API")
        logger.debug(e)
        return
    for res in tqdm(results["tracks"], desc="Downloading mp3s...", leave=False):
        url = res.get("preview_url", None)
        sid = res.get("id", None)
        if url is not None and sid is not None:
            save_dir = os.path.join(
                env["DATASET_PATH"], "spotify_sample", sid[0], sid[1], sid[2])
            Path(save_dir).mkdir(exist_ok=True, parents=True)
            try:
                urlretrieve(url, os.path.join(save_dir, sid + ".mp3"))
            except Exception as e:
                logger.debug(
                    "Failed to download mp3 file from sample URL: {url}")
                logger.debug(e)
        else:
            logger.debug("`id` or `preview_url` not found on API response")
            logger.debug(res)


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
    parser.add_argument("-I",
                        "--request_interval",
                        metavar="REQUEST_INTERVAL_SEC",
                        type=int,
                        help="Interval between requests to API (seconds)",
                        default=5)
    parser.add_argument('--shuffle',
                        action='store_true',
                        default=True,
                        help="Shuffle Spotify Track ID list for downloading files")
    args = parser.parse_args()

    # logger.info("Loading audio-matched data")
    # with open(os.path.join(env["DATASET_PATH"], "MMD_audio_matched_genre.jsonl"), "r") as f:
    #     MMD_audio_matched_genre = [json.loads(d) for d in list(f)]

    logger.info("Loading MMD_audio_matches meta data file")
    MMD_audio_matches = pd.read_csv(os.path.join(
        env["DATASET_PATH"], "MMD_audio_matches.tsv"), sep="\t")

    sid_list: np.ndarray = MMD_audio_matches["sid"].values  # type: ignore

    client_id = env["client_id"]
    client_secret = env["client_secret"]
    logger.info("Creating Spotify API client...")
    client_credentials_manager = SpotifyClientCredentials(
        client_id, client_secret)
    spotify = spotipy.Spotify(
        client_credentials_manager=client_credentials_manager)

    if args.shuffle:
        logger.info("Shuffling Spotify Track ID list...")
        np.random.shuffle(sid_list)

    if args.num_of_files_limit != -1:
        logger.info(
            f"Limit num of tracks to download ({len(sid_list)} -> {args.num_of_files_limit})...")
        sid_list = sid_list[:args.num_of_files_limit]

    for idx, batch in enumerate(tqdm(
        [sid_list[_i:_i+50] for _i in range(0, len(sid_list), 50)],
            desc="Downloading mp3 files")):
        batch = batch.tolist()
        download_mp3s_from_sids(batch)
        time.sleep(args.request_interval)

        # notification
        if env.get("slack_notification_url", None):
            if (idx + 1) % 10 == 0:
                total_files = glob(os.path.join(
                    env["DATASET_PATH"], "**", "*.mp3"), recursive=True)
                slack_notify_info(
                    "spotify data fetcher",
                    f"now downloaded {len(total_files)} files...",
                    title="Spotify Datafetcher")
