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

const drawerWidth = 210;

export default function Home() {
  return (
    <Layout>
      <Grid container spacing={2} style={{ height: "calc(100vh - 64px)" }}>
        <Grid
          item
          md={6}
          lg={2}
          xl={2}
          style={{ height: "100%", overflow: "scroll" }}
        >
          <Typography mb={2}>Features</Typography>
          <FormGroup>
            <Typography my={2}>MIDI</Typography>
            <FormControlLabel control={<Checkbox />} label="pitch_range" />
            <FormControlLabel control={<Checkbox />} label="n_pitches_used" />
            <FormControlLabel
              control={<Checkbox />}
              label="n_pitch_classes_used"
            />
            <FormControlLabel control={<Checkbox />} label="polyphony" />
            <FormControlLabel control={<Checkbox />} label="polyphony_rate" />
            <FormControlLabel
              control={<Checkbox />}
              label="scale_consistency"
            />
            <FormControlLabel control={<Checkbox />} label="pitch_entropy" />
            <FormControlLabel
              control={<Checkbox />}
              label="pitch_class_entropy"
            />
            <FormControlLabel control={<Checkbox />} label="empty_beat_rate" />
            <FormControlLabel
              control={<Checkbox />}
              label="drum_in_duple_rate"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="drum_in_triple_rate"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="drum_pattern_consistency"
            />
            <Divider />
            <Typography my={2}>Audio</Typography>
            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="tempo"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="zero_crossing_rate"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="harmonic_components"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="percussive_components"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="spectral_centroid"
            />
            <FormControlLabel control={<Checkbox />} label="spectral_rolloff" />
            <FormControlLabel
              control={<Checkbox />}
              label="chroma_frequencies"
            />
            {/* todo: implement Spotify features backend */}
            {/* <Divider />
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
            <FormControlLabel control={<Checkbox />} label="Feature 20" /> */}
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
          lg={10}
          xl={10}
          style={{ height: "100%", overflow: "scroll" }}
        >
          <PlotWrapper />
        </Grid>
      </Grid>
    </Layout>
  );
}
