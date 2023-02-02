CREATE SCHEMA IF NOT EXISTS public;

DROP TABLE IF EXISTS spotify_features;

DROP TABLE IF EXISTS song CASCADE;

CREATE TABLE public.song (
    md5 TEXT NOT NULL UNIQUE,
    spotify_track_id TEXT NOT NULL UNIQUE,
    midi_artist TEXT,
    midi_title TEXT,
    scraped_genre TEXT,
    title TEXT,
    artist TEXT,
    artist_id TEXT,
    album_title TEXT,
    album_id TEXT,
    date DATE,
    PRIMARY KEY(md5, spotify_track_id)
);

CREATE TABLE public.midi_features (
    md5 TEXT REFERENCES song(md5),
    -- Pitch metrics
    pitch_range INT,
    n_pitches_used INT,
    n_pitch_classes_used INT,
    polyphony FLOAT,
    polyphony_rate FLOAT,
    scale_consistency FLOAT,
    pitch_entropy FLOAT,
    pitch_class_entropy FLOAT,
    -- Rhythm metrics
    empty_beat_rate FLOAT,
    drum_in_duple_rate FLOAT,
    drum_in_triple_rate FLOAT,
    drum_pattern_consistency FLOAT -- Duplicated mgeval metrics
    -- total_used_pitch INT,
    -- bar_used_pitch FLOAT,
    -- total_used_note INT,
    -- bar_used_note FLOAT,
    -- bar_pitch_class_histogram FLOAT,
    -- pitch_range int,
    -- avg_pitch_shift FLOAT,
    -- avg_IOI FLOAT,
    -- note_length_hist FLOAT
);

CREATE TABLE public.audio_features (
    spotify_track_id TEXT REFERENCES song(spotify_track_id),
    tempo FLOAT,
    zero_crossing_rate FLOAT [],
    harmonic_components FLOAT [],
    percussive_components FLOAT [],
    spectral_centroid FLOAT [],
    spectral_rolloff FLOAT [],
    chroma_frequencies FLOAT []
);

CREATE TABLE public.spotify_features (
    spotify_track_id TEXT REFERENCES song(spotify_track_id),
    md5 TEXT REFERENCES song(md5),
    acousticness FLOAT,
    danceability FLOAT,
    duration_ms FLOAT,
    energy FLOAT,
    instrumentalness FLOAT,
    key FLOAT,
    liveness FLOAT,
    loudness FLOAT,
    mode FLOAT,
    speechiness FLOAT,
    tempo FLOAT,
    time_signature FLOAT,
    valence FLOAT,
    album_jacket_url TEXT
);