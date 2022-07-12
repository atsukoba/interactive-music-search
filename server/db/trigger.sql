CREATE FUNCTION update_song_from_midi() RETURNS trigger AS $update_song_from_midi$
BEGIN
  -- insert mock audio ID (spotify_track_id) on `song` table
  INSERT INTO song VALUES (
      NEW.md5,
      "no_audio_track_" || NEW.md5,
      "No Title",
      "User",
      extract( year FROM CURRENT_DATE )::int
  );
  RETURN NEW;
END;
$update_song_from_midi$
LANGUAGE plpgsql;

CREATE TRIGGER update_song_from_midi AFTER INSERT ON midi_features FOR EACH ROW
EXECUTE FUNCTION update_song_from_midi();

CREATE FUNCTION update_song_from_audio() RETURNS trigger AS $update_song_from_audio$
BEGIN
  -- insert mock audio ID (spotify_track_id) on `song` table
  INSERT INTO song VALUES (
      NEW.spotify_track_id,
      "no_midi_track_" || NEW.spotify_track_id,
      "No Title",
      "User",
      extract( year FROM CURRENT_DATE )::int
  );
  RETURN NEW;
END;
$update_song_from_audio$
LANGUAGE plpgsql;

CREATE TRIGGER update_song_from_audio AFTER INSERT ON audio_features FOR EACH ROW
EXECUTE FUNCTION update_song_from_audio();
