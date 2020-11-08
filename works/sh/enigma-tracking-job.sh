#!/bin/bash
# job parameters:
#  1 - url token
#  2 - url service
#  3 - client id
#  4 - client secret
# path to python
pythonpath=/home/mapsys/api-integrations/programs/env/bin
# path to python program
programpath=/home/mapsys/api-integrations/programs/pyprograms/fmc-wcc
# script parameters
urltoken="$1"
urlservice="$2"
clientid="$3"
clientsecret="$4"
# today in {day}{month}{year}-{hour}{minute} format
today=$(date +"%d%m%y-%H%M")
# path to out directory
outdir=/home/mapsys/api-integrations/fmc/wcc/enigma-tracking
# execute python program, redirect output to logs directory
$pythonpath/python $programpath/main.py $urltoken $urlservice $clientid $clientsecret --outdir $outdir/php --outfilename response.json
# move python program log to lods directory
mv *.log $outdir/logs
# remove all 0 byte files - no error log files
find $outdir/logs -type f -size 0 -exec rm -f {} \;