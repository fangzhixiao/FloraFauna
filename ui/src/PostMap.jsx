import React from 'react';
import {
  Button, OverlayTrigger, Tooltip, Col, Glyphicon,
} from 'react-bootstrap';
import {
  GoogleMap, InfoWindow, Marker, useLoadScript,
} from '@react-google-maps/api';
import {
  Combobox, ComboboxInput, ComboboxList, ComboboxOption, ComboboxPopover,
} from '@reach/combobox';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { DateTime } from 'luxon';
import withToast from './withToast.jsx';
import mapStyles from './mapStyles.jsx';
import Post from './Post.jsx';
import flora from './flora.svg';
import fauna from './iconmonstr-cat-7.svg';
import PostAddNavItem from './PostAddNavItem.jsx';
import UserContext from './UserContext.js';
import PostContext from './PostContext.js';

const div1 = {
  align: 'center',
  width: '150px',
  margin: '10px ',
  backgroundColor: '#F0F8FF',
  minHeight: '80px',
  boxSizing: 'border-box',
};

const div2 = {
  padding: '3rem',
  fontsize: '1.5rem',
  width: '100%',
  maxWidth: '800px',
  zIndex: '10',
  transform: 'translateX(-60%)',
  position: 'absolute',
  left: '60%',
  align: 'left',
};


const cob1 = {
  padding: '2rem',
  height: '20px',
};

// determines map size
const containerStyle = {
  width: '70vw',
  height: '80vh',
};

const libraries = ['places'];

const center = {
  lat: 42.3601,
  lng: -71.0589,
};


const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: 'greedy',
};


function PostMap(props) {
  const { posts } = props;

  if (typeof window === 'undefined') {
    return null;
  }

  const { isLoaded, loadError } = useLoadScript({
    id: 'google-map-script',
    version: '3.46',
    googleMapsApiKey: window.ENV.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });


  const [activeMarker, setActiveMarker] = React.useState([]);

  const [selected, setSelected] = React.useState(false);

  const [newMarkerLatLng, setNewMarkerLatLng] = React.useState(center);
  const [showing, setShowing] = React.useState(false);


  const floraIcon = flora;
  const faunaIcon = fauna;


  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
  }, []);


  const onMapClick = React.useCallback((e) => {
    setNewMarkerLatLng({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
    setShowing(true);
    setSelected(true);
  }, []);


  if (loadError) return 'Map loading error, please try again';
  if (!isLoaded) return 'Loading...';


  const handleActiveMarker = (marker) => {
    if (activeMarker == null) {
      return;
    } if (marker.id === activeMarker.id) {
      return;
    }
    setActiveMarker(marker.id);
    panTo(marker.position);
  };

  const convertDate = (date, timezone) => {
    const spottedDateTime = DateTime.fromISO(new Date(date).toISOString(),
      { zone: 'UTC' })
      .setZone(timezone);

    return spottedDateTime.toLocaleString(DateTime.DATETIME_MED);
  };

  const closeNewMarker = () => {
    setShowing(false);
    setSelected(false);
  };

  const { showError, showSuccess } = props;


  return (

    <div>

      <div>

        <div>
          <Search panTo={panTo} />
        </div>


        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onMapLoad}
          options={options}
          onRightClick={onMapClick}
        >

          {
            posts.postList && posts.postList.map(post => (
              <Marker
                key={post.id}
                position={post.location}
                title={post.title}
                onClick={() => handleActiveMarker({ id: post.id, position: post.location })}
                icon={post.sightingType === 'ANIMAL' ? faunaIcon : floraIcon}
              >
                {activeMarker === post.id ? (
                  <InfoWindow onCloseClick={() => setActiveMarker([])}>
                    <div style={div1}>
                      <div id="title">
                        <b>{post.title}</b>
                      </div>
                      <div id="sightingType">
                        {post.sightingType}
                      </div>
                      <div id="spottedUTC">
                        {convertDate(post.spottedUTC, post.timezone)}
                      </div>
                      <div>
                        Address: TBD
                        {/* Todo : get address based on location to get address */}
                      </div>
                      <div align="center">
                        <br />
                        <Post
                          post={post}
                          showError={showError}
                          showSuccess={showSuccess}
                        />
                        <br />
                      </div>

                    </div>
                  </InfoWindow>
                ) : null}
              </Marker>
            ))
          }


          <Marker
            position={newMarkerLatLng}
            visible={showing}
          >
            {selected ? (
              <InfoWindow
                position={newMarkerLatLng}
                onCloseClick={closeNewMarker}
              >
                <div>
                  <p>
                    lat:
                    {newMarkerLatLng.lat}
                    ; lng :
                    {newMarkerLatLng.lng}
                  </p>
                  <div align="center">
                    <UserContext.Consumer>
                      {user => (
                        <PostContext.Consumer>
                          { postContext => (
                            <PostAddNavItem
                              user={user}
                              changeRefresh={postContext.changeRefresh}
                              closeNewMarker={closeNewMarker}
                              location={newMarkerLatLng}
                              showError={showError}
                              showSuccess={showSuccess}
                            />
                          )}
                        </PostContext.Consumer>
                      )}
                    </UserContext.Consumer>
                  </div>
                </div>
              </InfoWindow>
            ) : null

            }

          </Marker>
        </GoogleMap>
      </div>

    </div>


  );
}


const locateTooltip = (
  <Tooltip id="locate-tooltip" placement="left">Find my location</Tooltip>
);

const Locate = ({ panTo }) => (
  <OverlayTrigger delayShow={1000} overlay={locateTooltip}>
    <Button
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => null,
        );
      }}
    >
      <Glyphicon glyph="map-marker" />
    </Button>
  </OverlayTrigger>
);

function Search({ panTo }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 42.3601, lng: () => -71.0589 },
      radius: 100 * 200,
    },
  });


  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      panTo({ lat, lng });
    } catch (error) {
      console.log('Error: ', error);
    }
  };


  return (
    <div style={div2}>
      <Col sm={3} lg={1} med={2}>
        <Locate panTo={panTo} />
      </Col>
      <Col sm={3} lg={1} med={2}>
        &nbsp;
      </Col>
      <Col sm={4} lg={2} med={3}>
        <Combobox onSelect={handleSelect}>
          <ComboboxInput
            style={cob1}
            value={value}
            onChange={handleInput}
            disabled={!ready}
            placeholder="Search for locations"
          />
          <ComboboxPopover style={{ backgroundColor: 'white' }}>
            <ComboboxList style={{
              position: 'absolute', left: '10%', padding: '0.5rem', backgroundColor: 'white',
            }}
            >

              {status === 'OK'
              && data.map(({ id, description }) => (
                <ComboboxOption key={id} value={description} />
              ))}
            </ComboboxList>
          </ComboboxPopover>
        </Combobox>
      </Col>
    </div>
  );
}

const PostMapWithToast = withToast(PostMap);

export default PostMapWithToast;
