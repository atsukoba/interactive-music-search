import hashlib
import os
from glob import glob
from pathlib import Path
from random import choice
from typing import List, Optional, Union
from urllib.request import urlretrieve
try:
    import cPickle as pickle  # type: ignore
except:
    import pickle
import muspy
import numpy as np
from muspy import Music
from sklearn.preprocessing import minmax_scale
from src.utils import MD5, SID, create_logger, env
from tqdm import tqdm

""" MIDI Feature Extraction

https://salu133445.github.io/muspy/metrics.html

n_pitches_used
n_pitches_used
n_pitch_classes_used
polyphony
polyphony_rate
scale_consistency
pitch_entropy
pitch_class_entropy
empty_beat_rate
drum_in_pattern_rate
drum_pattern_consistency
"""

MidiPath = str
MidiFeatures = List[Union[str, int, float]]

logger = create_logger(os.path.basename(__file__))

MIDI_FEATURE_ORDER = [
    "md5",
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


# NOTE: the var `all_midi_files` not used for build dataset because it's
# not compatible with the FK constraint set to the relation between
# `midi_features` (md5) table and `song` table (md5)
all_midi_files: List[MidiPath] = glob(os.path.join(
    env["DATASET_PATH"], "MMD_MIDI", "**", "*.mid"), recursive=True)


def md5_to_filepath(sid: SID) -> str:
    return os.path.join(env["DATASET_PATH"], "MMD_MIDI",
                        sid[0], sid[1], sid[2], sid + ".mid")


def filepath_to_md5(path: MidiPath) -> str:
    return path.split(os.path.sep)[-1].replace(".mid", "")


def is_downloaded(path: MidiPath) -> bool:
    return os.path.exists(path)


def calc_md5_from_midi_obj(midi: Music) -> str:
    midi_b = pickle.dumps(midi)
    return hashlib.md5(midi_b).hexdigest()  # type: ignore


def calc_midi_features(path: str, is_users_song=False) -> Optional[MidiFeatures]:
    if not is_downloaded(path):
        logger.debug(f"file: {path} not exists in midi data dir")
        return
    mus: Music = muspy.read_midi(path)
    if is_users_song:
        md5: MD5 = calc_md5_from_midi_obj(mus)
    else:
        md5: MD5 = filepath_to_md5(path)
    pitch_range = muspy.pitch_range(mus)
    n_pitches_used = muspy.n_pitches_used(mus)
    n_pitch_classes_used = muspy.n_pitch_classes_used(mus)
    polyphony = muspy.polyphony(mus)
    polyphony_rate = muspy.polyphony_rate(mus)
    scale_consistency = muspy.scale_consistency(mus)
    pitch_entropy = muspy.pitch_entropy(mus)
    pitch_class_entropy = muspy.pitch_class_entropy(mus)
    empty_beat_rate = muspy.empty_beat_rate(mus)
    drum_in_duple_rate = muspy.drum_in_pattern_rate(mus, "duple")
    drum_in_triple_rate = muspy.drum_in_pattern_rate(mus, "triple")
    drum_pattern_consistency = muspy.drum_pattern_consistency(mus)
    return [
        md5,
        pitch_range,
        n_pitches_used,
        n_pitch_classes_used,
        polyphony,
        polyphony_rate,
        scale_consistency,
        pitch_entropy,
        pitch_class_entropy,
        empty_beat_rate,
        drum_in_duple_rate,
        drum_in_triple_rate,
        drum_pattern_consistency
    ]


if __name__ == "__main__":
    feature_list = calc_midi_features(choice(all_midi_files))
    if feature_list:
        for f in feature_list:
            logger.info(f)
