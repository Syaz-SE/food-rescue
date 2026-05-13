<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#f43f5e" />
    <title><?php echo e(config('app.name', 'RescueBite')); ?> — Food Rescue Platform</title>
    <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.jsx']); ?>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
<?php /**PATH C:\laragon\www\food-rescue\resources\views/app.blade.php ENDPATH**/ ?>