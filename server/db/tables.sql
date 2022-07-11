DROP TABLE IF EXISTS midi_features;
DROP TABLE IF EXISTS audio_features;
DROP TABLE IF EXISTS spotify_features;
DROP TABLE IF EXISTS song;

CREATE TABLE song (
    md5 TEXT NOT NULL UNIQUE,
    spotify_track_id TEXT NOT NULL UNIQUE,
    title TEXT,
    artist TEXT,
    publish_year smallint,
    PRIMARY KEY(md5, spotify_track_id)
);

CREATE TABLE midi_features (
    md5 TEXT REFERENCES song(md5),
    total_used_pitch INT,
    bar_used_pitch FLOAT,
    total_used_note INT,
    bar_used_note FLOAT,
    bar_pitch_class_histogram FLOAT,
    pitch_range int,
    avg_pitch_shift FLOAT,
    avg_IOI FLOAT,
    note_length_hist FLOAT
);

CREATE TABLE audio_features (
    spotify_track_id TEXT REFERENCES song(spotify_track_id),
    tempo FLOAT,
    zero_crossing_rate FLOAT[],
    harmonic_components FLOAT[],
    percussive_components FLOAT[],
    spectral_centroid FLOAT[],
    spectral_rolloff FLOAT[],
    chroma_frequencies FLOAT[]
);

CREATE TABLE spotify_features (
    spotify_track_id TEXT REFERENCES song(spotify_track_id),
    acousticness FLOAT,
    danceability FLOAT,
    duration_ms FLOAT,
    energy FLOAT,
    instrumentalness FLOAT,
    music_key FLOAT,
    liveness FLOAT,
    loudness FLOAT,
    mode FLOAT,
    speechiness FLOAT,
    tempo FLOAT,
    time_signature FLOAT,
    valence FLOAT
);