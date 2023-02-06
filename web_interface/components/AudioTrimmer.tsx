import { useEffect, useRef, useState } from "react";

import { Box, Button, CardContent, Typography } from "@mui/material";

import { postUserFile } from "../api/user_data";
import { audioBufferToWav } from "../utils/audioConversion";

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
  const [sourceAudioUrl, setSourceAudioUrl] = useState<URL>(audioUrl);
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
    const start = currentRegion.start;
    const end = currentRegion.end;
    const buf = copy(start, end, wavesurfer.current);
    const blob = bufferToWave(buf);
    console.log("file on", URL.createObjectURL(blob));
    setUploading(false);
    const res = await postUserFile(blob, "audio");
    console.dir(res);
    setUploaded(res.fileName);
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
    wavesurfer.current.playPause();
  };

  return (
    <Box style={{ width: "100%" }}>
      {loading && <span>Loading Audio...</span>}
      <div ref={waveformRef}></div>
      <Box my={2}>
        <Button
          color="primary"
          component="span"
          variant={playing ? "contained" : "outlined"}
          size="small"
          style={{
            fontSize: "12px",
            marginRight: "8px",
          }}
          onClick={handlePlayPause}
        >
          Play / Pause
        </Button>
        {uploaded != "" ? (
          <Box>
            <Typography>Uploaded: {uploaded}</Typography>
          </Box>
        ) : uploading ? (
          <Box>
            <Typography>Now Uploading...</Typography>
          </Box>
        ) : (
          <Button
            color="primary"
            component="span"
            variant="contained"
            size="small"
            style={{
              fontSize: "12px",
            }}
            onClick={save}
          >
            Upload Selected Region
          </Button>
        )}
      </Box>
    </Box>
  );
}
