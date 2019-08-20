import React, { useState, useContext } from 'react'
import axios from 'axios'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import AddAPhotoIcon from '@material-ui/icons/AddAPhotoTwoTone'
import LandscapeIcon from '@material-ui/icons/LandscapeOutlined'
import ClearIcon from '@material-ui/icons/Clear'
import SaveIcon from '@material-ui/icons/SaveTwoTone'
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery'

import { CLDRY_NAME, CLDRY_URL } from '../../keys'
import { CREATE_PIN_MUTATION } from '../../graphql/mutations'
import { useClient } from '../Auth/client'
import Context from '../../context'

const CreatePin = ({ classes }) => {
  const client = useClient()
  const { state, dispatch } = useContext(Context)
  const mobileSize = useMediaQuery('(max-width: 650px)')
  const [title, setTitle] = useState('')
  const [image, setImage] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleClearState = () => {
    setTitle('')
    setImage('')
    setContent('')
  }

  const handleDeleteDraft = () => {
    handleClearState()
    dispatch({ type: 'DELETE_DRAFT' })
  }

  const handleImageUpload = async () => {
    const data = new FormData()
    data.append('file', image)
    data.append('upload_preset', 'geopins')
    data.append('cloud_name', CLDRY_NAME)

    const res = await axios.post(CLDRY_URL, data)

    return res.data.url
  }

  const handleSubmit = async e => {
    try {
      e.preventDefault()
      setSubmitting(true)
      const url = await handleImageUpload()
      const { latitude, longitude } = state.draft
      const variables = { title, image: url, content, latitude, longitude }
      await client.request(CREATE_PIN_MUTATION, variables)
      handleDeleteDraft()
    } catch (err) {
      setSubmitting(false)
      console.error('Error creating pin', err)
    }
  }

  const disableBtn = !title.trim() || !content.trim() || !image || submitting

  return (
    <form className={classes.form} onSubmit={handleSubmit}>
      <Typography
        className={classes.alignCenter}
        component='h2'
        color='secondary'
        variant='h4'>
        <LandscapeIcon className={classes.iconLarge} /> Pin Location
      </Typography>
      <div>
        <TextField
          name='title'
          label='Title'
          placeholder='Add pin title'
          onChange={e => setTitle(e.target.value)}
          value={title}
        />
        <input
          accept='image/*'
          id='image'
          className={classes.input}
          type='file'
          onChange={e => setImage(e.target.files[0])}
        />
        <label htmlFor='image'>
          <Button
            style={{ color: image && 'green' }}
            component='span'
            size='small'
            className={classes.button}>
            <AddAPhotoIcon />
          </Button>
        </label>
      </div>
      <div className={classes.contentField}>
        <TextField
          name='content'
          label='Content'
          rows={mobileSize ? '3' : '6'}
          margin='normal'
          variant='outlined'
          multiline
          fullWidth
          onChange={e => setContent(e.target.value)}
          value={content}
        />
      </div>
      <div>
        <Button
          onClick={handleDeleteDraft}
          className={classes.button}
          variant='contained'
          color='primary'>
          <ClearIcon className={classes.leftIcon} />
          Discard
        </Button>
        <Button
          disabled={disableBtn}
          className={classes.button}
          variant='contained'
          color='secondary'
          type='submit'>
          Submit
          <SaveIcon className={classes.rightIcon} />
        </Button>
      </div>
    </form>
  )
}

const styles = theme => ({
  form: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingBottom: theme.spacing.unit
  },
  contentField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '95%'
  },
  input: {
    display: 'none'
  },
  alignCenter: {
    display: 'flex',
    alignItems: 'center'
  },
  iconLarge: {
    fontSize: 40,
    marginRight: theme.spacing.unit
  },
  leftIcon: {
    fontSize: 20,
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    fontSize: 20,
    marginLeft: theme.spacing.unit
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit,
    marginLeft: 0
  }
})

export default withStyles(styles)(CreatePin)
