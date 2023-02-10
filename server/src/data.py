# for debugging front-end
import os
from random import choice, choices, randint
from typing import Any, Dict, List, Literal, Optional, Tuple, Union

import numpy as np
import pandas as pd
from src.midi_feature import MIDI_FEATURE_ORDER, calc_midi_features
from src.audio_feature import AUDIO_FEATURE_ORDER, calc_audio_features
from src.db import QueryDataSelector
from src.dim_reduction import dim_reduction_pca, dim_reduction_tsne
from src.utils import (AudioFeatureName, AudioFeatureNames, MidiFeatureName,
                       MidiFeatureNames, SpotifyFeatureName,
                       SpotifyFeatureNames, create_logger, env)

""" expected data structure on front-end 

interface ResponseDatum {
  title: string;
  artist: string;
  year: number | undefined;
  genre: string | undefined;
  x: number;
  y: number;
  z: number;
}
"""

logger = create_logger(os.path.basename(__file__))

artist_song_list: List[List[str]] = [[]]


def load_song_list_for_sample_data():
    from src.datasets import MMD_md5_metainfo
    global artist_song_list
    artist_song_list = MMD_md5_metainfo[
        MMD_md5_metainfo.genre == "rock"][["artist", "title"]].values.tolist()  # type: ignore


def min_max(x: np.ndarray, axis=None, scale: Optional[int] = None) -> np.ndarray:
    min_ = x.min(axis=axis, keepdims=True)
    max_ = x.max(axis=axis, keepdims=True)
    result = (x - min_) / (max_ - min_)
    if scale:
        result = result * scale
    return result


def get_sample_n_data(n: int) -> List[Dict[str, Union[str, int]]]:
    global artist_song_list
    if len(artist_song_list[0]) == 0:
        load_song_list_for_sample_data()
    return [{
        "title": l[1],
        "artist": l[0],
        "year": randint(1970, 2022),
        "genre": choice(["Rock", "Pops", "Jazz", "Classic"]),
        "x": randint(0, 100),
        "y": randint(0, 100),
        "z": randint(0, 100),
    } for l in choices(artist_song_list, k=n)[:n]]


def get_features_from_users_song(
        path: str,
        audio_features: List[AudioFeatureName] = [],
        midi_features: List[MidiFeatureName] = []) -> Optional[List[Any]]:
    """Calc symbolic/audio feature from uploaded song file.

    Args:
        path (str): _description_
        audio_features (List[AudioFeatureName], optional): Defaults to [].
        midi_features (List[MidiFeatureName], optional): Defaults to [].

    Returns:
        Optional[pd.DataFrame]: features
    """
    if len(audio_features) > 0 and len(midi_features) > 0:
        return
    if len(audio_features) == 0 and len(midi_features) == 0:
        return
    features = [
        "SID_USER",  # uploaded song has no spotify id
        os.path.basename(path),  # user's title (file name)
        "USER",  # artist
        "USER",  # genre
        2023  # published year
    ]
    # MIDI features
    if len(midi_features) != 0 and (
            os.path.splitext(path)[1] == ".mid" or
            os.path.splitext(path)[1] == ".midi"):
        midi_feature_val = calc_midi_features(path, is_users_song=True)
        if midi_feature_val is None:
            return
        for feature_name in midi_features:
            features.append(midi_feature_val[
                MIDI_FEATURE_ORDER.index(feature_name)])
        return features
    if len(audio_features) != 0 and (
            os.path.splitext(path)[1] == ".wav" or
            os.path.splitext(path)[1] == ".wave"):  # Audio features
        audio_feature_val = calc_audio_features(path)
        if audio_feature_val is None:
            return
        for feature_name in audio_features:
            features.append(audio_feature_val[
                AUDIO_FEATURE_ORDER.index(feature_name)])
        return features


DimReductionMethod = Literal["PCA", "tSNE"]


def get_n_data(feature_names: List[Union[MidiFeatureName, AudioFeatureName]],
               n_data: int = 1000,
               dim_reduction_method: DimReductionMethod = "PCA",
               genres: List[str] = ["rock", "pop"],
               year_range: Tuple[int, int] = (1900, 2023),
               user_songs_path: Optional[List[str]] = None
               ) -> Optional[List[Dict[str, Union[str, int]]]]:

    m: List[MidiFeatureName] = [
        n for n in feature_names if n in MidiFeatureNames]
    a: List[AudioFeatureName] = [
        n for n in feature_names if n in AudioFeatureNames]
    s: List[SpotifyFeatureName] = [
        n for n in feature_names if n in SpotifyFeatureNames]

    res: Optional[pd.DataFrame] = QueryDataSelector.get_features(
        m, a, s, genres, year_range)

    if res is not None:
        logger.info(res.columns)
        # sample songs from dataset
        if len(res) >= n_data:
            res = res.sample(n_data)
        if len(a) > 0:  # normalize audio features
            for feat_name in a:
                if feat_name == "chroma_frequencies":
                    chroma_value = np.array(
                        res[feat_name].values.tolist())  # type: ignore
                    chroma_value = np.argmax(chroma_value, axis=1)
                    res[feat_name] = chroma_value
                else:
                    value_array = np.array(
                        res[feat_name].values.tolist()).mean(axis=1)  # type: ignore
                    res[feat_name] = value_array
        # append user's songs
        if user_songs_path is not None and len(s) == 0:
            # check if target features has only audio or midi features
            user_feature = [f for p in user_songs_path
                            if (f := get_features_from_users_song(
                                p, audio_features=a, midi_features=m)) is not None]
            res = res.append(pd.DataFrame(user_feature), ignore_index=True)
        if res is None:
            logger.error("Database result not contains any data")
            return
        # dimentionality reduction        logger.info(f"all response: {res[feature_names].values.shape}")
        # feature_values = res[feature_names].dropna().values
        feature_values = res[feature_names].interpolate(
            axis=0, limit_direction="both").values
        logger.info(f"not NaN response: {feature_values.shape}")
        if len(feature_names) > 3:
            if dim_reduction_method == "PCA":
                data_matrix = dim_reduction_pca(feature_values)
            elif dim_reduction_method == "tSNE":
                data_matrix = dim_reduction_tsne(feature_values)
            else:
                logger.warn(
                    f"No reduction method applied, not found {dim_reduction_method}")
                data_matrix = feature_values[:, :3]
        else:
            data_matrix = feature_values
        # scaling
        data_matrix = min_max(data_matrix, axis=0, scale=100).astype(float)
        return [{
            "sid": sid,
            "title": t,
            "artist": a,
            "year": d,
            "genre": g,
            "x": x,
            "y": y,
            "z": z,
        } for sid, t, a, d, g, x, y, z in zip(
            res.spotify_track_id.values,
            res.title.values,
            res.artist.values,
            res.date.values,
            res.scraped_genre.values,
            data_matrix[:, 0],
            data_matrix[:, 1],
            data_matrix[:, 2]
        )]
    else:
        logger.warn("Database returns no records!")
        logger.debug(res)


if __name__ == "__main__":
    pass
