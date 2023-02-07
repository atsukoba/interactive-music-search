import {
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";

import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import MuiAccordionSummary, {
  AccordionSummaryProps
} from "@mui/material/AccordionSummary";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";

import {
  getData,
  // getSampleData,
  ResponseDatum
} from "../api/data";
import Layout from "../components/Layout";
import PlotWrapper from "../components/PlotWrapper";
import { DataContext, UserSongsContext, UserSongsContextProvider } from "../utils/context";
import { getTitleToSid } from "../utils/processData";

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
  // "tempo",
  "zero_crossing_rate",
  "harmonic_components",
  "percussive_components",
  "spectral_centroid",
  "spectral_rolloff",
  "chroma_frequencies",
];

const allSpotifyFeatures = [
  "acousticness",
  "danceability",
  "duration_ms",
  "energy",
  "instrumentalness",
  "key",
  "liveness",
  "loudness",
  "mode",
  "speechiness",
  "tempo",
  "time_signature",
  "valence",
  // "album_jacket_url",
];

const toggleAllVal = (state: { [name: string]: boolean }) => {
  const newVal =
    Object.values(state).filter((n) => n).length <
    Object.values(state).length / 2;
  const newState = Object.assign({}, state);
  Object.keys(newState).forEach((k) => {
    newState[k] = newVal;
  });
  return newState;
};

const Home = () => {
  // NOTE: handle `any` below
  let midiState: { [name: string]: boolean };
  let audioState: { [name: string]: boolean };
  let spotifyState: { [name: string]: boolean };
  let genreState: { [name: string]: boolean };
  let setMidiState: any;
  let setAudioState: any;
  let setSpotifyState: any;
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
    dance_eletric: true,
    modern: true,
    jazz: true,
    blues: true,
    hits_of_2011_2020: false,
    hip_hop_rap: true,
    punk: true,
    instrumental: false,
    hits_of_the_1970s: false,
    hits_of_the_2000s: true,
  });
  [midiState, setMidiState] = useState({
    // MIDI Features
    pitch_range: false,
    n_pitches_used: false,
    n_pitch_classes_used: true,
    polyphony: false,
    polyphony_rate: true,
    scale_consistency: false,
    pitch_entropy: false,
    pitch_class_entropy: false,
    empty_beat_rate: false,
    drum_in_duple_rate: true,
    drum_in_triple_rate: true,
    drum_pattern_consistency: false,
  });
  [audioState, setAudioState] = useState({
    // Audio Features
    // tempo: true,
    zero_crossing_rate: true,
    harmonic_components: true,
    percussive_components: true,
    spectral_centroid: false,
    spectral_rolloff: false,
    chroma_frequencies: true,
  });
  [spotifyState, setSpotifyState] = useState({
    // Spotify Features
    tempo: true,
    acousticness: true,
    danceability: true,
    duration_ms: false,
    energy: false,
    instrumentalness: false,
    key: false,
    liveness: false,
    loudness: false,
    mode: false,
    speechiness: false,
    time_signature: false,
    valence: false,
  });

  const [nOfSongs, setNOfSongs] = useState(1000);
  const [dimMethod, setDimMethod] = useState("tSNE"); // tSNE or PCA
  const [dateRangeValue, setDateRangeValue] = useState<number[]>([1980, 2020]);
  const [nowLoading, setNowLoading] = useState(false);
  const [sidMapping, setSidMapping] = useState<Map<string, string>>(new Map());

  const { userSongData, selectedUserSong, setSelectedUserSong } = useContext(UserSongsContext);

  const updateData = async () => {
    const genres = Object.keys(genreState).filter((key) => genreState[key]);
    const feature_names = [
      ...Object.keys(midiState).filter((key) => midiState[key]),
      ...Object.keys(audioState).filter((key) => audioState[key]),
      ...Object.keys(spotifyState).filter((key) => spotifyState[key]),
    ];
    const year_range = dateRangeValue;
    // console.log(feature_names);
    // Users songs
    const selectedTitles = Object.keys(selectedUserSong).filter(k => selectedUserSong[k])
    const user_songs = userSongData.map(t => {
      if (selectedTitles.includes(t.title)) return t.serverFileName
    })
    console.log("user songs to calc feature val", user_songs);
    setNowLoading(true);
    const data = await getData(
      feature_names,
      nOfSongs,
      dimMethod,
      genres,
      year_range,
      user_songs
    );
    setSidMapping(getTitleToSid(data));
    setData([...data]);
    setNowLoading(false);
  };

  const handleMidiChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let newState = {
      ...midiState,
      [event.target.name]: event.target.checked,
    };
    setMidiState(newState);
  };

  const handleAudioChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let newState = {
      ...audioState,
      [event.target.name]: event.target.checked,
    };
    setAudioState(newState);
  };

  const handleSpotifyChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let newState = {
      ...spotifyState,
      [event.target.name]: event.target.checked,
    };
    setSpotifyState(newState);
  };

  const handleGenreChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const key = event.target.name.replaceAll(" ", "_").replaceAll("-", "_");
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
      [
        ...Object.keys(midiState).filter((key) => midiState[key]),
        ...Object.keys(audioState).filter((key) => audioState[key]),
        ...Object.keys(spotifyState).filter((key) => spotifyState[key]),
      ],
      nOfSongs,
      dimMethod,
      Object.keys(genreState).filter((k) => genreState[k]),
      dateRangeValue,
      []
    );
    setData([...d]);
  };

  useEffect(() => {
    fetchInitialData().catch(console.error);
  }, []);

  const setGenreAll = () => {
    setGenreState({
      ...genreState,
      ...toggleAllVal(genreState),
    });
  };

  const setMidiAll = () => {
    setMidiState({
      ...midiState,
      ...toggleAllVal(midiState),
    });
  };

  const setAudioAll = () => {
    setAudioState({
      ...audioState,
      ...toggleAllVal(audioState),
    });
  };

  const setSpotifyAll = () => {
    setSpotifyState({
      ...spotifyState,
      ...toggleAllVal(spotifyState),
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
        spacing={1}
        style={{ height: "calc(100vh - 64px)", marginTop: 0 }}
      >
        <Grid
          item
          xs={12}
          sm={12}
          md={3}
          lg={3}
          xl={2.5}
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
              <Typography my={2}>Data Setting</Typography>
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
              <Accordion defaultExpanded={false}>
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
                              genreState[
                              name.replaceAll(" ", "_").replaceAll("-", "_")
                              ]
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
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography my={2}>Spotify Features</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {allSpotifyFeatures.map((name) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={spotifyState[name]}
                        name={name}
                        onChange={handleSpotifyChange}
                      />
                    }
                    label={name}
                  />
                ))}
                <Box my={2}>
                  <Button variant="contained" onClick={setSpotifyAll}>
                    Toggle All
                  </Button>
                </Box>
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Accordion defaultExpanded={false}>
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
                        checked={midiState[name]}
                        name={name}
                        onChange={handleMidiChange}
                      />
                    }
                    label={name.replaceAll("-", " ").replaceAll("_", " ")}
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
          <Accordion defaultExpanded={false}>
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
                        checked={audioState[name]}
                        name={name}
                        onChange={handleAudioChange}
                      />
                    }
                    label={name.replaceAll("-", " ").replaceAll("_", " ")}
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
          xs={12}
          sm={12}
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

const HomeWrapper = () => {
  return (
    <UserSongsContextProvider>
      <Home />
    </UserSongsContextProvider>
  );
};

export default HomeWrapper;