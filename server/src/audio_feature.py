import os
from random import choice
import sys
from glob import glob
from typing import List

import librosa
from sklearn.preprocessing import minmax_scale
from src.utils import create_logger, env

logger = create_logger(os.path.basename(__file__))

AudioPath = str
audio_files: List[AudioPath] = glob(os.path.join(
    env["DATASET_PATH"], "spotify_sample", "**", "*.mp3"), recursive=True)


def normalize(x, axis=0):
    return minmax_scale(x, axis=axis)


def extract_features(path: AudioPath):
    y, sr = librosa.load(path)
    zero_crossings = librosa.zero_crossings(y, pad=False)
    y_harm, y_perc = librosa.effects.hpss(y)
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    mfccs = librosa.feature.mfcc(y=y, sr=sr)
    mfccs = normalize(mfccs, axis=1)
    chromagram = librosa.feature.chroma_stft(y=y, sr=sr, hop_length=512)
    return [
        zero_crossings,
        y_harm,
        y_perc,
        spectral_centroids,
        spectral_rolloff,
        mfccs,
        chromagram,
    ]


if __name__ == "__main__":
    feature_list = extract_features(choice(audio_files))
    for f in feature_list:
        logger.info(f.shape)
