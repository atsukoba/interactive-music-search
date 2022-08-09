import { Popover } from "@mui/material";
import { useRef, useEffect } from "react";

interface IProps {
  track_id: string;
}

export const clientSecret = process.env.CLIENT_SECRET;
export default function SpotifyPlayer({ track_id }: IProps) {
  return (
    <iframe
      title="Spotify Web Player"
      src={`https://open.spotify.com/embed/track/${track_id}`}
      width={"100%"}
      height={"100px"}
      frameBorder={0}
      allow={"allow"}
      style={{
        borderRadius: 0,
      }}
    />
  );
}
