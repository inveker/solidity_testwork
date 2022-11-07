import { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ConnectKitButton } from "connectkit";

export const UnauthorizedPlaceholder: FC = () => {
  return (
    <div style={{textAlign: 'center', marginTop: '20px'}}
    >
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        Please connet your wallet
      </Typography>
      <div style={{display: 'inline-block'}}>
      <ConnectKitButton/>
      </div>
      
    </div>
  );
};
