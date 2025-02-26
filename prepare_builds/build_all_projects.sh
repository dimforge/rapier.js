#!/bin/bash

function_name () {
    for entry in builds/*
    do
        (
            cd $entry
            npm i;
            npm run build;
            # npm run test;
        )
    done
}

function_name