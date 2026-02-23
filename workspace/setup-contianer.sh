#!/bin/sh

echo ----- 1. build container -----
docker build -t yolos .

echo ----- 2. clone the repository -----
docker run --rm -v "yolos:/mnt/data" -e GITHUB_TOKEN -w /mnt/data yolos gh repo clone macrat/yolo-web

echo ----- 3. login to claude -----
docker run -it --rm -v "yolos:/mnt/data" yolos /home/node/.local/bin/claude auth login

echo ----- 4. install plugins -----
docker run --rm -v "yolos:/mnt/data" yolos /home/node/.local/bin/claude plugin update
docker run --rm -v "yolos:/mnt/data" yolos /home/node/.local/bin/claude plugin install playwright@claude-plugins-official
docker run --rm -v "yolos:/mnt/data" yolos /home/node/.local/bin/claude plugin install typescript-official@claude-plugins-official

echo ----- done -----
