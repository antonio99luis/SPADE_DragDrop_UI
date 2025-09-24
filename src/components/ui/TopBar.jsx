import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import GitHubIcon from "@mui/icons-material/GitHub";
//import PythonLogo from "../../assets/python.svg"; // You need an outline SVG for Python logo

import "./TopBar.css";

export default function TopBar({ onSave, onLoad, onGenerateSpade }) {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: "rgba(240,240,240,0.85)",
        borderBottom: "1px solid #e0e0e0",
        backdropFilter: "blur(4px)",
      }}
    >
      <Toolbar sx={{ minHeight: 56, display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Generate Python code">
            <IconButton
              onClick={onGenerateSpade}
              sx={{
                border: "2px solid #222",
                bgcolor: "#fff",
                mr: 1,
                "&:hover": { bgcolor: "#f5f5f5" },
                width: 40,
                height: 40,
              }}
            >
              {/* Python outline logo as SVG */}
              Python
            </IconButton>
          </Tooltip>
          <Tooltip title="Save Project">
            <IconButton
              onClick={onSave}
              sx={{
                border: "2px solid #222",
                bgcolor: "#fff",
                "&:hover": { bgcolor: "#f5f5f5" },
                width: 40,
                height: 40,
              }}
            >
              <span style={{ fontSize: 22, filter: "grayscale(1)" }}>💾</span>
            </IconButton>
          </Tooltip>
          <Tooltip title="Load Project">
            <IconButton
              onClick={onLoad}
              sx={{
                border: "2px solid #222",
                bgcolor: "#fff",
                "&:hover": { bgcolor: "#f5f5f5" },
                width: 40,
                height: 40,
              }}
            >
              <span style={{ fontSize: 22, filter: "grayscale(1)" }}>📁</span>
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="GitHub Repository">
            <IconButton
              component="a"
              href="https://github.com/AntonioLuisTorres/SPADE_DragDrop_UI"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                border: "2px solid #222",
                bgcolor: "#fff",
                "&:hover": { bgcolor: "#f5f5f5" },
                width: 40,
                height: 40,
              }}
            >
              <GitHubIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Star this project">
            <IconButton
              component="a"
              href="https://github.com/AntonioLuisTorres/SPADE_DragDrop_UI/stargazers"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                border: "2px solid #222",
                bgcolor: "#fff",
                "&:hover": { bgcolor: "#f5f5f5" },
                width: 40,
                height: 40,
              }}
            >
              <span style={{ fontSize: 22, filter: "grayscale(1)" }}>⭐</span>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}