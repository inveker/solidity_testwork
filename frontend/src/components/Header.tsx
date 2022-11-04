import { FC } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ConnectKitButton } from "connectkit";

export const Header: FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          MyTestCoin App
        </Typography>
        <ConnectKitButton />
      </Toolbar>
    </AppBar>
  );
};
