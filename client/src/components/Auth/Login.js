import React, { useContext } from 'react'
import { GoogleLogin } from 'react-google-login'
import { GraphQLClient } from 'graphql-request'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import { CID } from '../../keys'
import { BASE_URL } from './client'
import Context from '../../context'
import { ME_QUERY } from '../../graphql/queries'

const Login = ({ classes }) => {
  const { dispatch } = useContext(Context)

  const onSuccess = async googleUser => {
    try {
      const idToken = googleUser.getAuthResponse().id_token
      const client = new GraphQLClient(BASE_URL, {
        headers: { authorization: idToken }
      })

      const { me } = await client.request(ME_QUERY)

      dispatch({ type: 'LOGIN_USER', payload: me })
      dispatch({ type: 'IS_LOGGED_IN', payload: googleUser.isSignedIn() })
    } catch (err) {
      console.error('[ME_QUERY]', err)
    }
  }

  const onFailure = err => {
    console.error('Error logging in', err)
  }

  return (
    <div className={classes.root}>
      <Typography
        componet='h1'
        variant='h4'
        gutterBottom
        noWrap
        style={{ color: 'rgba(66, 133, 244)' }}>
        Welcome
      </Typography>
      <GoogleLogin
        buttonText='Login with Google'
        onSuccess={onSuccess}
        isSignedIn={true}
        onFailure={onFailure}
        theme='dark'
        clientId={CID}
      />
    </div>
  )
}

const styles = {
  root: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center'
  }
}

export default withStyles(styles)(Login)
