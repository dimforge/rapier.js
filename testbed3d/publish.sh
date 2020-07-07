#!/bin/bash

cp static/.htaccess dist/.
rsync -av --delete-after dist/ crozet@ssh.cluster003.hosting.ovh.net:/home/crozet/rapier/demos
rsync -av --delete-after dist/ammo.wasm.wasm crozet@ssh.cluster003.hosting.ovh.net:/home/crozet/rapier/ammo.wasm.wasm
rsync -av --delete-after dist/physx.release.wasm crozet@ssh.cluster003.hosting.ovh.net:/home/crozet/rapier/physx.release.wasm
