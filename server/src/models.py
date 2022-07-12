import os
from datetime import datetime
from enum import unique

from sqlalchemy import (ARRAY, Column, DateTime, Float, ForeignKey, Integer,
                        String, Text, create_engine)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, scoped_session, sessionmaker

from src.utils import env

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
    __table_args__ = {"autoload": True}

    md5 = Column(Integer, ForeignKey("song.md5"), primary_key=True)
    pitch_range = Column(Float)
    n_pitches_used = Column(Float)
    n_pitch_classes_used = Column(Float)
    polyphony = Column(Float)
    polyphony_rate = Column(Float)
    scale_consistency = Column(Float)
    pitch_entropy = Column(Float)
    pitch_class_entropy = Column(Float)
    empty_beat_rate = Column(Float)
    drum_in_duple_rate = Column(Float)
    drum_in_triple_rate = Column(Float)
    drum_pattern_consistency = Column(Float)


class AudioFeatures(Base):
    __tablename__ = 'audio_features'
    __table_args__ = {"autoload": True}

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
    __table_args__ = {"autoload": True}

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
