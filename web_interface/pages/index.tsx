import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import MailIcon from "@mui/icons-material/Mail";
import InboxIcon from "@mui/icons-material/MoveToInbox";
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

import PlotWrapper from "../components/PlotWrapper";

const drawerWidth = 240;

export default function Home() {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            SongSearch
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
            {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {["All mail", "Trash", "Spam"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3 }}
        style={{ height: "100vh", overscrollBehaviorY: "none" }}
      >
        <Toolbar />
        <Grid container spacing={2} style={{ height: "calc(100vh - 64px)" }}>
          <Grid
            item
            md={6}
            lg={3}
            xl={2}
            style={{ height: "100%", overflow: "scroll" }}
          >
            <Typography mb={2}>Features</Typography>
            <FormGroup>
              <Typography my={2}>MIDI</Typography>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Feature 1"
              />
              <FormControlLabel control={<Checkbox />} label="Feature 2" />
              <FormControlLabel control={<Checkbox />} label="Feature 3" />
              <FormControlLabel control={<Checkbox />} label="Feature 4" />
              <FormControlLabel control={<Checkbox />} label="Feature 5" />
              <Divider />
              <Typography my={2}>Audio</Typography>
              <FormControlLabel control={<Checkbox />} label="Feature 6" />
              <FormControlLabel control={<Checkbox />} label="Feature 7" />
              <FormControlLabel control={<Checkbox />} label="Feature 8" />
              <FormControlLabel control={<Checkbox />} label="Feature 9" />
              <FormControlLabel control={<Checkbox />} label="Feature 10" />
              <FormControlLabel control={<Checkbox />} label="Feature 11" />
              <FormControlLabel control={<Checkbox />} label="Feature 12" />
              <Divider />
              <Typography my={2}>Spotify</Typography>
              <FormControlLabel control={<Checkbox />} label="Feature 13" />
              <FormControlLabel control={<Checkbox />} label="Feature 14" />
              <FormControlLabel control={<Checkbox />} label="Feature 15" />
              <FormControlLabel control={<Checkbox />} label="Feature 16" />
              <Divider />
              <Typography my={2}>Kansei</Typography>
              <FormControlLabel control={<Checkbox />} label="Feature 17" />
              <FormControlLabel control={<Checkbox />} label="Feature 18" />
              <FormControlLabel control={<Checkbox />} label="Feature 19" />
              <FormControlLabel control={<Checkbox />} label="Feature 20" />
              <Box my={2}>
                <Button variant="contained">Toggle All</Button>
              </Box>
            </FormGroup>
          </Grid>
          <Divider
            orientation="vertical"
            flexItem
            style={{ marginRight: "-1px" }}
          />
          <Grid
            item
            md={6}
            lg={9}
            xl={10}
            style={{ height: "100%", overflow: "scroll" }}
          >
            <PlotWrapper />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
