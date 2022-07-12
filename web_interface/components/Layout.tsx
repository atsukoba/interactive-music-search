import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
  ChangeEventHandler,
  Children,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Apps,
  Book,
  Email,
  GitHub,
  Home,
  Inbox,
  Search,
  TableChart,
  VerifiedUser,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Checkbox,
  CssBaseline,
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  Grid,
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

const drawerWidth = 210;

interface IProps {
  children: ReactNode;
}

const Input = styled("input")({
  display: "none",
});

export default function Layout({ children }: IProps) {
  const [selectedFile, selectFile] = useState<FormData | undefined>(undefined);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const body = new FormData();
      if (file.type === "audio/mpeg" || file.type === "audio/wav") {
        body.append("audio", file);
        selectFile(body);
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
    if (selectedFile) {
      const res = postUserFile(selectedFile);
      console.dir(selectedFile);
      console.dir(res);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        style={{ backgroundColor: "#222222" }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            style={{ fontWeight: "bold" }}
          >
            <i>FeatureDive</i>: Interactive Song Search - v0.0.1
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
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
          <Divider />
          <List>
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
              <label htmlFor="contained-button-file">
                <Input
                  accept="audio/*"
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
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3 }}
        style={{ height: "100vh", overscrollBehaviorY: "none" }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
