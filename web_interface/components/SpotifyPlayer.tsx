import { Popover } from "@mui/material";
import { useRef, useEffect } from "react";

interface IProps {
  track_id: string;
}

export default function SpotifyPlayer({ track_id }: IProps) {
  return (
    <iframe
      title="Spotify Web Player"
      src={`https://open.spotify.com/embed/track/${track_id}`}
      width={"50%"}
      height={"100%"}
      frameBorder={0}
      allow={"allow"}
      style={{
        borderRadius: 0,
      }}
    />
  );
}
