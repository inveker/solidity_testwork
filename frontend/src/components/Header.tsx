import { FC } from "react";
import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export const Header: FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          MyTestCoin App
        </Typography>
        <Button color="inherit">Connect Wallet</Button>
      </Toolbar>
    </AppBar>
  );
};
