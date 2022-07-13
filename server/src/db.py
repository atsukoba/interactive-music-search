from typing import List, Optional
from venv import create
from sqlalchemy import (ARRAY, Column, Float,
                        ForeignKey, Integer, String, text)
from sqlalchemy import create_engine as ce
import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, scoped_session, sessionmaker
import pandas as pd
import os

from src.utils import AudioFeatureName, MidiFeatureName, create_logger, env
from src.models import Base

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


def create_session():
    # Connect to DB
    engine = create_engine()
    SessionClass = sessionmaker(engine)
    session = SessionClass()

    Base.metadata.bind = engine  # bind

    return session


class QueryDataSelector:
    """
    extract data from db using dataframes without ORM model
    to use active trigger functions on PostgreSQL
    """

    def __init__(self, engine: sqlalchemy.engine.Engine):
        self.engine = engine

    def get_features(self,
                     midi_feature_names: List[MidiFeatureName],
                     audio_feature_names: List[AudioFeatureName]) -> Optional[pd.DataFrame]:

        if len(midi_feature_names) > 0 and len(audio_feature_names) > 0:
            q = text(
                "SELECT song.title, " +
                ','.join(['M.' + m for m in midi_feature_names]) + ", " +
                ','.join(['A.' + a for a in audio_feature_names]) + " " +
                "FROM song INNER JOIN midi_features M on M.md5 = song.md5 " +
                "INNER JOIN audio_features A on A.spotify_track_id = song.spotify_track_id;"
            )
        elif len(midi_feature_names) > 0:
            q = text(
                "SELECT song.title, " +
                ','.join(['M.' + m for m in midi_feature_names]) + " " +
                "FROM song INNER JOIN midi_features M on M.md5 = song.md5")
        elif len(audio_feature_names) > 0:
            q = text(
                "SELECT song.title, " +
                ','.join(['A.' + a for a in audio_feature_names]) + " " +
                "FROM song INNER JOIN audio_features A on A.spotify_track_id = song.spotify_track_id;")
        else:
            return
        logger.debug(q)
        try:
            df = pd.read_sql_query(sql=q, con=self.engine)
            return df
        except Exception as e:
            logger.warn("database error: {e}")
            return


if __name__ == "__main__":
    ...
