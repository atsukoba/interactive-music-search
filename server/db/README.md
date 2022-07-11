# MIDI / Audio Feature Database

each chunk from the song has a features obtained both MIDI and Audio sample

init

```shell
psql songs < tables.sql
```

## ER Diagram

```mermaid
erDiagram
    Songs {
        TEXT MD5 PK
        TEXT SpotifyTrackID PK
        TEXT Title
        TEXT Artist
        INT Year

    }
    MIDI_Features ||--o{ Songs : is
    MIDI_Features {
        TEXT MD5 FK
        INT pitch_range
        INT n_pitches_used
        INT n_pitch_classes_used
        FLOAT polyphony
        FLOAT polyphony_rate
        FLOAT scale_consistency
        FLOAT pitch_entropy
        FLOAT pitch_class_entropy
        FLOAT empty_beat_rate
        FLOAT drum_in_duple_rate
        FLOAT drum_in_triple_rate
        FLOAT drum_pattern_consistency
    }
    Audio_Features ||--o{ Songs : is
    Audio_Features {
        TEXT SpotifyTrackID FK
        FLOAT tempo
        FLOAT_ARRAY zero_crossing_rate
        FLOAT_ARRAY harmonic_components
        FLOAT_ARRAY percussive_components
        FLOAT_ARRAY spectral_centroid
        FLOAT_ARRAY spectral_rolloff
        FLOAT_ARRAY chroma_frequencies
    }
    <!-- Spotify_Features ||--o{ Songs : is
    Spotify_Features {
        TEXT SpotifyTrackID FK
        FLOAT acousticness
        FLOAT danceability
        FLOAT duration_ms
        FLOAT energy
        FLOAT instrumentalness
        FLOAT key
        FLOAT liveness
        FLOAT loudness
        FLOAT mode
        FLOAT speechiness
        FLOAT tempo
        FLOAT time_signature
        FLOAT valence
    }
    Original_Features ||--o{ Songs : is
    Original_Features {
        TEXT SpotifyTrackID FK
        FLOAT original_feature_1
        FLOAT original_feature_2
        FLOAT original_feature_3
    } -->
```

### Tables

```
songs=# \dt
             List of relations
 Schema |       Name       | Type  | Owner
--------+------------------+-------+--------
 public | audio_features   | table | atsuya
 public | midi_features    | table | atsuya
 public | song             | table | atsuya
 public | spotify_features | table | atsuya

```

## Audio Features

With `Librosa`, which is one of most useful sound library for Pythonists, it's able to extract several kinds of audio features as `numpy` array

- Tempo(BPM)
- Zero Crossing Rate
- Harmonic and Percussive Components
- Spectral Centroid
- Spectral Rolloff
- Mel-Frequency Cepstral Coefficients(MFCCs)
- Chroma Frequencies

## Spotify Features

Spotify API gives audio features for each track, response is like below

```json
{
  "acousticness": 0.00242,
  "analysis_url": "https://api.spotify.com/v1/audio-analysis/2takcwOaAZWiXQijPHIx7B\n",
  "danceability": 0.585,
  "duration_ms": 237040,
  "energy": 0.842,
  "id": "2takcwOaAZWiXQijPHIx7B",
  "instrumentalness": 0.00686,
  "key": 9,
  "liveness": 0.0866,
  "loudness": -5.883,
  "mode": 0,
  "speechiness": 0.0556,
  "tempo": 118.211,
  "time_signature": 4,
  "track_href": "https://api.spotify.com/v1/tracks/2takcwOaAZWiXQijPHIx7B\n",
  "type": "audio_features",
  "uri": "spotify:track:2takcwOaAZWiXQijPHIx7B",
  "valence": 0.428
}
```

Sound features

- acousticness
- danceability
- duration_ms
- energy
- instrumentalness
- key
- liveness
- loudness
- mode
- speechiness
- tempo
- time_signature
- valence

## MIDI Features

### Muspy metrics

> These objective metrics could be used to evaluate a music generation system by comparing the statistical difference between the training data and the generated samples.

<https://salu133445.github.io/muspy/metrics.html>

- `pitch_range`
- `n_pitches_used`
- `n_pitch_classes_used`
- `polyphony`
- `polyphony_rate`
- `scale_consistency`
- `pitch_entropy`
- `pitch_class_entropy`
- `empty_beat_rate`
- `drum_in_duple_rate`
- `drum_in_triple_rate`
- `drum_pattern_consistency`

### Duplicated

extracted using mgeval, which implemented several symbolic features explained in the Paper: [MGEval - An objective evaluation toolbox for symbolic domain music generation](https://richardyang40148.github.io/TheBlog/post_mgeval.html)

features (introduced [here](https://github.com/RichardYang40148/mgeval/blob/master/mgeval/documentation.md))

- `total_used_pitch` (Pitch count):
- `bar_used_pitch` (Pitch count per bar)
- `total_used_note` (Note count):
- `bar_used_note` (Note count per bar).
- `total_pitch_class_histogram` (Pitch class histogram):
- `bar_pitch_class_histogram` (Pitch class histogram per bar):
- `pitch_class_transition_matrix` (Pitch class transition matrix):
- `pitch_range` (Pitch range):
- `avg_pitch_shift` (Average pitch interval):
- `avg_IOI` (Average inter-onset-interval):
- `note_length_hist` (Note length histogram):
- `note_length_transition_matrix` (Note length transition matrix):

## Original Features

If needed, additional feature table can be designed to make the interface app more interpretable.
