import {
  ChangeEventHandler,
  MouseEventHandler,
  ReactNode,
  useState,
} from "react";

import { Menu } from "@mui/icons-material";
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  Modal,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { postUserFile } from "../api/user_data";
import AudioTrimmer from "./AudioTrimmer";
import SideBar from "./SideBar";
import { UserSongsContextProvider } from "../utils/context"

const drawerWidth = 270 + 16; // TODO

interface IProps {
  children: ReactNode;
}

const Input = styled("input")({
  display: "none",
});

export default function Layout({ children }: IProps) {
  const [drawerOpen, setDrawerOpen] = useState<boolean | undefined>(false);
  const [audioFileName, setAudioFileName] = useState<string>("null");
  const [audioBlobUrl, setAudioBlobUrl] = useState<string>(null);  // URL

  const toggleDrawer: MouseEventHandler<HTMLButtonElement> = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleAudioEditor = (fileName: string, audioBlobUrl: string) => {
    setAudioFileName(fileName);
    setAudioBlobUrl(audioBlobUrl);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Modal
        open={audioBlobUrl !== null}
        onClose={() => {
          setAudioBlobUrl(null);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          px={4}
          py={4}
          style={{
            backgroundColor: "#dedede",
            borderRadius: "16px",
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80vw",
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Select 30sec Region to Calculate Audio Feature
          </Typography>
          <UserSongsContextProvider>
            <AudioTrimmer audioUrl={audioBlobUrl} fileName={audioFileName} />
          </UserSongsContextProvider>
        </Box>
      </Modal>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        style={{ backgroundColor: "#222222" }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            style={{ fontWeight: "bold" }}
          >
            <i>FeatureDive</i>: Interactive Song Search
          </Typography>
        </Toolbar>
      </AppBar>
      <UserSongsContextProvider >
        <SideBar
          isOpen={drawerOpen}
          toggle={toggleDrawer}
          toggleAudioEditor={toggleAudioEditor}
        />
      </UserSongsContextProvider>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 0, pl: 3, fontSize: 0 }}
        style={{ height: "100vh", overscrollBehaviorY: "none" }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
