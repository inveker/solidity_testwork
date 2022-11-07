import { FC } from 'react'
import { CircularProgress, Tooltip, Button } from '@mui/material'

interface IProps {
  isDisabled: boolean
  isLoading: boolean
  disabledMessage: string
  onClick: React.MouseEventHandler<HTMLButtonElement>
  label: string
}

export const LoadingButtonWithTooltip: FC<IProps> = ({ isDisabled, isLoading, disabledMessage, onClick, label }) => {
  return (
    <Tooltip title={isDisabled ? disabledMessage : null}>
      <div style={{ width: '100%' }}>
        <Button variant="contained" style={{ width: '100%' }} onClick={onClick} disabled={isDisabled || isLoading}>
          {label}
          {isLoading ? (
            <div style={{ marginLeft: '10px' }}>
              <CircularProgress size="10px" />
            </div>
          ) : null}
        </Button>
      </div>
    </Tooltip>
  )
}
