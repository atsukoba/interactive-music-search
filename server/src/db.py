import os
from typing import List, Optional, Tuple
from venv import create

import pandas as pd
import sqlalchemy
from sqlalchemy import ARRAY, Column, Float, ForeignKey, Integer, String
from sqlalchemy import create_engine as ce
from sqlalchemy import text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, scoped_session, sessionmaker
from src.utils import (AudioFeatureName, DBNotConnectedError, MidiFeatureName,
                       SpotifyFeatureName, create_logger, env)

logger = create_logger(os.path.basename(__file__))

# Config
connection_config = {
    "user": env["DATABASE_USER"],
    "password": env["DATABASE_PASSWORD"],
    "host": env["DATABASE_HOST"],
    # "socket": env["DATABASE_SOCKET"],  # if needed
    "database": "songs"
}


def create_engine() -> sqlalchemy.engine.Engine:
    if connection_config["host"]:
        engine = ce(
            "postgresql://{user}:{password}@{host}/{database}".format(
                **connection_config), echo=True)
    else:
        engine = ce(
            "postgresql://{user}:{password}@/{database}?host={socket}".format(
                **connection_config), echo=True)
    return engine


class QueryDataSelector:
    """
    extract data from db using dataframes without ORM model
    to use active trigger functions on PostgreSQL
    """

    engine: Optional[sqlalchemy.engine.Engine] = None

    @classmethod
    def set_engine(cls):
        cls.engine = create_engine()

    @classmethod
    def get_features(cls,
                     midi_feature_names: List[MidiFeatureName],
                     audio_feature_names: List[AudioFeatureName],
                     spotify_feature_names: List[SpotifyFeatureName],
                     genres: List[str],
                     year_range: Tuple[int, int]) -> Optional[pd.DataFrame]:
        """ got pandas.DataFrame object which contain values of selected features

        Args:
            midi_feature_names (List[MidiFeatureName]): _description_
            audio_feature_names (List[AudioFeatureName]): _description_

        Returns:
            Optional[pd.DataFrame]:

        for example
        |  sid  |      title       | artist | year | pitch_range | harmonic |
        |:-----:|:----------------:|:------:|:----:|:-----------:|:--------:|
        | ##### |     song title   | TheWho | 2020 |    20.0     |  0.0024  |
        | ##### |     song title   | TheWho | 2020 |    20.0     |  0.0024  |
        | ##### |     song title   | TheWho | 2020 |    20.0     |  0.0024  |
        """

        if cls.engine is None:
            logger.error("DB not connected!")
            raise DBNotConnectedError

        # genre and date filtering
        q_genre_and_year = " WHERE (" + " OR ".join([f"song.scraped_genre = '{g}'" for g in genres]) + ") " + \
            f"AND song.date > '{year_range[0]}-01-01' AND song.date < '{year_range[1]}-01-01' "

        # extract features
        q_inner_join = []
        q_features = []
        if len(audio_feature_names) > 0:
            q_inner_join.append(
                "INNER JOIN audio_features A on A.spotify_track_id = song.spotify_track_id")
            q_features += ["A." + a for a in audio_feature_names]
        if len(midi_feature_names) > 0:
            q_inner_join.append(
                "INNER JOIN midi_features M on M.md5 = song.md5")
            q_features += ["M." + m for m in midi_feature_names]
        if len(spotify_feature_names) > 0:
            q_inner_join.append(
                "INNER JOIN spotify_features S on S.spotify_track_id = song.spotify_track_id")
            q_features += ["S." + s for s in spotify_feature_names]
        # build query
        # NOTE: use ORM in the future
        q = text(
            "SELECT song.spotify_track_id, song.title, song.artist, song.date, " +
            ", ".join(q_features) + " " +
            "FROM song " + " ".join(q_inner_join) +
            q_genre_and_year)
        logger.debug(q)
        try:
            df = pd.read_sql_query(sql=q, con=cls.engine)
            logger.info(f"got {len(df)} records")
            return df
        except Exception as e:
            logger.warn("database error: {e}")
            return


if __name__ == "__main__":
    ...
