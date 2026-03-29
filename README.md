# n8n-nodes-emailmd

n8n community node for sending emails rendered from Markdown using [emailmd](https://github.com/unmta/emailmd).

## Features

- Write email content in Markdown instead of HTML
- YAML frontmatter support (`preheader`, `theme`)
- Built-in themes: `default`, `light`, `dark`
- Override theme colors and typography
- Support for: To, CC, BCC, Reply-To, attachments
- Automatic plain-text version generation
- emailmd directives: `{button}`, `:::callout`, `:::hero`, `:::footer`

## Installation

### Docker with local volume (recommended)

A typical n8n Docker setup has a volume mounted inside the container at `/home/node/.n8n`.
On the host it corresponds to the directory you pass via `-v` or in `docker-compose.yml`.

#### Step 1 — clone and build the plugin on the host

```bash
git clone ssh://gitea@git.cynarski.pl:65522/n8n/emailmd.git n8n-nodes-emailmd
cd n8n-nodes-emailmd
npm install
npm run build
```

#### Step 2 — copy the built plugin to the n8n volume

Assuming the host volume is e.g. at `~/n8n-data`:

```bash
mkdir -p ~/n8n-data/custom/node_modules/n8n-nodes-emailmd
cp -r dist package.json node_modules ~/n8n-data/custom/node_modules/n8n-nodes-emailmd/
```

> The `custom` directory inside the volume is automatically scanned by n8n as local node_modules.

#### Step 3 — docker-compose.yml

Add the `N8N_CUSTOM_EXTENSIONS` environment variable pointing to the `custom` directory inside the container:

```yaml
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom
    volumes:
      - ~/n8n-data:/home/node/.n8n
    restart: unless-stopped
```

Then restart the container:

```bash
docker compose down && docker compose up -d
```

#### Alternative — install inside the container

If you prefer not to copy files manually, you can install the plugin directly in a running container:

```bash
# enter the container
docker exec -it -u node <container_name> sh

# install from a local path (if you have a volume)
cd /home/node/.n8n
mkdir -p custom
cd custom
npm init -y
npm install /home/node/.n8n/n8n-nodes-emailmd   # if you copied the directory to the volume

# or from git (requires git in the container)
npm install git+ssh://gitea@git.cynarski.pl:65522/n8n/emailmd.git
```

After exiting the container, restart n8n:

```bash
docker compose restart n8n
```

#### Verification

After n8n starts, search for the node named **"Send Email (Markdown)"** in the editor — if it appears, the installation was successful.

---

### Option 1 — npm link (local development)

```bash
# 1. Build the node
cd /path/to/n8n-nodes-emailmd
npm install
npm run build

# 2. Link locally
npm link

# 3. In the n8n directory
cd ~/.n8n
mkdir -p custom
cd custom
npm link n8n-nodes-emailmd
```

### Option 2 — custom nodes path in n8n

Set the environment variable before starting n8n:

```bash
export N8N_CUSTOM_EXTENSIONS="/path/to/n8n-nodes-emailmd"
n8n start
```

### Option 3 — npm install (after publishing)

```bash
npm install n8n-nodes-emailmd
```

## Configuration

### Credentials (SMTP)

Add credentials of type **SMTP**:
- **Host** — SMTP server (e.g. `smtp.gmail.com`)
- **Port** — `465` (SSL) or `587` (STARTTLS)
- **Secure** — `true` for port 465
- **User** / **Password**

### Node parameters

| Field | Description |
|---|---|
| From Name | Sender display name |
| From Email | Sender address (required) |
| To | Recipients (comma-separated) |
| Subject | Subject (required) |
| Markdown | Content in Markdown (required) |
| Theme | Theme: default / light / dark |
| Theme Overrides | Override colors and fonts |
| Attachments | Binary property names |

## Example Markdown

```markdown
---
preheader: Short preview shown in the inbox
---

# Hello {{$json.name}}!

Thank you for signing up. Your account is ready.

:::callout
Your activation code: **{{$json.code}}**
:::

[Activate Account](https://example.com/activate){button}

---

If you have any questions, reply to this email.
```

## Supported emailmd syntax

- **Buttons**: `[text](url){button}` or `{button .success}`, `{button .danger}`
- **Callout**: `:::callout ... :::`
- **Hero**: `:::hero ... :::`
- **Header/Footer**: `:::header ... :::`, `:::footer ... :::`
- **Alignment**: `:::centered ... :::`
- **Tables**, lists, code, images — standard Markdown
