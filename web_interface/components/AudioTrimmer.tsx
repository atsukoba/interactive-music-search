import { useEffect, useRef, useState } from "react";

import { Box, Button, CardContent, Typography } from "@mui/material";

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

  const bufferToWave = (abuffer: AudioBuffer, offset = 0, len = 30): Blob => {
    let numOfChan = abuffer.numberOfChannels,
      length = len * numOfChan * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      channels = [],
      i,
      sample,
      pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this demo)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // update data chunk
        pos += 2;
      }
      offset++; // next source sample
    }

    // create Blob
    return new Blob([buffer], { type: "audio/mpeg" });

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  };

  const save = (): Blob => {
    const currentRegion: any = Object.values(
      wavesurfer.current.regions.list
    )[0];
    const start = currentRegion.start;
    const end = currentRegion.end;
    const buf = copy(start, end, wavesurfer.current);
    const blob = bufferToWave(buf);
    console.log(URL.createObjectURL(blob));
    return blob;
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
    wavesurfer.current.playPause();
  };

  return (
    <Box style={{ width: "100%" }}>
      {loading && <span>Now Loading</span>}
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
      </Box>
    </Box>
  );
}
