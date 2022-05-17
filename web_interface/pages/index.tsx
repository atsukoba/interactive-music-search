import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Email, Inbox, GitHub, Book, VerifiedUser } from "@mui/icons-material";
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
import Layout from "../components/Layout";

const drawerWidth = 240;

export default function Home() {
  return (
    <Layout>
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
    </Layout>
  );
}
