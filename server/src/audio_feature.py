import os
from glob import glob
from pathlib import Path
from random import choice
from typing import List, Optional, Union
from urllib.request import urlretrieve

import librosa
import numpy as np
import spotipy
from sklearn.preprocessing import minmax_scale
from tqdm import tqdm

from src.utils import SID, AudioPath, create_logger, env

""" Audio features extraction

https://librosa.org/doc/main/feature.html

tempo
zero_crossing_rate
harmonic_components
percussive_components
spectral_centroid
spectral_rolloff
chroma_frequencies
"""

AudioFeatures = List[Union[str, List[float], float]]

logger = create_logger(os.path.basename(__file__))

n_blocks = 5
# NOTE: the var `all_audio_files` not used for build dataset because it's
# not compatible with the FK constraint set to the relation between
# audio_features (sid) table and song table (sid)
all_audio_files: List[AudioPath] = glob(os.path.join(
    env["DATASET_PATH"], "spotify_sample", "**", "*.mp3"), recursive=True)


def sid_to_filepath(sid: SID) -> str:
    return os.path.join(env["DATASET_PATH"], "spotify_sample",
                        sid[0], sid[1], sid[2], sid + ".mp3")


def is_downloaded(path: AudioPath) -> bool:
    return os.path.exists(path)


def download_mp3s_from_sids(sids: List[SID], spotify: spotipy.Spotify) -> None:
    assert len(
        sids) <= 50, f"Spotify `tracks` API limits the num of sids to 50, got {len(sids)}"

    # ignore already downloaded tracks
    sids = list(filter(lambda sid: not is_downloaded(
        sid_to_filepath(sid)), sids))

    try:
        results: Optional[dict] = spotify.tracks(sids)
    except Exception as e:
        logger.info("Failed to get info from Spotify API")
        logger.debug(e)
        return
    if results:
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
    else:
        logger.warn(f"got empty API result: with sids={sids}")


def normalize(x: np.ndarray, axis=0) -> np.ndarray:
    return minmax_scale(x, axis=axis)


def average_in_n_block(d: np.ndarray, n=5) -> List[float]:
    l: List[np.ndarray] = np.array_split(d, 5)
    ave = [float(ll.mean()) for ll in l]
    return ave


def calc_audio_features(path: str) -> Optional[AudioFeatures]:
    spotidy_track_id = path.split(os.path.sep)[-1].replace(".mp3", "")

    if is_downloaded(path):
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
    else:
        logger.debug(f"file: {path} not exists in audio data dir")
        return


if __name__ == "__main__":
    feature_list = calc_audio_features(choice(all_audio_files))
    if feature_list:
        for f in feature_list:
            logger.info(f)
