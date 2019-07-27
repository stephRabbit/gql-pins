import React, { useState, useEffect, useContext } from 'react'
import ReactMapGL, { NavigationControl, Marker } from 'react-map-gl'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import DeleteIcon from '@material-ui/icons/DeleteTwoTone'

import { MAP_BOX } from '../keys'
import Context from '../context'
import Blog from './Blog'
import PinIcon from './PinIcon'

const INIT_VIEWPORT = {
  latitude: 37.7577,
  longitude: -122.4376,
  zoom: 13
}

const Map = ({ classes }) => {
  const [viewport, setViewport] = useState(INIT_VIEWPORT)
  const [userPosition, setUserPosition] = useState(null)
  const { state, dispatch } = useContext(Context)
  const { draft } = state

  useEffect(() => {
    getUserPosition()
  }, [])

  const getUserPosition = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords
        setViewport({ ...viewport, latitude, longitude })
        setUserPosition({ latitude, longitude })
      })
    }
  }

  const handleMapClick = ({ lngLat, leftButton }) => {
    if (!leftButton) return

    if (!draft) {
      dispatch({ type: 'CREATE_DRAFT' })
    }

    const [longitude, latitude] = lngLat
    dispatch({
      type: 'UPDATE_DRAFT_LOCATION',
      payload: { latitude, longitude }
    })
  }

  return (
    <div className={classes.root}>
      <ReactMapGL
        width='100vw'
        height='calc(100vh - 64px)'
        mapStyle='mapbox://styles/mapbox/streets-v9'
        mapboxApiAccessToken={MAP_BOX}
        onViewportChange={viewportChange => setViewport(viewportChange)}
        onClick={handleMapClick}
        {...viewport}>
        <div className={classes.navigationControl}>
          <NavigationControl
            onViewportChange={viewportChange => setViewport(viewportChange)}
          />
        </div>
        {userPosition && (
          <Marker
            latitude={userPosition.latitude}
            longitude={userPosition.longitude}
            offsetLeft={-19}
            offsetTop={-37}>
            <PinIcon size={40} color='red' />
          </Marker>
        )}
        {state.draft && (
          <Marker
            latitude={draft.latitude}
            longitude={draft.longitude}
            offsetLeft={-19}
            offsetTop={-37}>
            <PinIcon size={40} color='hotpink' />
          </Marker>
        )}
      </ReactMapGL>
      <Blog />
    </div>
  )
}

const styles = {
  root: {
    display: 'flex'
  },
  rootMobile: {
    display: 'flex',
    flexDirection: 'column-reverse'
  },
  navigationControl: {
    position: 'absolute',
    top: 0,
    left: 0,
    margin: '1em'
  },
  deleteIcon: {
    color: 'red'
  },
  popupImage: {
    padding: '0.4em',
    height: 200,
    width: 200,
    objectFit: 'cover'
  },
  popupTab: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  }
}

export default withStyles(styles)(Map)
