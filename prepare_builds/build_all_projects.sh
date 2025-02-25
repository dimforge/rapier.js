#!/bin/bash

for entry in builds/*
do
    (
        cd $entry
        # FIXME: ideally we'd use `npm ci`
        # but we'd need to have generated the `package-lock` beforehand and committed them in the repository.
        # I'm not sure yet how to store those `package-lock`s yet though.
        # They should proably be similar to all packages, but I'm not sure.
        npm i;
        npm run build;
        # Tests are only for compat version.
        # npm run test;
    )
done
