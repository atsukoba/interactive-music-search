"""
Script for creating database for songs from Meta MIDI Dataset and Spotify API results

Author: Atsuya Kobayashi

## `song` table to be created

| md5                              | spotify_track_id       | midi_artist      | midi_title                           | scraped_genre | title                                                                                   | artist           | artist_id              | album_title                                         | album_id               | date       |
| :------------------------------- | :--------------------- | :--------------- | :----------------------------------- | :------------ | :-------------------------------------------------------------------------------------- | :--------------- | :--------------------- | :-------------------------------------------------- | :--------------------- | :--------- |
| d6eac6739a3802c80620cca517bb8df5 | 1HeQiwFIcoiWDuXfoQOP7S | Detroit Spinners | Working My Way Back To You           | pop           | Working My Way Back to You (Karaoke Version) - Originally Performed By The Four Seasons | Dohn Joe         | 6p2SwRrKME2QzT2wzFIRzm | 50 Greatest Karaoke Hits, Vol. 96 (Karaoke Version) | 10AmD6sYR3V0FnSSPoycrz | 2014-02-14 |
| 86979a691472d5e8cd4610ceff94d2fe | 1HeQiwFIcoiWDuXfoQOP7S | Detroit Spinners | Working My Way Back To You (Karaoke) | dance-eletric | Working My Way Back to You (Karaoke Version) - Originally Performed By The Four Seasons | Dohn Joe         | 6p2SwRrKME2QzT2wzFIRzm | 50 Greatest Karaoke Hits, Vol. 96 (Karaoke Version) | 10AmD6sYR3V0FnSSPoycrz | 2014-02-14 |
| ae9525a511def30a30dff3cea768704e | 1HeQiwFIcoiWDuXfoQOP7S | Spinners         | Working My Way Back to You           | rnb-soul      | Working My Way Back to You (Karaoke Version) - Originally Performed By The Four Seasons | Dohn Joe         | 6p2SwRrKME2QzT2wzFIRzm | 50 Greatest Karaoke Hits, Vol. 96 (Karaoke Version) | 10AmD6sYR3V0FnSSPoycrz | 2014-02-14 |
| 1420bfd20ccff17031d0d15907c1ebaa | 18MlGPFYkq9ugGS1xRrfcL | Lil Wayne        | Right Above It                       | hip-hop-rap   | Right Above It - Instrumental                                                           | James Jones Band | 4AVzl6ldhGOg9QSF06VhIf | An Instrumental Tribute to Lil Wayne                | 3ryYfa8G4N6jN9AQWkWtq4 | 2013-06-04 |
| 1f9d6cd5c4f99de6cb4c1e1bdc6b716f | 18MlGPFYkq9ugGS1xRrfcL | Gamma Ray        | The Silence (Live)                   | metal         | Right Above It - Instrumental                                                           | James Jones Band | 4AVzl6ldhGOg9QSF06VhIf | An Instrumental Tribute to Lil Wayne                | 3ryYfa8G4N6jN9AQWkWtq4 | 2013-06-04 |

## `spotify_features` table to be created

| acousticness | danceability | duration_ms | energy | instrumentalness |  key | liveness | loudness | mode | speechiness |   tempo | time_signature | valence | album_jacket_url                                                 | spotify_track_id       | md5                              |
| -----------: | -----------: | ----------: | -----: | ---------------: | ---: | -------: | -------: | ---: | ----------: | ------: | -------------: | ------: | :--------------------------------------------------------------- | :--------------------- | :------------------------------- |
|        0.616 |        0.542 |      165068 |   0.48 |            0.857 |    0 |    0.427 |   -7.579 |    1 |      0.0343 | 130.066 |              4 |   0.799 | https://i.scdn.co/image/ab67616d0000b2735088a95db05145588de8d7dd | 1HeQiwFIcoiWDuXfoQOP7S | d6eac6739a3802c80620cca517bb8df5 |
|        0.616 |        0.542 |      165068 |   0.48 |            0.857 |    0 |    0.427 |   -7.579 |    1 |      0.0343 | 130.066 |              4 |   0.799 | https://i.scdn.co/image/ab67616d0000b2735088a95db05145588de8d7dd | 1HeQiwFIcoiWDuXfoQOP7S | 86979a691472d5e8cd4610ceff94d2fe |
|        0.616 |        0.542 |      165068 |   0.48 |            0.857 |    0 |    0.427 |   -7.579 |    1 |      0.0343 | 130.066 |              4 |   0.799 | https://i.scdn.co/image/ab67616d0000b2735088a95db05145588de8d7dd | 1HeQiwFIcoiWDuXfoQOP7S | ae9525a511def30a30dff3cea768704e |
|       0.0179 |        0.345 |      270453 |  0.466 |            0.808 |    3 |     0.15 |   -6.349 |    0 |      0.0324 | 149.898 |              4 |   0.129 | https://i.scdn.co/image/ab67616d0000b27357d0bf5864973f633f1617d2 | 18MlGPFYkq9ugGS1xRrfcL | 1420bfd20ccff17031d0d15907c1ebaa |
|       0.0179 |        0.345 |      270453 |  0.466 |            0.808 |    3 |     0.15 |   -6.349 |    0 |      0.0324 | 149.898 |              4 |   0.129 | https://i.scdn.co/image/ab67616d0000b27357d0bf5864973f633f1617d2 | 18MlGPFYkq9ugGS1xRrfcL | 1f9d6cd5c4f99de6cb4c1e1bdc6b716f |
"""

from datetime import datetime
import json
import os
from glob import glob

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.schema import CreateSchema
from src.datasets import MMD_audio_matches, MMD_md5_metainfo
from src.utils import create_logger, env

logger = create_logger(os.path.basename(__file__))

MIDI_AUDIO_MATCH_SCORE_THRESHOLD = 0.6  # covers approx 50% of the dataset


def to_date(fmt: str):
    try:
        if fmt.count("-") > 1:
            d = datetime.strptime(fmt, "%Y-%m-%d")
        elif fmt.count("-") == 1:
            d = datetime.strptime(fmt, "%Y-%m")
        else:
            d = datetime.strptime(fmt, "%Y")
    except:
        d = datetime.now()
    return d.date()


if __name__ == "__main__":

    connection_config = {
        "user": env["DATABASE_USER"],
        "password": env["DATABASE_PASSWORD"],
        "host": env["DATABASE_HOST"],
        "database": "songs"
    }
    engine = create_engine(
        "postgresql://{user}:{password}@{host}/{database}".format(
            **connection_config), echo=True)
    # handling pandas dataframe
    songs = pd.merge(
        MMD_audio_matches[MMD_audio_matches.score > 0.6].sort_values(
            by=["score"], ascending=False)[["md5", "sid"]].drop_duplicates("md5", keep="first"),
        MMD_md5_metainfo[["md5", "artist", "title", "genre"]])
    songs.columns = ["md5", "spotify_track_id",
                     "midi_artist", "midi_title", "scraped_genre"]  # type: ignore
    logger.info(f"Got {len(songs)} songs info")
    assert os.path.exists(
        spotify_date_path := os.path.join(
            env["DATASET_PATH"], "MMD_spotify_all.csv")), \
        "`MMD_spotify_all.csv` not saved: would you like to run `create_audio_database.py` first?"
    df_MMD_spotify_all = pd.read_csv(spotify_date_path)
    songs_spotify_all = pd.merge(
        songs, df_MMD_spotify_all, on="spotify_track_id")
    logger.info(songs_spotify_all.shape)
    logger.info(f"Removing NaN and duplicates...")
    songs_spotify_all.dropna(inplace=True)
    songs_spotify_all.drop_duplicates(
        subset=["spotify_track_id"], inplace=True)
    print(songs_spotify_all.head().to_markdown())
    songs = songs_spotify_all[songs_spotify_all.columns[:11].values]
    songs["date"] = list(map(to_date, songs.date))
    logger.info(f"Got {len(songs)} unique songs info")

    # database setup
    logger.info(f"Creating db table `song`...")
    # NOTE: need drop cascade to set if_exists=replace
    songs.to_sql("song", con=engine, if_exists="append", index=False)
    spotify_df = songs_spotify_all[songs_spotify_all.columns[11:].values]
    spotify_df["spotify_track_id"] = songs_spotify_all["spotify_track_id"].values
    spotify_df["md5"] = songs_spotify_all["md5"].values

    logger.info(f"Creating db table `spotify_features`...")
    # NOTE: need drop cascade to set if_exists=replace
    spotify_df.to_sql("spotify_features", con=engine,
                      if_exists="append", index=False)
