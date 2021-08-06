import React from 'react'
import { GoogleMap, useJsApiLoader , useLoadScript} from '@react-google-maps/api';
import withToast from './withToast.jsx';
import {Combobox, ComboboxInput, ComboboxList, ComboboxOption, ComboboxPopover} from "@reach/combobox";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";

const containerStyle = {
    width: '80vw',
    height: '80vh'
};

const libraries = ["places"];

const center = {
    lat: 42.3601,
    lng: -71.0589,
};





function PostMap() {
    const { isLoaded, loadError} = useLoadScript({
        id: 'google-map-script',
        version: "1.00",
        googleMapsApiKey: "AIzaSyBxw1ZLvBFlT_uLrisvAPSF29rv2PKcynw",
        libraries,
    })




    const mapRef = React.useRef();
    const onMapLoad = React.useCallback((map) => {
        mapRef.current = map;
    }, []);

    const panTo = React.useCallback(({ lat, lng }) => {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(14);
    }, []);



    const onMapClick = React.useCallback((e) => {
        console.log(e);
    }, []);

    if (loadError) return  "Error";
    if (!isLoaded) return "loding";


    return (



        <div>

            <Locate panTo={panTo} />
            <Search panTo={panTo} />

        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onLoad={onMapLoad}
            onClick={onMapClick}
        >
            { /* Child components, such as markers, info windows, etc. */ }
            <></>
        </GoogleMap>
        </div>
    )
}


function Locate({ panTo }) {
    return (
        <button
            className="locate"
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
            console.log("😱 Error: ", error);
        }
    };

    return (
        <div className="search">
            <Combobox onSelect={handleSelect}>
                <ComboboxInput
                    value={value}
                    onChange={handleInput}
                    disabled={!ready}
                    placeholder="Search your location"
                />
                <ComboboxPopover>
                    <ComboboxList>
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
