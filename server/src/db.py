from venv import create
from sqlalchemy import (ARRAY, Column, Float,
                        ForeignKey, Integer, String, text)
from sqlalchemy import create_engine as ce
import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, scoped_session, sessionmaker
import pandas as pd
import os

from src.utils import create_logger, env
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

    def get_all_cood(self) -> pd.DataFrame:
        q = text(
            f"SELECT longitude, latitude FROM place;"
        )
        logger.debug(q)
        df = pd.read_sql_query(sql=q, con=self.engine)
        return df

    def place_time_within(self, start_date: str, end_date: str) -> pd.DataFrame:
        q = text(
            f"SELECT P.* FROM place P INNER JOIN event E on E.id = P.event_id WHERE start_time >= '{start_date}' AND start_time <= '{end_date}';"
        )
        logger.debug(q)
        df = pd.read_sql_query(sql=q, con=self.engine)
        logger.debug(df.head(5))
        return df

    def move_time_within(self, start_date: str, end_date: str) -> pd.DataFrame:
        q = text(
            f"SELECT A.* FROM activity A INNER JOIN event E on E.id = A.event_id WHERE start_time >= '{start_date}' AND start_time <= '{end_date}';"
        )
        logger.debug(q)
        df = pd.read_sql_query(sql=q, con=self.engine)
        logger.debug(df.head(5))
        return df

    def move_time_distance_within(self, start_date: str, end_date: str, distance: float) -> pd.DataFrame:
        q = text(
            f"SELECT A.* FROM activity A INNER JOIN event E on E.id = A.event_id WHERE start_time >= '{start_date}' AND start_time <= '{end_date}' AND distance(A.start_latitude, A.start_longitude, A.end_latitude, A.end_longitude) <= {distance};"
        )
        logger.debug(q)
        df = pd.read_sql_query(sql=q, con=self.engine)
        logger.debug(df.head(5))
        return df


if __name__ == "__main__":
    ...
