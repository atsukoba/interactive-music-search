import hashlib
import json
import logging
import os
import pickle
from datetime import datetime
from typing import Dict, List, Literal, Optional, TypedDict

import requests
from miditoolkit.midi.parser import MidiFile

# types

AudioPath = str
SID = str
MD5 = str

# Song Table
SongTableColumnName = Literal[
    "md5",
    "spotify_track_id",
    "midi_artist",
    "midi_title",
    "scraped_genre",
    "title",
    "artist",
    "artist_id",
    "album_title",
    "album_id",
    "date"
]

"""Table `song`

      Column      | Type | Collation | Nullable | Default 
:-----------------|:-----|:----------|:---------|:--------
 md5              | text |           | not null | 
 spotify_track_id | text |           | not null | 
 midi_artist      | text |           |          | 
 midi_title       | text |           |          | 
 scraped_genre    | text |           |          | 
 title            | text |           |          | 
 artist           | text |           |          | 
 artist_id        | text |           |          | 
 album_title      | text |           |          | 
 album_id         | text |           |          | 
 date             | date |           |          | 

Indexes:
    "song_pkey" PRIMARY KEY, btree (md5, spotify_track_id)
    "song_md5_key" UNIQUE CONSTRAINT, btree (md5)
    "song_spotify_track_id_key" UNIQUE CONSTRAINT, btree (spotify_track_id)
Referenced by:
    TABLE "spotify_features" CONSTRAINT "spotify_features_md5_fkey" FOREIGN KEY (md5) REFERENCES song(md5)
    TABLE "spotify_features" CONSTRAINT "spotify_features_spotify_track_id_fkey" FOREIGN KEY (spotify_track_id) REFERENCES song(spotify_track_id)
"""


# Audio Features
AudioFeatureName = Literal[
    "tempo",
    "zero_crossing_rate",
    "harmonic_components",
    "percussive_components",
    "spectral_centroid",
    "spectral_rolloff",
    "chroma_frequencies"
]
"""Audio Feature Table (audio_features)

        Column         |        Type        | Collation | Nullable | Default
:----------------------|:-------------------|:----------|:---------|:--------
 spotify_track_id      | text               |           |          |
 tempo                 | double precision   |           |          |
 zero_crossing_rate    | double precision[] |           |          |
 harmonic_components   | double precision[] |           |          |
 percussive_components | double precision[] |           |          |
 spectral_centroid     | double precision[] |           |          |
 spectral_rolloff      | double precision[] |           |          |
 chroma_frequencies    | double precision[] |           |          |

Foreign-key constraints:
"audio_features_spotify_track_id_fkey" FOREIGN KEY (spotify_track_id) REFERENCES song(spotify_track_id)
"""

# MIDI Features
MidiFeatureName = Literal[
    "pitch_range",
    "n_pitches_used",
    "n_pitch_classes_used",
    "polyphony",
    "polyphony_rate",
    "scale_consistency",
    "pitch_entropy",
    "pitch_class_entropy",
    "empty_beat_rate",
    "drum_in_duple_rate",
    "drum_in_triple_rate",
    "drum_pattern_consistency"
]

"""MIDI Feature Table (midi_features)

          Column          |       Type       | Collation | Nullable | Default
:-------------------------|:-----------------|:----------|:---------|:--------
 md5                      | text             |           |          |
 pitch_range              | integer          |           |          |
 n_pitches_used           | integer          |           |          |
 n_pitch_classes_used     | integer          |           |          |
 polyphony                | double precision |           |          |
 polyphony_rate           | double precision |           |          |
 scale_consistency        | double precision |           |          |
 pitch_entropy            | double precision |           |          |
 pitch_class_entropy      | double precision |           |          |
 empty_beat_rate          | double precision |           |          |
 drum_in_duple_rate       | double precision |           |          |
 drum_in_triple_rate      | double precision |           |          |
 drum_pattern_consistency | double precision |           |          |

Foreign-key constraints:
- "midi_features_md5_fkey" FOREIGN KEY (md5) REFERENCES song(md5)
"""

SpotifyFeatureName = Literal[
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
    "valence"
]

"""Spotify Feature Table (spotify_features)

      Column      |       Type       | Collation | Nullable | Default 
:-----------------|:-----------------|:----------|:---------|:--------
 spotify_track_id | text             |           |          | 
 md5              | text             |           |          | 
 acousticness     | double precision |           |          | 
 danceability     | double precision |           |          | 
 duration_ms      | double precision |           |          | 
 energy           | double precision |           |          | 
 instrumentalness | double precision |           |          | 
 key              | double precision |           |          | 
 liveness         | double precision |           |          | 
 loudness         | double precision |           |          | 
 mode             | double precision |           |          | 
 speechiness      | double precision |           |          | 
 tempo            | double precision |           |          | 
 time_signature   | double precision |           |          | 
 valence          | double precision |           |          | 
 album_jacket_url | text             |           |          | 

Foreign-key constraints:
- "spotify_features_md5_fkey" FOREIGN KEY (md5) REFERENCES song(md5)
- "spotify_features_spotify_track_id_fkey" FOREIGN KEY (spotify_track_id) REFERENCES song(spotify_track_id)
"""


AudioFeatureNames: List[AudioFeatureName] = [
    "tempo",
    "zero_crossing_rate",
    "harmonic_components",
    "percussive_components",
    "spectral_centroid",
    "spectral_rolloff",
    "chroma_frequencies"
]

MidiFeatureNames: List[MidiFeatureName] = [
    "pitch_range",
    "n_pitches_used",
    "n_pitch_classes_used",
    "polyphony",
    "polyphony_rate",
    "scale_consistency",
    "pitch_entropy",
    "pitch_class_entropy",
    "empty_beat_rate",
    "drum_in_duple_rate",
    "drum_in_triple_rate",
    "drum_pattern_consistency"
]

SpotifyFeatureNames: List[SpotifyFeatureName] = [
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
    "valence"
]


class Environment(TypedDict):
    APP_SERVER_PORT: int
    DEBUG: bool
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE_HOST: str
    DATABASE_PORT: int
    DATASET_TYPE: str
    DATASET_PATH: str
    client_id: Optional[str]
    client_secret: Optional[str]
    slack_notification_url: Optional[str]
    slack_notification_user: Optional[str]


with open(os.path.join(os.path.dirname(__file__), "..", "environment.json"), "r") as f:
    env: Environment = json.load(f)

loggers_dict: Dict[str, logging.Logger] = {}
script_start_time = datetime.now().strftime("%Y%m%d-%H:%M:%S")


def create_logger(name: str) -> logging.Logger:
    global loggers_dict
    if name in loggers_dict.keys():
        return loggers_dict[name]
    else:
        logger = logging.getLogger(name)
        loggers_dict[name] = logger
        logger.setLevel(logging.DEBUG)
        handler = logging.StreamHandler()
        handler.setLevel(logging.INFO)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.propagate = False
        fh = logging.FileHandler(os.path.join(
            os.path.dirname(__file__), "..", "logs",
            script_start_time + ".log"))
        fh.setFormatter(formatter)
        fh.setLevel(logging.DEBUG)
        logger.addHandler(fh)
        return logger


def get_md5_from_path(file_path: str) -> str:
    return hashlib.md5(open(file_path, "rb").read()).hexdigest()


def get_md5_from_midifile(m: MidiFile) -> str:
    return hashlib.md5(pickle.dumps(m)).hexdigest()


def get_midi_path_from_md5(md5: str) -> str:
    p = env["DATASET_PATH"].split(os.path.sep)
    if env["DATASET_TYPE"] == "MMD":
        p = os.path.sep + os.path.join(*p, "MMD_MIDI",
                                       md5[0], md5[1], md5[2], md5 + ".mid")
    else:
        p = os.path.sep + \
            os.path.join(*p, md5[0], md5[1], md5[2], md5 + ".mid")
    return p


def get_midi_path_from_md5_with_check(md5: str) -> Optional[str]:
    p = get_midi_path_from_md5(md5)
    if os.path.exists(p):
        return p
    return


SLACK_URL = env.get("slack_notification_url", None)
HOST = "[%s]" % os.uname()[1]


def __send_notify(obj={
    "channel": "#server-log",
    "username": f"{HOST}",
    "text": "Hello, World!",
        "icon_emoji": ":computer:"}):
    if SLACK_URL is not None:
        json_data = json.dumps(obj).encode("utf-8")
        try:
            res = requests.post(SLACK_URL, data=json_data)
            if not res.ok:
                print("failed to post webhook")
        except Exception as e:
            print(f"failed to notify\n{e}")
    # print(response.read().decode("utf-8"))\


def slack_notify_info(username: str, message: str, mention_to=[],
                      title="Server Log", color="F7FF00"):

    if type(mention_to) == list:
        mention_to = [f"<@{u}>" for u in mention_to]
        mention_to = " ".join(mention_to)

    elif type(mention_to) == str:
        mention_to = f"<@{mention_to}>"

    obj = {
        "channel": "#server-log",
        "username": f"{username}@{HOST}",
        "icon_emoji": ":computer:",
        "attachments": [{
            "color": f"#{color}",
            "title": title,
            "text": f"{mention_to}\n\n{message}",
            "mrkdwn_in": [
                "text"
            ]
        }],
    }
    __send_notify(obj)


class DBNotConnectedError(RuntimeError):
    def __repr__(self) -> str:
        return "Database not connected"


if __name__ == "__main__":
    pass
