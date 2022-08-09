import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Data } from "plotly.js";
import {
  ChangeEventHandler,
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
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { getData, getSampleData, responseToPlotlyData } from "../api/data";
import Layout from "../components/Layout";
import PlotWrapper from "../components/PlotWrapper";
import { DataContext, getTitleToSid } from "../utils/context";

const drawerWidth = 270;

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

  const [nOfSongs, setNOfSongs] = useState(100);
  const [dimMethod, setDimMethod] = useState("PCA");
  const [sidMapping, setSidMapping] = useState<Map<string, string>>(new Map());

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let newState = {
      ...state,
      [event.target.name]: event.target.checked,
    };
    setState(newState);
    // list of feature names
    const feature_names = Object.keys(newState).filter((key) => newState[key]);
    console.log(feature_names);
    const data = await getData(feature_names, nOfSongs, dimMethod);
    setSidMapping(getTitleToSid(data));
    setData([...responseToPlotlyData(data)]);
  };

  const handleMethodChange = (
    event: SelectChangeEvent<string>,
    child: ReactNode
  ) => {
    setDimMethod(event.target.value);
  };
  
  const handleNofSongsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNOfSongs(Number(event.target.value));
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
      <Grid
        container
        spacing={2}
        style={{ height: "calc(100vh - 64px)", marginTop: 0 }}
      >
        <Grid
          item
          md={6}
          lg={2.5}
          xl={"auto"}
          style={{
            height: "100%",
            overflow: "scroll",
            maxWidth: `${drawerWidth}px`,
          }}
        >
          <Typography mb={2}>Data</Typography>
          <TextField
            id="outlined-number"
            label="N of Songs"
            type="number"
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={handleNofSongsChange}
            value={nOfSongs}
            sx={{ my: 1, minWidth: 160 }}
          />
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
          <FormGroup>
            <Typography my={2}>MIDI Features</Typography>
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
            <Typography my={2}>Audio Features</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.tempo}
                  name="tempo"
                  onChange={handleChange}
                />
              }
              label="Tempo"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.zero_crossing_rate}
                  name="zero_crossing_rate"
                  onChange={handleChange}
                />
              }
              label="Zero Crossing Rate"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.harmonic_components}
                  name="harmonic_components"
                  onChange={handleChange}
                />
              }
              label="Harmonic Components"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.percussive_components}
                  name="percussive_components"
                  onChange={handleChange}
                />
              }
              label="Percussive Components"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.spectral_centroid}
                  name="spectral_centroid"
                  onChange={handleChange}
                />
              }
              label="Spectral Centroid"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.spectral_rolloff}
                  name="spectral_rolloff"
                  onChange={handleChange}
                />
              }
              label="Spectral Rolloff"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.chroma_frequencies}
                  name="chroma_frequencies"
                  onChange={handleChange}
                />
              }
              label="Chroma Frequencies"
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
          lg={9.5}
          xl={true}
          style={{ height: "100%", overflow: "scroll", padding: 0 }}
        >
          <DataContext.Provider value={{ data, sidMapping }}>
            <PlotWrapper />
          </DataContext.Provider>
        </Grid>
      </Grid>
    </Layout>
  );
}
