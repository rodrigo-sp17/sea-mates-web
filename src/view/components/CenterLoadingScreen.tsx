import { CircularProgress } from "@material-ui/core";
import React from "react";

export default function CenterLoadingScreen() {
  return (
    <div style={
      {
        position: 'absolute',
        left: '50%',
        top: '50%'
      }}>
      <CircularProgress />
    </div>
  );
}