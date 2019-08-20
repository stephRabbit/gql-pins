import React, { useState, useEffect, useContext } from 'react'
import ReactMapGL, { NavigationControl, Marker, Popup } from 'react-map-gl'
import { Subscription } from 'react-apollo'
import differenceInMinutes from 'date-fns/difference_in_minutes'
import { withStyles } from '@material-ui/core/styles'
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import DeleteIcon from '@material-ui/icons/DeleteTwoTone'

import { useClient } from '../components/Auth/client'
import { GET_PINS_QUERY } from '../graphql/queries'
import { DELETE_PIN_MUTATION } from '../graphql/mutations'
import {
  PIN_ADDED_SUBSCRIPTION,
  PIN_DELETED_SUBSCRIPTION,
  PIN_UPDATED_SUBSCRIPTION
} from '../graphql/subscriptions'
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
  const client = useClient()
  const mobileSize = useMediaQuery('(max-width: 650px)')
  const { state, dispatch } = useContext(Context)

  useEffect(() => {
    getPins()
  }, [])

  const [viewport, setViewport] = useState(INIT_VIEWPORT)
  const [userPosition, setUserPosition] = useState(null)
  const { draft } = state

  useEffect(() => {
    getUserPosition()
  }, [])

  const [popup, setPopup] = useState(null)
  // remove pin when deleted by user for all users
  useEffect(() => {
    const pinExists =
      popup && state.pins.findIndex(pin => pin._id === popup._id) > -1
    if (!pinExists) {
      setPopup(null)
    }
  }, [state.pins.length])

  const getUserPosition = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords
        setViewport({ ...viewport, latitude, longitude })
        setUserPosition({ latitude, longitude })
      })
    }
  }

  const getPins = async () => {
    const { getPins } = await client.request(GET_PINS_QUERY)
    dispatch({ type: 'GET_PINS', payload: getPins })
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

  const isAuthUser = () => state.currentUser._id === popup.author._id

  const hightlightNewPin = pin => {
    // Check if difference in time is less than 30 minutes
    const isNewPin =
      differenceInMinutes(Date.now(), Number(pin.createdAt)) <= 30
    return isNewPin ? 'darkorange' : 'mediumorchid'
  }

  const handleSelectPin = pin => {
    setPopup(pin)
    dispatch({ type: 'SET_PIN', payload: pin })
  }

  const handleDeletePin = async pin => {
    const variables = { pinId: pin._id }
    await client.request(DELETE_PIN_MUTATION, variables)
    setPopup(null)
  }

  return (
    <div className={mobileSize ? classes.rootMobile : classes.root}>
      <ReactMapGL
        width='100vw'
        height='calc(100vh - 64px)'
        mapStyle='mapbox://styles/mapbox/streets-v9'
        mapboxApiAccessToken={MAP_BOX}
        onViewportChange={viewportChange => setViewport(viewportChange)}
        onClick={handleMapClick}
        scrollZoom={!mobileSize}
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

        {state.pins.map(pin => (
          <Marker
            key={pin._id}
            latitude={pin.latitude}
            longitude={pin.longitude}
            offsetLeft={-19}
            offsetTop={-37}>
            <PinIcon
              size={40}
              color={hightlightNewPin(pin)}
              onClick={() => handleSelectPin(pin)}
            />
          </Marker>
        ))}

        {popup && (
          <Popup
            anchor='top'
            latitude={popup.latitude}
            longitude={popup.longitude}
            closeOnClick={false}
            onClose={() => setPopup(null)}>
            <img
              className={classes.popupImage}
              src={popup.image}
              alt={popup.title}
            />
            <div className={classes.popupTab}>
              <Typography>
                {popup.latitude.toFixed(6)}, {popup.longitude.toFixed(6)}
              </Typography>
              {isAuthUser() && (
                <Button onClick={() => handleDeletePin(popup)}>
                  <DeleteIcon className={classes.deleteIcon} />
                </Button>
              )}
            </div>
          </Popup>
        )}
      </ReactMapGL>

      <Subscription
        subscription={PIN_ADDED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinAdded } = subscriptionData.data
          console.log({ pinAdded })
          dispatch({ type: 'CREATE_PIN', payload: pinAdded })
        }}
      />

      <Subscription
        subscription={PIN_DELETED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinDeleted } = subscriptionData.data
          console.log({ pinDeleted })
          dispatch({ type: 'DELETE_PIN', payload: pinDeleted })
        }}
      />

      <Subscription
        subscription={PIN_UPDATED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinUpdated } = subscriptionData.data
          console.log({ pinUpdated })
          dispatch({ type: 'CREATE_COMMENT', payload: pinUpdated })
        }}
      />

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
