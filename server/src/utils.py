import hashlib
import json
import logging
import os
from datetime import datetime
import pickle
from typing import Literal
from miditoolkit.midi.parser import MidiFile
import requests

# types

AudioPath = str

# Audio Features
AudioFeatureName = Literal[
    "zero_crossings",
    "harmonic",
    "percussive",
    "spectral_centroids",
    "spectral_rolloff",
    "mfccs",
    "chromagram"
]

with open(os.path.join(os.path.dirname(__file__), "..", "environment.json"), "r") as f:
    env = json.load(f)

loggers_dict = {}


def create_logger(name: str) -> logging.Logger:
    global loggers_dict
    if name in loggers_dict:
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
        d = datetime.now().strftime("%Y%m%d-%H:%M:%S")
        fh = logging.FileHandler(os.path.join(
            os.path.dirname(__file__), "..", "logs", d + "log"))
        fh.setFormatter(formatter)
        fh.setLevel(logging.DEBUG)
        logger.addHandler(fh)
        return logger


def get_md5_from_path(file_path: str) -> str:
    return hashlib.md5(open(file_path, "rb").read()).hexdigest()


def get_md5_from_midifile(m: MidiFile) -> str:
    return hashlib.md5(pickle.dumps(m)).hexdigest()


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
