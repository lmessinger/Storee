<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// dev
// exec("perl /opt/bitnami/apache2/htdocs/awstats-7.3/wwwroot/cgi-bin/awstats.pl -update -config=localhost", $output);
// exec("perl /opt/bitnami/apache2/htdocs/awstats-7.3/wwwroot/cgi-bin/awstats.pl -config=localhost -output -staticlinks > stats.html",$output);

// live
 exec("perl /usr/local/awstats/wwwroot/cgi-bin/awstats.pl -config=mayameirav -update -showcorrupted", $output);
 exec("perl /usr/local/awstats/wwwroot/cgi-bin/awstats.pl -config=mayameirav -output -staticlinks > /var/www/html/live/stats/stats.html",$output);
//echo exec("sh ../stats.sh");
//shell_exec('sh ' . dirname(__FILE__). '/../stats.sh');

//$output = shell_exec('ls -lart');
//echo "<pre>$output</pre>";

header("location:http://www.mayameirav.com/stats/stats.html");

