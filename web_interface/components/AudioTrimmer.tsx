import WaveSurfer from "wavesurfer.js";
import { useRef, useEffect } from "react";

export default function WaveEditor() {
  const waveformRef = useRef<HTMLDivElement>(null);
  let wf: WaveSurfer;
  useEffect(() => {
    if (waveformRef.current instanceof HTMLDivElement) {
      wf = WaveSurfer.create({
        container: waveformRef.current,
      });
      wf.load("assets/test.wav");
    }
  }, []);

  function handlePlayPause() {
    if (waveformRef.current instanceof WaveSurfer) {
      waveformRef.current.playPause();
    }
  }

  return (
    <>
      <div ref={waveformRef}></div>
      <div id="control">
        <button onClick={handlePlayPause}>Play / Pause</button>
      </div>
    </>
  );
}
