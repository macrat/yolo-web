FROM node:lts

RUN curl -fsSLo /etc/apt/keyrings/githubcli-archive-keyring.gpg https://cli.github.com/packages/githubcli-archive-keyring.gpg \
	&& chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
	&& apt-get update \
	&& apt-get install -y \
		gh \
		ripgrep \
		vim \
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /usr/src

USER node

RUN echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc \
	&& . ~/.bashrc \
	&& curl -fsSL https://claude.ai/install.sh | bash \
	&& git config --global user.name "Claude" \
	&& git config --global user.email "noreply@anthropic.com"

USER root

RUN mkdir -p /mnt/data/yolo-web \
	&& mv /home/node/.claude /mnt/data/claude \
	&& mv /home/node/.claude.json /mnt/data/claude.json \
	&& chown -R node:node /mnt/data

USER node

RUN ln -s /mnt/data/claude /home/node/.claude \
	&& ln -s /mnt/data/claude.json /home/node/.claude.json

VOLUME /mnt/data

WORKDIR /mnt/data/yolo-web
CMD ["bash"]
