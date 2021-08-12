import React, { useState, useEffect } from 'react';
import {Button, ModalHeader, ModalTitle, OverlayTrigger} from 'react-bootstrap';
import {
  Marker, InfoWindow, GoogleMap, useLoadScript,
} from '@react-google-maps/api';
import {
  Combobox, ComboboxInput, ComboboxList, ComboboxOption, ComboboxPopover,
} from '@reach/combobox';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import withToast from './withToast.jsx';
import mapStyles from './mapStyles.jsx';
import Tooltip from "react-bootstrap/lib/Tooltip";
import Modal from "react-bootstrap/lib/Modal";


const div1 = {
  width: "300px",
  margin: "30px ",
  backgroundColor: "#F0F8FF",
  minHeight: "200px",
  boxSizing: "border-box"
};

const btn1 = {
  backgroundColor: "#F0F8FF",
  padding : "20px",
  fontsize : "28px"
}


const postsDB = [
  {
    title: 'A Turkey',
    authorId: 1,
    id: 123,
    spottedUTC: "2017-05-15T09:10:23Z",
    createdUTC: "2017-08-15T09:10:23Z",
    timezone: "UTC+9",
    location: {
      lat: 42.341146910114595,
      lng: -71.0917251720235,
    },
    sightingType: 'ANIMAL',
    description: 'I saw a turkey',
  },
  {
    title: 'A Poppy',
    id: 345,
    authorId: 2,
    spottedUTC: "2018-01-15T09:10:23Z",
    createdUTC: "2019-08-15T09:10:23Z",
    timezone: "UTC-8",
    location: {
      lat: 49.341146910114595,
      lng: -79.0917251720235,
    },
    sightingType: 'PLANT',
    description: 'I saw a poppy',
  },
];

const containerStyle = {
  width: '80vw',
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
};


function PostMap(props) {


  const [data,setData] = React.useState([]);

  const {posts} = props;

    React.useEffect(() => {
        const fetchData =  () => {
          if(posts.postList) {
            setData(posts.postList);
          }
        };
        fetchData();
    }, [posts]);

  const { isLoaded, loadError } = useLoadScript({
    id: 'google-map-script',
    version: '1.00',
    googleMapsApiKey: 'AIzaSyBxw1ZLvBFlT_uLrisvAPSF29rv2PKcynw',
    libraries,
  });

  const [activeMarker, setActiveMarker] = React.useState([]);
  // const [selected, setSelected] = React.useState(null);

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const renderTooltip = (props) => (
      <Tooltip id="button-tooltip" {...props}>
        Simple tooltip
      </Tooltip>
  );

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(16);
  }, []);


  const onMapClick = React.useCallback((e) => {
    console.log(e);
  }, []);

  if (loadError) return 'Error';
  if (!isLoaded) return 'loding';




  const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }

    setActiveMarker(marker);
    panTo(marker.position);
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
          onClick={onMapClick}
          options={options}
        >
                    {postsDB.map(({ id, title,location,sightingType, description
                    ,timezone,spottedUTC,createdUTC,authorId}) => (
                        <Marker
                            key={id}
                            position={location}
                            onClick={() => handleActiveMarker(id)}
                        >
                            {activeMarker === id ? (
                                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                                    <div style={div1}>
                                      <div>Title: {title}</div>
                                      <div>sightingType: {title}</div>
                                      <div>timezone:{timezone}</div>
                                      <div>
                                        address: Todo : get address based on location to get address
                                      </div>
                                    <div>
                                      <OverlayTrigger
                                          placement="left"
                                          delayShow={1000}
                                          overlay={<Tooltip id="details">details</Tooltip>}
                                      >
                                        <Button style={btn1}>Click to view</Button>

                                      </OverlayTrigger>
                                    </div>

                                    </div>
                                </InfoWindow>
                            ) : null}
                        </Marker>
                    ))}

            >



        </GoogleMap>
      </div>

    </div>


  );
}


function Locate({ panTo }) {
  return (
    <Button
      style={{ fontSize: 50 }}
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
