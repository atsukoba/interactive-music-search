import Link from "next/link";
import {
  ChangeEventHandler,
  MouseEventHandler,
  SetStateAction,
  useState,
} from "react";

import { Apps, Book, GitHub, Search, VerifiedUser } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { postUserFile } from "../api/user_data";

const drawerWidth = 270 + 16; // TODO

interface IProps {
  isOpen: boolean;
  toggle: MouseEventHandler<HTMLButtonElement>;
  toggleAudioEditor: (string) => void;
}

const Input = styled("input")({
  display: "none",
});

export default function SideBar({ isOpen, toggle, toggleAudioEditor }: IProps) {
  const [selectedFile, selectFile] = useState<FormData | undefined>(undefined);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const body = new FormData();
      if (
        file.type === "audio/aac" ||
        file.type === "audio/mpeg" ||
        file.type === "audio/wav"
      ) {
        const blobUrl = URL.createObjectURL(file);
        toggleAudioEditor(blobUrl);
      } else if (file.type === "audio/midi") {
        body.append("midi", file);
        selectFile(body);
      } else {
        alert("File type incorrect to upload");
      }
    }
  };

  const onUploadButtonPush: MouseEventHandler<HTMLSpanElement> = async (
    event
  ) => {
    console.dir(selectedFile);
    if (selectedFile) {
      const res = await postUserFile(selectedFile);
      console.dir(selectedFile);
      console.dir(res);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={toggle}
      variant="persistent"
      anchor="left"
      sx={{
        width: 0,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Box
        sx={{ overflow: "auto" }}
        style={{
          height: "100%",
          overflow: "scroll",
          width: `${drawerWidth}px`,
        }}
      >
        {/* <List>
            <ListItem key={"table"} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <TableChart />
                </ListItemIcon>
                <Link href="/table">
                  <ListItemText primary={"Table View"} />
                </Link>
              </ListItemButton>
            </ListItem>
          </List>
          <Divider /> */}
        <List>
          <ListItem key={"search"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <Search />
              </ListItemIcon>
              <Link href="/">
                <ListItemText primary={"Search View"} />
              </Link>
            </ListItemButton>
          </ListItem>
          <ListItem key={"about"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <Apps />
              </ListItemIcon>
              <Link href="/about">
                <ListItemText primary={"About This App"} />
              </Link>
            </ListItemButton>
          </ListItem>
          <ListItem key={"Paper"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <Book />
              </ListItemIcon>
              <Link href="https://atsuya.xyz">
                <ListItemText primary={"Paper"} />
              </Link>
            </ListItemButton>
          </ListItem>
          <ListItem key={"Author"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <VerifiedUser />
              </ListItemIcon>
              <Link href="https://atsuya.xyz">
                <ListItemText primary={"Author"} />
              </Link>
            </ListItemButton>
          </ListItem>
          <ListItem key={"GitHub"} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <GitHub />
              </ListItemIcon>
              <Link href="https://github.com/atsukoba">
                <ListItemText primary={"GitHub"} />
              </Link>
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem>
            <Typography my={1} style={{ fontWeight: "bold" }}>
              Upload Your Songs
            </Typography>
          </ListItem>
          <ListItem>
            <label htmlFor="contained-button-file">
              <Input
                accept="audio/wav,audio/mpeg,audio/midi,audio/x-midi"
                id="contained-button-file"
                type="file"
                onChange={handleChange}
              />
              <Button variant="contained" component="span">
                Select Audio / MIDI File
              </Button>
            </label>
          </ListItem>
          <ListItem>
            <Button
              variant="contained"
              component="span"
              disabled={selectedFile === undefined}
              onClick={onUploadButtonPush}
            >
              Upload
            </Button>
          </ListItem>
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
}
