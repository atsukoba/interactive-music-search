import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Children, ReactNode, useEffect, useRef, useState } from "react";

import {
  Apps,
  Book,
  Email,
  GitHub,
  Home,
  Inbox,
  TableChart,
  Search,
  VerifiedUser,
} from "@mui/icons-material";
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

const drawerWidth = 210;

interface IProps {
  children: ReactNode;
}

export default function Layout({ children }: IProps) {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        style={{ backgroundColor: "#222222" }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            style={{ fontWeight: "bold" }}
          >
            <i>FeatureDive</i>: Interactive Song Search - v0.0.1
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
            <ListItem key={"search"} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <Search />
                </ListItemIcon>
                <Link href="/">
                  <ListItemText primary={"Search View"} />
                </Link>
              </ListItemButton>
            </ListItem>
            <ListItem key={"table"} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <TableChart />
                </ListItemIcon>
                <Link href="/table">
                  <ListItemText primary={"Table View"} />
                </Link>
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem key={"about"} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <Apps />
                </ListItemIcon>
                <Link href="/about">
                  <ListItemText primary={"About This App"} />
                </Link>
              </ListItemButton>
            </ListItem>
            <ListItem key={"Paper"} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <Book />
                </ListItemIcon>
                <Link href="https://atsuya.xyz">
                  <ListItemText primary={"Paper"} />
                </Link>
              </ListItemButton>
            </ListItem>
            <ListItem key={"Author"} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <VerifiedUser />
                </ListItemIcon>
                <Link href="https://atsuya.xyz">
                  <ListItemText primary={"Author"} />
                </Link>
              </ListItemButton>
            </ListItem>
            <ListItem key={"GitHub"} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <GitHub />
                </ListItemIcon>
                <Link href="https://github.com/atsukoba">
                  <ListItemText primary={"GitHub"} />
                </Link>
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3 }}
        style={{ height: "100vh", overscrollBehaviorY: "none" }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
