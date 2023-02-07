import { useContext, useEffect, useRef, useState } from "react";

import { Box, Button, CardContent, Slider, Stack, TextField, Typography } from "@mui/material";
import { postUserFile } from "../api/user_data";
import { audioBufferToWav } from "../utils/audioConversion";
import { ZoomIn, ZoomOut } from "@mui/icons-material";
import { UserSongsContext } from "../utils/context";

// import WaveSurfer from ;

const formWaveSurferOptions = (ref) => ({
  container: ref,
  waveColor: "black",
  progressColor: "#0064d0",
  cursorColor: "OrangeRed",
  barWidth: 3,
  barRadius: 3,
  responsive: true,
  height: 250,
  normalize: true,
  partialRender: true,
});

interface IProps {
  audioUrl: URL;
}

export default function WaveEditor({ audioUrl }: IProps) {
  const wavesurfer = useRef(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const { userSongData, setUserSongData } = useContext(UserSongsContext);
  const [sourceAudioUrl, setSourceAudioUrl] = useState<URL>(audioUrl);
  const [zoomRatio, setZoomRatio] = useState(1.0);
  const [zoomAvailable, setZoomAvailable] = useState(false);
  const [uploadFileNameFront, setUploadFileNameFront] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState("");
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (sourceAudioUrl !== null) {
      create();
      return () => {
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
        }
      };
    }
  }, [sourceAudioUrl]);

  const handleFileNameFront = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadFileNameFront(event.target.value);
  };

  const create = async () => {
    const WaveSurfer = (await import("wavesurfer.js")).default;
    const RegionsPlugin = (
      await import("wavesurfer.js/dist/plugin/wavesurfer.regions.js")
    ).default;
    const options = formWaveSurferOptions(waveformRef.current);
    const regionPlugin = RegionsPlugin.create({
      regionsMinLength: 2,
      dragSelection: { slop: 1 },
    });
    wavesurfer.current = WaveSurfer.create({
      ...options,
      plugins: [regionPlugin],
    });
    setLoading(true);
    wavesurfer.current.load(sourceAudioUrl);
    wavesurfer.current.on("ready", function () {
      setLoading(false);
      const dur = Number(wavesurfer.current.backend.getDuration());
      console.log("audio duration", dur);
      if (dur > 30) {
        setZoomAvailable(true);
        wavesurfer.current.addRegion({
          start: 0,
          end: 30,
          loop: true,
          color: "hsla(200, 50%, 70%, 0.4)",
          minLength: 1,
          maxLength: 5,
          multiple: false,
          resize: false,
        });
        console.dir(wavesurfer.current);
      } else {
        setZoomAvailable(false);
        wavesurfer.current.addRegion({
          start: 0,
          end: dur,
          loop: true,
          color: "hsla(200, 50%, 70%, 0.4)",
          multiple: false,
          resize: false,
        });
      }
      wavesurfer.current.disableDragSelection({ start: 0, end: dur });
    });
  };

  const copy = (start: number, end: number, instance: any): AudioBuffer => {
    let segmentDuration = end - start;
    console.log(end, "-", start, "=", segmentDuration);
    let originalBuffer: AudioBuffer = instance.backend.buffer;
    let emptySegment: AudioBuffer = instance.backend.ac.createBuffer(
      originalBuffer.numberOfChannels,
      segmentDuration * originalBuffer.sampleRate,
      originalBuffer.sampleRate
    );
    for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
      let chanData = originalBuffer.getChannelData(i);
      let emptySegmentData = emptySegment.getChannelData(i);
      let mid_data = chanData.subarray(
        start * originalBuffer.sampleRate,
        end * originalBuffer.sampleRate
      );
      emptySegmentData.set(mid_data);
    }
    return emptySegment;
  };

  const bufferToWave = (abuffer: AudioBuffer): Blob => {
    const arrayBuffer = audioBufferToWav(abuffer, {});
    const blob = new Blob([arrayBuffer], { type: "audio/wave" });
    return blob;
  };

  const save = async () => {
    const currentRegion: any = Object.values(
      wavesurfer.current.regions.list
    )[0];
    setUploading(true);
    setUploaded("");
    const start = currentRegion.start;
    const end = currentRegion.end;
    const buf = copy(start, end, wavesurfer.current);
    const blob = bufferToWave(buf);
    console.log("file on", URL.createObjectURL(blob));
    setUploading(false);
    const res = await postUserFile(uploadFileNameFront, blob, "audio");
    setUploaded(res.fileName);
    setUserSongData(userSongData => [...userSongData, {
      title: uploadFileNameFront,
      serverFileName: res.fileName
    }])
    localStorage.setItem("userSongData", JSON.stringify([
      ...userSongData,
      {
        title: uploadFileNameFront,
        serverFileName: res.fileName
      }
    ]));
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
    wavesurfer.current.playPause();
  };

  const handleZoomSlide = (event: Event, newValue: number | number[]) => {
    setZoomRatio(Number(newValue))
  }

  const handleZoom = (event: Event, newValue: number | number[]) => {
    wavesurfer.current.zoom(newValue)
  }

  return (
    <Box style={{ width: "100%" }}>
      {loading && <span>Loading Audio...</span>}
      <div ref={waveformRef}></div>
      <Box
        my={2}
        style={{
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
          justifyContent: "flex-start",
          alignItems: "flex-end",
          gap: "16px",
        }}
      >
        <Button
          color="primary"
          component="div"
          variant={playing ? "contained" : "outlined"}
          style={{
            fontSize: "12px",
            marginRight: "8px",
          }}
          onClick={handlePlayPause}
        >
          Play / Pause
        </Button>
        {uploaded !== "" && (
          <Box>
            <Typography>Uploaded to server as '{uploaded}'</Typography>
          </Box>
        )}
        {uploading && (
          <Box>
            <Typography>Now Uploading...</Typography>
          </Box>
        )}
        {!uploading && uploaded === "" && (
          <>
            <TextField
              required
              id="song-file-name"
              label="Song File Name"
              defaultValue="users_song"
              variant="standard"
              value={uploadFileNameFront}
              onChange={handleFileNameFront}
            />
            <Stack width={300} direction="row" spacing={1}>
              <ZoomOut />
              <Slider
                defaultValue={1}
                valueLabelDisplay="off"
                onChange={handleZoomSlide}
                onChangeCommitted={handleZoom}
                value={zoomRatio}
                disabled={!zoomAvailable}
              />
              <ZoomIn />
            </Stack>
            <Button
              color="primary"
              component="div"
              variant="contained"
              style={{
                fontSize: "12px",
              }}
              onClick={save}
            >
              Upload
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
