import React from 'react';
import {Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {GoogleMap, InfoWindow, Marker, useLoadScript,} from '@react-google-maps/api';
import {Combobox, ComboboxInput, ComboboxList, ComboboxOption, ComboboxPopover,} from '@reach/combobox';
import usePlacesAutocomplete, {getGeocode, getLatLng,} from 'use-places-autocomplete';
import {DateTime} from 'luxon';
import withToast from './withToast.jsx';
import mapStyles from './mapStyles.jsx';
import Post from './Post.jsx';
import flora from './flora.svg';
import fauna from './iconmonstr-cat-7.svg'

const div1 = {
  align: 'center',
  width: '150px',
  margin: '10px ',
  backgroundColor: '#F0F8FF',
  minHeight: '80px',
  boxSizing: 'border-box',
};

// determines map size
const containerStyle = {
  width: '80vw',
  height: '80vh',
};

const libraries = ['places'];

const center = {
  lat: 42.3601,
  lng: -71.0589,
}



const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
};


function PostMap(props) {
  const { posts } = props;



  const { isLoaded, loadError } = useLoadScript({
    id: 'google-map-script',
    version: '1.00',
    googleMapsApiKey: 'AIzaSyBxw1ZLvBFlT_uLrisvAPSF29rv2PKcynw',
    libraries,
  });

  const [activeMarker, setActiveMarker] = React.useState([]);

  //const [newMarkers, setnewMarkers] = React.useState([]);

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
    //const zoom = mapRef.current.getZoom();
    //mapRef.current.setZoom(10);
  }, []);




  const onMapClick = React.useCallback((e) => {
    setNewMarkerLatLng( {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
    setShowing(true);
    setSelected(true);
  }, []);


  if (loadError) return 'Error';
  if (!isLoaded) return 'Loading';


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



  return (

    <div>

      <div>

        <div>
          <Locate panTo={panTo} />
        </div>


        <div>
          <Search panTo={panTo} />
        </div>


        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onMapLoad}
          options={options}
          onClick={onMapClick}
        >

          {console.log('MAP HERE')}
          {console.log(posts)}
          {
            posts.postList && posts.postList.map(post => (
              <Marker
                key={post.id}
                position={post.location}
                title={post.title}
                onClick={() => handleActiveMarker({ id: post.id, position: post.location })}
                icon= {post.sightingType === 'ANIMAL' ? faunaIcon : floraIcon }
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
                          <Post post={post} />
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
                  onCloseClick={ () => {setSelected(false) }}
              >
                <div>
                  <p>lat:{newMarkerLatLng.lat}; lng : {newMarkerLatLng.lng}</p>
                  <div>
                    <Button>
                      ADD a new Post
                    </Button>
                  </div>
                </div>
              </InfoWindow>) : null

            }

          </Marker>




          {/*{
            newMarkers.map(newMarker =>
              <Marker
                 key = {newMarker.time.toISOString()}
                 position={{lat : newMarker.lat,
                     lng : newMarker.lng,} }
                 onClick={() =>  {
                   setSelected(newMarker);
                 }}
              >
                {selected ? (
                    <InfoWindow
                        position={{lat:selected.lat, lng : selected.lng}}
                        onCloseClick={() => {
                          setSelected(null);
                        }}
                    >
                      <div>
                        <p>lat:{selected.lat}; lng : {selected.lng}</p>
                        <div>
                          <Button>
                            Delete the marker
                          </Button>
                        </div>
                      </div>
                    </InfoWindow>
                ) : null}

                </Marker>

              )
          }*/}
        </GoogleMap>
      </div>

    </div>


  );
}


function Locate({ panTo }) {
  return (
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
      Find me
    </Button>
  );
}

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
    <div>
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
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
    </div>
  );
}


const PostMapWithToast = withToast(PostMap);

export default PostMapWithToast;
