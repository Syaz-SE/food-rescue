<?php

use Illuminate\Support\Facades\Route;

// SPA: every non-API route serves the React shell.
// React Router takes over routing client-side.
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
