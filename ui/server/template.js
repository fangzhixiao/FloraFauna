import serialize from 'serialize-javascript';

export default function template(body, initialData, userData) {
  return `<!DOCTYPE HTML>
<html lang="">
  <head>
    <meta charset="utf-8">
    <title>Flora Fauna Sighting Map</title>
    <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" >
    <link rel="stylesheet" href="/react-datetime.css" >
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    </script>
    <script src="https://apis.google.com/js/api:client.js"></script>
    <style>
      table.table-hover tr {cursor: pointer;}
      .panel-title a {display: block; width: 100%; cursor: pointer;}
    </style>
  </head>
  <body>
    <!-- Page generated from template. -->
    <div id="content">${body}</div>
    <script>window.__INITIAL_DATA__ = ${serialize(initialData)}</script>
    <script>window.__USER_DATA__ = ${serialize(userData)}</script>
    
    <script src="/env.js"></script>
    <script src="/vendor.bundle.js"></script>
    <script src="/app.bundle.js"></script>
    
  </body>
</html>
`;
}
