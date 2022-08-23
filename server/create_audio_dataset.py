import argparse
import math
import os
import time
from glob import glob
from typing import List

import numpy as np
import pandas as pd
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from tqdm import tqdm

from src.audio_feature import get_data_from_sids
from src.datasets import MMD_audio_matches
from src.utils import create_logger, env, slack_notify_info

logger = create_logger(os.path.basename(__file__))

# Spotify API  settings
client_id = env["client_id"]
client_secret = env["client_secret"]
logger.info("Creating Spotify API client...")
client_credentials_manager = SpotifyClientCredentials(
    client_id, client_secret)
spotify = spotipy.Spotify(
    client_credentials_manager=client_credentials_manager)
logger.info(f"Spotify API client set: {spotify}")


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
                        default=False,
                        help="Shuffle Spotify Track ID list for downloading files")
    parser.add_argument('--save_audio',
                        action='store_true',
                        default=True,
                        help="save audio files to dataset base directory if true")
    parser.add_argument('--save_jacket',
                        action='store_true',
                        default=False,
                        help="save jacket images to dataset base directory if true")
    args = parser.parse_args()

    column_names = [
        "spotify_track_id",
        "title",
        "artist",
        "artist_id",
        "album_title",
        "album_id",
        "date",
        "acousticness",
        "danceability",
        "duration_ms",
        "energy",
        "instrumentalness",
        "key",
        "liveness",
        "loudness",
        "mode",
        "speechiness",
        "tempo",
        "time_signature",
        "valence",
        "album_jacket_url"
    ]
    if os.path.exists(csv_path := os.path.join(env["DATASET_PATH"], "MMD_spotify_all.csv")):
        MMD_spotify_all_df = pd.read_csv(csv_path)
        already_got_sids: np.ndarray = MMD_spotify_all_df["spotify_track_id"].unique(
        )
    else:
        MMD_spotify_all_df = pd.DataFrame(columns=column_names)
        already_got_sids: np.ndarray = np.array([])

    sid_list: np.ndarray = MMD_audio_matches["sid"].unique()
    logger.info(f"ALl Spotify Track IDs: {len(sid_list)}")
    sid_list = np.setdiff1d(sid_list, already_got_sids)
    logger.info(f"Target Spotify Track IDs: {len(sid_list)}")

    if args.shuffle:
        logger.info("Shuffling Spotify Track ID list...")
        np.random.shuffle(sid_list)

    if args.num_of_files_limit != -1:
        logger.info(
            f"Limit num of tracks to download ({len(sid_list)} -> {args.num_of_files_limit})...")
        sid_list = sid_list[:args.num_of_files_limit]

    # start loading
    logger.info(f"Start Loading (batch_size is 50, {math.floor(len(sid_list)/50)} steps)")
    for idx, batch in enumerate(tqdm(
        [sid_list[_i:_i+50] for _i in range(0, len(sid_list), 50)],
            desc="Downloading mp3 files")):
        batch = batch.tolist()
        features = get_data_from_sids(batch, spotify,
                                      save_mp3=args.save_audio,
                                      save_jacket=args.save_jacket)
        if features is not None:
            MMD_spotify_all_df = MMD_spotify_all_df.append(
                pd.DataFrame(features, columns=column_names), ignore_index=True)
        time.sleep(args.request_interval)
        if (idx + 1) % 10 == 0:
            MMD_spotify_all_df.to_csv(os.path.join(
                env["DATASET_PATH"], "MMD_spotify_all.csv"),
                header=True, index=False)
            logger.info(
                f"MMD_spotify_all_df saved with size {MMD_spotify_all_df.shape}")
            # notification
            if env.get("slack_notification_url", None):
                total_audio_files = glob(os.path.join(
                    env["DATASET_PATH"], "**", "*.mp3"), recursive=True)
                total_image_files = glob(os.path.join(
                    env["DATASET_PATH"], "**", "*.jpg"), recursive=True)
                slack_notify_info(
                    "spotify data fetcher",
                    f"now downloaded {len(total_audio_files)} mp3 files" +
                    f"and {len(total_image_files)} jpg files.",
                    title="Spotify Datafetcher")

    MMD_spotify_all_df.to_csv(os.path.join(
        env["DATASET_PATH"], "MMD_spotify_all.csv"),
        header=True, index=False)
    logger.info(
        f"Finally `MMD_spotify_all.csv` saved with size {MMD_spotify_all_df.shape}")
