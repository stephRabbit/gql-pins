import React, { useContext } from 'react'
import { GoogleLogout } from 'react-google-login'
import { withStyles } from '@material-ui/core/styles'
import ExitToApp from '@material-ui/icons/ExitToApp'
import Typography from '@material-ui/core/Typography'
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery'

import Context from '../../context'

const Signout = ({ classes }) => {
  const { dispatch } = useContext(Context)
  const mobileSize = useMediaQuery('(max-width: 650px)')

  const onSignout = () => {
    dispatch({ type: 'SIGNOUT_USER' })
    console.log('Signed out user!')
  }

  return (
    <GoogleLogout
      buttonText='Signout'
      onLogoutSuccess={onSignout}
      render={({ onClick }) => (
        <span className={classes.root} onClick={onClick}>
          <Typography
            variant='body1'
            className={mobileSize ? classes.mediaHide : classes.buttonText}>
            Signout
          </Typography>
          <ExitToApp className={classes.buttonIcon} />
        </span>
      )}
    />
  )
}

const styles = {
  root: {
    cursor: 'pointer',
    display: 'flex',
    borderRadius: '3px'
  },
  buttonText: {
    color: 'orchid',
    fontWeight: 450
  },
  buttonIcon: {
    marginLeft: '5px',
    color: 'orchid'
  },
  mediaHide: {
    display: 'none'
  }
}

export default withStyles(styles)(Signout)
