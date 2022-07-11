import os
from enum import unique

from sqlalchemy import (Column, Float, ForeignKey, Integer, String, ARRAY,
                        create_engine)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, scoped_session, sessionmaker
from src.utils import env

# Config
connection_config = {
    "user": env["DATABASE_USER"],
    "password": env["DATABASE_PASSWORD"],
    "host": env["DATABASE_HOST"],
    # "socket": env["DATABASE_SOCKET"],  # if needed
    "database": "songs"
}

# Models
Base = declarative_base()


class Song(Base):
    __tablename__ = 'song'

    md5 = Column(Integer, primary_key=True)
    spotify_track_id = Column(String)
    title = Column(String)
    artist = Column(String)
    year = Column(Integer)


class MidiFeatures(Base):
    __tablename__ = 'midi_features'

    md5 = Column(Integer, ForeignKey("song.md5"), primary_key=True)
    total_used_pitch = Column(Integer)
    bar_used_pitch = Column(Float)
    total_used_note = Column(Integer)
    bar_used_note = Column(Float)
    bar_pitch_class_histogram = Column(Float)
    pitch_range = Column(Integer)
    avg_pitch_shift = Column(Float)
    avg_IOI = Column(Float)
    note_length_hist = Column(Float)


class AudioFeatures(Base):
    __tablename__ = 'audio_features'

    spotify_track_id = Column(String, ForeignKey(
        "song.spotify_track_id"), primary_key=True)
    tempo = Column(Float)
    zero_crossing_rate = Column(ARRAY(Float))
    harmonic_components = Column(ARRAY(Float))
    percussive_components = Column(ARRAY(Float))
    spectral_centroid = Column(ARRAY(Float))
    spectral_rolloff = Column(ARRAY(Float))
    chroma_frequencies = Column(ARRAY(Float))


class SpotifyFeatures(Base):
    __tablename__ = 'spotify_features'

    spotify_track_id = Column(String, ForeignKey(
        "song.spotify_track_id"), primary_key=True)
    acousticness = Column(Float)
    danceability = Column(Float)
    duration_ms = Column(Float)
    energy = Column(Float)
    instrumentalness = Column(Float)
    key = Column(Float)
    liveness = Column(Float)
    loudness = Column(Float)
    mode = Column(Float)
    speechiness = Column(Float)
    tempo = Column(Float)
    time_signature = Column(Float)
    valence = Column(Float)


if __name__ == "__main__":
    pass
