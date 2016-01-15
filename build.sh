#!/bin/bash

rm -rf build
mkdir build
jsbuild -license=LICENSE -version=`cat VERSION` -output=build/harmonizer.js \
  -name=harmonizer src/*.js
