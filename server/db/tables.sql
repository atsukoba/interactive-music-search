CREATE TABLE Song (
    md5 TEXT PRIMARY KEY,
    spotify_track_id TEXT NOT NULL,
    title TEXT,
    artist TEXT,
    publish_year smallint
);

CREATE TABLE MIDI_Features (
    md5 TEXT REFERENCES Song(md5),
    total_used_pitch INT,
    bar_used_pitch FLOAT,
    total_used_note INT,
    bar_used_note FLOAT,
    bar_pitch_class_histogram FLOAT,
    pitch_range int,
    avg_pitch_shift FLOAT,
    avg_IOI FLOAT,
    note_length_hist FLOAT,
);

CREATE TABLE Audio_Features (
    spotidy_track_id TEXT REFERENCES Song(spotidy_track_id),
    tempo FLOAT,
    zero_crossing_rate FLOAT,
    harmonic_and_percussive_components FLOAT,
    spectral_centroid FLOAT,
    spectral_rolloff FLOAT,
    mfcc FLOAT,
    chroma_frequencies FLOAT,
);

CREATE TABLE Spotify_Features (
    spotidy_track_id TEXT REFERENCES Song(spotidy_track_id),
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
    valence FLOAT,
);