# Workspace for yolos.net

This is a workspace to run Claude Code to develop yolos.net.

**Initialize**: \
Run setup-contianer.sh on the host machine to set up the container.

**Execute**:

```bash
docker run -it --rm -v "yolos:/mnt/data" -e GITHUB_TOKEN yolos claude
```
