import { Popover } from "@mui/material";
import { useRef, useEffect } from "react";

interface IProps {
  track_id: string;
}

export default function SpotifyPlayer({ track_id }: IProps) {

  useEffect(() => {
    // TODO: automatically start playing spotidy preview when clicking data point on the space
    const iframeDom = document.querySelector(".spotify-player");
    iframeDom && iframeDom.addEventListener("load", () => {
      // Accessing iframe internal elements is blocked by browser with CORS policy
      // const button = document.querySelector(".spotify-player").contentWindow.document.getElementByTagName("button");
      // button && button.click && button.click();

      // Try clicking element got with absolute position
      const buttonElm = document.elementFromPoint(
        window.innerWidth - 15,
        window.innerHeight - 15) as HTMLButtonElement;
      console.log(buttonElm);
      buttonElm?.click();
    })
  }, [])

  return (
    <iframe
      title="Spotify Web Player"
      className="spotify-player"
      src={`https://open.spotify.com/embed/track/${track_id}`}
      width={"50%"}
      height={"80px"}  // fixed height
      frameBorder={0}
      allow={"allow"}
      style={{
        borderRadius: 0,
      }}
    />
  );
}
