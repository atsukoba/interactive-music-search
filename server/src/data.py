# for debugging front-end
import os
from random import choice, choices, randint
from typing import Dict, List, Optional, Union
import numpy as np

import pandas as pd

from src.datasets import MMD_md5_metainfo
from src.db import QueryDataSelector
from src.utils import (AudioFeatureName, AudioFeatureNames, MidiFeatureName,
                       MidiFeatureNames, create_logger, env)

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

artist_song_list: List[List[str]] = MMD_md5_metainfo[
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
    return [{
        "title": l[1],
        "artist": l[0],
        "year": randint(1970, 2022),
        "genre": choice(["Rock", "Pops", "Jazz", "Classic"]),
        "x": randint(0, 100),
        "y": randint(0, 100),
        "z": randint(0, 100),
    } for l in choices(artist_song_list, k=n)[:n]]


def get_n_data(feature_names: List[Union[MidiFeatureName, AudioFeatureName]],
               n: int = 1000) -> Optional[List[Dict[str, Union[str, int]]]]:

    m: List[MidiFeatureName] = [
        n for n in feature_names if n in MidiFeatureNames]
    a: List[AudioFeatureName] = [
        n for n in feature_names if n in AudioFeatureNames]

    res: Optional[pd.DataFrame] = QueryDataSelector.get_features(m, a)

    if res is not None:
        res = res.head(n)
        titles = res.title.values
        artists = res.artist.values
        years = res.publish_year.values
        data_matrix = res[feature_names[:3]].values
        data_matrix = min_max(data_matrix, axis=0, scale=100).astype(float)
        return [{
            "title": t,
            "artist": a,
            "year": y,
            # "genre": choice(["Rock", "Pops", "Jazz", "Classic"]),
            "x": x,
            "y": y,
            "z": z,
        } for t, a, y, x, y, z
            in zip(titles, artists, years,
                   data_matrix[:, 0], data_matrix[:, 1], data_matrix[:, 2])]
    else:
        logger.warn("Database returns no records!")
        logger.debug(res)
