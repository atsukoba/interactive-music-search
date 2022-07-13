# for debugging front-end
import os
from random import choices, randint
from typing import Dict, List, Union

import pandas as pd

from src.utils import env
from src.datasets import MMD_md5_metainfo

artist_song_list: List[List[str]] = MMD_md5_metainfo[
    MMD_md5_metainfo.genre == "rock"][["artist", "title"]].values.tolist()  # type: ignore


def get_sample_n_data(n: int) -> List[Dict[str, Union[str, int]]]:
    global artist_song_list
    return [{
        "title": l[1],
        "artist": l[0],
        "x": randint(0, 100),
        "y": randint(0, 100),
        "z": randint(0, 100),
    } for l in choices(artist_song_list, k=n)[:n]]
