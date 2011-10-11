<style>
	img {
		background-color: #ccc;
		background-image: -moz-repeating-linear-gradient(-45deg, transparent, transparent 2px, #aaa 2px, #aaa 3px);
		background-image: -webkit-repeating-linear-gradient(-45deg, transparent, transparent 2px, #aaa 2px, #aaa 3px);
		background-size: 4px 4px;
		padding: 2px;
		border: 1px solid red;
		margin: 1px;
		float: left;
	}
</style>
<?php

date_default_timezone_set('America/New_York');

$path = realpath(dirname(__FILE__) . '/../');
#echo "Scanning for image directories in '$path'..";
$dirs = scandir($path);
#var_dump($dirs);

foreach ($dirs as $dir) {
	$dir = "$path/$dir/images";
	if (is_dir($dir)) {
		#echo "Found image directory at '$dir'..\n";
		doDirectory($dir);
	}
}

function doDirectory($path) {
	$files = scandir($path);

	// remove "." and ".." or else we'll loop endlessly
	$files = array_slice($files, 2);

	foreach ($files as $file) {
		$file = "$path/$file";

		if (is_dir($file)) {
			doDirectory($file);
		}
		else if (is_file($file)) {
			doRegularFile($file);
		}
	}
}

function doRegularFile($path) {
	if (in_array(substr($path, -4), array('.png', '.jpg', '.gif'))) {
		$uri = str_replace($_SERVER['DOCUMENT_ROOT'], '', $path);
		echo <<<HTML
<img src="{$uri}" alt="{$path}" title="{$path}">
HTML;
	}
}
