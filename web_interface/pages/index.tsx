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

export default function Home() {
  // NOTE: handle `any` below
  let state: { [name: string]: boolean };
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
    harmonic_components: true,
    percussive_components: false,
    spectral_centroid: false,
    spectral_rolloff: false,
    chroma_frequencies: true,
  });

  const [nOfSongs, setNOfSongs] = useState(500);
  const [dimMethod, setDimMethod] = useState("tSNE");
  const [nowLoading, setNowLoading] = useState(false);
  const [sidMapping, setSidMapping] = useState<Map<string, string>>(new Map());

  const updateData = async () => {
    const feature_names = Object.keys(state).filter((key) => state[key]);
    console.log(feature_names);
    setNowLoading(true);
    const data = await getData(feature_names, nOfSongs, dimMethod);
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

  const handleMethodChange = (
    event: SelectChangeEvent<string>,
    child: ReactNode
  ) => {
    setDimMethod(event.target.value);
  };

  const handleNofSongsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNOfSongs(Number(event.target.value));
  };

  const [data, setData] = useState<ResponseDatum[]>([]);
  const fetchInitialData = async () => {
    const d = await getData(
      Object.keys(state).filter((k) => state[k]),
      nOfSongs,
      dimMethod
    );
    setData([...d]);
  };

  useEffect(() => {
    fetchInitialData().catch(console.error);
  }, []);

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
          <Typography my={2}>Loading Song Data...</Typography>
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
            <Button color="primary" variant="outlined" onClick={updateData}>
              <AutorenewOutlinedIcon />
              Update Data
            </Button>
          </Box>
          <Accordion>
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
              <FormControl sx={{ ma: 1, mb: 2, minWidth: 160 }} size="small">
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
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography my={2}>MIDI Features</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
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
                <Box my={2}>
                  <Button variant="contained" onClick={setMidiAll}>
                    Toggle All
                  </Button>
                </Box>
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography my={2}>Audio Features</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
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
