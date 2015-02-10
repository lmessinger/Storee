#!/bin/bash
clear				# clear terminal window
echo ""
echo "Installing magento modules"
echo "-------------------------------------------------------------------"

BASEPATH="../../magento/"
#Copy files from repo to working magento folder
cp -r Maxxsol $BASEPATH"app/code/local/"
cp Maxxsol_ExtendAPI.xml $BASEPATH"app/etc/modules"
cp Maxxsol_StoryPlugin.xml $BASEPATH"app/etc/modules"
cp Maxxsol_MATax.xml $BASEPATH"app/etc/modules"
echo "Installing magento modules - COMPLETED"
echo "-------------------------------------------------------------------"