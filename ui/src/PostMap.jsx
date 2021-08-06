import React from 'react'
import { Marker, InfoWindow,GoogleMap, useJsApiLoader , useLoadScript} from '@react-google-maps/api';
import withToast from './withToast.jsx';
import {Combobox, ComboboxInput, ComboboxList, ComboboxOption, ComboboxPopover} from "@reach/combobox";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import PostSightingFilter from "./PostSightingFilter.jsx";
import Panel from "react-bootstrap/lib/Panel";
import mapStyles from "./mapStyles.jsx";


const Posts = [
    {
        id: 1,
        name: "A Turkey",
        position: { lat: 42.341146910114595, lng: -71.0917251720235 }
    },
    {
        id: 2,
        name: "A Poppy",
        position: { lat:49.341146910114595, lng: -79.0917251720235 }
    },

];





const containerStyle = {
    width: '80vw',
    height: '80vh'
};

const libraries = ["places"];

const center = {
    lat: 42.3601,
    lng: -71.0589,
};


const options = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
};


function PostMap() {
    const { isLoaded, loadError} = useLoadScript({
        id: 'google-map-script',
        version: "1.00",
        googleMapsApiKey: "AIzaSyBxw1ZLvBFlT_uLrisvAPSF29rv2PKcynw",
        libraries,
    })

    const [activeMarker, setActiveMarker] = React.useState([]);
    const [selected, setSelected] = React.useState(null);

    const mapRef = React.useRef();
    const onMapLoad = React.useCallback((map) => {
        mapRef.current = map;
        const bounds = new google.maps.LatLngBounds();
        Posts.forEach(({ position }) => bounds.extend(position));
        map.fitBounds(bounds);
    }, []);

    const panTo = React.useCallback(({ lat, lng }) => {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(16);
    }, []);

    const onMapClick = React.useCallback((e) => {
        console.log(e);
    }, []);

    if (loadError) return  "Error";
    if (!isLoaded) return "loding";





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
            <Panel>
                <Panel.Heading>
                    <Panel.Title>Filter</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <PostSightingFilter urlBase="/map" />
                </Panel.Body>
            </Panel>
        </div>

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


                    {Posts.map(({ id, name, position }) => (
                        <Marker
                            key={id}
                            position={position}
                            onClick={() => handleActiveMarker(id)}
                        >
                            {activeMarker === id ? (
                                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                                    <div>{name}</div>
                                </InfoWindow>
                            ) : null}
                        </Marker>
                    ))}

                </GoogleMap>
            </div>

</div>


    )
}


function Locate({ panTo }) {
    return (
        <button
            style={{fontSize:50}}
            onClick={() => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        panTo({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    () => null
                );
            }}
        >
            Find me
        </button>
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
            console.log("Error: ", error);
        }
    };

    return (
        <div >
            <Combobox onSelect={handleSelect}>
                <ComboboxInput
                    value={value}
                    onChange={handleInput}
                    disabled={!ready}
                    placeholder="Search  location"
                />
                <ComboboxPopover  style={{backgroundColor :"white"}}>
                    <ComboboxList style={{position:"absolute", left :"10%",padding :"0.5rem", backgroundColor : "white"}}>

                        {status === "OK" &&
                        data.map(({ id, description }) => (
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
