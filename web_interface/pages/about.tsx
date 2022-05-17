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
          lg={6}
          xl={6}
          style={{ height: "100%", overflow: "scroll" }}
        >
          <Typography mb={2}>About This App</Typography>
        </Grid>
        <Divider
          orientation="vertical"
          flexItem
          style={{ marginRight: "-1px" }}
        />
        <Grid
          item
          md={6}
          lg={6}
          xl={6}
          style={{ height: "100%", overflow: "scroll" }}
        >
          <Typography mb={2}>Features</Typography>
        </Grid>
      </Grid>
    </Layout>
  );
}
