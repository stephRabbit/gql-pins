import React, { useContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import MapIcon from '@material-ui/icons/Map'
import Typography from '@material-ui/core/Typography'
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery'

import Context from '../context'
import Signout from './Auth/Signout'

const Header = ({ classes }) => {
  const { state } = useContext(Context)
  const mobileSize = useMediaQuery('(max-width: 650px)')
  const { currentUser } = state
  return (
    <div className={classes.root}>
      <AppBar position='static'>
        <Toolbar>
          <div className={classes.grow}>
            <MapIcon className={classes.icon} />
            <Typography
              className={mobileSize ? classes.mobile : classes.textColor}
              component='h1'
              variant='h6'
              color='inherit'
              noWrap>
              MapPins
            </Typography>
          </div>
          {currentUser && (
            <div className={classes.grow}>
              <img
                className={classes.picture}
                src={currentUser.picture}
                alt={currentUser.name}
              />
              <Typography
                variant='h6'
                component='h3'
                className={mobileSize ? classes.mobile : classes.textColor}
                noWrap>
                {currentUser.name}
              </Typography>
            </div>
          )}
          <Signout />
        </Toolbar>
      </AppBar>
    </div>
  )
}

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    marginRight: theme.spacing.unit,
    color: 'orchid',
    fontSize: 45
  },
  mobile: {
    display: 'none'
  },
  picture: {
    height: '37px',
    borderRadius: '90%',
    marginRight: theme.spacing.unit
  },
  textColor: {
    color: 'whitesmoke',
    fontWeight: 400
  }
})

export default withStyles(styles)(Header)
