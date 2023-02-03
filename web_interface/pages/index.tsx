import {
  ChangeEventHandler,
  FormEventHandler,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { Book, Email, GitHub, Inbox, VerifiedUser } from "@mui/icons-material";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
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
  Typography,
} from "@mui/material";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from "@mui/material/AccordionSummary";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";

import {
  getData,
  getSampleData,
  ResponseDatum,
  responseToPlotlyData,
} from "../api/data";
import Layout from "../components/Layout";
import PlotWrapper from "../components/PlotWrapper";
import { DataContext, getTitleToSid } from "../utils/context";

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: "none",
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  padding: "0 0 0 0",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(180deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: 0,
  borderTop: "none",
}));

const drawerWidth = 270;
const allGenres = [
  "pop",
  "classical",
  "baroque",
  "rock",
  "renaissance",
  "alternative-indie",
  "italian french spanish",
  "metal",
  "country",
  "romantic",
  "traditional",
  "dance-eletric",
  "modern",
  "jazz",
  "blues",
  "hits of 2011 2020",
  "hip-hop-rap",
  "punk",
  "instrumental",
  "hits of the 1970s",
  "hits of the 2000s",
];

const allMidiFeatures = [
  "pitch_range",
  "n_pitches_used",
  "n_pitch_classes_used",
  "polyphony",
  "polyphony_rate",
  "scale_consistency",
  "pitch_entropy",
  "pitch_class_entropy",
  "empty_beat_rate",
  "drum_in_duple_rate",
  "drum_in_triple_rate",
  "drum_pattern_consistency",
];

const allAudioFeatures = [
  "tempo",
  "zero_crossing_rate",
  "harmonic_components",
  "percussive_components",
  "spectral_centroid",
  "spectral_rolloff",
  "chroma_frequencies",
];

export default function Home() {
  // NOTE: handle `any` below
  let state: { [name: string]: boolean };
  let genreState: { [name: string]: boolean };
  let setState: any;
  let setGenreState: any;
  [genreState, setGenreState] = useState({
    // Genres
    pop: true,
    classical: false,
    baroque: false,
    rock: true,
    renaissance: false,
    alternative_indie: false,
    italian_french_spanish: false,
    metal: false,
    country: false,
    romantic: false,
    traditional: false,
    dance_eletric: false,
    modern: false,
    jazz: true,
    blues: false,
    hits_of_2011_2020: false,
    hip_hop_rap: false,
    punk: false,
    instrumental: false,
    hits_of_the_1970s: false,
    hits_of_the_2000s: false,
  });
  [state, setState] = useState({
    // MIDI Features
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
    // Audio Features
    tempo: true,
    zero_crossing_rate: false,
    harmonic_components: true,
    percussive_components: false,
    spectral_centroid: false,
    spectral_rolloff: false,
    chroma_frequencies: true,
  });

  const [nOfSongs, setNOfSongs] = useState(1000);
  const [dimMethod, setDimMethod] = useState("tSNE");
  const [dateRangeValue, setDateRangeValue] = useState<number[]>([1980, 2020]);
  const [nowLoading, setNowLoading] = useState(false);
  const [sidMapping, setSidMapping] = useState<Map<string, string>>(new Map());

  const updateData = async () => {
    const genres = Object.keys(genreState).filter((key) => state[key]);
    const feature_names = Object.keys(state).filter((key) => state[key]);
    const year_range = dateRangeValue;
    // console.log(feature_names);
    setNowLoading(true);
    const data = await getData(
      feature_names,
      nOfSongs,
      dimMethod,
      genres,
      year_range
    );
    setSidMapping(getTitleToSid(data));
    setData([...data]);
    setNowLoading(false);
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let newState = {
      ...state,
      [event.target.name]: event.target.checked,
    };
    setState(newState);
  };

  const handleGenreChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const key = event.target.name.replace(" ", "_").replace("-", "_");
    let newState = {
      ...genreState,
      [key]: event.target.checked,
    };
    setGenreState(newState);
  };

  const handleMethodChange = (
    event: SelectChangeEvent<string>,
    child: ReactNode
  ) => {
    setDimMethod(event.target.value);
  };

  const handleDateChange = (event: Event, newValue: number | number[]) => {
    setDateRangeValue(newValue as number[]);
  };

  const valuetext = (y) => y;

  const handleNofSongsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNOfSongs(Number(event.target.value));
  };

  const [data, setData] = useState<ResponseDatum[]>([]);
  const fetchInitialData = async () => {
    const d = await getData(
      Object.keys(state).filter((k) => state[k]),
      nOfSongs,
      dimMethod,
      Object.keys(genreState).filter((k) => genreState[k]),
      dateRangeValue
    );
    setData([...d]);
  };

  useEffect(() => {
    fetchInitialData().catch(console.error);
  }, []);

  const setGenreAll = () => {
    setGenreState({
      ...genreState,
      pop: genreState.pop === false,
      classical: genreState.classical === false,
      baroque: genreState.baroque === false,
      rock: genreState.rock === false,
      renaissance: genreState.renaissance === false,
      alternative_indie: genreState.alternative_indie === false,
      italian_french_spanish: genreState.italian_french_spanish === false,
      metal: genreState.metal === false,
      country: genreState.country === false,
      romantic: genreState.romantic === false,
      traditional: genreState.traditional === false,
      dance_eletric: genreState.dance_eletric === false,
      modern: genreState.modern === false,
      jazz: genreState.jazz === false,
      blues: genreState.blues === false,
      hits_of_2011_2020: genreState.hits_of_2011_2020 === false,
      hip_hop_rap: genreState.hip_hop_rap === false,
      punk: genreState.punk === false,
      instrumental: genreState.instrumental === false,
      hits_of_the_1970s: genreState.hits_of_the_1970s === false,
      hits_of_the_2000s: genreState.hits_of_the_2000s === false,
    });
  };

  const setMidiAll = () => {
    setState({
      ...state,
      pitch_range: state.pitch_range === false,
      n_pitches_used: state.n_pitches_used === false,
      n_pitch_classes_used: state.n_pitch_classes_used === false,
      polyphony: state.polyphony === false,
      polyphony_rate: state.polyphony_rate === false,
      scale_consistency: state.scale_consistency === false,
      pitch_entropy: state.pitch_entropy === false,
      pitch_class_entropy: state.pitch_class_entropy === false,
      empty_beat_rate: state.empty_beat_rate === false,
      drum_in_duple_rate: state.drum_in_duple_rate === false,
      drum_in_triple_rate: state.drum_in_triple_rate === false,
      drum_pattern_consistency: state.drum_pattern_consistency === false,
    });
  };

  const setAudioAll = () => {
    setState({
      ...state,
      tempo: state.tempo === false,
      zero_crossing_rate: state.zero_crossing_rate === false,
      harmonic_components: state.harmonic_components === false,
      percussive_components: state.percussive_components === false,
      spectral_centroid: state.spectral_centroid === false,
      spectral_rolloff: state.spectral_rolloff === false,
      chroma_frequencies: state.chroma_frequencies === false,
    });
  };

  return (
    <Layout>
      {nowLoading && (
        <Box
          sx={{
            display: "flex",
            position: "absolute",
            width: "100%",
            height: "100%",
            alignItems: "center",
            alignContent: "flex-start",
            justifyContent: "center",
            flexDirection: "column",
            zIndex: "1000",
          }}
        >
          <CircularProgress size={120} thickness={4.0} color={"primary"} />
          <Typography my={2} variant="h6">
            Loading Song Data...
          </Typography>
        </Box>
      )}
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
          <Box my={2}>
            <Button
              color="primary"
              variant="outlined"
              onClick={updateData}
              style={{ width: "calc(100% - 20px)" }}
            >
              <AutorenewOutlinedIcon />
              Update Data
            </Button>
          </Box>
          <Accordion defaultExpanded={true}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography my={2}>Data</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                id="outlined-number"
                label="Maximum Number of Songs"
                type="number"
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={handleNofSongsChange}
                value={nOfSongs}
                sx={{ my: 2 }}
                style={{ width: "calc(100% - 20px)" }}
              />
              <FormControl
                sx={{ ma: 2, mb: 4 }}
                style={{ width: "calc(100% - 20px)" }}
                size="small"
              >
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
              <Box
                style={{ width: "calc(100% - 35px)", paddingLeft: "15px" }}
                sx={{ ma: 2, mb: 4 }}
              >
                <Slider
                  aria-label="Always visible"
                  value={dateRangeValue}
                  onChange={handleDateChange}
                  valueLabelDisplay="auto"
                  min={1939}
                  max={2021}
                  getAriaValueText={valuetext}
                />
                <span
                  style={{
                    height: "16px",
                    fontSize: "12px",
                    display: "block",
                    textAlign: "center",
                  }}
                >
                  Year Range: {dateRangeValue[0]} ~ {dateRangeValue[1]}
                </span>
              </Box>
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Accordion defaultExpanded={true}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography my={2}>Music Genres</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {allGenres.map((name) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          genreState[name.replace(" ", "_").replace("-", "_")]
                        }
                        name={name}
                        onChange={handleGenreChange}
                      />
                    }
                    label={name}
                  />
                ))}
                <Box my={2}>
                  <Button variant="contained" onClick={setGenreAll}>
                    Toggle All
                  </Button>
                </Box>
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Accordion defaultExpanded={true}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography my={2}>MIDI Features</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {allMidiFeatures.map((name) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={state[name]}
                        name={name}
                        onChange={handleChange}
                      />
                    }
                    label={name}
                  />
                ))}
                <Box my={2}>
                  <Button variant="contained" onClick={setMidiAll}>
                    Toggle All
                  </Button>
                </Box>
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Accordion defaultExpanded={true}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography my={2}>Audio Features</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {allAudioFeatures.map((name) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={state[name]}
                        name={name}
                        onChange={handleChange}
                      />
                    }
                    label={name}
                  />
                ))}
                <Box my={2}>
                  <Button variant="contained" onClick={setAudioAll}>
                    Toggle All
                  </Button>
                </Box>
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Divider />
        </Grid>
        <Divider
          orientation="vertical"
          flexItem
          style={{ marginRight: "-1px" }}
        />
        <Grid
          item
          md={true}
          lg={true}
          xl={true}
          style={{
            height: "100%",
            overflow: "scroll",
            padding: 0,
            flexGrow: 1,
          }}
        >
          <DataContext.Provider value={{ data, sidMapping }}>
            <PlotWrapper />
          </DataContext.Provider>
        </Grid>
      </Grid>
    </Layout>
  );
}
