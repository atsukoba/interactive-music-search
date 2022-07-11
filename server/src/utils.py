import hashlib
import json
import logging
import os
import pickle
from datetime import datetime
from typing import Dict, Literal, Optional, TypedDict

import requests
from miditoolkit.midi.parser import MidiFile

# types

AudioPath = str
SID = str
MD5 = str

# Audio Features
AudioFeatureName = Literal[
    "zero_crossing_rate",
    "harmonic",
    "percussive",
    "spectral_centroids",
    "spectral_rolloff",
    "chromagram"
]

# MIDI Features
MidiFeatureName = Literal[
    "total_used_pitch",
    "bar_used_pitch",
    "total_used_note",
    "bar_used_note",
    "bar_pitch_class_histogram",
    "pitch_range",
    "avg_pitch_shift",
    "avg_IOI",
    "note_length_hist"
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


if __name__ == "__main__":
    pass
