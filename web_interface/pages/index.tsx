import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Data } from "plotly.js";
import {
  FormEventHandler,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { Book, Email, GitHub, Inbox, VerifiedUser } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Checkbox,
  CssBaseline,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { getData, getSampleData } from "../api/data";
import Layout from "../components/Layout";
import PlotWrapper from "../components/PlotWrapper";
import { DataContext } from "../utils/context";

const drawerWidth = 180;

export default function Home() {
  // NOTE: handle `any` below
  let state: any;
  let setState: any;
  [state, setState] = useState({
    pitch_range: true,
    n_pitches_used: false,
    n_pitch_classes_used: false,
    polyphony: false,
    polyphony_rate: false,
    scale_consistency: false,
    pitch_entropy: false,
    pitch_class_entropy: false,
    empty_beat_rate: false,
    drum_in_duple_rate: false,
    drum_in_triple_rate: false,
    drum_pattern_consistency: false,
    tempo: true,
    zero_crossing_rate: false,
    harmonic_components: false,
    percussive_components: false,
    spectral_centroid: false,
    spectral_rolloff: false,
    chroma_frequencies: true,
  });

  const [dimMethod, setDimMethod] = useState("PCA");

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let newState = {
      ...state,
      [event.target.name]: event.target.checked,
    };
    setState(newState);
    // list of feature names
    const feature_names = Object.keys(newState).filter((key) => newState[key]);
    console.log(feature_names);
    const d = await getData(feature_names, 100, dimMethod);
    console.log(d);
    setData([...d]);
  };

  const handleMethodChange = (
    event: SelectChangeEvent<string>,
    child: ReactNode
  ) => {
    setDimMethod(event.target.value);
  };

  const [data, setData] = useState<Data[]>([]);
  const fetchData = async () => {
    const d = await getSampleData(60);
    console.log(d);
    setData([...d]);
  };

  useEffect(() => {
    fetchData().catch(console.error);
  }, []);

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
          <Typography mb={2}>Data</Typography>
          <FormControl sx={{ my: 1, minWidth: 160 }} size="small">
            <InputLabel id="demo-select-small">
              Dimentionality Reduction
            </InputLabel>
            <Select
              labelId="demo-select-small"
              id="demo-select-small"
              value={dimMethod}
              label="Method"
              onChange={handleMethodChange}
            >
              <MenuItem value={"PCA"}>PCA</MenuItem>
              <MenuItem value={"tSNE"}>tSNE</MenuItem>
            </Select>
          </FormControl>
          <Typography mb={2}>Features</Typography>
          <FormGroup>
            <Typography my={2}>MIDI</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.pitch_range}
                  name="pitch_range"
                  onChange={handleChange}
                />
              }
              label="pitch_range"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.n_pitches_used}
                  name="n_pitches_used"
                  onChange={handleChange}
                />
              }
              label="n_pitches_used"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.n_pitch_classes_used}
                  name="n_pitch_classes_used"
                  onChange={handleChange}
                />
              }
              label="n_pitch_classes_used"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.polyphony}
                  name="polyphony"
                  onChange={handleChange}
                />
              }
              label="polyphony"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.polyphony_rate}
                  name="polyphony_rate"
                  onChange={handleChange}
                />
              }
              label="polyphony_rate"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.scale_consistency}
                  name="scale_consistency"
                  onChange={handleChange}
                />
              }
              label="scale_consistency"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.pitch_entropy}
                  name="pitch_entropy"
                  onChange={handleChange}
                />
              }
              label="pitch_entropy"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.pitch_class_entropy}
                  name="pitch_class_entropy"
                  onChange={handleChange}
                />
              }
              label="pitch_class_entropy"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.empty_beat_rate}
                  name="empty_beat_rate"
                  onChange={handleChange}
                />
              }
              label="empty_beat_rate"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.drum_in_duple_rate}
                  name="drum_in_duple_rate"
                  onChange={handleChange}
                />
              }
              label="drum_in_duple_rate"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.drum_in_triple_rate}
                  name="drum_in_triple_rate"
                  onChange={handleChange}
                />
              }
              label="drum_in_triple_rate"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.drum_pattern_consistency}
                  name="drum_pattern_consistency"
                  onChange={handleChange}
                />
              }
              label="drum_pattern_consistency"
            />
            <Divider />
            <Typography my={2}>Audio</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.tempo}
                  name="tempo"
                  onChange={handleChange}
                />
              }
              label="tempo"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.zero_crossing_rate}
                  name="zero_crossing_rate"
                  onChange={handleChange}
                />
              }
              label="zero_crossing_rate"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.harmonic_components}
                  name="harmonic_components"
                  onChange={handleChange}
                />
              }
              label="harmonic_components"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.percussive_components}
                  name="percussive_components"
                  onChange={handleChange}
                />
              }
              label="percussive_components"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.spectral_centroid}
                  name="spectral_centroid"
                  onChange={handleChange}
                />
              }
              label="spectral_centroid"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.spectral_rolloff}
                  name="spectral_rolloff"
                  onChange={handleChange}
                />
              }
              label="spectral_rolloff"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.chroma_frequencies}
                  name="chroma_frequencies"
                  onChange={handleChange}
                />
              }
              label="chroma_frequencies"
            />
            {/* todo: implement Spotify features backend */}
            {/* <Divider 
            <FormControlLabel control={<Checkbox checked={staabelte.} />} label="Feature  name="Feature" onChange={handleChange}13" />
            <FormControlLabel control={<Checkbox checked={staabelte.} />} label="Feature  name="Feature" onChange={handleChange}14" />
            <FormControlLabel control={<Checkbox checked={staabelte.} />} label="Feature  name="Feature" onChange={handleChange}15" />
            <FormControlLabel control={<Checkbox checked={staabelte.} />} label="Feature  name="Feature" onChange={handleChange}/>
            <Typography my={2}>Spotify</Typograph16" />
            <Divider 
            <FormControlLabel control={<Checkbox checked={staabelte.} />} label="Feature  name="Feature" onChange={handleChange}17" />
            <FormControlLabel control={<Checkbox checked={staabelte.} />} label="Feature  name="Feature" onChange={handleChange}18" />
            <FormControlLabel control={<Checkbox checked={staabelte.} />} label="Feature  name="Feature" onChange={handleChange}19" />
            <FormControlLabel control={<Checkbox checked={staabelte.} />} label="Feature  name="Feature" onChange={handleChange}/>
            <Typography my={2}>Kansei</Typograph20" /> */}
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
          <DataContext.Provider value={data}>
            <PlotWrapper />
          </DataContext.Provider>
        </Grid>
      </Grid>
    </Layout>
  );
}
