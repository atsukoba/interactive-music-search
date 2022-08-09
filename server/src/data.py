# for debugging front-end
import os
from random import choice, choices, randint
from typing import Dict, List, Literal, Optional, Union
import numpy as np

import pandas as pd

from src.datasets import MMD_md5_metainfo
from src.db import QueryDataSelector
from src.utils import (AudioFeatureName, AudioFeatureNames, MidiFeatureName,
                       MidiFeatureNames, create_logger, env)
from src.dim_reduction import dim_reduction_tsne, dim_reduction_pca

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


DimReductionMethod = Literal["PCA", "tSNE"]


def get_n_data(feature_names: List[Union[MidiFeatureName, AudioFeatureName]],
               n: int = 1000,
               dim_reduction_method: DimReductionMethod = "PCA"
               ) -> Optional[List[Dict[str, Union[str, int]]]]:

    m: List[MidiFeatureName] = [
        n for n in feature_names if n in MidiFeatureNames]
    a: List[AudioFeatureName] = [
        n for n in feature_names if n in AudioFeatureNames]

    res: Optional[pd.DataFrame] = QueryDataSelector.get_features(m, a)

    if res is not None:
        res = res.head(n)
        sids = res.spotify_track_id.values
        titles = res.title.values
        artists = res.artist.values
        years = res.publish_year.values
        # normalize audio features
        if len(a) > 0:
            for feat_name in a:
                if feat_name == "tempo":
                    pass
                elif feat_name == "chroma_frequencies":
                    chroma_value = np.array(
                        res[feat_name].values.tolist())  # type: ignore
                    chroma_value = np.argmax(chroma_value, axis=1)
                    res[feat_name] = chroma_value
                else:
                    value_array = np.array(
                        res[feat_name].values.tolist()).mean(axis=1)
                    res[feat_name] = value_array
        # dimentionality reduction
        feature_values = res[feature_names].values
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
            "year": y,
            # "genre": choice(["Rock", "Pops", "Jazz", "Classic"]),
            "x": x,
            "y": y,
            "z": z,
        } for sid, t, a, y, x, y, z
            in zip(sids, titles, artists, years,
                   data_matrix[:, 0], data_matrix[:, 1], data_matrix[:, 2])]
    else:
        logger.warn("Database returns no records!")
        logger.debug(res)


if __name__ == "__main__":
    pass
