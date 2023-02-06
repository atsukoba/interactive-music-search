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
          lg={6}
          xl={6}
          style={{ height: "100%", overflow: "scroll" }}
        >
          <Box my={4} px={2}>
            <Typography variant="h3" gutterBottom component="h1">
              About This App
            </Typography>
            <Typography variant="body1" gutterBottom component="p">
              This application is designed for those who want to figure out the
              acoustic feature calculated from audio signals and symbolic
              feature calculated by MIDI data, and musicians who want to search
              songs with their own music files. Users can explore interactively
              the 3D feature space as if diving into the space.
            </Typography>

            {/* <Typography variant="h4" gutterBottom component="div">
              h4. Heading
            </Typography>
            <Typography variant="h5" gutterBottom component="div">
              h5. Heading
            </Typography>
            <Typography variant="h6" gutterBottom component="div">
              h6. Heading
            </Typography>
            <Typography variant="subtitle1" gutterBottom component="div">
              subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing
              elit. Quos blanditiis tenetur
            </Typography>
            <Typography variant="subtitle2" gutterBottom component="div">
              subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing
              elit. Quos blanditiis tenetur
            </Typography>
            <Typography variant="body1" gutterBottom>
              body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore
              consectetur, neque doloribus, cupiditate numquam dignissimos
              laborum fugiat deleniti? Eum quasi quidem quibusdam.
            </Typography>
            <Typography variant="body2" gutterBottom>
              body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore
              consectetur, neque doloribus, cupiditate numquam dignissimos
              laborum fugiat deleniti? Eum quasi quidem quibusdam.
            </Typography>
            <Typography variant="button" display="block" gutterBottom>
              button text
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              caption text
            </Typography>
            <Typography variant="overline" display="block" gutterBottom>
              overline text
            </Typography> */}
          </Box>
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
          <Box my={4} px={2}>
            <Typography variant="h3" gutterBottom component="div">
              Features
            </Typography>
            <Typography variant="h4" gutterBottom component="div">
              h4. Heading
            </Typography>
            <Typography variant="h5" gutterBottom component="div">
              h5. Heading
            </Typography>
            <Typography variant="h6" gutterBottom component="div">
              h6. Heading
            </Typography>
            <Typography variant="subtitle1" gutterBottom component="div">
              subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing
              elit. Quos blanditiis tenetur
            </Typography>
            <Typography variant="subtitle2" gutterBottom component="div">
              subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing
              elit. Quos blanditiis tenetur
            </Typography>
            <Typography variant="body1" gutterBottom>
              body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore
              consectetur, neque doloribus, cupiditate numquam dignissimos
              laborum fugiat deleniti? Eum quasi quidem quibusdam.
            </Typography>
            <Typography variant="body2" gutterBottom>
              body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore
              consectetur, neque doloribus, cupiditate numquam dignissimos
              laborum fugiat deleniti? Eum quasi quidem quibusdam.
            </Typography>
            <Typography variant="button" display="block" gutterBottom>
              button text
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              caption text
            </Typography>
            <Typography variant="overline" display="block" gutterBottom>
              overline text
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Layout>
  );
}
