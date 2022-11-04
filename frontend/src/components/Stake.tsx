import { FC } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";

export const Stake: FC = () => {
  return (
    <Box
      component="span"
      sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
    >
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Stake
          </Typography>
          <Typography variant="h5" component="div">
            Add new Stake
          </Typography>
          <Typography variant="body2">
            Block some of your funds to receive rewards
          </Typography>
        </CardContent>
        <div style={{ padding: "0 10px" }}>
          <TextField
            fullWidth
            label="Stake amount"
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          />
        </div>

        <CardActions>
          <Button variant="contained" style={{ width: "100%" }}>
            STAKE
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};
