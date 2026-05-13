<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#f43f5e" />
    <title>{{ config('app.name', 'RescueBite') }} — Food Rescue Platform</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
