import Link from "next/link";
import {
  ChangeEventHandler,
  MouseEventHandler,
  SetStateAction,
  useContext,
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
import { UserSongsContext } from "../utils/context";

const drawerWidth = 270 + 16; // TODO

interface IProps {
  isOpen: boolean;
  toggle: MouseEventHandler<HTMLButtonElement>;
  toggleAudioEditor: (string) => void;
}

const Input = styled("input")({
  display: "none",
});

export const UserSongsContextProvider = ({ children }) => {
  const [userSongData, setUserSongData] = useState(
    JSON.parse(window.localStorage.getItem("userSongData")) || [])
  return (
    <UserSongsContext.Provider value={{ userSongData, setUserSongData }}>
      {children}
    </UserSongsContext.Provider>
  )
}

export default function SideBar({ isOpen, toggle, toggleAudioEditor }: IProps) {

  const { userSongData, setUserSongData } = useContext(UserSongsContext);

  const handleSelectSongFile: ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (
        file.type === "audio/aac" ||
        file.type === "audio/mpeg" ||
        file.type === "audio/wav"
      ) {
        // AUDIO data
        const blobUrl = URL.createObjectURL(file);
        toggleAudioEditor(blobUrl);
      } else if (file.type === "audio/midi" || file.type === "audio/mid") {
        // MIDI Data
        const res = await postUserFile(file.name, file, "midi");
        setUserSongData([...userSongData, {
          title: file.name,
          serverFileName: res.fileName
        }])
        window.localStorage.setItem("userSongData", JSON.stringify(
          [...userSongData, {
            title: file.name,
            serverFileName: res.fileName
          }]
        ));
      } else {
        console.error("File type incorrect to upload: ", file.type);
        alert("File type incorrect to upload");
      }
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
      <UserSongsContextProvider>
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
                Upload
              </Typography>
            </ListItem>
            <ListItem>
              <label htmlFor="contained-button-file">
                <Input
                  accept="audio/wav,audio/mpeg,audio/midi,audio/x-midi"
                  id="contained-button-file"
                  type="file"
                  onChange={handleSelectSongFile}
                />
                <Button variant="contained" component="span">
                  Upload Audio / MIDI File
                </Button>
              </label>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem>
              <Typography my={1} style={{ fontWeight: "bold" }}>
                Your Songs to Show in Space
              </Typography>
            </ListItem>
            <ListItem>
              {userSongData.map((d) =>
                <p>
                  {d.title}
                </p>
              )}
            </ListItem>
          </List>
        </Box>
      </UserSongsContextProvider>
    </Drawer>
  );
}
