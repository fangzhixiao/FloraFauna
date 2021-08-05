import React from 'react'
import { GoogleMap, useJsApiLoader , useLoadScript} from '@react-google-maps/api';
import withToast from './withToast.jsx';

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





    if (loadError) return  "Error loding";
    if (!isLoaded) return "loding maps";


    return (
        <div>
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
        >
            { /* Child components, such as markers, info windows, etc. */ }
            <></>
        </GoogleMap>
        </div>
    )
}


const PostMapWithToast = withToast(PostMap);

export default PostMapWithToast;
