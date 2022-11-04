import { FC } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";

export const ClaimRewards: FC = () => {
  return (
    <Box
      component="span"
      sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
    >
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Reward
          </Typography>
          <Typography variant="h5" component="div">
            Claim Rewards
          </Typography>
          <Typography variant="body2">
            Take the rewards that are credited to your deposit
          </Typography>
        </CardContent>
        <CardActions>
          <Button variant="contained" style={{ width: "100%" }}>
            CLAIM REWARDS
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};
